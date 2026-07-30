(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TextFormatterCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function normalizeLineEndings(text) {
    return String(text ?? '').replace(/\r\n?/g, '\n');
  }

  function nonWhitespace(text) {
    return String(text ?? '').replace(/\s/gu, '');
  }

  function splitSentences(text) {
    const normalized = normalizeLineEndings(text)
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .trim();

    if (!normalized) return [];

    const parts = normalized.match(/[\s\S]*?(?:[.!?。！？]+[”’"'」』)\]]*|$)(?=\s|$)/g) || [normalized];
    return parts.map(part => part.trim()).filter(Boolean);
  }

  function isPreferredBreak(textBeforeWhitespace) {
    return /[,;:，；：…—–ㅡ][”’"'」』)\]]?$/.test(textBeforeWhitespace);
  }

  function findWrapPoint(text, target) {
    const min = Math.max(24, Math.floor(target * 0.55));
    const max = Math.min(text.length - 1, Math.floor(target * 1.25));
    let fallback = -1;

    for (let index = Math.min(target, text.length - 1); index >= min; index -= 1) {
      if (!/\s/u.test(text[index])) continue;
      if (fallback < 0) fallback = index;
      if (isPreferredBreak(text.slice(0, index))) return index;
    }

    if (fallback >= 0) return fallback;

    for (let index = target + 1; index <= max; index += 1) {
      if (/\s/u.test(text[index])) return index;
    }

    return -1;
  }

  function softWrapBlock(text, maxChars) {
    const target = Number.parseInt(maxChars, 10) || 0;
    let remaining = String(text ?? '').trim();
    if (target < 40 || remaining.length <= target) return remaining;

    const lines = [];
    while (remaining.length > target) {
      const point = findWrapPoint(remaining, target);
      if (point < 0) break;
      const line = remaining.slice(0, point).trimEnd();
      if (!line) break;
      lines.push(line);
      remaining = remaining.slice(point).trimStart();
    }
    if (remaining) lines.push(remaining);
    return lines.join('\n');
  }

  function groupParagraph(text, sentenceCount, maxLineChars) {
    const count = Math.max(1, Number.parseInt(sentenceCount, 10) || 3);
    const sentences = splitSentences(text);
    const groups = [];
    for (let index = 0; index < sentences.length; index += count) {
      const block = sentences.slice(index, index + count).join(' ');
      groups.push(softWrapBlock(block, maxLineChars));
    }
    return groups.join('\n\n');
  }

  function formatText(text, sentenceCount, preserveExistingParagraphs, maxLineChars = 0) {
    const unified = normalizeLineEndings(text).trim();
    if (!unified) return '';

    if (!preserveExistingParagraphs) {
      return groupParagraph(unified.replace(/\n+/g, ' '), sentenceCount, maxLineChars);
    }

    const originalParagraphs = unified
      .split(/\n\s*\n+/)
      .map(paragraph => paragraph.replace(/\n+/g, ' ').trim())
      .filter(Boolean);

    return originalParagraphs
      .map(paragraph => groupParagraph(paragraph, sentenceCount, maxLineChars))
      .join('\n\n');
  }

  function verifyPreservation(input, output) {
    return nonWhitespace(input) === nonWhitespace(output);
  }

  return Object.freeze({
    normalizeLineEndings,
    nonWhitespace,
    splitSentences,
    softWrapBlock,
    groupParagraph,
    formatText,
    verifyPreservation
  });
});
