/* ==========================================================================
   tracking.js — delta script for the Tracking page
   (Access & Attendance Devices — /solutions/peopleshr-tracking/)

   Loaded AFTER the shared phr.js/navbar.js. Everything below is .tk-
   behavior specific to this page only, guarded to no-op if .tk-scope
   isn't present.
   ========================================================================== */

/* tracking - device category tabs (click a category, see it large; auto-rotates every 3s) */
(function(){
  var tabs = document.querySelectorAll('.tk-devtab');
  if(!tabs.length) return; // guard: absent on non-tracking pages

  var ids = Array.prototype.map.call(tabs, function(t){ return t.getAttribute('data-dev'); });
  var current = 0;
  var autoTimer;

  function go(id){
    tabs.forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.tk-devpreview-content').forEach(function(p){ p.classList.remove('active'); });
    var t = document.querySelector('.tk-devtab[data-dev="' + id + '"]');
    if(t) t.classList.add('active');
    var p = document.getElementById('tkdev-' + id);
    if(p) p.classList.add('active');
    current = ids.indexOf(id);
  }

  function resetAuto(){
    clearInterval(autoTimer);
    autoTimer = setInterval(function(){ go(ids[(current + 1) % ids.length]); }, 3000);
  }

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){ go(tab.getAttribute('data-dev')); resetAuto(); });
  });

  var wrap = document.querySelector('.tk-devtab-wrap');
  if(wrap){
    wrap.addEventListener('mouseenter', function(){ clearInterval(autoTimer); });
    wrap.addEventListener('mouseleave', resetAuto);
  }

  /* Lock panel height to the tallest tab's real rendered height, so the
     card doesn't grow/shrink as users switch between tabs with more or
     less text. Measured directly (rather than guessed via CSS min-height)
     because wrapped line count depends on viewport width/font rendering
     in ways that are unreliable to estimate. Re-measured on resize since
     that changes wrapping. */
  var allContents = document.querySelectorAll('.tk-devpreview-content');
  function lockPanelHeight(){
    if(!allContents.length) return;
    var max = 0;
    allContents.forEach(function(c){
      var text = c.querySelector('.tk-devpreview-text');
      if(!text) return;
      text.style.minHeight = '';
      var isActive = c.classList.contains('active');
      if(!isActive){
        c.style.display = 'block';
        c.style.position = 'fixed';
        c.style.visibility = 'hidden';
        c.style.top = '-9999px';
        c.style.left = '-9999px';
      }
      max = Math.max(max, text.scrollHeight);
      if(!isActive){
        c.style.display = '';
        c.style.position = '';
        c.style.visibility = '';
        c.style.top = '';
        c.style.left = '';
      }
    });
    document.querySelectorAll('.tk-devpreview-text').forEach(function(text){
      text.style.minHeight = max + 'px';
    });
  }
  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(lockPanelHeight, 150);
  });
  lockPanelHeight();

  resetAuto();
}());

/* tracking - campus deployment map beacons (click a point, see device card) */
(function(){
  var points = document.querySelectorAll('.tk-deploy-point');
  if(!points.length) return; // guard: absent on non-tracking pages

  function closeAll(except){
    points.forEach(function(p){
      if(p === except) return;
      p.classList.remove('is-open');
      var b = p.querySelector('.tk-deploy-beacon');
      if(b) b.setAttribute('aria-expanded','false');
    });
  }

  points.forEach(function(point){
    var btn = point.querySelector('.tk-deploy-beacon');
    if(!btn) return;
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var willOpen = !point.classList.contains('is-open');
      closeAll(willOpen ? point : null);
      point.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  document.addEventListener('click', function(){ closeAll(null); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeAll(null); });
}());

/* tracking - industry switcher (Manufacturing / Retail / Office / etc.) */
(function(){
  'use strict';

  var contentEl = document.getElementById('tkIndContent');
  var imgEl     = document.getElementById('tkIndImg');
  var tabs      = document.querySelectorAll('#tkIndTabs .tk-ind-tab');

  if(!contentEl || !imgEl || !tabs.length) return; // guard: absent on non-tracking pages

  var industries = [
    {
      title: 'Manufacturing & Factories',
      body:  'Track attendance and control access across production floors and warehouses, with rugged devices built for high-traffic industrial environments and shift-based rules that match your production schedule. Fingerprint terminals hold up to dust, heat, and constant handling far better than card-only readers, so the hardware keeps working through the conditions a factory floor actually throws at it.',
      tags:  ['Shift-based access', 'Rugged hardware', 'Multi-site sync'],
      img:   'https://peopleshr.com/uploads/2026/08/factory-worker-operating-industrial-machinery-wearing-gloves-hard-hat-and-protective-eyewear.webp'
    },
    {
      title: 'Retail & Multi-Branch Operations',
      body:  'Keep every store staffed and accountable on one platform, with consistent attendance data and access control whether you run 5 locations or 500. New branches roll out on the same device standard and report into the same dashboard, so head office gets one clean view of attendance instead of a different spreadsheet from every store.',
      tags:  ['Fast rollout', 'Centralized reporting', 'Any headcount'],
      img:   'https://peopleshr.com/uploads/2026/08/two-supermarket-staff-members-in-uniform-one-holding-a-tablet-and-the-other-carrying-a-box-in-a-grocery-store.webp'
    },
    {
      title: 'Corporate Offices',
      body:  'Give employees frictionless badge or biometric entry at reception and secure zones, with attendance data flowing straight into payroll and no separate systems to reconcile. Visitors and contractors can be granted temporary access on the same platform, so security and HR are working off the same record instead of two.',
      tags:  ['Badge & biometric entry', 'Zone permissions', 'Payroll sync'],
      img:   'https://peopleshr.com/uploads/2026/08/two-colleagues-in-a-corporate-boardroom-meeting.webp'
    },
    {
      title: 'Healthcare Facilities',
      body:  'Secure wards and pharmacies with role-based access, while contactless biometric check-in keeps staff attendance accurate without adding to infection-control risk. Access rights can be scoped tightly by ward, shift, or clearance level, so sensitive areas stay restricted to the staff who are actually authorized to be there.',
      tags:  ['Contactless check-in', 'Restricted-zone control', 'Audit trail'],
      img:   'https://peopleshr.com/uploads/2026/08/doctor-and-nurse-walking-through-a-hospital-corridor.webp'
    },
    {
      title: 'Warehousing & Logistics',
      body:  'Track attendance across shifts and loading docks, with access gates that log every entry and exit for full visibility over who\'s on site, at every facility. Handheld and gate-mounted devices cover both fixed checkpoints and moving crews, so coverage doesn\'t drop off between the office and the yard.',
      tags:  ['Gate & dock access', 'Shift coverage', 'Real-time visibility'],
      img:   'https://peopleshr.com/uploads/2026/08/lorry-driver-in-uniform-viewed-close-up-through-the-vehicle-window.webp'
    },
    {
      title: 'Educational Institutions',
      body:  'Manage staff and campus access across multiple buildings from one dashboard, with attendance data ready for compliance reporting whenever it\'s needed. Term-time schedules, multiple campuses, and mixed staff and faculty access rules are all handled from the same system, without extra spreadsheets at reporting time.',
      tags:  ['Campus-wide access', 'Staff attendance', 'Compliance-ready'],
      img:   'https://peopleshr.com/uploads/2026/08/professor-walking-into-a-university-building.webp'
    }
  ];

  function buildContent(ind){
    var tagsHtml = ind.tags.map(function(t){ return '<span class="tk-ind-tag">' + t + '</span>'; }).join('');
    return '<h3 class="tk-ind-title">' + ind.title + '</h3>'
      + '<p class="tk-ind-body">' + ind.body + '</p>'
      + '<div class="tk-ind-tags">' + tagsHtml + '</div>';
  }

  var current = 0;
  var autoTimer;

  function switchTo(idx){
    var ind = industries[idx];
    if(!ind) return;
    current = idx;

    tabs.forEach(function(t,i){ t.classList.toggle('active', i === idx); });
    contentEl.classList.add('tk-ind-out');
    imgEl.classList.add('tk-ind-img-out');

    setTimeout(function(){
      contentEl.innerHTML = buildContent(ind);
      imgEl.src           = ind.img;
      imgEl.alt           = ind.title;

      contentEl.classList.remove('tk-ind-out');
      contentEl.classList.add('tk-ind-in');
      imgEl.classList.remove('tk-ind-img-out');

      void contentEl.offsetWidth; /* force reflow so the fade-in transition fires */
      contentEl.classList.remove('tk-ind-in');
    }, 220);
  }

  function resetAuto(){
    clearInterval(autoTimer);
    autoTimer = setInterval(function(){ switchTo((current + 1) % industries.length); }, 3000);
  }

  tabs.forEach(function(tab, i){
    tab.addEventListener('click', function(){ switchTo(i); resetAuto(); });
  });

  var indWrap = document.querySelector('.tk-ind');
  if(indWrap){
    indWrap.addEventListener('mouseenter', function(){ clearInterval(autoTimer); });
    indWrap.addEventListener('mouseleave', resetAuto);
  }

  /* Lock #tkIndContent to the tallest industry's real rendered height (same
     approach as the device-preview panel), so the row doesn't change
     height as users switch tabs. Renders each industry's content into the
     live element to measure it -- fine since it happens synchronously,
     with no intermediate paint, before restoring the current content. */
  function lockContentHeight(){
    var savedHTML = contentEl.innerHTML;
    contentEl.style.minHeight = '';
    var max = 0;
    industries.forEach(function(ind){
      contentEl.innerHTML = buildContent(ind);
      max = Math.max(max, contentEl.scrollHeight);
    });
    contentEl.innerHTML = savedHTML;
    if(max) contentEl.style.minHeight = max + 'px';
  }
  var indResizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(indResizeTimer);
    indResizeTimer = setTimeout(lockContentHeight, 150);
  });

  switchTo(0);
  resetAuto();
  setTimeout(lockContentHeight, 260);
}());

/* tracking - subtle parallax on the campus deployment map photo */
(function(){
  var img = document.querySelector('.tk-deploy-photo>img');
  if(!img) return;
  var tags = document.querySelectorAll('.tk-deploy-photo .tk-deploy-tag');
  var MAX_X = 10, MAX_Y = 8;
  var TAG_FACTOR = 0.35;
  var ticking = false, dx = 0, dy = 0;
  function onMove(e){
    dx = (0.5 - e.clientX / window.innerWidth) * 2 * MAX_X;
    dy = (0.5 - e.clientY / window.innerHeight) * 2 * MAX_Y;
    if(!ticking){
      ticking = true;
      requestAnimationFrame(function(){
        img.style.transform = 'scale(1.04) translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0)';
        var tagX = (dx * TAG_FACTOR).toFixed(2), tagY = (dy * TAG_FACTOR).toFixed(2);
        tags.forEach(function(tag){
          tag.style.transform = 'translateX(-50%) translate3d(' + tagX + 'px,' + tagY + 'px,0)';
        });
        ticking = false;
      });
    }
  }
  window.addEventListener('mousemove', onMove, {passive:true});
}());
