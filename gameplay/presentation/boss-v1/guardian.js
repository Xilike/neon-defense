/* Stage guardians: presentation only. Body/hitbox, movement and state untouched.
   Shapes stay inside the existing guardian halos; no RNG or entity writes. */
function drawStageGuardian(e,p,r){
 ctx.save();
 try{
  const gi=ND_CAMPAIGN.ids.indexOf(G.id),h=[185,18,145,235,280,42,195,350,265,290][gi]||185;
  const rage=!!e.guardianEnraged,ink='#080c1b',edge=`hsl(${h},90%,65%)`;
  const glow=rage?'#ff5747':`hsl(${h},100%,80%)`,tier=Math.min(3,1+Math.floor((galaxyLevel(G.id)-1)/10));
  ctx.translate(p.x,p.y);ctx.scale(r,r);
  ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=.045;
  // A heavy, angular carapace with cheek plates and two swept horns.
  const armor=ctx.createLinearGradient(-.7,-.9,.7,1);
  armor.addColorStop(0,edge);armor.addColorStop(.25,`hsl(${h},45%,25%)`);armor.addColorStop(.65,ink);armor.addColorStop(1,`hsl(${h},65%,32%)`);
  for(const side of [-1,1]){
   ctx.save();ctx.scale(side,1);
   ctx.fillStyle=armor;ctx.strokeStyle=edge;
   ctx.beginPath();ctx.moveTo(.49,-.42);ctx.bezierCurveTo(.9,-.6,1,-.9,.96,-1.18);
   ctx.bezierCurveTo(1.28,-.65,1.04,-.1,.76,.06);ctx.closePath();ctx.fill();ctx.stroke();
   // Wing fins on the flying families; serrated plates on the others.
   ctx.beginPath();ctx.moveTo(.65,-.2);ctx.lineTo(1.06,gi%3===0?-.48:-.12);
   ctx.lineTo(.96,.3);ctx.lineTo(.77,.55);ctx.lineTo(.59,.29);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.restore();
  }
  ctx.fillStyle=armor;ctx.strokeStyle=edge;
  ctx.beginPath();ctx.moveTo(0,-.86);ctx.lineTo(.56,-.65);ctx.lineTo(.79,-.12);
  ctx.lineTo(.63,.55);ctx.lineTo(0,.87);ctx.lineTo(-.63,.55);ctx.lineTo(-.79,-.12);ctx.lineTo(-.56,-.65);ctx.closePath();ctx.fill();ctx.stroke();
  // Crown crest varies by galaxy and grows at stage milestones.
  for(let k=0;k<tier;k++){
   const x=(k-(tier-1)/2)*.22;
   ctx.fillStyle=ink;ctx.strokeStyle=edge;ctx.beginPath();ctx.moveTo(x-.13,-.68);
   ctx.lineTo(x,-1.03-(gi%2)*.09);ctx.lineTo(x+.13,-.68);ctx.closePath();ctx.fill();ctx.stroke();
  }
  // Recessed sockets, sharply angled luminous eyes and a visible toothed jaw.
  for(const side of [-1,1]){
   ctx.save();ctx.scale(side,1);ctx.fillStyle='#01030b';
   ctx.beginPath();ctx.moveTo(.07,-.3);ctx.lineTo(.61,-.39);ctx.lineTo(.5,.05);ctx.lineTo(.12,-.02);ctx.closePath();ctx.fill();
   ctx.fillStyle=glow;ctx.shadowColor=glow;ctx.shadowBlur=Math.min(12,r*.14);
   ctx.beginPath();ctx.moveTo(.13,-.22);ctx.lineTo(.54,-.31);ctx.lineTo(.45,-.06);ctx.lineTo(.16,-.1);ctx.closePath();ctx.fill();
   ctx.restore();
  }
  ctx.fillStyle='#01030b';ctx.beginPath();ctx.moveTo(-.43,.23);ctx.lineTo(.43,.23);ctx.lineTo(.31,.52);ctx.lineTo(0,.64);ctx.lineTo(-.31,.52);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e7f5ff';
  for(let k=0;k<5;k++){
   const x=-.31+k*.155;ctx.beginPath();ctx.moveTo(x-.055,.24);ctx.lineTo(x+.055,.24);ctx.lineTo(x,.39+(k%2)*.06);ctx.closePath();ctx.fill();
  }
  ctx.strokeStyle=edge;ctx.lineWidth=.035;ctx.beginPath();ctx.moveTo(-.39,.57);ctx.lineTo(0,.74);ctx.lineTo(.39,.57);ctx.stroke();
  // Three different forehead signatures; same combat rules for all drawings.
  ctx.fillStyle=glow;
  if(gi%3===0){ctx.beginPath();ctx.arc(0,-.53,.075,0,TAU);ctx.fill();}
  else if(gi%3===1){ctx.beginPath();ctx.moveTo(0,-.68);ctx.lineTo(.1,-.5);ctx.lineTo(0,-.4);ctx.lineTo(-.1,-.5);ctx.closePath();ctx.fill();}
  else{ctx.fillRect(-.13,-.57,.26,.05);ctx.fillRect(-.08,-.47,.16,.04);}
 }finally{ctx.restore();}
}
