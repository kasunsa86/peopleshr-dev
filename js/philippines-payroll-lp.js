/* philippines-payroll-lp.html -- page-specific scripts. Loaded after
   js/phr.js and js/vendor/matter.min.js on that page only. */

/* Benefit-tag cloud that rains down into a pile (see .pay-tag-cloud.is-physics
   in css/philippines-payroll-lp.css). Needs Matter.js
   (js/vendor/matter.min.js, loaded before this file).

   The fall is simulated ahead of time, not live: shortly before the cloud
   scrolls into view, every chip becomes a pill-shaped rigid body dropped
   from above in random order, and the whole fall (bounces, tumbles, the
   settled heap) is run instantly in the background and recorded frame by
   frame. That tells us the finished heap's exact height up front, so the
   cloud is sized to it once -- no gap that closes up later. When the cloud
   comes into view the recording plays back in real time.

   Scrolling away mid-fall resets it (so chips never freeze mid-air over
   the heading) and it replays on return; a finished heap stays put. With
   no Matter.js or reduced motion, the static wrapped cloud stays as is. */
(function () {
  var cloud = document.querySelector('.pay-tag-cloud');
  if (!cloud || !window.Matter || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // hide the wrapped chips (keeping their layout for measuring) until they drop
  cloud.classList.add('is-pending');

  var M = window.Matter;
  var chips = Array.prototype.slice.call(cloud.querySelectorAll('.pay-tag-chip'));
  var STEP = 1000 / 60;        // fixed physics step (ms)
  var MAX_STEPS = 60 * 14;     // stop recording after 14s of simulated time
  var GAP = 12;                // space kept above the top of the heap (px)

  var items = [], width = 0, height = 0;
  var rec = null;              // { frames: Float32Array[], last: n }
  var state = 'idle';          // idle | ready | playing | done
  var raf = 0, t0 = 0;

  function rand(min, max) { return min + Math.random() * (max - min); }

  // Run the whole fall offline in floor-relative coordinates (floor at y=0)
  // and record x/y/angle of every chip for every step.
  function simulate() {
    var engine = M.Engine.create({ enableSleeping: true });
    var t = 200, wallOpts = { isStatic: true, friction: 0.6 };
    M.Composite.add(engine.world, [
      M.Bodies.rectangle(width / 2, t / 2, width + t * 2, t, wallOpts),
      M.Bodies.rectangle(-t / 2, -2000, t, 4000, wallOpts),
      M.Bodies.rectangle(width + t / 2, -2000, t, 4000, wallOpts)
    ]);

    // how far above the floor chips start: roughly a loose heap's height
    var area = items.reduce(function (sum, it) { return sum + it.w * it.h; }, 0);
    var est = Math.max(160, area / (width * 0.55));

    // random drop order, one every ~110ms
    var order = items.map(function (_, i) { return i; }).sort(function () { return Math.random() - 0.5; });
    order.forEach(function (i, k) { items[i].dropStep = Math.round((k * 110 + rand(0, 60)) / STEP); });

    var frames = [], bodies = new Array(items.length), last = 0;
    for (var step = 0; step < MAX_STEPS; step++) {
      items.forEach(function (it, i) {
        if (it.dropStep !== step) return;
        var b = M.Bodies.rectangle(
          rand(it.w / 2, width - it.w / 2), -est - rand(60, 260) - it.h, it.w, it.h,
          { chamfer: { radius: it.h / 2 - 1 }, restitution: 0.45, friction: 0.3,
            frictionAir: 0.012, angle: rand(-0.45, 0.45) }
        );
        // heavier rotational inertia: chips still tip and tumble on impact,
        // but most come to rest near flat so the labels stay readable
        M.Body.setInertia(b, b.inertia * 4);
        M.Body.setVelocity(b, { x: rand(-2, 2), y: rand(0, 3) });
        M.Body.setAngularVelocity(b, rand(-0.06, 0.06));
        M.Composite.add(engine.world, b);
        bodies[i] = b;
      });
      M.Engine.update(engine, STEP);

      var f = new Float32Array(items.length * 3), allIn = true, allRest = true;
      bodies.forEach(function (b, i) {
        f[i * 3] = b.position.x; f[i * 3 + 1] = b.position.y; f[i * 3 + 2] = b.angle;
        if (!b.isSleeping) allRest = false;
      });
      for (var i = 0; i < items.length; i++) if (!bodies[i]) { allIn = false; break; }
      frames.push(f);
      last = step;
      if (allIn && allRest) break;
    }

    // exact height of the finished heap
    var top = 0;
    bodies.forEach(function (b) { top = Math.min(top, b.bounds.min.y); });
    height = Math.ceil(-top) + GAP;
    rec = { frames: frames, last: last };
  }

  function draw(stepIndex) {
    var f = rec.frames[Math.min(stepIndex, rec.last)];
    items.forEach(function (it, i) {
      if (stepIndex < it.dropStep) { it.el.classList.remove('is-dropped'); return; }
      // a pill looks the same turned 180deg, so draw any upside-down chip
      // the other way round: same silhouette, label stays readable
      var a = Math.atan2(Math.sin(f[i * 3 + 2]), Math.cos(f[i * 3 + 2]));
      if (a > Math.PI / 2) a -= Math.PI;
      else if (a < -Math.PI / 2) a += Math.PI;
      it.el.style.transform = 'translate(' + (f[i * 3] - it.w / 2) + 'px,' +
        (height + f[i * 3 + 1] - it.h / 2) + 'px) rotate(' + a + 'rad)';
      it.el.classList.add('is-dropped');
    });
  }

  function prepare() {
    // measure each pill in the normal wrapped layout before going absolute
    items = chips.map(function (el) { return { el: el, w: el.offsetWidth, h: el.offsetHeight, dropStep: 0 }; });
    cloud.classList.remove('is-pending');
    cloud.classList.add('is-physics');
    width = cloud.clientWidth;
    simulate();
    cloud.style.height = height + 'px';
    state = 'ready';
  }

  function play() {
    state = 'playing';
    t0 = performance.now();
    (function tick(now) {
      var step = Math.floor((now - t0) / STEP);
      draw(step);
      if (step >= rec.last) { state = 'done'; return; }
      raf = requestAnimationFrame(tick);
    })(t0);
  }

  function reset() {
    cancelAnimationFrame(raf);
    items.forEach(function (it) { it.el.classList.remove('is-dropped'); });
    state = 'ready';
  }

  var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

  // simulate a little before the cloud reaches the viewport, so the height
  // is fixed (and any layout shift happens) while it's still off screen
  var pre = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    pre.disconnect();
    ready.then(function () { if (state === 'idle') prepare(); });
  }, { rootMargin: '600px 0px' });
  pre.observe(cloud);

  // play once a third of the cloud is visible; reset if it leaves mid-fall
  new IntersectionObserver(function (entries) {
    var e = entries[0];
    ready.then(function () {
      if (state === 'idle') prepare();
      if (!e.isIntersecting) { if (state === 'playing') reset(); }
      else if (state === 'ready' && e.intersectionRatio >= 0.35) play();
    });
  }, { threshold: [0, 0.35] }).observe(cloud);

  // new width: re-simulate for the new floor and show the finished heap
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (state === 'idle' || cloud.clientWidth === width) return;
      var wasDone = state === 'done';
      cancelAnimationFrame(raf);
      cloud.classList.remove('is-physics');
      cloud.classList.add('is-pending');
      cloud.style.height = '';
      items.forEach(function (it) { it.el.style.transform = ''; it.el.classList.remove('is-dropped'); });
      prepare();
      if (wasDone) { draw(rec.last); state = 'done'; }
    }, 200);
  });
}());

/* Video testimonial cards (.cs-vid-card) open the
   YouTube player in #pay-vid-modal -- same behaviour as the customers
   page's modal in js/casestudies.js, which this page doesn't load. */
(function () {
  var modal = document.getElementById('pay-vid-modal');
  var iframe = document.getElementById('pay-vid-iframe');
  var closeBtn = document.getElementById('pay-vid-modal-close');
  var titleEl = document.getElementById('pay-vid-modal-title');
  if (!modal || !iframe || !closeBtn) return;

  function openModal(ytId, title) {
    iframe.src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0&modestbranding=1';
    if (titleEl) titleEl.textContent = title || '';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.cs-vid-card[data-youtube]').forEach(function (card) {
    function play() { openModal(card.getAttribute('data-youtube'), card.getAttribute('data-title')); }
    card.addEventListener('click', play);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}());

/* Long dropdown lists (.phr-faq): show the first 4 items, with a
   "View N more" button below that reveals the rest (and becomes "Show
   less"). Done in JS so every item stays visible if scripts don't run. */
(function () {
  var SHOW = 4;
  document.querySelectorAll('.phr-faq').forEach(function (faq) {
    var extra = Array.prototype.slice.call(faq.querySelectorAll('.phr-faq-item')).slice(SHOW);
    if (!extra.length) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pay-faq-more';
    btn.setAttribute('aria-expanded', 'false');
    faq.insertAdjacentElement('afterend', btn);

    function set(expanded) {
      extra.forEach(function (item) {
        item.hidden = !expanded;
        // collapsing: close any open item that's being hidden
        if (!expanded && item.classList.contains('phr-faq-item--open')) {
          item.classList.remove('phr-faq-item--open');
          item.querySelector('.phr-faq-item__body').style.maxHeight = '0';
          item.querySelector('.phr-faq-item__trigger').setAttribute('aria-expanded', 'false');
        }
      });
      btn.setAttribute('aria-expanded', String(expanded));
      btn.innerHTML = (expanded ? 'Show less' : 'View ' + extra.length + ' more') +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
    }
    set(false);

    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') !== 'true';
      set(expanded);
      if (expanded) extra[0].querySelector('.phr-faq-item__trigger').focus({ preventScroll: true });
    });
  });
}());
