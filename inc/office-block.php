<?php
/**
 * Footer office block. Head Office (Singapore) always shows as-is.
 * "Regional Office" carries every regional office; the CSS in
 * inc/geo-head.php shows the visitor's matching one, or Sri Lanka (the
 * site default, .geo-default) when we have no office for their country.
 * Same markup for every visitor, so the page can be cached.
 */
$phrOffices = [
    'default' => [
        'address' => '67/1, Hudson Road, Off Perahera Mw, Colombo 03, Sri Lanka',
        'phone'   => '+94 72 759 7252',
        'tel'     => '+94727597252',
    ],
    'PH' => [
        'address' => 'WeWork, 30th floor Yuchengco Tower, RCBC Plaza, Ayala corner Sen. Gil Puyat Avenue, Makati City',
        'phone'   => '+63 2 8271 150',
        'tel'     => '+63282711150',
    ],
    'ID' => [
        'address' => 'GoWork Sampoerna Strategic Square, 12th Floor, North Tower, Jalan Jenderal Sudirman, Karet Semanggi, Special Capital Region of Jakarta 12930, Indonesia',
        'phone'   => null,
        'tel'     => null,
    ],
    'KE' => [
        'address' => 'P.O Box 48960, G.P.O Nairobi, Eldama Ravine Road, Westlands, Nairobi, Kenya',
        'phone'   => '+254 705 890 115',
        'tel'     => '+254705890115',
    ],
    'BD' => [
        'address' => 'Suite B2, House 9B, Road 117, Gulshan Avenue, Dhaka, Bangladesh',
        'phone'   => '+880 1833 182379',
        'tel'     => '+8801833182379',
    ],
    'AE' => [
        'address' => '2112, Grosvenor Business Tower, Barsha Heights, Tecom - Dubai, PO Box no. 128067',
        'phone'   => '+971 4 454 2200',
        'tel'     => '+97144542200',
    ],
];
?>
            <div class="ft-office">
              <p class="ft-office-label">Head Office</p>
              <address>7500A, Beach Road, #05-322 The Plaza, Singapore 199591<br>
                <a href="tel:+6586528348">+65 8652 8348</a></address>
            </div>
            <div class="ft-office">
              <p class="ft-office-label">Regional Office</p>
<?php foreach ($phrOffices as $phrCode => $phrRegional): ?>
              <address class="geo geo-<?php echo $phrCode; ?>"><?php echo htmlspecialchars($phrRegional['address']); ?><?php if (!empty($phrRegional['phone'])): ?><br>
                <a href="tel:<?php echo htmlspecialchars($phrRegional['tel']); ?>"><?php echo htmlspecialchars($phrRegional['phone']); ?></a><?php endif; ?></address>
<?php endforeach; ?>
            </div>
