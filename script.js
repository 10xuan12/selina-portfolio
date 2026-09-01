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

      document.querySelectorAll('.nav-link, .lang-fab, #hero-cta').forEach((el) => {
        el.addEventListener('mouseenter', () => cursorDot.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => cursorDot.classList.remove('is-hover'));
      });
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

  /* ------------------------------------------------------------------
     Projects: filter/search + snap-scroll strip + slide-in detail drawer
     ("E · Scale" layout, ported from the Claude Design canvas source
     Projects Layouts.dc.html). Baseline markup (see index.html) ships
     every project panel visible and un-hidden, so a crawler or a visitor
     without JS still gets the full write-up for all three case studies —
     everything below is what turns that into the interactive drawer.
     ------------------------------------------------------------------ */
  const projSection = document.querySelector('.projects-section');
  const projScale = document.querySelector('[data-proj-app]');
  const projStrip = projScale && projScale.querySelector('[data-proj-strip]');
  const scrim = document.querySelector('[data-proj-scrim]');
  const drawer = document.querySelector('[data-proj-drawer]');
  const drawerBody = drawer && drawer.querySelector('[data-proj-drawer-body]');

  if (projSection && projScale && projStrip && scrim && drawer && drawerBody) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = Array.from(projStrip.querySelectorAll('.proj-card'));
    const panels = Array.from(drawerBody.querySelectorAll('.proj-panel'));
    const projControls = projScale.querySelector('[data-proj-controls]');
    const projFiltersEl = projScale.querySelector('[data-proj-filters]');
    const gridToggle = projScale.querySelector('[data-proj-grid-toggle]');
    const searchInput = projScale.querySelector('[data-proj-search]');
    const searchClear = projScale.querySelector('[data-proj-search-clear]');
    const emptyClearBtn = projScale.querySelector('[data-proj-empty-clear]');
    const emptyTextEl = projScale.querySelector('[data-proj-empty-text]');
    const counterEl = drawer.querySelector('[data-proj-counter]');
    const prevBtn = drawer.querySelector('[data-proj-prev]');
    const nextBtn = drawer.querySelector('[data-proj-next]');
    const closeBtn = drawer.querySelector('[data-proj-close]');

    // Below this many projects, filter chips + search + the "all" grid
    // would just repeat "ALL" back at you — see chat notes: the layout
    // was built to survive a dozen-plus case studies, but with a
    // handful it's pure clutter. Add a 4th project and the controls
    // appear on their own; nothing here needs to change by hand.
    const SCALE_FILTER_THRESHOLD = 6;
    const FADE_MS = 220;
    const AUTOPLAY_MS = 4500;
    const CLOSE_MS = prefersReducedMotion ? 0 : 700;

    let activeIndex = 0;
    let isOpen = false;
    let isHovering = false;
    let autoplayTimer = null;
    let currentFilterKey = 'all';
    let currentQuery = '';
    let gridOpen = false;

    // Now that script.js is driving the drawer, switch it from the
    // baseline "everything visible in normal flow" fallback over to the
    // fixed overlay (see the .proj-js-ready selectors in style.css) and
    // collapse every panel back to just the active one.
    projSection.classList.add('proj-js-ready');
    panels.forEach((panel) => {
      panel.classList.remove('is-active');
      panel.hidden = true;
    });
    scrim.hidden = true;
    drawer.hidden = true;
    drawer.setAttribute('aria-hidden', 'true');

    const visibleCards = () => cards.filter((c) => !c.hidden);
    const panelFor = (card) => drawerBody.querySelector('#proj-panel-' + card.dataset.project);

    function buildFilterDefs() {
      const years = Array.from(new Set(cards.map((c) => c.dataset.year).filter(Boolean))).sort((a, b) => b - a);
      const defs = [{ key: 'all', label: 'All', test: () => true }];
      if (cards.some((c) => c.dataset.status === 'shipped')) {
        defs.push({ key: 'shipped', label: 'Shipped', test: (c) => c.dataset.status === 'shipped' });
      }
      years.forEach((y) => defs.push({ key: 'year:' + y, label: y, test: (c) => c.dataset.year === y }));
      if (cards.some((c) => c.dataset.status === 'bench')) {
        defs.push({ key: 'bench', label: 'On the bench', test: (c) => c.dataset.status === 'bench' });
      }
      return defs;
    }

    const filterDefs = buildFilterDefs();

    function renderFilters() {
      if (!projFiltersEl) return;
      projFiltersEl.innerHTML = '';
      filterDefs.forEach((def) => {
        const count = cards.filter(def.test).length;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'proj-filter' + (def.key === currentFilterKey ? ' is-active' : '');
        const labelSpan = document.createElement('span');
        labelSpan.textContent = def.label;
        const countSpan = document.createElement('span');
        countSpan.className = 'proj-filter-count';
        countSpan.textContent = String(count);
        btn.append(labelSpan, countSpan);
        btn.addEventListener('click', () => {
          if (currentFilterKey === def.key) return;
          currentFilterKey = def.key;
          if (isOpen) closeDrawer();
          applyFilters({ animate: true });
          renderFilters();
        });
        projFiltersEl.appendChild(btn);
      });
    }

    function staggerIn(list) {
      if (prefersReducedMotion) return;
      list.forEach((card, i) => {
        card.style.animationDelay = `${Math.min(i, 11) * 55}ms`;
        card.classList.remove('is-entering');
        void card.offsetWidth;
        card.classList.add('is-entering');
      });
    }

    function updateCounter() {
      const list = visibleCards();
      if (!counterEl) return;
      counterEl.textContent = list.length
        ? `${String(activeIndex + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`
        : '00 / 00';
    }

    function retriggerTitleReveal(panel) {
      const words = panel.querySelectorAll('.proj-title-word > span');
      panel.classList.remove('is-revealing');
      void panel.offsetWidth;
      words.forEach((w, i) => {
        w.style.animationDelay = `${110 + i * 90}ms`;
      });
      panel.classList.add('is-revealing');
    }

    function showPanel(card) {
      const panel = panelFor(card);
      if (!panel) return;
      const current = drawerBody.querySelector('.proj-panel.is-active');
      if (panel === current) return;

      const commit = () => {
        if (current) current.hidden = true;
        panel.hidden = false;
        void panel.offsetWidth;
        panel.classList.add('is-active');
        retriggerTitleReveal(panel);
      };

      if (current) {
        current.classList.remove('is-active');
        setTimeout(commit, FADE_MS);
      } else {
        commit();
      }
    }

    function setActive(idx, opts = {}) {
      const list = visibleCards();
      if (!list.length) return;
      activeIndex = ((idx % list.length) + list.length) % list.length;
      const activeCard = list[activeIndex];
      cards.forEach((c) => {
        const isThis = c === activeCard;
        c.classList.toggle('is-active', isThis);
        c.setAttribute('aria-selected', String(isThis));
      });
      updateCounter();
      if (isOpen) showPanel(activeCard);
      if (opts.scroll !== false) {
        activeCard.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          inline: 'nearest',
          block: 'nearest',
        });
      }
    }

    function onEscClose(e) {
      if (e.key === 'Escape') closeDrawer();
    }

    function openProject(idx) {
      setActive(idx, { scroll: false });
      stopAutoplay();
      isOpen = true;
      scrim.hidden = false;
      drawer.hidden = false;
      drawer.setAttribute('aria-hidden', 'false');
      void drawer.offsetWidth;
      scrim.classList.add('is-open');
      drawer.classList.add('is-open');
      showPanel(visibleCards()[activeIndex]);
      document.addEventListener('keydown', onEscClose);
    }

    function closeDrawer() {
      if (!isOpen) return;
      isOpen = false;
      scrim.classList.remove('is-open');
      drawer.classList.remove('is-open');
      document.removeEventListener('keydown', onEscClose);
      setTimeout(() => {
        scrim.hidden = true;
        drawer.hidden = true;
        drawer.setAttribute('aria-hidden', 'true');
      }, CLOSE_MS);
      startAutoplay();
    }

    function startAutoplay() {
      if (prefersReducedMotion || isOpen || isHovering) return;
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        if (isHovering || isOpen) return;
        if (visibleCards().length < 2) return;
        setActive(activeIndex + 1, { scroll: false });
      }, AUTOPLAY_MS);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function clearSearch() {
      currentQuery = '';
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.hidden = true;
      applyFilters({ animate: true });
    }

    function applyFilters(opts = {}) {
      const def = filterDefs.find((d) => d.key === currentFilterKey) || filterDefs[0];
      const q = currentQuery.trim().toLowerCase();
      const visible = [];
      cards.forEach((card) => {
        const show = def.test(card) && (!q || (card.dataset.search || '').includes(q));
        card.hidden = !show;
        if (show) visible.push(card);
      });
      const isEmpty = !visible.length;
      projScale.classList.toggle('has-empty', isEmpty);
      if (emptyTextEl) emptyTextEl.textContent = `No match for “${currentQuery.trim()}”`;
      if (!isEmpty) {
        setActive(0, { scroll: false });
        if (opts.animate) staggerIn(visible);
      }
    }

    // Card selection: clicking the already-open card closes it again;
    // any other card opens (or, if the drawer's already open, swaps in
    // place without a close/reopen round trip).
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const idx = visibleCards().indexOf(card);
        if (idx === -1) return;
        if (gridOpen) {
          gridOpen = false;
          projStrip.classList.remove('is-grid');
          if (gridToggle) gridToggle.textContent = `All ${cards.length} →`;
        }
        if (isOpen && idx === activeIndex) {
          closeDrawer();
        } else if (isOpen) {
          setActive(idx, { scroll: false });
        } else {
          openProject(idx);
        }
      });
    });

    // Autoplay pauses for as long as the pointer is anywhere over the
    // strip, not just over the active card — a fast pass-through
    // shouldn't restart the clock mid-glance.
    projStrip.addEventListener('mouseenter', () => {
      isHovering = true;
      stopAutoplay();
    });
    projStrip.addEventListener('mouseleave', () => {
      isHovering = false;
      startAutoplay();
    });

    // Arrow-key browsing is scoped to the strip itself (roving focus on
    // native <button> cards), not bound globally — so it never hijacks
    // normal page scrolling or a focused form field elsewhere on the
    // page. Works whether the drawer is open or closed.
    projStrip.addEventListener('keydown', (e) => {
      if (!(e.target instanceof HTMLElement) || !e.target.classList.contains('proj-card')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(activeIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(activeIndex - 1);
      }
    });

    if (prevBtn) prevBtn.addEventListener('click', () => setActive(activeIndex - 1, { scroll: false }));
    if (nextBtn) nextBtn.addEventListener('click', () => setActive(activeIndex + 1, { scroll: false }));
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    scrim.addEventListener('click', closeDrawer);

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentQuery = searchInput.value;
        if (searchClear) searchClear.hidden = !currentQuery;
        if (isOpen) closeDrawer();
        applyFilters({ animate: true });
      });
    }
    if (searchClear) searchClear.addEventListener('click', clearSearch);
    if (emptyClearBtn) emptyClearBtn.addEventListener('click', clearSearch);

    if (gridToggle) {
      gridToggle.addEventListener('click', () => {
        gridOpen = !gridOpen;
        projStrip.classList.toggle('is-grid', gridOpen);
        gridToggle.textContent = gridOpen ? 'Strip view' : `All ${cards.length} →`;
      });
    }

    // Filters/search/grid-toggle only show once there's enough work to
    // sort through (see SCALE_FILTER_THRESHOLD above).
    if (projControls && cards.length > SCALE_FILTER_THRESHOLD) {
      projControls.hidden = false;
      if (gridToggle) {
        gridToggle.hidden = false;
        gridToggle.textContent = `All ${cards.length} →`;
      }
      renderFilters();
    }

    // Skeleton: a brief shimmer on first paint, then reveal the strip
    // with the same staggered entrance used for filter/search changes.
    // Skipped entirely under prefers-reduced-motion — and skipped, not
    // just shortened, because unlike the shimmer's tick this one paints
    // real content immediately, and there's nothing worth waiting for.
    setActive(0, { scroll: false });
    if (prefersReducedMotion) {
      applyFilters();
    } else {
      projScale.classList.add('is-loading');
      setTimeout(() => {
        projScale.classList.remove('is-loading');
        applyFilters({ animate: true });
      }, 700);
    }

    startAutoplay();
  }

});
