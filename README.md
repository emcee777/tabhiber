# TabHiber

**Hibernate tab groups locally. Zero telemetry. Zero account. Auditable in one sitting.**

Post-Great-Suspender, users want a tab manager they can read end-to-end before trusting. TabHiber is ~450 LOC of vanilla Manifest V3 — one popup, one service worker, `chrome.storage.local`. No cloud sync. No ads. No keys to leak.

## Load unpacked (demo)

```
1. git clone <this repo>
2. Open chrome://extensions
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `ext-tabhiber/` directory
5. Pin the extension, click the icon, hit "Hibernate this window"
```

## Run tests

```
npm test
```

Runs a headless smoke test (`tests/smoke.mjs`) against the storage layer using an in-memory `chrome.storage` mock. No browser required.

## Features (MVP)

- Hibernate the current window into a named group.
- Restore a group into a new window (optionally deleting on restore).
- Delete with confirm.
- Export / import JSON (copy-paste, no upload).
- Preserves pinned tabs (does not close them).

## Not in MVP

- Cross-device sync (intentionally — cloud sync is the #1 trust issue for this category).
- Auto-hibernate by idle time.
- Keyboard shortcut binding.
- Firefox port (manifest V3 parity arrived late 2024 — straightforward fork next).

## License

MIT © 2026 Matthew Chapin
