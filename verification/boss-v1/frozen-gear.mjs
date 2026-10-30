import fs from'node:fs';import path from'node:path';import http from'node:http';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(4192,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});
const automatic=process.env.ND_AUTOMATIC==='1',control=process.env.ND_NO_UPGRADE==='1',journey=process.env.ND_JOURNEY==='1',outputName=process.env.ND_PROBE_OUTPUT||'gear-results.json';const report={mode:journey?'fresh-natural-aurora':control?'no-upgrade-control':automatic?'automatic':'active-focus',cases:[]};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4192/')?r.continue():r.abort());await context.addInitScript(()=>window.requestAnimationFrame=()=>0);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4192/boss-v1-lab/');await page.waitForFunction(()=>typeof ND_CAMPAIGN!=='undefined'&&typeof SAVE!=='undefined');
 assert.equal(await page.evaluate(()=>SAVE.galaxy.unlocked.length),10);
 const ND_SCENARIOS=JSON.parse(process.env.ND_PROBE_CASES||'[{"id":"ember","g":1,"lv":10,"gearG":1,"gearLv":2,"expectedWin":false},{"id":"ember","g":1,"lv":20,"gearG":1,"gearLv":2,"expectedWin":false},{"id":"jade","g":2,"lv":10,"gearG":2,"gearLv":2,"expectedWin":false},{"id":"jade","g":2,"lv":20,"gearG":2,"gearLv":2,"expectedWin":false},{"id":"indigo","g":3,"lv":10,"gearG":3,"gearLv":2,"expectedWin":false},{"id":"indigo","g":3,"lv":20,"gearG":3,"gearLv":2,"expectedWin":false},{"id":"eclipse","g":4,"lv":10,"gearG":4,"gearLv":2,"expectedWin":false},{"id":"eclipse","g":4,"lv":20,"gearG":4,"gearLv":2,"expectedWin":false},{"id":"nova","g":5,"lv":10,"gearG":5,"gearLv":2,"expectedWin":false},{"id":"nova","g":5,"lv":20,"gearG":5,"gearLv":2,"expectedWin":false},{"id":"cryon","g":6,"lv":10,"gearG":6,"gearLv":2,"expectedWin":false},{"id":"cryon","g":6,"lv":20,"gearG":6,"gearLv":2,"expectedWin":false},{"id":"bloodmoon","g":7,"lv":10,"gearG":7,"gearLv":2,"expectedWin":false},{"id":"bloodmoon","g":7,"lv":20,"gearG":7,"gearLv":2,"expectedWin":false},{"id":"nexus","g":8,"lv":10,"gearG":8,"gearLv":2,"expectedWin":false},{"id":"nexus","g":8,"lv":20,"gearG":8,"gearLv":2,"expectedWin":false},{"id":"singularity","g":9,"lv":10,"gearG":9,"gearLv":2,"expectedWin":false},{"id":"singularity","g":9,"lv":20,"gearG":9,"gearLv":2,"expectedWin":false},{"id":"nova","g":5,"lv":20,"expectedWin":true},{"id":"singularity","g":9,"lv":12,"gearG":9,"gearLv":12,"expectedWin":true},{"id":"jade","g":2,"lv":25,"solo":true,"expectedWin":false},{"id":"bloodmoon","g":7,"lv":1,"solo":true,"expectedWin":false},{"id":"singularity","g":9,"lv":12,"solo":true,"expectedWin":false}]');
 let scenarios=await page.evaluate(()=>ND_CAMPAIGN.ids.flatMap((id,g)=>[1,Math.ceil(ND_CAMPAIGN.lengths[g]/2),ND_CAMPAIGN.lengths[g]].map(lv=>({id,g,lv}))));
 if(control)scenarios=[1,4,8].map(lv=>({id:'aurora',g:0,lv}));
 scenarios=ND_SCENARIOS;
 const count=journey?1:Number(process.env.ND_CASE_LIMIT)||scenarios.length;
 for(const scenario of scenarios.slice(0,count)){
  const result=await page.evaluate(({id,g,lv,manual,control,journey,gearG=g,gearLv=lv,solo=false})=>{
   let seed=42+g*71+lv;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   Object.keys(SAVE).forEach(k=>delete SAVE[k]);Object.assign(SAVE,defaultSave());SAVE.settings.sfx=false;SAVE.settings.fx=false;SAVE.settings.shake=false;
   G=galaxyById(id);SAVE.galaxy.current=id;const ref=ND_CAMPAIGN.recommended(gearLv,gearG);if(control){const d=defaultSave();Object.assign(ref,{up:d.up,weapons:d.weapons,craft:d.craft,wallet:0,total:0});}SAVE.up={...ref.up};SAVE.weapons={...ref.weapons};SAVE.craft=structuredClone(ref.craft);SAVE.econ={avail:ref.wallet,total:ref.total};
   const gp=galaxyProgress(id);gp.combatLevel=lv;gp.visited=true;gp.finalDefeated=false;gp.lastDefeated=lv-1;gp.goldVisited=0;
   S.time=0;layoutTurrets();resize();newRun();S.phase='combat';if(solo)for(const t of turrets)t.locked=true;const beforeTotal=SAVE.econ.total;let purchases=0,bossAt=null,bossKilledAt=null,lastBossSeconds=null;const goal=journey?ND_CAMPAIGN.lengths[g]:lv,milestones=[];
   // Suppress DOM-only card rebuilding in accelerated simulations. All combat,
   // actual purchases/prices, rewards, projectiles and galaxy mechanics stay real.
   renderPanel=()=>{};renderPlayerProgress=()=>{};
   function shop(){
    const b={up:{...SAVE.up},weapons:{...SAVE.weapons},craft:structuredClone(SAVE.craft),wallet:SAVE.econ.avail,total:SAVE.econ.total};
    const next=ND_CAMPAIGN.allocate(b,levelSpec().campaignLevel);
    for(const kind of ['LASER','ROCKET','VOID'])if(next.weapons[kind]&&!SAVE.weapons[kind]){buyWeapon(kind);purchases++;}
    if(next.craft.owned&&!SAVE.craft.owned){buyCraft();purchases++;}
    for(const key of Object.keys(next.up))while(SAVE.up[key]<next.up[key]){if(!buyUpgrade(key))throw Error('Purchase refused '+key);purchases++;}
    for(const key of Object.keys(next.craft.up))while(SAVE.craft.up[key]<next.craft.up[key]){if(!buyCraftUpg(key))throw Error('Craft purchase refused '+key);purchases++;}
   }
   const damage={};const originalDamage=damageEnemy;damageEnemy=(e,d,h,k,m)=>{const dealt=originalDamage(e,d,h,k,m);damage[k||'OTHER']=(damage[k||'OTHER']||0)+dealt;return dealt;};
   for(let f=0;f<(journey?6000:750)*60&&S.phase==='combat';f++){
    // Frozen gear: deliberately no purchases or loadout reapplication.
    if(f%90===0&&manual){
     const choices=enemies.arr.filter(e=>e.on&&!e.dead&&!e.bonusGold&&enemyCanBeHit(e,true));
     choices.sort((a,b)=>(b.stageBoss?10:b.t)-(a.stageBoss?10:a.t));
     if(choices[0])S.priority={id:choices[0].id,until:S.time+8,locked:false};
    }
    simulateCombat(1/60);
    if(Director.phase==='guardian'&&bossAt===null)bossAt=S.time;
    if(gp.lastDefeated>(milestones.at(-1)?.level||0)){lastBossSeconds=bossAt===null?null:S.time-bossAt;milestones.push({level:gp.lastDefeated,time:S.time,hp:S.baseHP,maxHP:S.baseMax,earned:SAVE.econ.total-beforeTotal,guardianSeconds:lastBossSeconds});bossAt=null;}
    if(gp.lastDefeated>=goal||gp.finalDefeated){bossKilledAt=S.time;break;}
   }
   damageEnemy=originalDamage;return{gearG,gearLv,solo,damage,id,g,lv,won:gp.lastDefeated>=goal||gp.finalDefeated,milestones,phase:S.phase,hp:S.baseHP,maxHP:S.baseMax,kills:S.kills,breached:Director.breached,earned:SAVE.econ.total-beforeTotal,expected:ND_CAMPAIGN.stage(lv,g).expectedIncome,time:S.time,bossSeconds:lastBossSeconds??(bossAt===null?null:(bossKilledAt??S.time)-bossAt),purchases,normalHP:ND_CAMPAIGN.stage(lv,g).hp.NORMAL,bossState:enemies.arr.filter(e=>e.on&&e.stageBoss).map(e=>({hp:e.hp,max:e.maxhp,t:e.t,visible:e.visibleFor,speed:e.speed,slow:e.slowUntil,shield:e.shield,phase:e.galaxyBossStage})),up:{...SAVE.up},craft:structuredClone(SAVE.craft)};
  },{...scenario,manual:!automatic,control,journey});
  if(typeof scenario.expectedWin==='boolean')assert.equal(result.won,scenario.expectedWin,'Frozen gear outcome '+scenario.id+'/'+scenario.lv);
  if(scenario.id==='singularity'&&scenario.gearG===9&&!scenario.solo){const total=Object.values(result.damage).reduce((a,b)=>a+b,0);assert(result.damage.CRAFT/total<.15,'Craft must remain support in matched fleet');}
  report.cases.push(result);fs.writeFileSync(path.join(out,outputName),JSON.stringify(report,null,2)+'\n');console.log(scenario.id,scenario.lv,result.won?'CLEAR':'FAIL','hp',Math.round(result.hp)+'/'+result.maxHP,'time',Math.round(result.time),'income',result.earned,'boss',Math.round(result.bossSeconds??0));
 }
 assert.deepEqual(errors,[]);report.errors=errors;report.clears=report.cases.filter(x=>x.won).length;report.expectedOutcomesVerified=report.cases.length;report.passed=true;fs.writeFileSync(path.join(out,outputName),JSON.stringify(report,null,2)+'\n');
 // Diagnostic matrix includes deliberately insufficient builds.
 console.log('FROZEN GEAR EXPECTED OUTCOMES VERIFIED',report.expectedOutcomesVerified,'clears',report.clears);
}finally{await browser.close();server.close();}
