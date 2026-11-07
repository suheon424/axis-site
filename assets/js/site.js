/* axis site — interactions (vanilla JS, no build step) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Design tokens (from Figma "axis Design System") ---------- */
  const PALETTE = [
    ['gray01', '#F4F5FA'], ['gray02', '#EDEEF6'], ['gray03', '#CCD1DD'], ['gray04', '#BDC3D0'], ['gray05', '#A3AAB5'],
    ['gray06', '#636C78'], ['gray07', '#1F2027'], ['gray08', '#181920'], ['gray09', '#0F1014'],
    ['blue01', '#D3EBFF'], ['blue02', '#A0D5FF'],
    ['category/01', '#EDAA00'], ['category/02', '#004FED'], ['category/03', '#009156'],
    ['category/04', '#AFAFAF'], ['category/05', '#FF6002'], ['category/06', '#E00000'],
    ['graphite/BG', '#0A0C10'], ['graphite/Card', '#151920'],
  ];
  const SEMANTIC = [
    ['text/primary', '#1F2027', '제목 · 본문 기본 글자'], ['text/secondary', '#636C78', '보조 설명 · 메타 정보'],
    ['text/brand', '#004FED', '강조 · 링크 · 선택'], ['text/danger', '#E00000', '오류 · 경고 글자'],
    ['bg/subtle', '#F4F5FA', '카드 · 입력창 배경'], ['bg/dark', '#0A0C10', '다크 화면 배경 (홈)'],
    ['brand/primary', '#004FED', '주요 버튼 · 핵심 강조'], ['brand/subtle', '#D3EBFF', '브랜드 연한 배경'],
    ['status/danger', '#E00000', '오류 · Pace(지연)'], ['status/warning', '#FF6002', '주의 · 인기'],
    ['status/success', '#009156', '완료 · Plan B'], ['border/default', '#CCD1DD', '입력창 · 카드 테두리'],
  ];
  const TYPE = [
    ['Title/28 Bold', '28px / 130%', 28, 700, 1.3, '히어로 숫자 · 포인트'],
    ['Title/22 Bold', '22px / 130%', 22, 700, 1.3, '화면 대제목'],
    ['Title/20 Bold', '20px / 130%', 20, 700, 1.3, '섹션 제목'],
    ['Title/18 Bold', '18px / 130%', 18, 700, 1.3, '카드 제목 · 내비게이션'],
    ['Body/16 SemiBold', '16px / 140%', 16, 600, 1.4, '목록 제목 · 버튼'],
    ['Body/16 Medium', '16px / 150%', 16, 500, 1.5, '목록 제목 · 버튼'],
    ['Body/14 SemiBold', '14px / 150%', 14, 600, 1.5, '본문 · 보조 설명'],
    ['Body/14 Medium', '14px / 150%', 14, 500, 1.5, '본문 · 보조 설명'],
    ['Body/14 Regular', '14px / 140%', 14, 400, 1.4, '본문 · 보조 설명'],
    ['Caption/12 SemiBold', '12px / 140%', 12, 600, 1.4, '캡션 · 태그 · 메타 정보'],
    ['Caption/12 Medium', '12px / 136%', 12, 500, 1.36, '캡션 · 태그 · 메타 정보'],
    ['Caption/12 Regular', '12px / 140%', 12, 400, 1.4, '캡션 · 태그 · 메타 정보'],
  ];
  const SPACING = [[4, '아이콘-글자'], [8, '요소 사이'], [12, '목록 행 안'], [16, '카드 안쪽'], [20, '화면 여백'], [24, '그룹 사이'], [32, '섹션 사이'], [48, '큰 구분']];
  const RADIUS = [['4', '태그', '4px'], ['8', '칩 · 작은 버튼', '8px'], ['12', '카드 · 버튼', '12px'], ['20', '시트 · 모달', '20px'], ['full', '알약 · 아바타', '999px']];
  const WRITING = [
    ['해요체로 다정하게', '“일정을 담았어요”', '“일정이 추가되었습니다.”'],
    ['한 문장에 하나의 정보', '“친구 3명 초대를 달성하면”', '“친구 3명을 초대하고 가입 완료 시 리워드가 지급됩니다”'],
    ['결과를 버튼 이름으로', '“이 일정만 삭제”', '“확인”'],
    ['부정보다 다음 행동', '“아직 선택하지 않았어요”', '“선택된 항목 없음”'],
    ['숫자는 바로 읽히게', '“4일 남음 · 60% 완료”', '“종료까지 D-4 / 달성률: 0.6”'],
    ['기능 이름은 고유명사로', '“Pace · Plan B · J모드”', '“속도 조절 기능, 대체 일정 기능”'],
  ];

  /* Tab icons exported from Figma (Icon 하단 탭). ac = 사선(브랜드), bs = 기본 */
  const ICONS = {
    home: { label: '홈', d: [
      ['ac', 'M9.75635 19.1402L8.1586 21.4241L7.00635 23.0752H9.01935L10.1716 21.4241L17.2088 11.3583L16.1996 9.92194L9.75635 19.1402Z'],
      ['bs', 'M17.2057 8.48276L12 1.07513L1.00825 16.7269L1 23.0751H4.52275L5.67775 21.4241H5.67225H2.65275L2.65825 17.2497L12 3.94518L16.1993 9.92191L17.2085 11.3583L21.35 17.2497V21.4241H17.8603H14.6263H10.1712L9.019 23.0751H9.679H14.6263H17.8603H23V16.7269L18.215 9.91916L17.2057 8.48276Z']] },
    ai: { label: 'AI 플래너', d: [
      ['ac', 'M14.4797 7.86689V6.75781L9.33062 14.4801H9.32512L7.86652 16.668V16.6763L7.86377 16.6818V19.6595L7.86652 19.654L9.51776 17.1771L14.6228 9.51813H14.4797V7.86689Z'],
      ['bs', 'M16.1308 7.25544V7.24719V1H7.8664V7.8664H1V16.1308H5.77208L6.8729 14.4796H2.65124V9.51764H7.8664H9.51764V7.8664V2.65124H14.4796V6.75732V7.8664V9.51764H14.6227H16.1308H21.3488V14.4796H16.1308H14.4796V16.1308V21.3488H9.51764V17.1766L7.8664 19.6535V23H16.1308V16.1308H23V7.8664H16.1308V7.25544Z']] },
    explore: { label: '탐색', d: [
      ['ac', 'M14.7945 3.07654L11.709 7.70204L8.03778 13.2103L3.90728 19.4033L1.50928 22.9975H3.49203L6.51978 18.4545L16.3455 3.72554C15.8533 3.46429 15.3335 3.24704 14.7945 3.07654Z'],
      ['bs', 'M23 12C23 5.92525 18.0748 1 12 1C5.92525 1 1 5.92525 1 12C1 14.0873 1.583 16.0398 2.595 17.7008L3.629 16.1525C2.99375 14.871 2.65275 13.4548 2.65275 12C2.65 6.84375 6.84375 2.65 12 2.65C12.9735 2.65 13.9113 2.7985 14.794 3.07625C15.333 3.24675 15.8527 3.464 16.345 3.72525C19.3178 5.29275 21.35 8.414 21.35 12C21.35 16.9775 17.467 21.0723 12.506 21.3363H12.4592C12.2942 21.3472 12.1485 21.35 12.011 21.35H11.9725H11.9698H4.59425L3.49425 23H12C12 23 12.0055 23 12.011 23C12.187 23 12.363 22.9945 12.539 22.9862H12.5473C18.369 22.7002 23 17.8932 23 12Z']] },
    event: { label: '이벤트', d: [
      ['ac', 'M8.32275 23.501H10.4301L11.6348 21.776L19.6186 10.3623V7.6368V7.35217L9.53025 21.776L8.32275 23.501Z'],
      ['bs', 'M23.5 7.34929V5.62429H17.4999C17.7931 5.12117 17.9627 4.53754 17.9627 3.91367C17.9627 2.02767 16.4332 0.498169 14.5472 0.498169C13.5324 0.498169 12.621 0.943794 11.9971 1.64817C11.3733 0.946669 10.4647 0.498169 9.44987 0.498169C7.56387 0.498169 6.03725 2.03054 6.03725 3.91367C6.03725 4.53754 6.20688 5.12117 6.50012 5.62142H0.5V7.34642H2.65625V23.4982H6.2155L7.423 21.7732H4.38125V7.34929H19.6187V21.776H11.6349L10.4274 23.501H21.3409V7.34929H23.4971H23.5ZM11.1346 3.91367V5.60417H9.44987C8.51837 5.60417 7.75937 4.84517 7.75937 3.91367C7.75937 2.98217 8.51837 2.22317 9.44987 2.22317C10.3814 2.22317 11.1174 2.96204 11.1375 3.87629C11.1375 3.88779 11.1375 3.89642 11.1375 3.90792L11.1346 3.91367ZM14.5501 5.60129H12.8654V3.91367C12.8654 3.91367 12.8654 3.89067 12.8654 3.87917C12.8826 2.96204 13.633 2.22317 14.553 2.22317C15.473 2.22317 16.2435 2.98217 16.2435 3.91367C16.2435 4.84517 15.4845 5.60417 14.553 5.60417L14.5501 5.60129Z']] },
    my: { label: '마이', d: [
      ['ac', 'M9.99722 21.351L16.1514 12.1184C16.1514 12.1184 16.1432 12.1184 16.1404 12.1184H14.1696L8.01547 21.351L6.91602 23.0002H8.89777L9.99722 21.351Z'],
      ['bs', 'M16.1407 10.4694H7.86187C4.05777 10.4694 0.976562 13.5506 0.976562 17.352V23.0004H4.46732L5.56677 21.3512H2.62574V17.352C2.62574 14.4659 4.97306 12.1186 7.85912 12.1186H16.138C16.138 12.1186 16.1462 12.1186 16.149 12.1186C19.0295 12.1241 21.3714 14.4714 21.3714 17.352V21.3512H9.9948L8.89535 23.0004H23.0205V17.352C23.0205 13.5506 19.9393 10.4694 16.138 10.4694H16.1407Z'],
      ['bs', 'M8.93054 7.97888H15.0682C15.5245 7.97888 15.8928 7.61057 15.8928 7.1543V1.00012H8.10596V7.1543C8.10596 7.61057 8.47427 7.97888 8.93054 7.97888ZM9.75513 2.6493H14.2436V6.32971H9.75513V2.6493Z']] },
  };
  const icon = key => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[key].d.map(([c, d]) => `<path class="${c}" d="${d}"/>`).join('')}</svg>`;
  const CHARS = Array.from({ length: 12 }, (_, i) => `assets/char/${String(i + 1).padStart(2, '0')}.png`);

  /* ---------- Render design-guide content ---------- */
  const fill = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };
  fill('[data-palette]', PALETTE.map(([n, h]) =>
    `<button type="button" class="swatch" data-copy="${h}" data-cursor="복사"><i style="--c:${h}"></i><span><b>${n}</b><small>${h}</small></span></button>`).join(''));
  fill('[data-semantic]', SEMANTIC.map(([n, h, u]) =>
    `<div class="token"><i style="--c:${h}"></i><div><b>${n}</b><small>${u}</small></div></div>`).join(''));
  fill('[data-type]', TYPE.map(([n, m, s, w, lh, u]) =>
    `<div class="type-row"><div><b>${n}</b><br><small>${u}</small></div><small>${m}</small><p style="font-size:${s}px;font-weight:${w};line-height:${lh}">오늘의 계획을 axis와 함께</p></div>`).join(''));
  fill('[data-spacing]', SPACING.map(([s, u]) => `<div class="sp" title="${u}"><i style="--s:${s}px"></i>${s}</div>`).join(''));
  fill('[data-radius]', RADIUS.map(([n, u, r]) => `<div class="rd"><i style="--r:${r}"></i>${n}<small>${u}</small></div>`).join(''));
  fill('[data-icons]', Object.keys(ICONS).map(k => `<button type="button" class="icon-cell">${icon(k)}${k}_on</button>`).join(''));
  fill('[data-chars]', CHARS.map((src, i) => `<figure><img src="${src}" alt="캐릭터 ${i + 1}" loading="lazy">${String(i + 1).padStart(2, '0')}</figure>`).join(''));
  fill('[data-writing]', `<div class="w-row w-row--head"><span>원칙</span><span>이렇게 써요</span><span>이렇게 쓰지 않아요</span></div>` +
    WRITING.map(([p, d, n]) => `<div class="w-row"><b>${p}</b><span class="do">${d}</span><span class="dont">${n}</span></div>`).join(''));
  fill('[data-marquee]', [...CHARS, ...CHARS].map(src => `<img src="${src}" alt="" loading="lazy">`).join(''));

  /* ---------- Tab bars ---------- */
  $$('[data-tabbar]').forEach(bar => {
    bar.setAttribute('role', 'tablist');
    bar.innerHTML = Object.keys(ICONS).map((k, i) =>
      `<button type="button" role="tab" aria-selected="${i === 0}">${icon(k)}<span>${ICONS[k].label}</span></button>`).join('');
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', bar).forEach(x => x.setAttribute('aria-selected', x === b));
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target.classList.contains('line') ? en.target.firstElementChild : en.target;
      el.classList.add('is-in'); revealIO.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  $$('[data-reveal]').forEach(el => {
    const parent = el.parentElement;
    // 줄 단위 리빌: 잘린 부모(.line)를 관찰해요 (자식은 overflow로 가려져 교차 판정이 안 돼요)
    if (parent.classList.contains('line')) {
      const li = $$('.line', parent.parentElement).indexOf(parent);
      if (li > 0) el.style.setProperty('--d', `${li * 0.12}s`);
      revealIO.observe(parent); return;
    }
    const sib = $$(':scope > [data-reveal]', parent);
    const i = sib.indexOf(el); if (i > 0) el.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`);
    revealIO.observe(el);
  });

  /* ---------- Count-up ---------- */
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return; io.disconnect();
      if (reduce) { el.textContent = to; return; }
      const t0 = performance.now();
      const step = t => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    io.observe(el);
  });

  /* ---------- Side nav: active section + progress ---------- */
  const sections = $$('[data-section]');
  const navLinks = $$('[data-nav]');
  const navBar = $('.sidenav__bar');
  const setActive = id => navLinks.forEach(a => a.classList.toggle('is-active', a.dataset.nav === id));

  /* ---------- Horizontal pinned scroll (interaction) ---------- */
  const pin = $('[data-hscroll]');
  const track = pin && $('.ix-track', pin);
  const ixProg = pin && $('.ix-progress');
  let maxX = 0;
  const measure = () => {
    if (!pin) return;
    maxX = Math.max(0, track.scrollWidth - innerWidth + ($('.sidenav')?.offsetWidth || 0));
    pin.style.setProperty('--pin-h', `${innerHeight + maxX}px`);
  };

  const guide = $('#guide .guide__cover');
  const onScroll = () => {
    const y = scrollY, vh = innerHeight;
    // active section
    let cur = sections[0].id;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= vh * 0.45) cur = s.id; });
    setActive(cur);
    const max = document.documentElement.scrollHeight - vh;
    navBar.style.setProperty('--progress', `${max > 0 ? (y / max) * 100 : 0}%`);
    // dark cover → nav contrast
    if (guide) { const r = guide.getBoundingClientRect(); document.body.classList.toggle('on-dark', r.top < vh * 0.5 && r.bottom > vh * 0.5); }
    // pinned horizontal track
    if (pin) {
      const r = pin.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      track.style.setProperty('--tx', `${-p * maxX}px`);
      ixProg.style.setProperty('--ix', `${p * 100}%`);
    }
  };
  measure(); onScroll();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { measure(); onScroll(); });
  addEventListener('load', () => { measure(); onScroll(); });

  /* ---------- Phone tilt follows mouse ---------- */
  const phone = $('[data-tilt]');
  if (phone && !reduce) {
    $('.hero').addEventListener('mousemove', e => {
      const r = phone.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      phone.style.setProperty('--ry', `${-8 + dx * 18}deg`); phone.style.setProperty('--rx', `${4 - dy * 12}deg`);
    });
  }

  /* ---------- Cursor follower ---------- */
  const cursor = $('.cursor');
  const cLabel = $('.cursor__label');
  if (cursor && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let x = -100, y = -100, cx = x, cy = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cursor.classList.add('is-on'); });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
    const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cursor.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor]');
      const label = t && t.dataset.cursor;
      cursor.classList.toggle('is-big', !!label);
      cLabel.textContent = label || '';
    });
  }

  /* ---------- Feature list hover preview ---------- */
  const prev = $('.feature-preview');
  $$('.feature').forEach(f => {
    f.addEventListener('mouseenter', () => { prev.src = f.dataset.preview; prev.classList.add('is-on'); });
    f.addEventListener('mouseleave', () => prev.classList.remove('is-on'));
    f.addEventListener('mousemove', e => { prev.style.left = `${e.clientX + 120}px`; prev.style.top = `${e.clientY}px`; });
  });

  /* ---------- Toast ---------- */
  const toastEl = $('[data-toast-el]');
  let toastT;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2200); };
  $$('[data-toast]').forEach(b => b.addEventListener('click', () => toast(b.dataset.toast)));

  /* Copy hex */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const v = b.dataset.copy;
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast(`${v} 를 복사했어요`), () => toast(v));
  });

  /* ---------- Ripple ---------- */
  $$('[data-ripple]').forEach(b => b.addEventListener('pointerdown', e => {
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) / 2, d = document.createElement('i');
    d.className = 'ripple'; Object.assign(d.style, { width: `${s}px`, height: `${s}px`, left: `${e.clientX - r.left - s / 2}px`, top: `${e.clientY - r.top - s / 2}px` });
    b.appendChild(d); setTimeout(() => d.remove(), 700);
  }));

  /* ---------- Segmented tab ---------- */
  const SEG_MSG = ['계획서 3개를 모았어요', '후기 12개가 있어요', '댓글 5개가 달렸어요'];
  $$('[data-seg]').forEach(seg => {
    const btns = $$('button', seg), out = seg.parentElement.querySelector('[data-seg-out]');
    btns.forEach((b, i) => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-selected', x === b));
      seg.style.setProperty('--i', i);
      if (out) { out.textContent = SEG_MSG[i]; out.classList.remove('swap'); void out.offsetWidth; out.classList.add('swap'); }
    }));
  });

  /* ---------- Pace slider ---------- */
  const pace = $('[data-pace]');
  if (pace) {
    const num = $('[data-pace-num]'), fillEl = $('[data-pace-fill]'), msg = $('[data-pace-msg]'), box = pace.closest('.pace-demo');
    const upd = () => {
      const v = +pace.value; num.textContent = v; fillEl.style.setProperty('--p', `${v}%`);
      const daysLeft = Math.max(0, Math.round((100 - v) / 10));
      const late = v < 40;
      box.classList.toggle('is-late', late);
      msg.textContent = v >= 100 ? '모든 일정을 마쳤어요' : late ? `조금 늦어지고 있어요 · ${v}% 완료` : `${daysLeft}일 남음 · ${v}% 완료`;
    };
    pace.addEventListener('input', upd); upd();
  }

  /* ---------- Event pop + sparks ---------- */
  $$('[data-event] button').forEach(b => b.addEventListener('click', () => {
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    if (reduce) return;
    const demo = b.closest('.ix-card__demo'), dr = demo.getBoundingClientRect(), br = b.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('i'); s.className = 'spark';
      const a = (Math.PI * 2 * i) / 10, dist = 50 + Math.random() * 30;
      s.style.left = `${br.left - dr.left + br.width / 2}px`; s.style.top = `${br.top - dr.top + br.height / 2}px`;
      s.style.setProperty('--x', `${Math.cos(a) * dist}px`); s.style.setProperty('--y', `${Math.sin(a) * dist}px`);
      if (i % 3 === 0) s.style.background = '#A0D5FF';
      demo.appendChild(s); setTimeout(() => s.remove(), 800);
    }
  }));

  /* ---------- Guestbook (saved in this browser) ---------- */
  const KEY = 'axis-guestbook-v1';
  const form = $('[data-gb-form]'), list = $('[data-gb-list]'), total = $('[data-gb-total]'), count = $('[data-gb-count]');
  const charsBox = $('[data-gb-chars]');
  charsBox.innerHTML = CHARS.map((src, i) =>
    `<label title="캐릭터 ${i + 1}"><input type="radio" name="char" value="${i}" ${i === 0 ? 'checked' : ''}><img src="${src}" alt="캐릭터 ${i + 1}"></label>`).join('');

  const SEED = [
    { id: 's1', name: 'axis', char: 7, msg: '오늘의 계획을 axis와 함께 해요. 첫 한마디를 남겨 주세요!', t: Date.parse('2026-11-07T09:00:00+09:00'), seed: true },
  ];
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = arr => { try { localStorage.setItem(KEY, JSON.stringify(arr)); return true; } catch { return false; } };
  const fmt = t => { const d = new Date(t); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

  const render = newId => {
    const items = [...load(), ...SEED].sort((a, b) => b.t - a.t);
    total.textContent = items.length;
    list.innerHTML = items.length ? items.map(it => `
      <li class="gb-card${it.id === newId ? ' is-new' : ''}">
        <div class="gb-card__who"><img src="${CHARS[it.char] || CHARS[0]}" alt=""><div><b>${esc(it.name)}</b><small>${fmt(it.t)}</small></div></div>
        <p>${esc(it.msg)}</p>
        ${it.seed ? '' : `<button type="button" class="gb-card__del" data-del="${it.id}">이 글만 삭제</button>`}
      </li>`).join('') : '<li class="gb-empty">아직 남겨진 이야기가 없어요. 첫 한마디를 남겨 주세요.</li>';
  };
  form.elements.msg.addEventListener('input', e => { count.textContent = `${e.target.value.length}/80`; });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const F = form.elements, name = F.name.value.trim(), msg = F.msg.value.trim();
    if (!name || !msg) { toast('이름과 메시지를 적어 주세요'); return; }
    const it = { id: Date.now().toString(36), name, msg, char: +(F.char.value || 0), t: Date.now() };
    const arr = load(); arr.push(it);
    if (!save(arr)) { toast('이 브라우저에서는 저장할 수 없어요'); return; }
    F.msg.value = ''; count.textContent = '0/80';
    render(it.id); toast('방명록을 남겼어요');
  });
  list.addEventListener('click', e => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    if (!confirm('이 글을 삭제할까요?')) return;
    save(load().filter(x => x.id !== b.dataset.del)); render(); toast('이 글만 삭제했어요');
  });
  render();
})();
