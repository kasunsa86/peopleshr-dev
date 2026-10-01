<?php
/**
 * Google Analytics 4 (stream "PeoplesHR new", G-HLKRR01ZPD).
 * Included in every page's <head>, right after the HubSpot embed code.
 * Also pulls in inc/clarity.php (Microsoft Clarity) at the end.
 *
 * Production only: dev.peopleshr.com and localhost previews don't load it,
 * so test traffic never lands in the GA4 property. origin.peopleshr.com is
 * the live site as CloudFront requests it (the origin only answers the CDN).
 *
 * Consent: if the visitor clicked "Reject Non-Essential" on the site's cookie
 * banner (phr_cookie_consent=rejected, see js/phr.js), GA4 starts with
 * storage denied (cookieless pings only). Clicking a banner button later
 * updates it live via gtag('consent','update', ...).
 */
$phr_ga4_host = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
if (in_array($phr_ga4_host, ['peopleshr.com', 'www.peopleshr.com', 'origin.peopleshr.com'], true)):
?>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-HLKRR01ZPD"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    (function(){
      var denied = /(?:^|; )phr_cookie_consent=rejected/.test(document.cookie) ? 'denied' : 'granted';
      gtag('consent', 'default', {analytics_storage: denied, ad_storage: denied, ad_user_data: denied, ad_personalization: denied});
    })();
    gtag('js', new Date());

    gtag('config', 'G-HLKRR01ZPD');
  </script>
<?php endif; ?>
<?php include __DIR__ . '/clarity.php'; ?>
