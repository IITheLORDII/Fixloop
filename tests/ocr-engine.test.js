const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const zlib = require('node:zlib');
const { createWorker } = require('tesseract.js');

const FONT = {
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  4: ['00100', '01100', '10100', '11111', '00100', '00100', '00100'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000']
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function chunk(type, data = Buffer.alloc(0)) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function textPng(text) {
  const scale = 14;
  const padding = 40;
  const width = padding * 2 + text.length * 6 * scale;
  const height = padding * 2 + 7 * scale;
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 3, 255);
    row[0] = 0;
    for (let charIndex = 0; charIndex < text.length; charIndex += 1) {
      const glyph = FONT[text[charIndex]] || FONT[' '];
      for (let glyphY = 0; glyphY < 7; glyphY += 1) {
        for (let glyphX = 0; glyphX < 5; glyphX += 1) {
          if (glyph[glyphY][glyphX] !== '1') continue;
          const startX = padding + (charIndex * 6 + glyphX) * scale;
          const startY = padding + glyphY * scale;
          if (y < startY || y >= startY + scale) continue;
          for (let pixelX = startX; pixelX < startX + scale; pixelX += 1) {
            const offset = 1 + pixelX * 3;
            row[offset] = 8;
            row[offset + 1] = 12;
            row[offset + 2] = 24;
          }
        }
      }
    }
    rows.push(row);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))), chunk('IEND')
  ]);
}

module.exports = { textPng };

test('paketlenmiş İngilizce dil modeli gerçek PNG metnini çevrimdışı okur', { timeout: 30000 }, async () => {
  const worker = await createWorker('eng', 1, {
    langPath: path.join(__dirname, '..', 'dist', 'vendor', 'tesseract', 'lang-data'),
    cacheMethod: 'none'
  });
  try {
    const result = await worker.recognize(textPng('ERROR 42'));
    assert.match(result.data.text, /ERROR/i);
    assert.match(result.data.text, /42/);
  } finally {
    await worker.terminate();
  }
});
