/**
 * 사이트 전체 페이지 정보.
 * 여기만 고치면 헤더·푸터·사이트맵·메타 태그가 모든 페이지에 한꺼번에 반영됩니다.
 *
 *  file      생성될 파일 이름
 *  title     <title> 및 og:title (사이트 이름은 자동으로 붙습니다)
 *  desc      meta description 및 og:description
 *  ads       true면 AdSense 스크립트를 로드합니다
 *  scripts   본문 끝에 넣을 추가 스크립트
 *  sitemap   false면 sitemap.xml에서 제외합니다
 *  noindex   true면 검색 색인에서 제외합니다
 */

const SITE = {
  name: '블로거를 위한 안내서',
  tagline: 'Subpath Laboratory',
  mark: '안',

  /**
   * 사이트 주소. canonical, og:url, sitemap.xml, robots.txt에 쓰입니다.
   *
   * 커스텀 도메인(subpathlaboratory.com)으로 옮길 때 할 일은 두 가지입니다.
   *   1) 아래 url을 'https://subpathlaboratory.com' 으로 바꾸고
   *   2) CNAME 파일에 subpathlaboratory.com 한 줄을 넣은 뒤 node tools/build.js 실행
   * Cloudflare DNS 설정은 DNS-SETUP.txt를 참고하세요.
   */
  url: 'https://goyangmi.github.io/naver-blog-formatter',

  adsenseClient: 'ca-pub-5607762816055463',
  themeColor: '#0b7a46',
  email: 'goyangmi929@syuin.ac.kr',
  updatedAt: '2026-07-31'
};

/** 상단 주요 메뉴 — 안내서는 홈이고, 도구만 따로 페이지로 나갑니다. */
const NAV = [
  { file: 'index.html', label: '안내서' },
  { file: 'readability.html', label: '가독성 진단' },
  { file: 'proofread.html', label: '오탈자 점검' },
  { file: 'formatter.html', label: '문단 정리' }
];

/** 하단 메뉴 */
const FOOTER_NAV = [
  { file: 'about.html', label: '소개' },
  { file: 'privacy.html', label: '개인정보 처리방침' },
  { file: 'terms.html', label: '이용약관' },
  { file: 'contact.html', label: '문의' }
];

const PAGES = [
  {
    file: 'index.html',
    title: '블로그 처음 시작하는 사람을 위한 안내서',
    desc: '블로그를 처음 쓰는 사람이 알아야 할 것을 한 페이지에 정리했습니다. 주제 정하기, 제목 짓기, 글 구조, 문장과 문단 길이, 자주 틀리는 맞춤법, 발행 전 점검까지 순서대로 읽으면 됩니다.',
    ads: true,
    canonical: `${SITE.url}/`
  },
  {
    file: 'readability.html',
    title: '블로그 가독성 진단',
    desc: '붙여 넣은 글의 문장 길이, 문단 길이, 번역투, 강조 사용을 재서 100점 만점으로 가독성 점수를 매깁니다. 브라우저 안에서만 처리하며 서버로 보내지 않습니다.',
    ads: true,
    scripts: ['assets/readability-core.js', 'assets/readability.js']
  },
  {
    file: 'proofread.html',
    title: '오탈자·맞춤법 점검',
    desc: '자주 틀리는 맞춤법, 띄어쓰기, 외래어 표기, 문장부호를 한 번에 찾아 줍니다. 고칠 항목은 직접 고르고, 원문은 그대로 남습니다.',
    ads: true,
    scripts: ['assets/proofread-core.js', 'assets/proofread.js']
  },
  {
    file: 'formatter.html',
    title: '문단 정리기',
    desc: '문구와 문장부호는 바꾸지 않고 공백과 줄바꿈만 정리해 네이버 블로그에 붙여 넣기 좋은 문단으로 만듭니다.',
    ads: true,
    scripts: ['assets/formatter-core.js', 'assets/formatter.js']
  },
  {
    file: 'about.html',
    title: '소개',
    desc: '블로거를 위한 안내서가 어떤 사이트이고 무엇을 목표로 하는지 설명합니다.',
    ads: false
  },
  {
    file: 'privacy.html',
    title: '개인정보 처리방침',
    desc: '입력한 글을 서버로 보내지 않는 이유와, 광고·접속 로그에서 처리될 수 있는 정보를 설명합니다.',
    ads: false
  },
  {
    file: 'terms.html',
    title: '이용약관',
    desc: '블로거를 위한 안내서의 이용 조건과 책임 범위를 안내합니다.',
    ads: false
  },
  {
    file: 'contact.html',
    title: '문의',
    desc: '오류 제보와 개선 의견을 받는 방법을 안내합니다.',
    ads: false
  },
  {
    file: '404.html',
    title: '페이지를 찾을 수 없음',
    desc: '요청한 페이지를 찾을 수 없습니다.',
    ads: false,
    sitemap: false,
    noindex: true
  }
];

module.exports = { SITE, NAV, FOOTER_NAV, PAGES };
