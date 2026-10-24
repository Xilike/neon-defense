import fs from'node:fs';import path from'node:path';import http from'node:http';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(4189,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});const report={};
async function open(build){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4189/')?r.continue():r.abort());await context.addInitScript(()=>window.requestAnimationFrame=()=>0);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4189/'+build+'/?test=1&sd2debug=adv&schedule=1');await page.waitForFunction(()=>typeof SAVE!=='undefined'&&typeof ND_CAMPAIGN!=='undefined');return{page,context,errors};}
try{
 {
  const{page,context,errors}=await open('campaign-v3');
  assert.equal(await page.evaluate(()=>!!document.getElementById('labTools')),false);assert.equal(await page.evaluate(()=>SAVE.econ.avail),0);
  const old=await page.evaluate(()=>{const d=defaultSave();d.ver=5;d.balanceSchema=2;d.econ={avail:1234,total:1000000};d.up.eDmg=20;d.up.eRate=5;d.up.base=5;d.weapons.LASER=true;d.craft.owned=true;d.craft.up.dmg=4;d.settings.sfx=false;d.player.name='Player';d.galaxy.current='ember';d.galaxy.unlocked=['aurora','ember'];d.galaxy.progress={ember:{levelSchema:2,combatLevel:4,lastDefeated:3,cleared:4,coins:5000,visited:true}};localStorage.removeItem(SAVE_KEY);const raw=JSON.stringify(d);localStorage.setItem('neonDefense_levels_v2',raw);return raw;});
  await page.reload();await page.waitForFunction(()=>SAVE.player.name==='Player');
  const migrated=await page.evaluate(old=>{const expected=ND_CAMPAIGN.migrate(JSON.parse(old));return{oldUntouched:localStorage.getItem('neonDefense_levels_v2')===old,key:SAVE_KEY,up:SAVE.up,econ:SAVE.econ,expectedUp:expected.up,expectedEcon:expected.econ,galaxy:SAVE.galaxy.current,level:galaxyLevel('ember'),saved:localStorage.getItem(SAVE_KEY)};},old);
  assert(migrated.oldUntouched);assert.equal(migrated.key,'neonDefense_campaign_v3');assert.deepEqual(migrated.up,migrated.expectedUp);assert.deepEqual(migrated.econ,migrated.expectedEcon);assert.equal(migrated.galaxy,'ember');assert.equal(migrated.level,4);
  await page.reload();assert.equal(await page.evaluate(()=>localStorage.getItem(SAVE_KEY)),migrated.saved);report.migration={preservedOldKey:true,investmentConverted:true,noRepeatedRefund:true,currentLevelRetained:true};
  report.normal=await page.evaluate(()=>{SAVE.settings.sfx=false;SAVE.galaxy.unlocked=['aurora'];SAVE.galaxy.current='aurora';G=galaxyById('aurora');const gp=galaxyProgress('aurora');gp.visited=true;gp.combatLevel=15;gp.finalDefeated=true;gp.coins=0;SAVE.econ={avail:0,total:0};checkGalaxyUnlocks();return{unlockAfterFinalBossWithoutCurrency:SAVE.galaxy.unlocked.includes('ember'),labCannotEnableByQuery:TEST_BUILD===false&&!document.getElementById('labTools')};});assert(Object.values(report.normal).every(Boolean));assert.deepEqual(errors,[]);await context.close();
 }
 {
  const{page,context,errors}=await open('campaign-v3-lab');
  report.gameplay=await page.evaluate(()=>{
   SAVE.settings.sfx=false;hideOverlay('ovMenu');newRun();S.phase='combat';clearField();const r={allTenUnlocked:SAVE.galaxy.unlocked.length===10};
   r.realStatsMatchModel=['ELECTRIC','LASER','ROCKET','VOID'].every(k=>JSON.stringify(turretStats(k))===JSON.stringify(ND_CAMPAIGN.weaponStats(k,SAVE.up)));
   const stageBefore=JSON.stringify(levelSpec().hp);SAVE.econ={avail:1e9,total:1e9};buyUpgrade('eDmg');r.buyingDoesNotBuffEnemies=JSON.stringify(levelSpec().hp)===stageBefore;
   SAVE.up.eDmg=198;const cash=SAVE.econ.avail,price=ND_BALANCE.price('eDmg',198);r.level200Purchase=buyUpgrade('eDmg')&&SAVE.up.eDmg===199&&SAVE.econ.avail===cash-price;const unchanged=SAVE.econ.avail;r.capRejectsExtra=!buyUpgrade('eDmg')&&SAVE.econ.avail===unchanged;
   SAVE.up.eDmg=0;SAVE.econ.avail=0;r.noFreeUpgrade=!buyUpgrade('eDmg')&&SAVE.up.eDmg===0;
   const e=spawnEnemy('NORMAL','blue',2,.18);e.hp=e.maxhp=1000;e.visibleFor=.69;S.priority={id:e.id,until:S.time+8,locked:false};const hp=e.hp;damageEnemy(e,100,undefined,'ELECTRIC',true);r.revealBeforeBlocked=e.hp===hp;e.visibleFor=.70;damageEnemy(e,100,undefined,'ELECTRIC',true);r.revealAtPointSeven=e.hp===hp-100;
   S.time+=8.01;updatePriority(0);r.focusExpiresAtEight=!S.priority;
   clearField();SAVE.weapons.VOID=true;layoutTurrets();const boss=spawnEnemy('BOSS','blue',2,.30);boss.hp=boss.maxhp=100000;boss.visibleFor=2;S.priority={id:boss.id,until:S.time+8,locked:false};const before=boss.t;fireVoid(turrets.find(t=>t.kind==='VOID'),boss);r.bossPullResisted=before-boss.t<=turretStats('VOID').pull*.181;r.voidDealsDamage=boss.hp<100000;
   boss.t=minimumVisibleDepth(boss)+.001;boss.visibleFor=2;fireVoid(turrets.find(t=>t.kind==='VOID'),boss);r.voidNeverHidesRevealedBoss=enemyIsVisible(boss);
   clearField();Director.begin();const limit=levelSpec().childRewardLimit;let earned=SAVE.econ.total;for(let n=0;n<limit+12;n++){const child=spawnEnemy('MINI','blue',2,.8);child.visibleFor=2;killEnemy(child);killEnemy(child);}r.helperRewardBounded=SAVE.econ.total-earned===limit*galaxyReward(2);
   SAVE.powers.magnet=2;Director.magnetUsed=false;ultimateMagnetUntil=0;ultimateMagnetBonusLeft=0;const cap=Math.floor(levelSpec().maximumIncome*.15);ultimateActivate('magnet');const remaining=SAVE.powers.magnet;const second=ultimateActivate('magnet');r.oncePerLevelMagnet=!second&&SAVE.powers.magnet===remaining;
   const target=spawnEnemy('NORMAL','blue',2,.8);target.levelKind='budget';target.visibleFor=2;target.reward=100000;earned=SAVE.econ.total;killEnemy(target);r.magnetBonusCapped=SAVE.econ.total-earned===100000+cap&&ultimateMagnetBonusLeft===0;
   r.skillsScaleToLateHP=ND_CAMPAIGN.powerDamage('storm',1e7,false)===6e6&&ND_CAMPAIGN.powerDamage('storm',1e7,true)===8e5;
   r.pricesScaleWithEconomy=ND_CAMPAIGN.powerPrice('storm',ND_CAMPAIGN.stage(60,9))>ND_CAMPAIGN.powerPrice('storm',ND_CAMPAIGN.stage(1,0));
   return r;
  });assert(Object.values(report.gameplay).every(Boolean),JSON.stringify(report.gameplay));
  // Normal galaxy cards have no lock in the lab, not merely the developer dropdown.
  const cards=await page.evaluate(()=>{G=galaxyById('aurora');SAVE.galaxy.current='aurora';galaxyDeckIndex=9;switchTab('galaxy');return{locked:!!document.querySelector('.gxLocked'),enter:document.querySelector('[data-enter]')?.dataset.enter};});assert.deepEqual(cards,{locked:false,enter:'singularity'});
  await page.locator('#labTools summary').tap();await page.locator('#labGalaxy').selectOption('singularity');await page.locator('#labLevel').fill('60');await page.locator('#labGo').tap();await page.evaluate(()=>{S.phase='over';showOverlay('ovEnd');});await page.locator('#labLoadout').tap();assert(await page.evaluate(()=>S.phase==='combat'&&!document.getElementById('ovEnd').classList.contains('open')));
  report.lab=await page.evaluate(()=>({galaxy:G.id,level:galaxyLevel(G.id),key:SAVE_KEY,allUnlocked:SAVE.galaxy.unlocked.length===10,matchesReference:JSON.stringify(SAVE.up)===JSON.stringify(ND_CAMPAIGN.recommended(60,9).up),moneyIsExpectedWallet:SAVE.econ.avail===ND_CAMPAIGN.recommended(60,9).wallet}));assert.equal(report.lab.galaxy,'singularity');assert.equal(report.lab.level,60);assert(report.lab.allUnlocked&&report.lab.matchesReference&&report.lab.moneyIsExpectedWallet);
  await page.locator('#labReset').tap();assert.equal(await page.evaluate(()=>SAVE.econ.avail),0);assert.equal(await page.evaluate(()=>SAVE.galaxy.unlocked.length),10);
  await page.locator('#labTools summary').tap();await page.evaluate(()=>{hideOverlay('ovMenu');newRun();S.phase='combat';render();});await page.screenshot({path:path.join(out,'lab-current.png')});
  assert.deepEqual(errors,[]);await context.close();
 }
 report.passed=true;fs.writeFileSync(path.join(out,'contracts.json'),JSON.stringify(report,null,2)+'\n');console.log('CONTRACTS PASS',JSON.stringify(report));
}finally{await browser.close();server.close();}
