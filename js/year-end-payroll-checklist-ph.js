/**
 * Year-End Payroll Readiness Checklist · Philippines 2026
 * (/year-end-payroll-checklist-ph-2026.html)
 *
 * TRACKING SPEC
 * track(event, props) pushes each event to:
 *   1. window.dataLayer -> {event: <name>, asset: 'phr-ye-ph-2026', ...props}  (GTM: Custom Event trigger)
 *   2. gtag('event', <name>, props)                                          (only if gtag exists)
 *   3. window._hsq -> ['trackCustomBehavioralEvent', {name, properties}]     (only if HubSpot tracking is loaded;
 *      custom behavioral events need the internal name, e.g. pe45700506_phr_ye_check; map in HS_EVENT_MAP)
 * Debug: add ?debug=1 to log every event to the console and show an on-page event panel.
 *        ?debug=1&today=2026-12-05 overrides "today" (Asia/Manila) to test countdown and "behind" states.
 *
 * EVENT                  PROPERTIES                                     WHEN
 * phr_ye_check           item_id, month (oct|nov|dec|q1), checked       each checklist tick/untick
 * phr_ye_progress        pct (25|50|75|100), done, total                once per milestone per browser
 * phr_ye_calendar        date_id (e.g. 'dec23') or 'all'                .ics download
 * phr_ye_calendar_signup date_id                                        email given in the calendar popup (once per browser; no email in the event)
 * phr_ye_checklist_download (none)                                      name + email given in the download-checklist popup (no PII in the event)
 * phr_ye_cta             location (header|better_way)                  click on a "Talk to us" CTA
 * phr_ye_demo            demo (anomaly_detection)                      click on the interactive demo link
 * phr_ye_intent          level (low|medium|high), from, trigger        when the intent level rises
 *
 * INTENT SCORE (localStorage key 'phr_ye_intent'; never goes down)
 *   low    = page viewed only
 *   medium = 3+ items ticked, OR a calendar add
 *   high   = calendar email given AND a CTA click
 *
 * HubSpot: both popups submit to the same portal form (45700506 /
 * 9fffb4ce-f1ff-4941-987c-2fd1db929518) -- the calendar popup only collects and
 * sends email (that's all it asks for); the download popup also sends firstname/
 * lastname, split from its one "full name" field.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

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
  var LS = store('localStorage');

  /* ---------- debug panel (?debug=1) ---------- */
  var dbg = null;
  if (DEBUG) {
    dbg = document.createElement('div');
    dbg.className = 'ye-debug'; dbg.setAttribute('aria-hidden', 'true');
    dbg.innerHTML = '<b>track() debug</b>';
    document.body.appendChild(dbg);
  }

  var HS_EVENT_MAP = {}; // e.g. { phr_ye_cta: 'pe45700506_phr_ye_cta' }
  function track(event, props) {
    var p = { asset: ASSET }, k;
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

  /* ---------- intent score (low / medium / high; never goes down) ---------- */
  var LEVELS = ['low', 'medium', 'high'];
  var signals = LS.get('phr_ye_signals', {});
  function setSignal(key, trigger) {
    signals[key] = true; LS.set('phr_ye_signals', signals); evalIntent(trigger || key);
  }
  function evalIntent(trigger) {
    var lvl = 'low';
    if (checkedCount() >= 3 || signals.calendar) lvl = 'medium';
    if (signals.calendar_signup && signals.cta) lvl = 'high';
    var cur = LS.get('phr_ye_intent', null);
    if (cur === null || LEVELS.indexOf(lvl) > LEVELS.indexOf(cur)) {
      LS.set('phr_ye_intent', lvl);
      track('phr_ye_intent', { level: lvl, from: cur || 'none', trigger: trigger || 'view' });
      cur = lvl;
    }
    return cur;
  }

  /* ---------- dates, always in Asia/Manila ---------- */
  function manilaISO(d) {
    var parts = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(d).forEach(function (x) { parts[x.type] = x.value; });
    return parts.year + '-' + parts.month + '-' + parts.day;
  }
  var overrideToday = DEBUG && /^\d{4}-\d{2}-\d{2}$/.test(params.get('today') || '') ? params.get('today') : null;
  function todayISO() { return overrideToday || manilaISO(new Date()); }
  function dayNum(iso) { var a = iso.split('-'); return Date.UTC(+a[0], a[1] - 1, +a[2]) / 864e5; }
  function fmtDate(iso) {
    var a = iso.split('-');
    return new Date(Date.UTC(+a[0], a[1] - 1, +a[2])).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
  }
  function rel(n) { return n === 0 ? 'today' : n === 1 ? 'tomorrow' : 'in ' + n + ' days'; }

  /* ---------- hero countdown ---------- */
  var kdItems = $$('.ye-kd');
  function renderCountdown() {
    var t = dayNum(todayISO());
    var clockEl = $('#ye-cd-clock');
    if (clockEl) {
      var clock = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      clockEl.textContent = (overrideToday ? 'Debug date ' + overrideToday : clock) + ' · Asia/Manila';
    }
    var next = null, pay = null;
    kdItems.forEach(function (li) {
      if (!li.hasAttribute('data-deadline')) return;
      var d = { id: li.dataset.id, date: li.dataset.dates.split(' ')[0], label: li.dataset.deadline };
      var n = dayNum(d.date) - t;
      if (n >= 0 && !next) next = { d: d, n: n };
      if (d.id === 'dec23') pay = { d: d, n: n };
    });
    kdItems.forEach(function (li) {
      var last = li.dataset.dates.split(' ').pop();
      li.classList.toggle('is-past', dayNum(last) < t);
      li.classList.toggle('is-next', !!next && li.dataset.id === next.d.id);
    });
    var main = $('#ye-cd-main'), num = $('#ye-cd-num'), unit = $('#ye-cd-unit'), sub = $('#ye-cd-sub');
    if (!main) return;
    if (!next) {
      main.textContent = 'All key dates from December 2026 to March 2027 have passed.';
      num.textContent = '0'; unit.textContent = 'days left';
      sub.textContent = 'Archive everything: registers, approvals, signed 2316s, BIR and DOLE receipts. Keep them for 5 years.';
      return;
    }
    var text = 'Next: ' + next.d.label + ' by ' + fmtDate(next.d.date) + ', ' + rel(next.n);
    if (main.textContent !== text) main.textContent = text;
    num.textContent = String(next.n);
    unit.textContent = next.n === 1 ? 'day to go' : 'days to go';
    if (pay && next.d.id !== 'dec23' && pay.n > 0) {
      sub.innerHTML = '<strong>Pay 13th month by Wed, Dec 23, ' + rel(pay.n) + '.</strong> Dec 24 is the legal deadline, but it\u2019s a special non-working day this year.';
    } else if (next.d.id === 'dec23') {
      sub.textContent = 'Dec 24 is the legal deadline, but it\u2019s a special non-working day this year. Keep proof of payment for each employee.';
    } else {
      sub.textContent = 'Deadlines that fall on a weekend move to the next working day (BIR RMC No. 65-2016). eFPS filers follow their group\u2019s staggered dates.';
    }
  }

  /* ---------- checklist with progress rings + "behind" nudge ---------- */
  var boxes = $$('.ye-item input[type=checkbox]');
  var TOTAL = boxes.length;
  var checks = LS.get('phr_ye_checks', {});
  var milestones = LS.get('phr_ye_milestones', []);
  function checkedCount() { return boxes.filter(function (b) { return b.checked; }).length; }
  function setRing(el, done, total, fmt) {
    if (!el) return;
    var pct = total ? Math.round(done / total * 100) : 0;
    el.querySelector('.fg').setAttribute('stroke-dasharray', pct + ' 100');
    el.querySelector('.pct').textContent = fmt === 'frac' ? done + '/' + total : pct + '%';
    el.setAttribute('aria-valuenow', String(pct));
    el.setAttribute('aria-valuetext', done + ' of ' + total + ' done');
    el.classList.toggle('done', done === total && total > 0);
  }
  function renderChecklist() {
    var t = dayNum(todayISO()), behind = [];
    $$('.ye-month').forEach(function (m) {
      var bs = $$('input[type=checkbox]', m);
      var done = bs.filter(function (b) { return b.checked; }).length;
      setRing($('[data-ring="' + m.dataset.month + '"]', m), done, bs.length, 'frac');
      var isNow = t >= dayNum(m.dataset.start) && t <= dayNum(m.dataset.end);
      m.classList.toggle('is-now', isNow);
      var h = $('h3', m), pill = $('.ye-now-pill', h);
      if (isNow && !pill) { pill = document.createElement('span'); pill.className = 'ye-now-pill'; pill.textContent = 'Now'; h.appendChild(pill); }
      if (!isNow && pill) pill.parentNode.removeChild(pill);
      var nudge = $('.ye-nudge', m), left = bs.length - done;
      if (t > dayNum(m.dataset.end) && left > 0) {
        nudge.hidden = false;
        nudge.textContent = 'You\u2019re behind: ' + left + ' ' + m.dataset.label + ' item' + (left > 1 ? 's are' : ' is') + ' still unticked.';
        behind.push(m.dataset.label + ' (' + left + ')');
      } else { nudge.hidden = true; }
    });
    var all = checkedCount();
    $$('[data-ring="all"]').forEach(function (r) { setRing(r, all, TOTAL, 'pct'); });
    $$('[data-count="all"]').forEach(function (s) { s.textContent = all + ' of ' + TOTAL; });
    var ba = $('#ye-behind-all');
    if (ba) {
      if (behind.length) { ba.hidden = false; ba.textContent = 'You\u2019re behind: unticked items from ' + behind.join(', ') + '. Catch up before the next key date.'; }
      else ba.hidden = true;
    }
    return all;
  }
  boxes.forEach(function (b) {
    b.checked = !!checks[b.dataset.item];
    b.addEventListener('change', function () {
      if (b.checked) checks[b.dataset.item] = true; else delete checks[b.dataset.item];
      LS.set('phr_ye_checks', checks);
      track('phr_ye_check', { item_id: b.dataset.item, month: b.closest('.ye-month').dataset.month, checked: b.checked });
      var all = renderChecklist();
      var pct = Math.floor(all / TOTAL * 100);
      [25, 50, 75, 100].forEach(function (m) {
        if (pct >= m && milestones.indexOf(m) < 0) {
          milestones.push(m); LS.set('phr_ye_milestones', milestones);
          track('phr_ye_progress', { pct: m, done: all, total: TOTAL });
        }
      });
      evalIntent('ticks');
    });
  });
  $$('[data-clear-month]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var month = btn.dataset.clearMonth;
      if (!window.confirm('Clear your ticks for this month?')) return;
      boxes.forEach(function (b) {
        if (b.closest('.ye-month').dataset.month === month) {
          b.checked = false;
          delete checks[b.dataset.item];
        }
      });
      LS.set('phr_ye_checks', checks);
      renderChecklist();
    });
  });
  var downloadBtn = $('#ye-download-btn');
  if (downloadBtn) downloadBtn.addEventListener('click', function () { openDownloadModal(); });

  /* ---------- key-date filter ---------- */
  var filterBtns = $$('.ye-filters [data-filter]');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter, shown = 0;
      filterBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === btn)); });
      kdItems.forEach(function (li) {
        var ok = f === 'ALL' || li.dataset.types.split(' ').indexOf(f) >= 0;
        li.hidden = !ok; if (ok) shown++;
      });
      var status = $('#ye-filter-status');
      if (status) status.textContent = 'Showing ' + shown + ' key date' + (shown === 1 ? '' : 's') + (f === 'ALL' ? '' : ' of type ' + f) + '.';
    });
  });

  /* ---------- Add to calendar: .ics built client-side ---------- */
  var PAGE_URL = 'https://peopleshr.com/year-end-payroll-checklist-ph-2026/';
  function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function fold(line) { var out = [], s = line; while (s.length > 60) { out.push(s.slice(0, 60)); s = ' ' + s.slice(60); } out.push(s); return out.join('\r\n'); }
  function plusDay(iso) { return new Date((dayNum(iso) + 1) * 864e5).toISOString().slice(0, 10); }
  function stamp() { return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function eventsFor(li) {
    var types = li.dataset.types.split(' ').join(' · ');
    var text = $('.ye-kd-text', li).textContent.trim();
    return li.dataset.dates.split(' ').map(function (iso) {
      return [
        'BEGIN:VEVENT',
        'UID:phr-ye-2026-' + li.dataset.id + '-' + iso.replace(/-/g, '') + '@peopleshr.com',
        'DTSTAMP:' + stamp(),
        'DTSTART;VALUE=DATE:' + iso.replace(/-/g, ''),
        'DTEND;VALUE=DATE:' + plusDay(iso).replace(/-/g, ''),
        'SUMMARY:' + icsEsc(types + ': ' + text),
        'DESCRIPTION:' + icsEsc(text + '\nYear-End Payroll Readiness Checklist: Philippines 2026 (PeoplesHR x Bridge PayDay)\n' + PAGE_URL + '\nA compliance aid, not legal or tax advice.'),
        'URL:' + PAGE_URL,
        'TRANSP:TRANSPARENT',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(text), 'TRIGGER:-P1D', 'END:VALARM',
        'END:VEVENT'
      ];
    });
  }
  function downloadIcs(list, filename) {
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PeoplesHR//Year-End Payroll Checklist PH 2026//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:PH year-end payroll 2026'];
    list.forEach(function (li) { eventsFor(li).forEach(function (ev) { lines = lines.concat(ev); }); });
    lines.push('END:VCALENDAR');
    var blob = new Blob([lines.map(fold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.parentNode.removeChild(a); }, 1500);
  }
  function runCal(id) {
    if (id === 'all') downloadIcs(kdItems, 'ph-year-end-payroll-2026-all-dates.ics');
    else downloadIcs(kdItems.filter(function (li) { return li.dataset.id === id; }), 'ph-year-end-payroll-2026-' + id + '.ics');
    track('phr_ye_calendar', { date_id: id });
    setSignal('calendar');
  }
  $$('[data-cal]').forEach(function (btn) {
    btn.addEventListener('click', function () { openCal(btn.dataset.cal); });
  });

  /* ---------- CTA + demo clicks (delegated) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-cta],[data-demo]') : null;
    if (!a) return;
    if (a.hasAttribute('data-demo')) { track('phr_ye_demo', { demo: a.getAttribute('data-demo') }); setSignal('cta', 'demo'); }
    else { track('phr_ye_cta', { location: a.getAttribute('data-cta') }); setSignal('cta'); }
  });

  /* ---------- HubSpot submit ----------
     Submits straight to HubSpot's Forms API (api.hsforms.com, already allowed sitewide),
     same pattern as the PMAP event page and the Philippines HRIS hero form. The calendar
     popup and the download popup are two different forms (different fields), so each has
     its own GUID below -- fill both in once those forms exist in the portal. */
  var HS_PORTAL_ID = '45700506';
  var HS_CAL_FORM_GUID = '9fffb4ce-f1ff-4941-987c-2fd1db929518';
  var HS_DOWNLOAD_FORM_GUID = '9fffb4ce-f1ff-4941-987c-2fd1db929518';
  function submitToHubSpot(fields, formGuid) {
    if (!formGuid || formGuid === 'TODO_FORM_GUID') {
      if (DEBUG) console.warn('[hubspot] form GUID not set yet -- skipping submit (email not logged): ' + Object.keys(fields).join(', '));
      return Promise.resolve({ skipped: true });
    }
    var hutk = (document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/) || [])[1];
    var payload = {
      fields: Object.keys(fields).map(function (k) { return { name: k, value: fields[k] }; }),
      context: { hutk: hutk, pageUri: location.href, pageName: document.title }
    };
    return fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + HS_PORTAL_ID + '/' + formGuid, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }).then(function (r) { if (!r.ok) throw new Error('HubSpot ' + r.status); return r.json(); });
  }

  /* ---------- shared contact ----------
     Once either popup succeeds once, remember {firstname, lastname, email}
     for this browser so the OTHER popup can skip asking again -- it still
     submits to HubSpot in the background each time (so both signup sources
     show up in the CRM), it just doesn't make the person retype anything. */
  function getSavedContact() { return LS.get('phr_ye_contact', null); }
  function saveContact(firstname, lastname, email) {
    LS.set('phr_ye_contact', { firstname: firstname, lastname: lastname, email: email });
  }

  var calModal = $('#ye-cal-modal'), calForm = $('#ye-cal-form'), pendingCal = 'all', lastFocus = null;
  function finishCalSignup(firstname, lastname, email) {
    var btn = $('button[type=submit]', calForm);
    return submitToHubSpot({
      firstname: firstname,
      lastname: lastname,
      email: email,
      phr_intent_level: LS.get('phr_ye_intent', 'low'),
      phr_signup_source: 'calendar'
    }, HS_CAL_FORM_GUID).then(function () {
      saveContact(firstname, lastname, email);
      track('phr_ye_calendar_signup', { date_id: pendingCal }); // no email in the event, by design
      setSignal('calendar_signup');
      runCal(pendingCal);
      calForm.hidden = true; var d = $('#ye-cal-done'); d.hidden = false; d.focus();
      if (btn) btn.disabled = false;
      setTimeout(closeCal, 2200);
    });
  }
  function openCal(id) {
    pendingCal = id; lastFocus = document.activeElement;
    calModal.hidden = false; document.body.style.overflow = 'hidden';
    var saved = getSavedContact();
    if (saved) {
      calForm.hidden = true; $('#ye-cal-done').hidden = false;
      finishCalSignup(saved.firstname, saved.lastname, saved.email).catch(function () {
        calForm.hidden = false; $('#ye-cal-done').hidden = true;
        $('#ye-cal-err').textContent = 'Something went wrong. Please try again.';
      });
      return;
    }
    calForm.hidden = false; $('#ye-cal-done').hidden = true;
    setTimeout(function () { $('#ye-cal-name').focus(); }, 30);
  }
  function closeCal() {
    calModal.hidden = true; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (calModal && calForm) {
    $('#ye-cal-close').addEventListener('click', closeCal);
    calModal.addEventListener('click', function (e) { if (e.target === calModal) closeCal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !calModal.hidden) closeCal(); });
    calForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#ye-cal-name'), nameErr = $('#ye-cal-err-name');
      var email = $('#ye-cal-email'), err = $('#ye-cal-err');
      var ok = true, firstInvalid = null;
      if (!name.value.trim()) { nameErr.textContent = 'Please enter your full name.'; name.setAttribute('aria-invalid', 'true'); ok = false; firstInvalid = firstInvalid || name; } else { nameErr.textContent = ''; name.removeAttribute('aria-invalid'); }
      if (!email.value || !email.checkValidity()) { err.textContent = 'Please enter a valid work email.'; email.setAttribute('aria-invalid', 'true'); ok = false; firstInvalid = firstInvalid || email; } else { err.textContent = ''; email.removeAttribute('aria-invalid'); }
      if (!ok) { firstInvalid.focus(); return; }
      var btn = $('button[type=submit]', calForm); btn.disabled = true;
      var nameParts = name.value.trim().split(/\s+/);
      finishCalSignup(nameParts[0], nameParts.slice(1).join(' '), email.value.trim())
        .catch(function () { btn.disabled = false; err.textContent = 'Something went wrong. Please try again.'; });
    });
  }

  /* ---------- download-checklist popup ----------
     Same HubSpot submit pattern as the calendar popup, but asks for full
     name and email before the actual download: a real PDF
     (/uploads/2026/11/Year-End-Payroll.pdf) triggered right after a
     successful submit, alongside a thank-you message. The real form (portal
     45700506, form 9fffb4ce-f1ff-4941-987c-2fd1db929518) only requires email, but we send
     firstname/lastname too so the CRM contact is complete. Full name is one
     field in the UI and split into first/last here, same as the PMAP page. */
  var downloadModal = $('#ye-download-modal'), downloadForm = $('#ye-download-form'), downloadLastFocus = null;
  function finishDownload(firstname, lastname, email) {
    var btn = $('button[type=submit]', downloadForm);
    return submitToHubSpot({
      firstname: firstname,
      lastname: lastname,
      email: email,
      phr_intent_level: LS.get('phr_ye_intent', 'low'),
      phr_signup_source: 'checklist_download'
    }, HS_DOWNLOAD_FORM_GUID).then(function () {
      saveContact(firstname, lastname, email);
      track('phr_ye_checklist_download', {});
      setSignal('cta', 'checklist_download');
      if (btn) btn.disabled = false;
      downloadForm.hidden = true;
      var done = $('#ye-download-done'); done.hidden = false; done.focus();
      var a = document.createElement('a');
      a.href = '/uploads/2026/11/Year-End-Payroll.pdf';
      a.download = 'PeoplesHR-Year-End-Payroll-Readiness-Checklist-PH-2026.pdf';
      document.body.appendChild(a); a.click(); a.parentNode.removeChild(a);
      setTimeout(closeDownloadModal, 2200);
    });
  }
  function openDownloadModal() {
    downloadLastFocus = document.activeElement;
    downloadModal.hidden = false; document.body.style.overflow = 'hidden';
    var saved = getSavedContact();
    if (saved) {
      downloadForm.hidden = true; $('#ye-download-done').hidden = false;
      finishDownload(saved.firstname, saved.lastname, saved.email).catch(function () {
        downloadForm.hidden = false; $('#ye-download-done').hidden = true;
        $('#ye-download-err-email').textContent = 'Something went wrong. Please try again.';
      });
      return;
    }
    downloadForm.hidden = false; $('#ye-download-done').hidden = true;
    setTimeout(function () { $('#ye-download-name').focus(); }, 30);
  }
  function closeDownloadModal() {
    downloadModal.hidden = true; document.body.style.overflow = '';
    if (downloadLastFocus && downloadLastFocus.focus) downloadLastFocus.focus();
  }
  if (downloadModal && downloadForm) {
    $('#ye-download-close').addEventListener('click', closeDownloadModal);
    downloadModal.addEventListener('click', function (e) { if (e.target === downloadModal) closeDownloadModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !downloadModal.hidden) closeDownloadModal(); });
    downloadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#ye-download-name'), nameErr = $('#ye-download-err-name');
      var email = $('#ye-download-email'), emailErr = $('#ye-download-err-email');
      var ok = true, firstInvalid = null;
      if (!name.value.trim()) { nameErr.textContent = 'Please enter your full name.'; name.setAttribute('aria-invalid', 'true'); ok = false; firstInvalid = firstInvalid || name; } else { nameErr.textContent = ''; name.removeAttribute('aria-invalid'); }
      if (!email.value || !email.checkValidity()) { emailErr.textContent = 'Please enter a valid work email.'; email.setAttribute('aria-invalid', 'true'); ok = false; firstInvalid = firstInvalid || email; } else { emailErr.textContent = ''; email.removeAttribute('aria-invalid'); }
      if (!ok) { firstInvalid.focus(); return; }
      var btn = $('button[type=submit]', downloadForm); btn.disabled = true;
      var nameParts = name.value.trim().split(/\s+/);
      finishDownload(nameParts[0], nameParts.slice(1).join(' '), email.value.trim())
        .catch(function () { btn.disabled = false; emailErr.textContent = 'Something went wrong. Please try again.'; });
    });
  }

  /* ---------- init ---------- */
  renderCountdown();
  renderChecklist();
  evalIntent('view');
  setInterval(renderCountdown, 30000);
  window.addEventListener('beforeprint', function () { kdItems.forEach(function (li) { li.hidden = false; }); });
})();
