/* PeoplesHR 2027 calendar month pages (/calendar-2027/<month>/ and
 * /calendar-2027/<month>-play/), in the marketing team's dark "Scan" design.
 *
 * - Entry window: pages are cached at CloudFront for up to a day, so the
 *   window is enforced here, on Colombo time: a month is open from the 1st
 *   to its last day. Test with ?preview=YYYY-MM-DD.
 * - Scan view (month page): take a photo of the solved calendar page, add
 *   details, submit. Share months (Jan, Jun, Dec) then show the share link.
 * - Play view (-play page): the online game in calendar-2027-play.js unlocks
 *   the same details form.
 * - Sending: the entry goes to the HubSpot form CAL27_HS_FORM_ID. The form is
 *   embedded off screen and filled in from our fields, so the photo upload
 *   goes through HubSpot's own file field. With no form ID yet, nothing is
 *   sent: a ?preview link shows the whole journey (marked as a preview), and
 *   a normal visit is told entries open soon. */
(function () {
  var root = document.getElementById('cal27Entry');
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };

  var YEAR = 2027;
  var cfg = root.dataset;
  var month = Number(cfg.month);
  var previewMatch = /[?&]preview=(\d{4}-\d{2}-\d{2})/.exec(location.search);

  /* ---------- Entry window ---------- */
  function colomboToday() {
    if (previewMatch) return previewMatch[1];
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) {
      return new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10); // Colombo is UTC+05:30 all year
    }
  }
  var today = colomboToday();
  var y = Number(today.slice(0, 4)), mo = Number(today.slice(5, 7));
  var state = (y < YEAR || (y === YEAR && mo < month)) ? 'before'
            : (y > YEAR || mo > month) ? 'after' : 'open';
  var panes = root.querySelectorAll('.cal27-state');
  for (var i = 0; i < panes.length; i++) panes[i].hidden = panes[i].getAttribute('data-state') !== state;

  /* ---------- Helpers ---------- */
  function setStep(id, n) {
    var lis = $(id) ? $(id).children : [];
    for (var i = 0; i < lis.length; i++) { lis[i].classList.toggle('on', i === n); lis[i].classList.toggle('done', i < n); }
  }
  function unlock(id, on) { if ($(id)) $(id).classList.toggle('locked', !on); }
  function say(id, text, ok) { var m = $(id); if (m) { m.className = 'status ' + (ok ? 'ok' : 'no'); m.textContent = text; } }

  /* ---------- Confetti ---------- */
  var fx = $('fx'), ctx = fx && fx.getContext ? fx.getContext('2d') : null, parts = [], raf = null;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function burst(n) {
    if (reduce || !ctx) return;
    fx.width = innerWidth; fx.height = innerHeight;
    var cols = ['#2F7BFF', '#2BC48A', '#FF8A2A', '#FFFFFF'];
    for (var i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + (Math.random() - .5) * innerWidth * .4, y: innerHeight * .35, vx: (Math.random() - .5) * 12, vy: -Math.random() * 12 - 4,
      s: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[i % 4], life: 90 + Math.random() * 40 });
    if (!raf) loop();
  }
  function loop() {
    ctx.clearRect(0, 0, fx.width, fx.height);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      if (p.life <= 0 || p.y > fx.height + 20) parts.splice(i, 1);
    }
    raf = parts.length ? requestAnimationFrame(loop) : (ctx.clearRect(0, 0, fx.width, fx.height), null);
  }

  /* ---------- Sending to HubSpot ---------- */
  var hsReady = null;
  function loadHubSpot() {
    if (hsReady) return hsReady;
    hsReady = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://js.hsforms.net/forms/embed/v2.js';
      s.charset = 'utf-8';
      s.onerror = reject;
      s.onload = function () {
        if (!window.hbspt) { reject(new Error('HubSpot did not load')); return; }
        window.hbspt.forms.create({
          region: 'na2', portalId: cfg.portal, formId: cfg.form, target: '#cal27Hs',
          onFormReady: function ($form) { resolve($form && $form.jquery ? $form[0] : $form); },
          onFormSubmitted: function () { if (hsDone) hsDone(); }
        });
      };
      document.head.appendChild(s);
    });
    return hsReady;
  }
  var hsDone = null;
  function setField(form, name, value) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return;
    var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function sendToHubSpot(d) {
    return loadHubSpot().then(function (form) {
      return new Promise(function (resolve, reject) {
        var parts = d.name.trim().split(/\s+/);
        setField(form, 'firstname', parts[0] || '');
        setField(form, 'lastname', parts.slice(1).join(' '));
        setField(form, 'company', d.company);
        setField(form, 'jobtitle', d.role);
        setField(form, 'email', d.email);
        setField(form, 'calendar_2027_month', cfg.slug);
        setField(form, 'calendar_2027_entry_type', d.type);
        var file = form.querySelector('input[type="file"][name="' + cfg.photoField + '"]');
        if (file && d.photo && window.DataTransfer) {
          var dt = new DataTransfer(); dt.items.add(d.photo); file.files = dt.files;
          file.dispatchEvent(new Event('change', { bubbles: true }));
        }
        var timer = setTimeout(function () { hsDone = null; reject(new Error('timeout')); }, 45000);
        hsDone = function () { clearTimeout(timer); hsDone = null; resolve(); };
        var btn = form.querySelector('[type="submit"]');
        if (btn) btn.click(); else reject(new Error('no submit'));
        // HubSpot shows its own errors inside the hidden form; surface them.
        setTimeout(function () {
          var err = form.querySelector('.hs-error-msgs, .hs-main-font-element .hs-error-msg');
          if (err && hsDone) { clearTimeout(timer); hsDone = null; reject(new Error('invalid')); }
        }, 1500);
      });
    });
  }
  function submit(d) {
    if (cfg.form) return sendToHubSpot(d);
    if (previewMatch) return Promise.resolve('preview');
    return Promise.reject(new Error('no-form'));
  }

  function collect(p, type, photo) {
    return { name: $(p + '-name').value, company: $(p + '-co').value, role: $(p + '-role').value, email: $(p + '-mail').value, type: type, photo: photo };
  }

  /* ---------- Finish + share ---------- */
  function finish(d, label, result) {
    $('t-name').textContent = d.name; $('t-co').textContent = d.company;
    if ($('t-route')) $('t-route').textContent = label;
    if ($('snap')) $('snap').hidden = true;
    if ($('online')) $('online').hidden = true;
    $('done').hidden = false;
    if (result === 'preview') {
      var note = document.createElement('p');
      note.className = 'cal27-preview';
      note.textContent = 'Preview only: this entry was not sent anywhere.';
      $('done').appendChild(note);
    }
    window.scrollTo({ top: root.getBoundingClientRect().top + scrollY - 20 });
    burst(220);
  }
  if ($('copy')) $('copy').onclick = function () {
    var inp = $('share-link');
    var ok = function () { say('copy-msg', 'Link copied. Paste it to your team.', true); };
    var fail = function () { inp.focus(); inp.select(); say('copy-msg', 'Link selected. Copy it from the box above.', true); };
    try { navigator.clipboard.writeText(inp.value).then(ok, fail); } catch (e) { fail(); }
  };

  function send(form, p, type, photo, label, msgId) {
    var btn = form.querySelector('button[type="submit"]');
    var d = collect(p, type, photo);
    btn.disabled = true; btn.textContent = 'Sending…';
    submit(d).then(function (result) { finish(d, label, result); }, function (err) {
      btn.disabled = false; btn.textContent = 'Submit my entry';
      if (type === 'photo') setStep('phys-steps', 1);
      say(msgId, err && err.message === 'no-form'
        ? "Entries aren't open yet. Please try again soon."
        : 'Sorry, your entry did not go through. Check your details and connection, then try again.', false);
    });
  }

  /* ---------- Scan view: camera first ---------- */
  var photo = null;
  if ($('f-photo')) {
    $('f-photo').addEventListener('change', function (e) {
      var f = e.target.files[0];
      if (!f) return;
      if (!/^image\//.test(f.type)) { say('phys-msg', "That file isn't a photo. Try again with your camera.", false); return; }
      photo = f;
      var rd = new FileReader(); rd.onload = function () { $('prev-img').src = rd.result; }; rd.readAsDataURL(f);
      $('cam').hidden = true; $('shot').hidden = false; $('phys-msg').textContent = '';
      setStep('phys-steps', 1); unlock('phys-form-wrap', true);
    });
    $('retake').onclick = function () {
      photo = null; $('f-photo').value = ''; $('shot').hidden = true; $('cam').hidden = false;
      setStep('phys-steps', 0); unlock('phys-form-wrap', false);
    };
    $('phys-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!photo) { say('phys-msg', 'Take a photo of your ' + cfg.noun + ' first.', false); return; }
      setStep('phys-steps', 2);
      send(this, 'p', 'photo', photo, 'Photo of the printed calendar', 'phys-msg');
    });
  }

  /* ---------- Play view: the game calls solved() when it's done ---------- */
  var gameSolved = false;
  if ($('on-form')) {
    $('on-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!gameSolved) { say('on-msg', cfg.noun === 'crossword' ? 'Finish the crossword first.' : 'Find all 6 words first.', false); return; }
      send(this, 'o', 'online', null, cfg.playLabel, 'on-msg');
    });
  }

  window.cal27 = {
    state: state, burst: burst, setStep: setStep,
    solved: function () {
      gameSolved = true;
      setStep('on-steps', 1); unlock('on-form-wrap', true);
      say('on-msg', cfg.playDone, true); burst(160);
    }
  };
})();
