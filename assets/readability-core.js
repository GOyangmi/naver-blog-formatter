/**
 * 블로그 가독성 진단 엔진
 * - 브라우저 안에서만 동작하며 외부로 텍스트를 전송하지 않습니다.
 * - 글을 고치지 않습니다. 수치를 재고 문제 지점을 알려줄 뿐입니다.
 * - 기준값은 모바일 화면에서 읽는 상황을 전제로 잡았습니다.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ReadabilityCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /** 모바일 세로 화면에서 본문 한 줄에 들어가는 대략적인 한글 글자 수 */
  const MOBILE_CHARS_PER_LINE = 20;
  /** 모바일 한 화면에 보이는 대략적인 본문 줄 수 */
  const MOBILE_LINES_PER_SCREEN = 16;

  const LIMITS = Object.freeze({
    sentenceChars: 60,      // 이 길이를 넘으면 긴 문장으로 본다
    sentenceCharsHard: 100, // 이 길이를 넘으면 확실히 잘라야 한다
    paragraphSentences: 4,  // 한 문단 권장 문장 수 상한
    paragraphChars: 250     // 한 문단 권장 글자 수 상한
  });

  const CONNECTIVES = ['그리고', '그래서', '그러나', '하지만', '그런데', '그러면', '또한', '따라서', '그러므로', '즉'];

  const TRANSLATIONESE = [
    { pattern: /되어지|보여지|불려지|나뉘어지|잊혀지|모여지/g, label: '이중 피동 (되어지다 등)' },
    { pattern: /에 대한|에 대해/g, label: '"~에 대한" 표현' },
    { pattern: /을 통해|를 통해/g, label: '"~을 통해" 표현' },
    { pattern: /에 의해|에 의한/g, label: '"~에 의해" 표현' },
    { pattern: /(라고|다고) 생각(합니다|됩니다|해요|한다)/g, label: '"~라고 생각합니다" 표현' },
    { pattern: /것으로 (보인다|보입니다|판단된다|판단됩니다)/g, label: '"~것으로 보입니다" 표현' },
    { pattern: /있어서의|에 있어/g, label: '"~에 있어" 표현' }
  ];

  /** 문장 끝 판별. 마침표·느낌표·물결·따옴표가 여러 개 붙어 있어도 인식한다. */
  const TAIL = '[.!?~…”’"\'」』)\\]]*$';
  const ENDINGS = [
    { pattern: new RegExp(`입니다${TAIL}`), label: '-입니다' },
    { pattern: new RegExp(`합니다${TAIL}`), label: '-합니다' },
    { pattern: new RegExp(`습니다${TAIL}`), label: '-습니다' },
    { pattern: new RegExp(`(했|였|았|었)어요${TAIL}`), label: '-었어요' },
    { pattern: new RegExp(`(이에요|예요)${TAIL}`), label: '-예요' },
    { pattern: new RegExp(`(해요|아요|어요|네요|지요|죠)${TAIL}`), label: '-요' },
    { pattern: new RegExp(`다${TAIL}`), label: '-다' }
  ];

  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu;

  function normalize(text) {
    return String(text ?? '').replace(/\r\n?/g, '\n');
  }

  function splitParagraphs(text) {
    return normalize(text)
      .split(/\n\s*\n+/)
      .map(block => block.trim())
      .filter(Boolean);
  }

  function splitSentences(text) {
    const flat = normalize(text).replace(/\n+/g, ' ').trim();
    if (!flat) return [];
    const parts = flat.match(/[\s\S]*?(?:[.!?。！？]+[”’"'」』)\]]*|$)(?=\s|$)/g) || [flat];
    return parts.map(part => part.trim()).filter(Boolean);
  }

  function countChars(text) {
    const value = normalize(text);
    return {
      withSpace: value.length,
      withoutSpace: value.replace(/\s/gu, '').length
    };
  }

  /** 0~1 사이 비율을 점수로 환산. good 이하면 만점, bad 이상이면 0점 */
  function scaleScore(value, good, bad, max) {
    if (value <= good) return max;
    if (value >= bad) return 0;
    const ratio = (value - good) / (bad - good);
    return Math.round(max * (1 - ratio) * 10) / 10;
  }

  function gradeOf(total) {
    if (total >= 90) return { grade: 'A', label: '아주 잘 읽힙니다' };
    if (total >= 78) return { grade: 'B', label: '무리 없이 읽힙니다' };
    if (total >= 64) return { grade: 'C', label: '읽을 만하지만 손볼 곳이 있습니다' };
    if (total >= 50) return { grade: 'D', label: '읽는 데 힘이 듭니다' };
    return { grade: 'E', label: '지금 상태로는 이탈이 많을 수 있습니다' };
  }

  function analyze(text) {
    const source = normalize(text).trim();
    const chars = countChars(source);

    if (!source) {
      return {
        empty: true,
        chars,
        counts: { sentences: 0, paragraphs: 0 },
        score: { total: 0, grade: '-', label: '분석할 글이 없습니다', breakdown: [] },
        issues: [],
        longSentences: [],
        longParagraphs: [],
        mobile: { lines: 0, screens: 0 }
      };
    }

    const paragraphs = splitParagraphs(source);
    const sentences = splitSentences(source);
    const sentenceLengths = sentences.map(s => s.replace(/\s/gu, '').length);

    const avgSentence = sentenceLengths.length
      ? sentenceLengths.reduce((sum, n) => sum + n, 0) / sentenceLengths.length
      : 0;
    const maxSentence = sentenceLengths.length ? Math.max(...sentenceLengths) : 0;

    const longSentences = sentences
      .map((textValue, index) => ({ index, text: textValue, length: sentenceLengths[index] }))
      .filter(item => item.length > LIMITS.sentenceChars)
      .sort((a, b) => b.length - a.length);

    const paragraphStats = paragraphs.map((block, index) => {
      const blockSentences = splitSentences(block);
      return {
        index,
        text: block,
        sentences: blockSentences.length,
        chars: block.replace(/\s/gu, '').length
      };
    });

    const longParagraphs = paragraphStats
      .filter(p => p.sentences > LIMITS.paragraphSentences || p.chars > LIMITS.paragraphChars)
      .sort((a, b) => b.chars - a.chars);

    const avgParagraphSentences = paragraphStats.length
      ? paragraphStats.reduce((sum, p) => sum + p.sentences, 0) / paragraphStats.length
      : 0;

    // ── 지표별 원자료 ────────────────────────────────────────
    const longRatio = sentences.length ? longSentences.length / sentences.length : 0;
    const longParaRatio = paragraphStats.length ? longParagraphs.length / paragraphStats.length : 0;

    const connectiveStarts = sentences.filter(s => CONNECTIVES.some(word => s.startsWith(word))).length;
    const connectiveRatio = sentences.length ? connectiveStarts / sentences.length : 0;

    const endingLabels = sentences.map(s => {
      const found = ENDINGS.find(e => e.pattern.test(s));
      return found ? found.label : '기타';
    });
    let maxEndingRun = 0;
    let currentRun = 0;
    for (let i = 0; i < endingLabels.length; i += 1) {
      if (i > 0 && endingLabels[i] === endingLabels[i - 1] && endingLabels[i] !== '기타') {
        currentRun += 1;
      } else {
        currentRun = 1;
      }
      maxEndingRun = Math.max(maxEndingRun, currentRun);
    }

    const translationese = TRANSLATIONESE
      .map(item => {
        item.pattern.lastIndex = 0;
        const found = source.match(item.pattern) || [];
        return { label: item.label, count: found.length };
      })
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
    const translationeseTotal = translationese.reduce((sum, item) => sum + item.count, 0);
    // 글 길이에 흔들리지 않도록 "10문장당 몇 회"로 환산한다.
    const translationeseRate = sentences.length ? (translationeseTotal / sentences.length) * 10 : 0;

    EMOJI.lastIndex = 0;
    const emojiCount = (source.match(EMOJI) || []).length;
    const exclaimCount = (source.match(/[!?]/g) || []).length;
    const markRate = sentences.length ? (emojiCount + exclaimCount) / sentences.length : 0;

    const mobileLines = Math.ceil(chars.withSpace / MOBILE_CHARS_PER_LINE) + paragraphs.length;
    const mobileScreens = Math.max(1, Math.ceil(mobileLines / MOBILE_LINES_PER_SCREEN));

    // ── 점수 ─────────────────────────────────────────────────
    const breakdown = [
      {
        key: 'sentence',
        label: '문장 길이',
        max: 25,
        score: scaleScore(longRatio, 0.1, 0.6, 25),
        detail: `평균 ${avgSentence.toFixed(0)}자 · ${LIMITS.sentenceChars}자 초과 ${longSentences.length}개 (${Math.round(longRatio * 100)}%)`,
        comment: longRatio > 0.35
          ? '긴 문장이 많습니다. 접속조사에서 끊어 두 문장으로 나눠 보세요.'
          : '문장 길이는 무난합니다.'
      },
      {
        key: 'paragraph',
        label: '문단 길이',
        max: 25,
        score: scaleScore(longParaRatio, 0.1, 0.6, 25),
        detail: `문단 ${paragraphStats.length}개 · 평균 ${avgParagraphSentences.toFixed(1)}문장 · 긴 문단 ${longParagraphs.length}개`,
        comment: longParaRatio > 0.35
          ? '문단이 뭉쳐 있습니다. 2~3문장마다 빈 줄을 넣어 보세요.'
          : '문단 나눔이 적절합니다.'
      },
      {
        key: 'density',
        label: '화면 밀도',
        max: 10,
        score: scaleScore(paragraphStats.length ? chars.withSpace / paragraphStats.length : 999, 220, 700, 10),
        detail: `모바일 예상 ${mobileLines.toLocaleString('ko-KR')}줄 · 약 ${mobileScreens}화면`,
        comment: paragraphStats.length && chars.withSpace / paragraphStats.length > 400
          ? '한 덩어리에 글자가 너무 많습니다. 빈 줄을 더 자주 넣으세요.'
          : '화면에서 숨 쉴 공간이 확보돼 있습니다.'
      },
      {
        key: 'variety',
        label: '문장 종결 다양성',
        max: 15,
        score: scaleScore(maxEndingRun, 3, 8, 15),
        detail: `같은 어미가 최대 ${maxEndingRun}문장 연속`,
        comment: maxEndingRun >= 5
          ? '같은 말끝이 이어지면 리듬이 단조로워집니다. 중간에 다른 어미를 섞어 보세요.'
          : '문장 끝이 단조롭지 않습니다.'
      },
      {
        key: 'plainness',
        label: '번역투·군더더기',
        max: 15,
        score: scaleScore(translationeseRate + connectiveRatio * 20, 3, 18, 15),
        detail: translationeseTotal || connectiveStarts
          ? `번역투 ${translationeseTotal}회 · 접속부사로 시작 ${connectiveStarts}문장`
          : '발견되지 않음',
        comment: translationeseRate > 8
          ? '"~에 대한", "~을 통해" 같은 표현을 동사로 바꾸면 문장이 짧아집니다.'
          : '문장이 담백합니다.'
      },
      {
        key: 'tone',
        label: '강조 부호 절제',
        max: 10,
        score: scaleScore(markRate, 0.5, 2.5, 10),
        detail: `느낌표·물음표 ${exclaimCount}개 · 이모지 ${emojiCount}개 (문장당 ${markRate.toFixed(1)}개)`,
        comment: markRate > 1.5
          ? '강조가 잦으면 오히려 강조가 안 됩니다. 꼭 필요한 곳만 남기세요.'
          : '강조 사용이 적절합니다.'
      }
    ];

    const total = Math.round(breakdown.reduce((sum, item) => sum + item.score, 0));
    const { grade, label } = gradeOf(total);

    // ── 개선 항목 ────────────────────────────────────────────
    const issues = [];
    if (longSentences.length) {
      issues.push({
        key: 'long-sentence',
        severity: longRatio > 0.35 ? 'high' : 'medium',
        title: `${LIMITS.sentenceChars}자를 넘는 문장 ${longSentences.length}개`,
        body: '모바일에서 세 줄 이상 이어지는 문장입니다. 쉼표나 연결어미 자리에서 끊으면 훨씬 잘 읽힙니다.',
        samples: longSentences.slice(0, 3).map(item => ({ text: item.text, meta: `${item.length}자` }))
      });
    }
    if (longParagraphs.length) {
      issues.push({
        key: 'long-paragraph',
        severity: longParaRatio > 0.35 ? 'high' : 'medium',
        title: `길게 뭉친 문단 ${longParagraphs.length}개`,
        body: `한 문단이 ${LIMITS.paragraphSentences}문장 또는 ${LIMITS.paragraphChars}자를 넘습니다. 문단 정리기로 2~3문장 단위로 나눠 보세요.`,
        samples: longParagraphs.slice(0, 2).map(item => ({
          text: item.text.slice(0, 120),
          meta: `${item.sentences}문장 · ${item.chars}자`
        }))
      });
    }
    if (maxEndingRun >= 5) {
      issues.push({
        key: 'ending-run',
        severity: 'medium',
        title: `같은 어미가 ${maxEndingRun}문장 연속`,
        body: '"~습니다"만 이어지면 낭독하듯 단조로워집니다. 명사로 끝내거나 질문형을 섞어 보세요.',
        samples: []
      });
    }
    if (translationeseTotal >= 3) {
      issues.push({
        key: 'translationese',
        severity: translationeseRate > 8 ? 'medium' : 'low',
        title: `번역투 표현 ${translationeseTotal}회`,
        body: '"~에 대해 알아보겠습니다"보다 "~을 정리했습니다"가 짧고 분명합니다.',
        samples: translationese.slice(0, 4).map(item => ({ text: item.label, meta: `${item.count}회` }))
      });
    }
    if (connectiveRatio > 0.3) {
      issues.push({
        key: 'connective',
        severity: 'low',
        title: `접속부사로 시작하는 문장 ${connectiveStarts}개 (${Math.round(connectiveRatio * 100)}%)`,
        body: '"그리고", "그래서"를 빼도 뜻이 통하는 문장이 많습니다. 지워 보고 어색하지 않으면 그대로 두세요.',
        samples: []
      });
    }
    if (markRate > 1.5) {
      issues.push({
        key: 'marks',
        severity: 'low',
        title: '느낌표·이모지가 잦습니다',
        body: `문장당 평균 ${markRate.toFixed(1)}개입니다. 정말 강조할 한두 곳만 남기면 그 부분이 살아납니다.`,
        samples: []
      });
    }
    if (!issues.length) {
      issues.push({
        key: 'clean',
        severity: 'none',
        title: '눈에 띄는 문제가 없습니다',
        body: '문장·문단 길이, 표현, 강조 사용이 모두 권장 범위 안에 있습니다. 이대로 발행해도 좋습니다.',
        samples: []
      });
    }

    return {
      empty: false,
      chars,
      counts: {
        sentences: sentences.length,
        paragraphs: paragraphStats.length,
        connectiveStarts
      },
      sentenceStats: {
        average: avgSentence,
        max: maxSentence,
        longCount: longSentences.length,
        longRatio
      },
      paragraphStats: {
        average: avgParagraphSentences,
        longCount: longParagraphs.length,
        longRatio
      },
      mobile: { lines: mobileLines, screens: mobileScreens },
      translationese,
      longSentences,
      longParagraphs,
      issues,
      score: { total, grade, label, breakdown }
    };
  }

  return Object.freeze({
    LIMITS,
    MOBILE_CHARS_PER_LINE,
    splitParagraphs,
    splitSentences,
    countChars,
    analyze
  });
});
