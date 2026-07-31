const assert = require('assert');
const core = require('./assets/proofread-core.js');

/** 특정 규칙이 잡혔는지 확인 */
function findingsFor(text) {
  return core.check(text).findings;
}
function matched(text) {
  return findingsFor(text).map(f => `${f.matched}→${f.suggestion}`);
}

// ── 맞춤법 ────────────────────────────────────────────────
assert.deepStrictEqual(matched('오늘 일이 잘 됬어요.'), ['됬→됐']);
assert.deepStrictEqual(matched('그렇게 하면 안되요.'), ['되요→돼요']);
assert.deepStrictEqual(matched('몇일 뒤에 만나요.'), ['몇일→며칠']);
assert.deepStrictEqual(matched('오랫만에 연락했습니다.'), ['오랫만→오랜만']);
assert.deepStrictEqual(matched('그 역활은 제가 맡을게요.'), ['역활→역할']);
assert.deepStrictEqual(matched('왠만하면 그냥 넘어가죠.'), ['왠만→웬만']);
// '않' + 하/되: 어미가 합쳐진 활용형도 잡아야 한다
assert.deepStrictEqual(matched('그건 저도 않합니다.'), ['않합니다→안 합니다']);
assert.deepStrictEqual(matched('그렇게 하면 않됩니다.'), ['않됩니다→안 됩니다']);
assert.deepStrictEqual(matched('아직 않했어요.'), ['않했→안 했']);
// 올바른 '않'은 건드리지 않는다
assert.deepStrictEqual(matched('가지 않았습니다.'), []);
assert.deepStrictEqual(matched('이게 왠일이야.'), ['왠일→웬일']);

// ── 외래어 표기 ───────────────────────────────────────────
assert.deepStrictEqual(matched('좋은 컨텐츠를 만들려면'), ['컨텐츠→콘텐츠']);
assert.deepStrictEqual(matched('메세지를 남겨 주세요.'), ['메세지→메시지']);
assert.deepStrictEqual(matched('타겟 독자를 정하세요.'), ['타겟→타깃']);

// ── 띄어쓰기: 관형형 ㄹ + 의존명사 ────────────────────────
assert.deepStrictEqual(matched('누구나 할수있습니다.'), ['할수있→할 수 있']);
assert.deepStrictEqual(matched('그건 볼수없어요.'), ['볼수없→볼 수 없']);
assert.deepStrictEqual(matched('글을 쓸때 생각합니다.'), ['쓸때→쓸 때']);
// 종성이 ㄹ이 아니면 건드리지 않는다
assert.deepStrictEqual(matched('가수있다'), []);
// '물때'는 한 단어라 예외
assert.deepStrictEqual(matched('물때를 확인했다'), []);

assert.deepStrictEqual(matched('읽은것같아요.'), ['것같→것 같']);
assert.deepStrictEqual(matched('첫번째 글입니다.'), ['첫번째→첫 번째']);
assert.deepStrictEqual(matched('좀더 자세히 볼게요.'), ['좀더→좀 더']);
assert.deepStrictEqual(matched('읽는게 편합니다.'), ['는게→는 게']);
// 뒤에 공백이 없으면 단어 일부일 수 있으므로 건드리지 않는다
assert.deepStrictEqual(matched('하는게임'), []);

// ── 문장부호 ──────────────────────────────────────────────
assert.deepStrictEqual(matched('정말 좋아요 .'), ['요 .→요.']);
assert.deepStrictEqual(matched('첫째,둘째'), [',둘→, 둘']);
assert.deepStrictEqual(matched('진짜요???'), ['???→?']);
assert.deepStrictEqual(matched('음... 그렇군요'), ['...→…']);
assert.deepStrictEqual(matched('아 ㅋㅋㅋㅋㅋㅋㅋ 웃겨'), ['ㅋㅋㅋㅋㅋㅋㅋ→ㅋㅋㅋ']);

// ── 표현 다듬기: 이중 피동 ────────────────────────────────
assert.deepStrictEqual(matched('그렇게 되어지는 겁니다.'), ['되어지→되']);
// '지'와 뒤 어미가 한 글자로 합쳐지는 활용형도 잡아야 한다
assert.deepStrictEqual(matched('자연스럽게 정리되어집니다.'), ['되어집니다→됩니다']);
assert.deepStrictEqual(matched('그렇게 보여집니다.'), ['보여집니다→보입니다']);
assert.deepStrictEqual(matched('이미 잊혀진 이야기'), ['잊혀진→잊힌']);
assert.deepStrictEqual(matched('둘로 나뉘어졌어요'), ['나뉘어졌→나뉘었']);
assert.deepStrictEqual(matched('여기에 쓰여진 글'), ['쓰여진→쓰인']);
// 긴 활용형이 짧은 규칙보다 먼저 잡혀야 한다
assert.strictEqual(core.check('정리되어집니다').findings[0].suggestion, '됩니다');

assert.deepStrictEqual(matched('정말 정말 정말 좋아요'), ['정말 정말 정말→정말']);

// ── 위치 정보 ─────────────────────────────────────────────
const positioned = core.check('첫 줄입니다.\n둘째 줄에 됬어요.');
assert.strictEqual(positioned.findings.length, 1);
assert.strictEqual(positioned.findings[0].position.line, 2);
assert.strictEqual(positioned.findings[0].matched, '됬');
assert.ok(positioned.findings[0].context.after.length > 0);

// ── 적용: 고른 항목만 반영, 원문은 그대로 ────────────────
const original = '컨텐츠가 잘 됬고, 메세지도 좋아요.';
const result = core.check(original);
assert.strictEqual(result.findings.length, 3);

const all = core.apply(original, result.findings);
assert.strictEqual(all, '콘텐츠가 잘 됐고, 메시지도 좋아요.');
assert.strictEqual(original, '컨텐츠가 잘 됬고, 메세지도 좋아요.', '원문 문자열은 변경되지 않아야 한다');

const partial = core.apply(original, [result.findings[0]]);
assert.strictEqual(partial, '콘텐츠가 잘 됬고, 메세지도 좋아요.');

const none = core.apply(original, []);
assert.strictEqual(none, original);

// ── 겹치는 구간은 한 번만 잡는다 ─────────────────────────
for (const finding of result.findings) {
  const slice = original.slice(finding.index, finding.index + finding.length);
  assert.strictEqual(slice, finding.matched, '인덱스와 매칭 문자열이 일치해야 한다');
}

// ── 요약 ─────────────────────────────────────────────────
assert.strictEqual(result.summary.total, 3);
assert.strictEqual(result.summary.byCategory['외래어 표기'], 2);
assert.strictEqual(result.summary.byCategory['맞춤법'], 1);

// ── 빈 입력·정상 문장 ────────────────────────────────────
assert.strictEqual(core.check('').findings.length, 0);
assert.strictEqual(core.check(null).findings.length, 0);
assert.strictEqual(
  core.check('오늘은 날씨가 좋았습니다. 오랜만에 산책을 다녀왔어요.').findings.length,
  0,
  '문제 없는 문장에서 오탐이 없어야 한다'
);

// ── 종성 ㄹ 판별 ─────────────────────────────────────────
assert.strictEqual(core.hasFinalRieul('할'), true);
assert.strictEqual(core.hasFinalRieul('하'), false);
assert.strictEqual(core.hasFinalRieul('A'), false);
assert.strictEqual(core.hasFinalRieul(''), false);

assert.ok(core.ruleCount > 150, `규칙 수가 충분해야 한다 (현재 ${core.ruleCount})`);

console.log(`proofread-core tests passed (규칙 ${core.ruleCount}개)`);
