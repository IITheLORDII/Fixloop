const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { diagnose, normalize } = require('./lib/diagnostic-engine');

const HOST = '127.0.0.1';
const PORT = Number(process.env.FIXLOOP_PORT || 4173);
const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const CATALOG_PATH = path.join(ROOT, 'data', 'catalog-index.json');
const RUNTIME = process.env.FIXLOOP_DATA_DIR ? path.resolve(process.env.FIXLOOP_DATA_DIR) : path.join(ROOT, 'data', 'runtime');
const ATTEMPTS_PATH = path.join(RUNTIME, 'attempts.json');
const FEEDBACK_PATH = path.join(RUNTIME, 'feedback.json');
const MISSING_PATH = path.join(RUNTIME, 'missing-catalog.json');
const MAX_BODY_BYTES = 64 * 1024;

const contentTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm', '.gz': 'application/gzip'
};

function readJson(filePath, fallback = []) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return fallback; }
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${crypto.randomUUID()}.tmp`);
  const descriptor = fs.openSync(temporary, 'wx');
  try {
    fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
  try { fs.renameSync(temporary, filePath); } catch (error) {
    try { fs.unlinkSync(temporary); } catch {}
    throw error;
  }
}

function loadCatalog() {
  const catalog = readJson(CATALOG_PATH, null);
  if (!catalog?.issues?.length) throw new Error('Yerel katalog bulunamadı. npm run catalog:build çalıştırın.');
  return catalog;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': contentTypes['.json'], 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
        reject(new Error('İstek çok büyük.'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Geçersiz JSON.')); }
    });
    request.on('error', reject);
  });
}

const cleanText = (value, maxLength = 500) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

function feedbackSummary() {
  const summary = {};
  for (const item of readJson(FEEDBACK_PATH)) {
    if (!item.issueId) continue;
    summary[item.issueId] ||= { total: 0, fixed: 0 };
    summary[item.issueId].total += 1;
    if (item.outcome === 'fixed') summary[item.issueId].fixed += 1;
  }
  return summary;
}

function appendAttempt(input, result, sessionId) {
  const attempts = readJson(ATTEMPTS_PATH);
  const attempt = {
    id: crypto.randomUUID(), sessionId, createdAt: new Date().toISOString(),
    problem: input.problem, deviceType: input.deviceType, subType: input.subType,
    brandModel: input.brandModel, screenshotName: input.screenshotName,
    resultType: result.type,
    issueId: result.issue?.id || '', fallbackId: result.fallback?.id || '',
    confidence: result.confidence || 0, answers: input.answers, outcome: 'pending', solutionIndex: 0
  };
  attempts.push(attempt);
  writeJsonAtomic(ATTEMPTS_PATH, attempts);
  return attempt.id;
}

function recordMissing(input, result) {
  const missing = readJson(MISSING_PATH);
  const key = `${input.deviceType}|${input.subType}|${normalize(input.problem)}`;
  const current = missing.find((item) => item.key === key);
  if (current) {
    current.count += 1;
    current.lastSeenAt = new Date().toISOString();
    current.candidates = result.candidates;
  } else {
    missing.push({
      id: crypto.randomUUID(), key, firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), count: 1,
      problem: input.problem, deviceType: input.deviceType, subType: input.subType,
      brandModel: input.brandModel, candidates: result.candidates
    });
  }
  writeJsonAtomic(MISSING_PATH, missing);
}

function catalogStats(catalog) {
  const attempts = readJson(ATTEMPTS_PATH);
  const feedback = readJson(FEEDBACK_PATH);
  const missing = readJson(MISSING_PATH);
  const byDevice = Object.fromEntries(catalog.deviceTypes.map((device) => [device.id, catalog.issues.filter((issue) => issue.deviceType === device.id).length]));
  const byCategory = {};
  for (const issue of catalog.issues) byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
  return {
    version: catalog.version, generatedAt: catalog.generatedAt,
    issueCount: catalog.issues.length,
    deviceTypeCount: catalog.deviceTypes.length,
    subTypeCount: catalog.deviceTypes.reduce((sum, device) => sum + device.subtypes.length, 0),
    fallbackCount: catalog.fallbacks.length,
    officialSourceCount: new Set(catalog.issues.flatMap((issue) => issue.sources.map((source) => source.url))).size,
    missingCount: missing.length,
    totalAttempts: attempts.length,
    solved: feedback.filter((item) => item.outcome === 'fixed').length,
    unresolved: feedback.filter((item) => item.outcome === 'not_fixed').length,
    byDevice, byCategory
  };
}

async function handleApi(request, response, pathname) {
  const catalog = loadCatalog();
  if (request.method === 'GET' && pathname === '/api/catalog') {
    return sendJson(response, 200, {
      version: catalog.version, generatedAt: catalog.generatedAt,
      deviceTypes: catalog.deviceTypes,
      issueCount: catalog.issues.length, fallbackCount: catalog.fallbacks.length
    });
  }
  if (request.method === 'GET' && (pathname === '/api/catalog/stats' || pathname === '/api/stats')) {
    return sendJson(response, 200, catalogStats(catalog));
  }
  if (request.method === 'POST' && pathname === '/api/diagnose') {
    const body = await readJsonBody(request);
    const input = {
      problem: cleanText(body.problem, 1000),
      deviceType: cleanText(body.deviceType, 40),
      subType: cleanText(body.subType, 80),
      brandModel: cleanText(body.brandModel || body.brand, 120),
      screenshotName: cleanText(body.screenshotName, 160),
      answers: Array.isArray(body.answers) ? body.answers.slice(0, 3).map((answer) => ({
        questionId: cleanText(answer.questionId, 120), optionId: cleanText(answer.optionId, 400)
      })) : []
    };
    const device = catalog.deviceTypes.find((item) => item.id === input.deviceType);
    if (!input.problem || !device) return sendJson(response, 400, { error: 'Sorun ve geçerli cihaz türü gerekli.' });
    if (input.subType && !device.subtypes.some((item) => item.id === input.subType)) return sendJson(response, 400, { error: 'Seçilen alt cihaz türü geçersiz.' });

    const result = diagnose(catalog, input, feedbackSummary());
    const sessionId = cleanText(body.sessionId, 80) || crypto.randomUUID();
    let attemptId = '';
    if (result.type === 'solution' || result.type === 'fallback') {
      attemptId = appendAttempt(input, result, sessionId);
      if (result.type === 'fallback') recordMissing(input, result);
    }
    return sendJson(response, 200, { ...result, sessionId, attemptId });
  }
  if (request.method === 'POST' && pathname === '/api/feedback') {
    const body = await readJsonBody(request);
    const attemptId = cleanText(body.attemptId, 80);
    const outcome = body.outcome === 'fixed' ? 'fixed' : body.outcome === 'not_fixed' ? 'not_fixed' : '';
    if (!attemptId || !outcome) return sendJson(response, 400, { error: 'Deneme ve sonuç gerekli.' });
    const attempts = readJson(ATTEMPTS_PATH);
    const attempt = attempts.find((item) => item.id === attemptId);
    if (!attempt) return sendJson(response, 404, { error: 'Yerel deneme kaydı bulunamadı.' });
    attempt.outcome = outcome;
    attempt.solutionIndex = Number.isInteger(body.solutionIndex) ? Math.max(0, body.solutionIndex) : attempt.solutionIndex;
    attempt.completedAt = new Date().toISOString();
    writeJsonAtomic(ATTEMPTS_PATH, attempts);
    const feedback = readJson(FEEDBACK_PATH);
    feedback.push({
      id: crypto.randomUUID(), attemptId, issueId: attempt.issueId,
      fallbackId: attempt.fallbackId, outcome, solutionIndex: attempt.solutionIndex,
      createdAt: new Date().toISOString()
    });
    writeJsonAtomic(FEEDBACK_PATH, feedback);
    return sendJson(response, 200, { saved: true });
  }
  return sendJson(response, 404, { error: 'API yolu bulunamadı.' });
}

function serveStatic(response, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  let decodedPath;
  try { decodedPath = decodeURIComponent(requestedPath); } catch { response.writeHead(400); return response.end('Geçersiz yol.'); }
  const filePath = path.resolve(DIST, `.${decodedPath}`);
  const relative = path.relative(DIST, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403); return response.end('Forbidden'); }
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return response.end('Dosya bulunamadı.'); }
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'"
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  let url;
  try { url = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`); } catch { return sendJson(response, 400, { error: 'Geçersiz istek.' }); }
  if (url.pathname.startsWith('/api/')) {
    handleApi(request, response, url.pathname).catch((error) => {
      console.error(error);
      if (!response.headersSent) sendJson(response, 500, { error: 'Yerel işlem tamamlanamadı.' });
    });
    return;
  }
  serveStatic(response, url.pathname);
});

server.listen(PORT, HOST, () => {
  const catalog = loadCatalog();
  console.log(`FixLoop yerel olarak çalışıyor: http://${HOST}:${PORT}`);
  console.log(`${catalog.issues.length} sorun ve ${catalog.fallbacks.length} fallback hazır.`);
  console.log('GPT, üyelik ve dış ağ isteği yok. Durdurmak için Ctrl+C kullanın.');
});
