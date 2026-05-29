# TabHiber

> **You can read every line of this extension.** ~390 LOC of vanilla Manifest V3 JavaScript. No accounts. No telemetry. No cloud. Hibernates tab groups into `chrome.storage.local` only.

[![test](https://github.com/emcee777/tabhiber/actions/workflows/test.yml/badge.svg)](https://github.com/emcee777/tabhiber/actions/workflows/test.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![version](https://img.shields.io/badge/version-0.2.0-green.svg)](manifest.json)

<!-- TODO(p4-screenshots): replace placeholder with real popup screenshot + animated hibernate→restore gif -->
<img src="docs/popup-placeholder.png" alt="TabHiber icon — popup screenshot pending" width="128" />

## Why this exists

Post–Great-Suspender, users want a tab manager they can audit in 5 minutes before trusting. OneTab still ships cloud-sync with opaque history. Session Buddy stalled when Chrome retired its webRequest APIs. Workona gates everything behind an account. The Great Suspender itself was sold to malware operators in 2021 — poisoning trust in the entire category.

TabHiber's wedge is simple: **the whole codebase is small enough to read end-to-end, and nothing leaves your browser.**

## Install

- **Chrome Web Store**: _pending review — link will land here after Phase 5_
- **Load unpacked** (developer mode):
  1. `git clone https://github.com/emcee777/tabhiber.git`
  2. Open `chrome://extensions`
  3. Toggle **Developer mode** (top-right)
  4. Click **Load unpacked**, select the cloned directory
  5. Pin the toolbar icon, open a few tabs, click **Hibernate this window**

## Quick demo

1. Open 3+ tabs.
2. Click the TabHiber icon → **Hibernate this window**.
3. Tabs close; a named group appears in the popup with timestamp and tab count.
4. Click **Restore** → tabs reopen in a new window with original URLs.
5. Or: `Cmd+Shift+H` / `Ctrl+Shift+H` to hibernate without opening the popup.

## Audit it

Every executable file, with current line counts:

| File | LOC | Role |
|------|-----|------|
| `src/background.js` | 96 | service worker — message router, hibernate/restore orchestration |
| `src/storage.js` | 146 | `chrome.storage.local` wrapper — the only persistence layer |
| `src/popup.js` | 149 | popup UI logic |
| `src/popup.html` | 48 | popup markup |
| `src/popup.css` | 127 | popup styles |
| `manifest.json` | 28 | MV3 manifest — declares `tabs`, `tabGroups`, `storage` only (no host permissions) |

**Verify zero network calls:**

```bash
! grep -rE 'fetch\(|XMLHttpRequest|sendBeacon|navigator\.sendBeacon' src/
```

(Exit code 0 means no matches found = no network egress in source.)

**Verify storage surface is local-only:**

```bash
grep -rE 'chrome\.storage\.(sync|managed)' src/ || echo "local-only OK"
```

## Privacy

See [PRIVACY.md](PRIVACY.md). TL;DR: nothing leaves your browser. No remote endpoints. No analytics. No optional cloud sync.

## Build / test

```bash
npm test       # ~100ms storage smoke test, zero dependencies
npm run lint   # node --check on the three .js files
```

No bundler. No transpiler. Load `manifest.json` directly via `chrome://extensions` → Developer mode → Load unpacked.

## Features (v0.2.0)

- Hibernate the current window into a named group (auto-name from dominant domain).
- Hibernate a single tab group (if you use Chrome tab groups).
- Restore a group into a new window — optional delete-on-restore.
- Delete with confirm.
- Export / import JSON via copy-paste (never uploaded).
- Preserves pinned tabs.
- Keyboard shortcut: `Cmd+Shift+H` / `Ctrl+Shift+H`.

## Not in MVP (intentionally)

- Cross-device sync — the #1 trust failure mode in this category.
- Auto-hibernate by idle time.
- Firefox port — straightforward fork once MV3 parity stabilises.

## License

MIT — see [LICENSE](LICENSE).
