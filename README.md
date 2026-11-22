# axis 사이트

axis(틀어져도 다시 맞추는 AI 플래너) 소개 PC 사이트예요. Figma 2000px 디자인을 그대로 옮겼고, 화면 폭에 맞춰 전체가 비율대로 줄어들어요.

- `index.html` · `assets/css/site.css` · `assets/js/site.js` — 빌드 없이 바로 열리는 정적 사이트
- `assets/img/` — Figma에서 뽑은 이미지
- `assets/svg/` — 로고·아이콘 벡터
- `assets/video/` — 영상 자리 (파일 이름은 그 폴더의 README 참고)
- 상단 큐브는 Spline 임베드(`my.spline.design`)이고, Spline 로고는 잘라서 가렸어요.
- 방명록은 카메라로 사진을 찍고(선택) 이름·메시지를 남기면 이 브라우저에 저장돼요. 카메라는 https 주소에서만 켜져요.
- `guestbook/`, `camera/` — 이전 방명록·카메라 테스트 페이지

로컬 미리보기: `python3 -m http.server` 후 http://localhost:8000
