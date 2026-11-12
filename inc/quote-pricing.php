<?php
/**
 * Live quote: prices the visitor's package through the Sales Portal Website
 * Pricing API (inc/quote-pricing-api.php), for the SDR's PDF, email and
 * HubSpot note. Server-side only; nothing here reaches the browser.
 *
 * Quote rules:
 *   - Region: the API prices PH (Philippines) and LK (Sri Lanka). Visitors
 *     from anywhere else are priced with PHR_QUOTE_FALLBACK_REGION, and the
 *     SDR is told so.
 *   - Tiers: a tier the region does not offer for a module is priced at the
 *     next tier up (or the highest offered), and the SDR is told so.
 *   - The modules and tiers the visitor chose make up the total. Modules left
 *     out are listed as optional extras at the recommended tier, priced by a
 *     second API call; they are not in the total.
 *   - A quote is never a single figure: every amount is a range of
 *     -PHR_QUOTE_RANGE to +PHR_QUOTE_RANGE around the API amount, rounded to
 *     PHR_QUOTE_ROUND_DIGITS significant digits (low end down, high end up;
 *     16,200 -> 16,000; 24,300 -> 25,000). Totals come from the exact API
 *     totals, not the sum of rounded ranges.
 *   - Shown: subscription per module (annual list), the annual-upfront
 *     discount and annual subscription total (annual only: the API's
 *     monthlyEquivalent is never shown),
 *     Professional Services (one-time) and the first-year total. Taxes are
 *     excluded, as the API states.
 *   - If the API fails, the quote still reaches the SDR without prices and
 *     with the reason ('error').
 */

require_once __DIR__ . '/quote-tiers.php';
require_once __DIR__ . '/quote-pricing-api.php';

const PHR_QUOTE_REGIONS = ['PH' => 'Philippines', 'LK' => 'Sri Lanka'];
const PHR_QUOTE_FALLBACK_REGION = 'PH';
const PHR_QUOTE_RANGE = 0.20;
const PHR_QUOTE_ROUND_DIGITS = 2;

// API tier ids by rank (1 Manage, 2 Grow, 3 Transform).
const PHR_QUOTE_API_TIERS = [1 => 'manage', 2 => 'grow', 3 => 'transform'];

// Rounds $value down ($up false) or up to PHR_QUOTE_ROUND_DIGITS significant digits.
function phr_quote_round_sig($value, $up)
{
    if ($value <= 0) {
        return 0;
    }
    $step = 10 ** (floor(log10($value)) - (PHR_QUOTE_ROUND_DIGITS - 1));
    // round() strips float noise such as 18.000000001 before floor/ceil.
    $units = round($value / $step, 6);
    return ($up ? ceil($units) : floor($units)) * $step;
}

// [low, high] range around $value.
function phr_quote_range($value)
{
    return [
        phr_quote_round_sig($value * (1 - PHR_QUOTE_RANGE), false),
        phr_quote_round_sig($value * (1 + PHR_QUOTE_RANGE), true),
    ];
}

// API region for a visitor country (ISO code or null).
function phr_quote_region_for($country)
{
    return isset(PHR_QUOTE_REGIONS[$country]) ? $country : PHR_QUOTE_FALLBACK_REGION;
}

// Rank to price at, given the API tiers offered for the module: the chosen
// rank if offered, else the next one up, else the highest offered. 0 if none.
function phr_quote_offered_rank(int $rank, array $offered)
{
    $ranks = [];
    foreach (PHR_QUOTE_API_TIERS as $r => $tier) {
        if (in_array($tier, $offered, true)) {
            $ranks[] = $r;
        }
    }
    if (!$ranks) {
        return 0;
    }
    foreach ($ranks as $r) {
        if ($r >= $rank) {
            return $r;
        }
    }
    return max($ranks);
}

/**
 * Prices the package from phr_quote_apply_choices(). $api from
 * phr_pricing_api_settings(); $country is the visitor's country or null;
 * $ref is the quote reference (sent as websiteQuoteReference and
 * X-Request-ID). Returns:
 *   'ok'               => true if the package was priced
 *   'error'            => reason for the SDR when not ok, else null
 *   'mock'             => true if priced by the SAMPLE mock
 *   'country'          => visitor country (or null)
 *   'region', 'region_name', 'fallback' (true if not the visitor's region)
 *   'currency'
 *   'headcount', 'priced_headcount'
 *   'modules'          => per bundle: name, tier, recommended_tier, changed,
 *                         status, included, priced_tier, tier_note,
 *                         annual [low, high] or null
 *   'subtotal_annual', 'discount' (['percent', 'amount' range] or null),
 *   'total_annual', 'ps_one_time', 'ps_days',
 *   'first_year'       => ranges ([low, high]) or null when not ok
 *   'request_ids'      => API requestIds, for support
 *   'versions'         => API pricingVersion
 */
function phr_quote_price(array $answers, array $rows, array $api, $country, string $ref)
{
    $region = phr_quote_region_for($country);
    $out = [
        'ok' => false, 'error' => null, 'mock' => $api['mock'],
        'country' => $country, 'region' => $region, 'region_name' => PHR_QUOTE_REGIONS[$region],
        'fallback' => $country !== $region, 'currency' => '',
        'headcount' => $answers['employees'], 'priced_headcount' => $answers['employees'],
        'modules' => [], 'subtotal_annual' => null, 'discount' => null,
        'total_annual' => null, 'ps_one_time' => null,
        'ps_days' => null, 'first_year' => null, 'request_ids' => [], 'versions' => null,
    ];
    foreach ($rows as $id => $row) {
        $out['modules'][$id] = [
            'name' => $row['name'],
            'tier' => $row['tier'],
            'recommended_tier' => $row['recommended_tier'] ?? $row['tier'],
            'changed' => $row['changed'] ?? false,
            'status' => $row['status'],
            'included' => $row['included'] ?? $row['status'] !== 'Nice-to-Have',
            'priced_tier' => null,
            'tier_note' => '',
            'annual' => null,
        ];
    }

    try {
        $list = phr_pricing_api_price_list($api, $region, $ref . '-list');
        $out['request_ids'][] = $list['requestId'] ?? null;
        $out['region_name'] = (string) ($list['data']['region']['name'] ?? PHR_QUOTE_REGIONS[$region]);
        $offered = [];
        foreach (($list['data']['modules'] ?? []) as $m) {
            $offered[$m['module']] = $m['tiers'] ?? [];
        }

        // Tiers to price: the chosen tier for included modules, the
        // recommended tier for optional extras.
        $included = [];
        $optional = [];
        foreach ($rows as $id => $row) {
            $m = &$out['modules'][$id];
            $rank = $row['rank'];
            $pricedRank = phr_quote_offered_rank($rank, $offered[$id] ?? []);
            if ($pricedRank === 0) {
                $m['tier_note'] = 'Not offered in ' . $out['region_name'];
                if ($m['included']) {
                    throw new PhrPricingApiException($row['name'] . ' is not offered in ' . $out['region_name'] . '.', 'module_unavailable');
                }
                continue;
            }
            $m['priced_tier'] = PHR_QUOTE_TIERS[$pricedRank];
            if ($pricedRank !== $rank) {
                $m['tier_note'] = 'Priced at ' . PHR_QUOTE_TIERS[$pricedRank] . ': ' . PHR_QUOTE_TIERS[$rank] . ' is not offered in ' . $out['region_name'];
            }
            $selection = ['module' => $id, 'tier' => PHR_QUOTE_API_TIERS[$pricedRank]];
            if ($m['included']) {
                $included[] = $selection;
            } else {
                $optional[] = $selection;
            }
        }
        unset($m);

        $request = [
            'region' => $region,
            'headcount' => (int) $answers['employees'],
            'modules' => $included,
            'invoicingFrequency' => 'annual',
            'websiteQuoteReference' => $ref,
        ];
        $res = phr_pricing_api_price($api, $request, $ref . '-price');
        $d = $res['data'];
        $out['request_ids'][] = $d['requestId'] ?? $res['requestId'] ?? null;
        $out['currency'] = (string) ($d['currency'] ?? '');
        $out['priced_headcount'] = (int) ($d['pricedHeadcount'] ?? $answers['employees']);
        $out['versions'] = $d['pricingVersion'] ?? null;
        foreach (($d['subscription']['modules'] ?? []) as $mp) {
            if (isset($out['modules'][$mp['module']])) {
                $out['modules'][$mp['module']]['annual'] = phr_quote_range((float) $mp['annualListAmount']);
            }
        }
        $sub = $d['subscription'];
        $out['subtotal_annual'] = phr_quote_range((float) $sub['annualSubtotal']);
        foreach (($sub['discounts'] ?? []) as $disc) {
            if ((float) $disc['amount'] > 0) {
                $out['discount'] = ['percent' => (float) $disc['percent'], 'amount' => phr_quote_range((float) $disc['amount'])];
            }
        }
        $out['total_annual'] = phr_quote_range((float) $sub['annualTotal']);
        $out['ps_one_time'] = phr_quote_range((float) $d['professionalServices']['oneTimeTotal']);
        $days = 0.0;
        foreach (($d['professionalServices']['bundles'] ?? []) as $b) {
            $days += (float) $b['effortDays'];
        }
        $out['ps_days'] = $days;
        $out['first_year'] = phr_quote_range((float) $d['firstYearTotal']);
        $out['ok'] = true;
    } catch (PhrPricingApiException $e) {
        error_log('quote-pricing: ' . $e->getMessage() . ' (requestId ' . ($e->requestId ?? 'none') . ', ref ' . $ref . ')');
        $out['error'] = $e->apiCode === 'not_configured'
            ? 'The pricing service is not configured yet.'
            : 'The pricing service could not price this package (' . $e->apiCode . ($e->requestId ? ', requestId ' . $e->requestId : '') . ').';
        if ($e->requestId) {
            $out['request_ids'][] = $e->requestId;
        }
        $out['request_ids'] = array_values(array_filter($out['request_ids']));
        return $out;
    }

    // Optional extras: price the package plus every extra, and read each
    // extra's own annual amount. Best effort; the quote stands without it.
    if ($optional) {
        try {
            $request['modules'] = array_merge($included, $optional);
            $res = phr_pricing_api_price($api, $request, $ref . '-extras');
            foreach (($res['data']['subscription']['modules'] ?? []) as $mp) {
                $id = $mp['module'] ?? '';
                if (isset($out['modules'][$id]) && !$out['modules'][$id]['included']) {
                    $out['modules'][$id]['annual'] = phr_quote_range((float) $mp['annualListAmount']);
                }
            }
        } catch (PhrPricingApiException $e) {
            error_log('quote-pricing: optional modules: ' . $e->getMessage() . ' (requestId ' . ($e->requestId ?? 'none') . ', ref ' . $ref . ')');
        }
    }
    $out['request_ids'] = array_values(array_filter($out['request_ids']));
    return $out;
}

// "PHP 16,000 – 25,000"; "Not available" when there is no range.
function phr_quote_format_range($range, string $currency = '')
{
    if (!is_array($range)) {
        return 'Not available';
    }
    return ($currency !== '' ? $currency . ' ' : '') . number_format($range[0]) . ' – ' . number_format($range[1]);
}

// One line for the SDR: where the price came from.
function phr_quote_region_note(array $price)
{
    $note = 'Price book: ' . $price['region_name'] . ' (' . $price['region'] . ')';
    if ($price['fallback']) {
        $note .= $price['country'] ? '; visitor located in ' . $price['country'] . ', which has no price book of its own' : '; visitor location unknown';
    }
    return $note . '.';
}
