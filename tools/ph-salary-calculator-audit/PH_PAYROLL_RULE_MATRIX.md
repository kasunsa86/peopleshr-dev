# Philippines payroll rule matrix

Calculator: `/salary-calculator-philippines/` ([salary-calculator-philippines.html](../../salary-calculator-philippines.html), [js/salary-calculator-philippines.js](../../js/salary-calculator-philippines.js))
Rules verified: 15 October 2026, for regular private-sector monthly employment.
Line numbers refer to the post-fix `js/salary-calculator-philippines.js`.

Every rule below was checked against a primary government source. The source was read directly: PDF text, or the official image for the SSS and Pag-IBIG tables. Where only a secondary source was available, the row says so.

## Statutory rules

| ID | Rule | Rate / amount | Base | Limits | Effective | Primary source | Implementation |
|---|---|---|---|---|---|---|---|
| R-SSS-1 | SSS contribution | 15% of MSC: 5% employee, 10% employer | Compensation: all actual remuneration, including allowances (RA 11199 s.8(f)) | MSC ₱5,000 (pay below ₱5,250) to ₱35,000 (pay ₱34,750 and over), ₱500 steps; max employee ₱1,750, employer ₱3,500 | January 2025 | [SSS Circular 2024-006](https://www.sss.gov.ph/wp-content/uploads/2024/12/Cir-2024-006-Employers-scaled.jpg), Social Security Commission Res. 560-s.2024 | `sss()` L35–39; base L53 |
| R-SSS-2 | Mandatory Provident Fund | Part of the 15% on MSC above ₱20,000 | Same | Regular SS MSC capped at ₱20,000; MPF MSC ₱500–₱15,000 | January 2025 | Circular 2024-006 §II.B.2 | `sss()` `mpf` field; shown in overview footnote |
| R-SSS-3 | Employees' Compensation (EC) | ₱10 if MSC below ₱15,000; ₱30 from ₱15,000 | Same | Employer only | January 2025 | Circular 2024-006 schedule | `sss()` L37; added to employer cost only (L61) |
| R-PH-1 | PhilHealth premium | 5% of MBS, split 2.5% / 2.5% | **Monthly basic salary only.** Excludes commissions, overtime, allowances, 13th-month pay and bonuses. Deductions for absences, tardiness or unpaid leave are ignored | Floor ₱10,000 (₱500 premium), ceiling ₱100,000 (₱5,000 premium) | 2024 onward; unchanged for 2025 and 2026 | [PhilHealth Advisory 2025-0002](https://www.philhealth.gov.ph/advisories/2025/PA2025-0002.pdf); [Circular 2018-0001](https://www.philhealth.gov.ph/circulars/2018/circ2018-0001.pdf) (MBS definition); [Advisory 2026-0042](https://www.philhealth.gov.ph/advisories/2026/PA2026-0042.pdf) (21 Jul 2026, 5% still in force); RA 11223 s.10 | `philhealth()` L40; base `phBase` L53 |
| R-HDMF-1 | Pag-IBIG mandatory savings | Employee 1% if fund salary ₱1,500 or below, else 2%; employer 2% | Fund salary: basic salary plus other allowances | Maximum fund salary ₱10,000, so max ₱200 each | February 2024 | [HDMF Circular No. 460](https://www.grantthornton.com.ph/contentassets/3696729c37164538add37945681d7d6f/circular-no.-460---guidelines-on-the-pag-ibig-funds-implementation-of-increase-in-the-mfs-effective-february-2024-1.pdf) §C | `hdmfEe()` / `hdmfEr()` L41–42 |
| R-HDMF-2 | Voluntary additional savings | Any amount above the mandatory share | — | Employer not obliged to match | February 2024 | Circular 460 §C.3 | Not modelled as a contribution; enter it as an "Other deduction" (after tax) |
| R-BIR-1 | Withholding tax on compensation, monthly | 0% up to ₱20,833; 15% over ₱20,833; ₱1,875 + 20% over ₱33,333; ₱8,541.80 + 25% over ₱66,667; ₱33,541.80 + 30% over ₱166,667; ₱183,541.80 + 35% over ₱666,667 | Taxable compensation = gross taxable pay − employee SSS, PhilHealth and Pag-IBIG (mandatory shares only) | — | 1 January 2023 onward | [BIR RR 11-2018 Annex E](https://bir-cdn.bir.gov.ph/local/pdf/Annex%20E%20RR%2011-2018.pdf) (monthly table); NIRC s.32(B)(7)(f) | `BANDS` L22, `withholding()` L24–33; taxable L58 |
| R-BIR-2 | Minimum wage earner (MWE) | Statutory minimum wage, plus holiday, overtime, night differential and hazard pay, exempt | Applicable regional minimum wage | — | TRAIN (RA 10963), RR 11-2018 | NIRC s.24(A)(2); RR 11-2018. Wording confirmed from secondary commentary only | `taxable` L58 (taxes only allowances marked taxable). Assumption disclosed in `#mweNote` |
| R-BIR-3 | De minimis benefits | Exempt up to each ceiling, e.g. rice ₱2,500/month, uniform ₱8,000/year, laundry ₱400/month, medical cash to dependants ₱2,000/semester | — | Excess counts toward the ₱90,000 limit | RR 29-2025 (issued 22 Dec 2025, effective 15 days after publication) | RR 29-2025, amending RR 2-98. Ceilings confirmed from law-firm alerts (Quisumbing Torres, GVES); the BIR listing page did not render | **Not applied**: user-classified. Limitation disclosed in the allowance hint |
| R-BIR-4 | 13th-month pay and other benefits | Exempt up to ₱90,000 a year combined | — | — | TRAIN, 2018; no increase enacted as of Oct 2026 (bills pending) | NIRC s.32(B)(7)(e) | **Out of scope** (monthly regular pay only); disclosed in FAQ, breakdown and annual footnote |

## Calculation conventions (decided in this audit)

| ID | Convention | Why | Implementation |
|---|---|---|---|
| R-ROUND | Every component is rounded half-up to the centavo: SSS, PhilHealth share, Pag-IBIG, taxable pay, tax, gross, deductions. Net and employer cost are then sums of the rounded parts, so the payslip always adds up | No source sets a rounding rule. SSS amounts are exact; the others need a centavo convention | `r2()` L16, used throughout `compute()` |
| R-BIR-GAP | Annex E prints whole-peso ranges (e.g. 20,833–33,332 then 33,333–66,666). A sub-peso value in a gap (e.g. ₱33,332.50) uses the lower row's formula. The table is continuous, so no value jumps by more than ₱0.01 at any threshold | Avoids a negative "excess over CL" | Marginal bands give identical results; checked at every threshold |
| R-INV | Net to gross returns the **smallest basic salary, to the centavo, whose net is at least the target**. Because net rises by at most ₱0.01 per centavo of basic between statutory steps, that net equals the target exactly. Where the same net occurs twice (just past an SSS ₱500 step or the Pag-IBIG ₱1,500 step), the lower basic is returned | The answer is defined and minimal | `stepCents()` / `solveBasic()` L70–93 |
| R-INPUT | Inputs are clamped to ₱0–₱1,000,000,000; non-numeric or non-finite input is treated as 0 | Prevents unbounded searches and NaN | `val()` L14 |

## Ambiguities for payroll / legal review

These are documented, not resolved. The calculator's current treatment is stated so a reviewer can confirm or correct it.

| ID | Question | Current treatment | Why it is uncertain |
|---|---|---|---|
| A-1 | For an MWE with taxable allowances, are the employee's mandatory contributions also deducted from those allowances? | Not deducted: taxable = taxable allowances only, on the view that contributions come out of the exempt minimum wage | Not settled in the sources reviewed. The other treatment gives slightly lower tax |
| A-2 | PhilHealth rounding when 2.5% of MBS has a half-centavo | Each share rounded half-up separately (both equal) | PhilHealth publishes no rounding rule. Affects at most ₱0.01 |
| A-3 | BIR gap values between printed whole-peso ranges | Lower row's formula (R-BIR-GAP) | Annex E is silent. Using the upper row would give ₱0.03 less at ₱33,332.50 |
| A-4 | Which allowances count as SSS compensation or Pag-IBIG fund salary (e.g. de minimis, reimbursements) | The user decides per allowance; the UI states the ticks must follow official rules | Depends on the nature of each allowance |
| A-5 | Absences and unpaid leave | Not modelled. The basic entered is used as both PhilHealth's fixed rate and actual pay for SSS and Pag-IBIG | PhilHealth ignores absence deductions; SSS and Pag-IBIG follow actual pay |
| A-6 | MWE eligibility (region, wage order, daily rate × factor) | Not validated; the user's checkbox is trusted and the assumption is displayed | No regional wage data in the tool |

## Unsupported scenarios (out of scope, disclosed)

- 13th-month pay, bonuses, year-end annualization and refunds, previous-employer income.
- Kasambahay (household) employment, where the employer pays both shares below ₱5,000 (SSS Circular 2024-007; HDMF Circular 460 §1.5).
- Employees with disability, where the PhilHealth premium is shared between the employer and the national government (PhilHealth Circular 2026-0017).
- Government employees (GSIS), self-employed, voluntary, OFW, and multiple-employer arrangements.
- Semi-monthly, weekly or daily payroll periods (only the monthly table is used).
- Overtime, holiday, night differential and hazard pay inputs.
