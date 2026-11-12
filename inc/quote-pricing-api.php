<?php
/**
 * Live quote: client for the Sales Portal Website Pricing API v1
 * (contract: website-pricing/v1.openapi.json). Server-side only; the
 * credential never reaches the browser.
 *
 * Settings (see inc/quote-config.php and inc/quote-secrets.php):
 *   - base URL: the WEBSITE_PRICING_API_BASE_URL environment variable, or
 *     'pricing_api_base_url' in quote-config.php. Includes the /api root,
 *     e.g. https://<host>/api.
 *   - credential: the WEBSITE_PRICING_API_KEY environment variable, or
 *     'pricing_api_key' in quote-secrets.php (git ignores that file).
 *   - 'pricing_api_mock' => true answers from inc/quote-pricing-mock.php
 *     instead of the network, using SAMPLE rates.
 *
 * Every call either returns the decoded response body or throws a
 * PhrPricingApiException carrying the API error code and requestId.
 */

class PhrPricingApiException extends RuntimeException
{
    public $apiCode;
    public $requestId;
    public $status;

    public function __construct(string $message, string $apiCode = 'request_failed', ?string $requestId = null, int $status = 0)
    {
        parent::__construct($message);
        $this->apiCode = $apiCode;
        $this->requestId = $requestId;
        $this->status = $status;
    }
}

// Resolves the API settings from the environment, config and secrets.
function phr_pricing_api_settings(array $config, array $secrets)
{
    $base = getenv('WEBSITE_PRICING_API_BASE_URL');
    $key = getenv('WEBSITE_PRICING_API_KEY');
    return [
        'base' => rtrim(trim((string) ($base !== false && $base !== '' ? $base : ($config['pricing_api_base_url'] ?? ''))), '/'),
        'key' => trim((string) ($key !== false && $key !== '' ? $key : ($secrets['pricing_api_key'] ?? ''))),
        'mock' => !empty($config['pricing_api_mock']),
        'timeout' => max(2, (int) ($config['pricing_api_timeout'] ?? 8)),
    ];
}

/**
 * One API call. $path is relative to the base URL, e.g.
 * '/integrations/v1/website-pricing/price-list?region=PH'. $body is sent as
 * JSON with POST. $requestId goes in X-Request-ID for support correlation.
 */
function phr_pricing_api_call(array $api, string $method, string $path, ?array $body = null, string $requestId = '')
{
    if ($api['mock']) {
        require_once __DIR__ . '/quote-pricing-mock.php';
        [$status, $decoded] = phr_pricing_mock_handle($method, $path, $body, $requestId);
    } else {
        if ($api['base'] === '' || $api['key'] === '') {
            throw new PhrPricingApiException('Pricing API base URL or credential is not configured.', 'not_configured');
        }
        if (!function_exists('curl_init')) {
            throw new PhrPricingApiException('PHP cURL extension is missing.', 'not_configured');
        }
        $headers = ['Accept: application/json', 'Authorization: Bearer ' . $api['key']];
        if ($requestId !== '') {
            $headers[] = 'X-Request-ID: ' . substr($requestId, 0, 128);
        }
        $ch = curl_init($api['base'] . $path);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_TIMEOUT => $api['timeout'],
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_FOLLOWLOCATION => false,
        ]);
        if ($method === 'POST') {
            $headers[] = 'Content-Type: application/json';
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $raw = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        if ($raw === false) {
            $err = curl_error($ch);
            throw new PhrPricingApiException('Pricing API transport error: ' . $err, 'transport_error');
        }
        $decoded = json_decode((string) $raw, true);
        if (!is_array($decoded)) {
            throw new PhrPricingApiException('Pricing API returned HTTP ' . $status . ' with a non-JSON body.', 'invalid_response', null, $status);
        }
    }

    if ($status < 200 || $status >= 300) {
        $code = (string) ($decoded['error']['code'] ?? 'request_failed');
        $rid = $decoded['error']['requestId'] ?? null;
        $details = '';
        foreach (($decoded['error']['details'] ?? []) as $d) {
            $details .= ' ' . ($d['path'] ?? '?') . ':' . ($d['code'] ?? '?');
        }
        throw new PhrPricingApiException('Pricing API returned HTTP ' . $status . ' (' . $code . ')' . $details, $code, $rid, $status);
    }
    if (!isset($decoded['data']) || !is_array($decoded['data'])) {
        throw new PhrPricingApiException('Pricing API response has no data.', 'invalid_response', $decoded['requestId'] ?? null, $status);
    }
    return $decoded;
}

function phr_pricing_api_price_list(array $api, string $region, string $requestId = '')
{
    return phr_pricing_api_call($api, 'GET', '/integrations/v1/website-pricing/price-list?region=' . rawurlencode($region), null, $requestId);
}

function phr_pricing_api_price(array $api, array $request, string $requestId = '')
{
    return phr_pricing_api_call($api, 'POST', '/integrations/v1/website-pricing/price', $request, $requestId);
}
