# peopleshr.com site

## Webinar summary pages

Pages under `webinars/*-summary.html` (served at `/webinars/<slug>-summary/`) are built by two Claudes: the marketing Claude project in the cloud and Claude in VS Code. Both follow the same guide so pages come out identical:

- Guide: `.claude/skills/webinar-summary-page/SKILL.md` (also loads as the `webinar-summary-page` skill). It covers the summary pages, the webinars-page cards and the next upcoming webinar card.
- Start every new page from the newest existing summary page, not from memory.
- Work on a branch named `webinar/<slug>` and open a pull request. Never push to `main`; Kasun reviews, merges and deploys.
- When you change the layout, behaviour or copy rules of the summary pages, update the guide in the same pull request.

## Webinar lead-asset pages (checklists and calculators)

Interactive resource pages that follow a webinar, for example `year-end-payroll-checklist-ph-2026.html` + `13th-month-90k-calculator-ph-2026.html` (Philippines) and `checklist-payroll-skala-besar-2026.html` + `simulator-biaya-ump-2027.html` (Indonesia, Bahasa Indonesia).

- Each page is the real site wrapper (PHP includes, shared navbar, `inc/footer.php`) around one scoped block: `<div class="yepc-scope">` / `<div class="psb-scope">`. Its look lives in its own `css/<page>.css` and its behaviour in its own `js/<page>.js`. Keep every selector under the page's scope class so nothing leaks onto the rest of the site.
- Check every change at desktop (1440px) and mobile (390px) widths. Breakpoints in the Indonesian pages are 920px, 900px and 820px.
- Dates, rates and rules on these pages are researched and cited. Don't change a figure without a source. The Indonesian sources are listed in the pull request that added the pages.
- No em-dashes in copy, no overclaims about the product, no competitor names.
