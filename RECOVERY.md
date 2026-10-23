# Source recovery and current behavior

The dev head `ae851ad` stored truncated 1,506-byte blobs for `index.html`,
`experimental/sd2.js`, `tests/sd2-pressure.test.js`, and `e2e/sd2-engine-runner.mjs`.
The working directory initially had no earlier checkout.

Recovery sources (read directly as Git blob bytes, without shell text conversion):

- `index.html`: `dbd5183:index.html` (121,189 bytes). This is a complete historical
  game source, not a download from the live production site.
- `experimental/sd2.js`: `15f05df:experimental/sd2.js` (24,510 bytes).
- Pressure test: the intact parent of the damaged head.
- Engine runner: inspected its intact parent, then replaced its dependency on the
  unavailable integrated preview with the current Playwright gameplay suite.

The previously reported integrated 15-stage/15-guardian preview source was not
present locally or as a complete Git artifact. The old deployment URL did not
provide that runtime. Its exact custom integration could not be recovered.
Old reports are historical evidence only, not verification of this release.

This release rebuilds from the complete continuous game: no Waves, forced stage
breaks, or final-galaxy victory gate. Guardians are periodic enemies; a breach
damages the base and play continues if it survives. The recovered finite-budget
SD2 sandbox remains independently unit tested, but `SD2.cfg.enabled=false` in the
shipping game. `SD2.continuous` tracks actual spawning, kills and breaches.
The obsolete guardian-stage patch and harnesses were removed because they
require the missing runtime and contradict continuous play.

Economy prices live only in `economy.js`; preview and Android use Test prices.
Default/production builds use production prices, disable debug buttons and
`__ND`, and cannot be changed with a query string. Test saves use
`neon_sd2_test_v4`; production saves use `neonDefense2_production`. Old test saves
are left untouched and are not automatically imported. Unlocks use lifetime
earned currency; purchases reduce only available currency. Invalid numbers and
malformed saves are handled without producing NaN balances.

Every build validates JavaScript syntax, complete HTML and replacement-character
corruption, and creates `integrity.json` with SHA-256 hashes. Browser tests fetch
the actual files and compare hashes. Hash equality verifies the bytes; gameplay
tests separately verify behavior.
