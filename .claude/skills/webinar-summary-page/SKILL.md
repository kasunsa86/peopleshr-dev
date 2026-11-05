---
name: webinar-summary-page
description: Build or update a PeoplesHR webinar summary page (/webinars/<slug>-summary/) and its webinars-page card, in the live format. Use for any new recorded webinar, the next upcoming webinar card, or a change to the summary pages.
---

# Webinar summary page

One page per recorded webinar, in the format live since 2 Nov 2026 (Shawn's build) with the changes from PR #36 and #37 (merged 5 Nov 2026). This guide is shared by the marketing Claude project and Claude in VS Code. The live repo pages and the shared code (`css/webinar-summary.css`, `js/webinar-summary.js`, `js/webinar-delta.js`) are the source of truth; this guide summarises them. If you change how the pages look or behave, update this file in the same pull request.

## Files a new webinar touches

| File | Change |
| --- | --- |
| `webinars/<slug>-summary.html` | New page. Copy the newest summary page (today `webinars/year-end-payroll-philippines-summary.html`; members-only: `webinars/peopleshr-v10-3-summary.html`) and replace its content slot by slot |
| `js/webinar-delta.js` | New entry in `WEBINAR_DATA.recordings[<category>].videos`, newest first, with `summaryUrl: "/webinars/<slug>-summary/"`. Ids run `rec-N`; take the next free number. `date` must be the session date ("9 Oct 2026" style): the webinars-page hero picks its four thumbnails from it |
| `sitemap.xml` | `<url><loc>https://peopleshr.com/webinars/<slug>-summary/</loc><lastmod>YYYY-MM-DD</lastmod></url>` beside the other summary pages |
| `uploads/YYYY/MM/` | Speaker photos (webp) not already in uploads. Reuse existing photo paths from `js/webinar-delta.js` |

Slug: short, lowercase, hyphenated topic words, for example `year-end-payroll-philippines`. The file name and every URL add `-summary`.

## Page slots, top to bottom

Keep every class, id and wrapper from the copied page. Change only the content.

1. **Head:** `<title>` = webinar title + ` | PeoplesHR Webinar`; meta description 140 to 160 characters starting "Webinar summary:"; canonical, `og:*` and `twitter:*` URLs and image (`https://img.youtube.com/vi/<youtubeId>/maxresdefault.jpg`); `$phrCrumbName`; the VideoObject JSON-LD (`uploadDate` = YouTube upload date, not the session date; `duration` ISO 8601 from the YouTube length; embed and content URLs).
2. **`<main class="wsi-page">`:** `data-yt` = YouTube id. Open webinar: `data-gated="false" data-preview-start="0" data-preview-end="0"`. Members-only: `data-gated="true"` plus a 2-minute preview window in seconds (v10.3 uses 709 to 829) and the `data-gate="form"` blocks, copied from `webinars/peopleshr-v10-3-summary.html`.
3. **Band:** eyebrow `WEBINAR SUMMARY · <CATEGORY IN CAPS>`; H1 under 110 characters, outcome-led, first clause in `<span class="wsi-hl">…:</span>` (light blue; the rest stays navy).
4. **Details bar (`.wsi-spec`):** exactly three cells: CONDUCTED ON with the full weekday ("Friday, 9 October 2026"; check the weekday against the date), LANGUAGE, then the status button. No Format, no Length, no Country.
   - Open: `<button type="button" class="wsi-st" data-gate="open" data-vid="0"><span class="wsi-st-m"><span class="wsi-dot" aria-hidden="true"></span>On-demand<span class="wsi-st-arr" aria-hidden="true">▶</span></span></button>`.
   - Members-only: "🔒 Locked · 2-min preview". The v10.3 page carries both buttons and the script switches them; keep both exactly as there.
   - Never write "Free to watch" on the button; that wording belongs to the cover ribbon. Phone layout and the blinking dot come from the CSS.
5. **Hero:** cover image = YouTube maxresdefault. Cover ribbon (`.wsi-pills`): open = `<span>Free to watch</span><span>62 min</span>`; members-only = `<span>▶ Watch 2-min preview</span><span>🔒 Full session 36 min</span>`. One intro paragraph (50 to 70 words, past tense, names the speakers); "WATCH THE RECORDING AND LEARN HOW TO" with 3 short numbered actions.
6. **Sidebar:** SPEAKERS (`.wreg-speaker`, photo or initials, role as on the webinars page; presenters only, never the moderator); IS THIS SESSION FOR YOU? with FOR (role chips), LANGUAGE and PRODUCT chips (see Chips). No Country, no Format.
7. **`#takeaways`:** 4 to 6 cards (`#tk1`…), each a "Watch from mm:ss" timestamp, a bold command and up to 25 words.
8. **`#covered`:** chapter rows (`.wsi-ch`), timestamp + plain title + 1 to 2 sentences, in time order.
9. **`#qa`:** questions from the session as `.phr-faq-item` (first one open), answers up to 50 words. If the session had no usable Q&A, remove the section (several live pages have none).
10. **`#stories` (Resources from the session):** only if marketing released a resource; otherwise remove the section. Never leave "Awaiting marketing" on a page. Use `.csi-download-cta` with an action button linking to the real resource page, for example "Get the checklist →" to `https://peopleshr.com/year-end-payroll-checklist-ph-2026/`.
11. **`#next`:** CTA strip. The headline names the outcome a demo would show for this session, 3 to 7 words, creative and specific; then "Watch the recording →" (`data-play`) and "Book a demo" (`/get-in-touch/`). Approved: "Spot the error before the payslip" (body: "Book a demo to see how PeoplesHR flags payroll anomalies before payroll runs, or watch the full session.") and "Put HR in every pocket, from the factory floor to the front desk". Not: generic lines ("See it on your own team's phones"), long sentences, recaps. When marketing asks for options, give 4 to 6.
12. **More webinars (`.wsi-more`):** 3 related recordings in the webinars-page card style, linking to their summary pages, plus "See all webinars →". Copy titles, speakers (current or "Former" titles) and dates from `js/webinar-delta.js`.
13. **Player modal (`#wsi-vm`):** update the title and YouTube link.

Retired from the earlier v1 design, never re-add: the full transcript, "In their words" quotes, speaker cards with "Hear X on:" links, a host card, FORMAT and COUNTRY in the sidebar, base64 images in repo pages.

## Chips

Module chips link to the Products-menu pages: `<a class="wsi-tag--<module>" href="…"><img …>Name</a>` inside `.wsi-tags`.

| Chip | Links to |
| --- | --- |
| HR | `/products/core-hr/` |
| Pay | `/products/payroll-system/` |
| Talent, Recruitment | `/products/talent-acquisition/` |
| Time | `/products/time-and-attendance/` |
| Engagement | `/products/people-engagement/` |
| Insights | `/products/people-analytics/` |
| Mobile app | `/products/mobile-app/` |

- Lexi AI and Lexi AI Insights chips are not linked for now: `<span class="wsi-tag--insights"><img …>Lexi AI</span>` (9 on the live pages). Re-link them only when marketing confirms the new Lexi page URL.
- Topic tags without a module page (Compliance, Onboarding, Self-service) stay plain `<span>`.

## Timestamps

Every timestamp is `<a class="wsi-ts" href="https://youtu.be/<id>?t=<seconds>" data-t="<seconds>" target="_blank" rel="noopener">mm:ss</a>` in **YouTube time**. Zoom transcripts run ahead of the YouTube upload because the pre-roll is trimmed: subtract (Zoom length − YouTube length) from Zoom times, then spot-check two or three chapters against the video. A YouTube "Show transcript" scrape is already in YouTube time.

## Behaviour (handled by `js/webinar-summary.js`, no per-page code)

- **Open webinars:** the first press of any play control opens a pop-up ("Your session is ready", animated play icon) with the HubSpot form **"Webinar summary – on-demand first play"** (portal 45700506, form `9c1fb962-eff8-4402-b53c-71fd085903d9`, na2; full name, work email, phone; no CAPTCHA; centred "Start watching ▶"). After submitting, the video plays from the point clicked. It shows once per webinar per browser (`localStorage` key `wsi-unlocked:<youtubeId>`). Keep "On-demand" and "Free to watch" wording on open pages; never "Unlock" or a lock.
- **Members-only:** exactly as live. The webinars-page card opens the **"Unlock This Recording"** gate (portal 45700506, form `93181f13-b063-4e09-a572-345dbda4b062`) first, then the summary; the summary plays the 2-minute preview with the inline gate form under the video. No pop-up, no animation, no `#wsi-gm` on these pages: a pop-up gate was built and rejected by the team on 3 Nov 2026, so don't re-propose it.
- **Never swap the two form ids.**
- First-play form decisions (marketing, Nov 2026): free email domains stay blocked; no per-submission notification emails and no digest. The team checks the form's Submissions tab or the HubSpot segment "On-demand webinar sign-ups" (list 3160). Don't set up alerts unless asked.
- Timestamps open the pop-up player at that second. The iframe keeps `referrerpolicy="strict-origin-when-cross-origin"` and the site must keep that Referrer-Policy (YouTube Error 153 otherwise).
- Asset versions (`.v<timestamp>.js/css`) update automatically through `asset_v()`.

## Webinars page (`/webinars/`, data in `js/webinar-delta.js`)

- **Recording cards:** open cards read "View summary →" and open the summary; members-only cards open the Unlock gate. Cards show the plain language badge with no flag. Durations show only where entered.
- **Hero:** four floating thumbnails of the last four webinars held, chosen by `date` (members-only included). No hero edit is needed for a new summary.
- **Next upcoming webinar (`WEBINAR_DATA.featured`):**

| Field | Rule |
| --- | --- |
| `title`, `description` | English, even for Bahasa sessions; copy from the registration page |
| `language` | the real language, for example "Bahasa" |
| `date` | ISO with time zone (`2026-11-19T11:00:00+07:00`); the card drops off by itself at the start time |
| `dateLabel`, `timeLabel` | "19 Nov 2026", "11:00 AM WIB" |
| `registerUrl` | the registration page, for example `/webinar-payroll-id/` |
| `coverImage`, `coverPosition` | speaker photo; add `coverPosition` (for example "center 30%") if the face crops badly on phones |
| `speakers` | name and title |

  The card design (red live dot, "Register for Free", flag next to the language badge, speaker size, phone layout) lives in the CSS and card code: don't change it per webinar. Flags are inline SVG in `LANG_FLAG`, never emoji (Windows shows letters); add an SVG for a new language. The flag shows only on this card.

## People

Use one title per person everywhere (speaker cards, More webinars cards, intros, schema, `js/webinar-delta.js`). People who have left get "Former <title>" ("former" lower case inside a sentence). Presenters only, never moderators. M365 only knows current staff: if someone can't be found, ask marketing before titling them. When a person's status changes, update every mention on every page. Current list: the speakers in `js/webinar-delta.js`.

## Copy rules

- Past tense, plain and specific, US spelling, no buzzwords. Say "Conducted on", never "Recorded on".
- Every number, claim and quote must trace to a transcript timestamp. Attribute quotes only to the person who said them. Anything unsourced is flagged in the pull request, not published.
- No "Demo:" or similar labels in any heading.
- The product is always "Lexi AI Insights", never "Lexi Insights", even when the speaker says it.
- Payroll, tax and legal answers carry what the speaker said; flag them for a marketing check in the pull request.

## Delivering

1. Branch `webinar/<slug>` from the latest `main`. Never push to `main`.
2. Preview locally: `php -S localhost:8899 -t . dev-server-router.php` from the repo root (on the VS Code machine without PHP, the local-only `tools/preview_server.py`, which is gitignored), then open `http://localhost:8899/webinars/<slug>-summary/` and `/webinars/`. Check at 1280 and 390 wide: no horizontal scroll, no console errors, the right status button and cover ribbon, timestamps open the player at the right second, the webinars-page card and hero thumbnail open the summary (members-only: the gate).
   - The HubSpot form renders in an iframe; look inside it before calling it "not loaded". Use `domcontentloaded` and long timeouts, because HubSpot slows loads.
   - Never submit real entries from a local preview (HubSpot files them as spam). Simulate with `window.postMessage({type:'hsFormCallback',eventName:'onFormSubmitted'},'*')`; the video should play and the next play should skip the pop-up. A private window shows the pop-up again.
   - Members-only pages must have no `#wsi-gm`. Webinars-page cards fade in on scroll and hero thumbnails need a forced click in Playwright.
3. Open a pull request with: what the webinar is, desktop and phone screenshots, and a numbered list of anything needing a decision (unsourced claims, missing photos, resources, timestamp spot-check).
4. Kasun reviews, merges and deploys from cPanel ("Update from Remote", then "Deploy HEAD Commit"). dev.peopleshr.com shows it first.
5. After a deploy: CloudFront caches pages for up to 24 hours (`s-maxage=86400`), so existing pages can show the old version while a new URL shows at once. Check the `Age` header before calling a deploy broken, and ask Kasun to clear `/webinars/*` if it can't wait. Once cleared, check `/webinars/` and one older summary, submit the first-play form once on the live site, confirm the contact in HubSpot, then delete the test contact.
