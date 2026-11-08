// Single source of truth for the WhatsApp number — used to build both the
// contact link href and the QR code image URL below.
const WHATSAPP_NUMBER = '886965418312';

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isZh = (document.documentElement.lang || 'en').toLowerCase().startsWith('zh');

  /* ------------------------------------------------------------------
     Intro curtain — plays once per session (the <head> gate adds
     .intro-seen on every later load). Remove it from the DOM once it
     has swept off, or immediately when it isn't going to play.
     ------------------------------------------------------------------ */
  const root = document.documentElement;
  const introSeen = root.classList.contains('intro-seen');
  const curtain = document.getElementById('om-curtain');

  if (introSeen || prefersReducedMotion) {
    root.classList.add('intro-done');
    if (curtain) curtain.remove();
  } else {
    if (curtain) {
      curtain.addEventListener('animationend', (e) => {
        if (e.animationName === 'curtain') curtain.remove();
      });
      setTimeout(() => curtain.remove(), 2600);
    }
    // Lock the hero into its resting state once the staggered
    // sequence (last step ~1980ms + photo zoom to ~4100ms) has run.
    setTimeout(() => root.classList.add('intro-done'), 4300);
  }

  /* ------------------------------------------------------------------
     Scroll progress bar. Browsers with scroll-driven animations fill
     it natively via CSS (animation-timeline: scroll(root)); this is
     the fallback for everything else.
     ------------------------------------------------------------------ */
  const progress = document.getElementById('scroll-progress');
  const nativeScrollTimeline =
    window.CSS && CSS.supports && CSS.supports('animation-timeline', 'scroll(root)');

  if (progress && !nativeScrollTimeline) {
    const updateProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, pct))})`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  /* ------------------------------------------------------------------
     Header: solid background once the page has scrolled
     ------------------------------------------------------------------ */
  const header = document.getElementById('site-header');
  if (header) {
    const updateHeaderState = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  /* ------------------------------------------------------------------
     Mobile nav toggle
     ------------------------------------------------------------------ */
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');

  if (navToggle && nav) {
    const closeNav = () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNav();
    });
  }

  /* ------------------------------------------------------------------
     Language switcher (fixed circular button, bottom-right)
     Cross-fade into the other language via the View Transitions API.
     ------------------------------------------------------------------ */
  const langToggle = document.getElementById('lang-toggle');

  if (langToggle) {
    langToggle.addEventListener('click', (event) => {
      const destination = langToggle.getAttribute('href');
      if (!destination || typeof document.startViewTransition !== 'function') return;

      event.preventDefault();
      try {
        document.startViewTransition(() => {
          window.location.href = destination;
        });
      } catch (err) {
        window.location.href = destination;
      }
    });
  }

  /* ------------------------------------------------------------------
     WhatsApp: derive the chat link + QR code from WHATSAPP_NUMBER so the
     number only ever lives in one place
     ------------------------------------------------------------------ */
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

  const whatsappLink = document.getElementById('whatsapp-link');
  if (whatsappLink) whatsappLink.href = whatsappUrl;

  const whatsappQrImg = document.getElementById('whatsapp-qr-img');
  if (whatsappQrImg) {
    whatsappQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappUrl)}`;
  }

  /* ------------------------------------------------------------------
     Scroll reveal: elements marked .reveal fade/rise in once
     ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal, .reveal--stagger');

  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('in'));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      // Safety net: never leave content hidden if the observer misfires.
      setTimeout(() => {
        revealEls.forEach((el) => {
          if (!el.classList.contains('in')) {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight) el.classList.add('in');
          }
        });
      }, 1400);
    }
  }

  /* ------------------------------------------------------------------
     Hero problem line: cycle through pain-point sentences every 2.8s
     ------------------------------------------------------------------ */
  const heroProblem = document.getElementById('hero-problem');

  if (heroProblem && !prefersReducedMotion) {
    const problems = isZh
      ? [
          '國外訪客看不懂你的服務內容。',
          '預約流程在最後一步流失客人。',
          '客戶看不出來自己到底找的是誰。',
          '同一個問題你一週回答二十次。',
        ]
      : [
          "International visitors can't understand your service.",
          'Your booking flow loses people at the last step.',
          "Customers can't tell who they're actually hiring.",
          'You answer the same enquiry twenty times a week.',
        ];

    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % problems.length;
      heroProblem.classList.add('is-swapping');
      setTimeout(() => {
        heroProblem.textContent = problems[idx];
        heroProblem.classList.remove('is-swapping');
      }, 300);
    }, 2800);
  }

  /* ------------------------------------------------------------------
     Custom cursor: dot follower (with lag) that grows on hover.
     Desktop pointers only — touch devices keep native tap behaviour.
     ------------------------------------------------------------------ */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursorDot = document.getElementById('cursor-dot');

    if (cursorDot) {
      const LERP = 0.18;
      let mouseX = 0;
      let mouseY = 0;
      let dotX = 0;
      let dotY = 0;
      let hasMoved = false;

      document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        if (!hasMoved) {
          hasMoved = true;
          dotX = mouseX;
          dotY = mouseY;
          cursorDot.classList.add('is-active');
        }
      });

      const renderCursor = () => {
        dotX += (mouseX - dotX) * LERP;
        dotY += (mouseY - dotY) * LERP;
        cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
        requestAnimationFrame(renderCursor);
      };

      requestAnimationFrame(renderCursor);

      document.querySelectorAll('a, button, .nav-link, .lang-fab').forEach((el) => {
        el.addEventListener('mouseenter', () => cursorDot.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => cursorDot.classList.remove('is-hover'));
      });
    }
  }
});

/* ==========================================================================
   Nov 2026 refresh — interactive pieces
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Rewriting headline: "I build ___" ---------- */
  const typer = document.getElementById('typer');
  if (typer && typer.dataset.words && !reduce) {
    const words = typer.dataset.words.split('|');
    let w = 0;
    let shown = words[0];
    const step = () => {
      const target = words[w];
      if (shown === target) {
        // hold, then start deleting
        w = (w + 1) % words.length;
        setTimeout(erase, 1900);
        return;
      }
      shown = target.slice(0, shown.length + 1);
      typer.textContent = shown;
      setTimeout(step, 55);
    };
    const erase = () => {
      if (shown.length === 0) { setTimeout(step, 250); return; }
      shown = shown.slice(0, -1);
      typer.textContent = shown;
      setTimeout(erase, 28);
    };
    setTimeout(() => { w = 1; erase(); }, 3400);
  }

  /* ---------- Keynote scroll paragraph: words light up with scroll ---------- */
  const keynote = document.getElementById('keynote');
  if (keynote && !reduce) {
    const words = [...keynote.querySelectorAll('.kw')];
    const paint = () => {
      const r = keynote.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the paragraph's top sits at 85% of the viewport, 1 when its bottom reaches 45%
      const start = vh * 0.85;
      const end = vh * 0.45;
      const total = (start - end) + r.height;
      const progress = Math.min(1, Math.max(0, (start - r.top) / total));
      const lit = Math.round(progress * words.length);
      words.forEach((el, i) => el.classList.toggle('lit', i < lit));
    };
    paint();
    window.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);
  }

  /* ---------- Count-up numbers ---------- */
  const nums = document.querySelectorAll('.stat-num[data-count]');
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el = entry.target;
        const raw = el.dataset.count;
        const target = parseInt(raw, 10);
        const suffix = raw.replace(/^[0-9]+/, '');
        const t0 = performance.now();
        const dur = 1200;
        const frame = (now) => {
          const k = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(target * eased) + (k === 1 ? suffix : '');
          if (k < 1) requestAnimationFrame(frame);
        };
        el.textContent = '0';
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- Project list: floating preview follows the cursor ---------- */
  const float = document.getElementById('proj-float');
  if (float && finePointer && !reduce) {
    const img = float.querySelector('img');
    let x = 0, y = 0, fx = 0, fy = 0, raf = null;
    const loop = () => {
      fx += (x - fx) * 0.16;
      fy += (y - fy) * 0.16;
      float.style.transform = `translate3d(${fx + 36}px, ${fy - 90}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    document.querySelectorAll('.proj').forEach((proj) => {
      const sum = proj.querySelector('.proj-sum');
      sum.addEventListener('mouseenter', (e) => {
        if (proj.open) return;
        img.src = proj.dataset.preview;
        x = fx = e.clientX; y = fy = e.clientY;
        float.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      sum.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
      sum.addEventListener('mouseleave', () => {
        float.classList.remove('is-on');
        cancelAnimationFrame(raf); raf = null;
      });
      sum.addEventListener('click', () => float.classList.remove('is-on'));
    });
  }

  /* ---------- Magnetic copy-email button + elastic toast ---------- */
  const magnet = document.getElementById('copy-email');
  const toast = document.getElementById('toast');
  if (magnet) {
    const inner = magnet.querySelector('.magnet-inner');
    if (finePointer && !reduce) {
      const wrap = magnet.parentElement;
      wrap.addEventListener('mousemove', (e) => {
        const r = magnet.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        magnet.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
        inner.style.transform = `translate(${dx * 0.12}px, ${dy * 0.12}px)`;
      });
      wrap.addEventListener('mouseleave', () => {
        magnet.style.transform = '';
        inner.style.transform = '';
      });
    }
    let hideTimer;
    magnet.addEventListener('click', async () => {
      const email = magnet.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        window.location.href = `mailto:${email}`;
        return;
      }
      if (!toast) return;
      toast.classList.remove('is-on');
      void toast.offsetWidth; // restart the check animation
      toast.classList.add('is-on');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => toast.classList.remove('is-on'), 2600);
    });
  }

  /* ---------- Back to top with progress ring ---------- */
  const toTop = document.getElementById('to-top');
  const ring = document.getElementById('to-top-ring');
  if (toTop && ring) {
    const C = 2 * Math.PI * 21;
    ring.style.strokeDasharray = C;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? h.scrollTop / max : 0;
      ring.style.strokeDashoffset = C * (1 - pct);
      toTop.classList.toggle('is-on', h.scrollTop > window.innerHeight * 0.6);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }
});
