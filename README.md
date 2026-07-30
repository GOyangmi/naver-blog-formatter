# 원문결 문단 정리기

원문의 단어와 문장부호를 바꾸지 않고 공백과 줄바꿈만 정리하는 정적 웹사이트입니다. 입력 데이터는 서버로 전송되지 않습니다.

## 현재 사전 설정

- GitHub 계정: `GOyangmi`
- 저장소 이름: `naver-blog-formatter`
- 사용자 도메인: `subpathlaboratory.com`
- Google AdSense: `ca-pub-5607762816055463`
- 공개 방식: GitHub Pages `main / (root)`

## 가장 빠른 배포

Windows에서 압축을 푼 폴더의 `DEPLOY-NOW.cmd`를 더블클릭합니다.

최초 실행 시 브라우저가 열리면 `GOyangmi` GitHub 계정 로그인을 승인하세요. 그 뒤 스크립트가 다음을 자동 처리합니다.

1. Git 및 GitHub CLI 설치 확인
2. GitHub 브라우저 로그인
3. `GOyangmi/naver-blog-formatter` 공개 저장소 생성 또는 업데이트
4. 전체 파일 업로드
5. GitHub Pages 활성화
6. `subpathlaboratory.com` 사용자 도메인 요청
7. AdSense 게시자 ID, 계정 메타 태그, `ads.txt` 반영
8. `sitemap.xml`, `robots.txt`, `CNAME`, DNS 안내 파일 생성

로그인 계정이나 설정값을 바꾸려면 `DEPLOY.cmd`를 실행합니다.

## 배포 후 필요한 계정 화면 작업

코드로 대신할 수 없는 두 단계가 남습니다.

1. 도메인 관리 화면에서 `DNS-SETUP.txt`의 A 레코드와 `www` CNAME을 등록합니다. Google Workspace의 MX/TXT 레코드는 삭제하지 마세요.
2. AdSense의 **Sites**에서 `subpathlaboratory.com`을 추가하고 검토를 요청한 뒤, **Ads**에서 Auto ads를 켭니다.

## 광고 배치 원칙

AdSense 광고 스크립트는 고정된 자체 콘텐츠가 있는 다음 페이지에서만 로드됩니다.

- `index.html`
- `guide.html`
- `preservation.html`

사용자가 임의의 원문을 붙이는 `formatter.html`과 개인정보 처리방침·약관·문의 페이지에는 광고 스크립트가 로드되지 않습니다.

## 파일 구조

- `index.html`: 소개와 사용 안내
- `formatter.html`: 광고 없는 문단 정리 도구
- `guide.html`: 네이버 블로그 가독성 가이드
- `preservation.html`: 원문 보존 검증 방식
- `privacy.html`, `terms.html`, `contact.html`: 운영 정책 페이지
- `assets/config.js`: 도메인과 AdSense 설정
- `configure-site.ps1`: 설정 파일 자동 생성
- `deploy-github-pages.ps1`: GitHub 저장소와 Pages 자동 배포
- `DEPLOY-NOW.cmd`: 사전 설정값으로 즉시 배포
- `DNS-SETUP.txt`: 등록할 DNS 값

## 로컬 테스트

```powershell
python -m http.server 8080
```

기능 테스트:

```powershell
node test-formatter.js
```

## 운영자

Subpath Laboratory · Jaesic
