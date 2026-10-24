# Campaign balance 3.0.2

Play: https://neon-defense-play-xilike.vercel.app
Lab: https://neon-defense-lab-xilike.vercel.app
Normal deployment: dpl_5hR7JdjeMBYtsFumhaJzF3EWxjZh
https://neon-defense-sd2-preview-711kfhcl6-xilike3-8922s-projects.vercel.app
Lab deployment: dpl_2pgRHrQ55KE1cL9hbbZ7NUhSwqfL
https://neon-defense-sd2-preview-jwbi89wbr-xilike3-8922s-projects.vercel.app
Both READY, target null (non-production), existing project/team only.

## Lab selection and frozen-build investigation (3.0.2)

Player report: an early-galaxy loadout appeared viable in galaxy 8, with the craft
sometimes seeming sufficient without weapons. Visible screenshot levels E187,
L169, R183 match the reference start of galaxy 10, rather than galaxy 3/4. Craft
upgrades were not visible. The old setup callback read active G/local level while
ignoring pending selector changes. That is a confirmed ambiguity/bug; it does not
prove the player's exact sequence of clicks from the screenshot alone.

The setup button now explicitly starts and equips the selected stage, synchronously
replacing all weapon and craft upgrades with that stage's reference build. Go is
renamed to say it keeps equipment. Persistent lab-only provenance records source
stage, reports changed gear, and is visible in the collapsed summary and expanded
panel alongside the actual stage. Unknown legacy provenance is labeled as such.
Normal saves do not acquire this metadata. No power, enemy or economy coefficients
were nerfed in response to an unconfirmed build history.

`node verification/campaign-v3/frozen-gear.mjs` is a no-purchase/no-grant real-engine
matrix. Gear remains fixed throughout each fixture, unlike solvability tests that
allow purchases using actual earned coins. Its outcomes are asserted:

| Starting gear | Combat stage | Result |
| --- | --- | --- |
| Jade Lv25 | Bloodmoon Lv1 | Loss after 29s |
| Indigo Lv30 | Bloodmoon Lv1 | Loss after 35s |
| Indigo Lv30 | Bloodmoon Lv25 | Loss after 31s |
| Singularity Lv1 | Singularity Lv12 | Clear after 230s |
| Jade Lv25 craft only | Jade Lv25 | Loss after 50s |
| Bloodmoon Lv1 craft only | Bloodmoon Lv1 | Loss after 38s |
| Singularity Lv12 craft only | Singularity Lv12 | Loss after 30s |

Craft-only fixtures lock all turrets; full-fleet fixtures retain real targeting,
projectiles, galaxy mechanics and the craft. In the matched visible-weapon-level
Singularity fixture the craft records 12,968,594 / 728,587,319 HP damage (1.78%).
Damage attribution wraps actual damageEnemy returns; shield absorption and
secondary chain damage have separate/omitted attribution. It is a diagnostic,
not a universal damage share for every player's craft build or all 375 stages.

lab-selection.mjs proves selecting Jade25 while Singularity1 is active and pressing
setup WITHOUT Go lands in Jade25 with exactly Jade25 gear, then jumping to galaxy8
keeps that gear/source. Provenance survives reload; edited gear is marked; unlimited
wallet restoration and per-galaxy clamping remain correct. Existing save/gameplay
contracts, lifecycle contracts and 375-stage mathematical audit also pass. The
previous broader focus and combat reports remain valid historical runs, not reruns
of all those suites for this lab-only patch. Browsers are local/external-blocked.

## Completion and lifecycle fixes (3.0.1)

The campaign coefficients, 375 stages, prices, save keys and targeting rules are
unchanged. This patch closes concrete lifecycle/continuation gaps:

- A completed galaxy has a direct next-galaxy button in the existing status row;
  the last galaxy instead displays a disabled terminal indicator. Normal unlock
  gates are retained. No forced menu between ordinary levels and no new header row.
- Visibility loss and pagehide freeze combat until explicit Resume. A galaxy
  transit that completes while hidden also pauses, so it cannot start an unseen
  fight. Focus and active power durations freeze instead of being consumed.
- Field resets clear spent magnet/black-hole/visual effects and fresh-run weapon
  and craft cooldowns. Inventory is not refunded, and saves/earned coins remain.
- Composite parts now share the finite helper reward count and magnet bonus
  allowance; their floats show actual paid rewards. This was a latent alternate
  reward path, not a newly added enemy event. Pooled composites clear stale boss
  flags and use the campaign breach scale.
- Lab Next moves from the last level of one galaxy to the first of the next;
  at the campaign end it keeps the current stage for explicit replay. Selector
  maximums match galaxy length. Stage status follows actual level progression.
  Leaving infinite funds after applying a preset restores that preset's wallet.

lifecycle.mjs exercises those paths through the actual local browser/engine,
including real final-guardian defeat and a touch on the continuation button,
composite-part kills with exhausted caps, visibility/pagehide and hidden transit,
retry effect/cooldown cleanup, cross-galaxy Lab Next and preset wallet restoration.
All assertions pass. Existing audit, 48-case focus suite, save/gameplay contracts,
30 active combat fixtures, natural Aurora journey and no-upgrade controls rerun.
The older 30-case automatic report remains evidence from 3.0.0; it was not rerun
for this lifecycle patch. All browsers remain localhost-only with external routes
blocked. No claim of physical iPhone or human enjoyment validation is made.

## Problem and changes

Previously Aurora ended at normal HP 1165 / guardian 36000, then Ember started
at 135 / 1485 after galaxy multipliers: a major downward reset. Standalone reward
multipliers, upgrade caps and exponential cadence were not coupled to a complete
campaign budget. Void could pull a guardian behind the visibility boundary every
time it became targetable, leaving an invisible, nearly undamaged boss indefinitely.

The new single authority gameplay/campaign-v3/campaign.js generates 375 fixed
stages from an authored income and affordable-build path. Player purchases do
not strengthen enemies. The combat loop, authored completion and existing galaxy
mechanics remain. First-galaxy type quotas are retained; later quotas continue
from the global index and use different galaxy mixes. Normal and guardian HP,
speed and quota do not drop at any of the nine galaxy boundaries.

Weapon mastery levels 1–200 use damage = base * 1.05^(level-1), damage upgrade
price = ceil(basePrice * 1.06^(level-1)). Base damage-price values are 70/75/120/80
for Electric/Laser/Rocket/Void. Cadence costs grow by 15%; range/AoE/control/base
costs grow by 18%. Cadence has 40 steps; geometry 20; base HP 60. Electric tops
out at 6.72 shots/s, Rocket 2.04/s, Laser cooldown >=0.65s and beam <=1.28s, Void
cooldown >=1.35s. Craft damage uses the same +5% growth and 199-step cap; craft
cadence has 24 steps. Base weapon stats are shared by the engine and the model,
including Laser 150 beam DPS and Void 90 pulse damage before upgrades.

The reference purchasing ledger is exact and never spends more than earned.
Model effective-DPS weights (Electric 1.1, Laser 1.2, Rocket 1.55, Void 2.05) and
70% engagement utilization are explicit design assumptions, not measured universal
weapon efficiencies. Health tables are bounded/smoothed against that reference,
and pressure rises gradually across galaxies. Human play can use different builds;
the fresh continuous run's build differs from the stage-preset build.

Void pull has 18% effect on guardians and preserves full visibility after pulling;
electric-style slow has 25% effect on guardians. Regular spheres retain the
existing control strength. Manual focus remains 8s, reveal grace 0.70s, and the
automatic engagement region and weapon range logic are unchanged.

## Income forecast (coins per level)

Assumes 85% primary kills, 85% splitter-child kills conditional on the parent,
and guardian victory. Full-kill income is also computed per stage. No optional
supplies, courier gold, consumable boosts, ads or grants are assumed. Estimates
are not guaranteed earnings. Income/minute additionally assumes spawn tier x1
and modeled stage duration; measured samples are in the engine JSON reports.

| Galaxy | Levels | Normal HP, first → last | Mean expected coins/level |
| --- | ---: | ---: | ---: |
| aurora | 15 | 100 → 496 | 2937 |
| ember | 20 | 565 → 2003 | 6627 |
| jade | 25 | 2123 → 4604 | 11722 |
| indigo | 30 | 4880 → 10014 | 22819 |
| eclipse | 35 | 11106 → 25168 | 45651 |
| nova | 40 | 26678 → 54398 | 113877 |
| cryon | 45 | 57662 → 125265 | 314412 |
| bloodmoon | 50 | 141294 → 348124 | 870250 |
| nexus | 55 | 369011 → 1073401 | 2819053 |
| singularity | 60 | 1137805 → 2924302 | 10684485 |

Reward multiplier is 1.8 * 1.022^(globalLevel-1), with individual rewards rounded.
The first galaxy's expected mean is 2937 coins per level. Damage upgrade examples
for Electric: level 1→2 costs 70, 50→51 costs 1217, 100→101 costs 22407,
150→151 costs 412736, 199→200 costs 7172316. Late-stage income scales alongside
those costs. Pure mathematical forecasts and all price examples are in economy.json.

Scripted helper rewards have a finite per-level allowance, preventing indefinite
boss/minion coin farming. Gold courier reward remains under 2% of full-kill base
income. Consumable prices use stage expected income; damage uses fixed enemy-HP
fractions so powers remain relevant late. Magnet's bonus budget is 15% of full-kill
level income per activation and activation is limited to once per level. Inventory
is not granted in normal play. These optional bonuses are outside baseline income.

Completing a galaxy's final guardian now opens the next without a separate earned-
currency requirement: the previous design could otherwise leave a completed galaxy
with no more enemies and insufficient unlock currency. Normal still requires actual
previous-galaxy completion; the lab is completely unlocked.

## Validation

- audit.mjs / economy.json: all 375 stages, nine monotonic boundaries, finite caps,
  exact expected-income spending ledgers, gold budget and legacy investment value.
- engine.mjs / engine-results.json: 30 complete start/mid/end stage samples across
  all ten galaxies, with active focus, reference affordable gear and purchases made
  using coins actually earned during each stage. All 30 clear.
- automatic-results.json: the same 30 samples clear in automatic mode. Guardian
  completion takes longer because distant manual targeting is absent.
- journey-results.json: a fresh continuous Aurora run, not 15 reset fixtures.
  Starts with zero coins, the base Electric gun and no grants; actual purchases
  and HP attrition persist across all 15 levels. Result: 51729 coins in 2874.2 simulated seconds, HP 194/295.
  Active targeting and a scripted purchasing policy are stronger than casual play;
  this is an affordability/solvability check, not a human difficulty rating.
- control-results.json: the same base gun without development clears level 1,
  but loses at levels 4 and 8. No hidden upgrade grants are used.
- focus.mjs / results.json: 48 real-touch cases across three phone sizes, four
  weapons, ordinary targets/guardians and upgrade-panel states; visibility and
  cooldown contracts retained.
- contracts.mjs / contracts.json: real engine/model stats agree; buying upgrades
  does not change enemies; max-level and insufficient-funds purchases reject;
  0.70 reveal threshold and 8s expiry; revealed guardians cannot be hidden by Void;
  helper reward and magnet caps; actual GALAXY cards unlocked in lab; stage loadout
  reflects its expected wallet rather than infinite funds; normal query isolation;
  one-time save conversion/reload and progress retention; stage loadout also closes
  pause/game-over overlays and safely resumes after a failed test run.
- deployed-bytes.json: normal/lab served HTML/config/model/level bytes match the
  tested roots via authenticated Vercel fetching. Feedback script injection may
  append to HTML. No external browser execution was attempted; the prior Sentry
  approval rejection remains respected. QA screenshots remain local.

These tests do not replace a human playthrough or exhaustively run all 375 levels
through combat. Reported forecast ranges and coefficients are calibration choices
that can be tuned from player feedback without touching targeting semantics.

## Source, saves and scope

Build: python scripts/build-campaign.py
Roots: releases/campaign-v3/ and releases/campaign-v3-lab/.
The generator reads preserved releases/events-v2.1/; no approved UI preview is merged.
HTML/gameplay files are identical across normal/lab except profile flag/manifest.
Normal save key neonDefense_campaign_v3 copies existing neonDefense_levels_v2 data
once. Old data is never overwritten. Weapon upgrade costs and craft damage/rate
investments are converted to new cumulative prices; remainder is returned to the
wallet without increasing lifetime earnings. Other craft utility benefits remain.
Current galaxy/level, ownership, settings, name and stats persist. Numeric mastery
labels may change because damage mastery replaces the prior sum-of-upgrades label.
The lab uses neonDefense_lab_v3, all ten galaxies unlocked, and adds the explicit
"تجهيز مناسب لليفل" preset. Its funds/gear never migrate into normal play.

Only dev/neon-defense and preview deployments are updated. Main, Production and
old immutable deployments remain intact. The separate UI preview alias remains
on its previous unapproved visual candidate. Old root APK scripts remain historical.
