/**
 * 안내서 본문에 들어가는 실측 위젯.
 *
 * 글로 "문장이 길면 안 좋다"고 쓰는 대신 직접 넣어 보고 재게 합니다.
 * HTML에 뼈대가 이미 들어 있고 이 파일은 동작만 붙입니다.
 * 스크립트가 없어도 문서는 그대로 읽힙니다.
 *
 * 입력값은 화면 안에서만 쓰이고 어디로도 전송되지 않습니다.
 */
(() => {
  'use strict';

  const $ = (root, sel) => root.querySelector(sel);
  const noSpace = text => text.replace(/\s/gu, '').length;

  /* ── 문장 길이 실측 ──────────────────────────────────────
     넣은 문장이 휴대폰 화면에서 몇 줄이 되는지 실제로 렌더해 셉니다. */
  function sentenceGauge(root) {
    const input = $(root, '[data-input]');
    const screen = $(root, '[data-screen]');
    const stat = $(root, '[data-stat]');
    if (!input || !screen || !stat) return;

    const SAMPLE = '오늘은 아침부터 정말 많은 일이 있었는데 우선 일찍 일어나서 준비를 하고 밖으로 나갔더니 생각보다 날씨가 추워서 다시 들어와 옷을 갈아입고 나가느라 시간이 조금 지체되었습니다.';

    function measure() {
      const text = input.value || SAMPLE;
      screen.textContent = text;

      const lineHeight = parseFloat(getComputedStyle(screen).lineHeight) || 24;
      const lines = Math.max(1, Math.round(screen.offsetHeight / lineHeight));
      const chars = noSpace(text);
      const long = chars > 60;

      stat.replaceChildren();
      const add = (label, value, tone) => {
        const span = document.createElement('span');
        span.append(`${label} `);
        const b = document.createElement('b');
        if (tone) b.className = tone;
        b.textContent = value;
        span.append(b);
        stat.append(span);
      };
      add('공백 제외', `${chars}자`, long ? 'warn' : 'good');
      add('휴대폰', `${lines}줄`, lines >= 4 ? 'warn' : 'good');
      add('판정', long ? '잘라 쓰세요' : '적당합니다', long ? 'warn' : 'good');

      if (!input.value) input.setAttribute('data-empty', '');
      else input.removeAttribute('data-empty');
    }

    input.addEventListener('input', measure);
    window.addEventListener('resize', measure);
    measure();
  }

  /* ── 제목 길이 자 ────────────────────────────────────────
     모바일 검색 결과에서 잘리는 지점을 눈금과 함께 보여 줍니다. */
  function titleGauge(root) {
    const input = $(root, '[data-input]');
    const serp = $(root, '[data-serp]');
    const ruler = $(root, '[data-ruler]');
    const stat = $(root, '[data-stat]');
    if (!input || !serp || !stat) return;

    const LIMIT = 28; // 모바일 검색 결과에서 대략 이 지점부터 잘립니다
    const SAMPLE = '세 번 실패하고 알아낸 자취방 곰팡이 제거 순서와 재발 막는 법';

    if (ruler && !ruler.childElementCount) {
      for (let i = 0; i <= 40; i += 1) {
        const tick = document.createElement('i');
        tick.style.left = `${(i / 40) * 100}%`;
        if (i % 10 === 0) tick.dataset.major = '';
        if (i === LIMIT) tick.className = 'limit';
        ruler.append(tick);
        if (i % 10 === 0) {
          const label = document.createElement('b');
          label.style.left = `${(i / 40) * 100}%`;
          label.textContent = String(i);
          ruler.append(label);
        }
      }
    }

    function render() {
      const text = input.value || SAMPLE;
      serp.replaceChildren();

      const head = document.createTextNode(text.slice(0, LIMIT));
      serp.append(head);
      if (text.length > LIMIT) {
        const cut = document.createElement('span');
        cut.className = 'cut';
        cut.textContent = text.slice(LIMIT);
        serp.append(cut, document.createTextNode('…'));
      }

      stat.replaceChildren();
      const over = text.length > LIMIT;
      const add = (label, value, tone) => {
        const span = document.createElement('span');
        span.append(`${label} `);
        const b = document.createElement('b');
        if (tone) b.className = tone;
        b.textContent = value;
        span.append(b);
        stat.append(span);
      };
      add('길이', `${text.length}자`, over ? 'warn' : 'good');
      add('잘림', over ? `${text.length - LIMIT}자 잘림` : '안 잘림', over ? 'warn' : 'good');
      if (over) add('확인', '중요한 말이 앞 28자 안에 있나요?', 'warn');
    }

    input.addEventListener('input', render);
    render();
  }

  /* ── 판별기 (되/돼 등) ──────────────────────────────────
     문제를 하나씩 내고, 고르면 이유를 보여 줍니다. */
  function quizGauge(root) {
    const question = $(root, '[data-question]');
    const choices = $(root, '[data-choices]');
    const answer = $(root, '[data-answer]');
    const counter = $(root, '[data-counter]');
    if (!question || !choices || !answer) return;

    let items;
    try {
      items = JSON.parse(root.dataset.items || '[]');
    } catch {
      return;
    }
    if (!items.length) return;

    let index = 0;

    function draw() {
      const item = items[index];
      question.textContent = item.q;
      answer.hidden = true;
      answer.replaceChildren();
      choices.replaceChildren();

      item.a.forEach((label, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          [...choices.children].forEach(node => node.setAttribute('aria-pressed', 'false'));
          button.setAttribute('aria-pressed', 'true');

          const right = i === item.correct;
          answer.replaceChildren();
          const verdict = document.createElement('b');
          if (right) verdict.textContent = '맞습니다. ';
          else {
            verdict.className = 'no';
            verdict.textContent = `아닙니다. 정답은 "${item.a[item.correct]}". `;
          }
          answer.append(verdict, document.createTextNode(item.why));

          const next = document.createElement('button');
          next.type = 'button';
          next.className = 'button secondary';
          next.style.marginTop = '12px';
          next.textContent = index < items.length - 1 ? '다음 문제' : '처음부터 다시';
          next.addEventListener('click', () => {
            index = index < items.length - 1 ? index + 1 : 0;
            draw();
          });
          answer.append(document.createElement('br'), next);
          answer.hidden = false;
        });
        choices.append(button);
      });

      if (counter) counter.textContent = `${index + 1} / ${items.length}`;
    }

    draw();
  }

  /* ── 체크 목록: 남은 항목 수를 셉니다 ─────────────────── */
  function tickList(list) {
    const boxes = [...list.querySelectorAll('input[type="checkbox"]')];
    if (!boxes.length) return;

    const wrap = document.createElement('p');
    wrap.className = 'tick-progress';
    const text = document.createElement('span');
    const bar = document.createElement('span');
    bar.className = 'bar';
    const fill = document.createElement('i');
    bar.append(fill);
    wrap.append(text, bar);
    list.after(wrap);

    function update() {
      const done = boxes.filter(b => b.checked).length;
      text.textContent = `${done} / ${boxes.length}`;
      fill.style.width = `${(done / boxes.length) * 100}%`;
    }
    boxes.forEach(box => box.addEventListener('change', update));
    update();
  }

  /* ── 실행 ───────────────────────────────────────────────── */
  const BUILDERS = {
    sentence: sentenceGauge,
    title: titleGauge,
    quiz: quizGauge
  };

  document.querySelectorAll('[data-widget]').forEach(node => {
    const build = BUILDERS[node.dataset.widget];
    if (build) build(node);
  });

  document.querySelectorAll('.tick-list').forEach(tickList);
})();
