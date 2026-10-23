# Neon Defense SD2

**Current continuation:** use [CURRENT_GAME.md](CURRENT_GAME.md) and
`releases/balanced-v1/`, recovered from the Vercel version selected by the user.
The root application and instructions below are historical and do not build the
current normal-play release. Keep `main` and Production unchanged.

Portrait Canvas defense game with continuous combat, five galaxies, four weapons,
permanent upgrades and an autonomous shuttle. See [RECOVERY.md](RECOVERY.md) for
source recovery, the unavailable historical integration, and current SD2 scope.

```sh
npm ci
npm run build:preview
node scripts/serve.mjs
# In another terminal:
npx playwright install chromium
npm test
npm run test:e2e
npm run test:production
```

Only `dev/neon-defense` is authorized for development. Publish Preview deployments
only to `neon-defense-independent`. Never promote or deploy production without
explicit authorization. `npm run build` defaults to production settings locally;
it does not publish anything. Vercel uses `VERCEL_ENV` to select the economy.

Android offline Preview APK (JDK 17+, Python 3, Android SDK platform 35 / build tools 36):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-android.ps1
```

The APK has a separate application ID, portrait Activity, bundled offline assets,
HTTPS asset interception, DOM storage, no native JS bridge and no network
permission. It is signed with a locally generated preview key, not a Play Store
release key. Keep that key private and retain it for compatible preview updates.
Output: `android/app/build/neon-defense-sd2-preview.apk`.
