<?php
/**
 * Body of a 2027 calendar month page, in the marketing team's dark "Scan"
 * design. Included by calendar-2027/<month>.html ($cal27View = 'scan') and
 * calendar-2027/<month>-play.html ($cal27View = 'play').
 *
 * Expects $cal27Slug, $cal27, $cal27Num, $cal27Last, $cal27Next, $cal27View.
 * Behaviour lives in js/calendar-2027.js (and js/calendar-2027-play.js for
 * the online games).
 */
$cal27Abbr = substr($cal27['name'], 0, 3);
$cal27Deco = $cal27['deco'] ?? 'dot';
$cal27Play = $cal27View === 'play';
$cal27NextName = $cal27Num === 12 ? 'January' : array_values(cal27_months())[$cal27Num]['name'];
$cal27PlayUrl = 'https://peopleshr.com/calendar-2027/' . $cal27Slug . '-play/';
$cal27Field = function ($p) {
    return '<label for="' . $p . '-name">Full name<input id="' . $p . '-name" required placeholder="Nadeesha Perera" autocomplete="name"></label>'
        . '<label for="' . $p . '-co">Company<input id="' . $p . '-co" required placeholder="Company name" autocomplete="organization"></label>'
        . '<label for="' . $p . '-role">Job title<input id="' . $p . '-role" placeholder="HR Manager" autocomplete="organization-title"></label>'
        . '<label for="' . $p . '-mail">Work email<input id="' . $p . '-mail" type="email" required placeholder="name@company.lk" autocomplete="email"></label>'
        . '<button class="btn primary full" type="submit">Submit my entry</button>';
};
$cal27Legal = '<p class="cal27-legal">By entering you agree that PeoplesHR may use these details to run the ' . $cal27['name']
    . ' draw and contact the winner. See our <a href="/privacy-policy/">privacy policy</a>.</p>';
?>
<?php if ($cal27Deco === 'heart'): ?>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="cal27hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF5C8A"/><stop offset="1" stop-color="#FF8A2A"/></linearGradient></defs></svg>
<?php endif; ?>
<div class="cal27-scope<?php echo !empty($cal27['pink']) ? ' cal27-pink' : ''; ?>" id="cal27Entry"
  data-view="<?php echo $cal27View; ?>" data-month="<?php echo $cal27Num; ?>" data-slug="<?php echo $cal27Slug; ?>"
  data-name="<?php echo $cal27['name']; ?>" data-noun="<?php echo $cal27['noun']; ?>"
  data-portal="<?php echo CAL27_HS_PORTAL; ?>" data-form="<?php echo CAL27_HS_FORM_ID; ?>" data-photo-field="<?php echo CAL27_HS_PHOTO_FIELD; ?>"
  data-play-url="<?php echo $cal27PlayUrl; ?>" data-wa="<?php echo htmlspecialchars($cal27['wa'] ?? ''); ?>"
  data-play-label="<?php echo htmlspecialchars($cal27['play_label'] ?? ''); ?>" data-play-done="<?php echo htmlspecialchars($cal27['play_done'] ?? ''); ?>">
  <canvas id="fx" aria-hidden="true"></canvas>
  <div class="wrap">
    <header class="month"><h1><?php echo $cal27Abbr; ?><?php
      if ($cal27Deco === 'heart') {
          echo '<span class="heart" aria-hidden="true"><svg viewBox="0 0 24 22"><path fill="url(#cal27hg)" d="M12 21.2 10.6 20C5.4 15.4 2 12.4 2 8.6 2 5.5 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.5 22 8.6c0 3.8-3.4 6.8-8.6 11.4z"/></svg></span>';
      } elseif ($cal27Deco === 'sun') {
          echo '<span class="sun" aria-hidden="true"><svg viewBox="0 0 64 64" aria-hidden="true" style="display:block;flex:none">';
          foreach (['M53.7 28.5 L62.0 32.0 L53.7 35.5 Z','M52.6 39.8 L58.0 47.0 L49.1 45.9 Z','M45.9 49.1 L47.0 58.0 L39.8 52.6 Z','M35.5 53.7 L32.0 62.0 L28.5 53.7 Z','M24.2 52.6 L17.0 58.0 L18.1 49.1 Z','M14.9 45.9 L6.0 47.0 L11.4 39.8 Z','M10.3 35.5 L2.0 32.0 L10.3 28.5 Z','M11.4 24.2 L6.0 17.0 L14.9 18.1 Z','M18.1 14.9 L17.0 6.0 L24.2 11.4 Z','M28.5 10.3 L32.0 2.0 L35.5 10.3 Z','M39.8 11.4 L47.0 6.0 L45.9 14.9 Z','M49.1 18.1 L58.0 17.0 L52.6 24.2 Z'] as $ray) {
              echo '<path d="' . $ray . '" fill="#FF9F1C"></path>';
          }
          echo '<circle cx="32" cy="32" r="18" fill="#FFD23F" stroke="#F4A100" stroke-width="2"></circle><path d="M24 30 Q26.5 27.5 29 30" fill="none" stroke="#7A4A00" stroke-width="2" stroke-linecap="round"></path><path d="M35 30 Q37.5 27.5 40 30" fill="none" stroke="#7A4A00" stroke-width="2" stroke-linecap="round"></path><path d="M26.5 36 Q32 41 37.5 36" fill="none" stroke="#7A4A00" stroke-width="2" stroke-linecap="round"></path><circle cx="23.5" cy="35" r="2.4" fill="#FF8FA3" opacity="0.8"></circle><circle cx="40.5" cy="35" r="2.4" fill="#FF8FA3" opacity="0.8"></circle></svg></span>';
      } else {
          echo '<span class="dot">.</span>';
      }
    ?><span class="yr"><?php echo CAL27_YEAR; ?></span></h1></header>
    <div class="rule" aria-hidden="true"></div>

    <div class="cal27-state" data-state="open">
<?php if (!$cal27Play): ?>
      <!-- Scan view: from the QR on the printed calendar -->
      <section class="card" id="snap">
        <ol class="steps" id="phys-steps"><li class="on"><i>1</i>Snap</li><li><i>2</i>Your details</li><li><i>3</i><?php echo $cal27['share'] ? 'Share' : "You're in"; ?></li></ol>
        <h2><?php echo htmlspecialchars($cal27['snap']); ?></h2>
        <p class="prize">WIN A TREAT TO SHARE!</p>
        <label class="cam" id="cam" for="f-photo">
          <svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>
          <b>Take a photo of your answer</b>
          <input id="f-photo" type="file" accept="image/*" capture="environment">
        </label>
        <div class="shot" id="shot" hidden>
          <img id="prev-img" alt="Your <?php echo $cal27['noun']; ?> photo">
          <div class="bar"><p class="ok">Looks good!</p><button class="link" type="button" id="retake">Retake photo</button></div>
        </div>
        <div id="phys-form-wrap" class="locked">
          <form class="details" id="phys-form"><?php echo $cal27Field('p'); ?></form>
        </div>
        <p class="status" id="phys-msg" aria-live="polite"></p>
        <?php echo $cal27Legal; ?>
      </section>
<?php else: ?>
      <!-- Play view: the link a colleague shared -->
      <section class="card" id="online">
        <ol class="steps" id="on-steps"><li class="on"><i>1</i><?php echo $cal27['play_step']; ?></li><li><i>2</i>Your details</li><li><i>3</i>You're in</li></ol>
        <p class="from"><?php echo $cal27['play_from']; ?></p>
        <h2><?php echo $cal27['play_h']; ?></h2>
        <p class="prize">WIN A TREAT TO SHARE!</p>
        <p class="lede"><?php echo $cal27['play_lede']; ?></p>
<?php if ($cal27['game'] === 'Crossword'): ?>
        <div class="meter"><div class="track"><i id="meter"></i></div><b id="meter-n">0 / 8</b></div>
        <div class="board"><div class="xw" id="xw" aria-label="Crossword grid"></div></div>
        <p class="now" id="now"></p>
        <div class="clues">
          <div><h4>Across</h4><ol id="across"></ol></div>
          <div><h4>Down</h4><ol id="down"></ol></div>
        </div>
        <p class="tip">A few letters are filled in to get you started. Leave out spaces.</p>
<?php else: ?>
        <div class="meter"><div class="track"><i id="meter"></i></div><b id="meter-n">0 / 6</b></div>
        <div class="board"><div class="ws" id="ws" aria-label="Word search grid"></div></div>
        <p class="now" id="ws-msg" aria-live="polite">Tap a first letter to start.</p>
        <ul class="wl" id="wl"></ul>
<?php endif; ?>
        <div id="on-form-wrap" class="locked">
          <form class="details" id="on-form"><?php echo $cal27Field('o'); ?></form>
        </div>
        <p class="status" id="on-msg" aria-live="polite"></p>
        <?php echo $cal27Legal; ?>
      </section>
<?php endif; ?>

      <!-- Done -->
      <section id="done" hidden>
        <div class="ticket"><div class="in">
          <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
            <p class="eyebrow">Entry received</p>
            <h2>You're in the <?php echo $cal27['name']; ?> draw. <span><?php echo htmlspecialchars($cal27['tag']); ?></span></h2>
<?php if ($cal27['share'] && !$cal27Play): ?>
            <div class="sharebox">
              <h3><?php echo htmlspecialchars($cal27['share_h']); ?></h3>
              <p><?php echo htmlspecialchars($cal27['share_p']); ?></p>
              <div class="linkrow">
                <input id="share-link" readonly aria-label="Link to the online game" value="<?php echo $cal27PlayUrl; ?>">
                <button class="btn" type="button" id="copy">Copy link</button>
              </div>
              <a class="wa" id="wa" href="https://wa.me/?text=<?php echo rawurlencode($cal27['wa'] . $cal27PlayUrl); ?>" target="_blank" rel="noopener">Share on WhatsApp</a>
              <p class="status" id="copy-msg" aria-live="polite"></p>
            </div>
<?php endif; ?>
            <dl><dt>Name</dt><dd id="t-name"></dd><dt>Company</dt><dd id="t-co"></dd><?php if ($cal27['share']): ?><dt>Entry</dt><dd id="t-route"></dd><?php endif; ?></dl>
            <p class="note">We'll announce the winner in early <?php echo $cal27NextName; ?>.</p>
          </div>
        </div></div>
      </section>
    </div>

    <section class="card cal27-state cal27-closed" data-state="before" hidden>
      <p class="eyebrow">Opens 1 <?php echo $cal27['name'] . ' ' . CAL27_YEAR; ?></p>
      <h2>The <?php echo $cal27['name']; ?> game isn't open yet.</h2>
      <p class="lede">Scan the QR code on your calendar to play this month's game.</p>
      <a class="btn primary" href="/calendar/">Go to this month's game</a>
    </section>
    <section class="card cal27-state cal27-closed" data-state="after" hidden>
      <p class="eyebrow">Entries closed</p>
      <h2>Entries for <?php echo $cal27['name']; ?> closed on <?php echo $cal27Last . ' ' . $cal27['name']; ?>.</h2>
      <p class="lede"><?php echo $cal27Next ? 'The ' . $cal27Next . ' game is open now.' : 'Thanks for playing along all year.'; ?></p>
      <a class="btn primary" href="/calendar/"><?php echo $cal27Next ? "Go to this month's game" : 'See you in 2028'; ?></a>
    </section>
    <noscript><p class="lede">Please turn on JavaScript to send your entry.</p></noscript>
  </div>
  <div id="cal27Hs" class="cal27-hs" aria-hidden="true"></div>
</div>
