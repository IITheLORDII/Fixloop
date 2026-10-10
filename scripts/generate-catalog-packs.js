const fs = require('node:fs');
const path = require('node:path');
const {
  VERIFIED_AT, sources, deviceTypes, subtypes, scenarios, profiles, emergencyDefinitions, brandCodeDefinitions
} = require('./catalog-definition');

const root = path.join(__dirname, '..');
const catalogDirectory = path.join(root, 'data', 'catalog');
fs.mkdirSync(catalogDirectory, { recursive: true });

const replaceDevice = (value, label) => value.replaceAll('{device}', label.toLocaleLowerCase('tr-TR'));
const slug = (value) => value.toLocaleLowerCase('tr-TR')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('ı', 'i')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function buildQuestions(issueId, scenario) {
  return [
    {
      id: `${issueId}-repeat`,
      text: scenario.question,
      options: [
        { id: 'always', label: 'Her seferinde', next: 'solution:0', boostTags: scenario.tags },
        { id: 'sometimes', label: 'Ara sıra', next: 'solution:0', boostTags: ['intermittent'] }
      ]
    },
    {
      id: `${issueId}-basic-check`,
      text: 'Normal yeniden başlatma veya bağlantıyı yenileme adımını denedin mi?',
      options: [
        { id: 'not-tried', label: 'Henüz denemedim', next: 'solution:0', boostTags: scenario.tags },
        { id: 'tried', label: 'Denedim, sürüyor', next: 'solution:1', boostTags: ['service-threshold'] }
      ]
    }
  ];
}

function buildIssue(item, scenarioKey) {
  const scenario = scenarios[scenarioKey];
  const id = `${item.id}-${scenario.key}`;
  const officialSource = sources[item.sourceKey];
  if (!scenario || !officialSource) throw new Error(`${item.id}: senaryo veya kaynak eksik (${scenarioKey}/${item.sourceKey})`);
  const tr = scenario.tr.map((text) => replaceDevice(text, item.label));
  const en = scenario.en.map((text) => replaceDevice(text, item.label));
  const title = replaceDevice(scenario.title, item.label);
  return {
    id,
    deviceType: item.deviceType,
    subType: item.id,
    category: scenario.category,
    title,
    brandPatterns: item.brands,
    modelPatterns: item.models,
    symptoms: { tr, en },
    aliases: [...new Set([title, ...tr, ...en, ...(scenario.aliases || [])])],
    typoVariants: scenario.typoVariants,
    negativeSignals: scenario.negativeSignals,
    errorCodes: scenario.errorCodes,
    tags: [...new Set([item.deviceType, item.id, scenario.category, ...scenario.tags])],
    questions: buildQuestions(id, scenario),
    solutions: [
      {
        id: `${id}-safe-check`,
        title: scenario.solutionTitle,
        description: scenario.description,
        duration: '3-8 dakika',
        steps: scenario.steps.map(([stepTitle, detail]) => ({ title: stepTitle, detail }))
      },
      {
        id: `${id}-official-diagnostic`,
        title: 'Resmî tanılama ve servis eşiğini uygula',
        description: 'İlk güvenli kontroller sonuç vermediyse rastgele müdahale yerine üreticinin modeline özel tanılama yolunu kullan.',
        duration: '5 dakika',
        steps: [
          { title: 'Model ve görünen hatayı kaydet', detail: 'Model kodunu, yazılım sürümünü ve varsa hata metnini değiştirmeden not et.' },
          { title: 'Resmî destek kaynağını kullan', detail: `${officialSource.title} içinde tam model ve belirtiyle arama yap; yalnızca kullanıcıya açık adımları uygula.` },
          { title: 'Servis sınırında dur', detail: scenario.serviceThreshold }
        ]
      }
    ],
    safety: scenario.safety,
    serviceThreshold: scenario.serviceThreshold,
    sources: [officialSource],
    verifiedAt: VERIFIED_AT,
    generatedFrom: `${item.profile}/${scenario.key}`
  };
}

function buildFallback(item) {
  const officialSource = sources[item.sourceKey];
  return {
    id: `${item.id}-safe-fallback`,
    deviceType: item.deviceType,
    subType: item.id,
    title: `${item.label} için güvenli genel kontrol`,
    safety: 'caution',
    serviceThreshold: 'Belirti devam ederse tam model ve hata koduyla yetkili üretici desteğine başvur.',
    steps: [
      { title: 'Tehlike belirtisini ele', detail: 'Duman, yanık kokusu, şişme, kıvılcım, gaz veya su-elektrik teması varsa cihazı kullanma.' },
      { title: 'Bilgiyi kaydet', detail: 'Tam model, görünen hata, ne zaman başladığı ve son yapılan değişikliği not et.' },
      { title: 'Normal yeniden başlatmayı bir kez dene', detail: 'Veri veya güvenlik riski yoksa üreticinin normal kapatma ve açma yöntemini uygula.' }
    ],
    sources: [officialSource],
    verifiedAt: VERIFIED_AT
  };
}

for (const device of deviceTypes) {
  const matchingSubtypes = subtypes.filter((item) => item.deviceType === device.id);
  const issues = matchingSubtypes.flatMap((item) => {
    const scenarioKeys = profiles[item.profile];
    if (!scenarioKeys || scenarioKeys.length !== 8) throw new Error(`${item.id}: profil sekiz senaryo içermeli`);
    return scenarioKeys.map((scenarioKey) => buildIssue(item, scenarioKey));
  });
  const pack = {
    schemaVersion: 3,
    id: `core-${device.id}`,
    label: device.label,
    generatedAt: new Date().toISOString(),
    deviceTypes: [{ ...device, subtypes: matchingSubtypes.map(({ id, label, brands, models }) => ({ id, label, brands, models })) }],
    issues,
    fallbacks: matchingSubtypes.map(buildFallback)
  };
  fs.writeFileSync(path.join(catalogDirectory, `${device.id}.json`), `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
}

const emergencyIssues = emergencyDefinitions.map((definition) => {
  const officialSource = sources[definition.sourceKey];
  return {
    id: definition.id,
    deviceType: 'any',
    subType: 'any',
    category: 'emergency',
    title: definition.title,
    brandPatterns: [],
    modelPatterns: [],
    symptoms: { tr: definition.phrases.filter((value) => /[çğıöşü]|batarya|pil|kasa|duman|alev|yanık|elektrik|kıvılcım|priz|kaçak|gaz|su|buhar|kablo|tel|gerilim/.test(value)), en: definition.phrases.filter((value) => /battery|smoke|fire|burning|electric|sparking|wet|gas|boiling|scalding|steam|exposed|wire|voltage/.test(value)) },
    aliases: definition.phrases,
    typoVariants: [],
    negativeSignals: [],
    errorCodes: [],
    tags: ['emergency', ...definition.tags],
    questions: [],
    solutions: [{
      id: `${definition.id}-immediate-action`,
      title: 'Hemen güvenliği sağla',
      description: definition.instruction,
      duration: 'Hemen',
      steps: [
        { title: 'Kullanmayı bırak', detail: 'Cihaza yeniden güç verme, şarj etme veya çalıştırma.' },
        { title: 'İnsanları uzaklaştır', detail: 'Kendini, çocukları ve evcil hayvanları güvenli mesafeye al.' },
        { title: 'Uzman yardımını çağır', detail: definition.instruction }
      ]
    }],
    safety: 'emergency',
    serviceThreshold: 'Bu akışta kullanıcı onarımı yoktur; acil veya yetkili uzman desteği gerekir.',
    sources: [officialSource],
    verifiedAt: VERIFIED_AT,
    generatedFrom: 'emergency-definition'
  };
});

fs.writeFileSync(path.join(catalogDirectory, 'emergency.json'), `${JSON.stringify({
  schemaVersion: 3,
  id: 'core-emergency',
  label: 'Acil güvenlik akışları',
  generatedAt: new Date().toISOString(),
  deviceTypes: [],
  issues: emergencyIssues,
  fallbacks: []
}, null, 2)}\n`, 'utf8');

const codeIssues = brandCodeDefinitions.map((definition) => {
  const officialSource = sources[definition.sourceKey];
  return {
    id: definition.id,
    deviceType: definition.deviceType,
    subType: definition.subType,
    category: 'error-code',
    title: definition.title,
    brandPatterns: [definition.brand],
    modelPatterns: definition.models,
    symptoms: { tr: definition.tr, en: definition.en },
    aliases: [...definition.tr, ...definition.en, ...definition.codes],
    typoVariants: [], negativeSignals: [], errorCodes: definition.codes,
    tags: ['error-code', ...definition.tags],
    questions: [{
      id: `${definition.id}-visible-code`, text: `Ekranda ${definition.codes[0]} kodu aynen görünüyor mu?`,
      options: [
        { id:'yes', label:'Evet', next:'solution:0', boostTags:['error-code'] },
        { id:'no', label:'Hayır', next:'solution:1', boostTags:['service-threshold'] }
      ]
    }],
    solutions: [
      {
        id:`${definition.id}-safe`, title:'Koda özel güvenli ön kontrolleri uygula',
        description:'Hata kodunu silmeden önce güç, bağlantı ve kullanıcı tarafından kontrol edilebilen koşulları doğrula.', duration:'4 dakika',
        steps:[
          { title:'Kodu ve modeli kaydet', detail:'Tam kodu, model numarasını ve hatanın oluştuğu işlemi not et.' },
          { title:'Normal koşulları kontrol et', detail:'Güç, kapak, ağ, sarf veya dış bağlantı gibi kullanıcıya açık koşulları doğrula.' },
          { title:'Bir kez normal yeniden başlat', detail:'Güvenliyse cihazı üreticinin normal yöntemiyle kapatıp aç ve aynı işlemi tekrar dene.' }
        ]
      },
      {
        id:`${definition.id}-official`, title:'Model ve kodla resmî desteği kullan',
        description:'Kod sürerse ileri müdahale yapmadan üreticinin resmî desteğine geç.', duration:'3 dakika',
        steps:[
          { title:'Resmî destek sayfasını aç', detail:`${officialSource.title} içinde model ve ${definition.codes[0]} kodunu birlikte ara.` },
          { title:'Kullanıcı sınırında kal', detail:'Yalnızca kullanım kılavuzunda son kullanıcıya açık olarak belirtilen adımları uygula.' }
        ]
      }
    ],
    safety:'caution',
    serviceThreshold:'Kod normal yeniden başlatmadan sonra dönüyorsa yetkili üretici desteğine başvur.',
    sources:[officialSource], verifiedAt:VERIFIED_AT, generatedFrom:'brand-error-code'
  };
});

fs.writeFileSync(path.join(catalogDirectory, 'error-codes.json'), `${JSON.stringify({
  schemaVersion:3, id:'core-error-codes', label:'Marka hata kodları', generatedAt:new Date().toISOString(),
  deviceTypes:[], issues:codeIssues, fallbacks:[]
}, null, 2)}\n`, 'utf8');

console.log(`${deviceTypes.length + 2} katalog paketi üretildi: ${subtypes.length * 8 + emergencyIssues.length + codeIssues.length} sorun, ${subtypes.length} güvenli fallback.`);

module.exports = { slug };
