# Galaxy Families v2 — presentation on approved balance 3.1

User explicitly supplied families.js and health-ring.js and requested their
publication, prohibiting changes to pricing, power, weapons or other gameplay.

Source: gameplay/presentation/families-v2/. Build: scripts/build-families.py.
Normal root: releases/families-v2/. Lab root: releases/families-v2-lab/.
The campaign-v3 roots and campaign authority remain the exact 3.1 baseline.

## Isolation

The original attachment files are preserved byte-for-byte. The only adapter is
an internal drawing function rename plus a canvas save/restore wrapper. The old
body painter is replaced, and the old damaged-only flat HP bar is replaced by
the supplied always-visible segmented health painter. Existing special enemy,
shield, boss, priority and gold behavior/marks are retained.

The builder reverses these two drawing substitutions and asserts the resulting
entire HTML equals the baseline byte-for-byte. campaign.js, balance.js, levels.js,
runtime-config.js, manifest.webmanifest and vercel.json are copied identically.
There are no price, strength, cadence, collision/radius, movement, targeting,
visibility, focus, guardian, economy, reward, save, unlock or input changes.
The reported campaign version remains 3.1.0; integrity metadata adds presentation.

## Verification

verify.mjs renders 810 cases: 10 galaxies x 3 detail tiers x 9 enemy types x
3 health fractions, with read-only enemy/save proxies, state snapshots and a
throwing gameplay RNG. It tests no writes, no random consumption and no errors.

The same harness then executes ten pairs of full real-engine runs, one per galaxy,
with actual render calls every 30 simulation frames. Input seeds/actions/time
are identical. Saved data, active enemies/projectiles/beams, Director state,
all S fields, phase/coins and final RNG state must agree exactly. The Nova pair
uses stale Lv2 gear against Lv20, explicitly preserving the prior balance loss.
This is equality testing, not a claim that every frozen build wins.

focus.mjs runs 48 real-touch cases on three phone sizes, with upgrade cards open
and closed, four weapons, ordinary targets and bosses. It retains the 0.70-second
reveal/8-second focus/range and cooldown rules. sheet.mjs creates a native-size
local contact sheet for visual QA; QA PNGs are not release files/deliverables.

All browser runs use localhost with external routes blocked. The previously
rejected Vercel-login/Sentry browser route is not retried. Existing production
baseline HTML/model/config bytes were authenticated-fetch compared before release.
New deployed files are compared again; only then do play/lab aliases advance.
No new network, analytics, audio or third-party dependencies were introduced.

Deployment IDs, previous release rollback points and served-byte checks are in
publication.json. Production publication is authorized for these supplied visual
changes only. Main and historical immutable snapshots remain unchanged.
