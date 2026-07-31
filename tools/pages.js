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
 *  updated   글 최종 수정일 (문서 페이지에 표시)
 */

const SITE = {
  name: '블로거를 위한 안내서',
  tagline: 'Subpath Laboratory',
  mark: '안',
  url: 'https://subpathlaboratory.com',
  adsenseClient: 'ca-pub-5607762816055463',
  themeColor: '#0b7a46',
  email: 'goyangmi929@syuin.ac.kr',
  updatedAt: '2026-07-31',

  /**
   * 네이버 서치어드바이저 사이트 소유확인 코드.
   * searchadvisor.naver.com → 웹마스터 도구 → 사이트 등록 → HTML 태그 방식을 고르면
   * <meta name="naver-site-verification" content="여기값"> 를 줍니다.
   * 그 content 값만 아래에 붙여 넣고 node tools/build.js 를 실행하면 전 페이지에 들어갑니다.
   */
  naverVerification: 'f95cd8cff8f9c1d1b2e30820de944524888a32e8'
};

/** 상단 주요 메뉴 */
const NAV = [
  { file: 'index.html', label: '안내서' },
  { file: 'guides.html', label: '글쓰기 문서' },
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

/**
 * 글쓰기 문서 목록. guides.html 목록과 각 문서의 이전·다음 이동에 함께 쓰입니다.
 * 순서가 곧 읽는 순서입니다.
 */
const ARTICLES = [
  {
    file: 'guide-platform.html',
    group: '시작하기',
    title: '블로그 플랫폼 고르기',
    lead: '네이버 블로그, 티스토리, 브런치, 워드프레스, 벨로그, 미디엄을 검색 유입·수익화·이전 가능성 기준으로 비교했습니다.',
    desc: '네이버 블로그, 티스토리, 브런치, 워드프레스, 벨로그, 미디엄의 차이를 검색 유입, 수익화 방법, 글 이전 가능성 기준으로 정리했습니다. 처음 블로그를 시작할 때 어디에 쓸지 고르는 기준입니다.',
    minutes: 9
  },
  {
    file: 'guide-first-post.html',
    group: '시작하기',
    title: '첫 글 쓰기',
    lead: '무엇을 쓸지 정하는 법부터 초고를 끝까지 쓰는 순서까지. 첫 글에서 막히는 지점을 하나씩 풉니다.',
    desc: '블로그 첫 글을 무엇으로 쓸지 정하는 방법과, 초고를 끝까지 밀고 나가는 순서를 정리했습니다. 소재를 찾는 구체적인 질문 목록도 함께 담았습니다.',
    minutes: 8
  },
  {
    file: 'guide-topic.html',
    group: '시작하기',
    title: '소재 찾기와 주제 정하기',
    lead: '쓸 게 없다는 말은 대개 사실이 아닙니다. 이미 가진 것에서 소재를 꺼내는 방법을 정리했습니다.',
    desc: '블로그 소재가 떠오르지 않을 때 쓰는 발굴 방법과, 하나의 글에 하나의 주제를 담는 기준을 정리했습니다. 소재 목록을 관리하는 방법도 함께 다룹니다.',
    minutes: 7
  },
  {
    file: 'guide-title.html',
    group: '글 쓰기',
    title: '제목 짓기',
    lead: '제목은 본문보다 훨씬 많이 읽힙니다. 낚시 없이 클릭을 만드는 제목의 구조를 예문으로 봅니다.',
    desc: '검색에 걸리면서도 과장하지 않는 블로그 제목 짓는 법. 좋은 제목과 아쉬운 제목을 나란히 놓고 왜 차이가 나는지 설명합니다.',
    minutes: 8
  },
  {
    file: 'guide-structure.html',
    group: '글 쓰기',
    title: '글의 구조 잡기',
    lead: '도입에서 붙잡고, 소제목으로 길을 내고, 마무리에서 하나만 남기는 방법입니다.',
    desc: '읽히는 글의 뼈대를 세우는 방법. 도입 세 문장, 소제목을 나누는 기준, 마무리에서 해야 할 일을 예문과 함께 정리했습니다.',
    minutes: 9
  },
  {
    file: 'guide-lead.html',
    group: '글 쓰기',
    title: '도입부 쓰는 법',
    lead: '"안녕하세요 여러분"으로 시작하면 왜 이탈하는지, 대신 무엇을 쓸지 다섯 가지 방식으로 정리했습니다.',
    desc: '블로그 글의 첫 문단에서 독자를 붙잡는 방법. 인사말 대신 쓸 수 있는 다섯 가지 도입 방식을 예문과 함께 정리했습니다.',
    minutes: 7
  },
  {
    file: 'guide-tone.html',
    group: '글 쓰기',
    title: '문체와 어조 정하기',
    lead: '존댓말과 반말, 격식과 구어. 어느 쪽이 맞는 게 아니라 어느 쪽을 끝까지 지키느냐가 중요합니다.',
    desc: '블로그 글의 문체를 정하는 기준과, 한 글 안에서 어조가 흔들리지 않게 유지하는 방법을 정리했습니다.',
    minutes: 7
  },
  {
    file: 'guide-readability.html',
    group: '다듬기',
    title: '문장과 문단 길이',
    lead: '문장 60자, 문단 2~3문장. 이 숫자가 어디서 나왔고 언제 깨도 되는지 설명합니다.',
    desc: '모바일 화면에서 잘 읽히는 문장 길이와 문단 길이의 기준. 글자 크기, 줄간격, 강조 사용까지 숫자로 정리했습니다.',
    minutes: 9
  },
  {
    file: 'guide-sentence.html',
    group: '다듬기',
    title: '번역투와 군더더기 줄이기',
    lead: '"~에 대한", "~을 통해", 이중 피동. 문장을 늘어뜨리는 표현을 찾아 고치는 법입니다.',
    desc: '한국어 글쓰기에서 문장을 늘어지게 만드는 번역투 표현과 이중 피동을 찾아 고치는 방법을 예문 30개 이상으로 정리했습니다.',
    minutes: 9
  },
  {
    file: 'guide-spelling.html',
    group: '다듬기',
    title: '자주 틀리는 맞춤법',
    lead: '되/돼, 안/않, 왠/웬을 헷갈리지 않는 판별법과, 자주 틀리는 단어 100개 표입니다.',
    desc: '글 쓸 때 가장 많이 틀리는 맞춤법을 판별법과 함께 정리했습니다. 되/돼, 안/않, 왠/웬 구분법과 자주 틀리는 단어 100개 대조표를 담았습니다.',
    minutes: 11
  },
  {
    file: 'guide-spacing.html',
    group: '다듬기',
    title: '띄어쓰기 기준',
    lead: '의존 명사, 조사, 보조 용언. 규칙을 다 외우지 않고도 대부분 맞히는 방법입니다.',
    desc: '한국어 띄어쓰기에서 가장 자주 틀리는 경우를 규칙별로 정리했습니다. 수, 것, 때, 뿐, 만큼, 지 같은 말을 언제 붙이고 언제 띄우는지 판별하는 기준입니다.',
    minutes: 9
  },
  {
    file: 'guide-loanword.html',
    group: '다듬기',
    title: '외래어 표기',
    lead: '컨텐츠가 아니라 콘텐츠입니다. 자주 틀리는 외래어 80개와 표기 원칙을 정리했습니다.',
    desc: '블로그 글에서 자주 틀리는 외래어 표기를 원칙과 함께 정리했습니다. 콘텐츠, 메시지, 콘셉트처럼 헷갈리는 표기 80개 대조표를 담았습니다.',
    minutes: 8
  },
  {
    file: 'guide-punctuation.html',
    group: '다듬기',
    title: '문장부호 쓰는 법',
    lead: '쉼표를 어디에 찍을지, 말줄임표는 몇 점인지, 따옴표는 어느 것을 쓸지 정리했습니다.',
    desc: '한국어 문장부호 사용 기준. 쉼표, 마침표, 말줄임표, 따옴표, 붙임표를 언제 어떻게 쓰는지 실제 문장 예로 설명합니다.',
    minutes: 7
  },
  {
    file: 'guide-seo.html',
    group: '읽히게 만들기',
    title: '검색에 걸리게 쓰기',
    lead: '검색어를 억지로 넣는 게 아니라, 찾는 사람의 말로 쓰는 일입니다.',
    desc: '블로그 글이 검색 결과에 노출되게 만드는 방법. 검색어를 고르는 기준, 제목과 첫 문단에 배치하는 법, 색인 요청까지 정리했습니다.',
    minutes: 10
  },
  {
    file: 'guide-image.html',
    group: '읽히게 만들기',
    title: '사진과 이미지 다루기',
    lead: '몇 장을 어디에 넣을지, 대체 텍스트는 왜 필요한지, 남의 사진은 언제 못 쓰는지.',
    desc: '블로그에 사진을 배치하는 기준과 용량·비율 조정, 대체 텍스트 작성법, 이미지 저작권 확인 방법을 정리했습니다.',
    minutes: 7
  },
  {
    file: 'guide-mobile.html',
    group: '읽히게 만들기',
    title: '모바일에서 확인하기',
    lead: 'PC에서 균형이 맞아도 모바일에서는 다릅니다. 발행 전에 봐야 할 것들입니다.',
    desc: '블로그 독자 대부분은 모바일로 읽습니다. 발행 전 모바일 화면에서 확인해야 할 항목을 목록으로 정리했습니다.',
    minutes: 6
  },
  {
    file: 'guide-checklist.html',
    group: '발행하기',
    title: '발행 전 점검 목록',
    lead: '다 썼다고 바로 올리지 마세요. 5분이 글의 인상을 바꿉니다.',
    desc: '블로그 글을 발행하기 전에 확인할 항목을 제목, 구조, 문장, 표기, 이미지, 법적 사항으로 나눠 정리한 점검 목록입니다.',
    minutes: 6
  },
  {
    file: 'guide-copyright.html',
    group: '발행하기',
    title: '저작권과 협찬 표시',
    lead: '출처를 밝히는 것과 허락을 받는 것은 다릅니다. 인용, 이미지, 협찬 표시 기준을 정리했습니다.',
    desc: '블로그에 다른 사람의 글과 사진을 쓸 때 지켜야 할 저작권 기준, 정당한 인용의 조건, 협찬·광고 표시 의무를 정리했습니다.',
    minutes: 8
  },
  {
    file: 'guide-after.html',
    group: '발행하기',
    title: '발행한 다음에 할 일',
    lead: '통계를 매일 보면 대부분 그만둡니다. 대신 무엇을 봐야 하는지 정리했습니다.',
    desc: '블로그 글을 발행한 뒤 확인할 지표와, 오래된 글을 고쳐 다시 살리는 방법을 정리했습니다.',
    minutes: 7
  },
  {
    file: 'guide-habit.html',
    group: '발행하기',
    title: '계속 쓰는 법',
    lead: '재능이 아니라 구조의 문제입니다. 멈추지 않게 만드는 장치들을 정리했습니다.',
    desc: '블로그를 오래 쓰기 위한 발행 주기 설정, 소재 비축, 슬럼프 대처 방법을 정리했습니다.',
    minutes: 7
  }
];

const TOOL_PAGES = [
  {
    file: 'readability.html',
    title: '가독성 진단',
    desc: '붙여 넣은 글의 문장 길이, 문단 길이, 번역투, 강조 사용을 재서 100점 만점으로 가독성 점수를 매깁니다. 브라우저 안에서만 처리하며 서버로 보내지 않습니다.',
    scripts: ['assets/readability-core.js', 'assets/readability.js']
  },
  {
    file: 'proofread.html',
    title: '오탈자·맞춤법 점검',
    desc: '자주 틀리는 맞춤법, 띄어쓰기, 외래어 표기, 문장부호를 200개가 넘는 규칙으로 찾아 줍니다. 고칠 항목은 직접 고르고, 원문은 그대로 남습니다.',
    scripts: ['assets/proofread-core.js', 'assets/proofread.js']
  },
  {
    file: 'formatter.html',
    title: '문단 정리',
    desc: '문구와 문장부호는 바꾸지 않고 공백과 줄바꿈만 정리해 블로그에 붙여 넣기 좋은 문단으로 만듭니다. 처리 전후 원문이 같은지 자동으로 대조합니다.',
    scripts: ['assets/formatter-core.js', 'assets/formatter.js']
  }
];

const PAGES = [
  {
    file: 'index.html',
    title: '블로그 글쓰기 안내서',
    desc: '블로그를 처음 쓰는 사람이 알아야 할 것을 한 페이지에 정리했습니다. 플랫폼 고르기, 소재 찾기, 제목 짓기, 글 구조, 문장과 문단 길이, 맞춤법, 발행 전 점검까지 순서대로 읽으면 됩니다.',
    ads: true,
    canonical: `${SITE.url}/`
  },
  {
    file: 'guides.html',
    title: '글쓰기 문서 전체 목록',
    desc: '플랫폼 고르기부터 맞춤법, 검색 노출, 저작권까지. 블로그와 글쓰기에 필요한 문서를 주제별로 모았습니다.',
    ads: true
  },
  ...TOOL_PAGES.map(page => ({ ...page, ads: true })),
  ...ARTICLES.map(article => ({
    file: article.file,
    title: article.title,
    desc: article.desc,
    ads: true,
    article: true
  })),
  {
    file: 'about.html',
    title: '소개',
    desc: '블로거를 위한 안내서가 어떤 사이트이고 누가 만들었는지, 무엇을 목표로 하는지 설명합니다.',
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

module.exports = { SITE, NAV, FOOTER_NAV, PAGES, ARTICLES };
