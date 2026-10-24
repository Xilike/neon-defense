import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});
await new Promise(r=>server.listen(4186,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});
const report={visuals:[],combat:[]};
async function pageFor(build,width=390,height=844){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
 // Local application only. No Vercel login, telemetry or external resources.
 await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4186/')?r.continue():r.abort());
 await context.addInitScript(()=>{window.requestAnimationFrame=()=>0;let seed=42;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4186/'+build+'/');return{page,context,errors};
}
try{
 for(const[width,height]of[[360,800],[390,844],[412,915]])for(const open of[false,true]){
  const{page,context,errors}=await pageFor('ui-defense-preview',width,height);
  const geometry=await page.evaluate(open=>{
   SAVE.settings.sfx=false;SAVE.settings.shake=false;hideOverlay('ovMenu');SAVE.weapons={ELECTRIC:true,LASER:true,ROCKET:true,VOID:true};
   SAVE.econ={avail:3610,total:29000};galaxyProgress('aurora').combatLevel=11;SAVE.up.eDmg=10;SAVE.up.lDmg=8;SAVE.up.rDmg=5;SAVE.up.vDmg=5;
   layoutTurrets();setPanelCollapsed(!open);resize();newRun();clearField();S.phase='combat';Director.phase='spawn';Director.killed=166;Director.breached=4;Director.spawned=180;
   SAVE.craft.owned=true;craft.lane=2;craft.t=.48;S.baseHP=S.baseMax*.92;
   for(const[type,lane,t]of[['SHIELDED',.8,.35],['NORMAL',1.6,.27],['TANK',3.2,.55],['NORMAL',1,.64],['RUNNER',3,.73]]){const e=spawnEnemy(type,type==='TANK'?'teal':'cyan',lane,t);e.visibleFor=2;e.speed=0;}
   S.priority={id:enemies.arr.find(e=>e.on).id,until:S.time+8,locked:false};renderPanel();updateGoldHUD();updateBaseHUD();renderPlayerProgress();render();
   const g=defenseWallGeometry();return{W,H,HOR,GY,boundary:projY(1),wall:g,turrets:turrets.map(t=>({x:t.x,y:turretPos(t).y,muzzle:turretMuzzle(t).y}))};
  },open);
  assert.equal(geometry.boundary,geometry.GY);assert(geometry.wall.topEdge<geometry.boundary);assert(geometry.turrets.every(t=>t.y>geometry.boundary));assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(out,`phone-${width}-${open?'open':'closed'}.png`)});
  if(width===390&&!open){
   for(const[state,hp,shield]of[['critical',.18,false],['shield',.92,true]]){
    await page.evaluate(({hp,shield})=>{S.baseHP=S.baseMax*hp;S.lineShieldUntil=shield?S.time+24:0;updateBaseHUD();render();},{hp,shield});await page.screenshot({path:path.join(out,state+'.png')});
   }
   const label=await page.evaluate(()=>document.querySelector('.defLabel').textContent);assert(label.includes('24s'));
  }
  report.visuals.push({width,height,open,...geometry});await context.close();
 }
 for(const build of ['events-v2.1-lab','ui-defense-preview']){
  const{page,context,errors}=await pageFor(build);
  const data=await page.evaluate(()=>{
   SAVE.settings.sfx=false;SAVE.settings.fx=false;let seed=42;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   resize();newRun();S.phase='combat';
   for(let f=0;f<300*60&&S.phase==='combat';f++){
    simulateCombat(1/60);
    if(f%180===0){if(SAVE.up.eDmg<2)buyUpgrade('eDmg');else if(SAVE.up.eRate<2)buyUpgrade('eRate');else if(!SAVE.weapons.LASER)buyWeapon('LASER');}
   }
   return{hp:S.baseHP,phase:S.phase,level:galaxyLevel(G.id),kills:S.kills,coins:SAVE.econ,up:SAVE.up,spawned:Director.spawned,range:turretStats('ELECTRIC').range,HOR,GY,shield:S.lineShieldUntil};
  });report.combat.push(data);assert.deepEqual(errors,[]);await context.close();
 }
 assert.deepEqual(report.combat[0],report.combat[1]);report.gameplayIdentical=true;
 const a=path.join(root,'releases/events-v2.1-lab'),b=path.join(root,'releases/ui-defense-preview');
 for(const file of ['levels.js','balance.js','runtime-config.js'])assert.equal(fs.readFileSync(path.join(a,file),'utf8'),fs.readFileSync(path.join(b,file),'utf8'));
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log('VISUAL PREVIEW VERIFIED: 6 viewport/layout cases, shield/critical states, identical 300s combat and geometry.');
}finally{await browser.close();server.close();}
