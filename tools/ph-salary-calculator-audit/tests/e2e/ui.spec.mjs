/* Phase 10: UI behaviour, validation, accessibility, privacy (network) and injection safety. */
import { test, expect } from '@playwright/test';
import { open, configure, read, close, record, URL } from './harness.mjs';
import { payslip } from '../reference/ph-reference.mjs';

test.describe('Phase 10 UI', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('tabs, recalculation, switches, overview, drawers and reset @xbrowser', async ({ page }) => {
    const basic = page.locator('#basic');
    await basic.fill('50000');
    await expect(page.locator('#resB')).toHaveText('₱ 42,231.60');
    await expect(page.locator('#stickyNet')).toHaveText('₱ 42,231.60');
    // Net to Gross keeps the figure and swaps the fields
    await page.locator('[data-mode="net"]').click();
    await expect(page.locator('[data-mode="net"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#targetField')).toBeVisible();
    await expect(basic).toBeHidden();
    await expect(page.locator('#target')).toHaveValue('42231.60');
    await expect(page.locator('#resA')).toHaveText('₱ 50,000.00');
    await page.locator('[data-mode="gross"]').click();
    await expect(basic).toHaveValue('50000.00');
    // Contributions switch
    await page.locator('#covered').uncheck();
    await expect(page.locator('#coveredNote')).toBeVisible();
    await expect(page.locator('#sssEe')).toHaveText('₱ 0.00');
    await page.locator('#covered').check();
    // Overview expands, employer view toggles
    await page.locator('#dashToggle').click();
    await expect(page.locator('#dashToggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#kNet')).toHaveText('₱ 42,231.60');
    await expect(page.locator('#kNetY')).toHaveText('₱ 506,779.20 / yr');
    await page.locator('#erView').click();
    await expect(page.locator('#erKpis')).toBeVisible();
    await expect(page.locator('#erTotal')).toHaveText('₱ 54,980.00');
    await expect(page.locator('#bandRows tr.is-current td').first()).toContainText('33,333.00');
    // Drawers: rules and breakdown; Escape closes
    await page.locator('.hero [data-open="rules"]').click();
    await expect(page.locator('#rulesDrawer')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#rulesDrawer')).not.toHaveClass(/open/);
    await page.locator('.actions [data-open="breakdown"]').click();
    await expect(page.locator('#breakDrawer')).toHaveClass(/open/);
    await page.locator('#breakDrawer [data-close]').click();
    await expect(page.locator('#breakDrawer')).not.toHaveClass(/open/);
    // Reset
    await page.locator('#addAllow').click(); await page.locator('#addDed').click();
    await page.locator('#resetCalc').click();
    await expect(basic).toHaveValue('');
    await expect(page.locator('#allowList [data-i]')).toHaveCount(0);
    await expect(page.locator('#dedList [data-i]')).toHaveCount(0);
    await expect(page.locator('#resB')).toHaveText('₱ 0.00');
  });

  test('currency formatting is ₱ with thousands separators and 2 decimals @xbrowser', async ({ page }) => {
    await configure(page, { basic: 1234567.891 });
    const { raw } = await read(page);
    for (const v of [raw.resA, raw.resB, raw.sticky, ...Object.values(raw.chips), ...Object.values(raw.rows)])
      if (v !== '—') expect(v).toMatch(/^₱ -?\d{1,3}(,\d{3})*\.\d{2}$/);
  });

  test('invalid, negative, huge and non-finite inputs never show NaN/Infinity @xbrowser', async ({ page }, testInfo) => {
    const results = [];
    for (const v of ['-5000', '1e400', '1e15', '0.001', '99999999999', '']) {
      for (const mode of ['gross', 'net']) {
        await configure(page, mode === 'gross' ? { basic: v } : { target: v });
        const { raw } = await read(page);
        const bad = /NaN|Infinity|undefined/.test(raw.allText);
        results.push({ id: `${mode} "${v}"`, pass: !bad, errors: bad ? [`shows NaN/Infinity: ${raw.resA} | ${raw.resB}`] : [] });
      }
    }
    record(testInfo, 'invalid-inputs', results);
    expect(results.filter(r => !r.pass).map(r => `${r.id}: ${r.errors}`)).toEqual([]);
  });

  test('negative basic is treated as zero', async ({ page }) => {
    await configure(page, { basic: -5000 });
    expect((await read(page)).net).toBe(0);
  });

  test('decimal precision: centavo inputs carry through exactly', async ({ page }) => {
    await configure(page, { basic: 33333.33, allowances: [{ amount: 0.01, contrib: true, tax: true }], deductions: [{ amount: 0.02 }] });
    const out = await read(page), ref = payslip({ basic: 33333.33, allowances: [{ amount: 0.01, contrib: true, tax: true }], deductions: [{ amount: 0.02 }] });
    expect(out.net).toBeCloseTo(ref.net, 2);
    // Displayed components reconcile to the displayed net to the centavo
    expect(Math.round((out.gross - out.sssEe - out.phEe - out.hdEe - out.tax - out.other) * 100)).toBe(Math.round(out.net * 100));
  });

  test('every form control has an accessible name; keyboard can reach and operate the calculator @xbrowser', async ({ page, browserName }) => {
    await page.locator('#addAllow').click(); await page.locator('#addDed').click();
    const unnamed = await page.evaluate(() => [...document.querySelectorAll('.tclk-scope input, .tclk-scope select, .tclk-scope button')]
      .filter(el => el.offsetParent !== null)
      .filter(el => !(el.getAttribute('aria-label') || (el.id && document.querySelector(`label[for="${el.id}"]`)) || el.closest('label') || el.textContent.trim()))
      .map(el => el.outerHTML.slice(0, 80)));
    expect(unnamed).toEqual([]);
    // Keyboard: focus the salary field, type, Tab onward
    await page.locator('#basic').focus();
    await page.keyboard.type('20000');
    await expect(page.locator('#resB')).toHaveText('₱ 18,300.00');
    if (browserName !== 'webkit') { // WebKit skips buttons on Tab by default (macOS setting)
      await page.locator('#dashToggle').focus(); await page.keyboard.press('Enter');
      await expect(page.locator('#dashToggle')).toHaveAttribute('aria-expanded', 'true');
    }
  });

  test('user-entered labels are rendered as text (no script injection) @xbrowser', async ({ page }) => {
    let dialog = false; page.on('dialog', d => { dialog = true; d.dismiss(); });
    const evil = '"><img src=x onerror="window.__xss=1;alert(1)"><script>window.__xss=2</script>';
    await configure(page, { basic: 30000, allowances: [{ name: evil, amount: 100, contrib: true, tax: true }], deductions: [{ name: evil, amount: 50 }] });
    await page.locator('.actions [data-open="breakdown"]').click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    expect(dialog).toBe(false);
    await expect(page.locator('#breakBody')).toContainText('<img src=x');
    await expect(page.locator('#allowList [data-k="name"]')).toHaveValue(evil);
  });

  test('privacy: salary inputs are never sent over the network @xbrowser', async ({ page }, testInfo) => {
    const reqs = [];
    page.on('request', r => reqs.push({ url: r.url(), method: r.method(), body: r.postData() || '' }));
    await page.goto(URL); await page.waitForLoadState('networkidle').catch(() => {});
    // Full values only: a bare 5-digit fragment matched random IDs in tracker payloads (false positive).
    const marker = ['87654.32', '87,654.32', '8765432', 'ZQXPRIVACY', '13579.11', '13,579.11'];
    await page.locator('#basic').pressSequentially('87654.32');
    await page.locator('#addAllow').click();
    await page.locator('#allowList [data-k="name"]').pressSequentially('ZQXPRIVACY');
    await page.locator('#allowList [data-k="amount"]').pressSequentially('13579.11');
    await page.locator('[data-mode="net"]').click();
    await page.locator('.actions [data-open="breakdown"]').click();
    await page.waitForTimeout(4000);
    const enc = (s) => [s, encodeURIComponent(s), Buffer.from(s).toString('base64')];
    const leaks = reqs.filter(r => marker.some(m => enc(m).some(e => r.url.includes(e) || r.body.includes(e))));
    const hosts = [...new Set(reqs.map(r => new globalThis.URL(r.url).host))];
    record(testInfo, 'privacy-network', [{ id: 'no salary data in requests', pass: leaks.length === 0, hosts, requests: reqs.length, errors: leaks.map(l => l.url) }]);
    expect(leaks).toEqual([]);
  });

  test('mobile: no horizontal scroll, sticky take-home bar visible @mobile', async ({ page }) => {
    await page.locator('#basic').fill('50000');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.locator('.sticky-net')).toBeVisible();
    await expect(page.locator('#stickyNet')).toHaveText('₱ 42,231.60');
    await page.locator('#addAllow').click();
    const rowOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(rowOverflow).toBeLessThanOrEqual(0);
    await page.screenshot({ path: 'test-results/mobile-ph-calculator.png', fullPage: false });
  });
});
