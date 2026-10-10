const views = [...document.querySelectorAll('.solver-view')];
const state = {
  deviceTypes: [], deviceType: 'computer', subType: '', deviceLabel: 'Bilgisayar / laptop', subTypeLabel: '',
  answers: [], question: null, sessionId: '', result: null, solutionIndex: 0, attemptId: '',
  screenshotName: '', ocrText: '', ocrBusy: false
};
let ocrWorkerPromise = null;

const OCR_STATUS_LABELS = {
  'loading tesseract core': 'OCR motoru yükleniyor',
  'initializing tesseract': 'OCR motoru başlatılıyor',
  'loading language traineddata': 'Türkçe ve İngilizce hazırlanıyor',
  'initializing api': 'Metin okuyucu hazırlanıyor',
  'recognizing text': 'Görseldeki metin okunuyor'
};

function updateOcrProgress(status, progress = 0) {
  const percent = Math.max(0, Math.min(100, Math.round(progress * 100)));
  document.querySelector('#ocrStatus').textContent = OCR_STATUS_LABELS[status] || status;
  document.querySelector('#ocrProgress').textContent = `%${percent}`;
  document.querySelector('#ocrProgressBar').style.width = `${percent}%`;
}

function getOcrWorker() {
  if (!window.Tesseract?.createWorker) return Promise.reject(new Error('Yerel OCR dosyaları bulunamadı.'));
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = window.Tesseract.createWorker(['tur', 'eng'], 1, {
      workerPath: '/vendor/tesseract/worker.min.js',
      corePath: '/vendor/tesseract/core',
      langPath: '/vendor/tesseract/lang-data',
      workerBlobURL: false,
      logger: (message) => updateOcrProgress(message.status, message.progress)
    }).catch((error) => {
      ocrWorkerPromise = null;
      throw error;
    });
  }
  return ocrWorkerPromise;
}

async function readScreenshot(file) {
  const resultBox = document.querySelector('#ocrResult');
  const preview = document.querySelector('#ocrPreview');
  const startButton = document.querySelector('#startButton');
  const validation = window.FixLoopOCR.validateImageFile(file);
  state.ocrText = '';
  resultBox.hidden = false;
  if (!validation.valid) {
    updateOcrProgress('Görsel okunamadı', 0);
    preview.textContent = validation.error;
    document.querySelector('#fileState').textContent = 'Geçersiz';
    document.querySelector('#screenshotInput').value = '';
    return;
  }

  state.ocrBusy = true;
  startButton.disabled = true;
  document.querySelector('#fileState').textContent = 'Okunuyor…';
  updateOcrProgress('Yerel OCR hazırlanıyor', 0);
  preview.textContent = 'Görsel yalnızca bu tarayıcı sekmesinde işleniyor.';
  try {
    const worker = await getOcrWorker();
    const recognition = await worker.recognize(file);
    const text = window.FixLoopOCR.cleanOcrText(recognition.data?.text || '');
    if (!text) throw new Error('Görselde okunabilir metin bulunamadı.');
    state.ocrText = text;
    const problemInput = document.querySelector('#problemText');
    problemInput.value = window.FixLoopOCR.mergeProblemText(problemInput.value, text);
    updateOcrProgress('Metin yerelde okundu', 1);
    preview.textContent = text.length > 180 ? `${text.slice(0, 177)}…` : text;
    document.querySelector('#fileState').textContent = 'Okundu ✓';
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error || 'OCR başlatılamadı.');
    updateOcrProgress('Görsel okunamadı', 0);
    preview.textContent = `${reason} Sorunu metin olarak yazmaya devam edebilirsin.`;
    document.querySelector('#fileState').textContent = 'Okunamadı';
  } finally {
    state.ocrBusy = false;
    startButton.disabled = false;
  }
}

const showView = (name) => {
  views.forEach((view) => view.classList.toggle('active', view.dataset.view === name));
  document.querySelector('#solver').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Yerel istek başarısız: ${response.status}`);
  return payload;
}

function populateDeviceTypes() {
  const select = document.querySelector('#deviceTypeSelect');
  select.innerHTML = state.deviceTypes.map((device) => `<option value="${device.id}">${device.label}</option>`).join('');
  if (state.deviceTypes.some((device) => device.id === state.deviceType)) select.value = state.deviceType;
  else state.deviceType = select.value;
  populateSubTypes();
}

function populateSubTypes() {
  const device = state.deviceTypes.find((item) => item.id === state.deviceType);
  const select = document.querySelector('#subTypeSelect');
  select.innerHTML = (device?.subtypes || []).map((item) => `<option value="${item.id}">${item.label}</option>`).join('');
  state.deviceLabel = device?.label || '';
  state.subType = select.value || '';
  state.subTypeLabel = select.options[select.selectedIndex]?.text || '';
}

async function loadLocalCatalog() {
  try {
    const [catalog, stats] = await Promise.all([request('/api/catalog'), request('/api/catalog/stats')]);
    state.deviceTypes = catalog.deviceTypes;
    populateDeviceTypes();
    const badge = document.querySelector('#localBadge');
    badge.innerHTML = `<i></i> ${stats.issueCount} yerel akış`;
    badge.title = `${stats.issueCount} sorun, ${stats.subTypeCount} cihaz alt türü ve ${stats.fallbackCount} güvenli fallback hazır`;
    document.querySelector('#catalogIssueCount').textContent = `${stats.issueCount}`;
  } catch (error) {
    document.querySelector('#localBadge').innerHTML = '<i></i> Yerel sunucu bekleniyor';
    document.querySelector('#localBadge').title = `${error.message} FixLoop’u start-local.cmd ile başlatın.`;
  }
}

function diagnosisPayload() {
  const file = document.querySelector('#screenshotInput').files[0];
  return {
    problem: window.FixLoopOCR.mergeProblemText(document.querySelector('#problemText').value, state.ocrText),
    deviceType: state.deviceType,
    subType: state.subType,
    brandModel: document.querySelector('#brandInput').value.trim(),
    screenshotName: file ? '[yerel görsel]' : '',
    answers: state.answers,
    sessionId: state.sessionId
  };
}

function renderQuestion(result) {
  state.question = result.question;
  document.querySelector('#questionMeta').textContent = `Tanı sorusu ${result.questionNumber} / ${result.maxQuestions}`;
  document.querySelector('#questionText').textContent = result.question.text;
  document.querySelector('#questionProgress').style.width = `${58 + result.questionNumber * 10}%`;
  const container = document.querySelector('#questionOptions');
  container.replaceChildren(...result.question.options.map((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'question-option';
    button.textContent = option.label;
    button.addEventListener('click', async () => {
      state.answers.push({ questionId: result.question.id, optionId: option.id });
      await runDiagnosis(false);
    });
    return button;
  }));
  showView('question');
}

function activeSolutions() {
  if (state.result?.type === 'fallback') {
    const fallback = state.result.fallback;
    return [{
      id: `${fallback.id}-solution`, title: fallback.title,
      description: `Kesin eşleşme bulunamadı. Yanlış bir işlem önermek yerine güvenli genel kontrol gösteriliyor. ${fallback.serviceThreshold}`,
      duration: '3 dakika', steps: fallback.steps
    }];
  }
  return state.result?.issue?.solutions || [];
}

function renderSources(sources) {
  const container = document.querySelector('#sourceList');
  container.replaceChildren();
  const heading = document.createElement('b');
  heading.textContent = 'Resmî kaynak';
  container.append(heading);
  for (const source of sources || []) {
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = `${source.title} · ${source.lastVerifiedAt}`;
    container.append(link);
  }
}

function renderSolution() {
  const result = state.result;
  const record = result.type === 'fallback' ? result.fallback : result.issue;
  const solutions = activeSolutions();
  const solution = solutions[state.solutionIndex] || solutions[0];
  const status = document.querySelector('.solution-status');
  status.classList.toggle('safety-emergency', result.emergency === true);
  status.classList.toggle('safety-service', record.safety === 'service');
  document.querySelector('#solutionDevice').textContent = `${state.subTypeLabel || state.deviceLabel} · ${record.title}`;
  document.querySelector('#confidenceLabel').textContent = result.emergency ? 'ACİL' : result.type === 'fallback' ? 'Düşük güven' : `%${result.confidence} eşleşme`;
  document.querySelector('#solutionMeta').textContent = result.type === 'fallback'
    ? `Güvenli fallback · ${solution.duration}` : `${state.solutionIndex + 1}. çözüm · ${solution.duration}`;
  document.querySelector('#solutionTitle').textContent = solution.title;
  const boundary = record.safety === 'emergency' || record.safety === 'service' ? ` ${record.serviceThreshold}` : '';
  document.querySelector('#solutionDescription').textContent = `${solution.description}${boundary}`;
  const list = document.querySelector('#instructionList');
  list.replaceChildren(...solution.steps.map((step, index) => {
    const card = document.createElement('div');
    card.className = `instruction-card${index > 0 ? ' muted-step' : ''}`;
    const number = document.createElement('span');
    number.className = 'instruction-number';
    number.textContent = String(index + 1);
    const copy = document.createElement('div');
    const title = document.createElement('b');
    title.textContent = step.title;
    const detail = document.createElement('p');
    detail.textContent = step.detail;
    copy.append(title, detail);
    card.append(number, copy);
    return card;
  }));
  renderSources(record.sources);
  document.querySelector('.feedback-box').style.display = result.emergency ? 'none' : 'flex';
  document.querySelector('#notFixedButton').textContent = state.solutionIndex + 1 < solutions.length ? 'Düzelmedi →' : 'Çözülmedi';
  showView('solution');
}

function handleDiagnosis(result) {
  state.sessionId = result.sessionId || state.sessionId;
  if (result.type === 'question') return renderQuestion(result);
  state.result = result;
  state.solutionIndex = result.solutionIndex || 0;
  state.attemptId = result.attemptId || '';
  renderSolution();
}

async function runDiagnosis(showLoading = true) {
  if (showLoading) showView('loading');
  try {
    const result = await request('/api/diagnose', { method: 'POST', body: JSON.stringify(diagnosisPayload()) });
    if (showLoading) {
      document.querySelector('#scanDevice').classList.add('done');
      document.querySelector('#scanDevice').textContent = '✓ Cihaz alt türü eşleştirildi';
      document.querySelector('#scanSolutions').classList.add('done');
      document.querySelector('#scanSolutions').textContent = '✓ Yerel çözümler sıralandı';
      setTimeout(() => handleDiagnosis(result), 360);
    } else handleDiagnosis(result);
  } catch (error) {
    document.querySelector('#localBadge').innerHTML = '<i></i> Yerel işlem hatası';
    document.querySelector('#localBadge').title = error.message;
    showView('device');
  }
}

async function saveFeedback(outcome) {
  if (!state.attemptId) return;
  await request('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({ attemptId: state.attemptId, outcome, solutionIndex: state.solutionIndex })
  });
}

document.querySelector('#startButton').addEventListener('click', () => {
  if (state.ocrBusy) return;
  const text = document.querySelector('#problemText').value.trim();
  if (!text) return document.querySelector('#problemText').focus();
  if (!state.deviceTypes.length) return;
  showView('device');
});

document.querySelector('#screenshotInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  state.screenshotName = file?.name || '';
  if (!file) {
    state.ocrText = '';
    document.querySelector('#fileState').textContent = 'Seç';
    document.querySelector('#ocrResult').hidden = true;
    return;
  }
  await readScreenshot(file);
});

document.querySelector('#deviceTypeSelect').addEventListener('change', (event) => {
  state.deviceType = event.target.value;
  populateSubTypes();
});
document.querySelector('#subTypeSelect').addEventListener('change', (event) => {
  state.subType = event.target.value;
  state.subTypeLabel = event.target.options[event.target.selectedIndex]?.text || '';
});

document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.back)));

document.querySelector('#analyzeButton').addEventListener('click', async () => {
  const deviceSelect = document.querySelector('#deviceTypeSelect');
  const subTypeSelect = document.querySelector('#subTypeSelect');
  state.deviceType = deviceSelect.value;
  state.deviceLabel = deviceSelect.options[deviceSelect.selectedIndex]?.text || '';
  state.subType = subTypeSelect.value;
  state.subTypeLabel = subTypeSelect.options[subTypeSelect.selectedIndex]?.text || '';
  state.answers = [];
  state.sessionId = '';
  state.result = null;
  state.attemptId = '';
  state.ocrText = '';
  state.screenshotName = '';
  document.querySelector('#screenshotInput').value = '';
  document.querySelector('#fileState').textContent = 'Seç';
  document.querySelector('#ocrResult').hidden = true;
  await runDiagnosis(true);
});

document.querySelector('#fixedButton').addEventListener('click', async () => {
  try {
    await saveFeedback('fixed');
    const stats = await request('/api/catalog/stats');
    document.querySelector('#localSolvedCount').textContent = `+${stats.solved}`;
  } catch { document.querySelector('#localSolvedCount').textContent = '+1'; }
  showView('success');
});

document.querySelector('#notFixedButton').addEventListener('click', async () => {
  const solutions = activeSolutions();
  if (state.solutionIndex + 1 < solutions.length) {
    state.solutionIndex += 1;
    renderSolution();
    return;
  }
  await saveFeedback('not_fixed').catch(() => {});
  document.querySelector('#solutionMeta').textContent = 'Yerel katalog sonucu';
  document.querySelector('#solutionTitle').textContent = 'Güvenli kullanıcı adımlarının sonuna geldik';
  document.querySelector('#solutionDescription').textContent = 'Rastgele veya riskli işlem önermiyoruz. Sonuç yerel kayda eklendi; cihazın tam modeliyle resmî destek ya da yetkili servis kullanın.';
  document.querySelector('.feedback-box').style.display = 'none';
});

document.querySelectorAll('[data-restart]').forEach((button) => button.addEventListener('click', () => {
  state.answers = [];
  state.sessionId = '';
  state.result = null;
  state.attemptId = '';
  document.querySelector('.feedback-box').style.display = 'flex';
  showView('input');
}));

loadLocalCatalog();
