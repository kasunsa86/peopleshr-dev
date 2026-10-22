/* Phase 11: deterministic randomized testing (seed recorded). Expected values come from the
 * independent oracle; invariants are checked on the page's own displayed figures. */
import { test, expect } from '@playwright/test';
import { open, configure, read, diff, close, record, rng } from './harness.mjs';
import { payslip } from '../reference/ph-reference.mjs';

export const SEED = 20261015;
const N = 1000;

function genConfig(r) {
  const logU = (lo, hi) => Math.round(Math.exp(Math.log(lo) + r() * (Math.log(hi) - Math.log(lo))) * 100) / 100;
  const basic = r() < 0.03 ? 0 : logU(500, 3_000_000);
  const allowances = Array.from({ length: Math.floor(r() * 4) }, () => ({ amount: r() < 0.1 ? 0 : logU(10, 80_000), contrib: r() < 0.6, tax: r() < 0.6 }));
  const deductions = Array.from({ length: Math.floor(r() * 3) }, () => ({ amount: logU(1, 20_000) }));
  return { basic, allowances, deductions, covered: r() < 0.9, mwe: r() < 0.08 };
}

test('1,000 seeded random configurations: oracle match + invariants', async ({ page }, testInfo) => {
  test.setTimeout(900_000);
  await open(page);
  const r = rng(SEED), results = [];
  for (let i = 0; i < N; i++) {
    const cfg = genConfig(r);
    await configure(page, cfg);
    const o = await read(page), ref = payslip(cfg), errs = diff(o, ref, `#${i}`);
    // Invariants on displayed values (independent of the oracle)
    const ee = o.sssEe + o.phEe + o.hdEe;
    if (!close(o.net, o.gross - ee - o.tax - o.other, 0.0051)) errs.push(`#${i} net != gross - ee - tax - other (${o.net} vs ${(o.gross - ee - o.tax - o.other).toFixed(2)})`);
    if (!close(o.erCost, o.gross + o.erSss + o.erPh + o.erHd, 0.0051)) errs.push(`#${i} erCost != gross + employer contributions`);
    if (cfg.covered && (o.sssEe > 1750 || o.phEe > 2500 || o.hdEe > 200)) errs.push(`#${i} employee contribution above ceiling`);
    if (o.tax < 0) errs.push(`#${i} negative tax`);
    if (/NaN|Infinity/.test(o.raw.allText)) errs.push(`#${i} NaN/Infinity displayed`);
    // EC is employer-only: it appears in employer SSS + EC and never in the employee share or net.
    if (cfg.covered && ref.sss.ec && close(o.sssEe, ref.sss.ee + ref.sss.ec)) errs.push(`#${i} EC charged to employee`);
    results.push({ i, cfg, pass: errs.length === 0, errors: errs });
  }
  record(testInfo, 'property-random', results);
  const failed = results.filter(x => !x.pass);
  expect(failed.slice(0, 15).map(x => x.errors.join('; ')), `${failed.length}/${N} failed (seed ${SEED})`).toEqual([]);
});

test('100 seeded random round trips (gross -> net -> gross -> net)', async ({ page }, testInfo) => {
  test.setTimeout(900_000);
  await open(page);
  const r = rng(SEED + 1), results = [];
  for (let i = 0; i < 100; i++) {
    const cfg = genConfig(r);
    const target = payslip(cfg).net;
    if (!(target > 0)) continue;
    const { basic, ...rest } = cfg;
    await configure(page, { ...rest, target });
    const B = (await read(page)).basic, back = payslip({ ...rest, basic: B }).net, errs = [];
    if (!close(back, target)) errs.push(`#${i} target ${target} -> basic ${B} -> net ${back}`);
    if (B > basic + 0.005) errs.push(`#${i} returned basic ${B} larger than a known solution ${basic}`);
    results.push({ i, target, originalBasic: basic, returnedBasic: B, pass: !errs.length, errors: errs });
  }
  record(testInfo, 'property-roundtrip', results);
  expect(results.filter(x => !x.pass).slice(0, 15).map(x => x.errors.join('; '))).toEqual([]);
});
