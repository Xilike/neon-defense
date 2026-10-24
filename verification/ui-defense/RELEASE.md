# Defense wall UI review candidate

Review: https://neon-defense-ui-xilike.vercel.app
Immutable snapshot: https://neon-defense-sd2-preview-6luvq9aim-xilike3-8922s-projects.vercel.app
Deployment: dpl_CVce7LqMhmFjNXBtu3UQDqgbXXpy (non-production)

User goal: begin improving UI/UX, especially the line under the guns. Two images
were tentative references. This candidate is the first focused visual review:
transparent curved energy wall ahead of the existing turrets, a quiet separate
platform, small side emitters, and no neon frame/label underneath the guns.
Normal cyan, critical red/low amber and an active green shield reflect real state.
The existing shield countdown moves into the existing DEFENSE HUD label.

Build: python scripts/build-ui-defense.py
Source: gameplay/ui-defense/defense.js; based on releases/events-v2.1-lab/.
Generated root: releases/ui-defense-preview/. Explicit lab flag remains enabled;
this new origin has an independent browser save. Existing play/lab roots and
aliases remain unchanged, preserving their progress and approved gameplay.

Verification: node verification/ui-defense/verify.mjs
The browser is restricted to localhost; no Vercel login, Sentry or external
network is loaded. Six screenshots cover 360x800, 390x844, 412x915 with the upgrade
cards open/closed; additional critical and active-shield renders were inspected.
The contact boundary is still projY(1)=GY, and turret bases remain behind it.
A seeded 300-second full combat simulation (including courier encounters) matches
v2.1 exactly for HP, phase, level, kills, coins, upgrades, spawn count, weapon range,
projection bounds and shield timer. Level/balance/profile files are byte-identical.
QA images stay local. Deployed bytes are separately compared through Vercel tools.

Only dev/neon-defense is updated. Main and Production remain untouched.
The user is reviewing the defense-wall direction before broader HUD/navigation
and weapon-card work. Do not claim this is the completed full UI redesign.
