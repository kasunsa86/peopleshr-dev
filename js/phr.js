/* intractive-demo - page JS */
(function(){
  var tabs=document.querySelectorAll('.module-tab');
  function go(id){
    tabs.forEach(function(t){t.classList.remove('active');});
    document.querySelectorAll('.preview-content').forEach(function(p){p.classList.remove('active');});
    var t=document.querySelector('.module-tab[data-module="'+id+'"]');
    if(t) t.classList.add('active');
    var p=document.getElementById('preview-'+id);
    if(p) p.classList.add('active');
  }
  tabs.forEach(function(tab){
    tab.addEventListener('click',function(){go(tab.getAttribute('data-module'));});
  });
}());

(function(){
  const track = document.getElementById('testimonial-track');
  if(!track) return; // guard: element absent on non-homepage pages

  const dots = document.querySelectorAll('#t-dots .t-dot');
  const prev = document.getElementById('t-prev');
  const next = document.getElementById('t-next');
  const total = dots.length;
  let current = 0;
  let autoTimer;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if(prev) prev.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  if(next) next.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetAuto(); }));

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if(Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
  });

  function resetAuto() { clearInterval(autoTimer); autoTimer = setInterval(() => goTo(current + 1), 5000); }
  resetAuto();
})();

const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
if(hamburger && mobileNav){
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
}

[['mob-customers-toggle','mob-customers-sub'],['mob-learn-toggle','mob-learn-sub'],['mob-company-toggle','mob-company-sub'],['mob-pricing-toggle','mob-pricing-sub']].forEach(([tid, sid]) => {
  const toggle = document.getElementById(tid);
  const sub = document.getElementById(sid);
  if(toggle && sub) toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    sub.classList.toggle('open');
  });
});
const mobProductToggle = document.getElementById('mob-product-toggle');
const mobProductSub = document.getElementById('mob-product-sub');
if(mobProductToggle && mobProductSub){
  mobProductToggle.addEventListener('click', () => {
    mobProductToggle.classList.toggle('open');
    mobProductSub.classList.toggle('open');
  });
}

/* Footer accordion -- wraps each .ft-col's heading + links (Products,
   Industries, Resources, Calculators, ...) into a clickable .ft-acc-btn
   / .ft-acc-body pair, mirroring the .nv-acc pattern already used for the
   mobile nav panel. Runs unconditionally (cheap DOM move, no page-specific
   markup needed) -- the CSS in footer.css only actually collapses the
   sections at <=680px, so desktop/tablet render exactly as before. Footer
   markup is duplicated across every page rather than a shared include, so
   this is done at runtime instead of touching ~80 files. */
document.querySelectorAll('.ft-top > .ft-col').forEach((col, i) => {
  const heading = col.querySelector(':scope > .ft-h');
  if(!heading) return;

  const inner = document.createElement('div');
  inner.className = 'ft-acc-inner';
  while(heading.nextSibling) inner.appendChild(heading.nextSibling);

  const body = document.createElement('div');
  body.className = 'ft-acc-body';
  body.id = 'ft-acc-body-' + i;
  body.appendChild(inner);
  col.appendChild(body);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ft-acc-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', body.id);
  btn.innerHTML = heading.innerHTML +
    '<svg class="ft-acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  heading.innerHTML = '';
  heading.appendChild(btn);

  btn.addEventListener('click', () => {
    const open = col.classList.toggle('ft-acc-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});

window.addEventListener('resize', () => {
  if(hamburger && mobileNav && window.innerWidth > 768) {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }
});

const phrScriptTag = document.currentScript;
const phrAssetBase = phrScriptTag ? phrScriptTag.src.replace(/js\/phr\.js(?:[?#].*)?$/, '') : '';

/* Logo marquee: keeps the CSS translateX(-50%) loop (.logo-slider-track /
   .logo-track, see styles.css) seamless when a page only has a handful of
   client logos. The markup already duplicates its logo list once so the
   loop can wrap (first half === second half); on a wide screen that single
   half can be narrower than the viewport, so the track visibly runs out of
   logos before it wraps back around. Repeats the underlying set until each
   half is at least as wide as its container, and stretches the animation
   duration by the same factor so the scroll speed stays the same. Tracks
   that already have enough logos to fill the screen are left untouched. */
function parseSeconds(v) {
  const n = parseFloat(v);
  if (Number.isNaN(n)) return null;
  return v.trim().endsWith('ms') ? n / 1000 : n;
}
function ensureSeamlessLogoLoop(track) {
  if (!track) return;
  const children = Array.from(track.children);
  if (!children.length || children.length % 2 !== 0) return;
  const half = children.length / 2;
  const firstHalfHTML = children.slice(0, half).map(el => el.outerHTML).join('');
  const secondHalfHTML = children.slice(half).map(el => el.outerHTML).join('');
  if (firstHalfHTML !== secondHalfHTML) return; // not the expected "duplicated once" shape

  const container = track.closest('.logo-scroller, .client-logos') || track.parentElement;
  const targetWidth = Math.max(container ? container.clientWidth : 0, window.innerWidth);
  const unitWidth = track.scrollWidth / 2;
  if (!targetWidth || !unitWidth) return;

  let repeats = 1;
  while (unitWidth * repeats < targetWidth && repeats < 12) repeats++;
  if (repeats <= 1) return;

  const oneHalf = firstHalfHTML.repeat(repeats);
  track.innerHTML = oneHalf + oneHalf;

  const currentDuration = parseSeconds(getComputedStyle(track).animationDuration);
  if (currentDuration) track.style.animationDuration = (currentDuration * repeats) + 's';
}
document.querySelectorAll('.logo-slider-track, .logo-track:not(.logo-track--static)').forEach(ensureSeamlessLogoLoop);

const industryLogos = {
  manufacturing: [
    '<img src="uploads/2026/04/bitumix.webp" alt="Bitumix" loading="lazy"/>',
    '<img src="uploads/2026/04/arpico.webp" alt="Arpico" loading="lazy"/>',
    '<img src="uploads/2026/04/acme.webp" alt="Acme" loading="lazy"/>',
    '<img src="uploads/2026/04/Ultratech.webp" alt="Ultratech" loading="lazy"/>',
    '<img src="uploads/2026/04/tropicoir.webp" alt="Tropicoir" loading="lazy"/>',
    '<img src="uploads/2026/04/TokyoCement.webp" alt="Tokyo Cement" loading="lazy"/>',
    '<img src="uploads/2026/04/sunagro.webp" alt="Sunagro" loading="lazy"/>',
    '<img src="uploads/2026/04/specialsteels.webp" alt="Special Steels" loading="lazy"/>',
    '<img src="uploads/2026/04/pyramidwilmar.webp" alt="Pyramid Wilmar" loading="lazy"/>',
    '<img src="uploads/2026/04/prym.webp" alt="Prym" loading="lazy"/>',
    '<img src="uploads/2026/04/phoenix.webp" alt="Phoenix" loading="lazy"/>',
    '<img src="uploads/2026/04/microminerals.webp" alt="Micro Minerals" loading="lazy"/>',
    '<img src="uploads/2026/04/laxapana.webp" alt="Laxapana" loading="lazy"/>',
    '<img src="uploads/2026/04/lankem.webp" alt="Lankem" loading="lazy"/>',
    '<img src="uploads/2026/04/lakro.webp" alt="Lakro" loading="lazy"/>',
    '<img src="uploads/2026/04/kvc.webp" alt="KVC" loading="lazy"/>',
    '<img src="uploads/2026/04/kotagala.webp" alt="Kotagala" loading="lazy"/>',
    '<img src="uploads/2026/04/kiffs.webp" alt="KIFFS" loading="lazy"/>',
    '<img src="uploads/2026/04/Fonterra.webp" alt="Fonterra" loading="lazy"/>',
    '<img src="uploads/2026/04/euorosubstrates.webp" alt="Euro Substrates" loading="lazy"/>',
    '<img src="uploads/2026/04/Delmege.webp" alt="Delmege" loading="lazy"/>',
    '<img src="uploads/2026/04/cwmackie.webp" alt="CW Mackie" loading="lazy"/>',
    '<img src="uploads/2026/04/ceytape.webp" alt="Ceytape" loading="lazy"/>',
    '<img src="uploads/2026/04/ceyflex.webp" alt="Ceyflex" loading="lazy"/>',
    '<img src="uploads/2026/04/CEAT.webp" alt="CEAT" loading="lazy"/>',
    '<img src="uploads/2026/04/brandix.webp" alt="Brandix" loading="lazy"/>',
  ],
  hospitality: [
    '<img src="uploads/2026/06/LaVie.webp" alt="LaVie" loading="lazy"/>',
    '<img src="uploads/2026/06/Pratesis.webp" alt="Pratesis" loading="lazy"/>',
    '<img src="uploads/2026/06/Sunlight.webp" alt="Sunlight" loading="lazy"/>',
    '<img src="uploads/2026/04/Anantara.webp" alt="Anantara" loading="lazy"/>',
    '<img src="uploads/2026/04/avani.webp" alt="Avani" loading="lazy"/>',
    '<img src="uploads/2026/04/ayura-wellness.webp" alt="Ayura Wellness" loading="lazy"/>',
    '<img src="uploads/2026/04/club-palm-bay.webp" alt="Club Palm Bay" loading="lazy"/>',
    '<img src="uploads/2026/04/Galle-Fort-Hotel.webp" alt="Galle Fort Hotel" loading="lazy"/>',
    '<img src="uploads/2026/04/Kings-Pavilion.webp" alt="Kings Pavilion" loading="lazy"/>',
    '<img src="uploads/2026/04/sigiriya-village.webp" alt="Sigiriya Village" loading="lazy"/>',
    '<img src="uploads/2026/04/The-Palms.webp" alt="The Palms" loading="lazy"/>',
    '<img src="uploads/2026/04/Thotagala.webp" alt="Thotagala" loading="lazy"/>',
  ],
  banking: [
    '<img src="uploads/2026/04/arpico-insurance.webp" alt="Arpico Insurance" loading="lazy"/>',
    '<img src="uploads/2026/04/Beckett-Capital.webp" alt="Beckett Capital" loading="lazy"/>',
    '<img src="uploads/2026/04/first-capital.webp" alt="First Capital" loading="lazy"/>',
    '<img src="uploads/2026/04/lcb-finance.webp" alt="LCB Finance" loading="lazy"/>',
    '<img src="uploads/2026/04/NDB-bank.webp" alt="NDB Bank" loading="lazy"/>',
    '<img src="uploads/2026/04/Orient-Finance.webp" alt="Orient Finance" loading="lazy"/>',
    '<img src="uploads/2026/04/peoplesbank.webp" alt="Peoples Bank" loading="lazy"/>',
  ],
  retail: [
    '<img src="uploads/2026/04/akbar.webp" alt="Akbar" loading="lazy"/>',
    '<img src="uploads/2026/04/arpico.webp" alt="Arpico" loading="lazy"/>',
    '<img src="uploads/2026/04/Fonterra.webp" alt="Fonterra" loading="lazy"/>',
    '<img src="uploads/2026/04/keells.webp" alt="Keells" loading="lazy"/>',
  ],
  healthcare: [
    '<img src="uploads/2026/04/ambicaglobal.webp" alt="Ambica Global" loading="lazy"/>',
    '<img src="uploads/2026/04/healthguard.webp" alt="Healthguard" loading="lazy"/>',
    '<img src="uploads/2026/04/sun-pharma.webp" alt="Sun Pharma" loading="lazy"/>',
    '<img src="uploads/2026/04/sunshine.webp" alt="Sunshine" loading="lazy"/>',
    '<img src="uploads/2026/04/UY-Dental.webp" alt="UY Dental" loading="lazy"/>',
    '<img src="uploads/2026/04/visioncare.webp" alt="Visioncare" loading="lazy"/>',
    '<img src="uploads/2026/04/Dispensing-Opticians.webp" alt="Dispensing Opticians" loading="lazy"/>',
    '<img src="uploads/2026/04/Lanka-Hospitals.webp" alt="Lanka Hospitals" loading="lazy"/>',
    '<img src="uploads/2026/04/B-Braun.webp" alt="B Braun" loading="lazy"/>',
    '<img src="uploads/2026/04/Browns-Hospitals.webp" alt="Browns Hospitals" loading="lazy"/>',
    '<img src="uploads/2026/04/Mount-Lotus.webp" alt="Mount Lotus" loading="lazy"/>',
  ],
  it: [
    '<img src="uploads/2026/04/zillion-e.webp" alt="Zillione" loading="lazy"/>',
    '<img src="uploads/2026/04/Tellda.webp" alt="Tellda" loading="lazy"/>',
    '<img src="uploads/2026/04/nable.webp" alt="Nable" loading="lazy"/>',
    '<img src="uploads/2026/04/inivos.webp" alt="Inivos" loading="lazy"/>',
  ],
  logistics: [
    '<img src="uploads/2026/04/mclarens-group.webp" alt="McLarens Group" loading="lazy"/>',
    '<img src="uploads/2026/04/oki-oki.webp" alt="Oki Oki" loading="lazy"/>',
    '<img src="uploads/2026/04/sri-lankan-airlines.webp" alt="SriLankan Airlines" loading="lazy"/>',
    '<img src="uploads/2026/04/transmaldivian-airways.webp" alt="Trans Maldivian Airways" loading="lazy"/>',
    '<img src="uploads/2026/04/advantis.webp" alt="Advantis" loading="lazy"/>',
    '<img src="uploads/2026/04/aitkenspence.webp" alt="Aitken Spence" loading="lazy"/>',
    '<img src="uploads/2026/04/ansell.webp" alt="Ansell" loading="lazy"/>',
    '<img src="uploads/2026/04/efl.webp" alt="EFL" loading="lazy"/>',
  ],
};

const logosContainer = document.getElementById('client-logos-container');
if(logosContainer){ // guard: element absent on non-homepage pages

  function renderLogos(industry) {
    const logos = industryLogos[industry] || [];

    logosContainer.style.opacity = '0';
    logosContainer.style.transition = 'opacity 0.2s ease';

    setTimeout(() => {
      const items = logos.map(l => `<span class="client-logo">${l.replace('src="uploads/', 'src="' + phrAssetBase + 'uploads/')}</span>`).join('');
      logosContainer.innerHTML = `<div class="logo-slider-track">${items}${items}</div>`;

      const duration = logos.length * 2.2;
      const track = logosContainer.querySelector('.logo-slider-track');
      track.style.animationDuration = duration + 's';
      ensureSeamlessLogoLoop(track); // pads out industries with only a few logos (e.g. retail, it)

      logosContainer.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
      logosContainer.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');

      logosContainer.style.transition = 'opacity 0.35s ease';
      logosContainer.style.opacity = '1';
    }, 200);
  }

  document.querySelectorAll('.industry-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.industry-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderLogos(tab.dataset.industry);
    });
  });

  const activeTab = document.querySelector('.industry-tab.active');
  if(activeTab) renderLogos(activeTab.dataset.industry);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.module-card, .persona-card, .cs-card, .feature-item, .case-card, .chro-col').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

(function(){
  const items = document.querySelectorAll('.pillar-item');
  if(!items.length) return; // guard: element absent on non-CHRO pages

  items.forEach(item => {
    item.addEventListener('toggle', function(){
      if(!this.open) return;

      items.forEach(other => {
        if(other !== this && other.open) other.removeAttribute('open');
      });

      const top = this.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

(function(){
  if(!('IntersectionObserver' in window)) return;
  var wbrObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        wbrObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.wbr-agenda-card, .wbr-getting-card').forEach(function(el){
    requestAnimationFrame(function(){
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      wbrObserver.observe(el);
    });
  });

  setTimeout(function(){
    document.querySelectorAll('.wbr-agenda-card, .wbr-getting-card').forEach(function(el){
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, 2000);
})();

(function(){'use strict';var ProductsPage={initFaq:function(){var triggers=document.querySelectorAll('.phr-faq-item__trigger');triggers.forEach(function(btn){btn.addEventListener('click',function(){var item=btn.closest('.phr-faq-item');var group=item.closest('.phr-faq')||document;var body=item.querySelector('.phr-faq-item__body');var isOpen=item.classList.contains('phr-faq-item--open');group.querySelectorAll('.phr-faq-item--open').forEach(function(el){el.classList.remove('phr-faq-item--open');el.querySelector('.phr-faq-item__body').style.maxHeight='0';el.querySelector('.phr-faq-item__trigger').setAttribute('aria-expanded','false')});if(!isOpen){item.classList.add('phr-faq-item--open');body.style.maxHeight=body.scrollHeight+'px';btn.setAttribute('aria-expanded','true')}})})},init:function(){this.initFaq()}};document.addEventListener('DOMContentLoaded',function(){ProductsPage.init()});}());

const LAZY_SECTIONS = {
  pay:        `      <div class="dg-cat-header">
        <div class="dg-cat-header-left">
          <h2 class="dg-section-heading">Accurate payroll. Zero compliance risk.</h2>
          <p class="dg-cat-desc">From timesheets to final payslips, automate your entire payroll cycle with built-in statutory compliance for Sri Lanka and beyond.</p>
        </div>
        <div class="dg-cat-count-box">
          <div class="dg-cat-count-num">3</div>
          <div class="dg-cat-count-lbl">Demos available</div>
        </div>
      </div>
      <div class="dg-grid">
        <div class="dg-card" onclick="gatedDemo('REPLACE_PAY_RUN_ID')">
          <div class="dg-thumb dg-thumb-timepay">
            <div class="dg-thumb-ui">
              <div class="dg-ui-bar"></div>
              <div class="dg-ui-row"><div class="dg-ui-pill"></div><div class="dg-ui-pill w55"></div></div>
              <div class="dg-ui-bar s"></div>
            </div>
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Payroll</div>
            <div class="dg-card-title">Payroll Processing &amp; Monthly Run</div>
            <div class="dg-card-desc">One-click payroll runs with automatic EPF/ETF, PAYE calculations, and bank file generation for all major Sri Lankan banks.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        <div class="dg-card" onclick="gatedDemo('REPLACE_PAY_LEAVE_ID')">
          <div class="dg-thumb dg-thumb-timepay">
            <div class="dg-thumb-ui">
              <div class="dg-ui-bar"></div>
              <div class="dg-ui-row"><div class="dg-ui-pill"></div><div class="dg-ui-pill w55"></div></div>
              <div class="dg-ui-bar s"></div>
            </div>
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Leave</div>
            <div class="dg-card-title">Leave &amp; Absence Management</div>
            <div class="dg-card-desc">Configure leave policies, approval workflows, accrual rules, and carry-forward limits, all without IT support.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        <div class="dg-card" onclick="gatedDemo('REPLACE_PAY_EXPENSE_ID')">
          <div class="dg-thumb dg-thumb-timepay">
            <div class="dg-thumb-ui">
              <div class="dg-ui-bar"></div>
              <div class="dg-ui-row"><div class="dg-ui-pill"></div><div class="dg-ui-pill w55"></div></div>
              <div class="dg-ui-bar s"></div>
            </div>
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Expenses</div>
            <div class="dg-card-title">Expense Claims &amp; Reimbursement</div>
            <div class="dg-card-desc">Mobile receipt capture, multi-level approvals, and direct payroll integration for seamless reimbursements.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
      </div>`,
  time:       `      <div class="dg-cat-header">
        <div class="dg-cat-header-left">
          <h2 class="dg-section-heading">Real-time visibility across every hour worked.</h2>
          <p class="dg-cat-desc">Biometric integrations, shift scheduling, overtime controls, and live attendance dashboards across every site and shift pattern.</p>
        </div>
        <div class="dg-cat-count-box">
          <div class="dg-cat-count-num">2</div>
          <div class="dg-cat-count-lbl">Demos available</div>
        </div>
      </div>
      <div class="dg-grid">
        <div class="dg-card" onclick="gatedDemo('cmov2pgrk05pu9rr9ct8hjufa')">
          <div class="dg-thumb dg-thumb-timepay">
            <img src="../uploads/2026/05/Manage_Leave_Applications_Approvals.webp" alt="Manage Leave Applications & Approvals" class="dg-thumb-image">
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            <div class="dg-thumb-new"><span class="new-tag">NEW</span></div>
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Leave</div>
            <div class="dg-card-title">Manage Leave Applications &amp; Approvals</div>
            <div class="dg-card-desc">Request leave, approve pending applications, and review leave analytics, all in one streamlined workflow.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        <div class="dg-card" onclick="gatedDemo('cmovhp1dj13hj9rr9on8k7xga')">
          <div class="dg-thumb dg-thumb-timepay">
            <img src="../uploads/2026/05/Configure_Employee_Shift_Schedules_Roster_Groups.webp" alt="Configure Employee Shift Schedules & Roster Groups" class="dg-thumb-image">
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Attendance</div>
            <div class="dg-card-title">Configure Employee Shift Schedules &amp; Roster Groups</div>
            <div class="dg-card-desc">Assign employees to schedules by setting up roster groups, configuring shift parameters with breaks and overtime rules.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
      </div>`,
  talent:     `      <div class="dg-cat-header">
        <div class="dg-cat-header-left">
          <h2 class="dg-section-heading">Hire faster. Develop better. Retain longer.</h2>
          <p class="dg-cat-desc">From the first application to succession planning, build a high-performance talent engine that scales with your business.</p>
        </div>
        <div class="dg-cat-count-box">
          <div class="dg-cat-count-num">6</div>
          <div class="dg-cat-count-lbl">Demos available</div>
        </div>
      </div>

      <div class="dg-subcat">
        <div class="dg-subcat-header">
          <span class="dg-subcat-label">Hiring Manager</span>
          <span class="dg-subcat-pill">4 demos</span>
        </div>
        <div class="dg-grid">
        <div class="dg-card" onclick="gatedDemo('cmkgfw53z0001yg0ihojce4xw')">
          <div class="dg-thumb dg-thumb-talent">
            <img src="../uploads/2026/05/Job_Requisition.webp" alt="Job Requisitions" class="dg-thumb-image">
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Recruitment</div>
            <div class="dg-card-title">Job Requisitions</div>
            <div class="dg-card-desc">Create and manage job requisitions, define role requirements, and route approval requests before opening a vacancy.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        <div class="dg-card" onclick="gatedDemo('cmk0rq2ut1l9sgmn87oxiogg8')">
          <div class="dg-thumb dg-thumb-talent">
            <img src="../uploads/2026/05/Job_Advertisements.webp" alt="Job Advertisements" class="dg-thumb-image">
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Recruitment</div>
            <div class="dg-card-title">Job Advertisements</div>
            <div class="dg-card-desc">Publish open roles across multiple job boards and channels directly from PeoplesHR with a few clicks.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        <div class="dg-card" onclick="gatedDemo('cmk12fd6t1sr9gmn80bzrju5e')">
          <div class="dg-thumb dg-thumb-talent">
            <img src="../uploads/2026/05/CV_Ranking.webp" alt="CV Ranking" class="dg-thumb-image">
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Recruitment</div>
            <div class="dg-card-title">CV Ranking</div>
            <div class="dg-card-desc">Let AI score and rank candidates against your job criteria automatically, so your team focuses on the best-fit applicants first.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        </div>

      <div class="dg-subcat">
        <div class="dg-subcat-header">
          <span class="dg-subcat-label">Candidate</span>
          <span class="dg-subcat-pill">2 demos</span>
        </div>
        <div class="dg-grid">
        <div class="dg-card" onclick="gatedDemo('cmk2d4gcs325agmn8p2684u2s')">
          <div class="dg-thumb dg-thumb-talent">
            <img src="../uploads/2026/05/Manage_Job_Application.webp" alt="Manage Job Application" class="dg-thumb-image">
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Recruitment</div>
            <div class="dg-card-title">Manage Job Application</div>
            <div class="dg-card-desc">See how candidates track, manage, and update their applications through the PeoplesHR candidate portal.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        <div class="dg-card" onclick="gatedDemo('cmk0wamcb1n1dgmn8uxzyt7rg')">
          <div class="dg-thumb dg-thumb-talent">
            <img src="../uploads/2026/05/Candidate_Application.webp" alt="Candidate Application" class="dg-thumb-image">
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Recruitment</div>
            <div class="dg-card-title">Candidate Application</div>
            <div class="dg-card-desc">Experience the candidate application journey first-hand, from discovering a role to submitting a complete application.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        </div>
      </div>`,
  engagement: `      <div class="dg-cat-header">
        <div class="dg-cat-header-left">
          <h2 class="dg-section-heading">Build a culture people don't want to leave.</h2>
          <p class="dg-cat-desc">Measure, understand, and act on employee sentiment in real time, so you can fix problems before they become attrition.</p>
        </div>
        <div class="dg-cat-count-box">
          <div class="dg-cat-count-num">3</div>
          <div class="dg-cat-count-lbl">Demos available</div>
        </div>
      </div>
      <div class="dg-grid">
        <div class="dg-card" onclick="gatedDemo('REPLACE_ENGAGEMENT_SURVEYS_ID')">
          <div class="dg-thumb dg-thumb-engage">
            <div class="dg-thumb-ui">
              <div class="dg-ui-bar"></div>
              <div class="dg-ui-row"><div class="dg-ui-pill"></div><div class="dg-ui-pill w55"></div></div>
              <div class="dg-ui-bar s"></div>
            </div>
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Engagement</div>
            <div class="dg-card-title">Employee Surveys &amp; Pulse Checks</div>
            <div class="dg-card-desc">Deploy pulse surveys, eNPS, and custom questionnaires, then visualise sentiment trends in real-time dashboards.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        <div class="dg-card" onclick="gatedDemo('REPLACE_ENGAGEMENT_RECOGNITION_ID')">
          <div class="dg-thumb dg-thumb-engage">
            <div class="dg-thumb-ui">
              <div class="dg-ui-bar"></div>
              <div class="dg-ui-row"><div class="dg-ui-pill"></div><div class="dg-ui-pill w55"></div></div>
              <div class="dg-ui-bar s"></div>
            </div>
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            <div class="dg-thumb-new"><span class="new-tag">NEW</span></div>
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Recognition</div>
            <div class="dg-card-title">Recognition &amp; Rewards Programme</div>
            <div class="dg-card-desc">Peer-to-peer shoutouts, manager nominations, milestone awards, and a points-based reward marketplace, all in-platform.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        <div class="dg-card" onclick="gatedDemo('REPLACE_ENGAGEMENT_MANAGER_ID')">
          <div class="dg-thumb dg-thumb-engage">
            <div class="dg-thumb-ui">
              <div class="dg-ui-bar"></div>
              <div class="dg-ui-row"><div class="dg-ui-pill"></div><div class="dg-ui-pill w55"></div></div>
              <div class="dg-ui-bar s"></div>
            </div>
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Manager Intelligence</div>
            <div class="dg-card-title">Manager Effectiveness Scores</div>
            <div class="dg-card-desc">Track team-level eNPS, 1:1 completion rates, and upward feedback scores to surface your best (and riskiest) managers.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
      </div>`,
  insight:    `      <div class="dg-cat-header">
        <div class="dg-cat-header-left">
          <h2 class="dg-section-heading">Turn your people data into strategic decisions.</h2>
          <p class="dg-cat-desc">Real-time workforce intelligence, from pre-built dashboards to AI-powered natural language queries with Lexi, your HR copilot.</p>
          <div class="lexi-powered-badge">
            <span class="lpb-text">Powered by</span>
            <img src="../uploads/2026/05/lexi-s.png" alt="Lexi" class="lpb-logo-img">
          </div>
        </div>
        <div class="dg-cat-count-box">
          <div class="dg-cat-count-num">3</div>
          <div class="dg-cat-count-lbl">Demos available</div>
        </div>
      </div>
      <div class="dg-grid">
        <div class="dg-card" onclick="gatedDemo('cmsr2xph3023azj0jppp4zqmc')">
          <div class="dg-thumb dg-thumb-insights">
            <img src="../uploads/2026/10/contracted-hours-analysis.webp" alt="Lexi AI Insights: departments working beyond contracted hours" class="dg-thumb-image">
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            <div class="dg-thumb-new"><span class="new-tag">NEW</span></div>
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Lexi AI Insights</div>
            <div class="dg-card-title">Which Departments Work Beyond Contracted Hours?</div>
            <div class="dg-card-desc">Ask Lexi in plain language and instantly see which departments are consistently working beyond their contracted hours.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        <div class="dg-card" onclick="gatedDemo('cmsr026bi0c1xqmm7mxnkwwam')">
          <div class="dg-thumb dg-thumb-insights">
            <img src="../uploads/2026/10/promotion-retention-analysis.webp" alt="Lexi AI Insights: are promoted employees more likely to stay" class="dg-thumb-image">
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            <div class="dg-thumb-new"><span class="new-tag">NEW</span></div>
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Lexi AI Insights</div>
            <div class="dg-card-title">Are Promoted Employees More Likely to Stay?</div>
            <div class="dg-card-desc">See how Lexi connects promotion history with retention data to show whether promoted employees stay longer.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
        <div class="dg-card" onclick="gatedDemo('cmsr4wi1t029bzj0jot73obit')">
          <div class="dg-thumb dg-thumb-insights">
            <img src="../uploads/2026/10/workforce-insights-mobile.webp" alt="Lexi AI Insights on mobile" class="dg-thumb-image">
            <div class="dg-thumb-overlay"><div class="dg-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
            <div class="dg-thumb-new"><span class="new-tag">NEW</span></div>
          </div>
          <div class="dg-card-body">
            <div class="dg-card-tag">Mobile</div>
            <div class="dg-card-title">Lexi AI Insights on Mobile</div>
            <div class="dg-card-desc">Ask strategic workforce questions and get clear, data-driven insights directly from your mobile device.</div>
            <div class="dg-card-footer">
              <button class="dg-card-cta">Watch Demo <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </div>
        </div>
      </div>`
};

function ensureLoaded(cat) {
  var sec = document.getElementById('dg-' + cat);
  if (!sec || sec.getAttribute('data-loaded') !== 'false') return;
  sec.innerHTML = LAZY_SECTIONS[cat] || '';
  sec.setAttribute('data-loaded', 'true');
}

function activateCat(cat) {
  var tab = document.querySelector('.industry-tab[data-cat="' + cat + '"]');
  var sec = document.getElementById('dg-' + cat);
  if (!tab || !sec) return false;
  ensureLoaded(cat);
  document.querySelectorAll('.industry-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.dg-section').forEach(function(s) { s.classList.remove('visible'); });
  tab.classList.add('active');
  sec.classList.add('visible');
  return true;
}

var catsWrap;
var tIndex = 0, tTotal = 4;

function scrollToDemos() {
  var target = document.getElementById('demos');
  if (!target || !catsWrap) return;
  var wpHeader = document.querySelector('header.site-header, .site-header, #masthead, header') || { offsetHeight: 80 };
  var headerH = wpHeader.offsetHeight || 80;
  window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - catsWrap.offsetHeight - headerH, behavior: 'smooth' });
}
function scrollToContact() {
  var target = document.getElementById('dg-contact');
  if (!target) return;
  window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 24, behavior: 'smooth' });
}
function tGoTo(n) {
  tIndex = n;
  var track = document.getElementById('t-track');
  if (track) track.style.transform = 'translateX(-' + (tIndex * 100) + '%)';
  document.querySelectorAll('.t-dot').forEach(function(d, i) { d.classList.toggle('active', i === tIndex); });
}
function tSlide(dir) { tGoTo((tIndex + dir + tTotal) % tTotal); }

document.addEventListener('DOMContentLoaded', function() {
  catsWrap = document.querySelector('.dg-cats-wrap');

  var dgFormSection = document.getElementById('dg-contact');
  if (catsWrap && dgFormSection) {
    var updateCatsWrapSticky = function() {
      var formTop = dgFormSection.getBoundingClientRect().top;
      catsWrap.classList.toggle('dg-cats-hidden', formTop <= catsWrap.offsetHeight);
    };
    window.addEventListener('scroll', updateCatsWrapSticky, { passive: true });
    window.addEventListener('resize', updateCatsWrapSticky);
    updateCatsWrapSticky();
  }

  document.querySelectorAll('.industry-tab[data-cat]').forEach(function(tab) {
    tab.addEventListener('click', function() {
      if (tab.classList.contains('dg-tab-disabled')) { showDevToast(); return; }
      activateCat(tab.dataset.cat);
      history.replaceState(null, '', '#' + tab.dataset.cat);
      if (catsWrap) catsWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  var hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash) activateCat(hash);

  setInterval(function() { tSlide(1); }, 6000);

  var c = document.getElementById('hs-form-container');
  if (c) {
    var obs = new MutationObserver(function() {
      if (document.querySelector('#hs-form-container .hs-form')) {
        var ph = document.getElementById('hs-placeholder');
        if (ph) ph.style.display = 'none';
        obs.disconnect();
      }
    });
    obs.observe(c, { childList: true, subtree: true });

    /* only queue the form build when #hs-form-container actually exists
       on this page (interactive-demos.html) -- this whole DOMContentLoaded
       handler runs sitewide (it's not scoped to that page), so without
       this guard every other page queued a doomed hbspt.forms.create()
       call that could never find its target, wasting a form-definition
       fetch and printing a console warning on every page load. */
    window.hsFormsOnReady = window.hsFormsOnReady || [];
    window.hsFormsOnReady.push(function() {
      hbspt.forms.create({
        portalId: "45700506",
        formId: "e3e8a63f-d050-4a3c-9178-acea4915a7cd",
        region: "na2",
        target: "#hs-form-container"
      });
    });
  }
});

window.addEventListener('hashchange', function() {
  var hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash) activateCat(hash);
});

var _pendingDemoId = null;
var _gateDone = !!sessionStorage.getItem('phr_gate_done');

/* window.Supademo comes from the external script.supademo.com/supademo.js
   widget (loaded at the bottom of interactive-demos.html) -- guard every
   call in case that script is still loading, failed to load (network
   hiccup, ad blocker), or was left out of a page entirely, so a missing
   demo player shows a message instead of a silent, uncaught exception. */
function _openSupademo(id) {
  if (window.Supademo && typeof window.Supademo.open === 'function') {
    window.Supademo.open(id);
  } else {
    var toast = document.createElement('div');
    toast.textContent = 'This demo is unavailable right now -- please try again in a moment.';
    toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#0d1b3e;color:#fff;padding:12px 24px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:99999;font-size:14px;font-weight:600;';
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 4000);
  }
}

function gatedDemo(id) {
  if (_gateDone) { _openSupademo(id); return; }
  _pendingDemoId = id;
  _showGate();
}

function gatedHeroDemo() {
  if (_gateDone) { _loadHeroIframe(); return; }
  _pendingDemoId = '__hero__';
  _showGate();
}

function _loadHeroIframe() {
  var iframe = document.getElementById('hero-demo-iframe');
  if (iframe && iframe.dataset.src && !iframe.getAttribute('src')) {
    iframe.setAttribute('src', iframe.dataset.src);
  }
  var overlay = document.getElementById('hero-gate-overlay');
  if (overlay) overlay.style.display = 'none';
}

if (_gateDone) {
  document.addEventListener('DOMContentLoaded', _loadHeroIframe);
}

function _showGate() {
  var overlay = document.getElementById('dg-gate-overlay');
  if (!overlay) return;
  /* Move to direct child of <body> to escape any parent stacking context */
  if (overlay.parentNode !== document.body) {
    document.body.appendChild(overlay);
  }
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  _initGateForm();
}

function _hideGate() {
  var overlay = document.getElementById('dg-gate-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
  _pendingDemoId = null;
}

function _onGateSubmit() {
  var id = _pendingDemoId;
  sessionStorage.setItem('phr_gate_done', '1');
  _gateDone = true;
  _hideGate();
  if (id === '__hero__') {
    setTimeout(_loadHeroIframe, 450);
  } else if (id) {
    setTimeout(function() { _openSupademo(id); }, 450);
  }
}

function _initGateForm() {
  var container = document.getElementById('dg-gate-form-container');
  if (!container || container.querySelector('.hs-form')) return;
  if (typeof hbspt === 'undefined') { setTimeout(_initGateForm, 250); return; }
  hbspt.forms.create({
    portalId:  '45700506',
    formId:    'e3e8a63f-d050-4a3c-9178-acea4915a7cd',
    region:    'na2',
    target:    '#dg-gate-form-container',
    onFormSubmitted: _onGateSubmit
  });
}

window.addEventListener('message', function(e) {
  if (!e.data || _gateDone) return;
  if (e.data.type === 'hsFormCallback' &&
     (e.data.eventName === 'onFormSubmitted' || e.data.eventName === 'onFormSubmit')) {
    _onGateSubmit();
  }
});

/* ==========================================================================
   smsgt-lexi-ph-page.js
   Page-specific interactions for SMSGT â€” AI-Powered HR Intelligence (Philippines).
   Requires: phrhome.js loaded first.
   ========================================================================== */

(function () {
  'use strict';

  /* â”€â”€ HubSpot Modal â”€â”€ */
  var overlay  = document.getElementById('hs-modal-overlay');
  var closeBtn = document.getElementById('hs-modal-close');

  if (overlay) {
    function openModal(e) {
      if (e) e.preventDefault();
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-open-hs]').forEach(function (el) {
      el.addEventListener('click', openModal);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });
  }

  /* â”€â”€ Scroll Animations (page-specific elements only) â”€â”€
     phrhome.js handles .module-card, .persona-card, .cs-card, .feature-item.
     This guard covers the selectors unique to this page.                    */
  if ('IntersectionObserver' in window) {
    var pageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity  = '1';
          entry.target.style.transform = 'translateY(0)';
          pageObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.lexi-card, .phr-module-card, .smsgt-cred-item').forEach(function (el) {
      requestAnimationFrame(function () {
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        pageObserver.observe(el);
      });
    });

    /* Fallback: ensure elements are visible after 2 s regardless of observer */
    setTimeout(function () {
      document.querySelectorAll('.lexi-card, .phr-module-card, .smsgt-cred-item').forEach(function (el) {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
    }, 2000);
  }

}());

/* ==========================================================================
   ROI Calculator
   ========================================================================== */
var roiEmployeeSegmentation = {
  'Hospitality': { general: 0.98, hr: 0.02 },
  'Manufacturing': { general: 0.97, hr: 0.03 },
  'Healthcare': { general: 0.98, hr: 0.02 },
  'Banking & Finance': { general: 0.98, hr: 0.02 },
  'Retail': { general: 0.98, hr: 0.02 },
  'Logistics': { general: 0.98, hr: 0.02 },
  'Other': { general: 0.98, hr: 0.02 }
};

var roiTimeAllocated = {
  'Data extraction efficiency': { hr: 0.15000, general: 0.00000 },
  'Check-in/out efficiency': { hr: 0.00625, general: 0.00625 },
  'Payroll processing': { hr: 0.10000, general: 0.00000 },
  'Payroll error correction': { hr: 0.05000, general: 0.00000 },
  'Automating manual payroll tasks': { hr: 0.12500, general: 0.00000 },
  'Benefits request processing': { hr: 0.05000, general: 0.00000 },
  'Benefit application efficiency': { hr: 0.00625, general: 0.00625 },
  'Data import efficiency': { hr: 0.01250, general: 0.00000 },
  'Report generation': { hr: 0.03750, general: 0.00000 },
  'Training needs': { hr: 0.00625, general: 0.00625 }
};

var roiTimeSaved = {
  'Data extraction efficiency': { hr: 0.60, general: 0.00 },
  'Check-in/out efficiency': { hr: 0.70, general: 0.30 },
  'Payroll processing': { hr: 0.63, general: 0.00 },
  'Payroll error correction': { hr: 1.00, general: 0.00 },
  'Automating manual payroll tasks': { hr: 0.97, general: 0.00 },
  'Benefits request processing': { hr: 0.67, general: 0.00 },
  'Benefit application efficiency': { hr: 0.83, general: 0.83 },
  'Data import efficiency': { hr: 0.78, general: 0.00 },
  'Report generation': { hr: 0.85, general: 0.00 },
  'Training needs': { hr: 0.75, general: 0.75 }
};

var roiThirdPartyUseCases = [
  'Benefits request processing',
  'Benefit application efficiency',
  'Data import efficiency',
  'Report generation',
  'Training needs'
];

function roiFormatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function calculatePeoplesHRROI() {
  var employees = document.getElementById('roi-employees').value;
  var avgSalary = document.getElementById('roi-avg-salary').value;
  var currentSolution = document.getElementById('roi-current-solution').value;
  var industry = document.getElementById('roi-industry').value;

  if (!employees || !avgSalary || !currentSolution || !industry) {
    alert('Please fill in all fields');
    return;
  }

  var numEmployees = parseInt(employees, 10);
  var monthlyAvgSalary = parseFloat(avgSalary);

  var segmentation = roiEmployeeSegmentation[industry];
  var generalEmployees = Math.round(numEmployees * segmentation.general);
  var hrEmployees = Math.round(numEmployees * segmentation.hr);

  var useCasesToCalculate = Object.keys(roiTimeAllocated);
  if (currentSolution === 'Third-party/in-house solution') {
    useCasesToCalculate = roiThirdPartyUseCases;
  }

  var totalSavings = 0;
  useCasesToCalculate.forEach(function (useCase) {
    var hrTimeAlloc = roiTimeAllocated[useCase].hr;
    var generalTimeAlloc = roiTimeAllocated[useCase].general;
    var hrTimeSaved = roiTimeSaved[useCase].hr;
    var generalTimeSaved = roiTimeSaved[useCase].general;

    var hrSavings = (hrEmployees * monthlyAvgSalary) * hrTimeAlloc * hrTimeSaved;
    var generalSavings = (generalEmployees * monthlyAvgSalary) * generalTimeAlloc * generalTimeSaved;
    totalSavings += hrSavings + generalSavings;
  });

  var minSavings = totalSavings * 0.8;
  var maxSavings = totalSavings * 1.2;

  document.getElementById('roi-placeholder').classList.add('roi-hidden');
  document.getElementById('roi-results').classList.add('roi-visible');

  document.getElementById('roi-savings-range').textContent =
    roiFormatCurrency(minSavings) + ' - ' + roiFormatCurrency(maxSavings);
  document.getElementById('roi-min-savings').textContent = roiFormatCurrency(minSavings);
  document.getElementById('roi-max-savings').textContent = roiFormatCurrency(maxSavings);
}

/* ==========================================================================
   Cookie Consent Banner
   Self-contained: injects its own markup, so no per-page HTML edit is
   needed anywhere phr.js is already loaded (i.e. every page on the site).
   ========================================================================== */
(function () {
  var COOKIE_NAME = 'phr_cookie_consent';
  var COOKIE_DAYS = 180;

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  if (getCookie(COOKIE_NAME)) return; // choice already made

  var banner = document.createElement('div');
  banner.className = 'phr-cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML =
    '<div class="phr-cookie-banner__inner">' +
      '<p class="phr-cookie-banner__text">' +
        '<strong>We use cookies.</strong> They help us run the site and understand how it&rsquo;s used. ' +
        'See our <a href="/cookie-policy.html">Cookie Policy</a> and <a href="/privacy-policy.html">Privacy Policy</a> for details.' +
      '</p>' +
      '<div class="phr-cookie-banner__actions">' +
        '<button type="button" class="phr-cookie-btn phr-cookie-btn--reject" id="phrCookieReject">Reject Non-Essential</button>' +
        '<button type="button" class="phr-cookie-btn phr-cookie-btn--accept" id="phrCookieAccept">Accept All</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(banner);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { banner.classList.add('is-visible'); });
  });

  function dismiss(choice) {
    setCookie(COOKIE_NAME, choice, COOKIE_DAYS);
    banner.classList.remove('is-visible');
    setTimeout(function () { banner.remove(); }, 400);
  }

  document.getElementById('phrCookieAccept').addEventListener('click', function () { dismiss('accepted'); });
  document.getElementById('phrCookieReject').addEventListener('click', function () { dismiss('rejected'); });
}());

/* Philippines Payroll LP: "falling" benefit-tag cloud (see .pay-tag-chip
   in styles.css). Stagger each chip's transition-delay, then reveal the
   whole cloud with one .is-inview class once it scrolls into view, so
   the chips animate down into place in sequence rather than all at once. */
(function () {
  var cloud = document.querySelector('.pay-tag-cloud');
  if (!cloud) return;

  var chips = cloud.querySelectorAll('.pay-tag-chip');
  chips.forEach(function (chip, i) {
    chip.style.transitionDelay = (Math.min(i, 24) * 0.04) + 's';
  });

  if (!('IntersectionObserver' in window)) {
    cloud.classList.add('is-inview');
    return;
  }

  var tagCloudObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  tagCloudObserver.observe(cloud);
}());