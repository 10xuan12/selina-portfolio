// Single source of truth for the WhatsApp number.
const WHATSAPP_NUMBER = '886965418312';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const introSeen = root.classList.contains('intro-seen');
  const introDelay = introSeen || reduce ? 0 : 1350;

  /* ---------- Intro curtain ---------- */
  const curtain = document.getElementById('om-curtain');
  if (introSeen || reduce) {
    root.classList.add('intro-done');
    if (curtain) curtain.remove();
  } else {
    setTimeout(() => curtain && curtain.remove(), 2600);
    setTimeout(() => root.classList.add('intro-done'), 3200);
  }

  /* ---------- Header + mobile nav ---------- */
  const header = document.getElementById('site-header');
  const onScrollHeader = () => header && header.classList.toggle('is-scrolled', window.scrollY > 10);
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (navToggle && nav) {
    const close = () => { nav.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false'); };
    navToggle.addEventListener('click', () => navToggle.setAttribute('aria-expanded', String(nav.classList.toggle('is-open'))));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  const wa = document.getElementById('whatsapp-link');
  if (wa) wa.href = `https://wa.me/${WHATSAPP_NUMBER}`;

  /* ---------- Local time (Taichung) ---------- */
  const clock = document.getElementById('local-time');
  if (clock) {
    const tick = () => {
      clock.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Taipei' }).format(new Date());
    };
    tick(); setInterval(tick, 20000);
  }

  /* ---------- Split headings into words (word-rise reveal) ---------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const text = el.textContent;
    const isCJK = /[㐀-鿿]/.test(text);
    const parts = isCJK ? [...text] : text.split(' ');
    el.innerHTML = parts.map((w, i) => `<span class="w"><span style="transition-delay:${i * 60}ms">${w}</span></span>`).join(isCJK ? '' : ' ');
  });

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  }
  const contact = document.getElementById('contact');
  if (contact) {
    if (reduce || !('IntersectionObserver' in window)) contact.classList.add('in-view');
    else new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { contact.classList.add('in-view'); o.disconnect(); } }), { threshold: 0.2 }).observe(contact);
  }

  /* ---------- Decrypting headline (name) ---------- */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+=<>/01';
  const scramble = (el, delay) => {
    const final = el.dataset.text;
    let frame = 0;
    const total = 22;
    setTimeout(() => {
      const id = setInterval(() => {
        frame++;
        let out = '';
        for (let i = 0; i < final.length; i++) {
          const settleAt = Math.floor((i / final.length) * total * 0.7) + 6;
          out += frame >= settleAt ? final[i] : `<span class="ch-x">${GLYPHS[Math.floor(Math.random() * GLYPHS.length)]}</span>`;
        }
        el.innerHTML = out;
        if (frame >= total) { clearInterval(id); el.textContent = final; }
      }, 45);
    }, delay);
  };
  if (!reduce) {
    document.querySelectorAll('.scramble').forEach((el, i) => {
      scramble(el, introDelay + 150 + i * 180);
      if (fine) el.addEventListener('mouseenter', () => scramble(el, 0));
    });
  }

  /* ---------- Rewriting headline: "I build ___" ---------- */
  const typer = document.getElementById('typer');
  if (typer && !reduce) {
    const words = typer.dataset.words.split('|');
    let w = 0, shown = words[0];
    const type = () => {
      const target = words[w];
      if (shown === target) { setTimeout(erase, 1800); return; }
      shown = target.slice(0, shown.length + 1);
      typer.textContent = shown;
      setTimeout(type, 60);
    };
    const erase = () => {
      if (!shown.length) { w = (w + 1) % words.length; setTimeout(type, 220); return; }
      shown = shown.slice(0, -1);
      typer.textContent = shown;
      setTimeout(erase, 30);
    };
    setTimeout(erase, introDelay + 2600);
  }

  /* ---------- Hero: interactive dot grid + cursor glow ---------- */
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('hero-canvas');
  if (hero && canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const GAP = 28;
    let W = 0, H = 0, mx = -9999, my = -9999, t = 0, running = true;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', () => { resize(); if (reduce) draw(); });
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      hero.style.setProperty('--mx', `${mx}px`);
      hero.style.setProperty('--my', `${my}px`);
    });
    hero.addEventListener('pointerleave', () => { mx = my = -9999; });
    const draw = () => {
      if (!running) return;
      t += 0.012;
      ctx.clearRect(0, 0, W, H);
      for (let y = GAP / 2; y < H; y += GAP) {
        for (let x = GAP / 2; x < W; x += GAP) {
          const wave = Math.sin(x * 0.012 + t * 2) * Math.cos(y * 0.014 - t * 1.4);
          const dx = x - mx, dy = y - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          const near = Math.max(0, 1 - d / 180);
          const push = near * 14;
          const px = x + (d ? (dx / d) * push : 0);
          const py = y + (d ? (dy / d) * push : 0) + wave * 3;
          const r = 0.9 + near * 1.8 + (wave + 1) * 0.25;
          const a = 0.1 + (wave + 1) * 0.07 + near * 0.75;
          ctx.fillStyle = near > 0.05 ? `rgba(255,120,138,${a})` : `rgba(255,255,255,${a})`;
          ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    draw();
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(([e]) => {
        const was = running; running = e.isIntersecting;
        if (running && !was) requestAnimationFrame(draw);
      }).observe(hero);
    }
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const inner = btn.firstElementChild;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
        if (inner) inner.style.transform = `translate(${dx * 0.1}px, ${dy * 0.12}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; if (inner) inner.style.transform = ''; });
    });
  }

  /* ---------- Keynote scroll paragraph ---------- */
  const keynote = document.getElementById('keynote');
  if (keynote && !reduce) {
    const words = [...keynote.querySelectorAll('.kw')];
    const paint = () => {
      const r = keynote.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85, end = vh * 0.4;
      const p = Math.min(1, Math.max(0, (start - r.top) / ((start - end) + r.height)));
      const lit = Math.round(p * words.length);
      words.forEach((el, i) => el.classList.toggle('lit', i < lit));
    };
    paint();
    window.addEventListener('scroll', paint, { passive: true });
  }

  /* ---------- Count-up numbers ---------- */
  const nums = document.querySelectorAll('.stat-num[data-count]');
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el = entry.target, raw = el.dataset.count;
        const target = parseInt(raw, 10), suffix = raw.replace(/^[0-9]+/, '');
        const t0 = performance.now();
        const frame = (now) => {
          const k = Math.min(1, (now - t0) / 1400);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + (k === 1 ? suffix : '');
          if (k < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.5 });
    nums.forEach((n) => { n.textContent = '0'; io.observe(n); });
  }

  /* ---------- Process steps light up in order ---------- */
  const steps = [...document.querySelectorAll('#steps li')];
  if (steps.length && !reduce) {
    let s = 0;
    setInterval(() => {
      steps.forEach((li, k) => { li.classList.toggle('on', k === s); li.classList.toggle('past', k < s); });
      s = (s + 1) % (steps.length + 2);
    }, 900);
  }

  /* ---------- Work cards: stack + shrink, spotlight, 3D tilt ---------- */
  const cards = [...document.querySelectorAll('.card')];
  if (cards.length && !reduce) {
    const stack = () => {
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const nr = next.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        const k = Math.min(1, Math.max(0, 1 - (nr.top - cr.top) / cr.height));
        card.style.transform = `scale(${1 - k * 0.06})`;
        card.style.filter = `brightness(${1 - k * 0.45})`;
      });
    };
    stack();
    window.addEventListener('scroll', stack, { passive: true });
  }
  if (fine && !reduce) {
    document.querySelectorAll('.card-inner').forEach((inner) => {
      const vis = inner.querySelector('.phone, .shot');
      inner.addEventListener('pointermove', (e) => {
        const r = inner.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        inner.style.setProperty('--sx', `${x}px`);
        inner.style.setProperty('--sy', `${y}px`);
        if (vis) {
          vis.style.setProperty('--ry', `${((x / r.width) - 0.5) * 14}deg`);
          vis.style.setProperty('--rx', `${((y / r.height) - 0.5) * -10}deg`);
        }
      });
      inner.addEventListener('pointerleave', () => {
        if (vis) { vis.style.setProperty('--rx', '0deg'); vis.style.setProperty('--ry', '0deg'); }
      });
    });

    document.querySelectorAll('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${y * -10}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Scroll-velocity marquee (stack) ---------- */
  const rows = [...document.querySelectorAll('.vel-row')];
  if (rows.length && !reduce) {
    const state = rows.map((row) => ({ track: row.querySelector('.vel-track'), dir: Number(row.dataset.dir) || 1, x: 0 }));
    let lastY = window.scrollY, boost = 0;
    const loop = () => {
      const y = window.scrollY;
      boost += (Math.min(40, Math.abs(y - lastY)) - boost) * 0.1;
      lastY = y;
      state.forEach((s) => {
        const half = s.track.scrollWidth / 2;
        s.x -= s.dir * (0.6 + boost * 0.35);
        if (s.x <= -half) s.x += half;
        if (s.x > 0) s.x -= half;
        s.track.style.transform = `translate3d(${s.x}px,0,0)`;
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Footer wordmark rises as you reach the end ---------- */
  const wm = document.querySelector('.wordmark');
  if (wm && !reduce) {
    const lift = () => {
      const r = wm.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (r.height + 120)));
      wm.style.setProperty('--wm', `${(1 - p) * 40}%`);
    };
    lift();
    window.addEventListener('scroll', lift, { passive: true });
  } else if (wm) {
    wm.style.setProperty('--wm', '0%');
  }

  /* ---------- Magnetic copy-email circle + toast ---------- */
  const magnet = document.getElementById('copy-email');
  const toast = document.getElementById('toast');
  if (magnet) {
    const inner = magnet.querySelector('.magnet-inner');
    if (fine && !reduce) {
      const wrap = magnet.parentElement;
      wrap.addEventListener('mousemove', (e) => {
        const r = magnet.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        magnet.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
        inner.style.transform = `translate(${dx * 0.12}px, ${dy * 0.12}px)`;
      });
      wrap.addEventListener('mouseleave', () => { magnet.style.transform = ''; inner.style.transform = ''; });
    }
    let hide;
    magnet.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(magnet.dataset.email); }
      catch (err) { window.location.href = `mailto:${magnet.dataset.email}`; return; }
      if (!toast) return;
      toast.classList.remove('is-on'); void toast.offsetWidth; toast.classList.add('is-on');
      clearTimeout(hide); hide = setTimeout(() => toast.classList.remove('is-on'), 2600);
    });
  }

  /* ---------- Back to top ring ---------- */
  const toTop = document.getElementById('to-top');
  const ring = document.getElementById('to-top-ring');
  if (toTop && ring) {
    const C = 2 * Math.PI * 21;
    ring.style.strokeDasharray = C;
    const upd = () => {
      const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      ring.style.strokeDashoffset = C * (1 - (max > 0 ? h.scrollTop / max : 0));
      toTop.classList.toggle('is-on', h.scrollTop > window.innerHeight * 0.8);
    };
    upd(); window.addEventListener('scroll', upd, { passive: true });
  }

  /* ---------- Cursor dot (blend-difference, grows on interactive) ---------- */
  if (fine) {
    const dot = document.getElementById('cursor-dot');
    if (dot) {
      let mx = 0, my = 0, x = 0, y = 0, moved = false;
      document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!moved) { moved = true; x = mx; y = my; dot.classList.add('is-active'); }
      });
      const loop = () => { x += (mx - x) * 0.2; y += (my - y) * 0.2; dot.style.transform = `translate3d(${x}px,${y}px,0)`; requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
      document.querySelectorAll('a, button, .exp-li, .card-inner').forEach((el) => {
        el.addEventListener('mouseenter', () => dot.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => dot.classList.remove('is-hover'));
      });
    }
  }
});
