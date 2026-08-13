// Single source of truth for the WhatsApp number — used to build both the
// contact link href and the QR code image URL below.
const WHATSAPP_NUMBER = '886965418312';

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------
     Scroll fade-up: reveal each section once via IntersectionObserver
     ------------------------------------------------------------------ */
  const fadeSections = document.querySelectorAll('.fade-section');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    fadeSections.forEach((section) => observer.observe(section));
  } else {
    // Fallback: no IntersectionObserver support, just show everything
    fadeSections.forEach((section) => section.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     Header: add background once the page has scrolled
     ------------------------------------------------------------------ */
  const header = document.getElementById('site-header');

  const updateHeaderState = () => {
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* ------------------------------------------------------------------
     Mobile nav toggle
     ------------------------------------------------------------------ */
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');

  const closeNav = () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const toggleNav = () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.addEventListener('click', toggleNav);

  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });

  /* ------------------------------------------------------------------
     Language toggle: reflect the current locale in the switch UI
     ------------------------------------------------------------------ */
  const langToggle = document.getElementById('lang-toggle');

  if (langToggle) {
    const isZh = /\/zh(\/|$)/.test(window.location.pathname);
    langToggle.classList.toggle('is-zh', isZh);

    // Cross-fade into the other language via the View Transitions API.
    // Browsers without support just follow the link normally — no error.
    langToggle.addEventListener('click', (event) => {
      const destination = langToggle.getAttribute('href');
      if (!destination || typeof document.startViewTransition !== 'function') {
        return;
      }

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
  if (whatsappLink) {
    whatsappLink.href = whatsappUrl;
  }

  const whatsappQrImg = document.getElementById('whatsapp-qr-img');
  if (whatsappQrImg) {
    whatsappQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappUrl)}`;
  }

  /* ------------------------------------------------------------------
     Custom cursor: dot follower (with lag) + handwritten CTA tooltip.
     Desktop pointers only — touch devices keep native tap behaviour.
     ------------------------------------------------------------------ */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursorDot = document.getElementById('cursor-dot');
    const cursorTip = document.getElementById('cursor-tip');

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
        if (cursorTip) {
          cursorTip.style.transform = `translate3d(${dotX + 24}px, ${dotY - 12}px, 0)`;
        }
        requestAnimationFrame(renderCursor);
      };

      requestAnimationFrame(renderCursor);

      document.querySelectorAll('.nav-link, .lang-toggle').forEach((el) => {
        el.addEventListener('mouseenter', () => cursorDot.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => cursorDot.classList.remove('is-hover'));
      });

      const heroCta = document.getElementById('hero-cta');
      if (heroCta && cursorTip) {
        heroCta.addEventListener('mouseenter', () => {
          cursorDot.classList.add('is-hover');
          cursorTip.classList.add('is-visible');
        });
        heroCta.addEventListener('mouseleave', () => {
          cursorDot.classList.remove('is-hover');
          cursorTip.classList.remove('is-visible');
        });
      }
    }
  }

  /* ------------------------------------------------------------------
     Hero rotator: cycle through pain-point sentences every 2.5s
     ------------------------------------------------------------------ */
  const heroRotator = document.getElementById('hero-rotator');

  if (heroRotator) {
    const rotatorItems = heroRotator.querySelectorAll('.hero-rotator-item');

    if (rotatorItems.length > 1) {
      let activeIndex = 0;

      setInterval(() => {
        rotatorItems[activeIndex].classList.remove('is-active');
        activeIndex = (activeIndex + 1) % rotatorItems.length;
        rotatorItems[activeIndex].classList.add('is-active');
      }, 2500);
    }
  }

  /* ------------------------------------------------------------------
     Hero mini before/after doodle: divider auto-sweeps between 30-70%,
     dragging takes over immediately and auto-sweep resumes 3s after
     the user lets go.
     ------------------------------------------------------------------ */
  const heroMiniCompare = document.getElementById('hero-mini-compare');

  if (heroMiniCompare) {
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setMiniPos = (percent) => {
      heroMiniCompare.style.setProperty('--mini-pos', `${clamp(percent, 4, 96)}%`);
    };

    const SWEEP_PERIOD = 5500; // ms, one full 30% <-> 70% <-> 30% cycle
    let autoSweep = !prefersReducedMotion;
    let resumeTimer = null;

    const tick = (now) => {
      if (autoSweep) {
        const phase = ((now % SWEEP_PERIOD) / SWEEP_PERIOD) * Math.PI * 2;
        setMiniPos(50 + 20 * Math.sin(phase));
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const positionFromEvent = (event) => {
      const rect = heroMiniCompare.getBoundingClientRect();
      setMiniPos(((event.clientX - rect.left) / rect.width) * 100);
    };

    let isDragging = false;

    heroMiniCompare.addEventListener('pointerdown', (event) => {
      isDragging = true;
      autoSweep = false;
      if (resumeTimer) clearTimeout(resumeTimer);
      heroMiniCompare.setPointerCapture(event.pointerId);
      positionFromEvent(event);
    });

    heroMiniCompare.addEventListener('pointermove', (event) => {
      if (!isDragging) return;
      positionFromEvent(event);
    });

    const endMiniDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      if (resumeTimer) clearTimeout(resumeTimer);
      if (!prefersReducedMotion) {
        resumeTimer = setTimeout(() => {
          autoSweep = true;
        }, 3000);
      }
    };

    heroMiniCompare.addEventListener('pointerup', endMiniDrag);
    heroMiniCompare.addEventListener('pointercancel', endMiniDrag);
    heroMiniCompare.addEventListener('pointerleave', endMiniDrag);
  }

  /* ------------------------------------------------------------------
     Case Study carousel: scroll-snap track driven by arrows + drag
     ------------------------------------------------------------------ */
  const caseTrack = document.getElementById('case-track');
  // .case-track is just the flex wrapper; .case-carousel (its parent) is the
  // element that actually scrolls (overflow-x: auto lives there).
  const caseViewport = caseTrack ? caseTrack.parentElement : null;
  const casePrev = document.getElementById('case-prev');
  const caseNext = document.getElementById('case-next');

  if (caseTrack && caseViewport && casePrev && caseNext) {
    const getStep = () => {
      const card = caseTrack.querySelector('.case-card');
      if (!card) return caseViewport.clientWidth;
      const gap = parseFloat(getComputedStyle(caseTrack).columnGap || '0');
      return card.getBoundingClientRect().width + gap;
    };

    const updateCaseNav = () => {
      const maxScroll = caseViewport.scrollWidth - caseViewport.clientWidth - 1;
      casePrev.disabled = caseViewport.scrollLeft <= 0;
      caseNext.disabled = caseViewport.scrollLeft >= maxScroll;
    };

    casePrev.addEventListener('click', () => {
      caseViewport.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });

    caseNext.addEventListener('click', () => {
      caseViewport.scrollBy({ left: getStep(), behavior: 'smooth' });
    });

    caseViewport.addEventListener('scroll', updateCaseNav, { passive: true });
    window.addEventListener('resize', updateCaseNav);
    updateCaseNav();

    // Mouse drag-to-scroll for desktop pointers; touch already scrolls
    // natively so it's left untouched.
    let isDragging = false;
    let hasDragged = false;
    let startX = 0;
    let startScrollLeft = 0;
    const DRAG_THRESHOLD = 6;

    caseViewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') return;
      isDragging = true;
      hasDragged = false;
      startX = event.clientX;
      startScrollLeft = caseViewport.scrollLeft;
      caseViewport.classList.add('is-dragging');
      caseViewport.setPointerCapture(event.pointerId);
    });

    caseViewport.addEventListener('pointermove', (event) => {
      if (!isDragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > DRAG_THRESHOLD) hasDragged = true;
      caseViewport.scrollLeft = startScrollLeft - delta;
    });

    const endDrag = () => {
      isDragging = false;
      caseViewport.classList.remove('is-dragging');
    };

    caseViewport.addEventListener('pointerup', endDrag);
    caseViewport.addEventListener('pointercancel', endDrag);
    caseViewport.addEventListener('pointerleave', endDrag);

    // Swallow the click that follows a drag so links/buttons inside the
    // cards don't get triggered by the release.
    caseViewport.addEventListener(
      'click',
      (event) => {
        if (hasDragged) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true
    );
  }

});
