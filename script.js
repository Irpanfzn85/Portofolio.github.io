(() => {
  /* ====== ISI BAGIAN INI ====== */
  const CONFIG = {
    whatsapp: "",   // format internasional tanpa +, contoh: "6281234567890"
    email: "",      // contoh: "nama@email.com"
    social: {
      instagram: "https://www.instagram.com/deipaan_",
      github: "",   // contoh: "https://github.com/username"
      linkedin: ""  // contoh: "https://linkedin.com/in/username"
    }
  };
  /* ============================ */

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Preloader: persen mengikuti pemuatan nyata (font, halaman, gambar utama).
     Tampil minimal MIN ms supaya animasi terlihat, dan maksimal MAX ms sebagai batas aman. */
  const intro = $('#intro');
  if (intro && root.classList.contains('intro-on')) {
    const MIN = 1400, MAX = 8000;
    const cnt = $('.intro-count', intro), line = $('.intro-ring', intro);
    const t0 = performance.now();
    let target = 0, shown = 0, left = false;

    const tasks = [
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })),
      ...$$('img').filter(i => i.loading !== 'lazy').map(i => i.complete ? Promise.resolve()
        : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))
    ];
    let ready = 0;
    tasks.forEach(p => p.then(() => { target = ++ready / tasks.length; }));
    setTimeout(() => { target = 1; }, MAX);

    const leave = () => {
      if (left) return;
      left = true;
      intro.classList.add('intro-leave');
      setTimeout(() => root.classList.remove('intro-on'), 600);  // hero mulai bergerak saat tirai terbuka
      setTimeout(() => intro.remove(), 1300);
    };
    const tick = now => {
      if (left) return;
      const goal = Math.min(target, Math.min(1, (now - t0) / MIN));
      shown += (goal - shown) * 0.12;
      if (goal === 1 && shown > 0.995) shown = 1;
      cnt.textContent = Math.round(shown * 100) + '%';
      line.style.setProperty('--p', shown);
      shown < 1 ? requestAnimationFrame(tick) : leave();
    };
    requestAnimationFrame(tick);
    intro.addEventListener('click', leave);
  }

  /* Tab skill */
  const tabs = $$('.skill-tabs [role="tab"]');
  const selectTab = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });

  /* Parallax hero + tilt foto About (hanya perangkat dengan mouse) */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    const hero = $('#home'), hv = $('.hero-visual');
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      hv.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5) * 2);
      hv.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5) * 2);
    });
    hero.addEventListener('pointerleave', () => { hv.style.setProperty('--mx', 0); hv.style.setProperty('--my', 0); });

    const fig = $('.about-photo'), tilt = $('.tilt', fig);
    fig.addEventListener('pointermove', e => {
      const r = fig.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
      tilt.style.setProperty('--gx', (x + 0.5) * 100 + '%');
      tilt.style.setProperty('--gy', (y + 0.5) * 100 + '%');
      tilt.classList.add('active');
    });
    fig.addEventListener('pointerleave', () => { tilt.style.transform = ''; tilt.classList.remove('active'); });
  }

  /* Tema gelap / terang */
  const themeBtn = $('#themeToggle');
  const themeIcon = () => themeBtn.innerHTML = `<i class="bi bi-${root.dataset.theme === 'dark' ? 'sun' : 'moon-stars'}"></i>`;
  themeIcon();
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    themeIcon();
  });

  /* Efek mengetik di hero */
  const roles = ['Mahasiswa Teknik Informatika', 'Designer', 'Street Photographer'];
  const typed = $('#typed');
  if (typed && !reduce) {
    let r = 0, c = 0, del = false;
    (function tick() {
      const w = roles[r];
      typed.textContent = w.slice(0, c);
      if (!del && c === w.length) { del = true; return setTimeout(tick, 1600); }
      if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 40 : 80);
    })();
  }

  /* Umur dihitung otomatis */
  $$('[data-age]').forEach(el => {
    const b = new Date(el.dataset.birth), n = new Date();
    let age = n.getFullYear() - b.getFullYear();
    if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) age--;
    el.textContent = age;
  });
  $('#year').textContent = new Date().getFullYear();

  /* Progress scroll, navbar, tombol ke atas */
  const bar = $('#progress'), nav = $('.navbar'), toTop = $('#toTop');
  let lastY = scrollY;
  const onScroll = () => {
    const h = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    nav.classList.toggle('scrolled', scrollY > 40);
    const dy = scrollY - lastY;
    if (Math.abs(dy) > 6) {
      const menuOpen = $('#navbarNav').classList.contains('show');
      nav.classList.toggle('nav-hidden', dy > 0 && scrollY > 200 && !menuOpen);
      lastY = scrollY;
    }
    toTop.classList.toggle('show', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* Menu aktif sesuai section */
  const links = $$('.navbar .nav-link');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => {
      const on = a.getAttribute('href') === '#' + e.target.id;
      a.classList.toggle('active', on);
      on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    });
    moveInd(current());
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.getAttribute('href')); if (s) spy.observe(s); });
  links.forEach(a => a.addEventListener('click', () => bootstrap.Collapse.getInstance('#navbarNav')?.hide()));

  /* Penanda menu yang meluncur */
  const list = $('#navLinks'), ind = $('.nav-indicator');
  const current = () => $('.navbar .nav-link.active');
  function moveInd(el) {
    if (!el) return ind.classList.remove('show');
    const first = !ind.classList.contains('show');
    if (first) ind.style.transition = 'none';
    ind.style.width = el.offsetWidth + 'px';
    ind.style.height = el.offsetHeight + 'px';
    ind.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`;
    if (first) { void ind.offsetWidth; ind.style.transition = ''; ind.classList.add('show'); }
  }
  links.forEach(a => {
    a.addEventListener('mouseenter', () => moveInd(a));
    a.addEventListener('focus', () => moveInd(a));
  });
  list.addEventListener('mouseleave', () => moveInd(current()));
  list.addEventListener('focusout', () => moveInd(current()));
  addEventListener('resize', () => moveInd(current()));
  $('#navbarNav').addEventListener('shown.bs.collapse', () => moveInd(current()));
  moveInd(current());
  document.fonts?.ready.then(() => moveInd(current()));

  /* Bar skill terisi saat terlihat + reveal */
  const once = (els, fn) => {
    const io = new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { fn(e.target); o.unobserve(e.target); }
    }), { threshold: 0.2 });
    els.forEach(el => io.observe(el));
  };
  $$('.skills').forEach(b => b.style.width = '0');
  once($$('.skills'), b => b.style.width = b.dataset.level + '%');
  /* Tandai konten agar muncul dengan animasi saat di-scroll (jeda bertahap per baris) */
  const tag = (sel, variant, step = 0.1, cols = 3) => $$(sel).forEach((el, i) => {
    el.classList.add('reveal');
    if (variant) el.classList.add(variant);
    el.style.setProperty('--d', (i % cols) * step + 's');
  });
  tag('#about .row > :nth-child(1)', 'reveal-left');
  tag('#about .row > :nth-child(2)', 'reveal-right');
  tag('#experience .container > *', '', 0.12, 4);
  tag('#keahlian .container > .text-center, .skill-tabs, .learning', '', 0.1, 3);
  tag('.skill-list li', 'reveal-zoom', 0.1);
  tag('#projects .row.text-center, .filters', '', 0.1, 2);
  tag('.project', 'reveal-zoom', 0.12);
  tag('.landing_page .left-one', 'reveal-left');
  tag('.landing_page .right-one', 'reveal-right');
  tag('.socialIcons a', 'reveal-zoom', 0.07, 5);
  tag('footer p');
  once($$('.reveal'), el => el.classList.add('in'));

  /* Filter proyek */
  const projects = $$('.project');
  const filterBtns = $$('.filters button');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', b === btn);
    });
    const f = btn.dataset.filter;
    projects.forEach(p => {
      const show = f === 'all' || p.dataset.cat === f;
      p.classList.toggle('d-none', !show);
      if (show) { p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); }
    });
  }));

  /* Lightbox */
  const lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  let items = [], idx = 0, opener = null;
  const show = i => {
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].src;
    lbImg.alt = lbCap.textContent = items[idx].alt;
  };
  const open = img => {
    items = $$('[data-zoom]').filter(i => !i.closest('.project').classList.contains('d-none'));
    opener = img;
    show(items.indexOf(img));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    opener?.focus();
  };
  $$('[data-zoom]').forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); } });
  });
  $('.lb-close', lb).addEventListener('click', close);
  $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* Carousel pengalaman: geser, klik, panah, otomatis */
  const stage = $('#expStage');
  if (stage) {
    const slides = $$('.exp-slide', stage), N = slides.length, count = $('#expCount');
    let cur = 0, dragX = 0, startX = 0, down = false, moved = false, downSlide = null, visible = false, timer;
    const pad = n => String(n).padStart(2, '0');
    const layout = () => {
      const step = slides[0].offsetWidth * 0.74;
      slides.forEach((s, i) => {
        const d = ((i - cur) % N + N + N / 2) % N - N / 2 + dragX / step;
        const a = Math.abs(d);
        s.style.transform = `translateX(${d * step}px) rotateY(${-d * 24}deg) scale(${1 - Math.min(a, 2) * 0.12})`;
        s.style.opacity = a > 1.6 ? 0 : 1 - a * 0.3;
        s.style.zIndex = 10 - Math.round(a);
        s.classList.toggle('is-active', i === cur);
        s.setAttribute('aria-hidden', i !== cur);
      });
      stage.style.height = Math.max(...slides.map(s => s.offsetHeight)) + 36 + 'px';
      count.textContent = `${pad(cur + 1)} / ${pad(N)}`;
    };
    const go = n => { cur = (n + N) % N; dragX = 0; layout(); };
    const pause = () => clearInterval(timer);
    const play = () => { pause(); if (!reduce && visible) timer = setInterval(() => go(cur + 1), 5500); };

    stage.addEventListener('pointerdown', e => {
      down = true; moved = false; startX = e.clientX;
      downSlide = e.target.closest('.exp-slide');
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('dragging');
    });
    stage.addEventListener('pointermove', e => {
      if (!down) return;
      dragX = e.clientX - startX;
      if (Math.abs(dragX) > 6) moved = true;
      layout();
    });
    const end = () => {
      if (!down) return;
      down = false;
      stage.classList.remove('dragging');
      if (Math.abs(dragX) > 60) go(cur - Math.sign(dragX));
      else if (!moved && downSlide) go(slides.indexOf(downSlide));
      else { dragX = 0; layout(); }
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') go(cur - 1);
      if (e.key === 'ArrowRight') go(cur + 1);
    });
    $('#expPrev').addEventListener('click', () => { go(cur - 1); play(); });
    $('#expNext').addEventListener('click', () => { go(cur + 1); play(); });
    ['pointerenter', 'focusin'].forEach(ev => stage.addEventListener(ev, pause));
    ['pointerleave', 'focusout'].forEach(ev => stage.addEventListener(ev, play));
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; play(); }, { threshold: 0.3 }).observe(stage);
    addEventListener('resize', layout);
    document.fonts?.ready.then(layout);
    layout();
  }

  /* Toast + form kontak (kirim lewat WhatsApp / email) */
  const toast = msg => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.id);
    toast.id = setTimeout(() => t.classList.remove('show'), 3500);
  };
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const nama = f.get('nama').trim(), email = f.get('email').trim(), pesan = f.get('pesan').trim();
    const text = `Halo Irfan, saya ${nama} (${email}).\n\n${pesan}`;
    if (CONFIG.whatsapp) {
      open_(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`);
    } else if (CONFIG.email) {
      location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent('Salam dari ' + nama)}&body=${encodeURIComponent(text)}`;
    } else {
      return toast('Isi nomor WhatsApp atau email di CONFIG pada script.js dulu.');
    }
    e.target.reset();
    toast('Terima kasih! Pesanmu siap dikirim.');
  });
  function open_(url) { window.open(url, '_blank', 'noopener'); }

  /* Link sosial: yang belum diisi otomatis disembunyikan */
  $$('[data-social]').forEach(a => {
    const k = a.dataset.social;
    const url = k === 'whatsapp' ? (CONFIG.whatsapp && `https://wa.me/${CONFIG.whatsapp}`)
              : k === 'email' ? (CONFIG.email && `mailto:${CONFIG.email}`)
              : CONFIG.social[k];
    if (!url) return a.remove();
    a.href = url;
    if (url.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
  });
})();
