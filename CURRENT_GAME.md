# Current game: focus targeting v2.0.1

Current source and Vercel deploy root: `releases/focus-v2.0.1/`.
URL: https://neon-defense-play-xilike.vercel.app

The user selected the recovered Vercel 5di2a47zj game. They then rejected the
v1 balance because enemies died under the header and the XP rank looked like a
combat level. This v2 corrects the system, not just numerical multipliers.

- Immutable original: recovered/vercel-5di2a47zj/.
- Historical first attempt: releases/balanced-v1/; do not resume from it.
- Build current HTML: python scripts/build-focus.py (uses preserved levels-v2 source).
- Fixed level composition, HP and intervals: releases/levels-v2/levels.js.
- Actual weapon/upgrade/price formulas: releases/levels-v2/balance.js.
- Current evidence: verification/focus-v2.0.1/RELEASE.md and JSON results.
- Previous combat-level evidence: verification/levels-v2/RELEASE.md.

The large HUD label is COMBAT LEVEL. XP is explicitly separate and cosmetic.
A level has a finite authored enemy deck, health and speed. The next level starts
automatically only after resolving its deck, clearing surviving children and
killing its guardian. No XP/time shortcuts or random per-frame refills exist.
Guardian escapes do not award a clear. There are no forced inter-level menus.
Normal play has no debug profiles, test grants or automatic upgrade schedule.

The combat projection starts below the actual HUD bounds. Enemies must be fully
on screen for 1.1 seconds before damage. Automatic fire keeps its prior engagement
zone and normalized range. Manual focus reaches fully revealed distant targets
at the normal cooldown, and remains selected during reveal grace. Fired packets
retain manual authorization after focus changes. Difficulty and economy are unchanged.
The save namespace is neonDefense_levels_v2. Prior saves are not modified.

Only dev/neon-defense is authorized. Deploy non-production snapshots to the
existing neon-defense-sd2-preview project; preserve main, Production and all old
deployment URLs. Preview hosting does not mean in-game debug is active.

The root application/Android scripts and older RECOVERY.md describe another game
snapshot. Do not rebuild APK from the repository root without updating its asset
source to this release. Next work is player feedback on this exact version,
later-galaxy balance verification, then Android packaging/device runtime checks.
