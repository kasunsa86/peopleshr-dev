// Community page — "Meet our Thought Leaders" horizontal carousel.
// Uses native scroll-snap so it works with any number of cards without
// recalculating page counts. Prev/next step through cards by index (via
// scrollIntoView, same mechanism as the dots) rather than a fixed pixel
// offset — with only a few cards the scrollable range can be shorter than
// one card's width, so a blind scrollBy() overshoots and lands mid-card.

(function () {
  const wrap = document.querySelector('.tl-track-wrap');
  const track = document.getElementById('tlTrack');
  const dotsWrap = document.getElementById('tl-dots');
  if (!wrap || !track || !dotsWrap) return; // guard: element absent on other pages

  const cards = Array.from(track.children);
  const prev = document.getElementById('tl-prev');
  const next = document.getElementById('tl-next');
  let current = 0;

  cards.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 't-dot' + (i === 0 ? ' active' : '');
    b.setAttribute('aria-label', 'Go to person ' + (i + 1));
    b.addEventListener('click', () => scrollToCard(i));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function setActive(i) {
    current = i;
    dots.forEach((d, n) => d.classList.toggle('active', n === i));
  }

  function scrollToCard(i) {
    setActive(Math.max(0, Math.min(i, cards.length - 1)));
    cards[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  if (prev) prev.addEventListener('click', () => scrollToCard(current - 1));
  if (next) next.addEventListener('click', () => scrollToCard(current + 1));

  // With more than one card visible at once (2-up on desktop), an
  // IntersectionObserver threshold can fire for several cards at the same
  // scroll position, so "most recently crossed 60%" is unreliable. Instead,
  // after scrolling settles, pick whichever card sits closest to the
  // track's left edge — that's unambiguous and matches what scroll-snap
  // actually locked onto.
  let scrollTimer;
  wrap.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const wrapLeft = wrap.getBoundingClientRect().left;
      let closest = 0;
      let closestDist = Infinity;
      cards.forEach((c, i) => {
        const dist = Math.abs(c.getBoundingClientRect().left - wrapLeft);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      setActive(closest);
    }, 120);
  });
})();
