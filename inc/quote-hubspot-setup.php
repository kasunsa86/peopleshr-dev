<?php
/**
 * One-time HubSpot setup for the live quote: creates the "Live quote"
 * contact property group and properties (inc/quote-hubspot.php). Safe to
 * re-run; existing ones are left alone. Command line only:
 *
 *   php inc/quote-hubspot-setup.php
 *
 * Uses hubspot_token from inc/quote-secrets.php.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/quote-hubspot.php';
$config = require __DIR__ . '/quote-config.php';
$secrets = is_readable(__DIR__ . '/quote-secrets.php') ? require __DIR__ . '/quote-secrets.php' : [];
$hs = ['token' => trim((string) ($secrets['hubspot_token'] ?? '')), 'base' => $config['hubspot_api_base']];
if ($hs['token'] === '') {
    fwrite(STDERR, "Set hubspot_token in inc/quote-secrets.php first.\n");
    exit(1);
}

function setup_result($what, array $result)
{
    [$status, $res, $raw] = $result;
    if ($status >= 200 && $status < 300) {
        echo "created  $what\n";
    } elseif ($status === 409) {
        echo "exists   $what\n";
    } else {
        echo "FAILED   $what ($status): " . ($res['message'] ?? substr($raw, 0, 300)) . "\n";
        return false;
    }
    return true;
}

$ok = setup_result('group ' . PHR_QUOTE_HS_GROUP['name'], phr_quote_hs_call($hs, 'POST', '/crm/v3/properties/contacts/groups', [
    'name' => PHR_QUOTE_HS_GROUP['name'],
    'label' => PHR_QUOTE_HS_GROUP['label'],
]));

foreach (phr_quote_hs_properties() as $name => [$label, $type, $fieldType, $description]) {
    $body = [
        'name' => $name,
        'label' => $label,
        'type' => $type,
        'fieldType' => $fieldType,
        'groupName' => PHR_QUOTE_HS_GROUP['name'],
        'description' => $description,
    ];
    if ($type === 'enumeration') {
        $body['options'] = phr_quote_hs_tier_options();
    }
    $ok = setup_result("property $name", phr_quote_hs_call($hs, 'POST', '/crm/v3/properties/contacts', $body)) && $ok;
}

exit($ok ? 0 : 1);
