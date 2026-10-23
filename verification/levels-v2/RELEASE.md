# Combat levels v2 — 24 October 2026, Cairo

Deployment: `dpl_4y9xdwdfm9JyMEQbngBTXfDMhk6k` (READY, non-production).
URL: https://neon-defense-sd2-preview-145zvff91-xilike3-8922s-projects.vercel.app

## Problem and correction

The reported Lv.4 was the XP rank, while combat remained in a slowly timed first
level. Long range plus a projection horizon behind the header let enemies die
before the player could see them. The previous success criterion (a paying bot
can finish) did not establish a useful difficulty curve.

The HUD now shows the actual COMBAT LEVEL. XP is separately labelled. The level
counter shows the authored quota and defeated count, plus breaches when present.
Each level is an explicit composition, not a random weighted endless stream.
The first 15 levels add exactly 12 primary enemies each time:

| Level | Primary enemies | Spawn interval at x1 | Normal HP in Aurora | Guardian HP |
|---|---:|---:|---:|---:|
| 1 | 72 | 1.50s | 100 | 1,100 |
| 2 | 84 | 1.35s | 135 | 1,800 |
| 3 | 96 | 1.25s | 165 | 2,600 |
| 4 | 108 | 1.18s | 195 | 3,700 |
| 5 | 120 | 1.12s | 230 | 5,000 |
| 15 | 240 | 0.80s | 1,165 | 36,000 |

Full per-type quotas and HP are in levels.js. Splitter children are extra mechanic
entities and must also be cleared before the guardian. Harmless supplies are not
counted as enemies. Galaxy identities and guardian abilities remain. Autonomous
queen/elite timers outside the plan are disabled. Beyond level 15 the later
galaxies use an explicitly generated extension; those campaigns are not certified.

Kills or breaches resolve primary enemies; the base must survive. XP and elapsed
time cannot advance a combat level. Clearing the field spawns its guardian;
killing the guardian advances automatically after a two-second transition with
no level menu. An escaped guardian retries after eight seconds without awarding
completion. The final guardian unlocks the next galaxy when its requirements hold.

The projection begins below the measured HUD. Targeting AND damage are gated by
full on-screen visibility, at least 1.1 seconds of exposure and engagement depth.
The same gate covers lasers, projectiles, splash, spacecraft and powers. Larger
minimum orb silhouettes improve visibility. Range scales with battlefield size;
opening upgrade cards no longer changes how much world-space a turret can cover
arbitrarily. A persistent shop indicator and first-upgrade hint point to paid
upgrades. No automatic upgrades or granted currency were added.

## Verification

- `level-contract-results.json`: authored quota totals for all 15 rows; XP/time
  cannot advance; hidden/newly revealed enemies reject damage; visible enemies
  take correct damage; surviving children prevent guardian spawning; guardian
  escape does not clear; actual kill advances; reload restores combat level 2.
- `results.json`: real Chromium, actual combat at 60Hz and no free currency or
  weapon/HP overrides. Three paid-upgrade runs reached level 9 in 30 simulated
  minutes. No-purchase seed 42 lost in level 1 at about 141 seconds, holding 561
  earned coins that could have bought upgrades. A cheapest-attribute strategy
  eventually lost at level 13; cards-open play reached level 5 in 15 minutes.
- `smart-results.json`: a marginal-damage-per-cost purchase strategy, using only
  earned currency, completed all 15 levels and unlocked Ember. It earned 44,390
  coins and spent 42,338. This fixture did not purchase base upgrades or modify HP.
- Both natural suites recorded ZERO damage events against hidden/ineligible
  enemies. Early hit samples show orbs well below the header and exposed for
  several seconds, not killed while hidden behind it.
- `edge-results.json`: real animation and touch at 360x800, 390x844 and 412x915,
  with no JS errors or horizontal overflow. HUD visibly says LEVEL 1 plus a
  separate XP rank. The full-width quota row has its own sized grid row.
- `live-results.json`: actual new Vercel deployment, with zero initial coins and
  no debug despite debug query parameters. Seven natural kills earned 79 coins;
  a real touch purchase spent 70 at about 21.3 seconds and persisted after reload.
  No application JS exceptions. Deployed levels.js, balance.js and integrity.json
  exactly match local text. HTML contains the expected source plus Vercel feedback.

These are engine/contract/browser results, not a claim that every human strategy
or later galaxy is balanced. Main and Production were not changed. Old URLs and
save namespaces remain intact. No Android build was made in this change.
