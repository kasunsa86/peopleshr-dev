# Philippines salary calculator: changelog (audit fixes, 15 October 2026)

Only the calculator's own JS and HTML changed. CSS, layout, branding and other pages are untouched.

- The exact pre-fix files are in `results/baseline/src/`; the post-fix files are in `results/after-fix/src/`.
- Full diff: `diff -u results/baseline/src/salary-calculator-philippines.js ../../js/salary-calculator-philippines.js`

## js/salary-calculator-philippines.js

| Change | Defect | Affected calculation | Regression tests |
|---|---|---|---|
| Header comment cites sources and the base rules (PhilHealth basic only; SSS/Pag-IBIG include allowances) | — | — | — |
| `MAX_INPUT` (₱1B) and `val()` accept only finite numbers, clamped to 0–₱1B | PH-009 | All inputs | invalid-inputs |
| New `r2()` half-up centavo rounding, applied to tax bands and total, PhilHealth, Pag-IBIG (EE/ER), gross, deductions, contributions, taxable, net, employer contributions and employer cost | PH-002 | Every displayed amount | fixtures-gross, bir-derived, decimal precision, property-random |
| `compute()`: new `phBase = basic` (when covered) passed to `philhealth()`; `base` (basic + ticked allowances) still used for SSS and Pag-IBIG | PH-001 | PhilHealth EE/ER, contributions, taxable, tax, net, employer cost | philhealth, allowances, allowance-editing, mwe, property-random |
| `solveBasic()` replaced by `stepCents()` + segment-aware centavo solver (policy R-INV) | PH-003 | Net to gross | inverse-roundtrip, inverse-nonunique, inverse-edge, property-roundtrip |
| `render()`: toggles the new `#negNote` when net < 0 | PH-006 | — | over-deduction |
| Breakdown: "Contribution base" split into "SSS / Pag-IBIG base" and "PhilHealth base"; PhilHealth and Pag-IBIG descriptions name their base; footnote mentions centavo rounding | PH-001, PH-004 | Display only | all oracle comparisons (labels read by the harness are unchanged) |
| Allowance row tick relabelled "Contrib." → "SSS/Pag-IBIG", with a tooltip. `data-k="contrib"` is unchanged | PH-004 | — | allowances, allowance-disclosures, mobile layout |

## salary-calculator-philippines.html

| Change | Defect |
|---|---|
| Allowance hint rewritten into two short paragraphs: SSS/Pag-IBIG tick meaning, PhilHealth basic-only, "Ticks must follow the official rules", de minimis (RR 29-2025) and ₱90,000 not applied | PH-004, PH-008 |
| `#mweNote` states the region and wage-order assumption and that it isn't checked | PH-005 |
| New `#negNote` warning (existing `hint hint--warn` style) | PH-006 |
| Overview footnote: "Annual figures are 12 × the monthly amounts and exclude 13th-month pay and bonuses." | PH-007 |
| FAQ (PhilHealth/Pag-IBIG): allowances excluded from PhilHealth, linked to Advisory 2025-0002; Pag-IBIG fund salary = basic + allowances | PH-001 |
| FAQ (Net to Gross): states that the lower of two equal-net salaries is shown | PH-003 |
| Rates & Rules: SSS base includes allowances (source → Circular 2024-006 page); PhilHealth basic-only line (source → Advisory 2025-0002); Pag-IBIG fund salary and voluntary-savings lines; BIR de minimis / ₱90,000 line | PH-001, PH-004, PH-008 |

## New, not deployed

`tools/ph-salary-calculator-audit/` holds the oracle, tests, results and these documents. `deploy.sh` excludes `/tools`, so none of it ships.

## Regression status

Full suite after the last change: 11/11 oracle tests, 49/49 Playwright tests (Chromium, Firefox, WebKit, mobile WebKit) and 1,710/1,710 recorded cases.

## Follow-up: UI consistency across calculators (16 October 2026)

Layout and copy only; no calculation changes.

- The two switches in panel 2 are stacked instead of side by side, so the contributions label no longer wraps.
- The allowance hint is shortened to one paragraph. It keeps the three required disclosures: ticks follow official rules; PhilHealth uses basic only; de minimis ceilings and the ₱90,000 limit are not applied.
- The site announcement bar is added, and the footer calculator list is unified across all calculator pages.

Regression: 11/11 oracle tests and 49/49 Playwright tests (`results/ui-consistency/`).
