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
  const KEY = 'axis-guestbook-v2';
  const SEED = [
    { id: 's24', name: '김하늘', msg: '졸업 전시 축하해요! 큐브에서 시작한 로고 이야기가 정말 인상적이었어요.', photo: '', date: '2026.11.21', seed: true },
    { id: 's23', name: '이준호', msg: '계획이 틀어져도 다시 맞추면 된다는 말이 오늘 제일 큰 위로가 됐어요.', photo: '', date: '2026.11.21', seed: true },
    { id: 's22', name: '박서연', msg: 'AI 재조정 기능 꼭 출시해 주세요. 내일부터 바로 쓰고 싶어요!', photo: '', date: '2026.11.21', seed: true },
    { id: 's21', name: '최민재', msg: '하단바 큐브 모션이 너무 귀여워요. 계속 눌러 보게 되네요 :)', photo: '', date: '2026.11.20', seed: true },
    { id: 's20', name: '정유나', msg: 'J가 되고 싶은 P로서 진심으로 응원합니다. 템플릿 아카이브 기대돼요.', photo: '', date: '2026.11.20', seed: true },
    { id: 's19', name: '한지우', msg: '영상부터 목업까지 완성도가 높아요. 그동안 고생 많으셨어요!', photo: '', date: '2026.11.20', seed: true },
  ];
  const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : null; } catch { return null; } };
  const save = arr => { try { localStorage.setItem(KEY, JSON.stringify(arr)); return true; } catch { return false; } };
  let entries = load() || SEED.slice();

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

  const wait = ms => new Promise(r => setTimeout(r, ms));
  shutter.addEventListener('click', async () => {
    if (busy) return;
    if (!(await startCam())) return;
    busy = true;
    camCount.hidden = false;
    for (const n of [3, 2, 1]) { camCount.textContent = n; await wait(700); }
    camCount.hidden = true;
    const w = 960, h = Math.round(w * (video.videoHeight || 9) / (video.videoWidth || 16));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'); ctx.filter = 'grayscale(1)'; ctx.translate(w, 0); ctx.scale(-1, 1); ctx.drawImage(video, 0, 0, w, h);
    flash.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => flash.classList.remove('on')));
    photo = c.toDataURL('image/jpeg', 0.72);
    noPhoto.checked = false;
    showPreview();
    busy = false;
    validate();
  });

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
    submit.disabled = !(nameEl.value.trim() && msgEl.value.trim() && (photo || noPhoto.checked));
  }
  [nameEl, msgEl].forEach(el => el.addEventListener('input', validate));
  noPhoto.addEventListener('change', () => { if (noPhoto.checked && photo) { photo = ''; showPreview(); } validate(); });

  const today = () => { const d = new Date(); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };
  let toastT;
  const say = t => { toast.textContent = t; clearTimeout(toastT); toastT = setTimeout(() => (toast.textContent = ''), 3500); };

  $('#gbForm').addEventListener('submit', e => {
    e.preventDefault();
    if (submit.disabled) return;
    const item = { id: 'u' + Date.now(), name: nameEl.value.trim(), msg: msgEl.value.trim(), photo, date: today(), mine: true };
    const next = [item, ...entries];
    if (!save(next)) {
      // 저장 공간이 부족하면 사진을 더 작게 줄여서 다시 시도
      if (photo) { item.photo = ''; if (!save(next)) { say('저장 공간이 부족해요. 오래된 글을 지워 주세요.'); return; } say('저장 공간이 부족해 사진 없이 등록했어요.'); }
      else { say('저장하지 못했어요.'); return; }
    } else say('방명록이 등록됐어요. 고마워요!');
    entries = next;
    nameEl.value = ''; msgEl.value = ''; photo = ''; noPhoto.checked = false; showPreview(); validate();
    page = 1; render();
    $('.s-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* 목록 */
  const board = $('#board'), pager = $('#pager'), totalEl = $('#gbTotal'), filterEl = $('#gbFilter'), lb = $('#lightbox');
  const PER = 6;
  let page = 1, armed = null;
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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
      const ph = e.photo ? `<div class="thumb"><img src="${e.photo}" alt="${esc(e.name)}님의 사진" data-zoom></div>` : '–';
      const tag = e.photo ? '' : '<span class="tag">글만</span>';
      const del = e.mine ? `<button class="del" type="button" data-del="${e.id}">${armed === e.id ? '정말 삭제' : '삭제'}</button>` : '';
      html += `<div class="row"><div class="c-no">${no}</div><div class="c-ph">${ph}</div><div class="c-tx">${tag}<p title="${esc(e.msg)}">${esc(e.msg)}</p>${del}</div><div class="c-nm">${esc(e.name)}</div><div class="c-dt">${e.date}</div></div>`;
    });
    board.innerHTML = html;
    let p = `<button type="button" data-pg="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="이전">‹</button>`;
    const start = Math.max(1, Math.min(page - 1, pages - 3));
    for (let n = start; n <= Math.min(pages, start + 3); n++) p += `<button type="button" data-pg="${n}" class="${n === page ? 'on' : ''}">${n}</button>`;
    p += `<button type="button" data-pg="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="다음">›</button>`;
    pager.innerHTML = p;
  }
  pager.addEventListener('click', e => { const b = e.target.closest('[data-pg]'); if (b && !b.disabled) { page = +b.dataset.pg; render(); } });
  filterEl.addEventListener('change', () => { page = 1; render(); });
  board.addEventListener('click', e => {
    const d = e.target.closest('[data-del]');
    if (d) {
      const id = d.dataset.del;
      if (armed !== id) { armed = id; render(); setTimeout(() => { if (armed === id) { armed = null; render(); } }, 3000); return; }
      entries = entries.filter(x => x.id !== id); armed = null; save(entries); render(); return;
    }
    const z = e.target.closest('[data-zoom]');
    if (z) { lb.querySelector('img').src = z.src; lb.classList.add('on'); }
  });
  lb.addEventListener('click', () => lb.classList.remove('on'));
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('on'); });

  render();
  validate();
})();
