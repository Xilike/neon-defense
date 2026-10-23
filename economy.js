// Central prices shared by UI, purchases, browser and Android.
(function(global){
'use strict';
const profiles = {
  test: {
    weapons:      { LASER: 10, ROCKET: 20, VOID: 30 },
    spacecraft:   10,
    galaxies:     { ember: 25, jade: 50, indigo: 75, eclipse: 100 },
    upgCost:      lvl => Math.min(5, 1 + lvl),
    craftUpgCost: lvl => Math.min(5, 1 + lvl),
    craftSizeCost:[3, 5, 8, 12, 18, 25, 35, 50], // saucer size lvls 1-8 (x1.5 -> x5)
    spawnTierCost:[0, 5, 5, 5], // index into SPAWN_TIERS; tier ×1 free
  },
  production: {
    weapons:      { LASER: 500, ROCKET: 1500, VOID: 4000 },
    spacecraft:   800,
    galaxies:     { ember: 5000, jade: 25000, indigo: 100000, eclipse: 400000 },
    upgCost:      lvl => Math.floor(50 * Math.pow(1.35, lvl)),
    craftUpgCost: lvl => Math.floor(40 * Math.pow(1.35, lvl)),
    craftSizeCost:[150, 300, 600, 1000, 1600, 2400, 3500, 5000],
    spawnTierCost:[0, 200, 600, 1500],
  },
};
for (const p of Object.values(profiles)) {
  for (const v of Object.values(p)) if (typeof v === 'object') Object.freeze(v);
  Object.freeze(p);
}
global.NeonEconomy = Object.freeze(profiles);
})(globalThis);
