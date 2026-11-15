/* Home hero light stream (2026-11-14, in the style of a picture the user supplied, drawn from scratch): a bright vertical beam of
   data on the left of the hero, thin circuit lines rising beside it with packets climbing them, sparks drifting up, and circuit traces
   fanning out across a floor below the horizon. Drawn on a canvas; pauses when the hero is off screen or the tab is hidden.
   Reduced motion: one still frame. */
(() => {
  'use strict';
  const host = document.querySelector('[data-hero-stream]');
  if (!host) return;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const g = canvas.getContext('2d');
  const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CYAN = [79, 195, 255], GOLD = [255, 179, 71], WHITE = [235, 245, 255];
  const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
  let seed = 41;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  let W = 0, H = 0, DPR = 1, bx = 0, horizon = 0;
  let risers = [], floor = [], sparks = [];
  const build = () => {
    seed = 41;
    bx = W * 0.36; horizon = H * 0.64; // the beam sits left of the headline; the wider stream spreads to either side
    risers = Array.from({ length: 44 }, () => {
      const side = rnd() < .5 ? -1 : 1;
      const x = bx + side * (6 + Math.pow(rnd(), 1.2) * W * 0.5);
      const top = horizon - (0.12 + rnd() * 0.78) * horizon;
      return { x, top, gold: rnd() < .35, a: .25 + rnd() * .45, ring: rnd() < .18, speed: .25 + rnd() * .6, t: rnd() };
    });
    floor = Array.from({ length: 18 }, (_, i) => {
      const s = (i / 17) * 2 - 1;                       // -1 .. 1, left to right
      const spread = s * W * 1.1;
      const bend = .3 + rnd() * .35;                     // where the trace turns
      return { s, spread, bend, gold: i % 3 === 1, a: .3 + rnd() * .35, speed: .2 + rnd() * .35, t: rnd() };
    });
    sparks = Array.from({ length: 110 }, () => ({
      x: bx + (rnd() - .5) * W * .9, y: rnd() * horizon, r: .6 + rnd() * 1.4, gold: rnd() < .4,
      vy: 4 + rnd() * 14, tw: rnd() * Math.PI * 2, cross: rnd() < .12,
    }));
  };
  const resize = () => {
    const r = host.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  };

  const floorPoint = (f, u) => {                       // u: 0 at the horizon, 1 at the bottom edge
    const bendY = horizon + (H - horizon) * f.bend;
    const bendX = bx + f.spread * f.bend * .55;
    if (u <= f.bend) { const k = u / f.bend; return [bx + (bendX - bx) * k, horizon + (bendY - horizon) * k]; }
    const k = (u - f.bend) / (1 - f.bend);
    return [bendX + (bx + f.spread - bendX) * k, bendY + (H - bendY) * k];
  };

  const draw = (time) => {
    const t = time / 1000;
    g.clearRect(0, 0, W, H);
    // soft light from the left edge
    const side = g.createRadialGradient(0, H * .35, 0, 0, H * .35, W * .9);
    side.addColorStop(0, rgba(CYAN, .22)); side.addColorStop(1, rgba(CYAN, 0));
    g.fillStyle = side; g.fillRect(0, 0, W, H);
    g.lineCap = 'round';

    // floor traces, fanning out toward the viewer, with packets running out along them
    floor.forEach(f => {
      g.strokeStyle = rgba(f.gold ? GOLD : CYAN, f.a * .7); g.lineWidth = 1;
      g.beginPath();
      for (let u = 0; u <= 1.0001; u += .05) { const [x, y] = floorPoint(f, u); u === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
      const u = (f.t + t * f.speed) % 1;
      const [px, py] = floorPoint(f, u);
      g.fillStyle = rgba(f.gold ? GOLD : CYAN, .9 * (1 - u * .4));
      g.beginPath(); g.arc(px, py, 1.6 + u * 2.2, 0, Math.PI * 2); g.fill();
    });

    // thin lines rising beside the beam, with a packet climbing each one
    risers.forEach(r => {
      const c = r.gold ? GOLD : CYAN;
      const grad = g.createLinearGradient(0, horizon, 0, r.top);
      grad.addColorStop(0, rgba(c, r.a)); grad.addColorStop(1, rgba(c, r.a * .25));
      g.strokeStyle = grad; g.lineWidth = 1;
      g.beginPath(); g.moveTo(r.x, horizon); g.lineTo(r.x, r.top); g.stroke();
      if (r.ring) { g.strokeStyle = rgba(c, .7); g.beginPath(); g.arc(r.x, r.top, 3.4, 0, Math.PI * 2); g.stroke(); }
      else { g.fillStyle = rgba(c, .8); g.beginPath(); g.arc(r.x, r.top, 1.6, 0, Math.PI * 2); g.fill(); }
      const k = (r.t + t * r.speed * .35) % 1;
      const y = horizon - (horizon - r.top) * k;
      const pk = g.createLinearGradient(0, y + 14, 0, y);
      pk.addColorStop(0, rgba(c, 0)); pk.addColorStop(1, rgba(WHITE, .95));
      g.strokeStyle = pk; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(r.x, y + 14); g.lineTo(r.x, y); g.stroke();
    });

    // the beam: a wide cyan glow, a gold core above the horizon, a cyan core below it, a hot spot where they meet
    const pulse = .85 + .15 * Math.sin(t * 2.2);
    const glow = g.createLinearGradient(bx - 64, 0, bx + 64, 0);
    glow.addColorStop(0, rgba(CYAN, 0)); glow.addColorStop(.5, rgba(CYAN, .32 * pulse)); glow.addColorStop(1, rgba(CYAN, 0));
    g.fillStyle = glow; g.fillRect(bx - 64, 0, 128, H);
    const core = g.createLinearGradient(0, 0, 0, horizon);
    core.addColorStop(0, rgba(GOLD, .55)); core.addColorStop(.5, rgba(GOLD, .95)); core.addColorStop(1, rgba(WHITE, 1));
    g.fillStyle = rgba(GOLD, .35 * pulse); g.fillRect(bx - 6, 0, 12, horizon);
    g.fillStyle = core; g.fillRect(bx - 1.6, 0, 3.2, horizon);
    g.fillStyle = rgba(CYAN, .9); g.fillRect(bx - 1.2, horizon, 2.4, H - horizon);
    const spot = g.createRadialGradient(bx, horizon, 0, bx, horizon, 46);
    spot.addColorStop(0, rgba(WHITE, .9 * pulse)); spot.addColorStop(.25, rgba(GOLD, .55 * pulse)); spot.addColorStop(1, rgba(GOLD, 0));
    g.fillStyle = spot; g.beginPath(); g.arc(bx, horizon, 46, 0, Math.PI * 2); g.fill();

    // sparks drifting up and twinkling
    sparks.forEach(s => {
      const y = ((s.y - t * s.vy) % horizon + horizon) % horizon;
      const a = .35 + .55 * (0.5 + 0.5 * Math.sin(t * 2 + s.tw));
      const c = s.gold ? GOLD : WHITE;
      g.fillStyle = rgba(c, a);
      g.beginPath(); g.arc(s.x, y, s.r, 0, Math.PI * 2); g.fill();
      if (s.cross) { g.strokeStyle = rgba(c, a * .8); g.lineWidth = .8; g.beginPath(); g.moveTo(s.x - 5, y); g.lineTo(s.x + 5, y); g.moveTo(s.x, y - 5); g.lineTo(s.x, y + 5); g.stroke(); }
    });
  };

  let raf = 0, inView = true;
  const loop = (time) => { draw(time); raf = requestAnimationFrame(loop); };
  const start = () => { if (!raf && !still) raf = requestAnimationFrame(loop); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  const sync = () => (inView && !document.hidden ? start() : stop());

  resize();
  draw(still ? 4000 : 0);
  if ('ResizeObserver' in window) new ResizeObserver(() => { resize(); if (still) draw(4000); }).observe(host);
  if (!still) {
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; sync(); })).observe(host);
    document.addEventListener('visibilitychange', sync);
    sync();
  }
})();
