/* Campaign v3: fixed tables generated from an authored economy/reference path.
   Player purchases, XP, currency and performance NEVER change enemy stats. */
(function(global){
 'use strict';
 const ids=['aurora','ember','jade','indigo','eclipse','nova','cryon','bloodmoon','nexus','singularity'];
 const lengths=[15,20,25,30,35,40,45,50,55,60];
 const offsets=lengths.map((_,g)=>lengths.slice(0,g).reduce((a,b)=>a+b,0));
 const types=['NORMAL','RUNNER','TANK','SPLITTER','SHIELDED','SUPPORTER'];
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
 const config=Object.freeze({version:'3.0.0-campaign',saveKey:'neonDefense_campaign_v3',labSaveKey:'neonDefense_lab_v3',
  damageGrowth:1.05,priceGrowth:1.06,weapons:Object.freeze({LASER:350,ROCKET:900,VOID:1800}),spacecraft:600,
  prices:Object.freeze({eDmg:70,eRate:55,eRange:60,lDmg:75,lEff:70,lRange:80,rDmg:120,rRate:90,rAoe:110,vDmg:80,vRate:65,vPull:120,base:90}),
  craftPrices:Object.freeze({dmg:100,spd:70,rate:100,radius:85,range:70}),
  max:Object.freeze({eDmg:199,eRate:40,eRange:20,lDmg:199,lEff:40,lRange:20,rDmg:199,rRate:40,rAoe:20,vDmg:199,vRate:40,vPull:20,base:60}),
  craftMax:Object.freeze({dmg:199,spd:8,rate:24,radius:8,range:8,size:8}),
 });
 const BASE={ELECTRIC:{dmg:18,rate:2.8,range:430},LASER:{dps:150,beamDur:.8,cool:1.8,range:470},ROCKET:{dmg:70,rate:.85,range:430,aoeR:.085},VOID:{dmg:90,pulseCool:3.2,range:440,pulseR:.15,pull:.045}};
 for(const d of Object.values(BASE))Object.freeze(d);Object.freeze(BASE);
 const damageKeys=['eDmg','lDmg','rDmg','vDmg'];
 function price(key,level){const n=clamp(Math.floor(level),0,200),growth=damageKeys.includes(key)?1.06:key==='base'?1.18:/(Rate|Eff)$/.test(key)?1.15:1.18;return Math.ceil((config.prices[key]||100)*growth**n);}
 function powerPrice(key,spec){return Math.max({storm:180,magnet:120,blackhole:350}[key]||0,Math.round(spec.expectedIncome*{storm:.25,magnet:.12,blackhole:.45}[key]));}
 function powerDamage(key,maxhp,boss){return Math.max(1,maxhp*(key==='storm'?(boss?.08:.60):(boss?.0025:.03)));}
 function weaponStats(kind,up,defs=BASE){
  const d=defs[kind],lv=k=>clamp(up[k],0,config.max[k]);
  if(kind==='ELECTRIC')return{dmg:d.dmg*1.05**lv('eDmg'),rate:d.rate*(1+.035*lv('eRate')),range:d.range*(1+.025*lv('eRange'))};
  if(kind==='LASER')return{dps:d.dps*1.05**lv('lDmg'),beamDur:Math.min(1.28,d.beamDur+.012*lv('lEff')),cool:Math.max(.65,d.cool/1.028**lv('lEff')),range:d.range*(1+.025*lv('lRange'))};
  if(kind==='ROCKET')return{dmg:d.dmg*1.05**lv('rDmg'),rate:d.rate*(1+.035*lv('rRate')),range:d.range,aoeR:d.aoeR*(1+.035*lv('rAoe'))};
  return{dmg:d.dmg*1.05**lv('vDmg'),cool:Math.max(1.35,d.pulseCool/(1+.035*lv('vRate'))),range:d.range,pulseR:d.pulseR*(1+.035*lv('vPull')),pull:d.pull*(1+.035*lv('vPull'))};
 }
 function weaponDps(kind,s){return kind==='LASER'?s.dps*s.beamDur/(s.beamDur+s.cool):kind==='VOID'?s.dmg/s.cool:s.dmg*s.rate;}
 function craftStats(u={}){return{dmg:24*1.05**clamp(u.dmg,0,199),spd:2.2*(1+.12*clamp(u.spd,0,8)),cool:Math.max(1,2.2/(1+.05*clamp(u.rate,0,24))),radius:.14*(1+.12*clamp(u.radius,0,8)),range:1*(1+.08*clamp(u.range,0,8)),size:1+.5*clamp(u.size,0,8)};}
 function craftPrice(key,n){return Math.ceil((config.craftPrices[key]||100)*(key==='dmg'?1.06:1.18)**clamp(n,0,200));}
 function fleet(build,aoe=true){
  let total=0;const weight={ELECTRIC:1.1,LASER:1.2,ROCKET:1.55,VOID:2.05};
  for(const kind of Object.keys(BASE))if(build.weapons[kind])total+=weaponDps(kind,weaponStats(kind,build.up))*(aoe?weight[kind]:1.06);
  if(build.craft.owned){const s=craftStats(build.craft.up);total+=s.dmg/s.cool*(aoe?1.25:1);}
  return total;
 }
 const clone=x=>JSON.parse(JSON.stringify(x));
 const blank=()=>({up:Object.fromEntries(Object.keys(config.max).map(k=>[k,0])),weapons:{ELECTRIC:true,LASER:false,ROCKET:false,VOID:false},craft:{owned:false,up:{dmg:0,spd:0,rate:0,radius:0,range:0,size:0}},wallet:0,total:0});
 // Deterministic affordability model, not a dynamic difficulty controller.
 function purchase(build,n){
  for(const kind of ['LASER','ROCKET','VOID'])if(!build.weapons[kind]&&build.wallet>=config.weapons[kind]){build.wallet-=config.weapons[kind];build.weapons[kind]=true;}
  if(build.weapons.ROCKET&&!build.craft.owned&&build.wallet>=600){build.wallet-=600;build.craft.owned=true;}
  // Modest survivability reserve; no invisible gifts or full-upgrade grants.
  const baseGoal=Math.min(60,Math.floor(n/2));
  if(build.up.base<baseGoal&&build.wallet>=price('base',build.up.base)){build.wallet-=price('base',build.up.base);build.up.base++;}
  for(let i=0;i<3000;i++){
   const before=fleet(build);let best=null;
   for(const [kind,keys]of Object.entries({ELECTRIC:['eDmg','eRate'],LASER:['lDmg','lEff'],ROCKET:['rDmg','rRate'],VOID:['vDmg','vRate']})){
    if(!build.weapons[kind])continue;
    for(const key of keys){if(build.up[key]>=config.max[key])continue;const cost=price(key,build.up[key]);if(cost>build.wallet)continue;build.up[key]++;const gain=fleet(build)-before;build.up[key]--;const score=gain/cost;if(!best||score>best.score)best={key,cost,score};}
   }
   if(build.craft.owned)for(const key of ['dmg','rate']){
    if(build.craft.up[key]>=config.craftMax[key])continue;const cost=craftPrice(key,build.craft.up[key]);if(cost>build.wallet)continue;build.craft.up[key]++;const gain=fleet(build)-before;build.craft.up[key]--;if(!best||gain/cost>best.score)best={craft:key,cost,score:gain/cost};
   }
   if(!best)break;build.wallet-=best.cost;if(best.key)build.up[best.key]++;else build.craft.up[best.craft]++;
  }
 }
 const initialCounts=[[60,12,0,0,0],[56,20,8,0,0],[54,26,12,4,0],[52,28,16,12,0],[50,28,20,16,6],[52,28,22,20,10],[52,30,26,22,14],[52,32,28,26,18],[54,32,30,30,22],[56,34,34,32,24],[56,34,36,36,30],[58,36,38,38,34],[58,38,42,40,38],[60,40,44,44,40],[60,42,46,48,44]];
 const intervals=[1.5,1.35,1.25,1.18,1.12,1.08,1.04,1,.97,.94,.91,.88,.85,.82,.8];
 const mixes=[[],[.30,.20,.18,.20,.12,0],[.30,.16,.18,.14,.12,.10],[.25,.21,.16,.13,.18,.07],[.28,.25,.14,.15,.12,.06],[.26,.18,.20,.22,.10,.04],[.24,.16,.22,.12,.20,.06],[.20,.23,.15,.25,.10,.07],[.20,.27,.14,.15,.17,.07],[.18,.22,.20,.18,.15,.07]];
 const rewardBase={NORMAL:5,RUNNER:7,TANK:15,SPLITTER:8,SHIELDED:14,SUPPORTER:12,MINI:2,AEGIS:10,BLAST:10};
 const hpRatio={NORMAL:1,RUNNER:.65,TANK:2.4,SPLITTER:1.5,SHIELDED:2,SUPPORTER:1.3,MINI:.30,BRUTE:4.5};
 const tables=[];let build=blank(),previousHP=100,previousBoss=1100;
 for(let g=0;g<ids.length;g++)for(let lv=1;lv<=lengths[g];lv++){
  const n=offsets[g]+lv,counts={};
  if(g===0)types.forEach((t,i)=>counts[t]=initialCounts[lv-1][i]||0);
  else{const count=240+Math.floor(35*Math.log1p((n-15)/35));types.forEach((t,i)=>counts[t]=Math.floor(count*mixes[g][i]));counts.NORMAL+=count-Object.values(counts).reduce((a,b)=>a+b,0);}
  const count=Object.values(counts).reduce((a,b)=>a+b,0),interval=g===0?intervals[lv-1]:Math.max(.58,.8/(1+.001*(n-15)+.015*g));
  const rewardMultiplier=1.8*1.022**(n-1),reward=t=>Math.max(1,Math.round((rewardBase[t]||0)*rewardMultiplier));
  const guardianReward=Math.round((120+.3*n)*(lv===lengths[g]?1.35:1)*rewardMultiplier);
  const primary=types.reduce((s,t)=>s+counts[t]*reward(t),0),children=counts.SPLITTER*2*reward('MINI');
  const expectedIncome=Math.round(primary*.85+children*.85*.85+guardianReward),maximumIncome=primary+children+guardianReward;
  const startBuild=clone(build);build.wallet+=expectedIncome;build.total+=expectedIncome;purchase(build,n);const endBuild=clone(build);
  const refPower=Math.sqrt(fleet(startBuild)*fleet(endBuild));
  const weighted=types.reduce((s,t)=>s+counts[t]*(hpRatio[t]+(t==='SHIELDED'?1:0)+(t==='SPLITTER'?.6:0)),0)/count;
  const desired=refPower*.70*(.88+.22*g/9+.025*(lv-1)/(lengths[g]-1))*interval/weighted;
  const floor=n===1?100:previousHP*(g===0?1.10:lv===1?1.06:1.008);
  const ceiling=n===1?100:previousHP*(g===0?1.18:1.14);
  const normalHP=Math.round(clamp(desired,floor,ceiling));
  const bossDesired=fleet(endBuild,false)*(13+3*g/9)*(lv===lengths[g]?1.08:1);
  const guardianHP=Math.round(Math.max(n===1?1100:previousBoss*(lv===1?1.06:1.006),bossDesired));
  const hp=Object.fromEntries(Object.entries(hpRatio).map(([t,r])=>[t,Math.round(normalHP*r)]));
  const speed=g===0?1+.012*(lv-1):1.168+.00045*(n-15)+.012*g;
  tables.push(Object.freeze({level:lv,galaxyIndex:g,campaignLevel:n,counts:Object.freeze(counts),count,interval,hp:Object.freeze(hp),speed,maxAlive:g===0?Math.min(20,10+Math.floor(lv*.7)):22,guardianHP,guardianReward,rewardMultiplier,breachScale:1+.009*(n-1)+.16*g,expectedIncome,maximumIncome,expectedSeconds:count*interval+26,childRewardLimit:counts.SPLITTER*2+Math.ceil(count*.05),referenceStart:startBuild,referenceEnd:endBuild,pressure:normalHP*weighted/interval/Math.max(1,refPower*.7)}));
  previousHP=normalHP;previousBoss=guardianHP;
 }
 function stage(level,g=0){const gi=clamp(Math.floor(g),0,9),lv=clamp(Math.floor(level)||1,1,lengths[gi]);return tables[offsets[gi]+lv-1];}
 function deck(spec){const list=[];for(const[t,n]of Object.entries(spec.counts))for(let i=0;i<n;i++)list.push(t);for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
 function allocate(current,n){const b=clone(current);purchase(b,n);return b;}
 function recommended(level,g=0){return clone(stage(level,g).referenceStart);}
 function migrate(old){
  const d=clone(old);let refund=0;d.up??={};
  for(const key of Object.keys(config.max)){
   const count=clamp(Math.floor(d.up[key]||0),0,key==='base'?10:60),oldBase={eDmg:70,eRate:90,eRange:60,lDmg:95,lEff:110,lRange:80,rDmg:130,rRate:150,rAoe:110,vDmg:140,vRate:150,vPull:120,base:90}[key];
   let budget=0;for(let i=0;i<count;i++)budget+=Math.ceil(oldBase*1.14**i);
   let lv=0;while(lv<config.max[key]&&budget>=price(key,lv)){budget-=price(key,lv);lv++;}d.up[key]=lv;refund+=budget;
  }
  if(d.craft?.up)for(const key of ['dmg','rate']){
   const count=clamp(Math.floor(d.craft.up[key]||0),0,8);let budget=0;for(let i=0;i<count;i++)budget+=Math.ceil(100*1.16**i);
   let lv=0;while(lv<config.craftMax[key]&&budget>=craftPrice(key,lv)){budget-=craftPrice(key,lv);lv++;}d.craft.up[key]=lv;refund+=budget;
  }
  d.econ??={avail:0,total:0};d.econ.avail=Math.min(d.econ.total,Math.max(0,d.econ.avail)+refund);d.balanceSchema=3;return d;
 }
 function summary(){return ids.map((id,g)=>{const a=stage(1,g),b=stage(lengths[g],g),slice=tables.slice(offsets[g],offsets[g]+lengths[g]);return{id,levels:lengths[g],firstHP:a.hp.NORMAL,lastHP:b.hp.NORMAL,firstSpeed:a.speed,lastSpeed:b.speed,meanIncome:Math.round(slice.reduce((s,x)=>s+x.expectedIncome,0)/slice.length),meanCoinsPerMinute:Math.round(slice.reduce((s,x)=>s+x.expectedIncome,0)/slice.reduce((s,x)=>s+x.expectedSeconds,0)*60),startWeaponLevels:Object.fromEntries(damageKeys.map(k=>[k,a.referenceStart.up[k]+1])),endWeaponLevels:Object.fromEntries(damageKeys.map(k=>[k,b.referenceEnd.up[k]+1]))};});}
 global.ND_CAMPAIGN=Object.freeze({config,baseWeapons:BASE,ids:Object.freeze(ids),lengths:Object.freeze(lengths),offsets:Object.freeze(offsets),tables:Object.freeze(tables),stage,deck,weaponStats,weaponDps,craftStats,craftPrice,price,fleet,allocate,recommended,migrate,summary,powerPrice,powerDamage});
})(globalThis);
