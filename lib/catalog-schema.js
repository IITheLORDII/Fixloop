const ALLOWED_SAFETY = new Set(['safe', 'caution', 'service', 'emergency']);
const FORBIDDEN_INSTRUCTIONS = [
  /güvenlik kilidini.{0,20}(aş|devre dışı)/i,
  /gaz hattını.{0,20}(aç|sök|değiştir)/i,
  /yüksek gerilim.{0,30}(dokun|ölç|müdahale)/i,
  /bataryayı.{0,20}(del|ez|aç)/i,
  /şöntle|bypass et/i
];
const OFFICIAL_HOSTS = [
  'microsoft.com','apple.com','google.com','amazon.com','dell.com','tp-link.com','hp.com','brother.com',
  'lg.com','vestel.com.tr','sony.com','playstation.com','xbox.com','nintendo.com','meta.com','garmin.com',
  'canon.com','dji.com','wd.com','synology.com','apc.com','samsung.com','bosch-home.com.tr','arcelik.com.tr',
  'beko.com.tr','whirlpool.com','philips.com'
];

function validateSource(source, prefix, errors) {
  if (!source || typeof source !== 'object') return errors.push(`${prefix}: kaynak nesnesi eksik`);
  if (!source.title) errors.push(`${prefix}: kaynak başlığı eksik`);
  if (!source.url?.startsWith('https://')) errors.push(`${prefix}: geçersiz kaynak URL'si`);
  else {
    try {
      const hostname = new URL(source.url).hostname.toLowerCase();
      if (!OFFICIAL_HOSTS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) errors.push(`${prefix}: kaynak resmî alan adı listesinde değil`);
    } catch { errors.push(`${prefix}: kaynak URL'si çözümlenemedi`); }
  }
  if (source.official !== true) errors.push(`${prefix}: kaynak resmî olarak işaretlenmemiş`);
  if (!source.version) errors.push(`${prefix}: kaynak sürümü eksik`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(source.lastVerifiedAt || '')) errors.push(`${prefix}: son doğrulama tarihi eksik`);
}

function validateIssue(issue, knownDevices, knownSubtypes, errors) {
  const prefix = issue?.id || '(kimliksiz sorun)';
  if (!issue?.id) errors.push('Boş sorun kimliği');
  if (issue.deviceType !== 'any' && !knownDevices.has(issue.deviceType)) errors.push(`${prefix}: bilinmeyen cihaz türü ${issue.deviceType}`);
  if (issue.subType !== 'any' && !knownSubtypes.has(issue.subType)) errors.push(`${prefix}: bilinmeyen alt tür ${issue.subType}`);
  for (const field of ['brandPatterns','modelPatterns','aliases','typoVariants','negativeSignals','errorCodes','tags','questions','solutions','sources']) {
    if (!Array.isArray(issue[field])) errors.push(`${prefix}: ${field} dizi değil`);
  }
  if (!issue.symptoms || !Array.isArray(issue.symptoms.tr) || !Array.isArray(issue.symptoms.en)) errors.push(`${prefix}: iki dilli belirti alanı eksik`);
  if (!ALLOWED_SAFETY.has(issue.safety)) errors.push(`${prefix}: geçersiz güvenlik seviyesi`);
  if (!issue.serviceThreshold) errors.push(`${prefix}: servis eşiği eksik`);
  if ((issue.questions || []).length > 3) errors.push(`${prefix}: üçten fazla tanı sorusu var`);
  for (const question of issue.questions || []) {
    if (!question.id || !question.text || !Array.isArray(question.options) || question.options.length < 2) errors.push(`${prefix}: bozuk tanı sorusu`);
    for (const option of question.options || []) {
      if (!option.id || !option.label || !/^solution:\d+$|^fallback$/.test(option.next || '')) errors.push(`${prefix}: erişilemeyen soru dalı`);
      if (option.next?.startsWith('solution:')) {
        const solutionIndex = Number(option.next.slice('solution:'.length));
        if (!Number.isInteger(solutionIndex) || solutionIndex < 0 || solutionIndex >= (issue.solutions || []).length) errors.push(`${prefix}: soru dalı olmayan çözüme gidiyor`);
      }
    }
  }
  if (!(issue.solutions || []).length) errors.push(`${prefix}: çözüm yok`);
  for (const solution of issue.solutions || []) {
    if (!solution.id || !solution.title || !solution.description || !solution.duration) errors.push(`${prefix}: eksik çözüm alanı`);
    if (!Array.isArray(solution.steps) || solution.steps.length < 2) errors.push(`${prefix}: çözümde en az iki adım gerekli`);
    const text = `${solution.title || ''} ${solution.description || ''} ${(solution.steps || []).map((step) => `${step.title} ${step.detail}`).join(' ')}`;
    if (FORBIDDEN_INSTRUCTIONS.some((pattern) => pattern.test(text))) errors.push(`${prefix}: tehlikeli talimat algılandı`);
  }
  if (!(issue.sources || []).length) errors.push(`${prefix}: resmî kaynak eksik`);
  for (const source of issue.sources || []) validateSource(source, prefix, errors);
}

function validateCatalog(catalog) {
  const errors = [];
  const deviceIds = new Set();
  const subtypeIds = new Set();
  for (const device of catalog.deviceTypes || []) {
    if (!device.id || deviceIds.has(device.id)) errors.push(`Tekrarlı veya boş cihaz türü: ${device.id}`);
    deviceIds.add(device.id);
    if (!device.label || !Array.isArray(device.subtypes) || !device.subtypes.length) errors.push(`${device.id}: alt tür listesi eksik`);
    for (const subType of device.subtypes || []) {
      if (!subType.id || subtypeIds.has(subType.id)) errors.push(`Tekrarlı veya boş alt tür: ${subType.id}`);
      subtypeIds.add(subType.id);
      if (!subType.label) errors.push(`${subType.id}: alt tür etiketi eksik`);
    }
  }
  const issueIds = new Set();
  for (const issue of catalog.issues || []) {
    if (issueIds.has(issue.id)) errors.push(`Tekrarlı sorun kimliği: ${issue.id}`);
    issueIds.add(issue.id);
    validateIssue(issue, deviceIds, subtypeIds, errors);
  }
  const fallbackIds = new Set();
  for (const fallback of catalog.fallbacks || []) {
    if (!fallback.id || fallbackIds.has(fallback.id)) errors.push(`Tekrarlı veya boş fallback: ${fallback.id}`);
    fallbackIds.add(fallback.id);
    if (!deviceIds.has(fallback.deviceType) || !subtypeIds.has(fallback.subType)) errors.push(`${fallback.id}: bilinmeyen cihaz veya alt tür`);
    if (!Array.isArray(fallback.steps) || fallback.steps.length < 2) errors.push(`${fallback.id}: fallback adımları eksik`);
    if (!fallback.serviceThreshold) errors.push(`${fallback.id}: servis eşiği eksik`);
    if (!Array.isArray(fallback.sources) || !fallback.sources.length) errors.push(`${fallback.id}: kaynak eksik`);
    for (const item of fallback.sources || []) validateSource(item, fallback.id, errors);
  }
  for (const subType of subtypeIds) {
    if (!(catalog.fallbacks || []).some((fallback) => fallback.subType === subType)) errors.push(`${subType}: güvenli fallback eksik`);
    if (!(catalog.issues || []).some((issue) => issue.subType === subType)) errors.push(`${subType}: sorun kaydı yok`);
  }
  return errors;
}

module.exports = { validateCatalog, validateIssue, ALLOWED_SAFETY, FORBIDDEN_INSTRUCTIONS, OFFICIAL_HOSTS };
