<?php
/**
 * Meta (Facebook) pixel, with automatic events switched off.
 * Pulled in by inc/ga4.php, so it lands in every page's <head>.
 *
 * The pixel itself is added by HubSpot's ad tracking (js-na2.hsadspixel.net/
 * pixels.js, loaded by the HubSpot embed code), not by this site. Left alone,
 * fbevents.js turns on Meta's "automatic events", which puts a click listener
 * on the document that inspects the clicked element on every tap. That
 * listener was ~90% of the click-handler time on the homepage (≈80ms per tap
 * on a throttled mobile CPU) and is what pushed field INP over 200ms.
 *
 * HubSpot's loader only creates fbq and loads fbevents.js if window.fbq does
 * not exist yet, so this defines fbq first:
 *   - every fbq('init', id) is preceded by fbq('set', 'autoConfig', false, id),
 *     which turns automatic events off for whichever pixel HubSpot starts;
 *   - fbevents.js is only loaded on that first init, so if HubSpot's cookie
 *     banner keeps the ads pixel from running, nothing from Meta loads.
 * PageView and any events HubSpot tracks explicitly are unaffected.
 */
?>
  <script>
    (function (w, d) {
      if (w.fbq) return;
      var n = w.fbq = function () {
        if (n.callMethod) return n.callMethod.apply(n, arguments);
        if (arguments[0] === 'init') {
          n.queue.push(['set', 'autoConfig', false, arguments[1]]);
          if (!n.requested) {
            n.requested = true;
            var s = d.createElement('script');
            s.async = true;
            s.src = 'https://connect.facebook.net/en_US/fbevents.js';
            d.head.appendChild(s);
          }
        }
        n.queue.push(arguments);
      };
      if (!w._fbq) w._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
    })(window, document);
  </script>
