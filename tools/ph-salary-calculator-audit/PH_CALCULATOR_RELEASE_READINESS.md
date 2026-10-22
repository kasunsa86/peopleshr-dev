# Philippines salary calculator: release readiness

**Recommendation: GO, conditional on human sign-off.** Nothing has been deployed or published.

## Basis

- Every statutory rate, base and limit was checked against a primary source current at 15 October 2026 ([rule matrix](PH_PAYROLL_RULE_MATRIX.md)). No newer SSS, PhilHealth, Pag-IBIG or BIR compensation rule had taken effect.
- Three accuracy defects were found and fixed:
  - PH-001: PhilHealth charged on allowances (high).
  - PH-003: net to gross not minimal or a centavo short (high).
  - PH-002: centavo rounding (medium).
  
  Six disclosure and guard defects were fixed as well.
- After the fixes, 1,710 of 1,710 recorded cases and 49 of 49 Playwright tests pass across Chromium, Firefox, WebKit and mobile, against an independent oracle that is itself checked against the published figures ([results](PH_CALCULATOR_TEST_RESULTS.md)). The baseline on the original code failed 383 cases.
- **No known critical or high-severity accuracy defect remains** within the calculator's stated scope: regular monthly pay, private-sector, single employer.
- The calculation runs locally, and no entered value appeared in any network request.

## Conditions before release

1. **Payroll/legal review of ambiguities A-1 to A-6** in the rule matrix, especially:
   - A-1: MWE taxable allowances.
   - A-6: MWE eligibility is assumed, not validated.
2. **Approval of the conventions:**
   - R-ROUND: half-up per component.
   - R-INV: smallest basic whose net reaches the target.
3. **Privacy owner review of O-2:** third-party trackers were loading on this page during the test, which ran without anyone clicking the cookie banner. The calculator's claim "Nothing you enter is sent or stored" held in testing, but the page as a whole is not tracker-free.
4. **Human approval of the copy changes,** then a normal commit and deploy. After deploying, run a CloudFront invalidation for the page so cached HTML is replaced.

## Residual risk (accepted, disclosed on the page)

- Out of scope:
  - 13th-month pay, bonuses and annualization.
  - De minimis ceiling enforcement.
  - Kasambahay, employees with disability, GSIS, self-employed or OFW workers, and multiple employers.
  - Non-monthly pay periods.
  - Overtime and holiday inputs.
  - Absences.
- Rates change by issuance. Re-run `npm test` in this folder after any SSS, PhilHealth, Pag-IBIG or BIR change. Update the oracle from the new source first, not from the calculator.

## Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Payroll subject-matter expert | | | |
| Legal / compliance | | | |
| Web owner | | | |
