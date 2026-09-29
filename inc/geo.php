<?php
/**
 * PeoplesHR geotargeting.
 * Resolves the visitor's country to one of our 7 supported markets and
 * caches the result in a cookie so we don't look it up on every page view.
 *
 * Must be included before any HTML output (setcookie() requires that).
 * Exposes: $phrCountry — one of SG, PH, ID, KE, BD, LK, AE, or null.
 *
 * Detection uses a local IP2Location LITE database (DB1, country-only)
 * instead of a third-party HTTP API (the previous ip-api.com approach —
 * unreliable in practice: needs allow_url_fopen, an outbound network path
 * from the server, and is subject to the free tier's rate limit). The BIN
 * lookup is a few local file reads, no network round-trip, no rate limit.
 *
 * Requires the free IP2Location LITE DB1 .BIN file at
 * inc/data/IP2LOCATION-LITE-DB1.BIN — download it after registering (free)
 * at https://www.ip2location.com/database/ip-country, and refresh it every
 * so often since IP ranges get reallocated over time. If the file isn't
 * present, detection just falls back to $phrCountry = null, same as the
 * old code's behaviour when the API call failed.
 */

require_once __DIR__ . '/asset-version.php';

$phrSupportedCountries = ['SG', 'PH', 'ID', 'KE', 'BD', 'LK', 'AE'];
$phrCountry = null;
$phrCookieDays = 30;

// Cookie flags: Secure (HTTPS-only) and SameSite=Lax. Not gated on
// $_SERVER['HTTPS'] because local WAMP dev is plain HTTP and a Secure
// cookie would just silently never get set/read there -- harmless in
// prod (site is HTTPS-only, see the HSTS header) and correct locally.
$phrCookieOpts = ['path' => '/', 'secure' => !empty($_SERVER['HTTPS']), 'samesite' => 'Lax'];

// Local/QA override (e.g. page.html?debug_country=ID) restricted to requests
// from this machine -- a real visitor could otherwise flip their own geo
// content via a URL param, which is the kind of thing that shouldn't be
// live on production regardless of severity.
$phrIsLocalRequest = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);

if ($phrIsLocalRequest && isset($_GET['debug_country'])) {
    $dbg = strtoupper(trim($_GET['debug_country']));
    $phrCountry = in_array($dbg, $phrSupportedCountries, true) ? $dbg : null;
    setcookie('phr_geo', $phrCountry ?? 'NONE', ['expires' => time() + 60 * 30] + $phrCookieOpts);
} elseif (isset($_COOKIE['phr_geo'])) {
    $cached = $_COOKIE['phr_geo'];
    $phrCountry = ($cached !== 'NONE' && in_array($cached, $phrSupportedCountries, true)) ? $cached : null;
} else {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
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
                // Missing/corrupt BIN file, unreadable, etc. — leave $detected = null,
                // same fallback behaviour as when the old API call failed.
            }
        }
    }

    $phrCountry = in_array($detected, $phrSupportedCountries, true) ? $detected : null;
    setcookie('phr_geo', $phrCountry ?? 'NONE', ['expires' => time() + 60 * 60 * 24 * $phrCookieDays] + $phrCookieOpts);
}
