# Current game: campaign balance v3.0.2

Play: https://neon-defense-play-xilike.vercel.app
All-galaxies-open lab: https://neon-defense-lab-xilike.vercel.app

Current deploy roots: releases/campaign-v3/ and releases/campaign-v3-lab/.
Build both: python scripts/build-campaign.py
Canonical balance and campaign source: gameplay/campaign-v3/campaign.js
Evidence: verification/campaign-v3/RELEASE.md and its JSON reports.
The generator reads the preserved releases/events-v2.1/ HTML; do not delete it.
The recovered original and earlier releases remain immutable historical inputs.

## Lab selection/provenance fix (3.0.2)

The setup button now starts the selected galaxy/local level and installs that
stage's exact reference weapons AND spacecraft in one synchronous action. Formerly
it ignored the selectors until Go was pressed and used the active galaxy instead.
The button names its selected target. The separate Go button explicitly retains
gear. Lab equipment source is saved, displayed beside actual current stage, and
marked modified after upgrades; the collapsed summary also shows its source.
Old lab saves without provenance say unknown/saved rather than inventing a source.
Normal gameplay coefficients, upgrade costs and saves are unchanged.

Frozen-gear combat checks, with no shops/grants, confirm galaxy-3/4 end gear fails
in galaxy 8. Three reference spacecraft-only cases also fail. In the G10 Lv12
fixture using G10-start gear (matching the screenshot's visible weapon levels),
the craft contributes 1.78% of recorded HP damage, excluding shield absorption.
This is not evidence that every spacecraft build is balanced: the screenshot did
not show craft upgrades and cannot reconstruct the player's click history.
See lab-selection.mjs/results and frozen-gear.mjs/gear-results.json.

## Lifecycle completion patch (3.0.1)

Final-guardian victory exposes a continuation button in the existing status row,
without changing battlefield geometry or forcing an inter-level menu. Normal
progress gates still apply; the final galaxy has a terminal completion indicator.
Backgrounding/pagehide pauses combat and requires explicit Resume; hidden galaxy
transit also lands paused. Field resets clear consumed skill effects and combat
cooldowns without refunding charges. Composite-part rewards share the magnet and
helper allowance, and pooled composite objects clear stale guardian flags.
Lab Next crosses galaxy boundaries, its level maximum follows the selector, and
disabling unlimited funds after a stage preset restores that preset wallet.
Evidence: verification/campaign-v3/lifecycle.mjs and lifecycle-results.json.

## Approved combat rules retained

Portrait; continuous authored levels, no forced inter-level menu. A finite enemy
deck followed by its guardian completes each level. XP is cosmetic and separate.
Fully visible enemies have a 0.70-second reveal grace. Manual focus lasts eight
game seconds, reaches revealed distant targets, and overrides automatic targeting.
Automatic targeting retains its existing depth/range zone. Visibility protection
also applies to damage. Physical turret touches open the existing upgrade panel.
Gold courier encounters, touch compatibility-click protection and audio recovery
from v2.1 are retained. No unapproved UI redesign is merged into these roots.

## One continuous 375-level campaign

The ten galaxies contain 15/20/25/30/35/40/45/50/55/60 levels. Tables use a global
campaign index, so normal HP, guardian HP, movement speed and spawn quotas never
reset downward when crossing a galaxy boundary. The fixed per-galaxy compositions
and existing galaxy behavior hooks remain distinct. No enemy stat reads the
player's actual purchases, XP, wallet or performance.

A deterministic reference spending path, using expected kill income, generates
fixed stage tables once. This is an offline-style design model, not runtime
adaptive difficulty. Actual weapon base stats and the model share one authority.
Damage mastery reaches weapon level 200 (199 upgrades at +5% damage each), with
6% damage-price growth. Cadence caps at 40 upgrades and geometry at 20; their
separate formulas prevent runaway projectiles, beams or pulse radius. The weapon
card level now reflects damage mastery; utility cards retain separate levels.
Spacecraft damage also supports 199 upgrades; its rate cap is 24.

Income forecasts assume 85% of primary enemies killed, 85% of splitter children
conditional on their parent, and a defeated guardian. Optional supplies, gold and
consumable boosts are excluded. All income/minute estimates assume spawn tier x1.
Scripted helper rewards are bounded per level. Gold remains below 2% of baseline
level rewards. Magnet may activate once per level; its activation bonus budget is
capped at 15% of baseline full-kill level income. Skill damage and coin prices scale
with the stage, avoiding useless late-game damage or nearly-free late-game boosts.

The guardian now resists gravity pull and slow; a revealed enemy cannot be pulled
behind its full-visibility boundary by Void. This fixes the former invisible,
permanently suspended guardian loop. The regular automatic danger zone is intact.
Completing the previous galaxy's final guardian unlocks the next in normal play;
there is no post-clear currency gate that could leave a completed galaxy stuck.

## Saves and lab

Normal key: neonDefense_campaign_v3. On first use, an existing
neonDefense_levels_v2 save is copied and migrated; the original key is untouched.
Weapon upgrade investment is converted using old vs new cumulative coin costs,
with unspent conversion remainder returned to available coins. Current galaxy,
combat progress, ownership, name, settings and lifetime total are retained.
Craft damage/rate investments are converted; other craft utility levels remain.
Migration is one-time and never repeats its remainder refund after reload.

Lab key: neonDefense_lab_v3. All ten galaxies are unlocked in the actual GALAXY
cards as well as the lab selector. Use TEST LAB to choose galaxy/level, replay/next,
x1/x2/x4, optional funds, a natural reset and courier preview. The explicit
"تجهيز مناسب لليفل" button applies the expected earned-budget starting loadout
for that level. It does not affect normal saves. Normal query parameters cannot
enable lab tools. HTML/gameplay data are identical across profiles; only the
runtime profile flag and integrity profile differ.

## Verification and scope

375 mathematical stage checks; nine monotonic galaxy boundaries; exact reference
spending ledger; caps; value-conserving migration. Sixty full real-engine sample
stages cover start/middle/end of all ten galaxies in automatic and active-focus
modes, using affordable starting gear and actual earned-money purchases. A fresh
continuous Aurora run clears all 15 stages with no starting coins or grants;
separate no-upgrade controls fail levels 4 and 8. Forty-eight real-touch targeting
cases and save/lab/utility contracts pass. These are automated simulations, not
human enjoyment ratings or exhaustive 375-level playthroughs.

All browser execution is local and external requests are blocked. Deployed bytes
are authenticated-fetch compared to the tested source. Do not retry the formerly
blocked external Vercel-login browser probe: automatic approval review rejected
its external Sentry telemetry. Physical iPhone checks remain with the player.

Only dev/neon-defense and non-production snapshots in the existing
neon-defense-sd2-preview Vercel project are authorized. Preserve main, Production
and immutable old deployment URLs. The old root index.html/Android packaging
scripts are not the current game source; do not build APK from them as-is.

## UI candidate kept separate

https://neon-defense-ui-xilike.vercel.app remains the unapproved v2.1 defense-wall
candidate, built from releases/ui-defense-preview/ by scripts/build-ui-defense.py.
The user rated it neither good nor bad. Do not promote it or use its older balance
as the campaign source. Broader UI/UX work remains after balance feedback.
