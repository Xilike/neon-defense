/* Authored first-ten-stage experiment. Existing budget enemies get roles;
   no extra spawns, rewards, RNG, stat tables or adaptive difficulty. */
const VARIETY_LEVELS=Object.freeze([
 {name:'FIRST CONTACT',leaders:[],chargers:[]},
 {name:'WATCH THE DASH',leaders:[],chargers:[.25,.65]},
 {name:'BREAK THE COMMAND',leaders:[.35],chargers:[]},
 {name:'DOUBLE WARNING',leaders:[],chargers:[.2,.45,.7]},
 {name:'HUNT THE LEADERS',leaders:[.28,.68],chargers:[]},
 {name:'CHANGE PRIORITY',leaders:[.3],chargers:[.6]},
 {name:'COMMAND ESCORT',leaders:[.25,.65],chargers:[]},
 {name:'DASH PATROL',leaders:[],chargers:[.22,.48,.74]},
 {name:'BREAK AND REACT',leaders:[.25,.65],chargers:[.45,.8]},
 {name:'TACTICAL TRIAL',leaders:[.2,.6],chargers:[.38,.78]}
]);
function varietySpec(){return G.id==='aurora'&&galaxyLevel(G.id)<=10?VARIETY_LEVELS[galaxyLevel(G.id)-1]:null;}
function resetVarietyEnemy(e){e.varietyRole=null;e.varietyPhase='idle';e.varietyUntil=0;}
function assignVarietyRole(e,index){
 const spec=varietySpec();if(!spec)return;
 const at=fractions=>fractions.some(f=>index===Math.floor(levelSpec().count*f));
 if(at(spec.leaders))e.varietyRole='leader';else if(at(spec.chargers))e.varietyRole='charger';
}
function beginVarietyStage(){
 const spec=varietySpec();if(!spec)return;
 if(spec.leaders.length||spec.chargers.length)toast('LEVEL '+galaxyLevel(G.id)+' · '+spec.name);
}
function varietyAllies(leader){
 if(!leader.on||leader.dead||leader.varietyRole!=='leader'||!enemyCanBeHit(leader,true))return [];
 return enemies.arr.filter(e=>e!==leader&&e.on&&!e.dead&&!e.bonusGold&&!e.boss&&!e.comp&&e.varietyRole!=='leader'&&enemyCanBeHit(e,true)&&Math.abs(e.t-leader.t)<=.16&&Math.abs(e.lane-leader.lane)<=1.6)
  .sort((a,b)=>Math.abs(a.t-leader.t)-Math.abs(b.t-leader.t)||a.id-b.id).slice(0,3);
}
function varietyProtector(e){
 if(!varietySpec()||e.boss||e.bonusGold||e.comp||e.varietyRole==='leader')return null;
 for(const leader of enemies.arr)if(leader.on&&!leader.dead&&leader.varietyRole==='leader'&&varietyAllies(leader).includes(e))return leader;
 return null;
}
function varietyDamage(e,dmg){return varietyProtector(e)?dmg*.75:dmg;}
function updateVarietyEnemy(e){
 if(e.varietyRole!=='charger'||e.bonusGold||e.boss||e.comp)return;
 if(e.varietyPhase==='idle'&&enemyCanBeHit(e,true)&&e.t>=.18){
  if(e.t>.72){e.varietyPhase='spent';return;}
  e.varietyPhase='warning';e.varietyUntil=S.time+1.1;
  const p=w2s(e.lane,e.t);floatText(p.x,p.y-28*p.s,'⚠ DASH IN 1s','#ffae52');SFX.wave();
 }else if(e.varietyPhase==='warning'&&S.time>=e.varietyUntil){
  e.varietyPhase='dash';e.varietyUntil=S.time+.9;
 }else if(e.varietyPhase==='dash'&&S.time>=e.varietyUntil)e.varietyPhase='spent';
}
function varietySpeed(e){return e.varietyRole==='charger'&&e.varietyPhase==='dash'?1.75:1;}
function varietyLeaderDefeated(e){
 if(e.varietyRole!=='leader')return;
 const p=w2s(e.lane,e.t);floatText(p.x,p.y-24*p.s,'COMMAND BROKEN','#8affcb');
}
function drawVarietyTactics(){
 if(!varietySpec())return;
 ctx.save();try{
 for(const e of enemies.arr){
  if(!e.on||e.dead||e.bonusGold||e.boss||e.comp||!e.varietyRole||!enemyIsVisible(e))continue;
  const p=w2s(e.lane,e.t),r=Math.max(9,e.r*p.s);
  if(e.varietyRole==='leader'){
   for(const ally of varietyAllies(e)){
    const q=w2s(ally.lane,ally.t);ctx.strokeStyle='rgba(255,214,94,.65)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='#ffd866';ctx.beginPath();ctx.arc(q.x,q.y,Math.max(9,ally.r*q.s)*1.32,0,TAU);ctx.stroke();
   }
   ctx.strokeStyle='#ffdc69';ctx.fillStyle='#342440';ctx.lineWidth=2;
   ctx.beginPath();ctx.moveTo(p.x-r*.65,p.y-r*1.2);ctx.lineTo(p.x-r*.65,p.y-r*1.75);ctx.lineTo(p.x-r*.22,p.y-r*1.45);ctx.lineTo(p.x,p.y-r*2);ctx.lineTo(p.x+r*.22,p.y-r*1.45);ctx.lineTo(p.x+r*.65,p.y-r*1.75);ctx.lineTo(p.x+r*.65,p.y-r*1.2);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#ffe395';ctx.font='bold '+Math.max(9,Math.round(10*p.s))+'px sans-serif';ctx.textAlign='center';ctx.fillText('LEADER',p.x,p.y-r*2.2);
  }else{
   const warning=e.varietyPhase==='warning',dash=e.varietyPhase==='dash';
   ctx.strokeStyle=warning?'#ffcf68':dash?'#ff704d':'#ffa753';ctx.lineWidth=warning?2.5:1.8;
   for(let k=0;k<2;k++){const y=p.y-r*(1.55+k*.38);ctx.beginPath();ctx.moveTo(p.x-r*.42,y-r*.22);ctx.lineTo(p.x,y);ctx.lineTo(p.x+r*.42,y-r*.22);ctx.stroke();}
   if(warning){const f=Math.max(0,(e.varietyUntil-S.time)/1.1);ctx.beginPath();ctx.arc(p.x,p.y,r*1.5,-Math.PI/2,-Math.PI/2+TAU*f);ctx.stroke();}
   if(dash){ctx.beginPath();ctx.moveTo(p.x,p.y-r*1.2);ctx.lineTo(p.x,p.y-r*2.4);ctx.stroke();}
  }
 }
 }finally{ctx.restore();}
}
