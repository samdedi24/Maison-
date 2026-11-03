/**
 * Read-only projections of Home Assistant state and registry data.
 * No network calls, guessed room names, simulated values or mutations of hass.
 */

function registryRecord(registry, key, identityFields) {
  if (!registry || typeof registry !== "object") return null;
  if (!Array.isArray(registry) && Object.hasOwn(registry, key)) {
    const record = registry[key];
    if (record && typeof record === "object") return record;
  }
  return (
    Object.values(registry).find(
      (record) =>
        record &&
        typeof record === "object" &&
        identityFields.some((field) => record[field] === key),
    ) ?? null
  );
}

function nonemptyString(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function entityRegistryEntry(entityId, hass) {
  return registryRecord(hass?.entities, entityId, ["entity_id", "id"]);
}

/** Entity-level area overrides the device area; no registry means unassigned. */
export function resolveAreaId(entityId, hass) {
  const entity = entityRegistryEntry(entityId, hass);
  const directArea = nonemptyString(entity?.area_id);
  if (directArea) return directArea;
  const deviceId = nonemptyString(entity?.device_id);
  const device = deviceId
    ? registryRecord(hass?.devices, deviceId, ["id", "device_id"])
    : null;
  return nonemptyString(device?.area_id) ?? "unassigned";
}

function areaName(areaId, hass) {
  if (areaId === "unassigned") return "Sans pièce";
  const area = registryRecord(hass?.areas, areaId, ["area_id", "id"]);
  return nonemptyString(area?.name) ?? areaId;
}

function entityName(entityId, state, hass) {
  return (
    nonemptyString(state?.attributes?.friendly_name) ??
    nonemptyString(entityRegistryEntry(entityId, hass)?.name) ??
    entityId
  );
}

function canonicalUnit(unit) {
  if (typeof unit !== "string") return null;
  switch (unit.trim().toLowerCase()) {
    case "°c":
    case "c":
    case "celsius":
      return "°C";
    case "°f":
    case "f":
    case "fahrenheit":
      return "°F";
    case "k":
    case "°k":
    case "kelvin":
      return "K";
    default:
      return null;
  }
}

function targetUnit(hass, options) {
  const configured = canonicalUnit(options.temperature_unit);
  if (configured === "°C" || configured === "°F") return configured;
  const system = canonicalUnit(hass?.config?.unit_system?.temperature);
  return system === "°F" ? "°F" : "°C";
}

function numericState(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizedTemperature(state, target) {
  const value = numericState(state?.state);
  const source = canonicalUnit(state?.attributes?.unit_of_measurement);
  if (value === null || !source || (source === "K" && value < 0)) return null;
  const celsius =
    source === "°F"
      ? ((value - 32) * 5) / 9
      : source === "K"
        ? value - 273.15
        : value;
  const normalized = target === "°F" ? (celsius * 9) / 5 + 32 : celsius;
  return Number.isFinite(normalized) ? normalized : null;
}

function mean(values) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

function stringSet(values) {
  return new Set(
    Array.isArray(values)
      ? values.filter((value) => typeof value === "string")
      : [],
  );
}

/**
 * One entry per area containing at least one retained temperature entity.
 * Temperature and humidity averages use their own valid readings independently.
 * Unavailable thermometers remain visible, with value:null and available:false.
 * Diagnostic entities are omitted unless include_diagnostic is explicitly true.
 */
export function collectRoomClimate(hass, options = {}) {
  const unit = targetUnit(hass, options);
  const excludedAreas = stringSet(options.exclude_areas);
  const excludedEntities = stringSet(options.exclude_entities);
  const rooms = new Map();
  const humidityByArea = new Map();

  for (const [entityId, state] of Object.entries(hass?.states ?? {})) {
    if (
      !entityId.startsWith("sensor.") ||
      !state ||
      excludedEntities.has(entityId)
    )
      continue;
    const metric = state.attributes?.device_class;
    if (metric !== "temperature" && metric !== "humidity") continue;
    const registry = entityRegistryEntry(entityId, hass);
    if (
      registry?.entity_category === "diagnostic" &&
      options.include_diagnostic !== true
    )
      continue;
    const areaId = resolveAreaId(entityId, hass);
    if (excludedAreas.has(areaId)) continue;

    if (metric === "humidity") {
      const value = numericState(state.state);
      if (value !== null && value >= 0 && value <= 100) {
        if (!humidityByArea.has(areaId)) humidityByArea.set(areaId, []);
        humidityByArea.get(areaId).push(value);
      }
      continue;
    }

    if (!rooms.has(areaId)) {
      rooms.set(areaId, {
        id: areaId,
        name: areaName(areaId, hass),
        temperature: null,
        humidity: null,
        unit,
        thermometers: [],
        sensorCount: 0,
      });
    }
    const value = normalizedTemperature(state, unit);
    rooms.get(areaId).thermometers.push({
      entityId,
      name: entityName(entityId, state, hass),
      value,
      unit,
      available: value !== null,
      lastUpdated:
        nonemptyString(state.last_updated) ??
        nonemptyString(state.last_changed),
    });
  }

  for (const room of rooms.values()) {
    room.temperature = mean(
      room.thermometers
        .filter((sensor) => sensor.available)
        .map((sensor) => sensor.value),
    );
    room.humidity = mean(humidityByArea.get(room.id) ?? []);
    room.sensorCount = room.thermometers.length;
    room.thermometers.sort(
      (a, b) =>
        a.name.localeCompare(b.name, "fr") ||
        a.entityId.localeCompare(b.entityId),
    );
  }
  return [...rooms.values()].sort(
    (a, b) => a.name.localeCompare(b.name, "fr") || a.id.localeCompare(b.id),
  );
}

/**
 * A configured weather entity must exist and have the weather domain.
 * Without explicit configuration, only an unambiguous single entity is chosen.
 */
export function selectWeatherEntity(hass, configuredEntity) {
  const states = hass?.states ?? {};
  const choices = Object.entries(states)
    .filter(
      ([entityId, state]) =>
        entityId.startsWith("weather.") && state && typeof state === "object",
    )
    .map(([entityId, state]) => ({
      entityId,
      name: entityName(entityId, state, hass),
    }))
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name, "fr") ||
        a.entityId.localeCompare(b.entityId),
    );
  const configured = nonemptyString(configuredEntity);
  if (configured) {
    const match = choices.find((choice) => choice.entityId === configured);
    return match
      ? { entityId: match.entityId, choices, error: null }
      : {
          entityId: null,
          choices,
          error: `L’entité météo « ${configured} » est absente ou n’est pas une entité weather. Corrigez weather_entity ou choisissez une entité disponible.`,
        };
  }
  if (choices.length === 1)
    return { entityId: choices[0].entityId, choices, error: null };
  return {
    entityId: null,
    choices,
    error: choices.length
      ? "Plusieurs entités météo sont disponibles. Choisissez celle de votre domicile et configurez weather_entity."
      : "Aucune entité météo disponible. Ajoutez une intégration météo dans Home Assistant, puis configurez weather_entity.",
  };
}
