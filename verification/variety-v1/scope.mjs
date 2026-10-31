import fs from'node:fs';import path from'node:path';import http from'node:http';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(4213,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});const report={};
async function open(build){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4213/')?r.continue():r.abort());await context.addInitScript(()=>window.requestAnimationFrame=()=>0);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto('http://127.0.0.1:4213/'+build+'/');await page.waitForFunction(()=>typeof SAVE!=='undefined');return{page,context,errors};}
try{
 report.combat=[];
 for(const g of[0,1,5]){
  const results=[];
  for(const build of['boss-v1-lab','variety-v1-lab']){
   const x=await open(build);
   const result=await x.page.evaluate(g=>{
    let seed=197+g;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};SAVE.settings.sfx=false;SAVE.settings.fx=false;SAVE.settings.shake=false;hideOverlay('ovMenu');G=GALAXIES[g];SAVE.galaxy.current=G.id;const lv=g===5?20:g===0?11:1,ref=ND_CAMPAIGN.recommended(lv,g);SAVE.up={...ref.up};SAVE.weapons={...ref.weapons};SAVE.craft=structuredClone(ref.craft);SAVE.econ={avail:ref.wallet,total:ref.total};const gp=galaxyProgress(G.id);gp.combatLevel=lv;gp.visited=true;gp.lastDefeated=lv-1;gp.finalDefeated=false;newRun();S.phase='combat';
    for(let f=0;f<750*60&&S.phase==='combat'&&gp.lastDefeated<lv;f++){
     if(f%90===0){const es=enemies.arr.filter(e=>e.on&&!e.dead&&!e.bonusGold&&enemyCanBeHit(e,true));es.sort((a,b)=>(b.stageBoss?10:b.t)-(a.stageBoss?10:a.t));if(es[0])S.priority={id:es[0].id,until:S.time+8,locked:false};}
     simulateCombat(1/60);if(f%30===0)render();
    }
    render();return JSON.stringify({SAVE,S,Director,randomState:seed,active:enemies.arr.filter(e=>e.on),shots:projs.arr.filter(e=>e.on),beams:beams.arr.filter(e=>e.on)},(k,v)=>['varietyRole','varietyPhase','varietyUntil'].includes(k)?undefined:v);
   },g);assert.deepEqual(x.errors,[],build+' console');results.push(result);await x.context.close();
  }
  assert.equal(results[0],results[1],'Render changed combat in galaxy '+g);const r=JSON.parse(results[1]);report.combat.push({galaxy:g+1,identical:true,phase:r.S.phase,coins:r.SAVE.econ.total});console.log('IDENTICAL COMBAT',g+1);
 }
 report.passed=true;fs.writeFileSync(path.join(out,'scope-results.json'),JSON.stringify(report,null,2)+'\n');console.log('PRESENTATION ISOLATION PASS',JSON.stringify(report));
}finally{await browser.close();server.close();}
