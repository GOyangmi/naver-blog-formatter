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
  { file: 'guides.html', label: '주제별 가이드' },
  { file: 'write.html', label: '글 작성' },
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
    when: '어디에 쓸지 정하지 못해 시작을 미루고 있다면',
    lead: '네이버 블로그, 티스토리, 브런치, 워드프레스, 벨로그, 미디엄을 검색 유입·수익화·이전 가능성 기준으로 비교했습니다.',
    desc: '네이버 블로그, 티스토리, 브런치, 워드프레스, 벨로그, 미디엄을 여섯 기준으로 비교했습니다.',
    minutes: 9
  },
  {
    file: 'guide-first-post.html',
    group: '시작하기',
    title: '첫 글 쓰기',
    when: '계정은 만들었는데 커서만 깜빡이고 있다면',
    lead: '무엇을 쓸지 정하는 법부터 초고를 끝까지 쓰는 순서까지. 첫 글에서 막히는 지점을 하나씩 풉니다.',
    desc: '첫 글의 소재를 정하는 법과 초고를 끝까지 쓰는 네 단계 순서를 정리했습니다.',
    minutes: 8
  },
  {
    file: 'guide-topic.html',
    group: '시작하기',
    title: '소재 찾기와 주제 정하기',
    when: '몇 편 쓰고 나서 쓸 게 없다고 느낀다면',
    lead: '쓸 게 없다는 말은 대개 사실이 아닙니다. 이미 가진 것에서 소재를 꺼내는 방법을 정리했습니다.',
    desc: '쓸 게 없을 때 소재를 꺼내는 다섯 가지 질문과, 한 글에 한 주제를 담는 기준입니다.',
    minutes: 7
  },
  {
    file: 'guide-title.html',
    widgets: true,
    group: '글 쓰기',
    title: '제목 짓기',
    when: '본문은 다 썼는데 제목에서 30분째 막혀 있다면',
    lead: '제목은 본문보다 훨씬 많이 읽힙니다. 낚시 없이 클릭을 만드는 제목의 구조를 예문으로 봅니다.',
    desc: '검색에 걸리면서도 과장하지 않는 블로그 제목 짓는 법. 좋은 제목과 아쉬운 제목을 나란히 놓고 왜 차이가 나는지 설명합니다.',
    minutes: 8
  },
  {
    file: 'guide-structure.html',
    group: '글 쓰기',
    title: '글의 구조 잡기',
    when: '쓰다 보면 딴 이야기로 새고 끝맺지 못한다면',
    lead: '도입에서 붙잡고, 소제목으로 길을 내고, 마무리에서 하나만 남기는 방법입니다.',
    desc: '읽히는 글의 뼈대를 세우는 방법. 도입 세 문장, 소제목을 나누는 기준, 마무리에서 해야 할 일을 예문과 함께 정리했습니다.',
    minutes: 9
  },
  {
    file: 'guide-lead.html',
    group: '글 쓰기',
    title: '도입부 쓰는 법',
    when: '방문자는 있는데 다들 금방 나간다면',
    lead: '"안녕하세요 여러분"으로 시작하면 왜 이탈하는지, 대신 무엇을 쓸지 다섯 가지 방식으로 정리했습니다.',
    desc: '블로그 글의 첫 문단에서 독자를 붙잡는 방법. 인사말 대신 쓸 수 있는 다섯 가지 도입 방식을 예문과 함께 정리했습니다.',
    minutes: 7
  },
  {
    file: 'guide-tone.html',
    group: '글 쓰기',
    title: '문체와 어조 정하기',
    when: '내 글이 왜 어수선한지 모르겠다면',
    lead: '존댓말과 반말, 격식과 구어. 어느 쪽이 맞는 게 아니라 어느 쪽을 끝까지 지키느냐가 중요합니다.',
    desc: '블로그 글의 문체를 정하는 기준과, 한 글 안에서 어조가 흔들리지 않게 유지하는 방법을 정리했습니다.',
    minutes: 7
  },
  {
    file: 'guide-readability.html',
    widgets: true,
    group: '다듬기',
    title: '문장과 문단 길이',
    when: '내 글이 답답해 보이는데 이유를 모르겠다면',
    lead: '문장 60자, 문단 2~3문장. 이 숫자가 어디서 나왔고 언제 깨도 되는지 설명합니다.',
    desc: '모바일 화면에서 잘 읽히는 문장 길이와 문단 길이의 기준. 글자 크기, 줄간격, 강조 사용까지 숫자로 정리했습니다.',
    minutes: 9
  },
  {
    file: 'guide-sentence.html',
    group: '다듬기',
    title: '번역투와 군더더기 줄이기',
    when: '문장이 늘어지고 딱딱하게 읽힌다면',
    lead: '"~에 대한", "~을 통해", 이중 피동. 문장을 늘어뜨리는 표현을 찾아 고치는 법입니다.',
    desc: '한국어 글쓰기에서 문장을 늘어지게 만드는 번역투 표현과 이중 피동을 찾아 고치는 방법을 예문 30개 이상으로 정리했습니다.',
    minutes: 9
  },
  {
    file: 'guide-spelling.html',
    widgets: true,
    group: '다듬기',
    title: '자주 틀리는 맞춤법',
    when: '되/돼를 쓸 때마다 잠깐 멈칫한다면',
    lead: '되/돼, 안/않, 왠/웬을 헷갈리지 않는 판별법과, 자주 틀리는 단어 100개 표입니다.',
    desc: '되/돼, 안/않, 왠/웬 판별법과 자주 틀리는 단어 100개를 표로 정리했습니다.',
    minutes: 11
  },
  {
    file: 'guide-spacing.html',
    group: '다듬기',
    title: '띄어쓰기 기준',
    when: '"할 수 있다"를 붙일지 띄울지 매번 헷갈린다면',
    lead: '의존 명사, 조사, 보조 용언. 규칙을 다 외우지 않고도 대부분 맞히는 방법입니다.',
    desc: '수, 것, 때, 뿐, 만큼을 언제 붙이고 언제 띄우는지 판별하는 기준을 정리했습니다.',
    minutes: 9
  },
  {
    file: 'guide-loanword.html',
    group: '다듬기',
    title: '외래어 표기',
    when: '컨텐츠인지 콘텐츠인지 확신이 안 선다면',
    lead: '컨텐츠가 아니라 콘텐츠입니다. 자주 틀리는 외래어 80개와 표기 원칙을 정리했습니다.',
    desc: '블로그 글에서 자주 틀리는 외래어 표기를 원칙과 함께 정리했습니다. 콘텐츠, 메시지, 콘셉트처럼 헷갈리는 표기 80개 대조표를 담았습니다.',
    minutes: 8
  },
  {
    file: 'guide-punctuation.html',
    group: '다듬기',
    title: '문장부호 쓰는 법',
    when: '쉼표를 어디에 찍어야 할지 감으로 하고 있다면',
    lead: '쉼표를 어디에 찍을지, 말줄임표는 몇 점인지, 따옴표는 어느 것을 쓸지 정리했습니다.',
    desc: '한국어 문장부호 사용 기준. 쉼표, 마침표, 말줄임표, 따옴표, 붙임표를 언제 어떻게 쓰는지 실제 문장 예로 설명합니다.',
    minutes: 7
  },
  {
    file: 'guide-seo.html',
    group: '읽히게 만들기',
    title: '검색에 걸리게 쓰기',
    when: '글은 쌓이는데 검색으로 아무도 안 들어온다면',
    lead: '검색어를 억지로 넣는 게 아니라, 찾는 사람의 말로 쓰는 일입니다.',
    desc: '블로그 글이 검색 결과에 노출되게 만드는 방법. 검색어를 고르는 기준, 제목과 첫 문단에 배치하는 법, 색인 요청까지 정리했습니다.',
    minutes: 10
  },
  {
    file: 'guide-image.html',
    group: '읽히게 만들기',
    title: '사진과 이미지 다루기',
    when: '사진을 몇 장 넣어야 할지 모르겠다면',
    lead: '몇 장을 어디에 넣을지, 대체 텍스트는 왜 필요한지, 남의 사진은 언제 못 쓰는지.',
    desc: '블로그에 사진을 배치하는 기준과 용량·비율 조정, 대체 텍스트 작성법, 이미지 저작권 확인 방법을 정리했습니다.',
    minutes: 7
  },
  {
    file: 'guide-mobile.html',
    group: '읽히게 만들기',
    title: '모바일에서 확인하기',
    when: 'PC로만 보고 발행하고 있다면',
    lead: 'PC에서 균형이 맞아도 모바일에서는 다릅니다. 발행 전에 봐야 할 것들입니다.',
    desc: '블로그 독자 대부분은 모바일로 읽습니다. 발행 전 모바일 화면에서 확인해야 할 항목을 목록으로 정리했습니다.',
    minutes: 6
  },
  {
    file: 'guide-checklist.html',
    widgets: true,
    group: '발행하기',
    title: '발행 전 점검 목록',
    when: '발행 버튼 누르기 직전, 뭔가 빠뜨린 것 같다면',
    lead: '다 썼다고 바로 올리지 마세요. 5분이 글의 인상을 바꿉니다.',
    desc: '블로그 글을 발행하기 전에 확인할 항목을 제목, 구조, 문장, 표기, 이미지, 법적 사항으로 나눠 정리한 점검 목록입니다.',
    minutes: 6
  },
  {
    file: 'guide-copyright.html',
    group: '발행하기',
    title: '저작권과 협찬 표시',
    when: '남의 사진을 쓰거나 협찬을 받게 됐다면',
    lead: '출처를 밝히는 것과 허락을 받는 것은 다릅니다. 인용, 이미지, 협찬 표시 기준을 정리했습니다.',
    desc: '블로그에 다른 사람의 글과 사진을 쓸 때 지켜야 할 저작권 기준, 정당한 인용의 조건, 협찬·광고 표시 의무를 정리했습니다.',
    minutes: 8
  },
  {
    file: 'guide-promote.html',
    group: '알리기',
    title: '발행 후 알리는 순서',
    when: '글을 올려 두기만 하고 아무것도 안 하고 있다면',
    lead: '검색은 몇 주가 걸립니다. 그 사이에 할 수 있는 일이 있습니다.',
    desc: '글을 발행한 직후 24시간, 첫 주, 첫 달에 각각 무엇을 해야 하는지 순서대로 정리했습니다.',
    minutes: 8
  },
  {
    file: 'guide-sns.html',
    group: '알리기',
    title: 'SNS로 글 알리기',
    when: '링크만 던졌는데 아무도 안 누른다면',
    lead: '링크를 그냥 올리면 아무도 안 봅니다. 플랫폼마다 통하는 방식이 다릅니다.',
    desc: '인스타그램, X, 스레드, 링크드인, 페이스북의 특성에 맞게 글을 소개하는 방법을 정리했습니다.',
    minutes: 8
  },
  {
    file: 'guide-community.html',
    group: '알리기',
    title: '커뮤니티에 공유하기',
    when: '커뮤니티에 올렸다가 눈총을 받은 적이 있다면',
    lead: '가장 빠른 유입 경로이면서 가장 쉽게 미움받는 곳입니다. 선을 지키는 법.',
    desc: '카페, 디시, 레딧 같은 커뮤니티에 글을 공유할 때 지켜야 할 기준과 홍보로 보이지 않게 쓰는 방법입니다.',
    minutes: 7
  },
  {
    file: 'guide-newsletter.html',
    group: '알리기',
    title: '뉴스레터로 독자 붙잡기',
    when: '검색 유입에만 의존하는 게 불안하다면',
    lead: '검색은 알고리즘이 정하지만 구독자 명단은 내 것입니다.',
    desc: '블로그와 함께 뉴스레터를 운영하는 이유와, 구독자를 모으고 유지하는 실무 방법을 정리했습니다.',
    minutes: 8
  },
  {
    file: 'guide-monetize.html',
    group: '수익 만들기',
    title: '수익 구조 한눈에 보기',
    when: '블로그로 돈을 벌 수 있는지 궁금하다면',
    lead: '광고, 제휴, 협찬, 내 상품. 넷의 수익 구조와 필요한 규모가 다릅니다.',
    desc: '블로그 수익화 방법 네 가지를 필요한 방문자 수, 수익 규모, 시작 난이도 기준으로 비교했습니다.',
    minutes: 9
  },
  {
    file: 'guide-adsense.html',
    group: '수익 만들기',
    title: '애드센스 시작하기',
    when: '애드센스를 신청했다가 반려당했다면',
    lead: '가장 흔한 시작점이자 가장 자주 반려당하는 관문입니다. 실제 심사 기준을 정리했습니다.',
    desc: '구글 애드센스 신청 조건, 반려 사유별 대응법, 승인 후 광고 배치와 수익 구조를 정리했습니다.',
    minutes: 10
  },
  {
    file: 'guide-affiliate.html',
    group: '수익 만들기',
    title: '제휴 마케팅',
    when: '리뷰를 쓰는데 수익으로 연결되지 않는다면',
    lead: '방문자가 적어도 시작할 수 있는 유일한 수익 모델입니다. 대신 신뢰를 잃기도 가장 쉽습니다.',
    desc: '쿠팡 파트너스 같은 제휴 프로그램의 구조와 수수료, 반드시 지켜야 할 표시 의무를 정리했습니다.',
    minutes: 8
  },
  {
    file: 'guide-sponsored.html',
    group: '수익 만들기',
    title: '협찬과 체험단',
    when: '협찬 제안 메일을 받고 어떻게 답할지 모르겠다면',
    lead: '제안이 오기 시작하면 판단할 게 늘어납니다. 받을 것과 거절할 것.',
    desc: '협찬·체험단 제안을 판단하는 기준, 단가를 정하는 법, 법적으로 반드시 표시해야 할 것을 정리했습니다.',
    minutes: 8
  },
  {
    file: 'guide-product.html',
    group: '수익 만들기',
    title: '내 것을 파는 법',
    when: '광고 수익의 한계를 느끼고 있다면',
    lead: '광고는 방문자 수에 묶여 있습니다. 전자책과 강의는 그렇지 않습니다.',
    desc: '전자책, 강의, 멤버십, 컨설팅처럼 블로그를 기반으로 내 상품을 만드는 방법과 시작 규모를 정리했습니다.',
    minutes: 9
  },
  {
    file: 'guide-after.html',
    group: '이어 가기',
    title: '발행한 다음에 할 일',
    when: '통계를 하루에 열 번씩 보고 있다면',
    lead: '통계를 매일 보면 대부분 그만둡니다. 대신 무엇을 봐야 하는지 정리했습니다.',
    desc: '블로그 글을 발행한 뒤 확인할 지표와, 오래된 글을 고쳐 다시 살리는 방법을 정리했습니다.',
    minutes: 7
  },
  {
    file: 'guide-habit.html',
    group: '이어 가기',
    title: '계속 쓰는 법',
    when: '2주째 새 글을 못 올리고 있다면',
    lead: '재능이 아니라 구조의 문제입니다. 멈추지 않게 만드는 장치들을 정리했습니다.',
    desc: '블로그를 오래 쓰기 위한 발행 주기 설정, 소재 비축, 슬럼프 대처 방법을 정리했습니다.',
    minutes: 7
  }
];

const TOOL_PAGES = [
  {
    file: 'readability.html',
    title: '가독성 진단',
    desc: '글의 문장·문단 길이와 번역투를 재서 100점 만점으로 가독성을 진단합니다. 서버 전송 없음.',
    scripts: ['assets/readability-core.js', 'assets/readability.js']
  },
  {
    file: 'proofread.html',
    title: '오탈자·맞춤법 점검',
    desc: '맞춤법·띄어쓰기·외래어 표기를 200개 규칙으로 찾아 줍니다. 고칠 항목은 직접 고르세요.',
    scripts: ['assets/proofread-core.js', 'assets/proofread.js']
  },
  {
    file: 'formatter.html',
    title: '문단 정리',
    desc: '문구는 그대로 두고 공백과 줄바꿈만 정리합니다. 처리 전후 원문이 같은지 자동 대조합니다.',
    scripts: ['assets/formatter-core.js', 'assets/formatter.js']
  }
];

const PAGES = [
  {
    file: 'index.html',
    title: '블로거를 위한 안내서',
    desc: '블로그 글쓰기부터 홍보와 수익화까지, 막히는 지점을 순서대로 정리했습니다. 가이드 29편과 무료 도구 4개.',
    ads: true,
    scripts: ['assets/widgets.js'],
    canonical: `${SITE.url}/`
  },
  {
    file: 'write.html',
    title: '글 작성',
    desc: '브라우저에서 바로 글을 쓰고 저장합니다. 가독성 점수와 오탈자를 쓰는 동안 확인하세요.',
    ads: true,
    scripts: [
      'assets/readability-core.js',
      'assets/proofread-core.js',
      'assets/formatter-core.js',
      'assets/write.js'
    ]
  },
  {
    file: 'guides.html',
    title: '주제별 가이드 전체 목록',
    desc: '플랫폼 고르기부터 맞춤법, 검색 노출, 저작권까지. 블로그와 글쓰기에 필요한 문서를 주제별로 모았습니다.',
    ads: true
  },
  ...TOOL_PAGES.map(page => ({ ...page, ads: true })),
  ...ARTICLES.map(article => ({
    file: article.file,
    title: article.title,
    desc: article.desc,
    ads: true,
    article: true,
    // 실측 위젯이 들어가는 문서에만 스크립트를 붙입니다
    ...(article.widgets ? { scripts: ['assets/widgets.js'] } : {})
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
