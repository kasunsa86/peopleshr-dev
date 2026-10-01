<?php
/**
 * Homepage geotargeted banner. All 7 market banners are in the markup,
 * hidden; the CSS in inc/geo-head.php shows the visitor's one when their
 * country is one of our 7 supported markets -- everyone else sees the
 * homepage exactly as before, no banner. Same markup for every visitor,
 * so the page can be cached. Only shown when the country is known at
 * first paint (see data-geo-late in inc/geo-head.php), so it never
 * pushes the page down after it has rendered.
 */
$phrBanners = [
    'SG' => ['text' => 'Serving HR teams across Singapore.', 'cta' => 'See our Singapore page', 'href' => '/region-singapore/'],
    'PH' => ['text' => 'Revolutionize HR in the Philippines with PeoplesHR.', 'cta' => 'See our Philippines page', 'href' => '/philippines/'],
    'ID' => ['text' => 'HCM berbasis AI, dipercaya oleh perusahaan terkemuka di Indonesia.', 'cta' => 'Lihat halaman Indonesia', 'href' => '/indonesia/'],
    'KE' => ['text' => 'Revolutionize HR in Kenya with PeoplesHR.', 'cta' => 'See our Kenya page', 'href' => '/region-kenya/'],
    'BD' => ['text' => 'Revolutionize HR in Bangladesh with PeoplesHR.', 'cta' => 'See our Bangladesh page', 'href' => '/region-bangladesh/'],
    'LK' => ['text' => 'Revolutionize HR in Sri Lanka with PeoplesHR.', 'cta' => 'See our Sri Lanka page', 'href' => '/region-sri-lanka/'],
    'AE' => ['text' => 'Revolutionize HR in the Middle East with PeoplesHR.', 'cta' => 'See our Middle East page', 'href' => '/middle-east/'],
];
?>
<?php foreach ($phrBanners as $phrCode => $phrB): ?>
<div class="geo geo-banner geo-<?php echo $phrCode; ?>" style="background:#eef4ff;border-bottom:1px solid #d7e3fb;padding:12px 24px;text-align:center;font-size:14px;color:#1b2b4b;">
  <?php echo htmlspecialchars($phrB['text']); ?>
  <a href="<?php echo htmlspecialchars($phrB['href']); ?>" style="color:#2554ea;font-weight:700;text-decoration:none;margin-left:6px;"><?php echo htmlspecialchars($phrB['cta']); ?> &rarr;</a>
</div>
<?php endforeach; ?>
