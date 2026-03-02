/* =========================================================
   fynnhofmann.com – Auth Guard
   Include as FIRST <script> in <head> of every secure page.
   Blocks rendering instantly; shows content only when the
   correct session token exists, otherwise replaces page
   with a login-required wall.
   ========================================================= */
(function () {
  'use strict';

  var SESSION_KEY = 'fh_auth';
  var VALID_TOKEN = 'fh_authed_2026';

  /* ── Block body BEFORE it paints ─────────────────────── */
  var block = document.createElement('style');
  block.id = '_fh_auth_block';
  block.textContent = 'body{display:none!important}';
  (document.head || document.documentElement).appendChild(block);

  function unblock() {
    var el = document.getElementById('_fh_auth_block');
    if (el) el.remove();
  }

  /* ── Authenticated path ───────────────────────────────── */
  if (sessionStorage.getItem(SESSION_KEY) === VALID_TOKEN) {
    document.addEventListener('DOMContentLoaded', unblock);

    window.fhLogout = function () {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = '../login.html?logout=1';
    };
    return;
  }

  /* ── Not authenticated → inject wall at DOMContentLoaded */
  document.addEventListener('DOMContentLoaded', function () {
    /* Self-contained wall styles – no external CSS needed */
    var css = document.createElement('style');
    css.textContent =
      'html,body{height:100%;margin:0}' +
      'body{display:flex!important;min-height:100vh;' +
        'background:#f5f5f7;' +
        'font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;' +
        'align-items:center;justify-content:center;flex-direction:column}' +
      '.fh-wall{text-align:center;padding:40px 24px;max-width:400px}' +
      '.fh-wall-icon{font-size:52px;display:block;margin-bottom:24px}' +
      '.fh-wall-title{font-size:28px;font-weight:700;letter-spacing:-.03em;' +
        'color:#1d1d1f;margin:0 0 12px;line-height:1.1}' +
      '.fh-wall-text{font-size:15px;color:#6e6e73;line-height:1.65;' +
        'margin:0 0 32px;max-width:300px;margin-left:auto;margin-right:auto}' +
      '.fh-wall-btn{display:inline-flex;align-items:center;gap:6px;' +
        'padding:14px 28px;background:#0071e3;color:#fff;border-radius:980px;' +
        'font-size:15px;font-weight:500;text-decoration:none;' +
        'transition:background .2s,transform .2s}' +
      '.fh-wall-btn:hover{background:#0077ed;transform:translateY(-1px)}' +
      '.fh-wall-back{display:block;margin-top:20px;font-size:13px;' +
        'color:#6e6e73;text-decoration:none;transition:color .2s}' +
      '.fh-wall-back:hover{color:#1d1d1f}';
    document.head.appendChild(css);

    document.body.innerHTML =
      '<div class="fh-wall">' +
        '<span class="fh-wall-icon">🔒</span>' +
        '<h1 class="fh-wall-title">Zugriff gesperrt</h1>' +
        '<p class="fh-wall-text">Diese Seite ist passwortgeschützt. ' +
          'Bitte melde dich an, um fortzufahren.</p>' +
        '<a href="../login.html" class="fh-wall-btn">Zum Login →</a>' +
        '<a href="../index.html" class="fh-wall-back">← Zurück zur Website</a>' +
      '</div>';

    unblock();
  });
})();
