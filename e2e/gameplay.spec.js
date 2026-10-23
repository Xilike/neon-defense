import {test,expect} from '@playwright/test';
import {createHash} from 'node:crypto';

test('all deployed files match SHA-256 manifest',async({request})=>{
 const response=await request.get('/integrity.json');expect(response.ok()).toBeTruthy();
 const manifest=await response.json();expect(manifest.profile).toBe('test');
 for(const [path,hash] of Object.entries(manifest.sha256)){
  const file=await request.get('/'+path);expect(file.status(),path).toBe(200);
  expect(createHash('sha256').update(await file.body()).digest('hex'),path).toBe(hash);
 }
});

test('earned coins, spending, weapons, shuttle, upgrades, galaxies and persistence',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('#btnStart').click();
 const result=await page.evaluate(()=>{
  const n=window.__ND;
  n.S.phase='paused';
  const insufficient=n.buyWeapon('LASER');
  const badUpgrade=n.buyUpgrade('lDmg');
  const badGalaxy=n.enterGalaxy('ember');
  const e=n.spawnEnemy('NORMAL','cyan',2,0.4);const reward=e.reward;
  n.killEnemy(e);n.killEnemy(e);
  const once=n.SAVE.econ.total===reward;
  n.addCoins(200);
  const total=n.SAVE.econ.total;
  const purchases=['LASER','ROCKET','VOID'].map(k=>n.buyWeapon(k).ok);
  const duplicate=n.buyWeapon('LASER').ok;
  const craft=n.buyCraft().ok;
  const oldDamage=n.craftStats().dmg;
  const upgraded=n.buyCraftUpg('dmg');
  const stronger=n.craftStats().dmg>oldDamage;
  const weaponUpgrade=n.buyUpgrade('eDmg');
  n.addCoins(Infinity);const invalidSpend=n.spendCoins(Infinity);
  const galaxies=n.GALAXIES.map(g=>{const ok=n.enterGalaxy(g.id);n.confirmEnterGalaxy();return ok && n._galaxy().id===g.id && n.S.phase==='combat';});
  n.S.phase='paused';n.persist();
  return {insufficient:insufficient.ok,badUpgrade,badGalaxy,once,purchases,duplicate,craft,upgraded,stronger,weaponUpgrade,invalidSpend,totalAfter:n.SAVE.econ.total,total,galaxies,avail:n.SAVE.econ.avail};
 });
 expect(result).toMatchObject({insufficient:false,badUpgrade:false,badGalaxy:false,once:true,purchases:[true,true,true],duplicate:false,craft:true,upgraded:true,stronger:true,weaponUpgrade:true,invalidSpend:false,galaxies:[true,true,true,true,true]});
 expect(result.totalAfter).toBe(result.total);expect(result.avail).toBeLessThan(result.total);
 await page.reload();
 expect(await page.evaluate(()=>({galaxy:__ND._galaxy().id,craft:__ND.SAVE.craft.owned,total:__ND.SAVE.econ.total}))).toEqual({galaxy:'eclipse',craft:true,total:result.total});
 expect(errors).toEqual([]);
});

test('real continuous combat fires, earns and reaches defeat without wave screens',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{let seed=42;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);});
 await page.goto('/');await page.locator('#btnStart').click();
 const result=await page.evaluate(()=>{
  const n=__ND;n.confirmEnterGalaxy();
  // Advance the real engine at 60 Hz; no damage, currency or health overrides.
  let frames=0;
  while(frames++<60*90 && n.S.phase==='combat'){
   const dt=1/60;n.S.time+=dt;n.Director.update(dt);n.updateEnemies(dt);n.updateTurrets(dt);n.updateCraft(dt);n.updateShots(dt);n.updateFx(dt);n.updatePriority(dt);
  }
  return {phase:n.S.phase,kills:n.S.kills,coins:n.SAVE.econ.total,hp:n.S.baseHP,seconds:frames/60,metrics:SD2.continuous.report()};
 });
 expect(result.kills).toBeGreaterThan(0);expect(result.coins).toBeGreaterThan(0);
 expect(result.seconds).toBeGreaterThan(20);expect(['combat','over']).toContain(result.phase);
 expect(result.metrics.spawned).toBeGreaterThan(10);
 console.log('REAL_ENGINE_90S',JSON.stringify(result));expect(errors).toEqual([]);
});

test('guardian breach continues combat; defeat and retry preserve earned progress',async({page})=>{
 await page.goto('/');await page.locator('#btnStart').click();
 const result=await page.evaluate(()=>{
  const n=__ND;n.confirmEnterGalaxy();
  const guardian=n.spawnEnemy('BOSS','cyan',2,0.9);n.breachBase(guardian);
  const afterGuardian={phase:n.S.phase,hp:n.S.baseHP};
  const e=n.spawnEnemy('NORMAL','cyan',2,0.4);n.killEnemy(e);const coins=n.SAVE.econ.total;
  n.gameOver();const over=n.S.phase;n.retryCombat();
  return {afterGuardian,over,retry:n.S.phase,coins,preserved:n.SAVE.econ.total,health:n.S.baseHP,max:n.S.baseMax};
 });
 expect(result.afterGuardian.phase).toBe('combat');expect(result.afterGuardian.hp).toBeGreaterThan(0);
 expect(result.over).toBe('over');expect(result.retry).toBe('combat');expect(result.coins).toBe(result.preserved);expect(result.health).toBe(result.max);
});

test('purchased shuttle attacks targets in the actual continuous combat engine',async({page})=>{
 await page.goto('/');await page.locator('#btnStart').click();
 const damage=await page.evaluate(()=>{
  const n=__ND;n.confirmEnterGalaxy();n.addCoins(10);n.buyCraft();
  const e=n.spawnEnemy('TANK','cyan',2,0.55);const hp=e.hp;
  for(let f=0;f<600;f++){n.S.time+=1/60;n.updateCraft(1/60);n.updateShots(1/60);}
  return hp-e.hp;
 });
 expect(damage).toBeGreaterThan(0);
});

for(const size of [{width:360,height:800},{width:390,height:844},{width:412,height:915},{width:844,height:390}]){
 test(`portrait layout ${size.width}x${size.height}`,async({page})=>{
  await page.setViewportSize(size);await page.goto('/');await page.locator('#btnStart').click();await page.evaluate(()=>__ND.confirmEnterGalaxy());
  const bounds=await page.evaluate(()=>{
   const rect=id=>{const r=document.getElementById(id).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,b:r.bottom};};
   return {body:document.body.getBoundingClientRect().width,canvas:rect('game'),panel:rect('panel'),scroll:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  expect(bounds.body).toBeLessThanOrEqual(480);expect(bounds.canvas.h).toBeGreaterThan(bounds.canvas.w);
  expect(bounds.canvas.b).toBeLessThanOrEqual(bounds.panel.y);
  expect(bounds.panel.b).toBeLessThanOrEqual(size.height+1);expect(bounds.scroll).toBeLessThanOrEqual(bounds.viewport);
  if(size.width===390)await page.screenshot({path:'test-results/portrait-mobile.png'});
 });
}

test('mobile touch purchase immediately exposes weapon upgrades',async({page})=>{
 await page.goto('/');await page.locator('#btnStart').tap();await page.evaluate(()=>{__ND.confirmEnterGalaxy();__ND.addCoins(10);__ND.renderPanel();});
 await page.locator('[data-weapon="LASER"]').tap();
 await expect(page.locator('[data-buy="lDmg"]')).toBeVisible();
 expect(await page.evaluate(()=>__ND.SAVE.weapons.LASER)).toBe(true);
});

test('corrupt save recovers; production and test storage stay separate',async({page})=>{
 await page.goto('/');await page.evaluate(()=>{localStorage.setItem('neon_sd2_test_v4','{broken');localStorage.setItem('neonDefense2_production','production-sentinel');});
 await page.reload();
 expect(await page.evaluate(()=>__ND.SAVE.econ)).toEqual({avail:0,total:0});
 await page.evaluate(()=>__ND.addCoins(5));
 expect(await page.evaluate(()=>localStorage.getItem('neonDefense2_production'))).toBe('production-sentinel');
});
