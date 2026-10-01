<?php
/**
 * LOCAL DEV TOOL ONLY — do not upload this file to the live/dev server.
 *
 * Lets PHP's own built-in web server preview this site correctly on your
 * machine, without touching WAMP's Apache config. Run it with:
 *
 *   php -S localhost:8899 -t "c:\wamp64\www\Peopleshr HTML" dev-server-router.php
 *
 * Then browse http://localhost:8899/ — CSS/JS/image paths resolve correctly
 * because the site is served as its OWN root here, exactly like the real
 * domain will be, instead of nested under WAMP's default
 * "http://localhost/Peopleshr HTML/..." alongside other projects (which is
 * what breaks the root-relative "/css/..." style paths used everywhere).
 *
 * This makes .html files execute as PHP (like the real .htaccess does) and
 * serves clean URLs (/products/core-hr/ -> products/core-hr.html), since
 * every internal link now points at the clean form. It does not simulate
 * the old-URL redirects from .htaccess; those only matter on a real Apache
 * server and were already verified separately.
 */
$docroot = __DIR__;
$path = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = $docroot . $path;

// Clean URLs that serve a PDF directly, mirroring the RewriteRules in .htaccess.
$pdfUrls = [
    'limitations-for-configuration' => ['/uploads/legal/PRM-L3-PHR-Limitations-for-Configuration-April-2025-V2.0.pdf', 'PeoplesHR-Limitations-for-Configuration-V2.0.pdf'],
    'report' => ['/uploads/legal/PRM-L3-PHR-Standard-Reports-May-2026-V3.0.pdf', 'PeoplesHR-Standard-Reports-V3.0.pdf'],
];
$slug = trim(preg_replace('/\.html$/', '', $path), '/');
if (isset($pdfUrls[$slug])) {
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . $pdfUrls[$slug][1] . '"');
    readfile($docroot . $pdfUrls[$slug][0]);
    return true;
}

if ($path === '/') {
    $file = $docroot . '/index.html';
}
if (is_dir($file)) {
    $file = rtrim($file, '/') . '/index.html';
}
// Clean URL (/company/ or /company) -> company.html, like .htaccess does.
if (!file_exists($file) && is_file($docroot . rtrim($path, '/') . '.html')) {
    $file = $docroot . rtrim($path, '/') . '.html';
}

// Versioned asset (/css/styles.v1695634000.css -> css/styles.css), like
// the "VERSIONED ASSETS" rule in .htaccess; see inc/asset-version.php.
if (!file_exists($file) && preg_match('/^(.+)\.v[0-9]+\.(css|js)$/', $path, $m) && is_file($docroot . $m[1] . '.' . $m[2])) {
    header('Content-Type: ' . ($m[2] === 'css' ? 'text/css' : 'application/javascript') . '; charset=utf-8');
    readfile($docroot . $m[1] . '.' . $m[2]);
    return true;
}

if (file_exists($file) && preg_match('/\.html?$/i', $file)) {
    chdir(dirname($file));
    require $file;
    return true;
}

return false; // let the built-in server serve everything else (css/js/images) as static
