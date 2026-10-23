/* Gameplay balance v1. No debug profiles, gifts, or query-string configuration. */
(function (global) {
  'use strict';
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0));
  const config = Object.freeze({
    version: '1.0.0-balanced', saveKey: 'neonDefense_balanced_v1',
    damageGrowth: 1.10, rateGrowth: 1.06, priceGrowth: 1.14,
    stageHpGrowth: 1.07, firstStageSeconds: 150, stageTimeGrowth: 1.05,
    spawnSeconds: 1.8, spawnRamp: 0.035, maxAlive: 18,
    weapons: Object.freeze({LASER: 350, ROCKET: 900, VOID: 1800}),
    spacecraft: 600,
    prices: Object.freeze({eDmg:70,eRate:90,eRange:60,lDmg:95,lEff:110,lRange:80,
      rDmg:130,rRate:150,rAoe:110,vDmg:140,vRate:150,vPull:120,base:90}),
    craftPrices: Object.freeze({dmg:100,spd:70,rate:100,radius:85,range:70}),
    max: Object.freeze({eDmg:60,eRate:30,eRange:20,lDmg:60,lEff:24,lRange:20,
      rDmg:60,rRate:30,rAoe:20,vDmg:60,vRate:24,vPull:20,base:10}),
  });
  function level(up, key) { return clamp(up[key], 0, config.max[key] || 60); }
  function weaponStats(kind, up, defs) {
    const d=defs[kind], g=config.damageGrowth, r=config.rateGrowth;
    if(kind==='ELECTRIC')return {dmg:d.dmg*g**level(up,'eDmg'),rate:d.rate*r**level(up,'eRate'),range:d.range*(1+.025*level(up,'eRange'))};
    if(kind==='LASER')return {dps:d.dps*g**level(up,'lDmg'),beamDur:d.beamDur*(1+.025*level(up,'lEff')),cool:d.cool/1.04**level(up,'lEff'),range:d.range*(1+.025*level(up,'lRange'))};
    if(kind==='ROCKET')return {dmg:d.dmg*g**level(up,'rDmg'),rate:d.rate*r**level(up,'rRate'),range:d.range,aoeR:d.aoeR*(1+.035*level(up,'rAoe'))};
    return {dmg:d.dmg*g**level(up,'vDmg'),cool:d.pulseCool/1.04**level(up,'vRate'),range:d.range,pulseR:d.pulseR*(1+.035*level(up,'vPull')),pull:d.pull*(1+.035*level(up,'vPull'))};
  }
  function weaponDps(kind, s) {
    if(kind==='LASER')return s.dps*s.beamDur/(s.beamDur+s.cool);
    if(kind==='VOID')return s.dmg/s.cool;
    return s.dmg*s.rate;
  }
  function price(key, lvl) { return Math.ceil((config.prices[key] || 100)*config.priceGrowth**clamp(lvl,0,60)); }
  function stageHp(lvl) { return config.stageHpGrowth**clamp(lvl-1,0,99); }
  function spawnInterval(lvl, density, tier, guardian) {
    return Math.max(.35,config.spawnSeconds/(Math.max(.5,density)*(1+config.spawnRamp*clamp(lvl-1,0,25))*Math.max(1,tier))*(guardian?1.6:1));
  }
  function enemyWeights(lvl, types, firstGalaxy) {
    if(!firstGalaxy)return types;
    if(lvl<=2)return {NORMAL:1,RUNNER:.18};
    if(lvl<=4)return {NORMAL:1,RUNNER:.3,TANK:.12};
    if(lvl<=7)return {NORMAL:1,RUNNER:.35,TANK:.25,SPLITTER:.12};
    return {NORMAL:1,RUNNER:.4,TANK:.35,SPLITTER:.25};
  }
  // A fixed progression reference. Buying a weapon never increases enemy HP.
  function guardian(lvl, hpMultiplier, final) {
    const referenceDps=55*1.09**clamp(lvl-1,0,60)*Math.max(1,hpMultiplier);
    return {hp:Math.round(referenceDps*(final?32:20)),reward:Math.round((final?400:100)*(1+.06*clamp(lvl-1,0,60))),speed:final?.012:.018};
  }
  global.ND_BALANCE=Object.freeze({config,weaponStats,weaponDps,price,stageHp,spawnInterval,enemyWeights,guardian});
})(globalThis);
