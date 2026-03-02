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
    var ua = navigator.userAgent;

    function detectBrowser(ua) {
      if (ua.indexOf('Firefox') !== -1)  return 'Firefox';
      if (ua.indexOf('Edg') !== -1)      return 'Edge';
      if (ua.indexOf('Chrome') !== -1)   return 'Chrome';
      if (ua.indexOf('Safari') !== -1)   return 'Safari';
      return 'Unknown';
    }
    function detectOS(ua) {
      if (ua.indexOf('Windows') !== -1)                          return 'Windows';
      if (ua.indexOf('Mac OS') !== -1)                           return 'macOS';
      if (ua.indexOf('Android') !== -1)                          return 'Android';
      if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) return 'iOS';
      if (ua.indexOf('Linux') !== -1)                            return 'Linux';
      return 'Unknown';
    }

    var browser = detectBrowser(ua);
    var os      = detectOS(ua);
    var time    = new Date().toISOString();

    var css = document.createElement('style');
    css.textContent =
      '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap");' +
      'html,body{margin:0;background:#fff;color:#1d1d1f;' +
        'font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif}' +
      'body{display:block!important}' +
      '.fh-wall{max-width:640px;margin:18vh auto;padding:0 28px}' +
      '.fh-wall-icon{font-size:1.6rem;margin-bottom:18px;color:#6e6e73}' +
      '.fh-wall h1{font-size:1.7rem;font-weight:500;letter-spacing:-0.01em;margin:0 0 12px}' +
      '.fh-wall p{color:#6e6e73;line-height:1.6;margin:0 0 34px;max-width:480px}' +
      '.fh-wall a{color:#06c;text-decoration:none}' +
      '.fh-wall a:hover{text-decoration:underline}' +
      '.fh-debug{font-size:.85rem;color:#6e6e73;line-height:1.9}' +
      '.fh-footer{margin-top:40px;font-size:.8rem;color:#8e8e93}';
    document.head.appendChild(css);

    document.body.innerHTML =
      '<div class="fh-wall">' +
        '<div class="fh-wall-icon">⛔</div>' +
        '<h1>Zugriff verweigert.</h1>' +
        '<p>Diese Seite ist nicht öffentlich zugänglich. ' +
          'Sie ist Teil der <a href="../index.html">fynnhofmann.com</a>-Infrastruktur.</p>' +
        '<div class="fh-debug">' +
          '<div>IP: <span id="_fh_ip">wird geladen…</span></div>' +
          '<div>Browser: ' + browser + '</div>' +
          '<div>OS: ' + os + '</div>' +
          '<div>Zeit: ' + time + '</div>' +
        '</div>' +
        '<div class="fh-footer">Zugriff protokolliert · ' +
          '<a href="../login.html">Anmelden</a>' +
        '</div>' +
      '</div>';

    /* IP via Cloudflare CDN trace (only works on Cloudflare Pages) */
    fetch('/cdn-cgi/trace')
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        var match = txt.match(/^ip=(.+)$/m);
        var el = document.getElementById('_fh_ip');
        if (el) el.textContent = match ? match[1] : 'n/a';
      })
      .catch(function () {
        var el = document.getElementById('_fh_ip');
        if (el) el.textContent = 'n/a';
      });

    unblock();
  });
})();
