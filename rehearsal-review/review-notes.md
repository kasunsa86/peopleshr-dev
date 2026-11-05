# [REHEARSAL] Review notes: Is Your Payroll Ready for Year-End?

Dry run of the full flow on a past webinar, 5 Nov 2026. Nothing live was changed.

- Branch: https://github.com/kasunsa86/peopleshr-dev/tree/webinar/rehearsal-year-end-payroll (commit bc6e68b)
- Page: webinars/year-end-payroll-philippines-rehearsal-summary.html (noindex), plus a rec-26 "[REHEARSAL]" card in js/webinar-delta.js
- YouTube: https://youtu.be/vG3kd1DOS9M · Open (On-demand) · Friday, 9 October 2026 · English

## Checks run (local preview, 1280 and 390 wide)
- No horizontal scroll (scrollWidth 1280 / 390). No page errors on load.
- First play opened the on-demand HubSpot form; after a simulated submit the player opened at 27:41 (t=1661), the second clicked.
- Webinars page shows the rehearsal card and it links to the rehearsal summary.
- The only console error came from the simulated form message itself; the live page gives the same one, so it isn't from the build.
- Sitemap line skipped on purpose (noindex rehearsal page).

## Decisions for reviewers
1. **Name and title:** Manolo Garcia-Ramos, Country Director – Philippines (the agreed name) vs Manuel Garcia-Ramos, Country Sales Director - Philippines (HubSpot and M365). Still open.
2. **Peso amounts:** the captions show "$"; the page uses ₱ (₱90,000, ₱184,219.96, ₱15,351.66).
3. **Payroll and tax answers** (Q&A 1, 2, 4 and the takeaways on the ceiling and the formula) need a marketing check. The "checked by" name is still missing.
4. **BIR slide:** at 40:54 Sharon said the deadline slide used an old template. The page names no BIR dates, only the chapter.
5. **Timestamps** are aligned from Zoom (offset 11 s). Please spot-check 2 or 3, e.g. 20:26 and 42:42.
6. **Open or members-only:** built as open (the data says gated false). Whether this webinar stays open is still your call.
7. **Resource:** a released checklist page exists in the repo, so the section is kept. The flow has no step that finds this, so it's a gap to fix.
8. **CTA headline:** "Catch the anomaly before you run payroll". Alternatives: "See every payroll change before you approve", "Close the year without the December scramble".

## To publish (in a real run)
Reviewers approve, Jama confirms in the thread, then Claude opens the PR for Kasun. In this rehearsal, the PR will be a draft marked "do not merge" and will be closed straight away.
