<?php
/**
 * Sitewide schema.org JSON-LD, included once per page's <head>:
 *
 *  1. Organization (Corporation) -- ported from the Rank Math "Local SEO"
 *     settings export (knowledge graph / company info).
 *  2. WebSite -- tells Google the site's name ("PeoplesHR") for results.
 *  3. BreadcrumbList -- built per page (Home > Section > Page) so Google
 *     understands the site hierarchy (helps sitelinks). Generated here from
 *     the including page's own <link rel="canonical">, so breadcrumb URLs
 *     always match the canonical URLs. Skipped on the home page and on
 *     noindex pages.
 *
 * All URLs are absolute production URLs.
 */

$phrSiteUrl = 'https://peopleshr.com';

/* Section parents: [canonical path, breadcrumb name] */
$phrSections = [
  'products'  => ['/products/',             'Products'],
  'solutions' => ['/solutions/',            'Solutions'],
  'customers' => ['/customers/',            'Customers'],
  'regions'   => ['/regions/',              'Regions'],
  'webinars'  => ['/webinars/',             'Webinars'],
  'ebooks'    => ['/hr-ebooks-and-guides/', 'HR eBooks & Guides'],
];

/* Page file (relative to the site root) => [short breadcrumb name, section key or null].
   Pages not listed here fall back to their <title> (minus " • PeoplesHR") under Home. */
$phrCrumbs = [
  'ai-x.html'                    => ['Lexi AI', null],
  'blog.html'                    => ['Blog', null],
  'careers.html'                 => ['Careers', null],
  'community.html'               => ['Community', null],
  'company.html'                 => ['Company', null],
  'cookie-policy.html'           => ['Cookie Policy', null],
  'customers.html'               => ['Customers', null],
  'events.html'                  => ['Events', null],
  'functional-proposal.html'     => ['Functional Proposal', null],
  'get-in-touch.html'            => ['Contact Us', null],
  'hr-ebooks-and-guides.html'    => ['HR eBooks & Guides', null],
  'interactive-demos.html'       => ['Interactive Demos', null],
  'legal.html'                   => ['Legal', null],
  'news.html'                    => ['News', null],
  'partner-with-peopleshr.html'  => ['Partner with PeoplesHR', null],
  'privacy-policy.html'          => ['Privacy Policy', null],
  'products.html'                => ['Products', null],
  'regions.html'                 => ['Regions', null],
  'roi-calculator.html'          => ['ROI Calculator', null],
  'solutions.html'               => ['Solutions', null],
  'success-stories.html'         => ['Success Stories', null],
  'tax-calculator-philippines.html' => ['Philippines Payroll & Tax Calculator', null],
  'terms-of-use.html'            => ['Terms of Use', null],
  'trust-portal.html'            => ['Trust Portal', null],
  'view-plans.html'              => ['Plans & Pricing', null],
  'webinars.html'                => ['Webinars', null],
  'what-is-next-with-peopleshr.html' => ["What's Next with PeoplesHR", null],

  // Products
  'products/index.html'               => ['Products', null],
  'products/core-hr.html'             => ['Core HR', 'products'],
  'products/mobile-app.html'          => ['Mobile App', 'products'],
  'products/payroll-system.html'      => ['Payroll System', 'products'],
  'products/people-analytics.html'    => ['People Analytics', 'products'],
  'products/people-engagement.html'   => ['People Engagement', 'products'],
  'products/talent-acquisition.html'  => ['Talent Acquisition', 'products'],
  'products/time-and-attendance.html' => ['Time & Attendance', 'products'],

  // Solutions
  'solutions/index.html'  => ['Solutions', null],
  'solutions/banking-finance-insurance-industries.html' => ['Banking, Finance & Insurance', 'solutions'],
  'solutions/cfo.html'    => ['For CFOs', 'solutions'],
  'solutions/chro.html'   => ['For CHROs', 'solutions'],
  'solutions/cio.html'    => ['For IT Leaders', 'solutions'],
  'solutions/hr-software-for-hospitality-industry.html' => ['Hospitality', 'solutions'],
  'solutions/hr-software-for-it-and-ites-industry.html' => ['IT & ITES', 'solutions'],
  'solutions/hr-software-for-manufacturing-industry.html' => ['Manufacturing', 'solutions'],
  'solutions/hr-software-for-professional-and-business-services-industry.html' => ['Professional & Business Services', 'solutions'],
  'solutions/hr-software-for-retail-industry.html' => ['Retail', 'solutions'],
  'solutions/hr-software-for-transportation-and-logistics-industry.html' => ['Transportation & Logistics', 'solutions'],
  'solutions/outsourcing.html'        => ['Payroll Outsourcing', 'solutions'],
  'solutions/peopleshr-academy.html'  => ['PeoplesHR Academy', 'solutions'],
  'solutions/peopleshr-tracking.html' => ['PeoplesHR Tracking', 'solutions'],
  'solutions/public-sector.html'      => ['Public Sector', 'solutions'],

  // Customer stories
  'case-study-anonymized-manufacturer.html'     => ['Precision Manufacturer', 'customers'],
  'case-study-government-of-uganda.html'        => ['Government of Uganda', 'customers'],
  'case-study-hayleys-bsi.html'                 => ['Hayleys BSI', 'customers'],
  'case-study-peoples-bank.html'                => ['Peoples Bank', 'customers'],
  'case-study-pyramid-wilmar.html'              => ['Pyramid Wilmar', 'customers'],
  'case-study-sms-global-technologies-inc.html' => ['SMS Global Technologies', 'customers'],
  'case-study-tellida.html'                     => ['Tellida', 'customers'],
  'case-study-zillione.html'                    => ['Zillione', 'customers'],
  'hris-success-stories-brandix-case-study.html' => ['Brandix', 'customers'],

  // Regions
  'region-bangladesh.html' => ['Bangladesh', 'regions'],
  'region-kenya.html'      => ['Kenya', 'regions'],
  'region-singapore.html'  => ['Singapore', 'regions'],
  'region-sri-lanka.html'  => ['Sri Lanka', 'regions'],
  'philippines.html'       => ['Philippines', 'regions'],
  'philippinesv2.html'     => ['Philippines', 'regions'],
  'indonesia.html'         => ['Indonesia', 'regions'],
  'middle-east.html'       => ['Middle East', 'regions'],

  // Webinars
  'webinar-indonesia-ai-in-hr.html'          => ['AI dalam HR (Indonesia)', 'webinars'],
  'webinar-indonesia.html'                   => ['Tiga Pilar Sumber Daya untuk ROI HR', 'webinars'],
  'webinar-peopleshr-walkthrough-v10-3.html' => ['PeoplesHR v10.3 Walkthrough', 'webinars'],
  'webinar-philippines.html'                 => ['AI Reskilling Strategy (Philippines)', 'webinars'],
  'webinar-year-end-payroll-ph.html'         => ['Year-End Payroll Compliance (Philippines)', 'webinars'],

  // eBooks & guides
  'ebook-transform-your-hr-operations-in-manufacturing.html' => ['Manufacturing HR Operations eBook', 'ebooks'],
  'hrsoftwareguide-en.html'                => ['Choosing HR Software Guide', 'ebooks'],
  'top-8-trends-to-transform-your-workforce-in-2025.html' => ['Top 8 HR & Workforce Trends', 'ebooks'],
  'hr-tech-survey-indonesia-2025.html'     => ['Indonesia HR Tech Priorities Survey', 'ebooks'],
];

/* Work out which page included this file, and read its canonical URL,
   title and robots meta from its own source. */
$phrBreadcrumb = null;
$phrTrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 1);
$phrPageFile = isset($phrTrace[0]['file']) ? realpath($phrTrace[0]['file']) : false;
$phrRoot = realpath(dirname(__DIR__));
if ($phrPageFile && $phrRoot && strpos($phrPageFile, $phrRoot . DIRECTORY_SEPARATOR) === 0) {
  $phrRel = str_replace(DIRECTORY_SEPARATOR, '/', substr($phrPageFile, strlen($phrRoot) + 1));
  $phrSrc = @file_get_contents($phrPageFile, false, null, 0, 20000); // <head> is near the top
  $phrCanonical = ($phrSrc && preg_match('/<link rel="canonical" href="([^"]+)"/', $phrSrc, $phrM)) ? $phrM[1] : null;
  $phrNoindex = $phrSrc && preg_match('/<meta name="robots" content="[^"]*noindex/i', $phrSrc);

  if ($phrCanonical && !$phrNoindex && rtrim($phrCanonical, '/') !== $phrSiteUrl) {
    if (isset($phrCrumbs[$phrRel])) {
      list($phrName, $phrSection) = $phrCrumbs[$phrRel];
    } else {
      $phrSection = null;
      $phrName = ($phrSrc && preg_match('/<title>([^<]+)<\/title>/', $phrSrc, $phrT))
        ? trim(preg_replace('/\s*(?:•|&bull;)\s*PeoplesHR.*$/u', '', html_entity_decode($phrT[1], ENT_QUOTES, 'UTF-8')))
        : null;
    }
    if ($phrName) {
      $phrItems = [['Home', $phrSiteUrl . '/']];
      if ($phrSection && isset($phrSections[$phrSection])) {
        $phrItems[] = [$phrSections[$phrSection][1], $phrSiteUrl . $phrSections[$phrSection][0]];
      }
      $phrItems[] = [$phrName, $phrCanonical];
      $phrList = [];
      foreach ($phrItems as $i => $it) {
        $phrList[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $it[0], 'item' => $it[1]];
      }
      $phrBreadcrumb = ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $phrList];
    }
  }
}
?>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Corporation",
  "@id": "https://peopleshr.com/#organization",
  "name": "PeoplesHR - All In One HRIS",
  "alternateName": "PeoplesHR",
  "url": "https://peopleshr.com",
  "logo": "https://peopleshr.com/uploads/2024/03/PeoplesHR-Logo-1080X1080.webp",
  "telephone": "+65 8652 8348",
  "sameAs": [
    "https://www.linkedin.com/company/peopleshr/?originalSubdomain=sg",
    "https://www.facebook.com/PeoplesHR/",
    "https://www.instagram.com/peopleshr/?hl=en",
    "https://www.youtube.com/@PeoplesHR"
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://peopleshr.com/#website",
  "url": "https://peopleshr.com/",
  "name": "PeoplesHR",
  "alternateName": "PeoplesHR - All In One HRIS",
  "publisher": { "@id": "https://peopleshr.com/#organization" }
}
</script>
<?php if ($phrBreadcrumb): ?>
<script type="application/ld+json">
<?php echo json_encode($phrBreadcrumb, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT); ?>

</script>
<?php endif; ?>
