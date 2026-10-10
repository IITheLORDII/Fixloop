const fs = require('node:fs');
const path = require('node:path');
const { validateCatalog } = require('../lib/catalog-schema');

const root = path.join(__dirname, '..');
const catalogDirectory = path.join(root, 'data', 'catalog');
const indexPath = path.join(root, 'data', 'catalog-index.json');
const legacyPath = path.join(root, 'data', 'knowledge-base.json');
const runtimeDirectory = path.join(root, 'data', 'runtime');
const attemptsPath = path.join(runtimeDirectory, 'attempts.json');
const feedbackPath = path.join(runtimeDirectory, 'feedback.json');
const missingPath = path.join(runtimeDirectory, 'missing-catalog.json');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJson = (filePath, value) => fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

if (!fs.existsSync(catalogDirectory)) throw new Error('data/catalog bulunamadı. Önce npm run catalog:generate çalıştırın.');

const files = fs.readdirSync(catalogDirectory)
  .filter((name) => name.endsWith('.json'))
  .sort((a, b) => a.localeCompare(b, 'en'));

const packs = files.map((name) => ({ name, value: readJson(path.join(catalogDirectory, name)) }));
const devicesById = new Map();
const issues = [];
const fallbacks = [];

for (const { name, value: pack } of packs) {
  if (pack.schemaVersion !== 3 || !pack.id || !Array.isArray(pack.issues) || !Array.isArray(pack.fallbacks)) {
    throw new Error(`${name}: geçersiz katalog paketi`);
  }
  for (const device of pack.deviceTypes || []) {
    const existing = devicesById.get(device.id);
    if (!existing) devicesById.set(device.id, device);
    else {
      const known = new Set(existing.subtypes.map((item) => item.id));
      existing.subtypes.push(...device.subtypes.filter((item) => !known.has(item.id)));
    }
  }
  issues.push(...pack.issues);
  fallbacks.push(...pack.fallbacks);
}

const catalog = {
  schemaVersion: 3,
  version: '3.0.0',
  generatedAt: new Date().toISOString(),
  packFiles: files,
  deviceTypes: [...devicesById.values()],
  issues,
  fallbacks
};

const errors = validateCatalog(catalog);
if (errors.length) throw new Error(`Katalog derlenemedi:\n${errors.join('\n')}`);
writeJson(indexPath, catalog);

const goldenQueries = [];
for (const issue of issues.filter((item) => item.safety !== 'emergency')) {
  const subType = catalog.deviceTypes.flatMap((device) => device.subtypes).find((item) => item.id === issue.subType);
  const brandModel = [issue.brandPatterns[0], issue.modelPatterns[0]].filter(Boolean).join(' ');
  goldenQueries.push({
    id: `${issue.id}-tr`, problem: `${issue.symptoms.tr[0]} ${subType?.label || ''}`.trim(),
    deviceType: issue.deviceType, subType: issue.subType, brandModel, expectedIssueId: issue.id, language: 'tr'
  });
  if (goldenQueries.length < 240 && issue.symptoms.en[0]) {
    goldenQueries.push({
      id: `${issue.id}-en`, problem: `${issue.symptoms.en[0]} ${subType?.label || ''}`.trim(),
      deviceType: issue.deviceType, subType: issue.subType, brandModel, expectedIssueId: issue.id, language: 'en'
    });
  }
}
fs.mkdirSync(path.join(root, 'tests'), { recursive: true });
writeJson(path.join(root, 'tests', 'golden-queries.json'), goldenQueries.slice(0, 320));

fs.mkdirSync(runtimeDirectory, { recursive: true });
let legacyAttempts = [];
if (fs.existsSync(legacyPath)) {
  try { legacyAttempts = readJson(legacyPath).attempts || []; } catch { legacyAttempts = []; }
}
if (!fs.existsSync(attemptsPath)) {
  writeJson(attemptsPath, legacyAttempts.map((attempt) => ({
    ...attempt,
    deviceType: attempt.deviceType || attempt.platform || '',
    migratedFrom: attempt.platform ? 'knowledge-base-v2' : undefined
  })));
}
if (!fs.existsSync(feedbackPath)) writeJson(feedbackPath, []);
if (!fs.existsSync(missingPath)) writeJson(missingPath, []);

console.log(`Katalog derlendi: ${issues.length} sorun, ${fallbacks.length} fallback, ${devicesById.size} cihaz ailesi, ${files.length} paket.`);
