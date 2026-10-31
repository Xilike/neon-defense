import fs from'node:fs';import path from'node:path';import http from'node:http';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(4203,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});const report={};
async function open(build){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4203/')?r.continue():r.abort());await context.addInitScript(()=>window.requestAnimationFrame=()=>0);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto('http://127.0.0.1:4203/'+build+'/');await page.waitForFunction(()=>typeof SAVE!=='undefined');return{page,context,errors};}
try{
 const v=await open('gemini-v1-lab');
 report.deck=await v.page.evaluate(()=>{
  SAVE.settings.sfx=false;hideOverlay('ovMenu');let cases=0;
  for(let g=0;g<10;g++)for(let lv=1;lv<=ND_CAMPAIGN.lengths[g];lv++){
   G=GALAXIES[g];SAVE.galaxy.current=G.id;galaxyProgress(G.id).combatLevel=lv;galaxyProgress(G.id).finalDefeated=false;Director.begin();
   const counts=Object.fromEntries(Object.keys(levelSpec().counts).map(k=>[k,0]));
   for(const t of Director.deck)counts[t]=(counts[t]||0)+1;
   if(JSON.stringify(counts)!==JSON.stringify(levelSpec().counts))throw Error('Deck counts '+g+'/'+lv);cases++;
  }
  return{cases,countsPreserved:true};
 });
 report.formation=await v.page.evaluate(()=>{
  G=GALAXIES[0];SAVE.galaxy.current=G.id;galaxyProgress(G.id).combatLevel=8;newRun();S.phase='combat';clearField();Director.begin();
  const old=spawnEnemy('NORMAL','blue',3,.2);old.levelKind='budget';const oldLane=old.lane,observed=[];
  for(let i=0;i<Director.deck.length;i++){
   const ids=new Set(enemies.arr.filter(e=>e.on).map(e=>e.id));Director.t=0;Director.update(.01);
   const e=enemies.arr.find(e=>e.on&&e.levelKind==='budget'&&!ids.has(e.id));if(!e)throw Error('Spawn missing '+i);
   const f=Director.spawned/Director.deck.length,step=i;
   if(f>=.33&&f<=.45&&e.lane!==[0,4,1,3,2][step%5])throw Error('Pincer wrong '+i);
   if(f>=.68&&f<=.80&&e.lane!==[2,1,3,0,4][step%5])throw Error('V wrong '+i);
   if(old.lane!==oldLane)throw Error('Reassigned stale pooled enemy');
   observed.push(e.type);pKill(enemies,e);
  }
  return{count:observed.length,staleEntityUntouched:true,spawnInterval:Director.interval(),expectedInterval:levelSpec().interval/(SPAWN_TIERS[S.spawnTier]||1)};
 });
 report.phones=[];
 for(const [width,height]of[[360,800],[390,844],[412,915]]){
  await v.page.setViewportSize({width,height});
  await v.page.evaluate(()=>{G=GALAXIES[0];SAVE.galaxy.current=G.id;galaxyProgress(G.id).combatLevel=8;hideOverlay('ovMenu');newRun();S.phase='combat';SAVE.settings.shake=false;clearField();const e=spawnEnemy('BOSS','blue',2,.55);e.stageBoss=true;e.visibleFor=2;e.guardianEngagedAt=S.time;S.priority={id:e.id,until:S.time+8,locked:false};setPanelCollapsed(true);resize();render();});
  for(const open of[false,true]){
   await v.page.evaluate(open=>{setPanelCollapsed(!open);openWeapon=open?'ELECTRIC':null;renderPanel();resize();render();},open);
   const layout=await v.page.evaluate(()=>{
    const box=id=>{const r=document.getElementById(id).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
    return{hud:box('hud'),pause:box('pauseBtn'),tools:box('sideTools'),powers:box('powersCol'),menuHidden:getComputedStyle(sideMenuItems).display==='none',overflow:document.documentElement.scrollWidth>innerWidth,projectionBelowHUD:HOR>=document.getElementById('hud').getBoundingClientRect().bottom-document.getElementById('battleWrap').getBoundingClientRect().top};
   });assert(!layout.overflow);assert(layout.menuHidden);assert(layout.projectionBelowHUD);assert(layout.pause.y>=layout.hud.bottom+4);assert(layout.tools.y>=layout.hud.bottom+4);
   report.phones.push({width,open,...layout});
   if(width===390)await v.page.screenshot({path:path.join(out,open?'phone-open.png':'phone-closed.png')});
  }
 }
 // Real input: toggle tools, then touch a clear point on the battlefield.
 await v.page.locator('#sideMenuToggle').click();assert(await v.page.evaluate(()=>!sideMenuItems.hidden));
 await v.page.locator('#game').tap({position:{x:190,y:320}});assert(await v.page.evaluate(()=>sideMenuItems.hidden));
 report.menuTouchClose=true;
 report.render=await v.page.evaluate(()=>{
  clearField();for(const grace of[0,.3,.69,.7,1]){
   const e=spawnEnemy('NORMAL','blue',2,.5);e.visibleFor=grace;
   if(enemyCanBeHit(e,true)!==(grace>=.7))throw Error('Changed grace');
   const state=JSON.stringify({SAVE,S,e});render();if(JSON.stringify({SAVE,S,e})!==state)throw Error('Render mutated gameplay');pKill(enemies,e);
  }
  return{noCombatWrites:true,graceUnchanged:true};
 });
 assert.deepEqual(v.errors,[]);await v.context.close();
 for(const f of['campaign.js','balance.js','levels.js','runtime-config.js','manifest.webmanifest','vercel.json'])assert(fs.readFileSync(path.join(root,'releases/boss-v1-lab',f)).equals(fs.readFileSync(path.join(root,'releases/gemini-v1-lab',f))),f);
 report.passed=true;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log('GEMINI PASS',JSON.stringify(report));
}finally{await browser.close();server.close();}
