# SD2 calibrated integrated build — verification 2026-10-23

## Built and tested

Source: isolated integrated SD2 Preview index from the Vercel sandbox (not GitHub main). Build: `node scripts/build-sd2-preview.mjs /path/to/integrated-preview/index.html`. Output: `dist/index.html` + `dist/sd2.js`. Build applies `scripts/patch-guardian-breach.mjs`, which fixes guardian-breach softlock, requires all 15 level budgets and 15 guardians before final completion, and adjusts SD2-only guardian speed to 0.012. SD2 experimental config now uses `baseBudget=25`, `stageDuration=125`.

**Real engine, normal automatic electric fire, 9 seeded full playthroughs** (not protected-base or boosted-weapon tests):

| Seed | New | Mid | Advanced |
|---|---|---|---|
| 1 | lost level 12 | lost level 15 | **won level 15** |
| 42 | lost level 12 | lost level 15 | **won level 15** |
| 2026 | lost level 12 | lost level 15 | **won level 15** |

All 9: no uncaught JavaScript errors; save isolation passed. The game remains in `combat` phase after `finalDefeated=true`, because final galaxy completion is a progression event rather than the global end screen. This should be checked in UX review.

Other verified gates: Vitest **20/20**; real Chromium guardian-breach regression **pass**; separate artificially boosted lifecycle run **15/15 guardians defeated**, `finalDefeated=true`, zero errors. Earlier mobile Playwright smoke **1/1 pass**.

## Important limitations

- Only three deterministic seeds and one continuous auto-fire strategy; no manual target selection, real-time device performance or human gameplay.
- The integrated preview HTML is packaged in the Vercel sandbox, **not checked in to GitHub**. The GitHub dev branch has the build script, patch, experimental SD2 config and tests; its `index.html` is still an older non-integrated game source. Do not deploy GitHub dev as if it were the tested integrated build.
- **No new public Vercel preview deployment was made.** The existing public Preview URL points to a different, older build. Production V45 and GitHub main remain unchanged.
- The current calibrated model gives new and mid zero wins across these three seeds; balancing goals require more seeds and human playtesting before release.

## Next step

Publish the exact verified `dist/` from the isolated sandbox to a separate preview project, with its source artifact archived, then test real mobile UX and manually approve promotion to production. Never overwrite production as a shortcut.
