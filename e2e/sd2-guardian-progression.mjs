import { chromium } from '@playwright/test';

// Run against a locally served *isolated* SD2 Preview, never production.
// Usage: SD2_PREVIEW_URL=http://127.0.0.1:4203 node e2e/sd2-engine-runner.mjs
const base = process.env.SD2_PREVIEW_URL;
if (!base || !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(base)) {
  throw new Error('Set SD2_PREVIEW_URL to a localhost isolated preview server; production URLs are rejected.');
}
const profiles = ['adv'];
const seeds = [42];
const results = [];
const browser = await chromium.launch({ headless: true });
try {
  for (const seed of seeds) for (const profile of profiles) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(seed => {
      let x = seed >>> 0;
      Math.random = () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296);
    }, seed);
    await page.goto(base + '?sd2debug=' + profile + '&schedule=1');
    await page.locator('#btnStart').click();
    const run = await page.evaluate(() => {
      if (S.phase === 'transit') confirmEnterGalaxy();
      // Calibrate the isolated Preview at the same settings as experimental/sd2.js.
      SD2.cfg.baseBudget = 1;
      SD2.cfg.stageDuration = 1;
      SD2.startLevel(1);
      startContinuousAuto();
      const dt = 0.05;
      let frames = 0;
      while (frames++ < 250000 && S.phase === 'combat' && !galaxyProgress(G.id).finalDefeated) {
        // Test-only shield to validate boss progression; NOT a difficulty run.
        S.baseMax = 100000; S.baseHP = 100000;
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
        finalDefeated: !!galaxyProgress(G.id).finalDefeated,
        levels: SD2.report().levels, saveIsolation: SD2.debug.verify(),
      };
    });
    results.push({ seed, profile, ...run, errors });
    await page.close();
  }
} finally { await browser.close(); }
console.log(JSON.stringify({ kind: 'actual-game-update-pipeline-with-virtual-frames', results }, null, 2));
if (results.some(r => r.errors.length || !r.saveIsolation?.ok || !r.finalDefeated || r.reachedLevel !== 15 || r.levels.length !== 14 || r.levels.some(l => l.spawned.guardian !== 1 || l.killed.guardian !== 1))) process.exitCode = 1;
const summary = results.map(r => ({ seed:r.seed, profile:r.profile, reachedLevel:r.reachedLevel, phase:r.phase, kills:r.kills, breaches:r.levels.reduce((n,l)=>n+Object.values(l.breached).reduce((a,b)=>a+b,0),0) }));
console.error('SD2_SEEDED_SUMMARY ' + JSON.stringify(summary));
