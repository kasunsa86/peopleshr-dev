/* PeoplesHR 2027 calendar pages (/calendar-2027/<month>/ and
 * /calendar-2027/<month>-play/).
 *
 * Pages are cached at CloudFront for up to a day, so the entry window is
 * enforced here in the browser, on Colombo time: the page's month is open
 * from the 1st to its last day. Test with ?preview=YYYY-MM-DD.
 *
 * The month page mounts the HubSpot entry form straight away (entry type
 * "photo"). The play page shows the online game first and mounts the form
 * (entry type "online") once the game is solved, see calendar-2027-play.js. */
(function () {
  var box = document.getElementById('cal27Entry');
  if (!box) return;

  var YEAR = 2027;
  var month = Number(box.getAttribute('data-month'));
  var slug = box.getAttribute('data-slug');
  var portal = box.getAttribute('data-portal');
  var formId = box.getAttribute('data-form');
  var mode = box.getAttribute('data-mode') || 'photo';

  function colomboToday() {
    var m = /[?&]preview=(\d{4}-\d{2}-\d{2})/.exec(location.search);
    if (m) return m[1];
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) {
      // Old browser without time zones: Colombo is UTC+05:30 all year.
      return new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
    }
  }

  var today = colomboToday();
  var y = Number(today.slice(0, 4)), mo = Number(today.slice(5, 7));
  var state = (y < YEAR || (y === YEAR && mo < month)) ? 'before'
            : (y > YEAR || mo > month) ? 'after'
            : 'open';

  function show(name) {
    var panes = box.querySelectorAll('.cal27-state');
    for (var i = 0; i < panes.length; i++) {
      panes[i].hidden = panes[i].getAttribute('data-state') !== name;
    }
  }

  function setHidden(form, name, value) {
    var el = form.querySelector('input[name="' + name + '"]');
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /* Puts the HubSpot form into #cal27Form, or the "on its way" note when no
   * form ID is set yet. onDone runs after a successful submission. */
  function mountForm(entryType, onDone) {
    var wrap = document.getElementById('cal27FormWrap');
    if (wrap) wrap.hidden = !formId;
    if (!formId) {
      var pending = document.getElementById('cal27Pending');
      if (pending) pending.hidden = false;
      return;
    }
    var s = document.createElement('script');
    s.src = 'https://js.hsforms.net/forms/embed/v2.js';
    s.charset = 'utf-8';
    s.onload = function () {
      if (!window.hbspt) return;
      window.hbspt.forms.create({
        region: 'na2',
        portalId: portal,
        formId: formId,
        target: '#cal27Form',
        onFormReady: function ($form) {
          var form = $form && $form.jquery ? $form[0] : $form;
          if (!form || !form.querySelector) return;
          setHidden(form, 'calendar_2027_month', slug);
          setHidden(form, 'calendar_2027_entry_type', entryType);
        },
        onFormSubmitted: function () { if (onDone) onDone(); }
      });
    };
    document.head.appendChild(s);
  }

  /* Share block (January, June, December): link, copy button, WhatsApp. */
  function showShare() {
    var share = document.getElementById('cal27Share');
    if (!share) return;
    share.hidden = false;
    var url = share.getAttribute('data-url');
    var input = share.querySelector('input');
    var btn = share.querySelector('.cal27-copy');
    if (input) input.value = url;
    if (btn) btn.onclick = function () {
      function done() { btn.textContent = 'Copied'; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { input.select(); });
      } else { input.select(); }
    };
  }

  show(state);
  window.cal27 = { state: state, mountForm: mountForm, showShare: showShare };
  if (state === 'open' && mode === 'photo') {
    mountForm('photo', showShare);
  }
})();
