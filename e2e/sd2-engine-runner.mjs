import { chromium } from '@playwright/test';

// Run against a locally served *isolated* SD2 Preview, never production.
// Usage: SD2_PREVIEW_URL=http://127.0.0.1:4203 node e2e/sd2-engine-runner.mjs
const base = process.env.SD2_PREVIEW_URL;
if (!base || !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(base)) {
  throw new Error('Set SD2_PREVIEW_URL to a localhost isolated preview server; production URLs are rejected.');
}
const profiles = ['new', 'mid', 'adv'];
const results = [];
const browser = await chromium.launch({ headless: true });
try {
  for (const profile of profiles) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '?sd2debug=' + profile + '&schedule=1');
    await page.locator('#btnStart').click();
    const run = await page.evaluate(() => {
      if (S.phase === 'transit') confirmEnterGalaxy();
      startContinuousAuto();
      const dt = 0.05;
      let frames = 0;
      while (frames++ < 120000 && S.phase === 'combat' && Number(galaxyProgress(G.id).cleared || 1) < 15) {
        S.time += dt;
        Director.update(dt);
        galaxyActiveTick(dt);
        updateEnemies(dt);
        ultimateTick(dt);
        updateTurrets(dt);
        updateCraft(dt);
        updateShots(dt);
        updateFx(dt);
        updatePriority(dt);
      }
      return {
        phase: S.phase, simulatedSeconds: +(frames * dt).toFixed(1),
        reachedLevel: galaxyProgress(G.id).cleared,
        baseHP: S.baseHP, kills: S.kills,
        levels: SD2.report().levels, saveIsolation: SD2.debug.verify(),
      };
    });
    results.push({ profile, ...run, errors });
    await page.close();
  }
} finally { await browser.close(); }
console.log(JSON.stringify({ kind: 'actual-game-update-pipeline-with-virtual-frames', results }, null, 2));
if (results.some(r => r.errors.length || !r.saveIsolation?.ok)) process.exitCode = 1;
