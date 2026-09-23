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
 * This only makes .html files execute as PHP (like the real .htaccess
 * does) — it does not simulate the clean-URL rewrite rules or the old-URL
 * redirects from .htaccess, so use plain .html links while browsing
 * (e.g. http://localhost:8899/products/core-hr.html). Those rewrite rules
 * only matter on a real Apache server and were already verified separately.
 */
$docroot = __DIR__;
$path = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = $docroot . $path;

if ($path === '/') {
    $file = $docroot . '/index.html';
}
if (is_dir($file)) {
    $file = rtrim($file, '/') . '/index.html';
}

if (file_exists($file) && preg_match('/\.html?$/i', $file)) {
    chdir(dirname($file));
    require $file;
    return true;
}

return false; // let the built-in server serve everything else (css/js/images) as static
