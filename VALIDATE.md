# ext-tabhiber — Validation

## Problem
Users accumulate dozens of tabs across long research sessions, kill their RAM, and then either lose the session (close all, regret) or leave them open forever (Chrome balloons to 8 GB). Existing solutions (OneTab, Session Buddy, Workona) either require an account, have tracking-adjacent privacy histories, or target power-users with heavyweight workspace UIs. No modern, **local-only, zero-telemetry, zero-account** MV3 extension that hibernates inactive tab groups with a one-click restore.

## Target User
- "Jenna, 34, legal associate + casual researcher" — opens 30 tabs per matter, needs to preserve them by matter name, restore exactly. Doesn't trust any extension that asks her to sign in. Uses Chrome + Arc.
- "Sam, 28, indie dev" — switches context 3x per day. Wants Cmd-Shift-H to "hibernate this window" and never think about it again.

## Market Check
| Tool | Installs | Gap |
|------|----------|-----|
| OneTab | 2M+ | Cloud-sync optional but history opaque; aging UI |
| Session Buddy | 500K+ | Chrome removed its webRequest APIs; stalled |
| Workona | 200K+ | Account-gated; workspace framing overkill |
| Tab Session Manager | 300K+ | Firefox-first, MV2 relics |
| The Great Suspender | KILLED (malware) | Poisoned trust in category |

**Wedge:** Post-Great-Suspender, users want an extension they can audit in 5 minutes. MV3 + ~300 LOC + everything in `chrome.storage.local` = auditable. Name the value prop "**You can read every line of this extension.**"

## Duplication Check
- Portfolio-manifest grep: no browser extension projects, no tab manager.
- No slug collision in `~/personal-os/projects/`.
- Not on KILL list.

## Revenue / Strategic Path
- **Path A (primary):** Free + open-source. Chrome Web Store. $0 direct. Strategic: funnel to a "Matthew's Lab" developer brand; builds trust for paid tools downstream.
- **Path B (optional):** One-time $5 "Pro" build in CWS with cross-device encrypted export (user supplies own storage URL — no backend).
- **Path C:** Licensable codebase — sell as a white-label base for other indie devs.

Realistic: $0-500/year direct; strategic value as a trust artifact > direct revenue.

## MVP Scope Assertion
A working MVP in under 500 LOC is plausible because MV3 `chrome.tabs`, `chrome.tabGroups`, and `chrome.storage.local` APIs handle 90% of the work. Popup UI is a single HTML file with vanilla JS. No framework. No build step.

## Kill Test
- Would kill if CWS policy blocked this category entirely. It does not (Tab Session Manager published 2025).
- Would kill if no audit-trust wedge existed. The Great Suspender incident + Workona's account-gate create a clear wedge.
- **Verdict:** BUILD.
