<?php
/**
 * Partner page — partner directory, grouped by region.
 *
 * To add or edit a partner, change $phrPartnerRegions below; the markup
 * renders from it. Per partner:
 *   name   — company name (required)
 *   type   — 'strategic' | 'distributor' | 'reseller' | 'referral' (keys of $phrPartnerTypes;
 *            the signed partner category)
 *   services — optional, e.g. 'Sales' or 'Sales & Implementation'; shown
 *            under the name. Omit or null to hide.
 *   logo   — path under /uploads/, or null to show the name's initials.
 *            Shown as a 16:9 thumbnail, contained (not cropped) on a light
 *            panel, so any logo shape works; ~800x450 or a transparent
 *            PNG/WebP at least 600px wide looks sharpest.
 *   desc   — one or two sentences, or null to hide
 *   website — full URL, e.g. 'https://example.com/'; shown as the domain
 *            and opens in a new tab. null hides the line. Partner email
 *            addresses and phone numbers are deliberately not published.
 * A region with no partners shows a "talk to our team" message instead.
 * The first region is the tab that is open on page load. Within a region,
 * partners are ordered Strategic, then Distributor, then Reseller
 * (Platinum/Gold tiers first), then Referral, then A-Z. Individual referral partners are
 * deliberately not listed.
 */
$phrPartnerTypes = [
    'strategic' => 'Strategic Partner',
    'distributor' => 'Distributor Partner',
    'reseller' => 'Reseller Partner',
    'referral' => 'Referral Partner',
];

$phrPartnerRegions = [
    'philippines' => [
        'label'    => 'Philippines',
        // Source: PeoplesHR Partner Directory Information sheet (confirmed for publication).
        'partners' => [
            [
                'name'     => 'Bridge PayDay Solutions, Inc.',
                'type'     => 'strategic',
                'services' => 'Sales & Implementation',
                'logo'     => '/uploads/2026/11/BridgePayday_logo.webp',
                'desc'     => null,
                'website'  => 'https://bridgepayday.ph/',
            ],
            [
                'name'     => 'Accent Micro Technologies Inc. (AMTI)',
                'type'     => 'reseller',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/amti_logo.webp',
                'desc'     => null,
                'website'  => 'https://amti.com.ph/',
            ],
            [
                'name'     => 'Total Information Management Corporation (TIM)',
                'type'     => 'reseller',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/tim_logo.webp',
                'desc'     => null,
                'website'  => null,
            ],
            [
                'name'     => 'Amorsolo Consulting, Inc.',
                'type'     => 'referral',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/armosolo_logo.webp',
                'desc'     => null,
                'website'  => 'https://amorsoloconsulting.com/',
            ],
            [
                'name'     => 'EmergePH Online Consultancy Services',
                'type'     => 'referral',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/emergePH_logo.webp',
                'desc'     => null,
                'website'  => 'https://emergeph.com/',
            ],
            [
                'name'     => 'P2MSI',
                'type'     => 'referral',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/p2msi_logo.webp',
                'desc'     => null,
                'website'  => null,
            ],
        ],
    ],
    'indonesia' => [
        'label'    => 'Indonesia',
        'partners' => [
            [
                'name'  => 'NTT DATA',
                'type'  => 'reseller',
                'logo'  => '/uploads/2026/11/ntt_data.webp',
                'desc'  => null,
                'website'=> 'https://www.nttdata.com/en-id',
            ],
            [
                'name'  => 'Qualitas',
                'type'  => 'reseller',
                'logo'  => '/uploads/2026/11/qualitas_logo.webp',
                'desc'  => null,
                'website'=> 'https://qualitas.co.id/',
            ],
            [
                'name'  => 'Accurate Indonesia',
                'type'  => 'referral',
                'logo'  => '/uploads/2026/11/accurate_indonesia_logo.webp',
                'desc'  => null,
                'website'=> 'https://accurate.id/',
            ],
            [
                'name'  => 'Pratesis',
                'type'  => 'referral',
                'logo'  => '/uploads/2026/11/pratesis_logo.webp',
                'desc'  => null,
                'website'=> 'https://pratesis.com/',
            ],
        ],
    ],
    'singapore' => [
        'label'    => 'Singapore',
        'partners' => [
            [
                'name'  => 'N&U Software',
                'type'  => 'reseller',
                'logo'  => '/uploads/2026/11/N&U_Software_logo.webp',
                'desc'  => null,
                'website'=> 'https://nandusoftware.com/',
            ],
        ],
    ],
    'cambodia' => [
        'label'    => 'Cambodia',
        'partners' => [
            [
                'name'  => 'First Cambodia',
                'type'  => 'reseller',
                'logo'  => '/uploads/2026/11/First_Capital_Cambodia.webp',
                'desc'  => null,
                'website'=> 'https://first-cambodia.com/',
            ],
            [
                'name'  => 'AdvancedMSP',
                'type'  => 'reseller',
                'logo'  => '/uploads/2026/11/advanced_msp_logo.webp',
                'desc'  => null,
                'website'=> 'https://advancedmsp.com/',
            ],
        ],
    ],
    'bangladesh' => [
        'label'    => 'Bangladesh',
        'partners' => [
            [
                'name'  => 'DITECH',
                'type'  => 'distributor',
                'logo'  => '/uploads/2026/11/ditech_bangladesh.webp',
                'desc'  => null,
                'website'=> 'https://www.ditech.co/',
            ],
        ],
    ],
    'kenya' => [
        'label'    => 'Kenya',
        'partners' => [
            [
                'name'  => 'Global Frontiers (Pvt) Ltd',
                'type'  => 'distributor',
                'logo'  => '/uploads/2026/11/global_frontiers_log0.webp',
                'desc'  => 'Our partner in Nairobi, connecting Kenyan organizations with modern HR technology and co-hosting PeoplesHR\'s HR community events.',
                'website'=> 'https://globalfrontiers.io/',
            ],
        ],
    ],
    'middle-east' => [
        'label'    => 'Middle East',
        'partners' => [
            [
                'name'  => 'Ensaan Technologies',
                'type'  => 'distributor',
                'logo'  => '/uploads/2026/11/ensaan_logo.webp',
                'desc'  => 'A leading provider of HR software and talent management solutions across the Middle East, with deep expertise in deploying HR systems.',
                'website'=> 'https://ensaantech.com/',
            ],
        ],
    ],
];

if (!function_exists('phr_partner_initials')) {
    function phr_partner_initials($name) {
        $words = preg_split('/\s+/', preg_replace('/^PT\.?\s+/i', '', $name));
        $out = '';
        foreach ($words as $w) {
            if ($w !== '' && ctype_alpha($w[0])) $out .= strtoupper($w[0]);
            if (strlen($out) === 2) break;
        }
        return $out;
    }
}

// Not array_key_first(): it needs PHP 7.3+, and the server runs .html pages
// on an older PHP than .php files (a fatal error there cut the page off).
$phrFirstRegion = key(array_slice($phrPartnerRegions, 0, 1, true));
?>
<section class="partner-directory-section" id="partner-directory">
  <div class="pd-inner">

    <div class="pd-head">
      <h2>Our Partner Network</h2>
      <p>Work with a PeoplesHR partner who knows your market. Choose your region to find a partner near you.</p>
      <ul class="pd-legend">
        <li><span class="pd-type pd-type--strategic"><?php echo $phrPartnerTypes['strategic']; ?></span> Works with PeoplesHR on sales and implementation</li>
        <li><span class="pd-type pd-type--distributor"><?php echo $phrPartnerTypes['distributor']; ?></span> Distributes PeoplesHR through its own reseller network</li>
        <li><span class="pd-type pd-type--reseller"><?php echo $phrPartnerTypes['reseller']; ?></span> Buy PeoplesHR directly through this partner</li>
        <li><span class="pd-type pd-type--referral"><?php echo $phrPartnerTypes['referral']; ?></span> Introduces you to the PeoplesHR team</li>
      </ul>
    </div>

    <div class="industry-tabs pd-tabs" role="tablist" aria-label="Partner regions">
<?php foreach ($phrPartnerRegions as $phrKey => $phrRegion): $phrOn = $phrKey === $phrFirstRegion; ?>
      <button class="industry-tab<?php echo $phrOn ? ' active' : ''; ?>" type="button" role="tab" id="pd-tab-<?php echo $phrKey; ?>" aria-controls="pd-panel-<?php echo $phrKey; ?>" aria-selected="<?php echo $phrOn ? 'true' : 'false'; ?>"<?php echo $phrOn ? '' : ' tabindex="-1"'; ?>><?php echo htmlspecialchars($phrRegion['label']); ?></button>
<?php endforeach; ?>
    </div>

<?php foreach ($phrPartnerRegions as $phrKey => $phrRegion): ?>
    <div class="pd-panel" role="tabpanel" id="pd-panel-<?php echo $phrKey; ?>" aria-labelledby="pd-tab-<?php echo $phrKey; ?>"<?php echo $phrKey === $phrFirstRegion ? '' : ' hidden'; ?>>
<?php if (empty($phrRegion['partners'])): ?>
      <p class="pd-empty">We're building our partner network in <?php echo htmlspecialchars($phrRegion['label']); ?>. <a href="/get-in-touch/">Talk to our team</a> for help in the meantime, or apply below to become a partner.</p>
<?php else: ?>
      <ul class="pd-grid">
<?php foreach ($phrRegion['partners'] as $phrP): $phrType = $phrP['type'] ?? null; ?>
        <li class="pd-card">
          <div class="pd-thumb">
<?php if (!empty($phrP['logo'])): ?>
            <img src="<?php echo htmlspecialchars($phrP['logo']); ?>" alt="<?php echo htmlspecialchars($phrP['name']); ?> logo" loading="lazy">
<?php else: ?>
            <span class="pd-logo-initials" aria-hidden="true"><?php echo phr_partner_initials($phrP['name']); ?></span>
<?php endif; ?>
          </div>
          <div class="pd-body">
<?php if ($phrType && isset($phrPartnerTypes[$phrType])): ?>
          <span class="pd-type pd-type--<?php echo $phrType; ?>"><?php echo $phrPartnerTypes[$phrType]; ?></span>
<?php endif; ?>
          <h3 class="pd-name"><?php echo htmlspecialchars($phrP['name']); ?></h3>
<?php if (!empty($phrP['services'])): ?>
          <p class="pd-services"><?php echo htmlspecialchars($phrP['services']); ?></p>
<?php endif; ?>
<?php if (!empty($phrP['desc'])): ?>
          <p class="pd-desc"><?php echo htmlspecialchars($phrP['desc']); ?></p>
<?php endif; ?>
<?php if (!empty($phrP['website'])): ?>
          <ul class="pd-contact">
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><a href="<?php echo htmlspecialchars($phrP['website']); ?>" target="_blank" rel="noopener"><?php echo htmlspecialchars(rtrim(preg_replace('#^https?://(www\.)?#', '', $phrP['website']), '/')); ?></a></li>
          </ul>
<?php endif; ?>
          </div>
        </li>
<?php endforeach; ?>
      </ul>
<?php endif; ?>
    </div>
<?php endforeach; ?>

  </div>
</section>
