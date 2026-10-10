const fs = require('node:fs');
const path = require('node:path');
const { validateCatalog } = require('../lib/catalog-schema');

const filePath = path.join(__dirname, '..', 'data', 'catalog-index.json');
if (!fs.existsSync(filePath)) {
  console.error('Derlenmiş katalog bulunamadı. npm run catalog:build çalıştırın.');
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const errors = validateCatalog(catalog);
if (catalog.issues.length < 500) errors.push(`En az 500 sorun gerekli; bulunan: ${catalog.issues.length}`);
if (catalog.deviceTypes.length < 13) errors.push(`En az 13 cihaz ailesi gerekli; bulunan: ${catalog.deviceTypes.length}`);
if (catalog.issues.filter((issue) => issue.safety === 'emergency').length < 6) errors.push('En az 6 acil güvenlik akışı gerekli');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const sourceCount = new Set(catalog.issues.flatMap((issue) => issue.sources.map((source) => source.url))).size;
const subtypeCount = catalog.deviceTypes.reduce((total, device) => total + device.subtypes.length, 0);
console.log(`Katalog doğrulandı: ${catalog.issues.length} sorun, ${subtypeCount} alt tür, ${catalog.fallbacks.length} fallback, ${sourceCount} resmî kaynak.`);
