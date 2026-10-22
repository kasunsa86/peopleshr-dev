# Philippines salary calculator: test plan

Rules under test: [PH_PAYROLL_RULE_MATRIX.md](PH_PAYROLL_RULE_MATRIX.md). How to run: [README.md](README.md).

## Approach

- **Independent oracle.** [tests/reference/ph-reference.mjs](tests/reference/ph-reference.mjs) is written from the primary sources and shares no code with the calculator. It uses a different method for every rule:
  - SSS: a literal 61-row transcription of Circular 2024-006, looked up by range.
  - BIR: the printed Annex E rows (fixed amount + % over the compensation level), not marginal bands.
  - PhilHealth: the advisory's bracket wording.
  - Pag-IBIG: Circular 460's rate table.
- **The oracle is itself tested** against figures printed in the sources ([tests/unit/reference.test.mjs](tests/unit/reference.test.mjs)) before it is used as the expected result.
- **Black-box application testing.** Playwright drives the real page served by the PHP dev server, through the DOM and real clicks. Results are read from what the page displays: the calculation breakdown, KPIs, result box and sticky bar. The page's own functions are never called.
- **Tolerance.** Money must match to the centavo (|difference| ≤ ₱0.005 on displayed values) under convention R-ROUND.
- **Repeatability.** Randomized suites use a fixed seed (20261015). Every case is written to `results/<RUN_LABEL>/*.json`.

## Test groups and acceptance criteria

| Group | Phase | File | What is exercised | Pass criterion |
|---|---|---|---|---|
| Oracle validation | 2–3 | `unit/reference.test.mjs` | 61-row SSS table; 13 printed SSS rows; all 60 boundaries × below/at/above (180 checks); 2023-schedule points (₱4,249.99/4,250/4,250.01); PhilHealth advisory examples (₱10k → ₱500, ₱30k → ₱1,500, ₱100k → ₱5,000); Pag-IBIG table; BIR rows at all thresholds; BIR continuity; fixtures 1–3; employer cost ₱54,980 | All equal to source figures |
| A: SSS | 3 | `e2e/statutory.spec.mjs` | 193 salary points: every bracket boundary −₱0.01 / at / +₱0.01, plus 0.01, 1,000, 4,249.99, 4,250, 4,250.01, 5,000, 14,749.99, 14,750, 19,999.99, 20,000, 20,000.01, 34,749.99, 34,750, 35,000, 50,000, 100,000, 1,000,000 | Employee share and employer SS + EC equal the oracle |
| B: PhilHealth | 3 | same | 0, 5,000, 9,999.99, 10,000, 10,000.01, 20,000, 50,000, 99,999.99, 100,000, 100,000.01, 250,000; plus 3 cases with SSS/Pag-IBIG-covered allowances | Employee and employer shares equal the oracle; allowances never change PhilHealth |
| C: Pag-IBIG | 3 | same | 0, 1,000, 1,500, 1,500.01, 5,000, 9,999.99, 10,000, 10,000.01, 50,000, 100,000 | Employee and employer amounts equal the oracle |
| D: BIR direct | 3 | same | Taxable income entered directly (contributions off): 0; each threshold −₱0.01 / at / +₱0.01; ₱33,332 and ₱33,332.50 (whole-peso gap); ₱1,000,000 | Tax equals Annex E row result; never negative |
| D: BIR derived | 3 | same | 9 gross salaries | Taxable = gross − employee contributions (deducted once); tax equals the oracle |
| Fixtures | 4 | same | Mandatory fixtures 1–3 (₱20k, ₱50k, ₱100k), plus 26 gross salaries from ₱1,000 to ₱10,000,000. Runs in Chromium, Firefox and WebKit | All 12 displayed figures equal the oracle |
| Allowances | 5 | `e2e/classification.spec.mjs` | 4 salaries × 4 flag combinations; mixed; multiple taxable; zero-value; allowances only; SSS max; Pag-IBIG ₱1,500 crossing; edit / remove / add-remove ×5; required disclosures | Oracle match; required wording present |
| Deductions | 6 | same | Salary advance; SSS loan; Pag-IBIG loan; voluntary Pag-IBIG savings; multiple; zero; decimal; negative entries; deductions greater than pay | Oracle match; taxable unchanged by deductions; negatives treated as 0; warning shown when net < 0 |
| MWE | 7 | same | MWE alone; with taxable allowance; with non-taxable allowance; assumption disclosure | Oracle match (policy A-1); note states the region/wage assumption |
| Net to gross | 8 | `e2e/inverse.spec.mjs` | 52 round trips from grosses across every bracket × 5 configurations (Chromium, Firefox, WebKit); 5 non-unique targets; allowances covering the target; ₱10M and ₱50M targets; 40 seeded random targets | Net at the returned basic equals the target; no smaller basic reaches it (dense ₱5 window + every step point below) — policy R-INV |
| Employer cost | 9 | `e2e/statutory.spec.mjs` | ₱50,000: ER SSS ₱3,500, EC ₱30, PhilHealth ₱1,250, Pag-IBIG ₱200, total ₱54,980; annual 13th-month disclosure | Exact; disclosure present |
| UI | 10 | `e2e/ui.spec.mjs` | Tabs, value carry-over, recalculation, switches, overview, employer view, drawers, Escape, reset; ₱ formatting; invalid / negative / huge / non-finite input in both modes; centavo precision and reconciliation; accessible names; keyboard; XSS in labels; network privacy; mobile (iPhone 13 WebKit) | All assertions pass in each browser it runs in |
| Property | 11 | `e2e/property.spec.mjs` | 1,000 seeded random configurations (0–3 allowances with random flags, 0–2 deductions, 90% covered, 8% MWE, ₱500–₱3M) plus 100 seeded round trips | Oracle match, and on displayed values: net = gross − contributions − tax − other; employer cost = gross + employer contributions; contributions within ceilings; tax ≥ 0; no NaN or Infinity; EC never charged to the employee; round trip exact and ≤ known solution |

## Browsers

- **Chromium:** every suite.
- **Firefox and WebKit:** suites tagged `@xbrowser` (mandatory fixtures, 26 gross fixtures, round trips, employer cost, UI behaviour, formatting, invalid input, accessibility, XSS, privacy).
- **Mobile (iPhone 13, WebKit):** layout and sticky bar.

## Out of scope

The scenarios listed as unsupported in the rule matrix, a visual-design review, and pages other than this calculator.
