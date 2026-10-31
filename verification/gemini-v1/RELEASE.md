# Two independent game versions — 2026-11-01

## Preserved current version
Source releases/boss-v1-lab, source commit b45cd447, documented at b9817f7.
Existing immutable deployment dpl_7FJAsEQRRz69Pm6KktgMBEv6w3Gr remains assigned to
neon-defense-lab-xilike.vercel.app. No baseline source files are modified.
Normal production remains dpl_D4wLoSGRwhyaGvSokLA5vG6Y11ER / play alias.

## Gemini candidate
Build: python scripts/build-gemini-preview.py
Output: releases/gemini-v1-lab. Separate deployment and alias; origin-based browser
storage isolates the candidate from the current lab and normal production.
The candidate will start its own save; existing lab progress stays at its own URL.

User-pasted Gemini concept is implemented with small correctness adapters:
- Compact HUD, real hidden tool menu, touch-to-close, docked pause/skills,
  upgrade card affordances, chosen turret outline.
- Reduced-opacity enemy body during existing .70s reveal grace, scan ring.
- One focus countdown arc replacing old dotted marker; no duplicate marker.
- Actual guardian siege timer above the monster; no timer mechanic edits.
- Exact same deck multiset, regrouped into 3 normal / 2 runner / 2 splitter /
  tank / shield / supporter cycles. Pincer and V lane patterns in specified bands.
- New budget enemy identified by newly allocated id, not reverse pool index;
  protects already-present invisible enemies when a pool slot is reused.
- Unknown deck types preserved rather than silently converted to NORMAL.
- Announcements name real formations, rather than claiming a different wave type.
- Original appended CSS totals 125px, not the claimed 108. Controls sit 6px below
  it (131px + safe area), avoiding overlap with the stage status row.
- Resize after appended styles aligns projection and touch coordinates.

Unchanged byte-for-byte: campaign.js, balance.js, levels.js, runtime-config.js,
manifest.webmanifest and vercel.json. No weapon, craft, boss/wave stat, price,
reward, stage count, save-key or grace/focus timer changes. No added network,
analytics, dependency or new game accounts.

Important: order and coordinated lanes CHANGE combat pressure, AoE opportunities,
kill income timing and RNG usage downstream. This is not a balance-neutral UI
patch even with identical numbers. It stays in its own experiment.

Validation:
- verify.mjs/results.json: all 375 decks preserve exact per-type counts; 156
  actual budget spawns preserve interval, obey both patterns and never reassign
  a stale pooled enemy. Three phone widths 360/390/412, cards open/closed, no
  horizontal overflow or header/button overlap, menu opens/closes on real touch.
  Render does not write combat state; .70 grace intact.
- focus.mjs/focus-results.json: 48 targeted touch/grace/cooldown cases pass.
- engine.mjs/engine-results.json: diagnostic real-engine 30-stage sample with
  actual earned income and purchases: 28 clears. Aurora Lv1 and Cryon Lv1 lose
  under this particular deterministic shopping/aim policy. Preserved baseline
  clears 30/30 with that policy. Do not claim unchanged difficulty or that the
  candidate has been approved as the new balance.
- Native phone screenshots inspected internally, not exported as deliverables.

No exhaustive 375-stage playthrough or physical-iPhone performance claim.
Do not replace stable lab/production aliases with this candidate without explicit
new direction. The user requested two separately reviewable versions.
