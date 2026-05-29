// storage.js — pure functions around chrome.storage.local
// Exposed as ES module so both background.js and tests can import it.

/** @typedef {{url:string,title:string,favIconUrl?:string}} Tab */
/** @typedef {{id:string,name:string,createdAt:number,tabs:Tab[]}} Group */

const KEY = "groups";

// Allow dependency injection so Node tests can pass a mock storage.
// In the extension, we default to chrome.storage.local.
export function makeStore(storage) {
  return {
    /** @returns {Promise<Group[]>} */
    async list() {
      const out = await storage.get(KEY);
      return Array.isArray(out[KEY]) ? out[KEY] : [];
    },

    /** @param {Group} group */
    async add(group) {
      const groups = await this.list();
      groups.unshift(group);
      await storage.set({ [KEY]: groups });
      return group;
    },

    /** @param {string} id */
    async remove(id) {
      const groups = await this.list();
      const next = groups.filter((g) => g.id !== id);
      await storage.set({ [KEY]: next });
      return groups.length !== next.length;
    },

    /** @param {string} id */
    async get(id) {
      const groups = await this.list();
      return groups.find((g) => g.id === id) ?? null;
    },

    /** @param {Group[]} groups */
    async replaceAll(groups) {
      if (!Array.isArray(groups)) throw new TypeError("expected array");
      for (const g of groups) assertValidGroup(g);
      await storage.set({ [KEY]: groups });
      return groups.length;
    },

    async exportJSON() {
      const groups = await this.list();
      return JSON.stringify({ version: 1, groups }, null, 2);
    },

    /** @param {string} json */
    async importJSON(json) {
      const parsed = JSON.parse(json);
      if (!parsed || !Array.isArray(parsed.groups)) {
        throw new Error("invalid import: missing groups[]");
      }
      return this.replaceAll(parsed.groups);
    },
  };
}

export function assertValidGroup(g) {
  if (!g || typeof g !== "object") throw new TypeError("group not object");
  if (typeof g.id !== "string" || !g.id) throw new TypeError("group.id required");
  if (typeof g.name !== "string") throw new TypeError("group.name must be string");
  if (typeof g.createdAt !== "number") throw new TypeError("group.createdAt number");
  if (!Array.isArray(g.tabs)) throw new TypeError("group.tabs array");
  for (const t of g.tabs) {
    if (typeof t.url !== "string" || typeof t.title !== "string") {
      throw new TypeError("tab.url/tab.title required strings");
    }
  }
  return true;
}

export function newGroup(name, tabs) {
  let auto = null;
  if (!name) {
    const dom = dominantDomain(tabs);
    if (dom) auto = `${dom} (${tabs.length} tab${tabs.length === 1 ? "" : "s"})`;
  }
  return {
    id: uuid(),
    name: name || auto || defaultName(),
    createdAt: Date.now(),
    tabs: tabs.map((t) => ({
      url: t.url,
      title: t.title || t.url,
      favIconUrl: t.favIconUrl,
    })),
  };
}

/**
 * Return the most-common hostname across tabs, or null if none.
 * Skips chrome://, chrome-extension://, about: URLs (internal pages).
 * Pure local computation — zero network egress.
 * @param {{url:string}[]} tabs
 * @returns {string|null}
 */
export function dominantDomain(tabs) {
  if (!Array.isArray(tabs) || tabs.length === 0) return null;
  const counts = new Map();
  for (const t of tabs) {
    if (!t || typeof t.url !== "string") continue;
    const u = t.url;
    if (u.startsWith("chrome://") || u.startsWith("chrome-extension://") || u.startsWith("about:")) {
      continue;
    }
    let host;
    try { host = new URL(u).hostname; } catch { continue; }
    if (!host) continue;
    counts.set(host, (counts.get(host) || 0) + 1);
  }
  if (counts.size === 0) return null;
  let best = null;
  let bestN = 0;
  for (const [h, n] of counts) {
    if (n > bestN) { best = h; bestN = n; }
  }
  return best;
}

export function defaultName(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `Window @ ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Minimal RFC4122-ish v4. Good enough for a local key.
export function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) s += "-";
    else if (i === 14) s += "4";
    else if (i === 19) s += hex[(Math.random() * 4) | (8)];
    else s += hex[(Math.random() * 16) | 0];
  }
  return s;
}
