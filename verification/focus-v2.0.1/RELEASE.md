# Focus targeting 2.0.1

Current play URL: https://neon-defense-play-xilike.vercel.app
Immutable deployment: https://neon-defense-sd2-preview-5e203xpm7-xilike3-8922s-projects.vercel.app
Deployment: dpl_7BFWjaVoSkLqSNmncDtbjvqxnUzV (READY, non-production).

Reported behavior: tapping a distant visible orb selected it, but the turret still
waited for automatic range. Selection also cleared during reveal grace.
Manual focus now fires at fully revealed targets regardless of automatic range,
retains selection during the 1.1 second reveal grace, and respects cooldown.
Projectiles/beams retain manual authorization after selection changes. Electric
and rocket focus shots aim from the actual muzzle and have sufficient travel life.
All visibility protections remain. Normal automatic range and damage are unchanged.

Build: python scripts/build-focus.py.
Verify: node verification/focus-v2.0.1/verify.mjs (Playwright and Chromium required).
48 real-touch cases cover 3 phone sizes, cards open/closed, 4 weapons, orb/guardian.
Additional contracts cover hidden enemies, reveal grace, cooldown and repeated taps.
A seeded 300-second automatic combat comparison matches levels-v2 exactly.
Enemy tables are byte-identical. Balance config differs only in version text.
Save key remains neonDefense_levels_v2. Browser saves are scoped to the hosting
origin; old deployment saves cannot automatically cross to the new stable alias.

Deployed stable-alias HTML/JS bytes match the tested local source (HTML may have
Vercel feedback injection appended). Live browser checks are in live-results.json.
Only dev/neon-defense is updated. Main, Production and old deployment URLs stay intact.
