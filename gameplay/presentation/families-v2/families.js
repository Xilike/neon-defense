/* ============ GALAXY FAMILIES v2 — one enemy family per galaxy ============
   v2 closes the gap found by rendering v1 and comparing against the approved
   reference images: every enemy now radiates a colored aura, bodies fill
   their health ring (R = r*1.12), fills are shaded/beveled instead of flat,
   and signature features are bold enough to read at gameplay size.
   Still presentation only: polygons, arcs, gradients, dots, lines.
   Signature detail escalates with tier = galaxyLevel (cap 5). */
function famRand(e, k) { const x = Math.sin((e.id || 7) * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); }
function famAura(p, R, hue, sat, alpha) {
  const g = ctx.createRadialGradient(p.x, p.y, R * 0.4, p.x, p.y, R * 1.55);
  g.addColorStop(0, 'hsla(' + hue + ',' + sat + '%,58%,' + alpha + ')');
  g.addColorStop(1, 'hsla(' + hue + ',' + sat + '%,58%,0)');
  ctx.fillStyle = g;
  ctx.fillRect(p.x - R * 1.55, p.y - R * 1.55, R * 3.1, R * 3.1);
}
function famDiamond(p, R, wMul, hMul, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const pts = [[0, -hMul], [wMul, 0], [0, hMul], [-wMul, 0]];
  ctx.beginPath();
  pts.forEach((pt, i) => {
    const x = p.x + (pt[0] * c - pt[1] * s) * R, y = p.y + (pt[0] * s + pt[1] * c) * R;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.closePath();
}
function drawEnemyBody(e, p, r) {
  const shape = G.enemy.shape, hue = e.hue, gid = G.id;
  const tier = Math.min(5, galaxyLevel(gid));
  const R = r * 1.12; // bodies fill their health ring, as in the references
  if (r > 3) { // ground shadow (shared)
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y + r * 0.95, r * 0.9, r * 0.3, 0, 0, TAU); ctx.fill();
  }
  if (gid === 'singularity') { // SINGULARITY: black hole, wide luminous accretion band
    famAura(p, R, 275, 95, 0.34);
    const band = (front) => {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(-0.42); ctx.scale(1, 0.36);
      const ag = ctx.createLinearGradient(-R, 0, R, 0);
      ag.addColorStop(0, 'hsla(45,100%,64%,.95)'); ag.addColorStop(0.5, 'hsla(280,100%,76%,.95)'); ag.addColorStop(1, 'hsla(45,100%,64%,.95)');
      ctx.strokeStyle = ag;
      for (const [rr, w, a] of [[1.06, 0.3, 0.28], [1.04, 0.2, 0.5], [1.02, 0.11, 0.95]]) {
        ctx.globalAlpha = a; ctx.lineWidth = Math.max(1.4, R * w);
        ctx.beginPath(); ctx.arc(0, 0, R * rr, front ? 0 : Math.PI, front ? Math.PI : TAU); ctx.stroke();
      }
      ctx.restore(); ctx.globalAlpha = 1;
    };
    band(false); // back half of the disk
    ctx.fillStyle = '#010102';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.84, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'hsla(275,100%,74%,.95)'; ctx.lineWidth = Math.max(1.4, 2.2 * p.s);
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.84, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'hsla(280,100%,88%,.8)'; ctx.lineWidth = Math.max(0.8, 1.1 * p.s);
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.84, Math.PI * 0.7, Math.PI * 1.45); ctx.stroke(); // photon glint
    band(true); // front half passes over the sphere
    ctx.fillStyle = 'hsla(45,100%,78%,.95)';
    const sparks = 4 + tier;
    for (let k = 0; k < sparks; k++) {
      const sd = famRand(e, k + 3), a = sd * TAU + S.time * (0.5 + sd), rr = R * (1.1 - ((S.time * 0.12 + sd) % 0.4));
      ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr * 0.75, Math.max(0.9, 1.7 * p.s), 0, TAU); ctx.fill();
    }
  } else if (gid === 'bloodmoon') { // BLOODMOON: horned crimson tile armor, hot core
    famAura(p, R, 350, 90, 0.3);
    ctx.fillStyle = 'hsla(350,60%,9%,1)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.99, 0, TAU); ctx.fill();
    ctx.fillStyle = 'hsla(350,65%,20%,1)';
    for (const hp of [[-2.35, -0.5], [-0.79, 0.5]]) { // horns
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(hp[0]) * R * 0.84, p.y + Math.sin(hp[0]) * R * 0.84);
      ctx.lineTo(p.x + Math.cos(hp[0] + hp[1] * 0.3) * R * 1.3, p.y + Math.sin(hp[0] + hp[1] * 0.3) * R * 1.3);
      ctx.lineTo(p.x + Math.cos(hp[0] + hp[1]) * R * 0.84, p.y + Math.sin(hp[0] + hp[1]) * R * 0.84);
      ctx.closePath(); ctx.fill();
    }
    ctx.lineWidth = Math.max(2, R * 0.3);
    for (let k = 0; k < 8; k++) {
      const a0 = e.wob * 0.2 + k * TAU / 8 + 0.05, a1 = a0 + TAU / 8 - 0.1;
      ctx.strokeStyle = k % 2 ? 'hsla(350,72%,33%,1)' : 'hsla(350,78%,45%,1)';
      ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.8, a0, a1); ctx.stroke();
      ctx.strokeStyle = 'hsla(350,95%,62%,.75)'; ctx.lineWidth = Math.max(1, R * 0.045);
      ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.94, a0, a1); ctx.stroke();
      ctx.lineWidth = Math.max(2, R * 0.3);
    }
    ctx.lineWidth = Math.max(1.4, R * 0.15);
    for (let k = 0; k < 8; k++) {
      const a0 = -e.wob * 0.2 + k * TAU / 8 + 0.07, a1 = a0 + TAU / 8 - 0.14;
      ctx.strokeStyle = k % 2 ? 'hsla(350,65%,24%,1)' : 'hsla(350,70%,30%,1)';
      ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.52, a0, a1); ctx.stroke();
    }
    const pulse = 1 + 0.06 * Math.sin(S.time * 4 + e.wob);
    const cg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 0.4 * pulse);
    cg.addColorStop(0, 'hsla(350,100%,88%,1)'); cg.addColorStop(0.35, 'hsla(350,100%,58%,1)'); cg.addColorStop(1, 'hsla(350,100%,45%,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.4 * pulse, 0, TAU); ctx.fill();
    drawSphere(p.x, p.y, R * 0.27 * pulse, 350, 95, 55, false);
  } else if (gid === 'nexus') { // NEXUS: counter-rotating quantum rings, micro-dot halo ring
    famAura(p, R, hue, 95, 0.3);
    ctx.fillStyle = 'hsla(' + hue + ',100%,80%,.5)';
    for (let k = 0; k < 24; k++) {
      const a = k * TAU / 24 + e.wob * 0.4;
      ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * R * 1.08, p.y + Math.sin(a) * R * 1.08, Math.max(0.6, 0.9 * p.s), 0, TAU); ctx.fill();
    }
    ctx.save();
    ctx.setLineDash([Math.max(2, R * 0.24), Math.max(2, R * 0.13)]);
    ctx.lineDashOffset = -e.wob * 14;
    ctx.lineWidth = Math.max(1.6, R * 0.1);
    ctx.strokeStyle = 'hsla(' + hue + ',98%,72%,1)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.95, 0, TAU); ctx.stroke();
    ctx.restore();
    ctx.lineWidth = Math.max(1.8, R * 0.13);
    ctx.strokeStyle = 'hsla(' + hue + ',95%,60%,1)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.62, 0, TAU); ctx.stroke();
    ctx.lineWidth = Math.max(1.1, R * 0.07);
    ctx.strokeStyle = 'hsla(' + hue + ',100%,86%,1)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.62, -e.wob * 1.6, -e.wob * 1.6 + 2.4); ctx.stroke();
    const nodes = 3 + (tier >= 3 ? 1 : 0) + (tier >= 5 ? 1 : 0);
    for (let k = 0; k < nodes; k++) {
      const a = -e.wob * 1.6 + k * TAU / nodes, nx = p.x + Math.cos(a) * R * 0.62, ny = p.y + Math.sin(a) * R * 0.62;
      ctx.fillStyle = 'hsla(' + hue + ',100%,80%,.35)';
      ctx.beginPath(); ctx.arc(nx, ny, Math.max(2, R * 0.12), 0, TAU); ctx.fill();
      ctx.fillStyle = 'hsla(' + hue + ',100%,92%,1)';
      ctx.beginPath(); ctx.arc(nx, ny, Math.max(1.2, R * 0.055), 0, TAU); ctx.fill();
    }
    if (tier >= 4) {
      ctx.lineWidth = Math.max(1, R * 0.06);
      ctx.strokeStyle = 'hsla(' + hue + ',90%,72%,.65)';
      ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.4, e.wob, e.wob + 3.6); ctx.stroke();
    }
    drawSphere(p.x, p.y, R * 0.3, hue, 95, 62, false);
  } else if (gid === 'nova') { // NOVA: bronze sun-machine, segmented gear ring + teeth
    famAura(p, R, 45, 95, 0.32);
    const rot = e.wob * 0.3;
    const g2 = ctx.createLinearGradient(p.x - R, p.y - R, p.x + R, p.y + R);
    g2.addColorStop(0, 'hsla(42,75%,32%,1)'); g2.addColorStop(1, 'hsla(38,75%,17%,1)');
    polyPath(p.x, p.y, R * 0.66, 6, rot);
    ctx.fillStyle = g2; ctx.fill();
    ctx.strokeStyle = 'hsla(45,90%,58%,.8)'; ctx.lineWidth = Math.max(1.1, 1.5 * p.s); ctx.stroke();
    ctx.fillStyle = 'hsla(43,80%,38%,1)';
    const teeth = 10, trot = S.time * 0.5 + e.wob;
    for (let k = 0; k < teeth; k++) {
      const a = trot + k * TAU / teeth;
      ctx.save(); ctx.translate(p.x + Math.cos(a) * R * 1.0, p.y + Math.sin(a) * R * 1.0); ctx.rotate(a);
      ctx.fillRect(-R * 0.055, -R * 0.1, R * 0.11, R * 0.2);
      ctx.restore();
    }
    ctx.lineWidth = Math.max(1.8, R * 0.15);
    for (let k = 0; k < 12; k++) {
      const a0 = trot + k * TAU / 12 + 0.03, a1 = a0 + TAU / 12 - 0.06;
      ctx.strokeStyle = k % 2 ? 'hsla(45,92%,56%,1)' : 'hsla(43,85%,41%,1)';
      ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.86, a0, a1); ctx.stroke();
    }
    ctx.lineWidth = Math.max(1, R * 0.05);
    ctx.strokeStyle = 'hsla(48,100%,72%,.9)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.68, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'hsla(50,100%,78%,1)'; ctx.lineWidth = Math.max(1.6, 2.6 * p.s);
    for (let k = 0; k < 8; k++) {
      const a = -S.time * 0.7 + k * TAU / 8;
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(a) * R * 0.38, p.y + Math.sin(a) * R * 0.38);
      ctx.lineTo(p.x + Math.cos(a) * R * 0.56, p.y + Math.sin(a) * R * 0.56);
      ctx.stroke();
    }
    const sg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 0.38);
    sg.addColorStop(0, 'hsla(52,100%,92%,1)'); sg.addColorStop(0.6, 'hsla(47,100%,66%,1)'); sg.addColorStop(1, 'hsla(42,100%,52%,1)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.38, 0, TAU); ctx.fill();
  } else if (gid === 'cryon') { // CRYON: elongated ice shard, big tip spikes, bright frost cracks
    famAura(p, R, hue, 90, 0.28);
    const rot = Math.sin(e.wob * 0.5) * 0.12;
    const g2 = ctx.createLinearGradient(p.x, p.y - R, p.x, p.y + R);
    g2.addColorStop(0, 'hsla(' + hue + ',92%,82%,1)');
    g2.addColorStop(0.5, 'hsla(' + hue + ',88%,60%,1)');
    g2.addColorStop(1, 'hsla(' + hue + ',88%,40%,1)');
    famDiamond(p, R, 0.8, 1.16, rot);
    ctx.fillStyle = g2; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.16)'; // top facet light
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - R * 1.16 * Math.cos(rot));
    ctx.lineTo(p.x + R * 0.8, p.y); ctx.lineTo(p.x, p.y); ctx.lineTo(p.x - R * 0.8, p.y);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'hsla(' + hue + ',100%,92%,.95)'; ctx.lineWidth = Math.max(1.5, 2 * p.s);
    famDiamond(p, R, 0.8, 1.16, rot); ctx.stroke();
    ctx.fillStyle = 'hsla(' + hue + ',95%,76%,.95)';
    const c = Math.cos(rot), s = Math.sin(rot);
    for (const pt of [[0, -1.16], [0.8, 0], [0, 1.16], [-0.8, 0]]) { // tip spikes
      const tx = (pt[0] * c - pt[1] * s), ty = (pt[0] * s + pt[1] * c);
      const bx = p.x + tx * R, by = p.y + ty * R;
      const px2 = -ty * 0.13, py2 = tx * 0.13, len = 0.3 + tier * 0.02;
      ctx.beginPath();
      ctx.moveTo(bx + px2 * R, by + py2 * R);
      ctx.lineTo(bx + tx * len * R, by + ty * len * R);
      ctx.lineTo(bx - px2 * R, by - py2 * R);
      ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = Math.max(1, 1.5 * p.s);
    const cracks = 3 + tier;
    for (let k = 0; k < cracks; k++) {
      const a = famRand(e, k + 11) * TAU, rr = R * (0.35 + famRand(e, k + 21) * 0.5);
      const mx = p.x + Math.cos(a + 0.4) * rr * 0.55, my = p.y + Math.sin(a + 0.4) * rr * 0.55;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my);
      ctx.lineTo(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr); ctx.stroke();
    }
    famDiamond(p, R * 0.44, 0.8, 1.16, rot);
    ctx.strokeStyle = 'hsla(' + hue + ',100%,90%,.8)'; ctx.lineWidth = Math.max(1, 1.4 * p.s); ctx.stroke();
    famDiamond(p, R * 0.17, 0.8, 1.16, rot);
    ctx.fillStyle = 'hsla(' + hue + ',100%,94%,1)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1;
    for (let k = 0; k < 3; k++) { // frost sparkles
      const sd = famRand(e, k + 71), sx = p.x + (sd - 0.5) * R * 1.7, sy = p.y + (famRand(e, k + 81) - 0.5) * R * 1.7, sr = R * 0.07;
      ctx.beginPath(); ctx.moveTo(sx - sr, sy); ctx.lineTo(sx + sr, sy); ctx.moveTo(sx, sy - sr); ctx.lineTo(sx, sy + sr); ctx.stroke();
    }
  } else if (shape === 'hex') { // EMBER: DARK basalt hexagon, molten cracks, glowing core
    famAura(p, R, 28, 95, 0.3);
    const rot = e.wob * 0.3;
    const g2 = ctx.createLinearGradient(p.x - R, p.y - R, p.x + R, p.y + R);
    g2.addColorStop(0, 'hsla(' + hue + ',48%,19%,1)');
    g2.addColorStop(1, 'hsla(' + hue + ',45%,8%,1)');
    polyPath(p.x, p.y, R, 6, rot);
    ctx.fillStyle = g2; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.05)';
    for (let k = 0; k < 6; k += 2) { // facet shading
      const a0 = rot + k * TAU / 6, a1 = rot + (k + 1) * TAU / 6;
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(a0) * R, p.y + Math.sin(a0) * R);
      ctx.lineTo(p.x + Math.cos(a1) * R, p.y + Math.sin(a1) * R);
      ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = 'hsla(28,100%,52%,.35)'; ctx.lineWidth = Math.max(3, 5.5 * p.s);
    polyPath(p.x, p.y, R, 6, rot); ctx.stroke();
    ctx.strokeStyle = 'hsla(30,100%,58%,.95)'; ctx.lineWidth = Math.max(1.6, 2.4 * p.s);
    polyPath(p.x, p.y, R, 6, rot); ctx.stroke();
    ctx.strokeStyle = 'hsla(' + hue + ',60%,4%,.7)'; ctx.lineWidth = 1;
    for (let k = 0; k < 6; k++) {
      const a = rot + k * TAU / 6;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(a) * R, p.y + Math.sin(a) * R); ctx.stroke();
    }
    const cracks = 3 + tier;
    for (let k = 0; k < cracks; k++) { // lava cracks: jagged glowing lines core -> rim
      const a = rot + famRand(e, k + 5) * TAU;
      const mx = p.x + Math.cos(a + 0.35) * R * 0.55, my = p.y + Math.sin(a + 0.35) * R * 0.55;
      ctx.strokeStyle = 'hsla(26,100%,52%,.9)'; ctx.lineWidth = Math.max(2, 3.4 * p.s);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my);
      ctx.lineTo(p.x + Math.cos(a) * R * 0.94, p.y + Math.sin(a) * R * 0.94); ctx.stroke();
      ctx.strokeStyle = 'hsla(48,100%,74%,1)'; ctx.lineWidth = Math.max(1, 1.6 * p.s);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my);
      ctx.lineTo(p.x + Math.cos(a) * R * 0.94, p.y + Math.sin(a) * R * 0.94); ctx.stroke();
    }
    const cg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 0.36);
    cg.addColorStop(0, 'hsla(50,100%,86%,1)'); cg.addColorStop(0.45, 'hsla(36,100%,58%,1)'); cg.addColorStop(1, 'hsla(28,100%,50%,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.36, 0, TAU); ctx.fill();
    ctx.fillStyle = 'hsla(48,100%,78%,1)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.15, 0, TAU); ctx.fill();
    ctx.fillStyle = 'hsla(35,100%,66%,.9)';
    for (let k = 0; k < 1 + tier; k++) { // rising ember sparks
      const sd = famRand(e, k + 31), sx = p.x + (sd - 0.5) * R * 1.3;
      const sy = p.y - R * 0.4 - ((S.time * (0.24 + sd * 0.2) + sd) % 0.7) * R;
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.8, 1.5 * p.s), 0, TAU); ctx.fill();
    }
  } else if (shape === 'cube') { // JADE: faceted crystal diamond, outlined inner core
    famAura(p, R, hue, 90, 0.28);
    const rot = Math.sin(e.wob * 0.5) * 0.14;
    const g2 = ctx.createLinearGradient(p.x, p.y - R, p.x, p.y + R);
    g2.addColorStop(0, 'hsla(' + hue + ',85%,70%,1)');
    g2.addColorStop(0.5, 'hsla(' + hue + ',85%,50%,1)');
    g2.addColorStop(1, 'hsla(' + hue + ',85%,32%,1)');
    famDiamond(p, R, 0.82, 1.14, rot);
    ctx.fillStyle = g2; ctx.fill();
    const c = Math.cos(rot), s = Math.sin(rot);
    const V = [[0, -1.14], [0.82, 0], [0, 1.14], [-0.82, 0]].map(pt => [p.x + (pt[0] * c - pt[1] * s) * R, p.y + (pt[0] * s + pt[1] * c) * R]);
    for (let k = 0; k < 4; k++) { // facet light/dark alternation
      ctx.fillStyle = k % 2 ? 'rgba(0,0,0,.13)' : 'rgba(255,255,255,.15)';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(V[k][0], V[k][1]); ctx.lineTo(V[(k + 1) % 4][0], V[(k + 1) % 4][1]); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.4)'; // top facet glint
    ctx.beginPath(); ctx.moveTo(V[0][0], V[0][1]); ctx.lineTo(p.x, p.y); ctx.lineTo(V[3][0], V[3][1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'hsla(' + hue + ',100%,84%,.95)'; ctx.lineWidth = Math.max(1.5, 2 * p.s);
    famDiamond(p, R, 0.82, 1.14, rot); ctx.stroke();
    famDiamond(p, R * 0.48, 0.82, 1.14, rot);
    ctx.strokeStyle = 'hsla(' + hue + ',100%,88%,.85)'; ctx.lineWidth = Math.max(1.1, 1.6 * p.s); ctx.stroke();
    famDiamond(p, R * 0.19, 0.82, 1.14, rot + 0.25);
    ctx.fillStyle = 'hsla(' + hue + ',100%,93%,1)'; ctx.fill();
    if (tier >= 3) { // armor diamond outline in later levels
      famDiamond(p, R * 1.1, 0.82, 1.14, -rot * 0.6);
      ctx.strokeStyle = 'hsla(' + hue + ',100%,80%,.55)'; ctx.lineWidth = Math.max(1.2, 1.8 * p.s); ctx.stroke();
    }
  } else if (shape === 'ring') { // INDIGO: hollow energy ring, orbiting core with trail
    famAura(p, R, hue, 95, 0.3);
    ctx.fillStyle = 'hsla(' + hue + ',90%,55%,.08)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.8, 0, TAU); ctx.fill();
    ctx.lineWidth = Math.max(2.2, R * 0.3);
    ctx.strokeStyle = 'hsla(' + hue + ',95%,60%,1)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.82, 0, TAU); ctx.stroke();
    ctx.lineWidth = Math.max(1.2, R * 0.12);
    ctx.strokeStyle = 'hsla(' + hue + ',100%,84%,1)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.82, e.wob, e.wob + 2.2); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'hsla(' + hue + ',90%,78%,.35)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.45, 0, TAU); ctx.stroke();
    const oa = e.wob * 1.5;
    for (const [back, al, sc] of [[0.5, 0.16, 0.6], [0.25, 0.3, 0.8]]) { // orbiter trail ghosts
      ctx.globalAlpha = al;
      drawSphere(p.x + Math.cos(oa - back) * R * 0.45, p.y + Math.sin(oa - back) * R * 0.45, R * 0.19 * sc, hue, 95, 68, false);
    }
    ctx.globalAlpha = 1;
    drawSphere(p.x + Math.cos(oa) * R * 0.45, p.y + Math.sin(oa) * R * 0.45, R * 0.19, hue, 95, 70, false);
    const cg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 0.16);
    cg.addColorStop(0, 'hsla(' + hue + ',100%,92%,.95)'); cg.addColorStop(1, 'hsla(' + hue + ',100%,70%,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.16, 0, TAU); ctx.fill();
    if (tier >= 3) {
      ctx.lineWidth = Math.max(1, R * 0.07);
      ctx.strokeStyle = 'hsla(' + hue + ',95%,72%,.7)';
      ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.6, -e.wob * 0.8, -e.wob * 0.8 + 3.4); ctx.stroke();
    }
  } else if (shape === 'mech') { // ECLIPSE: DARK gunmetal armor, bevel plate, ember furnace core
    famAura(p, R, hue, 30, 0.22);
    const rot = e.wob * 0.25;
    const g2 = ctx.createLinearGradient(p.x - R, p.y - R, p.x + R, p.y + R);
    g2.addColorStop(0, 'hsla(' + hue + ',13%,30%,1)');
    g2.addColorStop(1, 'hsla(' + hue + ',11%,13%,1)');
    polyPath(p.x, p.y, R, 6, rot);
    ctx.fillStyle = g2; ctx.fill();
    ctx.strokeStyle = 'hsla(' + hue + ',16%,72%,.9)'; ctx.lineWidth = Math.max(1.5, 2 * p.s); ctx.stroke();
    polyPath(p.x, p.y, R * 0.76, 6, rot); // raised inner plate (bevel)
    ctx.fillStyle = 'hsla(' + hue + ',13%,38%,1)'; ctx.fill();
    ctx.strokeStyle = 'hsla(' + hue + ',15%,80%,.55)'; ctx.lineWidth = Math.max(1, 1.4 * p.s); ctx.stroke();
    polyPath(p.x, p.y, R * 0.76, 6, rot);
    ctx.strokeStyle = 'hsla(' + hue + ',10%,6%,.8)';
    ctx.beginPath(); // bottom shade of the bevel
    ctx.arc(p.x, p.y, R * 0.76, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    for (let k = 0; k < 6; k++) { // rivets: dark inset + light offset
      const a = rot + k * TAU / 6, rx = p.x + Math.cos(a) * R * 0.88, ry = p.y + Math.sin(a) * R * 0.88;
      ctx.fillStyle = 'hsla(' + hue + ',10%,8%,.9)';
      ctx.beginPath(); ctx.arc(rx, ry, Math.max(1.1, 2.1 * p.s), 0, TAU); ctx.fill();
      ctx.fillStyle = 'hsla(' + hue + ',14%,85%,.9)';
      ctx.beginPath(); ctx.arc(rx - 0.7, ry - 0.7, Math.max(0.5, 0.8 * p.s), 0, TAU); ctx.fill();
    }
    if (tier >= 3) { // double-layer plate in later levels
      polyPath(p.x, p.y, R * 1.08, 6, rot + 0.26);
      ctx.strokeStyle = 'hsla(' + hue + ',14%,50%,.55)'; ctx.lineWidth = Math.max(1.2, 2 * p.s); ctx.stroke();
    }
    ctx.fillStyle = 'hsla(25,60%,10%,1)'; // furnace housing
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.42, 0, TAU); ctx.fill();
    const pulse = 1 + 0.08 * Math.sin(S.time * 4 + e.wob);
    const cg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 0.36 * pulse);
    cg.addColorStop(0, 'hsla(45,100%,82%,1)'); cg.addColorStop(0.5, 'hsla(28,100%,56%,1)'); cg.addColorStop(1, 'hsla(22,100%,46%,.9)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.36 * pulse, 0, TAU); ctx.fill();
  } else { // AURORA: plasma orb — swirl, bright core, big living bubbles
    famAura(p, R, hue, 95, 0.3);
    drawSphere(p.x, p.y, R, hue, 90, 55, false);
    ctx.save();
    ctx.strokeStyle = 'hsla(' + hue + ',100%,84%,.9)'; ctx.lineWidth = Math.max(1.8, 3 * p.s);
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.52, e.wob * 1.3, e.wob * 1.3 + 3.8); ctx.stroke();
    ctx.strokeStyle = 'hsla(' + hue + ',100%,72%,.55)'; ctx.lineWidth = Math.max(1.4, 2.4 * p.s);
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.76, -e.wob, -e.wob + 2.6); ctx.stroke();
    ctx.fillStyle = 'hsla(' + hue + ',100%,88%,.95)';
    ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.17, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.beginPath(); ctx.arc(p.x - R * 0.3, p.y - R * 0.34, R * 0.07, 0, TAU); ctx.fill();
    const bubbles = 3 + tier;
    ctx.strokeStyle = 'hsla(' + hue + ',100%,88%,.85)'; ctx.lineWidth = Math.max(1, 1.3 * p.s);
    ctx.fillStyle = 'hsla(' + hue + ',100%,82%,.28)';
    for (let k = 0; k < bubbles; k++) {
      const sd = famRand(e, k + 41), a = sd * TAU, rr = R * (0.25 + famRand(e, k + 51) * 0.45);
      const bx = p.x + Math.cos(a) * rr, by = p.y + Math.sin(a) * rr + Math.sin(S.time * 2 + sd * 9) * R * 0.04;
      const br = R * (0.07 + famRand(e, k + 61) * 0.06);
      ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.beginPath(); ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.28, 0, TAU); ctx.fill();
      ctx.fillStyle = 'hsla(' + hue + ',100%,82%,.28)';
    }
    ctx.restore();
  }
}
