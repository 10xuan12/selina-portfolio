import { categories, profile } from './content.js';
import { escapeHTML as h, safeUrl } from './schema.js';
const states = new Map();
let current;
const links = (items=[]) => items.filter(l=>safeUrl(l.url)).map(l=>`<a class="action-link" href="${h(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer">${h(l.label||'檢視連結')} ↗</a>`).join('');
const metrics = (items=[]) => items.length ? `<div class="ex-metrics">${items.map(m=>`<div><strong>${h(m.value)}</strong><span>${h(m.label)}</span></div>`).join('')}</div>` : '';
const asset = (src='') => src.startsWith('/') ? (import.meta.env?.BASE_URL ?? '/') + src.slice(1) : src;
const itemLinks = (item, fallback) => item.links?.length ? item.links : (item.url ? [{url:item.url,label:fallback}] : []);
const picture = (item,cls='') => item.image ? `<button class="evidence ${cls}" data-photo="${h(asset(item.image))}" data-caption="${h(item.alt||item.title)}" aria-label="放大：${h(item.alt||item.title)}"><img src="${h(asset(item.image))}" alt="${h(item.alt||item.title)}" loading="lazy"/><span class="zoom-hint">檢視原圖 ↗</span></button>` : '';
const fold = (title,text) => text ? `<details class="field-fold"><summary>${h(title)} <span>＋</span></summary><p>${h(text)}</p></details>` : '';
function choices(items,scope,selected,cls='choice-strip') {
 return `<div class="${cls}" aria-label="${scope==='item'?'選擇作品':'選擇章節'}">${items.map((label,i)=>`<button data-pick="${scope}" data-index="${i}" aria-pressed="${i===selected}">${label}</button>`).join('')}</div>`;
}
export function mountExhibit(host,id) {
 const module=categories.find(c=>c.id===id);
 if(!module) return;
 current={host,id};
 if (!module.items.length) {
  host.innerHTML='<article class="award-card story-enter"><h3>暫無展示內容</h3></article>';
  return;
 }
 if(!states.has(id)) states.set(id,{item:0,chapter:0});
 const s=states.get(id), item=module.items[s.item], chapters=item.chapters||[];
 let view='';
 const intro=`${metrics(module.metrics)}<div class="account-links">${links(module.links)}</div>`;
 if(module.kind==='gallery') {
  view=choices(module.items.map((v,i)=>`${String(i+1).padStart(2,'0')} · ${h(v.title)}`),'item',s.item)+
  `<article class="screening story-enter ${item.image?'':'text-only'}">${picture(item,'poster')}<div class="screening-copy"><span class="tiny-label">${h(item.kicker)}</span><h3>${h(item.title)}</h3><p>${h(item.summary)}</p>${metrics(item.metrics)}${links(itemLinks(item,'檢視作品'))}</div></article>`;
 } else if(module.kind==='awards') {
  view=choices(module.items.map((v,i)=>`<span class="medal">${h(v.rank||String(i+1).padStart(2,'0'))}</span><span>${h(v.title)}</span>`),'item',s.item,'medal-shelf')+
  `<article class="award-card story-enter"><div class="award-heading"><div><span class="tiny-label">${h(item.kicker)}</span><h3>${h(item.title)}</h3></div>${item.result?`<strong>${h(item.result)}</strong>`:''}</div>${picture(item,'award-photo')}<p class="photo-caption">${h(item.summary)}</p>${metrics(item.metrics)}${links(itemLinks(item,'檢視活動或作品'))}</article>`;
 } else {
  view=module.timeline?.length?`<details class="career-fold"><summary>檢視經歷時間線 ＋</summary><div class="career-timeline">${module.timeline.map(t=>`<article><small>${h(t.period)}</small><h4>${h(t.title)}</h4><p>${h(t.text)}</p></article>`).join('')}</div></details>`:'';
  if(module.items.length>1) view+=choices(module.items.map(v=>h(v.title)),'item',s.item);
  view+=`<div class="${module.kind==='research'?'journal-cover':'project-cover'}"><div><span class="tiny-label">${h(item.kicker)}</span><h3>${h(item.title)}</h3><p>${h(item.summary)}</p>${metrics(item.metrics)}</div></div>`;
  view+=choices(chapters.map((c,i)=>`<b>${String(i+1).padStart(2,'0')}</b>${h(c.title)}`),'chapter',s.chapter,'step-path');
  const ch=chapters[s.chapter];
  view+=`<article class="${module.kind==='research'?'research-leaf':'case-step'} story-enter"><span class="tiny-label">CHAPTER ${s.chapter+1} / ${chapters.length}</span><h3>${h(ch.title)}</h3><p>${h(ch.text)}</p></article><div class="case-footer"><span>${s.chapter+1} / ${chapters.length}</span>${s.chapter<chapters.length-1?'<button data-next>繼續閱讀 →</button>':'<span>✓ 已讀完這條路徑</span>'}</div>${picture(item,'award-photo')}<div class="paper-links">${links(itemLinks(item,'檢視原文 / 作品'))}</div>`;
 }
 host.innerHTML=intro+view+fold('開啟復盤筆記',item.reflection)+(item.sourceNote?`<p class="source-note">${h(item.sourceNote)}</p>`:'')+(profile.links.length?`<div class="conversation-card"><b>繼續認識${h(profile.name)}</b><div class="project-contact-links">${links(profile.links)}</div></div>`:'');
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-pick]');
 if(b&&current){
  const s=states.get(current.id),scope=b.dataset.pick;s[scope]=Number(b.dataset.index);if(scope==='item')s.chapter=0;
  const scroll=document.getElementById('work').scrollTop;
  mountExhibit(current.host,current.id);
  current.host.querySelector(`[data-pick="${scope}"][data-index="${s[scope]}"]`)?.focus({preventScroll:true});
  document.getElementById('work').scrollTop=scroll;
 }
 if(e.target.closest('[data-next]')&&current){const s=states.get(current.id);s.chapter++;mountExhibit(current.host,current.id);current.host.querySelector(`[data-pick="chapter"][data-index="${s.chapter}"]`)?.focus({preventScroll:true});}
 const photo=e.target.closest('[data-photo]');
 if(photo){const d=document.getElementById('evidence-dialog');d.querySelector('img').src=photo.dataset.photo;d.querySelector('img').alt=photo.dataset.caption;d.querySelector('p').textContent=photo.dataset.caption;d.showModal();}
});
const evidence=document.getElementById('evidence-dialog');
document.getElementById('close-evidence').addEventListener('click',()=>evidence.close());
evidence.addEventListener('click',e=>{if(e.target===evidence)evidence.close();});
evidence.addEventListener('keydown',e=>{if(e.key==='Escape')e.stopPropagation();});
