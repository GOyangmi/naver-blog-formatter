const assert = require('assert');
const core = require('./assets/readability-core.js');

// ── 빈 입력 ───────────────────────────────────────────────
const empty = core.analyze('');
assert.strictEqual(empty.empty, true);
assert.strictEqual(empty.score.total, 0);
assert.strictEqual(core.analyze(null).empty, true);
assert.strictEqual(core.analyze('   \n\n  ').empty, true);

// ── 기본 계수 ─────────────────────────────────────────────
const simple = core.analyze('첫 문장입니다. 둘째 문장입니다.\n\n셋째 문장입니다.');
assert.strictEqual(simple.counts.sentences, 3);
assert.strictEqual(simple.counts.paragraphs, 2);
assert.strictEqual(simple.chars.withoutSpace, '첫문장입니다.둘째문장입니다.셋째문장입니다.'.length);

// ── 잘 쓴 글은 높은 점수 ─────────────────────────────────
const good = core.analyze([
  '아침에 문을 열자마자 찬 공기가 들어왔다.',
  '한동안 창가에 서서 골목을 내려다봤다.',
  '',
  '어제 내린 비로 길이 아직 젖어 있었어요.',
  '우산을 든 사람들이 천천히 지나갔습니다.',
  '',
  '오늘은 조금 일찍 나가 보려 합니다.',
  '걷다 보면 생각이 정리되곤 하죠.'
].join('\n'));
assert.ok(good.score.total >= 78, `잘 쓴 글은 78점 이상이어야 한다 (실제 ${good.score.total})`);
assert.ok(['A', 'B'].includes(good.score.grade), `등급은 A 또는 B (실제 ${good.score.grade})`);
assert.strictEqual(good.issues[0].key, 'clean');

// ── 한 덩어리 긴 글은 낮은 점수 ──────────────────────────
const wall = core.analyze(
  ('오늘은 아침부터 정말 많은 일이 있었는데 우선 일찍 일어나서 준비를 하고 밖으로 나갔더니 ' +
   '생각보다 날씨가 추워서 다시 들어와 옷을 갈아입고 나가느라 시간이 조금 지체되었고 그래서 ' +
   '결국 약속 시간에 조금 늦게 도착했지만 다행히 상대방도 늦어서 큰 문제는 없었습니다. ').repeat(4)
);
assert.ok(wall.score.total < 70, `벽 같은 글은 70점 미만이어야 한다 (실제 ${wall.score.total})`);
assert.ok(wall.sentenceStats.longCount > 0);
assert.ok(wall.longParagraphs.length > 0);
assert.ok(wall.issues.some(i => i.key === 'long-sentence'));
assert.ok(wall.issues.some(i => i.key === 'long-paragraph'));

// ── 긴 문장 탐지 ─────────────────────────────────────────
const longOne = core.analyze('짧다. ' + '가'.repeat(80) + '.');
assert.strictEqual(longOne.sentenceStats.longCount, 1);
assert.strictEqual(longOne.longSentences[0].length, 81);

// ── 번역투 탐지 ──────────────────────────────────────────
const stiff = core.analyze(
  '이 글에 대한 설명입니다. 자료를 통해 정리되어졌습니다. 결과에 의해 판단됩니다. 그것에 대해 알아보겠습니다.'
);
assert.ok(stiff.translationese.length >= 3, '번역투 표현이 여러 개 잡혀야 한다');
assert.ok(stiff.issues.some(i => i.key === 'translationese'));

// ── 같은 어미 반복 탐지 ──────────────────────────────────
const monotone = core.analyze(
  '하나입니다. 둘입니다. 셋입니다. 넷입니다. 다섯입니다. 여섯입니다.'
);
assert.ok(monotone.issues.some(i => i.key === 'ending-run'), '같은 어미 연속이 잡혀야 한다');

// ── 강조 부호 남용 탐지 ──────────────────────────────────
const shouty = core.analyze('대박!! 진짜요?? 완전 좋아요!! 최고!! 강추!!');
assert.ok(shouty.issues.some(i => i.key === 'marks'));

// ── 점수 구조 ────────────────────────────────────────────
const breakdown = good.score.breakdown;
assert.strictEqual(breakdown.length, 6);
assert.strictEqual(breakdown.reduce((sum, item) => sum + item.max, 0), 100);
for (const item of breakdown) {
  assert.ok(item.score >= 0 && item.score <= item.max, `${item.key} 점수 범위 오류`);
  assert.ok(item.detail && item.comment, `${item.key} 설명 누락`);
}
assert.ok(good.score.total >= 0 && good.score.total <= 100);

// ── 모바일 추정 ──────────────────────────────────────────
assert.ok(good.mobile.lines > 0);
assert.ok(good.mobile.screens >= 1);

// ── 원문을 바꾸지 않는다 ─────────────────────────────────
const source = '원문입니다. 그대로 있어야 합니다.';
core.analyze(source);
assert.strictEqual(source, '원문입니다. 그대로 있어야 합니다.');

// ── 유틸 ─────────────────────────────────────────────────
assert.deepStrictEqual(core.splitParagraphs('가.\n\n나.'), ['가.', '나.']);
assert.deepStrictEqual(core.splitSentences('가. 나!'), ['가.', '나!']);
assert.deepStrictEqual(core.countChars('가 나'), { withSpace: 3, withoutSpace: 2 });

console.log(`readability-core tests passed (좋은 글 ${good.score.total}점 / 벽 같은 글 ${wall.score.total}점)`);
