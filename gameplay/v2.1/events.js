/* Optional gold encounter. No random rolls, no quota, XP, or threat changes. */
const GOLD_EVENT=Object.freeze({firstLevel:2,every:3,drops:3,lifetime:3,warning:1.2,crossing:6,reward:2});
const GoldCarrier={
 active:false,elapsed:0,dropped:0,direction:1,serial:0,
 reset(){this.active=false;this.elapsed=0;this.dropped=0;},
 start(){
  if(this.active||S.phase!=='combat'||Director.phase!=='spawn')return false;
  const gp=galaxyProgress(G.id),lv=galaxyLevel(G.id);
  if((gp.goldVisited||0)>=lv)return false;
  gp.goldVisited=lv;persist();this.active=true;this.elapsed=0;this.dropped=0;
  this.direction=(galaxyIndex(G.id)+Math.floor((lv-2)/3))%2? -1:1;
  this.serial++;SFX.carrier();toast('✦ GOLD COURIER');return true;
 },
 update(dt){
  const lv=galaxyLevel(G.id);
  if(!this.active&&lv>=GOLD_EVENT.firstLevel&&(lv-GOLD_EVENT.firstLevel)%GOLD_EVENT.every===0&&Director.phase==='spawn'&&Director.spawned>=Math.ceil(Director.deck.length*.3))this.start();
  if(!this.active)return;
  this.elapsed+=dt;
  const travel=this.elapsed-GOLD_EVENT.warning;
  if(travel<0)return;
  // Three separated drops within the central lanes, one encounter per eligible level.
  while(this.dropped<GOLD_EVENT.drops&&travel>=[(laneX(.6,.59)+60)/(W+120)*6,3,(laneX(3.4,.59)+60)/(W+120)*6][this.dropped]){
   const lane=this.direction>0?[.6,2,3.4][this.dropped]:[3.4,2,.6][this.dropped];
   spawnGoldOrb(lane);this.dropped++;
  }
  if(travel>=GOLD_EVENT.crossing)this.active=false;
 },
 draw(){
  if(!this.active)return;
  const travel=this.elapsed-GOLD_EVENT.warning;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  const y=HOR+(GY-HOR)*.40;
  if(travel<0){
   ctx.font='bold 12px Tahoma';ctx.fillStyle='#ffdc76';ctx.globalAlpha=.6+.4*Math.sin(this.elapsed*10);
   ctx.fillText(this.direction>0?'✦ GOLD COURIER →':'← GOLD COURIER ✦',W/2,y-24);ctx.restore();return;
  }
  const f=clamp(travel/GOLD_EVENT.crossing,0,1),x=this.direction>0?-60+(W+120)*f:W+60-(W+120)*f;
  ctx.translate(x,y+Math.sin(travel*3)*5);ctx.scale(this.direction,1);
  ctx.shadowColor='#ffd65a';ctx.shadowBlur=14;
  ctx.fillStyle='#f5a934';ctx.beginPath();ctx.moveTo(-39,4);ctx.lineTo(-60,-6);ctx.lineTo(-52,6);ctx.lineTo(-62,13);ctx.closePath();ctx.fill();
  ctx.fillStyle='#273755';ctx.strokeStyle='#ffd97a';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-38,-12);ctx.lineTo(8,-19);ctx.lineTo(39,0);ctx.lineTo(13,15);ctx.lineTo(-35,12);ctx.lineTo(-25,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#89efff';ctx.beginPath();ctx.moveTo(8,-13);ctx.lineTo(26,-1);ctx.lineTo(6,0);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle='#ffcf58';for(let i=0;i<3;i++)ctx.fillRect(-22+i*12,4,7,5);
  ctx.restore();
 }
};
function spawnGoldOrb(lane){
 const e=spawnEnemy('NORMAL','gold',lane,.59);if(!e)return null;
 e.bonusGold=true;e.levelKind='bonus';e.type='GOLD';e.color='gold';e.hue=45;
 e.hp=e.maxhp=Math.round((levelSpec().hp.NORMAL+levelSpec().hp.RUNNER)*.4*G.enemy.hpMul);
 e.r=18;e.speed=e.baseSpeed=0;e.breach=0;e.boss=null;e.comp=null;
 e.goldLife=GOLD_EVENT.lifetime;e.goldLifeStarted=enemyIsVisible(e);e.reward=Math.max(1,Math.round(GOLD_EVENT.reward*(GALAXY_REWARD_MULT[G.id]||1)));e.visibleFor=0;
 return e;
}
function expireGoldOrb(e){
 const p=w2s(e.lane,e.t);burst(p.x,p.y,45,8,80);
 if(S.priority?.id===e.id)S.priority=null;pKill(enemies,e);e.dead=true;
}
function updateGoldOrb(e,dt){
 e.wob+=dt*3;e.hitFlash=Math.max(0,e.hitFlash-dt);
 // Lifetime uses game time, freezes on pause, and begins fully visible.
 if(enemyIsVisible(e))e.goldLifeStarted=true;
 if(e.goldLifeStarted)e.goldLife=Math.max(0,e.goldLife-dt);
 if(e.goldLife<=0)expireGoldOrb(e);
}
function damageGoldOrb(e,dmg){
 const dealt=Math.min(Math.max(0,dmg),e.hp);e.hp-=dealt;e.hitFlash=.12;
 if(dealt>0)SFX.hit();
 if(e.hp<=0)killEnemy(e);return dealt;
}
function collectGoldOrb(e){
 if(e.rewarded)return;e.rewarded=true;e.dead=true;
 const p=w2s(e.lane,e.t);addCoins(e.reward,false);SFX.coin();
 floatText(p.x,p.y-18,'+'+e.reward+' GOLD','#ffe18d',true);burst(p.x,p.y,45,22,220);
 if(S.priority?.id===e.id)S.priority=null;pKill(enemies,e);
}
function drawGoldOrb(e,p,r){
 ctx.save();
 const g=ctx.createRadialGradient(p.x-r*.3,p.y-r*.4,1,p.x,p.y,r);
 g.addColorStop(0,'#fff9c1');g.addColorStop(.35,'#ffe56a');g.addColorStop(1,'#c97c10');
 ctx.fillStyle=g;ctx.shadowColor='#ffc645';ctx.shadowBlur=12;
 ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill();ctx.shadowBlur=0;
 ctx.strokeStyle='#ffe8a2';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,r+5,-Math.PI/2,-Math.PI/2+TAU*e.goldLife/3);ctx.stroke();
 if(S.priority?.id===e.id){ctx.strokeStyle='#76efff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y,r+9,0,TAU);ctx.stroke();}
 ctx.fillStyle='#4f330b';ctx.font='bold '+Math.round(r)+'px Tahoma';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✦',p.x,p.y);
 ctx.fillStyle='#102039';ctx.fillRect(p.x-r,p.y+r+9,r*2,3);ctx.fillStyle='#ffda65';ctx.fillRect(p.x-r,p.y+r+9,r*2*e.hp/e.maxhp,3);
 ctx.restore();
}
function openTurretUpgrades(kind){
 const wasOpen=curTab==='defense'&&!panelCollapsed&&openWeapon===kind;
 curTab='defense';openWeapon=wasOpen?null:kind;
 document.querySelectorAll('#tabbar button').forEach(b=>b.classList.toggle('on',b.dataset.tab==='defense'));
 if(panelCollapsed)setPanelCollapsed(false);renderPanel();SFX.click();
 requestAnimationFrame(()=>{
  const p=document.getElementById('panel'),card=p.querySelector('[data-wtoggle="'+kind+'"]');
  if(card){const row=p.querySelector('.ucardRow');row.scrollLeft=Math.max(0,card.offsetLeft-row.offsetLeft-8);}
 });
}
