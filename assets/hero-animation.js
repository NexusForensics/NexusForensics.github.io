/* Nexus Forensics hero banner animation.
   Draws a live layer over assets/hero-network.svg (same 1600x420 coordinate space):
   - a white signal travels the node network; every node it hits pops a platform mark in the hub
   - captured platforms send packets to the map, where red hotspots flare like a live heat map
   - synthetic (illustrated, not real) faces fade in and out with a match frame on the right
   Pauses off-screen and when the tab is hidden. Skipped for prefers-reduced-motion. */
(() => {
  'use strict';
  const banner = document.querySelector('.hero-banner');
  if (!banner || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;

  const G = {"hub":[250,215],"nodes":[[340.2,224.4,0],[275.3,271.0,0],[184.7,262.6,0],[148.7,208.8,0],[208.1,155.8,0],[302.1,167.2,0],[431.9,277.3,1],[345.3,320.9,1],[205.2,348.6,1],[107.4,300.0,1],[67.4,216.7,1],[92.0,146.3,1],[157.0,110.5,1],[278.6,82.1,1],[383.2,118.9,1],[441.2,203.1,1],[511.2,234.2,2],[482.0,301.6,2],[351.5,381.3,2],[234.6,396.8,2],[95.0,359.6,2],[-13.9,278.7,2],[-27.5,208.0,2],[18.5,104.5,2],[153.0,50.4,2],[306.5,45.8,2],[410.7,62.4,2],[490.5,127.4,2]],"down":[[-1],[-1],[-1],[-1],[-1],[-1],[0,1],[1,0],[2,1],[2,3],[3,2],[3,4],[4,3],[5,4],[5,0],[0,5],[15,6],[6,15],[7,6],[8,7],[9,8],[10,9],[10,11],[11,10],[12,11],[13,14],[14,13],[15,14]],"hot":[[756.4,128.2],[868.6,267.9],[1079.0,100.2],[1135.1,226.0],[1331.5,142.1],[1415.7,309.8]],"dots":[[570,58],[590,58],[610,50],[620,65],[640,50],[650,58],[660,65],[670,65],[680,58],[680,97],[690,73],[690,112],[700,58],[700,97],[700,136],[710,73],[710,112],[720,42],[720,81],[720,120],[730,42],[730,81],[730,120],[730,159],[740,73],[740,112],[740,151],[750,50],[750,89],[750,128],[750,167],[760,58],[760,97],[760,136],[760,175],[770,58],[770,97],[770,136],[780,42],[780,81],[780,120],[780,159],[790,58],[790,97],[790,136],[790,198],[800,73],[800,112],[800,151],[810,58],[810,97],[810,136],[810,252],[820,73],[820,112],[820,229],[830,50],[830,89],[830,128],[830,252],[840,26],[840,81],[840,120],[840,252],[840,299],[840,338],[840,377],[850,58],[850,97],[850,237],[850,276],[850,315],[850,354],[860,34],[860,81],[860,221],[860,260],[860,299],[860,338],[870,34],[870,81],[870,237],[870,276],[870,315],[880,19],[880,58],[880,252],[880,291],[880,330],[890,42],[890,245],[890,284],[890,323],[900,50],[900,260],[900,299],[910,34],[910,252],[910,291],[920,34],[920,252],[920,291],[930,42],[930,276],[940,42],[950,34],[960,34],[970,34],[980,42],[1000,175],[1010,136],[1010,175],[1010,214],[1020,143],[1020,182],[1020,221],[1030,112],[1030,159],[1030,198],[1040,104],[1040,151],[1040,190],[1050,97],[1050,143],[1050,182],[1050,221],[1060,112],[1060,159],[1060,198],[1070,97],[1070,143],[1070,182],[1070,221],[1080,89],[1080,128],[1080,175],[1080,214],[1080,252],[1080,291],[1090,89],[1090,128],[1090,182],[1090,221],[1090,260],[1090,299],[1100,65],[1100,104],[1100,159],[1100,198],[1100,237],[1100,276],[1100,315],[1110,73],[1110,112],[1110,175],[1110,214],[1110,252],[1110,291],[1120,50],[1120,89],[1120,128],[1120,190],[1120,229],[1120,268],[1120,307],[1130,73],[1130,120],[1130,175],[1130,214],[1130,252],[1130,291],[1140,65],[1140,104],[1140,143],[1140,182],[1140,221],[1140,260],[1140,299],[1150,81],[1150,120],[1150,159],[1150,206],[1150,245],[1160,81],[1160,120],[1160,159],[1160,198],[1160,237],[1170,81],[1170,120],[1170,159],[1170,198],[1180,65],[1180,104],[1180,143],[1180,182],[1190,73],[1190,112],[1190,151],[1200,50],[1200,89],[1200,128],[1200,167],[1210,73],[1210,112],[1210,151],[1220,58],[1220,97],[1220,136],[1230,42],[1230,81],[1230,120],[1230,159],[1240,65],[1240,104],[1240,143],[1240,182],[1250,73],[1250,112],[1250,151],[1250,190],[1260,58],[1260,97],[1260,136],[1260,175],[1260,214],[1270,65],[1270,104],[1270,143],[1270,182],[1280,42],[1280,81],[1280,120],[1280,159],[1290,34],[1290,73],[1290,112],[1290,151],[1300,34],[1300,73],[1300,112],[1300,151],[1310,34],[1310,73],[1310,112],[1310,151],[1310,190],[1320,65],[1320,104],[1320,143],[1320,182],[1320,221],[1330,50],[1330,89],[1330,128],[1330,167],[1330,206],[1340,50],[1340,89],[1340,128],[1340,167],[1350,34],[1350,73],[1350,112],[1350,151],[1360,42],[1360,81],[1360,120],[1360,159],[1370,34],[1370,73],[1370,112],[1370,151],[1370,323],[1380,58],[1380,97],[1380,291],[1380,330],[1390,65],[1390,104],[1390,307],[1400,42],[1400,81],[1400,120],[1400,315],[1410,58],[1410,97],[1410,284],[1410,323],[1420,65],[1420,104],[1420,284],[1420,323],[1430,65],[1430,120],[1430,299],[1430,338],[1440,73],[1440,299],[1440,338],[1450,73],[1450,323],[1460,58],[1460,323],[1470,73],[1490,50],[1500,58],[1510,65],[1530,58]]};
  const NS = 'http://www.w3.org/2000/svg';
  const HUB = G.hub;
  const nodes = G.nodes;

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const ease = {
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  const el = (name, attrs, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  /* ---------- overlay skeleton ---------- */
  const svg = el('svg', { class: 'hero-fx', viewBox: '0 0 1600 420', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true', focusable: 'false' });
  svg.innerHTML = `
    <defs>
      <radialGradient id="fxHeatRed"><stop offset="0" stop-color="#ff5a5f" stop-opacity=".95"/><stop offset=".45" stop-color="#ff5a5f" stop-opacity=".35"/><stop offset="1" stop-color="#ff5a5f" stop-opacity="0"/></radialGradient>
      <radialGradient id="fxHeatAmber"><stop offset="0" stop-color="#ffb347" stop-opacity=".9"/><stop offset=".45" stop-color="#ff7a45" stop-opacity=".3"/><stop offset="1" stop-color="#ff7a45" stop-opacity="0"/></radialGradient>
      <linearGradient id="fxIg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".3" stop-color="#fa7e1e"/><stop offset=".55" stop-color="#d62976"/><stop offset=".8" stop-color="#962fbf"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient>
      <linearGradient id="fxFaceBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b3a60"/><stop offset="1" stop-color="#0d1b30"/></linearGradient>
      <clipPath id="fxFaceClip"><rect width="64" height="64" rx="7"/></clipPath>
    </defs>
    <g class="fx-heat"></g><g class="fx-pulse"></g><g class="fx-flash"></g><g class="fx-packets"></g><g class="fx-hub"></g><g class="fx-faces"></g>`;
  const gHeat = svg.querySelector('.fx-heat');
  const gPulse = svg.querySelector('.fx-pulse');
  const gFlash = svg.querySelector('.fx-flash');
  const gPackets = svg.querySelector('.fx-packets');
  const gHub = svg.querySelector('.fx-hub');
  const gFaces = svg.querySelector('.fx-faces');
  banner.appendChild(svg);

  /* ---------- clock, tasks, tweens (all driven by one rAF loop) ---------- */
  let clock = 0, last = 0, raf = 0;
  const tasks = [];
  const anims = [];
  const after = (ms, fn) => tasks.push({ at: clock + ms, fn });
  const spawn = (fn) => anims.push({ t0: clock, fn });
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(100, last ? ts - last : 16);
    last = ts;
    clock += dt;
    for (let i = tasks.length - 1; i >= 0; i--) if (tasks[i].at <= clock) tasks.splice(i, 1)[0].fn();
    for (let i = anims.length - 1; i >= 0; i--) { const a = anims[i]; if (a.fn(clock - a.t0)) anims.splice(i, 1); }
  }
  const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

  /* ---------- heat map: blobs, ripples, flares ---------- */
  function heat(x, y, o = {}) {
    const size = o.size || 34, life = o.life || 1700, strength = o.strength || .75;
    const c = el('circle', { cx: x, cy: y, r: 4, fill: o.amber ? 'url(#fxHeatAmber)' : 'url(#fxHeatRed)', opacity: 0 }, gHeat);
    spawn((t) => {
      const p = t / life;
      if (p >= 1) { c.remove(); return true; }
      c.setAttribute('r', 4 + size * ease.out(p));
      c.setAttribute('opacity', strength * (1 - p) * (p < .12 ? p / .12 : 1));
      return false;
    });
  }
  function ripple(x, y, max = 30, life = 1300, color = '#ff7378', parent = gHeat) {
    const c = el('circle', { cx: x, cy: y, r: 3, fill: 'none', stroke: color, 'stroke-width': 1.4, opacity: 0 }, parent);
    spawn((t) => {
      const p = t / life;
      if (p >= 1) { c.remove(); return true; }
      c.setAttribute('r', 3 + (max - 3) * ease.out(p));
      c.setAttribute('opacity', .9 * (1 - p));
      return false;
    });
  }
  function flare(x, y) {
    heat(x, y, { size: 46, life: 2000, strength: .9 });
    ripple(x, y, 34, 1400);
    after(260, () => ripple(x, y, 24, 1100));
  }
  function ambient() {
    // random heat on the map itself; the red nodes only react when a packet lands on them
    const d = pick(G.dots);
    heat(d[0], d[1], { size: rand(14, 24), life: rand(900, 1500), strength: rand(.35, .65), amber: Math.random() < .55 });
    after(rand(220, 600), ambient);
  }

  /* ---------- platform marks (simplified, 40x40, centred on 0,0) ---------- */
  const badge = (fill) => `<circle r="20" fill="${fill}"/><circle r="20" fill="none" stroke="rgba(255,255,255,.28)"/>`;
  const PLATFORMS = [
    { name: 'FACEBOOK', svg: badge('#1877f2') + '<text x="2" y="14" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="38" fill="#fff">f</text>' },
    { name: 'INSTAGRAM', svg: badge('url(#fxIg)') + '<rect x="-10" y="-10" width="20" height="20" rx="6" fill="none" stroke="#fff" stroke-width="2.4"/><circle r="4.6" fill="none" stroke="#fff" stroke-width="2.4"/><circle cx="6.6" cy="-6.6" r="1.4" fill="#fff"/>' },
    { name: 'THREADS', svg: badge('#0b0b0b') + '<text y="9.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="28" fill="#fff">@</text>' },
    { name: 'TIKTOK', svg: badge('#0b0b0b') + ['#25f4ee;-1.4;-1', '#fe2c55;1.4;1', '#ffffff;0;0'].map((s) => { const [c, dx, dy] = s.split(';'); return `<g transform="translate(${dx} ${dy})" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 -12 V6 A5.2 5.2 0 1 1 -2.2 0.8"/><path d="M3 -12 C3.4 -7.5 6.5 -5 11 -4.6"/></g>`; }).join('') },
    { name: 'X', svg: badge('#0b0b0b') + '<path d="M-10 -11 L10 11" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/><path d="M10 -11 L-10 11" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>' },
    { name: 'YOUTUBE', svg: badge('#ff0033') + '<path d="M-5.5 -8 L9 0 L-5.5 8Z" fill="#fff"/>' },
    { name: 'SNAPCHAT', svg: badge('#fffc00') + '<g transform="translate(-12 -12)"><path d="M12 4c-3 0-4.5 2.2-4.5 5v2.2c-.8.3-1.7.6-1.7 1.2 0 .7 1.2.9 2 1.2-.3 1.3-1.6 2.2-2.6 2.4.2.6 1.8.8 2.6 1 .2.5.3 1.2 1 1.2.7 0 1.5-.4 3.2-.4s2.5.4 3.2.4c.7 0 .8-.7 1-1.2.8-.2 2.4-.4 2.6-1-1-.2-2.3-1.1-2.6-2.4.8-.3 2-.5 2-1.2 0-.6-.9-.9-1.7-1.2V9c0-2.8-1.5-5-4.5-5z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></g>' },
    { name: 'LINKEDIN', svg: badge('#0a66c2') + '<text x="0" y="8.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="23" fill="#fff">in</text>' },
    { name: 'REDDIT', svg: badge('#ff4500') + '<g transform="translate(0 1.5)"><ellipse cy="3" rx="10.5" ry="7.5" fill="#fff"/><circle cx="-10.5" cy="-2" r="2.3" fill="#fff"/><circle cx="10.5" cy="-2" r="2.3" fill="#fff"/><circle cx="-4" cy="2" r="1.9" fill="#ff4500"/><circle cx="4" cy="2" r="1.9" fill="#ff4500"/><path d="M-4.5 6.2 Q0 9.2 4.5 6.2" stroke="#ff4500" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M1 -4.4 L3.2 -11" stroke="#fff" stroke-width="1.5" fill="none"/><circle cx="5" cy="-11.4" r="2" fill="#fff"/></g>' },
    { name: 'MARKETPLACE / KIJIJI', svg: badge('#1877f2') + '<path d="M-11 -4 L-8 -11 H8 L11 -4Z" fill="#fff"/><path d="M-9 -4 V10 H9 V-4" fill="none" stroke="#fff" stroke-width="2.2"/><rect x="-3.5" y="3" width="7" height="7" fill="#fff"/>' }
  ];
  let lastPlatform = -1;
  const nextPlatform = () => { let i; do { i = Math.floor(Math.random() * PLATFORMS.length); } while (i === lastPlatform); lastPlatform = i; return PLATFORMS[i]; };

  /* ---------- hub: platform mark pops where the big circle is ---------- */
  let curLogo = null;
  function popLogo() {
    if (curLogo && curLogo.die === null) curLogo.die = clock;
    const p = nextPlatform();
    const g = el('g', { opacity: 0, transform: `translate(${HUB[0]} ${HUB[1]}) scale(0)` }, gHub);
    g.innerHTML = p.svg;
    const label = el('text', { x: 0, y: 40, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, ui-monospace, monospace', 'font-size': 10.5, 'font-weight': 600, 'letter-spacing': 1.6, fill: '#bfe6ff', stroke: '#091322', 'stroke-width': 3, 'paint-order': 'stroke' }, g);
    label.textContent = p.name;
    const L = { die: null };
    curLogo = L;
    spawn((t) => {
      let o = 1;
      if (L.die !== null) { const d = (clock - L.die) / 240; if (d >= 1) { g.remove(); return true; } o = 1 - d; }
      g.setAttribute('transform', `translate(${HUB[0]} ${HUB[1]}) scale(${1.2 * ease.back(Math.min(t / 380, 1))})`);
      g.setAttribute('opacity', o);
      return false;
    });
    after(1700, () => { if (curLogo === L && L.die === null) L.die = clock; });
  }

  /* ---------- packets: hub -> hotspot, then the hotspot flares ---------- */
  function packet(target) {
    const cx = (HUB[0] + target[0]) / 2, cy = Math.min(HUB[1], target[1]) - rand(70, 130);
    const path = el('path', { d: `M${HUB[0]} ${HUB[1]} Q${cx} ${cy} ${target[0]} ${target[1]}`, fill: 'none', stroke: '#9fdcff', 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: .9 }, gPackets);
    const head = el('circle', { r: 3.2, fill: '#fff' }, gPackets);
    const L = path.getTotalLength(), dur = rand(850, 1150), tail = 130;
    let landed = false;
    spawn((t) => {
      const p = Math.min(t / dur, 1), s = ease.inOut(p) * L;
      const a = Math.max(0, s - tail);
      path.setAttribute('stroke-dasharray', `${Math.max(s - a, 0.01)} ${L}`);
      path.setAttribute('stroke-dashoffset', -a);
      const pt = path.getPointAtLength(s);
      head.setAttribute('cx', pt.x); head.setAttribute('cy', pt.y);
      if (p >= 1 && !landed) { landed = true; flare(target[0], target[1]); head.remove(); showCard(target); }
      if (p >= 1) {
        const f = (t - dur) / 500;
        if (f >= 1) { path.remove(); return true; }
        path.setAttribute('opacity', .9 * (1 - f));
      }
      return false;
    });
  }
  const launchPackets = (n) => {
    const hs = G.hot.slice().sort(() => Math.random() - .5).slice(0, n);
    hs.forEach((h, i) => after(i * 220, () => packet(h)));
  };

  /* ---------- the white signal travelling the node network ---------- */
  function route() {
    const outer = nodes.map((n, i) => [n, i]).filter(([n]) => n[2] === 2);
    let i = pick(outer)[1];
    const r = [i];
    while (true) {
      const d = G.down[i];
      i = pick(d);
      if (i === -1) { r.push(-1); break; }
      r.push(i);
    }
    return r;
  }
  function flashNode(x, y, big) {
    const dot = el('circle', { cx: x, cy: y, r: big ? 9 : 5.5, fill: '#fff', opacity: 1 }, gFlash);
    spawn((t) => { const p = t / 480; if (p >= 1) { dot.remove(); return true; } dot.setAttribute('opacity', 1 - p); return false; });
    ripple(x, y, big ? 44 : 20, big ? 900 : 600, '#e8f6ff', gFlash);
  }
  function runPulse() {
    const ids = route();
    const pts = ids.map((i) => (i === -1 ? HUB : [nodes[i][0], nodes[i][1]]));
    const cum = [0];
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    const L = cum[cum.length - 1], speed = 270, tail = 110;
    const d = 'M' + pts.map((p) => p[0] + ' ' + p[1]).join(' L');
    const glow = el('path', { d, fill: 'none', stroke: '#8fd4ff', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .22 }, gPulse);
    const core = el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gPulse);
    const head = el('circle', { r: 3.4, fill: '#fff' }, gPulse);
    let hit = -1;
    spawn((t) => {
      const s = t / 1000 * speed;
      const head_s = Math.min(s, L), a = Math.max(0, s - tail), b = Math.min(s, L);
      const seg = Math.max(b - a, 0.01);
      [glow, core].forEach((p) => { p.setAttribute('stroke-dasharray', `${seg} ${L + 10}`); p.setAttribute('stroke-dashoffset', -a); });
      let acc = 0, k = 0; // locate head on polyline
      while (k < cum.length - 2 && cum[k + 1] < head_s) k++;
      const segLen = (cum[k + 1] - cum[k]) || 1; acc = (head_s - cum[k]) / segLen;
      head.setAttribute('cx', pts[k][0] + (pts[k + 1][0] - pts[k][0]) * acc);
      head.setAttribute('cy', pts[k][1] + (pts[k + 1][1] - pts[k][1]) * acc);
      head.setAttribute('opacity', s > L ? Math.max(0, 1 - (s - L) / 40) : 1);
      while (hit + 1 < cum.length && s >= cum[hit + 1]) {
        hit++;
        const p = pts[hit], isHub = ids[hit] === -1;
        flashNode(p[0], p[1], isHub);
        popLogo();
        if (isHub) launchPackets(2);
        else if (Math.random() < .35) launchPackets(1);
      }
      if (s >= L + tail + 40) { glow.remove(); core.remove(); head.remove(); after(rand(900, 1700), runPulse); return true; }
      return false;
    });
  }

  /* ---------- synthetic faces (illustrated, not real people) ---------- */
  const AV = [
    { skin: '#f2c9a5', hair: '#2a2018', style: 'short', shirt: '#3a5f8f' },
    { skin: '#c68863', hair: '#1b1b1b', style: 'long', shirt: '#7a3b5c' },
    { skin: '#8d5a3b', hair: '#1b1b1b', style: 'curly', shirt: '#2f6f5e' },
    { skin: '#f6d5bd', hair: '#b5651d', style: 'bun', shirt: '#5a4a8a' },
    { skin: '#d9a07a', hair: '#5a3a1e', style: 'short', beard: true, shirt: '#8a4b2f' },
    { skin: '#6b4228', hair: '#1b1b1b', style: 'bald', beard: true, glasses: true, shirt: '#3b4a6b' },
    { skin: '#e0a982', hair: '#8a8a8a', style: 'short', glasses: true, shirt: '#4c6d4c' },
    { skin: '#a46b47', hair: '#2a2018', style: 'long', glasses: true, shirt: '#a05a3a' }
  ];
  function avatarMarkup(a) {
    const front = `<path d="M20.5 25 C19 13 25 8.5 32 8.5 C39 8.5 45 13 43.5 25 C41.5 20 38 17.5 32 17.5 C26 17.5 22.5 20 20.5 25 Z" fill="${a.hair}"/>`;
    let back = '', top = '';
    if (a.style === 'long') back = `<path d="M19.5 26 C17 10 26 6 32 6 C38 6 47 10 44.5 26 L46 50 C42 52 40 50 39 46 L38 30 L26 30 L25 46 C24 50 22 52 18 50 Z" fill="${a.hair}"/>`;
    if (a.style === 'short' || a.style === 'long') top = front;
    if (a.style === 'bun') top = front + `<circle cx="32" cy="6.5" r="5" fill="${a.hair}"/>`;
    if (a.style === 'curly') top = front + [[22, 17, 5.5], [28, 12, 6], [36, 12, 6], [42, 17, 5.5], [20.5, 24, 4], [43.5, 24, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${a.hair}"/>`).join('');
    const beard = a.beard ? `<path d="M21.5 29 C21.5 40.5 26 45 32 45 C38 45 42.5 40.5 42.5 29 C40.5 34 37 36.5 32 36.5 C27 36.5 23.5 34 21.5 29Z" fill="${a.hair}"/>` : '';
    const glasses = a.glasses ? '<g stroke="#0f1722" stroke-width="1.2" fill="rgba(160,210,255,.14)"><circle cx="27.6" cy="28" r="4.2"/><circle cx="36.4" cy="28" r="4.2"/><path d="M31.8 28 h.4"/></g>' : '';
    return `<rect width="64" height="64" fill="url(#fxFaceBg)"/>
      <path d="M2 64 C5 52 16 47 32 47 C48 47 59 52 62 64Z" fill="${a.shirt}"/>
      ${back}
      <rect x="27" y="38" width="10" height="12" rx="4" fill="${a.skin}"/><path d="M27 42 h10 v3 q-5 3 -10 0z" fill="#000" opacity=".14"/>
      <circle cx="21" cy="28" r="2.4" fill="${a.skin}"/><circle cx="43" cy="28" r="2.4" fill="${a.skin}"/>
      <ellipse cx="32" cy="27.5" rx="11" ry="13.5" fill="${a.skin}"/>
      ${top}${beard}
      <path d="M24.8 24.6 q2.8-1.6 5.4 0 M33.8 24.6 q2.8-1.6 5.4 0" stroke="${a.hair === '#8a8a8a' ? '#777' : a.hair}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <circle cx="27.6" cy="28" r="1.3" fill="#1a2230"/><circle cx="36.4" cy="28" r="1.3" fill="#1a2230"/>
      <path d="M32 29.5 q-1.3 3 .7 3.7" stroke="#000" stroke-opacity=".28" stroke-width="1" fill="none" stroke-linecap="round"/>
      ${glasses}
      <path d="M28.6 35.2 q3.4 2.6 6.8 0" stroke="${a.beard ? '#d89a8f' : '#8a4646'}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  }
  // A card appears only when a packet lands on a red node, right beside that node, and leaves quickly.
  const LABELS = [
    () => `MATCH ${Math.floor(rand(90, 99))}%`,
    () => 'IMAGE INDEXED',
    () => 'SHA-256 HASH',
    () => 'OCR MATCH',
    () => 'CASE MATCH HIT!',
    () => 'PROFILE MATCH',
    () => 'PROFILE IMAGE',
    () => 'FRIENDS DETECTED',
    () => 'AVATAR INDEXED',
    () => 'IMAGE ANALYZED',
    () => 'IDENTITY PHOTO',
    () => 'ACCOUNT FOUND'
  ];
  const inUse = new Set();
  const labelsInUse = new Set();
  const cards = [];
  const SAFE_Y = [138, 268]; // keeps the whole frame + caption inside the visible banner band
  function showCard(from) {
    const side = from[0] > 1440 ? -1 : 1;
    const x = Math.max(70, Math.min(1530, from[0] + side * 62));
    const y = Math.max(SAFE_Y[0], Math.min(SAFE_Y[1], from[1]));
    // skip if it would sit on top of a card that is still showing
    if (cards.some((c) => Math.abs(c.x - x) < 125 && Math.abs(c.y - y) < 112)) return;
    runCard({ x, y });
  }
  function runCard(pos) {
    let ai; do { ai = Math.floor(Math.random() * AV.length); } while (inUse.has(ai));
    let li; do { li = Math.floor(Math.random() * LABELS.length); } while (labelsInUse.has(li));
    inUse.add(ai); labelsInUse.add(li); cards.push(pos);
    const a = AV[ai], text = LABELS[li](), alert = text.indexOf('CASE MATCH') === 0;
    const col = alert ? '#ff6b70' : '#5cc8ff', txtCol = alert ? '#ffd0d2' : '#9fdcff';
    const w = text.length * 6.3 + 18;
    const g = el('g', { opacity: 0 }, gFaces);
    g.innerHTML = `<g clip-path="url(#fxFaceClip)">${avatarMarkup(a)}<rect class="scan" width="64" height="2.2" fill="${col}" opacity=".7"/><rect class="scan" width="64" height="14" y="-14" fill="${col}" opacity=".12"/></g>
      <path class="brk" d="M-6 6V-6H6 M58 -6H70V6 M70 58V70H58 M6 70H-6V58" stroke="${col}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="${32 - w / 2}" y="74" width="${w}" height="15" rx="3" fill="${alert ? '#2a0d12' : '#07101e'}" opacity=".9" stroke="${alert ? 'rgba(255,107,112,.7)' : 'rgba(92,200,255,.45)'}"/>
      <text x="32" y="85" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="9" font-weight="600" letter-spacing=".8" fill="${txtCol}">${text}</text>`;
    const scans = g.querySelectorAll('.scan'), brk = g.querySelector('.brk');
    const fadeIn = 320, hold = rand(1100, 1700), fadeOut = 450, total = fadeIn + hold + fadeOut;
    spawn((t) => {
      if (t >= total) { g.remove(); inUse.delete(ai); labelsInUse.delete(li); cards.splice(cards.indexOf(pos), 1); return true; }
      const o = t < fadeIn ? ease.out(t / fadeIn) : t > fadeIn + hold ? 1 - ease.out((t - fadeIn - hold) / fadeOut) : 1;
      const sc = (.9 + .1 * o) * 1.15;
      g.setAttribute('opacity', (.95 * o).toFixed(3));
      g.setAttribute('transform', `translate(${pos.x} ${pos.y - 8}) scale(${sc}) translate(-32 -32)`);
      const sweep = ((t % 900) / 900) * 78 - 8;
      scans[0].setAttribute('y', sweep); scans[1].setAttribute('y', sweep - 14);
      if (alert) brk.setAttribute('stroke-opacity', (.65 + .35 * Math.sin(t / 110)).toFixed(2));
      return false;
    });
  }

  /* ---------- go ---------- */
  after(500, runPulse);
  after(300, ambient);

  let inView = true;
  const sync = () => (inView && !document.hidden ? start() : stop());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => entries.forEach((e) => { inView = e.isIntersecting; sync(); })).observe(banner);
  } else sync();
  document.addEventListener('visibilitychange', sync);
})();
