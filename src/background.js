// background.js — service worker. Routes messages from popup.
import { makeStore, newGroup } from "./storage.js";

const store = makeStore(chrome.storage.local);

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handle(msg).then(sendResponse).catch((err) => {
    console.error("[tabhiber] error", err);
    sendResponse({ ok: false, error: String(err && err.message || err) });
  });
  return true; // async
});

async function handle(msg) {
  switch (msg?.type) {
    case "list":
      return { ok: true, groups: await store.list() };

    case "hibernateWindow": {
      const name = msg.name;
      const windowId = msg.windowId ?? (await getCurrentWindowId());
      const tabs = await chrome.tabs.query({ windowId });
      const snap = tabs
        .filter((t) => t.url && !t.url.startsWith("chrome://newtab"))
        .map((t) => ({ url: t.url, title: t.title, favIconUrl: t.favIconUrl }));
      if (snap.length === 0) {
        return { ok: false, error: "No tabs to hibernate." };
      }
      const group = newGroup(name, snap);
      await store.add(group);
      // Close the tabs we captured. Leave any pinned tab alone.
      const toClose = tabs
        .filter((t) => !t.pinned && t.url && !t.url.startsWith("chrome://newtab"))
        .map((t) => t.id);
      if (toClose.length) await chrome.tabs.remove(toClose);
      return { ok: true, group };
    }

    case "hibernateGroup": {
      const { tabGroupId, name } = msg;
      const tabs = await chrome.tabs.query({ groupId: tabGroupId });
      if (!tabs.length) return { ok: false, error: "Empty group." };
      const snap = tabs.map((t) => ({
        url: t.url,
        title: t.title,
        favIconUrl: t.favIconUrl,
      }));
      const group = newGroup(name, snap);
      await store.add(group);
      await chrome.tabs.remove(tabs.map((t) => t.id));
      return { ok: true, group };
    }

    case "restore": {
      const { id, deleteAfter } = msg;
      const group = await store.get(id);
      if (!group) return { ok: false, error: "not found" };
      const win = await chrome.windows.create({ url: group.tabs[0]?.url });
      for (let i = 1; i < group.tabs.length; i++) {
        await chrome.tabs.create({ windowId: win.id, url: group.tabs[i].url });
      }
      if (deleteAfter) await store.remove(id);
      return { ok: true };
    }

    case "delete":
      return { ok: await store.remove(msg.id) };

    case "export":
      return { ok: true, json: await store.exportJSON() };

    case "import":
      return { ok: true, count: await store.importJSON(msg.json) };

    default:
      return { ok: false, error: `unknown type: ${msg?.type}` };
  }
}

async function getCurrentWindowId() {
  const w = await chrome.windows.getCurrent();
  return w.id;
}
