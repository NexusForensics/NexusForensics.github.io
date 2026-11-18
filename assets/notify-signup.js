/* "Not yet available" sign-up (2026-11-18). The tier buttons that used to point at a purchase now say so, and open a small pop-up that asks
   for a name, a business name and an e-mail address, for the e-mail list. The answer goes to the Nexus licence server, which stores it in
   the list and tells the owner. Nothing is sold, shared or sent from this page except that one request.
   The pop-up is plain markup added before site-language.js runs, so the language picker translates it like the rest of the page. */
(function () {
  const ENDPOINT = 'https://license.nexus-forensics.ca/v1/notify-signups';
  const MARKUP = `
<dialog class="notify-dialog" data-notify-dialog aria-labelledby="notify-title">
  <form method="dialog" class="notify-form" data-notify-form novalidate>
    <h2 id="notify-title">Not yet available</h2>
    <p class="notify-lead">Sign up to our e-mail list to be notified when Nexus Social Recon is released and when new products are released.</p>
    <label class="notify-field"><span>Name</span><input type="text" name="name" autocomplete="name" maxlength="120" required /></label>
    <label class="notify-field"><span>Business name</span><input type="text" name="businessName" autocomplete="organization" maxlength="160" required /></label>
    <label class="notify-field"><span>E-mail address</span><input type="email" name="email" autocomplete="email" maxlength="254" required /></label>
    <p class="notify-disclaimer">Your information is confidential. It is used only to send you Nexus Forensics news and is never resold or shared.</p>
    <p class="notify-message" data-notify-message="missing" hidden>Please fill in your name, business name and e-mail address.</p>
    <p class="notify-message" data-notify-message="email" hidden>Please enter a valid e-mail address.</p>
    <p class="notify-message" data-notify-message="failed" hidden>We could not save your sign-up. Please try again in a moment.</p>
    <p class="notify-message notify-ok" data-notify-message="done" hidden>Thank you. You are on the list.</p>
    <div class="notify-actions">
      <button type="button" class="button soft" data-notify-close>Close</button>
      <button type="submit" class="button primary" data-notify-send>Sign up</button>
    </div>
  </form>
</dialog>`;

  function setup() {
    document.body.insertAdjacentHTML('beforeend', MARKUP);
    const dialog = document.querySelector('[data-notify-dialog]');
    const form = dialog.querySelector('[data-notify-form]');
    const send = dialog.querySelector('[data-notify-send]');
    const show = key => {
      dialog.querySelectorAll('[data-notify-message]').forEach(item => { item.hidden = item.getAttribute('data-notify-message') !== key; });
    };
    const open = () => {
      show('');
      send.disabled = false;
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      form.querySelector('input')?.focus();
    };
    const close = () => { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); };
    document.querySelectorAll('[data-notify-signup]').forEach(button => button.addEventListener('click', open));
    dialog.querySelector('[data-notify-close]').addEventListener('click', close);
    dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const businessName = String(data.get('businessName') || '').trim();
      const email = String(data.get('email') || '').trim();
      if (!name || !businessName || !email) { show('missing'); return; }
      if (!/^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/.test(email)) { show('email'); return; }
      send.disabled = true;
      try {
        const language = document.documentElement.lang || 'en';
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name, businessName, email, language, source: 'website:' + (location.pathname.split('/').pop() || 'index.html') }),
        });
        const result = await response.json().catch(() => ({}));
        if (response.ok && result.ok) { show('done'); form.reset(); send.disabled = true; setTimeout(close, 2600); return; }
        show(result.reason === 'invalid_email' ? 'email' : 'failed');
      } catch (error) {
        show('failed');
      }
      send.disabled = false;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
