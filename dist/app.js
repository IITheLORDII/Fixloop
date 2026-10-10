const views = [...document.querySelectorAll('.solver-view')];
const showView = (name) => {
  views.forEach((view) => view.classList.toggle('active', view.dataset.view === name));
  document.querySelector('#solver').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

document.querySelector('#startButton').addEventListener('click', () => {
  const text = document.querySelector('#problemText').value.trim();
  if (!text) {
    document.querySelector('#problemText').focus();
    return;
  }
  showView('device');
});

document.querySelector('#screenshotInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  document.querySelector('#fileState').textContent = file.name.length > 16 ? `${file.name.slice(0, 13)}…` : file.name;
});

document.querySelectorAll('.device-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.device-card').forEach((item) => item.classList.remove('selected'));
    card.classList.add('selected');
  });
});

document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.back)));

document.querySelector('#analyzeButton').addEventListener('click', () => {
  const selected = document.querySelector('.device-card.selected');
  const device = selected?.dataset.device || 'Windows 11';
  const solutions = {
    'Windows 11': {
      title: 'Ses çıkışını kulaklığına yönlendir',
      description: 'Windows bazen bağlantıyı kurar ancak sesi eski hoparlörde bırakır.',
      stepOne: 'Görev çubuğundaki ses simgesine tıkla',
      detailOne: 'Saatin yanındaki hoparlör simgesini bul.',
      stepTwo: 'Ses çıkışı listesini aç',
      detailTwo: 'Ses düzeyi çubuğunun yanındaki oka tıkla.'
    },
    Android: {
      title: 'Medya sesini kulaklığına yönlendir',
      description: 'Android bağlantıyı kurmuş olsa da medya sesi seçeneği kapalı kalabilir.',
      stepOne: 'Bluetooth cihaz ayrıntılarını aç',
      detailOne: 'Ayarlar → Bağlı cihazlar bölümünde kulaklığına dokun.',
      stepTwo: 'Medya sesi seçeneğini aç',
      detailTwo: 'Kulaklığın altında “Medya sesi” anahtarını etkinleştir.'
    },
    macOS: {
      title: 'Ses çıkışını kulaklığına geçir',
      description: 'macOS bağlı kulaklık yerine dahili hoparlörü kullanmaya devam edebilir.',
      stepOne: 'Denetim Merkezi’ni aç',
      detailOne: 'Menü çubuğundaki Denetim Merkezi simgesine tıkla.',
      stepTwo: 'Ses menüsünden kulaklığını seç',
      detailTwo: 'Ses bölümündeki çıkış listesinden kulaklığına tıkla.'
    },
    iOS: {
      title: 'Ses hedefini kulaklığına değiştir',
      description: 'iPhone bağlantı kurduğunda ses başka bir AirPlay hedefine yönlenmiş olabilir.',
      stepOne: 'Denetim Merkezi’ni aç',
      detailOne: 'Ekranın sağ üst köşesinden aşağı kaydır.',
      stepTwo: 'AirPlay listesinden kulaklığını seç',
      detailTwo: 'Ses kartındaki AirPlay simgesine dokun ve kulaklığını seç.'
    }
  };
  const solution = solutions[device];
  document.querySelector('#solutionDevice').textContent = `${device} · Bluetooth ses`;
  document.querySelector('#solutionTitle').textContent = solution.title;
  document.querySelector('#solutionDescription').textContent = solution.description;
  document.querySelector('#stepOneTitle').textContent = solution.stepOne;
  document.querySelector('#stepOneDescription').textContent = solution.detailOne;
  document.querySelector('#stepTwoTitle').textContent = solution.stepTwo;
  document.querySelector('#stepTwoDescription').textContent = solution.detailTwo;
  showView('loading');
  setTimeout(() => {
    document.querySelector('#scanDevice').classList.add('done');
    document.querySelector('#scanDevice').textContent = '✓ Cihaz sürümü eşleştirildi';
  }, 650);
  setTimeout(() => {
    document.querySelector('#scanSolutions').classList.add('done');
    document.querySelector('#scanSolutions').textContent = '✓ Doğrulanmış çözümler sıralandı';
  }, 1250);
  setTimeout(() => showView('solution'), 1900);
});

document.querySelector('#fixedButton').addEventListener('click', () => showView('success'));
document.querySelector('#notFixedButton').addEventListener('click', () => {
  document.querySelector('.solution-title .step-label').textContent = '2. çözüm · 3 dakika';
  document.querySelector('.solution-title h2').textContent = 'Bluetooth ses hizmetini yenile';
  document.querySelector('.solution-title p').textContent = 'İlk adım işe yaramadıysa bağlantıyı güvenle yeniden kurmayı deneyelim.';
  document.querySelector('#stepOneTitle').textContent = 'Bluetooth’u kapatıp tekrar aç';
  document.querySelector('#stepOneDescription').textContent = 'Bluetooth ayarlarına git ve bağlantıyı güvenle yenile.';
  document.querySelector('.muted-step').style.opacity = '1';
  document.querySelector('#notFixedButton').textContent = 'Başka çözüm →';
});

document.querySelectorAll('[data-restart]').forEach((button) => button.addEventListener('click', () => showView('input')));
