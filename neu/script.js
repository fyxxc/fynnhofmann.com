/* ═══════════════════════════════════════════════════════════════
   FYNN HOFMANN – script.js
   ═══════════════════════════════════════════════════════════════ */

/* ── Year ─────────────────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── Nav: add .scrolled class ─────────────────────────────────── */
(function () {
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* ── Mobile burger ────────────────────────────────────────────── */
(function () {
  var burger = document.getElementById('navBurger');
  var menu   = document.getElementById('mobileMenu');
  var links  = document.querySelectorAll('.mobile-link');
  var open   = false;

  function toggle() {
    open = !open;
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';

    // Animate burger → cross
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

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      if (open) toggle();
    });
  });
})();

/* ── Scroll reveal (IntersectionObserver) ─────────────────────── */
(function () {
  var revealClasses = ['.reveal-up', '.reveal-line', '.split-title'];
  var elements = document.querySelectorAll(revealClasses.join(','));

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // fire once only
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ── Hero words: animate in after a short delay on load ───────── */
(function () {
  var words = document.querySelectorAll('.hero__word');
  // Stagger each word
  words.forEach(function (word, i) {
    setTimeout(function () {
      word.classList.add('is-visible');
    }, 180 + i * 160);
  });

  // eyebrow & sub also appear on load
  var heroEyebrow = document.querySelector('.hero__eyebrow');
  var heroSub     = document.querySelector('.hero__sub');

  if (heroEyebrow) {
    setTimeout(function () {
      heroEyebrow.classList.add('is-visible');
    }, 80);
  }
  if (heroSub) {
    setTimeout(function () {
      heroSub.classList.add('is-visible');
    }, 600);
  }
})();

/* ── Smooth parallax on section titles ────────────────────────── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var titles = document.querySelectorAll('.section__title.split-title');

  function applyParallax() {
    var scrollY = window.scrollY;
    titles.forEach(function (el) {
      var rect   = el.getBoundingClientRect();
      var center = rect.top + rect.height / 2;
      var rel    = (window.innerHeight / 2 - center) * 0.06; // subtle factor

      // Only shift if already visible (not still in enter-animation)
      if (el.classList.contains('is-visible')) {
        el.style.transform = 'translateX(' + rel + 'px)';
      }
    });
  }

  window.addEventListener('scroll', applyParallax, { passive: true });
})();

/* ── Band: duplicate track for seamless loop ──────────────────── */
(function () {
  var track = document.querySelector('.band__track');
  if (!track) return;
  // Clone the inner HTML and append so the marquee loops perfectly
  track.innerHTML += track.innerHTML;
})();
