import fs from'node:fs';import path from'node:path';import http from'node:http';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(4197,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});const report={};
async function open(build){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4197/')?r.continue():r.abort());await context.addInitScript(()=>window.requestAnimationFrame=()=>0);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto('http://127.0.0.1:4197/'+build+'/');await page.waitForFunction(()=>typeof SAVE!=='undefined');return{page,context,errors};}
try{
 for(const [profile,folder]of[['normal','families-v2'],['lab','families-v2-lab']]){
  const base=profile==='normal'?'campaign-v3':'campaign-v3-lab';
  for(const f of ['campaign.js','balance.js','levels.js','runtime-config.js','manifest.webmanifest','vercel.json'])assert(fs.readFileSync(path.join(root,'releases',base,f)).equals(fs.readFileSync(path.join(root,'releases',folder,f))),f);
 }report.nonVisualFilesIdentical=true;
 const v=await open('families-v2-lab');
 report.painters=await v.page.evaluate(()=>{
  SAVE.settings.sfx=false;hideOverlay('ovMenu');newRun();S.phase='combat';clearField();
  const save=SAVE,random=Math.random;let cases=0;
  const readonly=(value,cache=new WeakMap())=>{if(!value||typeof value!=='object')return value;if(cache.has(value))return cache.get(value);const proxy=new Proxy(value,{get:(t,k)=>readonly(Reflect.get(t,k),cache),set(){throw Error('Painter state write');},deleteProperty(){throw Error('Painter state delete');},defineProperty(){throw Error('Painter define');}});cache.set(value,proxy);return proxy;};
  for(const gal of GALAXIES){G=gal;for(const lv of[1,3,5]){galaxyProgress(gal.id).combatLevel=lv;
   for(const type of['NORMAL','RUNNER','TANK','SHIELDED','SUPPORTER','SPLITTER','BOSS','AEGIS','BLAST']){
    const actual=spawnEnemy(type,gal.enemy.colors[0],2,.6),sample=structuredClone(actual);pKill(enemies,actual);
    for(const frac of[1,.4,.1]){
     const e={...sample,hp:sample.maxhp*frac},p=w2s(e.lane,e.t),r=Math.max(9,e.r*p.s),before=JSON.stringify({e,S,SAVE});
     try{SAVE=readonly(save);Math.random=()=>{throw Error('Painter consumed gameplay RNG');};ctx.save();drawEnemyBody(readonly(e),p,r);drawOrbHealthRing(readonly(e),p,r);ctx.restore();}
     finally{SAVE=save;Math.random=random;}
     if(JSON.stringify({e,S,SAVE})!==before)throw Error('Painter mutated combat state');cases++;
    }
   }
  }}
  return{cases,noStateWrites:true,noGameplayRandomCalls:true};
 });assert.equal(report.painters.cases,810);
 // Show all ten supplied families at gameplay scale in a local QA contact sheet.
 await v.page.evaluate(()=>{clearField();cv.width=1000;cv.height=720;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#060b20';ctx.fillRect(0,0,1000,720);GALAXIES.forEach((g,i)=>{G=g;galaxyProgress(g.id).combatLevel=5;const p={x:100+(i%5)*200,y:105+Math.floor(i/5)*340,s:1},e={id:100+i,hue:HUES[g.enemy.colors[0]],wob:.8,hp:75,maxhp:100};drawEnemyBody(e,p,35);drawOrbHealthRing(e,p,35);ctx.fillStyle='#b5e7ff';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText(g.name,p.x,p.y+85);});});
 fs.writeFileSync(path.join(out,'families-sheet.png'),Buffer.from(await v.page.evaluate(()=>cv.toDataURL('image/png').split(',')[1]),'base64'));
 assert.deepEqual(v.errors,[]);await v.context.close();
 // Combat equality uses real render calls as well as the real engine. Same
 // deterministic actions, elapsed frames and purchases: every saved/active state
 // must agree, not merely the final win/loss. No game functions are stubbed.
 report.combat=[];
 for(const g of[0,1,2,3,4,5,6,7,8,9]){
  const results=[];
  for(const build of['campaign-v3-lab','families-v2-lab']){
   const x=await open(build);
   const result=await x.page.evaluate(g=>{
    let seed=197+g;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};SAVE.settings.sfx=false;SAVE.settings.fx=false;SAVE.settings.shake=false;hideOverlay('ovMenu');G=GALAXIES[g];SAVE.galaxy.current=G.id;const lv=g===5?20:1,ref=ND_CAMPAIGN.recommended(g===5?2:lv,g);SAVE.up={...ref.up};SAVE.weapons={...ref.weapons};SAVE.craft=structuredClone(ref.craft);SAVE.econ={avail:ref.wallet,total:ref.total};const gp=galaxyProgress(G.id);gp.combatLevel=lv;gp.visited=true;gp.lastDefeated=lv-1;gp.finalDefeated=false;newRun();S.phase='combat';
    for(let f=0;f<750*60&&S.phase==='combat'&&gp.lastDefeated<lv;f++){
     if(f%90===0){const es=enemies.arr.filter(e=>e.on&&!e.dead&&!e.bonusGold&&enemyCanBeHit(e,true));es.sort((a,b)=>(b.stageBoss?10:b.t)-(a.stageBoss?10:a.t));if(es[0])S.priority={id:es[0].id,until:S.time+8,locked:false};}
     simulateCombat(1/60);if(f%30===0)render();
    }
    render();return JSON.stringify({SAVE,S,Director,randomState:seed,active:enemies.arr.filter(e=>e.on),shots:projs.arr.filter(e=>e.on),beams:beams.arr.filter(e=>e.on)});
   },g);assert.deepEqual(x.errors,[],build+' console');results.push(result);await x.context.close();
  }
  assert.equal(results[0],results[1],'Render changed combat in galaxy '+g);const r=JSON.parse(results[1]);report.combat.push({galaxy:g+1,identical:true,phase:r.S.phase,coins:r.SAVE.econ.total});console.log('IDENTICAL COMBAT',g+1);
 }
 report.passed=true;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log('PRESENTATION ISOLATION PASS',JSON.stringify(report));
}finally{await browser.close();server.close();}
