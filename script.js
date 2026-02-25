/* =========================================================
   fynnhofmann.com – Main Script
   ========================================================= */

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => {
  revealObserver.observe(el);
});

// ===== HEADER SHADOW ON SCROLL =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 8) {
    header.style.borderBottomColor = 'rgba(0,0,0,0.14)';
  } else {
    header.style.borderBottomColor = 'rgba(0,0,0,0.08)';
  }
}, { passive: true });

// ===== MOBILE NAV =====
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');

if (navBurger && navMobile) {
  navBurger.addEventListener('click', () => {
    navMobile.classList.toggle('open');
    navBurger.setAttribute('aria-expanded', navMobile.classList.contains('open'));
  });

  // Close mobile nav on link click
  navMobile.querySelectorAll('.nav-mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      navMobile.classList.remove('open');
    });
  });
}

// ===== EASTER EGG =====
// Click the "FH" logo 5 times within 3 seconds to trigger
let clickCount  = 0;
let clickTimer  = null;

const logoTrigger  = document.getElementById('logo-trigger');
const easterEgg    = document.getElementById('easterEgg');
const easterClose  = document.getElementById('easterEggClose');

if (logoTrigger && easterEgg) {
  logoTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    clickCount++;

    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 3000);

    if (clickCount >= 5) {
      clickCount = 0;
      openEasterEgg();
    }
  });
}

function openEasterEgg() {
  easterEgg.classList.add('active');
  document.body.style.overflow = 'hidden';
  launchConfetti();
}

function closeEasterEgg() {
  easterEgg.classList.remove('active');
  document.body.style.overflow = '';
}

// Close button
if (easterClose) {
  easterClose.addEventListener('click', closeEasterEgg);
}

// Close on backdrop click
if (easterEgg) {
  easterEgg.addEventListener('click', (e) => {
    if (e.target === easterEgg) closeEasterEgg();
  });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (easterEgg  && easterEgg.classList.contains('active'))  closeEasterEgg();
    if (easterEgg2 && easterEgg2.classList.contains('active')) closeEasterEgg2();
  }
});

// ===== EASTER EGG 2 – Konami Code =====
const KONAMI_SEQ = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'b','a'
];
let konamiIdx  = 0;
const easterEgg2     = document.getElementById('easterEgg2');
const easterClose2   = document.getElementById('easterEgg2Close');

document.addEventListener('keydown', (e) => {
  if (e.key === KONAMI_SEQ[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === KONAMI_SEQ.length) {
      konamiIdx = 0;
      openEasterEgg2();
    }
  } else {
    konamiIdx = e.key === KONAMI_SEQ[0] ? 1 : 0;
  }
});

function openEasterEgg2() {
  if (!easterEgg2) return;
  easterEgg2.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeEasterEgg2() {
  if (!easterEgg2) return;
  easterEgg2.classList.remove('active');
  document.body.style.overflow = '';
}

if (easterClose2) {
  easterClose2.addEventListener('click', closeEasterEgg2);
}
if (easterEgg2) {
  easterEgg2.addEventListener('click', (e) => {
    if (e.target === easterEgg2) closeEasterEgg2();
  });
}

// ===== CONFETTI =====
function launchConfetti() {
  const colors = ['#0071e3', '#30d158', '#ff9f0a', '#ff375f', '#bf5af2', '#1d1d1f'];
  const count  = 70;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      const size  = 6 + Math.random() * 7;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const dur   = 1.8 + Math.random() * 1.6;
      const xPos  = Math.random() * 100;
      const shape = Math.random() > 0.5 ? '50%' : '2px';

      el.style.cssText = `
        position: fixed;
        top: -12px;
        left: ${xPos}vw;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape};
        z-index: 9999;
        pointer-events: none;
        animation: confettiFall ${dur}s ease-in forwards;
        transform: rotate(${Math.random() * 360}deg);
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), (dur + 0.2) * 1000);
    }, i * 28);
  }
}

// ===== SMOOTH ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.style.opacity = link.getAttribute('href') === `#${id}` ? '1' : '0.75';
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach((s) => navObserver.observe(s));
