/* UI v3.1 — the ball is the reference.
   Every enemy wears the reference ball's hardware at all times: a segmented
   ring around the body (dark track segments + lit segments = remaining HP),
   a thin outer rim and tick marks. Full HP = full ring lit, so the design is
   visible before the first hit — not only after damage. Pure painter. */
function drawOrbHealthRing(e, p, r) {
  const frac = clamp(e.hp / e.maxhp, 0, 1);
  const rr = r * 1.24, lw = Math.max(2.4, 3.4 * p.s), segs = 10;
  const col = frac > 0.5 ? '#7dff9a' : frac > 0.25 ? '#ffd54a' : '#ff5d5d';
  ctx.save();
  // soft glow bed under the ring
  ctx.lineWidth = lw * 2.1;
  ctx.strokeStyle = 'hsla(' + e.hue + ',95%,55%,.16)';
  ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, TAU); ctx.stroke();
  // outer rim + ticks (the reference ball's mechanical edge)
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(170,215,255,.40)';
  ctx.beginPath(); ctx.arc(p.x, p.y, rr + lw * 0.95, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(170,215,255,.5)';
  ctx.lineWidth = Math.max(1, 1.2 * p.s);
  for (let k = 0; k < 12; k++) {
    const a = k * TAU / 12 + 0.13, r0 = rr + lw * 1.05, r1 = r0 + lw * 0.55;
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(a) * r0, p.y + Math.sin(a) * r0);
    ctx.lineTo(p.x + Math.cos(a) * r1, p.y + Math.sin(a) * r1);
    ctx.stroke();
  }
  // segmented ring: track first, then lit segments by HP, from the top
  const gap = 0.10, span = (TAU - gap * segs) / segs, lit = frac * segs;
  ctx.lineWidth = lw;
  for (let k = 0; k < segs; k++) {
    const a0 = -Math.PI / 2 + k * (span + gap), a1 = a0 + span;
    ctx.strokeStyle = 'rgba(10,18,38,.72)';
    ctx.beginPath(); ctx.arc(p.x, p.y, rr, a0, a1); ctx.stroke();
    if (k < Math.ceil(lit)) {
      const b1 = a0 + span * Math.min(1, lit - k);
      if (b1 > a0) {
        ctx.strokeStyle = col;
        ctx.beginPath(); ctx.arc(p.x, p.y, rr, a0, b1); ctx.stroke();
      }
    }
  }
  ctx.restore();
}
