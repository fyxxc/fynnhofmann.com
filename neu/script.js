// Jahreszahl
document.getElementById('year').textContent = new Date().getFullYear();

// Hero-Animation beim Laden
window.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.hero').classList.add('loaded');
});

// Scroll-Reveal
var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(function (el) {
  observer.observe(el);
});
