// Demonstration model. The live version will use Home Assistant area IDs.
const climateAreas = [
  { id: "salon", name: "Salon", icon: "sofa" },
  { id: "cuisine", name: "Cuisine", icon: "bulb" },
  { id: "chambre", name: "Chambre", icon: "bed" },
  { id: "bureau", name: "Bureau", icon: "lamp" },
];
const demoThermometers = [
  {
    id: "salon-canape",
    areaId: "salon",
    name: "Capteur canapé",
    temperature: 22.2,
    humidity: 44,
    status: "online",
    lastSeen: Date.now() - 120000,
  },
  {
    id: "salon-bibliotheque",
    areaId: "salon",
    name: "Capteur bibliothèque",
    temperature: 22.6,
    humidity: 46,
    status: "online",
    lastSeen: Date.now() - 180000,
  },
  {
    id: "cuisine-plan",
    areaId: "cuisine",
    name: "Capteur plan de travail",
    temperature: 22.1,
    humidity: 48,
    status: "online",
    lastSeen: Date.now() - 60000,
  },
  {
    id: "chambre-chevet",
    areaId: "chambre",
    name: "Capteur chevet",
    temperature: 20.6,
    humidity: 47,
    status: "online",
    lastSeen: Date.now() - 120000,
  },
  {
    id: "chambre-fenetre",
    areaId: "chambre",
    name: "Capteur fenêtre",
    temperature: 21,
    humidity: null,
    status: "online",
    lastSeen: Date.now() - 240000,
  },
  {
    id: "bureau-etagere",
    areaId: "bureau",
    name: "Capteur étagère",
    temperature: 21.9,
    humidity: 44,
    status: "online",
    lastSeen: Date.now() - 60000,
  },
  {
    id: "bureau-fenetre",
    areaId: "bureau",
    name: "Capteur fenêtre",
    temperature: null,
    humidity: null,
    status: "unavailable",
    lastSeen: Date.now() - 5400000,
  },
];
const unassignedClimateArea = {
  id: "unassigned",
  name: "Sans pièce",
  icon: "thermo",
};
let climateArea = "all",
  climateSensor = "all";
function meanReading(values) {
  const valid = values.filter(Number.isFinite);
  return valid.length
    ? valid.reduce((sum, v) => sum + v, 0) / valid.length
    : null;
}
function metricAvailable(sensor, metric) {
  return sensor.status === "online" && Number.isFinite(sensor[metric]);
}
function thermometerArea(sensor) {
  return climateAreas.some((a) => a.id === sensor.areaId)
    ? sensor.areaId
    : "unassigned";
}
function availableClimateAreas() {
  return [
    ...climateAreas,
    ...(demoThermometers.some((s) => thermometerArea(s) === "unassigned")
      ? [unassignedClimateArea]
      : []),
  ];
}
function thermometersForArea(id) {
  return demoThermometers.filter((s) => thermometerArea(s) === id);
}
function areaReading(id, metric = "temperature") {
  return meanReading(
    thermometersForArea(id)
      .filter((s) => metricAvailable(s, metric))
      .map((s) => s[metric]),
  );
}
function houseReading(metric = "temperature") {
  return meanReading(climateAreas.map((a) => areaReading(a.id, metric)));
}
function roomReadingByName(name, metric = "temperature") {
  const area = climateAreas.find((a) => a.name === name);
  return area ? areaReading(area.id, metric) : null;
}
function formatClimate(value, unit = "°") {
  return Number.isFinite(value) ? fr(value) + unit : "—";
}
function climateRoomLabel(name) {
  const temperature = roomReadingByName(name),
    humidity = roomReadingByName(name, "humidity");
  return [
    formatClimate(temperature),
    ...(humidity === null ? [] : [formatClimate(humidity, " %")]),
  ].join(" · ");
}
function selectedClimateSensors() {
  if (climateSensor !== "all")
    return demoThermometers.filter(
      (s) => s.id === climateSensor && thermometerArea(s) === climateArea,
    );
  return climateArea === "all"
    ? demoThermometers.filter((s) => thermometerArea(s) !== "unassigned")
    : thermometersForArea(climateArea);
}
function selectedClimateReading(metric) {
  if (climateArea === "all") return houseReading(metric);
  if (climateSensor === "all") return areaReading(climateArea, metric);
  const sensor = selectedClimateSensors()[0];
  return sensor && metricAvailable(sensor, metric) ? sensor[metric] : null;
}
function setClimateArea(id) {
  if (id !== "all" && !availableClimateAreas().some((a) => a.id === id)) return;
  climateArea = id;
  climateSensor = "all";
  render();
  document
    .querySelector('[data-climate-area="' + id + '"]')
    ?.focus({ preventScroll: true });
}
function selectThermometer(id) {
  const sensor = demoThermometers.find((s) => s.id === id);
  if (!sensor) return;
  climateArea = thermometerArea(sensor);
  climateSensor = id;
  render();
  focusClimateHistory();
}
function focusClimateHistory() {
  document
    .querySelector("#climate-history-title")
    ?.focus({ preventScroll: true });
  document
    .querySelector(".climate-history")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function selectClimateSensor(id) {
  if (id === "all") {
    climateSensor = "all";
    render();
    focusClimateHistory();
    return;
  }
  if (thermometersForArea(climateArea).some((s) => s.id === id))
    selectThermometer(id);
}
function openRoomClimate(id = "all") {
  if (id !== "all" && !availableClimateAreas().some((a) => a.id === id)) return;
  climateArea = id;
  climateSensor = "all";
  go("climat");
}
function climateScopeLabel() {
  if (climateArea === "all") return "Toute la maison";
  const area = availableClimateAreas().find((a) => a.id === climateArea);
  const sensor = demoThermometers.find((s) => s.id === climateSensor);
  return area.name + (sensor ? " · " + sensor.name : "");
}
function sensorLastSeen(sensor) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - sensor.lastSeen) / 60000),
  );
  return minutes < 1
    ? "À l’instant"
    : minutes < 60
      ? "Il y a " + minutes + " min"
      : "Il y a " + Math.floor(minutes / 60) + " h";
}
function sensorHistory(sensor, metric, p = period) {
  if (!metricAvailable(sensor, metric)) return null;
  const n = p === "24 h" ? 12 : p === "7 jours" ? 14 : 30,
    scale = p === "24 h" ? 1 : p === "7 jours" ? 1.4 : 1.8;
  const seed = demoThermometers.indexOf(sensor) * 0.83;
  const wave = (i) =>
    (Math.sin(i * 0.7 + seed) * 0.45 + Math.cos(i * 0.31 + seed) * 0.2) *
    scale *
    (metric === "humidity" ? 4 : 1);
  const last = wave(n - 1);
  return Array.from({ length: n }, (_, i) =>
    Number(
      (
        sensor[metric] +
        wave(i) -
        last -
        (1 - i / (n - 1)) * (metric === "humidity" ? 1 : 0.2)
      ).toFixed(2),
    ),
  );
}
function combineHistories(series) {
  const valid = series.filter(Boolean);
  return valid.length
    ? valid[0].map((_, i) => meanReading(valid.map((s) => s[i])))
    : null;
}
function houseClimateHistory(metric = "temperature", p = "24 h") {
  return combineHistories(
    climateAreas.map((area) =>
      combineHistories(
        thermometersForArea(area.id).map((s) => sensorHistory(s, metric, p)),
      ),
    ),
  );
}
function houseClimateStats() {
  const values = houseClimateHistory();
  return values
    ? { min: Math.min(...values), max: Math.max(...values) }
    : { min: null, max: null };
}
function selectedClimateHistory(metric, p = period) {
  if (climateArea === "all") return houseClimateHistory(metric, p);
  return combineHistories(
    selectedClimateSensors().map((s) => sensorHistory(s, metric, p)),
  );
}
function climateStats(metric = "temperature", p = period) {
  const values = selectedClimateHistory(metric, p);
  return values
    ? {
        mean: meanReading(values),
        min: Math.min(...values),
        max: Math.max(...values),
      }
    : { mean: null, min: null, max: null };
}
function climateChart(metric) {
  const values = selectedClimateHistory(metric);
  if (!values)
    return `<div class="climate-empty">${icon(metric === "temperature" ? "thermo" : "drop")}<strong>Aucun relevé ${metric === "temperature" ? "de température" : "d’humidité"}</strong><span>${metric === "humidity" ? (climateSensor === "all" ? "Aucun capteur disponible de cette sélection ne mesure l’humidité." : "Ce capteur ne mesure pas l’humidité ou est indisponible.") : "Les capteurs de cette sélection sont indisponibles."}</span></div>`;
  const unit = metric === "temperature" ? "°" : " %",
    color = metric === "temperature" ? "#c4a361" : "#88a8b3",
    margin = metric === "temperature" ? 0.4 : 1;
  const low = Math.floor((Math.min(...values) - margin) * 2) / 2,
    high = Math.ceil((Math.max(...values) + margin) * 2) / 2;
  const points = values
    .map(
      (v, i) =>
        `${44 + (i * 396) / (values.length - 1)},${165 - ((v - low) / (high - low)) * 135}`,
    )
    .join(" ");
  const labels =
    period === "7 jours"
      ? ["J−7", "J−5", "J−2", "Maintenant"]
      : period === "30 jours"
        ? ["J−30", "J−20", "J−10", "Maintenant"]
        : ["Il y a 24 h", "−16 h", "−8 h", "Maintenant"];
  return `<svg class="chart" viewBox="0 0 460 205" role="img" aria-label="${metric === "temperature" ? "Température" : "Humidité"} · ${climateScopeLabel()} · ${period} · données simulées"><defs><linearGradient id="climate-gradient-${metric}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${[0, 1, 2, 3].map((i) => `<line x1="44" x2="440" y1="${30 + i * 45}" y2="${30 + i * 45}"/><text x="0" y="${34 + i * 45}">${fr(high - (i * (high - low)) / 3)}${unit}</text>`).join("")}<path class="area" fill="url(#climate-gradient-${metric})" d="M44 165 L${points} L440 165 Z"/><polyline stroke="${color}" points="${points}"/>${labels.map((label, i) => `<text x="${44 + i * 132}" y="194" text-anchor="${i === 0 ? "start" : i === 3 ? "end" : "middle"}">${label}</text>`).join("")}</svg>`;
}
function thermometerRow(sensor) {
  const available = metricAvailable(sensor, "temperature"),
    selected =
      climateSensor === sensor.id && climateArea === thermometerArea(sensor);
  return `<button class="thermometer-row ${selected ? "selected" : ""} ${available ? "" : "unavailable"}" aria-pressed="${selected}" aria-label="${sensor.name} · ${availableClimateAreas().find((a) => a.id === thermometerArea(sensor)).name} · ${available ? formatClimate(sensor.temperature) : "Indisponible"} · Voir l’historique" onclick="selectThermometer('${sensor.id}')"><span class="thermometer-symbol">${icon("thermo")}</span><span class="thermometer-identity"><strong>${sensor.name}</strong><small>${available ? sensorLastSeen(sensor) : "Indisponible · " + sensorLastSeen(sensor)}</small></span><span class="thermometer-values"><strong>${formatClimate(available ? sensor.temperature : null)}</strong><small>${metricAvailable(sensor, "humidity") ? formatClimate(sensor.humidity, " %") : available ? "Température seule" : "Aucun relevé"}</small></span><span class="thermometer-chevron">${icon("arrow")}</span></button>`;
}
function climateAreaCard(area) {
  const sensors = thermometersForArea(area.id),
    active = sensors.filter((s) => metricAvailable(s, "temperature")).length;
  const humidity = areaReading(area.id, "humidity");
  return `<section class="card climate-area-card"><div class="climate-area-head"><h2><button class="climate-area-name" onclick="setClimateArea('${area.id}')">${icon(area.icon)}${area.name}${icon("arrow")}</button></h2><span class="climate-sensor-count">${active}/${sensors.length} actif${active === 1 ? "" : "s"}</span></div><div class="climate-area-reading"><strong>${formatClimate(areaReading(area.id))}</strong><span>${humidity === null ? "Humidité indisponible" : icon("drop") + " " + formatClimate(humidity, " %")}<small>${active > 1 ? "Moyenne de " + active + " thermomètres" : active === 1 ? "1 thermomètre disponible" : "Aucun relevé disponible"}</small></span></div><div class="thermometer-list">${sensors.map(thermometerRow).join("") || '<p class="empty-note">Aucun thermomètre affecté à cette pièce.</p>'}</div>${Object.hasOwn(state.targets, area.name) ? `<div class="thermostat"><label for="target-${area.id}">Consigne de démonstration <strong id="label-${area.name}">${fr(state.targets[area.name])}°</strong></label><input id="target-${area.id}" aria-label="Consigne de chauffage ${area.name}" type="range" min="16" max="25" step="0.5" value="${state.targets[area.name]}" oninput="setTarget('${area.name}',this.value)"></div>` : ""}</section>`;
}
function climateDashboard() {
  const areas = availableClimateAreas(),
    visible =
      climateArea === "all" ? areas : areas.filter((a) => a.id === climateArea),
    stats = climateStats();
  const active = selectedClimateSensors().filter((s) =>
    metricAvailable(s, "temperature"),
  ).length;
  const explanation =
    climateArea === "all"
      ? "Chaque pièce disposant de relevés compte une fois dans la moyenne maison."
      : climateSensor === "all"
        ? "La moyenne de la pièce utilise uniquement ses capteurs disponibles."
        : "L’historique suit uniquement ce thermomètre.";
  return (
    head(
      "Climat",
      "Chaque thermomètre à sa place. Chaque pièce, son confort.",
    ) +
    `<div class="climate-room-picker" role="group" aria-label="Choisir une pièce">${[{ id: "all", name: "Toute la maison", icon: "home" }, ...areas].map((a) => `<button data-climate-area="${a.id}" class="climate-room-pill ${climateArea === a.id ? "active" : ""}" aria-pressed="${climateArea === a.id}" onclick="setClimateArea('${a.id}')">${icon(a.icon)}${a.name}</button>`).join("")}</div><div class="section-title"><h2>${climateArea === "all" ? "Vos pièces" : visible[0].name}</h2><span class="tiny">${climateArea === "all" ? demoThermometers.length + " thermomètres · " + climateAreas.length + " pièces" : "Capteurs de cette pièce"}</span></div><div class="climate-areas ${climateArea === "all" ? "" : "focused"}">${visible.map(climateAreaCard).join("")}</div><section class="climate-history" aria-labelledby="climate-history-title"><div class="climate-history-head"><div><span class="eyebrow">HISTORIQUE</span><h2 id="climate-history-title" tabindex="-1">${climateScopeLabel()}</h2><p>${explanation}</p></div><span class="climate-active-count">${active} capteur${active === 1 ? "" : "s"} disponible${active === 1 ? "" : "s"}</span></div><div class="climate-history-controls">${
      climateArea !== "all"
        ? `<label class="climate-source">Mesure affichée<select aria-label="Choisir le thermomètre pour l’historique" onchange="selectClimateSensor(this.value)"><option value="all" ${climateSensor === "all" ? "selected" : ""}>Moyenne de la pièce</option>${thermometersForArea(
            climateArea,
          )
            .map(
              (s) =>
                `<option value="${s.id}" ${climateSensor === s.id ? "selected" : ""}>${s.name}${s.status === "online" ? "" : " · Indisponible"}</option>`,
            )
            .join("")}</select></label>`
        : '<span class="tiny">Moyenne des pièces · Données simulées</span>'
    }${climatePeriodPicker()}</div><div class="kpi-grid">${kpi("thermo", "Moyenne sur " + period, formatClimate(stats.mean), climateSensor === "all" ? "Courbe moyenne de la sélection" : "Relevés du thermomètre")}${kpi("down", "Minimum", formatClimate(stats.min), "Minimum de la courbe sur " + period)}${kpi("up", "Maximum", formatClimate(stats.max), "Maximum de la courbe sur " + period)}${kpi("drop", "Humidité actuelle", formatClimate(selectedClimateReading("humidity"), " %"), "Pour la sélection affichée")}</div><div class="charts"><section class="card"><h3>Température · ${climateArea === "all" ? "Maison" : visible[0].name}</h3><p>Actuellement : ${formatClimate(selectedClimateReading("temperature"))} · ${climateSensor === "all" ? "Moyenne de la sélection" : "Capteur sélectionné"}</p>${climateChart("temperature")}</section><section class="card"><h3>Humidité · ${climateArea === "all" ? "Maison" : visible[0].name}</h3><p>Seuls les capteurs mesurant l’humidité sont pris en compte.</p>${climateChart("humidity")}</section></div></section><p class="climate-footnote">Démonstration : les capteurs sont associés à des pièces fictives. La version connectée utilisera les pièces de Home Assistant. ${areas.some((a) => a.id === "unassigned") ? "Les capteurs sans pièce restent visibles mais sont exclus de la moyenne maison. " : ""}Les capteurs indisponibles sont exclus des moyennes ; « — » signifie qu’aucune mesure n’est disponible. Les consignes ne commandent aucun chauffage réel.</p>`
  );
}

function climatePeriodPicker() {
  return `<div class="segmented" role="group" aria-label="Période de l’historique">${["24 h", "7 jours", "30 jours"].map((p) => `<button class="${p === period ? "active" : ""}" aria-pressed="${p === period}" onclick="setClimatePeriod('${p}')">${p}</button>`).join("")}</div>`;
}
function setClimatePeriod(p) {
  if (!["24 h", "7 jours", "30 jours"].includes(p)) return;
  period = p;
  render();
  document
    .querySelector(".climate-history .segmented button.active")
    ?.focus({ preventScroll: true });
}
