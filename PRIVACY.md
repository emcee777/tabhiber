# TabHiber Privacy Policy

**Effective:** 2026-05-29
**Version:** 0.2.0

## What we collect

**Nothing.** TabHiber has no servers, no analytics, no telemetry, no error reporting endpoint, and no remote configuration. The extension never makes a network request of any kind.

## What is stored, and where

All hibernated tab groups (URL, title, optional favicon URL, timestamp, group name) are written to `chrome.storage.local` on your device. This storage is:

- Scoped to the extension on your browser profile.
- Not synced via `chrome.storage.sync` (we deliberately do not use that API).
- Cleared when you uninstall the extension or clear extension data.

You can export everything you have stored as JSON at any time via the popup's **Export** button. You can re-import via **Import**. Both are copy-paste — nothing is uploaded.

## Permissions, and why each is requested

| Permission | Why it's required |
|------------|-------------------|
| `tabs` | Read URLs and titles of open tabs to hibernate them; reopen them on restore. |
| `tabGroups` | Detect Chrome tab groups so a single group can be hibernated. |
| `storage` | Persist hibernated groups to `chrome.storage.local`. |

The extension requests **no host permissions** — it cannot inspect page contents on any site you visit.

## Third parties

There are none. The extension has zero dependencies in `package.json` beyond the Node.js test runner used in CI. No third-party scripts, fonts, or analytics are loaded by the popup.

## How to verify these claims yourself

```bash
git clone https://github.com/emcee777/tabhiber.git
cd tabhiber
grep -rE 'fetch\(|XMLHttpRequest|sendBeacon' src/   # should produce no output
grep -rE 'chrome\.storage\.(sync|managed)' src/     # should produce no output
cat manifest.json | grep -A 20 '"permissions"'      # see the four-permission list
```

If any of those checks fail in a future version, the privacy claim above is wrong — please open an issue.

## Contact

Issues and questions: <https://github.com/emcee777/tabhiber/issues>

Maintained by Matthew Chapin. MIT licensed.
