const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const destination = path.join(root, 'dist', 'vendor', 'tesseract');
const coreDestination = path.join(destination, 'core');
const languageDestination = path.join(destination, 'lang-data');

const relativeDestination = path.relative(path.join(root, 'dist'), destination);
if (!relativeDestination || relativeDestination.startsWith('..') || path.isAbsolute(relativeDestination)) {
  throw new Error('OCR hedef dizini dist dışında olamaz.');
}

const assets = [
  ['node_modules/tesseract.js/dist/tesseract.min.js', 'tesseract.min.js'],
  ['node_modules/tesseract.js/dist/tesseract.min.js.LICENSE.txt', 'tesseract.min.js.LICENSE.txt'],
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['node_modules/tesseract.js/dist/worker.min.js.LICENSE.txt', 'worker.min.js.LICENSE.txt'],
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'core/tesseract-core-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm', 'core/tesseract-core-lstm.wasm'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'core/tesseract-core-simd-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm', 'core/tesseract-core-simd-lstm.wasm'],
  ['node_modules/tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'core/tesseract-core-relaxedsimd-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm', 'core/tesseract-core-relaxedsimd-lstm.wasm'],
  ['node_modules/tesseract.js-core/LICENSE', 'core/LICENSE'],
  ['node_modules/@tesseract.js-data/tur/4.0.0_best_int/tur.traineddata.gz', 'lang-data/tur.traineddata.gz'],
  ['node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'lang-data/eng.traineddata.gz']
];

fs.rmSync(destination, { recursive: true, force: true });
fs.mkdirSync(coreDestination, { recursive: true });
fs.mkdirSync(languageDestination, { recursive: true });

for (const [sourceName, destinationName] of assets) {
  const source = path.join(root, sourceName);
  const target = path.join(destination, destinationName);
  if (!fs.existsSync(source)) throw new Error(`OCR bağımlılığı bulunamadı: ${sourceName}`);
  fs.copyFileSync(source, target);
}

console.log(`Yerel OCR varlıkları hazırlandı: ${assets.length} dosya.`);
