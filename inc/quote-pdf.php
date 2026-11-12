<?php
/**
 * Live quote: the SDR's quote PDF (A4, rendered with Dompdf from
 * inc/lib/dompdf). Called by quote-submit.php; returns the PDF as a string.
 */

require_once __DIR__ . '/quote-pricing.php';
require_once __DIR__ . '/lib/dompdf/autoload.inc.php';

// Printed at the end of every quote PDF. Have legal review before launch.
const PHR_QUOTE_DISCLAIMER = 'This quote is indicative only and is provided for information purposes. '
    . 'It does not constitute an offer, a contract or a commitment by PeoplesHR to supply any product or service at the prices shown. '
    . 'Figures are estimated ranges based solely on the information submitted through the PeoplesHR website and are subject to change '
    . 'following a review of your requirements, including headcount, scope, configuration and deployment. '
    . 'Professional Services figures are an estimate of standard implementation effort and exclude data migration, integrations and other work '
    . 'outside the standard scope. All prices exclude applicable taxes. Final pricing and terms are set out only in a formal proposal or signed agreement with PeoplesHR.';

/**
 * $q: 'ref', 'date', 'contact' (name, email, company, phone),
 *     'answers' ([title, text] pairs), 'price' (phr_quote_price()),
 *     'price_notes' (lines from rq_price_summary()),
 *     'addons' (labels of the Professional Services add-ons requested),
 *     'addons_note' (the price_notes line about them; shown in the price
 *     box instead when the package was priced),
 *     'signals' (names of bundles flagged only as Q6 priorities)
 */
function phr_quote_pdf(array $q)
{
    $h = function ($v) {
        return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
    };
    $price = $q['price'];
    $cur = $price['currency'];
    $priced = $price['ok'];
    $tierColors = ['Manage' => '#059669', 'Grow' => '#2563EB', 'Transform' => '#7C3AED'];

    $moduleRows = function ($included) use ($price, $h, $tierColors, $priced) {
        $out = '';
        foreach ($price['modules'] as $m) {
            if ($m['included'] !== $included) {
                continue;
            }
            $optional = $m['status'] === 'Nice-to-Have';
            $note = $optional && $m['included'] ? 'Nice-to-Have, added by customer' : $m['status'];
            if ($m['changed']) {
                $note .= '<br><span class="chg">Customer changed from ' . $h($m['recommended_tier']) . ' (recommended)</span>';
            }
            if ($m['tier_note'] !== '') {
                $note .= '<br><span class="chg">' . $h($m['tier_note']) . '</span>';
            }
            $out .= '<tr><td class="b">' . $h($m['name']) . '</td>'
                . '<td style="color:' . $tierColors[$m['tier']] . '" class="b">' . $h($m['tier']) . '</td>'
                . '<td>' . $note . '</td>'
                . ($priced ? '<td class="r">' . $h(phr_quote_format_range($m['annual'])) . '</td>' : '') . '</tr>';
        }
        return $out;
    };
    $optionalRows = $moduleRows(false);

    $headcount = number_format($price['headcount']);

    $html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        @page { margin: 34px 40px 46px; }
        body { font-family: "DejaVu Sans", sans-serif; font-size: 9.5px; color: #0F1C2E; line-height: 1.45; }
        h1 { font-size: 17px; color: #14284B; margin: 0; }
        h2 { font-size: 11.5px; color: #14284B; margin: 18px 0 6px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #14284B; color: #fff; font-size: 8.5px; text-transform: uppercase; letter-spacing: .4px; text-align: left; padding: 6px 8px; }
        td { padding: 6px 8px; border-bottom: 1px solid #E7EAF0; vertical-align: top; }
        .b { font-weight: bold; }
        .r { text-align: right; white-space: nowrap; }
        .muted { color: #64748B; }
        .chg { color: #B45309; font-size: 8.5px; }
        .head td { border: 0; padding: 0; }
        .meta td { border: 0; padding: 1px 0; }
        .info td { width: 25%; }
        .info td.k { color: #64748B; width: 16%; }
        .total { margin-top: 12px; background: #EEF3FB; border: 1px solid #C9D6EE; padding: 10px 12px; }
        .total .big { font-size: 15px; font-weight: bold; color: #14284B; }
        .sample { background: #FEF3C7; border: 1px solid #F59E0B; color: #92400E; padding: 6px 10px; margin-bottom: 12px; font-weight: bold; text-align: center; }
        .legal { margin: 0; font-size: 8.5px; color: #64748B; line-height: 1.5; }
        .notes { margin: 0; padding-left: 14px; }
        .notes li { margin-bottom: 3px; }
        .footer { position: fixed; bottom: -30px; left: 0; right: 0; font-size: 8px; color: #94A3B8; border-top: 1px solid #E7EAF0; padding-top: 5px; }
    </style></head><body>';

    $html .= '<div class="footer">PeoplesHR | Indicative quote ' . $h($q['ref']) . ' | Indicative only, not a binding offer. See disclaimer.</div>';

    if ($price['mock']) {
        $html .= '<div class="sample">SAMPLE PRICING: illustrative only, not approved PeoplesHR commercial rates. Do not share.</div>';
    }

    $html .= '<table class="head"><tr>'
        . '<td><img src="' . __DIR__ . '/quote-pdf-logo.png" style="width:130px"></td>'
        . '<td class="r"><table class="meta" style="width:auto;margin-left:auto">'
        . '<tr><td class="muted" style="padding-right:10px">Quote ref</td><td class="b">' . $h($q['ref']) . '</td></tr>'
        . '<tr><td class="muted" style="padding-right:10px">Date</td><td>' . $h($q['date']) . '</td></tr>'
        . '</table></td></tr></table>';

    $html .= '<h1 style="margin-top:14px">Indicative Quote</h1>'
        . '<p class="muted" style="margin:3px 0 0">Generated from the website live quote questionnaire. '
        . ($priced ? $h($cur) . ', ' . $h($price['region_name']) . ' price book, billed annually, excluding taxes.' : 'Pricing was not available for this request.') . '</p>';

    $c = $q['contact'];
    $html .= '<h2>Prepared for</h2><table class="info">'
        . '<tr><td class="k">Name</td><td class="b">' . $h($c['name']) . '</td><td class="k">Organization</td><td class="b">' . $h($c['company']) . '</td></tr>'
        . '<tr><td class="k">Email</td><td>' . $h($c['email']) . '</td><td class="k">Phone</td><td>' . $h($c['phone']) . '</td></tr>'
        . '<tr><td class="k">Employees priced</td><td>' . $h(number_format($price['priced_headcount'])) . ($price['priced_headcount'] !== $price['headcount'] ? ' <span class="muted">(entered ' . $h($headcount) . ')</span>' : '') . '</td><td class="k">Industry</td><td>' . $h($q['answers'][0][1]) . '</td></tr>'
        . '</table>';

    $priceHead = $priced ? '<th class="r">Est. annual list (' . $h($cur) . ')</th>' : '';
    $html .= '<h2>Selected package</h2><table>'
        . '<tr><th>Module</th><th>Tier</th><th>Status</th>' . $priceHead . '</tr>'
        . $moduleRows(true) . '</table>';

    if ($priced) {
        $fmt = function ($range) use ($h, $cur) {
            return $h(phr_quote_format_range($range, $cur));
        };
        $html .= '<div class="total"><table class="head">';
        if ($price['discount']) {
            $pct = rtrim(rtrim(number_format($price['discount']['percent'], 2), '0'), '.');
            $html .= '<tr><td class="muted">Annual subscription before discount</td><td class="r">' . $fmt($price['subtotal_annual']) . '</td></tr>'
                . '<tr><td class="muted">Annual-upfront discount (' . $h($pct) . '%)</td><td class="r">&minus; ' . $fmt($price['discount']['amount']) . '</td></tr>';
        }
        $html .= '<tr><td class="b">Annual subscription</td><td class="r b">' . $fmt($price['total_annual']) . '</td></tr>'
            . '<tr><td class="b">Professional Services, one-time'
            . ($price['ps_days'] ? ' <span class="muted" style="font-weight:normal">(about ' . $h(number_format($price['ps_days'])) . ' effort days)</span>' : '')
            . '</td><td class="r b">' . $fmt($price['ps_one_time']) . '</td></tr>'
            . ($q['addons'] ? '<tr><td colspan="2" class="muted">Add-ons requested, not priced above: ' . $h(implode(', ', $q['addons'])) . '</td></tr>' : '')
            . '<tr><td style="padding-top:6px"><span class="big">First-year total</span></td><td class="r" style="padding-top:6px"><span class="big">' . $fmt($price['first_year']) . '</span></td></tr>'
            . '</table></div>';
    } else {
        $html .= '<div class="total"><span class="b">Estimated price: not available.</span> ' . $h($price['error']) . ' The sales team will price this request.</div>';
    }

    if ($optionalRows !== '') {
        $html .= '<h2>Optional modules (not in the total, priced at the recommended tier)</h2><table>'
            . '<tr><th>Module</th><th>Tier</th><th>Status</th>' . $priceHead . '</tr>'
            . $optionalRows . '</table>';
    }

    $html .= '<h2>Notes</h2><ul class="notes">';
    foreach ($q['price_notes'] as $note) {
        if ($note !== $price['error'] && !($priced && $note === $q['addons_note'])) {
            $html .= '<li>' . $h($note) . '</li>';
        }
    }
    $html .= '<li>Figures are indicative ranges based on the answers below. Final pricing is confirmed after the sales team gathers additional information.</li>';
    if ($q['signals']) {
        $html .= '<li>Also flagged as a priority: ' . $h(implode(', ', $q['signals'])) . '.</li>';
    }
    $html .= '</ul>';

    $html .= '<h2>Questionnaire answers</h2><table>';
    foreach ($q['answers'] as $i => $line) {
        $html .= '<tr><td class="muted" style="width:44%">Q' . ($i + 1) . '. ' . $h($line[0]) . '</td><td>' . $h($line[1]) . '</td></tr>';
    }
    $html .= '</table>';

    $html .= '<h2>Disclaimer</h2><p class="legal">' . $h(PHR_QUOTE_DISCLAIMER) . '</p>';
    $html .= '</body></html>';

    $options = new \Dompdf\Options();
    $options->setChroot([__DIR__]);
    $options->setIsRemoteEnabled(false);
    $options->setIsPhpEnabled(false);
    $options->setTempDir(sys_get_temp_dir());
    // Font metric caches go to temp, not into inc/lib (may be read-only on the server).
    $options->setFontCache(sys_get_temp_dir());
    $options->setDefaultFont('DejaVu Sans');
    $dompdf = new \Dompdf\Dompdf($options);
    $dompdf->loadHtml($html, 'UTF-8');
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();
    return $dompdf->output();
}
