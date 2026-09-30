<?php
/**
 * Visitor country lookup for the cached pages -- the only per-visitor
 * request left on the site. Called once by inc/geo-head.php when the
 * phr_geo cookie isn't set yet; returns {"country":"LK"} or
 * {"country":null} and sets phr_geo (30 days) so later page views skip it.
 *
 * CloudFront must never cache this URL (it forwards True-Client-IP, see
 * peopleshr_visitor_ip() in inc/geo.php).
 */
require_once __DIR__ . '/inc/geo.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: private, no-store');
header('X-Robots-Tag: noindex, nofollow');

echo json_encode(['country' => phr_geo_detect()]);
