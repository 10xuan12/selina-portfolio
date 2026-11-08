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
      setTimeout(() => curtain.remove(), 1400);
    }
    // Lock the hero into its resting state once the staggered
    // sequence (last step ~1980ms + photo zoom to ~4100ms) has run.
    setTimeout(() => root.classList.add('intro-done'), 2500);
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
     WhatsApp link (no third-party QR service — nothing about the visitor
     or the number is sent to another site)
     ------------------------------------------------------------------ */
  const whatsappLink = document.getElementById('whatsapp-link');
  if (whatsappLink) whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}`;

  /* ------------------------------------------------------------------
     Email: the address is not written in the HTML, so simple scrapers
     that harvest "mailto:" links from page source don't find it.
     It's assembled here from data-u / data-d.
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-u][data-d]').forEach((el) => {
    const addr = `${el.dataset.u}@${el.dataset.d}`;
    el.href = `mailto:${addr}`;
    const val = el.querySelector('.contact-link-val');
    if (val) val.textContent = addr;
  });

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
     Work screen recordings: play only while on screen (saves data and
     battery), never autoplay for people who prefer reduced motion.
     ------------------------------------------------------------------ */
  const workVideos = document.querySelectorAll('.work-video');
  if (workVideos.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const videoIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          if (v.preload !== 'auto') v.preload = 'auto';
          const pr = v.play();
          if (pr && pr.catch) pr.catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    workVideos.forEach((v) => videoIO.observe(v));
  }

  /* ------------------------------------------------------------------
     Count-up numbers in the About stats strip
     ------------------------------------------------------------------ */
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  if (statNums.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const countIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el = entry.target;
        const raw = el.dataset.count;
        const target = parseInt(raw, 10);
        const suffix = raw.replace(/^[0-9]+/, '');
        const t0 = performance.now();
        const frame = (now) => {
          const k = Math.min(1, (now - t0) / 1400);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + (k === 1 ? suffix : '');
          if (k < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.5 });
    statNums.forEach((n) => { n.textContent = '0'; countIO.observe(n); });
  }

  /* ------------------------------------------------------------------
     Knowledge base tabs (WAI-ARIA tabs pattern: click + arrow keys)
     ------------------------------------------------------------------ */
  const kb = document.querySelector('.kb');
  if (kb) {
    const tabs = [...kb.querySelectorAll('[role="tab"]')];
    const panels = [...kb.querySelectorAll('[role="tabpanel"]')];
    const bar = kb.querySelector('.kb-bar');

    const moveBar = (tab) => {
      if (!bar) return;
      bar.style.width = `${tab.offsetWidth}px`;
      bar.style.transform = `translateX(${tab.offsetLeft}px)`;
    };

    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
      moveBar(tab);
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });

    const current = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    if (current) select(current, false);
    window.addEventListener('resize', () => {
      const t = tabs.find((x) => x.getAttribute('aria-selected') === 'true');
      if (t) moveBar(t);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => current && moveBar(current));
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
