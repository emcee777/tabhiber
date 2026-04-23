# ext-tabhiber — SPEC

## MVP Feature List
1. **Hibernate current window** — popup button "Hibernate this window" → captures all tab URLs+titles into a named group in `chrome.storage.local`, closes the tabs.
2. **Hibernate tab group** — if a Chrome tab group exists, one-click hibernate just that group.
3. **List hibernated groups** — popup shows saved groups with timestamp, tab count, and preview of first 3 titles.
4. **Restore group** — one click reopens all tabs in a new window; option to delete-on-restore.
5. **Delete group** — explicit trash button with confirm.
6. **Export / Import JSON** — paste-in / copy-out; no network, user-controlled backup.

Out of scope for MVP: sync, encrypted export, Firefox port, keyboard shortcuts, auto-hibernate by idle time.

## Tech Stack
- **Manifest V3** (Chrome 120+). No build step. No bundler.
- **Vanilla JS** (ES2022). One `popup.js`, one `background.js` (service worker).
- **HTML+CSS** popup. System font stack.
- **Storage:** `chrome.storage.local` only. No `storage.sync` (quota too small, feels sync-y). No IndexedDB (overkill).
- **Permissions:** `tabs`, `tabGroups`, `storage`, `activeTab`.

Chosen because boring, zero dependencies, easy to audit, ships same-day.

## Architecture
```
┌────────────────────────────────────────────┐
│ popup.html  ←── user clicks toolbar icon   │
│  └─ popup.js                                │
│      ├─ reads chrome.storage.local          │
│      ├─ calls background via chrome.runtime │
│      └─ renders group list                  │
└─────────────┬──────────────────────────────┘
              │ messages
              ▼
┌────────────────────────────────────────────┐
│ background.js (service worker)              │
│  ├─ hibernateWindow(windowId)               │
│  ├─ hibernateGroup(groupId)                 │
│  ├─ restoreGroup(groupId, { deleteAfter })  │
│  ├─ deleteGroup(groupId)                    │
│  └─ exportAll() / importAll(json)           │
└─────────────┬──────────────────────────────┘
              │
              ▼
       chrome.storage.local
       key: "groups"
       value: Group[]
```

## Data Model
```ts
type Group = {
  id: string;          // uuid v4
  name: string;        // user-supplied or auto: "Window @ 2026-04-22 23:15"
  createdAt: number;   // epoch ms
  tabs: Tab[];
};
type Tab = {
  url: string;
  title: string;
  favIconUrl?: string;
};
```

## Success Criteria
- Load-unpacked in Chrome works, no manifest errors.
- Open 3 tabs, hit "Hibernate this window" → all tabs close, group appears in popup.
- Click "Restore" → all 3 tabs reopen with same URLs.
- "Delete" removes a group; reload popup; stays removed.
- Export button produces valid JSON matching schema; Import round-trips without loss.
- Unit test `tests/smoke.js` exercises the storage helpers headlessly via Node.
