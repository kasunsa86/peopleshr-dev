<?php
/**
 * Live quote endpoint, called by js/request-a-quote.js.
 *
 * With "action": "recommend", returns the recommended tier per bundle for
 * the package step and stops there.
 *
 * Otherwise takes the answers, the visitor's package choices and contact
 * details as JSON, prices the chosen package through the Website Pricing
 * API (inc/quote-pricing.php; PH or LK price book by visitor country) and
 * builds the quote PDF, then, depending on the settings:
 *   - HubSpot: saves the contact with the package and answers, and attaches
 *     the PDF as a note (inc/quote-hubspot.php);
 *   - SDR email: emails the SDR the quote with the PDF attached;
 *   - customer email: emails the visitor their package and answers.
 * The visitor never sees prices; the SDR follows up.
 *
 * Settings: inc/quote-config.php and inc/quote-secrets.php.
 */
declare(strict_types=1);

require_once __DIR__ . '/inc/geo.php';
require_once __DIR__ . '/inc/quote-tiers.php';
require_once __DIR__ . '/inc/quote-pricing.php';
$config = require __DIR__ . '/inc/quote-config.php';
$secrets = is_readable(__DIR__ . '/inc/quote-secrets.php') ? require __DIR__ . '/inc/quote-secrets.php' : [];
$hs = ['token' => trim((string) ($secrets['hubspot_token'] ?? '')), 'base' => (string) $config['hubspot_api_base']];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function rq_respond(int $status, array $body)
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function rq_fail(int $status, string $message)
{
    rq_respond($status, ['ok' => false, 'error' => $message]);
}

// One line of plain text: no control characters, collapsed spaces, capped length.
function rq_line($value, int $max)
{
    if (!is_string($value)) {
        return '';
    }
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    $value = trim(preg_replace('/\s+/u', ' ', $value) ?? '');
    return mb_substr($value, 0, $max);
}

function rq_h($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

// Sends a plain-text + HTML email from the configured sender.
// $attachments: list of ['name' => 'file.pdf', 'type' => 'application/pdf', 'data' => bytes].
function rq_send_mail(array $config, string $to, string $replyTo, string $subject, string $text, string $html, array $attachments = [])
{
    $alt = 'phrq_' . bin2hex(random_bytes(12));
    $body = "--$alt\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($text))
        . "--$alt\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($html))
        . "--$alt--\r\n";
    $type = 'multipart/alternative; boundary="' . $alt . '"';

    if ($attachments) {
        $mixed = 'phrm_' . bin2hex(random_bytes(12));
        $body = "--$mixed\r\nContent-Type: $type\r\n\r\n" . $body;
        foreach ($attachments as $file) {
            $body .= "--$mixed\r\nContent-Type: {$file['type']}; name=\"{$file['name']}\"\r\n"
                . "Content-Disposition: attachment; filename=\"{$file['name']}\"\r\n"
                . "Content-Transfer-Encoding: base64\r\n\r\n"
                . chunk_split(base64_encode($file['data']));
        }
        $body .= "--$mixed--\r\n";
        $type = 'multipart/mixed; boundary="' . $mixed . '"';
    }

    $fromEmail = (string) $config['from_email'];
    $domain = substr((string) strrchr($fromEmail, '@'), 1);
    $headers = [
        'Date: ' . date('r'),
        'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . $domain . '>',
        'MIME-Version: 1.0',
        'Content-Type: ' . $type,
        'From: ' . mb_encode_mimeheader((string) $config['from_name'], 'UTF-8') . ' <' . $fromEmail . '>',
        'Reply-To: ' . $replyTo,
    ];
    return mail($to, mb_encode_mimeheader($subject, 'UTF-8'), $body, implode("\r\n", $headers), '-f' . $fromEmail);
}

// SDR-facing note for a package row: status, and what the customer changed.
function rq_package_note(array $row)
{
    if (!$row['included']) {
        $note = 'Not selected (Nice-to-Have; recommended tier ' . $row['recommended_tier'] . ')';
    } elseif ($row['status'] === 'Nice-to-Have') {
        $note = 'Nice-to-Have, added by customer';
    } else {
        $note = $row['status'];
    }
    if ($row['changed']) {
        $note .= '; customer changed from ' . $row['recommended_tier'] . ' (recommended)';
    }
    if ($row['signal']) {
        $note .= '; flagged as a priority';
    }
    if (!empty($row['tier_note'])) {
        $note .= '; ' . $row['tier_note'];
    }
    return $note;
}

// Visitor country: the phr_geo cookie set by /geo-lookup.php, else an IP lookup.
function rq_visitor_country()
{
    global $phrSupportedCountries;
    $cookie = strtoupper((string) ($_COOKIE['phr_geo'] ?? ''));
    if (in_array($cookie, $phrSupportedCountries, true)) {
        return $cookie;
    }
    if ($cookie === 'NONE') {
        return null;
    }
    return phr_geo_detect();
}

// Price summary for the SDR: [label, value] pairs, and notes.
function rq_price_summary(array $price)
{
    $cur = $price['currency'];
    if (!$price['ok']) {
        return [[['Estimated price', 'Not available']], [$price['error'], phr_quote_region_note($price)]];
    }
    $sub = 'Annual subscription';
    if ($price['discount']) {
        $sub .= ' (after ' . rtrim(rtrim(number_format($price['discount']['percent'], 2), '0'), '.') . '% annual-upfront discount)';
    }
    $lines = [
        [$sub, phr_quote_format_range($price['total_annual'], $cur) . ' / year'],
        ['Professional Services (one-time)', phr_quote_format_range($price['ps_one_time'], $cur)],
        ['First-year total', phr_quote_format_range($price['first_year'], $cur)],
    ];
    $notes = [];
    if ($price['mock']) {
        $notes[] = 'SAMPLE pricing from the built-in mock, not approved rates.';
    }
    $notes[] = phr_quote_region_note($price);
    if ($price['priced_headcount'] !== $price['headcount']) {
        $notes[] = 'Priced at ' . number_format($price['priced_headcount']) . ' employees, the regional minimum (customer entered ' . number_format($price['headcount']) . ').';
    }
    $notes[] = 'Ranges are ±' . round(PHR_QUOTE_RANGE * 100) . '% around the Sales Portal price. Taxes excluded.';
    return [$lines, $notes];
}

// Allows $limit submissions per IP per hour, tracked in the system temp dir.
function rq_rate_limited(string $ip, int $limit)
{
    $dir = sys_get_temp_dir() . '/phr-quote-rate';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return false;
    }
    $file = $dir . '/' . hash('sha256', $ip);
    $now = time();
    $hits = [];
    if (is_readable($file)) {
        foreach (explode("\n", (string) file_get_contents($file)) as $t) {
            if ((int) $t > $now - 3600) {
                $hits[] = (int) $t;
            }
        }
    }
    if (count($hits) >= $limit) {
        return true;
    }
    $hits[] = $now;
    @file_put_contents($file, implode("\n", $hits), LOCK_EX);
    return false;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    rq_fail(405, 'Method not allowed.');
}

$body = file_get_contents('php://input', false, null, 0, 20000);
$input = json_decode((string) $body, true);
if (!is_array($input)) {
    rq_fail(400, 'Invalid request.');
}

// Honeypot: a hidden field people never fill in. Pretend success so bots move on.
if (!empty($input['website'])) {
    rq_respond(200, ['ok' => true]);
}

$answers = phr_quote_clean_answers($input['answers'] ?? null);
if ($answers === null) {
    rq_fail(422, 'Please answer every question before submitting.');
}

// Package step: return the recommended tier per bundle (no prices, no email).
if (($input['action'] ?? '') === 'recommend') {
    $package = [];
    foreach (phr_quote_recommend($answers) as $id => $row) {
        $package[$id] = ['rank' => $row['rank'], 'required' => $row['status'] !== 'Nice-to-Have'];
    }
    rq_respond(200, ['ok' => true, 'package' => $package]);
}

$contact = $input['contact'] ?? [];
if (!is_array($contact)) {
    $contact = [];
}
$firstName = rq_line($contact['firstName'] ?? '', 80);
$lastName = rq_line($contact['lastName'] ?? '', 80);
$email = rq_line($contact['email'] ?? '', 160);
$company = rq_line($contact['company'] ?? '', 160);
$phone = rq_line($contact['phone'] ?? '', 40);

if ($firstName === '' || $lastName === '' || $company === '') {
    rq_fail(422, 'Please enter your name and organization.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    rq_fail(422, 'Please enter a valid email address.');
}
if (!preg_match('/^\+?[0-9 ().\-]{7,30}$/', $phone) || preg_match_all('/[0-9]/', $phone) < 7) {
    rq_fail(422, 'Please enter a valid phone number.');
}

$sdrEmail = trim((string) ($config['sdr_email'] ?? ''));
if ($sdrEmail === '' && $hs['token'] === '') {
    error_log('quote-submit.php: set sdr_email in inc/quote-config.php or hubspot_token in inc/quote-secrets.php');
    rq_fail(500, 'We could not send your request. Please try again later.');
}

$ip = peopleshr_visitor_ip();
if ($ip !== '' && rq_rate_limited($ip, (int) ($config['rate_limit_per_hour'] ?? 5))) {
    rq_fail(429, 'Too many requests. Please try again later.');
}

$questions = phr_quote_questions();
$rows = phr_quote_apply_choices(phr_quote_recommend($answers), $input['package'] ?? null);
if ($rows === null) {
    rq_fail(422, 'Please check your package selection.');
}
$pageUrl = rq_line($input['pageUrl'] ?? '', 300);
$submitted = gmdate('Y-m-d H:i') . ' UTC';

// Answers as [question title, answer text], in questionnaire order, and
// answer text by question id (for HubSpot).
$answerLines = [];
$answerTexts = [];
foreach ($questions as $id => $q) {
    if ($q['type'] === 'multi') {
        $labels = array_map(function ($key) use ($q) {
            return $q['options'][$key]['label'];
        }, $answers[$id]);
        $text = $labels ? implode('; ', $labels) : 'None selected';
    } elseif ($q['type'] === 'number') {
        $text = number_format($answers[$id]);
    } else {
        $text = $q['options'][$answers[$id]]['label'];
    }
    $answerLines[] = [$q['title'], $text];
    $answerTexts[$id] = $text;
}

$fullName = $firstName . ' ' . $lastName;
$ref = 'Q-' . gmdate('ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
$price = phr_quote_price($answers, $rows, phr_pricing_api_settings($config, $secrets), rq_visitor_country(), $ref);
[$priceLines, $priceNotes] = rq_price_summary($price);
foreach ($rows as $id => $row) {
    $rows[$id]['tier_note'] = $price['modules'][$id]['tier_note'];
}
// Professional Services add-ons (Q7): listed for the SDR, never priced.
$addons = array_map(function ($key) use ($questions) {
    return $questions['addons']['options'][$key]['label'];
}, $answers['addons']);
$addonsNote = $addons
    ? 'Professional Services add-ons requested: ' . implode('; ', $addons) . '. Not in the figures above; scope and price them in follow-up.'
    : 'No Professional Services add-ons requested.';
$priceNotes[] = $addonsNote;

// ------------------------------------------------------------------ SDR PDF
// If the PDF fails, the SDR still gets the email with the price ranges.

$attachments = [];
try {
    require_once __DIR__ . '/inc/quote-pdf.php';
    $signals = [];
    foreach ($rows as $row) {
        if ($row['signal']) {
            $signals[] = $row['name'];
        }
    }
    $attachments[] = [
        'name' => 'PeoplesHR-quote-' . $ref . '.pdf',
        'type' => 'application/pdf',
        'data' => phr_quote_pdf([
            'ref' => $ref,
            'date' => gmdate('j M Y'),
            'contact' => ['name' => $fullName, 'email' => $email, 'company' => $company, 'phone' => $phone],
            'answers' => $answerLines,
            'price' => $price,
            'price_notes' => $priceNotes,
            'addons' => $addons,
            'addons_note' => $addonsNote,
            'signals' => $signals,
        ]),
    ];
} catch (\Throwable $e) {
    error_log('quote-submit.php: quote PDF failed: ' . $e->getMessage());
}

// ---------------------------------------------------------------- SDR email

$subject = 'Live quote request ' . $ref . ': ' . $company . ' (' . $fullName . ')';
$pdfNote = $attachments ? 'Full quote attached as a PDF.' : 'The quote PDF could not be generated; see the server error log.';
$sampleNote = $price['mock'] ? ' (SAMPLE pricing, not approved rates)' : '';

$text = "New live quote request from the website. Ref: $ref\n\n";
$text .= "ESTIMATED PRICE$sampleNote\n";
foreach ($priceLines as $line) {
    $text .= $line[0] . ': ' . $line[1] . "\n";
}
$text .= implode("\n", $priceNotes) . "\n$pdfNote\n\n";
$text .= "CONTACT\n";
$text .= "Name: $fullName\nEmail: $email\nOrganization: $company\nPhone: $phone\nSubmitted: $submitted\n\n";
$text .= "SELECTED PACKAGE (customer's final choice)\n";
foreach ($rows as $row) {
    $text .= sprintf("%-12s %-10s %s\n", $row['name'], $row['included'] ? $row['tier'] : '-', rq_package_note($row));
}
$text .= "\nANSWERS\n";
foreach ($answerLines as $i => $line) {
    $text .= 'Q' . ($i + 1) . '. ' . $line[0] . "\n   " . $line[1] . "\n";
}
$text .= "\nThe customer was told a sales representative will contact them for additional information.\n";

$tierColors = ['Manage' => '#059669', 'Grow' => '#2563EB', 'Transform' => '#7C3AED'];
$cell = 'padding:8px 12px;border-bottom:1px solid #E7EAF0;text-align:left;vertical-align:top';
$html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#0F1C2E;max-width:680px">';
$html .= '<h2 style="margin:0 0 4px">New live quote request</h2>';
$html .= '<p style="margin:0 0 20px;color:#64748B">Ref ' . rq_h($ref) . ' &middot; Submitted ' . rq_h($submitted) . '</p>';
$html .= '<div style="background:#EEF3FB;border:1px solid #C9D6EE;border-radius:8px;padding:14px 16px;margin-bottom:24px">'
    . '<div style="color:#64748B;font-size:13px;margin-bottom:6px">Estimated price' . rq_h($sampleNote) . '</div><table style="border-collapse:collapse;width:100%">';
foreach ($priceLines as $i => $line) {
    $last = $i === count($priceLines) - 1;
    $html .= '<tr><td style="padding:3px 0;color:#0F1C2E">' . rq_h($line[0]) . '</td><td style="padding:3px 0;text-align:right;white-space:nowrap;font-weight:bold;color:#14284B' . ($last ? ';font-size:18px' : '') . '">' . rq_h($line[1]) . '</td></tr>';
}
$html .= '</table><div style="color:#64748B;font-size:13px;margin-top:6px">' . implode('<br>', array_map('rq_h', $priceNotes)) . '<br>' . rq_h($pdfNote) . '</div></div>';
$html .= '<h3 style="margin:0 0 8px">Contact</h3><table style="border-collapse:collapse;width:100%;margin-bottom:24px">';
foreach ([['Name', rq_h($fullName)], ['Email', '<a href="mailto:' . rq_h($email) . '">' . rq_h($email) . '</a>'], ['Organization', rq_h($company)], ['Phone', rq_h($phone)]] as $c) {
    $html .= '<tr><th style="' . $cell . ';width:140px;color:#64748B;font-weight:normal">' . $c[0] . '</th><td style="' . $cell . '">' . $c[1] . '</td></tr>';
}
$html .= '</table>';
$html .= '<h3 style="margin:0 0 8px">Selected package <span style="font-weight:normal;color:#64748B">(customer\'s final choice)</span></h3><table style="border-collapse:collapse;width:100%;margin-bottom:24px">';
$html .= '<tr><th style="' . $cell . '">Bundle</th><th style="' . $cell . '">Tier</th><th style="' . $cell . '">Notes</th></tr>';
foreach ($rows as $row) {
    $html .= '<tr><td style="' . $cell . ';font-weight:bold' . ($row['included'] ? '' : ';color:#94A3B8') . '">' . rq_h($row['name']) . '</td>'
        . ($row['included']
            ? '<td style="' . $cell . ';color:' . $tierColors[$row['tier']] . ';font-weight:bold">' . rq_h($row['tier']) . '</td>'
            : '<td style="' . $cell . ';color:#94A3B8">&ndash;</td>')
        . '<td style="' . $cell . ($row['changed'] ? ';color:#B45309' : '') . '">' . rq_h(rq_package_note($row)) . '</td></tr>';
}
$html .= '</table>';
$html .= '<h3 style="margin:0 0 8px">Answers</h3><table style="border-collapse:collapse;width:100%;margin-bottom:24px">';
foreach ($answerLines as $i => $line) {
    $html .= '<tr><td style="' . $cell . ';color:#64748B;width:45%">Q' . ($i + 1) . '. ' . rq_h($line[0]) . '</td><td style="' . $cell . '">' . rq_h($line[1]) . '</td></tr>';
}
$html .= '</table>';
$html .= '<p style="color:#64748B">The customer was told a sales representative will contact them for additional information.</p></div>';

// ------------------------------------------------------------- HubSpot CRM

$delivered = false;
if ($hs['token'] !== '' && function_exists('curl_init')) {
    require_once __DIR__ . '/inc/quote-hubspot.php';
    $noteHtml = '<p><strong>Live quote ' . rq_h($ref) . '</strong> from the website</p><p>';
    foreach ($priceLines as $line) {
        $noteHtml .= rq_h($line[0]) . ': <strong>' . rq_h($line[1]) . '</strong><br>';
    }
    $noteHtml .= implode('<br>', array_map('rq_h', $priceNotes)) . '</p><p>';
    foreach ($rows as $row) {
        $noteHtml .= rq_h($row['name'] . ': ' . ($row['included'] ? $row['tier'] : 'not selected') . ' (' . rq_package_note($row) . ')') . '<br>';
    }
    $noteHtml .= '</p><p>' . ($attachments ? 'Full quote PDF attached.' : 'The quote PDF could not be generated.') . '</p>';
    $delivered = phr_quote_hs_sync($hs, [
        'ref' => $ref,
        'submitted' => $submitted,
        'contact' => ['firstName' => $firstName, 'lastName' => $lastName, 'email' => $email, 'company' => $company, 'phone' => $phone],
        'answers' => $answerTexts,
        'rows' => $rows,
        'price_range' => implode('; ', array_map(function ($line) {
            return $line[0] . ': ' . $line[1];
        }, $priceLines)) . $sampleNote,
        'note_html' => $noteHtml,
        'pdf' => $attachments ? $attachments[0] : null,
    ]) !== null;
}

// --------------------------------------------------------------- SDR email

// $email passed FILTER_VALIDATE_EMAIL, which rejects line breaks.
if ($sdrEmail !== '') {
    if (rq_send_mail($config, $sdrEmail, $email, $subject, $text, $html, $attachments)) {
        $delivered = true;
    } else {
        error_log('quote-submit.php: SDR mail() failed for ' . $email);
    }
}
if (!$delivered) {
    rq_fail(500, 'We could not send your request. Please try again later.');
}

// ----------------------------------------------------------- customer email
// A copy of their package and answers, no prices. Replies go to the SDR.

$sdrReplyTo = $sdrEmail !== '' ? trim(explode(',', $sdrEmail)[0]) : (string) $config['from_email'];
$cSubject = 'Your PeoplesHR quote request';

$cText = "Hi $firstName,\n\n"
    . "Thank you for requesting a live quote from PeoplesHR. A representative of our sales team will get in touch with you to obtain some additional information for your quote.\n\n"
    . "Here is a copy of what you sent us. If anything needs changing, just reply to this email.\n\n"
    . "YOUR SELECTED PACKAGE\n";
foreach ($rows as $row) {
    if ($row['included']) {
        $cText .= $row['name'] . ': ' . $row['tier'] . "\n";
    }
}
$cText .= "\nYOUR ANSWERS\n";
foreach ($answerLines as $i => $line) {
    $cText .= 'Q' . ($i + 1) . '. ' . $line[0] . "\n   " . $line[1] . "\n";
}
$cText .= "\nYOUR DETAILS\nName: $fullName\nEmail: $email\nOrganization: $company\nPhone: $phone\n\n"
    . "The PeoplesHR team\nhttps://peopleshr.com/\n";

$cHtml = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.55;color:#0F1C2E;max-width:640px">';
$cHtml .= '<p style="margin:0 0 16px">Hi ' . rq_h($firstName) . ',</p>';
$cHtml .= '<p style="margin:0 0 16px">Thank you for requesting a live quote from PeoplesHR. A representative of our sales team will get in touch with you to obtain some additional information for your quote.</p>';
$cHtml .= '<p style="margin:0 0 24px">Here is a copy of what you sent us. If anything needs changing, just reply to this email.</p>';
$cHtml .= '<h3 style="margin:0 0 8px">Your selected package</h3><table style="border-collapse:collapse;width:100%;margin-bottom:24px">';
foreach ($rows as $row) {
    if ($row['included']) {
        $cHtml .= '<tr><td style="' . $cell . ';font-weight:bold;width:140px">' . rq_h($row['name']) . '</td><td style="' . $cell . ';color:' . $tierColors[$row['tier']] . ';font-weight:bold">' . rq_h($row['tier']) . '</td></tr>';
    }
}
$cHtml .= '</table>';
$cHtml .= '<h3 style="margin:0 0 8px">Your answers</h3><table style="border-collapse:collapse;width:100%;margin-bottom:24px">';
foreach ($answerLines as $i => $line) {
    $cHtml .= '<tr><td style="' . $cell . ';color:#64748B;width:45%">Q' . ($i + 1) . '. ' . rq_h($line[0]) . '</td><td style="' . $cell . '">' . rq_h($line[1]) . '</td></tr>';
}
$cHtml .= '</table>';
$cHtml .= '<h3 style="margin:0 0 8px">Your details</h3><table style="border-collapse:collapse;width:100%;margin-bottom:24px">';
foreach ([['Name', $fullName], ['Email', $email], ['Organization', $company], ['Phone', $phone]] as $c) {
    $cHtml .= '<tr><th style="' . $cell . ';width:140px;color:#64748B;font-weight:normal">' . $c[0] . '</th><td style="' . $cell . '">' . rq_h($c[1]) . '</td></tr>';
}
$cHtml .= '</table>';
$cHtml .= '<p style="margin:0">The PeoplesHR team<br><a href="https://peopleshr.com/" style="color:#2563EB">peopleshr.com</a></p></div>';

// With 'hubspot', a HubSpot workflow sends it from the contact properties.
if (($config['customer_email_via'] ?? 'server') === 'server' && !rq_send_mail($config, $email, $sdrReplyTo, $cSubject, $cText, $cHtml)) {
    // The SDR already has the request, so the visitor still gets a success.
    error_log('quote-submit.php: customer mail() failed for ' . $email);
}

// ------------------------------------------------ HubSpot form (optional)
// Adds page/cookie attribution and can trigger form-based workflows. Runs
// after the CRM sync, so the Live quote properties are already set.

$formGuid = trim((string) ($config['hubspot_form_guid'] ?? ''));
if ($formGuid !== '' && function_exists('curl_init')) {
    $context = ['pageUri' => $pageUrl, 'pageName' => 'Request a Live Quote'];
    $hutk = rq_line($input['hutk'] ?? '', 64);
    if ($hutk !== '') {
        $context['hutk'] = $hutk;
    }
    if ($ip !== '') {
        $context['ipAddress'] = $ip;
    }
    $payload = [
        'fields' => [
            ['name' => 'email', 'value' => $email],
            ['name' => 'firstname', 'value' => $firstName],
            ['name' => 'lastname', 'value' => $lastName],
            ['name' => 'company', 'value' => $company],
            ['name' => 'phone', 'value' => $phone],
        ],
        'context' => $context,
    ];
    $ch = curl_init('https://api.hsforms.com/submissions/v3/integration/submit/'
        . rawurlencode((string) $config['hubspot_portal_id']) . '/' . rawurlencode($formGuid));
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    $hsBody = curl_exec($ch);
    $hsStatus = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    if ($hsStatus < 200 || $hsStatus >= 300) {
        // The request already reached sales, so the visitor still gets a success.
        error_log('quote-submit.php: HubSpot form submit failed (' . $hsStatus . '): ' . substr((string) $hsBody, 0, 500));
    }
}

rq_respond(200, ['ok' => true]);
