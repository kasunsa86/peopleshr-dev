/* Independent reference ("oracle") for the Philippines salary calculator audit.
 *
 * Written from the primary sources only. It deliberately shares NO code with
 * js/salary-calculator-philippines.js and uses a different method for every rule:
 *   - SSS: a literal row-by-row transcription of the official Circular 2024-006
 *     schedule (61 rows), looked up by range, not computed from a formula.
 *   - BIR: the printed Annex E monthly table rows (fixed amount + % over the
 *     compensation level), selected per row, not a marginal-band sum.
 *   - PhilHealth: PhilHealth Advisory 2025-0002 / PA2026-0042 bracket wording.
 *   - Pag-IBIG: HDMF Circular No. 460, Section C.
 * All money is rounded half-up to the centavo per component (see rule matrix R-ROUND).
 */

export const round2 = (x) => {
  // Half-up to centavo, robust to binary noise such as 1.005 -> 1.00499999.
  const s = Math.sign(x) || 1, a = Math.abs(x);
  return s * Math.round(Number((a * 100).toFixed(6))) / 100;
};

/* SSS Circular No. 2024-006, Business Employers and Employees, effective January 2025.
 * Columns: [rangeFrom, rangeTo, mscRegularSS, mscMPF, erRegularSS, erMPF, EC, eeRegularSS, eeMPF]
 * Source image: https://www.sss.gov.ph/wp-content/uploads/2024/12/Cir-2024-006-Employers-scaled.jpg */
export const SSS_TABLE = [
  [     0.00,   5249.99,   5000,      0,   500.00,    0.00,  10,  250.00,   0.00],
  [  5250.00,   5749.99,   5500,      0,   550.00,    0.00,  10,  275.00,   0.00],
  [  5750.00,   6249.99,   6000,      0,   600.00,    0.00,  10,  300.00,   0.00],
  [  6250.00,   6749.99,   6500,      0,   650.00,    0.00,  10,  325.00,   0.00],
  [  6750.00,   7249.99,   7000,      0,   700.00,    0.00,  10,  350.00,   0.00],
  [  7250.00,   7749.99,   7500,      0,   750.00,    0.00,  10,  375.00,   0.00],
  [  7750.00,   8249.99,   8000,      0,   800.00,    0.00,  10,  400.00,   0.00],
  [  8250.00,   8749.99,   8500,      0,   850.00,    0.00,  10,  425.00,   0.00],
  [  8750.00,   9249.99,   9000,      0,   900.00,    0.00,  10,  450.00,   0.00],
  [  9250.00,   9749.99,   9500,      0,   950.00,    0.00,  10,  475.00,   0.00],
  [  9750.00,  10249.99,  10000,      0,  1000.00,    0.00,  10,  500.00,   0.00],
  [ 10250.00,  10749.99,  10500,      0,  1050.00,    0.00,  10,  525.00,   0.00],
  [ 10750.00,  11249.99,  11000,      0,  1100.00,    0.00,  10,  550.00,   0.00],
  [ 11250.00,  11749.99,  11500,      0,  1150.00,    0.00,  10,  575.00,   0.00],
  [ 11750.00,  12249.99,  12000,      0,  1200.00,    0.00,  10,  600.00,   0.00],
  [ 12250.00,  12749.99,  12500,      0,  1250.00,    0.00,  10,  625.00,   0.00],
  [ 12750.00,  13249.99,  13000,      0,  1300.00,    0.00,  10,  650.00,   0.00],
  [ 13250.00,  13749.99,  13500,      0,  1350.00,    0.00,  10,  675.00,   0.00],
  [ 13750.00,  14249.99,  14000,      0,  1400.00,    0.00,  10,  700.00,   0.00],
  [ 14250.00,  14749.99,  14500,      0,  1450.00,    0.00,  10,  725.00,   0.00],
  [ 14750.00,  15249.99,  15000,      0,  1500.00,    0.00,  30,  750.00,   0.00],
  [ 15250.00,  15749.99,  15500,      0,  1550.00,    0.00,  30,  775.00,   0.00],
  [ 15750.00,  16249.99,  16000,      0,  1600.00,    0.00,  30,  800.00,   0.00],
  [ 16250.00,  16749.99,  16500,      0,  1650.00,    0.00,  30,  825.00,   0.00],
  [ 16750.00,  17249.99,  17000,      0,  1700.00,    0.00,  30,  850.00,   0.00],
  [ 17250.00,  17749.99,  17500,      0,  1750.00,    0.00,  30,  875.00,   0.00],
  [ 17750.00,  18249.99,  18000,      0,  1800.00,    0.00,  30,  900.00,   0.00],
  [ 18250.00,  18749.99,  18500,      0,  1850.00,    0.00,  30,  925.00,   0.00],
  [ 18750.00,  19249.99,  19000,      0,  1900.00,    0.00,  30,  950.00,   0.00],
  [ 19250.00,  19749.99,  19500,      0,  1950.00,    0.00,  30,  975.00,   0.00],
  [ 19750.00,  20249.99,  20000,      0,  2000.00,    0.00,  30, 1000.00,   0.00],
  [ 20250.00,  20749.99,  20000,    500,  2000.00,   50.00,  30, 1000.00,  25.00],
  [ 20750.00,  21249.99,  20000,   1000,  2000.00,  100.00,  30, 1000.00,  50.00],
  [ 21250.00,  21749.99,  20000,   1500,  2000.00,  150.00,  30, 1000.00,  75.00],
  [ 21750.00,  22249.99,  20000,   2000,  2000.00,  200.00,  30, 1000.00, 100.00],
  [ 22250.00,  22749.99,  20000,   2500,  2000.00,  250.00,  30, 1000.00, 125.00],
  [ 22750.00,  23249.99,  20000,   3000,  2000.00,  300.00,  30, 1000.00, 150.00],
  [ 23250.00,  23749.99,  20000,   3500,  2000.00,  350.00,  30, 1000.00, 175.00],
  [ 23750.00,  24249.99,  20000,   4000,  2000.00,  400.00,  30, 1000.00, 200.00],
  [ 24250.00,  24749.99,  20000,   4500,  2000.00,  450.00,  30, 1000.00, 225.00],
  [ 24750.00,  25249.99,  20000,   5000,  2000.00,  500.00,  30, 1000.00, 250.00],
  [ 25250.00,  25749.99,  20000,   5500,  2000.00,  550.00,  30, 1000.00, 275.00],
  [ 25750.00,  26249.99,  20000,   6000,  2000.00,  600.00,  30, 1000.00, 300.00],
  [ 26250.00,  26749.99,  20000,   6500,  2000.00,  650.00,  30, 1000.00, 325.00],
  [ 26750.00,  27249.99,  20000,   7000,  2000.00,  700.00,  30, 1000.00, 350.00],
  [ 27250.00,  27749.99,  20000,   7500,  2000.00,  750.00,  30, 1000.00, 375.00],
  [ 27750.00,  28249.99,  20000,   8000,  2000.00,  800.00,  30, 1000.00, 400.00],
  [ 28250.00,  28749.99,  20000,   8500,  2000.00,  850.00,  30, 1000.00, 425.00],
  [ 28750.00,  29249.99,  20000,   9000,  2000.00,  900.00,  30, 1000.00, 450.00],
  [ 29250.00,  29749.99,  20000,   9500,  2000.00,  950.00,  30, 1000.00, 475.00],
  [ 29750.00,  30249.99,  20000,  10000,  2000.00, 1000.00,  30, 1000.00, 500.00],
  [ 30250.00,  30749.99,  20000,  10500,  2000.00, 1050.00,  30, 1000.00, 525.00],
  [ 30750.00,  31249.99,  20000,  11000,  2000.00, 1100.00,  30, 1000.00, 550.00],
  [ 31250.00,  31749.99,  20000,  11500,  2000.00, 1150.00,  30, 1000.00, 575.00],
  [ 31750.00,  32249.99,  20000,  12000,  2000.00, 1200.00,  30, 1000.00, 600.00],
  [ 32250.00,  32749.99,  20000,  12500,  2000.00, 1250.00,  30, 1000.00, 625.00],
  [ 32750.00,  33249.99,  20000,  13000,  2000.00, 1300.00,  30, 1000.00, 650.00],
  [ 33250.00,  33749.99,  20000,  13500,  2000.00, 1350.00,  30, 1000.00, 675.00],
  [ 33750.00,  34249.99,  20000,  14000,  2000.00, 1400.00,  30, 1000.00, 700.00],
  [ 34250.00,  34749.99,  20000,  14500,  2000.00, 1450.00,  30, 1000.00, 725.00],
  [ 34750.00,  Infinity,  20000,  15000,  2000.00, 1500.00,  30, 1000.00, 750.00],
];

/** SSS lookup. "Below 5,250" is the first row: any covered compensation > 0 pays the minimum. */
export function sss(compensation) {
  if (!(compensation > 0)) return { msc: 0, mscMpf: 0, ee: 0, er: 0, ec: 0, eeMpf: 0, erMpf: 0 };
  // Ranges are printed to the centavo (e.g. 5,250.00 - 5,749.99); compare in whole centavos.
  const c = Math.round(compensation * 100);
  const row = SSS_TABLE.find(r => c >= Math.round(r[0] * 100) && (r[1] === Infinity || c <= Math.round(r[1] * 100)));
  const [, , reg, mpf, erSS, erMPF, ec, eeSS, eeMPF] = row;
  return { msc: reg + mpf, mscMpf: mpf, ee: eeSS + eeMPF, er: erSS + erMPF, ec, eeMpf: eeMPF, erMpf: erMPF };
}

/* PhilHealth Advisory 2025-0002 (rate 5%, floor P10,000, ceiling P100,000; MBS only),
 * reaffirmed by Advisory 2026-0042 (21 July 2026). Premium shared equally (RA 11223 s.10). */
export function philhealth(monthlyBasicSalary) {
  if (!(monthlyBasicSalary > 0)) return { premium: 0, ee: 0, er: 0 };
  let premium;
  if (monthlyBasicSalary <= 10000) premium = 500;               // "P10,000.00 ... P500.00"
  else if (monthlyBasicSalary >= 100000) premium = 5000;        // "P100,000.00 ... 5,000.00"
  else premium = monthlyBasicSalary * 0.05;                     // "P10,000.01 to P99,999.99"
  const share = round2(premium / 2);
  return { premium: round2(premium), ee: share, er: share };
}

/* HDMF Circular No. 460, Section C (effective February 2024).
 * Fund Salary = basic salary and other allowances; MFS P10,000.
 * P1,500 and below: EE 1%, ER 2%. Over P1,500: EE 2%, ER 2%. */
export function pagibig(fundSalary) {
  if (!(fundSalary > 0)) return { ee: 0, er: 0 };
  const capped = fundSalary > 10000 ? 10000 : fundSalary;
  const eeRate = fundSalary <= 1500 ? 0.01 : 0.02;
  return { ee: round2(capped * eeRate), er: round2(capped * 0.02) };
}

/* BIR RR 11-2018 Annex E, "Revised Withholding Tax Table, effective January 1, 2023 and onwards",
 * MONTHLY. Printed rows: [rangeFrom, rangeTo, fixedTax, rateOverCL, compensationLevel]. */
export const BIR_MONTHLY = [
  [0,      20833,    0.00,      0.00, 0],
  [20833,  33332,    0.00,      0.15, 20833],
  [33333,  66666,    1875.00,   0.20, 33333],
  [66667,  166666,   8541.80,   0.25, 66667],
  [166667, 666666,   33541.80,  0.30, 166667],
  [666667, Infinity, 183541.80, 0.35, 666667],
];

/** Row selection: the highest printed row whose compensation level is <= taxable.
 *  This also covers sub-peso values that fall between printed whole-peso ranges
 *  (e.g. 33,332.50 uses row 2). */
export function birMonthly(taxable) {
  if (!(taxable > 0)) return { tax: 0, row: 1 };
  let idx = 0;
  // Row 1 is printed as "P 20,833 and below", so 20,833 itself stays in row 1 (row 2 also gives 0.00 there).
  for (let i = 1; i < BIR_MONTHLY.length; i++) if (i === 1 ? taxable > 20833 : taxable >= BIR_MONTHLY[i][4]) idx = i;
  const [, , fixed, rate, cl] = BIR_MONTHLY[idx];
  return { tax: round2(fixed + (taxable - cl) * rate), row: idx + 1, rate };
}

/**
 * Full monthly payslip.
 * cfg = { basic, covered=true, mwe=false,
 *         allowances: [{amount, contrib (SSS + Pag-IBIG base), tax}],
 *         deductions: [{amount}] }
 */
export function payslip(cfg) {
  const basic = cfg.basic || 0, covered = cfg.covered !== false, mwe = !!cfg.mwe;
  const allow = cfg.allowances || [], ded = cfg.deductions || [];
  let allowTotal = 0, contribAllow = 0, taxAllow = 0, other = 0;
  for (const a of allow) { allowTotal += a.amount; if (a.contrib) contribAllow += a.amount; if (a.tax) taxAllow += a.amount; }
  for (const d of ded) other += d.amount;
  other = round2(other);   // R-ROUND: deductions are a component too, rounded before net
  const gross = round2(basic + allowTotal);
  const compensation = covered ? basic + contribAllow : 0;   // SSS compensation & Pag-IBIG fund salary
  const mbs = covered ? basic : 0;                           // PhilHealth monthly basic salary
  const s = sss(compensation), p = philhealth(mbs), h = pagibig(compensation);
  const eeContrib = round2(s.ee + p.ee + h.ee);
  const taxable = round2(Math.max(0, mwe ? taxAllow : basic + taxAllow - eeContrib));
  const t = birMonthly(taxable);
  const net = round2(gross - eeContrib - t.tax - other);
  const erContrib = round2(s.er + s.ec + p.er + h.er);
  return {
    gross, compensation, mbs, sss: s, philhealth: p, pagibig: h, eeContrib, taxable,
    tax: t.tax, birRow: t.row, other: round2(other), net, erContrib, erCost: round2(gross + erContrib),
  };
}
