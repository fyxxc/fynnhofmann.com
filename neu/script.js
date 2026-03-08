/* ═══════════════════════════════════════════════════════════════
   FYNN HOFMANN – NEU – script.js
   ═══════════════════════════════════════════════════════════════ */

/* ── Year ─────────────────────────────────────────────────────── */
var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Reduce motion check ──────────────────────────────────────── */
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Hero words: fade in on load ──────────────────────────────── */
(function () {
  var words = document.querySelectorAll('.hero__word');
  words.forEach(function (word, i) {
    setTimeout(function () {
      word.classList.add('is-visible');
    }, 200 + i * 220);
  });

  var lines = document.querySelectorAll('.hero__eyebrow, .hero__sub');
  lines.forEach(function (el) {
    setTimeout(function () {
      el.classList.add('is-visible');
    }, 100);
  });
})();

/* ── Scroll: hero split + section title parallax ──────────────── */
(function () {
  if (reduceMotion) return;

  var heroFynn    = document.getElementById('heroFynn');
  var heroHofmann = document.getElementById('heroHofmann');

  /* Section titles with data-parallax attribute */
  var parallaxTitles = Array.prototype.slice.call(
    document.querySelectorAll('.section__title[data-parallax]')
  );

  function tick() {
    var scrollY = window.scrollY;

    /* ── Hero split ─────────────────────────────────────────────
       FYNN drifts left, HOFMANN drifts right.
       At 1× viewport height scrolled: ~±30% of viewport width apart.
       Factor is kept in px-per-px scroll so it scales with speed. */
    if (heroFynn && heroHofmann) {
      heroFynn.style.transform    = 'translateX(' + (-scrollY * 0.38) + 'px)';
      heroHofmann.style.transform = 'translateX(' + ( scrollY * 0.28) + 'px)';
    }

    /* ── Section title drift ────────────────────────────────────
       Each title translates along X proportional to how far its
       centre is from the viewport centre.  Titles tagged "left"
       drift leftward as you scroll past; "right" drift rightward.
       This gives every section title a sense of mass / momentum. */
    parallaxTitles.forEach(function (el) {
      var rect      = el.getBoundingClientRect();
      var centerY   = rect.top + rect.height / 2;
      var relPos    = (centerY - window.innerHeight * 0.5) / window.innerHeight;
      /* relPos: +1 = one full viewport below centre, -1 = above */
      var dir  = el.dataset.parallax === 'left' ? 1 : -1;
      var xPx  = relPos * 80 * dir; /* max ±80 px drift */
      el.style.transform = 'translateX(' + xPx + 'px)';
    });
  }

  window.addEventListener('scroll', tick, { passive: true });
  tick(); /* run once immediately */
})();

/* ── IntersectionObserver: reveal on scroll ───────────────────── */
(function () {
  var targets = document.querySelectorAll(
    '.reveal-up, .reveal-line, .section__title'
  );

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();

/* ── Nav: .scrolled class ─────────────────────────────────────── */
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  function check() {
    nav.classList.toggle('scrolled', window.scrollY > 48);
  }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* ── Mobile burger ────────────────────────────────────────────── */
(function () {
  var burger = document.getElementById('navBurger');
  var menu   = document.getElementById('mobileMenu');
  if (!burger || !menu) return;
  var open = false;

  function toggle() {
    open = !open;
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';

    var spans = burger.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(3.5px) rotate(45deg)';
      spans[1].style.transform = 'translateY(-3.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    }
  }

  burger.addEventListener('click', toggle);
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { if (open) toggle(); });
  });
})();

/* ── Band: duplicate for seamless loop ────────────────────────── */
(function () {
  var track = document.querySelector('.band__track');
  if (!track) return;
  track.innerHTML += track.innerHTML; /* second copy fills the gap */
})();
