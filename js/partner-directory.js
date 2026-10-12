// Partner page — Partner Network region tabs.
// Panels are rendered server-side by inc/partner-directory.php with every
// region but the first `hidden`; this just swaps which panel is shown.
// Arrow keys / Home / End move between tabs (WAI-ARIA tabs pattern).

(function () {
  const list = document.querySelector('.pd-tabs');
  if (!list) return; // guard: element absent on other pages

  const tabs = Array.from(list.querySelectorAll('[role="tab"]'));

  function select(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab, false));
    tab.addEventListener('keydown', e => {
      let n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n === null) return;
      e.preventDefault();
      select(tabs[n], true);
    });
  });
})();
