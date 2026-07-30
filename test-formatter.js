const assert = require('assert');
const core = require('./assets/formatter-core.js');

const input = '첫 문장입니다. 두 번째 문장입니다! 세 번째 문장인가요? 네 번째 문장입니다.';
const output = core.formatText(input, 2, true);
assert.strictEqual(output, '첫 문장입니다. 두 번째 문장입니다!\n\n세 번째 문장인가요? 네 번째 문장입니다.');
assert.strictEqual(core.verifyPreservation(input, output), true);

const paragraphs = '하나입니다. 둘입니다.\n\n셋입니다. 넷입니다.';
const kept = core.formatText(paragraphs, 3, true);
assert.strictEqual(kept, paragraphs);
assert.strictEqual(core.verifyPreservation(paragraphs, kept), true);

const linebreaks = '한 줄입니다.\n이어진 줄입니다.';
const formatted = core.formatText(linebreaks, 2, true);
assert.strictEqual(formatted, '한 줄입니다. 이어진 줄입니다.');
assert.strictEqual(core.verifyPreservation(linebreaks, formatted), true);

const longSentence = '이 문장은 상당히 길게 이어지고, 중간에는 여러 개의 쉼표가 있으며, 원문의 단어나 문장부호를 바꾸지 않은 채로, 화면에서 읽기 쉬운 위치에 줄바꿈을 배치해야 합니다.';
const wrapped = core.formatText(longSentence, 3, true, 45);
assert.ok(wrapped.includes('\n'));
assert.strictEqual(core.verifyPreservation(longSentence, wrapped), true);
assert.strictEqual(core.nonWhitespace(longSentence), core.nonWhitespace(wrapped));

const unbrokenToken = '가'.repeat(200) + '.';
const unbrokenOutput = core.formatText(unbrokenToken, 3, true, 60);
assert.strictEqual(unbrokenOutput, unbrokenToken);
assert.strictEqual(core.verifyPreservation(unbrokenToken, unbrokenOutput), true);

console.log('formatter-core tests passed');
