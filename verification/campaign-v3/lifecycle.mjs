import fs from'node:fs';import path from'node:path';import http from'node:http';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(4190,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});const report={};
async function open(build){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4190/')?r.continue():r.abort());await context.addInitScript(()=>window.requestAnimationFrame=()=>0);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4190/'+build+'/?test=1&sd2debug=adv&schedule=1');await page.waitForFunction(()=>typeof SAVE!=='undefined'&&typeof ND_CAMPAIGN!=='undefined');return{page,context,errors};}
try{
 const{page,context,errors}=await open('campaign-v3-lab');
 report.effects=await page.evaluate(()=>{
  SAVE.settings.sfx=false;hideOverlay('ovMenu');newRun();S.phase='combat';
  SAVE.powers={storm:2,magnet:2,blackhole:2};ultimateActivate('magnet');ultimateActivate('blackhole');
  for(const t of turrets){t.cool=100;t.beamT=100;t.beamTarget=999;}
  craft.cool=100;craft.lane=0;const inv={...SAVE.powers},wallet={...SAVE.econ};retryCombat();
  return{noEffectLeak:ultimateMagnetUntil===0&&ultimateHoleUntil===0&&ultimateMagnetBonusLeft===0&&ultimateFxUntil===0,
   cooldownsReset:turrets.every(t=>t.cool<.5&&t.beamT===0&&t.beamTarget===null)&&craft.cool===0&&craft.lane===2,
   noRefund:JSON.stringify(inv)===JSON.stringify(SAVE.powers)&&JSON.stringify(wallet)===JSON.stringify(SAVE.econ)};
 });assert(Object.values(report.effects).every(Boolean));
 report.rewards=await page.evaluate(()=>{
  clearField();Director.begin();ultimateMagnetUntil=S.time+30;ultimateMagnetBonusLeft=10;
  const e=spawnComposite('trihex','blue',2);e.t=.5;e.visibleFor=2;const before=SAVE.econ.total,base=e.comp.parts[0].reward;
  damageComposite(e,1e12,undefined,'ELECTRIC');const partGain=SAVE.econ.total-before;
  Director.childRewards=levelSpec().childRewardLimit;const total=SAVE.econ.total;
  damageComposite(e,1e12,undefined,'ELECTRIC');
  return{partBonusCapped:partGain===base+10&&ultimateMagnetBonusLeft===0,helperPartCap:SAVE.econ.total===total,
   pooledFlagsCleared:!e.stageBoss&&!e.finalGalaxyBoss,scaledCompositeBreach:e.breach===Math.round(30*levelSpec().breachScale)};
 });assert(Object.values(report.rewards).every(Boolean));
 report.pause=await page.evaluate(()=>{
  newRun();S.phase='combat';S.priority={id:99,until:S.time+8};ultimateMagnetUntil=S.time+30;const time=S.time,hp=S.baseHP;
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));
  const paused=S.phase==='paused'&&document.getElementById('ovPause').classList.contains('open');
  loop(performance.now()+5000);Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));
  const frozen=S.time===time&&S.baseHP===hp&&S.priority.until===time+8&&ultimateMagnetUntil===time+30&&S.phase==='paused';
  togglePause();const resumes=S.phase==='combat';window.dispatchEvent(new Event('pagehide'));const pagehidePaused=S.phase==='paused';togglePause();
  S.phase='transit';Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});confirmEnterGalaxy();const transitPaused=S.phase==='paused';
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});return{paused,frozen,resumes,pagehidePaused,transitPaused};
 });assert(Object.values(report.pause).every(Boolean));
 await page.locator('#labTools summary').tap();await page.locator('#labGalaxy').selectOption('aurora');assert.equal(await page.locator('#labLevel').getAttribute('max'),'15');
 await page.locator('#labLevel').fill('15');await page.locator('#labGo').tap();await page.locator('#labNext').tap();assert.equal(await page.evaluate(()=>G.id),'ember');assert.equal(await page.evaluate(()=>galaxyLevel(G.id)),1);report.labBoundary=true;
 await page.locator('#labGalaxy').selectOption('singularity');await page.locator('#labLevel').fill('60');await page.locator('#labGo').tap();
 const before=await page.evaluate(()=>SAVE.econ.total);await page.locator('#labNext').tap();assert.equal(await page.evaluate(()=>galaxyLevel(G.id)),60);assert.equal(await page.evaluate(()=>SAVE.econ.total),before);report.labCampaignEnd=true;
 await page.locator('#labFunds').check();await page.locator('#labLoadout').tap();await page.locator('#labFunds').uncheck();assert(await page.evaluate(()=>SAVE.econ.avail===ND_CAMPAIGN.recommended(60,9).wallet));report.labWalletRestoresPreset=true;
 await context.close();
 const normal=await open('campaign-v3'),p=normal.page;
 await p.evaluate(()=>{SAVE.settings.sfx=false;hideOverlay('ovMenu');newRun();S.phase='combat';const gp=galaxyProgress('aurora');gp.combatLevel=15;gp.visited=true;Director.phase='clearing';clearField();stageGate();const boss=enemyById(gp.stageBossId);boss.visibleFor=2;killEnemy(boss);renderPlayerProgress();});
 await p.locator('#campaignContinue').tap();assert(await p.evaluate(()=>G.id==='ember'&&S.phase==='transit'&&galaxyLevel('ember')===1));assert(await p.locator('#campaignContinue').isHidden());
 await p.evaluate(()=>{confirmEnterGalaxy();G=galaxyById('singularity');SAVE.galaxy.current=G.id;galaxyProgress(G.id).finalDefeated=true;Director.phase='complete';renderPlayerProgress();});assert(await p.locator('#campaignContinue').isVisible());assert(await p.locator('#campaignContinue').isDisabled());report.completion={nextGalaxyFromRealFinalGuardian:true,lastGalaxyEndsWithoutInvalidTarget:true};
 assert.deepEqual(errors,[]);assert.deepEqual(normal.errors,[]);await normal.context.close();report.passed=true;
 fs.writeFileSync(path.join(out,'lifecycle-results.json'),JSON.stringify(report,null,2)+'\n');console.log('LIFECYCLE PASS',JSON.stringify(report));
}finally{await browser.close();server.close();}
