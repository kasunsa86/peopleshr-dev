# Philippines salary calculator: defect log

Severity:

- **High:** wrong statutory or payable amount.
- **Medium:** wrong by a centavo, or a misleading treatment or answer.
- **Low:** missing disclosure or guard.

All defects below are **fixed and retested**. Baseline logs are in `results/baseline/`; after-fix logs are in `results/after-fix/`.

## PH-001: PhilHealth premium charged on allowances (High, fixed)

- **Reproduce:** Basic ₱20,000; add an allowance of ₱10,000 with "Contrib." ticked.
- **Expected:** PhilHealth EE ₱500 and ER ₱500. The base is monthly basic salary only (PhilHealth Advisory 2025-0002; Circular 2018-0001).
- **Actual:** EE ₱750 and ER ₱750, with taxable pay, tax and net all wrong as a result. At ₱50,000 + ₱60,000 the page showed ₱2,500 instead of ₱1,250.
- **Root cause:** `compute()` passed the shared contribution base (basic + ticked allowances) to `philhealth()`.
- **Fix:** separate `phBase` (basic only); allowances ticked for contributions now feed SSS and Pag-IBIG only. Both rules include allowances (RA 11199 s.8(f); Circular 460 "fund salary").
- **Tests:** philhealth (3 allowance cases), allowances (12 cases), allowance-editing, mwe, property-random. All pass.

## PH-002: Amounts not rounded to the centavo, so the payslip did not add up (Medium, fixed)

- **Reproduce:** Basic ₱33,333.
- **Expected:** PhilHealth ₱833.33; contributions ₱2,708.33; taxable ₱30,624.67.
- **Actual:** taxable ₱30,624.68, computed from an unrounded ₱833.325. At ₱66,667 tax showed ₱7,818.47, while the displayed taxable pay gives ₱7,818.46. In 85 of 1,000 random cases, gross − contributions − tax − deductions did not equal the displayed net.
- **Root cause:** no rounding in the calculation; values were only rounded when displayed.
- **Fix:** `r2()` rounds every component half-up to the centavo (convention R-ROUND). Net and employer cost are sums of the rounded parts.
- **Tests:** fixtures-gross, bir-derived, the decimal-precision UI test, and the property-random reconciliation invariant. All pass.

## PH-003: Net to gross returned a non-minimal answer, or fell a centavo short (High, fixed)

- **Reproduce:**
  1. Net to Gross, target ₱980 (no allowances). The page returned ₱1,510.20; ₱1,500.00 already gives net ₱985.00.
  2. Target ₱30,765.92 returned basic ₱35,352.60, whose net is ₱30,765.91.
  3. Many targets returned a basic one centavo above the minimum.
- **Expected:** a basic whose net equals the target, and the smallest such basic (policy R-INV).
- **Root cause:** the solver bisected over real numbers between 0 and an upper bound, assuming net was continuous. Net actually drops at every SSS ₱500 step, at the Pag-IBIG ₱1,500 step and at the first centavo of pay. So bisection could converge on a later root, and its final `Math.round` could round down below the target.
- **Fix:** a segment-aware solver works in whole centavos. It lists the statutory step points, takes the first segment whose high point reaches the target, bisects inside it, then scans back 300 centavos for one-centavo rounding dips.
- **Tests:** inverse-roundtrip 52/52 in three browsers, inverse-nonunique 5/5, inverse-edge 43/43 and property-roundtrip 91/91. Each test checks every centavo in the ₱5 below the answer and the point just before every step.

## PH-004: One "Contrib." tick implied a single, optional classification for three schemes (Medium, fixed)

- **Issue:** a single tick applied an allowance to SSS, PhilHealth and Pag-IBIG together, with no statement that coverage follows the law.
- **Fix:** the tick is relabelled "SSS/Pag-IBIG" (tooltip: not PhilHealth). New hint: "PhilHealth always uses basic salary only. Ticks must follow the official rules; they don't make coverage optional." The breakdown now shows the SSS/Pag-IBIG base and the PhilHealth base separately.
- **Tests:** allowance-disclosures. Pass.

## PH-005: Minimum wage exemption granted on a checkbox with no stated assumption (Medium, fixed by disclosure)

- **Issue:** ticking "Minimum wage earner" removed tax on the basic salary with no check or statement of region or wage order.
- **Fix:** when ticked, the page now says the calculator assumes the basic entered is the statutory minimum wage for the employee's region and doesn't check the region or wage order. Validation is **not** implemented because the tool has no regional wage data. See ambiguity A-6.
- **Tests:** mwe and mwe-disclosure. Pass.

## PH-006: Deductions larger than pay gave a silent negative take-home (Low, fixed)

- **Fix:** a warning (`#negNote`) appears when net is below zero.
- **Tests:** over-deduction. Pass.

## PH-007: Annual figures didn't say how 13th-month pay is treated (Low, fixed)

- **Fix:** the overview footnote now reads "Annual figures are 12 × the monthly amounts and exclude 13th-month pay and bonuses."
- **Tests:** employer-cost (three browsers). Pass.

## PH-008: De minimis ceilings and the ₱90,000 limit were silently not applied (Low, fixed by disclosure)

- **Fix:** the allowance hint says the calculator doesn't apply de minimis ceilings (RR 29-2025) or the ₱90,000 limit, and asks users to untick "Taxable" only for the part within the ceiling. Rates & Rules adds the same rule.
- **Tests:** allowance-disclosures. Pass.

## PH-009: Unbounded inputs and search range (Low, fixed)

- **Issue:** inputs had no upper bound, and the net-to-gross search stopped silently at ₱1 trillion. No NaN or Infinity was observed in the baseline: browsers reject "1e400" in number fields.
- **Fix:** `val()` accepts only finite numbers and clamps them to ₱0–₱1,000,000,000.
- **Tests:** invalid-inputs (three browsers). Pass.

## Not defects (verified correct in the baseline)

- **SSS:** all 61 rows and every boundary, plus EC.
- **Pag-IBIG:** all thresholds.
- **BIR:** monthly table at every threshold (taxable entered directly).
- **Deductions:** after-tax deductions do not change the tax base.
- **Negative inputs:** treated as 0.
- **Labels:** escaped (no XSS).
- **Privacy:** no entered values sent over the network.

## Observations outside this calculator (not changed)

| ID | Observation | Suggested owner |
|---|---|---|
| O-1 | At 1280px desktop width, the site-wide navbar's hidden Pricing dropdown (`.nv-card--wide`) extends the page to 1457px, causing horizontal scroll on every page, including the homepage | Web |
| O-2 | HubSpot, GA4/Ads, Meta and LinkedIn trackers loaded during the test, which ran without anyone clicking the cookie banner | Privacy / legal |
| O-3 | The older `tax-calculator-philippines` tool takes "Basic Salary + Taxable Allowances" as one input and applies PhilHealth to it, so it likely has the same issue as PH-001. Not audited | Web / payroll |
| O-4 | The calculator's tabs use `role="tab"` without `aria-controls` or `role="tabpanel"` | Web (accessibility) |
