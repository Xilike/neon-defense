import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'../..');
const dir=path.join(root,'releases');
const out=import.meta.dirname;
const {chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://local').pathname;
  let f=path.join(dir,p);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  if(!f.startsWith(dir)||!fs.existsSync(f)){res.writeHead(404);res.end();return;}
  res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));
});
await new Promise(resolve=>server.listen(4195,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});
const report={version:'boss-v1',checks:[],runs:[]};
const base='http://127.0.0.1:4195';
async function pageFor(seed=42,manual=true,width=390,height=844,build='boss-v1-lab'){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await context.addInitScript(({seed,manual})=>{
    let state=seed>>>0;Math.random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
    if(manual)window.requestAnimationFrame=()=>0;
  },{seed,manual});
  await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(base+'/'+build+'/?sd2debug=adv&schedule=1&debug=1');
  await page.waitForFunction(()=>typeof ND_BALANCE!=='undefined'&&typeof SAVE!=='undefined');
  return {page,context,errors};
}
try{
 for(const [width,height] of [[360,800],[390,844],[412,915]])for(const open of [false,true]){
  const {page,context,errors}=await pageFor(42,true,width,height);
  for(const kind of ['ELECTRIC','LASER','ROCKET','VOID'])for(const type of ['NORMAL','BOSS']){
   const setup=await page.evaluate(({kind,type,open})=>{
    SAVE.settings.sfx=false;SAVE.settings.fx=false;hideOverlay('ovMenu');
    setPanelCollapsed(!open);resize();newRun();S.phase='combat';clearField();
    for(const k of Object.keys(SAVE.weapons))SAVE.weapons[k]=k===kind;layoutTurrets();
    const e=spawnEnemy(type,'blue',2,type==='BOSS'?.30:.18);e.speed=e.baseSpeed=0;e.visibleFor=2;e.hp=e.maxhp=3000;
    const t=turrets.find(t=>t.kind===kind);t.cool=0;
    const auto=pickTarget(t);const p=w2s(e.lane,e.t);
    return {id:e.id,x:p.x,y:p.y,autoTarget:auto?.id??null,hp:e.hp,visible:enemyIsVisible(e)};
   },{kind,type,open});
   assert.equal(setup.autoTarget,null);assert(setup.visible);
   await page.touchscreen.tap(setup.x,setup.y);
   const shot=await page.evaluate(({id,kind})=>{
    const e=enemyById(id),t=turrets.find(t=>t.kind===kind);const selected=S.priority?.id;
    t.cool=0;updateTurrets(1/60);
    // The fired packet must retain manual authorization even after focus changes.
    S.priority=null;
    for(let f=0;f<120;f++){S.time+=1/60;updateShots(1/60);}
    return {selected,hp:e.hp,targetId:t.targetId,phase:S.phase};
   },{id:setup.id,kind});
   assert.equal(shot.selected,setup.id);assert(shot.hp<setup.hp,JSON.stringify({width,height,open,kind,type,setup,shot}));
   report.checks.push({width,height,open,kind,type,autoWaited:true,manualDamage:setup.hp-shot.hp});
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 {
  const {page,context,errors}=await pageFor();
  const res=await page.evaluate(()=>{
   SAVE.settings.sfx=false;hideOverlay('ovMenu');newRun();S.phase='combat';clearField();
   const e=spawnEnemy('NORMAL','blue',2,.3);e.visibleFor=.2;e.hp=1000;const p=w2s(e.lane,e.t);canvasTap(p.x,p.y);
   const t=turrets[0];t.cool=.25;const first=pickTarget(t);const kept=S.priority?.id===e.id;
   damageEnemy(e,1000,undefined,'ELECTRIC',true);const graceBlocked=e.hp===1000;
   e.visibleFor=2;updateTurrets(.1);const cooling=projs.alive===0;
   updateTurrets(.16);const fired=projs.alive>0;const cooldown=t.cool;
   canvasTap(p.x,p.y);updateTurrets(.1);const notReset=t.cool<cooldown&&projs.alive===1;
   e.t=-.05;e.visibleFor=10;damageEnemy(e,10000,undefined,'LASER',true);const hiddenBlocked=e.hp===1000;
   return {first:first===null,kept,graceBlocked,cooling,fired,notReset,hiddenBlocked};
  });assert(Object.values(res).every(Boolean),JSON.stringify(res));assert.deepEqual(errors,[]);report.contracts=res;await context.close();
 }
 fs.writeFileSync(path.join(out,'focus-results.json'),JSON.stringify(report,null,2)+'\n');
 console.log('FOCUS VERIFIED',report.checks.length,'targeted cases + visibility/cooldown');
}finally{await browser.close();server.close();}
