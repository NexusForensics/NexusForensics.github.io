// The Social Recon compass in the product hero (roadmap, November 8, 2026: "Animated compass logo: needle spinning when evidence is
// found"). The app's own logo and its own Seen Evidence spin (renderer.js, the sidebar logo flourish): irregular bursts, pauses and long
// roulette turns, the ring glowing and the fingerprint lit, then the needle settles upright and drifts again. Here it searches for a few
// seconds each time the page finds evidence: the hero's last match landing, a keyword hit in the OCR demo
// (document event "nexus:evidence-found"), or a hover or tap on the compass. Reduced motion: it stays still.
(() => {
  const compass = document.querySelector('[data-sr-compass]');
  const needle = document.getElementById('srCompassNeedle');
  const ringGlow = document.getElementById('srCompassRingGlow');
  const fingerprint = document.getElementById('srCompassFingerprint');
  if (!compass || !needle || !ringGlow || !fingerprint) return;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let spinTimer = null;
  let settleTimer = null;
  let stopTimer = null;
  let angle = 0;
  let spinning = false;

  const step = () => {
    if (!spinning) return;
    if (reduced()) { stop(); return; }
    if (Math.random() < 0.24) { spinTimer = setTimeout(step, 100 + Math.random() * 380); return; }
    let delta;
    let duration;
    let ease = 'cubic-bezier(.33,.6,.4,1)';
    if (Math.random() < 0.13) {
      delta = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 5) * 360;
      duration = 4 + Math.random() * 2;
      ease = 'cubic-bezier(.1,.7,.15,1)';
    } else {
      const dir = Math.random() < 0.32 ? -1 : 1;
      const burst = Math.random();
      if (burst < 0.4) { delta = dir * (160 + Math.random() * 420); duration = 0.12 + Math.random() * 0.28; }
      else if (burst < 0.75) { delta = dir * (60 + Math.random() * 180); duration = 0.3 + Math.random() * 0.5; }
      else { delta = dir * (15 + Math.random() * 60); duration = 0.6 + Math.random() * 0.9; }
    }
    angle += delta;
    needle.style.transition = `transform ${duration.toFixed(2)}s ${ease}`;
    needle.style.transform = `rotate(${angle.toFixed(1)}deg)`;
    spinTimer = setTimeout(step, duration * 1000);
  };

  const stop = () => {
    if (!spinning) return;
    spinning = false;
    clearTimeout(spinTimer);
    clearTimeout(stopTimer);
    compass.classList.remove('is-searching');
    const upright = Math.ceil((angle + 1) / 360) * 360;
    needle.style.transition = 'transform .7s cubic-bezier(.22,.7,.16,1)';
    needle.style.transform = `rotate(${upright}deg)`;
    angle = upright;
    fingerprint.classList.remove('glow');
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      settleTimer = null;
      needle.style.transition = '';
      needle.style.transform = '';
      needle.classList.add('idle-drift');
    }, 750);
  };

  const search = (ms = 3600) => {
    if (reduced()) return;
    clearTimeout(stopTimer);
    stopTimer = setTimeout(stop, ms);
    if (spinning) return;
    clearTimeout(settleTimer);
    settleTimer = null;
    needle.classList.remove('idle-drift');
    needle.style.transition = '';
    needle.style.transform = '';
    void needle.getBoundingClientRect();
    angle = 0;
    spinning = true;
    compass.classList.add('is-searching');
    ringGlow.classList.remove('pulse');
    void ringGlow.getBoundingClientRect();
    ringGlow.classList.add('pulse');
    fingerprint.classList.add('glow');
    step();
  };

  document.addEventListener('nexus:evidence-found', event => search(Number(event.detail?.ms) || 3600));
  // The hero's last match landing (its reason pill finishing its entrance) is evidence found.
  let heroDone = false;
  document.addEventListener('animationend', event => {
    if (heroDone || !event.target?.classList?.contains('xpm-pill-2')) return;
    heroDone = true;
    search(3600);
  });
  compass.addEventListener('mouseenter', () => search(2600));
  compass.addEventListener('click', () => search(2600));
})();
