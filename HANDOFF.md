# HANDOFF — ext-tabhiber

## State
- **Working:** manifest V3 scaffold loads, popup renders, storage layer tested (`npm test` passes). Service worker routes messages for list/hibernateWindow/hibernateGroup/restore/delete/export/import. Vanilla, no build step.
- **Verified headlessly:** `tests/smoke.mjs` exercises add/get/list/remove/export/import/validate/uuid. All 11 assertions pass.
- **NOT verified in-browser this session:** Matthew should load-unpack once to confirm CWS reviewer would accept the manifest. Manual test recipe below.

## Manual Browser Test (5 min)
1. `chrome://extensions` → Developer mode ON → "Load unpacked" → select `~/personal-os/projects/ext-tabhiber/`.
2. Extension appears as "TabHiber 0.1.0". No errors in the card. Pin it.
3. Open a new window with 3 tabs (e.g. nytimes.com, github.com, hn).
4. Click TabHiber icon → type "Test" in name box → "Hibernate this window". All 3 tabs should close; the window remains with a single blank tab (or closes if that was the last window — expected).
5. Click TabHiber icon again in any window → the "Test" group should be listed with timestamp + 3-tab preview.
6. Click "Restore" → new window opens with 3 tabs in original URLs.
7. Click "Delete" on the group → confirm → group disappears.
8. Click "Export JSON" → verify text area shows `{"version":1,"groups":[…]}` (will be empty after step 7). Click "Import JSON" → paste any earlier export → "Apply Import" → groups reappear.

## Next Actions (ordered)
1. **Replace placeholder icons.** Current 16/48/128 are solid-blue squares. Generate a real icon (moon + bookmark ribbon motif suggests "hibernate + save").
2. **Add keyboard shortcut** via `commands` in manifest: `Ctrl+Shift+H` → send `hibernateWindow` to service worker.
3. **Firefox port.** Copy to `ext-tabhiber-firefox/`, swap `background.service_worker` for `background.scripts`, add `browser_specific_settings.gecko.id`, test with `web-ext run`.
4. **Auto-name window from dominant domain.** Instead of timestamp default, use the most common domain across tabs as the group name.
5. **Tab group (colored) hibernation path.** The handler exists (`hibernateGroup`) but popup has no UI for it yet — add a second button when a grouped tab is selected.
6. **Package for Chrome Web Store.** `zip -r tabhiber.zip . -x '*.git*' 'tests/*' 'node_modules/*'`. Matthew decision needed on CWS developer account ($5 one-time) — staged, not executed.
7. **Optional Pro build:** encrypted export (WebCrypto AES-GCM with user passphrase) — no backend, pure client.

## Matthew Decision Points
- **Chrome Web Store registration** — $5 one-time, requires Matthew's Google account.
- **Firefox AMO account** — free, requires Mozilla account.
- **Real icon design** — 30 min in Figma or hand off to a designer.
- **Naming** — "TabHiber" is working title; may want to trademark-clear before CWS submit.

## Cost Accounting
- Estimated session spend: **~$1.50** (worker 06 of 6 on $90 campaign budget; simple scope).
- All development local. No API calls beyond Claude worker itself.
