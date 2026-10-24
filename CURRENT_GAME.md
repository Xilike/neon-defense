# Current game: Gold Courier v2.1

Current source and Vercel deploy root: `releases/events-v2.1/`.
Isolated test profile: `releases/events-v2.1-lab/`.
Lab URL: https://neon-defense-lab-xilike.vercel.app
URL: https://neon-defense-play-xilike.vercel.app

The user selected the recovered Vercel 5di2a47zj game. They then rejected the
v1 balance because enemies died under the header and the XP rank looked like a
combat level. This v2 corrects the system, not just numerical multipliers.

- Immutable original: recovered/vercel-5di2a47zj/.
- Historical first attempt: releases/balanced-v1/; do not resume from it.
- Build both current profiles: python scripts/build-events.py.
- Editable feature modules: gameplay/v2.1/{audio,events,lab}.js.
- The generator reads the preserved focus-v2.0.1 HTML.
- Fixed level composition, HP and intervals: releases/levels-v2/levels.js.
- Actual weapon/upgrade/price formulas: releases/levels-v2/balance.js.
- Current evidence: verification/events-v2.1/RELEASE.md and JSON results.
- Previous combat-level evidence: verification/levels-v2/RELEASE.md.

The large HUD label is COMBAT LEVEL. XP is explicitly separate and cosmetic.
A level has a finite authored enemy deck, health and speed. The next level starts
automatically only after resolving its deck, clearing surviving children and
killing its guardian. No XP/time shortcuts or random per-frame refills exist.
Guardian escapes do not award a clear. There are no forced inter-level menus.
Normal play has no debug profiles, test grants or automatic upgrade schedule.

The combat projection starts below the actual HUD bounds. Enemies must be fully
on screen for 0.70 seconds before damage. Automatic fire keeps its prior engagement
zone and normalized range. Manual focus reaches fully revealed distant targets
at the normal cooldown, and remains selected during reveal grace. Selection is
always 8 game seconds; repeated taps refresh it, without an implicit infinite lock. Fired packets
retain manual authorization after focus changes. Difficulty and economy are unchanged.
The normal save namespace remains neonDefense_levels_v2; existing progress is
preserved on the stable play alias. The lab uses neonDefense_lab_v21 and a separate
origin. Gameplay HTML, balance and level files are byte-identical across profiles;
only runtime-config.js selects the lab. Query parameters never enable test tools.

The gold courier is a non-targetable freighter, separate from the player's craft.
It visits once at levels 2, 5, 8, ... after 30% of the authored enemy deck spawns.
It drops 3 moderate-HP gold orbs, each lasting 3 game seconds from full visibility.
Ignored orbs expire harmlessly. Maximum reward is 6 coins in Aurora, scaled only
by the fixed galaxy reward multiplier elsewhere. No XP, kill/quota or galaxy
activity credit. Persistent goldVisited prevents retry farming. Bonus orbs never
block guardians or consume hostile population capacity. No enemy table, weapon
formula, price or danger-zone change is included.

Tapping any physical turret opens its existing upgrade accordion below the field.
Focus and cooldown survive the layout change. Only the compatibility click from
the same touch is consumed, preventing the newly opened cards closing immediately.
Audio now unlocks on input, resumes after foreground/gesture, supports optional
iOS playback audio sessions, and limits mixed voices. Physical iPhone playback
still needs player confirmation; Chromium graph output and recovery are verified.

Only dev/neon-defense is authorized. Deploy non-production snapshots to the
existing neon-defense-sd2-preview project; preserve main, Production and all old
deployment URLs. Preview hosting does not mean in-game debug is active.

The root application/Android scripts and older RECOVERY.md describe another game
snapshot. Do not rebuild APK from the repository root without updating its asset
source to this release. Next work is player feedback on this exact version,
later-galaxy balance verification, then Android packaging/device runtime checks.

## UI work in review: defense wall

Visual-only lab candidate: releases/ui-defense-preview/.
Review URL: https://neon-defense-ui-xilike.vercel.app
Build: python scripts/build-ui-defense.py
Editable painter: gameplay/ui-defense/defense.js
Evidence: verification/ui-defense/.

The user supplied two tentative UI references and prioritized replacing the line
under the turrets. This first review candidate uses the first image's curved
energy wall ahead of the turret deck, retaining the current turret art and HUD
layout. A transparent hex panel rises from projY(1), with no lower neon frame or
field label under the weapons. Hull health changes the wall color; temporary
line-shield state has a green sweep and existing timer in the HUD. Ground breach,
turret/muzzle position, targeting/range, saves, enemy stats and economy are unchanged.
Only a visual impact timestamp and HUD refresh are added outside the painter.
The normal play and gameplay lab aliases remain on the approved v2.1 release.
Do not treat the candidate as the final complete UI redesign or deploy it over
normal play before the user reviews this visual direction.
