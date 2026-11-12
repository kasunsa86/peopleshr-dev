<?php
/**
 * Live quote: an in-process mock of the Website Pricing API v1, used while
 * 'pricing_api_mock' is true in inc/quote-config.php (until the live API
 * base URL and credential arrive). Responses follow the shapes in
 * website-pricing/v1.openapi.json.
 *
 * ALL FIGURES HERE ARE SAMPLE VALUES, not approved PeoplesHR rates: the USD
 * sample PEPM rates from the "PeoplesHR Sample Modular Pricing (USD)" sheet,
 * converted at rough sample exchange rates, plus made-up Professional
 * Services effort. Quotes priced by the mock are marked SAMPLE.
 */

const PHR_MOCK_REGIONS = [
    'PH' => ['name' => 'Philippines', 'currency' => 'PHP', 'fx' => 58, 'minimum' => 50],
    'LK' => ['name' => 'Sri Lanka', 'currency' => 'LKR', 'fx' => 300, 'minimum' => 50],
];

// USD per employee per month by tier (sample).
const PHR_MOCK_PEPM = [
    'hr'          => ['manage' => 2.00, 'grow' => 3.00, 'transform' => 4.50],
    'time'        => ['manage' => 1.00, 'grow' => 1.75, 'transform' => 2.50],
    'pay'         => ['manage' => 1.50, 'grow' => 2.25, 'transform' => 3.25],
    'talent'      => ['grow' => 1.75, 'transform' => 2.75],
    'engagement'  => ['manage' => 0.75, 'grow' => 1.25, 'transform' => 2.00],
    'recruitment' => ['grow' => 1.50, 'transform' => 2.50],
    'insights'    => ['manage' => 0.75, 'grow' => 1.50, 'transform' => 2.50],
];

// Professional Services effort days per module at Manage (sample); Grow x1.5, Transform x2.
const PHR_MOCK_PS_DAYS = ['hr' => 10, 'time' => 6, 'pay' => 8, 'talent' => 6, 'engagement' => 3, 'recruitment' => 4, 'insights' => 3];
const PHR_MOCK_PS_TIER = ['manage' => 1.0, 'grow' => 1.5, 'transform' => 2.0];
const PHR_MOCK_PS_RATE_USD = ['IE' => 250, 'BA' => 300, 'PM' => 350];
const PHR_MOCK_DISCOUNT = 5;

function phr_mock_error(int $status, string $code, string $message, string $rid, array $details = [])
{
    $error = ['code' => $code, 'message' => $message, 'requestId' => $rid];
    if ($details) {
        $error['details'] = $details;
    }
    return [$status, ['error' => $error]];
}

function phr_mock_versions()
{
    return ['subscriptionFormulaVersion' => 'mock-1', 'professionalServicesFormulaVersion' => 'mock-1', 'priceBookVersion' => 'mock-sample'];
}

// Returns [HTTP status, decoded body].
function phr_pricing_mock_handle(string $method, string $path, ?array $body, string $requestId)
{
    $rid = $requestId !== '' ? $requestId : 'mock-' . bin2hex(random_bytes(6));
    $url = parse_url($path);
    parse_str($url['query'] ?? '', $query);

    if ($method === 'GET' && $url['path'] === '/integrations/v1/website-pricing/price-list') {
        $region = PHR_MOCK_REGIONS[$query['region'] ?? ''] ?? null;
        if (!$region) {
            return phr_mock_error(422, 'validation_failed', 'Invalid region.', $rid, [['path' => 'region', 'code' => 'invalid_enum']]);
        }
        $modules = [];
        $rates = [];
        foreach (PHR_MOCK_PEPM as $id => $tiers) {
            $modules[] = ['module' => $id, 'tiers' => array_keys($tiers), 'required' => in_array($id, ['hr', 'time', 'pay'], true)];
            foreach ($tiers as $tier => $usd) {
                $rates[] = ['module' => $id, 'tier' => $tier, 'headcountBand' => 'all', 'ratePerEmployeeMonth' => round($usd * $region['fx'], 2)];
            }
        }
        $psRates = [];
        foreach (PHR_MOCK_PS_RATE_USD as $role => $usd) {
            $psRates[] = ['role' => $role, 'ratePerDay' => $usd * $region['fx']];
        }
        $v = phr_mock_versions();
        return [200, ['data' => [
            'region' => ['code' => $query['region'], 'name' => $region['name'], 'priceBookKey' => 'mock-' . strtolower($query['region'])],
            'currency' => $region['currency'],
            'priceBookVersion' => $v['priceBookVersion'],
            'subscriptionFormulaVersion' => $v['subscriptionFormulaVersion'],
            'professionalServicesFormulaVersion' => $v['professionalServicesFormulaVersion'],
            'proposalBuilderVersion' => 'mock-1',
            'minimumHeadcount' => $region['minimum'],
            'annualUpfrontDiscountPercent' => PHR_MOCK_DISCOUNT,
            'headcountBands' => [['key' => 'all', 'minimum' => 1, 'maximum' => null]],
            'modules' => $modules,
            'subscriptionRates' => $rates,
            'professionalServicesRates' => $psRates,
            'recruitmentAllowance' => 'Sample: 5 hiring managers included.',
        ], 'apiVersion' => '1.0.0', 'requestId' => $rid]];
    }

    if ($method === 'POST' && $url['path'] === '/integrations/v1/website-pricing/price') {
        $details = [];
        $region = PHR_MOCK_REGIONS[$body['region'] ?? ''] ?? null;
        if (!$region) {
            $details[] = ['path' => 'region', 'code' => 'invalid_enum'];
        }
        $headcount = $body['headcount'] ?? null;
        if (!is_int($headcount) || $headcount < 1 || $headcount > 1000000) {
            $details[] = ['path' => 'headcount', 'code' => 'out_of_range'];
        }
        if (($body['invoicingFrequency'] ?? '') !== 'annual') {
            $details[] = ['path' => 'invoicingFrequency', 'code' => 'invalid_enum'];
        }
        $seen = [];
        foreach (($body['modules'] ?? []) as $i => $m) {
            $id = $m['module'] ?? '';
            $tier = $m['tier'] ?? '';
            if (isset($seen[$id])) {
                $details[] = ['path' => "modules[$i].module", 'code' => 'duplicate_module'];
            } elseif (!isset(PHR_MOCK_PEPM[$id][$tier])) {
                $details[] = ['path' => "modules[$i].tier", 'code' => 'tier_unavailable'];
            }
            $seen[$id] = $tier;
        }
        foreach (['hr', 'time', 'pay'] as $id) {
            if (!isset($seen[$id])) {
                $details[] = ['path' => 'modules', 'code' => 'mandatory_module_missing'];
            }
        }
        if ($details) {
            return phr_mock_error(422, 'validation_failed', 'The request did not meet operation or pricing requirements.', $rid, $details);
        }

        $priced = max($headcount, $region['minimum']);
        $blended = array_sum(PHR_MOCK_PS_RATE_USD) / count(PHR_MOCK_PS_RATE_USD) * $region['fx'];
        $prices = [];
        $bundles = [];
        $subtotal = 0.0;
        $psTotal = 0.0;
        foreach ($seen as $id => $tier) {
            $annual = round(PHR_MOCK_PEPM[$id][$tier] * $region['fx'] * $priced * 12, 2);
            $subtotal += $annual;
            $prices[] = [
                'module' => $id, 'tier' => $tier, 'annualListAmount' => $annual,
                'allocatedHiringManagers' => $id === 'recruitment' ? 5 : null,
                'hiringManagerAllowanceApplied' => $id === 'recruitment' ? 5 : null,
            ];
            $days = round(PHR_MOCK_PS_DAYS[$id] * PHR_MOCK_PS_TIER[$tier] * (1 + min($priced, 5000) / 2500), 1);
            $amount = round($days * $blended, 2);
            $psTotal += $amount;
            $bundles[] = ['module' => $id, 'externalAmount' => $amount, 'effortDays' => $days, 'components' => [
                ['module' => $id . '-implementation', 'externalAmount' => $amount, 'effortDays' => $days],
            ]];
        }
        $discount = round($subtotal * PHR_MOCK_DISCOUNT / 100, 2);
        $annualTotal = round($subtotal - $discount, 2);
        return [200, ['data' => [
            'websiteQuoteReference' => $body['websiteQuoteReference'] ?? null,
            'submittedHeadcount' => $headcount,
            'pricedHeadcount' => $priced,
            'region' => ['code' => $body['region'], 'name' => $region['name'], 'priceBookKey' => 'mock-' . strtolower($body['region'])],
            'currency' => $region['currency'],
            'invoicingFrequency' => 'annual',
            'subscription' => [
                'modules' => $prices,
                'annualSubtotal' => round($subtotal, 2),
                'discounts' => [['type' => 'annual_upfront', 'percent' => PHR_MOCK_DISCOUNT, 'amount' => $discount]],
                'annualTotal' => $annualTotal,
                'monthlyEquivalent' => round($annualTotal / 12, 2),
            ],
            'professionalServices' => ['oneTimeTotal' => round($psTotal, 2), 'bundles' => $bundles],
            'firstYearTotal' => round($annualTotal + $psTotal, 2),
            'pricingVersion' => phr_mock_versions(),
            'requestId' => $rid,
            'tax' => ['included' => false, 'note' => 'Taxes are excluded.'],
        ], 'apiVersion' => '1.0.0', 'requestId' => $rid]];
    }

    return phr_mock_error(404, 'not_found', 'Unknown operation.', $rid);
}
