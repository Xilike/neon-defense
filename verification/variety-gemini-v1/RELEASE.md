# Approved merge: Gemini updates on latest tactics — 2026-11-01

User explicitly requested publishing Gemini changes onto the latest version.
Base releases/variety-v1-lab (leaders + chargers, first ten Aurora stages).
Merged output releases/variety-gemini-v1-lab. Build:
python scripts/build-variety-gemini.py
The shared Gemini generator now exposes build(source,out,experiment); standalone
Gemini defaults retain the same transform. Existing source releases untouched.

Full Gemini UI, reveal/target/guardian overlays and deck/lane pacing are applied.
Original Director hooks still assign the authored tactical roles; Gemini wraps
those hooks, so both systems operate together. Render wraps the existing renderer,
which still draws leader connections/charger warnings and supplied family bosses.
Only the former static target ring is replaced; new countdown ring is singular.

Byte-identical campaign.js, balance.js, levels.js, runtime-config.js, manifest and
Vercel config: no new prices, upgrades, rewards, enemy HP tables, boss timers,
weapons, craft, save keys or currency grants. Same variety origin retains saves.

IMPORTANT balance limitation: exact same numeric tables do not imply identical
difficulty after Gemini deck/lanes and compact field geometry. Diagnostic first-ten
real-engine trials with real income, reference-plan purchases and tactical aiming
clear 8/10. Aurora 1 and 2 lose under this deterministic policy. This was disclosed
to the user before deployment. Do NOT label this merge as a verified 10/10 natural
journey or claim beginner balance has been repaired. The preceding variety-only
version remains available for rollback and had a 10-level natural journey pass.
No price/stat tweaks or unrequested balance overrides were introduced to force
these diagnostic outcomes to pass.

Validation:
- tactics.mjs/contracts results: authored role scope across all 375 stages; damage
  protection cap/no stacking/instant removal, original reward once, warning and
  one-time dash restoration, pooling reset all pass. Exact non-HTML model files.
- ui.mjs/results.json: 375 exact deck multisets, 156 pooled budget spawn formation
  checks, three phone sizes with cards open/closed, no horizontal overflow/header
  overlap, real toggle/canvas menu input, render-state and grace contracts pass.
- focus.mjs/focus-results.json: 48 phone touch/visibility/cooldown cases pass.
- engine-results.json: 8/10 diagnostic clears; all 10 expected leaders and all
  13 chargers are generated; protection and warnings/bursts execute in real combat.
These are deterministic samples, not physical-iPhone QA or human fun ratings.

Deployment target: update neon-defense-variety-xilike.vercel.app ONLY.
Preserve original lab, standalone Gemini and normal play aliases. Old variety
rollback: dpl_7hTBv4wh6bTYeiSgeP9Re4rFXeFC.
