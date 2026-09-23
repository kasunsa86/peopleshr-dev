// Community page — vertical rotating keyword list ("Join the Community" section).
// Cycles through items, keeping the active one centered in view.

(function () {
  const wrap = document.querySelector('.community-rotator');
  const track = document.getElementById('communityRotatorTrack');
  if (!wrap || !track) return; // guard: element absent on other pages

  const items = track.querySelectorAll('.community-rotator-item');
  if (!items.length) return;
  let idx = 0;

  function center(i, animate) {
    if (!animate) track.style.transition = 'none';
    const el = items[i];
    const offset = el.offsetTop + el.offsetHeight / 2 - wrap.clientHeight / 2;
    track.style.transform = `translateY(${-offset}px)`;
    items.forEach((it, n) => it.classList.toggle('active', n === i));
    if (!animate) {
      void track.offsetHeight; // force reflow so the transition re-applies cleanly next time
      track.style.transition = '';
    }
  }

  center(idx, false);

  setInterval(function () {
    const next = idx + 1;
    if (next >= items.length) {
      idx = 0;
      center(idx, false); // snap back to the top without an animated jump
    } else {
      idx = next;
      center(idx, true);
    }
  }, 1800);
})();
