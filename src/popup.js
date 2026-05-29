// popup.js — UI glue.
const $ = (sel) => document.querySelector(sel);

const send = (msg) =>
  new Promise((resolve) =>
    chrome.runtime.sendMessage(msg, (r) => resolve(r ?? { ok: false, error: "no response" })),
  );

async function refresh() {
  const res = await send({ type: "list" });
  const host = $("#groups");
  host.innerHTML = "";
  const groups = (res.ok && res.groups) || [];
  if (!groups.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No hibernated groups yet.";
    host.appendChild(p);
  } else {
    for (const g of groups) host.appendChild(renderGroup(g));
  }
  await refreshTabGroups();
}

// Color names Chrome exposes via tabGroups.TabGroupColor.
// Used as a fallback label when a tab group has no title.
const COLOR_LABEL = {
  grey: "Grey group", blue: "Blue group", red: "Red group",
  yellow: "Yellow group", green: "Green group", pink: "Pink group",
  purple: "Purple group", cyan: "Cyan group", orange: "Orange group",
};

async function refreshTabGroups() {
  const section = $("#tab-groups");
  const list = $("#tab-groups-list");
  list.innerHTML = "";
  if (!chrome.tabGroups || typeof chrome.tabGroups.query !== "function") {
    section.hidden = true;
    return;
  }
  let groups;
  try {
    const win = await chrome.windows.getCurrent();
    groups = await chrome.tabGroups.query({ windowId: win.id });
  } catch {
    section.hidden = true;
    return;
  }
  if (!groups || !groups.length) {
    section.hidden = true;
    return;
  }
  for (const g of groups) {
    const btn = document.createElement("button");
    const label = (g.title && g.title.trim()) || COLOR_LABEL[g.color] || "Tab group";
    btn.textContent = `Hibernate: ${label}`;
    btn.title = label;
    btn.addEventListener("click", async () => {
      const r = await send({ type: "hibernateGroup", tabGroupId: g.id, name: g.title || "" });
      if (!r.ok) alert("Hibernate group failed: " + r.error);
      else refresh();
    });
    list.appendChild(btn);
  }
  section.hidden = false;
}

function renderGroup(g) {
  const el = document.createElement("div");
  el.className = "group";
  const when = new Date(g.createdAt).toLocaleString();
  const previews = g.tabs.slice(0, 3).map((t) => `<li title="${escape(t.url)}">${escape(t.title || t.url)}</li>`).join("");
  const more = g.tabs.length > 3 ? `<li>…and ${g.tabs.length - 3} more</li>` : "";
  el.innerHTML = `
    <div class="row">
      <span class="name"></span>
      <span class="meta">${g.tabs.length} tabs · ${when}</span>
    </div>
    <ul>${previews}${more}</ul>
    <div class="btns">
      <button data-act="restore">Restore</button>
      <button data-act="restore-delete">Restore &amp; delete</button>
      <button data-act="delete" class="danger">Delete</button>
    </div>
  `;
  el.querySelector(".name").textContent = g.name;
  el.querySelector('[data-act="restore"]').addEventListener("click", async () => {
    await send({ type: "restore", id: g.id, deleteAfter: false });
    window.close();
  });
  el.querySelector('[data-act="restore-delete"]').addEventListener("click", async () => {
    await send({ type: "restore", id: g.id, deleteAfter: true });
    window.close();
  });
  el.querySelector('[data-act="delete"]').addEventListener("click", async () => {
    if (!confirm(`Delete "${g.name}"? This cannot be undone.`)) return;
    await send({ type: "delete", id: g.id });
    refresh();
  });
  return el;
}

function escape(s) {
  return String(s).replace(/[<>&"']/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

$("#btn-hibernate-window").addEventListener("click", async () => {
  const name = $("#group-name").value.trim();
  const res = await send({ type: "hibernateWindow", name });
  if (!res.ok) alert("Hibernate failed: " + res.error);
  else {
    $("#group-name").value = "";
    refresh();
  }
});

$("#btn-export").addEventListener("click", async () => {
  const r = await send({ type: "export" });
  if (!r.ok) return alert("Export failed: " + r.error);
  $("#io-title").textContent = "Export";
  $("#io-text").value = r.json;
  $("#io-apply").style.display = "none";
  $("#io-dialog").showModal();
});

$("#btn-import").addEventListener("click", () => {
  $("#io-title").textContent = "Import";
  $("#io-text").value = "";
  $("#io-apply").style.display = "";
  $("#io-dialog").showModal();
});

$("#io-copy").addEventListener("click", () => {
  $("#io-text").select();
  document.execCommand("copy");
});

$("#io-apply").addEventListener("click", async () => {
  const r = await send({ type: "import", json: $("#io-text").value });
  if (!r.ok) alert("Import failed: " + r.error);
  else {
    $("#io-dialog").close();
    refresh();
  }
});

refresh();
