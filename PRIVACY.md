# TabHiber Privacy Policy

**Effective:** 2026-05-29
**Version:** 0.2.0

## TL;DR

TabHiber does not collect, transmit, sell, or share any data. Everything stays
in your browser's local storage. There are no servers, no telemetry, no
analytics, no third-party SDKs. You can verify this by reading the source:
<https://github.com/emcee777/tabhiber>.

## What we collect

**Nothing.** TabHiber has no servers, no analytics, no telemetry, no error
reporting endpoint, and no remote configuration. The extension never makes a
network request of any kind.

## What is stored, and where

All hibernated tab groups are written to `chrome.storage.local` on your device.
The stored fields are:

- Group name (text you typed, or an auto-generated label such as
  `"Window @ 2026-04-22 23:15"` or a dominant-domain label).
- For each tab in the group: URL, title, and optional favicon URL.
- A creation timestamp.

This storage is:

- Scoped to the extension on your browser profile.
- **Not** synced via `chrome.storage.sync` (we deliberately do not use that API).
- Cleared when you uninstall the extension or clear extension data.

You can export everything you have stored as JSON at any time via the popup's
**Export** button. You can re-import via **Import**. Both are copy-paste —
nothing is uploaded.

## Permissions, and why each is requested

| Permission   | Why it's required                                                                                |
|--------------|--------------------------------------------------------------------------------------------------|
| `tabs`       | Read URLs and titles of open tabs to hibernate them; reopen them on restore.                     |
| `tabGroups`  | Detect Chrome tab groups so a single group can be hibernated with one click.                     |
| `storage`    | Persist hibernated groups to `chrome.storage.local`.                                             |

The extension requests **no host permissions** — it cannot inspect the contents
of any page you visit.

### Permissions we removed

In v0.2.0 we removed `activeTab`. After review, TabHiber's source only calls
`chrome.tabs.query`, `chrome.windows.getCurrent/create`, and
`chrome.tabGroups.query` — all of which are satisfied by the `tabs` permission.
We do not inject scripts, read page content, or use clipboard APIs, so
`activeTab` was redundant and has been dropped from the manifest.

## What we do NOT do

- We do not contact any remote server. There is no TabHiber backend.
- We do not bundle analytics, error tracking, or telemetry libraries.
- We do not read tab content. We only read URL, title, and favicon URL — i.e.,
  the same fields a bookmark stores.
- We do not have cloud sync. If you want cross-device backup, use the Export
  button to copy JSON and the Import button to paste it on the other device.
- We do not collect an email address or any account identifier. There is no
  signup, no login.

## Third parties

There are none. The extension has zero runtime dependencies. No third-party
scripts, fonts, or analytics are loaded by the popup.

## How to verify these claims yourself

```bash
git clone https://github.com/emcee777/tabhiber.git
cd tabhiber
grep -rE 'fetch\(|XMLHttpRequest|sendBeacon' src/   # should produce no output
grep -rE 'chrome\.storage\.(sync|managed)' src/     # should produce no output
cat manifest.json | grep -A 20 '"permissions"'      # see the three-permission list
```

If any of those checks fail in a future version, the privacy claim above is
wrong — please open an issue.

## Where the data goes if you uninstall

It is removed from your browser entirely. There is nothing on any TabHiber
server because there is no TabHiber server. If you used Export to save a JSON
backup somewhere, that file is yours and unaffected by uninstall.

## Source code

TabHiber is open source under MIT. The full source is auditable in one sitting
(~450 LOC of vanilla JavaScript):

- Repository: <https://github.com/emcee777/tabhiber>
- License: <https://github.com/emcee777/tabhiber/blob/main/LICENSE>

## Contact

Open an issue at <https://github.com/emcee777/tabhiber/issues>. There is no
email collection.

## Changes to this policy

Any change is recorded as a commit to this file in the repository above and a
corresponding `version` bump in `manifest.json`.

Maintained by Matthew Chapin. MIT licensed.
