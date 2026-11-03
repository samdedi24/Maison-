import assert from "node:assert/strict";
import { after, test } from "node:test";

// Minimal custom-element boundary, not a browser/layout emulator.
const previous = {
  window: globalThis.window,
  HTMLElement: globalThis.HTMLElement,
  customElements: globalThis.customElements,
};
const definitions = new Map();
function decode(value) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}
class NodeStub extends EventTarget {
  constructor() {
    super();
    this.dataset = {};
    this.children = [];
  }
  replaceChildren(...children) {
    this.children = children;
  }
  removeAttribute() {}
}
class RootStub {
  constructor() {
    this.html = "";
    this.nodes = new Map();
  }
  set innerHTML(html) {
    this.html = html;
    this.nodes.clear();
  }
  get innerHTML() {
    return this.html;
  }
  querySelector(selector) {
    if (!this.nodes.has(selector)) this.nodes.set(selector, new NodeStub());
    return this.nodes.get(selector);
  }
  querySelectorAll(selector) {
    if (this.nodes.has(selector)) return this.nodes.get(selector);
    const attribute =
      selector === "[data-entity]" ? "data-entity" : "data-weather-entity";
    const datasetKey = attribute === "data-entity" ? "entity" : "weatherEntity";
    const nodes = [
      ...this.html.matchAll(new RegExp(`${attribute}="([^\"]*)"`, "g")),
    ].map((match) => {
      const node = new NodeStub();
      node.dataset[datasetKey] = decode(match[1]);
      return node;
    });
    this.nodes.set(selector, nodes);
    return nodes;
  }
}
globalThis.HTMLElement = class extends EventTarget {
  constructor() {
    super();
    this.isConnected = true;
  }
  attachShadow() {
    this.shadowRoot = new RootStub();
    return this.shadowRoot;
  }
};
globalThis.customElements = {
  get: (name) => definitions.get(name),
  define: (name, value) => definitions.set(name, value),
};
globalThis.window = { customCards: [] };
await import("../www/maison-plus/card.js");
const Card = definitions.get("maison-plus-card");
const flush = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};
after(() => {
  Object.assign(globalThis, previous);
});
function roomsHass() {
  return {
    states: {
      "sensor.salon": {
        state: "20",
        attributes: {
          device_class: "temperature",
          unit_of_measurement: "°C",
          friendly_name: "Thermomètre",
        },
        last_updated: "2026-11-03T10:00:00Z",
      },
    },
    entities: { "sensor.salon": { device_id: "probe" } },
    devices: { probe: { area_id: "salon" } },
    areas: { salon: { name: "Salon" } },
    config: { unit_system: { temperature: "°C" } },
    locale: { language: "fr" },
  };
}

test("rooms use actual hass readings and open native details without device commands", async () => {
  const card = new Card();
  const hass = roomsHass();
  card.setConfig({ section: "rooms" });
  card.hass = hass;
  await flush();
  assert.match(card.shadowRoot.innerHTML, /Salon/);
  assert.match(card.shadowRoot.innerHTML, /20 °C/);
  const opened = [];
  card.addEventListener("hass-more-info", (event) =>
    opened.push(event.detail.entityId),
  );
  card.shadowRoot
    .querySelectorAll("[data-entity]")[0]
    .dispatchEvent(new Event("click"));
  assert.deepEqual(opened, ["sensor.salon"]);
  card.hass = {
    ...hass,
    states: {
      ...hass.states,
      "sensor.salon": { ...hass.states["sensor.salon"], state: "22" },
    },
  };
  await flush();
  assert.match(card.shadowRoot.innerHTML, /22 °C/);
});

test("room registry changes update grouping even when sensor states are unchanged", async () => {
  const card = new Card();
  const hass = roomsHass();
  card.setConfig({ section: "rooms" });
  card.hass = hass;
  await flush();
  card.hass = {
    ...hass,
    devices: { probe: { area_id: "chambre" } },
    areas: { ...hass.areas, chambre: { name: "Chambre" } },
  };
  await flush();
  assert.match(card.shadowRoot.innerHTML, /Chambre/);
  assert.doesNotMatch(card.shadowRoot.innerHTML, />Salon</);
});

test("names from Home Assistant are escaped before entering markup", async () => {
  const card = new Card();
  const hass = roomsHass();
  hass.areas.salon.name = "<img src=x onerror=alert(1)>";
  hass.states["sensor.salon"].attributes.friendly_name = '" onclick="alert(1)';
  card.setConfig({ section: "rooms" });
  card.hass = hass;
  await flush();
  assert.doesNotMatch(card.shadowRoot.innerHTML, /<img/);
  assert.match(card.shadowRoot.innerHTML, /&lt;img/);
  assert.match(card.shadowRoot.innerHTML, /&quot; onclick=&quot;/);
});

test("missing registry fields load via HA WebSocket without inventing a room", async () => {
  const card = new Card();
  const complete = roomsHass();
  const calls = [];
  const hass = {
    states: complete.states,
    config: complete.config,
    callWS: async ({ type }) => {
      calls.push(type);
      if (type === "config/entity_registry/list")
        return [{ entity_id: "sensor.salon", device_id: "probe" }];
      if (type === "config/device_registry/list")
        return [{ id: "probe", area_id: "salon" }];
      return [{ area_id: "salon", name: "Salon" }];
    },
  };
  card.setConfig({ section: "rooms" });
  card.hass = hass;
  await flush();
  assert.equal(calls.length, 3);
  assert.match(card.shadowRoot.innerHTML, /Salon/);
  card.hass = { ...hass };
  await flush();
  assert.equal(calls.length, 3);
});

test("permission failure is visible and clears when HA supplies registry data", async () => {
  const card = new Card();
  const complete = roomsHass();
  card.setConfig({ section: "rooms" });
  card.hass = {
    states: complete.states,
    callWS: async () => {
      throw new Error("permission");
    },
  };
  await flush();
  assert.match(card.shadowRoot.innerHTML, /inaccessibles/);
  assert.match(card.shadowRoot.innerHTML, /Sans pièce/);
  card.hass = complete;
  await flush();
  assert.doesNotMatch(card.shadowRoot.innerHTML, /inaccessibles/);
});

test("weather embeds the native card with supported forecasts and keeps hass current", async () => {
  let requested,
    created = 0;
  const native = new NodeStub();
  window.loadCardHelpers = async () => ({
    createCardElement: (config) => {
      requested = config;
      created++;
      return native;
    },
  });
  const card = new Card();
  const weather = {
    state: "sunny",
    attributes: { friendly_name: "Domicile", supported_features: 2 },
  };
  const hass = { states: { "weather.domicile": weather } };
  card.setConfig({ section: "weather" });
  card.hass = hass;
  await flush();
  assert.equal(requested.type, "weather-forecast");
  assert.equal(requested.entity, "weather.domicile");
  assert.equal(requested.forecast_type, "hourly");
  assert.equal(requested.show_forecast, true);
  const updated = {
    states: { "weather.domicile": { ...weather, state: "rainy" } },
  };
  card.hass = updated;
  await flush();
  assert.equal(native.hass, updated);
  assert.equal(created, 1);
});

test("ambiguous weather requires an explicit selection and does not choose a location", async () => {
  const card = new Card();
  let created = 0;
  window.loadCardHelpers = async () => ({
    createCardElement: () => {
      created++;
      return new NodeStub();
    },
  });
  card.setConfig({ section: "weather" });
  card.hass = {
    states: {
      "weather.a": {
        state: "sunny",
        attributes: { friendly_name: "A", supported_features: 1 },
      },
      "weather.b": {
        state: "rainy",
        attributes: { friendly_name: "B", supported_features: 1 },
      },
    },
  };
  await flush();
  assert.equal(created, 0);
  assert.match(card.shadowRoot.innerHTML, /Plusieurs/);
  card.shadowRoot
    .querySelectorAll("[data-weather-entity]")[1]
    .dispatchEvent(new Event("click"));
  await flush();
  assert.equal(created, 1);
  assert.equal(card._nativeWeather.hass, card._hass);
});

test("disconnecting while weather loads cannot leave a reconnected card stuck", async () => {
  const resolvers = [];
  window.loadCardHelpers = () =>
    new Promise((resolve) => resolvers.push(resolve));
  const card = new Card();
  card.setConfig({ section: "weather" });
  card.hass = {
    states: {
      "weather.a": { state: "sunny", attributes: { supported_features: 1 } },
    },
  };
  await flush();
  assert.equal(resolvers.length, 1);
  card.isConnected = false;
  card.disconnectedCallback();
  resolvers[0]({ createCardElement: () => new NodeStub() });
  await flush();
  card.isConnected = true;
  card.connectedCallback();
  await flush();
  assert.equal(resolvers.length, 2);
  const native = new NodeStub();
  resolvers[1]({ createCardElement: () => native });
  await flush();
  assert.equal(card._nativeWeather, native);
});

test("fallback registries follow area changes and unsubscribe when the card is removed", async () => {
  const complete = roomsHass(),
    callbacks = new Map();
  let currentArea = "salon",
    stopped = 0;
  const card = new Card();
  const hass = {
    states: complete.states,
    connection: {
      subscribeEvents: async (callback, event) => {
        callbacks.set(event, callback);
        return () => {
          stopped++;
          callbacks.delete(event);
        };
      },
    },
    callWS: async ({ type }) => {
      if (type === "config/entity_registry/list")
        return [{ entity_id: "sensor.salon", device_id: "probe" }];
      if (type === "config/device_registry/list")
        return [{ id: "probe", area_id: currentArea }];
      return [
        { area_id: "salon", name: "Salon" },
        { area_id: "chambre", name: "Chambre" },
      ];
    },
  };
  card.setConfig({ section: "rooms" });
  card.hass = hass;
  await flush();
  assert.equal(callbacks.size, 3);
  assert.match(card.shadowRoot.innerHTML, />Salon</);
  currentArea = "chambre";
  callbacks.get("device_registry_updated")();
  await flush();
  assert.match(card.shadowRoot.innerHTML, />Chambre</);
  assert.doesNotMatch(card.shadowRoot.innerHTML, />Salon</);
  card.isConnected = false;
  card.disconnectedCallback();
  assert.equal(stopped, 3);
});
