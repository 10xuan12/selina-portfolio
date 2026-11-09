# Selina Huang — my route

Personal site of Selina Huang (黃玟瑄), a full-stack web developer from Taiwan, open to remote roles.
**Live:** https://10xuan12.github.io/selina-portfolio/ · [中文](https://10xuan12.github.io/selina-portfolio/zh/)

The page reads like a trip: a boarding pass with the 10-second summary, then a route through
my life — Taichung, university, teaching, my first client in Eswatini, travel, an internship,
my master's — and the next stop.

## Updating the content (no coding needed)

**Everything you see on the site is in [`content.json`](content.json).** Edit it on GitHub
(web or app: open the file → pencil icon → edit → *Commit changes*). The site updates in about a minute.

- Each text has a Chinese and an English version: `{ "zh": "…", "en": "…" }`.
- **Add a stop on the route:** copy one block inside `"chapters": [ … ]`, paste it where it belongs
  in time, and change the words. `media` is optional — use `photo`, `video` or `photos`.
- **Add a photo:** upload it to the `image/` folder first (resize to ~1000px wide and remove location
  info), then put its path in `"src"`.
- Keep the quotes `"` and commas `,` — if one goes missing, the site shows a red box saying which
  line to check instead of a blank page.

## Files

| File | What it is |
|---|---|
| `content.json` | All words, photos and links |
| `index.html`, `zh/index.html` | English and Chinese page shells (rarely need editing) |
| `app.js` | Draws the page from `content.json` |
| `style.css` | Look and animations |
| `image/` | Photos and screen recordings |

## Security and privacy

- Content-Security-Policy with `script-src 'self'` (no inline scripts) and Referrer-Policy.
- Content is inserted as text, never as HTML, so nothing in `content.json` can run code.
- No analytics or trackers; the only outside request is Google Fonts.
- Photos are resized and stripped of metadata; screen recordings are trimmed so no private chats show.

## Checks (Nov 2026)

axe-core (WCAG 2.1 AA): 0 issues on both languages · Layout shift: 0 · First load ≈ 260 KB.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
