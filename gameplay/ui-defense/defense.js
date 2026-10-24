/* Visual ground plane and energy wall. projY(1) remains the combat boundary. */
function defenseWallGeometry(){
 const base=projY(1),left=W*.065,right=W*.935;
 const rise=clamp((GY-HOR)*.085,28,43);
 return{base,left,right,rise,topEdge:base-rise*.66,topCenter:base-rise*1.3};
}
function traceDefenseWall(c,g){
 c.beginPath();c.moveTo(g.left,g.base);
 c.lineTo(g.left,g.topEdge);
 c.quadraticCurveTo(W*.5,g.topCenter,g.right,g.topEdge);
 c.lineTo(g.right,g.base);
 c.quadraticCurveTo(W*.5,g.base-5,g.left,g.base);c.closePath();
}
function drawDefenseLine(){
 const g=defenseWallGeometry(),hp=clamp(S.baseHP/Math.max(1,S.baseMax),0,1);
 const shield=S.time<(S.lineShieldUntil||0),hit=S.time<(S.defenseImpactUntil||0);
 const hue=shield?156:hp<=.25?8:hp<=.5?38:190;
 const color=a=>'hsla('+hue+',95%,65%,'+a+')';
 ctx.save();
 // A quiet deck supports the turrets. Its front edge is deliberately unlit:
 // the defense boundary is the wall in front of them, not a frame below them.
 const floor=ctx.createLinearGradient(0,g.base,0,H);
 floor.addColorStop(0,'#101d32');floor.addColorStop(.55,'#0b1425');floor.addColorStop(1,'#050a17');
 ctx.fillStyle=floor;ctx.beginPath();ctx.moveTo(g.left-10,g.base+2);ctx.lineTo(g.right+10,g.base+2);ctx.lineTo(W*.99,H+3);ctx.lineTo(W*.01,H+3);ctx.closePath();ctx.fill();
 ctx.strokeStyle='rgba(116,153,188,.12)';ctx.lineWidth=1;
 for(let i=0;i<5;i++){
  const x=W*(.16+i*.17);ctx.beginPath();ctx.moveTo(x,g.base+4);ctx.lineTo(x+(x-W/2)*.10,H);ctx.stroke();
 }
 // The wall rises vertically from the existing ground contact line.
 traceDefenseWall(ctx,g);const fill=ctx.createLinearGradient(0,g.topCenter,0,g.base);
 fill.addColorStop(0,color(shield?.22:.11));fill.addColorStop(.52,color(shield?.13:.065));fill.addColorStop(1,color(.035));
 ctx.fillStyle=fill;ctx.fill();ctx.save();ctx.clip();
 // Thin hex cells are clipped to the wall; never cover the battlefield above it.
 const r=10,stepX=r*1.5,stepY=Math.sqrt(3)*r;
 ctx.strokeStyle=color(shield?.24:.13);ctx.lineWidth=.65;
 for(let col=0,x=g.left-r;x<g.right+r;x+=stepX,col++)for(let y=g.topCenter-r;y<g.base+r;y+=stepY){
  const cy=y+(col%2)*stepY/2;ctx.beginPath();
  for(let k=0;k<6;k++){const a=k*Math.PI/3,px=x+Math.cos(a)*r,py=cy+Math.sin(a)*r;k?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  ctx.closePath();ctx.stroke();
 }
 if(hit){ctx.fillStyle=color(.18);ctx.fillRect(g.left,g.topCenter,g.right-g.left,g.rise*2);}
 if(shield&&SAVE.settings.fx){
  const x=g.left+((S.time*.2)%1)*(g.right-g.left),sweep=ctx.createLinearGradient(x-18,0,x+18,0);
  sweep.addColorStop(0,color(0));sweep.addColorStop(.5,color(.13));sweep.addColorStop(1,color(0));ctx.fillStyle=sweep;ctx.fillRect(x-18,g.topCenter,36,g.rise*2);
 }
 ctx.restore();
 // Bowed upper rail, straight ground contact. Both are ahead of turret bases.
 ctx.strokeStyle=color(hit?.95:shield?.85:.62);ctx.lineWidth=shield?2.1:1.5;
 ctx.shadowColor=color(.7);ctx.shadowBlur=shield?9:5;
 ctx.beginPath();ctx.moveTo(g.left,g.topEdge);ctx.quadraticCurveTo(W/2,g.topCenter,g.right,g.topEdge);ctx.stroke();
 ctx.shadowBlur=0;ctx.strokeStyle=color(.25);ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(g.left,g.base);ctx.quadraticCurveTo(W/2,g.base-5,g.right,g.base);ctx.stroke();
 // Two small emitters anchor the wall without decorative buildings or labels.
 for(const x of[g.left,g.right]){
  const metal=ctx.createLinearGradient(x-4,0,x+4,0);metal.addColorStop(0,'#172d43');metal.addColorStop(.5,'#52738b');metal.addColorStop(1,'#102239');
  ctx.fillStyle=metal;ctx.beginPath();ctx.roundRect(x-4,g.topEdge-3,8,g.base-g.topEdge+7,2);ctx.fill();
  ctx.fillStyle=color(.85);ctx.fillRect(x-1,g.topEdge+2,2,g.base-g.topEdge-3);
 }
 ctx.restore();
}
