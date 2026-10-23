import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'../..');
const dir=path.join(root,'releases/balanced-v1');
const out=import.meta.dirname;
const {chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://local').pathname;
  const f=path.join(dir,p==='/'?'index.html':p);
  if(!f.startsWith(dir)||!fs.existsSync(f)){res.writeHead(404);res.end();return;}
  res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));
});
await new Promise(resolve=>server.listen(4181,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});
const report={version:'balanced-v1',checks:[],runs:[]};
const base='http://127.0.0.1:4181';
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
  {
    const {page,context,errors}=await pageFor();
    const initial=await page.evaluate(()=>({key:SAVE_KEY,coins:SAVE.econ,up:{...SAVE.up},debug:window.__ND,sd2:window.SD2,locked:window.__sd2PurchasesLocked,text:document.body.innerText}));
    assert.equal(initial.coins.avail,0);assert.equal(initial.up.eDmg,0);assert.equal(initial.debug,undefined);assert.equal(initial.sd2,undefined);assert.equal(initial.locked,undefined);
    assert(!initial.text.includes('SD2 Preview'));assert(!initial.text.includes('TRY NOW'));
    await page.locator('#btnStart').tap();await page.locator('#ovTransit').tap();
    assert.equal(await page.evaluate(()=>autoFireActive()),true);
    const formulas=await page.evaluate(()=>{
      const stats=turretStats('ELECTRIC');const before=Director.hpMult();
      const poor=buyUpgrade('eDmg');addCoins(1000);const total=SAVE.econ.total;
      const price=upgCost(UPGS.find(u=>u.key==='eDmg'));const bought=buyUpgrade('eDmg');
      const exact=upgradeDescription(UPGS.find(u=>u.key==='eDmg'));
      const laser=buyWeapon('LASER');const duplicate=buyWeapon('LASER');
      return {poor,bought,price,total,nowTotal:SAVE.econ.total,avail:SAVE.econ.avail,stats,after:turretStats('ELECTRIC'),beforeHp:before,afterHp:Director.hpMult(),exact,laser,duplicate,power:combatPowerRating()};
    });
    assert.equal(formulas.poor,false);assert.equal(formulas.bought,true);assert.equal(formulas.nowTotal,formulas.total);
    assert.equal(formulas.avail,1000-formulas.price-350);assert.equal(formulas.beforeHp,formulas.afterHp);
    assert(Math.abs(formulas.after.dmg/formulas.stats.dmg-1.1)<1e-12);assert.equal(formulas.laser.ok,true);assert.equal(formulas.duplicate.ok,false);
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)));
    await page.reload();assert.equal(await page.evaluate(()=>SAVE.up.eDmg),1);assert.equal(await page.evaluate(()=>SAVE.weapons.LASER),true);
    assert.equal(await page.evaluate(()=>SAVE.econ.avail),saved.econ.avail);
    const laser=await page.evaluate(()=>{
      newRun();S.phase='combat';clearField();SAVE.settings.sfx=false;SAVE.settings.fx=false;
      const e=spawnEnemy('NORMAL','blue',2,.5);e.hp=e.maxhp=10000;e.speed=0;
      const t=turrets.find(t=>t.kind==='LASER');const start=e.hp;fireLaser(t,e);
      for(let i=0;i<60;i++){S.time+=1/60;updateShots(1/60);}
      return {damage:start-e.hp,expected:turretStats('LASER').dps*turretStats('LASER').beamDur};
    });
    assert(Math.abs(laser.damage-laser.expected)<1e-8,JSON.stringify(laser));
    const shield=await page.evaluate(()=>{
      clearField();const e=spawnEnemy('SHIELDED','blue',2,.5);e.shield=e.maxShield=10;e.hp=e.maxhp=100;e.shieldOn=true;
      damageEnemy(e,30,undefined,'LASER');return {hp:e.hp,shield:e.shield};
    });assert.deepEqual(shield,{hp:80,shield:0});
    const spawn=await page.evaluate(()=>{
      newRun();S.phase='combat';Director.t=1;clearField();
      for(let i=0;i<30;i++)Director.update(1/60);
      const early=enemies.alive;
      for(let i=0;i<31;i++)Director.update(1/60);
      return {early,later:enemies.alive};
    });assert.deepEqual(spawn,{early:0,later:1});
    await page.evaluate(()=>hideOverlay('ovMenu'));
    await page.locator('[data-tab="spacecraft"]').tap();
    await page.evaluate(()=>{SAVE.econ.avail=599;SAVE.econ.total=1000;updateGoldHUD();});
    assert.equal(await page.locator('[data-craftbuy]').isDisabled(),true);
    await page.evaluate(()=>addCoins(1));
    assert.equal(await page.locator('[data-craftbuy]').isDisabled(),false);
    await page.locator('[data-craftbuy]').tap();
    assert.equal(await page.evaluate(()=>SAVE.craft.owned),true);
    const baseUpgrade=await page.evaluate(()=>{S.baseHP=50;addCoins(90);buyUpgrade('base');return {hp:S.baseHP,max:S.baseMax};});
    assert.deepEqual(baseUpgrade,{hp:75,max:145});
    const galaxies=await page.evaluate(()=>{
      const data=[];
      for(const g of GALAXIES){
        SAVE.galaxy.unlocked.push(g.id);enterGalaxy(g.id);confirmEnterGalaxy();
        const e=spawnEnemy('NORMAL',g.enemy.colors[0]);damageEnemy(e,1,undefined,'LASER');render();
        data.push({galaxy:G.id,hp:e.maxhp,phase:S.phase,finite:Number.isFinite(e.hp)});
      }return data;
    });assert.equal(galaxies.length,10);assert(galaxies.every(g=>g.finite&&g.phase==='combat'));
    const limits=await page.evaluate(()=>{
      const broken=defaultSave();broken.econ={avail:999999,total:12};broken.up.eDmg=-4;broken.up.eRate=1e300;broken.craft.up.dmg=-5;broken.galaxy.current='missing';broken.stats.dmg=-9;
      localStorage.setItem(SAVE_KEY,JSON.stringify(broken));loadSave();
      return {coins:SAVE.econ,damage:SAVE.up.eDmg,rate:SAVE.up.eRate,craft:SAVE.craft.up.dmg,current:SAVE.galaxy.current,stats:SAVE.stats.dmg};
    });assert.deepEqual(limits,{coins:{avail:12,total:12},damage:0,rate:30,craft:0,current:'aurora',stats:0});
    assert.deepEqual(errors,[]);report.checks.push({name:'normal play, query immunity, purchases, persistence, DPS, laser integration, shield overflow, timed spawning',passed:true,laser});
    await context.close();
  }
  // Actual production combat functions, 60Hz, natural coins and paid purchases only.
  for(const scenario of (process.env.NEON_SKIP_COMBAT?[]:[{seed:13,seconds:600},{seed:42,seconds:600},{seed:99,seconds:600},{seed:42,seconds:1200,noSpend:true},{seed:42,seconds:4200}])){
    const {seed}=scenario;
    const {page,context,errors}=await pageFor(seed);
    const run=await page.evaluate(({seed,seconds,noSpend=false})=>{
      SAVE.settings.sfx=false;SAVE.settings.fx=false;newRun();S.phase='combat';
      let firstPurchase=null,spent=0,maxAlive=0,guardianKills=0;const purchases=[];const points=[];
      const choose=()=>{
        const avail=SAVE.econ.avail;
        let key=null;
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
          candidates.sort((a,b)=>upgCost(a)-upgCost(b));key=candidates[0]?.key;
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
      return {seed,noSpend,seconds:+S.time.toFixed(1),phase:S.phase,hp:Math.round(S.baseHP),kills:S.kills,earned:SAVE.econ.total,available:SAVE.econ.avail,spent,firstPurchase,level:galaxyLevel(G.id),progress:galaxyProgress(G.id),unlocked:[...SAVE.galaxy.unlocked],maxAlive,purchases,points};
    },scenario);
    assert.deepEqual(errors,[]);assert.equal(run.earned-run.spent,run.available);assert(run.kills>0);report.runs.push(run);
    console.log('RUN',JSON.stringify({...run,points:undefined,purchases:undefined}));await context.close();
  }
  // A real animation loop, touch controls and portrait layout on three phone sizes.
  for(const [width,height] of [[360,800],[390,844],[412,915]]){
    const {page,context,errors}=await pageFor(21,false,width,height);
    await page.locator('#btnStart').tap();await page.locator('#ovTransit').tap();
    await page.waitForFunction(()=>SAVE.stats.kills>=1,{timeout:20000});
    await page.locator('[data-tab="spacecraft"]').tap();
    await page.locator('[data-tab="defense"]').tap();
    const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,game:document.getElementById('battleWrap').getBoundingClientRect().toJSON(),hp:S.baseHP,kills:S.kills}));
    assert.equal(layout.overflow,false);assert(layout.game.height>height*.5);assert.deepEqual(errors,[]);
    if(width===390)await page.screenshot({path:path.join(out,'phone-gameplay.png')});
    report.checks.push({name:'touch + real gameplay '+width+'x'+height,passed:true,layout});await context.close();
  }
  fs.writeFileSync(path.join(out,process.env.NEON_SKIP_COMBAT?'edge-results.json':'results.json'),JSON.stringify(report,null,2)+'\n');
  console.log('VERIFIED',report.checks.length,'groups,',report.runs.length,'combat runs');
}finally{await browser.close();server.close();}
