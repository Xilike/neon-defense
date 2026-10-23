import { chromium } from '@playwright/test';

// Run against a locally served *isolated* SD2 Preview, never production.
// Usage: SD2_PREVIEW_URL=http://127.0.0.1:4203 node e2e/sd2-engine-runner.mjs
const base = process.env.SD2_PREVIEW_URL;
if (!base || !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(base)) {
  throw new Error('Set SD2_PREVIEW_URL to a localhost isolated preview server; production URLs are rejected.');
}
const profiles = ['new', 'mid', 'adv'];
const seeds = [1, 42, 2026];
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
      // Natural-balance test: use the actual configured SD2 settings, never override them.
      SD2.startLevel(1);
      startContinuousAuto();
      const dt = 0.05;
      let frames = 0;
      while (frames++ < 160000 && S.phase === 'combat' && !galaxyProgress(G.id).finalDefeated) {
        S.time += dt¶»§q«^