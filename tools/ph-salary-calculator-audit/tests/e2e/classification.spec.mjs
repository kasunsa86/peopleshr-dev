/* Phases 5, 6 and 7: allowance classification, other deductions, minimum wage earner. */
import { test, expect } from '@playwright/test';
import { open, configure, read, diff, close, record } from './harness.mjs';
import { payslip } from '../reference/ph-reference.mjs';

async function compareAll(page, testInfo, name, cases) {
  const results = [];
  for (const c of cases) {
    await configure(page, c.cfg);
    const out = await read(page);
    const errs = [...diff(out, payslip(c.cfg), c.id), ...(c.extra ? c.extra(out) : [])];
    results.push({ id: c.id, input: c.cfg, pass: errs.length === 0, errors: errs });
  }
  record(testInfo, name, results);
  const failed = results.filter(r => !r.pass);
  expect(failed.map(f => f.errors.join('; ')), `${failed.length}/${results.length} failed`).toEqual([]);
}

test.describe('Phase 5 allowances', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('every contribution/tax flag combination, multiples, zero and decimal amounts', async ({ page }, testInfo) => {
    const A = (amount, contrib, tax) => ({ amount, contrib, tax });
    const cases = [];
    for (const basic of [9000, 18000, 30000, 80000])
      for (const contrib of [true, false]) for (const tax of [true, false])
        cases.push({ id: `1x ${basic} c=${contrib} t=${tax}`, cfg: { basic, allowances: [A(3500.55, contrib, tax)] } });
    cases.push({ id: 'mixed 3', cfg: { basic: 25000, allowances: [A(2000, true, true), A(2500, false, false), A(1200.4, true, false)] } });
    cases.push({ id: 'multiple taxable', cfg: { basic: 40000, allowances: [A(5000, true, true), A(7000.75, true, true), A(333.33, false, true)] } });
    cases.push({ id: 'zero-value', cfg: { basic: 30000, allowances: [A(0, true, true), A(0, false, false)] } });
    cases.push({ id: 'allowances only, no basic', cfg: { basic: 0, allowances: [A(15000, true, true)] } });
    cases.push({ id: 'allowance pushes SSS to max', cfg: { basic: 20000, allowances: [A(20000, true, true)] } });
    cases.push({ id: 'allowance crosses Pag-IBIG 1,500', cfg: { basic: 1000, allowances: [A(600, true, false)] } });
    await compareAll(page, testInfo, 'allowances', cases);
  });

  test('editing, removing and re-adding allowance rows recalculates correctly', async ({ page }, testInfo) => {
    const results = [];
    await configure(page, { basic: 30000, allowances: [{ amount: 2000, contrib: true, tax: true }, { amount: 3000, contrib: false, tax: false }] });
    // Edit row 0 amount and untick taxable
    await page.locator('#allowList [data-i="0"] [data-k="amount"]').fill('4500');
    await page.locator('#allowList [data-i="0"] [data-k="tax"]').uncheck();
    let out = await read(page), exp = payslip({ basic: 30000, allowances: [{ amount: 4500, contrib: true, tax: false }, { amount: 3000, contrib: false, tax: false }] });
    results.push({ id: 'edit', pass: diff(out, exp).length === 0, errors: diff(out, exp, 'edit') });
    // Remove row 0
    await page.locator('#allowList [data-i="0"] [data-remove]').click();
    out = await read(page); exp = payslip({ basic: 30000, allowances: [{ amount: 3000, contrib: false, tax: false }] });
    results.push({ id: 'remove', pass: diff(out, exp).length === 0, errors: diff(out, exp, 'remove') });
    // Add/remove repeatedly
    for (let i = 0; i < 5; i++) { await page.locator('#addAllow').click(); await page.locator('#allowList [data-i="1"] [data-remove]').click(); }
    out = await read(page);
    results.push({ id: 'add/remove x5', pass: diff(out, exp).length === 0 && (await page.locator('#allowList [data-i]').count()) === 1, errors: diff(out, exp, 'repeat') });
    record(testInfo, 'allowance-editing', results);
    expect(results.filter(r => !r.pass).flatMap(r => r.errors)).toEqual([]);
  });

  test('UI explains that classification follows statutory rules and de minimis/P90,000 limits are not applied', async ({ page }, testInfo) => {
    const text = await page.locator('.tclk-scope').innerText();
    const results = [
      { id: 'classification must follow official rules', pass: /follow (the )?(official|statutory) rules|not optional/i.test(text) },
      { id: 'PhilHealth uses basic salary only', pass: /PhilHealth[^.]*basic salary only|basic salary only[^.]*PhilHealth/i.test(text) },
      { id: 'de minimis ceilings not applied (RR 29-2025)', pass: /de minimis[^.]*(ceiling|limit)/i.test(text) },
    ].map(r => ({ ...r, errors: r.pass ? [] : [r.id] }));
    record(testInfo, 'allowance-disclosures', results);
    expect(results.filter(r => !r.pass).map(r => r.id)).toEqual([]);
  });
});

test.describe('Phase 6 deductions', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('after-tax deductions reduce net only, never the tax base', async ({ page }, testInfo) => {
    const D = (name, amount) => ({ name, amount });
    const cases = [
      { id: 'salary advance', cfg: { basic: 30000, deductions: [D('Salary advance', 5000)] } },
      { id: 'SSS loan', cfg: { basic: 45000, deductions: [D('SSS salary loan', 1234.56)] } },
      { id: 'Pag-IBIG loan', cfg: { basic: 45000, deductions: [D('Pag-IBIG MPL', 980.1)] } },
      { id: 'Pag-IBIG voluntary additional savings', cfg: { basic: 60000, deductions: [D('Pag-IBIG additional savings (voluntary)', 800)] } },
      { id: 'multiple', cfg: { basic: 75000, deductions: [D('Loan', 2000), D('HMO dependant', 1500.5), D('Union dues', 300)] } },
      { id: 'zero', cfg: { basic: 25000, deductions: [D('Zero', 0)] } },
      { id: 'decimal', cfg: { basic: 25000, deductions: [D('Dec', 0.01), D('Dec2', 99.995)] } },
    ].map(c => ({ ...c, extra: (o) => { const base = payslip({ ...c.cfg, deductions: [] }); return close(o.taxable, base.taxable) ? [] : [`${c.id}: deduction changed taxable`]; } }));
    await compareAll(page, testInfo, 'deductions', cases);
  });

  test('negative entries are clamped to zero in the UI', async ({ page }, testInfo) => {
    await configure(page, { basic: 25000, deductions: [{ name: 'Neg', amount: -500 }], allowances: [{ amount: -1000, contrib: true, tax: true }] });
    const out = await read(page), exp = payslip({ basic: 25000 });
    const errs = diff(out, exp, 'negatives');
    record(testInfo, 'negatives', [{ id: 'negative allowance & deduction', pass: errs.length === 0, errors: errs }]);
    expect(errs).toEqual([]);
  });

  test('deductions greater than pay are flagged, not silently shown as negative take-home', async ({ page }, testInfo) => {
    await configure(page, { basic: 15000, deductions: [{ name: 'Big loan', amount: 20000 }] });
    const out = await read(page), exp = payslip({ basic: 15000, deductions: [{ amount: 20000 }] });
    const warn = await page.locator('#negNote').isVisible().catch(() => false);
    const errs = [...diff(out, exp, 'over-deduct'), ...(warn ? [] : ['no warning shown when deductions exceed pay'])];
    record(testInfo, 'over-deduction', [{ id: 'deductions > pay', pass: errs.length === 0, errors: errs }]);
    expect(errs).toEqual([]);
  });
});

test.describe('Phase 7 minimum wage earner', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('MWE: statutory minimum wage exempt, taxable allowances still taxed; assumption disclosed', async ({ page }, testInfo) => {
    const cases = [
      { id: 'MWE basic only', cfg: { basic: 15000, mwe: true } },
      { id: 'MWE + taxable allowance', cfg: { basic: 15000, mwe: true, allowances: [{ amount: 30000, contrib: true, tax: true }] } },
      { id: 'MWE + non-taxable allowance', cfg: { basic: 15000, mwe: true, allowances: [{ amount: 2500, contrib: false, tax: false }] } },
    ];
    await compareAll(page, testInfo, 'mwe', cases);
    await configure(page, { basic: 15000, mwe: true });
    const note = (await page.locator('#mweNote').innerText()).toLowerCase();
    const disclosed = /region/.test(note) && /(not check|doesn't check|does not check|isn't checked|not verified|assum)/.test(note);
    record(testInfo, 'mwe-disclosure', [{ id: 'MWE assumption disclosed', pass: disclosed, errors: disclosed ? [] : [`note: ${note}`] }]);
    expect(disclosed, `MWE note must state the region/wage-order assumption. Note was: "${note}"`).toBe(true);
  });
});
