# New lab experiment: guardian monsters (2026-10-30)

Lab now tests releases/boss-v1-lab/, built by scripts/build-boss-preview.py.
Stage guardian artwork + fixed reference-END siege timing only. See
verification/boss-v1/RELEASE.md for math, validation and limitations.
Normal production remains the approved Families v2 + balance 3.1 snapshot below.
Do not rebuild/promote the experiment into production without user direction.

# Current game: balance 3.1.0 + supplied Families v2 visuals

Play: https://neon-defense-play-xilike.vercel.app
All-galaxies-open lab: https://neon-defense-lab-xilike.vercel.app
Production: neon-defense-independent, dpl_D4wLoSGRwhyaGvSokLA5vG6Y11ER.
The user approved publishing 3.1 and then explicitly approved the two supplied
visual painters only. Balance/gameplay snapshot remains e785c74. Current
publication/rollback evidence: verification/families-v2/publication.json.
Roots: releases/families-v2/ and releases/families-v2-lab/.
Build: python scripts/build-campaign.py then python scripts/build-families.py
Single authority: gameplay/campaign-v3/campaign.js (including frozen rules).
Evidence: verification/campaign-v3/RELEASE.md and its JSON reports.
Generator input releases/events-v2.1/index.html is preserved historical source.

## Supplied enemy artwork (presentation only)

The original families.js and health-ring.js attachments are preserved in
gameplay/presentation/families-v2/.
The new build replaces only drawEnemyBody and the old damaged-only HP bar,
introducing the supplied family helpers and segmented drawOrbHealthRing. A canvas
save/restore wrapper isolates painting state. Original type/shield/boss/target and
special gold/composite markers/painters remain. No hitbox/radius changes.

All six non-HTML config/model files match 3.1 exactly. Reversing only the two
render substitutions reconstructs the original HTML byte-for-byte. 810 read-only
paint fixtures, ten pairs of full rendered real-engine combat states (including
RNG/save/active shots/enemies), and 48 touch cases pass. No gameplay mutation or
RNG consumption is introduced. Evidence: verification/families-v2/.

## Current progression correction

The player correctly reproduced NOVA Lv20 clearing with frozen Lv2 gear. v3.0.2
lab selection fixes did not solve this genuine balance gap. v3.1 raises fixed wave
HP pressure outside Aurora (1.5, or 1.35 in Singularity before existing smoothing),
raises later guardian HP by 2.2, reduces NOVA death shock from 19% to 7% of nearby
HP, and introduces a visible, fixed-budget guardian siege cycle.

Guardians approach at .08 * stage.speed, hold at depth .65, and start their siege
clock on the first valid hit (or arrival). Time derives from fixed stage guardian
HP and reference START fleet DPS, never actual player purchases. On expiry they
telegraph a rush, advance at .22 depth/s and resist Void pull. A guardian reaching
the defense line defeats the attempt even with a supply shield; coins/upgrades
remain and Retry starts a fresh attempt. There is no infinite guardian respawn.
Cryon has an authored allowance for regenerating ice armor; Nova's initial siege
allowance eases into its standard timing over its first six levels. See rules.

Defense cards show current / target damage mastery for the stage's reference END
build. This is an affordable upgrade plan, not a forced weapon-build/stat lock.
Skill and alternate builds retain some flexibility: do not promise that every
single upgrade is mechanically mandatory on every level.

## Preserved gameplay and economy

Portrait; 375 finite stages across 15/20/25/30/35/40/45/50/55/60 levels. No forced
menu between ordinary levels. XP cosmetic. Reveal grace .70s, manual focus 8s,
existing automatic danger depth/range unchanged. Manual selection still reaches
fully revealed distant enemies and overrides auto. Physical turrets open upgrades.
Resize preserves focus/cooldowns. Gold courier: three moderate, harmless-expiring
3s spheres on eligible stages, once per saved visit guard. Audio recovery retained.

Normal HP, guardian HP, base speed and quotas never drop at galaxy boundaries.
No enemy stat depends on actual purchases, XP, wallet or performance. Damage
mastery 1–200: +5% damage, +6% price; cadence/geometry/base caps and prices unchanged.
Income tables assume 85% primary and conditional child kills plus guardian victory;
optional gold/powers excluded. Helper rewards and magnet bonus share finite caps.
Magnet once per level, bonus <=15% base level income. Prices/power damage scale.
Final guardian unlocks next galaxy without a post-clear currency softlock.
Completion CTA uses the existing status row. Background/pagehide pauses until
Resume; hidden transit also lands paused. Reset clears consumed effects/cooldowns
without refunding charges. Composite flags/reward paths are bounded and reset.

## Saves and lab

Normal neonDefense_campaign_v3 copies/migrates legacy neonDefense_levels_v2 only
once if absent, converting investment and refunding remainder; old key untouched.
Version 3.1 keeps the v3 keys and all existing progression/coins/upgrades.
Lab neonDefense_lab_v3 is isolated, with all ten real galaxy cards open.
URL queries cannot enable lab in normal play. Both builds share gameplay/data;
only runtime profile and manifest differ.

Lab setup explicitly equips AND starts the selected stage. Go keeps current gear.
Persistent lab-only provenance displays source stage, detects edits and survives
reload. Legacy unknown provenance is labeled unknown. Next crosses boundaries;
last stage stays available for explicit replay. Unlimited funds and stage presets
restore the appropriate wallet. Speed x2/x4 accelerates every simulation timer.
For meaningful human difficulty feedback use x1 and a natural or reference budget.

## Verification and limitations

375 stage math/affordability/window checks, nine monotonic boundaries and migration
conservation. Thirty active-focus real-engine sample stages clear using reference
starting gear and actual earned-money purchases. Eighteen frozen-Lv2 controls
(ten/twenty in galaxies 2–10) fail; two matched frozen fleets clear and three craft-
only controls fail. The automatic diagnostic clears 23/30 samples: AFK victory is
not guaranteed by a reference budget; manual focus/stronger builds matter.

Fresh guided Aurora clears 15 levels with zero starting coins and earned-only
purchases. Guided NOVA Lv2→20 clears 19 consecutive stages using its reference
starting budget and earned-only purchases thereafter, without resets or grants.
A retained greedy shopper counterexample loses Nova Lv4 after spending heavily on
craft/cadence, demonstrating that the plan is not interchangeable with any random
purchase policy. Focus 48-case, save/lab, lifecycle and siege contracts pass.
These are deterministic simulations, not human difficulty ratings, an exhaustive
375-level playthrough, or physical iPhone validation.

All browser execution stays on localhost with external requests blocked. Compare
deployed bytes via authenticated Vercel fetch. Never retry the blocked external
Vercel-login browser probe: automatic review rejected its Sentry telemetry.
Development stays on dev/neon-defense and preview snapshots in the existing
neon-defense-sd2-preview project. The user approved production publication of
3.1 plus the supplied presentation layer only; preserve that stable production
release during subsequent experiments.
Main and immutable old deployment URLs remain unchanged.
The unapproved UI alias stays on its old separate defense-wall candidate.
Old root HTML/APK scripts are historical: never package them as the current game.
