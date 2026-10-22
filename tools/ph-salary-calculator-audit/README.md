# Philippines salary calculator audit

Accuracy audit and regression tests for `/salary-calculator-philippines/`. This folder is under `/tools`, which `deploy.sh` never ships.

| Document | Purpose |
|---|---|
| [PH_PAYROLL_RULE_MATRIX.md](PH_PAYROLL_RULE_MATRIX.md) | Verified rules, sources, conventions, ambiguities |
| [PH_CALCULATOR_TEST_PLAN.md](PH_CALCULATOR_TEST_PLAN.md) | Test groups and acceptance criteria |
| [PH_CALCULATOR_TEST_RESULTS.md](PH_CALCULATOR_TEST_RESULTS.md) | Executed results, baseline vs after fix |
| [PH_CALCULATOR_DEFECT_LOG.md](PH_CALCULATOR_DEFECT_LOG.md) | Defects, root causes, fixes |
| [PH_CALCULATOR_CHANGELOG.md](PH_CALCULATOR_CHANGELOG.md) | Source changes and the tests that cover them |
| [PH_CALCULATOR_RELEASE_READINESS.md](PH_CALCULATOR_RELEASE_READINESS.md) | GO / NO-GO and sign-off |

## Running the tests

```sh
cd tools/ph-salary-calculator-audit
npm install                              # @playwright/test
npx playwright install chromium firefox webkit
npm test                                 # oracle unit tests + all browser tests
RUN_LABEL=mylabel npx playwright test    # per-case logs go to results/mylabel/
```

Playwright starts `php -S localhost:8899 -t <repo> dev-server-router.php`, or reuses one that is already running. The randomized suites use seed 20261015, so runs are repeatable.

## When a statutory rate changes

1. Update `tests/reference/ph-reference.mjs` from the new official document.
2. Add the document's printed figures to `tests/unit/reference.test.mjs` and run `npm run test:unit`.
3. Run `npm test`. Failures show where the calculator still uses the old rule.
4. Update the calculator and the rule matrix.
