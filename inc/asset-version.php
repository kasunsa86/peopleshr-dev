<?php
/**
 * Cache-busting for local CSS/JS.
 * Puts the file's last-modified time into the filename
 * (/css/styles.css -> /css/styles.v1695634000.css), so browsers and the
 * CloudFront cache fetch the new version automatically as soon as the file
 * changes on disk -- no manual version bump needed. The version has to be
 * in the path, not a ?v= query string: CloudFront ignores query strings for
 * /css/ and /js/, so ?v= would keep serving the old cached file. .htaccess
 * maps the versioned name back to the real file (see "VERSIONED ASSETS").
 */
function asset_v($path) {
    $file = __DIR__ . '/..' . $path;
    $v = is_file($file) ? filemtime($file) : time();
    return preg_replace('/\.(css|js)$/', '.v' . $v . '.$1', $path);
}
