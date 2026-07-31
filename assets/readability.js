(() => {
  'use strict';

  const core = window.ReadabilityCore;
  if (!core) return;

  const input = document.getElementById('input');
  const runBtn = document.getElementById('runBtn');
  const clearBtn = document.getElementById('clearBtn');
  const sampleBtn = document.getElementById('sampleBtn');
  const inputCount = document.getElementById('inputCount');
  const report = document.getElementById('report');
  const placeholder = document.getElementById('reportPlaceholder');

  const SAMPLE = [
    '안녕하세요 여러분!! 오늘은 제가 요즘 자주 가는 동네 카페에 대해 이야기해보려고 하는데요 이 카페는 집에서 걸어서 십 분 정도 걸리는 골목 안쪽에 있어서 처음에는 저도 여기에 카페가 있는 줄 전혀 몰랐고 우연히 산책하다가 발견하게 된 곳이랍니다!!',
    '내부는 밖에서 보는 것보다 훨씬 넓었고 창가 자리에 앉으면 골목 전체가 내려다보이는데 특히 오후 세 시쯤에 햇빛이 비스듬히 들어올 때가 가장 예뻐서 사진을 찍기에도 정말 좋았어요!! 그리고 직원분들도 너무 친절하셔서 기분 좋게 있다가 왔습니다!!'
  ].join(' ');

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function updateCount() {
    const value = input.value;
    const noSpace = value.replace(/\s/gu, '').length;
    inputCount.textContent = `${value.length.toLocaleString('ko-KR')}자 (공백 제외 ${noSpace.toLocaleString('ko-KR')}자)`;
  }

  function renderScore(result) {
    const { total, grade, label, breakdown } = result.score;
    const wrap = el('section', 'score-block');
    wrap.setAttribute('aria-label', '가독성 점수');

    const head = el('div', 'score-head');
    const dial = el('div', 'score-dial');
    dial.style.setProperty('--value', String(total));
    dial.dataset.grade = grade;
    const number = el('strong', null, String(total));
    dial.append(number, el('span', null, '점'));

    const headText = el('div', 'score-text');
    headText.append(
      el('p', 'score-grade', `${grade} 등급`),
      el('p', 'score-label', label),
      el('p', 'score-meta', `문장 ${result.counts.sentences.toLocaleString('ko-KR')}개 · 문단 ${result.counts.paragraphs.toLocaleString('ko-KR')}개 · 공백 제외 ${result.chars.withoutSpace.toLocaleString('ko-KR')}자 · 모바일 약 ${result.mobile.screens}화면`)
    );
    head.append(dial, headText);

    const bars = el('div', 'score-bars');
    for (const item of breakdown) {
      const row = el('div', 'score-row');
      const top = el('div', 'score-row-top');
      top.append(el('span', 'score-row-label', item.label), el('span', 'score-row-value', `${item.score} / ${item.max}`));

      const track = el('div', 'score-track');
      const fill = el('div', 'score-fill');
      const ratio = item.max ? item.score / item.max : 0;
      fill.style.width = `${Math.round(ratio * 100)}%`;
      fill.dataset.tone = ratio >= 0.8 ? 'good' : ratio >= 0.5 ? 'mid' : 'low';
      track.append(fill);

      row.append(top, track, el('p', 'score-row-detail', item.detail), el('p', 'score-row-comment', item.comment));
      bars.append(row);
    }

    wrap.append(head, bars);
    return wrap;
  }

  function renderIssues(result) {
    const wrap = el('section', 'issue-block');
    wrap.append(el('h2', 'block-title', '고치면 좋은 곳'));

    for (const issue of result.issues) {
      const card = el('article', 'issue-card');
      card.dataset.severity = issue.severity;

      const head = el('div', 'issue-head');
      const badgeText = { high: '우선', medium: '권장', low: '참고', none: '양호' }[issue.severity] || '참고';
      head.append(el('span', 'issue-badge', badgeText), el('h3', null, issue.title));
      card.append(head, el('p', 'issue-body', issue.body));

      if (issue.samples.length) {
        const list = el('ul', 'issue-samples');
        for (const sample of issue.samples) {
          const li = el('li');
          li.append(el('span', 'issue-sample-meta', sample.meta), el('q', null, sample.text));
          list.append(li);
        }
        card.append(list);
      }
      wrap.append(card);
    }
    return wrap;
  }

  function renderNext(result) {
    const wrap = el('section', 'next-block');
    wrap.append(el('h2', 'block-title', '다음에 할 일'));

    const list = el('div', 'next-grid');
    const suggestions = [];

    if (result.issues.some(i => i.key === 'long-paragraph' || i.key === 'long-sentence')) {
      suggestions.push(['문단 정리기로 넘기기', '문장은 그대로 두고 문단과 줄바꿈만 다시 배치합니다.', 'formatter.html']);
    }
    suggestions.push(['오탈자 점검하기', '맞춤법·띄어쓰기·외래어 표기를 한 번에 훑습니다.', 'proofread.html']);
    if (result.issues.some(i => i.key === 'translationese' || i.key === 'connective')) {
      suggestions.push(['문장 다듬는 법 읽기', '번역투를 줄이고 문장을 짧게 만드는 방법을 정리했습니다.', 'index.html#sentence']);
    } else {
      suggestions.push(['가독성 기준 읽기', '문장·문단 길이를 어디에 맞춰야 하는지 정리했습니다.', 'index.html#readability']);
    }

    for (const [title, body, href] of suggestions) {
      const card = el('a', 'next-card');
      card.href = href;
      card.append(el('strong', null, title), el('span', null, body));
      list.append(card);
    }
    wrap.append(list);
    return wrap;
  }

  function run() {
    const text = input.value;
    report.replaceChildren();

    if (!text.trim()) {
      placeholder.hidden = false;
      placeholder.textContent = '진단할 글을 먼저 붙여 넣어 주세요.';
      report.hidden = true;
      input.focus();
      return;
    }

    const result = core.analyze(text);
    placeholder.hidden = true;
    report.hidden = false;
    report.append(renderScore(result), renderIssues(result), renderNext(result));
    report.setAttribute('tabindex', '-1');
    report.focus({ preventScroll: true });
    report.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  runBtn.addEventListener('click', run);

  clearBtn.addEventListener('click', () => {
    input.value = '';
    updateCount();
    report.replaceChildren();
    report.hidden = true;
    placeholder.hidden = false;
    placeholder.textContent = '글을 붙여 넣고 “가독성 진단”을 누르면 점수와 개선 지점이 나타납니다.';
    input.focus();
  });

  sampleBtn.addEventListener('click', () => {
    input.value = SAMPLE;
    updateCount();
    run();
  });

  input.addEventListener('input', updateCount);
  input.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      run();
    }
  });

  updateCount();
})();
