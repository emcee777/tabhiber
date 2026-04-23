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
    return;
  }
  for (const g of groups) host.appendChild(renderGroup(g));
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
