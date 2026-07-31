/**
 * 오탈자·맞춤법 점검 엔진
 * - 브라우저 안에서만 동작하며 외부로 텍스트를 전송하지 않습니다.
 * - 원문을 자동으로 고치지 않습니다. 찾아서 알려주고, 적용 여부는 사용자가 고릅니다.
 * - 규칙은 아래 RULES 배열에 데이터로만 정의되어 있어 자유롭게 추가·삭제할 수 있습니다.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ProofreadCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CATEGORY = Object.freeze({
    SPELLING: '맞춤법',
    SPACING: '띄어쓰기',
    LOANWORD: '외래어 표기',
    PUNCTUATION: '문장부호',
    STYLE: '표현 다듬기'
  });

  const LEVEL = Object.freeze({
    ERROR: 'error',   // 사실상 항상 틀린 표기
    WARN: 'warn',     // 대부분 틀리지만 문맥에 따라 맞을 수 있음
    INFO: 'info'      // 취향·문체 문제
  });

  /** 한글 음절의 종성이 ㄹ인지 확인 (관형형 어미 'ㄹ' 판별용) */
  function hasFinalRieul(ch) {
    if (!ch) return false;
    const code = ch.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return false;
    return (code - 0xac00) % 28 === 8;
  }

  /** 간단한 표기 교정 규칙: [찾을 문자열, 바꿀 문자열, 설명] */
  function simple(list, cat, level) {
    return list.map(([from, to, why], i) => ({
      id: `${cat}-${i}-${from}`,
      cat,
      level: level || LEVEL.ERROR,
      find: new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      to,
      why
    }));
  }

  const SPELLING_ERRORS = [
    ['됬', '됐', '"됐다"는 "되었다"의 준말입니다. "됬"은 쓰이지 않는 표기입니다.'],
    ['되요', '돼요', '"돼"는 "되어"의 준말입니다. "되요"는 항상 틀립니다.'],
    ['되서', '돼서', '"되어서"의 준말은 "돼서"입니다.'],
    ['됀', '된', '"됀"은 없는 표기입니다.'],
    // '하/되' 뒤 어미가 한 글자로 합쳐지는 활용형이라 긴 것부터 적는다
    ['않합니다', '안 합니다', '"않다"는 "-지 않다" 꼴로만 씁니다. 부정 부사는 "안"입니다.'],
    ['않됩니다', '안 됩니다', '"않되"는 없는 표기입니다. 부정 부사는 "안"입니다.'],
    ['않했', '안 했', '"않다"는 "-지 않다" 꼴로만 씁니다. 부정 부사는 "안"입니다.'],
    ['않해', '안 해', '"않다"는 "-지 않다" 꼴로만 씁니다. 부정 부사는 "안"입니다.'],
    ['않하', '안 하', '"않다"는 "-지 않다" 꼴로만 씁니다. 부정 부사는 "안"입니다.'],
    ['않돼', '안 돼', '"않돼"는 없는 표기입니다.'],
    ['않된', '안 된', '"않된"은 없는 표기입니다.'],
    ['않되', '안 되', '"않되"는 없는 표기입니다.'],
    ['문안합니다', '무난합니다', '"무난하다"가 맞습니다. "문안"은 안부를 묻는 말입니다.'],
    ['안절부절합니다', '안절부절못합니다', '"안절부절못하다"가 표준어입니다.'],
    ['왠만', '웬만', '"웬만하다"가 표준어입니다. "왠"은 "왠지"에만 씁니다.'],
    ['왠일', '웬일', '"웬일"이 맞습니다. "왠지"를 뺀 나머지는 대부분 "웬"입니다.'],
    ['웬지', '왠지', '"왜인지"의 준말이라 "왠지"로 씁니다.'],
    ['몇일', '며칠', '"며칠"이 표준어입니다. "몇 일"로 띄어 써도 틀립니다.'],
    ['오랫만', '오랜만', '"오랜만"이 맞습니다. 다만 "오랫동안"은 사이시옷을 씁니다.'],
    ['어의없', '어이없', '"어이없다"가 표준어입니다.'],
    ['금새', '금세', '"금시에"의 준말이라 "금세"입니다.'],
    ['뵈요', '봬요', '"뵈어요"의 준말은 "봬요"입니다.'],
    ['설레임', '설렘', '기본형이 "설레다"라서 명사형은 "설렘"입니다.'],
    ['역활', '역할', '"역할"이 표준어입니다.'],
    ['어떻해', '어떡해', '"어떻게 해"의 준말은 "어떡해"입니다.'],
    ['뭐에요', '뭐예요', '받침 없는 말 뒤에는 "예요"를 씁니다.'],
    ['아니예요', '아니에요', '"아니다" 뒤에는 "에요"가 붙습니다.'],
    ['할께', '할게', '"-ㄹ게"는 된소리로 적지 않습니다.'],
    ['갈께', '갈게', '"-ㄹ게"는 된소리로 적지 않습니다.'],
    ['있읍니다', '있습니다', '"-습니다"가 표준 표기입니다.'],
    ['없읍니다', '없습니다', '"-습니다"가 표준 표기입니다.'],
    ['희안', '희한', '"희한하다"가 표준어입니다.'],
    ['어짜피', '어차피', '"어차피"가 표준어입니다.'],
    ['폭팔', '폭발', '"폭발"이 맞습니다.'],
    ['절대절명', '절체절명', '"절체절명(絶體絶命)"이 맞습니다.'],
    ['임신공격', '인신공격', '"인신공격(人身攻擊)"이 맞습니다.'],
    ['갯수', '개수', '한자어 사이에는 사이시옷을 넣지 않습니다.'],
    ['촛점', '초점', '한자어 사이에는 사이시옷을 넣지 않습니다.'],
    ['뒷풀이', '뒤풀이', '뒷말이 거센소리로 시작하면 사이시옷을 쓰지 않습니다.'],
    ['눈쌀', '눈살', '"눈살을 찌푸리다"가 맞습니다.'],
    ['넉두리', '넋두리', '"넋두리"가 표준어입니다.'],
    ['육계장', '육개장', '"육개장"이 표준어입니다.'],
    ['곱배기', '곱빼기', '"곱빼기"가 표준어입니다.'],
    ['찌게', '찌개', '"김치찌개"처럼 "찌개"로 적습니다.'],
    ['문안하', '무난하', '"무난하다"가 맞습니다. "문안"은 안부를 묻는 말입니다.'],
    ['우겨넣', '욱여넣', '"욱여넣다"가 표준어입니다.'],
    ['알아맞추', '알아맞히', '"알아맞히다"가 맞습니다.'],
    ['되물림', '대물림', '"대물림"이 맞습니다.'],
    ['얼만큼', '얼마큼', '"얼마만큼"의 준말은 "얼마큼"입니다.'],
    ['짜집기', '짜깁기', '"짜깁기"가 표준어입니다.'],
    ['설겆이', '설거지', '"설거지"가 표준어입니다.'],
    ['서슴치', '서슴지', '기본형이 "서슴다"라서 "서슴지"입니다.'],
    ['무릎쓰', '무릅쓰', '"무릅쓰다"가 맞습니다. "무릎"은 신체 부위입니다.'],
    ['안스럽', '안쓰럽', '"안쓰럽다"가 표준어입니다.'],
    ['귀뜸', '귀띔', '"귀띔"이 표준어입니다.'],
    ['통채로', '통째로', '"통째로"가 맞습니다.'],
    ['째째', '쩨쩨', '"쩨쩨하다"가 표준어입니다.'],
    ['널부러', '널브러', '"널브러지다"가 표준어입니다.'],
    ['움추', '움츠', '"움츠리다"가 표준어입니다.'],
    ['개거품', '게거품', '게가 뿜는 거품에서 온 말이라 "게거품"입니다.'],
    ['등살', '등쌀', '"등쌀에 시달리다"가 맞습니다.'],
    ['삭월세', '사글세', '"사글세"가 표준어입니다.'],
    ['안절부절하', '안절부절못하', '"안절부절못하다"가 표준어입니다.'],
    ['담궈', '담가', '기본형이 "담그다"라서 "담가"입니다.'],
    ['잠궈', '잠가', '기본형이 "잠그다"라서 "잠가"입니다.'],
    ['치뤄', '치러', '기본형이 "치르다"라서 "치러"입니다.'],
    ['치룬', '치른', '기본형이 "치르다"라서 "치른"입니다.'],
    ['들어나', '드러나', '"드러나다"가 맞습니다.'],
    ['빈털털이', '빈털터리', '"빈털터리"가 표준어입니다.'],
    ['우뢰', '우레', '"우레"가 표준어입니다.'],
    ['건들이', '건드리', '"건드리다"가 표준어입니다.'],
    ['가벼히', '가벼이', '"가벼이"가 맞습니다.'],
    ['일일히', '일일이', '"일일이"가 맞습니다.'],
    ['틈틈히', '틈틈이', '"틈틈이"가 맞습니다.'],
    ['번번히', '번번이', '"번번이"가 맞습니다.'],
    ['깨끗히', '깨끗이', '"깨끗이"가 맞습니다.'],
    ['솔직이', '솔직히', '"솔직히"가 맞습니다.'],
    ['간간히', '간간이', '"간간이"가 맞습니다.'],
    ['곰곰히', '곰곰이', '"곰곰이"가 맞습니다.'],
    ['꼼꼼이', '꼼꼼히', '"꼼꼼히"가 맞습니다.'],
    ['가만이', '가만히', '"가만히"가 맞습니다.']
  ];

  const SPELLING_WARN = [
    ['바램', '바람', '"희망"의 뜻이면 "바람"입니다. 색이 옅어진다는 뜻이면 "바램"이 맞습니다.'],
    ['구지', '굳이', '"굳이"가 맞습니다. 지명이나 이름이면 그대로 두세요.'],
    ['들렸다', '들렀다', '어딘가에 잠깐 갔다는 뜻이면 "들렀다"입니다. 소리가 귀에 들어왔다는 뜻이면 "들렸다"가 맞습니다.'],
    ['들려서', '들러서', '방문의 뜻이면 "들러서"입니다. 소리라면 그대로 두세요.'],
    ['낳으세요', '나으세요', '병이 낫는다는 뜻이면 "나으세요"입니다. 출산이면 "낳으세요"가 맞습니다.'],
    ['틀리다', '다르다', '"같지 않다"는 뜻이면 "다르다"입니다. 정답이 아니라는 뜻이면 "틀리다"가 맞습니다.'],
    ['틀린', '다른', '"같지 않다"는 뜻이면 "다른"입니다. 오답이라는 뜻이면 그대로 두세요.'],
    ['결재', '결제', '돈을 치르는 것은 "결제", 윗사람의 승인은 "결재"입니다.'],
    ['지양', '지향', '"목표로 삼다"는 "지향", "하지 않다"는 "지양"입니다.'],
    ['한참', '한창', '시간이 꽤 지났다는 뜻이면 "한참", 가장 활발한 때라면 "한창"입니다.'],
    ['맞추다', '맞히다', '정답을 맞히는 것은 "맞히다", 서로 비교하는 것은 "맞추다"입니다.'],
    ['부치다', '붙이다', '편지·힘은 "부치다", 떨어지지 않게 하는 것은 "붙이다"입니다.']
  ];

  const LOANWORDS = [
    ['컨텐츠', '콘텐츠'], ['메세지', '메시지'], ['악세사리', '액세서리'], ['악세서리', '액세서리'],
    ['초콜렛', '초콜릿'], ['케잌', '케이크'], ['리더쉽', '리더십'], ['멤버쉽', '멤버십'],
    ['워크샵', '워크숍'], ['플래쉬', '플래시'], ['넌센스', '난센스'], ['쇼파', '소파'],
    ['카페트', '카펫'], ['로보트', '로봇'], ['디지탈', '디지털'], ['심포지움', '심포지엄'],
    ['알콜', '알코올'], ['비스켓', '비스킷'], ['앰블런스', '앰뷸런스'], ['스티로폴', '스티로폼'],
    ['바베큐', '바비큐'], ['부페', '뷔페'], ['팜플렛', '팸플릿'], ['레크레이션', '레크리에이션'],
    ['샌달', '샌들'], ['소세지', '소시지'], ['텔레비젼', '텔레비전'], ['후라이', '프라이'],
    ['렌트카', '렌터카'], ['로얄', '로열'], ['리모콘', '리모컨'], ['미스테리', '미스터리'],
    ['밧데리', '배터리'], ['센타', '센터'], ['악셀', '액셀'], ['앙케이트', '앙케트'],
    ['옐로우', '옐로'], ['지그자그', '지그재그'], ['컨셉', '콘셉트'], ['타겟', '타깃'],
    ['프로포즈', '프러포즈'], ['하일라이트', '하이라이트'], ['커피샵', '커피숍'], ['데뷰', '데뷔'],
    ['까페', '카페'], ['챠트', '차트'], ['넷트워크', '네트워크'], ['비지니스', '비즈니스'],
    ['시져', '시저'], ['쥬스', '주스'], ['화이팅', '파이팅'], ['탈렌트', '탤런트'],
    ['미팅룸', '회의실'], ['블럭', '블록'], ['플랜카드', '플래카드'], ['샾', '숍']
  ].map(([from, to]) => [from, to, `외래어 표기법에 따르면 "${to}"로 적습니다.`]);

  /**
   * 이중 피동 ("-어지다"를 겹쳐 쓴 형태).
   * "되어집니다"처럼 뒤 어미의 첫 자음이 '지'와 한 글자로 합쳐지는 활용형이 많아서,
   * 어간만 잡는 규칙으로는 놓칩니다. 그래서 활용형을 직접 적어 두었고,
   * 긴 것부터 먼저 와야 짧은 규칙이 먼저 채 가지 않습니다.
   */
  const DOUBLE_PASSIVE = [
    ['되어집니다', '됩니다'], ['되어집니까', '됩니까'], ['되어졌', '됐'], ['되어질', '될'],
    ['되어진', '된'], ['되어져', '돼'], ['되어지', '되'],
    ['보여집니다', '보입니다'], ['보여졌', '보였'], ['보여질', '보일'], ['보여진', '보인'], ['보여지', '보이'],
    ['불려집니다', '불립니다'], ['불려졌', '불렸'], ['불려지', '불리'],
    ['잊혀집니다', '잊힙니다'], ['잊혀졌', '잊혔'], ['잊혀진', '잊힌'], ['잊혀지', '잊히'],
    ['나뉘어집니다', '나뉩니다'], ['나뉘어졌', '나뉘었'], ['나뉘어지', '나뉘'],
    ['모여집니다', '모입니다'], ['모여졌', '모였'], ['모여지', '모이'],
    ['쓰여집니다', '쓰입니다'], ['쓰여졌', '쓰였'], ['쓰여진', '쓰인'], ['쓰여지', '쓰이'],
    ['읽혀집니다', '읽힙니다'], ['읽혀졌', '읽혔'], ['읽혀지', '읽히'],
    ['담겨집니다', '담깁니다'], ['담겨졌', '담겼'], ['담겨지', '담기'],
    ['놓여집니다', '놓입니다'], ['놓여졌', '놓였'], ['놓여지', '놓이']
  ].map(([from, to]) => [from, to, '이미 피동인 말에 "-어지다"를 겹쳐 쓴 이중 피동입니다. (되어집니다 → 됩니다)']);

  const RULES = [].concat(
    simple(DOUBLE_PASSIVE, CATEGORY.STYLE, LEVEL.WARN),
    simple(SPELLING_ERRORS, CATEGORY.SPELLING, LEVEL.ERROR),
    simple(SPELLING_WARN, CATEGORY.SPELLING, LEVEL.WARN),
    simple(LOANWORDS, CATEGORY.LOANWORD, LEVEL.ERROR),
    [
      // ── 띄어쓰기 ──────────────────────────────────────────────
      {
        id: 'spacing-su',
        cat: CATEGORY.SPACING,
        level: LEVEL.ERROR,
        find: /([가-힣])수(있|없)/g,
        guard: m => hasFinalRieul(m[1]),
        to: m => `${m[1]} 수 ${m[2]}`,
        why: '"수"는 의존 명사라서 앞뒤를 띄어 씁니다. (할 수 있다 / 할 수 없다)'
      },
      {
        id: 'spacing-ttae',
        cat: CATEGORY.SPACING,
        level: LEVEL.ERROR,
        find: /([가-힣])때/g,
        guard: m => hasFinalRieul(m[1]) && m[1] !== '물',
        to: m => `${m[1]} 때`,
        why: '"때"는 명사라서 관형형 뒤에서 띄어 씁니다. (읽을 때 / 갈 때)'
      },
      {
        id: 'spacing-geot-gat',
        cat: CATEGORY.SPACING,
        level: LEVEL.ERROR,
        find: /것같/g,
        to: '것 같',
        why: '"같다"는 형용사라서 앞말과 띄어 씁니다. (읽은 것 같다)'
      },
      {
        id: 'spacing-neunge',
        cat: CATEGORY.SPACING,
        level: LEVEL.WARN,
        find: /는게(?=\s)/g,
        to: '는 게',
        why: '"게"가 "것이"의 준말이면 띄어 씁니다. (읽는 게 좋다)'
      },
      {
        id: 'spacing-ppunman',
        cat: CATEGORY.SPACING,
        level: LEVEL.ERROR,
        find: /뿐만아니라/g,
        to: '뿐만 아니라',
        why: '"뿐만 아니라"로 띄어 씁니다.'
      },
      {
        id: 'spacing-bulguhago',
        cat: CATEGORY.SPACING,
        level: LEVEL.ERROR,
        find: /그럼에도불구하고/g,
        to: '그럼에도 불구하고',
        why: '각 단어를 띄어 씁니다.'
      },
      {
        id: 'spacing-beonjjae',
        cat: CATEGORY.SPACING,
        level: LEVEL.ERROR,
        find: /(첫|두|세|네|다섯|여섯|일곱|여덟|아홉|열)번째/g,
        to: m => `${m[1]} 번째`,
        why: '"번째"는 의존 명사라서 수를 나타내는 말과 띄어 씁니다.'
      },
      {
        id: 'spacing-jomdeo',
        cat: CATEGORY.SPACING,
        level: LEVEL.ERROR,
        find: /좀더/g,
        to: '좀 더',
        why: '"좀"과 "더"는 각각 부사라서 띄어 씁니다.'
      },
      {
        id: 'spacing-deoisang',
        cat: CATEGORY.SPACING,
        level: LEVEL.ERROR,
        find: /더이상/g,
        to: '더 이상',
        why: '"더"와 "이상"을 띄어 씁니다.'
      },
      {
        id: 'spacing-week',
        cat: CATEGORY.SPACING,
        level: LEVEL.WARN,
        find: /(이번|다음|저번)주/g,
        to: m => `${m[1]} 주`,
        why: '"주"는 명사라서 띄어 씁니다. 다만 "지난주"는 한 단어로 붙여 씁니다.'
      },
      {
        id: 'spacing-myeotbeon',
        cat: CATEGORY.SPACING,
        level: LEVEL.ERROR,
        find: /몇번/g,
        to: '몇 번',
        why: '"몇"은 관형사라서 뒤에 오는 말과 띄어 씁니다.'
      },
      // ── 문장부호·공백 ────────────────────────────────────────
      {
        id: 'punct-space-before',
        cat: CATEGORY.PUNCTUATION,
        level: LEVEL.WARN,
        find: /([가-힣A-Za-z0-9])[ \t]+([.,!?])/g,
        to: m => `${m[1]}${m[2]}`,
        why: '문장부호 앞에는 공백을 넣지 않습니다.'
      },
      {
        id: 'punct-comma-space',
        cat: CATEGORY.PUNCTUATION,
        level: LEVEL.WARN,
        find: /,([가-힣])/g,
        to: m => `, ${m[1]}`,
        why: '쉼표 뒤에는 한 칸 띄웁니다.'
      },
      {
        id: 'punct-double-space',
        cat: CATEGORY.PUNCTUATION,
        level: LEVEL.INFO,
        find: /[ \t]{2,}/g,
        to: ' ',
        why: '공백이 두 칸 이상 이어져 있습니다. 한 칸으로 줄이면 정렬이 깔끔해집니다.'
      },
      {
        id: 'punct-repeat-mark',
        cat: CATEGORY.PUNCTUATION,
        level: LEVEL.INFO,
        find: /([!?])\1{2,}/g,
        to: m => m[1],
        why: '느낌표·물음표를 세 개 이상 반복하면 문장이 가벼워 보입니다.'
      },
      {
        id: 'punct-ellipsis',
        cat: CATEGORY.PUNCTUATION,
        level: LEVEL.INFO,
        find: /\.{3,}/g,
        to: '…',
        why: '말줄임표는 "…" 한 글자로 적는 것이 표준입니다.'
      },
      {
        id: 'punct-tilde',
        cat: CATEGORY.PUNCTUATION,
        level: LEVEL.INFO,
        find: /~{2,}/g,
        to: '~',
        why: '물결표를 반복하면 문장이 늘어져 보입니다.'
      },
      {
        id: 'punct-jamo',
        cat: CATEGORY.PUNCTUATION,
        level: LEVEL.INFO,
        find: /([ㅋㅎㅠㅜ])\1{4,}/g,
        to: m => m[1].repeat(3),
        why: '자음·모음 반복이 깁니다. 세 글자 정도로 줄이면 정돈돼 보입니다.'
      },

      // ── 표현 다듬기 ──────────────────────────────────────────
      {
        id: 'style-repeat-word',
        cat: CATEGORY.STYLE,
        level: LEVEL.INFO,
        find: /([가-힣]{2,6})(\s+\1){2,}/g,
        to: m => m[1],
        why: '같은 표현이 세 번 이상 이어집니다. 한 번만 남기면 문장이 또렷해집니다.'
      }
    ]
  );

  function lineColumnAt(text, index) {
    const before = text.slice(0, index);
    const line = before.split('\n').length;
    const column = index - (before.lastIndexOf('\n') + 1) + 1;
    return { line, column };
  }

  function contextAt(text, index, length, radius = 20) {
    const start = Math.max(0, index - radius);
    const end = Math.min(text.length, index + length + radius);
    return {
      before: (start > 0 ? '…' : '') + text.slice(start, index).replace(/\n/g, ' '),
      matched: text.slice(index, index + length).replace(/\n/g, ' '),
      after: text.slice(index + length, end).replace(/\n/g, ' ') + (end < text.length ? '…' : '')
    };
  }

  /** 앞선 규칙이 이미 잡은 구간과 겹치면 버린다 */
  function overlaps(taken, start, end) {
    return taken.some(range => start < range[1] && end > range[0]);
  }

  function check(text) {
    const source = String(text ?? '');
    const findings = [];
    const taken = [];

    for (const rule of RULES) {
      rule.find.lastIndex = 0;
      let match;
      while ((match = rule.find.exec(source)) !== null) {
        if (match[0].length === 0) {
          rule.find.lastIndex += 1;
          continue;
        }
        if (rule.guard && !rule.guard(match)) continue;

        const start = match.index;
        const end = start + match[0].length;
        if (overlaps(taken, start, end)) continue;

        const suggestion = typeof rule.to === 'function' ? rule.to(match) : rule.to;
        if (suggestion === match[0]) continue;

        taken.push([start, end]);
        findings.push({
          ruleId: rule.id,
          category: rule.cat,
          level: rule.level,
          index: start,
          length: match[0].length,
          matched: match[0],
          suggestion,
          why: rule.why,
          position: lineColumnAt(source, start),
          context: contextAt(source, start, match[0].length)
        });
      }
    }

    findings.sort((a, b) => a.index - b.index);

    const byCategory = {};
    const byLevel = { error: 0, warn: 0, info: 0 };
    for (const finding of findings) {
      byCategory[finding.category] = (byCategory[finding.category] || 0) + 1;
      byLevel[finding.level] += 1;
    }

    return {
      findings,
      summary: {
        total: findings.length,
        byCategory,
        byLevel,
        charCount: source.length
      }
    };
  }

  /** 고르는 항목만 반영한 새 문자열을 만든다. 원문 자체는 건드리지 않는다. */
  function apply(text, findings) {
    const source = String(text ?? '');
    const ordered = [...(findings || [])].sort((a, b) => b.index - a.index);
    let result = source;
    for (const finding of ordered) {
      if (source.slice(finding.index, finding.index + finding.length) !== finding.matched) continue;
      result = result.slice(0, finding.index) + finding.suggestion + result.slice(finding.index + finding.length);
    }
    return result;
  }

  return Object.freeze({
    CATEGORY,
    LEVEL,
    RULES,
    ruleCount: RULES.length,
    hasFinalRieul,
    check,
    apply
  });
});
