/* Validates the reference oracle itself against figures printed in the official sources.
 * Every expected number below is a literal taken from (or hand-computed from) the source
 * document named in the test title, never from the calculator under test. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sss, philhealth, pagibig, birMonthly, payslip, SSS_TABLE, round2 } from '../reference/ph-reference.mjs';

const eq = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.005, `${msg}: got ${a}, expected ${b}`);

test('SSS Circular 2024-006: table has 61 rows, MSC 5,000 to 35,000', () => {
  assert.equal(SSS_TABLE.length, 61);
  assert.equal(SSS_TABLE[0][2] + SSS_TABLE[0][3], 5000);
  assert.equal(SSS_TABLE[60][2] + SSS_TABLE[60][3], 35000);
});

test('SSS Circular 2024-006: rows printed in the official schedule (spot values)', () => {
  // [compensation, msc, eeTotal, erTotal (SS+MPF+EC), grand total] — read from the circular image
  const printed = [
    [0.01, 5000, 250, 510, 760], [5249.99, 5000, 250, 510, 760], [5250, 5500, 275, 560, 835],
    [10000, 10000, 500, 1010, 1510], [14749.99, 14500, 725, 1460, 2185], [14750, 15000, 750, 1530, 2280],
    [19749.99, 19500, 975, 1980, 2955], [19750, 20000, 1000, 2030, 3030], [20250, 20500, 1025, 2080, 3105],
    [29750, 30000, 1500, 3030, 4530], [34749.99, 34500, 1725, 3480, 5205], [34750, 35000, 1750, 3530, 5280],
    [1000000, 35000, 1750, 3530, 5280],
  ];
  for (const [comp, msc, ee, erTot, total] of printed) {
    const r = sss(comp);
    assert.equal(r.msc, msc, `MSC @${comp}`); eq(r.ee, ee, `EE @${comp}`); eq(r.er + r.ec, erTot, `ER @${comp}`);
    eq(r.ee + r.er + r.ec, total, `total @${comp}`);
  }
});

test('SSS: every bracket boundary (below / at / above) maps to the adjacent printed row', () => {
  let checks = 0;
  for (let i = 1; i < SSS_TABLE.length; i++) {
    const lo = SSS_TABLE[i][0], prev = SSS_TABLE[i - 1], cur = SSS_TABLE[i];
    assert.equal(sss(lo - 0.01).msc, prev[2] + prev[3]);
    assert.equal(sss(lo).msc, cur[2] + cur[3]);
    assert.equal(sss(lo + 0.01).msc, cur[2] + cur[3]);
    checks += 3;
  }
  assert.equal(checks, 180);
});

test('SSS: 2023-schedule boundaries (P4,249.99/4,250/4,250.01) all fall in the 2025 "below 5,250" row', () => {
  for (const c of [4249.99, 4250, 4250.01, 5000]) { assert.equal(sss(c).msc, 5000); eq(sss(c).ee, 250, String(c)); }
});

test('SSS: zero compensation pays nothing; MPF only above MSC 20,000; EC employer-only', () => {
  assert.deepEqual(sss(0), { msc: 0, mscMpf: 0, ee: 0, er: 0, ec: 0, eeMpf: 0, erMpf: 0 });
  assert.equal(sss(20000).mscMpf, 0); assert.equal(sss(20000.01).mscMpf, 0); assert.equal(sss(20250).mscMpf, 500);
  eq(sss(50000).eeMpf, 750, 'EE MPF at max'); eq(sss(50000).erMpf, 1500, 'ER MPF at max');
  for (const c of [1, 14749.99, 14750, 100000]) assert.ok(sss(c).ee === round2(sss(c).msc * 0.05), 'EE share has no EC');
});

test('PhilHealth Advisory 2025-0002 / PA2026-0042 published examples', () => {
  const cases = [[0, 0], [5000, 250], [9999.99, 250], [10000, 250], [10000.01, 250], [20000, 500], [30000, 750],
    [50000, 1250], [99999.99, 2500], [100000, 2500], [100000.01, 2500], [250000, 2500]];
  for (const [mbs, share] of cases) { eq(philhealth(mbs).ee, share, `EE @${mbs}`); eq(philhealth(mbs).er, share, `ER @${mbs}`); }
  eq(philhealth(10000).premium, 500, 'PA2026-0042: P10,000 -> P500'); eq(philhealth(30000).premium, 1500, 'PA2026-0042: P30,000 -> P1,500');
  eq(philhealth(100000).premium, 5000, 'PA2026-0042: P100,000 -> P5,000');
});

test('Pag-IBIG HDMF Circular 460 Section C', () => {
  const cases = [[0, 0, 0], [1000, 10, 20], [1500, 15, 30], [1500.01, 30, 30], [5000, 100, 100], [9999.99, 200, 200],
    [10000, 200, 200], [10000.01, 200, 200], [50000, 200, 200], [100000, 200, 200]];
  for (const [fs, ee, er] of cases) { eq(pagibig(fs).ee, ee, `EE @${fs}`); eq(pagibig(fs).er, er, `ER @${fs}`); }
});

test('BIR Annex E (RR 11-2018) monthly table at every threshold', () => {
  // Expected values hand-computed from the printed row: fixed + rate x (taxable - CL), half-up to centavo.
  const cases = [[0, 0, 1], [20832.99, 0, 1], [20833, 0, 1], [20833.01, 0, 2],
    [33332, 1874.85, 2], [33332.5, 1874.93, 2], [33332.99, 1875.00, 2], [33333, 1875.00, 3], [33333.01, 1875.00, 3],
    [66666.99, 8541.80, 3], [66667, 8541.80, 4], [66667.01, 8541.80, 4],
    [166666.99, 33541.80, 4], [166667, 33541.80, 5], [166667.01, 33541.80, 5],
    [666666.99, 183541.80, 5], [666667, 183541.80, 6], [666667.01, 183541.80, 6], [1000000, 300208.35, 6]];
  for (const [taxable, tax, row] of cases) { const r = birMonthly(taxable); eq(r.tax, tax, `tax @${taxable}`); assert.equal(r.row, row, `row @${taxable}`); }
});

test('BIR table is continuous: no jump larger than one centavo of rate across printed range gaps', () => {
  for (const b of [20833, 33333, 66667, 166667, 666667]) {
    const below = birMonthly(b - 0.01).tax, at = birMonthly(b).tax;
    assert.ok(at - below <= 0.01, `discontinuity at ${b}: ${below} -> ${at}`);
  }
});

test('Mandatory fixtures 1-3 and employer cost at P50,000', () => {
  const f1 = payslip({ basic: 20000 });
  eq(f1.sss.ee, 1000, 'F1 SSS'); eq(f1.philhealth.ee, 500, 'F1 PH'); eq(f1.pagibig.ee, 200, 'F1 HDMF'); eq(f1.tax, 0, 'F1 tax'); eq(f1.net, 18300, 'F1 net');
  const f2 = payslip({ basic: 50000 });
  eq(f2.sss.ee, 1750, 'F2 SSS'); eq(f2.philhealth.ee, 1250, 'F2 PH'); eq(f2.taxable, 46800, 'F2 taxable'); eq(f2.tax, 4568.40, 'F2 tax'); eq(f2.net, 42231.60, 'F2 net');
  eq(f2.sss.er, 3500, 'ER SSS'); eq(f2.philhealth.er, 1250, 'ER PH'); eq(f2.pagibig.er, 200, 'ER HDMF'); eq(f2.sss.ec, 30, 'EC');
  eq(f2.erContrib, 4980, 'ER on-cost'); eq(f2.erCost, 54980, 'ER total');
  const f3 = payslip({ basic: 100000 });
  eq(f3.philhealth.ee, 2500, 'F3 PH'); eq(f3.taxable, 95550, 'F3 taxable'); eq(f3.tax, 15762.55, 'F3 tax'); eq(f3.net, 79787.45, 'F3 net');
});

test('Allowances: PhilHealth uses basic only; SSS and Pag-IBIG include covered allowances', () => {
  const r = payslip({ basic: 8000, allowances: [{ amount: 4000, contrib: true, tax: true }] });
  eq(r.philhealth.ee, 250, 'PH on MBS 8,000 (floor)'); assert.equal(r.sss.msc, 12000); eq(r.pagibig.ee, 200, 'HDMF on 12,000 capped');
  const r2 = payslip({ basic: 30000, allowances: [{ amount: 5000, contrib: false, tax: false }] });
  eq(r2.gross, 35000, 'gross'); assert.equal(r2.sss.msc, 30000); eq(r2.taxable, 30000 - r2.eeContrib, 'non-taxable allowance excluded');
});
