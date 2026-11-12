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

## 2027 printed calendar (Sri Lanka)

One QR code is printed on all 12 pages of the 2027 calendar. It encodes `https://peopleshr.com/calendar/` and must never change after print.

- `calendar.html` is a 302 redirect, never cached, that picks the page from today's date in Colombo time: `/calendar-2027/coming-soon/` before 2027, `/calendar-2027/<month>/` during 2027, `/calendar-2027/thank-you/` after. Rules and the month list live in `inc/calendar-2027.php`.
- Test a switchover with `/calendar/?preview=2027-03-01`.
- Pages under `calendar-2027/` use `css/calendar-2027.css`, scoped to `.cal27-scope`. The look is the marketing team's dark "2027 <Month> Scan" design (Bricolage Grotesque + Figtree, navy `#0B1630`, blue-green-orange gradient). Keep it matching those artifacts.
- Month pages `calendar-2027/<month>.html` and the play pages `calendar-2027/<month>-play.html` are thin wrappers: their body is `inc/calendar-2027-page.php`, and each month's copy (snap heading, draw line, share and play text) lives in `cal27_months()` in `inc/calendar-2027.php`.
- `js/calendar-2027.js` opens and closes each month in the browser on Colombo time (pages are cached at CloudFront for a day; `?preview=YYYY-MM-DD` works there too), runs the photo and details steps, and sends the entry to the HubSpot form `CAL27_HS_FORM_ID`. The form is embedded off screen and filled from our fields, so the photo goes through its file field `CAL27_HS_PHOTO_FIELD`. With no form ID, a `?preview` link runs the whole journey without sending anything.
- Each month is open 1st to last day, no late entries. January, June and December also give entrants a share link to `/calendar-2027/<month>-play/`, where colleagues play the same puzzle online (`js/calendar-2027-play.js`, puzzles copied from the marketing artifacts and the printed pages) and then enter.
