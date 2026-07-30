(() => {
  'use strict';

  const core = window.TextFormatterCore;
  if (!core) return;

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const sentenceCount = document.getElementById('sentenceCount');
  const lineLength = document.getElementById('lineLength');
  const preserveParagraphs = document.getElementById('preserveParagraphs');
  const status = document.getElementById('status');
  const inputCount = document.getElementById('inputCount');
  const outputCount = document.getElementById('outputCount');

  function updateCounts() {
    inputCount.textContent = `${input.value.length.toLocaleString('ko-KR')}자`;
    outputCount.textContent = `${output.value.length.toLocaleString('ko-KR')}자`;
  }

  function verify() {
    status.className = 'verification';
    if (!output.value) {
      status.textContent = '정리 후 공백을 제외한 원문이 완전히 동일한지 자동으로 확인합니다.';
      return false;
    }

    const same = core.verifyPreservation(input.value, output.value);
    if (same) {
      const breaks = (output.value.match(/\n/g) || []).length;
      status.classList.add('ok');
      status.textContent = `검증 완료: 공백을 제외한 모든 글자와 문장부호가 같습니다. 줄바꿈 ${breaks.toLocaleString('ko-KR')}개가 배치됐습니다.`;
    } else {
      status.classList.add('bad');
      status.textContent = '검증 실패: 원문과 결과의 비공백 문자가 다릅니다. 결과를 사용하지 마세요.';
    }
    return same;
  }

  function format() {
    output.value = core.formatText(
      input.value,
      Number(sentenceCount.value),
      preserveParagraphs.checked,
      Number(lineLength.value)
    );
    updateCounts();
    verify();
  }

  async function copyResult() {
    if (!output.value || !verify()) return;
    try {
      await navigator.clipboard.writeText(output.value);
    } catch {
      output.focus();
      output.select();
      document.execCommand('copy');
      output.setSelectionRange(0, 0);
    }
    status.className = 'verification ok';
    status.textContent = '결과를 복사했습니다. 네이버 블로그 본문에 붙여 넣으세요.';
    window.setTimeout(verify, 1800);
  }

  function downloadResult() {
    if (!output.value || !verify()) return;
    const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'naver-blog-formatted.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  document.getElementById('formatBtn').addEventListener('click', format);
  document.getElementById('copyBtn').addEventListener('click', copyResult);
  document.getElementById('downloadBtn').addEventListener('click', downloadResult);
  document.getElementById('clearBtn').addEventListener('click', () => {
    input.value = '';
    output.value = '';
    updateCounts();
    verify();
    input.focus();
  });

  input.addEventListener('input', () => {
    updateCounts();
    if (output.value) verify();
  });

  input.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      format();
    }
  });

  updateCounts();
})();
