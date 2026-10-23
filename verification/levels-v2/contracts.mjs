import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'../..');
const dir=path.join(root,'releases/levels-v2');
const out=import.meta.dirname;
const {chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://local').pathname;
  const f=path.join(dir,p==='/'?'index.html':p);
  if(!f.startsWith(dir)||!fs.existsSync(f)){res.writeHead(404);res.end();return;}
  res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));
});
await new Promise(resolve=>server.listen(4183,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});
const report={version:'levels-v2',checks:[],runs:[]};
const base='http://127.0.0.1:4183';
async function pageFor(seed=42,manual=true,width=390,height=844){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await context.addInitScript(({seed,manual})=>{
    let state=seed>>>0;Math.random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
    if(manual)window.requestAnimationFrame=()=>0;
  },{seed,manual});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(base+'/?sd2debug=adv&schedule=1&debug=1');
  await page.waitForFunction(()=>typeof ND_BALANCE!=='undefined'&&typeof SAVE!=='undefined');
  return {page,context,errors};
}
try{
 const {page,context,errors}=await pageFor();
 const result=await page.evaluate(()=>{
  SAVE.settings.sfx=false;newRun();S.phase='combat';
  const rows=ND_LEVELS.stages.map(s=>({level:s.level,count:s.count,sum:Object.values(s.counts).reduce((a,b)=>a+b,0),hp:s.hp.NORMAL}));
  const before=galaxyLevel(G.id);SAVE.player.xp=1000000;galaxyActiveTick(36000);renderPlayerProgress();
  const xpOnly={before,after:galaxyLevel(G.id),label:document.getElementById('playerLevel').textContent};
  const e=spawnEnemy('NORMAL','blue',2,.08);const hp=e.hp;damageEnemy(e,10000,undefined,'LASER');
  const hiddenBlocked=e.hp===hp;
  e.t=.6;e.visibleFor=.5;damageEnemy(e,10000,undefined,'LASER');const graceBlocked=e.hp===hp;
  e.visibleFor=2;damageEnemy(e,10,undefined,'LASER');const visibleDamage=hp-e.hp;
  clearField();Director.phase='clearing';const blocker=spawnEnemy('NORMAL','blue',2,.6);stageGate();const blocked=Director.phase==='clearing';
  pKill(enemies,blocker);stageGate();const boss=enemyById(galaxyProgress(G.id).stageBossId);const bossHp=boss.hp;
  breachBase(boss);const levelAfterEscape=galaxyLevel(G.id);Director.update(8.1);const retryBoss=enemyById(galaxyProgress(G.id).stageBossId);
  const retryHp=retryBoss.hp;retryBoss.t=.6;retryBoss.visibleFor=2;damageEnemy(retryBoss,1e6,undefined,'LASER');
  const afterKill=galaxyLevel(G.id);persist();
  return {rows,xpOnly,hiddenBlocked,graceBlocked,visibleDamage,blocked,bossHp,levelAfterEscape,retryHp,afterKill,keys:Object.keys(localStorage),version:ND_BALANCE.config.version};
 });
 assert.deepEqual(result.rows.map(r=>r.count),Array.from({length:15},(_,i)=>72+12*i));
 assert(result.rows.every(r=>r.count===r.sum));assert.equal(result.xpOnly.before,result.xpOnly.after);assert.equal(result.xpOnly.label,'LEVEL 1');
 assert(result.hiddenBlocked&&result.graceBlocked);assert.equal(result.visibleDamage,10);assert(result.blocked);assert.equal(result.bossHp,1100);assert.equal(result.retryHp,1100);
 assert.equal(result.levelAfterEscape,1);assert.equal(result.afterKill,2);assert.equal(result.version,'2.0.0-levels');
 await page.reload();assert.equal(await page.evaluate(()=>galaxyLevel(G.id)),2);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'level-contract-results.json'),JSON.stringify({passed:true,result,reloadLevel:2,errors},null,2));
 console.log('LEVEL CONTRACTS PASSED');await context.close();
}finally{await browser.close();server.close();}
