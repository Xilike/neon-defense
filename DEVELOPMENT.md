# Verification and release boundary

- `npm test`: economy invariants, recovered SD2 finite-budget sandbox simulations,
  source integrity. Sandbox results do not claim continuous-game balance.
- `npm run test:e2e`: actual mobile Chromium game; same suite accepts an explicit
  independent Preview URL through `PREVIEW_URL` and validates deployed SHA-256.
- `npm run test:production`: local production build only; verifies profile,
  disabled debug UI/API and resistance to query-string profile switching. Start
  the local server first. Rebuilds Preview afterward.
- `CHROMIUM_EXECUTABLE_PATH` optionally selects an already installed Chromium.
- CI runs unit tests and browser tests on the dev branch. It does not deploy.

Current browser coverage: load, file hashes, one-time rewards, rejected purchases,
all weapon/shuttle purchases, real shuttle damage, upgrades, lifetime unlocks,
all five galaxy transitions, persistence, corrupt saves, isolated production
storage, touch purchase, guardian breach, defeat/retry, portrait layout at
360x800/390x844/412x915 and a landscape fallback at 844x390.

The deterministic engine run uses actual combat functions at 60 Hz without
weapon/health overrides: seed 42, starter weapon, 17 kills, 104 coins, defeat at
about 59.7 simulated seconds. This is a regression scenario, not proof of balance
for every galaxy/build or a human playtest. Additional purchase tests use explicit
test fixtures to isolate purchase and damage behavior.

Android build verification includes Java compilation, DEX compilation, zip
alignment and APK signature verification. Installation/runtime verification still
requires a connected Android device or an installed emulator/system image.

Historical `SD2_*REPORT.md` files describe earlier experiments and unavailable
artifacts. Use current tests, `RECOVERY.md` and the build's integrity manifest.
