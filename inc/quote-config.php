<?php
/**
 * Live quote settings, read by quote-submit.php. Secrets (the HubSpot
 * token) live in inc/quote-secrets.php, which git ignores.
 *
 * Each request must reach the sales team through at least one of: the
 * SDR email (sdr_email) or HubSpot (hubspot_token in quote-secrets.php).
 * Submissions fail with an error until one is set up.
 */
return [
    // Server email to the SDR, with the quote PDF attached. Comma-separate
    // several addresses. Leave empty when HubSpot notifies the SDR instead.
    'sdr_email' => 'shawn.m@peopleshr.com',

    // Who sends the customer's copy (their package and answers):
    //   'server'  - this server emails it (from_email below);
    //   'hubspot' - a HubSpot workflow or form follow-up email sends it,
    //               using the "Live quote" contact properties.
    'customer_email_via' => 'server',

    // Sender of the server emails. Use an address on a domain whose SPF/DKIM
    // records allow this server to send, or the email may land in spam.
    'from_email' => 'no-reply@peopleshr.com',
    'from_name' => 'PeoplesHR Website',

    // Optional: GUID of a HubSpot form (portal 45700506). Submitting it adds
    // page and cookie attribution and can trigger form-based workflows. The
    // form needs the fields email, firstname, lastname, company and phone.
    'hubspot_portal_id' => '45700506',
    'hubspot_form_guid' => '',

    // HubSpot API host. Only changed for local testing against a mock.
    'hubspot_api_base' => 'https://api.hubapi.com',

    // Sales Portal Website Pricing API (inc/quote-pricing-api.php). The base
    // URL includes the /api root, e.g. 'https://<host>/api'; the server
    // environment variable WEBSITE_PRICING_API_BASE_URL overrides it. The
    // credential goes in inc/quote-secrets.php (or WEBSITE_PRICING_API_KEY).
    'pricing_api_base_url' => '',

    // true: price with the built-in mock (SAMPLE rates, quotes marked
    // SAMPLE) instead of calling the API. Set to false once the live base
    // URL and credential are in.
    'pricing_api_mock' => true,

    // Seconds to wait for each pricing call. A submission makes up to three.
    'pricing_api_timeout' => 8,

    // Submissions allowed per visitor IP per hour.
    'rate_limit_per_hour' => 5,
];
