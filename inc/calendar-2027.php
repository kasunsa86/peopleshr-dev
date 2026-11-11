<?php
/**
 * PeoplesHR 2027 printed calendar (Sri Lanka): one QR code on all 12 pages.
 *
 * The QR on every page encodes https://peopleshr.com/calendar/ and nothing
 * else, so the printed code never has to change. calendar.html reads
 * today's date in Colombo time and sends the visitor to:
 *
 *   before 1 Jan 2027   -> /calendar-2027/coming-soon/
 *   1 Jan to 31 Dec     -> /calendar-2027/<month>/  (e.g. /calendar-2027/march/)
 *   after 31 Dec 2027   -> /calendar-2027/thank-you/
 *
 * Each month is open from the 1st to its last day, with no late entries.
 * January, June and December also give the entrant a share link so
 * colleagues can play the same puzzle online.
 */

const CAL27_TZ = 'Asia/Colombo';
const CAL27_YEAR = 2027;

/** Month slug => name, theme and game, from the calendar plan sheet. */
function cal27_months()
{
    return [
        'january'   => ['name' => 'January',   'theme' => 'New Beginnings',             'game' => 'Crossword',     'share' => true],
        'february'  => ['name' => 'February',  'theme' => 'Valentines',                 'game' => 'Find the word', 'share' => false],
        'march'     => ['name' => 'March',     'theme' => 'Brand Names',                'game' => 'Crossword',     'share' => false],
        'april'     => ['name' => 'April',     'theme' => 'Avurudu, 30 Years',          'game' => 'Find the word', 'share' => false],
        'may'       => ['name' => 'May',       'theme' => 'PeoplesHR Module Suites',    'game' => 'Crossword',     'share' => false],
        'june'      => ['name' => 'June',      'theme' => '6 Months Gone, 6 More to Go', 'game' => 'Find the word', 'share' => true],
        'july'      => ['name' => 'July',      'theme' => 'Friendship',                 'game' => 'Crossword',     'share' => false],
        'august'    => ['name' => 'August',    'theme' => 'Wellness',                   'game' => 'Find the word', 'share' => false],
        'september' => ['name' => 'September', 'theme' => 'Growth',                     'game' => 'Crossword',     'share' => false],
        'october'   => ['name' => 'October',   'theme' => 'Halloween',                  'game' => 'Find the word', 'share' => false],
        'november'  => ['name' => 'November',  'theme' => 'AI Future',                  'game' => 'Crossword',     'share' => false],
        'december'  => ['name' => 'December',  'theme' => 'Christmas',                  'game' => 'Find the word', 'share' => true],
    ];
}

/** Today in Colombo, or the ?preview=YYYY-MM-DD date for testing a switchover. */
function cal27_today($preview = null)
{
    $tz = new DateTimeZone(CAL27_TZ);
    if (is_string($preview) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $preview)) {
        $d = DateTimeImmutable::createFromFormat('!Y-m-d', $preview, $tz);
        if ($d && $d->format('Y-m-d') === $preview) {
            return $d;
        }
    }
    return new DateTimeImmutable('now', $tz);
}

/** The path the QR should open on a given day. */
function cal27_route(DateTimeInterface $day)
{
    $year = (int) $day->format('Y');
    if ($year < CAL27_YEAR) {
        return '/calendar-2027/coming-soon/';
    }
    if ($year > CAL27_YEAR) {
        return '/calendar-2027/thank-you/';
    }
    $slugs = array_keys(cal27_months());
    return '/calendar-2027/' . $slugs[(int) $day->format('n') - 1] . '/';
}
