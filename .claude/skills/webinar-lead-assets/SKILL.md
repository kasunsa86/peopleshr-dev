---
name: webinar-lead-assets
description: Build PeoplesHR post-webinar lead assets (checklist, calculator, scorecard, simulator, benchmark, calendar, template or chart pages) from a webinar deck, review them in English and ship them to peopleshr-dev as a pull request. Use whenever a new webinar deck arrives and marketing wants resources built from it, or when changing an existing lead-asset page.
---

# Webinar lead assets: from deck to dev pull request

Interactive, ungated resource pages that follow a PeoplesHR webinar. The marketing Claude project (cloud) and Claude in VS Code both follow this guide, so assets come out the same whoever builds them.

Proven on two builds. The live repo pages are the source of truth, and this guide summarises them:

| Webinar | Pages | Scope / prefix |
| --- | --- | --- |
| Year-end payroll PH (Dinali, Bridge PayDay, Oct 2026) | `year-end-payroll-checklist-ph-2026.html`, `13th-month-90k-calculator-ph-2026.html` | `.yepc-scope` |
| Mengelola Penggajian dalam Skala Besar (ID, 19 Nov 2026) | `checklist-payroll-skala-besar-2026.html`, `simulator-biaya-ump-2027.html` | `.psb-scope`, events `phr_psb_*` |

Cloud copy of this guide: `/mnt/project-files/lead-assets/PLAYBOOK.md`. Keep the two identical. When a review changes a rule, update both in the same pull request.

## 1. Inputs, and what to assume

Needed: the deck, plus the webinar title, date, speaker, market and language. Don't stall on missing details. Read them from the deck, state the assumption and keep going.

- **Language:** the page uses the deck's language (Bahasa Indonesia for ID). **Always** produce an English review copy as well, because Jama reviews in English.
- **Branding:** PeoplesHR-only unless the deck is co-hosted. A partner gets a co-brand line, never a competitor name.
- **Market:** sets the rules to research (tax, social security, minimum wage, holidays) and the currency format.

## 2. Fixed strategy (don't reinvent)

- **Two ungated pages:** page 1 is the main resource, built from the deck's own framework. Page 2 is one tool for the money or time decision the audience faces that season. One page is fine if the deck only supports one. Never more than two without asking.
- **One capture only.** A popup with *Nama lengkap / Full name* + *Email kantor / Work email* (free email domains blocked). It is shared by every "Print" and "Add to calendar" button. Whichever form is submitted first unlocks all of them, and after that they go straight through. The form is the HubSpot v2 embed (portal `45700506`, region `na2`) with hidden fields `phr_signup_source` and `phr_intent_level`. **Each asset pair gets its own HubSpot form, created by RevOps.** If `HS.form` is empty, a native preview form shows and nothing is submitted, so this blocks go-live. Never gate the content itself.
- **Subtle close, no hard sell.** A one-line truth ("There's always a better way" / "Selalu ada cara yang lebih baik"), then one demo card that fits the topic (payroll: Payroll Anomaly Detection, `/uploads/2026/08/Payroll_Anomaly_Detection.webp`, linking to `/interactive-demos/#pay`), plus Book a demo at `/get-in-touch/`.
- **Copy rules:**
  - Problem-aware.
  - No em-dashes anywhere, including JSON-LD and alt text.
  - No overclaims: product claims come only from approved pages, and the product team signs them off.
  - No competitor names.
  - Keep the speaker's framework and signature lines verbatim.
- **Tracking:**
  - Every page fires `track(event, props)` to dataLayer, gtag and `_hsq`, with a page prefix (`phr_<abbr>_`).
  - An intent ladder (`bumpIntent`: low, medium, high) records ticks, tool use, print, calendar and CTA clicks, and fills `phr_intent_level`.
  - Keep `?debug=1&today=YYYY-MM-DD` to test date-driven states.

## 3. Pick the format from the deck (it doesn't have to be a checklist)

Read the deck for its **spine** (the framework the speaker keeps returning to), its **numbers** (anything the audience could plug their own figures into), and its **deadline** (what has to happen by when). Then match:

| If the deck has... | Build | Example |
| --- | --- | --- |
| A step-by-step framework or layers | **Checklist** tied to the user's own date (deadlines count back from it), with progress saved locally and a reset | 5 Lapis checklist per payroll cycle, H-10 to H |
| A cost, saving or legal formula | **Calculator / simulator** with presets for the likely scenarios, maths shown, no capture | UMP 2027 cost simulator; 13th-month 90k calculator |
| Maturity levels or "where are you?" | **Scorecard / self-assessment**: 8 to 15 questions, a weighted score, a band with one next step per weak area | Payroll readiness score |
| Industry data or survey results | **Benchmark**: the user enters their figure and sees where it sits against the cited data (chart) | Overtime % vs sector median |
| Many dates or a regulatory season | **Compliance calendar / agenda** exported as one .ics | Key dates Nov to Mar |
| A policy or a document HR has to produce | **Template / generator**: the user fills a few fields and gets a printable draft | THR announcement letter |
| A trend the speaker argues from | **Interactive chart / explorer** with the source under every series | Minimum wage by province, 5 years |
| A "which option fits us" choice | **Decision tree**: 4 to 6 questions to a recommended path | In-house vs outsourced payroll |

How to choose:
- Give each page **one signature interaction** taken from the deck, for example the *Efek Pengali* hero calculator (Rp50.000 × 20.000 employees = Rp1 M).
- Prefer evergreen mechanics (per cycle, per year, a reset button) over one-off seasonal ones.
- Before building, post 3 concept directions in one short message, each named and described in one line, and recommend one. Start building the recommended one straight away without waiting.

## 4. Research and citations

- Verify every date, rate, cap, threshold and rule against a current primary or reputable source. Write down the date you checked it.
- Write a source table in the asset README (`fact | source`). Anything you can't verify stays off the page and is listed under "Not used, because unverified".
- Watch for holidays and cuti bersama that move filing deadlines, rates whose caps change mid-year, and figures due to be announced after the build. List these as "Re-check before ..." items.
- Check every weekday against its date, and check calculator maths by hand for at least one case.
- In the repo, never change a figure without a source.

## 5. Build

Work folder: `/mnt/project-files/lead-assets/<yyyy-mm>-<slug>/`.

1. **Previews first (cloud).**
   - Build each page as a self-contained HTML file in the market language. Generate the English copy from it with exact string replacements (`build/en.py` pattern: a list of `(id, en)` pairs that fail loudly on a miss). Re-run it after every edit.
   - Publish both languages as private artifact previews for review.
   - The `build/` kit in `2026-11-payroll-skala-besar/` has the shared pieces (CSS tokens, header, tracking core, `todayWIB`, `rp`/`rpShort`; the .ics builder is in `build_page1.py`; Playwright `shot.js`/`fn.js`). It predates Jama's redesign, so for layout copy the **current repo pages** instead.
2. **Site integration (repo).**
   - Start from the newest lead-asset page in the repo, never from memory. Copy its wrapper: `inc/geo.php`, `inc/seo-schema.php`, `ga4.php`, `geo-head.php`, `asset_v()` CSS/JS links, the shared navbar markup and `inc/footer.php`.
   - Wrap the content in one scope class (`<div class="<abbr>-scope">`). Put every selector under it in `css/<page>.css`, and put behaviour in `js/<page>.js` wrapped in an IIFE.
   - `build/integrate.py` shows the automatic scoping. It drops body/html/top/footer rules, turns `:root` into the scope, and renames `.hero` to `.<abbr>-hero` so it doesn't clash with the site.
   - Make internal links relative, open external sources in a new tab, and give page-specific JSON-LD (HowTo / WebApplication) after `seo-schema.php`.
   - Once the pull request exists, **edit the repo files only**. The standalone files are retired, so say so in the README.
3. **QA, every change, at 1440px and 390px:**
   - no console errors and no horizontal scroll
   - the popup: empty input, a free-email domain, a valid submit, and a second click that goes straight through
   - the .ics opens with the right number of events and reminders
   - ticks persist after a reload
   - print preview hides the UI chrome
   - calculator maths matches the hand check

   Serve locally with `php -S localhost:8899 -t . dev-server-router.php`.

## 6. Lessons already paid for

- The site reset removes paragraph margins, so add `p + p` and `h2 + p` spacing inside the scope.
- `display:grid` beats the `hidden` attribute. Add `[hidden]{display:none!important}` inside the scope, or modals show on load.
- CSS `content` can't animate in keyframes. Use two spans and fade their opacity.
- Order layered lists the way the speaker presents them (Data first), on desktop and phone.
- Number inputs: parse digits only, and format with the market locale (`id-ID` on the page, `en-US` on the English copy).
- `en.py` misses come from JSON spacing and quote styles, so match the exact source string.
- The site navbar popover causes a known 17px desktop overflow, which also appears on the PH page. It isn't the asset's fault.
- GitHub GraphQL is blocked from the cloud, so use REST (`gh api repos/kasunsa86/peopleshr-dev/...`). You can't request a reviewer on your own PR, so mention Kasun in the body instead.
- `git reset --hard` is blocked. Branch with `git checkout -B <branch> origin/main` from a clean tree.

## 7. Design defaults (from Jama's redesign, Nov 2026)

- **Hero:** compact, with smaller type and the signature calculator card and countdown side by side.
- **Progress ribbon:** a date tile (click to change the date), a slim "next deadline" bar showing the deadline and the number of items left, and an animated ring. On desktop a side stack shows total progress once the ribbon scrolls away.
- **Section cards:** start/end date tiles and a per-section "clear" button, with no raw counts. Completing a section or the whole thing shows a pop, glow and spark.
- **Key dates:** a vertical agenda by month with a dot timeline, full notes and countdowns, and **one** "add all dates to calendar" button. Filter buttons must not catch it.
- **"What changed":** icon stat cards in the site palette.
- **Pattern / why-it-matters:** a data-flow diagram (input, rule, output, where the error lands), labelled in the page language.
- **Mobile is designed, not just squeezed.** Re-lay the ribbon, diagrams and agenda for phones and check every section at 390px.

## 8. Repo, pull request and VS Code handoff

- Repo `kasunsa86/peopleshr-dev`. Pull requests are opened as **Movindu02** (the `gh` login in the cloud). **Never push to `main`.** Kasun reviews, merges and deploys.
- Branch `lead-asset/<slug>`. Use one pull request per asset pair and follow the repo PR template if there is one. In the PR body, list the pages, the scope class, the source table (or a link to it), the QA done and the launch blockers.
- After a merge, follow-ups go on a fresh branch from `main` and a new pull request.
- **VS Code handoff (on request):** give the branch name and `git fetch origin && git checkout <branch>`. Claude in VS Code loads this skill and `CLAUDE.md` from the repo. Before every change, pull, because both sides edit the same branch.
- If a change alters how lead-asset pages look or behave, update this guide (and the cloud copy) in the same pull request.

## 9. Review loop

Jama reviews the English previews or the dev site and sends notes. Apply each note to the market-language repo page on both desktop and mobile, re-run QA, and push to the open pull request. Update the English preview so the two stay in step.

## 10. Hand-off and launch checklist

Write `README-handoff-sources.md` in the work folder. It covers:
- the concept
- the pages and slugs
- the email rotation (3 sends: webinar follow-up, the news hook, the next deadline)
- launch TODOs
- the QA status
- the source table
- re-check dates

Before Kasun deploys:
- [ ] Dedicated HubSpot form GUID set in `js/<page>.js` (`HS.form`)
- [ ] 390px mobile pass on every section
- [ ] og:image 1200×630 per page
- [ ] Product claims signed off
- [ ] Time-sensitive figures re-checked
- [ ] Linked from the webinar summary page's "Resources from the session" (see `webinar-summary-page`)
- [ ] Ask Kasun whether to add the pages to `sitemap.xml` (no lead-asset page is listed there yet)

Then save the per-webinar decisions to project memory (`peopleshr-lead-assets`).
