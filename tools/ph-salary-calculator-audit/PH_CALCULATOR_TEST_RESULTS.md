# Philippines salary calculator: test results

Run date: 15 October 2026. Environment: macOS, Node 22.23.1, Playwright 1.64.1 (Chromium, Firefox, WebKit), page served by `php -S localhost:8899` with `dev-server-router.php`.

Every number below comes from an executed run. Raw logs are in `results/`:

- `results/baseline/`: original code, before any fix.
- `results/after-fix/`: final code.

Each folder holds `playwright.json` (the Playwright report) and one JSON file per case set (`<set>.<browser>.json`) listing every input, the result and any mismatch. `results/after-fix/unit.txt` and `playwright.txt` are the console output of the final run.

## Summary

| | Baseline (original code) | After fixes |
|---|---|---|
| Oracle unit tests (`node --test`) | 11 / 11 pass | 11 / 11 pass |
| Playwright tests (4 browser projects) | 28 pass, **21 fail** | **49 pass, 0 fail, 0 flaky** |
| Individually recorded cases | 1,326 / 1,709 pass (383 fail) | **1,710 / 1,710 pass** |

The baseline has one case fewer because the MWE disclosure check was never reached: the preceding MWE calculation assertion failed first.

## Per case set

| Case set | Browser | Baseline pass/run | After fix pass/run |
|---|---|---|---|
| sss-boundaries (Group A) | chromium | 193/193 | 193/193 |
| philhealth (Group B) | chromium | 11/14 | 14/14 |
| pagibig (Group C) | chromium | 10/10 | 10/10 |
| bir-direct (Group D) | chromium | 19/19 | 19/19 |
| bir-derived (Group D) | chromium | 8/9 | 9/9 |
| fixtures-mandatory (F1–F3) | chromium / firefox / webkit | 3/3 each | 3/3 each |
| fixtures-gross (26 salaries) | chromium / firefox / webkit | 24/26 each | 26/26 each |
| employer-cost | chromium / firefox / webkit | 0/1 each | 1/1 each |
| allowances | chromium | 10/22 | 22/22 |
| allowance-editing | chromium | 2/3 | 3/3 |
| allowance-disclosures | chromium | 0/3 | 3/3 |
| deductions | chromium | 6/7 | 7/7 |
| negatives | chromium | 1/1 | 1/1 |
| over-deduction | chromium | 0/1 | 1/1 |
| mwe | chromium | 2/3 | 3/3 |
| mwe-disclosure | chromium | not reached | 1/1 |
| inverse-roundtrip (52) | chromium / firefox / webkit | 37/52 each | 52/52 each |
| inverse-nonunique | chromium | 3/5 | 5/5 |
| inverse-edge (incl. 40 seeded) | chromium | 33/43 | 43/43 |
| invalid-inputs | chromium / firefox / webkit | 12/12 each | 12/12 each |
| privacy-network | chromium / firefox / webkit | 1/1 each | 1/1 each |
| property-random (seed 20261015) | chromium | 735/1000 | 1000/1000 |
| property-roundtrip (seed 20261016) | chromium | 62/91 | 91/91 |

Tests without per-case logs, all passing after the fixes:

- Tabs, drawers and reset (Chromium, Firefox, WebKit)
- Currency format (all three)
- Accessible names and keyboard (all three)
- XSS (all three)
- Negative basic
- Decimal precision and reconciliation
- Mobile layout (iPhone 13 WebKit; screenshot `results/after-fix/mobile-ph-calculator.png`)

## Mandatory fixtures (displayed by the page after the fixes)

| Fixture | Gross | SSS EE | PhilHealth EE | Pag-IBIG EE | Taxable | BIR | Net | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | ₱20,000.00 | ₱1,000.00 | ₱500.00 | ₱200.00 | ₱18,300.00 | ₱0.00 | ₱18,300.00 | Pass (3 browsers) |
| 2 | ₱50,000.00 | ₱1,750.00 | ₱1,250.00 | ₱200.00 | ₱46,800.00 | ₱4,568.40 | ₱42,231.60 | Pass (3 browsers) |
| 3 | ₱100,000.00 | ₱1,750.00 | ₱2,500.00 | ₱200.00 | ₱95,550.00 | ₱15,762.55 | ₱79,787.45 | Pass (3 browsers) |

Employer cost at ₱50,000: SSS ₱3,500 + EC ₱30 + PhilHealth ₱1,250 + Pag-IBIG ₱200 = ₱4,980, so the total is **₱54,980.00**. This passes in all three browsers. The page now states that annual figures are 12 × monthly and exclude 13th-month pay.

## What the baseline failures were

All baseline failures trace to the defects in [PH_CALCULATOR_DEFECT_LOG.md](PH_CALCULATOR_DEFECT_LOG.md):

- **PH-001 (PhilHealth base).** All 12 failing allowance cases, the edit case, the MWE-with-allowance case, the 3 PhilHealth-with-allowance cases and most random failures. Example: ₱20,000 basic + ₱10,000 allowance gave PhilHealth ₱750; correct is ₱500.
- **PH-002 (rounding).** Gross ₱33,333 showed taxable ₱30,624.68, but the displayed contributions (₱2,708.33) give ₱30,624.67. Gross ₱66,667 showed tax ₱7,818.47 against ₱7,818.46. In 85 of 1,000 random cases the displayed parts did not add up to the displayed net.
- **PH-003 (net to gross).** Some answers were a centavo too high, and some fell a centavo short of the target (₱30,765.92 → net ₱30,765.91). Some returned a larger root (target ₱980 → ₱1,510.20, while ₱1,500.00 already gives ₱985).
- **PH-004 to PH-008.** The disclosure, warning and labelling checks.

## Statutory checks that passed in the baseline too

These were not defects:

- SSS (193 points)
- Pag-IBIG (10 points)
- BIR with taxable entered directly (19 points)
- Mandatory fixtures
- Invalid input
- Privacy
- XSS

## Test-side corrections made during the run

These were faults in the audit's own tests, fixed and rerun. None of them changed an application result to make it pass.

| # | Issue | Correction |
|---|---|---|
| T-1 | The oracle rounded "other deductions" for display but used the unrounded sum in net (₱100.005), contrary to its own R-ROUND rule. This showed as a ₱0.01 mismatch on the decimal-deduction case | Oracle rounds the deduction total before net. The baseline was rerun on the original code after all test corrections (21 failing tests; the first baseline run, before the corrections, showed 20) |
| T-2 | The privacy check used the 5-digit fragment "87654", which matched a random HubSpot event ID | Full values only (`87654.32`, `87,654.32`, `8765432`, plus the label and allowance markers). Still 0 leaks across 86 requests |
| T-3 | The 13th-month disclosure check used `innerText`, which ignores text in the collapsed overview | Uses `textContent` |
| T-4 | `node --test tests/unit/` treated the folder as one file | Glob `tests/unit/*.test.mjs` |
| T-5 | The mobile-only test also ran at desktop width | `grepInvert: /@mobile/` on the desktop project |

## Privacy observation (Phase 10)

The test entered salary, allowance and label values, switched modes and opened the breakdown. 86 network requests went to 32 hosts, including HubSpot, Google Analytics / Ads, Meta and LinkedIn. **None contained any entered value** in plain, URL-encoded or base64 form, in Chromium, Firefox or WebKit. The calculation runs entirely in the browser.

The trackers were loading during the test, which ran without anyone clicking the cookie banner. That is a site-wide matter for privacy review (see the release readiness document); it is not part of the calculator.
