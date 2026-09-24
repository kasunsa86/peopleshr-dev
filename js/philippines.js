/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   philippines.js â€” delta script for the PeoplesHR Philippines landing
   page (/philippines.html)

   Loaded AFTER the shared js/phr.js and js/navbar.js (which already
   handle the nv-* navbar/mobile-panel behavior sitewide). Everything
   below is specific to this page only, guarded to no-op if .ph-scope
   content isn't present.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

(function(){
  var scope = document.querySelector('.ph-scope');
  if(!scope) return; // guard: absent on non-philippines pages

  /* FAQ accordion: already wired up globally by the shared js/phr.js
     (targets .phr-faq-item__trigger site-wide) â€” nothing to add here,
     just reusing the shared .phr-faq markup. */

  /* Payroll-chaos composition â€” notification content lives here as
     data and gets rendered into DOM nodes; each alert's on-screen
     POSITION/rotation/timing comes from its .ph-chaos-alert--N class
     in philippines.css (index-based, N = array position + 1), so this
     stays pure content rendering with no layout logic or viewport
     checks. Motion is handled entirely by CSS (hover-pause and
     prefers-reduced-motion both live in the stylesheet). */
  var chaos = document.getElementById('phChaos');
  var chaosAlertsHost = document.getElementById('phChaosAlerts');
  if(chaos && chaosAlertsHost){
    var CHAOS_ALERTS = [
      {text:'Formula Error', tone:'error', icon:'circle'},
      {text:'Calculation Mismatch', tone:'error', icon:'dot'},
      {text:'Missing Attendance Data', tone:'warn', icon:'triangle'},
      {text:'Manual Adjustment Required', tone:'warn', icon:'triangle'},
      {text:'Overtime Pending Approval', tone:'warn', icon:'dot'},
      {text:'Employee Record Incomplete', tone:'warn', icon:'triangle'},
      {text:'Payroll Deadline: Today', tone:'error', icon:'dot'},
      {text:'5 Calculation Errors Found', tone:'error', icon:'circle'}
    ];
    var ICON_SVG = {
      triangle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 22 20H2Z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none"/></svg>',
      circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16" r=".6" fill="currentColor" stroke="none"/></svg>'
    };
    CHAOS_ALERTS.forEach(function(alert, i){
      var el = document.createElement('div');
      el.className = 'ph-chaos-alert ph-chaos-alert--' + (i + 1) + ' ph-chaos-alert--' + alert.tone;
      var icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      icon.className = 'ph-chaos-alert-icon' + (alert.icon === 'dot' ? ' ph-chaos-alert-icon--dot' : '');
      if(ICON_SVG[alert.icon]) icon.innerHTML = ICON_SVG[alert.icon];
      var label = document.createElement('span');
      label.className = 'ph-chaos-alert-text';
      label.textContent = alert.text;
      el.appendChild(icon);
      el.appendChild(label);
      chaosAlertsHost.appendChild(el);
    });
  }

  /* Modules tabs â€” click a tab, show its panel, hide the rest. */
  var modTabs = document.querySelectorAll('.ph-mod-tab');
  modTabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      var target = tab.getAttribute('data-mod-tab');
      modTabs.forEach(function(t){
        var isActive = t === tab;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      document.querySelectorAll('.ph-mod-panel').forEach(function(panel){
        var isActive = panel.getAttribute('data-mod-panel') === target;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });
    });
  });

  /* Industry selector â€” six industries, one data-driven card instead of
     six duplicated ones. PH_INDUSTRIES is the single source of truth for
     copy/capabilities/images; renderTabs()/renderPanel() build the DOM
     from it, selectIndustry() swaps the active one with a brief fade +
     upward-lift transition (skipped for prefers-reduced-motion). */
  (function(){
    var industrySection = document.getElementById('ph-industry');
    if(!industrySection) return;

    var ICONS = {
      factory:'<path d="M3 21V11l5 3.5V11l5 3.5V11l5 3.5V21"/><path d="M3 21h18"/><path d="M18 8V4l3 2v3"/>',
      headset:'<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2.5" y="13" width="4" height="6" rx="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a4 4 0 0 1-4 4h-2"/>',
      bell:'<path d="M4 18h16"/><path d="M6 18a6 6 0 0 1 12 0"/><circle cx="12" cy="7" r="1.3"/><path d="M12 8.3V10"/>',
      bag:'<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
      truck:'<rect x="1" y="7" width="13" height="10" rx="1"/><path d="M14 10h4l3 3v4h-2"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
      bank:'<path d="M3 10l9-6 9 6"/><path d="M4 10v9M9 10v9M15 10v9M20 10v9"/><path d="M2.5 21h19"/>'
    };
    var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';

    var PH_INDUSTRIES = [
      {
        id:'manufacturing',
        tabLabel:'Manufacturing',
        icon:'factory',
        eyebrow:'Manufacturing',
        title:'From The Factory Floor To Head Office, Keep Everyone In Sync.',
        description:'Connect employee records, shifts, attendance and payroll across every plant, production line and site.',
        capabilities:[
          'Configure plants, departments and reporting hierarchies',
          'Maintain one employee record across every site',
          'Schedule shifts and manage workforce rosters',
          'Run multiple shift patterns across teams and plants',
          'Connect biometric attendance devices',
          'Review and approve attendance before payroll',
          'Capture overtime around scheduled shifts automatically',
          'Run standard or piece-rate payroll with statutory deductions'
        ],
        image:'https://peopleshr.com/uploads/2026/09/manufacturing_ph.webp',
        imageAlt:'Manufacturing worker operating machinery on a modern production line'
      },
      {
        id:'bpo',
        tabLabel:'BPO',
        icon:'headset',
        eyebrow:'BPO',
        title:'Keep 24/7 Teams, Shifts and Accounts Running Together.',
        description:'Manage changing schedules, attendance, overtime and high-volume hiring across every account, site and time zone.',
        capabilities:[
          'Schedule teams across accounts, sites and work patterns',
          'Manage multiple day, night and rotating shifts',
          'Configure flexible and staggered working hours',
          'Reassign shifts quickly when coverage changes',
          'Enable location-verified mobile and web attendance',
          'Monitor team attendance through real-time dashboards',
          'Process overtime, night differentials and allowances',
          'Accelerate hiring with bulk CV parsing and AI ranking'
        ],
        image:'https://peopleshr.com/uploads/2026/09/bpo_ph.webp',
        imageAlt:'BPO team member wearing a headset working in a shared-services office'
      },
      {
        id:'hospitality',
        tabLabel:'Hospitality',
        icon:'bell',
        eyebrow:'Hospitality',
        title:'Keep Every Property, Shift and Service Team Running Smoothly.',
        description:'Coordinate frontline teams, changing rosters and payroll requirements across every hotel, property and department.',
        capabilities:[
          'Structure multiple properties and departments',
          'Schedule shifts and publish employee rosters',
          'Manage different shift patterns across service teams',
          'Adjust and reassign shifts when coverage changes',
          'Capture attendance through biometric or mobile devices',
          'Configure employee breaks and grace periods',
          'Manage location-specific holidays and overtime rules',
          'Track staff meal entitlements, deductions and subsidies'
        ],
        image:'https://peopleshr.com/uploads/2026/09/hospitality_ph.webp',
        imageAlt:'Hotel service team in uniform coordinating daily operations'
      },
      {
        id:'retail',
        tabLabel:'Retail',
        icon:'bag',
        eyebrow:'Retail',
        title:'One Workforce View Across Every Store and Shift.',
        description:'Manage store teams, changing schedules, attendance and payroll from one central platform.',
        capabilities:[
          'Structure stores, outlets, regions and reporting lines',
          'Maintain centralised records for every store employee',
          'Build and publish shift schedules and rosters',
          'Run different shift patterns across stores',
          'Adjust and reassign shifts when staffing needs change',
          'Use geo-fenced mobile clock-in for approved locations',
          'Monitor attendance across stores in real time',
          'Calculate overtime and generate secure digital payslips'
        ],
        image:'https://peopleshr.com/uploads/2026/09/retail_ph.webp',
        imageAlt:'Retail staff in uniform working together inside a grocery store'
      },
      {
        id:'transport-logistics',
        tabLabel:'Transport & Logistics',
        icon:'truck',
        eyebrow:'Transport & Logistics',
        title:'Keep Every Hub, Depot and Mobile Team Connected.',
        description:'Coordinate distributed employees, attendance, shifts and payroll across warehouses, hubs, depots and field locations.',
        capabilities:[
          'Structure hubs, depots, warehouses and operating teams',
          'Schedule round-the-clock shifts and workforce rosters',
          'Enable geo-tagged mobile and web clock-in',
          'Restrict attendance to approved locations with geo-fencing',
          'Connect biometric devices at fixed sites',
          'Monitor attendance across teams and locations in real time',
          'Capture and approve overtime around scheduled shifts',
          'Give mobile employees access to payslips and HR updates'
        ],
        image:'https://peopleshr.com/uploads/2026/09/transport_ph.webp',
        imageAlt:'Logistics driver in company uniform at a transport hub'
      },
      {
        id:'banking-financial-services',
        tabLabel:'Banking & Financial Services',
        icon:'bank',
        eyebrow:'Banking & Financial Services',
        title:'Control, Consistency and Visibility Across Every Branch.',
        description:'Manage structured employee data, approvals, payroll and compliance across branches, business units and legal entities.',
        capabilities:[
          'Configure branches, business units and reporting hierarchies',
          'Maintain secure employee and statutory records',
          'Store employment documents in one auditable location',
          'Manage transfers, promotions and role changes',
          'Centralise leave, expense and team approvals',
          'Route payroll through multi-level approval workflows',
          'Maintain a tamper-evident audit trail of system activity',
          'Generate workforce dashboards and scheduled reports'
        ],
        image:'https://peopleshr.com/uploads/2026/09/banking_and_finance_ph.webp',
        imageAlt:'Banking relationship manager in a suit consulting with a client in a branch office'
      }
    ];

    var tabsHost = industrySection.querySelector('.ph-industry-tabs');
    var panelHost = industrySection.querySelector('.ph-industry-panel');
    var activeId = PH_INDUSTRIES[0].id;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var findIndustry = function(id){
      for(var i = 0; i < PH_INDUSTRIES.length; i++){
        if(PH_INDUSTRIES[i].id === id) return PH_INDUSTRIES[i];
      }
      return null;
    };

    var buildCapItem = function(text){
      return '<li class="ph-industry-cap-item">' +
        '<span class="ph-industry-cap-check" aria-hidden="true">' + CHECK_SVG + '</span>' +
        '<span class="ph-industry-cap-text">' + text + '</span>' +
        '</li>';
    };

    var buildMedia = function(industry){
      if(industry.image){
        return '<img src="' + industry.image + '" alt="' + industry.imageAlt + '" loading="lazy">';
      }
      return '<div class="ph-industry-media-placeholder">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
        '<span>' + industry.imagePlaceholderLabel + '</span>' +
        '</div>';
    };

    var buildCard = function(industry){
      var caps = industry.capabilities.map(buildCapItem).join('');
      return '<div class="ph-industry-card">' +
        '<div class="ph-industry-intro">' +
          '<p class="ph-industry-eyebrow">' + industry.eyebrow + '</p>' +
          '<h3 class="ph-industry-title">' + industry.title + '</h3>' +
          '<p class="ph-industry-desc">' + industry.description + '</p>' +
        '</div>' +
        '<div class="ph-industry-media">' + buildMedia(industry) + '</div>' +
        '<div class="ph-industry-caps">' +
          '<p class="ph-industry-caps-label">What PeoplesHR Helps You Manage</p>' +
          '<ul class="ph-industry-cap-list">' + caps + '</ul>' +
        '</div>' +
      '</div>';
    };

    var renderTabs = function(){
      tabsHost.innerHTML = PH_INDUSTRIES.map(function(industry){
        var isActive = industry.id === activeId;
        return '<button class="ph-industry-tab' + (isActive ? ' is-active' : '') + '"' +
          ' role="tab"' +
          ' id="ph-industry-tab-' + industry.id + '"' +
          ' aria-controls="ph-industry-panel"' +
          ' aria-selected="' + (isActive ? 'true' : 'false') + '"' +
          ' tabindex="' + (isActive ? '0' : '-1') + '"' +
          ' data-industry="' + industry.id + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[industry.icon] + '</svg>' +
          '<span>' + industry.tabLabel + '</span>' +
          '</button>';
      }).join('');
    };

    var renderPanel = function(){
      var industry = findIndustry(activeId);
      panelHost.innerHTML = buildCard(industry);
      panelHost.setAttribute('aria-labelledby', 'ph-industry-tab-' + industry.id);
    };

    var selectIndustry = function(id, focusTab){
      if(id === activeId) return;
      activeId = id;

      var tabs = tabsHost.querySelectorAll('.ph-industry-tab');
      tabs.forEach(function(t){
        var isActive = t.getAttribute('data-industry') === id;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        t.setAttribute('tabindex', isActive ? '0' : '-1');
      });
      if(focusTab){
        var activeTabEl = tabsHost.querySelector('.ph-industry-tab[data-industry="' + id + '"]');
        if(activeTabEl){
          activeTabEl.focus();
          activeTabEl.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', inline:'center', block:'nearest'});
        }
      }

      var card = panelHost.querySelector('.ph-industry-card');
      if(reduceMotion || !card){
        renderPanel();
        return;
      }
      card.classList.add('is-hidden');
      setTimeout(renderPanel, 220);
    };

    renderTabs();
    renderPanel();

    tabsHost.addEventListener('click', function(e){
      var tab = e.target.closest('.ph-industry-tab');
      if(!tab) return;
      selectIndustry(tab.getAttribute('data-industry'), false);
    });

    tabsHost.addEventListener('keydown', function(e){
      var tab = e.target.closest('.ph-industry-tab');
      if(!tab) return;
      var ids = PH_INDUSTRIES.map(function(industry){ return industry.id; });
      var idx = ids.indexOf(activeId);
      var nextIdx = null;
      if(e.key === 'ArrowRight' || e.key === 'ArrowDown'){ nextIdx = (idx + 1) % ids.length; }
      else if(e.key === 'ArrowLeft' || e.key === 'ArrowUp'){ nextIdx = (idx - 1 + ids.length) % ids.length; }
      else if(e.key === 'Home'){ nextIdx = 0; }
      else if(e.key === 'End'){ nextIdx = ids.length - 1; }
      if(nextIdx !== null){
        e.preventDefault();
        selectIndustry(ids[nextIdx], true);
      }
    });
  }());

  /* Lexi AI Insights tabs: moved to js/lexi-insights.js (shared with
     the home page). */

  /* Video testimonial modal â€” ported from customer-page/script.js's
     "2. Video Modal" IIFE, retargeted at this page's own element ids. */
  var vidModal = document.getElementById('phVidModal');
  var vidIframe = document.getElementById('phVidIframe');
  var vidClose = document.getElementById('phVidModalClose');
  var vidTitle = document.getElementById('phVidModalTitle');
  if(vidModal && vidIframe && vidClose){
    var openVidModal = function(ytId, title){
      vidIframe.src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0&modestbranding=1';
      if(vidTitle) vidTitle.textContent = title || '';
      vidModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    var closeVidModal = function(){
      vidModal.classList.remove('open');
      vidIframe.src = '';
      document.body.style.overflow = '';
    };
    document.querySelectorAll('.cs-vid-card').forEach(function(card){
      var trigger = function(){
        var ytId = card.getAttribute('data-youtube');
        var title = card.getAttribute('data-title') || '';
        if(!ytId) return;
        openVidModal(ytId, title);
      };
      card.addEventListener('click', trigger);
      /* Cards with tabindex (e.g. the featured testimonial video) are
         keyboard-focusable divs, not real buttons â€” wire up Enter/Space
         so they behave like one. */
      card.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          trigger();
        }
      });
    });
    vidClose.addEventListener('click', closeVidModal);
    vidModal.addEventListener('click', function(e){ if(e.target === vidModal) closeVidModal(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && vidModal.classList.contains('open')) closeVidModal(); });
  }

  /* Written testimonial slider â€” cards render from PH_VOICES (single
     source of truth) into the empty <ul id="phVoicesTrack">. Logo files
     only exist for SMSGT and LaVie so far (companyLogo:null falls back
     to a text badge, per buildVoiceCard above) â€” the rest render fine
     without one, just add a logo path here once an asset is provided. */
  var voicesTrack = document.getElementById('phVoicesTrack');
  if(voicesTrack){
    var PH_VOICES = [
      {
        id:'lavie',
        quote:'What stands out the most is the team’s passion, commitment and willingness to listen to client feedback. As they continue innovating, learning and improving, the dedication behind the system is clearly visible and believe it will continue to grow stronger over time.',
        personName:'Russel De Guzman',
        jobTitle:'Senior Manager, HR',
        companyName:'LaVie Resort & Casino',
        industry:'Hospitality',
        companyLogo:'https://peopleshr.com/uploads/2026/09/lavie_logo.webp',
        companyLogoAlt:'LaVie Resort & Casino logo'
      },
      {
        id:'smsgt-annamae',
        quote:'PeoplesHR has truly transformed the way we manage our HR operations. By automating routine processes and centralizing employee data, we’ve been able to eliminate inefficiencies and focus more on strategic HR initiatives. Our partnership with PeoplesHR has been instrumental in modernizing our systems and fostering a more agile, responsive workplace.',
        personName:'Anna Mae Rotoni',
        jobTitle:'HR Supervisor',
        companyName:'SMS Global Technologies, Inc.',
        industry:'Technology',
        companyLogo:'https://peopleshr.com/uploads/2026/09/smsgt-logo.svg',
        companyLogoAlt:'SMS Global Technologies, Inc. logo'
      },
      {
        id:'sandstone',
        quote:'PayrollPlus by PeoplesHR has been instrumental in overcoming our payroll challenges by providing us with complete control over the process and ensuring timely completion. Its flexibility allows for last-minute changes, while the mobile app and self-service options enhance our employees’ experience by giving them easy access to view their leave balances.',
        personName:'Gizelle Mangahas',
        jobTitle:'Talent Acquisition Specialist',
        companyName:'Sandstone Technology Phils., Inc.',
        industry:'Technology',
        companyLogo:'https://peopleshr.com/uploads/2026/09/Sandstone-logo.svg',
        companyLogoAlt:'Sandstone Technology Phils., Inc. logo'
      },
      {
        id:'uy-dental',
        quote:'PayrollPlus by PeoplesHR has made a significant impact on our operations. Prior to using the system, managing payroll manually was time-consuming and prone to errors, especially as our team continued to grow. From the initial consultation to go-live, the PeoplesHR team provided exceptional support. The system has helped us streamline salary computation and payslip distribution.',
        personName:'Cherry',
        jobTitle:'HR Admin',
        companyName:'Uy Dental Clinic Group',
        industry:'Healthcare',
        companyLogo:'https://peopleshr.com/uploads/2026/04/UY-Dental.webp',
        companyLogoAlt:'Uy Dental Clinic Group logo'
      },
      {
        id:'smsgt-peaches',
        quote:'Our experience with PeoplesHR has been positive. The system efficiently generates attendance reports, including overtime and employee timesheets, while also simplifying the management of employee information and leave requests. The platform is user-friendly, easy to navigate, and highly customizable to our organizational needs.',
        personName:'Peaches G. Lazatin',
        jobTitle:'HR Practitioner',
        companyName:'SMS Global Technologies, Inc.',
        industry:'Technology',
        companyLogo:'https://peopleshr.com/uploads/2026/09/smsgt-logo.svg',
        companyLogoAlt:'SMS Global Technologies, Inc. logo'
      },
      {
        id:'area29',
        quote:'Thank you PayrollPlus by PeoplesHR, we’ve been looking for a better payroll system since our previous payroll system could not deliver an accurate and consistent output. With the help of PayrollPlus by PeoplesHR we can now enjoy the privilege of having our payroll processed within an hour.',
        personName:'Sygrid Joy Oliveros',
        jobTitle:'Vice President & CFO',
        companyName:'Area29 Construction Corporation',
        industry:'Construction',
        companyLogo:'https://peopleshr.com/uploads/2026/09/area29.svg',
        companyLogoAlt:'Area29 Construction Corporation logo'
      },
      {
        id:'universal-canning',
        quote:'I cannot speak highly enough of the PayrollPlus by PeoplesHR support team. Their dedication to providing timely and effective assistance is truly commendable. Whenever I’ve reached out with questions or concerns, they’ve been incredibly responsive, knowledgeable, and proactive in resolving any issues.',
        personName:'Jhun Godoy',
        jobTitle:'ICT Manager',
        companyName:'Universal Canning Inc.',
        industry:'Manufacturing',
        companyLogo:'https://peopleshr.com/uploads/2026/09/universal_canning.svg',
        companyLogoAlt:'Universal Canning Inc. logo'
      },
      {
        id:'anako',
        quote:'Using PayrollPlus has improved our payroll workflows—it’s easy to use, produces accurate results, and has been very stable. Their customer service is responsive and consistently helpful.',
        personName:'Jennilyn Reza',
        jobTitle:'HR Supervisor',
        companyName:'Anako Philippines Corporation',
        industry:'Manufacturing',
        companyLogo:'https://peopleshr.com/uploads/2026/09/anako.svg',
        companyLogoAlt:'Anako Philippines Corporation logo'
      },
      {
        id:'punta-baler',
        quote:'Payroll Plus has transformed our payroll process with its high-tech, real-time biometric tracking, eliminating the need for manual computations. The software is user-friendly, and their support team is always accessible, making it a truly efficient and reliable system.',
        personName:'Goldie Frenz Nazareno',
        jobTitle:'HR-Accounting Department',
        companyName:'Punta Baler Food Ventures Inc.',
        industry:'Food & Beverage',
        companyLogo:'https://peopleshr.com/uploads/2026/09/punta_baler_logo.svg',
        companyLogoAlt:'Punta Baler Hotel logo'
      }
    ];

    var voicesPrev = document.getElementById('phVoicesPrev');
    var voicesNext = document.getElementById('phVoicesNext');
    var voicesDots = document.getElementById('phVoicesDots');
    var voicesStatus = document.getElementById('phVoicesStatus');
    var voicesReduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var VOICES_GAP = 22;

    var QUOTE_MARK_SVG = '<svg class="ph-voices-card-quote-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.5 6C4.5 8 3 11 3 14c0 2.8 1.9 4.5 4 4.5 2 0 3.5-1.5 3.5-3.5 0-1.8-1.2-3.2-3-3.5.4-1.8 1.7-3.5 3.5-4.8L7.5 6Zm9 0c-3 2-4.5 5-4.5 8 0 2.8 1.9 4.5 4 4.5 2 0 3.5-1.5 3.5-3.5 0-1.8-1.2-3.2-3-3.5.4-1.8 1.7-3.5 3.5-4.8L16.5 6Z"/></svg>';

    var buildVoiceCard = function(voice){
      var logoHtml = voice.companyLogo
        ? '<img class="ph-voices-card-logo" src="' + voice.companyLogo + '" alt="' + voice.companyLogoAlt + '" loading="lazy">'
        : '<span class="ph-voices-card-logo-fallback">' + (voice.companyName || voice.industry || 'PeoplesHR Customer') + '</span>';
      var industryPill = (voice.companyLogo && voice.industry) ? '<p class="ph-voices-card-industry">' + voice.industry + '</p>' : '';
      var primaryName = voice.personName || voice.jobTitle;
      var secondaryLine = voice.personName
        ? [voice.jobTitle, voice.companyName].filter(function(v){ return v; }).join(', ')
        : [voice.industry, 'Philippines'].filter(function(v){ return v; }).join(' â€” ');
      return '<li class="ph-voices-card">' +
        '<div class="ph-voices-card-logo-wrap">' + logoHtml + '</div>' +
        industryPill +
        QUOTE_MARK_SVG +
        '<blockquote class="ph-voices-card-quote"><p>' + voice.quote + '</p></blockquote>' +
        '<cite class="ph-voices-card-cite">' +
          '<span class="ph-voices-card-name">' + primaryName + '</span>' +
          '<span class="ph-voices-card-role">' + secondaryLine + '</span>' +
        '</cite>' +
      '</li>';
    };

    voicesTrack.innerHTML = PH_VOICES.map(buildVoiceCard).join('');

    var getVisibleCount = function(){
      var w = window.innerWidth;
      if(w <= 640) return 1;
      if(w <= 1024) return 2;
      return 3;
    };
    var getPageCount = function(){
      return Math.max(1, Math.ceil(PH_VOICES.length / getVisibleCount()));
    };
    /* currentPage is explicit state, not derived from scrollLeft on every
       render: a smooth-scroll animation takes a few hundred ms to settle,
       so deriving "current page" purely from scroll position made the
       dots/arrows/status lag visibly behind a click. Nav actions set it
       immediately; the scroll-settle listener below only exists to
       resync it after an organic swipe/trackpad scroll. */
    var currentPage = 0;
    var getCurrentPageFromScroll = function(){
      var cards = voicesTrack.querySelectorAll('.ph-voices-card');
      if(!cards.length) return 0;
      var cardWidth = cards[0].getBoundingClientRect().width + VOICES_GAP;
      var visibleCount = getVisibleCount();
      var index = Math.round(voicesTrack.scrollLeft / cardWidth);
      return Math.min(getPageCount() - 1, Math.floor(index / visibleCount));
    };
    var renderDots = function(){
      if(!voicesDots) return;
      var pageCount = getPageCount();
      var html = '';
      for(var i = 0; i < pageCount; i++){
        html += '<button type="button" class="ph-voices-dot' + (i === currentPage ? ' is-active' : '') + '" data-page="' + i + '" aria-label="Go to testimonials page ' + (i + 1) + ' of ' + pageCount + '"' + (i === currentPage ? ' aria-current="true"' : '') + '></button>';
      }
      voicesDots.innerHTML = html;
      voicesDots.style.display = pageCount <= 1 ? 'none' : '';
    };
    var updateArrows = function(){
      if(!voicesPrev || !voicesNext) return;
      var pageCount = getPageCount();
      voicesPrev.disabled = currentPage <= 0;
      voicesNext.disabled = currentPage >= pageCount - 1;
    };
    var updateStatus = function(){
      if(!voicesStatus) return;
      var visibleCount = getVisibleCount();
      var start = currentPage * visibleCount + 1;
      var end = Math.min(PH_VOICES.length, start + visibleCount - 1);
      voicesStatus.textContent = 'Showing testimonials ' + start + ' to ' + end + ' of ' + PH_VOICES.length;
    };
    var refresh = function(){
      renderDots();
      updateArrows();
      updateStatus();
    };
    var scrollToPage = function(page){
      var cards = voicesTrack.querySelectorAll('.ph-voices-card');
      var visibleCount = getVisibleCount();
      var index = page * visibleCount;
      var target = cards[index];
      if(!target) return;
      voicesTrack.scrollTo({left: target.offsetLeft - voicesTrack.offsetLeft, behavior: voicesReduceMotion ? 'auto' : 'smooth'});
    };
    var goToPage = function(page){
      var pageCount = getPageCount();
      if(page < 0 || page >= pageCount || page === currentPage) return;
      currentPage = page;
      refresh();
      scrollToPage(currentPage);
    };
    var goToAdjacentPage = function(dir){ goToPage(currentPage + dir); };

    if(voicesPrev) voicesPrev.addEventListener('click', function(){ goToAdjacentPage(-1); startVoicesAutoplay(); });
    if(voicesNext) voicesNext.addEventListener('click', function(){ goToAdjacentPage(1); startVoicesAutoplay(); });
    if(voicesDots){
      voicesDots.addEventListener('click', function(e){
        var dot = e.target.closest('.ph-voices-dot');
        if(!dot) return;
        goToPage(parseInt(dot.getAttribute('data-page'), 10));
        startVoicesAutoplay();
      });
    }

    /* Resyncs currentPage after a manual swipe/trackpad scroll (nav
       clicks already update state immediately via goToPage above, so
       this listener is purely a safety net for organic scrolling). */
    var voicesScrollTimer;
    voicesTrack.addEventListener('scroll', function(){
      clearTimeout(voicesScrollTimer);
      voicesScrollTimer = setTimeout(function(){
        currentPage = getCurrentPageFromScroll();
        refresh();
      }, 120);
    }, {passive:true});

    var voicesResizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(voicesResizeTimer);
      voicesResizeTimer = setTimeout(function(){
        currentPage = Math.min(currentPage, getPageCount() - 1);
        refresh();
        startVoicesAutoplay();
      }, 150);
    });

    /* Auto-advance every 3s, looping back to page 0 after the last page.
       Paused on hover/focus so a reader isn't fighting the slider, and
       skipped entirely under prefers-reduced-motion like the other
       animations on this page. */
    var voicesAutoplayTimer = null;
    var stopVoicesAutoplay = function(){
      if(voicesAutoplayTimer){ clearInterval(voicesAutoplayTimer); voicesAutoplayTimer = null; }
    };
    var startVoicesAutoplay = function(){
      stopVoicesAutoplay();
      if(voicesReduceMotion || getPageCount() <= 1) return;
      voicesAutoplayTimer = setInterval(function(){
        currentPage = (currentPage + 1) % getPageCount();
        refresh();
        scrollToPage(currentPage);
      }, 3000);
    };
    var voicesMore = document.querySelector('.ph-voices-more');
    if(voicesMore){
      voicesMore.addEventListener('mouseenter', stopVoicesAutoplay);
      voicesMore.addEventListener('mouseleave', startVoicesAutoplay);
      voicesMore.addEventListener('focusin', stopVoicesAutoplay);
      voicesMore.addEventListener('focusout', startVoicesAutoplay);
    }

    refresh();
    startVoicesAutoplay();
  }

  /* Proven Impact stat count-up â€” runs once when the section first
     scrolls into view, counting each .ph-impact-count from 0 to its
     data-target and formatting to data-decimals/data-suffix along the
     way. Skips straight to the final value under prefers-reduced-motion
     or if IntersectionObserver isn't available. */
  var impactSection = document.querySelector('.ph-impact-section');
  var impactCounts = impactSection ? impactSection.querySelectorAll('.ph-impact-count') : null;
  if(impactSection && impactCounts && impactCounts.length){
    var impactReduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var formatImpactValue = function(el, value){
      var decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      return value.toFixed(decimals) + suffix;
    };
    var animateImpactCount = function(el){
      var target = parseFloat(el.getAttribute('data-target'));
      if(isNaN(target)) return;
      if(impactReduceMotion){
        el.textContent = formatImpactValue(el, target);
        return;
      }
      var duration = 900;
      var start = null;
      var step = function(ts){
        if(start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatImpactValue(el, target * eased);
        if(progress < 1) requestAnimationFrame(step);
        else el.textContent = formatImpactValue(el, target);
      };
      requestAnimationFrame(step);
    };
    if('IntersectionObserver' in window){
      var impactObserver = new IntersectionObserver(function(entries, obs){
        if(entries[0].isIntersecting){
          impactCounts.forEach(animateImpactCount);
          obs.disconnect();
        }
      }, {threshold:0.35});
      impactObserver.observe(impactSection);
    } else {
      impactCounts.forEach(function(el){ el.textContent = formatImpactValue(el, parseFloat(el.getAttribute('data-target')) || 0); });
    }
  }

  /* HubSpot form embed â€” loaded lazily instead of a static <script> tag in
     <head>, so a below-the-fold third-party embed isn't competing for
     bandwidth with above-the-fold assets on initial load. rootMargin gives
     it a head start (starts fetching ~600px before the form scrolls into
     view) so it's ready by the time the reader actually gets there; the
     .ph-form-loading placeholder is defined in the HTML and gets wiped out
     when HubSpot's script replaces the container's content. */
  var hsFormFrame = document.querySelector('.hs-form-frame[data-hs-embed-src]');
  if(hsFormFrame){
    var loadHsForm = function(){
      var s = document.createElement('script');
      s.src = hsFormFrame.getAttribute('data-hs-embed-src');
      document.body.appendChild(s);
    };
    if('IntersectionObserver' in window){
      var hsFormObserver = new IntersectionObserver(function(entries, obs){
        if(entries[0].isIntersecting){
          loadHsForm();
          obs.disconnect();
        }
      }, {rootMargin:'600px 0px'});
      hsFormObserver.observe(hsFormFrame);
    } else {
      loadHsForm();
    }
  }

  /* Sticky CTA â€” visible once scrolled past the hero, hidden again near
     the Final CTA section so the ask isn't duplicated on top of itself.
     Dismiss persists for the tab session, same pattern as the nv-ann
     announcement-bar dismiss in js/navbar.js. */
  var sticky = document.getElementById('phStickyCta');
  var stickyClose = document.getElementById('phStickyCtaClose');
  var hero = document.querySelector('.phr-hero');
  var finalCta = document.getElementById('ph-final-cta');
  var STICKY_KEY = 'phr_ph_lander_sticky_dismissed';
  var stickyDismissed = false;
  try { stickyDismissed = sessionStorage.getItem(STICKY_KEY) === '1'; } catch(e){}

  if(sticky && !stickyDismissed){
    var pastHero = false;
    var nearFinalCta = false;
    var updateSticky = function(){
      sticky.classList.toggle('is-visible', pastHero && !nearFinalCta);
    };
    if(hero && 'IntersectionObserver' in window){
      new IntersectionObserver(function(entries){
        pastHero = !entries[0].isIntersecting;
        updateSticky();
      }, {threshold:0}).observe(hero);
    }
    if(finalCta && 'IntersectionObserver' in window){
      new IntersectionObserver(function(entries){
        nearFinalCta = entries[0].isIntersecting;
        updateSticky();
      }, {threshold:0, rootMargin:'0px 0px -20% 0px'}).observe(finalCta);
    }
    if(stickyClose){
      stickyClose.addEventListener('click', function(){
        sticky.classList.remove('is-visible');
        try { sessionStorage.setItem(STICKY_KEY, '1'); } catch(e){}
        stickyDismissed = true;
      });
    }
  } else if(sticky){
    sticky.style.display = 'none';
  }
}());
