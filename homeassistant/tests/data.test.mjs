import assert from "node:assert/strict";
import test from "node:test";
import {
  collectRoomClimate,
  resolveAreaId,
  selectWeatherEntity,
} from "../www/maison-plus/data.js";

const stamp = "2026-11-03T12:00:00.000Z";
const temperature = (value, unit = "°C", name = "Thermomètre") => ({
  state: value,
  attributes: {
    device_class: "temperature",
    unit_of_measurement: unit,
    friendly_name: name,
  },
  last_updated: stamp,
});
const humidity = (value) => ({
  state: value,
  attributes: { device_class: "humidity", unit_of_measurement: "%" },
});

function fixture() {
  return {
    states: {
      "sensor.living_left": temperature("20", "°C", "Près du canapé"),
      "sensor.living_right": temperature("24", "°C", "Bibliothèque"),
      "sensor.living_offline": temperature("unavailable", "°C", "Fenêtre"),
      "sensor.living_humidity_a": humidity("50"),
      "sensor.living_humidity_b": humidity("60"),
      "sensor.office": temperature("21"),
      "sensor.garage_humidity": humidity("55"),
      "weather.home": {
        state: "sunny",
        attributes: { friendly_name: "Domicile" },
      },
    },
    entities: {
      "sensor.living_left": { device_id: "living_device" },
      "sensor.living_right": { area_id: "living" },
      "sensor.living_offline": { device_id: "living_device" },
      "sensor.living_humidity_a": { area_id: "living" },
      "sensor.living_humidity_b": { device_id: "living_device" },
      "sensor.office": { area_id: "office" },
      "sensor.garage_humidity": { area_id: "garage" },
    },
    devices: { living_device: { area_id: "living" } },
    areas: {
      living: { name: "Salon" },
      office: { name: "Bureau" },
      garage: { name: "Garage" },
    },
    config: { unit_system: { temperature: "°C" } },
  };
}

const room = (rooms, id) => rooms.find((entry) => entry.id === id);
const approximate = (value, expected) =>
  assert.ok(Math.abs(value - expected) < 1e-9, `${value} ≠ ${expected}`);

function deepFreeze(value) {
  if (value && typeof value === "object") {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

test("entity area overrides device area; missing registries never guess from friendly names", () => {
  const hass = fixture();
  hass.entities["sensor.living_left"].area_id = "office";
  assert.equal(resolveAreaId("sensor.living_left", hass), "office");
  hass.entities["sensor.living_left"].area_id = null;
  assert.equal(resolveAreaId("sensor.living_left", hass), "living");
  delete hass.entities;
  hass.states["sensor.living_left"].attributes.area_id = "living";
  assert.equal(resolveAreaId("sensor.living_left", hass), "unassigned");
  assert.equal(resolveAreaId("sensor.any", {}), "unassigned");
});

test("keyed and array registry forms resolve the same physical room identities", () => {
  const keyed = fixture();
  const arrays = structuredClone(keyed);
  arrays.entities = Object.entries(arrays.entities).map(
    ([entity_id, record]) => ({ entity_id, ...record }),
  );
  arrays.devices = Object.entries(arrays.devices).map(([id, record]) => ({
    id,
    ...record,
  }));
  arrays.areas = Object.entries(arrays.areas).map(([area_id, record]) => ({
    area_id,
    ...record,
  }));
  assert.deepEqual(collectRoomClimate(arrays), collectRoomClimate(keyed));
});

test("each room averages its temperature and humidity readings independently", () => {
  const rooms = collectRoomClimate(fixture());
  assert.equal(
    rooms.length,
    2,
    "humidity-only areas should not create a thermometer room",
  );
  const living = room(rooms, "living");
  assert.equal(living.temperature, 22);
  assert.equal(living.humidity, 55);
  assert.equal(living.sensorCount, 3);
  assert.equal(
    living.thermometers.filter((sensor) => sensor.available).length,
    2,
  );
  assert.equal(living.unit, "°C");
  assert.equal(
    living.thermometers.find(
      (sensor) => sensor.entityId === "sensor.living_left",
    ).lastUpdated,
    stamp,
  );
  assert.equal(room(rooms, "office").humidity, null);
});

test("duplicate room and sensor names remain separate by stable IDs", () => {
  const hass = fixture();
  hass.areas.living.name = "Pièce";
  hass.areas.office.name = "Pièce";
  hass.states["sensor.living_left"].attributes.friendly_name = "Capteur";
  hass.states["sensor.office"].attributes.friendly_name = "Capteur";
  const rooms = collectRoomClimate(hass);
  assert.equal(rooms.length, 2);
  assert.equal(room(rooms, "living").temperature, 22);
  assert.equal(room(rooms, "office").temperature, 21);
  assert.notEqual(room(rooms, "living").id, room(rooms, "office").id);
});

test("unavailable temperatures stay visible and never become a zero average", () => {
  const hass = fixture();
  hass.states["sensor.living_left"].state = "unknown";
  hass.states["sensor.living_right"].state = "unavailable";
  const living = room(collectRoomClimate(hass), "living");
  assert.equal(living.temperature, null);
  assert.equal(
    living.humidity,
    55,
    "available humidity is independent of temperature availability",
  );
  assert.equal(living.thermometers.length, 3);
  assert.ok(
    living.thermometers.every(
      (sensor) => sensor.value === null && sensor.available === false,
    ),
  );
});

test("zero degrees is valid while malformed, missing and non-finite state values are unavailable", () => {
  for (const value of [
    "unknown",
    "unavailable",
    "",
    " ",
    "23 bad",
    "Infinity",
    null,
    undefined,
    true,
    Number.NaN,
  ]) {
    const hass = fixture();
    hass.states = { "sensor.test": temperature(value) };
    hass.entities = { "sensor.test": { area_id: "living" } };
    assert.equal(
      room(collectRoomClimate(hass), "living").temperature,
      null,
      String(value),
    );
  }
  const hass = fixture();
  hass.states = { "sensor.test": temperature("0") };
  hass.entities = { "sensor.test": { area_id: "living" } };
  const sensor = room(collectRoomClimate(hass), "living").thermometers[0];
  assert.equal(sensor.value, 0);
  assert.equal(sensor.available, true);
});

test("mixed Celsius, Fahrenheit and Kelvin readings normalize before averaging", () => {
  const hass = fixture();
  hass.states = {
    "sensor.celsius": temperature("20", "°C"),
    "sensor.fahrenheit": temperature("68", "°F"),
    "sensor.kelvin": temperature("293.15", "K"),
  };
  hass.entities = Object.fromEntries(
    Object.keys(hass.states).map((id) => [id, { area_id: "living" }]),
  );
  let living = room(collectRoomClimate(hass), "living");
  approximate(living.temperature, 20);
  assert.ok(living.thermometers.every((sensor) => sensor.unit === "°C"));

  hass.config.unit_system.temperature = "°F";
  living = room(collectRoomClimate(hass), "living");
  approximate(living.temperature, 68);
  assert.ok(living.thermometers.every((sensor) => sensor.unit === "°F"));
  approximate(
    room(collectRoomClimate(hass, { temperature_unit: "°C" }), "living")
      .temperature,
    20,
  );
});

test("unknown temperature units do not get mixed into a room average", () => {
  const hass = fixture();
  hass.states["sensor.living_left"].attributes.unit_of_measurement = "mV";
  delete hass.states["sensor.living_right"].attributes.unit_of_measurement;
  const living = room(collectRoomClimate(hass), "living");
  assert.equal(living.temperature, null);
  assert.ok(living.thermometers.every((sensor) => !sensor.available));
  assert.equal(
    collectRoomClimate({ states: { "sensor.t": temperature("20") } })[0].unit,
    "°C",
  );
});

test("diagnostic entity exclusion is the default and can be explicitly disabled", () => {
  const hass = fixture();
  hass.states["sensor.processor_temperature"] = temperature("60");
  hass.entities["sensor.processor_temperature"] = {
    area_id: "living",
    entity_category: "diagnostic",
  };
  hass.states["sensor.diagnostic_humidity"] = humidity("100");
  hass.entities["sensor.diagnostic_humidity"] = {
    area_id: "living",
    entity_category: "diagnostic",
  };
  let living = room(collectRoomClimate(hass), "living");
  assert.equal(living.temperature, 22);
  assert.equal(living.humidity, 55);
  assert.equal(living.sensorCount, 3);
  living = room(
    collectRoomClimate(hass, { include_diagnostic: true }),
    "living",
  );
  approximate(living.temperature, (20 + 24 + 60) / 3);
  approximate(living.humidity, 70);
  assert.equal(living.sensorCount, 4);
});

test("area and entity exclusions apply consistently to both metric types", () => {
  const hass = fixture();
  assert.deepEqual(
    collectRoomClimate(hass, { exclude_areas: ["living"] }).map(
      (entry) => entry.id,
    ),
    ["office"],
  );
  const living = room(
    collectRoomClimate(hass, {
      exclude_entities: ["sensor.living_left", "sensor.living_humidity_a"],
    }),
    "living",
  );
  assert.equal(living.temperature, 24);
  assert.equal(living.sensorCount, 2);
  assert.equal(living.humidity, 60);
});

test("out-of-range humidity is ignored and a temperature-only room has null humidity", () => {
  const hass = fixture();
  hass.states["sensor.living_humidity_a"].state = "101";
  hass.states["sensor.living_humidity_b"].state = "-1";
  assert.equal(room(collectRoomClimate(hass), "living").humidity, null);
  hass.states["sensor.living_humidity_a"].state = "0";
  hass.states["sensor.living_humidity_b"].state = "100";
  assert.equal(room(collectRoomClimate(hass), "living").humidity, 50);
  assert.equal(room(collectRoomClimate(hass), "office").humidity, null);
});

test("missing registry entries use Sans pièce; missing area metadata preserves a stable area ID", () => {
  const hass = fixture();
  delete hass.entities["sensor.office"];
  delete hass.areas.living;
  const rooms = collectRoomClimate(hass);
  assert.equal(room(rooms, "unassigned").name, "Sans pièce");
  assert.equal(room(rooms, "unassigned").temperature, 21);
  assert.equal(room(rooms, "living").name, "living");
});

test("collection is read-only and handles a frontend snapshot with no states or registries", () => {
  const hass = fixture();
  const before = structuredClone(hass);
  deepFreeze(hass);
  collectRoomClimate(hass);
  assert.deepEqual(hass, before);
  assert.deepEqual(collectRoomClimate({}), []);
  assert.deepEqual(collectRoomClimate(undefined), []);
});

test("weather auto-selection happens only for one unambiguous real weather entity", () => {
  const hass = fixture();
  const selected = selectWeatherEntity(hass);
  assert.equal(selected.entityId, "weather.home");
  assert.equal(selected.error, null);
  assert.deepEqual(selected.choices, [
    { entityId: "weather.home", name: "Domicile" },
  ]);
  hass.states["weather.holiday"] = {
    state: "rainy",
    attributes: { friendly_name: "Résidence secondaire" },
  };
  const ambiguous = selectWeatherEntity(hass);
  assert.equal(ambiguous.entityId, null);
  assert.match(ambiguous.error, /Plusieurs/);
  assert.equal(ambiguous.choices.length, 2);
  assert.equal(
    selectWeatherEntity(hass, "weather.holiday").entityId,
    "weather.holiday",
  );
});

test("an explicit missing or wrong-domain weather selection does not silently pick another location", () => {
  const hass = fixture();
  for (const configured of ["weather.typo", "sensor.living_left"]) {
    const result = selectWeatherEntity(hass, configured);
    assert.equal(result.entityId, null);
    assert.match(result.error, /weather_entity/);
    assert.equal(result.choices[0].entityId, "weather.home");
  }
  const none = selectWeatherEntity({
    states: { "sensor.outside_temperature": temperature("14") },
  });
  assert.equal(none.entityId, null);
  assert.deepEqual(none.choices, []);
  assert.match(none.error, /Aucune entité météo/);
});

test("configured weather identity remains selected when its state is temporarily unavailable", () => {
  const hass = fixture();
  hass.states["weather.home"].state = "unavailable";
  const result = selectWeatherEntity(hass, "weather.home");
  assert.equal(result.entityId, "weather.home");
  assert.equal(result.error, null);
});
