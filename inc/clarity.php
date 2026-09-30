<?php
/**
 * Microsoft Clarity (project k1zv4lyxlq): heatmaps and session recordings.
 * Pulled in by inc/ga4.php, so it lands in every page's <head> alongside GA4
 * without a per-page include.
 *
 * Production only, same as GA4: dev.peopleshr.com and localhost previews
 * don't load it, so test sessions never show up in Clarity. origin.peopleshr.com
 * is the live site as CloudFront requests it.
 *
 * Consent: follows the site's cookie banner (phr_cookie_consent, see
 * js/phr.js). If the visitor rejected non-essential cookies, Clarity is told
 * to run without cookies; a later banner click updates it live.
 *
 * CSP: .htaccess must allow https://*.clarity.ms (script-src, connect-src)
 * and https://c.bing.com (connect-src), or the tag is silently blocked.
 */
$phr_clarity_host = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
if (in_array($phr_clarity_host, ['peopleshr.com', 'www.peopleshr.com', 'origin.peopleshr.com'], true)):
?>
  <!-- Microsoft Clarity -->
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "k1zv4lyxlq");
    if (/(?:^|; )phr_cookie_consent=rejected/.test(document.cookie)) window.clarity('consent', false);
  </script>
<?php endif; ?>
