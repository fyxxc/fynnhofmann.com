/* =========================================================
   fynnhofmann.com – Shared Header & Footer
   Reads data-base="" from <html> to resolve relative paths.
   Root pages use data-base="", pages/ use data-base="../",
   tools/[x]/ use data-base="../../"
   ========================================================= */
(function () {
  var base = document.documentElement.dataset.base || '';

  /* ── Header ──────────────────────────────────────────── */
  var header = document.createElement('header');
  header.className = 'header';
  header.id = 'header';
  header.innerHTML =
    '<nav class="nav">' +
      '<a href="' + base + 'index.html" class="nav-logo" id="logo-trigger" aria-label="Startseite">f</a>' +
      '<ul class="nav-links">' +
        '<li><a href="' + base + 'pages/erfahrung.html">Erfahrung</a></li>' +
        '<li><a href="' + base + 'pages/projekte.html">Projekte</a></li>' +
        '<li><a href="' + base + 'pages/kontakt.html" class="nav-cta">Kontakt</a></li>' +
      '</ul>' +
      '<button class="nav-burger" id="navBurger" aria-label="Menü öffnen">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
    '</nav>' +
    '<div class="nav-mobile" id="navMobile">' +
      '<a href="' + base + 'pages/erfahrung.html" class="nav-mobile-link">Erfahrung</a>' +
      '<a href="' + base + 'pages/projekte.html" class="nav-mobile-link">Projekte</a>' +
      '<a href="' + base + 'pages/kontakt.html" class="nav-mobile-link">Kontakt</a>' +
    '</div>';

  document.body.insertBefore(header, document.body.firstChild);

  /* ── Footer ──────────────────────────────────────────── */
  var footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML =
    '<div class="container">' +
      '<div class="footer-content">' +
        '<div class="footer-left">' +
          '<a href="' + base + 'index.html" class="logo-mark" aria-label="Startseite">f</a>' +
          '<nav class="footer-nav">' +
            '<span class="footer-tools-group">' +
              '<button class="footer-tools-toggle" id="footerToolsToggle" aria-expanded="false">' +
                'Tools <span class="footer-tools-arrow">▾</span>' +
              '</button>' +
              '<div class="footer-tools-drawer" id="footerToolsDrawer">' +
                '<a href="' + base + 'tools/qr/">QR-Generator</a>' +
                '<a href="' + base + 'tools/spiel/index.html">Spiel</a>' +
                '<a href="' + base + 'tools/orbit/">Gravity</a>' +
                '<a href="' + base + 'tools/tipper/">Tipp-Test</a>' +
                '<a href="' + base + 'tools/inspector/">Inspector</a>' +
              '</div>' +
            '</span>' +
            '<a href="' + base + 'pages/impressum.html">Impressum</a>' +
          '</nav>' +
        '</div>' +
        '<div class="footer-right">' +
          '<p>© 2026 Fynn Hofmann</p>' +
          '<a href="' + base + 'login.html" class="footer-login-link" title="Admin Login" aria-label="Admin Login">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>' +
              '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
            '</svg>' +
          '</a>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(footer);

  /* ── Footer Tools Toggle ──────────────────────────────── */
  var toolsToggle = document.getElementById('footerToolsToggle');
  var toolsDrawer = document.getElementById('footerToolsDrawer');
  if (toolsToggle && toolsDrawer) {
    toolsToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = toolsToggle.getAttribute('aria-expanded') === 'true';
      toolsToggle.setAttribute('aria-expanded', String(!open));
      toolsDrawer.classList.toggle('open', !open);
    });
    document.addEventListener('click', function (e) {
      if (!toolsToggle.contains(e.target) && !toolsDrawer.contains(e.target)) {
        toolsToggle.setAttribute('aria-expanded', 'false');
        toolsDrawer.classList.remove('open');
      }
    });
  }
})();
