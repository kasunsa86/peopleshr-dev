/* ==========================================================================
   CASE STUDY INNER PAGE — scroll-spy for sidebar TOC
   ========================================================================== */
(function () {
  'use strict';

  var tocItems = document.querySelectorAll('.csi-toc-item');
  var sections = Array.from(document.querySelectorAll('.csi-section[id]'));

  if (!tocItems.length || !sections.length) return;

  var OFFSET = 110;

  function getActiveId() {
    var scrollY = window.scrollY || window.pageYOffset;
    var active = sections[0].id;
    for (var i = 0; i < sections.length; i++) {
      var top = sections[i].getBoundingClientRect().top + scrollY;
      if (top - OFFSET <= scrollY) {
        active = sections[i].id;
      }
    }
    return active;
  }

  function updateToc() {
    var activeId = getActiveId();
    tocItems.forEach(function (item) {
      var link = item.querySelector('.csi-toc-link');
      if (!link) return;
      var match = link.getAttribute('href') === '#' + activeId;
      item.classList.toggle('csi-active', match);
    });
  }

  window.addEventListener('scroll', updateToc, { passive: true });
  updateToc();
}());

/* customers page */

/* ── 1. Video Carousel ───────────────────────────────────────────────── */
(function() {
  var overflow = document.querySelector('.cs-vid-overflow');
  var track    = document.getElementById('cs-vid-track');
  var prevBtn  = document.getElementById('cs-vid-prev');
  var nextBtn  = document.getElementById('cs-vid-next');
  if (!overflow || !track || !prevBtn || !nextBtn) return;

  var items = track.querySelectorAll('.cs-vid-item');
  var total = items.length;
  var idx   = 0;

  function step() {
    if (!items.length) return 0;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return items[0].getBoundingClientRect().width + gap;
  }
  function maxScroll() {
    return Math.max(0, track.scrollWidth - overflow.offsetWidth);
  }
  function maxIdx() {
    var s = step();
    var m = maxScroll();
    // Math.ceil, not round: any leftover scroll distance -- even less than
    // half a card -- still means a card is genuinely cut off and needs one
    // more step to reach, otherwise both buttons end up permanently
    // disabled while content stays hidden (e.g. at 1440px the track
    // overflows by only ~64px of a 256px step, which round() drops to 0).
    return s && m > 0 ? Math.ceil(m / s) : 0;
  }
  function offsetForIdx(i) {
    return Math.min(i * step(), maxScroll());
  }
  function render(animate) {
    track.style.transition = animate === false ? 'none' : '';
    track.style.transform  = 'translateX(-' + offsetForIdx(idx) + 'px)';
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= maxIdx();
  }

  prevBtn.addEventListener('click', function() { if (idx > 0) { idx--; render(); } });
  nextBtn.addEventListener('click', function() { if (idx < maxIdx()) { idx++; render(); } });
  window.addEventListener('resize', function() { idx = Math.min(idx, maxIdx()); render(false); });

  /* Click-and-drag on desktop, swipe on touch — unified via Pointer Events */
  var dragging    = false;
  var dragMoved   = false;
  var pointerId   = null;
  var startX      = 0;
  var lastX       = 0;
  var startOffset = 0;

  overflow.addEventListener('pointerdown', function(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging    = true;
    dragMoved   = false;
    pointerId   = e.pointerId;
    startX      = e.clientX;
    lastX       = e.clientX;
    startOffset = offsetForIdx(idx);
    track.style.transition = 'none';
    overflow.classList.add('is-dragging');
  });

  overflow.addEventListener('pointermove', function(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    var dx = e.clientX - startX;
    if (!dragMoved && Math.abs(dx) > 4) {
      dragMoved = true;
      if (overflow.setPointerCapture) { try { overflow.setPointerCapture(pointerId); } catch (err) {} }
    }
    if (!dragMoved) return;
    lastX = e.clientX;
    var raw = startOffset - dx;
    var max = maxScroll();
    if (raw < 0) raw = raw / 3;
    else if (raw > max) raw = max + (raw - max) / 3;
    track.style.transform = 'translateX(-' + raw + 'px)';
    e.preventDefault();
  }, { passive: false });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    overflow.classList.remove('is-dragging');
    if (pointerId != null && overflow.releasePointerCapture) {
      try { overflow.releasePointerCapture(pointerId); } catch (err) {}
    }
    pointerId = null;

    if (!dragMoved) { track.style.transition = ''; return; }

    var dx = lastX - startX;
    var s  = step();
    if (dx <= -s / 5 && idx < maxIdx())    idx++;
    else if (dx >= s / 5 && idx > 0)       idx--;
    render();
  }

  overflow.addEventListener('pointerup', endDrag);
  overflow.addEventListener('pointercancel', endDrag);
  overflow.addEventListener('pointerleave', function(e) { if (dragging) endDrag(e); });

  // Swallow the click that follows a drag so it doesn't open the video modal
  track.addEventListener('click', function(e) {
    if (dragMoved) {
      e.preventDefault();
      e.stopPropagation();
      dragMoved = false;
    }
  }, true);

  render(false);
}());


/* ── 2. Video Modal ──────────────────────────────────────────────────── */
(function() {
  var modal      = document.getElementById('cs-vid-modal');
  var iframe     = document.getElementById('cs-vid-iframe');
  var closeBtn   = document.getElementById('cs-vid-modal-close');
  var titleEl    = document.getElementById('cs-vid-modal-title');
  if (!modal || !iframe || !closeBtn) return;

  function openModal(ytId, title) {
    iframe.src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0&modestbranding=1';
    if (titleEl) titleEl.textContent = title || '';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
    document.body.style.overflow = '';
  }

  // Wire all video cards — carousel cards + hero card
  document.querySelectorAll('.cs-vid-card, .cs-hero-vid-card, .cs-vf-thumb').forEach(function(card) {
    card.addEventListener('click', function() {
      var ytId  = card.getAttribute('data-youtube');
      var title = card.getAttribute('data-title') || '';
      if (!ytId || ytId.indexOf('REPLACE_') === 0) {
        console.warn('[PeoplesHR Customers] YouTube ID not set. Update data-youtube on this card.');
        return;
      }
      openModal(ytId, title);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}());


/* ── 3. Library Filter ───────────────────────────────────────────────── */
(function() {
  var cards      = Array.prototype.slice.call(document.querySelectorAll('#cs-grid .cs-card[data-industry]'));
  var noResults  = document.getElementById('cs-no-results');
  var countEl    = document.getElementById('cs-result-count-desktop');
  var trigger    = document.getElementById('cs-filter-trigger');
  var dropdown   = document.getElementById('cs-filter-dropdown');
  var badge      = document.getElementById('cs-filter-badge');
  var clearBtn   = document.getElementById('cs-filter-clear');
  var sidebarClear = document.getElementById('cs-sidebar-clear');
  if (!cards.length) return;

  var activeIndustry = 'all';

  /* ── Mobile dropdown ── */
  function openDropdown() {
    dropdown.classList.add('open');
    trigger.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
  }
  function closeDropdown() {
    dropdown.classList.remove('open');
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }
  if (trigger) {
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
    });
  }
  document.addEventListener('click', function(e) {
    if (dropdown && !dropdown.contains(e.target) && e.target !== trigger) closeDropdown();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDropdown();
  });

  /* ── Sync all filter UIs to current state ── */
  function syncUI() {
    /* Sidebar list buttons */
    document.querySelectorAll('#cs-industry-list .cs-filter-list-btn').forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-filter-industry') === activeIndustry);
    });
    /* Mobile pills */
    document.querySelectorAll('#cs-industry-pills-mobile .cs-pill').forEach(function(p) {
      p.classList.toggle('active', p.getAttribute('data-filter-industry') === activeIndustry);
    });
    /* Badge */
    var count = (activeIndustry !== 'all' ? 1 : 0);
    if (badge) { badge.textContent = count; badge.classList.toggle('hidden', count === 0); }
    /* Sidebar clear button */
    if (sidebarClear) sidebarClear.classList.toggle('visible', count > 0);
  }

  /* ── Apply filters to cards ── */
  function applyFilters() {
    var visible = 0;
    cards.forEach(function(card) {
      var industry = card.getAttribute('data-industry');
      var show     = (activeIndustry === 'all' || industry === activeIndustry);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (countEl)   countEl.textContent = visible;
    if (noResults) noResults.classList.toggle('visible', visible === 0);
    syncUI();
  }

  /* ── Sidebar list buttons ── */
  document.querySelectorAll('#cs-industry-list .cs-filter-list-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      activeIndustry = btn.getAttribute('data-filter-industry');
      applyFilters();
    });
  });
  /* ── Mobile dropdown pills ── */
  document.querySelectorAll('#cs-industry-pills-mobile .cs-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      activeIndustry = pill.getAttribute('data-filter-industry');
      applyFilters();
    });
  });

  /* ── Clear (both mobile and sidebar) ── */
  function clearAll() {
    activeIndustry = 'all';
    applyFilters();
    closeDropdown();
  }
  if (clearBtn)    clearBtn.addEventListener('click', clearAll);
  if (sidebarClear) sidebarClear.addEventListener('click', clearAll);
}());


/* ── 3b. Make case study card covers clickable ─────────────────────── */
(function () {
  document.querySelectorAll('#cs-grid .cs-card-thumb').forEach(function (thumb) {
    var card = thumb.closest('.cs-card');
    var link = card && card.querySelector('.cs-card-cta');
    if (!link) return;
    thumb.addEventListener('click', function () {
      window.open(link.href, link.target || '_self');
    });
  });
}());


/* ── 4. Smooth scroll for hero CTA ─────────────────────────────────── */
(function() {
  var btn = document.querySelector('a[href="#library"]');
  if (!btn) return;
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    var target = document.getElementById('library');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}());



/* ── 6. Featured Case Study Switcher (Challenge / Solution) ─────────── */
(function () {
  'use strict';

  var ARROW = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var contentEl = document.getElementById('sf2-content');
  var imgEl     = document.getElementById('sf2-img');
  var btns      = document.querySelectorAll('#sf2-logos .sf2-btn');

  if (!contentEl || !imgEl || !btns.length) { return; }

  /* Logo asset base — update here if the upload path ever changes */
  var LOGO_BASE = '/uploads/2026/04/';
  var BRANDIX_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Brandix_Apparel_Limited_Logo.png';

  /* Featured story content — edit/add/remove entries here.
     Each entry needs a matching logo button in #sf2-logos (index.html)
     with the same data-idx as its position in this array. */
  var stories = [
    {
      logo:      LOGO_BASE + 'pyramidwilmar.webp',
      logoAlt:   'Pyramid Wilmar',
      company:   'Pyramid Wilmar',
      headline:  'How Pyramid Wilmar unified payroll and 24/7 HR access in just 3.5 months',
      challenge: 'Pyramid Wilmar’s workforce spanned manufacturing plants, corporate offices and island-wide sales teams, but payroll and HR processes were split across different systems, paper workflows and location-based access limitations.',
      solution:  'PeoplesHR brought payroll, self-service, mobile access, kiosks and workforce visibility into one platform, giving 670+ employees real-time HR access and helping the rollout reach 95% completion in just 3.5 months.',
      img:       '/uploads/2026/08/Pyramid-Wilmar.webp',
      href:      '/case-study-pyramid-wilmar.html'
    },
    {
      logo:      BRANDIX_LOGO,
      logoAlt:   'Brandix',
      company:   'Brandix Group',
      headline:  'How Brandix drove 99% HR self-service adoption across 25,000 employees in 8 months',
      challenge: 'Brandix had a large, factory-led workforce across multiple locations, but HR operations were affected by fragmented HCM systems, paper-based requests and limited digital access for frontline employees.',
      solution:  'With OneClick, powered by PeoplesHR, Brandix gave employees real-time access to HR services through mobile and self-service channels, increasing attendance self-service adoption from 4% to 96% and leave self-service adoption from 31% to 99% in just eight months.',
      img:       '/uploads/2026/08/Brandix.webp',
      href:      '/hris-success-stories-brandix-case-study.html'
    }
  ];

  /* Preload every story image up front so switching stories is instant
     instead of holding the previous image on screen while the next one
     downloads. */
  stories.forEach(function (s) {
    var preload = new Image();
    preload.src = s.img;
  });

  function buildContent(s) {
    var logoHtml = s.logo
      ? '<img class="sf2-company-logo" src="' + s.logo + '" alt="' + s.logoAlt + '">'
      : '<span class="sf2-company-name">' + s.company + '</span>';

    return '<h3 class="sf2-headline">' + s.headline + '</h3>'
      + '<div class="sf2-block">'
      +   '<div class="sf2-block-heading">Challenge</div>'
      +   '<p class="sf2-block-text">' + s.challenge + '</p>'
      + '</div>'
      + '<div class="sf2-block">'
      +   '<div class="sf2-block-heading">Solution</div>'
      +   '<p class="sf2-block-text">' + s.solution + '</p>'
      + '</div>'
      + '<a href="' + s.href + '" class="sf2-read" target="_blank">Read Case Study ' + ARROW + '</a>';
  }

  function switchTo(idx) {
    var s = stories[idx];
    if (!s) { return; }

    btns.forEach(function (b, i) { b.classList.toggle('active', i === idx); });
    contentEl.classList.add('sf2-out');
    imgEl.classList.add('sf2-img-out');

    setTimeout(function () {
      contentEl.innerHTML = buildContent(s);
      imgEl.alt = s.logoAlt;

      contentEl.classList.remove('sf2-out');
      contentEl.classList.add('sf2-in');

      void contentEl.offsetWidth; /* force reflow so the fade-in transition fires */
      contentEl.classList.remove('sf2-in');

      /* Only reveal the new image once it's actually loaded, instead of on
         a fixed timer — avoids holding the previous story's image on
         screen while the next one is still downloading. */
      var reveal = function () { imgEl.classList.remove('sf2-img-out'); };
      imgEl.onload = reveal;
      imgEl.src    = s.img;
      if (imgEl.complete) { reveal(); }
    }, 220);
  }

  btns.forEach(function (btn, i) {
    btn.addEventListener('click', function () { switchTo(i); });
  });

  switchTo(0);
}());


/* ── 7. Request a Demo Modal ─────────────────────────────────────────── */
(function () {
  var overlay   = document.getElementById('rd-modal-overlay');
  var closeBtn  = document.getElementById('rd-modal-close');
  var container = document.getElementById('rd-form-container');
  var triggers  = document.querySelectorAll('[data-request-demo]');
  if (!overlay || !closeBtn || !container || !triggers.length) { return; }

  var formCreated = false;

  // Polling for window.hbspt alone never resolves -- the tracking snippet
  // in <head> (hs-scripts.com) doesn't define hbspt.forms; that needs this
  // separate embed script, loaded on demand since most visitors never open
  // this modal (same pattern as the webinar gate modal / pricing contact
  // modal elsewhere on the site).
  function ensureHsScript(cb) {
    if (window.hbspt) { cb(); return; }
    var existing = document.querySelector('script[src*="hsforms.net/forms/embed/v2.js"]');
    if (existing) { existing.addEventListener('load', cb); return; }
    var s = document.createElement('script');
    s.src = '//js-na2.hsforms.net/forms/embed/v2.js';
    s.charset = 'utf-8';
    s.onload = cb;
    document.body.appendChild(s);
  }

  function buildForm() {
    ensureHsScript(function () {
      hbspt.forms.create({
        portalId: '45700506',
        formId:   '3f13304d-fb30-440b-9506-0327a0116575',
        region:   'na2',
        target:   '#rd-form-container',
        onFormReady: function () {
          var loading = document.getElementById('rd-form-loading');
          if (loading) { loading.remove(); }
        }
      });
    });
  }

  function openModal(e) {
    if (e) { e.preventDefault(); }
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (!formCreated) { formCreated = true; buildForm(); }
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  triggers.forEach(function (btn) { btn.addEventListener('click', openModal); });
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) { closeModal(); } });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) { closeModal(); }
  });
}());
