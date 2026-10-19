<?php
/**
 * Hold back third-party trackers until the hero HubSpot form is ready.
 *
 * Used on landing pages whose demo form sits in the hero
 * (philippines-payroll-lp.html, philippines-hris.html), so the form's
 * script, definition and iframe aren't fighting the HubSpot tracking loader,
 * GA4 and Clarity for bandwidth and main-thread time on first load.
 *
 * Set $phr_defer_trackers = true and include this before the HubSpot embed
 * code and inc/ga4.php. Scripts handed to phrDeferScript() are queued and
 * injected when:
 *   - the new .hs-form-frame embed fires hs-form-event:on-ready, or
 *   - the page calls phrLoadTrackers() (v2 embed's onFormReady), or
 *   - 3s have passed, so a slow or blocked form never costs us tracking.
 * Inline stubs (gtag queue, clarity queue) still run straight away, so
 * nothing they record before the scripts arrive is lost.
 */
?>
  <script>
    (function () {
      var queue = [], loaded = false;
      function inject(s) {
        var el = document.createElement('script');
        el.async = true;
        el.src = s.src;
        if (s.id) el.id = s.id;
        document.head.appendChild(el);
      }
      window.phrDeferScript = function (src, id) {
        var s = { src: src, id: id };
        loaded ? inject(s) : queue.push(s);
      };
      window.phrLoadTrackers = function () {
        if (loaded) return;
        loaded = true;
        queue.forEach(inject);
        queue = [];
      };
      window.addEventListener('hs-form-event:on-ready', window.phrLoadTrackers);
      setTimeout(window.phrLoadTrackers, 3000);
    })();
  </script>
