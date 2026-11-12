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

/**
 * Month slug => copy for each page. name/theme/game come from the calendar
 * plan sheet; snap, tag and the share/play copy come word for word from the
 * marketing team's "2027 <Month> Scan" artifacts, which set the page design.
 *   snap  heading on the scan card       tag   end of "You're in the X draw."
 *   noun  "Take a photo of your <noun>"  deco  dot, heart or sun after the month
 */
function cal27_months()
{
    $found = 'Found all %d words? Snap it to enter.';
    $solved = 'Solved it on your calendar? Snap it to enter.';
    return [
        'january'   => ['name' => 'January',   'theme' => 'New Beginnings',             'game' => 'Crossword',     'share' => true,
                        'headline' => "Let's go! 8 words to kick off the year!", 'snap' => $solved, 'tag' => 'Gammak!', 'noun' => 'crossword',
                        'share_h' => 'Share with your team mates! Stand a higher chance of winning!',
                        'share_p' => "Teammates don't need the printed calendar. Send them this link to play the crossword online and enter too.",
                        'wa' => 'I just played the PeoplesHR January crossword. Your turn! Solve it and stand a chance to win a treat to share: ',
                        'play_step' => 'Solve the crossword',
                        'play_from' => '<b>A colleague shared this with you.</b> Play the January crossword online and enter the draw.',
                        'play_h' => "Let's go! 8 words to kick off the year!",
                        'play_lede' => 'Tap a box and type. Tap the same box again to switch between across and down. Each word lights up green when you get it right.',
                        'play_done' => 'All 8 solved. Gammak thamai! Add your details to enter the draw.',
                        'play_label' => 'Online QR (played on the page)'],
        'february'  => ['name' => 'February',  'theme' => 'Valentines',                 'game' => 'Find the word', 'share' => false,
                        'headline' => 'Love is in the air! 7 things that make work lovable!', 'snap' => sprintf($found, 7), 'tag' => 'Thanks for the love!', 'noun' => 'answer', 'deco' => 'heart', 'pink' => true],
        'march'     => ['name' => 'March',     'theme' => 'Brand Names',                'game' => 'Crossword',     'share' => false,
                        'headline' => 'Know us better? 5 words, all about PeoplesHR!', 'snap' => $solved, 'tag' => 'Now you know us better!', 'noun' => 'answer'],
        'april'     => ['name' => 'April',     'theme' => 'Avurudu, 30 Years',          'game' => 'Find the word', 'share' => false,
                        'headline' => 'Avurudu is here! 7 words of the season!', 'snap' => sprintf($found, 7), 'tag' => 'Right on the nekath time!', 'noun' => 'answer', 'deco' => 'sun'],
        'may'       => ['name' => 'May',       'theme' => 'PeoplesHR Module Suites',    'game' => 'Crossword',     'share' => false,
                        'headline' => 'From hire to retire! 7 words from the PeoplesHR platform!', 'snap' => $solved, 'tag' => 'From hire to retire, you nailed it!', 'noun' => 'answer'],
        'june'      => ['name' => 'June',      'theme' => '6 Months Gone, 6 More to Go', 'game' => 'Find the word', 'share' => true,
                        'headline' => 'Time for mid-year feedback, served free like a dansala! 6 words to find!', 'snap' => sprintf($found, 6), 'tag' => 'Feedback received!', 'noun' => 'word search',
                        'share_h' => 'The Word Game Dansala is open! Share it in dansal style for a better chance to win!',
                        'share_p' => 'Pass the link to your colleagues and stand a higher chance to win a treat for the team.',
                        'wa' => 'The PeoplesHR Word Game Dansala is open! Find 6 words and stand a chance to win a treat to share: ',
                        'play_step' => 'Find the words',
                        'play_from' => '<b>Welcome to the Word Game Dansala!</b> A colleague shared this with you. Play free, and enter the draw.',
                        'play_h' => '<span style="color:var(--orange)">Time for mid-year feedback, served free like a dansala!</span> 6 words to find!',
                        'play_lede' => 'Tap the first letter of a word, then the last. Words run across, down, and one hides diagonally.',
                        'play_done' => 'All 6 found. Add your details to enter the draw.',
                        'play_label' => 'Played online (Word Game Dansala link)'],
        'july'      => ['name' => 'July',      'theme' => 'Friendship',                 'game' => 'Crossword',     'share' => false,
                        'headline' => 'Every great job needs a great friend! 6 words to find!', 'snap' => $solved, 'tag' => 'Every great job needs a great friend!', 'noun' => 'answer'],
        'august'    => ['name' => 'August',    'theme' => 'Wellness',                   'game' => 'Find the word', 'share' => false,
                        'headline' => 'This month is all about wellness! 6 words to find!', 'snap' => sprintf($found, 6), 'tag' => 'Now go take that break!', 'noun' => 'answer'],
        'september' => ['name' => 'September', 'theme' => 'Growth',                     'game' => 'Crossword',     'share' => false,
                        'headline' => 'Level up! 7 words to grow your career!', 'snap' => $solved, 'tag' => 'Keep levelling up!', 'noun' => 'answer'],
        'october'   => ['name' => 'October',   'theme' => 'Halloween',                  'game' => 'Find the word', 'share' => false,
                        'headline' => 'Boo! 6 spooky HR words to find!', 'snap' => sprintf($found, 6), 'tag' => 'No tricks, just treats!', 'noun' => 'answer'],
        'november'  => ['name' => 'November',  'theme' => 'AI Future',                  'game' => 'Crossword',     'share' => false,
                        'headline' => 'Plan ahead, the future is here! 6 words to find!', 'snap' => $solved, 'tag' => 'See you in the future!', 'noun' => 'answer'],
        'december'  => ['name' => 'December',  'theme' => 'Christmas',                  'game' => 'Find the word', 'share' => true,
                        'headline' => 'Ho ho ho! 6 festive words to find!', 'snap' => sprintf($found, 6), 'tag' => 'Merry Christmas!', 'noun' => 'word search',
                        'share_h' => 'Spread the festive cheer! Share the link for a better chance to win!',
                        'share_p' => 'Pass the link to your colleagues and stand a higher chance to win a treat for the team.',
                        'wa' => 'Ho ho ho! Play the PeoplesHR Christmas word search, find 6 festive words and stand a chance to win a treat to share: ',
                        'play_step' => 'Find the words',
                        'play_from' => '<b>A colleague shared some Christmas cheer with you.</b> Play and enter the draw!',
                        'play_h' => '<span style="color:var(--orange)">Ho ho ho!</span> 6 festive words to find!',
                        'play_lede' => 'Tap the first letter of a word, then the last. Words run across, down, and one hides diagonally.',
                        'play_done' => 'All 6 found. Add your details to enter the draw.',
                        'play_label' => 'Played online (shared link)'],
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
 * the ID empty until the form exists: pages then send nothing (a ?preview
 * link runs the journey as a demo, a normal visit says entries open soon).
 * Form fields used: firstname, lastname, company, jobtitle, email, the file
 * field below, and the hidden fields
 * calendar_2027_month (e.g. "march") and calendar_2027_entry_type
 * ("photo" from the calendar, "online" from the shared game).
 */
const CAL27_HS_PORTAL = '45700506';
const CAL27_HS_FORM_ID = '';
/** The form's file upload field for the photo of the solved page (optional on
 *  the form, because online entries have no photo). */
const CAL27_HS_PHOTO_FIELD = 'calendar_2027_photo';

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
