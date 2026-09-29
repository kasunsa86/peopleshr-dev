<?php
/**
 * Years of HR domain expertise, counted from May 1997 (29 in May 2026).
 * Ticks up by one every May, so pages never need a manual edit.
 */
function phr_years() {
    return (int)date('Y') - 1997 - ((int)date('n') < 5 ? 1 : 0);
}
