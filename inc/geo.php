<?php
/**
 * PeoplesHR geotargeting -- shared helpers.
 *
 * Pages are cached by CloudFront, so they must be identical for every
 * visitor: pages no longer look anything up or set cookies here. Every page
 * carries all regional variants (footer office, homepage banner, Bahasa
 * pricing page) and inc/geo-head.php picks the right one in the browser,
 * from the phr_geo cookie or, on a first visit, from /geo-lookup.php --
 * the only request that actually runs phr_geo_detect() below.
 *
 * Pages still require this file for the shared helpers it pulls in
 * (asset_v(), phr_years()).
 *
 * Detection uses a local IP2Location LITE database (DB1, country-only)
 * instead of a third-party HTTP API (the previous ip-api.com approach --
 * unreliable in practice: needs allow_url_fopen, an outbound network path
 * from the server, and is subject to the free tier's rate limit). The BIN
 * lookup is a few local file reads, no network round-trip, no rate limit.
 *
 * Requires the free IP2Location LITE DB1 .BIN file at
 * inc/data/IP2LOCATION-LITE-DB1.BIN -- download it after registering (free)
 * at https://www.ip2location.com/database/ip-country, and refresh it every
 * so often since IP ranges get reallocated over time. If the file isn't
 * present, detection just falls back to null (default office, no banner).
 */

require_once __DIR__ . '/asset-version.php';

if (!function_exists('peopleshr_visitor_ip')) {
    // Behind CloudFront, REMOTE_ADDR is a CloudFront server. Requests on the locked
    // origin hostname carry the real visitor IP in True-Client-IP (set by our CloudFront Function).
    function peopleshr_visitor_ip()
    {
        $host = strtolower(isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '');
        if ($host === 'origin.peopleshr.com' && !empty($_SERVER['HTTP_TRUE_CLIENT_IP'])) {
            $ip = trim($_SERVER['HTTP_TRUE_CLIENT_IP']);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
        return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
    }
}

require_once __DIR__ . '/company-years.php';

$phrSupportedCountries = ['SG', 'PH', 'ID', 'KE', 'BD', 'LK', 'AE'];

/**
 * Resolves the visitor to one of $phrSupportedCountries, or null, and
 * caches the answer in the phr_geo cookie ("NONE" = no supported country).
 * Sets a cookie, so call it before any output -- /geo-lookup.php only,
 * never from a page (pages are cached and must not vary per visitor).
 */
function phr_geo_detect()
{
    global $phrSupportedCountries;
    $phrCookieDays = 30;

    // Cookie flags: Secure (HTTPS-only) and SameSite=Lax. Not gated on
    // $_SERVER['HTTPS'] because local WAMP dev is plain HTTP and a Secure
    // cookie would just silently never get set/read there -- harmless in
    // prod (site is HTTPS-only, see the HSTS header) and correct locally.
    // Deliberately not HttpOnly: inc/geo-head.php reads it in the browser.
    $phrCookieOpts = ['path' => '/', 'secure' => !empty($_SERVER['HTTPS']), 'samesite' => 'Lax'];

    // Local/QA override (e.g. page.html?debug_country=ID, which the page
    // script forwards here) restricted to requests from this machine -- a
    // real visitor could otherwise flip their own geo content via a URL
    // param, which shouldn't be live on production regardless of severity.
    $phrIsLocalRequest = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);

    if ($phrIsLocalRequest && isset($_GET['debug_country'])) {
        $dbg = strtoupper(trim($_GET['debug_country']));
        $phrCountry = in_array($dbg, $phrSupportedCountries, true) ? $dbg : null;
        setcookie('phr_geo', $phrCountry ?? 'NONE', ['expires' => time() + 60 * 30] + $phrCookieOpts);
    } else {
        $ip = peopleshr_visitor_ip();
        $detected = null;

        if ($ip && $ip !== '127.0.0.1' && $ip !== '::1') {
            $phrGeoBin = __DIR__ . '/data/IP2LOCATION-LITE-DB1.BIN';

            if (is_readable($phrGeoBin)) {
                try {
                    require_once __DIR__ . '/lib/IP2Location/Database.php';
                    $phrGeoDb = new \IP2Location\Database($phrGeoBin, \IP2Location\Database::FILE_IO);
                    $phrGeoResult = $phrGeoDb->lookup($ip, \IP2Location\Database::COUNTRY_CODE);
                    if (is_string($phrGeoResult) && $phrGeoResult !== '-' && $phrGeoResult !== \IP2Location\Database::INVALID_IP_ADDRESS) {
                        $detected = $phrGeoResult;
                    }
                } catch (\Throwable $e) {
                    // Missing/corrupt BIN file, unreadable, etc. -- leave $detected = null,
                    // same fallback behaviour as when the old API call failed.
                }
            }
        }

        $phrCountry = in_array($detected, $phrSupportedCountries, true) ? $detected : null;
        setcookie('phr_geo', $phrCountry ?? 'NONE', ['expires' => time() + 60 * 60 * 24 * $phrCookieDays] + $phrCookieOpts);
    }

    return $phrCountry;
}
