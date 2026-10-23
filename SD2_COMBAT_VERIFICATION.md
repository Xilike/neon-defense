# SD2 combat verification — 2026-10-23

Branch: `dev/neon-defense`. No production or `main` changes.

## Automated results

- Vitest: **20/20 passed** (including 15-level seeded spawn budgets and controlled combat).
- Chromium mobile smoke: **1/1 passed**.
- Separate local Chromium launch of the existing SD2 Preview files with `?sd2debug=mid&schedule=1`: `active=true`, `level=1`, `scheduleN=0`, save isolation passed, no uncaught JS errors. This launch check is **not** a full playthrough.

## Controlled combat model

`tests/sd2-combat-model.test.js` drives the actual SD2 scheduler with seeded randomness, source-derived enemy HP, speed and breach damage, and the dev-branch electric damage/rate formula. It approximates one electric turret with immediate focus-fire damage. It does **not** implement projectile travel, range, slow, shield mechanics, color match, splitting, bosses, multiple turrets, upgrades purchased mid-stage, or adaptive scaling. It also continues independent stage calculations after a stage would have been lost.

For seed 42 and `mid`, this deliberately limited model predicts 22 breaches at level 1 and 33 at level 15; every stage shows negative ending HP under the model. **Do not use these numbers as actual gameplay outcomes or as a basis for tuning.** The mismatch with earlier browser gameplay is evidence that the simplified model omits important mechanics.

## Source divergence that must be resolved

- GitHub `dev/neon-defense/index.html` inherits the `main` version: electric base damage **14**, upgrades multiply damage and rate by `BAL.effectGrowth = 1.10`.
- Existing isolated SD2 Preview `index.html` has electric base damage **18**, damage upgrade multiplier **1.12** and rate multiplier **1.08** (rate capped at 20).
- `experimental/sd2.js` in the development branch contains the gradual mid schedule and remains **unintegrated** with the development-branch `index.html`.
- Keep both variants separate until an explicit gameplay baseline is chosen and validated. Never silently transplant the Preview into `main`.

## Next engineering gate

Add a genuine automated gameplay run against an isolated Preview with a scripted player and export SD2 per-stage JSON, then compare observed breach and defeat counts across profiles and seeds. The current browser launch check proves initialization only, not 15-stage survival or difficulty balance.
