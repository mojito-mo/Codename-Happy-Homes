/* Happy Homes, Trisulia
   Preloader + Hero form + Modal (25s auto popup) + Site visit + Video call
   + Carousel + Plan toggles + Amenity toggles + EMI + Lightbox + Right rail */
(() => {
  'use strict';

  const CONFIG = {
    WHATSAPP_NUMBER: '919777999724',
    SHEETS_ENDPOINT: 'https://script.google.com/macros/s/AKfycbyHf5OpyPxUnJ9FQS5tqeN3_h4BZ-2K8WPAJR5yDtC1jZD0TLCPIv8E-4mBzhWDV2_u/exec',
    ENQUIRY_CONVERSION_LABEL: 'AW-XXXXXXXXX/REPLACE_WITH_LABEL',
    BROCHURE_URL: 'assets/brochure.pdf',
    AUTO_POPUP_FIRST_MS: 45000,
    AUTO_POPUP_REPEAT_MS: 45000
  };

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const prm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ========== PRELOADER ========== */
  const preloader = $('#preloader');
  const preCount = $('#preCount');
  const preLogoFill = $('#preLogoFill');
  const preBar = $('#preBar');

  function setPreloader(n) {
    if (preCount) preCount.textContent = n;
    if (preLogoFill) preLogoFill.style.clipPath = 'inset(' + (100 - n) + '% 0 0 0)';
    if (preBar) preBar.style.width = n + '%';
  }
  function runPreloader() {
    if (!preloader || !preCount) { bootAfterLoad(); return; }
    let n = 0;
    setPreloader(n);
    const tick = () => {
      n += Math.max(1, Math.floor((100 - n) / 9));
      if (n >= 100) {
        n = 100; setPreloader(n);
        setTimeout(() => {
          preloader.classList.add('is-done');
          bootAfterLoad();
        }, 360);
        return;
      }
      setPreloader(n);
      setTimeout(tick, 50 + Math.random() * 40);
    };
    setTimeout(tick, 200);
  }
  runPreloader();

  /* ========== NAV + RAIL scroll ========== */
  const nav = $('#nav');
  const rail = document.querySelector('.rail');
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
    if (rail) rail.classList.toggle('is-visible', window.scrollY > 200);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ========== Mobile toggle ========== */
  const navToggle = $('#navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('is-menu-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav__menu a').forEach(a => a.addEventListener('click', () => {
      document.body.classList.remove('is-menu-open');
      navToggle.classList.remove('is-open');
    }));
  }

  /* ========== Smooth anchor scroll ========== */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 64, behavior: prm ? 'auto' : 'smooth' });
  });

  /* ========== MODALS (3 of them) ========== */
  const modal = $('#modal');
  const siteVisitModal = $('#siteVisitModal');
  const videoCallModal = $('#videoCallModal');
  const modalForm = $('#enquiryForm');
  const modalSuccess = $('#modalSuccess');

  let leadSubmitted = false;
  let autoPopupTimeout = null;
  let autoPopupInterval = null;

  function openModal(prefill) {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.classList.add('is-locked');
    if (modalForm) { modalForm.hidden = false; modalForm.style.display = ''; }
    if (modalSuccess) modalSuccess.hidden = true;
    const pf = $('#m-page'); if (pf) pf.value = location.href || '';
    const mf = $('#m-message');
    if (prefill && mf) {
      const opt = Array.from(mf.options).find(o => o.value.toLowerCase().indexOf(prefill.toLowerCase()) >= 0);
      if (opt) mf.value = opt.value;
      modalForm.dataset.plan = prefill;
    } else if (modalForm) {
      modalForm.dataset.plan = '';
    }
    setTimeout(() => { const n = $('#m-name'); if (n) n.focus(); }, 250);
  }
  function openSiteVisit() {
    if (!siteVisitModal) return;
    siteVisitModal.classList.add('is-open');
    document.body.classList.add('is-locked');
    setTimeout(() => { const n = $('#sv-name'); if (n) n.focus(); }, 250);
  }
  function openVideoCall() {
    if (!videoCallModal) return;
    videoCallModal.classList.add('is-open');
    document.body.classList.add('is-locked');
    setTimeout(() => { const n = $('#vc-name'); if (n) n.focus(); }, 250);
  }
  function closeAllModals() {
    [modal, siteVisitModal, videoCallModal, document.getElementById('projectsModal')].forEach(m => { if (m) m.classList.remove('is-open'); });
    document.body.classList.remove('is-locked');
  }
  function isAnyModalOpen() {
    return [modal, siteVisitModal, videoCallModal, document.getElementById('projectsModal')].some(m => m && m.classList.contains('is-open'));
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-modal]'))   { e.preventDefault(); openModal(e.target.closest('[data-open-modal]').dataset.prefill); return; }
    if (e.target.closest('[data-open-sitevisit]')) { e.preventDefault(); openSiteVisit(); return; }
    if (e.target.closest('[data-open-video]'))   { e.preventDefault(); openVideoCall(); return; }
    if (e.target.closest('[data-close-modal]'))  { e.preventDefault(); closeAllModals(); return; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAllModals(); closeLightbox(); } });

  /* ========== AUTO POPUP — DISABLED (user opt-out) ========== */
  function scheduleAutoPopup() { /* intentionally disabled */ }
  function bootAfterLoad() { /* no popup scheduling */ }

  /* ========== Submit helpers ========== */
  // Encode object as URL-encoded for Netlify Forms
  function encodeForNetlify(data) {
    return Object.keys(data)
      .filter(k => data[k] !== undefined && data[k] !== null && data[k] !== '')
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
      .join('&');
  }
  async function submitLead(payload, formNetlifyName) {
    // 1) Submit to Netlify Forms (primary capture)
    if (formNetlifyName) {
      try {
        const body = encodeForNetlify(Object.assign({ 'form-name': formNetlifyName }, payload));
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body
        });
      } catch (err) { console.warn('Netlify Forms POST failed:', err); }
    }
    // 2) Google Sheets via Apps Script
    try {
      if (CONFIG.SHEETS_ENDPOINT && CONFIG.SHEETS_ENDPOINT.indexOf('http') === 0) {
        const sheetPayload = Object.assign({ 'form-name': formNetlifyName || '' }, payload);
        await fetch(CONFIG.SHEETS_ENDPOINT, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(sheetPayload)
        });
      }
    } catch (err) { console.warn('Sheet POST failed:', err); }
    // 3) Google Ads conversion (optional)
    try {
      if (typeof window.gtag === 'function' && CONFIG.ENQUIRY_CONVERSION_LABEL && CONFIG.ENQUIRY_CONVERSION_LABEL.indexOf('REPLACE_WITH_LABEL') === -1) {
        window.gtag('event', 'conversion', { send_to: CONFIG.ENQUIRY_CONVERSION_LABEL });
      }
    } catch (_) {}
  }
  function buildWA(payload, hint) {
    const lines = ['Hi, I am interested in Happy Homes, Trisulia.', ''];
    if (payload.name)     lines.push('*Name:* ' + payload.name);
    if (payload.phone)    lines.push('*Phone:* ' + payload.phone);
    if (payload.email)    lines.push('*Email:* ' + payload.email);
    if (payload.budget)   lines.push('*Budget:* ' + payload.budget);
    if (payload.timeline) lines.push('*Timeline:* ' + payload.timeline);
    if (payload.config)   lines.push('*Configuration:* ' + payload.config);
    if (payload.plan)     lines.push('*Plan:* ' + payload.plan);
    if (payload.pickup)   lines.push('*Pickup:* ' + payload.pickup);
    if (payload.date)     lines.push('*Date:* ' + payload.date);
    if (payload.slot)     lines.push('*Slot:* ' + payload.slot);
    if (payload.message)  lines.push('*Message:* ' + payload.message);
    lines.push(''); lines.push(hint || 'Please share pricing and the brochure.');
    return 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }
  function downloadBrochure() {
    try {
      const a = document.createElement('a');
      a.href = CONFIG.BROCHURE_URL;
      a.download = 'Happy-Homes-Brochure.pdf';
      a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click();
      setTimeout(() => a.remove(), 200);
    } catch (e) { console.warn(e); }
  }
  function validateRequired(form, selectors) {
    let ok = true;
    selectors.forEach(([sel, val]) => {
      const el = form.querySelector(sel); if (!el) return;
      if (!val) { el.classList.add('is-invalid'); if (ok) el.focus(); ok = false; }
      else el.classList.remove('is-invalid');
    });
    return ok;
  }
  function unlockPricing() {
    const gate = document.getElementById('pricingGate');
    if (!gate) return;
    const locked = gate.querySelector('.pricing__locked');
    const band   = gate.querySelector('.pricing__band');
    if (locked) locked.hidden = true;
    if (band)   band.hidden = false;
  }
  function markLeadDone() {
    if (window.__chh_unlockPlans) window.__chh_unlockPlans();
    unlockPricing();
    leadSubmitted = true;
    if (autoPopupInterval) { clearInterval(autoPopupInterval); autoPopupInterval = null; }
    if (autoPopupTimeout) { clearTimeout(autoPopupTimeout); autoPopupTimeout = null; }
  }

  /* ========== HERO + MODAL + CONTACT + SITE VISIT + VIDEO CALL ==========
     Every form posts to Netlify + Google Sheet (unchanged), then redirects to
     thank-you.html. The dedicated /thank-you URL is what GA4 records as the
     conversion pageview, and the brochure download + WhatsApp hand-off happen
     there so the redirect never interrupts the file download.                 */
  const THANK_YOU_URL = 'thank-you.html';

  function bindForm(formId, source, opts) {
    opts = opts || {};
    const f = $('#' + formId);
    if (!f) return;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(f);
      const cc = (fd.get('cc') || '').toString().trim();
      const digits = (fd.get('phone') || '').toString().replace(/\D/g, '');
      const p = {
        name: (fd.get('name') || '').toString().trim(),
        phone: digits ? ((cc ? '(' + cc + ') ' : '') + digits) : '',
        email: (fd.get('email') || '').toString().trim(),
        budget: (fd.get('budget') || '').toString().trim(),
        timeline: (fd.get('timeline') || '').toString().trim(),
        config: (fd.get('config') || '').toString().trim(),
        pickup: (fd.get('pickup') || '').toString().trim(),
        date: (fd.get('date') || '').toString().trim(),
        slot: (fd.get('slot') || '').toString().trim(),
        plan: f.dataset.plan || '',
        message: (fd.get('message') || '').toString().trim(),
        source: source || (fd.get('source') || 'Form').toString(),
        page: location.href || ''
      };
      if (!validateRequired(f, [['[name="name"]', p.name], ['[name="phone"]', p.phone]])) return;
      const sb = f.querySelector('button[type="submit"]');
      if (sb) { sb.disabled = true; const sp = sb.querySelector('span'); if (sp) sp.textContent = 'Sending...'; }
      const netlifyName = f.getAttribute('name') || '';

      // 1) Keep the existing capture: Netlify Forms + Google Sheet + Ads
      await submitLead(p, netlifyName);

      // 2) Build the WhatsApp hand-off link for the thank-you page
      const hint = source === 'Site Visit form' ? 'Please confirm my free site visit pickup.' :
                   source === 'Video call form' ? 'Please connect me on WhatsApp video.' :
                   'I just downloaded the brochure. Please share pricing.';
      const wa = buildWA(p, hint);
      try {
        sessionStorage.setItem('chh_lead', JSON.stringify({
          wa: wa,
          brochure: !!opts.brochure,
          source: source,
          name: p.name
        }));
      } catch (_) {}

      // 3) Unlock pricing/plans for the return visit, and fire an early GA4 signal
      markLeadDone();
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'lead_submit', form_source: source });
        if (typeof window.gtag === 'function') window.gtag('event', 'lead_submit', { form_source: source });
      } catch (_) {}

      // 4) Off to the GA4 conversion page
      window.location.href = THANK_YOU_URL;
    });
  }

  // Lead / brochure forms download the brochure on the thank-you page
  bindForm('heroForm',      'Hero inline form', { brochure: true });
  bindForm('enquiryForm',   'Modal popup',      { brochure: true });
  bindForm('contactForm',   'Contact form',     { brochure: true });
  // Visit / call intents: no brochure, just the WhatsApp hand-off
  bindForm('siteVisitForm', 'Site Visit form',  { brochure: false });
  bindForm('videoForm',     'Video call form',  { brochure: false });

  /* ========== PHONE: allow digits only in the number field ========== */
  $$('.phone-row input[type="tel"]').forEach(inp => {
    inp.addEventListener('input', () => {
      const cleaned = inp.value.replace(/\D/g, '');
      if (inp.value !== cleaned) inp.value = cleaned;
    });
  });

  /* ========== PRICING: play entrance animation when it scrolls in ========== */
  (function () {
    const sec = document.getElementById('pricing');
    if (!sec) return;
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { sec.classList.add('is-in'); io.disconnect(); } });
    }, { threshold: 0.18 });
    io.observe(sec);
  })();

  /* ========== AMBIENT SOUND (cazrd-style, on/off, remembers choice) ========== */
  (function () {
    const audio = $('#ambientAudio');
    const btn = $('#soundToggle');
    if (!audio || !btn) return;
    const TARGET = 0.32;              // comfortable ambient level
    audio.volume = 0;
    let pref = 'on';
    try { pref = localStorage.getItem('chh_sound') || 'on'; } catch (_) {}

    let fadeId = null;
    function fadeTo(v, done) {
      if (fadeId) clearInterval(fadeId);
      const from = audio.volume, steps = 16; let i = 0;
      fadeId = setInterval(() => {
        i++; audio.volume = Math.min(1, Math.max(0, from + (v - from) * i / steps));
        if (i >= steps) { clearInterval(fadeId); fadeId = null; audio.volume = v; if (done) done(); }
      }, 32);
    }
    // UI follows the actual audio state
    audio.addEventListener('play',  () => { btn.classList.add('is-playing');  btn.setAttribute('aria-pressed', 'true'); });
    audio.addEventListener('pause', () => { btn.classList.remove('is-playing'); btn.setAttribute('aria-pressed', 'false'); });

    function play() {
      const p = audio.play();
      if (p && p.then) p.then(() => fadeTo(TARGET)).catch(() => armGesture());
      else fadeTo(TARGET);
    }
    function pause() { fadeTo(0, () => audio.pause()); }

    // Browsers block audible autoplay until the first interaction, so we start
    // the moment the visitor does anything at all: move, tap, key, or scroll.
    const GESTURES = ['pointerdown', 'pointermove', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    let armed = false;
    function armGesture() {
      if (armed) return; armed = true;
      const go = (ev) => {
        if (ev && ev.target && ev.target.closest && ev.target.closest('#soundToggle')) return; // button handles itself
        if (pref !== 'off' && audio.paused) {
          const p = audio.play();
          if (p && p.then) p.then(() => fadeTo(TARGET)).catch(() => {});
        }
        GESTURES.forEach(e => window.removeEventListener(e, go, true));
        armed = false;
      };
      GESTURES.forEach(e => window.addEventListener(e, go, true));
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (audio.paused) { pref = 'on';  try { localStorage.setItem('chh_sound', 'on'); }  catch (_) {} play(); }
      else              { pref = 'off'; try { localStorage.setItem('chh_sound', 'off'); } catch (_) {} pause(); }
    });

    if (pref !== 'off') { play(); armGesture(); }   // attempt immediately, and guarantee start on first interaction
  })();

  /* ========== HERO CGI VIDEO: force autoplay (muted) ========== */
  (function () {
    const hv = document.querySelector('.hero__drone');
    if (!hv) return;
    const play = () => { try { hv.muted = true; hv.setAttribute('muted',''); const p = hv.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {} };
    play();
    if (hv.readyState < 2) hv.addEventListener('loadeddata', play, { once: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
    // A single user gesture guarantees playback where autoplay is blocked
    ['touchstart', 'click', 'scroll'].forEach(evt =>
      window.addEventListener(evt, play, { once: true, passive: true }));
  })();

  /* ========== WALKTHROUGH VIDEO: nudge play on first scroll-in ========== */
  (function () {
    const v = document.getElementById('walkVideo');
    if (!v) return;
    const tryPlay = () => { try { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {} };
    tryPlay();
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) tryPlay(); });
    }, { threshold: 0.25 });
    io.observe(v);
  })();

  /* ========== COUNTERS (legacy timeline) animate 0 -> target on scroll-in ========== */
  (function () {
    const els = document.querySelectorAll('[data-count-to]');
    if (!els.length) return;
    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = Math.round(target * eased);
        el.firstChild ? (el.childNodes[0].nodeValue = val + suffix) : (el.textContent = val + suffix);
        el.textContent = val + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !e.target.dataset.counted) {
          e.target.dataset.counted = '1';
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  })();

  /* ========== GALLERY CAROUSEL ========== */
  const gTrack = $('#gallery-track');
  const gDots = $('#gallery-dots');
  if (gTrack) {
    const slides = $$('.carousel__slide', gTrack);
    /* dots */
    if (gDots) {
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
        b.setAttribute('aria-label', 'Slide ' + (i + 1));
        b.addEventListener('click', () => {
          slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        });
        gDots.appendChild(b);
      });
    }
    /* sync dots on scroll */
    let sTimer;
    gTrack.addEventListener('scroll', () => {
      clearTimeout(sTimer);
      sTimer = setTimeout(() => {
        const x = gTrack.scrollLeft;
        const w = slides[0].getBoundingClientRect().width + 16;
        const idx = Math.round(x / w);
        $$('.carousel__dot', gDots).forEach((d, i) => d.classList.toggle('is-active', i === idx));
      }, 80);
    });
    /* nav arrows */
    document.addEventListener('click', (e) => {
      const w = slides[0].getBoundingClientRect().width + 16;
      if (e.target.closest('[data-carousel-prev]')) gTrack.scrollBy({ left: -w, behavior: 'smooth' });
      if (e.target.closest('[data-carousel-next]')) gTrack.scrollBy({ left: w, behavior: 'smooth' });
    });
  }

  /* ========== AMENITIES TOGGLE ========== */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-am-tab]');
    if (!t) return;
    const key = t.dataset.amTab;
    $$('[data-am-tab]').forEach(b => { const a = b === t; b.classList.toggle('is-active', a); b.setAttribute('aria-selected', String(a)); });
    $$('[data-am-grid]').forEach(g => g.classList.toggle('is-active', g.dataset.amGrid === key));
  });

  /* ========== PLANS UNLOCK (lead-gated) ========== */
  function unlockPlans(persist) {
    const lock = document.getElementById('plansLock');
    if (lock) {
      lock.classList.add('is-unlocked');
      lock.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.add('plans-unlocked');
    if (persist !== false) {
      try { localStorage.setItem('chh_plans_unlocked', '1'); } catch (_) {}
    }
  }
  window.__chh_unlockPlans = unlockPlans;
  // Restore previous unlock from localStorage
  try {
    if (localStorage.getItem('chh_plans_unlocked') === '1') {
      unlockPlans(false);
    }
  } catch (_) {}

  /* ========== PLANS: view (master/typical) + unit + mode (floor/walk) ========== */
  const PLAN_IMG_MAP = {
    '2bhk-1': 'assets/floor-2bhk-1.jpg',
    '2bhk-2': 'assets/floor-2bhk-2.jpg',
    '3bhk-1': 'assets/floor-3bhk-1.jpg',
    '3bhk-2': 'assets/floor-3bhk-2.jpg'
  };
  const PLAN_WALK_MAP = {
    '2bhk-1': 'assets/walkthrough-2bhk.mp4',
    '2bhk-2': 'assets/walkthrough-2bhk.mp4',
    '3bhk-1': 'assets/walkthrough-3bhk.mp4',
    '3bhk-2': 'assets/walkthrough-3bhk.mp4'
  };
  const planState = { view: 'master', unit: '3bhk-2', mode: 'floor' };
  const planWalkVideo = $('#planWalkVideo');

  function showOnByView() {
    $$('[data-show-on]').forEach(t => t.classList.toggle('is-visible', t.dataset.showOn === planState.view));
  }
  function renderPlans() {
    let activeKey = 'master';
    if (planState.view === 'typical') activeKey = (planState.mode === 'walk') ? 'walk' : 'typical';
    $$('.plans__image[data-plan-image]').forEach(el => el.classList.toggle('is-active', el.dataset.planImage === activeKey));
    const vid = $('.plans__video[data-plan-image="walk"]');
    if (vid) vid.hidden = (activeKey !== 'walk');
    if (planWalkVideo) {
      if (activeKey === 'walk') { try { const p = planWalkVideo.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {} }
      else { try { planWalkVideo.pause(); } catch (_) {} }
    }
    showOnByView();
  }

  // View toggle: Master Plan / Typical Floor Plan
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-plan-view]');
    if (!t) return;
    planState.view = t.dataset.planView;
    if (planState.view === 'typical') planState.mode = 'floor';
    $$('[data-plan-view]').forEach(b => { const a = b === t; b.classList.toggle('is-active', a); b.setAttribute('aria-selected', String(a)); });
    $$('[data-plan-mode]').forEach(b => { const a = b.dataset.planMode === planState.mode; b.classList.toggle('is-active', a); b.setAttribute('aria-selected', String(a)); });
    renderPlans();
  });

  // Unit tabs: 2 BHK T1/T2, 3 BHK T1/T2
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-typical]');
    if (!t) return;
    planState.unit = t.dataset.typical;
    $$('[data-typical]').forEach(b => b.classList.toggle('is-active', b === t));
    $$('[data-plan-detail]').forEach(d => d.hidden = (d.dataset.planDetail !== planState.unit));
    const typicalImg = $('[data-plan-image="typical"]');
    if (typicalImg && PLAN_IMG_MAP[planState.unit]) {
      const img = typicalImg.querySelector('img');
      if (img) img.src = PLAN_IMG_MAP[planState.unit];
      typicalImg.dataset.img = PLAN_IMG_MAP[planState.unit];
    }
    if (planWalkVideo && PLAN_WALK_MAP[planState.unit]) {
      const src = planWalkVideo.querySelector('source');
      const next = PLAN_WALK_MAP[planState.unit];
      if (src && src.getAttribute('src') !== next) {
        src.setAttribute('src', next);
        planWalkVideo.load();
      }
    }
    renderPlans();
  });

  // Mode toggle: Floor plan / Walkthrough
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-plan-mode]');
    if (!t) return;
    planState.mode = t.dataset.planMode;
    $$('[data-plan-mode]').forEach(b => { const a = b === t; b.classList.toggle('is-active', a); b.setAttribute('aria-selected', String(a)); });
    renderPlans();
  });

  showOnByView();
  renderPlans();

  /* ========== EMI Calculator ========== */
  const emiPrice = $('#emiPrice'), emiDown = $('#emiDown'), emiTenure = $('#emiTenure'), emiRate = $('#emiRate');
  if (emiPrice && emiDown && emiTenure && emiRate) {
    const out = {
      price: $('#emiPriceOut'), down: $('#emiDownOut'),
      tenure: $('#emiTenureOut'), rate: $('#emiRateOut'),
      emi: $('#emiEMI'), loan: $('#emiLoan'),
      interest: $('#emiInterest'), total: $('#emiTotal')
    };
    function fmtINR(n) {
      if (!isFinite(n)) return '₹ 0';
      return '₹ ' + Math.round(n).toLocaleString('en-IN');
    }
    function calc() {
      const price = parseFloat(emiPrice.value);
      const downPct = parseFloat(emiDown.value);
      const tenureYears = parseFloat(emiTenure.value);
      const ratePct = parseFloat(emiRate.value);
      const downAmt = price * (downPct / 100);
      const loan = price - downAmt;
      const r = (ratePct / 100) / 12;
      const n = tenureYears * 12;
      let emi = 0;
      if (r > 0) emi = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      else emi = loan / n;
      const total = emi * n;
      const interest = total - loan;
      out.price.textContent = fmtINR(price);
      out.down.textContent = fmtINR(downAmt) + ' (' + downPct + '%)';
      out.tenure.textContent = tenureYears + ' years';
      out.rate.textContent = ratePct.toFixed(2) + '% p.a.';
      out.emi.textContent = fmtINR(emi);
      out.loan.textContent = fmtINR(loan);
      out.interest.textContent = fmtINR(interest);
      out.total.textContent = fmtINR(total);
    }
    [emiPrice, emiDown, emiTenure, emiRate].forEach(el => el.addEventListener('input', calc));
    calc();
  }

  /* ========== LIGHTBOX (zoom plans) ========== */
  const lightbox = $('#lightbox');
  const lightboxViewport = $('#lightboxViewport');
  const lightboxImg = $('#lightboxImg');
  let zoom = 1, panX = 0, panY = 0;
  let isPanning = false, startX = 0, startY = 0;
  function applyTransform() {
    if (!lightboxImg) return;
    lightboxImg.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + zoom + ')';
  }
  function openLightbox(src) {
    if (!lightbox) return;
    if (src && lightboxImg) lightboxImg.src = src;
    lightbox.classList.add('is-open');
    document.body.classList.add('is-locked');
    zoom = 1; panX = 0; panY = 0; applyTransform();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    if (!isAnyModalOpen()) document.body.classList.remove('is-locked');
  }
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open-lightbox]');
    if (opener) {
      e.preventDefault();
      const src = opener.dataset.img || (opener.querySelector('img') ? opener.querySelector('img').src : '');
      openLightbox(src);
      return;
    }
    if (e.target.closest('[data-close-lightbox]')) { e.preventDefault(); closeLightbox(); return; }
    const zb = e.target.closest('[data-zoom]');
    if (zb) {
      e.preventDefault();
      const op = zb.dataset.zoom;
      if (op === '+') zoom = Math.min(zoom + 0.25, 4);
      else if (op === '-') zoom = Math.max(zoom - 0.25, 1);
      else { zoom = 1; panX = 0; panY = 0; }
      applyTransform();
    }
  });
  if (lightboxViewport) {
    lightboxViewport.addEventListener('wheel', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      zoom = Math.min(Math.max(zoom + delta, 1), 4);
      applyTransform();
    }, { passive: false });
    lightboxViewport.addEventListener('mousedown', (e) => {
      if (zoom <= 1) return;
      isPanning = true; startX = e.clientX - panX; startY = e.clientY - panY;
      lightboxViewport.classList.add('is-grabbing');
    });
    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      panX = e.clientX - startX; panY = e.clientY - startY; applyTransform();
    });
    window.addEventListener('mouseup', () => {
      isPanning = false; lightboxViewport.classList.remove('is-grabbing');
    });
  }

  /* Pause hero video on slow networks */
  try {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || (conn.effectiveType && /^(2g|slow-2g)$/.test(conn.effectiveType)))) {
      const v = document.querySelector('.hero__video');
      if (v) { v.pause(); v.removeAttribute('autoplay'); }
    }
  } catch (_) {}

  /* ========== PROJECTS MODAL ========== */
  const projectsModal = document.getElementById('projectsModal');
  function openProjects() {
    if (!projectsModal) return;
    projectsModal.classList.add('is-open');
    document.body.classList.add('is-locked');
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-projects]')) { e.preventDefault(); openProjects(); }
  });

  /* ========== WEBGL AURORA (pricing section background) ==========
     Self-contained fragment shader, no libraries. Flowing emerald light
     with gold bands. Falls back silently if WebGL is unavailable, and
     pauses under prefers-reduced-motion.                                */
  (function () {
    const canvas = document.getElementById('pricingAurora');
    if (!canvas) return;
    let gl = null;
    try { gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'); } catch (_) {}
    if (!gl) { canvas.style.display = 'none'; return; }

    const vs = 'attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }';
    const fs = [
      'precision highp float;',
      'uniform vec2 u_res; uniform float u_time; uniform float u_reveal;',
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }',
      'float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);',
      '  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }',
      'float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p=p*2.02+vec2(1.7,9.2); a*=0.5; } return v; }',
      'void main(){',
      '  vec2 uv = gl_FragCoord.xy / u_res.xy;',
      '  vec2 q = uv; q.x *= u_res.x/u_res.y;',
      '  float t = u_time*0.06;',
      '  float f = fbm(q*1.7 + vec2(t*0.6, -t*0.35));',
      '  float g = fbm(q*2.7 + f*1.4 - vec2(t*0.5, t*0.7));',
      '  vec3 deep  = vec3(0.015,0.088,0.070);',
      '  vec3 green = vec3(0.040,0.240,0.190);',
      '  vec3 gold  = vec3(0.950,0.800,0.340);',
      '  vec3 col = mix(deep, green, smoothstep(0.20,0.96,f));',
      // flowing gold ribbons
      '  float ribbon = smoothstep(0.52,0.97,g) * (0.55 + 0.45*sin(u_time*0.40 + uv.y*6.0 + f*4.0));',
      '  col += gold * ribbon * (0.30 + 0.45*u_reveal);',
      // soft bloom at the centre that grows as the section reveals
      '  float d = length(uv - vec2(0.5,0.42));',
      '  col += gold * smoothstep(0.75,0.0,d) * 0.14 * u_reveal;',
      // subtle sparkle
      '  float spk = pow(noise(uv*u_res.xy*0.35 + u_time*2.0), 22.0);',
      '  col += gold * spk * 0.35 * u_reveal;',
      '  col *= 0.52 + 0.62*smoothstep(1.2,0.12,d);',
      '  gl_FragColor = vec4(col,1.0);',
      '}'
    ].join('\n');

    function sh(type, src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s; }
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display='none'; return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uReveal = gl.getUniformLocation(prog, 'u_reveal');
    let reveal = 0;   // ramps 0 -> 1 the first time the section is on screen

    function resize(){
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
      const h = canvas.clientHeight || canvas.offsetHeight || 480;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0,0,canvas.width,canvas.height);
    }
    window.addEventListener('resize', resize);

    // Only animate while the section is on screen (saves battery)
    let visible = false, running = false;
    const start = performance.now();
    function frame(now){
      if (!visible || prm) { running = false; if (prm) drawOnce(now); return; }
      const t = (now - start)/1000;
      reveal += (1 - reveal) * 0.02;   // smooth ease toward full bloom
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uReveal, reveal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    }
    function drawOnce(now){
      const t = ((now||performance.now()) - start)/1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uReveal, prm ? 1 : reveal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    resize();
    drawOnce();
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        visible = e.isIntersecting;
        if (visible && !running && !prm) { running = true; requestAnimationFrame(frame); }
      });
    }, { threshold: 0.02 });
    io.observe(canvas);
  })();

})();
