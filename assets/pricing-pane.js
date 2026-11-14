/* Pricing hero pane (2026-11-14): the right pane shows the licensing tiers or the add-on modules.
   Its tabs switch it, and the hero's "Add-on modules" button opens the add-ons there instead of scrolling down the page. */
(() => {
  'use strict';
  const pane = document.querySelector('[data-pricing-pane]');
  if (!pane) return;
  const tabs = [...pane.querySelectorAll('[role="tab"]')];
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const show = (panelId, focusTab) => {
    tabs.forEach(tab => {
      const on = tab.getAttribute('aria-controls') === panelId;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
      if (on && focusTab) tab.focus({ preventScroll: true });
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => show(tab.getAttribute('aria-controls')));
    tab.addEventListener('keydown', event => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = tabs[(index + step + tabs.length) % tabs.length];
      show(next.getAttribute('aria-controls'), true);
    });
  });

  document.querySelectorAll('.v2-hero-band a[href="#addons"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      show('pane-addons', true);
      // On a narrow screen the pane sits under the buttons: bring it into view.
      const box = pane.getBoundingClientRect();
      if (box.top < 0 || box.top > window.innerHeight - 120) {
        pane.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });
})();
