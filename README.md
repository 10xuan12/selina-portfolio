# Selina Huang — Portfolio

Personal site of a full-stack web developer from Taiwan, open to remote roles.
**Live:** https://10xuan12.github.io/selina-portfolio/ · [中文版](https://10xuan12.github.io/selina-portfolio/zh/index.html)

## What's on it

| Section | What it shows |
|---|---|
| Work | Sompisi Transport, TripTally, and an AI returns case study — each with a real screen recording, live link and code link |
| About + knowledge base | Who I am, what I can do, the roles I want and the life I'm building, in four tabs |
| Experience | Five roles, one line each |
| Contact | Email, LinkedIn, GitHub |

## How it's built

- **Plain HTML, CSS and JavaScript.** No framework, no build step, served by GitHub Pages.
  A portfolio this size doesn't need one, and it keeps the first load at about 280 KB.
- **Two languages, same structure.** `index.html` (English) and `zh/index.html`
  (Traditional Chinese) mirror each other section for section; edit both together.
- **Motion that respects the visitor.** Screen recordings only load near the viewport and
  pause off-screen; everything animated switches off under `prefers-reduced-motion`.

## Security and privacy

- Content-Security-Policy and Referrer-Policy set via `<meta>` (GitHub Pages can't send headers).
  The one inline script is allowed by hash, not by `'unsafe-inline'`.
- The email address isn't written in the HTML source, so basic scrapers don't harvest it.
- No third-party scripts or trackers. The only external request is Google Fonts.
- Photos are resized and stripped of all metadata (including GPS) before they're committed;
  screen recordings are trimmed so no private chats appear.

## Checks (Nov 2026)

| Check | Result |
|---|---|
| Accessibility (axe-core, WCAG 2.1 AA) | 0 violations on both pages |
| Layout shift (CLS) | 0 |
| First load | ≈ 280 KB |
| Largest paint, local test | ≈ 1.1–1.2 s |

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
