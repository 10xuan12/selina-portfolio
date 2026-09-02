// Single source of truth for the WhatsApp number — used to build both the
// contact link href and the QR code image URL below.
const WHATSAPP_NUMBER = '886965418312';

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isZh = (document.documentElement.lang || 'en').toLowerCase().startsWith('zh');

  /* ------------------------------------------------------------------
     Scroll progress bar
     ------------------------------------------------------------------ */
  const progress = document.getElementById('scroll-progress');
  if (progress) {
    const updateProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      progress.style.width = `${Math.min(100, Math.max(0, pct * 100))}%`;
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
  const revealEls = document.querySelectorAll('.reveal');

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
