# Guardian monster preview — 2026-10-30

Base: approved balance 3.1 + Families v2 (16c4947). Lab only. Published normal
play remains unchanged. Build: `python scripts/build-boss-preview.py`.

Stage guardians use a procedural armored monster face with swept horns, glowing
angled eyes, teeth and galaxy-colored crests. Ordinary supplied families stay
unchanged. Same radius/hitbox/reveal and targeting. Drawing is canvas-state isolated
and uses no gameplay RNG. Native-size ten-galaxy contact sheet visually inspected.

Guardian HP was already derived from the fixed reference END fleet. Siege time
now also uses reference END single-target DPS, with 1.2 simulation seconds for
projectiles/phase transitions and the existing minimum 18s. Cryon's shield allowance
and Nova's authored easing remain. Eclipse uses .90 allowance because its existing
reveal damage vulnerability otherwise lets Lv2 equipment pass its midpoint boss.
No stat changes to weapons, craft, ordinary enemies, prices, rewards, saves or
reference budgets. Tables remain independent of player purchases/performance.

Validation:
- contracts-results.json: all 375 stages identical except guardianBattleSeconds;
  config/rules and five non-campaign assets identical to published lab.
- engine-results.json: 30 actual-engine start/mid/end stages, all clear with
  reference starting gear, actual earned income and real purchases. No free funds.
- guardian-results.json: direct guardian-only comparison, one midpoint per galaxy;
  10 matching reference END fleets clear; 10 frozen Lv2 END fleets lose.
- gear-results.json: 18 frozen Lv2 full-stage controls lose; 2 matched controls
  clear; 3 craft-only controls lose (23 assertions). Executed before the final
  Eclipse-only allowance tightening; final guardian and full-stage suites cover it.
- focus-results.json: 48 phone touch/visibility/cooldown cases pass.
- siege-results.json: correct start/timeout/rush/pull immunity/defeat/retry/coin
  retention behavior; mechanics unchanged since 3.1.

Exploratory guardian-diagnostic.json retains the first failed Eclipse control;
its older-equipment win drove the authored Eclipse allowance correction.
These are deterministic simulations and samples, not exhaustive 375-stage human
playtesting. Reference levels are recommended builds, not arbitrary hard gates
forcing one exact weapon upgrade or preventing skilled alternate builds.

Preserve production play alias and immutable old deployments. This new experiment
is authorized for testing; do not silently promote it to normal production.
