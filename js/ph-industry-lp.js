// Floating Viber chat button on the Philippines industry landing pages
// (ai-powered-operational-hr-for-*-in-the-philippines.html).
//
// Viber has no web chat link like WhatsApp's wa.me: the button's viber://
// link only works where the Viber app is installed (phone or desktop). When
// the app opens, the page loses focus; if it is still focused ~1.5s after
// the click, assume nothing opened and show the #indViberHelp card with the
// number and a download link instead of leaving the click doing nothing.

(function () {
  var btn = document.getElementById('indViberFloat');
  var help = document.getElementById('indViberHelp');
  var close = document.getElementById('indViberHelpClose');
  if (!btn || !help) return;

  var timer = null;

  function cancel() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function showHelp() {
    timer = null;
    if (document.hidden || !document.hasFocus()) return; // the app took over
    help.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }

  function hideHelp() {
    help.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function () {
    hideHelp();
    cancel();
    timer = setTimeout(showHelp, 1500);
  });

  // The app opening moves focus away from the page.
  window.addEventListener('blur', cancel);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cancel();
  });

  if (close) close.addEventListener('click', hideHelp);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideHelp();
  });
  document.addEventListener('click', function (e) {
    if (!help.hidden && !help.contains(e.target) && !btn.contains(e.target)) hideHelp();
  });
})();
