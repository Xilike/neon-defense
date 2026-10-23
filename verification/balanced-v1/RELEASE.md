# Normal-play balance release — 24 October 2026 (Cairo)

URL: https://neon-defense-sd2-preview-bnuhweg6d-xilike3-8922s-projects.vercel.app

Deployment: `dpl_EhXq7D3nmwPViCrSacN3Zhbn5Ff9`, READY, non-production.
Source: the user-selected recovered Vercel `5di2a47zj`, not the old repository-root game.

## Fixed causes

- Per-frame arena refill previously replaced killed enemies immediately, on top
  of normal spawning. Replaced it with one timed, bounded spawning path. Stronger
  weapons now lower the number of enemies on screen instead of forcing refills.
- Power readout duplicated outdated weapon formulas. It now uses the exact
  combat stats, including the laser's beam-plus-cooldown duty cycle. Area/control
  benefits are not presented as exact single-target DPS. A separate measured
  10-second damage rate counts actual health/shield damage without overkill.
- Laser tick rounding overcounted damage, firing cycles could overlap at higher
  efficiency, and hits omitted the LASER identity used by galaxy mechanics.
  Damage now integrates active beam time and cycles include beam + cooldown.
- Shield-breaking hits discarded excess damage. Excess now reaches health.
- Enemy HP had overlapping XP, stage and time/performance multipliers. Normal
  play uses galaxy + stage scaling; XP and purchases do not strengthen enemies.
  Stage scaling is applied exactly once. Hidden threat floors on retry are gone.
- Upgrade descriptions and some rocket/void readouts disagreed with actual
  effects. All previews now compare real current and next-level stats; limits
  match useful effects. Prices and effect growth are centralized in balance.js.
- Starter enemy composition was tank/splitter heavy. Types now enter gradually
  as levels progress. Guardian health/rewards use a fixed progression reference.
- Purchasing UI could remain unaffordable/disabled after earning enough money.
  Affordability now refreshes in place, including spacecraft purchases/upgrades.
- Removed SD2 runtime, profile chooser, automatic scheduled upgrades, free
  ultimate trials and developer API/buttons. Query parameters cannot enable them.
- Normal play has a separate bounded save namespace. Test progress is neither
  imported nor deleted. Defense starts firing as soon as combat begins.

## Evidence

`results.json`: actual combat functions at 60 Hz, no weapon/health overrides and
no granted coins in progression runs. Three 10-minute paid-upgrade runs stayed
playable. The control that bought no upgrades lost at about 12.7 minutes. A
70-minute paid-upgrade run completed Aurora level 15, defeated its final guardian,
and unlocked Ember. The policy is recorded in verify.mjs; it is not a human test.

`edge-results.json`: query immunity, purchase rejection/duplicate prevention,
currency conservation, save reload/sanitization, laser integration, shield
overflow, timed spawns, live affordability, base upgrades, and fixture-based
render/spawn smoke checks in all ten galaxies. Touch/real-animation checks ran
at 360×800, 390×844 and 412×915 without JS errors or horizontal overflow.

`live-results.json`: real protected Vercel deployment loaded in Chromium using
temporary authorized access. Initial coins/upgrades were zero despite debug
query parameters. Seven natural kills earned 79 coins; a touch purchase spent
70 coins at about 20.2 seconds and left 9. Reload preserved the upgrade. No
application JavaScript exceptions occurred. Deployed balance.js, manifest and
integrity.json exactly matched local text. Deployed HTML contains the expected
source prefix plus Vercel's appended feedback script.

## Limits and next work

This is a normal-play release with an initially validated Aurora progression,
not certification of balance across every weapon build and every galaxy. The
successful paying strategy taking no base damage is a useful warning that
expert/optimized play may find Aurora easy. Later galaxies and alternative
purchase choices still need extended balance runs and player feedback.

Next: collect feel/difficulty feedback on this exact URL, calibrate subsequent
galaxies without reintroducing purchase-based enemy scaling, then point Android
packaging at this release directory and verify installation/runtime on a device.
No APK was produced in this task. No Production deployment or main update occurred.
