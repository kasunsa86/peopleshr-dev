<?php
/**
 * Live quote: the questionnaire and its tier logic, shared by
 * request-a-quote.html (renders the questions) and quote-submit.php
 * (scores the answers and emails the SDR). The ranks never reach the
 * browser; only the labels are printed on the page.
 *
 * Logic follows the "PeoplesHR Tier Recommendation Questionnaire" sheet
 * (Option B: rule-based, highest signal wins):
 *   - Ranks are 1 = Manage, 2 = Grow, 3 = Transform, 0 = not applicable.
 *   - Final rank per bundle = max(question driver, Q3 reinforce,
 *     industry nudge, tier floor).
 *   - HR, Time and Pay are driven by Q3, Q4 and Q5 and are always
 *     Must-Have (Operational).
 *   - Talent, Engagement, Recruitment and Insights have no question
 *     driver; picking them in Q6 only makes them Must-Have.
 *   - Talent and Recruitment have no Manage tier, so their floor is Grow.
 *   - Q2 (exact employee count) sets the price, never the tiers.
 *   - Q6 picks for HR, Time and Pay are signals for the SDR only.
 *   - Q7 (Professional Services add-ons) never changes tiers or prices; the
 *     picks are listed for the SDR, who scopes and prices them.
 */

const PHR_QUOTE_TIERS = [1 => 'Manage', 2 => 'Grow', 3 => 'Transform'];

// Icon and blurb match the module cards on the pricing page (view-plans.html).
const PHR_QUOTE_BUNDLES = [
    'hr'          => ['name' => 'HR',          'floor' => 1, 'operational' => true,  'icon' => '/uploads/2026/07/HRIcon.webp',         'blurb' => 'Maintain HR records, structure your organisation & run the employee lifecycle.'],
    'time'        => ['name' => 'Time',        'floor' => 1, 'operational' => true,  'icon' => '/uploads/2026/07/TimeIcon.webp',       'blurb' => 'Manage attendance, shifts, overtime & leave.'],
    'pay'         => ['name' => 'Pay',         'floor' => 1, 'operational' => true,  'icon' => '/uploads/2026/07/PayIcon.webp',        'blurb' => 'Run accurate payroll, benefits & statutory compliance.'],
    'talent'      => ['name' => 'Talent',      'floor' => 2, 'operational' => false, 'icon' => '/uploads/2026/07/TalentIcon.webp',     'blurb' => 'Set goals, manage performance, and develop & plan your people.'],
    'engagement'  => ['name' => 'Engagement',  'floor' => 1, 'operational' => false, 'icon' => '/uploads/2026/07/EngagementIcon.webp', 'blurb' => 'Listen to employees, recognise contribution & strengthen engagement.'],
    'recruitment' => ['name' => 'Recruitment', 'floor' => 2, 'operational' => false, 'icon' => '/uploads/2026/07/Recruitment.webp',    'blurb' => 'Hire the right people and onboard new joiners.'],
    'insights'    => ['name' => 'Insights',    'floor' => 1, 'operational' => false, 'icon' => '/uploads/2026/07/InsightsIcon.webp',   'blurb' => 'Turn workforce data into decisions with reports, analytics & Lexi AI.'],
];

// Tier taglines, as on the pricing page.
const PHR_QUOTE_TIER_TAGS = [1 => 'Run the organisation', 2 => 'Invest in your people', 3 => 'Lead with people intelligence'];

// Q6 allows at most this many priorities.
const PHR_QUOTE_MAX_PRIORITIES = 3;

// Q2 accepts a whole number of employees up to this.
const PHR_QUOTE_MAX_HEADCOUNT = 100000;

function phr_quote_questions()
{
    return [
        'industry' => [
            'title' => 'Which industry best describes your company?',
            'type' => 'single',
            // Industry nudge rank per bundle; bundles left out are 0.
            'options' => [
                'bfsi'          => ['label' => 'Banking, Finance & Insurance (BFSI)', 'nudge' => ['hr' => 2, 'pay' => 3]],
                'manufacturing' => ['label' => 'Manufacturing', 'nudge' => ['time' => 2]],
                'retail'        => ['label' => 'Retail', 'nudge' => ['time' => 2]],
                'hospitality'   => ['label' => 'Hospitality & Leisure', 'nudge' => ['time' => 2]],
                'it-bpo'        => ['label' => 'IT & ITES / BPO', 'nudge' => ['talent' => 3, 'insights' => 2]],
                'professional'  => ['label' => 'Professional & Business Services', 'nudge' => ['recruitment' => 2]],
                'logistics'     => ['label' => 'Transportation & Logistics', 'nudge' => ['time' => 3]],
                'healthcare'    => ['label' => 'Healthcare', 'nudge' => ['hr' => 2, 'time' => 2]],
                'government'    => ['label' => 'Government & Public Sector', 'nudge' => ['hr' => 2, 'insights' => 2]],
                'other'         => ['label' => 'Other', 'nudge' => []],
            ],
        ],
        'employees' => [
            'title' => 'How many employees does your company have?',
            'type' => 'number',
            'min' => 1,
            'max' => PHR_QUOTE_MAX_HEADCOUNT,
            'placeholder' => 'e.g. 250',
        ],
        'structure' => [
            'title' => 'How would you describe your organizational structure and HR processes?',
            'type' => 'single',
            // 'rank' drives HR; 'reinforce' also lifts Time and Pay.
            'options' => [
                'single'        => ['label' => 'Single company, straightforward setup: we just need the essentials handled correctly', 'rank' => 1, 'reinforce' => []],
                'branches'      => ['label' => 'A few branches or business units, with some processes needing customization', 'rank' => 2, 'reinforce' => []],
                'group'         => ['label' => 'Multiple companies or entities under one group, with tailored workflows and approvals', 'rank' => 2, 'reinforce' => []],
                'multi-country' => ['label' => 'Multiple companies across different countries, each with its own compliance and structural needs', 'rank' => 3, 'reinforce' => ['time' => 2, 'pay' => 3]],
            ],
        ],
        'workforce' => [
            'title' => "How would you best describe your employees' work patterns?",
            'type' => 'single',
            // 'rank' drives Time.
            'options' => [
                'fixed'  => ['label' => 'Standard fixed hours, same schedule for everyone', 'rank' => 1],
                'shifts' => ['label' => 'Multiple shifts or rotating schedules across teams', 'rank' => 2],
                'field'  => ['label' => 'Field-based, mobile, or multi-site workforce needing location tracking', 'rank' => 2],
                'mixed'  => ['label' => 'A mix of the above across different departments', 'rank' => 3],
            ],
        ],
        'payroll' => [
            'title' => 'Which best describes your payroll requirements?',
            'type' => 'single',
            // 'rank' drives Pay.
            'options' => [
                'single-run'    => ['label' => 'One straightforward monthly pay run for everyone', 'rank' => 1],
                'multiple'      => ['label' => 'Multiple pay runs, pay grades, or custom salary components', 'rank' => 2],
                'multi-country' => ['label' => 'Multi-currency or multi-country payroll', 'rank' => 3],
                'complex'       => ['label' => 'Complex allowances, loans, and benefit structures requiring heavy customization', 'rank' => 2],
            ],
        ],
        'priorities' => [
            'title' => 'Which of these matter most to your organization right now?',
            'hint' => 'Choose up to ' . PHR_QUOTE_MAX_PRIORITIES . '.',
            'type' => 'multi',
            'max' => PHR_QUOTE_MAX_PRIORITIES,
            // 'bundle' is the bundle the pick makes Must-Have; 'signal' picks
            // only flag the bundle for the SDR.
            'options' => [
                'performance' => ['label' => 'Build a strong performance & development culture', 'bundle' => 'talent'],
                'engagement'  => ['label' => 'Improve employee engagement, feedback & retention', 'bundle' => 'engagement'],
                'hiring'      => ['label' => 'Streamline hiring, interviews & onboarding', 'bundle' => 'recruitment'],
                'analytics'   => ['label' => 'Get better workforce reporting, dashboards & analytics', 'bundle' => 'insights'],
                'compliance'  => ['label' => 'Strengthen HR compliance & recordkeeping', 'signal' => 'hr'],
                'attendance'  => ['label' => 'Simplify attendance, shift scheduling & leave', 'signal' => 'time'],
                'payroll'     => ['label' => 'Improve payroll accuracy & efficiency', 'signal' => 'pay'],
            ],
        ],
        'addons' => [
            'title' => 'Which professional services add-ons do you need?',
            'hint' => 'Optional. Choose any that apply.',
            'type' => 'multi',
            // No limit, and none is a valid answer. Names and descriptions
            // match the Enterprise Add-Ons on the pricing page (view-plans.html).
            'options' => [
                'identity'       => ['label' => 'Identity & Access Governance', 'desc' => 'Every employee change flows out to your directory and downstream systems, automatically.'],
                'csm'            => ['label' => 'Dedicated Customer Success Manager', 'desc' => 'A named customer success manager who knows your setup, not a ticket queue.'],
                'api'            => ['label' => 'Custom API Integrations', 'desc' => 'Built-to-your-setup API connections, not just standard connectors.'],
                'onboarding'     => ['label' => 'White-Glove Onboarding & Implementation', 'desc' => 'End-to-end implementation led by dedicated experts.'],
                'training'       => ['label' => 'Dedicated Training', 'desc' => 'Role-based training for administrators and end users.'],
                'uat'            => ['label' => 'Dedicated UAT Environment', 'desc' => 'Validate every change before it reaches production.'],
                'infrastructure' => ['label' => 'Enterprise Infrastructure', 'desc' => 'Deployment options tailored to your security and performance needs.'],
            ],
        ],
    ];
}

/**
 * Checks raw answers against the questionnaire. Returns the cleaned answers
 * (single questions as a string key, number questions as an int, multi
 * questions as a list of keys, at most the question's 'max'), or null if
 * anything is missing or unknown.
 */
function phr_quote_clean_answers($raw)
{
    if (!is_array($raw)) {
        return null;
    }
    $clean = [];
    foreach (phr_quote_questions() as $id => $q) {
        $value = $raw[$id] ?? null;
        if ($q['type'] === 'multi') {
            if ($value === null) {
                $value = [];
            }
            if (!is_array($value) || count($value) > ($q['max'] ?? count($q['options']))) {
                return null;
            }
            foreach ($value as $key) {
                if (!is_string($key) || !isset($q['options'][$key])) {
                    return null;
                }
            }
            $clean[$id] = array_values(array_unique($value));
        } elseif ($q['type'] === 'number') {
            // Digits only; the browser strips commas and spaces first.
            if (is_int($value)) {
                $value = (string) $value;
            }
            if (!is_string($value) || !preg_match('/^[0-9]{1,9}$/', $value)) {
                return null;
            }
            $value = (int) $value;
            if ($value < $q['min'] || $value > $q['max']) {
                return null;
            }
            $clean[$id] = $value;
        } else {
            if (!is_string($value) || !isset($q['options'][$value])) {
                return null;
            }
            $clean[$id] = $value;
        }
    }
    return $clean;
}

/**
 * Scores cleaned answers. Returns one row per bundle:
 *   ['name', 'status', 'driver', 'reinforce', 'nudge', 'floor', 'rank', 'tier', 'signal']
 */
function phr_quote_recommend(array $answers)
{
    $q = phr_quote_questions();
    $industry = $q['industry']['options'][$answers['industry']];
    $structure = $q['structure']['options'][$answers['structure']];

    $drivers = [
        'hr'   => $structure['rank'],
        'time' => $q['workforce']['options'][$answers['workforce']]['rank'],
        'pay'  => $q['payroll']['options'][$answers['payroll']]['rank'],
    ];

    $picked = [];
    $signals = [];
    foreach ($answers['priorities'] as $key) {
        $opt = $q['priorities']['options'][$key];
        if (isset($opt['bundle'])) {
            $picked[$opt['bundle']] = true;
        } else {
            $signals[$opt['signal']] = true;
        }
    }

    $rows = [];
    foreach (PHR_QUOTE_BUNDLES as $id => $bundle) {
        $driver = $drivers[$id] ?? 0;
        $reinforce = $structure['reinforce'][$id] ?? 0;
        $nudge = $industry['nudge'][$id] ?? 0;
        $rank = max($driver, $reinforce, $nudge, $bundle['floor']);

        if ($bundle['operational']) {
            $status = 'Must-Have (Operational)';
        } else {
            $status = isset($picked[$id]) ? 'Must-Have' : 'Nice-to-Have';
        }

        $rows[$id] = [
            'name' => $bundle['name'],
            'status' => $status,
            'driver' => $driver,
            'reinforce' => $reinforce,
            'nudge' => $nudge,
            'floor' => $bundle['floor'],
            'rank' => $rank,
            'tier' => PHR_QUOTE_TIERS[$rank],
            'signal' => isset($signals[$id]),
        ];
    }
    return $rows;
}

/**
 * Applies the visitor's package choices (bundle => tier rank, 0 = not
 * included) to rows from phr_quote_recommend(). Must-Have bundles can
 * change tier but not be dropped; Nice-to-Have bundles start out of the
 * package and can be added. A bundle missing from $choices keeps the
 * recommendation. Adds to each row: 'recommended_rank', 'recommended_tier',
 * 'included', 'changed'; 'rank' and 'tier' become the chosen ones.
 * Returns null if a choice is invalid.
 */
function phr_quote_apply_choices(array $rows, $choices)
{
    if (!is_array($choices)) {
        $choices = [];
    }
    foreach ($rows as $id => $row) {
        $required = $row['status'] !== 'Nice-to-Have';
        $rank = $required ? $row['rank'] : 0;
        if (array_key_exists($id, $choices)) {
            $rank = $choices[$id];
            if (!is_int($rank) || $rank < 0 || $rank > 3) {
                return null;
            }
            if (($rank === 0 && $required) || ($rank > 0 && $rank < $row['floor'])) {
                return null;
            }
        }
        $rows[$id]['recommended_rank'] = $row['rank'];
        $rows[$id]['recommended_tier'] = $row['tier'];
        $rows[$id]['included'] = $rank > 0;
        $rows[$id]['changed'] = $rank > 0 && $rank !== $row['rank'];
        if ($rank > 0) {
            $rows[$id]['rank'] = $rank;
            $rows[$id]['tier'] = PHR_QUOTE_TIERS[$rank];
        }
    }
    return $rows;
}
