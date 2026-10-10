const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const input = process.argv[2];
if (!input) {
  console.error('Kullanım: npm run catalog:import -- C:\\yol\\paket.json');
  process.exit(1);
}

const sourcePath = path.resolve(input);
if (!fs.existsSync(sourcePath) || path.extname(sourcePath).toLowerCase() !== '.json') {
  console.error('İçe aktarılacak JSON paketi bulunamadı.');
  process.exit(1);
}

let pack;
try { pack = JSON.parse(fs.readFileSync(sourcePath, 'utf8')); } catch {
  console.error('Paket geçerli JSON değil.');
  process.exit(1);
}
if (pack.schemaVersion !== 3 || !pack.id || !Array.isArray(pack.issues) || !Array.isArray(pack.fallbacks) || !Array.isArray(pack.deviceTypes)) {
  console.error('Paket FixLoop şema sürümü 3 ile uyumlu değil.');
  process.exit(1);
}

const safeId = pack.id.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replaceAll('ı', 'i').replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
const destination = path.join(__dirname, '..', 'data', 'catalog', `imported-${safeId}.json`);
if (fs.existsSync(destination)) {
  console.error(`Bu paket zaten var: ${destination}`);
  process.exit(1);
}

fs.copyFileSync(sourcePath, destination, fs.constants.COPYFILE_EXCL);
const build = spawnSync(process.execPath, [path.join(__dirname, 'build-catalog.js')], { encoding: 'utf8' });
if (build.status !== 0) {
  fs.unlinkSync(destination);
  console.error(`Paket doğrulanamadı ve geri alındı:\n${build.stderr || build.stdout}`);
  process.exit(1);
}
console.log(`Paket içe aktarıldı: ${destination}`);
console.log(build.stdout.trim());
