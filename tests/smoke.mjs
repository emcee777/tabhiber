// Smoke test for storage.js. Run with: node tests/smoke.mjs
// Simulates chrome.storage.local with an in-memory Map.

import assert from "node:assert/strict";
import { makeStore, newGroup, assertValidGroup, uuid } from "../src/storage.js";

function memStorage() {
  const mem = new Map();
  return {
    async get(key) {
      if (Array.isArray(key)) {
        const out = {};
        for (const k of key) if (mem.has(k)) out[k] = mem.get(k);
        return out;
      }
      return mem.has(key) ? { [key]: mem.get(key) } : {};
    },
    async set(obj) {
      for (const [k, v] of Object.entries(obj)) mem.set(k, v);
    },
    async remove(k) { mem.delete(k); },
    _mem: mem,
  };
}

async function run() {
  const storage = memStorage();
  const store = makeStore(storage);

  // empty list
  assert.deepEqual(await store.list(), []);

  // add
  const g1 = newGroup("Matter: Acme v. Beta", [
    { url: "https://example.com", title: "Example" },
    { url: "https://example.org", title: "Org" },
  ]);
  await store.add(g1);
  const l = await store.list();
  assert.equal(l.length, 1);
  assert.equal(l[0].id, g1.id);
  assert.equal(l[0].tabs.length, 2);

  // get
  const got = await store.get(g1.id);
  assert.equal(got.name, "Matter: Acme v. Beta");

  // export / import roundtrip
  const json = await store.exportJSON();
  const parsed = JSON.parse(json);
  assert.equal(parsed.version, 1);
  assert.equal(parsed.groups.length, 1);

  // wipe and reimport
  await store.replaceAll([]);
  assert.deepEqual(await store.list(), []);
  const n = await store.importJSON(json);
  assert.equal(n, 1);
  assert.equal((await store.list()).length, 1);

  // remove
  assert.equal(await store.remove(g1.id), true);
  assert.equal(await store.remove(g1.id), false);
  assert.deepEqual(await store.list(), []);

  // validation
  assert.throws(() => assertValidGroup({}));
  assert.throws(() => assertValidGroup({ id: "", name: "", createdAt: 0, tabs: [] }));
  assert.ok(assertValidGroup(newGroup("t", [{ url: "u", title: "t" }])));

  // uuid sanity
  const u = uuid();
  assert.ok(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u), `bad uuid: ${u}`);

  // invalid import rejects
  await assert.rejects(() => store.importJSON("not json"));
  await assert.rejects(() => store.importJSON(JSON.stringify({ groups: "nope" })));

  console.log("smoke.mjs: OK — all assertions passed");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
