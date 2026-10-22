/* Drives the live calculator page through its own DOM and reads what it displays.
 * It never calls the page's calculation functions; results come from the on-screen
 * breakdown ("How the estimate was calculated"), KPIs and result box. */

export const URL = '/salary-calculator-philippines/';

export async function open(page) {
  await page.goto(URL);
  await page.waitForSelector('#resA');
}

/** Configure the page as a user would: reset, set switches, add rows, enter the amount. */
export async function configure(page, cfg) {
  await page.evaluate((cfg) => {
    const $ = (id) => document.getElementById(id);
    const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));
    const setVal = (el, v) => { el.value = v; fire(el, 'input'); fire(el, 'change'); };
    const setChk = (el, v) => { if (el.checked !== !!v) { el.checked = !!v; fire(el, 'change'); } };
    // Always start from Gross to Net so Reset clears both inputs.
    document.querySelector('[data-mode="gross"]').click();
    $('resetCalc').click();
    setChk($('covered'), cfg.covered !== false);
    setChk($('mwe'), !!cfg.mwe);
    for (const a of cfg.allowances || []) {
      $('addAllow').click();
      const rows = $('allowList').querySelectorAll('[data-i]'), row = rows[rows.length - 1];
      setVal(row.querySelector('[data-k="name"]'), a.name ?? 'Allowance');
      setVal(row.querySelector('[data-k="amount"]'), String(a.amount));
      setChk(row.querySelector('[data-k="contrib"]'), !!a.contrib);
      setChk(row.querySelector('[data-k="tax"]'), !!a.tax);
    }
    for (const d of cfg.deductions || []) {
      $('addDed').click();
      const rows = $('dedList').querySelectorAll('[data-i]'), row = rows[rows.length - 1];
      setVal(row.querySelector('[data-k="name"]'), d.name ?? 'Deduction');
      setVal(row.querySelector('[data-k="amount"]'), String(d.amount));
    }
    if (cfg.target !== undefined) {
      document.querySelector('[data-mode="net"]').click();
      setVal($('target'), String(cfg.target));
    } else {
      setVal($('basic'), String(cfg.basic ?? ''));
    }
  }, cfg);
}

const LABELS = {
  basic: 'Basic salary', gross: 'Gross monthly pay', sssEe: 'SSS employee share', phEe: 'PhilHealth employee share',
  hdEe: 'Pag-IBIG employee share', taxable: 'Taxable compensation', tax: 'Withholding tax', other: 'Other deductions',
  net: 'Net monthly pay', erSss: 'Employer SSS + EC', erPh: 'Employer PhilHealth', erHd: 'Employer Pag-IBIG', erCost: 'Total cost to employer',
};

/** Read every displayed figure. Returns numbers (pesos) plus raw strings for format checks. */
export async function read(page) {
  const raw = await page.evaluate(() => {
    const rows = {};
    document.querySelectorAll('#breakBody .break-row').forEach((r) => {
      rows[r.querySelector('div > b').textContent.trim()] = r.querySelector(':scope > b').textContent.trim();
    });
    const t = (id) => document.getElementById(id)?.textContent.trim();
    return {
      rows, resA: t('resA'), resB: t('resB'), resALabel: t('resALabel'), resBLabel: t('resBLabel'), sticky: t('stickyNet'),
      kpi: { gross: t('kGross'), contrib: t('kContrib'), tax: t('kTax'), ded: t('kDed'), net: t('kNet'), grossY: t('kGrossY'), netY: t('kNetY'),
        erGross: t('erGross'), erSss: t('erSss'), erPh: t('erPh'), erHd: t('erHd'), erTotal: t('erTotal'), erTotalY: t('erTotalY') },
      chips: { sss: t('sssEe'), ph: t('phEe'), hd: t('hdEe') },
      allText: document.querySelector('.tclk-scope').innerText,
      fullText: document.querySelector('.tclk-scope').textContent.replace(/\s+/g, ' '),
    };
  });
  const out = { raw };
  for (const [k, label] of Object.entries(LABELS)) out[k] = peso(raw.rows[label]);
  return out;
}

export function peso(s) {
  if (s === undefined || s === null) return NaN;
  const m = String(s).replace(/[₱,\s]/g, '').replace(/\/yr$/, '');
  return m === '' || m === '—' ? 0 : Number(m);
}

export const close = (a, b, tol = 0.005) => Math.abs(a - b) <= tol;

/** Compare page output to a reference payslip; returns a list of mismatch strings. */
export function diff(out, ref, label = '') {
  const pairs = [
    ['gross', ref.gross], ['sssEe', ref.sss.ee], ['phEe', ref.philhealth.ee], ['hdEe', ref.pagibig.ee], ['taxable', ref.taxable],
    ['tax', ref.tax], ['other', ref.other], ['net', ref.net], ['erSss', ref.sss.er + ref.sss.ec], ['erPh', ref.philhealth.er],
    ['erHd', ref.pagibig.er], ['erCost', ref.erCost],
  ];
  return pairs.filter(([k, v]) => !close(out[k], v)).map(([k, v]) => `${label} ${k}: page ${out[k]} vs expected ${Math.round(v * 100) / 100}`);
}

/** Deterministic PRNG (mulberry32) so randomized suites are repeatable from a recorded seed. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

import fs from 'node:fs';
import path from 'node:path';
/** Persist executed case results (for PH_CALCULATOR_TEST_RESULTS.md). */
export function record(testInfo, name, cases) {
  // RUN_LABEL separates runs (e.g. baseline vs after-fix); Playwright wipes test-results/ itself.
  const dir = path.resolve('results', process.env.RUN_LABEL || 'latest'); fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.${testInfo.project.name}.json`);
  fs.writeFileSync(file, JSON.stringify({ name, project: testInfo.project.name, executed: cases.length,
    passed: cases.filter(c => c.pass).length, failed: cases.filter(c => !c.pass).length, cases }, null, 1));
}
