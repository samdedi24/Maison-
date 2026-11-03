import { readFileSync } from "node:fs";
import vm from "node:vm";

const publicDirectory = new URL("../../public/", import.meta.url);
const sources = ["climate.js", "app.js"].map((name) => ({
  name,
  text: readFileSync(new URL(name, publicDirectory), "utf8"),
}));

function createClassList() {
  const values = new Set();
  return {
    add(...classes) {
      classes.forEach((name) => values.add(name));
    },
    remove(...classes) {
      classes.forEach((name) => values.delete(name));
    },
    contains(name) {
      return values.has(name);
    },
    toggle(name, force) {
      const enabled = force === undefined ? !values.has(name) : Boolean(force);
      if (enabled) values.add(name);
      else values.delete(name);
      return enabled;
    },
  };
}

/**
 * Minimal browser boundary for the existing plain-script application.
 * This runs actual application functions, storage and event handlers. It does
 * not parse HTML or emulate layout; responsive rendering requires browser QA.
 */
export function createApp({ storageEntries = [], hash = "" } = {}) {
  const elements = new Map();
  const storage = new Map(storageEntries);
  const intervals = new Map();
  const timeouts = new Map();
  const windowListeners = new Map();
  let nextTimer = 1;
  let document;

  class Element {
    constructor(selector) {
      this.selector = selector;
      this.innerHTML = "";
      this.textContent = "";
      this.value = "";
      this.files = [];
      this.open = false;
      this.dataset = {};
      this.classList = createClassList();
      this.attributes = new Map();
      this.listeners = new Map();
    }
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    }
    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    }
    addEventListener(name, callback) {
      const listeners = this.listeners.get(name) ?? [];
      listeners.push(callback);
      this.listeners.set(name, listeners);
    }
    emit(name, event = {}) {
      for (const callback of this.listeners.get(name) ?? []) {
        callback({ target: this, ...event });
      }
    }
    focus() {
      document.activeElement = this;
    }
    scrollIntoView(options) {
      this.lastScrollOptions = options;
    }
    showModal() {
      this.open = true;
    }
    close() {
      const wasOpen = this.open;
      this.open = false;
      if (wasOpen) this.emit("close");
    }
    click() {
      this.emit("click");
    }
    getBoundingClientRect() {
      return { top: 0, left: 0, right: 500, bottom: 500 };
    }
  }

  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, new Element(selector));
    return elements.get(selector);
  }

  document = {
    body: element("body"),
    activeElement: null,
    querySelector: element,
    querySelectorAll: () => [],
    getElementById: (id) => element(`#${id}`),
    createElement: (tag) => new Element(tag),
  };
  const location = { hash };
  const context = vm.createContext({
    document,
    location,
    window: {
      addEventListener(name, callback) {
        const listeners = windowListeners.get(name) ?? [];
        listeners.push(callback);
        windowListeners.set(name, listeners);
      },
      scrollTo() {},
    },
    localStorage: {
      getItem: (key) => storage.get(String(key)) ?? null,
      setItem: (key, value) => storage.set(String(key), String(value)),
    },
    structuredClone,
    Date,
    Blob,
    URL,
    console,
    setInterval(callback) {
      const id = nextTimer++;
      intervals.set(id, callback);
      return id;
    },
    clearInterval: (id) => intervals.delete(id),
    setTimeout(callback) {
      const id = nextTimer++;
      timeouts.set(id, callback);
      return id;
    },
    clearTimeout: (id) => timeouts.delete(id),
  });

  for (const source of sources) {
    vm.runInContext(source.text, context, {
      filename: source.name,
      timeout: 2_000,
    });
  }

  const run = (expression) =>
    vm.runInContext(expression, context, { timeout: 2_000 });
  return {
    run,
    element,
    storage,
    read: (expression) => JSON.parse(run(`JSON.stringify(${expression})`)),
    html: () => element("#main").innerHTML,
    modalHtml: () => element("#modal-content").innerHTML,
    changeHash(nextHash) {
      location.hash = nextHash;
      for (const callback of windowListeners.get("hashchange") ?? [])
        callback();
    },
    advanceIntervals(ticks = 1) {
      for (let tick = 0; tick < ticks; tick++) {
        for (const [id, callback] of [...intervals]) {
          if (intervals.has(id)) callback();
        }
      }
    },
    async importBackup(content) {
      const input = element("#import-file");
      input.value = "backup.json";
      input.files = [
        { size: Buffer.byteLength(content), text: async () => content },
      ];
      await input.onchange({ target: input });
    },
  };
}
