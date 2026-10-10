const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.join(__dirname, '..');
const port = 48173;
const runtime = fs.mkdtempSync(path.join(os.tmpdir(), 'fixloop-test-'));
let processHandle;

function startServer() {
  processHandle = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, FIXLOOP_PORT: String(port), FIXLOOP_DATA_DIR: runtime },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Test sunucusu başlamadı')), 8000);
    processHandle.stdout.on('data', (chunk) => {
      if (String(chunk).includes('FixLoop yerel olarak çalışıyor')) { clearTimeout(timer); resolve(); }
    });
    processHandle.once('exit', (code) => { clearTimeout(timer); if (code) reject(new Error(`Sunucu kapandı: ${code}`)); });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (!processHandle || processHandle.exitCode !== null) return resolve();
    processHandle.once('exit', resolve);
    processHandle.kill();
  });
}

async function api(pathname, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`, {
    ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const body = await response.json();
  assert.ok(response.ok, JSON.stringify(body));
  return body;
}

test('yerel API tanı, feedback, atomik kayıt ve yeniden başlatmada kalıcılık sağlar', async (context) => {
  context.after(async () => {
    await stopServer();
    if (runtime.startsWith(os.tmpdir())) fs.rmSync(runtime, { recursive: true, force: true });
  });
  await startServer();
  const coreScript = await fetch(`http://127.0.0.1:${port}/vendor/tesseract/core/tesseract-core-relaxedsimd-lstm.wasm.js`);
  assert.equal(coreScript.status, 200);
  assert.match(coreScript.headers.get('content-type') || '', /text\/javascript/);
  assert.match(coreScript.headers.get('content-security-policy') || '', /wasm-unsafe-eval/);
  const coreWasm = await fetch(`http://127.0.0.1:${port}/vendor/tesseract/core/tesseract-core-relaxedsimd-lstm.wasm`);
  assert.equal(coreWasm.status, 200);
  assert.match(coreWasm.headers.get('content-type') || '', /application\/wasm/);
  const catalog = await api('/api/catalog');
  assert.ok(catalog.issueCount >= 500);
  assert.equal(catalog.deviceTypes.length, 13);

  const diagnosis = await api('/api/diagnose', {
    method: 'POST',
    body: JSON.stringify({
      problem: 'Bluetooth kulaklığım bağlı ama ses gelmiyor',
      deviceType: 'audio', subType: 'bluetooth-headphones', brandModel: 'Sony WH-1000XM5', answers: []
    })
  });
  assert.equal(diagnosis.type, 'solution');
  assert.ok(diagnosis.attemptId);
  await api('/api/feedback', { method: 'POST', body: JSON.stringify({ attemptId: diagnosis.attemptId, outcome: 'fixed', solutionIndex: 0 }) });
  const beforeRestart = await api('/api/catalog/stats');
  assert.equal(beforeRestart.solved, 1);

  await stopServer();
  await startServer();
  const afterRestart = await api('/api/catalog/stats');
  assert.equal(afterRestart.solved, 1);
  assert.equal(afterRestart.totalAttempts, 1);

  for (const name of ['attempts.json','feedback.json']) {
    assert.ok(fs.existsSync(path.join(runtime, name)));
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(runtime, name), 'utf8')));
  }
});
