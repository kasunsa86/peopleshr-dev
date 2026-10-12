<?php
/**
 * Partner page — partner directory, grouped by region.
 *
 * To add or edit a partner, change $phrPartnerRegions below; the markup
 * renders from it. Per partner:
 *   name   — company name (required)
 *   type   — 'strategic' | 'reseller' | 'referral' (keys of $phrPartnerTypes;
 *            the signed partner category)
 *   services — optional, e.g. 'Sales' or 'Sales & Implementation'; shown
 *            under the name. Omit or null to hide.
 *   logo   — path under /uploads/, or null to show the name's initials.
 *            Shown as a 16:9 thumbnail, contained (not cropped) on a light
 *            panel, so any logo shape works; ~800x450 or a transparent
 *            PNG/WebP at least 600px wide looks sharpest.
 *   desc   — one or two sentences, or null to hide
 *   email  — or null to hide the line
 *   phone  — as displayed, e.g. '+63 2 8271 150'; the tel: link strips
 *            spaces/dashes. null hides the line.
 * A region with no partners shows a "talk to our team" message instead.
 * The first region is the tab that is open on page load. Within a region,
 * partners are ordered Strategic, then Reseller (Platinum/Gold tiers
 * first), then Referral, then A-Z. Individual referral partners are
 * deliberately not listed.
 */
$phrPartnerTypes = [
    'strategic' => 'Strategic Partner',
    'reseller' => 'Reseller Partner',
    'referral' => 'Referral Partner',
];

$phrPartnerRegions = [
    'philippines' => [
        'label'    => 'Philippines',
        // Source: PeoplesHR Partner Directory Information sheet (confirmed for publication).
        'partners' => [
            [
                // Logo: confirm the white-label agreement allows it before publishing.
                'name'     => 'Mustard Seed Systems Corporation (MSSC)',
                'type'     => 'strategic',
                'services' => 'Sales & Implementation',
                'logo'     => '/uploads/2026/11/mustardseeds.webp',
                'desc'     => 'A Philippine business-technology provider with 25 years of helping local organizations move to the cloud, and host of the annual Cloud Business Summit.',
                'email'    => 'judith@mseedsystems.com',
                'phone'    => null,
            ],
            [
                'name'     => 'Bridge PayDay Solutions, Inc.',
                'type'     => 'strategic',
                'services' => 'Sales & Implementation',
                'logo'     => '/uploads/2026/11/BridgePayday_logo.webp',
                'desc'     => null,
                'email'    => 'jackie@bridgepayday.ph',
                'phone'    => '+63 917 630 6755',
            ],
            [
                'name'     => 'Accent Micro Technologies Inc. (AMTI)',
                'type'     => 'reseller',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/amti_logo.webp',
                'desc'     => null,
                'email'    => 'Kar.Wong@amti.com.ph',
                'phone'    => null,
            ],
            [
                'name'     => 'Ark One Solutions Inc.',
                'type'     => 'reseller',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/arkone_logo.webp',
                'desc'     => null,
                'email'    => 'irwin_padrique@ark-one.com.ph',
                'phone'    => '+63 917 883 9988',
            ],
            [
                'name'     => 'SMS Global Technologies Inc. (SMSGT)',
                'type'     => 'reseller',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/smsgt_logo.webp',
                'desc'     => null,
                'email'    => 'bernie.deleon@smsgt.com',
                'phone'    => null,
            ],
            [
                'name'     => 'Total Information Management Corporation (TIM)',
                'type'     => 'reseller',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/tim_logo.webp',
                'desc'     => null,
                'email'    => 'sunver.bastes@timcorp.net.ph',
                'phone'    => '+63 918 920 2615',
            ],
            [
                'name'     => 'Amorsolo Consulting, Inc.',
                'type'     => 'referral',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/armosolo_logo.webp',
                'desc'     => null,
                'email'    => 'ioni@amorsoloconsulting.com',
                'phone'    => null,
            ],
            [
                'name'     => 'EmergePH Online Consultancy Services',
                'type'     => 'referral',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/emergePH_logo.webp',
                'desc'     => null,
                'email'    => 'eli@emergeph.com',
                'phone'    => null,
            ],
            [
                'name'     => 'P2MSI',
                'type'     => 'referral',
                'services' => 'Sales',
                'logo'     => '/uploads/2026/11/p2msi_logo.webp',
                'desc'     => null,
                'email'    => 'gppatanao@p2msi.com',
                'phone'    => null,
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
                'email' => 'wiji.santoso@nttdata.com',
                'phone' => null,
            ],
            [
                'name'  => 'Qualitas',
                'type'  => 'reseller',
                'logo'  => '/uploads/2026/11/qualitas_logo.webp',
                'desc'  => null,
                'email' => 'ignatia.octaviani@qualitas.co.id',
                'phone' => null,
            ],
            [
                'name'  => 'Accurate Indonesia',
                'type'  => 'referral',
                'logo'  => '/uploads/2026/11/accurate_indonesia_logo.webp',
                'desc'  => null,
                'email' => 'erfendhi.putra@cpssoft.com',
                'phone' => '+62 857 1843 6283',
            ],
            [
                'name'  => 'Pratesis',
                'type'  => 'referral',
                'logo'  => '/uploads/2026/11/pratesis_logo.webp',
                'desc'  => null,
                'email' => 'marcino.waas@pratesis.com',
                'phone' => null,
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
                'email' => 'nimali@nandusoftware.com',
                'phone' => null,
            ],
        ],
    ],
    'cambodia' => [
        'label'    => 'Cambodia',
        'partners' => [
            [
                'name'  => 'First Cambodia',
                'type'  => 'reseller',
                'logo'  => null,
                'desc'  => null,
                'email' => 'voudda.im@first-cambodia.com',
                'phone' => '+855 96 888 8278',
            ],
            [
                'name'  => 'AdvancedMSP',
                'type'  => 'reseller',
                'logo'  => '/uploads/2026/11/advanced_msp_logo.webp',
                'desc'  => null,
                'email' => 'sayon.hem@advancedmsp.com',
                'phone' => null,
            ],
        ],
    ],
    'bangladesh' => [
        'label'    => 'Bangladesh',
        'partners' => [
            [
                'name'  => 'Dekko ISHO Technologies Ltd',
                'type'  => 'reseller',
                'logo'  => '/uploads/2026/11/dekko_isho.webp',
                'desc'  => null,
                'email' => 'rubayat@ditech.co',
                'phone' => '+880 1717 464082',
            ],
        ],
    ],
    'kenya' => [
        'label'    => 'Kenya',
        'partners' => [
            [
                'name'  => 'Global Frontiers (Pvt) Ltd',
                'type'  => 'reseller',
                'logo'  => '/uploads/2026/11/global_frontiers_log0.webp',
                'desc'  => 'Our partner in Nairobi, connecting Kenyan organizations with modern HR technology and co-hosting PeoplesHR\'s HR community events.',
                'email' => 'dinuksha@globalfrontiers.io',
                'phone' => '+94 76 745 1532',
            ],
        ],
    ],
    'middle-east' => [
        'label'    => 'Middle East',
        'partners' => [
            [
                'name'  => 'Ensaan Technologies',
                'type'  => 'reseller',
                'logo'  => '/uploads/2026/11/ensaan_logo.webp',
                'desc'  => 'A leading provider of HR software and talent management solutions across the Middle East, with deep expertise in deploying HR systems.',
                'email' => 'pmandge@ensaantech.com',
                'phone' => '+971 56 460 5880',
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
<?php if (!empty($phrP['email']) || !empty($phrP['phone'])): ?>
          <ul class="pd-contact">
<?php if (!empty($phrP['email'])): ?>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg><a href="mailto:<?php echo htmlspecialchars($phrP['email']); ?>"><?php echo htmlspecialchars($phrP['email']); ?></a></li>
<?php endif; ?>
<?php if (!empty($phrP['phone'])): ?>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:<?php echo htmlspecialchars(preg_replace('/[^\d+]/', '', $phrP['phone'])); ?>"><?php echo htmlspecialchars($phrP['phone']); ?></a></li>
<?php endif; ?>
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
