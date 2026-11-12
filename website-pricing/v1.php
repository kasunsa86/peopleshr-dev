<?php
declare(strict_types=1);

// PHP 8 example. Run on the website server; keep the credential out of browser code.
$baseUrl = rtrim((string) getenv('WEBSITE_PRICING_API_BASE_URL'), '/');
$apiKey = (string) getenv('WEBSITE_PRICING_API_KEY');
if ($baseUrl === '' || $apiKey === '') {
    throw new RuntimeException('Set WEBSITE_PRICING_API_BASE_URL and WEBSITE_PRICING_API_KEY on the server.');
}

function pricingApiRequest(string $url, string $apiKey, ?array $body = null): array
{
    $headers = ['Accept: application/json', 'Authorization: Bearer ' . $apiKey];
    if ($body !== null) $headers[] = 'Content-Type: application/json';
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    if ($body !== null) {
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body, JSON_THROW_ON_ERROR));
    }
    $raw = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    if ($raw === false) {
        $message = curl_error($curl);
        curl_close($curl);
        throw new RuntimeException('Pricing API transport error: ' . $message);
    }
    curl_close($curl);
    $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    if ($status < 200 || $status >= 300) {
        $code = $decoded['error']['code'] ?? 'request_failed';
        $requestId = $decoded['error']['requestId'] ?? 'unavailable';
        throw new RuntimeException("Pricing API returned HTTP {$status} ({$code}); requestId={$requestId}");
    }
    return $decoded;
}

$region = 'LK';
$priceList = pricingApiRequest(
    $baseUrl . '/integrations/v1/website-pricing/price-list?region=' . rawurlencode($region),
    $apiKey
);
$availableTiers = [];
foreach (($priceList['data']['modules'] ?? []) as $module) {
    $availableTiers[$module['module']] = $module['tiers'] ?? [];
}
$modules = [];
foreach (['hr', 'time', 'pay'] as $moduleId) {
    if (empty($availableTiers[$moduleId])) {
        throw new RuntimeException("No tiers are currently available for {$moduleId} in {$region}.");
    }
    // Example only: choose the first currently returned tier; use the customer's actual selection in production.
    $modules[] = ['module' => $moduleId, 'tier' => $availableTiers[$moduleId][0]];
}
$result = pricingApiRequest($baseUrl . '/integrations/v1/website-pricing/price', $apiKey, [
    'region' => $region,
    'headcount' => 75,
    'modules' => $modules,
    'invoicingFrequency' => 'annual',
    'websiteQuoteReference' => 'DOCS-EXAMPLE-001',
]);
// Consume $result['data'] and retain $result['requestId'] for support correlation.
print_r($result);
