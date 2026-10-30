import fs from'node:fs';import path from'node:path';import http from'node:http';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(4193,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});const report={};
async function open(build){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4193/')?r.continue():r.abort());await context.addInitScript(()=>window.requestAnimationFrame=()=>0);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4193/'+build+'/?test=1&sd2debug=adv&schedule=1');await page.waitForFunction(()=>typeof SAVE!=='undefined'&&typeof ND_CAMPAIGN!=='undefined');return{page,context,errors};}
try{
 const{page,context,errors}=await open('boss-v1-lab');
 report.siege=await page.evaluate(()=>{
  SAVE.settings.sfx=false;hideOverlay('ovMenu');G=galaxyById('nova');SAVE.galaxy.current=G.id;galaxyProgress(G.id).combatLevel=20;newRun();S.phase='combat';clearField();Director.phase='clearing';stageGate();const e=enemyById(galaxyProgress(G.id).stageBossId),r={};
  e.visibleFor=0;damageEnemy(e,1,undefined,'ELECTRIC',true);r.hiddenDoesNotStart=e.guardianEngagedAt===null;
  e.t=.55;e.visibleFor=2;damageEnemy(e,1,undefined,'ELECTRIC',true);const at=e.guardianEngagedAt;r.firstValidHitStarts=at===S.time;
  S.time+=1;damageEnemy(e,1,undefined,'ELECTRIC',true);r.hitsDoNotReset=e.guardianEngagedAt===at;
  S.time=at+levelSpec().guardianBattleSeconds-.01;updateGuardianSiege(e,.01);r.noEarlyRush=!e.guardianEnraged;
  S.time=at+levelSpec().guardianBattleSeconds;const t=e.t;updateGuardianSiege(e,.1);r.rushMovesForward=e.guardianEnraged&&e.t>t&&e.slowUntil===0;
  SAVE.weapons.VOID=true;layoutTurrets();S.priority={id:e.id,until:S.time+8};e.hp=e.maxhp=1e12;const before=e.t;fireVoid(turrets.find(t=>t.kind==='VOID'),e);r.rushResistsPull=e.t===before;
  const wallet={...SAVE.econ},stage=galaxyLevel(G.id);S.lineShieldUntil=S.time+100;breachBase(e);
  r.guardianBreachDefeatsAttempt=S.phase==='over'&&S.baseHP===0&&galaxyLevel(G.id)===stage&&!galaxyProgress(G.id).finalDefeated;
  r.earnedCoinsRetained=JSON.stringify(wallet)===JSON.stringify(SAVE.econ);
  retryCombat();r.retryHasFreshSiege=enemies.arr.every(x=>!x.on)&&S.phase==='combat'&&Director.phase==='spawn';
  r.planFromFixedTable=campaignUpgradePlan().includes('/'+(levelSpec().referenceEnd.up.eDmg+1));
  return r;
 });assert(Object.values(report.siege).every(Boolean),JSON.stringify(report));assert.deepEqual(errors,[]);await context.close();report.passed=true;fs.writeFileSync(path.join(out,'siege-results.json'),JSON.stringify(report,null,2)+'\n');console.log('SIEGE PASS',JSON.stringify(report));
}finally{await browser.close();server.close();}
