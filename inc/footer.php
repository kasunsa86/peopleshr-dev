<?php
/**
 * Site footer, shared by every page. Edit links here, not in the pages.
 * Pages include it between their <!-- footer start --> / <!-- footer end -->
 * markers (tools/blog-migration/build.py copies that span from blog/index.html).
 */
?>
<div class="ft-root">
  <footer class="ft-wrap">

    <div class="ft-top">

      <!-- ===================== BRAND ===================== -->
      <div class="ft-brand">
        <div class="ft-brand-inner">
          <div>
            <a class="ft-logo" href="/" aria-label="PeoplesHR home">
              <img src="/uploads/2021/07/logo.webp" alt="PeoplesHR" loading="lazy">
            </a>
            <p class="ft-blurb">PeoplesHR is one of the most trusted names in the HR Tech industry in Asia Pacific and African regions, capturing all HR needs with HCM solutions along with an HR ecosystem.</p>

            <?php include __DIR__ . '/office-block.php'; ?>

            <div class="ft-social">
              <a href="https://www.linkedin.com/company/peopleshr/?originalSubdomain=sg" aria-label="LinkedIn" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.32-2.02-3.32-2.02 0-2.33 1.58-2.33 3.21V21h-4V9Z"/></svg>
              </a>
              <a href="https://www.facebook.com/PeoplesHR/" aria-label="Facebook" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.29-.04-1.27-.12-2.41-.12-2.38 0-4.02 1.45-4.02 4.12v2.3H7.9V13h2.67v8h2.93Z"/></svg>
              </a>
              <a href="https://www.instagram.com/peopleshr/?hl=en" aria-label="Instagram" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="https://www.youtube.com/@PeoplesHR" aria-label="YouTube" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12s0-3.3-.42-4.88a2.55 2.55 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.78.32a2.55 2.55 0 0 0-1.8 1.8C2 8.7 2 12 2 12s0 3.3.42 4.88a2.55 2.55 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.78-.32a2.55 2.55 0 0 0 1.8-1.8C22 15.3 22 12 22 12Zm-12 3.2V8.8l5.2 3.2-5.2 3.2Z"/></svg>
              </a>
            </div>
          </div>

          <div class="ft-certs">
            <div class="ft-cert"><img src="/uploads/2021/07/certificate004.png" alt="Certificate" loading="lazy"></div>
            <div class="ft-cert"><img src="/uploads/2021/07/certificate002.png" alt="Certificate" loading="lazy"></div>
            <div class="ft-cert"><img src="/uploads/2025/12/ISO_9001.webp" alt="ISO 9001" loading="lazy"></div>
            <div class="ft-cert"><img src="/uploads/2025/12/thumbnail_BVCER_withUKAS-ISO-27001.webp" alt="ISO 27001 UKAS" loading="lazy"></div>
            <div class="ft-cert"><img src="/uploads/2026/04/Star-Level-One.webp" alt="CSA STAR Level One" loading="lazy"></div>
            <div class="ft-cert"><img src="/uploads/2026/05/dpo.jpg" alt="HP" loading="lazy"></div>
          </div>
        </div>
      </div>

      <!-- ===================== PRODUCTS ===================== -->
      <div class="ft-col">
        <h2 class="ft-h">Products</h2>
        <ul class="ft-links">
          <li><a href="/products/core-hr/">HR</a></li>
          <li><a href="/products/payroll-system/">Pay</a></li>
          <li><a href="/products/talent-acquisition/">Talent</a></li>
          <li><a href="/products/time-and-attendance/">Time</a></li>
          <li><a href="/products/people-engagement/">Engagement</a></li>
          <li><a href="/products/people-analytics/">Insight</a></li>
          <li><a href="/products/mobile-app/">Mobile App</a></li>
          <li><a href="/ai-x/">Explore PeoplesHR AI</a></li>
        </ul>
        <p class="ft-sub">Specialized Solutions</p>
        <ul class="ft-links">
          <li><a href="/solutions/peopleshr-tracking/">Access &amp; Attendance Devices</a></li>
          <li><a href="/solutions/outsourcing/">Payroll Outsourcing</a></li>
          <li><a href="/solutions/peopleshr-academy/">PeoplesHR Academy</a></li>
        </ul>
      </div>

      <!-- ===================== INDUSTRIES ===================== -->
      <div class="ft-col">
        <h2 class="ft-h">Industries</h2>
        <ul class="ft-links">
          <li><a href="/solutions/banking-finance-insurance-industries/">Banking, Finance &amp; Insurance</a></li>
          <li><a href="/solutions/hr-software-for-hospitality-industry/">Hospitality</a></li>
          <li><a href="/solutions/hr-software-for-manufacturing-industry/">Manufacturing</a></li>
          <li><a href="/solutions/hr-software-for-professional-and-business-services-industry/">Professional &amp; Business Services</a></li>
          <li><a href="/solutions/hr-software-for-retail-industry/">Retail</a></li>
          <li><a href="/solutions/hr-software-for-it-and-ites-industry/">IT &amp; ITES</a></li>
          <li><a href="/solutions/hr-software-for-transportation-and-logistics-industry/">Transportation &amp; Logistics</a></li>
          <li><a href="/solutions/public-sector/">Public Sector</a></li>
        </ul>
      </div>

      <!-- ===================== RESOURCES / COMPANY ===================== -->
      <div class="ft-col">
        <h2 class="ft-h">Resources</h2>
        <ul class="ft-links">
          <li><a href="/customers/">Case Studies</a></li>
          <li><a href="/webinars/">Webinars</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/events/">Events</a></li>
          <li><a href="/hr-ebooks-and-guides/">HR eBooks &amp; Guides</a></li>
          <li><a href="/news/">News</a></li>
        </ul>
        <p class="ft-sub">Company</p>
        <ul class="ft-links">
          <li><a href="/company/">About PeoplesHR</a></li>
          <li><a href="/careers/">Careers</a></li>
          <li><a href="/community/">Community</a></li>
          <li><a href="/partner-with-peopleshr/">Partners</a></li>
          <li><a href="/regions/">Regions</a></li>
          <li><a href="/llms.txt">For AI agents</a></li>
        </ul>
      </div>

      <!-- ===================== TOOLS / EXPLORE ===================== -->
      <div class="ft-col">
        <h2 class="ft-h">Calculators</h2>
        <ul class="ft-links">
          <li><a href="/tax-calculator-philippines/">Philippines Tax Calculator</a></li>
          <li><a href="/salary-calculator-sri-lanka/">Sri Lanka Salary Calculator</a></li>
          <li><a href="/salary-calculator-philippines/">Philippines Salary Calculator</a></li>
          <li><a href="/salary-calculator-indonesia/">Indonesia Salary Calculator</a></li>
          <li><a href="/roi-calculator/">ROI Calculator</a></li>
        </ul>
        <p class="ft-sub">Explore</p>
        <ul class="ft-links">
          <li><a href="/customers/">Customers</a></li>
          <li><a href="/view-plans/">Pricing</a></li>
          <li><a href="/interactive-demos/">Interactive Demos</a></li>
        </ul>
      </div>

    </div>

    <!-- ===================== BOTTOM BAR ===================== -->
    <div class="ft-bottom">
      <ul class="ft-legal">
        <li><a href="/trust-portal/">Trust Portal</a></li>
        <li><a href="/legal/">Legal</a></li>
        <li><a href="/cookie-policy/">Cookie policy</a></li>
        <li><a href="/terms-of-use/">Terms of use</a></li>
        <li><a href="/privacy-policy/">Privacy Policy</a></li>
      </ul>
      <p class="ft-copy">Copyright &copy;2026 PeoplesHR. All Rights Reserved.</p>
    </div>

  </footer>
</div>
