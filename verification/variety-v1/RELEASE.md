# First ten-stage tactics experiment — 2026-11-01

User approved the proposed first implementation: squad leader and telegraphed
charger, authored across the first ten Aurora stages. This is an independent
candidate based on boss-v1-lab, NOT the Gemini deck/formation experiment.
Both existing comparison releases and normal production remain unchanged.
Build: python scripts/build-variety-preview.py. Output releases/variety-v1-lab.

## Mechanics
Existing budget enemies receive authored roles at fixed deck indices. No new
spawns, altered deck/count/interval, extra drops, rewards, purchases, stat tables,
XP scaling or income grants. Existing family artwork, bosses and save schema stay.

Leader: golden crest and LEADER label, visible links to at most three nearby
eligible allies (depth .16, lane distance 1.6). Allies take 25% less damage while
connected to a living, revealed leader. Effects do not stack. Never protects the
leader itself, another leader, boss, composite or bonus orb. Kill/breach/out-of-range
removes protection immediately; killing the leader grants only its existing reward.

Charger: orange chevrons; a 1.1 simulation-second countdown from depth .18 after
full-visibility grace, followed by .9s at 1.75x movement speed, then original speed.
One burst per enemy. No late warning from beyond depth .72. Lane AI waits during
warning/burst; existing Electric slow still applies. All timers use simulation
time, so pause/background and lab x1/x2/x4 retain their existing semantics.
Manual focus remains available before the auto-fire danger boundary.

Role fields reset on pooled normal/composite allocation. Bonus/boss/composite
paths are explicitly excluded. All functions outside Aurora stages 1-10 are inert.
These new mechanics DO change local combat pressure; this is not a cosmetic patch.

## Authored stages
1 normal introduction; 2 two chargers; 3 one leader; 4 three chargers;
5 two leaders; 6 one leader then one charger; 7 two leader escorts;
8 three spaced chargers; 9 two leaders + two chargers; 10 combined tactical trial.
Total budget roles over ten stages: ten leaders and thirteen chargers. They replace
roles of existing budget slots, not the enemy type/count or their base stats.

## Evidence
- results.json: scope checked over all 375 stages; exactly the authored roles only
  on the first ten, no roles elsewhere. Actual damage checks: .75 factor, cap 3,
  no stacking, no hidden-leader protection, no boss/bonus protection, immediate
  removal on death, reward exactly once. Warning timing, burst restoration,
  no repeated/late dash, pool reset all pass. Native phone render inspected.
- engine-results.json: ten separate real-engine stages, reference START budget,
  real earned-money purchases and tactical manual priority, 10/10 clear. Counters
  verify role spawns, warnings, bursts and actual protected damage.
- journey-results.json: natural fresh Aurora stages 1-10, continuous progress,
  zero starting coins, no grants/unlimited funds, 24,507 earned, 76 actual upgrades/
  purchases, 245/245 final HP. All ten levels clear. 10 leaders, 13 chargers,
  13 warnings, 9 actual bursts (others intercepted), 8 protected hits.
- automatic-results.json: diagnostic 9/10 clear; automatic-only victory is not
  guaranteed. Lv1 is unchanged and has no tactical roles.
- focus-results.json: 48 touch/reveal/grace/cooldown cases pass.
- scope-results.json: paired, rendered full-engine simulations outside modified
  scope: Aurora 11, Ember 1, Nova 20, identical SAVE/S/Director/active objects/RNG
  after omitting three newly initialized neutral role fields.
- campaign.js, balance.js, levels.js, runtime-config.js, manifest.webmanifest,
  vercel.json remain byte-identical to boss-v1-lab.

No exhaustive human playtest, fun-rating or physical iPhone performance claim.
This is the first two-role prototype; galaxy-wide variety, new boss patterns,
branching upgrades and hostile transporter remain proposals, not implemented.

Keep old lab, Gemini and play aliases immutable during this experiment. A new
origin isolates the candidate save; existing comparison saves remain intact.
