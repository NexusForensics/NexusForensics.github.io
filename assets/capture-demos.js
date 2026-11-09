// Post capture in action and Face match in action (2026-11-08). Each band plays a timed sequence of classes when it comes into view,
// replays on its own and from its Replay button, and holds its finished state when off screen or with reduced motion
// (the same rules as assets/ocr-demo.js).
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sequence(demo, { classes, steps, loopMs, finish, replay, restAtStart = null }) {
    let timers = [];
    let running = false;
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    // Jumping back to the first frame never plays the fades backwards (investigator, 2026-11-08: the face band went unmasked, masked,
    // unmasked as it started): is-snap turns transitions off for the reset only.
    const reset = (snap = false) => {
      if (snap) demo.classList.add('is-snap');
      demo.classList.remove(...classes);
      void demo.offsetWidth;
      if (snap) requestAnimationFrame(() => requestAnimationFrame(() => demo.classList.remove('is-snap')));
    };
    const finished = () => { clear(); reset(true); finish(); };
    // A band whose story only reads from its first frame (the covered face) rests on that frame, not the finished one.
    const rest = () => { if (!restAtStart) return finished(); clear(); reset(true); restAtStart(); };
    const run = ({ snap = false } = {}) => {
      clear();
      reset(snap);
      steps.forEach(([ms, step]) => timers.push(setTimeout(step, ms)));
      timers.push(setTimeout(() => run(), loopMs));
    };
    if (reduceMotion) { finished(); return; }
    rest();
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !running) { running = true; run({ snap: true }); }
        if (!entry.isIntersecting && running) { running = false; rest(); }
      });
    }, { threshold: 0.35 }).observe(demo);
    demo.querySelector(replay)?.addEventListener('click', () => { running = true; run({ snap: true }); });
  }

  // Post capture: right-click Capture Post, the shutter, a zoom on the author, the Captured stamp, then the details box fills row by row.
  document.querySelectorAll('[data-pc-demo]').forEach(demo => {
    const rows = Array.from(demo.querySelectorAll('[data-pc-row]'));
    const sha = demo.querySelector('[data-pc-sha]');
    const full = sha ? sha.dataset.pcSha : '';
    let typing = null;
    const type = ms => {
      clearInterval(typing);
      let shown = 0;
      const per = ms / full.length;
      const started = performance.now();
      typing = setInterval(() => {
        shown = Math.min(full.length, Math.floor((performance.now() - started) / per));
        sha.textContent = full.slice(0, shown);
        if (shown >= full.length) clearInterval(typing);
      }, 30);
    };
    const add = name => () => demo.classList.add(name);
    const classes = ['is-pointing', 'is-menu', 'is-click', 'is-flash', 'is-zoomed', 'is-tagged', 'is-stamped', 'is-card'];
    sequence(demo, {
      classes,
      loopMs: 15000,
      replay: '[data-pc-replay]',
      finish: () => {
        clearInterval(typing);
        demo.classList.add('is-stamped', 'is-card');
        rows.forEach(row => row.classList.add('on'));
        if (sha) sha.textContent = full;
      },
      steps: [
        [0, () => { clearInterval(typing); rows.forEach(row => row.classList.remove('on')); if (sha) sha.textContent = ''; }],
        [300, add('is-pointing')],
        [1300, add('is-menu')],
        [1900, add('is-click')],
        [2150, () => { demo.classList.remove('is-menu', 'is-click', 'is-pointing'); demo.classList.add('is-flash'); }],
        [2700, add('is-zoomed')],
        [3500, add('is-tagged')],
        [5000, () => demo.classList.remove('is-zoomed', 'is-tagged')],
        [6000, add('is-stamped')],
        [6600, add('is-card')],
        ...rows.map((row, index) => [7000 + index * 380, () => row.classList.add('on')]),
        [7000 + (rows.length - 1) * 380 + 200, () => sha && type(1700)],
      ],
    });
  });

  // Face match: the scan finds the eyes and brows above the covering, the search runs, then the covering fades into the matched
  // Facebook picture and the box turns into the app's green Matched face box.
  document.querySelectorAll('[data-fm-demo]').forEach(demo => {
    const steps = Array.from(demo.querySelectorAll('[data-fm-step]'));
    const add = name => () => demo.classList.add(name);
    const classes = ['is-scanning', 'is-face', 'is-covered', 'is-comparing', 'is-found', 'is-unmasking', 'is-matched'];
    sequence(demo, {
      classes,
      loopMs: 14500,
      replay: '[data-fm-replay]',
      finish: () => {
        demo.classList.add('is-face', 'is-covered', 'is-comparing', 'is-found', 'is-unmasking', 'is-matched');
        steps.forEach(step => step.classList.add('on'));
      },
      restAtStart: () => steps.forEach(step => step.classList.remove('on')),
      steps: [
        [0, () => steps.forEach(step => step.classList.remove('on'))],
        [250, add('is-scanning')],
        [1100, () => { demo.classList.add('is-face'); steps[0]?.classList.add('on'); }],
        [1900, () => { demo.classList.add('is-covered'); steps[1]?.classList.add('on'); }],
        [2600, () => { demo.classList.add('is-comparing'); steps[2]?.classList.add('on'); }],
        [4100, () => {
          demo.classList.add('is-found');
          // A match is evidence found: the compass in the hero searches (assets/sr-compass.js).
          document.dispatchEvent(new CustomEvent('nexus:evidence-found', { detail: { source: 'face-demo' } }));
        }],
        [4500, add('is-unmasking')],
        [6500, add('is-matched')],
        // Before the next round, the matched picture fades back to the covered one, so the round starts covered again.
        [11800, () => demo.classList.remove('is-matched', 'is-unmasking', 'is-face', 'is-covered')],
      ],
    });
  });
  // Object match: boxes appear as the scan reaches them and fill the Objects list; a click on a list item highlights that object's
  // boxes on the picture (the rest of the picture dims), as the app's Capture summary does. Once the visitor clicks, the band stops
  // replaying on its own so their choice stays.
  document.querySelectorAll('[data-om-demo]').forEach(demo => {
    const SCAN_MS = 2600;
    const img = demo.querySelector('.om-img');
    const boxes = Array.from(demo.querySelectorAll('.om-box'));
    const items = Array.from(demo.querySelectorAll('.om-item'));
    const count = demo.querySelector('[data-om-count]');
    const thumbsFor = index => demo.querySelectorAll(`.om-thumbs i[data-om-index="${index}"]`);
    let timers = [];
    let running = false;
    let touched = false;
    const setSource = () => {
      const url = `url("${img.currentSrc || img.src}")`;
      boxes.forEach(box => { box.style.backgroundImage = url; });
      demo.querySelectorAll('.om-thumbs i').forEach(thumb => { thumb.style.backgroundImage = url; });
    };
    if (img.complete) setSource(); else img.addEventListener('load', setSource, { once: true });
    const select = label => {
      demo.classList.toggle('has-selection', Boolean(label));
      boxes.forEach(box => box.classList.toggle('sel', box.dataset.omLabel === label));
      items.forEach(item => {
        const on = item.dataset.omLabel === label;
        item.classList.toggle('sel', on);
        item.setAttribute('aria-pressed', String(on));
      });
    };
    const shown = () => items.filter(item => item.classList.contains('on')).length;
    const showBox = box => {
      box.classList.add('on');
      thumbsFor(box.dataset.omIndex).forEach(thumb => thumb.classList.add('on'));
      items.find(item => item.dataset.omLabel === box.dataset.omLabel)?.classList.add('on');
      if (count) count.textContent = String(shown());
    };
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const finished = () => {
      clear();
      demo.classList.remove('is-scanning');
      demo.classList.add('is-done');
      boxes.forEach(showBox);
    };
    const run = () => {
      clear();
      select(null);
      demo.classList.remove('is-done', 'is-scanning');
      boxes.forEach(box => box.classList.remove('on'));
      demo.querySelectorAll('.om-thumbs i').forEach(thumb => thumb.classList.remove('on'));
      items.forEach(item => item.classList.remove('on', 'is-tap'));
      if (count) count.textContent = '0';
      void demo.offsetWidth;
      demo.classList.add('is-scanning');
      boxes.forEach(box => timers.push(setTimeout(() => showBox(box), 250 + (Number(box.dataset.omAt) / 100) * SCAN_MS)));
      timers.push(setTimeout(() => { demo.classList.remove('is-scanning'); demo.classList.add('is-done'); }, SCAN_MS + 400));
      // Show what a click does: the list item is tapped and its boxes light up on the picture.
      const demoItem = items.find(item => item.dataset.omLabel === 'rhinoceros') || items[0];
      timers.push(setTimeout(() => demoItem?.classList.add('is-tap'), SCAN_MS + 1400));
      timers.push(setTimeout(() => select(demoItem?.dataset.omLabel), SCAN_MS + 1600));
      timers.push(setTimeout(() => { demoItem?.classList.remove('is-tap'); select('flamingo'); }, SCAN_MS + 4600));
      timers.push(setTimeout(() => { if (!touched) select(null); }, SCAN_MS + 7600));
      timers.push(setTimeout(() => { if (!touched) run(); }, SCAN_MS + 10500));
    };
    items.forEach(item => item.addEventListener('click', () => {
      touched = true;
      clear();
      if (!demo.classList.contains('is-done')) finished();
      select(item.classList.contains('sel') ? null : item.dataset.omLabel);
    }));
    demo.querySelector('[data-om-showall]')?.addEventListener('click', () => { touched = true; select(null); });
    finished();
    if (reduceMotion) return;
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !running && !touched) { running = true; run(); }
        if (!entry.isIntersecting && running && !touched) { running = false; finished(); select(null); }
      });
    }, { threshold: 0.35 }).observe(demo);
    demo.querySelector('[data-om-replay]')?.addEventListener('click', () => { touched = false; running = true; run(); });
  });
  // Case target: the Text on objects target is typed in Case Focus and saved, then a captured video plays frame by frame. The frames the
  // app matched show its own boxes (orange: the object, red: the text read on it) and the case target alert appears with its signals.
  document.querySelectorAll('[data-ct-demo]').forEach(demo => {
    const FRAME_MS = 450;
    const frames = Array.from(demo.querySelectorAll('.ct-frame'));
    const typed = demo.querySelector('[data-ct-type]');
    const text = typed ? typed.dataset.ctType : '';
    const time = demo.querySelector('.ct-time');
    const progress = demo.querySelector('.ct-progress');
    const duration = Number(demo.dataset.ctDuration) || 16;
    const hitIndexes = Array.from(demo.querySelectorAll('[data-ct-hit]')).map(hit => Number(hit.dataset.ctHit)).sort((a, b) => a - b);
    // The alert describes the clearest matching frame (the app's own choice); the band comes to rest on it.
    const clearest = Number.isFinite(Number(demo.dataset.ctClearest)) ? Number(demo.dataset.ctClearest) : hitIndexes[0];
    const clock = second => `0:${String(second).padStart(2, '0')}`;
    const show = index => {
      frames.forEach((frame, i) => frame.classList.toggle('on', i === index));
      const second = Number(frames[index]?.dataset.ctSecond || 0);
      if (time) time.textContent = clock(second);
      if (progress) progress.style.width = `${(100 * second / duration).toFixed(2)}%`;
    };
    const markHit = index => {
      demo.querySelectorAll('[data-ct-hit]').forEach(hit => hit.classList.toggle('on', Number(hit.dataset.ctHit) === index));
      demo.querySelector(`[data-ct-mark="${index}"]`)?.classList.add('on');
      demo.querySelector(`[data-ct-chip="${index}"]`)?.classList.add('on');
    };
    const clearHits = () => demo.querySelectorAll('.ct-hit, .ct-mark, [data-ct-chip]').forEach(el => el.classList.remove('on'));
    const add = name => () => demo.classList.add(name);
    const steps = [
      [0, () => { clearHits(); show(0); if (typed) typed.textContent = ''; }],
      [500, add('is-typing')],
      ...Array.from(text).map((_, i) => [800 + i * 260, () => { if (typed) typed.textContent = text.slice(0, i + 1); }]),
      [800 + text.length * 260 + 300, () => { demo.classList.remove('is-typing'); demo.classList.add('is-colour'); }],
      [2200, add('is-press')],
      [2400, () => { demo.classList.remove('is-press'); demo.classList.add('is-added'); }],
      [3100, add('is-saving')],
      [3300, () => { demo.classList.remove('is-saving'); demo.classList.add('is-saved', 'is-playing'); }],
    ];
    let at = 3800;
    frames.forEach((_, index) => {
      steps.push([at, () => show(index)]);
      at += FRAME_MS;
      if (hitIndexes.includes(index)) {
        const first = index === hitIndexes[0];
        steps.push([at, () => { demo.classList.remove('is-scanning'); void demo.offsetWidth; demo.classList.add('is-scanning'); }]);
        steps.push([at + 700, () => {
          markHit(index);
          if (first) {
            demo.classList.add('is-alert');
            // A target hit is evidence found: the compass in the hero searches (assets/sr-compass.js).
            document.dispatchEvent(new CustomEvent('nexus:evidence-found', { detail: { source: 'target-demo' } }));
          }
        }]);
        at += first ? 3000 : 1000;
        steps.push([at - 150, () => demo.querySelectorAll('.ct-hit').forEach(hit => hit.classList.remove('on'))]);
      }
    });
    // End on the clearest matching frame, as the alert does.
    steps.push([at + 200, () => { show(clearest); markHit(clearest); demo.classList.remove('is-playing'); }]);
    sequence(demo, {
      classes: ['is-typing', 'is-colour', 'is-press', 'is-added', 'is-saving', 'is-saved', 'is-playing', 'is-scanning', 'is-alert'],
      loopMs: at + 5200,
      replay: '[data-ct-replay]',
      finish: () => {
        if (typed) typed.textContent = text;
        demo.classList.add('is-colour', 'is-added', 'is-saved', 'is-alert');
        hitIndexes.forEach(markHit);
        show(clearest ?? 0);
        markHit(clearest);
      },
      steps,
    });
  });
})();
