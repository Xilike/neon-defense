# Neon Defense development

The production branch is `main`. Make changes on `dev/neon-defense` and submit a PR before merging.

The current GitHub baseline is a dependency-free single-file Canvas game (`index.html`). The Stage Director V2 sandbox/Preview work is **not yet integrated** into this branch. Do not treat the smoke tests as difficulty or economy validation.

## Commands

```bash
npm install
npm test
npx playwright install chromium
npm run test:e2e
```

GitHub Actions runs source checks and a mobile Chromium smoke test. Future work: extract pure combat/balance logic into modules and add deterministic seeded simulations, then connect a Preview deployment to the development branch. No production deployment is configured by this setup.
