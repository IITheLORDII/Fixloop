const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateCatalog } = require('../lib/catalog-schema');

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'catalog-index.json'), 'utf8'));

test('doğrulayıcı tekrar, resmî olmayan kaynak, tehlikeli talimat ve kopuk dalı reddeder', () => {
  const duplicate = structuredClone(catalog);
  duplicate.issues.push(structuredClone(duplicate.issues[0]));
  assert.ok(validateCatalog(duplicate).some((error) => error.includes('Tekrarlı sorun kimliği')));

  const badSource = structuredClone(catalog);
  badSource.issues[0].sources[0].url = 'https://example.com/support';
  assert.ok(validateCatalog(badSource).some((error) => error.includes('resmî alan adı')));

  const dangerous = structuredClone(catalog);
  dangerous.issues[0].solutions[0].description = 'Güvenlik kilidini devre dışı bırak.';
  assert.ok(validateCatalog(dangerous).some((error) => error.includes('tehlikeli talimat')));

  const brokenBranch = structuredClone(catalog);
  brokenBranch.issues.find((issue) => issue.questions.length).questions[0].options[0].next = 'solution:99';
  assert.ok(validateCatalog(brokenBranch).some((error) => error.includes('olmayan çözüme')));
});
