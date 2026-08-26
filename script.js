// Single source of truth for the WhatsApp number — used to build both the
// contact link href and the QR code image URL below.
const WHATSAPP_NUMBER = '886965418312';

// Counts a <span>'s text from 0% up to `target`%, in step with the skill
// bar's own CSS width transition. `instant` (prefers-reduced-motion) skips
// straight to the final value.
function animateSkillCount(el, target, instant) {
  if (instant) {
    el.textContent = `${target}%`;
    return;
  }

  const duration = 900;
  const startTime = performance.now();

  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    el.textContent = `${Math.round(progress * target)}%`;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

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
     Language switcher (fixed circular button, bottom-right)
     ------------------------------------------------------------------ */
  const langToggle = document.getElementById('lang-toggle');

  if (langToggle) {
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

      document.querySelectorAll('.nav-link, .lang-fab').forEach((el) => {
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
     Skills: bars fill from 0 to their target width (+ percentage count-up)
     once the Skills sub-block scrolls into view. Fires once.
     ------------------------------------------------------------------ */
  const aboutSkills = document.querySelector('.about-skills');

  if (aboutSkills) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const skillBars = Array.from(aboutSkills.querySelectorAll('.skill-bar'))
      .map((bar) => {
        const fill = bar.querySelector('.skill-fill');
        const percentEl = bar.querySelector('.skill-percent');
        if (!fill || !percentEl) return null;
        const target = parseInt(fill.dataset.percent, 10) || 0;
        if (!prefersReducedMotion) percentEl.textContent = '0%';
        return { fill, percentEl, target };
      })
      .filter(Boolean);

    const runSkillBars = () => {
      skillBars.forEach(({ fill, percentEl, target }, index) => {
        const start = () => {
          fill.style.width = `${target}%`;
          animateSkillCount(percentEl, target, prefersReducedMotion);
        };
        if (prefersReducedMotion) {
          start();
        } else {
          setTimeout(start, index * 100);
        }
      });
    };

    if ('IntersectionObserver' in window) {
      const skillsObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runSkillBars();
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      skillsObserver.observe(aboutSkills);
    } else {
      runSkillBars();
    }
  }

  /* ------------------------------------------------------------------
     Methodology ring: draw the 6 arc segments in sequence (stroke-
     dasharray growing from its offset start point), then fade in the
     center signature. Triggered once by IntersectionObserver.
     ------------------------------------------------------------------ */
  const aboutMethodology = document.querySelector('.about-methodology');
  const methodologyRing = document.querySelector('.methodology-ring');

  if (aboutMethodology && methodologyRing) {
    if ('IntersectionObserver' in window) {
      const ringObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              methodologyRing.classList.add('is-drawn');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      ringObserver.observe(aboutMethodology);
    } else {
      methodologyRing.classList.add('is-drawn');
    }
  }

  /* ------------------------------------------------------------------
     Projects: scroll-reveal choreography for the editorial layout
     (mask / fade / wipe / rule), ported from the Claude Design canvas
     source "Selina Huang Projects.dc.html". Each [data-projects-anim]
     element animates in once, staggered by its position among its
     [data-projects-anim] siblings. Progressive enhancement: elements stay
     fully visible unless JS actually sets data-projects-ready first, so a
     failed/slow script never leaves the section blank.
     ------------------------------------------------------------------ */
  const projectsStage = document.querySelector('[data-projects-stage]');

  if (projectsStage && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    projectsStage.setAttribute('data-projects-ready', '');

    const projAnimObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const siblings = Array.from(el.parentElement.querySelectorAll(':scope > [data-projects-anim]'));
          const index = Math.max(0, siblings.indexOf(el));
          el.style.animationDelay = `${index * 90}ms`;
          el.classList.add('in');
          const inner = el.querySelector(':scope > span');
          if (inner) inner.style.animationDelay = `${index * 90}ms`;
          obs.unobserve(el);
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px -6% 0px' }
    );

    const projAnimEls = projectsStage.querySelectorAll('[data-projects-anim]');
    projAnimEls.forEach((el) => projAnimObserver.observe(el));

    // Safety net: if nothing has revealed itself after a while (an
    // observer edge case, an element that never scrolls into range),
    // just show everything rather than leave the section blank.
    setTimeout(() => {
      if (projectsStage.querySelectorAll('[data-projects-anim].in').length === 0) {
        projAnimEls.forEach((el) => el.classList.add('in'));
      }
    }, 1200);
  }

});
