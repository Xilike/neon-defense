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
await new Promise(resolve=>server.listen(4182,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});
const report={version:'levels-v2',checks:[],runs:[]};
const base='http://127.0.0.1:4182';
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
  // Actual production combat functions, 60Hz, natural coins and paid purchases only.
  for(const scenario of (process.env.NEON_SKIP_COMBAT?[]:process.env.NEON_SMART_ONLY?[{seed:42,seconds:5400,smart:true}]:[{seed:13,seconds:1800},{seed:42,seconds:1800},{seed:99,seconds:1800},{seed:42,seconds:900,noSpend:true},{seed:42,seconds:5400},{seed:42,seconds:900,cardsOpen:true}])){
    const {seed}=scenario;
    const {page,context,errors}=await pageFor(seed);
    const run=await page.evaluate(({seed,seconds,noSpend=false,cardsOpen=false,smart=false})=>{
      SAVE.settings.sfx=false;SAVE.settings.fx=false;if(cardsOpen){setPanelCollapsed(false);resize();}newRun();S.phase='combat';
      let firstPurchase=null,spent=0,maxAlive=0,guardianKills=0;const purchases=[];const points=[];const hitSamples=[];let hiddenHits=0;const realDamage=damageEnemy;damageEnemy=function(e,...args){const old=e.hp+(e.shield||0);const r=realDamage(e,...args);if(old>e.hp+(e.shield||0)){if(!enemyCanBeHit(e))hiddenHits++;if(hitSamples.length<10)hitSamples.push({at:S.time,y:w2s(e.lane,e.t).y,r:Math.max(9,e.r*w2s(e.lane,e.t).s),header:HOR-22,visibleFor:e.visibleFor});}return r;};
      const choose=()=>{
        const avail=SAVE.econ.avail;
        let key=null;
        if(smart&&SAVE.weapons.VOID&&S.baseHP<S.baseMax*.6&&SAVE.up.base<10&&buyUpgrade('base'))return 'base';
        // A reproducible sensible build, not an optimizer with free resources.
        if(SAVE.up.eDmg<2)key='eDmg';
        else if(SAVE.up.eRate<2)key='eRate';
        else if(!SAVE.weapons.LASER){if(avail>=ECON.weapons.LASER){buyWeapon('LASER');return 'LASER';}return null;}
        else if(SAVE.up.eDmg<4)key='eDmg';
        else if(SAVE.up.eRate<4)key='eRate';
        else if(!SAVE.craft.owned){if(avail>=ECON.spacecraft){buyCraft();return 'CRAFT';}return null;}
        else if(!SAVE.weapons.ROCKET){if(avail>=ECON.weapons.ROCKET){buyWeapon('ROCKET');return 'ROCKET';}return null;}
        else if(!SAVE.weapons.VOID){if(avail>=ECON.weapons.VOID){buyWeapon('VOID');return 'VOID';}return null;}
        else{
          const candidates=UPGS.filter(u=>u.turret&&SAVE.weapons[u.turret]&&SAVE.up[u.key]<u.max&&['eDmg','eRate','lDmg','lEff','rDmg','rRate','vDmg','vRate'].includes(u.key));
          candidates.sort((a,b)=>{if(!smart)return upgCost(a)-upgCost(b);const value=u=>{const before=turretStats(u.turret),after=turretStats(u.turret,{...SAVE.up,[u.key]:SAVE.up[u.key]+1});return (ND_BALANCE.weaponDps(u.turret,after)-ND_BALANCE.weaponDps(u.turret,before))*({ELECTRIC:1.2,LASER:1,ROCKET:2.2,VOID:2}[u.turret])/upgCost(u);};return value(b)-value(a);});key=candidates[0]?.key;
        }
        if(key&&buyUpgrade(key))return key;
        return null;
      };
      for(let frame=0;frame<seconds*60&&S.phase==='combat';frame++){
        const dt=1/60;S.time+=dt;Director.update(dt);galaxyActiveTick(dt);updateEnemies(dt);ultimateTick(dt);updateTurrets(dt);updateCraft(dt);updateShots(dt);updateFx(dt);updatePriority(dt);
        maxAlive=Math.max(maxAlive,enemies.alive);
        if(!noSpend&&frame%180===0){const old=SAVE.econ.avail;const item=choose();if(item){spent+=old-SAVE.econ.avail;firstPurchase??=S.time;purchases.push({at:+S.time.toFixed(1),item});}}
        if(frame%3600===0)points.push({at:+S.time.toFixed(0),hp:Math.round(S.baseHP),kills:S.kills,earned:SAVE.econ.total,dps:combatPowerRating(),level:galaxyLevel(G.id)});
      }
      return {seed,noSpend,cardsOpen,seconds:+S.time.toFixed(1),phase:S.phase,hp:Math.round(S.baseHP),kills:S.kills,earned:SAVE.econ.total,available:SAVE.econ.avail,spent,firstPurchase,level:galaxyLevel(G.id),progress:galaxyProgress(G.id),unlocked:[...SAVE.galaxy.unlocked],maxAlive,purchases,points,hiddenHits,hitSamples};
    },scenario);
    assert.deepEqual(errors,[]);assert.equal(run.earned-run.spent,run.available);assert(run.kills>0);assert.equal(run.hiddenHits,0);report.runs.push(run);
    console.log('RUN',JSON.stringify({...run,points:undefined,purchases:undefined,hitSamples:undefined}));await context.close();
  }
  // A real animation loop, touch controls and portrait layout on three phone sizes.
  for(const [width,height] of (process.env.NEON_SMART_ONLY?[]:[[360,800],[390,844],[412,915]])){
    const {page,context,errors}=await pageFor(21,false,width,height);
    await page.locator('#btnStart').tap();await page.locator('#ovTransit').tap();
    await page.waitForFunction(()=>SAVE.stats.kills>=1,null,{timeout:30000});
    await page.locator('[data-tab="spacecraft"]').tap();
    await page.locator('[data-tab="defense"]').tap();
    const layout=await page.evaluate(()=>({levelText:document.getElementById('playerLevel').textContent,status:document.getElementById('combatLevelStatus').textContent,overflow:document.documentElement.scrollWidth>innerWidth,game:document.getElementById('battleWrap').getBoundingClientRect().toJSON(),hp:S.baseHP,kills:S.kills}));
    assert.equal(layout.overflow,false);assert(layout.game.height>height*.5);assert.deepEqual(errors,[]);
    if(width===390)await page.screenshot({path:path.join(out,'phone-gameplay.png')});
    report.checks.push({name:'touch + real gameplay '+width+'x'+height,passed:true,layout});await context.close();
  }
  fs.writeFileSync(path.join(out,process.env.NEON_SKIP_COMBAT?'edge-results.json':process.env.NEON_SMART_ONLY?'smart-results.json':'results.json'),JSON.stringify(report,null,2)+'\n');
  console.log('VERIFIED',report.checks.length,'groups,',report.runs.length,'combat runs');
}finally{await browser.close();server.close();}
