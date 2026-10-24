import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});
await new Promise(r=>server.listen(4185,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});
const report={version:'2.1.0-courier',checks:[],ui:[]};
async function fixture(build='events-v2.1',manual=true,width=390,height=844){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
 if(manual)await context.addInitScript(()=>window.requestAnimationFrame=()=>0);
 const page=await context.newPage(),errors=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4185/'+build+'/?sd2debug=adv&schedule=1&test=1');
 await page.waitForFunction(()=>typeof Lab!=='undefined'&&typeof SAVE!=='undefined');
 return {page,context,errors};
}
try{
 const{page,context,errors}=await fixture();
 report.contracts=await page.evaluate(()=>{
  const results={};SAVE.settings.sfx=false;hideOverlay('ovMenu');newRun();S.phase='combat';clearField();
  results.normalProfile=TEST_BUILD===false&&SAVE_KEY==='neonDefense_levels_v2'&&!document.getElementById('labTools');
  const far=spawnEnemy('NORMAL','blue',2,.18);far.speed=0;far.visibleFor=.69;const t=turrets[0];
  const p=w2s(far.lane,far.t);canvasTap(p.x,p.y);const until=S.priority.until;
  results.graceWaiting=pickTarget(t)===null&&S.priority.id===far.id;
  far.visibleFor=.70;results.graceReady=pickTarget(t)===far;
  const near=spawnEnemy('NORMAL','blue',2,.9);near.visibleFor=2;
  results.manualOverridesDanger=pickTarget(t)===far;
  S.time=until+.001;updatePriority(0);results.autoReturnsToDanger=!S.priority&&pickTarget(t)===near;
  canvasTap(p.x,p.y);canvasTap(p.x,p.y);results.alwaysEightSeconds=S.priority.until===S.time+8&&!S.priority.locked;
  S.priority=null;far.t=.001;far.visibleFor=2;const hp=far.hp;canvasTap(w2s(far.lane,far.t).x,w2s(far.lane,far.t).y);damageEnemy(far,99999,undefined,'ELECTRIC',true);
  results.hiddenRejected=!S.priority&&hp===far.hp;
  clearField();galaxyProgress(G.id).combatLevel=2;Director.begin();
  const before={xp:SAVE.player.xp,kills:S.kills,stat:SAVE.stats.kills,total:SAVE.econ.total,gpk:galaxyProgress(G.id).kills,quota:Director.killed,breach:Director.breached,hp:S.baseHP};
  const gold=spawnGoldOrb(2);gold.visibleFor=.7;results.moderateGoldHP=gold.hp===90;
  damageEnemy(gold,99999,undefined,'ELECTRIC',true);killEnemy(gold);
  results.rewardOnce=SAVE.econ.total-before.total===2;
  results.noProgressInflation=SAVE.player.xp===before.xp&&S.kills===before.kills&&SAVE.stats.kills===before.stat&&galaxyProgress(G.id).kills===before.gpk&&Director.killed===before.quota&&Director.breached===before.breach;
  const exp=spawnGoldOrb(2);const coins=SAVE.econ.total;
  for(let i=0;i<179;i++)updateEnemies(1/60);
  results.aliveBeforeThree=exp.on;
  updateEnemies(1/60+.0001);results.expiresAtThree=!exp.on&&SAVE.econ.total===coins&&S.baseHP===before.hp;
  const unused=spawnGoldOrb(2);unused.visibleFor=2;results.goldNotHostile=Director.aliveHostiles()===0;
  Director.phase='clearing';stageGate();results.goldDoesNotBlockGuardian=Director.phase==='guardian';
  clearField();Director.begin();galaxyProgress(G.id).goldVisited=0;Director.spawned=Math.ceil(Director.deck.length*.3);
  GoldCarrier.update(0);results.startsOnEligibleLevel=GoldCarrier.active;
  GoldCarrier.update(7.21);results.threeDrops=GoldCarrier.dropped===3&&enemies.arr.filter(e=>e.on&&e.bonusGold).length===3;
  const savedVisit=galaxyProgress(G.id).goldVisited;results.noReplayFarming=!GoldCarrier.start()&&savedVisit===2;
  persist();loadSave();results.encounterMarkerPersists=galaxyProgress(G.id).goldVisited===2;
  newRun();S.phase='combat';Director.spawned=Math.ceil(Director.deck.length*.3);GoldCarrier.update(0);results.retryNoExtraVisit=!GoldCarrier.active;
  clearField();const reuse=spawnEnemy('NORMAL','blue',2,.5);results.poolReuseClean=!reuse.bonusGold&&reuse.goldLife===0;
  const hiddenGold=spawnGoldOrb(2);hiddenGold.t=0;hiddenGold.visibleFor=0;for(let i=0;i<181;i++)updateEnemies(1/60);results.hiddenGoldStillExpires=!hiddenGold.on;
  results.pricesUntouched=ND_BALANCE.config.prices.eDmg===70&&ND_BALANCE.config.weapons.LASER===350;
  // Eight game seconds means eight seconds on the normal real-time loop.
  return results;
 });
 assert(Object.values(report.contracts).every(Boolean),JSON.stringify(report.contracts));assert.deepEqual(errors,[]);
 report.goldBudget=await page.evaluate(()=>{const originalG=G,rows=[];for(const g of GALAXIES){G=g;for(let lv=2;lv<=60;lv+=3){const spec=ND_LEVELS.stage(lv,galaxyIndex(g.id));const regular=Object.entries(spec.counts).reduce((n,[t,c])=>n+c*galaxyReward(ENEMY_DEF[t].reward),0);const bonus=3*Math.max(1,Math.round(2*(GALAXY_REWARD_MULT[g.id]||1)));rows.push({galaxy:g.id,level:lv,bonus,regular,ratio:bonus/regular});}}G=originalG;return {cases:rows.length,maxRatio:Math.max(...rows.map(x=>x.ratio))};});assert(report.goldBudget.maxRatio<.02);
 const snapshot=await page.evaluate(()=>{SAVE.econ={avail:432,total:900};SAVE.up.eDmg=7;galaxyProgress(G.id).combatLevel=11;persist();return localStorage.getItem(SAVE_KEY)});
 await page.goto('http://127.0.0.1:4185/events-v2.1-lab/');await page.waitForFunction(()=>!!document.getElementById('labTools'));assert.equal(await page.evaluate(()=>SAVE.econ.avail),0);
 await page.evaluate(()=>{Lab.unlimited=true;Lab.funds();persist();Lab.reset()});
 await page.goto('http://127.0.0.1:4185/events-v2.1/');await page.waitForFunction(()=>typeof SAVE!=='undefined');
 assert.equal(await page.evaluate(()=>localStorage.getItem(SAVE_KEY)),snapshot);assert.equal(await page.evaluate(()=>SAVE.up.eDmg),7);report.normalSaveUnchangedByLab=true;await context.close();
 console.log('contracts passed');
 // Real pointer taps on physical turrets; all four slots including locked weapons.
 for(const [width,height]of[[360,800],[390,844],[412,915]]){
  const{page,context,errors}=await fixture('events-v2.1',false,width,height);
  await page.evaluate(()=>{SAVE.settings.sfx=false;hideOverlay('ovMenu');newRun();S.phase='paused';});
  console.log('ui',width);for(const kind of ['ELECTRIC','LASER','ROCKET','VOID']){
   const pos=await page.evaluate(kind=>{S.phase='combat';clearField();Director.phase='complete';const e=spawnEnemy('NORMAL','blue',2,.18);e.visibleFor=2;e.speed=0;S.priority={id:e.id,until:S.time+8,locked:false};setPanelCollapsed(true);resize();const t=turrets.find(t=>t.kind===kind);t.cool=20;const p=turretPos(t),rect=cv.getBoundingClientRect();return {x:p.x+rect.left,y:p.y-20*p.s+rect.top,id:e.id};},kind);
   await page.touchscreen.tap(pos.x,pos.y);
   await page.waitForFunction(kind=>!panelCollapsed&&openWeapon===kind,kind);
   const state=await page.evaluate(({kind,id})=>({tab:curTab,focus:S.priority?.id===id,cool:turrets.find(t=>t.kind===kind).cool,keys:[...document.querySelectorAll('[data-buy]')].map(x=>x.dataset.buy),panelBottom:document.getElementById('panel').getBoundingClientRect().bottom,tabTop:document.getElementById('tabbar').getBoundingClientRect().top}),{kind,id:pos.id});
   assert.equal(state.tab,'defense');assert(state.focus);assert(state.cool>15);assert(state.keys.some(k=>k.startsWith(kind[0].toLowerCase())));assert(state.panelBottom<=state.tabTop+2);
   report.ui.push({width,height,kind,focusKept:true,cooldownKept:true});
  }
  await page.evaluate(()=>{clearField();S.phase='combat';GoldCarrier.active=true;GoldCarrier.elapsed=4.2;GoldCarrier.direction=1;spawnGoldOrb(2);render();});
  await page.screenshot({path:path.join(out,'phone-'+width+'.png')});
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('ui passed');
 // Actual audio graph after a touch gesture, including mute and recovery.
 {
  const{page,context,errors}=await fixture('events-v2.1',false);
  await page.locator('#btnStart').tap();await page.waitForFunction(()=>AC?.state==='running');
  console.log('audio unlocked');const audio=await page.evaluate(async()=>{
   const analyser=AC.createAnalyser();analyser.fftSize=2048;audioMaster.connect(analyser);
   SFX.hit();await new Promise(r=>setTimeout(r,20));const d=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(d);const peak=Math.max(...d.map(Math.abs));
   const state=AC.state;SAVE.settings.sfx=false;const before=audioVoices;SFX.hit();const muted=audioVoices===before;
   SAVE.settings.sfx=true;await AC.suspend();return {state,peak,muted};
  });assert(audio.peak>0);assert(audio.muted);await page.touchscreen.tap(200,430);await page.waitForFunction(()=>AC.state==='running');audio.resumeAfterTouch=true;report.audio=audio;
  assert.deepEqual(errors,[]);await context.close();
 }
 {
  console.log('audio passed');const{page,context,errors}=await fixture('events-v2.1-lab',false);
  assert(await page.locator('#labTools').count());await page.locator('#labTools summary').tap();
  await page.locator('#labLevel').fill('11');await page.locator('#labGo').tap();
  assert.equal(await page.evaluate(()=>galaxyLevel(G.id)),11);
  await page.locator('#labFunds').check();await page.evaluate(()=>buyUpgrade('eDmg'));assert.equal(await page.evaluate(()=>SAVE.up.eDmg),1);
  await page.locator('#labFunds').uncheck();assert(await page.evaluate(()=>SAVE.econ.avail<1e9));
  await page.locator('#labSpeed').selectOption('4');assert.equal(await page.evaluate(()=>Lab.speed),4);
  const speed=await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,400));const start=S.time,t0=performance.now();let ticks=0,sum=0;const original=simulateCombat;simulateCombat=dt=>{ticks++;sum+=dt;return original(dt)};await new Promise(r=>setTimeout(r,1500));simulateCombat=original;return {ratio:(S.time-start)/((performance.now()-t0)/1000),phase:S.phase,fps:S.fpsEMA,speed:Lab.speed,test:TEST_BUILD,ticks,sum};});console.log('lab timing',speed);assert(speed.phase==='combat');assert(speed.speed===4);assert(speed.ticks%4===0); // Wall clock vs RAF timing varies in the hosted browser; verify exact scaled steps below.
  const deterministic=await page.evaluate(()=>{Director.phase='complete';clearField();const before=S.time;last=1000;loop(1000+1000/60);return S.time-before;});assert(Math.abs(deterministic-4/60)<1e-8);
  await page.locator('#labNext').tap();assert.equal(await page.evaluate(()=>galaxyLevel(G.id)),12);
  await page.locator('#labReset').tap();const reset=await page.evaluate(()=>({lv:galaxyLevel(G.id),coins:SAVE.econ.avail,up:SAVE.up.eDmg,speed:Lab.speed,inf:Lab.unlimited,key:SAVE_KEY}));assert.deepEqual(reset,{lv:1,coins:0,up:0,speed:1,inf:false,key:'neonDefense_lab_v21'});
  await page.locator('#labLevel').fill('2');await page.locator('#labGo').tap();await page.locator('#labCourier').tap();assert(await page.evaluate(()=>GoldCarrier.active));
  await page.locator('#labTools summary').tap();await page.screenshot({path:path.join(out,'lab-phone.png')});
  report.lab={jump:true,next:true,unlimited:true,timingObservation:speed,scaledStepSeconds:deterministic,reset,carrierPreview:true};assert.deepEqual(errors,[]);await context.close();
 }
 // Generated profiles share all gameplay bytes; only deployment flag differs.
 const normal=path.join(root,'releases/events-v2.1'),lab=path.join(root,'releases/events-v2.1-lab');
 for(const f of ['index.html','balance.js','levels.js'])assert.equal(fs.readFileSync(path.join(normal,f),'utf8'),fs.readFileSync(path.join(lab,f),'utf8'));
 assert.equal(fs.readFileSync(path.join(normal,'levels.js'),'utf8'),fs.readFileSync(path.join(root,'releases/focus-v2.0.1/levels.js'),'utf8'));
 report.sameGameplayProfiles=true;fs.writeFileSync(path.join(out,'contracts.json'),JSON.stringify(report,null,2)+'\n');console.log('EVENTS VERIFIED',JSON.stringify({contracts:report.contracts,ui:report.ui.length,audio:report.audio,lab:report.lab}));
}finally{await browser.close();server.close();}
