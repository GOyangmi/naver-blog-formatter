/**
 * 글 작성 작업실.
 *
 * 가독성·오탈자·문단 정리 엔진을 한 화면에서 함께 씁니다.
 * 글은 브라우저 로컬 저장소에만 저장되며 어디로도 전송되지 않습니다.
 */
(() => {
  'use strict';

  const readability = window.ReadabilityCore;
  const proofread = window.ProofreadCore;
  const formatter = window.TextFormatterCore;

  const $ = id => document.getElementById(id);
  const els = {
    list: $('docList'), title: $('docTitle'), body: $('docBody'),
    titleMeter: $('titleMeter'), stat: $('statBar'), status: $('writeStatus'),
    scorePanel: $('scorePanel'), scoreGrade: $('scoreGrade'),
    proofPanel: $('proofPanel'), proofCount: $('proofCount'),
    newDoc: $('newDoc'), saveDoc: $('saveDoc'), deleteDoc: $('deleteDoc'),
    formatDoc: $('formatDoc'), exportTxt: $('exportTxt'), exportMd: $('exportMd'),
    importFile: $('importFile'), clearAll: $('clearAll')
  };
  if (!els.body || !els.list) return;

  const KEY = 'subpath.drafts.v1';
  const TITLE_LIMIT = 28;

  /* ── 저장소 ─────────────────────────────────────────────
     로컬 저장소를 못 쓰는 환경(시크릿 모드 등)에서도 편집은 되게 합니다. */
  let storageOk = true;
  function read() {
    try {
      const raw = window.localStorage.getItem(KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      storageOk = false;
      return [];
    }
  }
  function write(list) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
      return true;
    } catch {
      storageOk = false;
      say('저장 공간을 쓸 수 없습니다. 파일로 내려받아 두세요.', true);
      return false;
    }
  }

  let docs = read();
  let currentId = docs.length ? docs[0].id : null;

  function say(message, bad) {
    els.status.textContent = message;
    els.status.classList.toggle('bad', Boolean(bad));
    if (!bad) window.setTimeout(() => { els.status.textContent = ''; }, 2400);
  }

  function newId() {
    return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  function current() {
    return docs.find(d => d.id === currentId) || null;
  }

  function labelOf(doc) {
    const title = (doc.title || '').trim();
    if (title) return title;
    const firstLine = (doc.body || '').trim().split('\n')[0];
    return firstLine ? firstLine.slice(0, 24) : '제목 없는 글';
  }

  function when(stamp) {
    const d = new Date(stamp);
    if (Number.isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /* ── 목록 ───────────────────────────────────────────────── */
  function renderList() {
    els.list.replaceChildren();

    if (!docs.length) {
      const empty = document.createElement('li');
      empty.className = 'writer-empty';
      empty.textContent = storageOk ? '저장된 글이 없습니다.' : '이 브라우저에서는 저장할 수 없습니다.';
      els.list.append(empty);
      return;
    }

    for (const doc of docs) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'writer-item';
      if (doc.id === currentId) button.setAttribute('aria-current', 'true');

      const name = document.createElement('strong');
      name.textContent = labelOf(doc);
      const meta = document.createElement('span');
      const chars = (doc.body || '').replace(/\s/gu, '').length;
      meta.textContent = `${chars.toLocaleString('ko-KR')}자 · ${when(doc.updated)}`;
      button.append(name, meta);

      button.addEventListener('click', () => {
        saveCurrent(true);
        currentId = doc.id;
        load();
      });
      item.append(button);
      els.list.append(item);
    }
  }

  /* ── 불러오기·저장 ─────────────────────────────────────── */
  function load() {
    const doc = current();
    els.title.value = doc ? doc.title || '' : '';
    els.body.value = doc ? doc.body || '' : '';
    renderList();
    analyse();
  }

  function saveCurrent(quiet) {
    const title = els.title.value;
    const body = els.body.value;
    if (!title.trim() && !body.trim()) return;

    let doc = current();
    if (!doc) {
      doc = { id: newId(), title: '', body: '', updated: Date.now() };
      docs.unshift(doc);
      currentId = doc.id;
    }
    doc.title = title;
    doc.body = body;
    doc.updated = Date.now();

    // 최근 수정한 글이 위로 오게
    docs = [doc, ...docs.filter(d => d.id !== doc.id)];

    if (write(docs)) {
      renderList();
      if (!quiet) say('저장했습니다.');
    }
  }

  /* ── 진단 ───────────────────────────────────────────────── */
  function renderTitleMeter() {
    const value = els.title.value;
    els.titleMeter.replaceChildren();
    if (!value) {
      els.titleMeter.textContent = `모바일 검색 결과에서는 ${TITLE_LIMIT}자까지 보입니다.`;
      els.titleMeter.className = 'writer-titlemeter';
      return;
    }
    const over = value.length > TITLE_LIMIT;
    els.titleMeter.className = `writer-titlemeter${over ? ' over' : ''}`;
    els.titleMeter.textContent = over
      ? `${value.length}자 — ${value.length - TITLE_LIMIT}자가 검색 결과에서 잘립니다.`
      : `${value.length}자 — 잘리지 않습니다. (${TITLE_LIMIT}자까지)`;
  }

  function renderStat(result) {
    const text = els.body.value;
    const chars = text.length;
    const noSpace = text.replace(/\s/gu, '').length;
    const minutes = Math.max(1, Math.round(noSpace / 500));

    els.stat.replaceChildren();
    const add = (label, value) => {
      const span = document.createElement('span');
      span.append(`${label} `);
      const b = document.createElement('b');
      b.textContent = value;
      span.append(b);
      els.stat.append(span);
    };
    add('글자', chars.toLocaleString('ko-KR'));
    add('공백 제외', noSpace.toLocaleString('ko-KR'));
    add('문장', String(result.empty ? 0 : result.counts.sentences));
    add('문단', String(result.empty ? 0 : result.counts.paragraphs));
    add('읽는 데', `약 ${minutes}분`);
  }

  function renderScore(result) {
    els.scorePanel.replaceChildren();
    if (result.empty) {
      els.scoreGrade.textContent = '';
      els.scorePanel.append(hint('글을 쓰기 시작하면 점수가 나타납니다.'));
      return;
    }

    els.scoreGrade.textContent = `${result.score.total}점 · ${result.score.grade}`;
    els.scoreGrade.dataset.grade = result.score.grade;

    for (const item of result.score.breakdown) {
      const row = document.createElement('div');
      row.className = 'panel-row';

      const top = document.createElement('div');
      top.className = 'panel-row-top';
      const name = document.createElement('span');
      name.textContent = item.label;
      const value = document.createElement('span');
      value.textContent = `${item.score}/${item.max}`;
      top.append(name, value);

      const track = document.createElement('div');
      track.className = 'score-track';
      const fill = document.createElement('div');
      fill.className = 'score-fill';
      const ratio = item.max ? item.score / item.max : 0;
      fill.style.width = `${Math.round(ratio * 100)}%`;
      fill.dataset.tone = ratio >= 0.8 ? 'good' : ratio >= 0.5 ? 'mid' : 'low';
      track.append(fill);

      row.append(top, track);
      els.scorePanel.append(row);
    }

    const worst = [...result.issues].find(i => i.severity === 'high' || i.severity === 'medium');
    if (worst) els.scorePanel.append(hint(worst.title));
  }

  function renderProof(findings) {
    els.proofPanel.replaceChildren();
    const errors = findings.filter(f => f.level === 'error');
    els.proofCount.textContent = findings.length ? `${findings.length}곳` : '';

    if (!els.body.value.trim()) {
      els.proofPanel.append(hint('글을 쓰기 시작하면 표기를 확인합니다.'));
      return;
    }
    if (!findings.length) {
      els.proofPanel.append(hint('걸리는 표기가 없습니다.'));
      return;
    }

    const list = document.createElement('ul');
    list.className = 'panel-findings';
    for (const finding of findings.slice(0, 8)) {
      const li = document.createElement('li');
      li.dataset.level = finding.level;
      const del = document.createElement('del');
      del.textContent = finding.matched;
      const ins = document.createElement('ins');
      ins.textContent = finding.suggestion;
      li.append(del, document.createTextNode(' → '), ins);
      list.append(li);
    }
    els.proofPanel.append(list);

    if (findings.length > 8) {
      els.proofPanel.append(hint(`외 ${findings.length - 8}곳. 전체는 오탈자 점검에서 보세요.`));
    }
    if (errors.length) {
      const fix = document.createElement('button');
      fix.type = 'button';
      fix.className = 'button secondary panel-fix';
      fix.textContent = `‘오류’ ${errors.length}곳 한 번에 고치기`;
      fix.addEventListener('click', () => {
        els.body.value = proofread.apply(els.body.value, errors);
        analyse();
        saveCurrent(true);
        say(`${errors.length}곳을 고쳤습니다.`);
      });
      els.proofPanel.append(fix);
    }
  }

  function hint(text) {
    const p = document.createElement('p');
    p.className = 'panel-hint';
    p.textContent = text;
    return p;
  }

  function analyse() {
    renderTitleMeter();
    const text = els.body.value;
    const result = readability ? readability.analyze(text) : { empty: true };
    renderStat(result);
    renderScore(result);
    renderProof(proofread && text.trim() ? proofread.check(text).findings : []);
  }

  /* ── 파일 ───────────────────────────────────────────────── */
  function download(extension, mime) {
    const title = (els.title.value || '').trim();
    const body = els.body.value;
    if (!title && !body.trim()) { say('내려받을 내용이 없습니다.', true); return; }

    const content = extension === 'md' && title ? `# ${title}\n\n${body}` : (title ? `${title}\n\n${body}` : body);
    const safe = (title || '글').replace(/[\\/:*?"<>|]/g, '').slice(0, 40) || '글';

    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safe}.${extension}`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    say('파일을 내려받았습니다.');
  }

  /* ── 조작 ───────────────────────────────────────────────── */
  els.newDoc.addEventListener('click', () => {
    saveCurrent(true);
    const doc = { id: newId(), title: '', body: '', updated: Date.now() };
    docs.unshift(doc);
    currentId = doc.id;
    write(docs);
    load();
    els.title.focus();
  });

  els.saveDoc.addEventListener('click', () => saveCurrent(false));

  els.deleteDoc.addEventListener('click', () => {
    const doc = current();
    if (!doc) { say('삭제할 글이 없습니다.', true); return; }
    if (!window.confirm(`"${labelOf(doc)}"를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    docs = docs.filter(d => d.id !== doc.id);
    currentId = docs.length ? docs[0].id : null;
    write(docs);
    load();
    say('삭제했습니다.');
  });

  els.clearAll.addEventListener('click', () => {
    if (!docs.length) { say('저장된 글이 없습니다.', true); return; }
    if (!window.confirm(`저장된 글 ${docs.length}개를 전부 삭제할까요? 되돌릴 수 없습니다.`)) return;
    docs = [];
    currentId = null;
    write(docs);
    load();
    say('전부 삭제했습니다.');
  });

  els.formatDoc.addEventListener('click', () => {
    if (!formatter) return;
    const before = els.body.value;
    if (!before.trim()) { say('정리할 글이 없습니다.', true); return; }

    const after = formatter.formatText(before, 3, true, 0);
    if (!formatter.verifyPreservation(before, after)) {
      say('원문이 보존되지 않아 취소했습니다.', true);
      return;
    }
    els.body.value = after;
    analyse();
    saveCurrent(true);
    say('문단을 정리했습니다. 글자는 그대로입니다.');
  });

  els.exportTxt.addEventListener('click', () => download('txt', 'text/plain'));
  els.exportMd.addEventListener('click', () => download('md', 'text/markdown'));

  els.importFile.addEventListener('change', event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      saveCurrent(true);
      const text = String(reader.result || '');
      const doc = {
        id: newId(),
        title: file.name.replace(/\.(txt|md|markdown)$/i, ''),
        body: text,
        updated: Date.now()
      };
      docs.unshift(doc);
      currentId = doc.id;
      write(docs);
      load();
      say(`${file.name}을 불러왔습니다.`);
    };
    reader.onerror = () => say('파일을 읽지 못했습니다.', true);
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  });

  /* ── 입력 반응 ──────────────────────────────────────────── */
  let analyseTimer = 0;
  let saveTimer = 0;
  function onInput() {
    window.clearTimeout(analyseTimer);
    window.clearTimeout(saveTimer);
    analyseTimer = window.setTimeout(analyse, 260);
    saveTimer = window.setTimeout(() => saveCurrent(true), 1500);
  }
  els.body.addEventListener('input', onInput);
  els.title.addEventListener('input', onInput);

  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveCurrent(false);
    }
  });
  window.addEventListener('beforeunload', () => saveCurrent(true));

  load();
})();
