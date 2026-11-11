/* PeoplesHR 2027 calendar month pages (/calendar-2027/<month>/).
 *
 * Pages are cached at CloudFront for up to a day, so the entry window is
 * enforced here in the browser, on Colombo time: the HubSpot form shows
 * only from the 1st to the last day of the page's month. Test with
 * ?preview=YYYY-MM-DD. */
(function () {
  var box = document.getElementById('cal27Entry');
  if (!box) return;

  var YEAR = 2027;
  var month = Number(box.getAttribute('data-month'));
  var slug = box.getAttribute('data-slug');
  var portal = box.getAttribute('data-portal');
  var formId = box.getAttribute('data-form');

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
            : (formId ? 'open' : 'pending');

  var panes = box.querySelectorAll('.cal27-state');
  for (var i = 0; i < panes.length; i++) {
    panes[i].hidden = panes[i].getAttribute('data-state') !== state;
  }
  if (state !== 'open') return;

  function setHidden(form, name, value) {
    var el = form.querySelector('input[name="' + name + '"]');
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
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
        setHidden(form, 'calendar_2027_entry_type', 'photo');
      }
    });
  };
  document.head.appendChild(s);
})();
