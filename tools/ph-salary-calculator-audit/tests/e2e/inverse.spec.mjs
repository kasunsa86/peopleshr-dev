/* Phase 8: Net-to-gross. Policy under test (documented in the rule matrix, R-INV):
 *   The calculator returns the SMALLEST basic salary, to the centavo, whose net pay is at least
 *   the target. Because every component is rounded to the centavo and net can rise by at most
 *   P0.01 per centavo of basic, that net equals the target exactly.
 * Verification is independent: the oracle recomputes net at the returned basic, and proves
 * minimality by (a) every centavo in the P5.00 below the answer and (b) the high point just
 * before every statutory discontinuity (SSS steps, Pag-IBIG 1,500 step, first centavo) below it. */
import { test, expect } from '@playwright/test';
import { open, configure, read, close, record, rng } from './harness.mjs';
import { payslip, SSS_TABLE } from '../reference/ph-reference.mjs';

const netAt = (cfg, basic) => payslip({ ...cfg, basic, target: undefined }).net;

function verify(cfg, target, B) {
  const errs = [];
  const n = netAt(cfg, B);
  if (!close(n, target)) errs.push(`net at returned basic ${B} is ${n}, target ${target}`);
  // (a) dense window
  const lo = Math.max(0, Math.round((B - 5) * 100));
  for (let c = lo; c < Math.round(B * 100); c++) if (netAt(cfg, c / 100) >= target - 0.0001) { errs.push(`smaller basic ${(c / 100).toFixed(2)} already reaches target`); break; }
  // (b) segment ends before each discontinuity (in basic terms)
  const contribAllow = (cfg.allowances || []).filter(a => a.contrib).reduce((s, a) => s + a.amount, 0);
  const cuts = [0.01, 1500.01, ...SSS_TABLE.slice(1).map(r => r[0])].map(t => +(t - (cfg.covered === false ? 0 : contribAllow)).toFixed(2));
  for (const t of cuts) { const x = +(t - 0.01).toFixed(2); if (x >= 0 && x < B - 5 && netAt(cfg, x) >= target - 0.0001) { errs.push(`earlier segment reaches target at basic ${x}`); break; } }
  return errs;
}

test.describe('Phase 8 net to gross', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('round trips: 60 targets across every contribution and tax bracket @xbrowser', async ({ page }, testInfo) => {
    const grosses = [600, 1200, 1499.99, 1500, 1500.01, 3000, 5000, 5249.99, 5250, 7500, 9999.99, 10000, 10000.01, 12000, 14750, 15000,
      19999.99, 20000, 20250, 21000, 22000, 24000, 25000, 28000, 30000, 33333, 34750, 35000, 38000, 42000, 50000, 60000, 66667, 70000,
      85000, 99999.99, 100000, 100000.01, 120000, 150000, 166667, 180000, 220000, 300000, 450000, 600000, 666667, 700000, 900000,
      1200000, 2000000, 5000000];
    const cfgs = [{}, { allowances: [{ amount: 3000, contrib: true, tax: true }], deductions: [{ amount: 1500 }] },
      { allowances: [{ amount: 2500, contrib: false, tax: false }] }, { covered: false }, { mwe: true, allowances: [{ amount: 4000, contrib: true, tax: true }] }];
    const results = [];
    let i = 0;
    for (const g of grosses) {
      const cfg = cfgs[i++ % cfgs.length];
      const target = netAt(cfg, g);
      if (target <= 0) continue;
      await configure(page, { ...cfg, target });
      const out = await read(page);
      const B = out.basic, errs = verify(cfg, target, B);
      results.push({ id: `from gross ${g} cfg#${(i - 1) % cfgs.length}`, target, returnedBasic: B, originalBasic: g, nonUnique: !close(B, g, 0.005), pass: !errs.length, errors: errs });
    }
    record(testInfo, 'inverse-roundtrip', results);
    expect(results.length).toBeGreaterThanOrEqual(50);
    expect(results.filter(r => !r.pass).map(r => `${r.id}: ${r.errors.join('; ')}`)).toEqual([]);
  });

  test('non-unique solutions: returns the smallest basic', async ({ page }, testInfo) => {
    // Net at basic 1,500.00 is 985.00; at 1,500.01 Pag-IBIG steps to 2% and net drops to 970.01.
    // Targets in (970, 985] are reached twice; the answer must be in the first segment.
    // Same around the SSS MSC steps (net falls by P25 - tax effect at each P500 step).
    const targets = [{ t: 980 }, { t: 984.5 }, { t: 18800 }, { t: 9140 }, { t: 4600 }];
    const results = [];
    for (const { t } of targets) {
      await configure(page, { target: t });
      const B = (await read(page)).basic, errs = verify({}, t, B);
      results.push({ id: `target ${t}`, returnedBasic: B, pass: !errs.length, errors: errs });
    }
    record(testInfo, 'inverse-nonunique', results);
    expect(results.filter(r => !r.pass).map(r => `${r.id}: ${r.errors.join('; ')}`)).toEqual([]);
  });

  test('targets met by allowances alone, very high targets, and seeded random targets', async ({ page }, testInfo) => {
    const results = [];
    // Allowances alone exceed target -> basic 0 and the explanatory note.
    await configure(page, { allowances: [{ amount: 20000, contrib: false, tax: false }], target: 15000 });
    const z = await read(page), noteVisible = await page.locator('#zeroNote').isVisible();
    results.push({ id: 'allowances cover target', pass: close(z.basic, 0) && noteVisible, errors: close(z.basic, 0) && noteVisible ? [] : [`basic ${z.basic}, note ${noteVisible}`] });
    for (const t of [10000000, 50000000]) {
      await configure(page, { target: t });
      const B = (await read(page)).basic, errs = verify({}, t, B);
      results.push({ id: `very high ${t}`, returnedBasic: B, pass: !errs.length, errors: errs });
    }
    const r = rng(20261015);
    for (let k = 0; k < 40; k++) {
      const t = Math.round(Math.exp(Math.log(500) + r() * (Math.log(2e6) - Math.log(500))) * 100) / 100;
      await configure(page, { target: t });
      const B = (await read(page)).basic, errs = verify({}, t, B);
      results.push({ id: `seeded target ${t}`, returnedBasic: B, pass: !errs.length, errors: errs });
    }
    record(testInfo, 'inverse-edge', results);
    expect(results.filter(r => !r.pass).map(r => `${r.id}: ${r.errors.join('; ')}`)).toEqual([]);
  });
});
