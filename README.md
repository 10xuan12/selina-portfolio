# Selina's Island — portfolio

Personal portfolio of Selina Huang (黃玟瑄), a full-stack web developer from Taiwan, open to remote roles.
**Live:** https://10xuan12.github.io/selina-portfolio/ · [中文](https://10xuan12.github.io/selina-portfolio/zh/)

A small 3D island you can walk around. Four camps hold the content:

| Camp | Prop | What's inside |
|---|---|---|
| Work & projects | Laptop desk | Sompisi Transport, TripTally, AI returns case study — live and code links |
| Experience | Books + grad cap | Five roles, one line each |
| About me | Iced coffee | Who I am, what I can do, dream roles, the life I'm building |
| Travel & life | Suitcase + signpost | Photos from Thailand, Da Nang, Eswatini and Johannesburg |

Three looks for the same island: **Home** (wine & ivory, default), **Eswatini** (savanna + red dirt) and **Da Nang** (beach).
The walking character is styled after me — black cap, long black hair, wide-leg jeans and a brown woven tote.

## Build

Source lives in `island-src/` (Vite + Three.js). The repo root holds the built site that GitHub Pages serves.

```bash
cd island-src
npm ci
npm test          # 11 tests: content schema, navigation, every camp reachable
npm run build     # outputs dist/ with / (English) and /zh/ (Traditional Chinese)
cp -r dist/. ..   # publish
```

Content is in `island-src/src/portfolio.json` (Chinese) and `portfolio.en.json` (English).

## Security and privacy

- Content-Security-Policy (`script-src 'self'`, no inline scripts) and Referrer-Policy.
- No third-party requests: no web fonts, analytics or trackers.
- Photos resized and stripped of all metadata; a stranger's licence plate is blurred.

## Credits

Built on the [island-portfolio](https://github.com/panggungunvibe/island-portfolio) template by panggungunvibe (MIT, see `island-src/LICENSE`),
restyled with a wine-and-ivory home theme, my own camp props, character and content, and an English version.
