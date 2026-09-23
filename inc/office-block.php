<?php
/**
 * Footer office block. Head Office (Singapore) always shows as-is.
 * "Regional Office" shows the visitor's matching local office when we have
 * one on file; otherwise it falls back to Sri Lanka (the site default).
 */
$phrOffices = [
    'LK' => [
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
        'address' => 'GoWork Plaza Indonesia Level 5, Unit E021AB Jl. M.H. Thamrin No. Kav. 28-30 Jakarta Pusat 10350',
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

// Visitor's matching office if we have one on file, otherwise Sri Lanka (default).
$phrRegional = (!empty($phrCountry) && isset($phrOffices[$phrCountry])) ? $phrOffices[$phrCountry] : $phrOffices['LK'];
?>
            <div class="ft-office">
              <p class="ft-office-label">Head Office</p>
              <address>7500A, Beach Road, #05-322 The Plaza, Singapore 199591<br>
                <a href="tel:+6586528348">+65 8652 8348</a></address>
            </div>
            <div class="ft-office">
              <p class="ft-office-label">Regional Office</p>
              <address><?php echo htmlspecialchars($phrRegional['address']); ?><?php if (!empty($phrRegional['phone'])): ?><br>
                <a href="tel:<?php echo htmlspecialchars($phrRegional['tel']); ?>"><?php echo htmlspecialchars($phrRegional['phone']); ?></a><?php endif; ?></address>
            </div>
