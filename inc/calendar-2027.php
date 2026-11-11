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
        'january'   => ["headline" => "Let's go! 8 words to kick off the year!", 'name' => 'January',   'theme' => 'New Beginnings',             'game' => 'Crossword',     'share' => true],
        'february'  => ["headline" => "Love is in the air! 7 things that make work lovable!", 'name' => 'February',  'theme' => 'Valentines',                 'game' => 'Find the word', 'share' => false],
        'march'     => ["headline" => "Know us better? 5 words, all about PeoplesHR!", 'name' => 'March',     'theme' => 'Brand Names',                'game' => 'Crossword',     'share' => false],
        'april'     => ["headline" => "Avurudu is here! 7 words of the season!", 'name' => 'April',     'theme' => 'Avurudu, 30 Years',          'game' => 'Find the word', 'share' => false],
        'may'       => ["headline" => "From hire to retire! 7 words from the PeoplesHR platform!", 'name' => 'May',       'theme' => 'PeoplesHR Module Suites',    'game' => 'Crossword',     'share' => false],
        'june'      => ["headline" => "Time for mid-year feedback, served free like a dansala! 6 words to find!", 'name' => 'June',      'theme' => '6 Months Gone, 6 More to Go', 'game' => 'Find the word', 'share' => true],
        'july'      => ["headline" => "Every great job needs a great friend! 6 words to find!", 'name' => 'July',      'theme' => 'Friendship',                 'game' => 'Crossword',     'share' => false],
        'august'    => ["headline" => "This month is all about wellness! 6 words to find!", 'name' => 'August',    'theme' => 'Wellness',                   'game' => 'Find the word', 'share' => false],
        'september' => ["headline" => "Level up! 7 words to grow your career!", 'name' => 'September', 'theme' => 'Growth',                     'game' => 'Crossword',     'share' => false],
        'october'   => ["headline" => "Boo! 6 spooky HR words to find!", 'name' => 'October',   'theme' => 'Halloween',                  'game' => 'Find the word', 'share' => false],
        'november'  => ["headline" => "Plan ahead, the future is here! 6 words to find!", 'name' => 'November',  'theme' => 'AI Future',                  'game' => 'Crossword',     'share' => false],
        'december'  => ["headline" => "Ho ho ho! 6 festive words to find!", 'name' => 'December',  'theme' => 'Christmas',                  'game' => 'Find the word', 'share' => true],
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

/**
 * HubSpot form that stores every monthly entry (portal 45700506). Leave
 * the ID empty until the form exists: the month pages then say the entry
 * form is on its way instead of showing a broken form. Hidden fields on
 * the form: calendar_2027_month (e.g. "march") and calendar_2027_entry_type
 * ("photo" from the calendar, "online" from the shared game).
 */
const CAL27_HS_PORTAL = '45700506';
const CAL27_HS_FORM_ID = '';

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
