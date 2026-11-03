import { collectRoomClimate, selectWeatherEntity } from "./data.js?v=1";

const text = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
const styles = `
  :host { display:block; }
  ha-card { overflow:hidden; color:var(--primary-text-color); }
  .content { padding:20px; }
  h2 { margin:0; font-size:21px; font-weight:500; }
  .subtitle, .note { color:var(--secondary-text-color); font-size:13px; line-height:1.6; }
  .subtitle { margin:7px 0 20px; }
  .note { margin:14px 0 0; }
  .rooms { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr)); gap:16px; }
  .room { border:1px solid var(--divider-color); border-radius:20px; overflow:hidden; background:var(--card-background-color); }
  .room-head { padding:19px 18px 15px; }
  h3 { font-size:16px; font-weight:500; margin:0 0 12px; }
  .reading { display:flex; align-items:baseline; gap:18px; flex-wrap:wrap; }
  .temperature { font-size:34px; font-weight:400; letter-spacing:-1px; }
  .humidity { color:var(--secondary-text-color); font-size:13px; }
  .caption { font-size:11px; color:var(--secondary-text-color); margin-top:7px; line-height:1.5; }
  button { font:inherit; cursor:pointer; color:var(--primary-text-color); }
  button:focus-visible { outline:3px solid var(--primary-color); outline-offset:-3px; }
  .sensor { display:flex; gap:12px; align-items:center; width:100%; min-height:62px; text-align:left; padding:12px 18px; background:none; border:0; border-top:1px solid var(--divider-color); }
  .sensor:hover { background:var(--secondary-background-color); }
  .sensor ha-icon { color:var(--primary-color); --mdc-icon-size:20px; flex-shrink:0; }
  .sensor .identity { min-width:0; flex:1; }
  .sensor strong { display:block; font-size:13px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .sensor small { display:block; color:var(--secondary-text-color); font-size:11px; margin-top:4px; }
  .sensor .value { font-size:15px; white-space:nowrap; }
  .sensor.unavailable .value, .sensor.unavailable ha-icon { color:var(--secondary-text-color); }
  .empty, .warning { border-radius:16px; background:var(--secondary-background-color); padding:18px; line-height:1.6; font-size:13px; color:var(--secondary-text-color); }
  .warning { margin-bottom:15px; }
  .choices { display:grid; gap:10px; margin-top:15px; }
  .choice { min-height:52px; border:1px solid var(--divider-color); border-radius:16px; text-align:left; background:none; padding:12px 16px; }
  .choice small { display:block; color:var(--secondary-text-color); margin-top:4px; }
  .retry { margin-top:12px; padding:10px 15px; border:1px solid var(--divider-color); border-radius:20px; background:none; min-height:44px; }
  .native-host { min-height:90px; }
  @media(max-width:400px) { .content {padding:16px;} .room-head,.sensor {padding-left:15px;padding-right:15px;} }
`;

/** Read-only Lovelace card. All authentication belongs to Home Assistant. */
class MaisonPlusCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._renderKey = "";
    this._registryPromise = null;
    this._fallbackRegistry = {};
    this._registryError = "";
    this._registryRequestVersion = 0;
    this._registryWatchVersion = 0;
    this._registryWatchers = [];
    this._registryWatchPending = false;
    this._weatherChoice = null;
    this._nativeWeather = null;
    this._weatherGeneration = 0;
    this._queued = false;
  }

  setConfig(config) {
    if (!["rooms", "weather"].includes(config.section)) {
      throw new Error("Maison+ : section doit être rooms ou weather.");
    }
    for (const name of ["exclude_areas", "exclude_entities"]) {
      if (
        config[name] !== undefined &&
        (!Array.isArray(config[name]) ||
          config[name].some((id) => typeof id !== "string"))
      ) {
        throw new Error(
          `Maison+ : ${name} doit être une liste d’identifiants.`,
        );
      }
    }
    if (
      config.temperature_unit !== undefined &&
      !["°C", "°F"].includes(config.temperature_unit)
    ) {
      throw new Error("Maison+ : temperature_unit doit être °C ou °F.");
    }
    if (
      config.weather_entity !== undefined &&
      typeof config.weather_entity !== "string"
    ) {
      throw new Error(
        "Maison+ : weather_entity doit être un identifiant weather.*.",
      );
    }
    if (
      config.forecast_type !== undefined &&
      !["daily", "hourly", "twice_daily"].includes(config.forecast_type)
    ) {
      throw new Error(
        "Maison+ : forecast_type doit être daily, hourly ou twice_daily.",
      );
    }
    this._config = { ...config };
    this._weatherChoice = null;
    this._renderKey = "";
    this._weatherGeneration++;
    this._scheduleRender();
  }

  set hass(value) {
    this._hass = value;
    if (this._nativeWeather) this._nativeWeather.hass = value;
    this._scheduleRender();
  }

  connectedCallback() {
    this._renderKey = "";
    if (
      this._hass &&
      ["entities", "devices", "areas"].some((key) => this._hass[key] == null)
    )
      this._refreshRegistry();
    else this._scheduleRender();
  }
  disconnectedCallback() {
    this._weatherGeneration++;
    this._registryWatchVersion++;
    this._registryRequestVersion++;
    this._registryWatchPending = false;
    for (const unsubscribe of this._registryWatchers.splice(0)) unsubscribe();
  }
  getCardSize() {
    return this._config?.section === "rooms" ? 8 : 4;
  }
  getGridOptions() {
    return { columns: "full", rows: "auto" };
  }
  static getStubConfig() {
    return { section: "rooms" };
  }

  _scheduleRender() {
    if (this._queued) return;
    this._queued = true;
    queueMicrotask(() => {
      this._queued = false;
      if (!this.isConnected || !this._config || !this._hass) return;
      if (this._config.section === "rooms") {
        this._ensureRegistry();
        this._renderRooms();
      } else this._renderWeather();
    });
  }

  _effectiveHass() {
    return {
      ...this._hass,
      entities: this._hass.entities ?? this._fallbackRegistry.entities ?? {},
      devices: this._hass.devices ?? this._fallbackRegistry.devices ?? {},
      areas: this._hass.areas ?? this._fallbackRegistry.areas ?? {},
    };
  }

  _ensureRegistry() {
    const missing = ["entities", "devices", "areas"].filter(
      (key) => this._hass[key] == null,
    );
    if (!missing.length) {
      this._registryError = "";
      return;
    }
    if (this._registryPromise) return;
    if (typeof this._hass.callWS !== "function") {
      this._registryError =
        "Les pièces ne sont pas encore accessibles. Réessayez après le chargement de Home Assistant.";
      return;
    }
    this._startRegistryWatch();
    const requestVersion = ++this._registryRequestVersion;
    const commands = { entities: "entity", devices: "device", areas: "area" };
    this._registryPromise = Promise.allSettled(
      missing.map((key) =>
        Promise.resolve().then(() =>
          this._hass.callWS({
            type: `config/${commands[key]}_registry/list`,
          }),
        ),
      ),
    ).then((results) => {
      if (requestVersion !== this._registryRequestVersion) return;
      const failed = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled")
          this._fallbackRegistry[missing[index]] = result.value;
        else failed.push(missing[index]);
      });
      this._registryError = failed.length
        ? "Certaines affectations de pièces sont inaccessibles avec ce compte. Les capteurs sans affectation connue restent visibles sous « Sans pièce »."
        : "";
      this._renderKey = "";
      this._scheduleRender();
    });
  }

  _refreshRegistry() {
    this._registryRequestVersion++;
    this._registryPromise = null;
    this._registryError = "";
    this._renderKey = "";
    this._scheduleRender();
  }

  _startRegistryWatch() {
    const connection = this._hass.connection;
    if (
      this._registryWatchPending ||
      this._registryWatchers.length ||
      typeof connection?.subscribeEvents !== "function"
    )
      return;
    this._registryWatchPending = true;
    const version = this._registryWatchVersion;
    Promise.allSettled(
      ["area", "device", "entity"].map((kind) =>
        Promise.resolve().then(() =>
          connection.subscribeEvents(() => {
            if (this.isConnected) this._refreshRegistry();
          }, `${kind}_registry_updated`),
        ),
      ),
    ).then((results) => {
      for (const result of results) {
        if (result.status !== "fulfilled" || typeof result.value !== "function")
          continue;
        if (version !== this._registryWatchVersion || !this.isConnected)
          result.value();
        else this._registryWatchers.push(result.value);
      }
      if (version === this._registryWatchVersion)
        this._registryWatchPending = false;
    });
  }

  _format(value, unit) {
    if (!Number.isFinite(value)) return "—";
    const language = this._hass.locale?.language || this._hass.language || "fr";
    let number;
    try {
      number = new Intl.NumberFormat(language, {
        maximumFractionDigits: 1,
      }).format(value);
    } catch {
      number = value.toFixed(1);
    }
    return number + (unit ? " " + unit : "");
  }

  _shell(markup) {
    this.shadowRoot.innerHTML = `<style>${styles}</style><ha-card><div class="content">${markup}</div></ha-card>`;
  }

  _renderRooms() {
    const rooms = collectRoomClimate(this._effectiveHass(), this._config);
    const warning = this._registryError;
    const loading =
      Boolean(this._registryPromise) &&
      !Object.keys(this._fallbackRegistry).length &&
      ["areas", "devices", "entities"].some((key) => this._hass[key] == null) &&
      !warning;
    const fallback = ["entities", "devices", "areas"].some(
      (field) => this._hass[field] == null,
    );
    const key = JSON.stringify(["rooms", rooms, warning, loading, fallback]);
    if (this._renderKey === key) return;
    this._renderKey = key;
    const markup = rooms
      .map((room) => {
        const active = room.thermometers.filter(
          (sensor) => sensor.available,
        ).length;
        return `<section class="room" aria-label="${text(room.name)}"><div class="room-head"><h3>${text(room.name)}</h3><div class="reading"><span class="temperature">${text(this._format(room.temperature, room.unit))}</span><span class="humidity">${room.humidity === null ? "Humidité non disponible" : text(this._format(room.humidity, "%"))}</span></div><div class="caption">${active}/${room.sensorCount} thermomètre${room.sensorCount === 1 ? "" : "s"} disponible${active === 1 ? "" : "s"}${active > 1 ? " · Moyenne de la pièce" : ""}</div></div>${room.thermometers.map((sensor) => `<button class="sensor ${sensor.available ? "" : "unavailable"}" data-entity="${text(sensor.entityId)}" aria-label="${text(sensor.name)} · ${text(room.name)} · ${text(this._format(sensor.value, sensor.unit))} · Ouvrir les détails et l’historique"><ha-icon icon="mdi:thermometer" aria-hidden="true"></ha-icon><span class="identity"><strong>${text(sensor.name)}</strong><small>${sensor.available ? "Détails et historique" : "Mesure indisponible"}</small></span><span class="value">${text(this._format(sensor.value, sensor.unit))}</span></button>`).join("")}</section>`;
      })
      .join("");
    this._shell(
      `<h2>Températures par pièce</h2><p class="subtitle">Les capteurs suivent les pièces définies dans Home Assistant.</p>${warning ? `<div class="warning" role="status">${text(warning)}<br><button class="retry" data-retry>Réessayer</button></div>` : ""}${loading ? '<p class="note" role="status">Chargement des affectations de pièces…</p>' : ""}${rooms.length ? `<div class="rooms">${markup}</div><p class="note">Touchez un thermomètre pour ouvrir ses mesures et son historique. Les capteurs indisponibles sont exclus des moyennes.</p>${fallback ? '<button class="retry" data-registry-refresh>Actualiser les pièces</button>' : ""}` : '<div class="empty">Aucun thermomètre trouvé pour le moment. Vos futurs capteurs apparaîtront ici dès qu’ils seront intégrés à Home Assistant et affectés à une pièce. Les capteurs de diagnostic sont masqués par défaut.</div>'}`,
    );
    this.shadowRoot.querySelectorAll("[data-entity]").forEach((button) => {
      button.addEventListener("click", () =>
        this.dispatchEvent(
          new CustomEvent("hass-more-info", {
            bubbles: true,
            composed: true,
            detail: { entityId: button.dataset.entity },
          }),
        ),
      );
    });
    this.shadowRoot
      .querySelector("[data-retry]")
      ?.addEventListener("click", () => {
        this._refreshRegistry();
      });
    this.shadowRoot
      .querySelector("[data-registry-refresh]")
      ?.addEventListener("click", () => this._refreshRegistry());
  }

  _renderWeather() {
    const selection = selectWeatherEntity(
      this._hass,
      this._weatherChoice || this._config.weather_entity,
    );
    if (!selection.entityId) {
      const key = JSON.stringify(["weather-choice", selection]);
      if (this._renderKey === key) return;
      this._renderKey = key;
      this._nativeWeather = null;
      this._weatherGeneration++;
      this._shell(
        `<h2>Météo extérieure</h2><p class="subtitle">Conditions et prévisions de votre intégration météo.</p><div class="empty">${text(selection.error || "Ajoutez une intégration météo dans Home Assistant.")}</div>${selection.choices.length ? `<div class="choices">${selection.choices.map((choice) => `<button class="choice" data-weather-entity="${text(choice.entityId)}">${text(choice.name)}<small>${text(choice.entityId)}</small></button>`).join("")}</div><p class="note">Pour conserver une station, renseignez weather_entity dans la configuration de cette carte.</p>` : ""}`,
      );
      this.shadowRoot
        .querySelectorAll("[data-weather-entity]")
        .forEach((button) => {
          button.addEventListener("click", () => {
            this._weatherChoice = button.dataset.weatherEntity;
            this._renderKey = "";
            this._scheduleRender();
          });
        });
      return;
    }
    const state = this._hass.states[selection.entityId];
    const features = Number(state.attributes.supported_features || 0);
    const kinds = { daily: 1, hourly: 2, twice_daily: 4 };
    const requested = this._config.forecast_type || "daily";
    const forecast =
      features & kinds[requested]
        ? requested
        : Object.keys(kinds).find((kind) => features & kinds[kind]);
    const config = {
      type: "weather-forecast",
      entity: selection.entityId,
      name: "Météo extérieure",
      show_current: true,
      show_forecast: Boolean(forecast),
      forecast_type: forecast || "daily",
    };
    const key = JSON.stringify(["weather-native", config]);
    if (this._renderKey === key) return;
    this._renderKey = key;
    this._nativeWeather = null;
    const generation = ++this._weatherGeneration;
    this._shell(
      '<div class="native-host" role="status">Chargement de la météo…</div>',
    );
    Promise.resolve()
      .then(async () => {
        if (typeof window.loadCardHelpers !== "function")
          throw new Error("Card helpers unavailable");
        const helpers = await window.loadCardHelpers();
        const card = helpers.createCardElement(config);
        if (generation !== this._weatherGeneration || !this.isConnected) return;
        card.hass = this._hass;
        this._nativeWeather = card;
        const host = this.shadowRoot.querySelector(".native-host");
        host.removeAttribute("role");
        host.replaceChildren(card);
      })
      .catch(() => {
        if (generation !== this._weatherGeneration || !this.isConnected) return;
        this._shell(
          '<h2>Météo extérieure</h2><div class="empty">La carte météo native n’a pas pu être chargée. Rechargez ce tableau de bord.<br><button class="retry" data-weather-retry>Réessayer</button></div>',
        );
        this.shadowRoot
          .querySelector("[data-weather-retry]")
          .addEventListener("click", () => {
            this._renderKey = "";
            this._scheduleRender();
          });
      });
  }
}

if (!customElements.get("maison-plus-card"))
  customElements.define("maison-plus-card", MaisonPlusCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "maison-plus-card")) {
  window.customCards.push({
    type: "maison-plus-card",
    name: "Maison+ — Pièces et météo",
    description:
      "Températures par pièce et météo native, sans données simulées.",
    preview: true,
  });
}
