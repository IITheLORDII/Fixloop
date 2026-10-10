const test = require('node:test');
const assert = require('node:assert/strict');
const { validateImageFile, redactSensitiveText, cleanOcrText, mergeProblemText } = require('../dist/ocr-utils');

test('OCR yalnızca güvenli boyuttaki PNG ve JPG dosyalarını kabul eder', () => {
  assert.equal(validateImageFile({ type: 'image/png', size: 2048 }).valid, true);
  assert.equal(validateImageFile({ type: 'image/jpeg', size: 4096 }).valid, true);
  assert.match(validateImageFile({ type: 'image/svg+xml', size: 100 }).error, /PNG ve JPG/);
  assert.match(validateImageFile({ type: 'image/png', size: 13 * 1024 * 1024 }).error, /12 MB/);
});

test('OCR metnindeki yaygın hassas bilgiler tanıdan önce maskelenir', () => {
  const raw = 'E-posta test@example.com password: superSecret token=abc123 kart 4111 1111 1111 1111';
  const redacted = redactSensitiveText(raw);
  assert.doesNotMatch(redacted, /test@example\.com|superSecret|abc123|4111/);
  assert.match(redacted, /e-posta gizlendi/);
  assert.match(redacted, /gizlendi/);
});

test('OCR satırları temizlenir ve kullanıcı açıklamasıyla tek tanı metninde birleşir', () => {
  assert.equal(cleanOcrText('  Bluetooth\n error   42  '), 'Bluetooth error 42');
  assert.equal(mergeProblemText('Kulaklık çalışmıyor', 'Error 42'), 'Kulaklık çalışmıyor\nEkran metni: Error 42');
  assert.equal(mergeProblemText('', 'Error 42'), 'Error 42');
});
