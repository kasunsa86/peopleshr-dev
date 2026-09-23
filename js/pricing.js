/* pricing-delta.js — page-specific behavior for the Pricing page only.
   Renders the tier ladder and the module comparison table from the
   #pcMatrix JSON payload. All class names are .pc- prefixed and the
   whole thing is scoped under .pc-scope in the markup, so nothing
   here can collide with phrhome.css or the shared navbar/footer —
   see the matching note in pricing-delta.css.

   Shared by both the English page (view-plans.html) and the Bahasa page
   (view-plans-id.html) — LANG below picks the right copy at
   runtime from the page's own <html lang> attribute, so this one
   file is safe to load on either page without ever double-rendering
   the ladder. Do NOT also load a second copy of this script on the
   same page — that reintroduces the double-card-set bug this
   consolidation fixed (two IIFEs both appending into #pcLadder). */
(function () {
  var scope = document.querySelector('.pc-scope');
  if (!scope) return; // guard: absent on non-pricing pages

  /* both pricing pages are dropped into WordPress as custom-HTML blocks,
     so the surrounding theme's <html lang> stays whatever the site
     default is and can't be relied on — the Bahasa page marks itself
     via data-lang="id" on the outer .pc-scope wrapper instead (falls
     back to <html lang> for any embed that predates that attribute). */
  var LANG = scope.dataset.lang === 'id' || document.documentElement.lang === 'id' ? 'id' : 'en';
  var DATA = JSON.parse(document.getElementById('pcMatrix').textContent);
  var TIERS = [['manage', 'Manage'], ['grow', 'Grow'], ['transform', 'Transform']];
  /* Talent and Recruitment aren't offered on Manage — only Grow and
     Transform — so both the tier cards and the table hide that column
     entirely for these modules instead of showing a value for it. */
  var NO_MANAGE = ['Talent', 'Recruitment'];
  var CARDS = LANG === 'id' ? {
    manage: { tag: 'Kelola operasional perusahaan', desc: 'Kelola HR dengan tepat — data yang akurat, payroll yang rapi, dan kepatuhan regulasi di sepanjang perjalanan karyawan dari rekrutmen hingga purna kerja.' },
    grow: { tag: 'Dukung pertumbuhan karyawan', desc: 'Kembangkan karyawan Anda — performa, talenta, rekrutmen, dan engagement menjadi lebih terencana, bukan sekadar reaktif. Dirancang untuk operasional HR yang lebih kompleks dan tenaga kerja yang lebih besar.', popular: true },
    transform: { tag: 'Pimpin berdasarkan insight karyawan', desc: 'Jadikan data karyawan sebagai pusat pengambilan keputusan — antisipasi turnover dan selaraskan strategi SDM dengan bisnis.' }
  } : {
    manage: { tag: 'Run the organisation', desc: 'Get HR right — accurate records, clean payroll, and statutory compliance across the full hire-to-retire journey.' },
    grow: { tag: 'Invest in your people', desc: 'Develop your people — performance, talent, recruitment and engagement become intentional, not reactive. Built for more complex HR operations and larger workforces.', popular: true },
    transform: { tag: 'Lead with people intelligence', desc: 'Put workforce data at the centre of decisions — anticipate attrition and align people strategy with the business.' }
  };
  /* what each tier means for whichever module is currently selected —
     grounded in that module's actual manage/grow/transform capability
     data, not generic platform copy. Falls back to CARDS above when a
     module has no entry yet. */
  var MODULE_TIERS = LANG === 'id' ? {
    HR: {
      manage: { desc: 'Bangun fondasi HR yang kuat dengan sistem data yang akurat. Mulai dari menyusun struktur perusahaan, data karyawan, hingga dokumen HR dalam satu platform — lengkap dengan fitur pembaruan data mandiri, akses mobile, serta riwayat perubahan data yang transparan.',
        bullets: ['Struktur organisasi & data karyawan terpusat', 'Informasi legal & dokumen dalam satu sistem', 'Pembuatan surat HR & pembaruan data mandiri', 'Akses lewat ponsel & riwayat perubahan data transparan'] },
      grow: { desc: 'Fondasi HR yang dirancang untuk organisasi yang semakin berkembang. Mendukung struktur organisasi yang lebih kompleks, kustomisasi data, berbagai tahapan siklus karyawan, hingga akses insight ke supervisor lewat dashboard yang komprehensif.',
        bullets: ['Struktur organisasi & data yang dapat disesuaikan', 'Validasi fleksibel & siklus karyawan yang lebih lengkap', 'Proses offboarding end-to-end', 'Dashboard supervisor yang lebih informatif'] },
      transform: { desc: 'Kelola administrasi HR skala besar yang disesuaikan dengan cara kerja perusahaan Anda. Mulai dari struktur organisasi, tahapan siklus karyawan, hingga notifikasi khusus sesuai kebutuhan perusahaan. Dilengkapi proses offboarding dan penyelesaian hak karyawan yang berjalan otomatis.',
        bullets: ['Struktur organisasi, data & siklus karyawan sesuai kebutuhan', 'Peringatan dan notifikasi yang dapat dikustomisasi', 'Exit clearance & penyelesaian hak karyawan yang otomatis'] }
    },
    Time: {
      manage: { desc: 'Kelola kehadiran dan cuti dengan lebih akurat. Mulai dari penjadwalan shift, pencatatan absensi via aplikasi mobile atau web, persetujuan kehadiran sebelum payroll, hingga pengelolaan kuota dan persetujuan cuti.',
        bullets: ['Penjadwalan shift & absensi via mobile/web', 'Pelacakan keterlambatan & lembur', 'Persetujuan absensi sebelum payroll', 'Pengelolaan kuota & persetujuan cuti'] },
      grow: { desc: 'Pantau tim Anda yang terus berkembang dengan lebih mudah. Dilengkapi absensi berbasis lokasi (geofencing), timesheet proyek, dashboard supervisor, perencanaan cuti, serta kalender libur dan jenis cuti yang dapat disesuaikan.',
        bullets: ['Absensi berbasis lokasi & persetujuan lembur', 'Timesheet proyek & dashboard supervisor', 'Perencanaan & akumulasi cuti', 'Kalender libur & jenis cuti yang dapat disesuaikan'] },
      transform: { desc: 'Dukung operasional kompleks dengan multi-lokasi lewat pengelolaan absensi dan jadwal kerja yang fleksibel. Mulai dari atur berbagai pola shift, pertukaran shift, serta aturan lembur dan cuti sesuai kebutuhan bisnis Anda.',
        bullets: ['Berbagai pilihan pola shift', 'Shift fleksibel, shift bertahap & pertukaran shift', 'Perhitungan lembur yang bisa disesuaikan', 'Aturan & validasi cuti yang fleksibel'] }
    },
    Pay: {
      manage: { desc: 'Jalankan proses payroll dengan akurat dan tepat waktu. Kelola persetujuan, buat file transfer bank, slip gaji, serta laporan payroll lengkap, sekaligus memastikan kepatuhan terhadap pajak dan potongan wajib secara otomatis.',
        bullets: ['Proses payroll, file transfer bank, dan slip gaji', 'Laporan payroll lengkap', 'Alur persetujuan', 'Perhitungan pajak dan potongan wajib secara otomatis'] },
      grow: { desc: 'Sistem payroll untuk sistem penggajian yang lebih kompleks. Dilengkapi fitur multi-mata uang, pemetaan General Ledger (GL), deteksi anomali sebelum proses penggajian, penyesuaian gaji berlaku surut (backdated), pengelolaan pinjaman karyawan, serta pilihan benefit yang beragam.',
        bullets: ['Payroll multi-mata uang & pemetaan General Ledger (GL)', 'Deteksi anomali sebelum payroll diproses', 'Revisi gaji & penyesuaian berlaku surut (backdated)', 'Pinjaman karyawan & lebih banyak pilihan benefit'] },
      transform: { desc: 'Solusi payroll yang dirancang khusus sesuai kebutuhan perusahaan Anda. Mulai dari alur penggajian, persetujuan, skema pinjaman, hingga struktur benefit dapat dikonfigurasi penuh untuk menangani payroll bervolume tinggi tanpa hambatan.',
        bullets: ['Proses payroll & alur persetujuan yang dapat disesuaikan', 'Jenis pinjaman & skema benefit yang dapat dikustomisasi', 'Mendukung payroll dalam skala besar'] }
    },
    Talent: {
      grow: { desc: 'Bangun dan kembangkan potensi karyawan secara lebih terencana. Mulai dari kelola penilaian kinerja dan evaluasi 180°, tetapkan sasaran, OKR, dan KPI, pantau masa probation, atur program pelatihan melalui kalender, serta rencanakan kebutuhan tenaga kerja di masa depan.',
        bullets: ['Penilaian kinerja & evaluasi 180°', 'Perencanaan sasaran kerja, OKR, & KPI', 'Pemantauan masa probation karyawan', 'Kalender pelatihan, anggaran, & perencanaan kebutuhan tenaga kerja'] },
      transform: { desc: 'Kelola seluruh proses pengembangan talenta lebih strategis. Mulai dari feedback 360°, penilaian yang lebih objektif, perencanaan suksesi dengan 9-box, rekomendasi pembelajaran berbasis AI, hingga pengelolaan kenaikan gaji, insentif, dan proyeksi biaya tenaga kerja.',
        bullets: ['Feedback 360° (termasuk dari pihak eksternal)', 'Perencanaan suksesi dengan matriks 9-box', 'Rekomendasi pembelajaran berbasis AI', 'Kenaikan gaji berbasis kinerja, insentif, & proyeksi biaya tenaga kerja'] }
    },
    Engagement: {
      manage: { desc: "Berikan karyawan ruang bersuara serta kelola setiap permasalahan secara terstruktur. Keluhan ditangani melalui alur banding yang jelas, sementara kasus disipliner terdokumentasi lengkap dengan surat resmi.",
        bullets: ['Saluran aspirasi karyawan', 'Pengelolaan keluhan dengan alur banding', 'Pengelolaan kasus disipliner & pembuatan surat'] },
      grow: { desc: 'Dengarkan aspirasi karyawan secara lebih menyeluruh. Lengkapi pengelolaan masukan dan keluhan dengan survei serta pulse survey yang terarah untuk memperoleh sentimen berbasis data.',
        bullets: ['Semua fitur pada paket Manage', 'Survei terarah & pulse survey', 'Pengukuran sentimen karyawan'] },
      transform: { desc: "Bangun budaya apresiasi di perusahaan. Nikmati seluruh fitur pada paket Grow, ditambah pemberian apresiasi secara langsung, feed pencapaian bersama, dan sistem reward yang dapat ditukarkan.",
        bullets: ['Semua fitur pada paket Grow', 'Apresiasi langsung dari rekan kerja maupun atasan', 'Feed pencapaian bersama (shared wins feed)', 'Reward yang dapat ditukarkan (redeemable rewards)'] }
    },
    Recruitment: {
      grow: { desc: 'Rekrut dan onboarding karyawan dengan lebih terstruktur. Mulai dari menyetujui kebutuhan rekrutmen, mempublikasikan lowongan ke berbagai platform sekaligus, menyaring kandidat lewat portal rekrutmen, hingga onboarding karyawan baru dengan dokumentasi dan checklist yang lengkap.',
        bullets: ['Persetujuan lowongan & publikasi di banyak platform', 'Portal kandidat, pemeringkatan & shortlist kandidat', 'Wawancara terstruktur & penawaran kerja (offers)', 'Checklist onboarding'] },
      transform: { desc: 'Rekrut dalam skala besar dengan lebih cerdas. Unggah CV secara massal dengan pemrosesan AI, akses bank CV eksternal, serta pantau performa dan biaya rekrutmen dibandingkan anggaran yang telah disetujui.',
        bullets: ['Unggah banyak CV sekaligus & pemrosesan berbasis AI', 'Bank CV eksternal', 'Pemantauan kinerja & biaya perekrutan vs. anggaran'] }
    },
    Insights: {
      manage: { desc: "Pantau seluruh aktivitas perusahaan Anda dalam satu tempat. Mulai dari laporan standar untuk setiap modul, data tenaga kerja secara real-time, hingga Lexi Smart Navigator yang memudahkan Anda mengakses halaman yang dibutuhkan hanya dalam beberapa klik. Lexi AI tersedia sebagai fitur tambahan (add-on).",
        bullets: ['Pustaka laporan standar untuk semua modul', 'Data tenaga kerja secara real-time dalam satu tampilan', 'Lexi Smart Navigator untuk akses cepat ke setiap halaman', 'Lexi AI tersedia sebagai fitur tambahan (add-on)'] },
      grow: { desc: 'Temukan jawaban sendiri tanpa perlu bergantung pada tim HR. Dapatkan laporan kustom dan terjadwal, dashboard interaktif, serta Lexi Super Agent yang memungkinkan karyawan menyelesaikan berbagai kebutuhan HR hanya dengan mengajukannya lewat chat.',
        bullets: ['Laporan kustom dan terjadwal', 'Dashboard interaktif', 'Lexi Super Agent untuk kebutuhan HR mandiri (self-service)'] },
      transform: { desc: 'Ambil keputusan yang lebih baik dengan insight karyawan yang menyeluruh. Nikmati laporan dan dashboard yang disesuaikan dengan kebutuhan perusahaan Anda, tampilan data yang terintegrasi dari payroll, performa, dan engagement, serta Lexi AI Insights yang siap menjawab berbagai pertanyaan tentang karyawan.',
        bullets: ['Laporan dan dashboard yang disesuaikan dengan kebutuhan Anda', 'Tampilan data payroll, performa, dan engagement yang terintegrasi', 'Lexi AI Insights untuk menjawab berbagai pertanyaan seputar karyawan'] }
    }
  } : {
    HR: {
      manage: { desc: 'Get your people data right. Build your company structure, keep a single accurate record for every employee, and generate HR letters — with self-service updates, mobile access, and a full audit trail.',
        bullets: ['Company structure & single employee record', 'Statutory details & centralised documents', 'HR letters & self-service updates', 'Mobile access & full audit trail'] },
      grow: { desc: 'Your HR foundation, stretched for a more complex organisation — deeper hierarchies, custom fields, more lifecycle types, and richer supervisor dashboards as headcount and structure grow.',
        bullets: ['Deeper hierarchies & custom info fields', 'Custom validations & more lifecycle types', 'End-to-end exits', 'Richer supervisor dashboards'] },
      transform: { desc: 'HR administration at enterprise scale, shaped to how you operate. Structure, fields, lifecycle types, and alerts are configured to your requirements, with fully automated exit clearance and final settlement.',
        bullets: ['Structure, fields & lifecycle types configured to you', 'Custom alerts', 'Fully automated exit clearance & final settlement'] }
    },
    Time: {
      manage: { desc: 'Run attendance and leave accurately. Schedule shifts, capture clock-in from mobile or web, approve attendance before payroll, and manage statutory leave with balances and approvals.',
        bullets: ['Shift scheduling & mobile/web clock-in', 'Late arrival & overtime tracking', 'Attendance approval before payroll', 'Statutory leave balances & approvals'] },
      grow: { desc: 'Tighter control as your workforce spreads out. Adds geo-fenced clock-in, project timesheets, supervisor dashboards, earned leave planning, and multiple holiday calendars with your own leave types.',
        bullets: ['Geo-fenced clock-in & overtime approvals', 'Project timesheets & supervisor dashboards', 'Earned leave & leave planning', 'Multiple holiday calendars & custom leave types'] },
      transform: { desc: 'Time and attendance built for complex, multi-site operations — multiple shift patterns, flexi shifts, mutual shift swapping, and custom overtime and leave rules configured around how your business runs.',
        bullets: ['Multiple shift patterns', 'Flexi & staggered shifts, shift swapping', 'Custom overtime calculations', 'Custom leave rules & validations'] }
    },
    Pay: {
      manage: { desc: 'Pay people accurately and on time. Run payroll through approvals, generate bank files, payslips, and a full pay register, and stay compliant with automatic tax and statutory deductions.',
        bullets: ['Payroll runs, bank files & payslips', 'Full pay register', 'Approval workflows', 'Automatic tax & statutory deductions'] },
      grow: { desc: 'Payroll for a more complex pay structure. Adds multi-currency payroll, GL mapping, anomaly detection before processing, salary revisions with back-pay, employee loans, and a wider range of benefits.',
        bullets: ['Multi-currency payroll & GL mapping', 'Anomaly detection before processing', 'Salary revisions & backdated adjustments', 'Employee loans & wider benefit types'] },
      transform: { desc: 'Payroll shaped to your organisation. Pay runs, approvals, loan types, and benefit structures are all configured to your requirements — complex, high-volume payroll handled without compromise.',
        bullets: ['Pay runs & approvals configured to you', 'Custom loan types & benefit structures', 'High-volume payroll handled at scale'] }
    },
    Talent: {
      grow: { desc: 'Start developing your people deliberately. Run appraisals and 180° reviews, manage goals and OKRs, track probation, administer training with a course calendar, and model future headcount.',
        bullets: ['Appraisals & 180° reviews', 'Goals, OKRs & KPI planning', 'Probation tracking', 'Training calendar, budgets & headcount modelling'] },
      transform: { desc: 'Lead talent strategically. Adds 360° feedback (incl. external parties), bias-mitigated scoring, succession planning with 9-box calibration, AI-recommended learning paths, merit-based incentives, and workforce cost forecasting.',
        bullets: ['360° feedback incl. external parties', 'Succession planning & 9-box calibration', 'AI-recommended learning paths', 'Merit increments, incentives & cost forecasting'] }
    },
    Engagement: {
      manage: { desc: "Give employees a voice and handle issues properly — grievances follow a clear appeals path, and disciplinary incidents are tracked as structured cases with letter generation.",
        bullets: ['Employee voice channel', 'Grievances with appeals path', 'Disciplinary case management & letters'] },
      grow: { desc: 'Start listening at scale. Adds targeted employee surveys and pulse checks on top of voice and grievance handling, so you measure sentiment instead of guessing at it.',
        bullets: ['Everything in Manage, plus', 'Targeted surveys & pulse checks', 'Sentiment measurement at scale'] },
      transform: { desc: "Build a culture of recognition. Everything in Grow, plus in-the-moment recognition — points for great work, wins celebrated in a shared feed, and redeemable rewards.",
        bullets: ['Everything in Grow, plus', 'In-the-moment peer & manager recognition', 'Shared wins feed', 'Redeemable rewards'] }
    },
    Recruitment: {
      grow: { desc: 'Hire and onboard properly. Approve vacancies, post once to advertise everywhere, give candidates an interactive portal, shortlist and interview, then onboard with documentation and task checklists.',
        bullets: ['Vacancy approvals & multi-channel posting', 'Candidate portal, ranking & shortlisting', 'Structured interviews & offers', 'Onboarding checklists'] },
      transform: { desc: 'Recruit at volume, with intelligence. Adds bulk CV upload with AI processing, an external CV pool, and hiring performance and cost tracking against your approved budget.',
        bullets: ['Bulk CV upload & AI processing', 'External CV pool', 'Hiring performance & cost tracking vs. budget'] }
    },
    Insights: {
      manage: { desc: "See what's happening across your organisation — standard reports spanning every module, live workforce metrics in one view, and Lexi Smart Navigator to jump straight to any screen. Lexi AI is available as an add-on.",
        bullets: ['Standard report library', 'Live workforce metrics in one view', 'Lexi Smart Navigator', 'Lexi AI available as add-on'] },
      grow: { desc: 'Answer your own questions. Adds custom and scheduled reports, interactive dashboards, and Lexi Super Agent, so employees self-serve HR tasks just by asking.',
        bullets: ['Custom & scheduled reports', 'Interactive dashboards', 'Lexi Super Agent for self-service tasks'] },
      transform: { desc: 'Lead with people intelligence. Reporting and dashboards configured to your requirements, with a joined-up view across payroll, performance, and engagement, plus Lexi AI Insights to answer any workforce question.',
        bullets: ['Reporting & dashboards configured to you', 'Joined-up payroll, performance & engagement view', 'Lexi AI Insights answers any workforce question'] }
    }
  };
  var svgCheck = '<svg class="pc-ic pc-ic-yes" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var svgTick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  /* tier ladder cards — desc/bullets are rewritten per selected module
     by updateLadderForModule() below, so keep a handle on each. */
  var ladder = document.getElementById('pcLadder');
  var ladderEls = {};
  TIERS.forEach(function (pair) {
    var k = pair[0], name = pair[1], c = CARDS[k];
    var el = document.createElement('div');
    el.className = 'pc-tier-card'; el.dataset.tier = k; el.tabIndex = 0; el.setAttribute('role', 'button');
    el.innerHTML = (c.popular ? '<span class="pc-popular">' + (LANG === 'id' ? 'Paling Diminati' : 'Most chosen') + '</span>' : '') +
      '<div class="pc-tname"><span class="pc-chip"></span>' + name + '</div>' +
      '<div class="pc-ttag">' + c.tag + '</div>' +
      '<div class="pc-tdesc"></div>' +
      '<ul></ul>' +
      '<a href="#" class="pc-btn" data-open-hs>' + (LANG === 'id' ? 'Hubungi Kami' : 'Contact Us') + '</a>';
    var goToBuilder = function () { document.getElementById('pcCmp').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    el.addEventListener('click', function (e) { if (e.target.closest('a')) return; goToBuilder(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToBuilder(); } });
    ladderEls[k] = { card: el, desc: el.querySelector('.pc-tdesc'), list: el.querySelector('ul'), fallback: c };
    ladder.appendChild(el);
  });
  /* trailing spacer so the last card can scroll-snap flush in the
     mobile carousel too — see .pc-ladder-spacer in pricing.css */
  var ladderSpacer = document.createElement('div');
  ladderSpacer.className = 'pc-ladder-spacer';
  ladderSpacer.setAttribute('aria-hidden', 'true');
  ladder.appendChild(ladderSpacer);

  /* mobile-only tier tabs — the ladder cards become a swipeable
     horizontal carousel below 900px (see .pc-ladder-grid in
     pricing.css), and swipe alone isn't a discoverable or reliable way
     for everyone to reach Grow/Transform, so these give an explicit tap
     target that scrolls the carousel to the matching card. Hidden by
     CSS above 900px, where all three cards already sit side by side. */
  var tierTabs = document.getElementById('pcTierTabs');
  var tabEls = {};
  if (tierTabs) {
    TIERS.forEach(function (pair) {
      var k = pair[0], name = pair[1];
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'pc-tier-tab'; btn.dataset.tier = k; btn.textContent = name;
      btn.addEventListener('click', function () {
        ladderEls[k].card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      });
      tabEls[k] = btn;
      tierTabs.appendChild(btn);
    });
    /* highlight whichever card is currently most in view as the user
       swipes, so the tabs track the carousel instead of going stale */
    var tabObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          var k = entry.target.dataset.tier;
          TIERS.forEach(function (pair) { tabEls[pair[0]].classList.toggle('pc-on', pair[0] === k); });
        }
      });
    }, { root: ladder, threshold: [0.6] });
    TIERS.forEach(function (pair) { tabObserver.observe(ladderEls[pair[0]].card); });
  }

  function updateLadderForModule(name) {
    var hideManage = NO_MANAGE.indexOf(name) !== -1;
    ladderEls.manage.card.hidden = hideManage;
    ladder.classList.toggle('pc-two-tier', hideManage);
    if (tabEls.manage) tabEls.manage.hidden = hideManage;
    var copy = MODULE_TIERS[name];
    TIERS.forEach(function (pair) {
      var k = pair[0];
      if (k === 'manage' && hideManage) return;
      var c = (copy && copy[k]) || ladderEls[k].fallback;
      ladderEls[k].desc.textContent = c.desc;
      ladderEls[k].list.innerHTML = (c.bullets || []).map(function (b) { return '<li>' + svgTick + '<span>' + b + '</span></li>'; }).join('');
    });
  }

  /* cell rendering */
  function linkify(s) { return String(s).replace(/\[(.+?)\]\((.+?)\)/g, function (_, t, u) { return '<a class="pc-cell-link" href="' + u + '"' + (u !== '#' ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>'; }); }
  function plainify(s) { return String(s).replace(/\[(.+?)\]\((.+?)\)/g, '$1'); }
  var SALES_LABEL = LANG === 'id' ? 'Hubungi Sales' : 'Talk to sales';
  function cellContent(val) {
    var v = (val || '').trim();
    if (v === 'yes') return svgCheck;
    if (v === '' || v === '-') return '<span class="pc-dash">—</span>';
    if (v.toLowerCase() === 'add-on') return '<span class="pc-pill">Add-on</span>';
    if (/^tts:/i.test(v)) {
      var label = v.slice(v.indexOf(':') + 1).trim();
      return '<span class="pc-cap pc-tts-cap">' + linkify(label) + '</span><span class="pc-pill pc-sales">' + SALES_LABEL + '</span>';
    }
    if (v.toLowerCase() === 'talk to sales' || v.toLowerCase() === 'talk to sale') return '<span class="pc-pill pc-sales">' + SALES_LABEL + '</span>';
    return '<span class="pc-cap">' + linkify(v.replace(/\s{2,}/g, ' · ')) + '</span>';
  }
  var uid = 0;
  function itemRow(it, hideManage) {
    var row = document.createElement('div'); row.className = 'pc-row' + (it.flag ? ' pc-flag' : '');
    var hasInfo = it.info || (it.children && it.children.length);
    var pop = '';
    if (hasInfo) {
      var id = 'pcp' + (uid++);
      var covers = '';
      if (it.children && it.children.length) {
        covers = LANG === 'id'
          ? '<div class="pc-covers"><div class="pc-ch">Mencakup — berdasarkan modul yang Anda miliki</div><div class="pc-tags">' + it.children.map(function (c) { return '<span class="pc-tag">' + c.module + '</span>'; }).join('') + '</div></div><div class="pc-avail">Tersedia sebagai add-on; jawaban yang dapat diberikan Lexi bergantung pada modul dalam paket Anda.</div>'
          : '<div class="pc-covers"><div class="pc-ch">Covers — based on the modules you own</div><div class="pc-tags">' + it.children.map(function (c) { return '<span class="pc-tag">' + c.module + '</span>'; }).join('') + '</div></div><div class="pc-avail">Available as an add-on; what Lexi can answer depends on the modules in your plan.</div>';
      }
      pop = '<span class="pc-info"><button class="pc-info-btn" aria-expanded="false" aria-controls="' + id + '" aria-label="' + (LANG === 'id' ? 'Informasi lebih lanjut' : 'More information') + '">i</button>' +
        '<div class="pc-pop" id="' + id + '" role="dialog"><div class="pc-pt">' + plainify(it.label) + '</div>' + (it.info ? '<div class="pc-pd">' + it.info + '</div>' : '') + covers + '</div></span>';
    }
    var badge = it.tag === 'new' ? '<span class="pc-label-badge pc-label-badge-new">' + (LANG === 'id' ? 'Baru' : 'New') + '</span>'
      : it.tag === 'soon' ? '<span class="pc-label-badge pc-label-badge-soon">' + (LANG === 'id' ? 'Segera Hadir' : 'Coming Soon') + '</span>' : '';
    row.innerHTML = '<div class="pc-cell-item"><span class="pc-lbl">' + linkify(it.label) + '</span>' + badge + pop + '</div>' +
      (hideManage ? '' : '<div class="pc-cell" data-tier="manage">' + cellContent(it.manage) + '</div>') +
      '<div class="pc-cell" data-tier="grow">' + cellContent(it.grow) + '</div>' +
      '<div class="pc-cell" data-tier="transform">' + cellContent(it.transform) + '</div>';
    return row;
  }

  /* module nav (left) + detail panel (right): pick a module on the
     left, its capability list renders on the right under the one
     persistent Manage/Grow/Transform header (not re-rendered per
     module or per group — it's static markup, see pricing-body.html).
     Groups are always fully expanded, no accordion. */
  var cmpNav = document.getElementById('pcCmpNav');
  var panelHead = document.getElementById('pcPanelHead');
  var groupsEl = document.getElementById('pcGroups');
  var leadEl = document.getElementById('pcLead');
  var thRow = document.querySelector('.pc-th-row');
  var thManageCol = thRow.querySelector('[data-tier=manage]');
  var pcCmp = document.getElementById('pcCmp');
  var searchFeed = document.getElementById('pcSearchFeed');
  var ladderSection = document.getElementById('pcLadderSection');
  /* scrolls to the top of the light-grey .pc-ladder section itself
     (above the "Explore PeoplesHR" heading), not just the tier-card
     grid further down inside it — used whenever picking a module or
     standout feature from the left nav. */
  function scrollToLadderSection() { ladderSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  var ORDER = DATA.modules.map(function (m) { return m.name; });
  var dataByName = {};
  DATA.modules.forEach(function (m) { dataByName[m.name] = m; });
  var navByName = {};

  /* moduleIcon() renders the right markup at whatever size class is
     passed in, so the same source can appear at nav size, panel-head
     size, or the ladder heading's size.

     IMG_BASE points at the local uploads folder, relative to view-plans.html
     (the only page that loads this script), so both the English and Bahasa
     content on that page load the same local images. */
  var IMG_BASE = '/uploads/2026/07/';
  var MODULE_ICON_SRC = {
    HR: IMG_BASE + 'HRIcon.webp',
    Time: IMG_BASE + 'TimeIcon.webp',
    Pay: IMG_BASE + 'PayIcon.webp',
    Talent: IMG_BASE + 'TalentIcon.webp',
    Engagement: IMG_BASE + 'EngagementIcon.webp',
    Recruitment: IMG_BASE + 'Recruitment.webp',
    Insights: IMG_BASE + 'InsightsIcon.webp'
  };
  function moduleIcon(name, sizeClass) {
    var src = MODULE_ICON_SRC[name];
    return src ? '<img class="' + sizeClass + '" src="' + src + '" alt="">' : '';
  }
  var NAV_ICONS = {};
  DATA.modules.forEach(function (m) { NAV_ICONS[m.name] = moduleIcon(m.name, 'pc-nav-ic'); });

  /* the module nav has no "All Modules" entry — searching (via the
     search bar) already covers every module at once regardless of
     which module button is selected (see showAllModulesView below);
     the per-module buttons here are just for browsing one module's
     full table directly. */
  DATA.modules.forEach(function (m) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.dataset.c = m.color;
    btn.innerHTML = (NAV_ICONS[m.name] || '') + '<span class="pc-nav-label">' + m.name + '</span>';
    btn.addEventListener('click', function () {
      if (!searchFeed.hidden) { jumpToModuleInFeed(m.name); }
      else { selectModule(m.name); scrollToLadderSection(); }
    });
    navByName[m.name] = btn;
    cmpNav.appendChild(btn);
  });

  /* three standout capabilities that cut across every module/tier
     rather than living in the Manage/Grow/Transform data — a divider
     separates them from the module list, and picking one swaps in a
     plain capability-card grid (no tier columns) instead of the
     comparison table. Copy/descriptions are condensed from the same
     capability text already used elsewhere on the site (mobile app,
     employee/manager self-service, and the Ask Lexi AI group), not
     new claims. */
  var MOBILE_APP_LOGO_SRC = IMG_BASE + 'phr_mobile_app_logo.svg';
  var SELF_SERVICE_ICON_SRC = IMG_BASE + 'self_service.svg';
  /* the wordmark (white lettering, made for a dark background) is used
     on the pricing card's own brand row (itself dark); the square X
     glyph is used everywhere the icon needs to stand alone, like the
     nav tile and panel head, same square treatment as module icons. */
  var LEXI_LOGO_SRC = '/uploads/2026/05/lexi-s.png';
  var LEXI_X_ICON_SRC = IMG_BASE + 'lexi_x_icon.svg';
  var STANDOUT = LANG === 'id' ? {
    lexi: {
      name: 'Lexi Ai', tagline: 'Selesaikan berbagai kebutuhan HR dengan percakapan sederhana.',
      icon: '<img class="pc-nav-ic" src="' + LEXI_X_ICON_SRC + '" alt="Lexi">',
      panelIcon: '<img class="pc-mod-ic" src="' + LEXI_X_ICON_SRC + '" alt="Lexi">',
      pricingCards: [
        {
          badge: 'Insights',
          price: 'US$60', priceUnit: '/ lisensi / bulan',
          tokenNote: 'Termasuk <b>10 juta token</b> per lisensi, per bulan.',
          footnote: 'Kemampuan dan analisis data yang tersedia bergantung pada modul PeoplesHR yang diaktifkan perusahaan Anda.',
          includedHeading: "Fitur yang Termasuk",
          included: [
            'Insight dan rekomendasi cerdas',
            'Insight sesuai konteks internal perusahaan',
            'Perencanaan kebutuhan tenaga kerja',
            'Analisis kesiapan talenta untuk peran strategis',
            'Simulasi payroll dan estimasi biaya',
            'Analisis turnover karyawan dan risiko SDM',
            'Deteksi risiko burnout dan kesejahteraan karyawan',
            'AI yang memahami konteks percakapan',
            'Keamanan data dan kepatuhan terhadap standar enterprise',
            'Identifikasi hambatan dalam proses rekrutmen',
            'Akses menyeluruh ke data HR bagi pimpinan HR'
          ]
        },
        {
          badge: 'Super Agent',
          accent: 'blue',
          includedIn: ['Grow', 'Transform'],
          tagline: 'Asisten AI berbasis percakapan yang dapat menangani berbagai permintaan di seluruh modul HR, Payroll, dan Time dalam satu chat. Dirancang untuk membantu karyawan, manajer, dan admin menyelesaikan pekerjaan tanpa perlu berpindah-pindah modul.',
          includedHeading: "Fitur yang Termasuk",
          groups: [
            { name: 'Untuk Karyawan', items: [
              'Mengajukan atau membatalkan cuti',
              'Melihat sisa kuota dan riwayat cuti',
              'Mengakses slip gaji (termasuk pembayaran di luar jadwal payroll)',
              'Menanyakan kebijakan perusahaan',
              'Melihat benefit yang tersedia',
              'Melihat atau memperbarui informasi profil sesuai hak akses',
              'Menanyakan informasi pajak, BPJS, potongan wajib, dan estimasi penghasilan'
            ] },
            { name: 'Untuk Manager', items: [
              'Memantau kehadiran dan ketidakhadiran anggota tim',
              'Mengakses informasi jadwal shift karyawan',
              'Melihat pengajuan cuti, lembur, absensi, koreksi kehadiran, hingga perubahan shift'
            ] },
            { name: 'Untuk HR dan Administrator', items: [
              'Mengelola data karyawan dan struktur organisasi',
              'Mengelola struktur organisasi, lokasi kerja, cost center, grade gaji, dan jabatan',
              'Memperbarui pengaturan absensi dan benefit',
              'Membuat job description dan target kerja',
              'Meninjau informasi proses rekrutmen'
            ] }
          ]
        },
        {
          badge: 'Smart Navigator',
          accent: 'blue',
          includedIn: ['Manage', 'Grow', 'Transform'],
          tagline: 'Layanan pencarian terpusat yang memangkas waktu navigasi di seluruh platform.',
          footnote: 'Menjadi keunggulan utama bersama Lexi Ai — dirancang khusus untuk secara signifikan mengurangi waktu yang dihabiskan pengguna HR dan karyawan saat menavigasi sistem yang rumit.',
          includedHeading: 'Kemampuan Utama',
          included: [
            'Navigasi Cerdas — temukan dan buka menu, modul, atau fungsi apa pun secara cepat tanpa harus mencari manual satu per satu di tampilan layar',
            'Berbasis AI — gunakan AI untuk memahami apa yang ingin Anda cari dan langsung tampilkan hasil yang paling relevan',
            'Akses Universal — fitur pencarian terpusat untuk seluruh platform PeoplesHR'
          ]
        }
      ]
    },
    mobile: {
      name: 'Mobile App', tagline: 'Bekerja lebih mudah, di mana saja.',
      icon: '<img class="pc-nav-ic" src="' + MOBILE_APP_LOGO_SRC + '" alt="Mobile App">',
      panelIcon: '<img class="pc-mod-ic" src="' + MOBILE_APP_LOGO_SRC + '" alt="Mobile App">',
      cards: [
        { title: 'Employee Self-Service', items: [
          'Tampilan beranda yang dipersonalisasi dengan widget serbaguna untuk melihat semua informasi penting',
          'Lihat dan perbarui data pribadi Anda',
          'Lihat dan unduh slip gaji kapan saja tanpa perlu dicetak',
          'Ajukan cuti, termasuk cuti singkat dan cuti per jam',
          'Cek sisa cuti dan lihat ketersediaan anggota tim hingga 5 hari ke depan',
          'Lihat sisa saldo pinjaman dan riwayat pembayarannya',
          'Lihat benefit dan hak karyawan yang Anda dapatkan',
          'Pantau status dari seluruh pengajuan dalam satu tempat',
          'Ajukan kasbon kapan saja tanpa perlu mendatangi HR',
          'Lihat riwayat kehadiran langsung dari aplikasi',
          'Ikuti survei perusahaan dan pulse check',
          'Catat dan lacak insiden di tempat kerja secara real-time',
          'Kirim masukan, saran, atau keluhan kepada HR dengan mudah'
        ] },
        { title: 'Kehadiran', items: [
          'Konfirmasi lokasi Anda secara otomatis saat melakukan clock-in',
          'Batasi presensi masuk hanya di lokasi kerja yang telah disetujui',
          'Dapatkan notifikasi instan terkait aktivitas kehadiran'
        ] },
        { title: 'Akses dan Fitur Manager', items: [
          'Setujui atau tolak pengajuan cuti langsung dari notifikasi HP',
          'Lihat jadwal cuti dan ketersediaan tim hingga 5 hari ke depan',
          'Akses dashboard analitik kehadiran dan performa tim',
          'Pantau kehadiran seluruh departemen, bukan hanya tim Anda',
          'Kelola jadwal shift dan roster kapan saja'
        ] },
        { title: 'Fitur Lexi AI', items: [
          'Ajukan cuti cukup dengan mengetik atau berbicara kepada Lexi',
          'Ajukan cuti per jam dengan pengecekan kebijakan perusahaan dan sisa cuti secara otomatis',
          'Tanyakan insight tentang karyawan dan dapatkan jawaban instan yang dihasilkan AI'
        ] },
        { title: 'Performance & Talent', items: [
          'Selesaikan evaluasi kinerja, termasuk alur penilaian dengan beberapa tahap',
          'Lakukan penilaian kompetensi sesuai dengan peran karyawan',
          'Pantau perkembangan performa setiap hari'
        ] },
        { title: 'Personalisasi & UX', items: [
          'Atur ulang tampilan aplikasi untuk menempatkan fitur yang paling sering digunakan di urutan teratas',
          'Sesuaikan widget di dashboard berdasarkan kebutuhan',
          'Gunakan aplikasi dalam bahasa pilihan Anda',
          'Selesaikan tugas sehari-hari hanya dalam 3 kali tap atau kurang'
        ] }
      ]
    },
    selfservice: {
      name: 'Self Service Portal', tagline: 'Kurangi permintaan yang harus diproses HR.',
      icon: '<img class="pc-nav-ic" src="' + SELF_SERVICE_ICON_SRC + '" alt="Self Service Portal">',
      panelIcon: '<img class="pc-mod-ic" src="' + SELF_SERVICE_ICON_SRC + '" alt="Self Service Portal">',
      cards: [
        { title: 'Pengelolaan Informasi Pribadi', items: [
          'Lihat dan perbarui data profil pribadi',
          'Ubah rute persetujuan sesuai alur kerja yang berlaku',
          'Sesuaikan tampilan kolom tertentu (misalnya format angka di Bangladesh)',
          'Kelola file pribadi secara digital (hingga 201 file)'
        ] },
        { title: 'Payroll & Kompensasi', items: [
          'Akses slip gaji kapan saja tanpa perlu meminta ke HR',
          'Lihat riwayat gaji dan kompensasi',
          'Akses informasi pinjaman',
          'Cek rincian gaji dan tunjangan'
        ] },
        { title: 'Pengelolaan Cuti', items: [
          'Ajukan cuti langsung dari mana saja (web atau aplikasi mobile)',
          'Lihat sisa saldo cuti secara real-time',
          'Pantau status pengajuan dari awal hingga disetujui',
          'Atasan menerima notifikasi otomatis tanpa perlu diingatkan'
        ] },
        { title: 'Kehadiran & Pelacakan Waktu Kerja', items: [
          'Check-in dan check-out melalui aplikasi mobile',
          'Clock-in menggunakan GPS untuk memastikan lokasi yang valid',
          'Batasi absensi hanya di lokasi yang telah ditentukan',
          'Lihat riwayat kehadiran',
          'Lakukan absensi offline yang tersinkron saat internet tersedia'
        ] },
        { title: 'Pengelolaan Dokumen & Sertifikat', items: [
          'Minta surat keterangan kerja tanpa perlu bantuan tim HR secara manual',
          'Akses ke dokumen kebijakan dan memo perusahaan',
          'Lacak konfirmasi pembacaan dokumen'
        ] },
        { title: 'Performance & Pengembangan Karyawan', items: [
          'Partisipasi dalam penilaian kinerja dan pengelolaan KPI',
          'Ajukan proposal target dan penilaian mandiri',
          'Ajukan permohonan pelatihan kerja dan akses materi pembelajaran'
        ] },
        { title: 'Layanan Bantuan & Dukungan HR', items: [
          'Ajukan permintaan terkait urusan HR ke Service Request Tracker',
          'Pantau status tiket secara real-time',
          'Ajukan permohonan kasbon atau pinjaman kapan saja'
        ] },
        { title: 'Asisten Berbasis AI: Lexi', items: [
          'Tanyakan pertanyaan seputar HR dengan bahasa sehari-hari',
          'Jalankan berbagai tugas melalui AI (misalnya mengajukan cuti lewat chat)',
          'Temukan menu atau fitur di sistem lebih cepat melalui Smart Navigator'
        ] },
        { title: 'Engagement & Komunikasi', items: [
          'Ikuti survei perusahaan',
          'Sampaikan keluhan atau masukan',
          'Lihat informasi lowongan internal',
          'Ketahui siapa saja rekan tim yang sedang cuti melalui dashboard'
        ] }
      ]
    },
  } : {
    lexi: {
      name: 'Lexi Ai', tagline: 'Turn any HR action into a simple conversation.',
      icon: '<img class="pc-nav-ic" src="' + LEXI_X_ICON_SRC + '" alt="Lexi">',
      panelIcon: '<img class="pc-mod-ic" src="' + LEXI_X_ICON_SRC + '" alt="Lexi">',
      /* Lexi is three separate products, each rendered as its own
         bespoke pricing-card row (see renderFeaturePanel's
         f.pricingCards branch) instead of the shared title+desc/
         title+checklist card grid — none of them are tier-scoped
         capabilities like the other standout features. Insights is
         priced and sold as its own add-on; Super Agent and Smart
         Navigator are bundled into existing tiers (see their
         includedIn), so they show which tiers include them instead
         of a price. */
      pricingCards: [
        {
          badge: 'Insights',
          price: 'US$60', priceUnit: '/ seat / month',
          tokenNote: 'Includes <b>10 million tokens</b> per seat, per month.',
          footnote: 'Capabilities and insights available depend on the PeoplesHR modules enabled for your organisation.',
          includedHeading: "What's Included",
          included: [
            'Proactive insights, and recommendations',
            'Insights grounded in your organisation’s context',
            'Cross-module workforce planning',
            'Succession planning and readiness insights',
            'Payroll & cost-impact modelling',
            'Attrition & people-risk analysis',
            'Workforce health & burnout signals',
            'Multi-turn, follow-up-aware conversations',
            'Enterprise-grade security & compliance',
            'Recruitment bottleneck analysis',
            'Unrestricted visibility into HR records for HR Leaders'
          ]
        },
        {
          badge: 'Super Agent',
          accent: 'blue',
          includedIn: ['Grow', 'Transform'],
          tagline: 'A conversational AI layer that handles requests across HR, payroll, and time in one chat. Built to let employees, managers, and admins get things done without navigating separate modules.',
          includedHeading: "What's Included",
          groups: [
            { name: 'For Employees', items: [
              'Apply or cancel leave',
              'Check leave balances and history',
              'Retrieve pay-slips (including off-cycle/unscheduled payments)',
              'Ask about company policies',
              'View available benefits',
              'Access or update permitted profile information',
              'Ask about tax, insurance, statutory deductions, and projected income'
            ] },
            { name: 'For Managers', items: [
              'Review team attendance and absences',
              'Check shift information',
              'View pending approvals — leave, overtime, swipes, manual attendance entries, and shift adjustments'
            ] },
            { name: 'For HR and Administrators', items: [
              'Manage employee and organisational records',
              'Maintain structures, locations, cost centers, salary grades, and designations',
              'Update attendance and benefit configurations',
              'Generate job descriptions and goal plans',
              'Review recruitment information'
            ] }
          ]
        },
        {
          badge: 'Smart Navigator',
          accent: 'blue',
          includedIn: ['Manage', 'Grow', 'Transform'],
          tagline: 'A centralised search layer that cuts navigation time across the platform.',
          footnote: 'Highlighted as a key differentiator alongside Lexi Ai — built to significantly reduce the time HR users and employees spend navigating a complex system.',
          includedHeading: 'Key Capabilities',
          included: [
            'Intelligent Navigation — quickly locate and jump to any menu, module, or function without manually browsing the interface',
            'AI-Powered — uses AI to interpret user intent and surface the most relevant results',
            'Universal Access — acts as a centralised search layer across the entire PeoplesHR platform'
          ]
        }
      ]
    },
    mobile: {
      name: 'Mobile App', tagline: 'Work happens everywhere.',
      icon: '<img class="pc-nav-ic" src="' + MOBILE_APP_LOGO_SRC + '" alt="Mobile App">',
      panelIcon: '<img class="pc-mod-ic" src="' + MOBILE_APP_LOGO_SRC + '" alt="Mobile App">',
      cards: [
        { title: 'Employee Self-Service', items: [
          'A personalised home screen with at-a-glance widgets for everything you need',
          'View and update your own profile information',
          'View and download payslips anytime — no printed copies needed',
          'Apply for leave, including short and hourly leave',
          'Check your leave balance and see your team’s availability up to 5 days ahead',
          'View outstanding loan balances and repayment history',
          'View your enrolled benefits and entitlements',
          'Track the status of every request you’ve submitted, in one place',
          'Request a salary advance anytime, without a trip to HR',
          'View your attendance history directly in the app',
          'Take part in company surveys and pulse checks',
          'Log and track workplace incidents as they happen',
          'A direct channel to send feedback, suggestions, and concerns to HR'
        ] },
        { title: 'Attendance', items: [
          'Confirm your location automatically when you clock in',
          'Restrict clock-in to approved site locations',
          'Get instant notifications on attendance events'
        ] },
        { title: 'Manager Capabilities', items: [
          'Approve or decline leave requests right from a mobile notification',
          'See your team’s leave and availability up to 5 days ahead',
          'A dashboard of team attendance and performance analytics',
          'View attendance across departments, not just your own team',
          'Oversee shift schedules and rosters on the go'
        ] },
        { title: 'Lexi AI-Powered Features', items: [
          'File leave requests just by asking, by voice or text',
          'Apply for hourly leave with automatic policy checks and balance updates',
          'Ask for workforce insights and get instant, AI-generated answers'
        ] },
        { title: 'Performance & Talent', items: [
          'Complete performance evaluations, including multi-stage review templates',
          'Complete competency assessments against your role',
          'Track performance progress day to day'
        ] },
        { title: 'Personalisation & UX', items: [
          'Rearrange the app to put what you use most, first',
          'Customise your dashboard widgets to what matters to you',
          'Use the app in your preferred language',
          'Everyday tasks done in 3 taps or fewer'
        ] }
      ]
    },
    selfservice: {
      name: 'Self Service Portal', tagline: 'Fewer requests routed through HR.',
      icon: '<img class="pc-nav-ic" src="' + SELF_SERVICE_ICON_SRC + '" alt="Self Service Portal">',
      panelIcon: '<img class="pc-mod-ic" src="' + SELF_SERVICE_ICON_SRC + '" alt="Self Service Portal">',
      cards: [
        { title: 'Personal Information Management', items: [
          'View and update personal/employee profile details',
          'Changes routed through approval workflows before reflecting in the system',
          'Customisable fields (e.g., country-specific fields like IT numbers in Bangladesh)',
          'Digital employee file (201 file) management'
        ] },
        { title: 'Payroll & Compensation', items: [
          'On-demand payslip access — no need to request from HR, no printed payslips',
          'View pay history and compensation records',
          'Access loan information (company loans, SSS loans in Philippines)',
          'Salary and benefits visibility'
        ] },
        { title: 'Leave Management', items: [
          'Submit leave requests from anywhere (web or mobile)',
          'View real-time leave balances',
          'Track request status end-to-end',
          'Supervisor receives instant notifications for approval — no chasing required'
        ] },
        { title: 'Attendance & Time Tracking', items: [
          'Clock in/out via mobile app',
          'Geo-tagging and geo-fencing for location-verified clock-ins',
          'Geo-blocking to restrict time capture to approved locations',
          'View personal attendance records',
          'Offline time capture with sync (recently released)'
        ] },
        { title: 'Document & Certificate Management', items: [
          'Request Certificate of Employment (COE) without HR involvement',
          'Access and acknowledge policy documents and memos',
          'Document acknowledgement tracking'
        ] },
        { title: 'Performance & Development', items: [
          'Participate in performance evaluations and KPI management',
          'Goal proposal and planning',
          'Access training requests and L&D resources'
        ] },
        { title: 'Service Requests & Support', items: [
          'Raise HR tickets via Service Request Tracker',
          'Track ticket status in real-time',
          'Submit advance/loan requests at any time'
        ] },
        { title: 'AI-Powered: Lexi', items: [
          'Lexi Chat — ask HR questions in natural language',
          'Execute actions on behalf of the user (e.g., apply for leave via chat)',
          'Smart navigator for system guidance'
        ] },
        { title: 'Engagement & Communication', items: [
          'Access company surveys',
          'Grievance management',
          'Internal vacancy/job posting visibility',
          "Who's on leave / team availability dashboard"
        ] }
      ]
    },
  };
  /* standout capabilities now live in their own section (#pcStandoutSection,
     right after the enterprise-guarantees block) rather than sharing the
     module comparison's nav/panel — they're not scoped to a module or tier,
     so mixing them into that nav under a divider was misleading. This
     section reuses the same .pc-cmp-layout nav+panel structure/CSS as the
     module comparison above (title+subtitle, left nav, detail panel that
     swaps and scrolls the section into view on click) minus the search bar,
     which doesn't apply here. */
  var featureBtnByKey = {};
  var featureHead = document.getElementById('pcFeatureHead');
  var featureGrid = document.getElementById('pcFeatureGrid');
  var standoutNav = document.getElementById('pcStandoutNav');
  var standoutSection = document.getElementById('pcStandoutSection');
  function scrollToStandoutSection() { standoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  Object.keys(STANDOUT).forEach(function (key) {
    var f = STANDOUT[key];
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'pc-nav-feature';
    btn.innerHTML = f.icon + '<span class="pc-nav-label">' + f.name + '</span>';
    btn.addEventListener('click', function () { selectFeature(key); scrollToStandoutSection(); });
    featureBtnByKey[key] = btn;
    standoutNav.appendChild(btn);
  });

  /* reuses .pc-cta-inner (the dark gradient CTA-band card), .pc-mod-
     nameline (the module panel-head's icon+name row), .pc-pill (the
     comparison table's Add-on/Talk-to-sales pills — colour supplied
     via the same --tint/--accent custom properties it already reads),
     .pc-eyebrow, .pc-module-card, and .pc-feature-list (Mobile App's
     tick list) rather than introducing a parallel set of one-off
     classes — only the layout glue below is new. Renders one row per
     pricing card (Insights, Super Agent, Smart Navigator, ...),
     stacked vertically. */
  /* items phrased as "Label — explanation" (e.g. Smart Navigator's
     capabilities) get the label bolded on its own line with the
     explanation below, instead of running both together as one plain
     sentence — easier to scan a short list of named capabilities. */
  function colHtml(items) {
    return '<ul class="pc-feature-list">' + items.map(function (t) {
      var dash = t.indexOf(' — ');
      var body = dash === -1 ? t : '<b>' + t.slice(0, dash) + '</b><br>' + t.slice(dash + 3);
      return '<li>' + svgTick + '<span>' + body + '</span></li>';
    }).join('') + '</ul>';
  }
  /* Insights' flat list splits evenly into two columns; Super Agent's
     list is naturally grouped by audience (Employees/Managers/HR) at
     very uneven sizes, so it renders as stacked named groups instead
     of an even split that would cut a group in half. */
  function includedBodyHtml(p) {
    if (p.groups) {
      /* each group clamps to the first 3 items with its own "view N
         more" toggle (same collapse mechanism as Self Service
         Portal's cards, see featureListHtml/is-expanded below) rather
         than dumping every item — Employees alone has 7. */
      return '<div class="pc-lexi-included-groups">' + p.groups.map(function (g) {
        return '<div class="pc-lexi-group"><div class="pc-lexi-group-name">' + g.name + '</div>' + featureListHtml(g.items) + '</div>';
      }).join('') + '</div>';
    }
    var half = Math.ceil(p.included.length / 2);
    return '<div class="pc-lexi-included-cols">' + colHtml(p.included.slice(0, half)) + colHtml(p.included.slice(half)) + '</div>';
  }
  function pricingCardHtml(p) {
    var priceHtml = p.price
      ? '<h2>' + p.price + '<span class="pc-lexi-price-unit">' + p.priceUnit + '</span></h2>' +
        (p.tokenNote ? '<div class="pc-lexi-token-box">' + p.tokenNote + '</div>' : '')
      : '<div class="pc-lexi-includedin"><span class="pc-lexi-includedin-label">' + (LANG === 'id' ? 'Termasuk dalam paket' : 'Included in') + '</span><div class="pc-lexi-tier-tags">' +
          p.includedIn.map(function (t) { return '<span class="pc-lexi-tier-tag" style="--accent:var(--' + t.toLowerCase() + ')">' + t + '</span>'; }).join('') +
        '</div></div>';
    return '<div class="pc-lexi-row">' +
      '<div class="pc-cta-inner pc-lexi-card' + (p.accent === 'blue' ? ' pc-lexi-card-blue' : '') + '">' +
        '<div class="pc-lexi-brand"><div class="pc-lexi-brand-logo"><img src="' + LEXI_LOGO_SRC + '" alt="Lexi" height="20"><span class="pc-pill" style="--tint:#fff;--accent:#1d4ed8">Ai</span></div><div class="pc-eyebrow">' + p.badge + '</div></div>' +
        priceHtml +
        '<p>' + (p.tagline ? p.tagline + (p.footnote ? ' ' + p.footnote : '') : (p.footnote || '')) + '</p>' +
      '</div>' +
      '<div class="pc-module-card pc-lexi-included">' +
        '<div class="pc-eyebrow">' + p.includedHeading + '</div>' +
        includedBodyHtml(p) +
      '</div>' +
    '</div>';
  }
  function renderPricingFeaturePanel(cards) {
    /* trailing spacer so the last row can scroll-snap flush in the
       mobile carousel too — see .pc-lexi-row-spacer in pricing.css */
    featureGrid.innerHTML = cards.map(pricingCardHtml).join('') + '<div class="pc-lexi-row-spacer" aria-hidden="true"></div>';
  }

  /* long item lists (Mobile App's especially) made cards wildly uneven
     heights in the 2-col grid — clamp to the first 3, with the rest
     tagged .pc-feature-extra and hidden by CSS until the card picks up
     .is-expanded from the delegated click handler below. */
  var FEATURE_LIST_VISIBLE = 3;
  function featureListHtml(items) {
    var extra = items.length - FEATURE_LIST_VISIBLE;
    var lis = items.map(function (it, i) {
      return '<li' + (i >= FEATURE_LIST_VISIBLE ? ' class="pc-feature-extra"' : '') + '>' + svgTick + '<span>' + it + '</span></li>';
    }).join('');
    if (extra <= 0) return '<ul class="pc-feature-list">' + lis + '</ul>';
    var moreLabel = LANG === 'id' ? ('Lihat ' + extra + ' fitur lainnya') : ('View ' + extra + ' more feature' + (extra === 1 ? '' : 's'));
    var lessLabel = LANG === 'id' ? 'Tampilkan lebih sedikit' : 'Show less';
    return '<ul class="pc-feature-list">' + lis + '</ul>' +
      '<button type="button" class="pc-feature-more" data-more-label="' + moreLabel + '" data-less-label="' + lessLabel + '">' + moreLabel + '</button>';
  }

  /* mobile carousel only: both the colored pricing cards (Insights/
     Super Agent/Smart Navigator) and their white "what's included"
     boxes sit side by side while swiping (this slide's row peeking
     against the next), so heights that are naturally uneven — driven
     entirely by how much copy/tags/checklist items each one has — read
     as a visible misalignment there in a way they never did stacked
     vertically on desktop. Match each group (cards among themselves,
     boxes among themselves) to its own tallest member; any resulting
     slack is just blank space at the bottom, which is fine. */
  function equalizeHeights(selector) {
    var els = featureGrid.querySelectorAll(selector);
    if (!els.length) return;
    els.forEach(function (c) { c.style.minHeight = ''; });
    if (!window.matchMedia('(max-width:820px)').matches) return;
    var max = 0;
    els.forEach(function (c) { max = Math.max(max, c.getBoundingClientRect().height); });
    els.forEach(function (c) { c.style.minHeight = max + 'px'; });
  }
  function equalizeLexiHeights() {
    equalizeHeights('.pc-lexi-card');
    equalizeHeights('.pc-lexi-included');
  }
  var lexiHeightResizeTimer;
  window.addEventListener('resize', function () {
    if (!featureGrid.classList.contains('pc-lexi-pricing')) return;
    clearTimeout(lexiHeightResizeTimer);
    lexiHeightResizeTimer = setTimeout(equalizeLexiHeights, 150);
  });

  function renderFeaturePanel(key) {
    var f = STANDOUT[key];
    featureGrid.className = 'pc-feature-grid' + (f.pricingCards ? ' pc-lexi-pricing' : '');
    featureHead.innerHTML = '<span class="pc-mod-textwrap"><span class="pc-mod-nameline">' + f.panelIcon + '<span class="pc-mod-name">' + f.name + '</span></span><span class="pc-mod-desc">' + f.tagline + '</span></span>';
    if (f.pricingCards) {
      renderPricingFeaturePanel(f.pricingCards);
      equalizeLexiHeights();
      return;
    }
    featureGrid.innerHTML = f.cards.map(function (c) {
      var body = c.items ? featureListHtml(c.items) : '<p>' + c.desc + '</p>';
      return '<div class="pc-feature-card"><h4>' + c.title + '</h4>' + body + '</div>';
    }).join('');
  }

  /* delegated so it keeps working across re-renders (switching between
     Mobile App / Self Service Portal rebuilds featureGrid's contents
     each time) without rebinding a listener per button */
  featureGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('.pc-feature-more');
    if (!btn) return;
    var expanded = btn.closest('.pc-feature-card, .pc-lexi-group').classList.toggle('is-expanded');
    btn.textContent = expanded ? btn.dataset.lessLabel : btn.dataset.moreLabel;
  });

  /* mobile-only "View 6 more features" toggle for the Transform
     inclusions grid — same is-expanded pattern as pc-feature-more
     above, just toggling whole cards instead of list items */
  var enterpriseMore = document.getElementById('pcEnterpriseMore');
  var enterpriseGrid = document.getElementById('pcEnterpriseGrid');
  if (enterpriseMore && enterpriseGrid) {
    enterpriseMore.addEventListener('click', function () {
      var expanded = enterpriseGrid.classList.toggle('is-expanded');
      enterpriseMore.textContent = expanded ? enterpriseMore.dataset.lessLabel : enterpriseMore.dataset.moreLabel;
    });
  }

  function selectFeature(key) {
    Object.keys(featureBtnByKey).forEach(function (k) { featureBtnByKey[k].classList.toggle('pc-on', k === key); });
    renderFeaturePanel(key);
  }

  selectFeature(Object.keys(STANDOUT)[0]);

  function renderPanel(name) {
    var m = dataByName[name];
    var hideManage = NO_MANAGE.indexOf(name) !== -1;

    panelHead.innerHTML = '<span class="pc-mod-textwrap"><span class="pc-mod-nameline">' + moduleIcon(m.name, 'pc-mod-ic') + '<span class="pc-mod-name">' + m.name + '</span></span>' + (m.blurb ? '<span class="pc-mod-desc">' + m.blurb + '</span>' : '') + '</span>';

    pcCmp.classList.toggle('pc-no-manage', hideManage);
    thManageCol.hidden = hideManage;

    groupsEl.innerHTML = '';
    m.groups.forEach(function (g, i) {
      var grp = document.createElement('div'); grp.className = 'pc-grp'; grp.dataset.name = g.name;
      // the first group's name lives in the lead cell from the start
      // (see updateActiveGroupLabel) instead of repeating as its own
      // row right below it — later groups still get a heading, since
      // you're meant to see one coming as you scroll toward it.
      if (i > 0) {
        var gh = document.createElement('div'); gh.className = 'pc-grp-name';
        gh.textContent = g.name;
        grp.appendChild(gh);
      }
      g.items.forEach(function (it) { grp.appendChild(itemRow(it, hideManage)); });
      groupsEl.appendChild(grp);
    });
    updateActiveGroupLabel();
  }

  /* lead cell always shows the current group's name — the first
     group's from the moment a module is picked, then whichever later
     group has scrolled up underneath the sticky Manage/Grow/Transform
     row once it's actually pinned to the top. Group headings past the
     first are plain, ordinary rows in the flow — you see one coming
     as you scroll toward it — and take over the lead cell instead of
     stacking a second row below it. */
  function updateActiveGroupLabel() {
    var groups = groupsEl.querySelectorAll('.pc-grp');
    var current = groups[0] ? groups[0].dataset.name : '';
    var thRect = thRow.getBoundingClientRect();
    if (thRect.top <= 0.5) {
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].getBoundingClientRect().top <= thRect.bottom) {
          current = groups[i].dataset.name;
        } else {
          break;
        }
      }
    }
    if (leadEl.textContent !== current) leadEl.textContent = current;
  }
  var spyTicking = false;
  function scheduleSpy() {
    if (spyTicking) return;
    spyTicking = true;
    window.requestAnimationFrame(function () { updateActiveGroupLabel(); spyTicking = false; });
  }
  window.addEventListener('scroll', scheduleSpy, { passive: true });
  window.addEventListener('resize', scheduleSpy);

  function selectModule(name) {
    Object.keys(navByName).forEach(function (n) { navByName[n].classList.toggle('pc-on', n === name); });
    searchFeed.hidden = true;
    ladder.hidden = false;
    pcCmp.hidden = false;
    renderPanel(name);
    updateLadderForModule(name);
    scheduleSpy();
  }

  /* while the all-modules search feed is showing, a module nav click
     acts like a table-of-contents link into it (scrolls to that
     module's block, keeping every other matching module visible)
     instead of replacing the feed with that module's full table —
     unless that module has no matches in the current feed, in which
     case there's nothing to jump to and it falls back to the normal
     single-module view. */
  function jumpToModuleInFeed(name) {
    var block = searchFeed.querySelector('.pc-cmp[data-module="' + name + '"]');
    if (!block) { selectModule(name); scrollToLadderSection(); return; }
    Object.keys(navByName).forEach(function (n) { navByName[n].classList.toggle('pc-on', n === name); });
    block.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  selectModule(ORDER[0]);

  /* capability search — a term may live in any module and people often
     don't know which one, so searching renders every matching module
     at once (filtered down to just the matching groups/items, not the
     full table) instead of guessing a single "best" module. Standout
     features are excluded from this merged feed — their card layout
     doesn't fit the module table shape — but a feature match still
     surfaces as a jump-to pill in the status line. Matching runs over
     plain-text label+info (module items) and title+desc (feature
     cards). */
  function toPlainText(s) { return String(s || '').replace(/^TTS:/i, '').replace(/\[(.+?)\]\((.+?)\)/g, '$1').replace(/<[^>]+>/g, ' ').toLowerCase(); }
  function itemMatches(it, q) { return (toPlainText(it.label) + ' ' + toPlainText(it.info)).indexOf(q) !== -1; }
  var FEATURE_SEARCH_TEXT = {};
  Object.keys(STANDOUT).forEach(function (key) {
    var f = STANDOUT[key];
    var text = f.name;
    (f.cards || []).forEach(function (c) { text += ' ' + c.title + ' ' + (c.desc || (c.items || []).join(' ')); });
    (f.pricingCards || []).forEach(function (p) {
      text += ' ' + p.badge + ' ' + (p.tagline || '') + ' ' + (p.footnote || '') + ' ' + toPlainText(p.tokenNote);
      text += ' ' + (p.included || []).join(' ');
      (p.groups || []).forEach(function (g) { text += ' ' + g.name + ' ' + g.items.join(' '); });
    });
    FEATURE_SEARCH_TEXT[key] = text.toLowerCase();
  });

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function clearSearchHighlights() {
    document.querySelectorAll('.pc-search-hit').forEach(function (el) { el.classList.remove('pc-search-hit'); });
  }
  function highlightFeatureMatch(key, q) {
    clearSearchHighlights();
    var first = null;
    featureGrid.querySelectorAll('.pc-feature-card').forEach(function (card) {
      if (card.textContent.toLowerCase().indexOf(q) !== -1) {
        card.classList.add('pc-search-hit');
        if (!first) first = card;
      }
    });
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* builds one module's block for the merged feed: same panel-head +
     Manage/Grow/Transform header + group/item markup as the single-
     module view (renderPanel), just restricted to the groups/items
     that matched and rendered fresh each time rather than reusing the
     shared #pcCmp singleton, since several of these sit on the page
     at once. */
  function buildModuleBlock(m, groups) {
    var hideManage = NO_MANAGE.indexOf(m.name) !== -1;
    var block = document.createElement('div');
    block.className = 'pc-cmp' + (hideManage ? ' pc-no-manage' : '');
    block.dataset.module = m.name;

    var head = document.createElement('div');
    head.className = 'pc-panel-head';
    head.innerHTML = '<span class="pc-mod-textwrap"><span class="pc-mod-nameline">' + moduleIcon(m.name, 'pc-mod-ic') + '<span class="pc-mod-name">' + m.name + '</span></span>' + (m.blurb ? '<span class="pc-mod-desc">' + m.blurb + '</span>' : '') + '</span>';
    block.appendChild(head);

    var thRowEl = document.createElement('div');
    thRowEl.className = 'pc-th-row';
    thRowEl.innerHTML = '<div class="pc-lead">' + escapeHtml(groups[0].name) + '</div>' +
      (hideManage ? '' : '<div class="pc-th" data-tier="manage"><div class="pc-n">Manage</div><div class="pc-t">' + CARDS.manage.tag + '</div></div>') +
      '<div class="pc-th" data-tier="grow"><div class="pc-n">Grow</div><div class="pc-t">' + CARDS.grow.tag + '</div></div>' +
      '<div class="pc-th" data-tier="transform"><div class="pc-n">Transform</div><div class="pc-t">' + CARDS.transform.tag + '</div></div>';
    block.appendChild(thRowEl);

    var groupsWrap = document.createElement('div');
    groupsWrap.className = 'pc-groups';
    groups.forEach(function (g, i) {
      var grp = document.createElement('div');
      grp.className = 'pc-grp';
      if (i > 0) {
        var gh = document.createElement('div');
        gh.className = 'pc-grp-name';
        gh.textContent = g.name;
        grp.appendChild(gh);
      }
      g.items.forEach(function (it) { grp.appendChild(itemRow(it, hideManage)); });
      groupsWrap.appendChild(grp);
    });
    block.appendChild(groupsWrap);
    return block;
  }

  var searchForm = document.getElementById('pcSearchForm');
  var searchInput = document.getElementById('pcSearchInput');
  var searchStatus = document.getElementById('pcSearchStatus');
  var searchClear = document.getElementById('pcSearchClear');

  function renderAllModulesStatus(query, totalCount, moduleCount, featureKeys) {
    if (!totalCount && !featureKeys.length) {
      searchStatus.hidden = false;
      searchStatus.innerHTML = '<span class="pc-search-empty">' + (LANG === 'id' ? ('Tidak ada fitur yang ditemukan untuk “' + escapeHtml(query) + '”.') : ('No capabilities found for “' + escapeHtml(query) + '”.')) + '</span>';
      return;
    }
    searchStatus.hidden = false;
    var html = totalCount
      ? '<span class="pc-search-found">' + (LANG === 'id'
          ? (totalCount + ' hasil untuk “' + escapeHtml(query) + '” di ' + moduleCount + ' modul')
          : (totalCount + ' result' + (totalCount === 1 ? '' : 's') + ' for “' + escapeHtml(query) + '” across ' + moduleCount + ' module' + (moduleCount === 1 ? '' : 's'))) + '</span>'
      : '<span class="pc-search-found">' + (LANG === 'id' ? ('Tidak ada hasil modul untuk “' + escapeHtml(query) + '”') : ('No module results for “' + escapeHtml(query) + '”')) + '</span>';
    if (featureKeys.length) {
      html += '<span class="pc-search-also">' + (LANG === 'id' ? 'Juga di:' : 'Also in:') + '</span>' + featureKeys.map(function (k) {
        return '<button type="button" class="pc-search-pill" data-feature="' + k + '">' + escapeHtml(STANDOUT[k].name) + '</button>';
      }).join('');
    }
    searchStatus.innerHTML = html;
    searchStatus.querySelectorAll('.pc-search-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.feature;
        selectFeature(key);
        scrollToStandoutSection();
        highlightFeatureMatch(key, query.toLowerCase());
      });
    });
  }

  /* the search form's submit handler lands here — search always
     covers every module at once (there's no "All Modules" nav button
     any more), so a query renders every matching module's filtered
     block into the feed in place of the single-module ladder/table
     view. The form only calls this with a non-empty query. */
  function showAllModulesView(rawQuery) {
    Object.keys(navByName).forEach(function (n) { navByName[n].classList.remove('pc-on'); });
    ladder.hidden = true;
    pcCmp.hidden = true;
    searchFeed.hidden = false;

    var query = (rawQuery || '').trim();
    if (!query) {
      searchFeed.innerHTML = '<div class="pc-search-feed-empty">' + (LANG === 'id' ? 'Cari fitur di atas untuk melihat hasil yang sesuai di seluruh modul.' : 'Search for a capability above to see matching results across every module.') + '</div>';
      searchStatus.hidden = true;
      searchStatus.innerHTML = '';
      return;
    }

    var q = query.toLowerCase();
    var moduleResults = [];
    var totalCount = 0;
    DATA.modules.forEach(function (m) {
      var groups = [];
      m.groups.forEach(function (g) {
        var items = g.items.filter(function (it) { return itemMatches(it, q); });
        if (items.length) { groups.push({ name: g.name, items: items }); totalCount += items.length; }
      });
      if (groups.length) moduleResults.push({ module: m, groups: groups });
    });

    searchFeed.innerHTML = '';
    if (moduleResults.length) {
      moduleResults.forEach(function (r) { searchFeed.appendChild(buildModuleBlock(r.module, r.groups)); });
    } else {
      searchFeed.innerHTML = '<div class="pc-search-feed-empty">' + (LANG === 'id' ? ('Tidak ada fitur yang ditemukan untuk “' + escapeHtml(query) + '” di modul manapun.') : ('No capabilities found for “' + escapeHtml(query) + '” in any module.')) + '</div>';
    }

    var featureKeys = Object.keys(STANDOUT).filter(function (k) { return FEATURE_SEARCH_TEXT[k].indexOf(q) !== -1; });
    renderAllModulesStatus(query, totalCount, moduleResults.length, featureKeys);
  }

  function runSearch(raw) {
    var query = (raw || '').trim();
    clearSearchHighlights();
    if (!query) { searchStatus.hidden = true; searchStatus.innerHTML = ''; return; }
    showAllModulesView(query);
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch(searchInput.value);
    });
  }

  /* the "x" — cancels the current search result and returns to the
     default (first-module) view, same as a fresh page load. Also
     toggles itself on/off as the box empties/fills so it only shows
     up once there's something to clear. */
  if (searchInput && searchClear) {
    searchInput.addEventListener('input', function () {
      searchClear.hidden = !searchInput.value;
    });
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      searchClear.hidden = true;
      searchStatus.hidden = true;
      searchStatus.innerHTML = '';
      clearSearchHighlights();
      selectModule(ORDER[0]);
      /* the search feed can be much taller than the default single-
         module view, so collapsing it without scrolling back up can
         leave the page sitting well past the now-shorter content —
         jump back to the search bar so the reset is visible. */
      scrollToLadderSection();
      searchInput.focus();
    });
  }

  /* info popovers (fixed-positioned so overflow can't clip them) */
  var openPop = null, popHandler = null;
  function placePop(pop, btn) {
    var w = Math.min(340, window.innerWidth - 24);
    pop.style.position = 'fixed';
    pop.style.width = w + 'px';
    pop.style.maxHeight = (window.innerHeight - 24) + 'px';
    pop.style.overflowY = 'auto';
    var r = btn.getBoundingClientRect();
    var ph = pop.offsetHeight;
    var left = r.left; if (left + w > window.innerWidth - 12) left = window.innerWidth - 12 - w; if (left < 12) left = 12;
    var top = r.bottom + 8;
    if (top + ph > window.innerHeight - 12) {
      var above = r.top - ph - 8;
      top = above > 12 ? above : Math.max(12, window.innerHeight - 12 - ph);
    }
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
    var rr = pop.getBoundingClientRect();
    if (rr.bottom > window.innerHeight - 8) pop.style.top = Math.max(8, top - (rr.bottom - (window.innerHeight - 8))) + 'px';
    if (rr.right > window.innerWidth - 8) pop.style.left = Math.max(8, left - (rr.right - (window.innerWidth - 8))) + 'px';
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.pc-info-btn');
    if (btn) {
      var pop = document.getElementById(btn.getAttribute('aria-controls'));
      var isOpen = pop.classList.contains('pc-open');
      closePop();
      if (!isOpen) {
        pop.classList.add('pc-open'); btn.setAttribute('aria-expanded', 'true'); openPop = { pop: pop, btn: btn };
        placePop(pop, btn);
        popHandler = function () { closePop(); };
        window.addEventListener('scroll', popHandler, true);
        window.addEventListener('resize', popHandler);
      }
      return;
    }
    if (openPop && !e.target.closest('.pc-pop')) closePop();
  });
  function closePop() {
    if (!openPop) return;
    var pop = openPop.pop, btn = openPop.btn;
    pop.classList.remove('pc-open');
    pop.style.cssText = '';
    btn.setAttribute('aria-expanded', 'false');
    openPop = null;
    if (popHandler) { window.removeEventListener('scroll', popHandler, true); window.removeEventListener('resize', popHandler); popHandler = null; }
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });

  /* "Contact Us" modal — same .hs-modal-overlay/.hs-modal shell used
     sitewide for HubSpot-embedded lead forms (see phrhome.js), just
     wired to this page's own form instance. The embed script and the
     form itself are both built lazily on first open, not on page
     load, since most visitors never click Contact Us. */
  var hsModal = document.getElementById('pcContactModal');
  if (hsModal) {
    var hsClose = document.getElementById('pcContactModalClose');
    var hsFormBuilt = false;

    function ensureHsScript(cb) {
      if (window.hbspt) { cb(); return; }
      var existing = document.querySelector('script[src*="hsforms.net/forms/embed/v2.js"]');
      if (existing) { existing.addEventListener('load', cb); return; }
      var s = document.createElement('script');
      s.src = '//js-na2.hsforms.net/forms/embed/v2.js';
      s.charset = 'utf-8';
      s.onload = cb;
      document.body.appendChild(s);
    }
    function buildHsForm() {
      if (hsFormBuilt) return;
      hsFormBuilt = true;
      ensureHsScript(function () {
        hbspt.forms.create({
          portalId: '45700506',
          formId: 'b81c63d0-40ff-4a93-a69d-d3d904c6dc65',
          region: 'na2',
          target: '#pcContactFormContainer'
        });
      });
    }
    function openHsModal(e) {
      if (e) e.preventDefault();
      hsModal.classList.add('active');
      hsModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      buildHsForm();
    }
    function closeHsModal() {
      hsModal.classList.remove('active');
      hsModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    document.querySelectorAll('[data-open-hs]').forEach(function (el) {
      el.addEventListener('click', openHsModal);
    });
    if (hsClose) hsClose.addEventListener('click', closeHsModal);
    hsModal.addEventListener('click', function (e) { if (e.target === hsModal) closeHsModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hsModal.classList.contains('active')) closeHsModal(); });
  }

  /* capability-details gate modal — every .pc-cell-link in the
     comparison table points at /capability-details/#..., opened in a
     new tab. Rather than navigating straight there, intercept the
     click, collect a lead through this form, then open the original
     target once the form is submitted. Links that are still bare "#"
     placeholders (e.g. on the Bahasa page, not yet wired to real
     capability-details anchors) are left alone — there's nothing to
     gate on the way to nowhere. */
  var capGateModal = document.getElementById('pcCapGateModal');
  if (capGateModal) {
    var capGateClose = document.getElementById('pcCapGateModalClose');
    var capGateFormBuilt = false;
    var capGateTargetUrl = null;

    function buildCapGateForm() {
      if (capGateFormBuilt) return;
      capGateFormBuilt = true;
      ensureHsScript(function () {
        hbspt.forms.create({
          portalId: '45700506',
          formId: '93181f13-b063-4e09-a572-345dbda4b062',
          region: 'na2',
          target: '#pcCapGateFormContainer',
          onFormSubmitted: function () {
            closeCapGateModal();
            if (capGateTargetUrl) window.open(capGateTargetUrl, '_blank', 'noopener');
          }
        });
      });
    }
    function openCapGateModal(url) {
      capGateTargetUrl = url;
      capGateModal.classList.add('active');
      capGateModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      buildCapGateForm();
    }
    function closeCapGateModal() {
      capGateModal.classList.remove('active');
      capGateModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('.pc-cell-link');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href === '#') { e.preventDefault(); return; }
      e.preventDefault();
      openCapGateModal(href);
    });
    if (capGateClose) capGateClose.addEventListener('click', closeCapGateModal);
    capGateModal.addEventListener('click', function (e) { if (e.target === capGateModal) closeCapGateModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && capGateModal.classList.contains('active')) closeCapGateModal(); });
  } else {
    /* no gate modal on this page (e.g. Bahasa) — keep the old
       behaviour of just swallowing clicks on bare "#" placeholders. */
    document.addEventListener('click', function (e) { var a = e.target.closest('.pc-cell-link'); if (a && a.getAttribute('href') === '#') e.preventDefault(); });
  }
}());
