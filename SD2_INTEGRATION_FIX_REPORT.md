# SD2 integration fixes and verified gates — 2026-10-23

**Development branch only:** `dev/neon-defense`. No changes to `main` or Production V45.

## Critical bugs found and corrected in isolated runtime

1. **Guardian breach softlock.** With ordinary HP, a guardian could cross the defense line while the base survived. The guardian was removed, but no guardian defeat callback fired; the game could remain stuck at the same level indefinitely. Fix: a guardian breach now ends the attempt with `guardianBreached`, displays `GUARDIAN BREACHED`, and records the distinct defeat reason. Repro verified in real Chromium engine: game phase `over`, HP 940 (not zero), correct UI title and report, no JS errors.
2. **Level 15 was skipped.** The original Preview used `isFinal = cleared >= goal-1`, so level 14's guardian ended the galaxy without running level 15's budget. Fix: final guardian spawns **after** level 15's budget (`cleared >= goal`), and `stageGoal` clamps to 15. Verified in real Chromium engine: 15 levels, 15 guardians spawned and defeated, `finalDefeated=true`, save isolation passed. This lifecycle test uses artificially high electric damage/range/rate, low spawn budget and a protected base; it is **not** a normal survival win.

Patch: `scripts/patch-guardian-breach.mjs` applied to an isolated copy of the SD2 Preview `index.html`; repeatable regression: `e2e/guardian-breach-regression.mjs`; full progression: `e2e/sd2-guardian-progression.mjs`.

## Balance status

Normal 35/110 auto-fire runs (3 profiles × 3 seeds) previously reached levels 8–15; none proved an ordinary final-boss victory. A separate **unapproved** 25/125 experiment often reached levels 14–15, but revealed the guardian breach softlock; **25/125 was not promoted to the dev config**. Retain experimental config `baseBudget=35`, `stageDuration=110` until realistic survival outcomes and human playtesting establish a target.

## Tests

- Vitest: 20/20 passed
- Playwright mobile smoke: 1/1 passed
- Guardian-breach regression in real Chromium: passed
- 15-stage/15-guardian lifecycle in real Chromium: passed

## Source/deployment boundary

The integration patch and regression tests are committed to the development branch. The large integrated Preview `index.html` is currently held in the isolated sandbox, **not yet committed as a full replacement for the existing GitHub dev `index.html`**. Therefore, do not claim that GitHub dev or any public Preview URL already contains the runtime fixes. The patch applies only to a source copy that already includes `SD2.bind`. No new public deployment was performed.

**Next release gate:** package the patched integrated runtime as a reviewable dev artifact, check ordinary mobile gameplay and actual level-15 survival, then deploy to a distinct preview project; require explicit approval before production promotion.
