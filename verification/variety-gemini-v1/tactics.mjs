import fs from'node:fs';import path from'node:path';import http from'node:http';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(4222,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});const report={};
async function open(build){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4222/')?r.continue():r.abort());await context.addInitScript(()=>window.requestAnimationFrame=()=>0);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto('http://127.0.0.1:4222/'+build+'/');await page.waitForFunction(()=>typeof SAVE!=='undefined');return{page,context,errors};}
try{
 const v=await open('variety-gemini-v1-lab');
 report.contracts=await v.page.evaluate(()=>{
  SAVE.settings.sfx=false;SAVE.settings.shake=false;hideOverlay('ovMenu');G=GALAXIES[0];SAVE.galaxy.current=G.id;galaxyProgress(G.id).combatLevel=6;newRun();S.phase='combat';clearField();
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  const spawn=(lane,t)=>{const e=spawnEnemy('NORMAL','blue',lane,t);e.visibleFor=2;e.hp=e.maxhp=1000;return e;};
  const leader=spawn(2,.5);leader.varietyRole='leader';const allies=[spawn(1,.52),spawn(2,.55),spawn(3,.57),spawn(2,.6)];
  check(varietyAllies(leader).length===3,'Leader cap');const e=varietyAllies(leader)[0];let hp=e.hp;damageEnemy(e,100);check(Math.abs(hp-e.hp-75)<.01,'Leader reduction');
  const second=spawn(2,.51);second.varietyRole='leader';hp=e.hp;damageEnemy(e,100);check(Math.abs(hp-e.hp-75)<.01,'Protection stacks');pKill(enemies,second);
  const boss=spawnEnemy('BOSS','blue',2,.55);boss.visibleFor=2;check(!varietyProtector(boss),'Protected boss');pKill(enemies,boss);
  leader.visibleFor=.3;check(!varietyProtector(e),'Unrevealed leader aura');leader.visibleFor=2;
  const gold=spawn(2,.55);gold.bonusGold=true;check(!varietyProtector(gold),'Protected bonus');pKill(enemies,gold);
  const before=SAVE.econ.total,reward=leader.reward;killEnemy(leader);check(SAVE.econ.total-before===reward,'Leader reward changed');
  hp=e.hp;damageEnemy(e,100);check(Math.abs(hp-e.hp-100)<.01,'Aura persists after death');const earned=SAVE.econ.total;killEnemy(leader);check(SAVE.econ.total===earned,'Leader duplicate reward');
  clearField();const charger=spawn(2,.38);charger.varietyRole='charger';S.time=100;charger.visibleFor=.5;updateVarietyEnemy(charger);check(charger.varietyPhase==='idle','Dash before grace');charger.visibleFor=2;updateVarietyEnemy(charger);check(charger.varietyPhase==='warning'&&varietySpeed(charger)===1,'Missing warning');
  const until=charger.varietyUntil;S.time=until-.001;updateVarietyEnemy(charger);check(charger.varietyPhase==='warning','Early dash');S.time=until;updateVarietyEnemy(charger);check(varietySpeed(charger)===1.75,'Dash multiplier');S.time=charger.varietyUntil;updateVarietyEnemy(charger);check(charger.varietyPhase==='spent'&&varietySpeed(charger)===1,'Dash not restored');charger.t=.4;S.time+=10;updateVarietyEnemy(charger);check(charger.varietyPhase==='spent','Dash repeated');
  resetVarietyEnemy(charger);charger.varietyRole='charger';charger.t=.8;updateVarietyEnemy(charger);check(charger.varietyPhase==='spent','Ambush near defense line');
  pKill(enemies,charger);const reused=spawnEnemy('NORMAL','blue',2,.4);check(reused.varietyRole===null&&reused.varietyPhase==='idle'&&reused.varietyUntil===0,'Pooled role leaked');
  clearField();let stages=0,totalLeaders=0,totalChargers=0;
  for(let g=0;g<10;g++)for(let lv=1;lv<=ND_CAMPAIGN.lengths[g];lv++){
   G=GALAXIES[g];galaxyProgress(G.id).combatLevel=lv;let leaders=0,chargers=0;
   for(let i=0;i<levelSpec().count;i++){const e={varietyRole:null};assignVarietyRole(e,i);leaders+=e.varietyRole==='leader';chargers+=e.varietyRole==='charger';}
   const spec=varietySpec();check(leaders===(spec?.leaders.length||0)&&chargers===(spec?.chargers.length||0),'Stage scope '+g+'/'+lv);totalLeaders+=leaders;totalChargers+=chargers;stages++;
  }
  return{passed:true,stages,totalLeaders,totalChargers,protection:.25,maxProtected:3,dashWarning:1.1,dashDuration:.9,dashSpeed:1.75,rewardsUnchanged:true,poolReuseClean:true};
 });
 // Native phone render showing actual leader aura and warned charger.
 await v.page.evaluate(()=>{
  G=GALAXIES[0];SAVE.galaxy.current=G.id;galaxyProgress(G.id).combatLevel=6;newRun();S.phase='combat';clearField();setPanelCollapsed(true);resize();
  const add=(lane,t,role)=>{const e=spawnEnemy('NORMAL','blue',lane,t);e.visibleFor=2;e.varietyRole=role;return e;};
  add(2,.49,'leader');add(1,.53,null);add(3,.55,null);add(2,.61,null);const d=add(0,.25,'charger');d.varietyPhase='warning';d.varietyUntil=S.time+1.1;
  render();
 });
 await v.page.screenshot({path:path.join(out,'tactics-phone.png')});
 assert.deepEqual(v.errors,[]);await v.context.close();
 for(const f of['campaign.js','balance.js','levels.js','runtime-config.js','manifest.webmanifest','vercel.json'])assert(fs.readFileSync(path.join(root,'releases/boss-v1-lab',f)).equals(fs.readFileSync(path.join(root,'releases/variety-gemini-v1-lab',f))),f);
 report.passed=true;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log('TACTICS PASS',JSON.stringify(report));
}finally{await browser.close();server.close();}
