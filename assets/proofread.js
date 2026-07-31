(() => {
  'use strict';

  const core = window.ProofreadCore;
  if (!core) return;

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const runBtn = document.getElementById('runBtn');
  const applyBtn = document.getElementById('applyBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const sampleBtn = document.getElementById('sampleBtn');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const selectErrorBtn = document.getElementById('selectErrorBtn');
  const inputCount = document.getElementById('inputCount');
  const summary = document.getElementById('summary');
  const list = document.getElementById('findingList');
  const outputPane = document.getElementById('outputPane');
  const ruleCountLabel = document.getElementById('ruleCount');

  const SAMPLE = [
    '오랫만에 좋은 컨텐츠를 만들려고 하는데 생각처럼 잘 안됬어요.',
    '몇일 동안 고민했지만 왠만하면 그냥 넘어가는게 낫다는 결론이 됬습니다.',
    '누구나 할수있는 일이지만 글을 쓸때는 역활 분담이 중요한 것 같아요 .',
    '메세지를 전달할 타겟이 정해지면 나머지는 자연스럽게 정리되어집니다...',
    '정말 정말 정말 중요한 부분이니까 꼭 기억하세요!!!'
  ].join('\n');

  const LEVEL_TEXT = { error: '오류', warn: '확인', info: '다듬기' };

  let findings = [];
  let source = '';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function updateCount() {
    inputCount.textContent = `${input.value.length.toLocaleString('ko-KR')}자`;
  }

  function selectedFindings() {
    return findings.filter((_, index) => {
      const box = list.querySelector(`input[data-index="${index}"]`);
      return box && box.checked;
    });
  }

  function refreshApplyButton() {
    const count = selectedFindings().length;
    applyBtn.disabled = count === 0;
    applyBtn.textContent = count ? `선택한 ${count.toLocaleString('ko-KR')}곳 고치기` : '선택한 곳 고치기';
  }

  function renderSummary(result) {
    summary.replaceChildren();

    if (!result.findings.length) {
      summary.className = 'verification ok';
      summary.textContent = `검사 완료: 규칙 ${core.ruleCount}개로 훑었지만 걸리는 곳이 없습니다.`;
      return;
    }

    summary.className = 'finding-summary';
    const counts = result.summary.byLevel;
    const chips = el('div', 'summary-chips');
    chips.append(
      el('span', 'summary-total', `${result.summary.total.toLocaleString('ko-KR')}곳`)
    );
    for (const level of ['error', 'warn', 'info']) {
      if (!counts[level]) continue;
      const chip = el('span', 'summary-chip', `${LEVEL_TEXT[level]} ${counts[level]}`);
      chip.dataset.level = level;
      chips.append(chip);
    }

    const cats = el('p', 'summary-cats', Object.entries(result.summary.byCategory)
      .map(([name, count]) => `${name} ${count}`)
      .join(' · '));

    summary.append(chips, cats);
  }

  function renderFindings() {
    list.replaceChildren();

    if (!findings.length) {
      list.hidden = true;
      return;
    }
    list.hidden = false;

    findings.forEach((finding, index) => {
      const item = el('li', 'finding');
      item.dataset.level = finding.level;

      const label = el('label', 'finding-check');
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.dataset.index = String(index);
      box.checked = finding.level !== 'info';
      box.addEventListener('change', refreshApplyButton);
      label.append(box);

      const body = el('div', 'finding-body');

      const head = el('div', 'finding-head');
      head.append(
        el('span', 'finding-level', LEVEL_TEXT[finding.level]),
        el('span', 'finding-cat', finding.category),
        el('span', 'finding-pos', `${finding.position.line}번째 줄`)
      );

      const change = el('p', 'finding-change');
      change.append(
        el('del', null, finding.matched),
        el('span', 'finding-arrow', '→'),
        el('ins', null, finding.suggestion)
      );

      const context = el('p', 'finding-context');
      context.append(
        el('span', null, finding.context.before),
        el('mark', null, finding.context.matched),
        el('span', null, finding.context.after)
      );

      body.append(head, change, context, el('p', 'finding-why', finding.why));
      item.append(label, body);
      list.append(item);
    });

    refreshApplyButton();
  }

  function run() {
    source = input.value;
    output.value = '';
    outputPane.hidden = true;

    if (!source.trim()) {
      summary.className = 'verification';
      summary.textContent = '검사할 글을 먼저 붙여 넣어 주세요.';
      findings = [];
      renderFindings();
      input.focus();
      return;
    }

    const result = core.check(source);
    findings = result.findings;
    renderSummary(result);
    renderFindings();
  }

  function applySelected() {
    const chosen = selectedFindings();
    if (!chosen.length) return;

    output.value = core.apply(source, chosen);
    outputPane.hidden = false;
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const note = el('p', 'apply-note', `${chosen.length.toLocaleString('ko-KR')}곳을 고친 결과입니다. 왼쪽 원문은 그대로 남아 있습니다.`);
    const previous = outputPane.querySelector('.apply-note');
    if (previous) previous.replaceWith(note);
    else outputPane.append(note);
  }

  async function copyResult() {
    if (!output.value) return;
    try {
      await navigator.clipboard.writeText(output.value);
    } catch {
      output.focus();
      output.select();
      document.execCommand('copy');
      output.setSelectionRange(0, 0);
    }
    copyBtn.textContent = '복사했습니다';
    window.setTimeout(() => { copyBtn.textContent = '결과 복사'; }, 1800);
  }

  runBtn.addEventListener('click', run);
  applyBtn.addEventListener('click', applySelected);
  copyBtn.addEventListener('click', copyResult);

  selectAllBtn.addEventListener('click', () => {
    list.querySelectorAll('input[type="checkbox"]').forEach(box => { box.checked = true; });
    refreshApplyButton();
  });

  selectErrorBtn.addEventListener('click', () => {
    list.querySelectorAll('input[type="checkbox"]').forEach(box => {
      const finding = findings[Number(box.dataset.index)];
      box.checked = finding ? finding.level === 'error' : false;
    });
    refreshApplyButton();
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    source = '';
    findings = [];
    outputPane.hidden = true;
    summary.className = 'verification';
    summary.textContent = `맞춤법·띄어쓰기·외래어 표기 규칙 ${core.ruleCount}개로 검사합니다.`;
    renderFindings();
    updateCount();
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

  if (ruleCountLabel) ruleCountLabel.textContent = core.ruleCount.toLocaleString('ko-KR');
  summary.textContent = `맞춤법·띄어쓰기·외래어 표기 규칙 ${core.ruleCount}개로 검사합니다.`;
  updateCount();
})();
