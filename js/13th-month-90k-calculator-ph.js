/**
 * 13th Month Calculator: ₱90,000 Check · Philippines 2026
 * (/13th-month-90k-calculator-ph-2026.html)
 *
 * Companion to the year-end checklist (js/year-end-payroll-checklist-ph.js).
 * Same track() pipeline and the same localStorage keys, so intent is shared
 * across both pages on the same domain.
 *
 * TRACKING SPEC
 * track(event, props) pushes each event to:
 *   1. window.dataLayer -> {event: <name>, asset: 'phr-ye-ph-2026', page: 'calculator', ...props}
 *   2. gtag('event', <name>, props)                                       (only if gtag exists)
 *   3. window._hsq -> ['trackCustomBehavioralEvent', {name, properties}]  (only if HubSpot tracking is loaded;
 *      custom behavioral events need the internal name, e.g. pe45700506_phr_ye_cta; map in HS_EVENT_MAP)
 * Debug: add ?debug=1 to log every event to the console and show an on-page event panel.
 *
 * EVENT                PROPERTIES                                           WHEN
 * phr_ye_estimator     exceeded (bool), months_worked, deminimis_over_count once per session, ~1.2s after a
 *                                                                           meaningful change (basic salary > 0)
 * phr_ye_cta           location (better_way)                                click on "Talk to us to see how"
 * phr_ye_demo          demo (anomaly_detection)                             click on the interactive demo link
 * phr_ye_intent        level (low|medium|high), from, trigger               when the intent level rises
 *
 * INTENT SCORE (localStorage key 'phr_ye_intent'; never goes down; shared with the checklist page)
 *   low    = page viewed only
 *   medium = 3+ checklist items ticked, OR a calendar add
 *   high   = (calculator used OR calendar email given) AND a CTA click
 */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var params = new URLSearchParams(location.search);
  var DEBUG = params.get('debug') === '1';
  var ASSET = 'phr-ye-ph-2026';
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- storage helpers (fail silently if storage is blocked) ---------- */
  function store(kind) {
    return {
      get: function (k, d) { try { var v = window[kind].getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
      set: function (k, v) { try { window[kind].setItem(k, JSON.stringify(v)); } catch (e) {} }
    };
  }
  var LS = store('localStorage'), SS = store('sessionStorage');

  /* ---------- debug panel (?debug=1) ---------- */
  var dbg = null;
  if (DEBUG) {
    dbg = document.createElement('div');
    dbg.className = 'm13-debug'; dbg.setAttribute('aria-hidden', 'true');
    dbg.innerHTML = '<b>track() debug</b>';
    ($('.m13-scope') || document.body).appendChild(dbg);
  }

  var HS_EVENT_MAP = {}; // e.g. { phr_ye_cta: 'pe45700506_phr_ye_cta' }
  function track(event, props) {
    var p = { asset: ASSET, page: 'calculator' }, k;
    props = props || {};
    for (k in props) if (Object.prototype.hasOwnProperty.call(props, k)) p[k] = props[k];
    try {
      window.dataLayer = window.dataLayer || [];
      var dl = { event: event };
      for (k in p) dl[k] = p[k];
      window.dataLayer.push(dl);
      if (typeof window.gtag === 'function') window.gtag('event', event, p);
      if (window._hsq && typeof window._hsq.push === 'function') {
        window._hsq.push(['trackCustomBehavioralEvent', { name: HS_EVENT_MAP[event] || event, properties: p }]);
      }
    } catch (e) { if (DEBUG) console.warn('[track] failed', e); }
    if (DEBUG) {
      console.log('[track] ' + event + ' ' + JSON.stringify(p));
      if (dbg) { var line = document.createElement('div'); line.textContent = event + ' ' + JSON.stringify(props); dbg.appendChild(line); dbg.scrollTop = dbg.scrollHeight; }
    }
  }

  /* ---------- intent score (shared with the checklist page; never goes down) ---------- */
  var LEVELS = ['low', 'medium', 'high'];
  var signals = LS.get('phr_ye_signals', {});
  function ticks() { return Object.keys(LS.get('phr_ye_checks', {})).length; }
  function evalIntent(trigger) {
    var lvl = 'low';
    if (ticks() >= 3 || signals.calendar) lvl = 'medium';
    if ((signals.estimator || signals.calendar_signup) && signals.cta) lvl = 'high';
    var cur = LS.get('phr_ye_intent', null);
    if (cur === null || LEVELS.indexOf(lvl) > LEVELS.indexOf(cur)) {
      LS.set('phr_ye_intent', lvl);
      track('phr_ye_intent', { level: lvl, from: cur || 'none', trigger: trigger || 'view' });
    }
  }
  function setSignal(key, trigger) { signals[key] = true; LS.set('phr_ye_signals', signals); evalIntent(trigger || key); }

  /* ---------- the ₱90,000 check (illustrative, employer-side; NO tax / net pay output) ---------- */
  var CEILING = 90000;
  function peso(n) { return '₱' + (Math.round(n * 100) / 100).toLocaleString('en-PH', { maximumFractionDigits: 2 }); }
  function val(el) { var v = parseFloat(String(el.value || '').replace(/,/g, '')); return isFinite(v) && v > 0 ? v : 0; }
  function calc() {
    var basic = val($('#m13-basic'));
    var months = Math.min(12, Math.max(1, Math.round(val($('#m13-months')) || 12)));
    var other = val($('#m13-other'));
    var thirteenth = basic / 12 * months;
    var dmExcess = 0, overCount = 0;
    $$('[data-dm]').forEach(function (inp) {
      var amt = val(inp), cap = +inp.dataset.dm;
      // Cash achievement awards aren't de minimis at all: the full amount counts.
      var toggle = inp.dataset.cashToggle && $('#' + inp.dataset.cashToggle);
      if (toggle && toggle.value === 'cash') cap = 0;
      if (amt <= cap) return;
      var periods = inp.dataset.period === 'month' ? months : inp.dataset.period === 'semester' ? (months > 6 ? 2 : 1) : 1;
      dmExcess += (amt - cap) * periods; overCount++;
    });
    var vlDays = val($('#m13-vldays')), vlRate = val($('#m13-vlrate'));
    if (vlDays > 12) { dmExcess += (vlDays - 12) * vlRate; overCount++; }
    var total = thirteenth + other + dmExcess;
    return { basic: basic, months: months, other: other, thirteenth: thirteenth, dm: dmExcess, overCount: overCount, total: total, exceeded: total > CEILING };
  }
  function render() {
    var r = calc();
    $('#m13-r-13').textContent = peso(r.thirteenth);
    $('#m13-r-formula').textContent = r.basic ? peso(r.basic) + ' ÷ 12 × ' + r.months + ' month' + (r.months > 1 ? 's' : '') + ' worked' : 'basic ÷ 12 × months worked';
    $('#m13-r-other').textContent = peso(r.other);
    $('#m13-r-dm').textContent = peso(r.dm);
    $('#m13-r-dmnote').textContent = r.overCount ? r.overCount + ' item' + (r.overCount > 1 ? 's' : '') + ' above the RR 29-2025 ceiling' : 'amounts above the RR 29-2025 ceilings';
    $('#m13-r-total').textContent = peso(r.total);
    var meter = $('#m13-r-meter');
    meter.querySelector('i').style.width = Math.min(100, r.total / CEILING * 100) + '%';
    meter.classList.toggle('over', r.exceeded);
    var v = $('#m13-r-verdict');
    if (!r.basic && !r.other && !r.dm) { v.className = 'm13-verdict idle'; v.textContent = 'Enter a basic monthly salary to see the projection.'; }
    else if (r.exceeded) { v.className = 'm13-verdict over'; v.textContent = 'Exceeded: ' + peso(r.total - CEILING) + ' above the ₱90,000 ceiling. Anything above it is taxable.'; }
    else { v.className = 'm13-verdict'; v.textContent = 'Within the ceiling: ' + peso(CEILING - r.total) + ' left before ₱90,000.'; }
    return r;
  }
  var form = $('#m13-form'), estTimer = null;
  if (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    // Months worked: whole numbers only, never above 12 (max="12" alone doesn't stop typing).
    var monthsEl = $('#m13-months');
    if (monthsEl) {
      monthsEl.addEventListener('keydown', function (e) { if (/^[.,eE+\-]$/.test(e.key)) e.preventDefault(); });
      monthsEl.addEventListener('input', function () {
        var digits = monthsEl.value.replace(/\D/g, '');
        if (digits !== '' && +digits > 12) digits = '12';
        if (monthsEl.value !== digits) monthsEl.value = digits;
      });
    }
    form.addEventListener('input', function () {
      var r = render();
      if (!r.basic) return;
      clearTimeout(estTimer);
      estTimer = setTimeout(function () {
        if (SS.get('phr_ye_est_sent', false)) return;
        var rr = calc(); if (!rr.basic) return;
        SS.set('phr_ye_est_sent', true);
        track('phr_ye_estimator', { exceeded: rr.exceeded, months_worked: rr.months, deminimis_over_count: rr.overCount });
        setSignal('estimator');
      }, 1200);
    });
    render();
  }

  /* ---------- CTA + demo clicks (delegated) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-cta],[data-demo]') : null;
    if (!a) return;
    if (a.hasAttribute('data-demo')) { track('phr_ye_demo', { demo: a.getAttribute('data-demo') }); setSignal('cta', 'demo'); }
    else { track('phr_ye_cta', { location: a.getAttribute('data-cta') }); setSignal('cta'); }
  });

  evalIntent('view');
})();
