---
name: webinar-summary-page
description: Build or update a PeoplesHR webinar summary page (/webinars/<slug>-summary/) and its webinars-page card, in the live format. Use for any new recorded webinar or a change to the summary pages.
---

# Webinar summary page

One page per recorded webinar, in the format live since 2 Nov 2026 (Shawn's build) with Movindu's changes from PR #36 (5 Nov 2026). This guide is shared by the marketing Claude project and Claude in VS Code. If you change how the pages look or behave, update this file in the same pull request.

## Files a new webinar touches

| File | Change |
| --- | --- |
| `webinars/<slug>-summary.html` | New page. Copy the newest summary page (today `webinars/year-end-payroll-philippines-summary.html`) and replace its content slot by slot |
| `js/webinar-delta.js` | New entry in `WEBINAR_DATA.recordings[<category>].videos`, newest first, with `summaryUrl: "/webinars/<slug>-summary/"`. Ids run `rec-N`; take the next free number |
| `sitemap.xml` | `<url><loc>https://peopleshr.com/webinars/<slug>-summary/</loc><lastmod>YYYY-MM-DD</lastmod></url>` beside the other summary pages |
| `uploads/YYYY/MM/` | Speaker photos (webp) not already in uploads. Reuse existing photo paths from `js/webinar-delta.js` |

Slug: short, lowercase, hyphenated topic words, for example `year-end-payroll-philippines`. The file name and every URL add `-summary`.

## Page slots, top to bottom

Keep every class, id and wrapper from the copied page. Change only the content.

1. **Head:** `<title>` = webinar title + ` | PeoplesHR Webinar`; meta description 140 to 160 characters starting "Webinar summary:"; canonical, `og:*` and `twitter:*` URLs and image (`https://img.youtube.com/vi/<youtubeId>/maxresdefault.jpg`); `$phrCrumbName`; the VideoObject JSON-LD (`uploadDate` = YouTube upload date, `duration` ISO 8601 from the YouTube length, embed and content URLs).
2. **`<main class="wsi-page">`:** `data-yt` = YouTube id. Open webinar: `data-gated="false" data-preview-start="0" data-preview-end="0"`. Members-only: `data-gated="true"` plus a 2-minute preview window in seconds (see `webinars/peopleshr-v10-3-summary.html` for the locked markup and `data-gate="form"` blocks).
3. **Band:** eyebrow `WEBINAR SUMMARY · <CATEGORY IN CAPS>`; H1 under 110 characters, outcome-led, first clause in `<span class="wsi-hl">…:</span>`.
4. **Details bar (`.wsi-spec`):** CONDUCTED ON with the full weekday ("Friday, 9 October 2026"), LANGUAGE, then the status button: open = "On-demand ▶" with the blinking dot; members-only = "🔒 Locked · 2-min preview". No Format, no Length.
5. **Hero:** cover image = YouTube maxresdefault; pills "Free to watch" + length in minutes ("62 min"); one intro paragraph (50 to 70 words, past tense, names the speakers); "WATCH THE RECORDING AND LEARN HOW TO" with 3 short numbered actions.
6. **Sidebar:** SPEAKERS (`.wreg-speaker`, photo or initials, role as on the webinars page; list speakers only, not the moderator); IS THIS SESSION FOR YOU? with FOR, LANGUAGE and PRODUCT chips (`wsi-tag--pay`, `--time`, etc. linking to the product page). No Country.
7. **`#takeaways`:** 4 to 6 cards (`#tk1`…), each a "Watch from mm:ss" timestamp, a bold command and up to 25 words.
8. **`#covered`:** chapter rows (`.wsi-ch`), timestamp + title + 1 to 2 sentences, in time order.
9. **`#qa`:** questions from the session as `.phr-faq-item` (first one open), answers up to 50 words.
10. **`#stories` (Resources from the session):** only if marketing released a resource; otherwise remove the section. Use `.csi-download-cta`.
11. **`#next`:** CTA strip with a short demo-led headline tied to the session ("Spot the error before the payslip"), "Watch the recording →" (`data-play`) and "Book a demo" (`/get-in-touch/`).
12. **More webinars (`.wsi-more`):** 3 related recordings in the webinars-page card style, linking to their summary pages. Copy titles, speakers and dates from `js/webinar-delta.js`.
13. **Player modal:** update the title and YouTube link.

## Timestamps

Every timestamp is `<a class="wsi-ts" href="https://youtu.be/<id>?t=<seconds>" data-t="<seconds>" target="_blank" rel="noopener">mm:ss</a>` in **YouTube time**. Zoom transcripts run ahead of the YouTube upload because the pre-roll is trimmed: subtract (Zoom length − YouTube length) from Zoom times, then spot-check two or three chapters against the video.

## Behaviour (handled by `js/webinar-summary.js`, no per-page code)

- Open webinars: the first play opens the HubSpot "Webinar summary – on-demand first play" form once per webinar per browser, then plays from the point clicked.
- Members-only: 2-minute preview plus the gate form; unlocking on the webinars page carries over.
- Timestamps open the pop-up player at that second. The iframe keeps `referrerpolicy="strict-origin-when-cross-origin"` (YouTube Error 153 otherwise).

## Copy rules

- Past tense, plain and specific, US spelling, no buzzwords. Say "Conducted on", never "Recorded on".
- Every number, claim and quote must trace to a transcript timestamp. Attribute quotes only to the person who said them. Anything unsourced is flagged in the pull request, not published.
- No "Demo:" in headings. Product names as the product uses them ("Lexi AI Insights"). Use "Former" in a title for people who have since left.
- Payroll, tax and legal answers carry what the speaker said; flag them for a marketing check in the pull request.

## Delivering

1. Branch `webinar/<slug>` from the latest `main`. Never push to `main`.
2. Preview locally: `php -S localhost:8899 -t . dev-server-router.php` from the repo root, then open `http://localhost:8899/webinars/<slug>-summary/` and `/webinars/`. Check desktop and phone width: no horizontal scroll, no console errors, timestamps open the player at the right second, the webinars-page card opens the summary.
3. Open a pull request with: what the webinar is, desktop and phone screenshots, and a numbered list of anything needing a decision (unsourced claims, missing photos, resources, timestamp spot-check).
4. Kasun reviews, merges and deploys from cPanel ("Update from Remote", then "Deploy HEAD Commit"). dev.peopleshr.com shows it first.
