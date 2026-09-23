// Careers page — "Life at PeoplesHR" photo carousel.
// Same interaction model as the testimonial carousel in js/phr.js
// (prev/next, dots, swipe, autoplay), scoped to its own elements.

(function () {
  const track = document.getElementById('careersGalleryTrack');
  if (!track) return; // guard: element absent on other pages

  const dots = document.querySelectorAll('#g-dots .t-dot');
  const prev = document.getElementById('g-prev');
  const next = document.getElementById('g-next');
  const total = dots.length;
  let current = 0;
  let autoTimer;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (prev) prev.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  if (next) next.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetAuto(); }));

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
  });

  function resetAuto() { clearInterval(autoTimer); autoTimer = setInterval(() => goTo(current + 1), 5000); }
  resetAuto();
})();
