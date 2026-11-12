<?php
/**
 * Live quote secrets. Copy this file to inc/quote-secrets.php (which git
 * ignores) and fill it in. On the server, create that file by hand: it is
 * never committed or deployed.
 */
return [
    // HubSpot private app access token (Settings > Integrations > Private
    // apps). Scopes: crm.objects.contacts.read, crm.objects.contacts.write,
    // files, crm.schemas.contacts.write. Leave empty to skip HubSpot.
    'hubspot_token' => '',

    // Website Pricing API credential (dai_<key-id>.<secret>), issued by the
    // Integration Services administrator for this environment. The server
    // environment variable WEBSITE_PRICING_API_KEY overrides it.
    'pricing_api_key' => '',
];
