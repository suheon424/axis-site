# axis-site

- `/` (`index.html`) : axis 앱 소개 PC 사이트 — 앱 소개 · 디자인 가이드 · 인터렉션 · 방명록
  - 스타일/스크립트: `assets/css/site.css`, `assets/js/site.js` (빌드 없음, 정적 파일)
  - 토큰·아이콘·캐릭터는 Figma "axis Design System"에서 가져왔어요 (`assets/char`, `assets/event`, `assets/logo-*.svg`)
  - 방명록 글은 이 브라우저(localStorage)에 저장돼요
- `guestbook/` : 축하 메시지 + 사진 방명록 (이 브라우저에 저장, zip으로 내보내기)
- `camera/` : 카메라로 사진을 찍어 기기에 저장하는 테스트 페이지 (서버 없음, 브라우저에서만 동작)
