<?php
/**
 * Live quote: HubSpot CRM sync, used by quote-submit.php when a private app
 * token is set in inc/quote-secrets.php.
 *
 * For each request it:
 *   1. creates or updates the contact by email, with the package and
 *      answers in the "Live quote" contact properties below;
 *   2. uploads the quote PDF to File Manager (private, /live-quotes);
 *   3. adds a note with the PDF attached to the contact's timeline.
 * HubSpot itself (a workflow or form notification) then tells the SDR and
 * emails the customer; the SDR opens the PDF from the contact record.
 *
 * Private app scopes: crm.objects.contacts.read, crm.objects.contacts.write,
 * files, and crm.schemas.contacts.write (for the one-time property setup:
 * php inc/quote-hubspot-setup.php).
 */

require_once __DIR__ . '/quote-tiers.php';

const PHR_QUOTE_HS_GROUP = ['name' => 'live_quote', 'label' => 'Live quote'];
const PHR_QUOTE_HS_FOLDER = '/live-quotes';
// HubSpot-defined association type: note -> contact.
const PHR_QUOTE_HS_NOTE_TO_CONTACT = 202;

/**
 * Custom contact properties, name => [label, type, fieldType, description].
 * Tier properties are filled for every bundle: Manage, Grow, Transform or
 * "Not selected", so workflows and lists can filter on them.
 */
function phr_quote_hs_properties()
{
    $props = [
        'live_quote_ref'        => ['Live quote: reference', 'string', 'text', 'Reference of the latest website live quote, e.g. Q-261023-A97CB2.'],
        'live_quote_date'       => ['Live quote: submitted', 'string', 'text', 'When the latest live quote was submitted (UTC).'],
        'live_quote_industry'   => ['Live quote: industry', 'string', 'text', 'Q1 answer.'],
        'live_quote_employees'  => ['Live quote: employees', 'string', 'text', 'Q2 answer (number of employees).'],
        'live_quote_structure'  => ['Live quote: organization structure', 'string', 'textarea', 'Q3 answer.'],
        'live_quote_workforce'  => ['Live quote: work patterns', 'string', 'textarea', 'Q4 answer.'],
        'live_quote_payroll'    => ['Live quote: payroll requirements', 'string', 'textarea', 'Q5 answer.'],
        'live_quote_priorities' => ['Live quote: priorities', 'string', 'textarea', 'Q6 answers.'],
        'live_quote_addons'     => ['Live quote: professional services add-ons', 'string', 'textarea', 'Q7 answers: add-ons the customer asked for (not priced).'],
        'live_quote_package'    => ['Live quote: selected package', 'string', 'textarea', 'Modules and tiers the customer chose, one per line. Safe to show the customer.'],
        'live_quote_price_range' => ['Live quote: estimated price (INTERNAL)', 'string', 'text', 'Indicative price ranges: annual subscription, Professional Services and first-year total. Internal only: do not use in customer emails.'],
    ];
    foreach (PHR_QUOTE_BUNDLES as $id => $bundle) {
        $props['live_quote_tier_' . $id] = ['Live quote: ' . $bundle['name'] . ' tier', 'enumeration', 'select', 'Tier the customer chose for ' . $bundle['name'] . '.'];
    }
    return $props;
}

// Options for the tier enumeration properties.
function phr_quote_hs_tier_options()
{
    $options = [];
    foreach (array_merge(array_values(PHR_QUOTE_TIERS), ['Not selected']) as $i => $label) {
        $options[] = ['label' => $label, 'value' => $label, 'displayOrder' => $i];
    }
    return $options;
}

/**
 * Calls the HubSpot API. $body is an array (sent as JSON) or, for uploads,
 * a multipart array for CURLOPT_POSTFIELDS. Returns [status, decoded body].
 */
function phr_quote_hs_call(array $hs, $method, $path, $body = null, $multipart = false)
{
    $ch = curl_init(rtrim($hs['base'], '/') . $path);
    $headers = ['Authorization: Bearer ' . $hs['token']];
    if ($body !== null && !$multipart) {
        $headers[] = 'Content-Type: application/json';
        $body = json_encode($body);
    }
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    return [$status, json_decode((string) $raw, true), (string) $raw];
}

/**
 * Syncs one quote request. $q: 'ref', 'submitted', 'contact' (firstName,
 * lastName, email, company, phone), 'answers' (question id => answer text),
 * 'rows' (from phr_quote_apply_choices()), 'price_range', 'note_html',
 * 'pdf' (['name', 'data'] or null).
 * Returns the contact id, or null if the contact could not be saved (the
 * PDF and note are best effort and only logged on failure).
 */
function phr_quote_hs_sync(array $hs, array $q)
{
    $c = $q['contact'];
    $package = [];
    $props = [
        'email' => $c['email'],
        'firstname' => $c['firstName'],
        'lastname' => $c['lastName'],
        'company' => $c['company'],
        'phone' => $c['phone'],
        'live_quote_ref' => $q['ref'],
        'live_quote_date' => $q['submitted'],
        'live_quote_price_range' => $q['price_range'],
    ];
    foreach ($q['answers'] as $id => $text) {
        $props['live_quote_' . $id] = $text;
    }
    foreach ($q['rows'] as $id => $row) {
        $props['live_quote_tier_' . $id] = $row['included'] ? $row['tier'] : 'Not selected';
        if ($row['included']) {
            $package[] = $row['name'] . ': ' . $row['tier'];
        }
    }
    $props['live_quote_package'] = implode("\n", $package);

    [$status, $res, $raw] = phr_quote_hs_call($hs, 'POST', '/crm/v3/objects/contacts/batch/upsert', [
        'inputs' => [['idProperty' => 'email', 'id' => $c['email'], 'properties' => $props]],
    ]);
    $contactId = $res['results'][0]['id'] ?? null;
    if ($status < 200 || $status >= 300 || !$contactId) {
        error_log('quote-hubspot: contact upsert failed (' . $status . '): ' . substr($raw, 0, 500));
        return null;
    }

    $attachment = '';
    if (!empty($q['pdf'])) {
        $tmp = tempnam(sys_get_temp_dir(), 'phrq');
        file_put_contents($tmp, $q['pdf']['data']);
        [$status, $res, $raw] = phr_quote_hs_call($hs, 'POST', '/files/v3/files', [
            'file' => new CURLFile($tmp, 'application/pdf', $q['pdf']['name']),
            'fileName' => $q['pdf']['name'],
            'folderPath' => PHR_QUOTE_HS_FOLDER,
            'options' => json_encode(['access' => 'PRIVATE', 'overwrite' => false]),
        ], true);
        @unlink($tmp);
        if ($status >= 200 && $status < 300 && !empty($res['id'])) {
            $attachment = (string) $res['id'];
        } else {
            error_log('quote-hubspot: PDF upload failed (' . $status . '): ' . substr($raw, 0, 500));
        }
    }

    $noteProps = ['hs_timestamp' => (string) round(microtime(true) * 1000), 'hs_note_body' => $q['note_html']];
    if ($attachment !== '') {
        $noteProps['hs_attachment_ids'] = $attachment;
    }
    [$status, , $raw] = phr_quote_hs_call($hs, 'POST', '/crm/v3/objects/notes', [
        'properties' => $noteProps,
        'associations' => [[
            'to' => ['id' => $contactId],
            'types' => [['associationCategory' => 'HUBSPOT_DEFINED', 'associationTypeId' => PHR_QUOTE_HS_NOTE_TO_CONTACT]],
        ]],
    ]);
    if ($status < 200 || $status >= 300) {
        error_log('quote-hubspot: note failed (' . $status . '): ' . substr($raw, 0, 500));
    }
    return $contactId;
}
