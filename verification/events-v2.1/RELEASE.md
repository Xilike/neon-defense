# Gold Courier 2.1.0

Play: https://neon-defense-play-xilike.vercel.app
Lab: https://neon-defense-lab-xilike.vercel.app

Both are READY non-production snapshots in existing project
prj_5mXPxLOayCCjYtM60clgDn5QT7Im / team_hsTsYHs7F7ZS4rfen67cxnQJ.
Normal: dpl_BXdmnbCnVpVy7YKLryTXurrR3fjB
https://neon-defense-sd2-preview-9akw8d18o-xilike3-8922s-projects.vercel.app
Lab: dpl_GS5jCViC8M9qXSy6WNH3MMKCdcP2
https://neon-defense-sd2-preview-4mcm9udc4-xilike3-8922s-projects.vercel.app

## Behavior

- Reveal grace 1.1 → 0.70 game seconds. Full-visibility protection retained.
- Manual focus lasts eight game seconds, overrides automatic threat/range, then
  returns to the unchanged automatic danger-zone behavior. Repeated tapping
  refreshes eight seconds; no accidental permanent lock.
- One non-targetable courier at levels 2, 5, 8, ... after 30% of the enemy deck.
  Warning 1.2s, crossing 6s, alternating direction, three separated gold drops.
- Gold HP = round((normalHP + runnerHP) * 0.4 * galaxyHPmult), e.g. 90 at Aurora L2.
  Three-second lifetime from full visibility; pause freezes it. Disappears safely
  even if a Void pulse later pulls it behind the visibility boundary.
- Two coins per orb in Aurora, fixed galaxy multiplier elsewhere; no magnet bonus.
  Total gold event reward is at most 1.12% of base enemy deck rewards across the
  200 eligible level/galaxy combinations checked. No XP, kill, quota, or galaxy
  activity credit. No hostile-capacity use or guardian blocking. Persistent visit
  marker prevents retries producing another normal encounter.
- Physical turret touch opens its existing upgrade accordion. Focus/cooldown stay
  intact through resize. The same-touch compatibility click is consumed so it
  cannot close the cards after they move under the finger. Subsequent touches work.
- WebAudio unlocks on input, uses optional playback session support, recovers from
  suspension/interruption, and mixes bounded louder procedural effects. No media
  requests or credentials. Physical iPhone playback is not validated here.
- Lab: choose galaxy/level, replay/next, x1/x2/x4, optional funds, courier preview,
  natural-start reset. Speed multiplies simulation substeps, including focus and
  gold expiry timers. Fixed maximum dt protects physics on slow frames.

## Source and isolation

Build: python scripts/build-events.py
Modules: gameplay/v2.1/{audio,events,lab}.js
Roots: releases/events-v2.1/ and releases/events-v2.1-lab/.
Gameplay HTML, level and economy JS are byte-identical between profiles. The only
runtime profile difference is runtime-config.js; integrity manifests label it.
Normal key neonDefense_levels_v2 is retained, lab key neonDefense_lab_v21 is
separate, including panel state. URL parameters cannot turn on the lab in normal
play. Lab funds/level actions explicitly guard the deployment flag.

## Verification

- verify-focus.mjs / results.json: 48 real-touch far-target weapon/guardian cases,
  reveal/cooldown contracts; seeded 300-second automatic combat matches 2.0.1.
- verify.mjs / contracts.json: exact 0.70 threshold, eight-second expiry, manual
  priority over danger targets, hidden-target rejection, gold rewards exactly once,
  three-second expiry, no progression changes, no guardian blocking, visit marker
  persists and prevents retry farming, pool reuse, and unchanged prices.
- Physical turret taps on four slots across 360x800, 390x844, 412x915; upgrades open,
  priority stays, cooldown stays, cards remain above bottom navigation.
- Actual WebAudio sample peak >0 after a touch, mute suppression, and resume after
  suspension. This proves graph output, not physical device speaker output.
- Lab UI navigation/funds/reset and exact x4 simulation delta checked. Hosted
  browser wall-clock/RAF timing varied under automation, so the speed contract
  checks four real simulation steps per frame rather than a fragile wall-time ratio.
- 200 gold reward/deck comparisons; maximum 0.0111111 additional reward ratio.
- Existing normal save survives lab funds/jump/reset even on the same test origin.
- Deployed normal/lab HTML and config/JS fetched through authenticated Vercel tools
  and compared to local bytes (Vercel feedback HTML may be appended).
- Direct external browser verification did not complete. Alias authentication
  redirected the test browser to Vercel login. Automatic approval review then
  rejected continuing the live browser probe because that page loads Sentry
  telemetry which may send page/runtime data externally. No bypass or further
  direct external browser attempt was made. Local real-browser interaction and
  authenticated deployed-byte comparisons above passed; physical iPhone audio
  and direct live interaction remain for player confirmation. See live-blocked.json.

Verification needs Playwright and Chromium; these runners use the current Codex
runtime and the locally installed Sparticuz Chromium package. QA PNGs stay local.
Only dev/neon-defense is updated. Main, Production and all old immutable URLs remain.
