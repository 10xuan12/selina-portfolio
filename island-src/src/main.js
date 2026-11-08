import { L } from "./i18n.js";
import "./style.css";
import "./exhibits.css";
import { mountExhibit } from "./exhibits.js";
import { categories, themes, profile } from "./content.js";
import { escapeHTML } from "./schema.js";
import { createIsland } from "./island.js";
import { ForestAudio } from "./audio.js";
const $ = (id) => document.getElementById(id),
  visited = new Set(),
  audio = new ForestAudio();
let island,
  active = -1,
  started = false,
  toastTimer,
  webglFailed = false;
document.title = `${profile.title} · ${L("全端工程師作品集", "Full-stack developer portfolio")}`;
const brand = document.querySelector('.brand > span:last-child');
if (brand) brand.innerHTML = `${escapeHTML(profile.title)}<small>${escapeHTML(profile.subtitle || 'A WORLD OF CURIOSITY')}</small>`;
document.querySelector('.welcome h1').innerHTML = `${L('歡迎來到', 'Welcome to')}<br /><span>${escapeHTML(profile.title)}<span class="title-dot">${L('。', '.')}</span></span>`;
document.querySelector('.welcome-story').textContent = profile.intro || L(`你好，我是${profile.name}。歡迎來看看我的作品與經歷。`, `Hi, I’m ${profile.name}. Come see my work.`);
document.querySelector('meta[name="description"]').content = profile.intro || L(`${profile.name}的個人作品集`, `${profile.name}’s portfolio`);
$("world").setAttribute('aria-label', L(`${profile.title}三維場景`, `${profile.title}, 3D scene`));
$("camp-total").textContent = String(categories.length).padStart(2,'0');
$("channel").hidden = !profile.links.length;
if(profile.links.length) $("channel").textContent = `${profile.links[0].label} ↗`;
categories.forEach((c, i) => {
  const label = document.createElement("button");
  label.className = "camp-label";
  label.dataset.camp = i;
  label.setAttribute("aria-label", L(`走向${c.name}`, `Walk to ${c.name}`));
  label.innerHTML = `<span>${c.number}</span>${escapeHTML(c.short)}<i></i>`;
  $("camp-labels").append(label);
  const nav = document.createElement("button");
  nav.dataset.camp = i;
  nav.innerHTML = `<span>${c.number}</span>${escapeHTML(c.name)}`;
  nav.setAttribute("aria-label", L(`前往${c.name}`, `Go to ${c.name}`));
  $("category-nav").append(nav);
  const dot = document.createElement("button");
  dot.className = "map-site";
  dot.dataset.camp = i;
  dot.style.left = `${50 + (c.arrival[0] / 28) * 100}%`;
  dot.style.top = `${50 + (c.arrival[1] / 28) * 100}%`;
  dot.setAttribute("aria-label", L(`地圖：${c.name}`, `Map: ${c.name}`));
  $("map-sites").append(dot);
});
function toast(text) {
  clearTimeout(toastTimer);
  $("toast").textContent = text;
  $("toast").hidden = false;
  toastTimer = setTimeout(() => ($("toast").hidden = true), 3600);
}
function begin() {
  started = true;
  document.body.classList.add("exploring");
  $("welcome").setAttribute("inert", "");
  $("walk-status").textContent = L("點選地面行走 · 拖動環顧 · 走近微光發現故事", "Tap the ground to walk · drag to look around · find the glowing spots");
}
function closeWork() {
  active = -1;
  $("work").hidden = true;
  document.body.classList.remove("panel-open");
  document
    .querySelectorAll("#category-nav button")
    .forEach((b) => b.classList.remove("active"));
}
function openWork(i) {
  const c = categories[i];
  begin();
  active = i;
  visited.add(i);
  $("work").hidden = false;
  document.body.classList.add("panel-open");
  $("panel-number").textContent = c.number;
  $("panel-english").textContent = c.english;
  $("panel-category").textContent = `FIELD NOTES / ${c.number}`;
  $("work-title").textContent = c.name;
  $("work-intro").textContent = c.intro;
  $("work-description").textContent = c.description;
  mountExhibit($("work-sections"), c.id);
  $("work").scrollTop = 0;
  $("visited-count").textContent = String(visited.size).padStart(2, "0");
  document.querySelectorAll("[data-camp]").forEach((b) => {
    const idx = Number(b.dataset.camp);
    b.classList.toggle("visited", visited.has(idx));
    b.classList.toggle("active", idx === i);
  });
  $("walk-status").textContent = L(`已抵達 · ${c.short}`, `Arrived · ${c.short}`);
}
function navigate(i) {
  begin();
  closeWork();
  if (webglFailed) {
    openWork(i);
    return;
  }
  island?.travelTo(i);
  $("walk-status").textContent = L(`正在走向 · ${categories[i].short}`, `Walking to · ${categories[i].short}`);
}
document
  .querySelectorAll("[data-camp]")
  .forEach((b) =>
    b.addEventListener("click", () => navigate(Number(b.dataset.camp))),
  );
$("explore").addEventListener("click", begin);
$("close-work").addEventListener("click", closeWork);
$("continue").addEventListener("click", closeWork);
$("overview").addEventListener("click", () => {
  closeWork();
  island?.overview();
  $("walk-status").textContent = L(`全島視角 · ${categories.length} 個營地，隨心出發`, `Island view · ${categories.length} camps, go anywhere`);
});
$("home").addEventListener("click", () => {
  closeWork();
  island?.stop();
  island?.overview();
  started = false;
  document.body.classList.remove("exploring");
  $("welcome").removeAttribute("inert");
});
$("channel").addEventListener("click", () => { const link = profile.links[0]; if(link) window.open(link.url,"_blank","noopener,noreferrer"); });
const help = $("help-dialog");
$("help").addEventListener("click", () => {
  island?.stop();
  help.showModal();
});
$("close-help").addEventListener("click", () => help.close());
$("help-done").addEventListener("click", () => help.close());
help.addEventListener("click", (e) => {
  if (e.target === help) {
    const r = help.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      help.close();
  }
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !help.open && !$("evidence-dialog").open)
    closeWork();
});
document.querySelectorAll(".theme-picker button").forEach((b) =>
  b.addEventListener("click", () => {
    const id = b.dataset.theme;
    document.body.dataset.theme = id;
    document.documentElement.style.setProperty("--accent", themes[id].accent);
    document
      .querySelectorAll(".theme-picker button")
      .forEach((btn) => btn.setAttribute("aria-pressed", String(btn === b)));
    $("theme-english").textContent = themes[id].english;
    $("theme-caption").textContent = themes[id].caption;
    const art = $("panel-art");
    const drawings = {
      forest:
        '<path d="m38 98 74-75 76 75H38Zm74-75v75m0-47-30 47m30-47 28 47M27 99h178"/><circle cx="184" cy="30" r="12"/>',
      home:
        '<path d="M60 98V58l50-34 50 34v40H60Zm40 0V72h20v26M28 98h186"/><path d="M178 40c-6-8-18-2-12 8l12 12 12-12c6-10-6-16-12-8Z"/>',
      ocean:
        '<path d="M12 84q18-12 36 0t36 0t36 0t36 0t36 0t36 0M12 104q18-12 36 0t36 0t36 0t36 0t36 0t36 0M91 65l20-17-20-17q49-24 72 17-23 39-72 17Z"/><circle cx="147" cy="45" r="2"/><circle cx="187" cy="22" r="5"/>',
    };
    art.innerHTML = `<g stroke="currentColor" stroke-width="1.5" fill="none">${drawings[id]}</g>`;
    island?.setTheme(id);
    audio.setNight(id === "ocean");
  }),
);
$("sound").addEventListener("click", async () => {
  try {
    const enabled = await audio.toggle();
    $("sound").setAttribute("aria-pressed", String(enabled));
    $("sound").setAttribute(
      "aria-label",
      enabled ? L("關閉環境音", "Turn sound off") : L("開啟環境音", "Turn sound on"),
    );
    $("sound-waves").setAttribute(
      "d",
      enabled ? "M15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14" : "m16 9 5 6m0-6-5 6",
    );
  } catch {
    toast(L("當前瀏覽器暫時無法播放環境音。", "This browser can’t play the ambient sound right now."));
  }
});
document.addEventListener("visibilitychange", () => {
  if (audio.context) {
    if (document.hidden) audio.context.suspend();
    else if (audio.enabled) audio.context.resume();
  }
});
document.querySelectorAll(".touch-pad button").forEach((b) => {
  const [x, z] = b.dataset.dir.split(",").map(Number);
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    begin();
    island?.setTouchDirection(x, z);
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(event, () => island?.setTouchDirection(0, 0));
});
try {
  island = createIsland($("world"), {
    onReady: () => {
      $("loading").classList.add("loaded");
      setTimeout(() => ($("loading").hidden = true), 800);
    },
    onArrive: openWork,
    onLeave: () => {
      if (active >= 0) closeWork();
    },
    onMove: () => {
      begin();
      closeWork();
    },
    onBoundary: toast,
  });
} catch (error) {
  console.error(error);
  webglFailed = true;
  $("loading").hidden = true;
  $("fallback").hidden = false;
  $("camp-labels").hidden = true;
}
