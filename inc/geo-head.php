<?php
/**
 * Geotargeting in the browser, included in every page's <head>.
 *
 * Pages are cached by CloudFront, so the HTML carries every regional
 * variant (footer office: inc/office-block.php, homepage banner:
 * inc/geo-banner.php) hidden by the CSS below; this script sets
 * <html data-geo="XX"> and the CSS shows the matching variant.
 *
 * Country source: the phr_geo cookie if set (synchronous, so the right
 * variant is there on first paint), otherwise one call to /geo-lookup.php,
 * which also sets the cookie for later page views. "NONE" / null means no
 * supported country -> data-geo="default". On any failure the attribute is
 * left unset and the default (Sri Lanka) office stays visible.
 *
 * window.phrGeo is a Promise of the country (or null) for page scripts
 * that need it (view-plans.html picks its Bahasa version from it).
 *
 * A country that only arrives from /geo-lookup.php (first visit) also sets
 * data-geo-late: the homepage banner stays hidden on that one page view, as
 * showing it after first paint would push the page down (CLS). The next
 * page view reads the cookie and shows it at first paint.
 */
?>
  <style>
    .geo { display: none; }
    .geo.geo-default { display: block; }
    html[data-geo="PH"] .geo-default, html[data-geo="ID"] .geo-default,
    html[data-geo="KE"] .geo-default, html[data-geo="BD"] .geo-default,
    html[data-geo="AE"] .geo-default { display: none; }
    html[data-geo="SG"] .geo-SG, html[data-geo="PH"] .geo-PH, html[data-geo="ID"] .geo-ID,
    html[data-geo="KE"] .geo-KE, html[data-geo="BD"] .geo-BD, html[data-geo="LK"] .geo-LK,
    html[data-geo="AE"] .geo-AE { display: block; }
    html[data-geo-late] .geo.geo-banner { display: none; }
  </style>
  <script>
    window.phrGeo = (function () {
      var root = document.documentElement;
      var supported = ['SG', 'PH', 'ID', 'KE', 'BD', 'LK', 'AE'];
      function apply(country) {
        country = supported.indexOf(country) !== -1 ? country : null;
        root.setAttribute('data-geo', country || 'default');
        return country;
      }
      // ?debug_country=XX (honoured by /geo-lookup.php for local requests only).
      var debug = /[?&]debug_country=([A-Za-z]*)/.exec(location.search);
      var cookie = /(?:^|; )phr_geo=([A-Z]+)/.exec(document.cookie);
      if (!debug && cookie && (cookie[1] === 'NONE' || supported.indexOf(cookie[1]) !== -1)) {
        return Promise.resolve(apply(cookie[1]));
      }
      if (!window.fetch) return Promise.resolve(null);
      var url = '/geo-lookup.php' + (debug ? '?debug_country=' + debug[1] : '');
      return fetch(url, { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          root.setAttribute('data-geo-late', '');
          return apply(data && data.country);
        })
        .catch(function () { return null; });
    })();
  </script>
