// Partner page — Partner Conference multi-image gallery.
// Same scroll-snap technique as js/thought-leaders.js: works with any
// number of images, prev/next step by index via scrollIntoView, and the
// dot for whichever image sits closest to the left edge is kept active.

(function () {
  const wrap = document.querySelector('.pcg-track-wrap');
  const track = document.getElementById('pcgTrack');
  const dotsWrap = document.getElementById('pcg-dots');
  if (!wrap || !track || !dotsWrap) return; // guard: element absent on other pages

  const items = Array.from(track.children);
  const prev = document.getElementById('pcg-prev');
  const next = document.getElementById('pcg-next');
  let current = 0;

  items.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 't-dot' + (i === 0 ? ' active' : '');
    b.setAttribute('aria-label', 'Go to photo ' + (i + 1));
    b.addEventListener('click', () => scrollToItem(i));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function setActive(i) {
    current = i;
    dots.forEach((d, n) => d.classList.toggle('active', n === i));
  }

  function scrollToItem(i) {
    setActive(Math.max(0, Math.min(i, items.length - 1)));
    items[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  if (prev) prev.addEventListener('click', () => scrollToItem(current - 1));
  if (next) next.addEventListener('click', () => scrollToItem(current + 1));

  let scrollTimer;
  wrap.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const wrapLeft = wrap.getBoundingClientRect().left;
      let closest = 0;
      let closestDist = Infinity;
      items.forEach((el, i) => {
        const dist = Math.abs(el.getBoundingClientRect().left - wrapLeft);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      setActive(closest);
    }, 120);
  });
})();
