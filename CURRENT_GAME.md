# Current game: recovered Vercel, normal play

The user selected the Vercel deployment `5di2a47zj` as the authoritative source,
then requested balance fixes and a playable version outside SD2 debug mode.

- Original recovered snapshot: `recovered/vercel-5di2a47zj/` — do not modify.
- Current normal-play source and deploy root: `releases/balanced-v1/`.
- Reproducible HTML transformation: `python scripts/recover-balanced.py`.
- Central balance configuration and actual weapon formulas: `releases/balanced-v1/balance.js`.
- Verification evidence: `verification/balanced-v1/`.

The repository-root game and older `RECOVERY.md` / SD2 reports describe earlier,
different implementations. They are not the continuation baseline. Do not replace
the recovered game with that older root game, and do not claim old tests verify it.

Normal play has automatic firing, manual focus/lock, timed continuous spawning,
periodic guardians, paid upgrades, ten galaxies, and no automatic upgrade schedule.
All debug/profile controls, the SD2 runtime, free ultimate trials and `window.__ND`
have been removed from the deployed source. Query parameters cannot enable them.
The new save key is `neonDefense_balanced_v1`; no test save is imported or erased.
All stats/upgrade previews use the actual weapon formulas. Displayed base DPS
excludes color bonuses, area hits and crowd control; actual damage is measured
over the last ten combat seconds and excludes overkill.

Only `dev/neon-defense` is authorized. Deploy this normal-play build to a new
Preview deployment on the existing `neon-defense-sd2-preview` project, leaving
the selected old deployment, `main`, and Production unchanged. A Preview hosting
environment does not imply in-game debug mode. Do not promote to Production.

Verification covers real Chromium at three portrait phone sizes; actual engine
combat at 60 Hz with earned coins and paid purchases; the Aurora final guardian
and Ember unlock; save reload and malformed values; timed spawning without
per-frame refill; laser damage integration and weapon identity; shield overflow;
purchase affordability updates; and fixture-based smoke checks of all ten
galaxies. It is not a human playtest or a full campaign balance certification.

Next: collect feel/difficulty feedback on this exact normal-play deployment,
calibrate later galaxies and alternate builds, then package the verified source
for Android and test it on a device. Existing root Android build scripts currently
bundle the old root game; do not use them without updating that source boundary.
