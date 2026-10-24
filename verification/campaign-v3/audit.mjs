import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..');createRequire(import.meta.url)(path.join(root,'gameplay/campaign-v3/campaign.js'));const c=globalThis.ND_CAMPAIGN;
assert.equal(c.tables.length,375);let previous=null;const boundaries=[];
function invested(b){let total=0;for(const[k,n]of Object.entries(b.up))for(let i=0;i<n;i++)total+=c.price(k,i);for(const[k,n]of Object.entries(b.craft.up))for(let i=0;i<n;i++)total+=c.craftPrice(k,i);for(const k of ['LASER','ROCKET','VOID'])if(b.weapons[k])total+=c.config.weapons[k];if(b.craft.owned)total+=c.config.spacecraft;return total;}
let goldShare=0,pressureMin=Infinity,pressureMax=0;
for(const s of c.tables){
 assert(Object.values(s.hp).every(x=>Number.isFinite(x)&&x>0));assert(Object.values(s.counts).every(x=>Number.isInteger(x)&&x>=0));assert.equal(Object.values(s.counts).reduce((a,b)=>a+b,0),s.count);
 assert(Number.isFinite(s.guardianHP)&&s.guardianHP>s.hp.NORMAL);assert(s.interval>=.58&&s.interval<=1.5);assert(s.count<=350&&s.maxAlive<=24);assert(s.expectedIncome>0&&s.maximumIncome>=s.expectedIncome);
 assert.equal(invested(s.referenceEnd)+s.referenceEnd.wallet,s.referenceEnd.total);assert(s.referenceStart.wallet>=0&&s.referenceEnd.wallet>=0);
 for(const[k,n]of Object.entries(s.referenceEnd.up))assert(n>=0&&n<=c.config.max[k]);
 if(previous){assert(s.hp.NORMAL>previous.hp.NORMAL);assert(s.guardianHP>previous.guardianHP);assert(s.speed>=previous.speed);assert(s.count>=previous.count);assert(s.interval<=previous.interval+1e-10);if(s.galaxyIndex!==previous.galaxyIndex)boundaries.push({from:c.ids[previous.galaxyIndex],to:c.ids[s.galaxyIndex],normalBefore:previous.hp.NORMAL,normalAfter:s.hp.NORMAL,bossBefore:previous.guardianHP,bossAfter:s.guardianHP,speedBefore:previous.speed,speedAfter:s.speed});}
 const gold=3*Math.round(2*s.rewardMultiplier);goldShare=Math.max(goldShare,gold/s.maximumIncome);pressureMin=Math.min(pressureMin,s.pressure);pressureMax=Math.max(pressureMax,s.pressure);previous=s;
}
assert(goldShare<.02);assert.equal(boundaries.length,9);
const max=Object.fromEntries(Object.entries(c.config.max));const caps={};
for(const kind of ['ELECTRIC','LASER','ROCKET','VOID']){caps[kind]=c.weaponStats(kind,max);assert(Object.values(caps[kind]).every(Number.isFinite));}
assert(caps.ELECTRIC.rate<7);assert(caps.ROCKET.rate<2.2);assert(caps.LASER.cool>=.65);assert(caps.VOID.cool>=1.35);
const oldPrices={eDmg:70,eRate:90,eRange:60,lDmg:95,lEff:110,lRange:80,rDmg:130,rRate:150,rAoe:110,vDmg:140,vRate:150,vPull:120,base:90};
const old={ver:5,econ:{avail:1234,total:1000000},up:{eDmg:20,eRate:5,eRange:3,lDmg:12,lEff:4,lRange:2,rDmg:8,rRate:3,rAoe:2,vDmg:4,vRate:2,vPull:1,base:5},craft:{owned:true,up:{dmg:4,rate:3,spd:0,radius:0,range:0,size:0}},player:{name:'Bb',xp:123},weapons:{ELECTRIC:true,LASER:true,ROCKET:true,VOID:true},galaxy:{current:'ember',unlocked:['aurora','ember']}};
const before=JSON.stringify(old),m=c.migrate(old);assert.equal(JSON.stringify(old),before);let spent=0,newSpent=0;
for(const[k,n]of Object.entries(old.up)){for(let i=0;i<n;i++)spent+=Math.ceil(oldPrices[k]*1.14**i);for(let i=0;i<m.up[k];i++)newSpent+=c.price(k,i);}
for(const k of ['dmg','rate']){for(let i=0;i<old.craft.up[k];i++)spent+=Math.ceil(100*1.16**i);for(let i=0;i<m.craft.up[k];i++)newSpent+=c.craftPrice(k,i);}
assert.equal(spent,newSpent+(m.econ.avail-old.econ.avail));assert.equal(m.econ.total,old.econ.total);assert.deepEqual(m.galaxy,old.galaxy);assert.deepEqual(m.player,old.player);
const levels=[1,25,50,100,150,199,200],priceExamples=levels.map(l=>({weaponLevel:l,nextDamagePrice:l>=200?null:c.price('eDmg',l-1),electricShot:c.weaponStats('ELECTRIC',{eDmg:l-1}).dmg}));
const report={version:c.config.version,totalLevels:375,summary:c.summary(),boundaries,pressureRange:[pressureMin,pressureMax],maxGoldRewardFraction:goldShare,caps,priceExamples,migration:{oldDataUnchanged:true,spentValuePreserved:true,oldSpent:spent,newSpent,refund:m.econ.avail-old.econ.avail},baselineAssumptions:{ordinaryKillRate:.85,splitChildKillRate:.85,guardianKillRate:1,spawnTier:1,optionalPowersExcluded:true},allChecksPassed:true};
fs.writeFileSync(path.join(import.meta.dirname,'economy.json'),JSON.stringify(report,null,2)+'\n');console.log('AUDIT PASS: 375 levels, 9 continuous boundaries, caps, affordability ledger and migration value conservation.');
