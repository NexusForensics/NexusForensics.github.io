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
      // The still frame (reduced motion) is the covered face with the search done: the story ends covered (investigator, 2026-11-08:
      // "when it ends, the last frame should be masked").
      finish: () => {
        demo.classList.add('is-face', 'is-covered', 'is-comparing', 'is-found');
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
  // Facebook platform card: the real Profile Capture beside the drawn page pops out and types its SHA-256 when it comes into view.
  document.querySelectorAll('[data-pf-capture]').forEach(card => {
    const sha = card.querySelector('[data-pf-sha]');
    const full = sha ? sha.dataset.pfSha : '';
    if (reduceMotion || !sha || card.hasAttribute('data-pf-scroll')) return;
    let timers = [];
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const run = () => {
      clear();
      card.classList.add('is-snap');
      card.classList.remove('is-on');
      sha.textContent = '';
      void card.offsetWidth;
      card.classList.remove('is-snap');
      timers.push(setTimeout(() => card.classList.add('is-on'), 450));
      for (let i = 1; i <= full.length; i += 2) timers.push(setTimeout(() => { sha.textContent = full.slice(0, i + 1); }, 1000 + i * 18));
    };
    card.classList.add('is-ready', 'is-on');
    let seen = false;
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !seen) { seen = true; run(); }
        if (!entry.isIntersecting && seen) { seen = false; clear(); card.classList.add('is-on'); sha.textContent = full; }
      });
    }, { threshold: 0.6 }).observe(card);
  });
  // Platform cards with a simulated capture (2026-11-09): one engine, four kinds (data-pf-mode).
  //   scroll  — TikTok, Threads, X, YouTube, Reddit, Telegram: the TOP marker, the feed scrolls through the capture area while the count
  //             climbs, the BOTTOM marker where it ends, then the hash types.
  //   story   — Snapchat: the highlight plays snap by snap (progress bars), every snap counted, then the hash.
  //   section — LinkedIn: the Experience section is outlined and read, its page text appears beside it as the second record, then the hash.
  //   ads     — Marketplace then Kijiji: the listings scroll to an ad, it is ticked, its page opens as captured, then the hash; the tabs
  //             switch between the two afterwards.
  //   leo     — LeoList: the ad scrolls by, the two places with its phone number are boxed, then the number, "Seen before" (two earlier
  //             ads) and the indicators fill in beside it, one line at a time, then the hash.
  //   web     — Web: the search, result 3 ticked, the page opens and is captured whole (it scrolls to the bottom and back), the way to
  //             the page and what was saved fill in beside it, then the hash.
  //   open    — Facebook, Instagram: a click on the avatar or the post, the picture opens the way the platform shows it (photo viewer,
  //             post window), the comments read one by one, then the hash.
  // Reduced motion and off-screen show the finished capture.
  const hoverPlay = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.querySelectorAll('[data-pf-scroll]').forEach(card => {
    const mode = card.dataset.pfMode || 'scroll';
    const SCROLL_MS = mode === 'ads' ? 2600 : mode === 'leo' ? 3000 : 4200;
    card.style.setProperty('--pf-scroll-ms', `${SCROLL_MS}ms`);
    const count = card.querySelector('[data-pf-count]');
    const total = Number(count?.dataset.pfTotal) || 0;
    const reel = card.querySelector('.pf-tt-reel');
    const frames = Number(reel?.dataset.pfFrames) || 0;
    const bars = Array.from(card.querySelectorAll('.pf-st-bars i'));
    const sites = Array.from(card.querySelectorAll('[data-pf-site-panel]'));
    const tabs = Array.from(card.querySelectorAll('[data-pf-site]'));
    const steps = Array.from(card.querySelectorAll('.pf-step'));
    const STAGES = ['is-read', 'is-picked', 'is-opened', 'is-whole'];
    let timers = [];
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const at = (ms, step) => timers.push(setTimeout(step, ms));
    const typeSha = (code, startMs) => {
      const full = code ? code.dataset.pfSha : '';
      if (!code) return;
      code.textContent = '';
      for (let i = 1; i <= full.length; i += 2) at(startMs + i * 16, () => { code.textContent = full.slice(0, i + 1); });
    };
    const shaIn = scope => scope.querySelector('[data-pf-sha]');
    const fillSha = scope => scope.querySelectorAll('[data-pf-sha]').forEach(code => { code.textContent = code.dataset.pfSha; });
    const showFrame = k => {
      if (!reel || !frames) return;
      reel.style.transform = `translateY(-${(100 * k) / frames}%)`;
      bars.forEach((bar, i) => { bar.classList.toggle('done', i < k); bar.classList.toggle('on', i === k); });
      if (count) count.textContent = String(k + 1);
    };
    const selectSite = (index, state = 'done') => {
      sites.forEach((panel, i) => {
        // Stacked, never hidden: a hidden panel's lazy pictures would not load until it is shown.
        panel.classList.toggle('is-shown', i === index);
        panel.classList.toggle('is-scrolling', i === index && state !== 'start');
        panel.classList.toggle('is-picked', i === index && (state === 'picked' || state === 'done'));
        panel.classList.toggle('is-opened', i === index && state === 'done');
      });
      card.querySelectorAll('[data-pf-site-cap]').forEach(cap => { cap.hidden = Number(cap.dataset.pfSiteCap) !== index; });
      // Inside the drawn browser (pf-live): the address shows the site, Kijiji's page covers the drawn one, the notice shows once captured.
      const url = card.querySelector('[data-pf-url]');
      if (url && sites[index]?.dataset.pfUrl) url.textContent = sites[index].dataset.pfUrl;
      card.dataset.pfSite = String(index);
      card.classList.toggle('is-opened', state === 'done');
      tabs.forEach(tab => tab.setAttribute('aria-selected', String(Number(tab.dataset.pfSite) === index)));
    };
    const finished = () => {
      clear();
      card.classList.add('is-ready', 'is-on', 'is-scrolling', 'is-done');
      card.classList.remove('is-armed');
      if (count) count.textContent = String(total);
      if (mode === 'story') showFrame(frames - 1);
      if (mode === 'story') bars.forEach(bar => bar.classList.add('done'));
      if (mode === 'ads') selectSite(sites.length - 1);
      card.classList.add('is-read', 'is-picked', 'is-opened');
      card.classList.remove('is-whole');
      steps.forEach(step => step.classList.add('on'));
      fillSha(card);
    };
    tabs.forEach(tab => tab.addEventListener('click', () => { if (card.classList.contains('is-done')) selectSite(Number(tab.dataset.pfSite)); }));
    if (reduceMotion) { finished(); return; }
    // The start: the drawn page, nothing captured yet.
    const reset = () => {
      clear();
      card.classList.add('is-snap', 'is-ready', 'is-armed');
      card.classList.remove('is-on', 'is-scrolling', 'is-done', ...STAGES);
      steps.forEach(step => step.classList.remove('on'));
      if (count) count.textContent = '0';
      card.querySelectorAll('[data-pf-sha]').forEach(code => { code.textContent = ''; });
      if (mode === 'story') { showFrame(0); bars.forEach(bar => bar.classList.remove('done', 'on')); if (count) count.textContent = '0'; }
      if (mode === 'ads') selectSite(0, 'start');
      void card.offsetWidth;
      card.classList.remove('is-snap');
    };
    const run = () => {
      reset();
      at(400, () => card.classList.add('is-on'));
      if (mode === 'scroll' || mode === 'section') {
        at(1300, () => { card.classList.remove('is-armed'); card.classList.add('is-scrolling'); });
        for (let n = 1; n <= total; n += 1) at(1300 + (n / total) * SCROLL_MS, () => { if (count) count.textContent = String(n); });
        at(1300 + SCROLL_MS + 100, () => card.classList.add('is-done'));
        typeSha(shaIn(card), 1300 + SCROLL_MS + (mode === 'section' ? 1300 : 500));
      } else if (mode === 'story') {
        const SNAP_MS = 1100;
        for (let k = 0; k < frames; k += 1) at(1000 + k * SNAP_MS, () => showFrame(k));
        at(1000 + frames * SNAP_MS, () => { bars.forEach(bar => { bar.classList.remove('on'); bar.classList.add('done'); }); card.classList.add('is-done'); });
        typeSha(shaIn(card), 1000 + frames * SNAP_MS + 300);
      } else if (mode === 'ads') {
        card.classList.remove('is-armed');
        const SITE_MS = 9000;
        sites.forEach((panel, i) => {
          const t0 = 1100 + i * SITE_MS;
          at(t0, () => selectSite(i, 'start'));
          at(t0 + 150, () => selectSite(i, 'scrolling'));
          at(t0 + 150 + SCROLL_MS + 200, () => selectSite(i, 'picked'));
          at(t0 + 150 + SCROLL_MS + 1300, () => selectSite(i, 'done'));
          typeSha(shaIn(card.querySelector(`[data-pf-site-cap="${i}"]`)), t0 + 150 + SCROLL_MS + 1800);
        });
        at(1100 + sites.length * SITE_MS - 2000, () => card.classList.add('is-done'));
      } else if (mode === 'leo') {
        const STEP_MS = 700;
        at(1300, () => { card.classList.remove('is-armed'); card.classList.add('is-scrolling'); });
        at(1300 + SCROLL_MS, () => card.classList.add('is-read'));
        steps.forEach((step, k) => at(1300 + SCROLL_MS + 400 + k * STEP_MS, () => step.classList.add('on')));
        const end = 1300 + SCROLL_MS + 400 + steps.length * STEP_MS;
        at(end, () => card.classList.add('is-done'));
        typeSha(shaIn(card), end + 200);
      } else if (mode === 'web') {
        const on = k => () => { if (steps[k]) steps[k].classList.add('on'); };
        card.classList.remove('is-armed');
        at(900, on(0));
        at(1300, () => card.classList.add('is-scrolling'));
        at(2900, () => card.classList.add('is-picked'));
        at(2900, on(1));
        at(3900, () => card.classList.add('is-opened'));
        at(4500, () => card.classList.add('is-whole'));
        at(4500, on(2));
        at(7700, on(3));
        at(8300, on(4));
        at(8900, () => { card.classList.remove('is-whole'); card.classList.add('is-done'); });
        typeSha(shaIn(card), 9100);
      } else if (mode === 'open') {
        const STEP_MS = 650;
        card.classList.remove('is-armed');
        at(1000, () => card.classList.add('is-picked'));
        at(1900, () => card.classList.add('is-opened'));
        steps.forEach((step, k) => at(2800 + k * STEP_MS, () => step.classList.add('on')));
        const end = 2800 + steps.length * STEP_MS;
        at(end, () => card.classList.add('is-done'));
        typeSha(shaIn(card), end + 200);
      }
    };
    // With a mouse (2026-11-09: "make the video preview appear as the mouse is hovering over"): the card waits on its drawn page with a
    // play button, plays while the pointer is over the window, and goes back to the start when it leaves. Touch screens play it when the
    // card comes into view.
    if (hoverPlay) {
      const frame = card.querySelector('.pf-frame') || card;
      const play = document.createElement('span');
      play.className = 'pf-play';
      play.setAttribute('aria-hidden', 'true');
      frame.appendChild(play);
      const idle = () => { reset(); card.classList.add('is-idle'); };
      frame.addEventListener('mouseenter', () => { card.classList.remove('is-idle'); run(); });
      frame.addEventListener('mouseleave', idle);
      idle();
      return;
    }
    finished();
    let seen = false;
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !seen) { seen = true; run(); }
        if (!entry.isIntersecting && seen) { seen = false; finished(); }
      });
    }, { threshold: 0.6 }).observe(card);
  });
  // Encrypted case vaults card (2026-11-09: "Can we get the animation we created for the vault closing there and locking for this?"):
  // the promo's closing scene, same timings. Evidence flies into the case, Close Case is pressed, the case shuts and sinks into the
  // vault, the door swings shut and slams, the wheel spins, the eight bolts lock out, the padlock snaps shut, then the AES-256 badge.
  // At rest the card shows the locked vault; with a mouse it plays while hovered (play button), touch screens play it in view.
  document.querySelectorAll('[data-vault-demo]').forEach(card => {
    const box = card.querySelector('.vd-box');
    const scene = card.querySelector('.vd-scene');
    if (!box || !scene) return;
    const q = sel => card.querySelector(sel);
    const c = {
      vault: q('.vd-vault'), frame: q('.vd-frame'), ring: q('.vd-ring'), fold: q('.vd-fold'), front: q('.vd-fold-front'), door: q('.vd-door'),
      btn: q('.vd-btn'), stat: q('.vd-stat'), badge: q('.vd-badge'), wheel: q('.vd-wheel'), shackle: q('.vd-shackle'),
      bolts: Array.from(card.querySelectorAll('.vd-bolt')),
      chips: Array.from(card.querySelectorAll('.vd-chip')).map(el => ({ el, x: Number(el.dataset.x), y: Number(el.dataset.y) })),
    };
    const CX = 588, CY = 331, END = 3.6;
    const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
    const P = (t, s, d) => clamp((t - s) / d);
    const lerp = (a, b, x) => a + (b - a) * x;
    const eOut = x => 1 - Math.pow(1 - x, 3);
    const eIn = x => x * x * x;
    const eIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const eBack = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
    const draw = u => {
      // the open case and its Close Case button
      const fp = eOut(P(u, 0.02, 0.35)), into = eIO(P(u, 1.35, 0.42));
      c.fold.style.opacity = fp * (1 - P(u, 1.68, 0.1));
      c.fold.style.transform = `translateY(${(1 - fp) * 50 + into * 5}px) scale(${lerp(0.94, 1, fp) * lerp(1, 0.4, into)})`;
      c.front.style.transform = `perspective(900px) rotateX(${lerp(-42, 0, eIO(P(u, 1.05, 0.28)))}deg)`;
      const press = Math.sin(P(u, 1.0, 0.16) * Math.PI);
      c.btn.style.opacity = clamp(P(u, 0.15, 0.25)) * (1 - P(u, 1.3, 0.2));
      c.btn.style.transform = `scale(${1 - 0.07 * press})`;
      c.btn.style.boxShadow = `0 0 0 ${12 * press}px rgba(240,200,120,${0.35 * press}),0 12px 30px rgba(0,0,0,.4)`;
      // evidence flies into the case
      c.chips.forEach((o, i) => {
        const ts = 0.35 + i * 0.1, a = P(u, ts, 0.4), m = eIn(P(u, ts + 0.12, 0.34));
        o.el.style.opacity = clamp(a * 4) * (1 - P(u, ts + 0.4, 0.06));
        o.el.style.transform = `translate(${lerp(o.x, CX, m)}px,${lerp(o.y, CY - 40, m)}px) translate(-50%,-50%) scale(${lerp(0.6, 1, eBack(clamp(a * 2.5))) * lerp(1, 0.35, m)})`;
      });
      // the vault opens behind, the door swings shut and slams
      const vf = eOut(P(u, 1.2, 0.35));
      c.frame.style.opacity = vf;
      c.frame.style.transform = `scale(${lerp(0.82, 1, vf)})`;
      const dr = P(u, 1.7, 0.45);
      c.door.style.opacity = clamp(dr * 5);
      c.door.style.transform = `perspective(1600px) rotateY(${lerp(-100, 0, eIn(dr))}deg)`;
      const sl = P(u, 2.15, 0.3);
      c.vault.style.transform = sl > 0 && sl < 1 ? `translate(${Math.sin(sl * 42) * (1 - sl) * 7}px,${Math.cos(sl * 37) * (1 - sl) * 3}px)` : 'none';
      // wheel spins, bolts lock out, padlock snaps shut
      c.wheel.setAttribute('transform', `rotate(${-300 * eIO(P(u, 2.2, 0.45))} 210 210)`);
      const bo = eOut(P(u, 2.45, 0.15));
      c.bolts.forEach(b => b.setAttribute('transform', `translate(${26 * bo},0)`));
      c.shackle.setAttribute('transform', `translate(0,${-9 * (1 - eOut(P(u, 2.68, 0.12)))})`);
      const g = eOut(P(u, 2.72, 0.3));
      c.door.style.filter = g > 0 ? `drop-shadow(0 0 ${34 * g}px rgba(240,200,120,${0.55 * g}))` : 'none';
      const rp = P(u, 2.72, 0.8), R = lerp(215, 330, eOut(rp));
      Object.assign(c.ring.style, { left: `${CX - R}px`, top: `${CY - R}px`, width: `${2 * R}px`, height: `${2 * R}px`, opacity: rp > 0 ? (1 - rp) * 0.85 : 0 });
      // status, badge
      c.stat.style.opacity = clamp(P(u, 1.1, 0.2));
      const bd = P(u, 2.85, 0.32);
      c.badge.style.opacity = clamp(bd * 3);
      c.badge.style.transform = `translateX(-50%) scale(${lerp(0.5, 1, eBack(bd))})`;
    };
    const fit = () => { scene.style.transform = `scale(${box.clientWidth / 1176})`; };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box);
    let raf = 0;
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const rest = () => { stop(); draw(END + 1); };
    const play = () => {
      stop();
      const t0 = performance.now();
      const step = now => { const u = (now - t0) / 1000; draw(u); raf = u < END ? requestAnimationFrame(step) : 0; };
      draw(0);
      raf = requestAnimationFrame(step);
    };
    rest();
    if (reduceMotion) return;
    if (hoverPlay) {
      const button = document.createElement('span');
      button.className = 'pf-play';
      button.setAttribute('aria-hidden', 'true');
      box.appendChild(button);
      card.classList.add('is-idle');
      box.addEventListener('mouseenter', () => { card.classList.remove('is-idle'); play(); });
      box.addEventListener('mouseleave', () => { rest(); card.classList.add('is-idle'); });
      return;
    }
    let seen = false;
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !seen) { seen = true; play(); }
        if (!entry.isIntersecting && seen) { seen = false; rest(); }
      });
    }, { threshold: 0.6 }).observe(box);
  });
})();
