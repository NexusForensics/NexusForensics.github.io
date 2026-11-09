// OCR in action (roadmap, November 8, 2026): a scan line passes over the demo picture, each line of text Nexus read is boxed as the scan
// reaches it and appears in the OCR panel, then the case keyword hits light up and the picture zooms into the sign. It starts when the
// band comes into view, replays on its own and from the Replay button, and shows the finished state at once with reduced motion.
(() => {
  const SCAN_MS = 2400;
  const demos = Array.from(document.querySelectorAll('[data-ocr-demo]'));
  if (!demos.length) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  demos.forEach(demo => {
    let tops = [];
    try { tops = JSON.parse(demo.dataset.ocrTops || '[]'); } catch { tops = []; }
    demo.style.setProperty('--ocr-scan-ms', `${SCAN_MS}ms`);
    let timers = [];
    let running = false;
    const lines = index => demo.querySelectorAll(`[data-ocr-line="${index}"]`);
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const reset = () => {
      demo.classList.remove('is-scanning', 'is-read', 'is-hits', 'is-zoomed');
      demo.querySelectorAll('[data-ocr-line]').forEach(element => element.classList.remove('on'));
    };
    const finished = () => {
      clearTimers();
      demo.classList.remove('is-scanning', 'is-zoomed');
      demo.querySelectorAll('[data-ocr-line]').forEach(element => element.classList.add('on'));
      demo.classList.add('is-read', 'is-hits');
    };
    const at = (ms, step) => timers.push(setTimeout(step, ms));
    const run = () => {
      clearTimers();
      reset();
      void demo.offsetWidth;
      demo.classList.add('is-scanning');
      tops.forEach((top, index) => at(250 + (Number(top) / 100) * SCAN_MS, () => lines(index).forEach(element => element.classList.add('on'))));
      at(SCAN_MS + 250, () => { demo.classList.remove('is-scanning'); demo.classList.add('is-read'); });
      at(SCAN_MS + 800, () => {
        demo.classList.add('is-hits');
        // Keyword hits are evidence found: the compass in the hero searches (assets/sr-compass.js).
        document.dispatchEvent(new CustomEvent('nexus:evidence-found', { detail: { source: 'ocr-demo' } }));
      });
      at(SCAN_MS + 1700, () => demo.classList.add('is-zoomed'));
      at(SCAN_MS + 6400, () => demo.classList.remove('is-zoomed'));
      at(SCAN_MS + 8600, run);
    };

    if (reduceMotion) {
      finished();
      return;
    }
    // Before it is ever seen (or once it leaves the screen) the band holds its finished state, so a still view is never empty.
    finished();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !running) { running = true; run(); }
        if (!entry.isIntersecting && running) { running = false; finished(); }
      });
    }, { threshold: 0.35 });
    observer.observe(demo);
    demo.querySelector('[data-ocr-replay]')?.addEventListener('click', () => { running = true; run(); });
  });
})();
