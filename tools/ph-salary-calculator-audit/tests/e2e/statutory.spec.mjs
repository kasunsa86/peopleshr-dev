/* Phases 3, 4 and 9: statutory boundaries, gross-to-net fixtures and employer cost, through the real page. */
import { test, expect } from '@playwright/test';
import { open, configure, read, diff, close, record } from './harness.mjs';
import { payslip, SSS_TABLE } from '../reference/ph-reference.mjs';

async function runCases(page, testInfo, name, cases) {
  const results = [];
  for (const c of cases) {
    await configure(page, c.cfg);
    const out = await read(page);
    const errs = c.check(out);
    results.push({ id: c.id, input: c.cfg, pass: errs.length === 0, errors: errs });
  }
  record(testInfo, name, results);
  const failed = results.filter(r => !r.pass);
  expect(failed.map(f => `${f.id}: ${f.errors.join('; ')}`), `${failed.length}/${results.length} failed`).toEqual([]);
}

test.describe('Phase 3/4/9 statutory', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('Fixtures 1-3 (mandatory) @xbrowser', async ({ page }, testInfo) => {
    const exp = [
      { id: 'F1', basic: 20000, sss: 1000, ph: 500, hd: 200, taxable: 18300, tax: 0, net: 18300 },
      { id: 'F2', basic: 50000, sss: 1750, ph: 1250, hd: 200, taxable: 46800, tax: 4568.40, net: 42231.60 },
      { id: 'F3', basic: 100000, sss: 1750, ph: 2500, hd: 200, taxable: 95550, tax: 15762.55, net: 79787.45 },
    ];
    await runCases(page, testInfo, 'fixtures-mandatory', exp.map(e => ({ id: e.id, cfg: { basic: e.basic }, check: (o) => {
      const errs = [];
      for (const [k, v] of [['gross', e.basic], ['sssEe', e.sss], ['phEe', e.ph], ['hdEe', e.hd], ['taxable', e.taxable], ['tax', e.tax], ['net', e.net]])
        if (!close(o[k], v)) errs.push(`${k} ${o[k]} != ${v}`);
      return errs;
    } })));
  });

  test('20+ additional gross-to-net fixtures (low to exceptionally high) @xbrowser', async ({ page }, testInfo) => {
    const salaries = [1000, 4999.99, 5000, 8000, 10000, 12345.67, 15000, 18000, 21000, 25000, 30000, 33333, 35000, 40000,
      45000.5, 66667, 75000, 120000, 166667, 250000, 500000, 666667, 750000, 1000000, 2500000, 10000000];
    await runCases(page, testInfo, 'fixtures-gross', salaries.map(s => ({ id: `G${s}`, cfg: { basic: s }, check: (o) => diff(o, payslip({ basic: s }), `G${s}`) })));
  });

  test('SSS: every official bracket boundary below/at/above, plus mandated points', async ({ page }, testInfo) => {
    const pts = new Set([0.01, 1000, 4249.99, 4250, 4250.01, 5000, 14749.99, 14750, 19999.99, 20000, 20000.01, 34749.99, 34750, 35000, 50000, 100000, 1000000]);
    for (let i = 1; i < SSS_TABLE.length; i++) { const lo = SSS_TABLE[i][0]; pts.add(+(lo - 0.01).toFixed(2)); pts.add(lo); pts.add(+(lo + 0.01).toFixed(2)); }
    // Isolate SSS: compensation = basic, and check SSS EE and ER(+EC) only.
    await runCases(page, testInfo, 'sss-boundaries', [...pts].sort((a, b) => a - b).map(v => ({ id: `SSS@${v}`, cfg: { basic: v }, check: (o) => {
      const r = payslip({ basic: v }), errs = [];
      if (!close(o.sssEe, r.sss.ee)) errs.push(`EE ${o.sssEe} != ${r.sss.ee}`);
      if (!close(o.erSss, r.sss.er + r.sss.ec)) errs.push(`ER+EC ${o.erSss} != ${r.sss.er + r.sss.ec}`);
      return errs;
    } })));
  });

  test('PhilHealth thresholds, and allowances must NOT enter the PhilHealth base', async ({ page }, testInfo) => {
    const basics = [0, 5000, 9999.99, 10000, 10000.01, 20000, 50000, 99999.99, 100000, 100000.01, 250000];
    const cases = basics.map(b => ({ id: `PH@${b}`, cfg: { basic: b }, check: (o) => {
      const r = payslip({ basic: b }); const e = [];
      if (!close(o.phEe, r.philhealth.ee)) e.push(`EE ${o.phEe} != ${r.philhealth.ee}`);
      if (!close(o.erPh, r.philhealth.er)) e.push(`ER ${o.erPh} != ${r.philhealth.er}`);
      return e;
    } }));
    // Covered (SSS/Pag-IBIG) allowance on top of basic: PhilHealth must stay on MBS (PhilHealth Circular 2018-0001, PA2025-0002).
    for (const [b, a] of [[20000, 10000], [50000, 60000], [9000, 5000]]) {
      const cfg = { basic: b, allowances: [{ amount: a, contrib: true, tax: true }] };
      cases.push({ id: `PH-allow@${b}+${a}`, cfg, check: (o) => { const r = payslip(cfg); return close(o.phEe, r.philhealth.ee) ? [] : [`EE ${o.phEe} != ${r.philhealth.ee} (MBS ${b})`]; } });
    }
    await runCases(page, testInfo, 'philhealth', cases);
  });

  test('Pag-IBIG thresholds (Circular 460)', async ({ page }, testInfo) => {
    const fs = [0, 1000, 1500, 1500.01, 5000, 9999.99, 10000, 10000.01, 50000, 100000];
    await runCases(page, testInfo, 'pagibig', fs.map(v => ({ id: `HDMF@${v}`, cfg: { basic: v }, check: (o) => {
      const r = payslip({ basic: v }), e = [];
      if (!close(o.hdEe, r.pagibig.ee)) e.push(`EE ${o.hdEe} != ${r.pagibig.ee}`);
      if (!close(o.erHd, r.pagibig.er)) e.push(`ER ${o.erHd} != ${r.pagibig.er}`);
      return e;
    } })));
  });

  test('BIR Annex E: taxable income directly (contributions off), every threshold', async ({ page }, testInfo) => {
    const t = [0, 20832.99, 20833, 20833.01, 33332, 33332.5, 33332.99, 33333, 33333.01, 66666.99, 66667, 66667.01,
      166666.99, 166667, 166667.01, 666666.99, 666667, 666667.01, 1000000];
    await runCases(page, testInfo, 'bir-direct', t.map(v => ({ id: `BIR@${v}`, cfg: { basic: v, covered: false }, check: (o) => {
      const r = payslip({ basic: v, covered: false }), e = [];
      if (!close(o.taxable, v)) e.push(`taxable ${o.taxable} != ${v}`);
      if (!close(o.tax, r.tax)) e.push(`tax ${o.tax} != ${r.tax}`);
      if (o.tax < 0) e.push('negative tax');
      return e;
    } })));
  });

  test('BIR derived from gross: contributions deducted exactly once', async ({ page }, testInfo) => {
    const g = [20000, 23500, 33333, 36000, 50000, 70000, 100000, 170000, 680000];
    await runCases(page, testInfo, 'bir-derived', g.map(v => ({ id: `BIRg@${v}`, cfg: { basic: v }, check: (o) => {
      const r = payslip({ basic: v }), e = [];
      if (!close(o.taxable, v - r.eeContrib)) e.push(`taxable ${o.taxable} != gross ${v} - contrib ${r.eeContrib}`);
      if (!close(o.tax, r.tax)) e.push(`tax ${o.tax} != ${r.tax}`);
      return e;
    } })));
  });

  test('Employer cost at P50,000 and employer-only items never reduce net @xbrowser', async ({ page }, testInfo) => {
    await runCases(page, testInfo, 'employer-cost', [{ id: 'ER@50000', cfg: { basic: 50000 }, check: (o) => {
      const e = [];
      if (!close(o.erSss, 3530)) e.push(`ER SSS+EC ${o.erSss} != 3530 (3500 + EC 30)`);
      if (!close(o.erPh, 1250)) e.push(`ER PH ${o.erPh}`);
      if (!close(o.erHd, 200)) e.push(`ER HDMF ${o.erHd}`);
      if (!close(o.erCost, 54980)) e.push(`ER cost ${o.erCost} != 54980`);
      if (!close(o.net, 42231.60)) e.push(`net ${o.net}`);
      if (!/annual figures[^.]*13th-month/i.test(o.raw.fullText)) e.push('overview does not state how 13th-month pay is treated in the annual (/ yr) figures');
      return e;
    } }]);
  });
});
