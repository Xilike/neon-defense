/* User-supplied Gemini concept, adapted to this exact release.
   Pacing IS a gameplay experiment: counts/stats/prices stay fixed, order/lanes
   change. Never apply this to the preserved comparison baseline. */
(function(){
 'use strict';
 cv.addEventListener('pointerdown',()=>{if(!sideMenuItems.hidden)closeSideMenu();},{passive:true});
 let surge35Shown=false,surge70Shown=false,formationStep=0;
 const origBegin=Director.begin.bind(Director);
 Director.begin=function(){
  origBegin();surge35Shown=false;surge70Shown=false;formationStep=0;
  if(this.deck&&this.deck.length>20){
   const buckets={NORMAL:[],RUNNER:[],TANK:[],SPLITTER:[],SHIELDED:[],SUPPORTER:[]},other=[];
   for(const t of this.deck){if(buckets[t])buckets[t].push(t);else other.push(t);}
   const paced=[];let remaining=this.deck.length-other.length;
   while(remaining>0){
    for(const [kind,count]of[['NORMAL',3],['RUNNER',2],['SPLITTER',2],['TANK',1],['SHIELDED',1],['SUPPORTER',1]]){
     for(let i=0;i<count&&buckets[kind].length;i++){paced.push(buckets[kind].pop());remaining--;}
    }
   }
   // Preserve future unknown types instead of converting them to NORMAL.
   this.deck=paced.concat(other);
  }
 };
 const origUpdate=Director.update.bind(Director);
 Director.update=function(dt){
  const previous=this.spawned;
  // Pools reuse slots; the newest entity is not necessarily enemies.arr[n-1].
  const before=new Set(enemies.arr.filter(e=>e.on).map(e=>e.id));
  origUpdate(dt);
  if(this.spawned>previous&&this.deck.length>0){
   const prog=this.spawned/this.deck.length;
   if(!surge35Shown&&prog>=.35){surge35Shown=true;toast('⚡ FLANK FORMATION · Focus priority targets!');SFX.wave();}
   if(!surge70Shown&&prog>=.70){surge70Shown=true;toast('🛡 V FORMATION APPROACHING!');SFX.wave();}
   const e=enemies.arr.find(e=>e.on&&!e.dead&&e.levelKind==='budget'&&!before.has(e.id));
   if(e){
    const v=[2,1,3,0,4],pincer=[0,4,1,3,2];
    if(prog>=.33&&prog<=.45)e.lane=pincer[formationStep%5];
    else if(prog>=.68&&prog<=.80)e.lane=v[formationStep%5];
    e.laneFrom=e.laneTo=e.lane;formationStep++;
   }
  }
 };
 const origRender=render;
 window.render=function(){
  origRender();ctx.save();
  try{
   if(!panelCollapsed&&curTab==='defense'&&openWeapon){
    const t=turrets.find(x=>x.kind===openWeapon);
    if(t){const p=turretPos(t),s=p.s;ctx.strokeStyle='hsla('+TURRET_DEF[t.kind].hue+',100%,70%,.9)';ctx.lineWidth=2.5*s;ctx.beginPath();ctx.ellipse(p.x,p.y+2*s,29*s,10*s,0,0,TAU);ctx.stroke();}
   }
   for(let i=0;i<enemies.n;i++){
    const e=enemies.arr[i];if(!e.on||e.dead)continue;
    const p=w2s(e.lane,e.t),r=Math.max(9,e.r*p.s);
    if(!e.bonusGold&&enemyIsVisible(e)&&(e.visibleFor||0)<.70){
     const f=clamp((e.visibleFor||0)/.70,0,1);ctx.strokeStyle='rgba(130,220,255,'+(.65*(1-f)).toFixed(2)+')';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(p.x,p.y,r*(1.45-.2*f),0,TAU);ctx.stroke();
    }
    if(e.stageBoss&&e.guardianEngagedAt!==null){
     const total=levelSpec().guardianBattleSeconds,left=Math.max(0,total-(S.time-e.guardianEngagedAt)),f=clamp(left/total,0,1);
     const bw=72*p.s,bh=5,bx=p.x-bw/2,by=p.y-r*1.55-15*p.s;
     ctx.fillStyle='rgba(4,10,26,.88)';ctx.fillRect(bx-1,by-1,bw+2,bh+2);
     ctx.fillStyle=e.guardianEnraged?'#ff3b4d':f<.3?'#ff8a36':'#ffd54a';ctx.fillRect(bx,by,bw*f,bh);
     ctx.font='bold '+Math.max(9,Math.round(10*p.s))+'px Tahoma';ctx.textAlign='center';ctx.fillStyle=e.guardianEnraged?'#ff6b7a':'#ffe89e';
     ctx.fillText(e.guardianEnraged?'⚠ SIEGE RUSH!':'⏱ '+Math.ceil(left)+'s',p.x,by-4);
    }
    if(S.priority&&S.priority.id===e.id){
     const rr=r*1.56,rem=S.priority.locked?1:clamp((S.priority.until-S.time)/8,0,1);
     ctx.strokeStyle=S.priority.locked?'#ff4d5e':'#ffd54a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,rr,-Math.PI/2,-Math.PI/2+TAU*rem);ctx.stroke();
     for(let k=0;k<4;k++){const a=k*Math.PI/2+S.time*.9;ctx.beginPath();ctx.moveTo(p.x+Math.cos(a)*(rr-3),p.y+Math.sin(a)*(rr-3));ctx.lineTo(p.x+Math.cos(a)*(rr+5),p.y+Math.sin(a)*(rr+5));ctx.stroke();}
    }
   }
  }finally{ctx.restore();}
 };
 // The appended CSS arrives after initial resize; recompute projection once.
 resize();
})();
