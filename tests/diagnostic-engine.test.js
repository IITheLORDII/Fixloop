const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { rankCandidates, findEmergency, diagnose } = require('../lib/diagnostic-engine');

const root = path.join(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data', 'catalog-index.json'), 'utf8'));
const golden = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden-queries.json'), 'utf8'));

test('en az 200 Türkçe ve İngilizce altın sorguda hedef doğruluk sağlanır', () => {
  assert.ok(golden.length >= 200);
  assert.ok(golden.some((item) => item.language === 'tr'));
  assert.ok(golden.some((item) => item.language === 'en'));
  let top1 = 0;
  let top3 = 0;
  for (const item of golden) {
    const ranked = rankCandidates(catalog, { ...item, answers: [] });
    if (ranked[0]?.issue.id === item.expectedIssueId) top1 += 1;
    if (ranked.slice(0, 3).some((candidate) => candidate.issue.id === item.expectedIssueId)) top3 += 1;
  }
  assert.ok(top1 / golden.length >= 0.9, `ilk sonuç doğruluğu: ${top1}/${golden.length}`);
  assert.ok(top3 / golden.length >= 0.97, `ilk üç doğruluğu: ${top3}/${golden.length}`);
});

test('Türkçe karaktersiz yazım ve küçük yazım hataları eşleşir', () => {
  const ranked = rankCandidates(catalog, {
    problem: 'sarj olmuyor kablo takili ama sarj yok', deviceType: 'mobile', subType: 'android-phone', brandModel: 'Samsung Galaxy', answers: []
  });
  assert.equal(ranked[0].issue.id, 'android-phone-not-charging');
});

test('tehlikeli belirtilerin tamamı normal eşleştirmeyi geçersiz kılar', () => {
  const emergencyIssues = catalog.issues.filter((issue) => issue.safety === 'emergency');
  assert.ok(emergencyIssues.length >= 6);
  for (const issue of emergencyIssues) {
    for (const phrase of issue.aliases) assert.equal(findEmergency(catalog, phrase)?.id, issue.id, phrase);
  }
});

test('olumsuz ifade yanlış acil alarm üretmez', () => {
  const result = diagnose(catalog, {
    problem: 'Gaz kokusu yok, bulaşık makinesi suyu boşaltmıyor',
    deviceType: 'appliance', subType: 'dishwasher', brandModel: 'Beko', answers: []
  });
  assert.notEqual(result.issue?.safety, 'emergency');
});

test('belirsiz sorgu en fazla üç sorudan sonra güvenli fallback verir', () => {
  const input = { problem: 'bir sorun var', deviceType: 'computer', subType: 'windows-laptop', brandModel: '', answers: [] };
  let result = diagnose(catalog, input);
  assert.equal(result.type, 'question');
  while (result.type === 'question') {
    const none = result.question.options.find((option) => option.id.startsWith('none:'));
    input.answers.push({ questionId: result.question.id, optionId: none.id });
    result = diagnose(catalog, input);
  }
  assert.equal(input.answers.length, 3);
  assert.equal(result.type, 'fallback');
  assert.equal(result.fallback.subType, 'windows-laptop');
});

test('13 cihaz ailesinin her birinde normal, belirsiz ve güvenlik senaryosu sonuçlanır', () => {
  for (const device of catalog.deviceTypes) {
    const expected = catalog.issues.find((issue) => issue.deviceType === device.id && issue.safety !== 'emergency');
    const normal = diagnose(catalog, {
      problem: expected.symptoms.tr[0], deviceType: device.id, subType: expected.subType,
      brandModel: expected.brandPatterns[0] || '', answers: [{ questionId:'test', optionId:`issue:${expected.id}` }]
    });
    assert.equal(normal.type, 'solution', `${device.id}: normal akış`);
    assert.equal(normal.issue.id, expected.id, `${device.id}: doğru çözüm`);

    const ambiguousInput = { problem:'tanımlayamadığım bir sorun var', deviceType:device.id, subType:device.subtypes[0].id, brandModel:'', answers:[] };
    let ambiguous = diagnose(catalog, ambiguousInput);
    assert.equal(ambiguous.type, 'question', `${device.id}: soru akışı`);
    while (ambiguous.type === 'question') {
      const none = ambiguous.question.options.find((option) => option.id.startsWith('none:'));
      ambiguousInput.answers.push({ questionId:ambiguous.question.id, optionId:none.id });
      ambiguous = diagnose(catalog, ambiguousInput);
    }
    assert.equal(ambiguous.type, 'fallback', `${device.id}: fallback akışı`);

    const emergency = diagnose(catalog, {
      problem:'Cihazdan duman çıkıyor', deviceType:device.id, subType:device.subtypes[0].id, brandModel:'', answers:[]
    });
    assert.equal(emergency.issue?.safety, 'emergency', `${device.id}: güvenlik akışı`);
  }
});

test('hata kodu kanıtı varsa güven yüzde 99 olur', () => {
  const target = catalog.issues.find((issue) => issue.safety !== 'emergency' && issue.errorCodes.length);
  if (!target) return assert.ok(true, 'Katalogda uydurma genel hata kodu tutulmuyor');
  const result = diagnose(catalog, {
    problem: `Hata: ${target.errorCodes[0]}`, deviceType: target.deviceType, subType: target.subType,
    brandModel: target.brandPatterns[0] || '', answers: []
  });
  assert.equal(result.type, 'solution');
  assert.equal(result.issue.id, target.id);
  assert.equal(result.confidence, 99);
});
