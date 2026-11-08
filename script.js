// Single source of truth for the WhatsApp number — used for every
// WhatsApp link and the QR code image.
const WHATSAPP_NUMBER = '886965418312';

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

  /* ---------- WhatsApp links + QR ---------- */
  document.querySelectorAll('.js-wa').forEach((a) => { a.href = waUrl; });
  const qr = document.getElementById('qr');
  if (qr) qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=264x264&margin=0&data=${encodeURIComponent(waUrl)}`;

  /* ---------- Filters (with counts) ---------- */
  const tiles = [...document.querySelectorAll('#grid .tile')];
  const filters = [...document.querySelectorAll('.filter')];

  filters.forEach((btn) => {
    const cat = btn.dataset.filter;
    const n = cat === 'all' ? tiles.length : tiles.filter((t) => t.dataset.cat === cat).length;
    const badge = btn.querySelector('.n');
    if (badge) badge.textContent = n;

    btn.addEventListener('click', () => {
      const apply = () => {
        filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        tiles.forEach((t) => { t.hidden = !(cat === 'all' || t.dataset.cat === cat); });
      };
      if (!reduceMotion && typeof document.startViewTransition === 'function') {
        document.startViewTransition(apply);
      } else {
        apply();
      }
    });
  });

  /* ---------- Case dialogs ---------- */
  document.querySelectorAll('[data-dialog]').forEach((tile) => {
    const dlg = document.getElementById(tile.dataset.dialog);
    if (!dlg) return;
    tile.addEventListener('click', () => dlg.showModal());
  });
  document.querySelectorAll('dialog.case').forEach((dlg) => {
    dlg.querySelector('[data-close]')?.addEventListener('click', () => dlg.close());
    // click on the backdrop closes
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  });

  /* ---------- Copy email ---------- */
  const mailTile = document.getElementById('copy-mail');
  if (mailTile) {
    const state = mailTile.querySelector('.mail-state');
    const original = state ? state.textContent : '';
    mailTile.addEventListener('click', async () => {
      const mail = mailTile.dataset.mail;
      try {
        await navigator.clipboard.writeText(mail);
        if (state) state.textContent = `✓ ${mailTile.dataset.copied}`;
        setTimeout(() => { if (state) state.textContent = original; }, 1800);
      } catch (err) {
        window.location.href = `mailto:${mail}`;
      }
    });
  }

  /* ---------- Live clocks: Taichung vs Mbabane ---------- */
  const clocks = document.querySelectorAll('[data-tz]');
  const tick = () => {
    clocks.forEach((el) => {
      try {
        el.textContent = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit', minute: '2-digit', hour12: false, timeZone: el.dataset.tz,
        }).format(new Date());
      } catch (e) { /* unsupported zone: leave placeholder */ }
    });
  };
  tick();
  setInterval(tick, 15000);

  if (reduceMotion) return;

  /* ---------- Rotating problem line ---------- */
  const pline = document.getElementById('pline');
  if (pline && pline.dataset.lines) {
    const lines = pline.dataset.lines.split('|');
    let i = 0;
    setInterval(() => {
      i = (i + 1) % lines.length;
      pline.classList.add('is-out');
      setTimeout(() => { pline.textContent = lines[i]; pline.classList.remove('is-out'); }, 350);
    }, 3000);
  }

  /* ---------- Process steps light up in order ---------- */
  const steps = [...document.querySelectorAll('#steps li')];
  if (steps.length) {
    let s = 0;
    const paint = () => {
      steps.forEach((li, k) => {
        li.classList.toggle('on', k === s);
        li.classList.toggle('past', k < s);
      });
      s = (s + 1) % (steps.length + 1); // one beat of rest before restarting
    };
    paint();
    setInterval(paint, 1100);
  }

  /* ---------- "×47" repeated-reply counter ---------- */
  const cnt = document.getElementById('cnt');
  if (cnt) {
    const run = () => {
      let n = 1;
      cnt.classList.remove('done');
      const id = setInterval(() => {
        n += 1;
        cnt.textContent = `×${n}`;
        if (n >= 47) {
          clearInterval(id);
          setTimeout(() => {
            cnt.textContent = `✓ ${cnt.dataset.done}`;
            cnt.classList.add('done');
            setTimeout(run, 2600);
          }, 600);
        }
      }, 45);
    };
    run();
  }
});
