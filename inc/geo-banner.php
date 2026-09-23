<?php
/**
 * Homepage geotargeted banner. Only renders when the visitor's country
 * (see geo.php) is one of our 7 supported markets — everyone else sees
 * the homepage exactly as before, no banner.
 */
$phrBanners = [
    'SG' => ['text' => 'Serving HR teams across Singapore.', 'cta' => 'See our Singapore page', 'href' => 'region-singapore.html'],
    'PH' => ['text' => 'Revolutionize HR in the Philippines with PeoplesHR.', 'cta' => 'See our Philippines page', 'href' => 'philippines.html'],
    'ID' => ['text' => 'HCM berbasis AI, dipercaya oleh perusahaan terkemuka di Indonesia.', 'cta' => 'Lihat halaman Indonesia', 'href' => 'indonesia.html'],
    'KE' => ['text' => 'Revolutionize HR in Kenya with PeoplesHR.', 'cta' => 'See our Kenya page', 'href' => 'region-kenya.html'],
    'BD' => ['text' => 'Revolutionize HR in Bangladesh with PeoplesHR.', 'cta' => 'See our Bangladesh page', 'href' => 'region-bangladesh.html'],
    'LK' => ['text' => 'Revolutionize HR in Sri Lanka with PeoplesHR.', 'cta' => 'See our Sri Lanka page', 'href' => 'region-sri-lanka.html'],
    'AE' => ['text' => 'Revolutionize HR in the Middle East with PeoplesHR.', 'cta' => 'See our Middle East page', 'href' => 'middle-east.html'],
];
?>
<?php if (!empty($phrCountry) && isset($phrBanners[$phrCountry])): $phrB = $phrBanners[$phrCountry]; ?>
<div style="background:#eef4ff;border-bottom:1px solid #d7e3fb;padding:12px 24px;text-align:center;font-size:14px;color:#1b2b4b;">
  <?php echo htmlspecialchars($phrB['text']); ?>
  <a href="<?php echo htmlspecialchars($phrB['href']); ?>" style="color:#2554ea;font-weight:700;text-decoration:none;margin-left:6px;"><?php echo htmlspecialchars($phrB['cta']); ?> &rarr;</a>
</div>
<?php endif; ?>
