const paths = {
  home: "M3 10 12 3l9 7M5 9v11h5v-6h4v6h5V9",
  bulb: "M9 18h6M10 21h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z",
  blinds: "M4 4h16v15H4ZM4 8h16M4 12h16M4 16h16M8 19v3m8-3v3",
  thermo: "M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0ZM12 8v9m0 0v2",
  grid: "M4 4h6v6H4ZM14 4h6v6h-6ZM4 14h6v6H4ZM14 14h6v6h-6Z",
  bolt: "m13 2-8 12h6l-1 8 9-13h-7Z",
  shield: "M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6ZM9 12l2 2 4-4",
  plan: "m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16m6-14v16",
  settings:
    "M9 3h6l1 4 4 1v8l-4 1-1 4H9l-1-4-4-1V8l4-1ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
  moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z",
  sofa: "M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M3 10h3v5h12v-5h3v9H3Zm2 9v2m14-2v2",
  bed: "M3 19V8m18 11V8M3 15h18M5 8h14v7H5ZM12 8v7",
  lamp: "m8 3-4 10h16L16 3ZM12 13v8m-4 0h8",
  led: "M5 3h14v18H5ZM9 6h6m-6 4h6m-6 4h6m-6 4h6",
  tv: "M3 4h18v13H3Zm9 13v4m-5 0h10",
  spark: "m12 3 2 6 6 3-6 2-2 7-2-7-6-2 6-3ZM20 2v4m-2-2h4",
  away: "M4 12h13m-4-4 4 4-4 4M9 5V3h12v18H9v-2",
  drop: "M12 3s7 8 7 12a7 7 0 1 1-14 0c0-4 7-12 7-12Z",
  door: "M5 21V3h14v18M2 21h20M14 12h1",
  arrow: "m9 5 7 7-7 7",
  close: "m6 6 12 12M6 18 18 6",
  check: "m5 12 4 4L19 6",
  down: "m5 9 7 7 7-7",
  up: "m5 15 7-7 7 7",
  pause: "M8 5v14M16 5v14",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  upload: "M12 16V4m-5 5 5-5 5 5M4 17v4h16v-4",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
  leaf: "M20 3C6 2 1 10 6 16c6 7 15-1 14-13ZM4 21 16 9",
  plug: "M8 3v5m8-5v5M6 8h12v5a6 6 0 0 1-12 0ZM12 19v3",
};
// Original filled pictograms, drawn for legibility at small sizes.
const filledIcons = {
  fan: '<circle cx="12" cy="12" r="2"/><path d="M10.7 9.2C7 7.6 6.9 2.1 10.2 1.5c3.3-.6 5.2 2.2 4.2 5.7-.3 1.1-1.1 1.7-1.9 2.1ZM14.8 10.7c1.6-3.7 7.1-3.8 7.7-.5.6 3.3-2.2 5.2-5.7 4.2-1.1-.3-1.7-1.1-2.1-1.9ZM13.3 14.8c3.7 1.6 3.8 7.1.5 7.7-3.3.6-5.2-2.2-4.2-5.7.3-1.1 1.1-1.7 1.9-2.1ZM9.2 13.3c-1.6 3.7-7.1 3.8-7.7.5-.6-3.3 2.2-5.2 5.7-4.2 1.1.3 1.7 1.1 2.1 1.9Z"/>',
  lock: '<path fill-rule="evenodd" d="M7 6a5 5 0 0 1 10 0v3h.8a2.2 2.2 0 0 1 2.2 2.2v8.6a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 19.8v-8.6A2.2 2.2 0 0 1 6.2 9H7V6Zm2 0v3h6V6a3 3 0 0 0-6 0Z"/>',
  home: '<path d="M10.55 2.9a2.2 2.2 0 0 1 2.9 0l3.05 2.65V3.9a.8.8 0 0 1 .8-.8h1.4a.8.8 0 0 1 .8.8v4.26l2.62 2.28a1.1 1.1 0 0 1-1.44 1.66L20 11.57v8.08a1.85 1.85 0 0 1-1.85 1.85h-3.4a.75.75 0 0 1-.75-.75V15a2 2 0 0 0-4 0v5.75a.75.75 0 0 1-.75.75h-3.4A1.85 1.85 0 0 1 4 19.65v-8.08l-.68.53a1.1 1.1 0 0 1-1.44-1.66Z"/>',
  bulb: '<path d="M12 2a6.4 6.4 0 0 0-6.4 6.4c0 2.35 1.02 3.74 2.23 5.25.72.91 1.02 1.56 1.12 2.35h6.1c.1-.79.4-1.44 1.12-2.35 1.21-1.51 2.23-2.9 2.23-5.25A6.4 6.4 0 0 0 12 2Z"/><rect x="8.8" y="17.3" width="6.4" height="1.65" rx=".8"/><path d="M9.3 20.2h5.4a2.85 2.85 0 0 1-5.4 0Z"/>',
  blinds:
    '<rect x="2.5" y="2.5" width="19" height="3" rx="1.1"/><rect x="4" y="6.7" width="13.3" height="2.35" rx=".6"/><rect x="4" y="10.2" width="13.3" height="2.35" rx=".6"/><rect x="4" y="13.7" width="13.3" height="2.35" rx=".6"/><rect x="4" y="17.2" width="13.3" height="2.35" rx=".6"/><rect x="19" y="5" width="1.2" height="14" rx=".6"/><rect x="18.1" y="18.3" width="3" height="3.5" rx="1.5"/>',
  thermo:
    '<path fill-rule="evenodd" d="M8 5a4 4 0 0 1 8 0v9.05a5.7 5.7 0 1 1-8 0V5Zm4-2.2A2.2 2.2 0 0 0 9.8 5v9.9l-.5.35a3.9 3.9 0 1 0 5.4 0l-.5-.35V5A2.2 2.2 0 0 0 12 2.8Z"/><rect x="11" y="7.4" width="2" height="10" rx="1"/><circle cx="12" cy="18" r="2.6"/><rect x="17.5" y="5" width="3" height="1.5" rx=".75"/><rect x="17.5" y="8.5" width="2.3" height="1.5" rx=".75"/>',
  grid: '<rect x="2.5" y="2.5" width="8" height="8" rx="2"/><rect x="13.5" y="2.5" width="8" height="8" rx="2"/><rect x="2.5" y="13.5" width="8" height="8" rx="2"/><rect x="13.5" y="13.5" width="8" height="8" rx="2"/>',
  bolt: '<path d="M13.5 1.55a.75.75 0 0 1 .87.87l-1.1 7.03h5.15a.9.9 0 0 1 .7 1.47L10.1 22.1a.75.75 0 0 1-1.32-.62l1.18-7.03H4.8a.9.9 0 0 1-.7-1.47L13.05 1.8a.8.8 0 0 1 .45-.25Z"/>',
  shield:
    '<path fill-rule="evenodd" d="M12 1.8 3.2 5.1v6.7c0 5.5 5.25 9 8.8 10.6 3.55-1.6 8.8-5.1 8.8-10.6V5.1L12 1.8Zm5.12 7.48a1 1 0 0 0-1.44-1.38L10.4 13.4l-2.1-2.12a1 1 0 0 0-1.42 1.42l2.83 2.83a1 1 0 0 0 1.43-.02Z"/>',
  camera:
    '<rect x="2" y="5" width="13.6" height="14" rx="3"/><path d="m17.2 9 4-2.5a.8.8 0 0 1 1.2.7v9.6a.8.8 0 0 1-1.2.7l-4-2.5Z"/>',
  plan: '<path fill-rule="evenodd" d="M3.2 2.5h17.6c.66 0 1.2.54 1.2 1.2v16.6c0 .66-.54 1.2-1.2 1.2H3.2c-.66 0-1.2-.54-1.2-1.2V3.7c0-.66.54-1.2 1.2-1.2ZM4 4.5v15h7v-5h2v5h7v-8h-3v-2h3v-5h-7v5h-2v-5H4Z"/>',
  more: '<circle cx="12" cy="12" r="10"/><g fill="var(--glyph-cutout,#f8f7f1)"><circle cx="7.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="16.5" cy="12" r="1.3"/></g>',
  lamp: '<path d="M8.5 2.5h7a1 1 0 0 1 .95.7l3.1 9.3a.8.8 0 0 1-.76 1.05H5.21a.8.8 0 0 1-.76-1.05l3.1-9.3a1 1 0 0 1 .95-.7Z"/><rect x="11" y="13" width="2" height="7" rx="1"/><rect x="7.2" y="20" width="9.6" height="1.8" rx=".9"/>',
  led: '<path fill-rule="evenodd" d="M6.5 2.3h11a1.2 1.2 0 0 1 1.2 1.2v17a1.2 1.2 0 0 1-1.2 1.2h-11a1.2 1.2 0 0 1-1.2-1.2v-17a1.2 1.2 0 0 1 1.2-1.2Zm2.8 3.2h5.4V8H9.3V5.5Zm0 5.3h5.4v2.4H9.3v-2.4Zm0 5.2h5.4v2.5H9.3V16Z"/>',
  tv: '<path fill-rule="evenodd" d="M3.5 3.5h17a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-17a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Zm0 2v11h17v-11h-17Z"/><rect x="11" y="18" width="2" height="2"/><rect x="7" y="20" width="10" height="1.7" rx=".85"/>',
  moon: '<path d="M20.75 14.7A8.15 8.15 0 0 1 9.3 3.25a.65.65 0 0 0-.78-.9A10 10 0 1 0 21.65 15.5a.65.65 0 0 0-.9-.8Z"/>',
  sun: '<circle cx="12" cy="12" r="4.7"/><g fill="none" stroke="currentColor" stroke-width="2.1"><path d="M12 1.5v2m0 17v2M1.5 12h2m17 0h2M4.6 4.6 6 6m12 12 1.4 1.4M4.6 19.4 6 18M18 6l1.4-1.4"/></g>',
};
const icon = (n) =>
  filledIcons[n]
    ? `<svg class="symbol-icon" viewBox="0 0 24 24" aria-hidden="true">${filledIcons[n]}</svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n] || paths.home}"/></svg>`;
function hydrate() {
  document
    .querySelectorAll("[data-icon]")
    .forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
}
const nav = [
  ["maison", "home", "Maison"],
  ["volets", "blinds", "Volets"],
  ["climat", "thermo", "Climat"],
  ["homeview", "grid", "HomeView"],
  ["conso", "bolt", "Conso"],
  ["securite", "shield", "Sécurité"],
  ["plan", "plan", "Plan"],
];
const initial = {
  devices: [
    {
      id: "table",
      name: "Table à manger",
      room: "Salon",
      type: "light",
      icon: "bulb",
      on: true,
      brightness: 75,
      color: "#f4cf7a",
    },
    {
      id: "canape",
      name: "Canapé",
      room: "Salon",
      type: "light",
      icon: "lamp",
      on: true,
      brightness: 60,
      color: "#ffce99",
    },
    {
      id: "led",
      name: "Bandeau Hue",
      room: "Salon",
      type: "light",
      icon: "led",
      on: false,
      brightness: 80,
      color: "#b5a6e6",
    },
    {
      id: "salon",
      name: "Volet salon",
      room: "Salon",
      type: "cover",
      icon: "blinds",
      position: 100,
    },
    {
      id: "terrasse",
      name: "Volet terrasse",
      room: "Salon",
      type: "cover",
      icon: "blinds",
      position: 70,
    },
    {
      id: "tv",
      name: "Télévision",
      room: "Salon",
      type: "media",
      icon: "tv",
      on: false,
    },
    {
      id: "cuisine",
      name: "Plafonnier",
      room: "Cuisine",
      type: "light",
      icon: "bulb",
      on: true,
      brightness: 90,
      color: "#fff0bb",
    },
    {
      id: "evier",
      name: "Plan de travail",
      room: "Cuisine",
      type: "light",
      icon: "led",
      on: false,
      brightness: 75,
      color: "#fff0bb",
    },
    {
      id: "cuisine-volet",
      name: "Volet cuisine",
      room: "Cuisine",
      type: "cover",
      icon: "blinds",
      position: 100,
    },
    {
      id: "chevet",
      name: "Lampe de chevet",
      room: "Chambre",
      type: "light",
      icon: "lamp",
      on: false,
      brightness: 35,
      color: "#f4cf7a",
    },
    {
      id: "chambre",
      name: "Volet chambre",
      room: "Chambre",
      type: "cover",
      icon: "blinds",
      position: 0,
    },
    {
      id: "bureau",
      name: "Lampe de bureau",
      room: "Bureau",
      type: "light",
      icon: "lamp",
      on: false,
      brightness: 80,
      color: "#f4cf7a",
    },
  ],
  targets: { Salon: 21, Chambre: 19, Bureau: 20 },
  widgets: ["temperature", "weather", "clock", "lights", "covers", "scene"],
  alarm: false,
  contactOpen: false,
};
let state;
try {
  const saved = JSON.parse(localStorage.getItem("maison-plus-demo"));
  state = validState(saved) ? saved : structuredClone(initial);
} catch {
  state = structuredClone(initial);
}
function validState(s) {
  return (
    s &&
    Array.isArray(s.devices) &&
    s.devices.length === initial.devices.length &&
    s.devices.every(
      (d, i) =>
        d.id === initial.devices[i].id &&
        d.name === initial.devices[i].name &&
        d.room === initial.devices[i].room &&
        d.type === initial.devices[i].type &&
        d.icon === initial.devices[i].icon &&
        (d.type === "cover"
          ? Number.isFinite(d.position) && d.position >= 0 && d.position <= 100
          : typeof d.on === "boolean" &&
            (d.type !== "light" ||
              (Number.isFinite(d.brightness) &&
                d.brightness >= 1 &&
                d.brightness <= 100 &&
                /^#[0-9a-f]{6}$/i.test(d.color)))),
    ) &&
    s.targets &&
    ["Salon", "Chambre", "Bureau"].every(
      (r) =>
        Number.isFinite(s.targets[r]) &&
        s.targets[r] >= 16 &&
        s.targets[r] <= 25,
    ) &&
    Array.isArray(s.widgets) &&
    s.widgets.length === 6 &&
    new Set(s.widgets).size === 6 &&
    s.widgets.every((w) => initial.widgets.includes(w)) &&
    typeof s.alarm === "boolean" &&
    typeof s.contactOpen === "boolean"
  );
}
let view = "maison",
  room = "Tout",
  period = "24 h",
  energyPeriod = "30 jours",
  editing = false,
  activeScene = "",
  activeDevice = null;
const movers = {};
const main = document.querySelector("#main");
const dialog = document.querySelector("#dialog");
const save = () => {
  try {
    localStorage.setItem("maison-plus-demo", JSON.stringify(state));
  } catch {}
};
const device = (id) => state.devices.find((d) => d.id === id);
const lights = () => state.devices.filter((d) => d.type === "light");
const covers = () => state.devices.filter((d) => d.type === "cover");
const fr = (n) =>
  Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 1 });
function toast(s) {
  const el = document.querySelector("#toast");
  el.textContent = s;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 3000);
}
function go(v) {
  if (!nav.some((n) => n[0] === v)) v = "maison";
  view = v;
  location.hash = v;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function head(title, sub) {
  return `<div class="page-head"><div><div class="eyebrow">CHEZ VOUS, TOUT SIMPLEMENT</div><h1>${title}</h1><p class="subtitle">${sub}</p></div><div class="date"><b>${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</b><span class="clock-live">${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span> · Mode démo</div></div>`;
}
function summary() {
  const count = lights().filter((d) => d.on).length;
  return `<div class="summary-grid" role="group" aria-label="État de la maison">${[
    [
      "fan",
      "Climat",
      formatClimate(houseReading()),
      "openRoomClimate()",
      "climate",
    ],
    [
      "bulb",
      "Lumières",
      count ? count + " allumée" + (count === 1 ? "" : "s") : "Toutes éteintes",
      "filterLights()",
      "lighting",
    ],
    [
      "lock",
      "Sécurité",
      state.alarm ? "Activée" : "Désactivée",
      "go('securite')",
      "security",
    ],
    [
      "blinds",
      "Volets",
      covers().filter((d) => d.position > 0).length + " ouverts",
      "go('volets')",
      "shutters",
    ],
  ]
    .map(
      ([i, title, status, action, category]) =>
        `<button class="summary ${category} ${category === "lighting" && room === "Lumières" ? "selected" : ""}" onclick="${action}" aria-label="${title} : ${status}"><span class="symbol">${icon(i)}</span><span class="summary-copy"><strong>${title}</strong><small>${status}</small></span></button>`,
    )
    .join("")}</div>`;
}
function weather() {
  return `<div class="weather-banner"><span class="weather-icon">${icon("sun")}</span><div><div class="weather-temp">14° <span style="font-size:14px;letter-spacing:0">dehors</span></div><div class="weather-desc">Une belle éclaircie vous attend.</div></div><div class="weather-right"><div><strong>${formatClimate(houseReading())}</strong><small>À l’intérieur · moyenne</small></div><div><strong>${formatClimate(houseReading("humidity"), "")} <span style="font-size:12px">%</span></strong><small>Humidité intérieure</small></div></div></div>`;
}
function scenes() {
  return `<div class="scenes">${[
    ["sun", "Bonjour", "Une maison qui s’éveille", "morning"],
    ["sofa", "Détente", "Place à votre soirée", "relax"],
    ["moon", "Bonne nuit", "Tout peut se reposer", "night"],
    ["away", "Je pars", "L’esprit tranquille", "away"],
  ]
    .map(
      ([i, a, b, c]) =>
        `<button class="scene ${activeScene === c ? "active" : ""}" onclick="scene('${c}')">${icon(i)}<span>${a}<small>${b}</small></span></button>`,
    )
    .join("")}</div>`;
}
function tile(d) {
  const on = d.type === "cover" ? d.position > 0 : d.on;
  const status =
    d.type === "cover"
      ? d.position === 0
        ? "Fermé"
        : d.position === 100
          ? "Ouvert"
          : d.position + " % ouvert"
      : d.on
        ? d.type === "light"
          ? d.brightness + " %"
          : "Activée"
        : "Éteint";
  return `<div class="device ${on ? "on" : ""} ${d.type}" role="group" aria-label="${d.name}"><button class="device-toggle" aria-label="${d.type === "cover" ? "Régler" : on ? "Éteindre" : "Allumer"} ${d.name}" ${d.type === "cover" ? "" : `aria-pressed="${d.on}"`} onclick="${d.type === "cover" ? `openDevice('${d.id}')` : `toggle('${d.id}')`}"><span class="device-icon">${icon(d.icon)}</span></button><button class="device-info" aria-label="Régler ${d.name} : ${status}" onclick="openDevice('${d.id}')"><span class="device-name">${d.name}</span><span class="device-state">${status}</span></button>${d.type === "cover" ? `<span class="level" aria-hidden="true"><i style="height:${d.position}%"></i></span>` : ""}</div>`;
}
function filterRoom(r) {
  room = r;
  render();
}
function filterLights() {
  room = "Lumières";
  go("maison");
}
function home() {
  const rs = ["Salon", "Cuisine", "Chambre", "Bureau"];
  const selected = rs.filter(
    (r) => room === "Tout" || room === "Lumières" || room === r,
  );
  return (
    head("Mon domicile", "") +
    summary() +
    cameraSection() +
    `<div class="room-tabs" role="group" aria-label="Filtrer par pièce">${["Tout", ...rs, "Lumières"].map((r) => `<button class="pill ${room === r ? "active" : ""}" onclick="filterRoom('${r}')">${r === "Tout" ? "Toutes les pièces" : r}</button>`).join("")}</div><div class="rooms">${selected
      .map(
        (r) =>
          `<section class="room"><div class="section-title"><div><h2><button class="room-link" onclick="filterRoom('${r}')">${r}<span class="room-chevron">${icon("arrow")}</span></button></h2></div><button class="room-info climate-room-shortcut" aria-label="Voir le climat ${r}" onclick="openRoomClimate('${climateAreas.find((a) => a.name === r).id}')">${climateRoomLabel(r)}</button></div><div class="device-grid">${state.devices
            .filter(
              (d) =>
                d.room === r && (room !== "Lumières" || d.type === "light"),
            )
            .map(tile)
            .join("")}</div></section>`,
      )
      .join(
        "",
      )}</div><div class="section-title scenes-heading"><h2>Scènes</h2><span class="tiny">Un geste, une ambiance.</span></div>` +
    scenes() +
    `<div class="bottom-insight"><button class="card energy-peek" onclick="go('conso')" style="text-align:left"><div><h3>Une maison plus économe</h3><div class="value">4,8 <small>kWh aujourd’hui</small></div><p style="margin-bottom:0">Estimation : 1,12 €</p></div><span class="spark">${spark()}</span><span class="tag">−12 % vs hier</span></button><button class="card automation-preview" onclick="scene('night')" style="text-align:left"><span>${icon("moon")}</span><div><h3>Prêt pour la nuit ?</h3><p>Lumières éteintes, volets fermés.<br>Votre maison vous suit.</p></div><span class="arrow">${icon("arrow")}</span></button></div>`
  );
}
const demoCameras = [
  {
    id: "bedroom",
    name: "Chambre",
    image: "assets/camera-bedroom.jpg",
    alt: "Photo d’illustration d’une chambre lumineuse",
    updated: Date.now() - 60000,
  },
  {
    id: "living",
    name: "Salon",
    image: "assets/camera-living.jpg",
    alt: "Photo d’illustration d’un salon avec un canapé et des plantes",
    updated: Date.now() - 60000,
  },
];
function cameraAge(camera) {
  const minutes = Math.floor((Date.now() - camera.updated) / 60000);
  return minutes < 1 ? "À l’instant" : minutes + " min";
}
function cameraPreview(camera) {
  return `<button class="camera-preview" onclick="openCamera('${camera.id}')" aria-label="Ouvrir la caméra ${camera.name}, aperçu simulé"><img src="${camera.image}" alt="${camera.alt}" width="1000" height="${camera.id === "bedroom" ? 667 : 750}" decoding="async"><span class="camera-name">${camera.name}</span><span class="camera-time" data-camera-age="${camera.id}">${cameraAge(camera)}</span><span class="camera-expand" aria-hidden="true">${icon("camera")}</span></button>`;
}
function cameraSection() {
  return `<section class="cameras-section" aria-labelledby="cameras-heading"><div class="section-title camera-heading"><button class="section-link" id="cameras-heading" onclick="cameraGallery()">Caméras ${icon("arrow")}</button><span class="camera-demo-label">Aperçus simulés</span></div><div class="camera-strip">${demoCameras.map(cameraPreview).join("")}</div></section>`;
}
function cameraGallery() {
  activeDevice = null;
  modal(
    modalHead("Caméras") +
      `<p class="camera-description">Images de démonstration · Aucun flux connecté.</p><div class="camera-strip gallery-strip">${demoCameras.map(cameraPreview).join("")}</div><p class="camera-description">Touchez une caméra pour agrandir son aperçu.</p><p class="camera-credit">Photographies d’illustration : Unsplash.</p>`,
    true,
  );
  document.querySelector("#modal-title").focus({ preventScroll: true });
}
function openCamera(id) {
  const expanded = dialog.open && dialog.classList.contains("camera-expanded");
  const camera = demoCameras.find((c) => c.id === id);
  if (!camera) return;
  activeDevice = null;
  modal(
    modalHead(camera.name) +
      `<div class="camera-switcher">${demoCameras.map((c) => `<button class="${c.id === id ? "active" : ""}" aria-pressed="${c.id === id}" onclick="openCamera('${c.id}')">${icon("camera")} ${c.name}</button>`).join("")}</div><div class="camera-detail"><img src="${camera.image}" alt="${camera.alt}"><span class="camera-demo-badge">Aperçu simulé</span><span class="camera-time" data-camera-age="${id}">${cameraAge(camera)}</span></div><div class="camera-toolbar"><button class="btn" onclick="refreshCamera('${id}')">Actualiser la démo</button><button class="btn" id="camera-enlarge" aria-pressed="false" onclick="enlargeCamera()">Agrandir</button></div><p class="camera-description">Photo d’illustration, sans vidéo ni son. Le flux réel sera raccordé à Home Assistant.</p>`,
    true,
  );
  if (expanded) {
    dialog.classList.add("camera-expanded");
    document.querySelector("#camera-enlarge").textContent = "Réduire";
    document
      .querySelector("#camera-enlarge")
      .setAttribute("aria-pressed", "true");
  }
  document.querySelector("#modal-title").focus({ preventScroll: true });
}
function refreshCamera(id) {
  const camera = demoCameras.find((c) => c.id === id);
  if (!camera) return;
  camera.updated = Date.now();
  render();
  openCamera(id);
  toast("Heure actualisée · L’image de démonstration reste fixe.");
}
function enlargeCamera() {
  const enlarged = dialog.classList.toggle("camera-expanded");
  document.querySelector("#camera-enlarge").textContent = enlarged
    ? "Réduire"
    : "Agrandir";
  document
    .querySelector("#camera-enlarge")
    .setAttribute("aria-pressed", String(enlarged));
}
function spark() {
  return `<svg viewBox="0 0 180 65" aria-hidden="true"><path d="M0 50 12 42 22 47 31 25 39 39 48 35 58 46 70 42 78 18 86 33 96 26 105 41 116 37 123 13 133 28 141 9 152 26 162 21 179 31"/></svg>`;
}
function toggle(id) {
  const d = device(id);
  d.on = !d.on;
  activeScene = "";
  save();
  render();
  if (activeDevice === id) openDevice(id, false);
}
function scene(which) {
  activeScene = which;
  Object.keys(movers).forEach(stopMove);
  state.devices.forEach((d) => {
    if (d.type === "light") {
      d.on =
        which === "morning"
          ? ["cuisine", "bureau"].includes(d.id)
          : which === "relax"
            ? ["table", "canape", "led"].includes(d.id)
            : false;
      if (d.on) d.brightness = which === "relax" ? 35 : 80;
    }
    if (d.type === "cover")
      d.position =
        which === "morning" ? 100 : which === "night" ? 0 : d.position;
    if (d.type === "media" && ["away", "night"].includes(which)) d.on = false;
  });
  if (which === "away") state.alarm = true;
  if (which === "morning") state.alarm = false;
  save();
  render();
  toast(
    {
      morning: "Bonjour ! Votre maison se réveille.",
      relax: "Ambiance détente activée.",
      night: "Bonne nuit. Lumières éteintes et volets fermés.",
      away: "Lumières éteintes · Alarme de démo activée.",
    }[which],
  );
}
function blind(d) {
  return `<div class="blind" aria-hidden="true"><div class="slats" style="height:${100 - d.position}%"></div></div>`;
}
function coversPage() {
  return (
    head("Volets", "La lumière du jour, à votre rythme.") +
    `<div class="toolbar"><span class="tiny">${covers().filter((d) => d.position > 0).length} ouverts sur ${covers().length} · Commandes simulées</span><div class="actions"><button class="btn" onclick="allCovers(100)">${icon("up")} Tout ouvrir</button><button class="btn" onclick="allCovers(0)">${icon("down")} Tout fermer</button><button class="btn" onclick="allStop()">${icon("pause")} Arrêter</button></div></div><div class="cover-grid">${covers()
      .map(
        (d) =>
          `<section class="cover-card"><div class="section-title"><h2>${d.name}</h2><span class="tiny">${d.room}</span></div>${blind(d)}<div class="range-label"><span>${movers[d.id] ? "En mouvement…" : d.position === 0 ? "Fermé" : d.position === 100 ? "Ouvert" : "Ouverture partielle"}</span><strong>${d.position} %</strong></div><input type="range" min="0" max="100" value="${d.position}" aria-label="Ouverture ${d.name}" oninput="this.previousElementSibling.lastElementChild.textContent=this.value+' %'" onchange="setCover('${d.id}',this.value)"><div class="cover-controls"><button onclick="move('${d.id}',100)" aria-label="Ouvrir ${d.name}">${icon("up")}</button><button onclick="stopMove('${d.id}');render()" aria-label="Arrêter ${d.name}">${icon("pause")}</button><button onclick="move('${d.id}',0)" aria-label="Fermer ${d.name}">${icon("down")}</button></div></section>`,
      )
      .join(
        "",
      )}</div><p class="empty-note">La position et le mouvement des volets sont simulés. La compatibilité réelle dépendra de vos moteurs ou modules Zigbee.</p>`
  );
}
function setCover(id, n) {
  stopMove(id);
  device(id).position = +n;
  save();
  render();
  if (activeDevice === id) openDevice(id, false);
}
function stopMove(id) {
  clearInterval(movers[id]);
  delete movers[id];
  save();
}
function move(id, target) {
  stopMove(id);
  const d = device(id);
  if (d.position === target) return;
  movers[id] = setInterval(() => {
    d.position +=
      Math.sign(target - d.position) *
      Math.min(5, Math.abs(target - d.position));
    if (d.position === target) stopMove(id);
    save();
    if (view === "volets") render();
    if (activeDevice === id && dialog.open) openDevice(id, false);
  }, 200);
  render();
}
function allCovers(target) {
  covers().forEach((d) => move(d.id, target));
  toast(
    target ? "Ouverture de tous les volets…" : "Fermeture de tous les volets…",
  );
}
function allStop() {
  Object.keys(movers).forEach(stopMove);
  render();
  toast("Tous les volets sont arrêtés.");
}
function chart(type = "temperature", p = period) {
  let vals;
  const shift = p === "7 jours" ? 2 : p === "30 jours" ? 4 : 0;
  if (type === "temperature")
    vals = [
      20.8, 20.7, 20.6, 20.7, 21.1, 21.6, 21.9, 22.2, 22.4, 22.3, 22.1, 21.8,
    ].map((v, i) => v + Math.sin(i + shift) * (0.15 + shift * 0.1));
  else if (type === "humidity")
    vals = [43, 43, 44, 43.7, 44, 45.5, 47, 48, 47, 46, 46.5, 46].map(
      (v, i) => v + Math.sin(i + shift) * shift * 0.3,
    );
  else
    vals = [
      130, 150, 230, 650, 170, 145, 120, 190, 1050, 240, 200, 410, 180, 130,
      230, 1420, 450, 800, 190, 320, 1750, 400, 180, 240,
    ].map((v, i) => v * (p === "7 jours" ? 0.65 : 1));
  const min = type === "temperature" ? 19 : type === "humidity" ? 40 : 0,
    max = type === "temperature" ? 24 : type === "humidity" ? 52 : 2000;
  const pts = vals
    .map(
      (v, i) =>
        `${40 + (i * 400) / (vals.length - 1)},${165 - ((v - min) / (max - min)) * 135}`,
    )
    .join(" ");
  const labels =
    p === "7 jours"
      ? ["Lun.", "Mer.", "Ven.", "Dim."]
      : p === "30 jours"
        ? ["1 nov.", "10 nov.", "20 nov.", "30 nov."]
        : ["00 h", "08 h", "16 h", "24 h"];
  const col =
    type === "temperature"
      ? "#c4a361"
      : type === "humidity"
        ? "#88a8b3"
        : "#91a184";
  return `<svg class="chart" viewBox="0 0 460 205" role="img" aria-label="${type === "temperature" ? "Température" : type === "humidity" ? "Humidité" : "Puissance électrique"} : données simulées sur ${p}"><defs><linearGradient id="gradient-${type}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${col}" stop-opacity=".18"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>${[0, 1, 2, 3].map((i) => `<line x1="40" x2="440" y1="${30 + i * 45}" y2="${30 + i * 45}"/><text x="0" y="${34 + i * 45}">${fr(max - (i * (max - min)) / 3)}${type === "power" ? " W" : "°".replace("°", type === "humidity" ? " %" : "°")}</text>`).join("")}<path class="area" fill="url(#gradient-${type})" d="M40 165 L${pts} L440 165 Z"/><polyline stroke="${col}" points="${pts}"/>${labels.map((v, i) => `<text x="${40 + i * 133}" y="194" text-anchor="${i === 0 ? "start" : i === 3 ? "end" : "middle"}">${v}</text>`).join("")}</svg>`;
}
function segments(values, current, fn) {
  return `<div class="segmented">${values.map((p) => `<button class="${p === current ? "active" : ""}" onclick="${fn}('${p}')">${p}</button>`).join("")}</div>`;
}
function setPeriod(p) {
  period = p;
  render();
}
function setEnergyPeriod(p) {
  energyPeriod = p;
  render();
}

function setTarget(r, n) {
  state.targets[r] = +n;
  save();
  document.getElementById("label-" + r).textContent = fr(n) + "°";
}
function kpi(i, t, v, sub) {
  return `<div class="kpi"><span>${icon(i)} ${t}</span><strong>${v}</strong><small>${sub}</small></div>`;
}
function bars() {
  const vs =
    energyPeriod === "7 jours"
      ? [5.8, 6.4, 4.2, 5.6, 7.3, 5.5, 4.8]
      : [
          6.4, 5.7, 4.6, 4.2, 4.8, 5.1, 7.2, 4.2, 5.5, 5.6, 4.1, 3.9, 4.8, 5.9,
          5.1, 4.6, 4.2, 5.6, 6.3, 5.1, 4.4, 5.2, 7.6, 6.7, 5.2, 4.1, 3.7, 4.8,
          5.5, 4.8,
        ];
  return `<svg class="chart" viewBox="0 0 460 205" role="img" aria-label="Consommation simulée par jour sur ${energyPeriod}">${[0, 1, 2, 3].map((i) => `<line x1="35" x2="445" y1="${30 + i * 45}" y2="${30 + i * 45}"/><text x="0" y="${34 + i * 45}">${9 - i * 3}</text>`).join("")}${vs.map((v, i) => `<rect x="${40 + (i * 400) / vs.length}" y="${165 - v * 15}" width="${(400 / vs.length) * 0.62}" height="${v * 15}" rx="3" fill="${i === vs.length - 1 ? "#b38d4f" : "#d5ba80"}"/>`).join("")}<text x="40" y="194">${energyPeriod === "7 jours" ? "Lun." : "1 nov."}</text><text x="215" y="194">${energyPeriod === "7 jours" ? "Jeu." : "15 nov."}</text><text x="440" y="194" text-anchor="end">${energyPeriod === "7 jours" ? "Dim." : "30 nov."}</text></svg>`;
}
function energy() {
  return (
    head("Consommation", "Mieux comprendre, pour consommer autrement.") +
    `<div class="kpi-grid">${kpi("bolt", "Aujourd’hui", "4,8 kWh", "1,12 € estimé · hors abonnement")}${kpi("clock", "Ce mois-ci", "150 kWh", "35,10 € d’énergie estimés")}${kpi("plug", "Facture estimée", "49,10 €", "Abonnement de 14 € inclus")}${kpi("leaf", "Moyenne / jour", "5,0 kWh", "Sur les 30 derniers jours")}</div><div class="toolbar"><span class="tiny">Données d’exemple · Tarif : 0,234 €/kWh</span>${segments(["7 jours", "30 jours"], energyPeriod, "setEnergyPeriod")}</div><div class="charts"><section class="card"><h3>Consommation quotidienne</h3><p>kWh · ${energyPeriod}</p>${bars()}</section><section class="card"><h3>Puissance appelée</h3><p>Watts · ${energyPeriod === "7 jours" ? "Exemple sur 7 jours" : "Exemple sur 48 heures"}</p>${chart("power", energyPeriod)}</section></div><div class="charts"><section class="card"><h3>Où va votre énergie ?</h3><p>Exemple de répartition par équipement.</p>${[
      ["thermo", "Chauffage", "2,1 kWh", 44],
      ["plug", "Électroménager", "1,6 kWh", 33],
      ["bulb", "Éclairage Hue", "0,4 kWh", 8],
      ["tv", "Autres appareils", "0,7 kWh", 15],
    ]
      .map(
        ([i, t, v, n]) =>
          `<div class="row">${icon(i)}<span>${t}</span><span class="track"><i style="width:${n}%"></i></span><strong>${v}</strong></div>`,
      )
      .join(
        "",
      )}</section><section class="card"><h3>Le bon moment pour consommer</h3><p>Tempo & EcoWatt · Exemple fictif</p><div class="tempo"><div><span class="tiny">Aujourd’hui</span><div class="blue">Bleu</div></div><div><span class="tiny">Demain</span><div class="blue">Bleu</div></div><div><span class="tag">Signal vert</span><p>Consommation normale</p></div></div><p class="empty-note">Ces informations ne sont pas les signaux réels du jour. Les intégrations et votre contrat seront configurés lors du raccordement à Home Assistant.</p></section></div>`
  );
}
function widget(w) {
  const houseStats = houseClimateStats();
  const data = {
    temperature: `<span class="tiny">TEMPÉRATURE MOYENNE</span><div class="giant">${formatClimate(houseReading(), "")}<small>°</small></div><h3>Juste bien, à la maison.</h3><p>Sur 24 h · Min. ${formatClimate(houseStats.min)} · Max. ${formatClimate(houseStats.max)}</p><button class="btn" onclick="openRoomClimate()">Voir le climat ${icon("arrow")}</button>`,
    weather: `<span style="color:#bd9b50">${icon("sun")}</span><div class="climate-number">14°</div><h3>Ciel dégagé</h3><p>Haut : 16° · Bas : 8°</p>`,
    clock: `<span class="tiny">PRENDRE LE TEMPS</span><div class="clock-face clock-live">${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div><p style="text-align:center">${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>`,
    lights: `${icon("bulb")}<div class="climate-number">${lights().filter((d) => d.on).length}<small> / ${lights().length}</small></div><h3>Lumières allumées</h3><button class="text-button" onclick="lightsOff()">Tout éteindre →</button>`,
    covers: `${icon("blinds")}<div class="climate-number">${covers().filter((d) => d.position > 0).length}<small> / ${covers().length}</small></div><h3>Volets ouverts</h3><button class="text-button" onclick="go('volets')">Ajuster la lumière →</button>`,
    scene: `${icon("spark")}<h3 style="margin-top:25px">Votre moment détente.</h3><p>Lumière douce. Esprit léger.</p><button class="btn" onclick="scene('relax')">Activer la scène</button>`,
  };
  return `<section class="card widget ${w === "temperature" ? "big" : ""} ${editing ? "editing" : ""}" ${editing ? `draggable="true" ondragstart="event.dataTransfer.setData('text/plain','${w}')" ondragover="event.preventDefault()" ondrop="dropWidget(event,'${w}')"` : ""}>${editing ? `<div class="edit-tools"><button onclick="reorder('${w}',-1)" aria-label="Déplacer à gauche">←</button><button onclick="reorder('${w}',1)" aria-label="Déplacer à droite">→</button></div>` : ""}${data[w]}</section>`;
}
function homeview() {
  return (
    head("HomeView", "Votre maison, à votre façon.") +
    `<div class="toolbar"><span class="tiny">${editing ? "Utilisez les flèches ou glissez les widgets." : "Vos essentiels, à portée de main."}</span><button class="btn ${editing ? "primary" : ""}" onclick="editing=!editing;render()">${icon(editing ? "check" : "grid")} ${editing ? "Terminer" : "Personnaliser"}</button></div><div class="widget-grid">${state.widgets.map(widget).join("")}</div><p class="empty-note">La disposition est sauvegardée automatiquement dans ce navigateur.</p>`
  );
}
function reorder(w, delta) {
  const i = state.widgets.indexOf(w),
    j = i + delta;
  if (j < 0 || j >= state.widgets.length) return;
  [state.widgets[i], state.widgets[j]] = [state.widgets[j], state.widgets[i]];
  save();
  render();
}
function dropWidget(e, w) {
  e.preventDefault();
  const src = e.dataTransfer.getData("text/plain");
  if (!state.widgets.includes(src)) return;
  const i = state.widgets.indexOf(src),
    j = state.widgets.indexOf(w);
  state.widgets.splice(i, 1);
  state.widgets.splice(j, 0, src);
  save();
  render();
}
function lightsOff() {
  lights().forEach((d) => (d.on = false));
  activeScene = "";
  save();
  render();
  toast("Toutes les lumières sont éteintes.");
}
function security() {
  return (
    head("Sécurité", "La tranquillité, même quand vous êtes ailleurs.") +
    `<div class="safe-banner">${icon("shield")}<h2>${state.contactOpen ? "Une fenêtre est ouverte." : "Votre maison est sereine."}</h2><p>${state.contactOpen ? "Fenêtre du salon ouverte · simulation" : "Toutes les ouvertures sont fermées."} · Alarme ${state.alarm ? "activée" : "désactivée"}</p></div><div class="security-grid"><section class="card"><h3>Les ouvertures</h3>${[
      ["door", "Porte d’entrée", "Fermée"],
      ["plan", "Fenêtre du salon", state.contactOpen ? "Ouverte" : "Fermée"],
      ["plan", "Fenêtre de la chambre", "Fermée"],
    ]
      .map(
        ([i, t, v]) =>
          `<div class="row">${icon(i)}<div>${t}<small>Capteur Zigbee · Démo</small></div><strong style="color:${v === "Ouverte" ? "#bf9450" : "#89997a"}">${v}</strong></div>`,
      )
      .join(
        "",
      )}<button class="text-button" onclick="state.contactOpen=!state.contactOpen;save();render()">Simuler une ${state.contactOpen ? "fermeture" : "ouverture"} de fenêtre →</button></section><section class="card"><h3>Votre protection</h3><div class="row">${icon("shield")}<div>Alarme de démo<small>${state.alarm ? "Surveillance activée" : "À la maison"}</small></div><button class="switch ${state.alarm ? "on" : ""}" role="switch" aria-checked="${state.alarm}" aria-label="Alarme de démonstration" onclick="state.alarm=!state.alarm;save();render()"></button></div><p>Vous pourrez retrouver ici vos capteurs, votre alarme et vos caméras compatibles.</p><span class="tag">Aucun système de sécurité réel connecté</span></section></div>`
  );
}
function plan() {
  return (
    head("Plan de la maison", "Les bons gestes, au bon endroit.") +
    `<p class="status-line">Touchez une lampe pour l’allumer ou l’éteindre.</p><div class="floorplan">${[
      "Salon",
      "Chambre",
      "Bureau",
      "Cuisine",
    ]
      .map(
        (r) =>
          `<section class="floor-room"><h3>${r}</h3><div>${state.devices
            .filter((d) => d.room === r && d.type === "light")
            .map(
              (d) =>
                `<button class="${d.on ? "on" : ""}" onclick="toggle('${d.id}')" aria-label="${d.on ? "Éteindre" : "Allumer"} ${d.name}" title="${d.name}">${icon(d.icon)}</button>`,
            )
            .join(
              "",
            )}</div><small>${formatClimate(roomReadingByName(r))} · ${state.devices.filter((d) => d.room === r && d.type === "light" && d.on).length} lumière(s)</small></section>`,
      )
      .join(
        "",
      )}</div><p class="empty-note" style="text-align:center">Plan illustratif. Il sera remplacé par celui de votre logement.</p>`
  );
}
function modal(content, camera = false) {
  dialog.classList.toggle("camera-dialog", camera);
  dialog.classList.remove("camera-expanded");
  document.querySelector("#modal-content").innerHTML = content;
  if (!dialog.open) dialog.showModal();
  hydrate();
}
function modalHead(title) {
  return `<div class="modal-head"><h2 id="modal-title" tabindex="-1">${title}</h2><button class="icon-button" aria-label="Fermer" onclick="closeModal()">${icon("close")}</button></div>`;
}
function closeModal() {
  dialog.close();
  activeDevice = null;
}
function openDevice(id, first = true) {
  activeDevice = id;
  const d = device(id);
  modal(
    modalHead(d.name) +
      `<p class="tiny">${d.room} · ${d.type === "light" ? "Philips Hue" : d.type === "cover" ? "Volet roulant" : "Multimédia"} · Démo</p><div class="modal-icon">${icon(d.icon)}</div><div class="modal-state">${d.type === "cover" ? d.position + " % ouvert" : d.on ? "Allumé" : "Éteint"}</div>` +
      (d.type === "cover"
        ? `${blind(d)}<label class="control-label" for="modal-range">Ouverture : <b id="cover-label">${d.position} %</b></label><input id="modal-range" type="range" min="0" max="100" value="${d.position}" oninput="document.querySelector('#cover-label').textContent=this.value+' %'" onchange="setCover('${id}',this.value)"><div class="modal-actions"><button class="btn" onclick="move('${id}',100)">Ouvrir</button><button class="btn" onclick="stopMove('${id}');openDevice('${id}',false)">Arrêter</button><button class="btn" onclick="move('${id}',0)">Fermer</button></div>`
        : `${d.type === "light" ? `<label class="control-label" for="brightness">Luminosité : <b id="brightness-label">${d.brightness} %</b></label><input id="brightness" type="range" min="1" max="100" value="${d.brightness}" oninput="setBrightness('${id}',this.value)"><label class="control-label">Une couleur pour chaque moment</label><div class="color-picks">${["#fff0bb", "#ffce99", "#b5a6e6", "#95bacc", "#e6a5a5"].map((c) => `<button style="background:${c};${d.color === c ? "box-shadow:0 0 0 2px #a5ad94" : ""}" aria-label="Couleur ${c}" onclick="setColor('${id}','${c}')"></button>`).join("")}</div><label class="color-control">Couleur personnalisée <input type="color" value="${d.color}" aria-label="Couleur personnalisée" onchange="setColor('${id}',this.value)"></label>` : ""}<div class="modal-actions"><button class="btn ${d.on ? "" : "primary"}" onclick="toggle('${id}')">${d.on ? "Éteindre" : "Allumer"}</button></div>`),
  );
}
function setBrightness(id, v) {
  const d = device(id);
  d.brightness = +v;
  d.on = true;
  activeScene = "";
  save();
  render();
  document.querySelector("#brightness-label").textContent = v + " %";
  document.querySelector(".modal-state").textContent = "Allumé";
}
function setColor(id, c) {
  device(id).color = c;
  device(id).on = true;
  save();
  render();
  openDevice(id, false);
}
function settings() {
  activeDevice = null;
  modal(
    modalHead("Votre Maison+") +
      `<p class="tiny">Une démo à explorer librement.</p><div class="settings-row"><h3>${icon("home")} Une maison de démonstration</h3><p>Tous les appareils, les mesures, les tarifs et les signaux électriques sont simulés. Les commandes restent dans ce navigateur.</p></div><div class="settings-row"><h3>Gardez vos réglages</h3><p>Exportez les états des appareils, les consignes et votre disposition HomeView. Cette sauvegarde concerne uniquement la démo.</p><div class="actions"><button class="btn" onclick="backup()">${icon("download")} Exporter</button><button class="btn" onclick="document.querySelector('#import-file').click()">${icon("upload")} Importer</button></div></div><div class="settings-row"><h3>La suite avec Home Assistant</h3><p>Le raccordement à votre installation QNAP et la configuration de vos véritables entités restent à réaliser. Aucun accès à votre installation n’est demandé ici.</p></div><button class="btn danger" onclick="confirmReset()">Réinitialiser la démo</button>`,
  );
}
function backup() {
  const blob = new Blob([JSON.stringify({ version: 1, state }, null, 2)], {
    type: "application/json",
  });
  const u = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = u;
  a.download = "maison-plus-demo.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
  toast("Sauvegarde de la démo exportée.");
}
function confirmReset() {
  modal(
    modalHead("Recommencer la démo ?") +
      `<p class="empty-note">Les états des appareils et votre disposition HomeView seront remplacés par les réglages initiaux dans ce navigateur.</p><div class="modal-actions"><button class="btn" onclick="settings()">Annuler</button><button class="btn danger" onclick="resetDemo()">Réinitialiser</button></div>`,
  );
}
function resetDemo() {
  Object.keys(movers).forEach(stopMove);
  state = structuredClone(initial);
  activeScene = "";
  save();
  closeModal();
  render();
  toast("La démo est prête pour un nouveau départ.");
}
document.querySelector("#import-file").onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    if (f.size > 100000) throw Error();
    const data = JSON.parse(await f.text());
    if (data.version !== 1 || !validState(data.state)) throw Error();
    Object.keys(movers).forEach(stopMove);
    state = data.state;
    activeScene = "";
    save();
    closeModal();
    render();
    toast("Votre sauvegarde a été restaurée.");
  } catch {
    toast("Fichier invalide. Choisissez une sauvegarde Maison+ de la démo.");
  } finally {
    e.target.value = "";
  }
};
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeModal();
  }
});
dialog.addEventListener("close", () => {
  activeDevice = null;
  document
    .querySelector("#more-button")
    ?.setAttribute("aria-expanded", "false");
});
function navLink(id, i, t, mobile = false) {
  return `<a href="#${id}" aria-label="${t}" class="${mobile ? "mobile-link" : "nav-link"} ${view === id ? "active" : ""}" ${view === id ? 'aria-current="page"' : ""}><span class="nav-symbol">${icon(i)}</span><span class="nav-label">${t}</span>${!mobile && id === "homeview" ? '<span class="badge">POUR VOUS</span>' : ""}</a>`;
}
function moreMenu() {
  activeDevice = null;
  document.querySelector("#more-button")?.setAttribute("aria-expanded", "true");
  modal(
    modalHead("Plus") +
      `<p class="more-intro">Encore plus pour votre maison.</p><div class="more-menu">${[
        [
          "securite",
          "shield",
          "Sécurité",
          state.contactOpen
            ? "Une fenêtre ouverte"
            : "Toutes les ouvertures sont fermées",
        ],
        ["plan", "plan", "Plan de la maison", "Vos appareils, pièce par pièce"],
      ]
        .map(
          ([id, i, t, sub]) =>
            `<button class="more-item ${view === id ? "current" : ""}" onclick="selectMore('${id}')"><span class="more-symbol">${icon(i)}</span><span><strong>${t}</strong><small>${sub}</small></span><span class="more-arrow">${icon("arrow")}</span></button>`,
        )
        .join(
          "",
        )}<button class="more-item" onclick="cameraGallery()"><span class="more-symbol">${icon("camera")}</span><span><strong>Caméras</strong><small>Deux aperçus de démonstration</small></span><span class="more-arrow">${icon("arrow")}</span></button><button class="more-item" onclick="settings()"><span class="more-symbol">${icon("settings")}</span><span><strong>Réglages</strong><small>Sauvegarde et personnalisation</small></span><span class="more-arrow">${icon("arrow")}</span></button></div>`,
  );
}
function selectMore(id) {
  closeModal();
  go(id);
}
function render() {
  document.body.classList.toggle("home-screen", view === "maison");
  document.querySelector("#navigation").innerHTML = nav
    .map(([id, i, t]) => navLink(id, i, t))
    .join("");
  const extra = ["securite", "plan"].includes(view);
  document.querySelector("#mobile-nav").innerHTML =
    nav
      .slice(0, 5)
      .map(([id, i, t]) => navLink(id, i, t, true))
      .join("") +
    `<button id="more-button" class="mobile-link ${extra ? "active" : ""}" ${extra ? 'aria-current="true"' : ""} aria-label="Plus : caméras, sécurité, plan et réglages" aria-haspopup="dialog" aria-expanded="false" onclick="moreMenu()"><span class="nav-symbol">${icon("more")}</span><span class="nav-label">Plus</span></button>`;
  document.querySelector("#breadcrumb").innerHTML =
    `Ma maison <b>/</b> ${view === "maison" ? "Vue d’ensemble" : nav.find((n) => n[0] === view)?.[2] || "Vue d’ensemble"}`;
  main.innerHTML = (
    {
      maison: home,
      volets: coversPage,
      climat: climateDashboard,
      homeview,
      conso: energy,
      securite: security,
      plan,
    }[view] || home
  )();
  hydrate();
}
window.addEventListener("hashchange", () => {
  const v = location.hash.slice(1);
  if (nav.some((n) => n[0] === v) && v !== view) {
    view = v;
    render();
    window.scrollTo(0, 0);
  }
});
view = nav.some((n) => n[0] === location.hash.slice(1))
  ? location.hash.slice(1)
  : "maison";
render();
setInterval(() => {
  document
    .querySelectorAll(".clock-live")
    .forEach(
      (el) =>
        (el.textContent = new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })),
    );
  document.querySelectorAll("[data-camera-age]").forEach((el) => {
    const camera = demoCameras.find((c) => c.id === el.dataset.cameraAge);
    if (camera) el.textContent = cameraAge(camera);
  });
}, 10000);
