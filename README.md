# 블로거를 위한 안내서

블로그를 처음 쓰는 사람을 위한 안내서와, 그 내용을 실제로 확인할 수 있는 도구 세 가지를 모은 정적 사이트입니다.
서버가 없고 런타임 의존성도 없습니다. 브라우저에서 바로 돌아갑니다.

주소: <https://subpathlaboratory.com>

## 구성

| 페이지 | 내용 | 광고 |
|---|---|---|
| `index.html` | 블로그 시작 안내서 (12개 절, 단독 스크롤 페이지) | O |
| `readability.html` | 가독성 진단 — 100점 만점 점수와 개선 지점 | O |
| `proofread.html` | 오탈자·맞춤법 점검 — 200개 이상 규칙 | O |
| `formatter.html` | 문단 정리 — 원문 보존 검증 포함 | O |
| `about` `privacy` `terms` `contact` `404` | 소개·정책 페이지 | X |

## 원칙

- **입력한 글을 서버로 보내지 않습니다.** 코드에 `fetch`, `XMLHttpRequest`, `sendBeacon`, `form action`이 하나도 없습니다.
- **글을 대신 고치지 않습니다.** 문제로 보이는 곳을 근거와 함께 보여 주고, 반영 여부는 사용자가 고릅니다.
- **문단 정리기는 원문을 검증합니다.** 공백류를 제외한 모든 문자를 처리 전후로 대조해, 하나라도 다르면 사용을 막습니다.

## 개발

```bash
node tools/build.js       # src/ 본문 + tools/pages.js 메타 → 루트 HTML 생성
node test-formatter.js    # 문단 정리 엔진 테스트
node test-proofread.js    # 오탈자 엔진 테스트
node test-readability.js  # 가독성 엔진 테스트
python3 -m http.server 8899   # 로컬 확인
```

### 페이지 구조

루트의 `*.html`은 **생성물입니다. 직접 고치지 마세요.**

- 본문을 고치려면 `src/<이름>.html` (본문 조각만 들어 있음)
- 제목·설명·광고 여부·메뉴를 고치려면 `tools/pages.js`
- 고친 뒤 `node tools/build.js`

`sitemap.xml`, `robots.txt`, `ads.txt`, `assets/config.js`도 빌드 때 함께 생성됩니다.

### 엔진

| 파일 | 역할 |
|---|---|
| `assets/readability-core.js` | 가독성 분석 (문장·문단 길이, 번역투, 어미 반복, 강조) |
| `assets/proofread-core.js` | 맞춤법·띄어쓰기·외래어·문장부호 규칙 |
| `assets/formatter-core.js` | 문단 나눔과 줄바꿈, 원문 보존 검증 |

엔진은 브라우저와 Node 양쪽에서 동작하며, UI 없이 단독으로 테스트할 수 있습니다.

오탈자 규칙을 추가하려면 `assets/proofread-core.js`의 `SPELLING_ERRORS`, `LOANWORDS` 배열에
`['틀린 표기', '맞는 표기', '왜 그런지 설명']` 한 줄을 넣으면 됩니다.
한국어 활용형은 어미의 첫 자음이 앞 글자에 붙는 경우가 많으니(`되어지` + `ㅂ니다` → `되어집니다`),
합쳐진 형태를 별도 항목으로 넣고 **긴 것을 먼저** 두세요.

## 배포

GitHub Pages(`main` 브랜치 루트)로 서비스합니다. `main`에 푸시하면 자동으로 다시 빌드됩니다.

### 커스텀 도메인으로 옮기기

1. Cloudflare DNS에 `DNS-SETUP.txt`의 A 레코드 4개와 `www` CNAME 등록 (프록시는 **DNS only / 회색 구름**)
2. `tools/pages.js`의 `SITE.url`을 `https://subpathlaboratory.com`으로 변경
3. 루트에 `CNAME` 파일을 만들고 `subpathlaboratory.com` 한 줄 입력
4. `node tools/build.js` 실행 후 커밋·푸시
5. 저장소 Settings → Pages에서 커스텀 도메인과 HTTPS 적용 확인

## 광고

Google AdSense Auto ads (`ca-pub-5607762816055463`). 남은 계정 작업은 `ADSENSE-CHECKLIST.md`를 참고하세요.

## 운영자

Subpath Laboratory · Jaesic
