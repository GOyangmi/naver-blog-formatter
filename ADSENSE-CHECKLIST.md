# Google AdSense 연결 체크리스트

## 코드에 이미 반영된 것

- 게시자 ID: `ca-pub-5607762816055463`
- `google-adsense-account` 계정 메타 태그 (전체 페이지)
- Auto ads 게시자 스크립트 로더 (`assets/adsense-loader.js`)
- 루트 `ads.txt`: `google.com, pub-5607762816055463, DIRECT, f08c47fec0942fa0`
- 개인정보 처리방침 — Google 광고의 쿠키·기기 정보 처리 고지 포함 (AdSense 필수 항목)
- 이용약관, 소개, 문의 페이지
- `robots.txt`, `sitemap.xml`

## 광고가 로드되는 페이지

| 페이지 | 성격 |
|---|---|
| `index.html` | 안내서 본문 (12개 절) |
| `readability.html` | 가독성 진단 도구 |
| `proofread.html` | 오탈자 점검 도구 |
| `formatter.html` | 문단 정리 도구 |

## 광고가 로드되지 않는 페이지

`about.html`, `privacy.html`, `terms.html`, `contact.html`, `404.html`

## 도구 페이지 광고에 대한 참고

도구 페이지에도 광고를 싣기로 했습니다. 사용자가 붙여 넣은 글은 브라우저 메모리에만 존재하고
페이지 소스에 포함되지 않으므로, Google 크롤러가 보는 것은 정적인 도구 UI뿐입니다.

다만 사용자가 정책상 허용되지 않는 내용을 붙여 넣은 화면 옆에 광고가 뜰 가능성은 남아 있습니다.
문제가 될 경우 `tools/pages.js`에서 해당 페이지의 `ads` 값을 `false`로 바꾸고
`node tools/build.js`를 실행하면 즉시 광고가 빠집니다.

## AdSense 계정에서 남은 작업

1. **Sites**에서 사이트를 추가합니다.
   - 커스텀 도메인 연결 전이라면 `goyangmi.github.io` (하위 경로는 입력할 수 없습니다)
   - 커스텀 도메인 연결 후에는 `subpathlaboratory.com`
2. 연결 방식에서 AdSense 코드 또는 메타 태그가 감지되는지 확인합니다.
3. 사이트 검토를 요청합니다.
4. 승인 후 **Ads**에서 사이트별 Auto ads를 켭니다.
5. **Privacy & messaging**에서 필요한 지역의 Google 인증 CMP 메시지를 설정합니다.
6. `ads.txt`가 열리는지 확인합니다.

> **중요:** `ads.txt`는 도메인 루트에서만 인식됩니다.
> `goyangmi.github.io/naver-blog-formatter/ads.txt`는 하위 경로라 인식되지 않고,
> `goyangmi.github.io/ads.txt`는 이 저장소가 제어할 수 없는 위치입니다.
> 광고 수익을 정상적으로 받으려면 커스텀 도메인(`subpathlaboratory.com`) 연결이 사실상 필요합니다.
> 연결 방법은 `README.md`와 `DNS-SETUP.txt`에 있습니다.

## 승인 심사에서 걸릴 수 있는 것

- **콘텐츠 분량** — 안내서 본문이 광고 대상 콘텐츠의 대부분입니다. 반려될 경우 절을 늘리거나
  실제 사례를 추가해 분량을 키우는 것이 가장 확실한 대응입니다.
- **연락처** — 문의 페이지의 메일 주소가 실제로 수신 가능해야 합니다.
- **중복 콘텐츠** — 다른 곳의 글을 옮겨 오지 마세요. 안내서 본문은 전부 이 사이트 고유 내용입니다.

## 주의

- 실제 광고 게재는 Google의 사이트 검토 및 정책 승인 이후에 시작됩니다.
- 승인 전에 광고 단위를 임의로 늘리거나 자기 광고를 클릭하지 마세요. 계정이 정지될 수 있습니다.
