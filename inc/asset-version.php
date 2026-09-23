<?php
/**
 * Cache-busting for local CSS/JS.
 * Appends the file's last-modified time as a ?v= query string, so browsers
 * (and any server/CDN cache) fetch the new version automatically as soon as
 * the file changes on disk -- no manual version bump needed.
 */
function asset_v($path) {
    $file = __DIR__ . '/..' . $path;
    $v = is_file($file) ? filemtime($file) : time();
    return $path . '?v=' . $v;
}
