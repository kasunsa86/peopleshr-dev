# peopleshr.com site

## Webinar summary pages

Pages under `webinars/*-summary.html` (served at `/webinars/<slug>-summary/`) are built by two Claudes: the marketing Claude project in the cloud and Claude in VS Code. Both follow the same guide so pages come out identical:

- Guide: `.claude/skills/webinar-summary-page/SKILL.md` (also loads as the `webinar-summary-page` skill). It covers the summary pages, the webinars-page cards and the next upcoming webinar card.
- Start every new page from the newest existing summary page, not from memory.
- Work on a branch named `webinar/<slug>` and open a pull request. Never push to `main`; Kasun reviews, merges and deploys.
- When you change the layout, behaviour or copy rules of the summary pages, update the guide in the same pull request.
