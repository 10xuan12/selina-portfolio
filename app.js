// Selina Huang — portfolio. Everything visible comes from content.json; this file only draws it.
// Content is inserted as text (never as HTML), so nothing in content.json can run code.

const root = document.body.dataset.root || "";
const lang = document.documentElement.lang.toLowerCase().startsWith("zh") ? "zh" : "en";
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const app = document.getElementById("app");

const UI = {
  zh: {
    nav: ["關於", "作品", "聯絡"], resume: "履歷", work: "作品", seeWork: "看作品", contact: "聯絡我",
    about: "關於我", traits: "個性", skills: "技能", exp: "經歷", problem: "問題", did: "我做了什麼", result: "結果",
    role: "我的角色", talk: "面試可以問我", copy: "複製 Email", copied: "已複製 Email，等你來信。", scroll: "往下",
    badge: "開放遠端工作 ✦ 全端工程師 ✦ ", errorH: "content.json 格式有錯",
    errorP: "網站讀不到內容。請檢查這附近有沒有少了逗號、引號或括號：",
  },
  en: {
    nav: ["About", "Work", "Contact"], resume: "Résumé", work: "Selected work", seeWork: "See my work", contact: "Contact me",
    about: "About", traits: "Personality", skills: "Skills", exp: "Experience", problem: "Problem", did: "What I did", result: "Result",
    role: "My role", talk: "Ask me about", copy: "Copy email", copied: "Email copied — talk soon.", scroll: "Scroll",
    badge: "OPEN TO REMOTE ✦ FULL-STACK ✦ ", errorH: "content.json has a formatting error",
    errorP: "The site couldn’t read its content. Check near here for a missing comma, quote or bracket:",
  },
}[lang];

// ---------- helpers ----------
const t = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v[lang] ?? v.en ?? v.zh ?? "" : v ?? "");
const asset = (p) => (/^(https?:|mailto:|#)/.test(p) ? p : root + p);
const safeUrl = (u) => (/^(https?:\/\/|mailto:|#|[\w./-]+$)/i.test(u) ? asset(u) : "#");
const ext = (url) => (/^https?:/.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {});
function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === "class") n.className = v;
    else if (k === "href" || k === "src" || k === "poster") n.setAttribute(k, k === "href" ? safeUrl(v) : asset(v));
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false && k !== "") n.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return n;
}
// split a heading into lines/words that rise in one by one
function riseText(text, cls) {
  const parts = lang === "zh" ? text.match(/[^，、。！？]+[，、。！？]?/g) || [text] : text.split(" ");
  return el("span", { class: cls }, parts.flatMap((p, i) => [el("span", { class: "rw" }, el("span", { style: `--i:${i}` }, p)), lang === "zh" ? "" : " "]));
}

// ---------- sections ----------
function header(c) {
  const other = lang === "zh" ? { href: "../", label: "EN", hl: "en", aria: "Switch to English" } : { href: "zh/", label: "中", hl: "zh-Hant", aria: "切換為中文" };
  const resume = c.profile.resume ? el("a", { class: "nav-resume", href: c.profile.resume, ...ext(c.profile.resume) }, UI.resume, " ↓") : null;
  return el("header", { class: "top" },
    el("a", { class: "brand", href: "#top" }, c.profile.name),
    el("nav", { class: "nav", "aria-label": "Main" },
      el("a", { href: "#about" }, UI.nav[0]), el("a", { href: "#work" }, UI.nav[1]), el("a", { href: "#contact" }, UI.nav[2]), resume),
    el("a", { class: "lang", href: other.href, hreflang: other.hl, "aria-label": other.aria }, other.label));
}

function hero(c) {
  const p = c.profile;
  // circular "open to remote" badge: fixed SVG markup, label set as text
  const ring = el("div", { class: "badge", "aria-hidden": "true" });
  ring.innerHTML = '<svg viewBox="0 0 120 120"><defs><path id="badge-c" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><text><textPath href="#badge-c" textLength="286" lengthAdjust="spacing"></textPath></text></svg><span class="badge-core">✦</span>';
  ring.querySelector("textPath").textContent = UI.badge;
  return el("section", { class: "hero", id: "top" },
    el("div", { class: "hero-copy" },
      el("p", { class: "eyebrow" }, el("i", { "aria-hidden": "true" }), `${t(p.role)} · ${t(p.location)}`),
      el("h1", { class: "hero-h" }, riseText(t(p.tagline), "hero-lines")),
      el("p", { class: "hero-sub" }, t(p.intro)),
      el("div", { class: "hero-cta" },
        el("a", { class: "btn btn-wine", href: "#work" }, UI.seeWork, " →"),
        el("a", { class: "btn", href: "#contact" }, UI.contact))),
    el("figure", { class: "hero-photo" },
      el("img", { src: p.heroPhoto, alt: p.name, width: 760, height: 1014 }),
      ring,
      el("figcaption", {}, el("span", {}, p.name), el("span", {}, p.nameZh))),
    el("a", { class: "scroll-cue", href: "#about", "aria-label": UI.scroll }, el("span", {}, UI.scroll), el("i", { "aria-hidden": "true" })));
}

function about(c) {
  const a = c.about;
  const polaroids = a.offTheClock?.photos?.length
    ? el("div", { class: "off" }, el("h3", { class: "label" }, t(a.offTheClock.title)),
        el("div", { class: "off-row" }, a.offTheClock.photos.map((ph, i) => el("figure", { class: "polaroid", style: `--r:${[-4, 3, -2, 4][i % 4]}deg` },
          el("img", { src: ph.src, alt: t(ph.caption), loading: "lazy", width: 600, height: 800 }), el("figcaption", {}, t(ph.caption))))))
    : null;
  return el("section", { class: "about", id: "about" },
    el("h2", { class: "sec-num" }, "01 — ", UI.about),
    el("blockquote", { class: "statement reveal" }, t(a.statement)),
    el("div", { class: "about-grid" },
      el("figure", { class: "about-photo reveal" }, el("img", { src: c.profile.photo, alt: c.profile.name, loading: "lazy", width: 600, height: 769 })),
      el("div", { class: "about-body" },
        el("p", { class: "bio reveal" }, t(a.bio)),
        el("h3", { class: "label" }, UI.traits),
        el("ul", { class: "traits reveal" }, a.traits.map((x) => el("li", {}, t(x)))),
        el("h3", { class: "label" }, UI.skills),
        el("div", { class: "skills reveal" }, a.skills.map((g) => el("div", { class: "skill-row" }, el("span", { class: "skill-h" }, t(g.group)), el("span", { class: "skill-list" }, g.items.join(" · "))))),
        el("h3", { class: "label" }, UI.exp),
        el("ol", { class: "exp reveal" }, a.experience.map((x) => el("li", {}, el("span", { class: "exp-y" }, x.years), el("span", { class: "exp-t" }, t(x.title)), el("span", { class: "exp-o" }, t(x.org))))))),
    polaroids);
}

function projMedia(m) {
  if (m.type === "video") return el("div", { class: "screen" },
    el("video", { src: m.src, poster: m.poster, muted: true, loop: true, playsinline: true, preload: "none", "aria-label": t(m.alt) }));
  return el("img", { src: t(m.src), alt: t(m.alt), loading: "lazy" });
}

function project(pj, i) {
  // collapsible: a compact row you can scan, details open on tap
  return el("details", { class: "project reveal", id: pj.id },
    el("summary", { class: "proj-sum" },
      el("span", { class: "proj-n" }, String(i + 1).padStart(2, "0")),
      el("span", { class: "proj-head" },
        el("span", { class: "proj-title" }, t(pj.title)),
        el("span", { class: "proj-line" }, t(pj.did))),
      el("span", { class: "proj-meta" }, `${t(pj.kind)} · ${pj.year}`),
      el("span", { class: "proj-toggle", "aria-hidden": "true" })),
    el("div", { class: "proj-body" },
      el("div", { class: `proj-media media-${pj.media.type}` }, projMedia(pj.media)),
      el("div", { class: "proj-copy" },
        el("dl", { class: "proj-facts" },
          el("div", {}, el("dt", {}, UI.problem), el("dd", {}, t(pj.problem))),
          el("div", {}, el("dt", {}, UI.did), el("dd", {}, t(pj.did))),
          el("div", {}, el("dt", {}, UI.result), el("dd", {}, t(pj.result)))),
        el("p", { class: "proj-role" }, el("b", {}, UI.role), " ", t(pj.role)),
        el("p", { class: "proj-talk" }, el("span", {}, UI.talk), " ", t(pj.talk), " →"),
        el("p", { class: "proj-stack" }, pj.stack.join(" · ")),
        pj.links?.length ? el("div", { class: "proj-links" }, pj.links.map((l, k) => el("a", { class: k ? "btn" : "btn btn-wine", href: l.url, ...ext(l.url) }, t(l.label), " ↗"))) : null)));
}

function work(c) {
  return el("section", { class: "work", id: "work" },
    el("h2", { class: "sec-num" }, "02 — ", UI.work),
    c.projects.map(project));
}

function contact(c) {
  const k = c.contact, email = `${k.emailUser}@${k.emailDomain}`;
  return el("section", { class: "contact", id: "contact" },
    el("h2", { class: "sec-num" }, "03 — ", UI.nav[2]),
    el("h2", { class: "contact-h" }, riseText(t(k.title), "contact-lines"), el("span", { class: "dot" }, lang === "zh" ? "" : ".")),
    el("p", { class: "contact-p" }, t(k.text)),
    el("div", { class: "contact-links" },
      el("button", { type: "button", class: "btn btn-cream", onclick: () => copyEmail(email) }, UI.copy, " ⧉"),
      el("a", { class: "btn btn-line", href: "mailto:" + email }, "Email"),
      el("a", { class: "btn btn-line", href: k.linkedin, ...ext(k.linkedin) }, "LinkedIn"),
      el("a", { class: "btn btn-line", href: k.github, ...ext(k.github) }, "GitHub")),
    el("footer", { class: "foot" }, el("span", {}, `© ${new Date().getFullYear()} ${c.profile.name}`), el("span", {}, t(c.footer))));
}

function copyEmail(email) {
  const toast = document.getElementById("toast");
  const done = () => { toast.textContent = UI.copied; toast.classList.add("on"); setTimeout(() => toast.classList.remove("on"), 2400); };
  if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, () => (location.href = "mailto:" + email));
  else location.href = "mailto:" + email;
}

function showError(err, text) {
  let where = err.message;
  const m = /position (\d+)/.exec(err.message);
  if (m && text) where = `content.json — line ${text.slice(0, Number(m[1])).split("\n").length}`;
  app.replaceChildren(el("div", { class: "error-box", role: "alert" }, el("h1", {}, UI.errorH), el("p", {}, UI.errorP), el("code", {}, where)));
}

// ---------- motion ----------
function motion() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal, .contact").forEach((n) => io.observe(n));

  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { v.muted = true; v.preload = "auto"; v.play()?.catch?.(() => {}); } else v.pause();
  }), { threshold: 0.35 });
  if (!reduce) document.querySelectorAll("video").forEach((v) => vio.observe(v));

  const top = document.querySelector(".top"), photo = document.querySelector(".hero-photo img");
  const onScroll = () => {
    top.classList.toggle("scrolled", scrollY > 10);
    document.getElementById("to-top").classList.toggle("on", scrollY > innerHeight);
    if (!reduce && photo && scrollY < innerHeight) photo.style.transform = `scale(1.08) translateY(${scrollY * 0.06}px)`;
  };
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
}

// ---------- boot ----------
fetch(root + "content.json", { cache: "no-cache" })
  .then((r) => r.text())
  .then((text) => {
    let c;
    try { c = JSON.parse(text); } catch (err) { showError(err, text); return; }
    document.title = `${c.profile.name} — ${t(c.profile.role)}`;
    app.replaceChildren(header(c), el("main", {}, hero(c), about(c), work(c), contact(c)));
    const openHash = () => { const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null; if (target?.tagName === "DETAILS") target.open = true; target?.scrollIntoView(); };
    openHash();
    addEventListener("hashchange", openHash);
    requestAnimationFrame(() => document.body.classList.add("ready"));
    motion();
  })
  .catch((err) => {
    // only a network problem lands here; never blank a page that already rendered
    console.error(err);
    if (!document.querySelector("main")) showError(err);
  });
