// Selina Huang — life-route site.
// Everything visible on the page comes from content.json; this file only draws it.
// All content is inserted as text (never as HTML), so nothing in content.json can run code.

const root = document.body.dataset.root || "";
const lang = document.documentElement.lang.toLowerCase().startsWith("zh") ? "zh" : "en";
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const app = document.getElementById("app");

const UI = {
  zh: {
    nav: ["路線", "關於我", "聯絡"], route: "我的路線", passenger: "乘客", from: "出發", to: "目的地",
    role: "職位", stack: "技術", status: "狀態", work: "作品", flight: "航班", contactH: "一起做點什麼吧",
    contactP: "在找遠端全端或 AI 人才？直接敲我，一天內回。", copy: "複製 Email", copied: "已複製 Email，等你來信。",
    skills: "我會什麼", traits: "我是誰", scroll: "往下捲，開始旅程", errorH: "content.json 格式有錯",
    errorP: "網站讀不到內容。請檢查這附近有沒有少了逗號、引號或括號：", top: "回到頂端",
  },
  en: {
    nav: ["Route", "About", "Contact"], route: "My route", passenger: "Passenger", from: "From", to: "To",
    role: "Role", stack: "Stack", status: "Status", work: "Work", flight: "Flight", contactH: "Let’s build something",
    contactP: "Hiring for remote full-stack or AI? Hit me up — I reply within a day.", copy: "Copy email", copied: "Email copied — talk soon.",
    skills: "What I can do", traits: "Who I am", scroll: "Scroll to start the journey", errorH: "content.json has a formatting error",
    errorP: "The site couldn’t read its content. Check near here for a missing comma, quote or bracket:", top: "Back to top",
  },
}[lang];

// ---------- tiny helpers ----------
const t = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v[lang] ?? v.en ?? v.zh ?? "" : v ?? "");
const asset = (p) => (/^(https?:|mailto:|#)/.test(p) ? p : root + p);
const safeUrl = (u) => (/^(https?:\/\/|mailto:|#|[\w./-]+$)/i.test(u) ? asset(u) : "#");

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === "class") n.className = v;
    else if (k === "style") n.setAttribute("style", v);
    else if (k === "href") n.setAttribute("href", safeUrl(v));
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) n.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return n;
}
const ext = (url) => /^https?:/.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {};

// ---------- sections ----------
function header(c) {
  const other = lang === "zh" ? { href: root || "../", label: "EN", hl: "en", aria: "Switch to English" } : { href: "zh/", label: "中", hl: "zh-Hant", aria: "切換為中文" };
  return el("header", { class: "top" },
    el("a", { class: "logo", href: "#top", "aria-label": c.profile.name }, el("span", { class: "logo-s" }, "S"), el("span", { class: "logo-dot" }, "·")),
    el("nav", { class: "nav", "aria-label": "Main" },
      el("a", { href: "#route" }, UI.nav[0]), el("a", { href: "#about" }, UI.nav[1]), el("a", { href: "#contact", class: "nav-cta" }, UI.nav[2])),
    el("a", { class: "lang", href: other.href, hreflang: other.hl, "aria-label": other.aria }, other.label));
}

function hero(c) {
  const p = c.pass, pr = c.profile;
  const words = t(pr.headline);
  const headline = lang === "zh"
    ? el("h1", { class: "headline" }, ...(words.match(/[^，、。！？]+[，、。！？]?/g) || [words]).map((ch, i) => el("span", { class: "w", style: `--i:${i * 3}` }, ch)))
    : el("h1", { class: "headline" }, ...words.split(" ").flatMap((w, i) => [el("span", { class: "w", style: `--i:${i}` }, w), " "]));
  const pass = el("article", { class: "pass", "aria-label": "Boarding pass" },
    el("div", { class: "pass-main" },
      el("div", { class: "pass-row pass-head" }, el("span", { class: "pass-brand" }, "SELINA AIR"), el("span", { class: "pass-kind" }, "BOARDING PASS")),
      el("div", { class: "pass-field" }, el("span", { class: "k" }, UI.passenger), el("strong", { class: "v v-name" }, pr.name, el("small", {}, pr.nameZh))),
      el("div", { class: "pass-route" },
        el("div", {}, el("span", { class: "k" }, UI.from), el("strong", { class: "city" }, t(p.from))),
        el("span", { class: "plane", "aria-hidden": "true" }, "✈"),
        el("div", {}, el("span", { class: "k" }, UI.to), el("strong", { class: "city" }, t(p.to)))),
      el("div", { class: "pass-field" }, el("span", { class: "k" }, UI.role), el("strong", { class: "v" }, t(p.role))),
      el("div", { class: "pass-field" }, el("span", { class: "k" }, UI.stack), el("div", { class: "chips" }, p.stack.map((s) => el("span", { class: "chip" }, s)))),
      el("div", { class: "pass-field" }, el("span", { class: "k" }, UI.status), el("strong", { class: "v status" }, el("i", { "aria-hidden": "true" }), t(p.status)))),
    el("div", { class: "pass-stub" },
      el("span", { class: "k" }, UI.work),
      el("ul", { class: "stub-links" }, p.projects.map((x) => el("li", {}, el("a", { href: x.url, ...ext(x.url) }, t(x.label), " ↗")))),
      el("div", { class: "stub-contact" }, contactButtons(c, true)),
      el("div", { class: "barcode", "aria-hidden": "true" })));
  return el("section", { class: "hero", id: "top" },
    el("div", { class: "hero-copy" },
      el("img", { class: "avatar", src: asset(pr.photo), alt: pr.name, width: 600, height: 769 }),
      headline,
      el("p", { class: "sub" }, t(pr.sub))),
    pass,
    el("a", { class: "scroll-cue", href: "#route" }, UI.scroll, el("span", { "aria-hidden": "true" }, "↓")));
}

function contactButtons(c, small) {
  const email = `${c.contact.emailUser}@${c.contact.emailDomain}`;
  return [
    el("a", { class: small ? "pill pill-solid" : "btn btn-solid", href: "mailto:" + email }, "Email"),
    el("a", { class: small ? "pill" : "btn", href: c.contact.linkedin, ...ext(c.contact.linkedin) }, "LinkedIn"),
    el("a", { class: small ? "pill" : "btn", href: c.contact.github, ...ext(c.contact.github) }, "GitHub"),
  ];
}

function media(m) {
  if (!m) return null;
  if (m.type === "photo") return el("figure", { class: "media media-photo" }, el("img", { src: asset(t(m.src)), alt: t(m.alt), loading: "lazy" }));
  if (m.type === "video") return el("figure", { class: "media media-phone" },
    el("video", { src: asset(m.src), poster: asset(m.poster), muted: true, loop: true, playsinline: true, preload: "none", "aria-label": t(m.alt) }));
  if (m.type === "photos") {
    const card = (it, hidden) => el("figure", { class: "polaroid", "aria-hidden": hidden ? "true" : false },
      el("img", { src: asset(it.src), alt: hidden ? "" : t(it.caption), loading: "lazy", width: 600, height: 800 }), el("figcaption", {}, t(it.caption)));
    return el("div", { class: "media media-strip" }, el("div", { class: "strip-track" }, m.items.map((it) => card(it)), m.items.map((it) => card(it, true))));
  }
  return null;
}

function chapter(ch, i) {
  const links = ch.links?.length ? el("div", { class: "ch-links" }, ch.links.map((l) => el("a", { class: "btn", href: l.url, ...ext(l.url) }, t(l.label), " ↗"))) : null;
  const wide = ch.media?.type === "photos";
  return el("article", { class: `chapter${wide ? " chapter-wide" : ""}${ch.media ? "" : " chapter-text"}`, id: ch.id || null },
    el("div", { class: "stamp", style: `--r:${[-8, 6, -4, 9, -6, 5, -9, 7, -5][i % 9]}deg` },
      el("span", { class: "stamp-top" }, ch.stamp), el("span", { class: "stamp-year" }, t(ch.year))),
    el("div", { class: "ch-copy" },
      el("p", { class: "ch-place" }, t(ch.place)),
      el("h3", { class: "ch-title" }, t(ch.title)),
      el("p", { class: "ch-text" }, t(ch.text)),
      links),
    media(ch.media));
}

function route(c) {
  return el("section", { class: "route", id: "route", "aria-label": UI.route },
    el("h2", { class: "sr-only" }, UI.route),
    el("div", { class: "route-line", "aria-hidden": "true" }, el("span", { class: "route-fill" }), el("span", { class: "route-plane" }, "✈")),
    c.chapters.map(chapter));
}

function about(c) {
  const m = c.me;
  return el("section", { class: "about", id: "about" },
    el("h2", { class: "sec-h" }, t(m.title)),
    el("blockquote", { class: "quote" }, t(m.quote)),
    el("div", { class: "about-grid" },
      el("div", {}, el("h3", { class: "mini-h" }, UI.traits),
        el("ul", { class: "traits" }, m.traits.map((x) => el("li", {}, el("span", { class: "ico", "aria-hidden": "true" }, x.icon), t(x.text))))),
      el("div", {}, el("h3", { class: "mini-h" }, UI.skills),
        el("div", { class: "skills" }, m.skills.map((g) => el("div", { class: "skill-group" }, el("span", { class: "skill-h" }, t(g.group)), el("div", { class: "chips" }, g.items.map((s) => el("span", { class: "chip" }, s)))))))));
}

function contact(c) {
  const email = `${c.contact.emailUser}@${c.contact.emailDomain}`;
  return el("section", { class: "contact", id: "contact" },
    el("h2", { class: "contact-h" }, UI.contactH, el("span", { class: "dot" }, ".")),
    el("p", { class: "contact-p" }, UI.contactP),
    el("div", { class: "contact-btns" },
      el("button", { type: "button", class: "btn btn-solid btn-big", onclick: () => copyEmail(email) }, UI.copy, " ⧉"),
      contactButtons(c, false).slice(1)),
    el("p", { class: "foot" }, `© ${new Date().getFullYear()} ${c.profile.name} · ${t(c.footer)}`));
}

function copyEmail(email) {
  const toast = document.getElementById("toast");
  const done = () => { toast.textContent = UI.copied; toast.classList.add("on"); setTimeout(() => toast.classList.remove("on"), 2400); };
  if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, () => (location.href = "mailto:" + email));
  else location.href = "mailto:" + email;
}

function showError(err, text) {
  let where = "";
  const m = /position (\d+)/.exec(err.message) || /line (\d+)/.exec(err.message);
  if (m && text) {
    const pos = err.message.includes("position") ? Number(m[1]) : null;
    const line = pos != null ? text.slice(0, pos).split("\n").length : Number(m[1]);
    where = `content.json — line ${line}`;
  }
  app.replaceChildren(el("div", { class: "error-box", role: "alert" }, el("h1", {}, UI.errorH), el("p", {}, UI.errorP), el("code", {}, where || err.message)));
}

// ---------- motion ----------
function motion() {
  // reveal on scroll
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".chapter, .about, .contact, .quote, .traits li").forEach((n) => io.observe(n));

  // videos play only while visible
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { v.muted = true; v.preload = "auto"; v.play()?.catch?.(() => {}); } else v.pause();
  }), { threshold: 0.35 });
  if (!reduce) document.querySelectorAll("video").forEach((v) => vio.observe(v));

  // route line fills and the plane follows your scroll
  const routeEl = document.querySelector(".route");
  const fill = document.querySelector(".route-fill"), plane = document.querySelector(".route-plane");
  const toTop = document.getElementById("to-top");
  const onScroll = () => {
    const r = routeEl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.55 - r.top) / r.height));
    fill.style.transform = `scaleY(${p})`;
    plane.style.top = `${p * 100}%`;
    toTop.classList.toggle("on", scrollY > innerHeight);
    document.querySelector(".top").classList.toggle("scrolled", scrollY > 10);
  };
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
}

// ---------- boot ----------
fetch(root + "content.json", { cache: "no-cache" })
  .then((r) => r.text())
  .then((text) => {
    let c;
    try { c = JSON.parse(text); } catch (err) { showError(err, text); return; }
    document.title = `${c.profile.name} — ${t(c.pass.role)}`;
    app.replaceChildren(header(c), el("main", {}, hero(c), route(c), about(c), contact(c)));
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
    motion();
  })
  .catch((err) => showError(err));
