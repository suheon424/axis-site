/* axis site — interactions (vanilla JS, no build step) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 빠진 이미지는 숨김 (깨진 아이콘 대신 빈 자리) */
  $$('img').forEach(img => {
    const miss = () => img.classList.add('miss');
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) miss();
    img.addEventListener('error', miss);
  });

  /* 플로팅 내비: 현재 섹션 표시 + 이동 */
  const links = $$('.fnav a');
  const setOn = key => links.forEach(a => a.classList.toggle('on', a.dataset.t === key));
  const navSecs = $$('[data-nav]');
  const pickActive = () => {
    const mid = innerHeight * 0.4;
    let cur = null;
    for (const s of navSecs) { const r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) { cur = s.dataset.nav; break; } }
    setOn(cur);
    tone();
  };
  /* 배너 아래에 깔린 섹션에 따라 밝은 회색 / 어두운 배경으로 바꿔요 */
  const fnav = $('.fnav'), fnavBox = $('.fnav nav'), allSecs = $$('.sec');
  const tone = () => {
    if (!fnav || !fnavBox) return;
    const r = fnavBox.getBoundingClientRect(), z = parseFloat(getComputedStyle(fnav).zoom) || 1;
    /* 브라우저마다 zoom 적용 여부가 달라서, 실제 그려진 폭으로 판단해요 */
    const k = Math.abs(r.width - fnavBox.offsetWidth * z) < 2 ? 1 : z;
    const y = (r.top + r.height / 2) * k;
    let sec = null;
    for (const s of allSecs) { const b = s.getBoundingClientRect(); if (b.top <= y && b.bottom > y) { sec = s; break; } }
    const atTop = !!sec && sec.classList.contains('s-top');
    /* top 화면만 흰 배너 + TOP 버튼 숨김, 어두운 섹션은 어둡게, 나머지는 모두 밝은 회색 */
    const t = atTop ? '' : (sec && sec.dataset.fnav === 'dark' ? 'dark' : 'gray');
    fnav.classList.toggle('gray', t === 'gray'); fnav.classList.toggle('dark', t === 'dark');
    fnav.classList.toggle('attop', atTop);
  };
  addEventListener('scroll', pickActive, { passive: true });
  addEventListener('resize', pickActive);
  pickActive();
  links.forEach(a => a.addEventListener('click', e => {
    const t = document.getElementById(a.getAttribute('href').slice(1));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', a.getAttribute('href'));
  }));
  $('.fnav .top').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* 스크롤 등장: 섹션마다 글(라벨·제목·설명)이 먼저, 이어서 콘텐츠가 하나씩 */
  const SKIP = new Set(['s-top', 's-poster', 's-cam', 's-list', 's-mock']);
  const TEXT_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'SPAN', 'BUTTON']);
  const isText = el => el.dataset.g ? el.dataset.g === 't'
    : (TEXT_TAGS.has(el.tagName) && !el.classList.contains('bubble')) || el.matches('.head, .sc-copy, .sol-mini, .copy');
  const items = [];
  $$('.sec').forEach(sec => {
    if ([...sec.classList].some(c => SKIP.has(c))) return;
    const pick = parent => [...parent.children].forEach(el => {
      if (el.hasAttribute('data-norv') || el.classList.contains('lines')) return;
      if (el.hasAttribute('data-stagger')) return pick(el);
      el.classList.add('rv'); items.push(el);
    });
    pick(sec);
  });
  items.forEach((el, i) => { el._rvText = isText(el); el._rvOrder = el.dataset.o ? +el.dataset.o : 100 + i; });
  const show = list => {
    list.sort((a, b) => (b._rvText - a._rvText) || a._rvOrder - b._rvOrder);
    const hasText = list.some(el => el._rvText);
    let k = 0;
    list.forEach(el => {
      const d = el._rvText ? 0 : (hasText ? 450 : 0) + k++ * 160;
      el.style.transitionDelay = d + 'ms';
      el.classList.add('in');
      setTimeout(() => { el.style.transitionDelay = ''; }, d + 800);
    });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      const hit = es.filter(e => e.isIntersecting).map(e => e.target);
      hit.forEach(el => io.unobserve(el));
      if (hit.length) show(hit);
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach(el => io.observe(el));
    /* 영상은 화면에 보일 때만 재생 */
    const vio = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); } else v.pause();
    }), { threshold: 0.15 });
    $$('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); vio.observe(v); });
  } else {
    items.forEach(el => el.classList.add('in'));
  }

  /* 상단 큐브: 맨 위에 멈춰 있을 때만 마우스 조작을 받아요.
     스크롤 중에는 휠이 큐브 확대로 새지 않게 잠시 막아요. */
  const topCube = $('.s-top .cube iframe');
  if (topCube) {
    let lastScroll = 0, tmr;
    const arm = () => {
      clearTimeout(tmr);
      topCube.style.pointerEvents = 'none';
      if (scrollY > 4) return;
      tmr = setTimeout(() => { if (scrollY <= 4 && Date.now() - lastScroll >= 700) topCube.style.pointerEvents = 'auto'; }, 720);
    };
    const bump = () => { lastScroll = Date.now(); arm(); };
    addEventListener('scroll', bump, { passive: true });
    addEventListener('wheel', bump, { passive: true });
    arm();
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 포지셔닝: axis 앱 아이콘이 도장처럼 찍히고 파랗게 빛나요 */
  const appIc = $('.axis-app .ic');
  if (appIc && !reduce && 'IntersectionObserver' in window) {
    appIc.classList.add('pre');
    let busy = false;
    const none = '0 0 0 0 rgba(0,79,237,0)';
    new IntersectionObserver(es => es.forEach(async e => {
      if (!e.isIntersecting || busy) return;
      busy = true;
      appIc.getAnimations().forEach(a => a.cancel());
      appIc.classList.add('pre');
      await wait(1100);
      appIc.classList.remove('pre');
      appIc.animate([
        { opacity: 0, transform: 'scale(2)', boxShadow: none },
        { opacity: 1, transform: 'scale(.9)', offset: .6, boxShadow: none },
        { opacity: 1, transform: 'scale(1.04)', offset: .8, boxShadow: none },
        { opacity: 1, transform: 'scale(1)', boxShadow: none }
      ], { duration: 480, easing: 'cubic-bezier(.3,0,.2,1)' });
      await wait(470);
      await appIc.animate([
        { boxShadow: none },
        { boxShadow: '0 0 80px 16px rgba(0,79,237,.95)', offset: .4 },
        { boxShadow: '0 0 40px 4px rgba(0,79,237,.7)' }
      ], { duration: 1200, easing: 'ease-out' }).finished;
      busy = false;
    }), { threshold: .5 }).observe(appIc);
  }

  /* 아이콘: 큰 칸에 상단 아이콘 5개를 차례로 그려요 */
  const panel = $('.iconpanel');
  if (panel && !reduce && 'IntersectionObserver' in window) {
    const groups = $$('.dg', panel);
    const run = (els, from, to, ms, delay = 0) => Promise.all(els.map(el =>
      el.animate([{ strokeDashoffset: from }, { strokeDashoffset: to }], { duration: ms, delay, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' }).finished));
    let seen = false, started = false;
    new IntersectionObserver(es => es.forEach(e => {
      seen = e.isIntersecting;
      if (seen && !started) { started = true; loop(); }
    }), { threshold: .3 }).observe(panel);
    async function loop() {
      for (;;) {
        for (const g of groups) {
          const black = $$('.dk', g), blue = $$('.db', g);
          g.style.opacity = 1;
          await run(black, 1, 0, 1100);
          await run(blue, 1, 0, 380);
          await wait(900);
          await Promise.all([run(blue, 0, -1, 380), run(black, 0, -1, 620, 120)]);
          g.style.opacity = 0;
          await wait(150);
        }
        while (!seen) await wait(400);
      }
    }
  }

  /* 포스터: 가운데 큰 포스터가 1일부터 30일까지 차례로 바뀌고, 양옆 줄도 함께 넘어가요 */
  const pmain = $('.pmain');
  if (pmain) {
    const tracks = $$('.s-poster .ptrack');
    const imgs = $$('img', pmain);
    const STEP = 238.036, N = 30;
    let cur = 0, front = 0;
    const place = (jump) => {
      tracks.forEach((t, k) => {
        t.classList.toggle('jump', !!jump);
        const first = k === 0 ? N + cur - 3 : N + cur + 1;
        t.style.transform = `translateX(${-first * STEP}px)`;
      });
    };
    const showMain = () => {
      const next = imgs[1 - front];
      const n = (cur % N) + 1;
      next.src = `assets/img/poster-l-${String(n).padStart(2, '0')}.jpg`;
      next.alt = `axis 포스터 ${n}일`;
      const swap = () => { next.classList.add('on'); imgs[front].classList.remove('on'); imgs[front].alt = ''; front = 1 - front; };
      if (next.complete && next.naturalWidth) swap(); else next.onload = swap;
    };
    place(true);
    if (!reduce) {
      let vis = false;
      if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; }), { threshold: .2 }).observe(pmain);
      let tm, busy = false;
      const go = d => {
        if (busy) return; busy = true; setTimeout(() => { busy = false; }, 450);
        if (d < 0 && cur <= 0) { cur = N; place(true); void tracks[0].offsetWidth; }
        cur += d;
        place(false); showMain();
        if (cur >= N) setTimeout(() => { if (cur >= N) { cur -= N; place(true); } }, 1000);
      };
      const auto = () => { clearInterval(tm); tm = setInterval(() => { if (vis) go(1); }, 2400); };
      auto();
      /* 스와이프(드래그)나 트랙패드 가로 스크롤로 포스터를 직접 넘길 수 있어요 */
      const sec = $('.s-poster');
      let sx = null, sy = 0;
      sec.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; sec.classList.add('drag'); });
      const end = e => {
        sec.classList.remove('drag');
        if (sx === null) return;
        const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(dx < 0 ? 1 : -1); auto(); }
      };
      sec.addEventListener('pointerup', end);
      sec.addEventListener('pointercancel', () => { sx = null; sec.classList.remove('drag'); });
      sec.addEventListener('dragstart', e => e.preventDefault());
      let wx = 0, wt;
      sec.addEventListener('wheel', e => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        wx += e.deltaX; clearTimeout(wt); wt = setTimeout(() => { wx = 0; }, 200);
        if (Math.abs(wx) > 60) { go(wx > 0 ? 1 : -1); wx = 0; auto(); }
      }, { passive: false });
    }
  }

  /* 타이포그래피: English ↔ Korean 번갈아 보여 주기 */
  const typeSec = $('.s-type');
  if (typeSec) {
    const chips = $$('.chip[data-lang]', typeSec);
    let ko = false, tm;
    const setLang = v => { ko = v; typeSec.classList.toggle('ko-on', ko); chips.forEach(c => c.classList.toggle('on', (c.dataset.lang === 'ko') === ko)); };
    const loop = () => { clearInterval(tm); tm = setInterval(() => setLang(!ko), 2200); };
    chips.forEach(c => c.addEventListener('click', () => { setLang(c.dataset.lang === 'ko'); loop(); }));
    loop();
  }

  /* 나만의 움직임: 설명 → 나만의 → 움직임 순으로 나오고, 셋이 함께 사라지면
     휴대폰 영상이 한 번 재생돼요. 이 흐름을 계속 반복해요. */
  const ix = $('.s-ix'), mov = $('.s-ix .mov');
  if (ix && mov) {
    const words = [$('.w1', ix), $('.w2', ix), $('.w3', ix)].filter(Boolean);
    if (reduce || !('IntersectionObserver' in window)) { mov.loop = true; mov.play().catch(() => {}); }
    else {
      ix.classList.add('seq');
      let run = 0;
      const ended = () => new Promise(r => {
        const done = () => { mov.removeEventListener('ended', done); r(); };
        mov.addEventListener('ended', done);
      });
      const reset = () => { mov.pause(); try { mov.currentTime = 0; } catch (_) {} words.forEach(w => w.classList.remove('on', 'off')); };
      const loop = async id => {
        while (id === run) {
          reset();
          await wait(400);
          for (const w of words) { if (id !== run) return; w.classList.add('on'); await wait(700); }
          await wait(900);
          if (id !== run) return;
          words.forEach(w => w.classList.add('off'));
          await wait(550);
          if (id !== run) return;
          const end = ended();
          mov.play().catch(() => {});
          await end;
        }
      };
      new IntersectionObserver(es => es.forEach(e => {
        const id = ++run;
        if (!e.isIntersecting) { reset(); return; }
        loop(id);
      }), { threshold: .45 }).observe(ix);
    }
  }

  /* 슬래시 버튼: 화면에 보일 때만 반복 재생해요 */
  const onScreen = (el, fn) => {
    let seen = false, running = false;
    new IntersectionObserver(es => es.forEach(e => {
      seen = e.isIntersecting;
      if (seen && !running) { running = true; (async () => { while (seen) await fn(); running = false; })(); }
    }), { threshold: .3 }).observe(el);
  };
  const mbti = $('.mbti'), login = $('.login');
  if (mbti && !reduce) onScreen(mbti, async () => {
    const opts = $$('.o', mbti);
    opts.forEach(o => o.classList.remove('on')); mbti.classList.remove('done');
    await wait(900);
    for (const k of [0, 3, 5, 6]) { opts[k].classList.add('on'); await wait(650); }
    mbti.classList.add('done');
    await wait(2200);
  });
  if (login && !reduce) onScreen(login, async () => {
    const dots = $$('.dots circle', login);
    dots.forEach(d => d.classList.remove('on')); login.classList.remove('typing', 'done');
    await wait(1000);
    login.classList.add('typing'); await wait(350);
    for (const d of dots) { d.classList.add('on'); await wait(260); }
    await wait(250);
    login.classList.add('done');
    await wait(2400);
  });
  if (!reduce) $$('.seg').forEach((s, i) => onScreen(s, async () => { await wait(1800 + i * 300); s.classList.toggle('alt'); }));

  /* 진행 캘린더: 날짜 칸 상태를 차례로 보여 주기 */
  const tile = $('.ctile');
  if (tile) {
    const cell = $('.cell', tile), num = $('.n', tile), cap = $('.cap', tile);
    const STATES = [['s5', '2', '진행 중'], ['s3', '9', '완료(100%)'], ['s4', '23', '오늘'], ['s1', '16', '일정 없음'], ['s2', '15', '시작 전 (0%)']];
    let i = 0;
    setInterval(() => {
      tile.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % STATES.length;
        const [c, n, t] = STATES[i];
        cell.className = 'cell ' + c; num.textContent = n; cap.textContent = t;
        tile.classList.remove('out');
      }, 260);
    }, 1800);
  }

  /* ───────── 방명록 ───────── */
  /* 글과 사진은 Supabase에 저장돼서 어느 기기에서 열어도 같은 방명록이 보여요.
     삭제 열쇠는 글을 쓴 브라우저에만 남아서, 그 브라우저에서만 지울 수 있어요. */
  const SB = 'https://mmhhibevzfbhjjuxkcul.supabase.co';
  const SBK = 'sb_publishable_4KdBUWT9je0K_I-pWnZU_g_tJz-hTtN';
  const MINE = 'axis-guestbook-mine', CACHE = 'axis-guestbook-cache';
  const getJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const setJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const mine = getJSON(MINE, {});
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
  const api = (path, opt = {}) => fetch(SB + path, { ...opt, headers: { apikey: SBK, ...(opt.headers || {}) } }).then(async r => {
    if (!r.ok) throw new Error(r.status + ' ' + (await r.text().catch(() => '')));
    return r.status === 204 ? null : r.json().catch(() => null);
  });
  const fmtDate = iso => { const d = new Date(iso); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };
  const postedAt = {}; // 이 브라우저에서 방금 올린 글의 올린 시각
  const toEntry = r => ({ id: r.id, name: r.name || '익명', msg: r.msg, photo: r.photo_url || '', date: fmtDate(r.created_at), at: postedAt[r.id] || Date.parse(r.created_at) || 0, mine: !!mine[r.id] });
  let entries = getJSON(CACHE, []).map(toEntry);
  let loading = false;
  async function refresh() {
    if (loading) return; loading = true;
    try {
      const rows = await api('/rest/v1/guestbook?select=id,name,msg,photo_url,created_at&order=created_at.desc&limit=500');
      setJSON(CACHE, rows);
      entries = rows.map(toEntry);
      render();
    } catch (err) { console.warn('방명록을 불러오지 못했어요', err); }
    finally { loading = false; }
  }

  const camBox = $('#camBox'), video = $('#camVideo'), camMsg = $('#camMsg'), camCount = $('#camCount'), flash = $('#camFlash');
  const shutter = $('#shutter'), preview = $('#preview'), pvEmpty = $('#pvEmpty');
  const nameEl = $('#gbName'), msgEl = $('#gbMsg'), countEl = $('#gbCount'), noPhoto = $('#gbNoPhoto'), submit = $('#gbSubmit'), toast = $('#gbToast');
  let stream = null, photo = '', busy = false;

  const setMsg = (title, sub) => { camMsg.hidden = false; camMsg.innerHTML = ''; camMsg.append(title); if (sub) { const s = document.createElement('small'); s.textContent = sub; camMsg.append(s); } };

  async function startCam() {
    if (stream) return true;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setMsg('카메라를 쓸 수 없어요', 'https 주소에서 열어 주세요. 사진 없이도 글을 남길 수 있어요.'); return false; }
    setMsg('카메라를 켜는 중…');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' }, audio: false });
      video.srcObject = stream; video.hidden = false; await video.play().catch(() => {});
      camMsg.hidden = true; camBox.setAttribute('aria-label', '카메라 화면');
      return true;
    } catch (err) {
      setMsg('카메라를 켜지 못했어요', err && err.name === 'NotAllowedError' ? '브라우저에서 카메라 권한을 허용해 주세요.' : '카메라가 연결돼 있는지 확인해 주세요.');
      return false;
    }
  }
  camBox.addEventListener('click', startCam);
  camBox.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startCam(); } });

  shutter.addEventListener('click', async () => {
    if (busy) return;
    if (!(await startCam())) return;
    busy = true;
    camCount.hidden = false;
    for (const n of [3, 2, 1]) { camCount.textContent = n; await wait(700); }
    camCount.hidden = true;
    const w = 960, h = Math.round(w * (video.videoHeight || 9) / (video.videoWidth || 16));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'); ctx.translate(w, 0); ctx.scale(-1, 1); ctx.drawImage(video, 0, 0, w, h); ctx.setTransform(1, 0, 0, 1, 0, 0);
    studioTone(c, ctx);
    flash.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => flash.classList.remove('on')));
    photo = c.toDataURL('image/jpeg', 0.72);
    noPhoto.checked = false;
    showPreview();
    busy = false;
    validate();
  });

  /* 사진관 느낌 흑백 보정: 밝고 부드럽게, 피부는 환하게, 그림자는 살짝 들어 올려요 */
  const TONE = (() => {
    const t = new Uint8ClampedArray(256);
    for (let i = 0; i < 256; i++) {
      let v = i / 255;
      v = Math.pow(v, 0.8);                         // 중간 톤(피부)을 밝게
      v = v * v * (3 - 2 * v) * 0.5 + v * 0.5;      // 부드러운 S커브로 머리·옷의 검정은 또렷하게
      v = 0.025 + v * 0.965;                        // 검정은 아주 살짝만 띄우고 흰색은 날리지 않게
      t[i] = Math.round(Math.min(1, v) * 255);
    }
    return t;
  })();
  function studioTone(c, ctx) {
    const { width: w, height: h } = c;
    const img = ctx.getImageData(0, 0, w, h), d = img.data, n = d.length / 4;
    const Y = new Uint8Array(n), hist = new Uint32Array(256);
    for (let i = 0, j = 0; j < n; i += 4, j++) { const y = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) | 0; Y[j] = y; hist[y]++; }
    /* 자동 레벨: 카메라·조명마다 다른 밝기를 펴서, 가장 어두운 곳은 검정, 가장 밝은 곳은 흰색이 되게 해요 */
    let lo = 0, hi = 255, acc = 0;
    for (; lo < 255; lo++) { acc += hist[lo]; if (acc > n * 0.01) break; }
    for (acc = 0; hi > 0; hi--) { acc += hist[hi]; if (acc > n * 0.005) break; }
    if (hi - lo < 40) { lo = 0; hi = 255; }
    const map = new Uint8ClampedArray(256);
    for (let v = 0; v < 256; v++) map[v] = TONE[Math.max(0, Math.min(255, Math.round((v - lo) * 255 / (hi - lo))))];
    for (let i = 0, j = 0; j < n; i += 4, j++) d[i] = d[i + 1] = d[i + 2] = map[Y[j]];
    ctx.putImageData(img, 0, 0);
    /* 부드러운 빛번짐으로 피부결을 매끈하게 */
    const g = document.createElement('canvas'); g.width = w; g.height = h;
    const gx = g.getContext('2d'); gx.filter = 'blur(7px)'; gx.drawImage(c, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.16; ctx.drawImage(g, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.25; ctx.drawImage(g, 0, 0); ctx.restore();
  }

  function showPreview() {
    $$('.shot-img, .retake', preview).forEach(n => n.remove());
    pvEmpty.hidden = !!photo;
    if (!photo) return;
    const img = new Image(); img.className = 'shot-img'; img.alt = '촬영한 사진'; img.src = photo;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'retake'; b.textContent = '지우기';
    b.addEventListener('click', () => { photo = ''; showPreview(); validate(); });
    preview.append(img, b);
  }

  function validate() {
    countEl.textContent = `${msgEl.value.length}/80`;
    submit.disabled = !(msgEl.value.trim() && (photo || noPhoto.checked));
  }
  [nameEl, msgEl].forEach(el => el.addEventListener('input', validate));
  noPhoto.addEventListener('change', () => { if (noPhoto.checked && photo) { photo = ''; showPreview(); } validate(); });

  const today = () => { const d = new Date(); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };
  let toastT;
  const say = t => { toast.textContent = t; clearTimeout(toastT); toastT = setTimeout(() => (toast.textContent = ''), 3500); };

  let sending = false;
  $('#gbForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (submit.disabled || sending) return;
    sending = true; submit.disabled = true; say('등록하는 중이에요…');
    const id = uuid(), token = uuid();
    try {
      let photo_url = null;
      if (photo) {
        const blob = await (await fetch(photo)).blob();
        await api(`/storage/v1/object/guestbook/${id}.jpg`, { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
        photo_url = `${SB}/storage/v1/object/public/guestbook/${id}.jpg`;
      }
      await api('/rest/v1/guestbook', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ id, name: nameEl.value.trim() || '익명', msg: msgEl.value.trim(), photo_url, owner_token: token }) });
      mine[id] = token; setJSON(MINE, mine);
      postedAt[id] = Date.now();
      entries = [{ id, name: nameEl.value.trim() || '익명', msg: msgEl.value.trim(), photo: photo_url || '', date: today(), at: postedAt[id], mine: true }, ...entries];
      say('방명록이 등록됐어요. 고마워요!');
      nameEl.value = ''; msgEl.value = ''; photo = ''; noPhoto.checked = false; showPreview();
      page = 1; render();
      $('.s-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
      refresh();
    } catch (err) {
      console.warn('방명록 등록 실패', err);
      say('등록하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.');
    } finally { sending = false; validate(); }
  });

  /* 목록 */
  const board = $('#board'), pager = $('#pager'), totalEl = $('#gbTotal'), filterEl = $('#gbFilter'), lb = $('#lightbox');
  const PER = 6;
  let page = 1, armed = null;
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* 올린 지 1분 안의 사진은 누구나 크게 볼 수 있고, 그 뒤로는 잠겨요 (?unlock 으로 푼 브라우저는 항상 볼 수 있어요) */
  const FRESH = 60 * 1000;
  let freshT;
  function render() {
    const f = filterEl.value;
    const list = entries.filter(e => f === 'all' || (f === 'photo' ? e.photo : !e.photo));
    totalEl.textContent = list.length;
    const pages = Math.max(1, Math.ceil(list.length / PER));
    page = Math.min(page, pages);
    const rows = list.slice((page - 1) * PER, page * PER);
    let html = '<div class="row hd"><div class="c-no">번호</div><div class="c-ph">사진</div><div class="c-tx">내용</div><div class="c-nm">작성자</div><div class="c-dt">등록일</div></div>';
    if (!rows.length) html += '<div class="none">아직 남겨진 이야기가 없어요.</div>';
    rows.forEach((e, i) => {
      const no = list.length - ((page - 1) * PER + i);
      const fresh = Date.now() - e.at < FRESH;
      const ph = e.photo ? `<div class="thumb"><img src="${e.photo}" alt="${esc(e.name)}님의 사진" data-zoom data-at="${e.at}"${fresh ? ' class="fresh"' : ''}></div>` : '–';
      const tag = e.photo ? '' : '<span class="tag">글만</span>';
      const del = e.mine ? `<button class="del" type="button" data-del="${e.id}">${armed === e.id ? '정말 삭제' : '삭제'}</button>` : '';
      html += `<div class="row"><div class="c-no">${no}</div><div class="c-ph">${ph}</div><div class="c-tx">${tag}<p title="${esc(e.msg)}">${esc(e.msg)}</p>${del}</div><div class="c-nm">${esc(e.name)}</div><div class="c-dt">${e.date}</div></div>`;
    });
    board.innerHTML = html;
    clearTimeout(freshT);
    const next = Math.min(...entries.map(e => e.at + FRESH).filter(t => t > Date.now()));
    if (isFinite(next)) freshT = setTimeout(render, next - Date.now() + 50);
    let p = `<button type="button" data-pg="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="이전">‹</button>`;
    const start = Math.max(1, Math.min(page - 1, pages - 3));
    for (let n = start; n <= Math.min(pages, start + 3); n++) p += `<button type="button" data-pg="${n}" class="${n === page ? 'on' : ''}">${n}</button>`;
    p += `<button type="button" data-pg="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="다음">›</button>`;
    pager.innerHTML = p;
    /* 글 수에 맞춰 번호를 목록 바로 아래에 두고, 섹션 높이도 맞춰요 (피그마: 목록 아래 48px, 번호 아래 100px) */
    const pt = board.offsetTop + board.offsetHeight + 48;
    pager.style.top = pt + 'px';
    pager.closest('.sec').style.height = (pt + 36 + 100) + 'px';
  }
  pager.addEventListener('click', e => { const b = e.target.closest('[data-pg]'); if (b && !b.disabled) { page = +b.dataset.pg; render(); } });
  filterEl.addEventListener('change', () => { page = 1; render(); });
  board.addEventListener('click', e => {
    const d = e.target.closest('[data-del]');
    if (d) {
      const id = d.dataset.del;
      if (armed !== id) { armed = id; render(); setTimeout(() => { if (armed === id) { armed = null; render(); } }, 3000); return; }
      armed = null;
      api('/rest/v1/rpc/delete_guestbook_entry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ p_id: id, p_token: mine[id] }) })
        .then(ok => {
          if (!ok) { say('이 글은 지울 수 없어요.'); return; }
          delete mine[id]; setJSON(MINE, mine);
          entries = entries.filter(x => x.id !== id); render();
        })
        .catch(err => { console.warn('삭제 실패', err); say('삭제하지 못했어요. 인터넷 연결을 확인해 주세요.'); });
      return;
    }
    const z = e.target.closest('[data-zoom]');
    if (z && (zoomOn || Date.now() - +z.dataset.at < FRESH)) { lb.querySelector('img').src = z.src; lb.classList.add('on'); }
  });
  lb.addEventListener('click', () => lb.classList.remove('on'));
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('on'); });

  /* 사진 확대는 기본으로 잠겨 있어요. 주소 끝에 ?unlock=비밀번호 를 붙여 열면 그 브라우저에서만 풀리고,
     ?lock 을 붙여 열면 다시 잠겨요. 비밀번호는 코드에 해시로만 들어 있어요. */
  const ZK = 'axis-zoom-unlock', ZH = '6cab0b347dbb36f79a74bbeef02715e2cc18d47b94553c8beea2b08788990ebd';
  let zoomOn = getJSON(ZK, false) === true;
  const applyZoom = () => document.documentElement.classList.toggle('zoom-on', zoomOn);
  applyZoom();
  (async () => {
    const q = new URLSearchParams(location.search);
    if (!q.has('unlock') && !q.has('lock')) return;
    if (q.has('lock')) { zoomOn = false; setJSON(ZK, false); say('사진 확대를 잠갔어요.'); }
    const code = q.get('unlock');
    if (code && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
      const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
      if (hex === ZH) { zoomOn = true; setJSON(ZK, true); say('사진 확대가 풀렸어요.'); }
    }
    applyZoom();
    history.replaceState(null, '', location.pathname + location.hash);
  })();

  render();
  validate();
  refresh();
  /* 전시장의 다른 기기에서 남긴 글도 보이도록 30초마다 새로 불러와요 */
  setInterval(() => { if (!document.hidden) refresh(); }, 30000);
})();
