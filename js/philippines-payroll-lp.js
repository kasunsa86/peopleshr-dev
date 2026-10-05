/* philippines-payroll-lp.html -- page-specific scripts. Loaded after
   js/phr.js on that page only. */

/* "Falling" benefit-tag cloud (see .pay-tag-chip
   in styles.css). Stagger each chip's transition-delay, then reveal the
   whole cloud with one .is-inview class once it scrolls into view, so
   the chips animate down into place in sequence rather than all at once. */
(function () {
  var cloud = document.querySelector('.pay-tag-cloud');
  if (!cloud) return;

  var chips = cloud.querySelectorAll('.pay-tag-chip');
  chips.forEach(function (chip, i) {
    chip.style.transitionDelay = (Math.min(i, 24) * 0.04) + 's';
  });

  if (!('IntersectionObserver' in window)) {
    cloud.classList.add('is-inview');
    return;
  }

  var tagCloudObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  tagCloudObserver.observe(cloud);
}());
