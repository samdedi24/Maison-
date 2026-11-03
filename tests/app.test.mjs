import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "./helpers/browser-harness.mjs";

const approximate = (actual, expected) => {
  assert.ok(
    Math.abs(actual - expected) < 1e-8,
    `${actual} should equal ${expected}`,
  );
};

test("all seven views render and expose the selected navigation destination", () => {
  const app = createApp();
  for (const view of [
    "maison",
    "volets",
    "climat",
    "homeview",
    "conso",
    "securite",
    "plan",
  ]) {
    app.run(`go(${JSON.stringify(view)})`);
    assert.equal(app.run("view"), view);
    assert.doesNotMatch(app.html(), /undefined|NaN/);
    assert.match(app.html(), /<h1>/);
    assert.match(
      app.element("#navigation").innerHTML,
      new RegExp(`href="#${view}"[^>]+aria-current="page"`),
    );
    assert.equal(
      (app.element("#mobile-nav").innerHTML.match(/class="mobile-link/g) ?? [])
        .length,
      6,
    );
  }
});

test("hash navigation and the Plus menu keep secondary views reachable", () => {
  const app = createApp({ hash: "#climat" });
  assert.equal(app.run("view"), "climat");
  app.changeHash("#volets");
  assert.equal(app.run("view"), "volets");
  app.run("moreMenu()");
  assert.match(app.modalHtml(), /Sécurité/);
  assert.match(app.modalHtml(), /Caméras/);
  for (const view of ["securite", "plan"]) {
    app.run(`selectMore(${JSON.stringify(view)})`);
    assert.equal(app.run("view"), view);
    assert.equal(app.element("#dialog").open, false);
    assert.match(
      app.element("#mobile-nav").innerHTML,
      /mobile-link active" aria-current="true"/,
    );
  }
});

test("device, cover, thermostat and HomeView changes survive a page reload", () => {
  const app = createApp();
  app.run(
    "toggle('table');setCover('salon',45);setTarget('Salon',22.5);reorder('weather',1)",
  );
  const changed = app.read("state");
  assert.equal(
    changed.devices.find((device) => device.id === "table").on,
    false,
  );
  assert.equal(
    changed.devices.find((device) => device.id === "salon").position,
    45,
  );
  assert.equal(changed.targets.Salon, 22.5);
  assert.equal(changed.widgets.indexOf("weather"), 2);
  const reloaded = createApp({ storageEntries: [...app.storage] });
  assert.deepEqual(reloaded.read("state"), changed);
});

test("simulated cover movement can be stopped and resumed to its requested position", () => {
  const app = createApp();
  app.run("setCover('salon',0);move('salon',100)");
  app.advanceIntervals(4);
  assert.equal(app.run("device('salon').position"), 20);
  app.run("stopMove('salon')");
  app.advanceIntervals(10);
  assert.equal(app.run("device('salon').position"), 20);
  app.run("move('salon',100)");
  app.advanceIntervals(20);
  assert.equal(app.run("device('salon').position"), 100);
  assert.equal(app.run("Object.hasOwn(movers,'salon')"), false);
});

test("scenes apply coherent lighting, shutter and alarm states", () => {
  const app = createApp();
  app.run("scene('night')");
  assert.equal(app.run("lights().every(device=>!device.on)"), true);
  assert.equal(app.run("covers().every(device=>device.position===0)"), true);
  app.run("scene('morning')");
  assert.equal(app.run("covers().every(device=>device.position===100)"), true);
  assert.equal(app.run("state.alarm"), false);
  app.run("scene('away')");
  assert.equal(app.run("lights().every(device=>!device.on)"), true);
  assert.equal(app.run("state.alarm"), true);
});

test("backup validation rejects malformed values and untrusted device metadata", () => {
  const app = createApp();
  const initial = app.read("state");
  assert.equal(app.run(`validState(${JSON.stringify(initial)})`), true);
  const candidates = [
    null,
    {},
    { ...initial, widgets: ["unknown"] },
    { ...initial, widgets: Array(6).fill("temperature") },
    { ...initial, targets: { ...initial.targets, Salon: 100 } },
    ...[
      { name: "<img src=x onerror=alert(1)>" },
      { room: "<script>malicious()</script>" },
      { type: "arbitrary" },
      { brightness: 101 },
      { color: "red; background:url(example)" },
    ].map((patch) => ({
      ...initial,
      devices: initial.devices.map((device, index) =>
        index ? device : { ...device, ...patch },
      ),
    })),
  ];
  for (const candidate of candidates) {
    assert.ok(!app.run(`validState(${JSON.stringify(candidate)})`));
  }
});

test("backup import restores valid state and leaves current state unchanged on invalid input", async () => {
  const app = createApp();
  const before = app.read("state");
  await app.importBackup("{invalid JSON");
  assert.deepEqual(app.read("state"), before);
  assert.match(app.element("#toast").textContent, /Fichier invalide/);
  assert.equal(app.element("#import-file").value, "");

  const restored = structuredClone(before);
  restored.devices[0].on = false;
  restored.targets.Salon = 23;
  await app.importBackup(JSON.stringify({ version: 1, state: restored }));
  assert.deepEqual(app.read("state"), restored);
  assert.deepEqual(JSON.parse(app.storage.get("maison-plus-demo")), restored);
  assert.match(app.element("#toast").textContent, /restaurée/);
});

test("room averages use their own thermometers and each room counts once in the house average", () => {
  const app = createApp();
  approximate(app.run("areaReading('salon')"), 22.4);
  approximate(app.run("areaReading('chambre')"), 20.8);
  approximate(app.run("houseReading()"), 21.8);
  approximate(app.run("houseReading('humidity')"), 46);

  app.run(`
    const values = { 'salon-canape':10, 'salon-bibliotheque':20, 'cuisine-plan':30,
      'chambre-chevet':50, 'chambre-fenetre':60, 'bureau-etagere':70 };
    demoThermometers.forEach(sensor=>{if(Object.hasOwn(values,sensor.id))sensor.temperature=values[sensor.id]});
  `);
  approximate(app.run("areaReading('salon')"), 15);
  approximate(app.run("houseReading()"), 42.5);
});

test("selecting a room resets an individual sensor from the previous room", () => {
  const app = createApp();
  app.run("go('climat');selectThermometer('salon-canape')");
  assert.equal(app.run("climateArea"), "salon");
  approximate(app.run("selectedClimateReading('temperature')"), 22.2);
  assert.match(app.html(), /Capteur canapé/);
  assert.doesNotMatch(app.html(), /Capteur chevet/);
  app.run("setClimateArea('chambre')");
  assert.equal(app.run("climateSensor"), "all");
  assert.deepEqual(
    app.read("selectedClimateSensors().map(sensor=>sensor.areaId)"),
    ["chambre", "chambre"],
  );
  approximate(app.run("selectedClimateReading('temperature')"), 20.8);
});

test("temperature-only and unavailable sensors produce empty metrics rather than zero readings", () => {
  const app = createApp();
  app.run("go('climat');selectThermometer('chambre-fenetre')");
  assert.equal(app.run("selectedClimateReading('humidity')"), null);
  assert.equal(app.run("selectedClimateHistory('humidity')"), null);
  assert.match(app.html(), /Aucun relevé d’humidité/);
  approximate(app.run("selectedClimateReading('temperature')"), 21);

  app.run("selectThermometer('bureau-fenetre')");
  assert.deepEqual(app.read("climateStats()"), {
    mean: null,
    min: null,
    max: null,
  });
  assert.match(app.html(), /Aucun relevé de température/);
  assert.match(app.html(), /—/);
  assert.doesNotMatch(app.html(), /NaN|undefined/);
  app.run(
    "demoThermometers.find(sensor=>sensor.id==='bureau-fenetre').temperature=50;setClimateArea('bureau')",
  );
  approximate(app.run("selectedClimateReading('temperature')"), 21.9);
});

test("history statistics and latest samples stay consistent for every supported period", () => {
  const app = createApp();
  app.run("go('climat');setClimateArea('salon')");
  for (const period of ["24 h", "7 jours", "30 jours"]) {
    app.run(`setClimatePeriod(${JSON.stringify(period)})`);
    const values = app.read("selectedClimateHistory('temperature')");
    const stats = app.read("climateStats()");
    approximate(stats.min, Math.min(...values));
    approximate(stats.max, Math.max(...values));
    approximate(
      stats.mean,
      values.reduce((sum, value) => sum + value, 0) / values.length,
    );
    approximate(values.at(-1), 22.4);
  }
  app.run("setClimateArea('all')");
  approximate(
    app.run("selectedClimateHistory('temperature').at(-1)"),
    app.run("houseReading()"),
  );
  approximate(
    app.run("selectedClimateHistory('humidity').at(-1)"),
    app.run("houseReading('humidity')"),
  );
});

test("unassigned sensors remain accessible without changing the house average", () => {
  const app = createApp();
  app.run(`demoThermometers.push({id:'unknown',areaId:null,name:'Capteur sans pièce',
    temperature:5,humidity:20,status:'online',lastSeen:Date.now()})`);
  approximate(app.run("houseReading()"), 21.8);
  assert.equal(
    app.run("availableClimateAreas().some(area=>area.id==='unassigned')"),
    true,
  );
  app.run("go('climat');selectThermometer('unknown')");
  assert.equal(app.run("climateArea"), "unassigned");
  assert.match(app.html(), /Sans pièce/);
  approximate(app.run("selectedClimateReading('temperature')"), 5);
});

test("rooms with no available temperature readings are excluded instead of counted as zero", () => {
  const app = createApp();
  app.run(
    "demoThermometers.filter(sensor=>sensor.areaId==='salon').forEach(sensor=>sensor.status='unavailable')",
  );
  assert.equal(app.run("areaReading('salon')"), null);
  approximate(app.run("houseReading()"), 21.6);
  app.run(
    "demoThermometers.forEach(sensor=>sensor.status='unavailable');go('climat')",
  );
  assert.equal(app.run("houseReading()"), null);
  assert.equal(app.run("selectedClimateHistory('temperature')"), null);
  assert.match(app.html(), /Aucun relevé de température/);
});

test("home and plan readings use the same room data as the climate view", () => {
  const app = createApp();
  app.run(
    "demoThermometers.find(sensor=>sensor.id==='salon-canape').temperature=30;go('maison')",
  );
  assert.match(app.html(), /26,3° · 45 %/);
  assert.match(app.html(), /openRoomClimate\('salon'\)/);
  app.run("go('plan')");
  assert.match(app.html(), /26,3°/);
  app.run("openRoomClimate('salon')");
  assert.equal(app.run("view"), "climat");
  assert.equal(app.run("climateArea"), "salon");
  approximate(app.run("selectedClimateReading('temperature')"), 26.3);
});

test("camera previews stay labelled as simulations and enlarged mode survives refresh and switching", () => {
  const app = createApp();
  assert.match(app.html(), /Aperçus simulés/);
  app.run("cameraGallery()");
  assert.match(app.modalHtml(), /Aucun flux connecté/);
  assert.equal(
    (app.modalHtml().match(/class="camera-preview"/g) ?? []).length,
    2,
  );
  app.run("openCamera('bedroom');enlargeCamera()");
  assert.match(app.modalHtml(), /camera-bedroom\.jpg/);
  assert.equal(
    app.element("#dialog").classList.contains("camera-expanded"),
    true,
  );
  app.run("refreshCamera('bedroom');openCamera('living')");
  assert.equal(
    app.element("#dialog").classList.contains("camera-expanded"),
    true,
  );
  assert.match(app.modalHtml(), /camera-living\.jpg/);
  assert.match(app.modalHtml(), /aria-pressed="true"/);
  assert.equal(app.run("cameraAge(demoCameras[0])"), "À l’instant");
  app.run("openDevice('table')");
  assert.equal(
    app.element("#dialog").classList.contains("camera-dialog"),
    false,
  );
  assert.equal(
    app.element("#dialog").classList.contains("camera-expanded"),
    false,
  );
});
