# SD2 end-to-end engine verification — 2026-10-23

Scope: isolated Vercel sandbox, existing SD2 Preview files, virtual 50 ms frames through the **actual** game update functions. No changes to GitHub `main` or Production.

## Nine seeded combat runs — calibrated 35/110

The runner is `e2e/sd2-engine-runner.mjs`. It overrides `Math.random` before the page loads, uses seeds 1, 42 and 2026 for each of `new`, `mid`, `adv`, and runs the actual game update pipeline (Director, enemies, turrets, projectiles, effects). One electric turret is auto-fired continuously, with no manual target selection. Each result is one run, not a statistical confidence interval.

| Seed | New reached | Mid reached | Adv reached |
|---|---:|---:|---:|
| 1 | 8 | 9 | 11 |
| 42 | 9 | 9 | 15 |
| 2026 | 8 | 8 | 14 |

All nine runs preserved save isolation and had zero uncaught page errors. `reached 15` does **not** imply the final guardian was defeated: the normal seeded runner stops at reaching level 15.

## Guardian progression end-to-end

`e2e/sd2-guardian-progression.mjs` tests the actual game update pipeline, but uses an **artificially protected base** (100,000 HP refreshed each frame) and extremely low budget and spawn interval (1/1). This is strictly an integration test of guardian lifecycle, not a realistic combat difficulty test.

Observed: 14 guardians spawned, 14 defeated, level 15 reached, `finalDefeated=true`, zero JS page errors, save isolation passed. The final guardian is the level-14 guardian which unlocks/completes level 15, consistent with the current code's `isFinal=cleared>=goal-1` logic.

## Decision

Experimental SD2 settings: `baseBudget=35`, `stageDuration=110`. Tests: Vitest 20/20, Playwright browser smoke 1/1. **Do not claim these values are production-approved**: three seeds, a single automatic weapon strategy, no human gameplay or mobile performance sample, and the Preview gameplay source differs from GitHub dev branch. The runner explicitly points to a localhost-served isolated Preview, and rejects production URLs.

Remaining work: unify the actual preview runtime source with the dev branch, run mobile performance and human playtests, test final guardian in normal survival conditions, and decide target win/loss distribution before any production change.
