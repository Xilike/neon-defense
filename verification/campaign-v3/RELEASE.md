# Campaign balance 3.1.0

Play: https://neon-defense-play-xilike.vercel.app
Lab: https://neon-defense-lab-xilike.vercel.app
Normal: dpl_BdmujTRfetthJqJAL7FGF1xu8dt6
https://neon-defense-sd2-preview-ovdg3kbhb-xilike3-8922s-projects.vercel.app
Lab: dpl_HEnubqA5WkJfBMo9Kr5ic6u73RTi
https://neon-defense-sd2-preview-no4uvzt1q-xilike3-8922s-projects.vercel.app
Existing preview project/team only, READY, target null; Production unchanged.

## Proven problem

The player's NOVA Lv20 screenshot shows unchanged reference Lv2 gear. This was
reproduced on v3.0.2: frozen Lv2 equipment clears Lv20 with 1145/1145 HP in 233s
(nova-v302-before.json). The earlier lab-selection ambiguity was a separate bug;
fixing it did not establish sufficient within-galaxy upgrade pressure. Earlier
positive-only tests allowed earned-money purchases but lacked these stale-build
negative controls. Their conclusion was too broad.

## Fixed authored pressure and guardian siege

All coefficients now live in the campaign authority's frozen rules object.
Actual purchases never strengthen enemies. Prices, upgrade growth/caps, expected
coins per kill/level, saves and unlocks remain unchanged.

- Wave HP pressure multiplies the prior desired HP by 1.5 outside Aurora, or 1.35
  in Singularity, before existing smoothing/monotonic floors. Aurora wave HP stays.
- Guardian desired HP outside Aurora is 2.2 times its earlier target. Monotonic
  floors are preserved. NOVA death shock falls from 19% to 7% nearby max HP, so its
  visual identity remains without giving weak weapons as much free scaled damage.
- Guardians quickly approach at .08 * fixed stage.speed and hold at depth .65.
  Their visible siege clock begins on first valid damage, or arrival if untouched.
  It uses max(18, guardianHP / reference-start single-target fleet DPS * allowance).
  Allowance: 1.05 normally, 1.8 for Cryon's repeating ice shield, and Nova
  max(.98, 1.08 - .02*(localLevel-1)). Those are fixed stage properties, not an
  actual-player power check or a compulsory specific weapon combination.
- Clock expiry announces SIEGE RUSH. The guardian advances at .22 depth/s, stops
  accepting Void pull and clears slow; movement remains visible, and final damage
  can still defeat it during the rush. Its breach defeats the attempt even if a
  supply shield is active. Coins/upgrades survive; Retry restarts the stage.
- This replaces the old weak, indefinitely respawning guardian. The automatic
  targeting zone/range, full-visibility grace .70s and manual focus 8s are intact.
  The quicker approach puts the guardian in automatic range before most of its
  clock is consumed. Manual focus remains useful rather than making AFK wins
  universal. Other enemies retain their existing movement/targeting rules.
- Defense cards now display current / target damage mastery from referenceEnd,
  or a weapon purchase target if unowned. This gives each level an earned-budget
  plan. Different builds and skill retain a modest margin; an exact purchase on
  every single level is not enforced by an arbitrary stat gate.

Expected duration estimates now include 45s guardian allowance outside Aurora,
rather than 26s. Expected coins per level remain the same; per-minute estimates
remain forecasts, not measured promises. Full tables and price examples: economy.json.

## Validation

- audit.mjs: 375 fixed stages; positive finite guardian windows; HP/speed/quota
  continuity across nine galaxy boundaries; exact affordable spending ledger;
  caps, magnet/gold budgets and legacy migration investment conservation.
- engine-results.json: 30 active-focus start/mid/end fixtures across all ten
  galaxies clear with reference starting equipment and purchases funded only by
  actual coins earned during that fixture. No unlimited funds or in-stage grants.
- gear-results.json / frozen-gear.mjs: 18 negative cases freeze Lv2 equipment at
  Lv10 and Lv20 in each of galaxies 2–10. All 18 lose. Two matched frozen builds
  (Nova20 and Singularity12) clear; three reference spacecraft-only cases lose.
  Assertions verify expected outcomes, not just whether any playthrough is solvable.
- automatic-results.json: 23/30 reference-budget fixtures clear without manual
  focus. This is diagnostic; unlike active-focus affordability checks it does not
  assert that every stage is an AFK victory. Seven cases need focus/stronger builds.
- journey-results.json: zero-coin fresh Aurora, reference-end purchase guidance,
  all 15 consecutive stages, no resets/grants. Earned 51945, 2763.4 simulated seconds,
  ending 295/295 HP, 120 actual purchases.
- nova-journey-results.json: NOVA2 reference starting gear/budget, then only actual
  earned coins following the displayed stage plan. Clears 19 consecutive stages
  (2 through 20), earns 2015613 in 4656.5s, ends 1195/1195, 61 actual purchases.
  Its initial reference budget represents prior campaign earnings, not zero-coin
  fresh play. No in-run grants, resets, unlimited wallet or auto-refill.
- nova-greedy-results.json deliberately retains a failing alternate purchasing
  policy: early cheap craft/cadence buys leave primary damage behind, losing Lv4.
  This counterexample is not hidden or relabeled as a pass. Guided affordability
  establishes a viable earned-budget route, not that every spending strategy wins.
- siege.mjs: invisible damage cannot start clock, first valid hit starts it,
  repeated hits do not reset it, no early rush, forward rush and pull resistance,
  guardian breach defeats without stage advancement/refund, clean Retry and plan UI.
- Existing contracts: saves/migration/lab profile, selection/provenance, lifecycle,
  coin caps, revealed guardian visibility, focus/range, max levels and 48 touch cases.

All simulations use deterministic seeds and accelerated real local combat, with
DOM-only card rebuilding suppressed where documented. They do not replace human
mobile feedback or cover all 375 stages with every build/seed. New targets are
calibration choices backed by both positive and negative controls, not a claim
that a single mandatory upgrade per level can be inferred from play skill alone.

## Release, saves and boundaries

Build python scripts/build-campaign.py. It reads preserved events-v2.1 HTML and
writes campaign-v3 normal/lab with one shared gameplay/model source. Only runtime
profile and integrity profile differ. v3 save keys and investments are preserved;
no wipe/migration/refund is performed for this rebalance. Lab provenance and all
its safety/selection fixes remain, with all galaxies unlocked only in lab.

Authenticated fetched HTML/campaign/profile/integrity bytes are compared to local
roots before alias assignment. All browser execution is localhost-only with
external routes blocked. Never retry the previously rejected Vercel-login probe:
its Sentry telemetry failed automatic approval review. No physical iPhone claim.
Only dev/neon-defense and non-production snapshots/aliases are changed. Main,
Production, historical immutable URLs and the unapproved UI preview stay intact.
