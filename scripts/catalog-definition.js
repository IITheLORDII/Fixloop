const VERIFIED_AT = '2026-10-10';

const source = (id, title, url) => ({
  id,
  title,
  url,
  official: true,
  version: 'Üretici destek içeriği · 2026-10',
  lastVerifiedAt: VERIFIED_AT
});

const sources = {
  microsoft: source('microsoft-windows', 'Microsoft Windows Destek', 'https://support.microsoft.com/en-us/windows'),
  apple: source('apple-support', 'Apple Destek', 'https://support.apple.com/'),
  googleAndroid: source('google-android', 'Google Android Yardım', 'https://support.google.com/android/'),
  googleChromebook: source('google-chromebook', 'Google Chromebook Yardım', 'https://support.google.com/chromebook/answer/6309225?hl=tr'),
  amazonKindle: source('amazon-kindle', 'Amazon Kindle Yardım', 'https://www.amazon.com/gp/help/customer/display.html?nodeId=200127470'),
  dell: source('dell-monitor', 'Dell Monitör Sorun Giderme', 'https://www.dell.com/support/kbdoc/en-us/000132354/how-to-troubleshoot-display-or-video-issues-on-a-dell-monitor'),
  tpLink: source('tplink-network', 'TP-Link Resmî Destek', 'https://www.tp-link.com/tr/support/'),
  hp: source('hp-print', 'HP Yazıcı Destek', 'https://support.hp.com/tr-tr/printer'),
  brother: source('brother-print', 'Brother Destek', 'https://support.brother.com/'),
  lg: source('lg-electronics', 'LG Elektronik Destek', 'https://www.lg.com/tr/destek'),
  vestel: source('vestel-support', 'Vestel Destek', 'https://www.vestel.com.tr/destek'),
  sony: source('sony-electronics', 'Sony Elektronik Destek', 'https://www.sony.com/electronics/support'),
  playstation: source('playstation-support', 'PlayStation Donanım Desteği', 'https://www.playstation.com/en-us/support/hardware/'),
  xbox: source('xbox-support', 'Xbox Destek', 'https://support.xbox.com/'),
  nintendo: source('nintendo-support', 'Nintendo Resmî Destek', 'https://en-americas-support.nintendo.com/'),
  meta: source('meta-quest', 'Meta Quest Yardım Merkezi', 'https://www.meta.com/help/quest/'),
  googleNest: source('google-nest', 'Google Nest Yardım', 'https://support.google.com/googlenest/'),
  appleWatch: source('apple-watch', 'Apple Watch Destek', 'https://support.apple.com/watch'),
  garmin: source('garmin-support', 'Garmin Destek', 'https://support.garmin.com/'),
  canon: source('canon-support', 'Canon Destek', 'https://www.usa.canon.com/support'),
  dji: source('dji-support', 'DJI Destek', 'https://www.dji.com/support'),
  wd: source('wd-support', 'Western Digital Destek', 'https://support-en.wd.com/'),
  synology: source('synology-support', 'Synology Bilgi Merkezi', 'https://kb.synology.com/'),
  apc: source('apc-support', 'APC Destek', 'https://www.apc.com/us/en/support/'),
  samsung: source('samsung-support', 'Samsung Destek', 'https://www.samsung.com/tr/support/'),
  bosch: source('bosch-home-support', 'Bosch Ev Aletleri Destek', 'https://www.bosch-home.com.tr/musteri-hizmetleri'),
  arcelik: source('arcelik-support', 'Arçelik Destek ve Kullanım Kılavuzları', 'https://www.arcelik.com.tr/destek/'),
  beko: source('beko-support', 'Beko Destek', 'https://www.beko.com.tr/destek'),
  whirlpool: source('whirlpool-support', 'Whirlpool Ürün Yardımı', 'https://producthelp.whirlpool.com/'),
  philips: source('philips-support', 'Philips Destek', 'https://www.philips.com/support')
};

const deviceTypes = [
  { id: 'computer', label: 'Bilgisayar / laptop' },
  { id: 'mobile', label: 'Telefon / tablet' },
  { id: 'network', label: 'Modem / router / Wi-Fi' },
  { id: 'printer', label: 'Yazıcı / tarayıcı' },
  { id: 'tv', label: 'TV / monitör / projektör' },
  { id: 'audio', label: 'Kulaklık / hoparlör / ses' },
  { id: 'console', label: 'Oyun konsolu / VR' },
  { id: 'smart-home', label: 'Akıllı ev / güvenlik' },
  { id: 'wearable', label: 'Akıllı saat / giyilebilir' },
  { id: 'camera', label: 'Fotoğraf / video / drone' },
  { id: 'storage', label: 'Disk / USB / NAS' },
  { id: 'power', label: 'Şarj / güç ürünleri' },
  { id: 'appliance', label: 'Beyaz eşya / ev aleti' }
];

const subtype = (deviceType, id, label, profile, sourceKey, brands, models = []) => ({
  deviceType, id, label, profile, sourceKey, brands, models
});

const subtypes = [
  subtype('computer', 'windows-laptop', 'Windows laptop', 'digital', 'microsoft', ['Microsoft','Dell','HP','Lenovo','Asus','Acer','MSI','Casper','Monster'], ['Surface','Inspiron','Latitude','Pavilion','ThinkPad','IdeaPad','VivoBook','Swift','Excalibur']),
  subtype('computer', 'macbook', 'MacBook', 'digital', 'apple', ['Apple'], ['MacBook Air','MacBook Pro']),
  subtype('computer', 'desktop-pc', 'Masaüstü bilgisayar', 'digital', 'microsoft', ['Microsoft','Dell','HP','Lenovo','Asus','Acer','Casper','Monster'], ['OptiPlex','ThinkCentre','Nirvana']),
  subtype('computer', 'chromebook', 'Chromebook', 'digital', 'googleChromebook', ['Google','Acer','Asus','HP','Lenovo','Samsung'], ['Chromebook','Pixelbook']),
  subtype('computer', 'computer-monitor', 'Bilgisayar monitörü', 'display', 'dell', ['Dell','LG','Samsung','Asus','Acer','MSI','Vestel'], ['UltraSharp','Odyssey','ProArt']),
  subtype('computer', 'keyboard-mouse', 'Klavye / fare', 'peripheral', 'microsoft', ['Microsoft','Logitech','Razer','Corsair','SteelSeries','Asus'], ['MX Keys','MX Master','G502']),
  subtype('computer', 'webcam', 'Web kamera', 'peripheral', 'microsoft', ['Logitech','Microsoft','Razer','A4Tech'], ['Brio','LifeCam']),

  subtype('mobile', 'android-phone', 'Android telefon', 'mobile', 'googleAndroid', ['Samsung','Google','Xiaomi','Redmi','Oppo','Vivo','Realme','Huawei','Honor','OnePlus','Nothing'], ['Galaxy','Pixel','Redmi Note','Mi','Find','Mate','Pura']),
  subtype('mobile', 'iphone', 'iPhone', 'mobile', 'apple', ['Apple'], ['iPhone']),
  subtype('mobile', 'android-tablet', 'Android tablet', 'mobile', 'googleAndroid', ['Samsung','Lenovo','Huawei','Xiaomi','Honor'], ['Galaxy Tab','Tab','MatePad','Pad']),
  subtype('mobile', 'ipad', 'iPad', 'mobile', 'apple', ['Apple'], ['iPad','iPad Air','iPad Pro','iPad mini']),
  subtype('mobile', 'e-reader', 'E-kitap okuyucu', 'mobile', 'amazonKindle', ['Amazon','Kobo','PocketBook'], ['Kindle','Kobo','PocketBook']),

  subtype('network', 'router', 'Router / modem', 'network', 'tpLink', ['TP-Link','Asus','Keenetic','Zyxel','Huawei','ZTE','Tenda','Netgear'], ['Archer','Deco','Keenetic','Nighthawk']),
  subtype('network', 'mesh', 'Mesh Wi-Fi sistemi', 'network', 'tpLink', ['TP-Link','Google','Asus','Netgear','Keenetic'], ['Deco','Nest Wifi','Orbi','ZenWiFi']),
  subtype('network', 'wifi-extender', 'Wi-Fi menzil genişletici', 'network', 'tpLink', ['TP-Link','Xiaomi','Tenda','Mercusys','Netgear'], ['RE','Mi Range Extender']),
  subtype('network', 'mobile-hotspot', 'Mobil modem / hotspot', 'network', 'tpLink', ['TP-Link','Huawei','ZTE','Netgear'], ['Mifi','Mobile WiFi','Nighthawk M']),

  subtype('printer', 'inkjet-printer', 'Mürekkep püskürtmeli yazıcı', 'printer', 'hp', ['HP','Canon','Epson','Brother'], ['DeskJet','OfficeJet','PIXMA','EcoTank']),
  subtype('printer', 'laser-printer', 'Lazer yazıcı', 'printer', 'brother', ['HP','Brother','Canon','Samsung','Xerox'], ['LaserJet','HL','DCP','imageCLASS']),
  subtype('printer', 'scanner', 'Tarayıcı', 'printer', 'hp', ['HP','Canon','Epson','Brother','Fujitsu'], ['ScanJet','CanoScan','Perfection','ScanSnap']),
  subtype('printer', 'label-printer', 'Etiket yazıcısı', 'printer', 'brother', ['Brother','Zebra','Dymo','Epson'], ['P-touch','QL','LabelWriter']),

  subtype('tv', 'smart-tv', 'Akıllı TV', 'display', 'vestel', ['Samsung','LG','Sony','Philips','TCL','Hisense','Vestel','Regal','Grundig','Beko','Arçelik'], ['QLED','OLED','Bravia','Ambilight','Smart TV']),
  subtype('tv', 'streaming-device', 'Medya oynatıcı', 'display', 'googleNest', ['Google','Apple','Amazon','Xiaomi','Roku'], ['Chromecast','Apple TV','Fire TV','Mi Box']),
  subtype('tv', 'projector', 'Projektör', 'display', 'lg', ['Epson','BenQ','ViewSonic','LG','Samsung','Xiaomi'], ['CineBeam','The Freestyle']),
  subtype('tv', 'external-monitor', 'Harici monitör', 'display', 'dell', ['Dell','LG','Samsung','Asus','Acer','MSI','ViewSonic'], ['UltraSharp','Odyssey','ProArt']),

  subtype('audio', 'bluetooth-headphones', 'Bluetooth kulaklık', 'audio', 'sony', ['Sony','JBL','Apple','Samsung','Anker','Beats','Sennheiser','Bose','Huawei'], ['AirPods','Galaxy Buds','WH','WF','Tune','Soundcore']),
  subtype('audio', 'wired-headphones', 'Kablolu kulaklık', 'audio', 'sony', ['Sony','JBL','Sennheiser','Audio-Technica','HyperX'], ['ATH','Cloud']),
  subtype('audio', 'speaker', 'Bluetooth / akıllı hoparlör', 'audio', 'sony', ['JBL','Sony','Bose','Anker','Google','Apple','Amazon'], ['Flip','Charge','SoundLink','Soundcore','HomePod','Nest Audio','Echo']),
  subtype('audio', 'soundbar', 'Soundbar', 'audio', 'lg', ['Samsung','LG','Sony','JBL','Bose','Philips'], ['Q-Series','S-Series','HT','Bar']),
  subtype('audio', 'microphone', 'Mikrofon', 'audio', 'microsoft', ['Blue','Rode','HyperX','Logitech','Shure'], ['Yeti','NT-USB','QuadCast']),

  subtype('console', 'playstation', 'PlayStation', 'console', 'playstation', ['Sony','PlayStation'], ['PS5','PS4','PlayStation Portal']),
  subtype('console', 'xbox', 'Xbox', 'console', 'xbox', ['Microsoft','Xbox'], ['Xbox Series X','Xbox Series S','Xbox One']),
  subtype('console', 'nintendo-switch', 'Nintendo Switch', 'console', 'nintendo', ['Nintendo'], ['Switch','Switch Lite','Switch OLED','Switch 2']),
  subtype('console', 'handheld-console', 'El konsolu', 'console', 'microsoft', ['Valve','Asus','Lenovo','MSI'], ['Steam Deck','ROG Ally','Legion Go','Claw']),
  subtype('console', 'vr-headset', 'VR başlık', 'console', 'meta', ['Meta','Sony','HTC'], ['Quest','PlayStation VR','Vive']),
  subtype('console', 'game-controller', 'Oyun kontrolcüsü', 'peripheral', 'playstation', ['Sony','Microsoft','Nintendo','8BitDo','Logitech'], ['DualSense','DualShock','Joy-Con','Xbox Wireless Controller']),

  subtype('smart-home', 'security-camera', 'Güvenlik kamerası', 'smart', 'googleNest', ['Google','Xiaomi','TP-Link','Eufy','Ring','Arlo','Reolink'], ['Nest Cam','Tapo','EufyCam','Ring Cam']),
  subtype('smart-home', 'smart-bulb', 'Akıllı ampul', 'smart', 'googleNest', ['Philips','TP-Link','Xiaomi','IKEA','Nanoleaf'], ['Hue','Tapo','Yeelight','Tradfri']),
  subtype('smart-home', 'smart-plug', 'Akıllı priz', 'smart', 'googleNest', ['TP-Link','Xiaomi','Philips','IKEA','Meross'], ['Tapo','Kasa','Mi Smart Plug']),
  subtype('smart-home', 'smart-lock', 'Akıllı kilit', 'smart', 'googleNest', ['Yale','Nuki','Aqara','August','Schlage'], ['Linus','Smart Lock']),
  subtype('smart-home', 'video-doorbell', 'Görüntülü kapı zili', 'smart', 'googleNest', ['Google','Ring','Eufy','Arlo','Xiaomi'], ['Nest Doorbell','Ring Doorbell']),
  subtype('smart-home', 'robot-vacuum', 'Robot süpürge', 'smart', 'philips', ['Roborock','Xiaomi','iRobot','Dreame','Ecovacs','Philips','Vestel','Arçelik'], ['Roomba','Roborock','Dreame','Deebot']),
  subtype('smart-home', 'thermostat', 'Akıllı termostat', 'smart', 'googleNest', ['Google','Honeywell','Tado','Netatmo','Bosch'], ['Nest Thermostat','Tado']),

  subtype('wearable', 'smartwatch', 'Akıllı saat', 'wearable', 'appleWatch', ['Apple','Samsung','Huawei','Xiaomi','Garmin','Amazfit'], ['Apple Watch','Galaxy Watch','Watch GT','Mi Watch']),
  subtype('wearable', 'fitness-band', 'Akıllı bileklik', 'wearable', 'garmin', ['Xiaomi','Huawei','Fitbit','Garmin','Samsung'], ['Mi Band','Smart Band','Fitbit','Vivosmart']),
  subtype('wearable', 'gps-tracker', 'GPS takip cihazı', 'wearable', 'garmin', ['Apple','Samsung','Garmin','Tile','Chipolo'], ['AirTag','SmartTag','InReach']),

  subtype('camera', 'digital-camera', 'Fotoğraf makinesi', 'camera', 'canon', ['Canon','Sony','Nikon','Fujifilm','Panasonic','Olympus'], ['EOS','Alpha','Z','X-T','Lumix']),
  subtype('camera', 'action-camera', 'Aksiyon kamerası', 'camera', 'dji', ['GoPro','DJI','Insta360'], ['HERO','Osmo Action','X4']),
  subtype('camera', 'drone', 'Drone', 'camera', 'dji', ['DJI','Autel','Parrot'], ['Mini','Mavic','Air','Avata','Evo']),
  subtype('camera', 'instant-camera', 'Anlık baskı kamerası', 'camera', 'canon', ['Fujifilm','Polaroid','Kodak','Canon'], ['Instax','Now','Mini Shot']),

  subtype('storage', 'external-drive', 'Harici disk / SSD', 'storage', 'wd', ['Western Digital','WD','Seagate','Samsung','SanDisk','Kingston'], ['My Passport','Expansion','T7','Extreme']),
  subtype('storage', 'usb-drive', 'USB bellek', 'storage', 'wd', ['SanDisk','Kingston','Samsung','Transcend','Kioxia'], ['Ultra','DataTraveler']),
  subtype('storage', 'memory-card', 'Hafıza kartı', 'storage', 'wd', ['SanDisk','Samsung','Kingston','Lexar'], ['Extreme','Evo','Canvas']),
  subtype('storage', 'nas', 'NAS depolama', 'storage', 'synology', ['Synology','QNAP','Asustor','Western Digital'], ['DiskStation','TS','Lockerstor','My Cloud']),

  subtype('power', 'wall-charger', 'Şarj adaptörü', 'power', 'apple', ['Apple','Samsung','Anker','Belkin','Baseus','Ugreen','Xiaomi'], ['MagSafe','PowerPort','GaN']),
  subtype('power', 'power-bank', 'Powerbank', 'power', 'samsung', ['Anker','Xiaomi','Samsung','Baseus','Belkin'], ['PowerCore','Mi Power Bank']),
  subtype('power', 'ups', 'Kesintisiz güç kaynağı', 'power', 'apc', ['APC','Eaton','Schneider','Inform','Tunçmatik'], ['Back-UPS','Easy UPS']),
  subtype('power', 'surge-protector', 'Akım korumalı priz', 'power', 'apc', ['APC','Belkin','Philips','Schneider','Tunçmatik'], ['SurgeArrest']),

  subtype('appliance', 'washing-machine', 'Çamaşır makinesi', 'wet-appliance', 'arcelik', ['Arçelik','Beko','Vestel','Samsung','LG','Bosch','Siemens','Profilo','Altus'], ['ProSmart','HomeWhiz','AddWash']),
  subtype('appliance', 'dryer', 'Kurutma makinesi', 'thermal-appliance', 'beko', ['Arçelik','Beko','Vestel','Samsung','LG','Bosch','Siemens','Profilo','Altus'], ['ProSmart','HomeWhiz','Heat Pump']),
  subtype('appliance', 'dishwasher', 'Bulaşık makinesi', 'wet-appliance', 'arcelik', ['Arçelik','Beko','Vestel','Samsung','LG','Bosch','Siemens','Profilo','Altus'], ['ProSmart','HomeWhiz']),
  subtype('appliance', 'refrigerator', 'Buzdolabı', 'cold-appliance', 'arcelik', ['Arçelik','Beko','Vestel','Samsung','LG','Bosch','Siemens','Profilo','Altus'], ['No Frost','NeoFrost','MultiDoor']),
  subtype('appliance', 'freezer', 'Derin dondurucu', 'cold-appliance', 'beko', ['Arçelik','Beko','Vestel','Uğur','Bosch','Siemens','Altus'], ['No Frost','Sandık Tipi']),
  subtype('appliance', 'oven', 'Fırın', 'hot-appliance', 'arcelik', ['Arçelik','Beko','Vestel','Bosch','Siemens','Profilo','Samsung','LG'], ['Ankastre','Multifonksiyon']),
  subtype('appliance', 'microwave', 'Mikrodalga fırın', 'hot-appliance', 'beko', ['Arçelik','Beko','Vestel','Samsung','LG','Bosch','Siemens'], ['Solo','Grill']),
  subtype('appliance', 'air-conditioner', 'Klima', 'cold-appliance', 'vestel', ['Arçelik','Beko','Vestel','Samsung','LG','Daikin','Mitsubishi','Bosch','Baymak'], ['Inverter','Split']),
  subtype('appliance', 'coffee-machine', 'Kahve makinesi', 'small-appliance', 'arcelik', ['Arçelik','Beko','Vestel','Philips','Delonghi','Bosch','Siemens','Nespresso'], ['Telve','Barista','LatteGo']),
  subtype('appliance', 'vacuum-cleaner', 'Elektrikli süpürge', 'small-appliance', 'philips', ['Arçelik','Beko','Vestel','Philips','Dyson','Bosch','Rowenta','Fakir'], ['PowerPro','V-Series','Gen5']),
  subtype('appliance', 'air-purifier', 'Hava temizleyici', 'small-appliance', 'philips', ['Philips','Dyson','Xiaomi','Levoit','Vestel'], ['Pure Cool','Mi Air Purifier']),
  subtype('appliance', 'iron', 'Ütü', 'hot-appliance', 'philips', ['Philips','Tefal','Arçelik','Beko','Vestel','Braun'], ['PerfectCare','Pro Express']),
  subtype('appliance', 'kettle', 'Su ısıtıcı', 'hot-appliance', 'arcelik', ['Arçelik','Beko','Vestel','Philips','Tefal','Bosch'], ['Kettle']),
  subtype('appliance', 'fan', 'Vantilatör', 'small-appliance', 'philips', ['Arçelik','Beko','Vestel','Xiaomi','Dyson','Rowenta'], ['Smart Fan','Cool']),
  subtype('appliance', 'water-heater', 'Termosifon / şofben', 'hot-appliance', 'arcelik', ['Arçelik','Beko','Vestel','Bosch','Baymak','Demirdöküm'], ['Termosifon','Şofben'])
];

const makeScenario = (key, category, title, tr, en, solutionTitle, description, steps, options = {}) => ({
  key, category, title, tr, en, solutionTitle, description, steps,
  typoVariants: options.typoVariants || [],
  aliases: options.aliases || [],
  negativeSignals: options.negativeSignals || [],
  tags: options.tags || [category, key],
  safety: options.safety || 'safe',
  serviceThreshold: options.serviceThreshold || 'İki güvenli denemeden sonra sorun sürerse üreticinin yetkili desteğine başvur.',
  errorCodes: options.errorCodes || [],
  question: options.question || 'Bu belirti cihazın her kullanımında tekrar ediyor mu?'
});

const S = {
  power: makeScenario('no-power','power','{device} hiç açılmıyor',['{device} açılmıyor','güç gelmiyor','ışık yanmıyor'],['{device} will not turn on','no power','power light is off'],'Güç yolunu güvenle doğrula','Priz, kablo ve normal yeniden başlatma ile harici güç sorunlarını ayır.',[['Güç kaynağını kontrol et','Prizi başka bir cihazla dene; gevşek veya hasarlı kablo kullanma.'],['Bağlantıları yeniden tak','Cihaz kapalıyken yalnızca erişilebilir güç bağlantılarını çıkarıp yeniden tak.'],['Normal yeniden başlatmayı dene','Üreticinin normal açma yöntemini bir kez uygula; zorlamaya devam etme.']],{typoVariants:['acilmiyor','guc yok'],tags:['power','startup']}),
  charging: makeScenario('not-charging','battery','{device} şarj olmuyor',['şarj olmuyor','pil dolmuyor','kablo takılı ama şarj yok'],['not charging','battery not charging','plugged in not charging'],'Şarj zincirini kontrol et','Uyumlu kablo, adaptör ve kuru bağlantı noktasıyla sorunun kaynağını ayır.',[['Hasar ve nem kontrolü yap','Kablo veya portta hasar, sıvı ya da aşırı ısı varsa şarjı durdur.'],['Uyumlu güç kaynağı dene','Üretici onaylı farklı kablo, adaptör ve prizle dene.'],['Cihazı dinlendir','Cihazı oda sıcaklığında bekletip normal biçimde yeniden başlat.']],{typoVariants:['sarj olmuyor','sarj almiyor'],tags:['power','battery','charging'],safety:'caution'}),
  battery: makeScenario('battery-drain','battery','{device} pili hızlı bitiyor',['pil hızlı bitiyor','şarj çabuk tükeniyor','batarya dayanmıyor'],['battery drains fast','poor battery life','battery runs out quickly'],'Pil tüketimini ölç','Yüksek tüketen özellikleri belirleyip yazılım kaynaklı yükü azalt.',[['Pil kullanımını incele','Ayarlar içindeki pil kullanımında olağan dışı tüketen uygulama veya özelliği bul.'],['Gereksiz yükleri azalt','Ekran parlaklığı, arka plan yenileme ve kullanılmayan bağlantıları azalt.'],['Güncelle ve tekrar ölç','Resmî güncellemeyi kur, yeniden başlat ve bir tam kullanım döngüsü gözlemle.']],{typoVariants:['sarji cabuk bitiyor'],tags:['battery','performance']}),
  network: makeScenario('network-offline','network','{device} internete bağlanmıyor',['internete bağlanmıyor','wifi bağlı internet yok','ağ çevrimdışı'],['cannot connect to internet','wifi connected no internet','network offline'],'Bağlantıyı katman katman kontrol et','Yerel ağ, modem ve internet hizmetini birbirinden ayır.',[['Başka cihazla karşılaştır','Aynı ağdaki başka bir cihazın internete çıkıp çıkmadığını kontrol et.'],['Bağlantıyı yenile','Wi-Fi bağlantısını kapatıp aç ve doğru ağa yeniden bağlan.'],['Ağ cihazını yeniden başlat','Modem veya routerı normal yöntemle kapat, 30 saniye bekle ve aç.']],{typoVariants:['wifi bagli internet yok'],tags:['network','wifi','internet']}),
  pairing: makeScenario('pairing-failed','connection','{device} eşleşmiyor veya bağlanmıyor',['eşleşmiyor','bağlanmıyor','bluetooth bulmuyor'],['will not pair','cannot connect','bluetooth not found'],'Eşleştirmeyi temiz biçimde yenile','Güç, yakınlık ve eski eşleştirme kaydını kontrol et.',[['Cihazları yaklaştır ve şarjı kontrol et','İki cihazı yakın tut; düşük pil varsa önce güvenli biçimde şarj et.'],['Eski kaydı kaldır','Bağlı cihaz listesindeki eski kaydı unut veya kaldır.'],['Eşleştirme modunda tekrar ekle','Üreticinin eşleştirme yöntemini uygulayıp cihazı yeniden seç.']],{typoVariants:['eslesmiyor','baglanmiyor'],tags:['connection','bluetooth','pairing']}),
  slow: makeScenario('slow-performance','performance','{device} çok yavaş veya donuyor',['çok yavaş','donuyor','kasıyor','tepki vermiyor'],['very slow','freezes','not responding'],'Yükü ve kullanılabilir alanı kontrol et','Geçici yazılım yükünü azaltıp sorunun tekrar edip etmediğini ölç.',[['Bekleyen işlemi güvenle sonlandır','Yanıt vermeyen uygulamayı normal kapatma yöntemiyle kapat.'],['Boş alan ve güncellemeyi kontrol et','Depolamada güvenli boş alan bırak ve resmî güncellemeleri tamamla.'],['Normal yeniden başlat','Verileri kaydedip cihazı yeniden başlat; sorun çıkaran işlemi tek başına dene.']],{typoVariants:['cok yavas','kasiyor'],tags:['performance','freeze']}),
  update: makeScenario('update-failed','software','{device} güncellenmiyor',['güncelleme başarısız','güncelleme yüklenmiyor','yazılım güncelleme hatası'],['update failed','software update will not install','firmware update error'],'Güncelleme koşullarını hazırla','Güç, bağlantı, boş alan ve resmî güncelleme kanalını doğrula.',[['Güç ve interneti sabitle','Cihazı yeterli güçte tut ve güvenilir bir ağa bağla.'],['Boş alanı kontrol et','Güncelleme için gereken boş alanı üreticinin ayarlar ekranından doğrula.'],['Resmî güncellemeyi yeniden dene','Cihazı normal yeniden başlatıp yalnızca resmî güncelleme ekranından tekrar dene.']],{typoVariants:['guncellenmiyor'],tags:['software','update']}),
  heat: makeScenario('overheating','thermal','{device} aşırı ısınıyor',['aşırı ısınıyor','çok sıcak','ısı uyarısı'],['overheating','too hot','temperature warning'],'Cihazı güvenle soğut','Yükü ve çevresel ısıyı azalt; hızlı soğutma veya sıvı kullanma.',[['Kullanımı ve şarjı durdur','Cihazı kapat; güvenliyse güç bağlantısını ayır.'],['Hava akışını aç','Güneşten ve kumaş yüzeylerden uzak, kuru ve sert bir zeminde beklet.'],['Tam soğuduktan sonra gözlemle','Normal sıcaklığa dönmeden yeniden açma veya şarj etme.']],{typoVariants:['asiri isiniyor','cok sicak'],tags:['thermal','overheat'],safety:'caution',serviceThreshold:'Şişme, duman veya yanık kokusu varsa kullanma; güvenli alana geçip yetkili desteğe başvur.'}),
  display: makeScenario('no-display','display','{device} görüntü vermiyor',['görüntü yok','ekran siyah','sinyal yok'],['no picture','black screen','no signal'],'Görüntü yolunu kontrol et','Parlaklık, giriş seçimi ve erişilebilir kablo bağlantısını doğrula.',[['Güç ve parlaklığı kontrol et','Güç göstergesini kontrol et ve parlaklığı görünür seviyeye getir.'],['Doğru girişi seç','Bağlı kaynağın kullanıldığı HDMI veya görüntü girişini seç.'],['Kabloyu yeniden bağla','Cihazları kapatıp görüntü kablosunun iki ucunu yeniden tak; hasarlı kabloyu kullanma.']],{typoVariants:['goruntu yok','siyah ekran'],tags:['display','video']}),
  audio: makeScenario('no-audio','audio','{device} ses vermiyor',['ses yok','ses gelmiyor','hoparlör çalışmıyor'],['no sound','no audio','speaker not working'],'Ses çıkışını doğrula','Sessiz modu, ses düzeyini ve seçili çıkışı kontrol et.',[['Sessiz modu ve sesi kontrol et','Sesin kapalı olmadığını ve düzeyin duyulabilir olduğunu doğrula.'],['Doğru çıkışı seç','Ayarlar içinden kullandığın hoparlör veya kulaklığı aktif çıkış yap.'],['Bağlantıyı yenile','Harici ses cihazını çıkarıp yeniden bağla ve kısa bir test sesi çal.']],{typoVariants:['ses gelmiyo'],tags:['audio','output'],negativeSignals:['mikrofon çalışmıyor']}),
  input: makeScenario('controls-not-working','input','{device} tuşları veya kontrolleri çalışmıyor',['tuş çalışmıyor','kontrol tepki vermiyor','dokunmatik çalışmıyor'],['buttons not working','controls unresponsive','touch not working'],'Kontrol girişini ayır','Kilit, bağlantı ve geçici yazılım durumunu güvenli adımlarla kontrol et.',[['Fiziksel engeli kontrol et','Kılıf, kir veya taşıma kilidinin kontrolü engellemediğini görsel olarak doğrula.'],['Bağlantıyı yenile','Kablosuzsa pili ve bağlantıyı; kabloluysa erişilebilir konnektörü kontrol et.'],['Normal yeniden başlat','Cihazı normal yöntemle yeniden başlat ve tek bir kontrolle test et.']],{typoVariants:['tuslar calismiyor'],tags:['input','controls']}),
  intermittent: makeScenario('intermittent','stability','{device} ara sıra bağlantıyı kesiyor',['ara sıra kesiliyor','bağlantı kopuyor','kendiliğinden duruyor'],['keeps disconnecting','intermittent connection','stops randomly'],'Kesintinin koşulunu belirle','Güç, mesafe ve yazılım durumunu tek tek değiştirerek kesintiyi ayır.',[['Güç ve kabloyu sabitle','Gevşek kablo veya düşük pil ihtimalini güvenli biçimde ele.'],['Paraziti ve mesafeyi azalt','Kablosuz cihazları birbirine yaklaştır ve yoğun parazit kaynaklarından uzaklaştır.'],['Güncelle ve yeniden dene','Resmî yazılımı güncelle, yeniden başlat ve aynı işlemi tekrar gözlemle.']],{typoVariants:['baglanti kopuyor'],tags:['connection','intermittent']}),
  storage: makeScenario('storage-full','storage','{device} depolama alanı dolu',['depolama dolu','yer kalmadı','hafıza dolu'],['storage full','not enough space','disk full'],'Güvenli boş alan oluştur','Yalnızca tanıdığın kişisel ve geçici dosyaları gözden geçir.',[['Depolama özetini aç','En çok alan kullanan kategori ve uygulamaları ayarlar içinden görüntüle.'],['Gereksiz dosyaları yedekle veya kaldır','Kişisel dosyaları yedekle; sistem klasörlerini elle silme.'],['Çöp kutusunu kontrol et','Silinen dosyaların kapladığı alanı güvenli sistem aracından temizle.']],{typoVariants:['hafiza dolu'],tags:['storage','full']}),
  app: makeScenario('app-error','software','{device} uygulaması hata veriyor',['uygulama açılmıyor','uygulama hata veriyor','uygulama çöküyor'],['app will not open','app crashes','application error'],'Uygulamayı temiz durumda dene','Geçici uygulama ve bağlantı durumunu veri kaybetmeden yenile.',[['Uygulamayı tamamen kapat','Son uygulamalar veya görev ekranından uygulamayı kapat.'],['Bağlantı ve güncellemeyi kontrol et','İnterneti doğrula; uygulama ve cihaz güncellemelerini resmî mağazadan kur.'],['Cihazı yeniden başlat','Verilerini kaydedip cihazı normal biçimde yeniden başlat.']],{typoVariants:['uygulama cokuyor'],tags:['software','app']}),
  offline: makeScenario('device-offline','network','{device} çevrimdışı görünüyor',['çevrimdışı','offline','uygulamada görünmüyor'],['device offline','not available in app','unreachable'],'Yerel bağlantıyı yeniden kur','Cihazın gücünü, ağını ve uygulamadaki doğru evi veya hesabı kontrol et.',[['Gücü ve durum ışığını kontrol et','Cihazın açık ve hata ışığı göstermediğini doğrula.'],['Telefonla aynı ağı kullan','Kurulum sırasında telefonu aynı yerel Wi-Fi ağına bağla.'],['Uygulamayı ve cihazı yeniden başlat','Resmî uygulamayı kapatıp aç; cihazı normal yöntemle yeniden başlat.']],{tags:['network','offline','smart']}),
  automation: makeScenario('automation-failed','automation','{device} otomasyonu çalışmıyor',['otomasyon çalışmıyor','zamanlama işlemiyor','sahne tetiklenmiyor'],['automation not working','schedule not running','scene does not trigger'],'Otomasyon koşullarını doğrula','Saat dilimi, cihaz erişimi ve tetikleyici koşullarını kontrol et.',[['Saat ve konumu kontrol et','Uygulamadaki saat dilimi ve gerekiyorsa konum iznini doğrula.'],['Cihazın çevrimiçi olduğunu doğrula','Cihazı uygulamadan manuel kontrol ederek bağlantıyı test et.'],['Otomasyonu kapatıp aç','Kuralı silmeden devre dışı bırak, yeniden etkinleştir ve bir kez test et.']],{tags:['automation','smart','schedule']}),
  sensor: makeScenario('sensor-inaccurate','sensor','{device} sensörü yanlış ölçüyor',['sensör yanlış','ölçüm hatalı','değer değişmiyor'],['sensor inaccurate','wrong reading','measurement stuck'],'Sensör koşullarını kontrol et','Konum, temizlik ve resmî kalibrasyon seçeneğini doğrula.',[['Sensörü engelleyen yüzeyi kontrol et','Üreticinin dış temizlik talimatına göre görünür yüzeyi nazikçe temizle.'],['Konumu değiştir','Isı, buhar, doğrudan güneş veya manyetik parazit kaynağından uzaklaştır.'],['Resmî kalibrasyonu uygula','Varsa uygulamadaki kalibrasyon veya yeniden ölçüm adımını kullan.']],{tags:['sensor','measurement']}),
  notifications: makeScenario('notifications-missing','notifications','{device} bildirim göstermiyor',['bildirim gelmiyor','uyarı görünmüyor','titreşim yok'],['notifications missing','no alerts','no vibration'],'Bildirim zincirini kontrol et','İzin, rahatsız etme modu ve bağlantı durumunu doğrula.',[['Rahatsız etme modunu kontrol et','Sessiz veya odak modunun bildirimi engellemediğini doğrula.'],['Uygulama izinlerini aç','Cihazın resmî uygulaması için bildirim iznini kontrol et.'],['Bağlantıyı yenile','Eşlik eden telefonla bağlantıyı kapatıp yeniden aç.']],{tags:['notifications','connection']}),
  sync: makeScenario('sync-failed','sync','{device} verileri eşitlemiyor',['eşitlemiyor','veri aktarılmıyor','senkronizasyon bekliyor'],['not syncing','data not transferred','sync pending'],'Eşitleme koşullarını yenile','Bağlantı, izin ve resmî uygulama durumunu kontrol et.',[['Bağlantıyı doğrula','Bluetooth veya yerel ağ bağlantısının aktif olduğunu kontrol et.'],['İzinleri kontrol et','Resmî uygulamanın gerekli yakın cihaz ve arka plan izinlerini doğrula.'],['Uygulamayı yeniden aç','Uygulamayı tamamen kapatıp aç ve manuel eşitlemeyi başlat.']],{typoVariants:['esitlemiyor'],tags:['sync','connection']}),
  printOffline: makeScenario('printer-offline','network','{device} çevrimdışı veya yazdırmıyor',['yazıcı çevrimdışı','yazdırmıyor','kuyrukta bekliyor'],['printer offline','will not print','print job stuck'],'Yazdırma yolunu yenile','Yazıcı durumu, kuyruk ve ağ bağlantısını kontrol et.',[['Yazıcı durumunu kontrol et','Kağıt, kapak ve sarf uyarısı olmadığını; cihazın hazır olduğunu doğrula.'],['Tek bir işi yeniden dene','Takılı işleri sistem yazdırma kuyruğundan iptal edip test sayfası gönder.'],['Ağı veya USB bağlantısını yenile','Yazıcı ve bilgisayarı normal yeniden başlatıp bağlantıyı tekrar kur.']],{tags:['printer','offline','queue']}),
  paperJam: makeScenario('paper-jam','paper','{device} kağıt sıkıştırıyor',['kağıt sıkıştı','kağıt almıyor','paper jam'],['paper jam','will not feed paper','paper feed error'],'Kağıt yolunu üretici adımıyla temizle','Gücü kesip yalnızca kullanıcı erişimine açık kapaklardan görünen kağıdı çıkar.',[['Cihazı kapat ve fişini çek','Hareketli parçaların durmasını bekle.'],['Görünen kağıdı yavaşça çıkar','Kullanıcı kapağını aç; kağıdı ilerleme yönünde iki elle ve yırtmadan çek.'],['Kağıdı düzgün yükle','Kuru ve uygun boyuttaki kağıdı kılavuzları sıkıştırmadan yerleştir.']],{typoVariants:['kagit sikisti'],tags:['printer','paper','jam'],safety:'caution'}),
  printQuality: makeScenario('poor-print-quality','quality','{device} soluk, çizgili veya lekeli çıktı veriyor',['çıktı soluk','baskı çizgili','sayfa lekeli'],['faded print','streaks on page','poor print quality'],'Yerleşik bakım testini çalıştır','Sarf seviyesini ve üreticinin nozül veya kalite testini kullan.',[['Sarf seviyesini kontrol et','Mürekkep veya toner uyarısını cihaz ekranından kontrol et.'],['Doğru kağıt ve kaliteyi seç','Kağıt türü ile yazdırma ayarının eşleştiğini doğrula.'],['Yerleşik kalite testini çalıştır','Üreticinin bakım menüsündeki test sayfası veya temizleme işlemini bir kez çalıştır.']],{typoVariants:['cikti soluk'],tags:['printer','quality','ink','toner']}),
  scan: makeScenario('scan-failed','scanner','{device} tarama yapmıyor',['tarama yapmıyor','tarayıcı bulunamadı','scan error'],['scanner not found','cannot scan','scan failed'],'Tarama bağlantısını doğrula','Tarayıcı durumu, izin ve resmî yazılımı kontrol et.',[['Kilidi ve kapağı kontrol et','Varsa taşıma kilidinin açık ve kapağın düzgün kapalı olduğunu doğrula.'],['Bağlantıyı yenile','USB veya ağ bağlantısını yeniden kur ve cihazı normal başlat.'],['Resmî tarama uygulamasını dene','Üreticinin uygulamasından küçük bir test taraması başlat.']],{tags:['scanner','scan','connection']}),
  consumable: makeScenario('consumable-warning','consumable','{device} kartuş veya toner uyarısı veriyor',['kartuş tanınmıyor','toner uyarısı','mürekkep hatası'],['cartridge not recognized','toner warning','ink error'],'Sarf malzemesini güvenle doğrula','Model uyumunu ve üreticinin kullanıcıya açık yeniden takma adımını uygula.',[['Model uyumunu kontrol et','Sarf malzemesinin cihaz modeline uygun olduğunu ambalajdan doğrula.'],['Koruma bandını kontrol et','Yeni sarfta üreticinin belirttiği taşıma bandının çıkarıldığını doğrula.'],['Kullanıcı adımına göre yeniden tak','Cihaz kapalıyken kullanım kılavuzundaki sarf değiştirme adımını uygula.']],{tags:['printer','ink','toner'],safety:'caution'}),
  wifiWeak: makeScenario('wifi-weak','network','{device} Wi-Fi sinyali zayıf',['wifi zayıf','çekmiyor','sinyal düşük'],['weak wifi','poor signal','low signal strength'],'Kablosuz kapsama alanını iyileştir','Konum, bant ve parazit etkenlerini güvenli biçimde değiştir.',[['Cihazları yaklaştır','Router ile istemci arasındaki duvar ve metal engelleri azalt.'],['Açık bir konum seç','Ağ cihazını zeminden yükselt ve kapalı dolap içine koyma.'],['Bantları karşılaştır','Yakında 5 GHz, daha uzakta 2.4 GHz ağını ayrı ayrı dene.']],{typoVariants:['wifi cekmiyor'],tags:['network','wifi','signal']}),
  internetSlow: makeScenario('internet-slow','performance','{device} interneti yavaş',['internet yavaş','indirme hızı düşük','gecikme yüksek'],['slow internet','low download speed','high latency'],'Yavaşlığın kapsamını ölç','Tek cihaz, yerel Wi-Fi ve internet hattını birbirinden ayır.',[['Başka cihazla karşılaştır','Aynı ağda ve aynı konumda ikinci bir cihazla kısa hız testi yap.'],['Yoğun kullanımı durdur','Büyük indirme ve yedeklemeleri geçici olarak durdur.'],['Ağ cihazını normal yeniden başlat','Modem veya routerı kapatıp 30 saniye sonra aç.']],{typoVariants:['internet yavas'],tags:['network','performance','latency']}),
  networkDrops: makeScenario('network-drops','stability','{device} bağlantıyı sık sık kesiyor',['wifi kopuyor','internet gidip geliyor','bağlantı düşüyor'],['wifi keeps dropping','internet disconnects','unstable connection'],'Kopmanın kaynağını ayır','Kablo, sinyal ve ağ cihazının çalışma durumunu karşılaştır.',[['Kabloları kontrol et','Gevşek güç veya internet kablosunu yeniden tak; hasarlı kabloyu değiştir.'],['Sinyali karşılaştır','Ağ cihazına yakınken kopmanın sürüp sürmediğini gözlemle.'],['Yazılımı resmî kanaldan güncelle','Ağ cihazının yönetim ekranındaki üretici güncellemesini kontrol et.']],{typoVariants:['wifi kopuyo'],tags:['network','wifi','intermittent']}),
  noWater: makeScenario('water-inlet','water','{device} su almıyor',['su almıyor','su girişi yok','program su bekliyor'],['not filling with water','no water inlet','water supply error'],'Su beslemesini dışarıdan kontrol et','Musluk, hortum kıvrımı ve kapak kapanmasını kullanıcı düzeyinde doğrula.',[['Su vanasını kontrol et','Cihaza giden su vanasının açık olduğunu doğrula.'],['Hortumu gözle kontrol et','Giriş hortumunda ezilme, kıvrılma veya görünür sızıntı olmadığını kontrol et.'],['Kapağı yeniden kapat','Kapağı zorlamadan açıp yeniden kapat ve kısa programı bir kez dene.']],{typoVariants:['su almiyo'],tags:['water','inlet'],safety:'caution'}),
  notDrain: makeScenario('not-draining','water','{device} suyu boşaltmıyor',['suyu boşaltmıyor','içinde su kaldı','tahliye etmiyor'],['not draining','water left inside','drain error'],'Güvenli tahliye kontrollerini yap','Program, tahliye hortumu ve kullanıcı erişimli filtre uyarısını kontrol et.',[['Programı durdur ve gücü kes','Cihazı kapat; sıcak su ihtimali varsa kapağı açmadan soğumasını bekle.'],['Tahliye hortumunu gözle kontrol et','Hortumun ezilmediğini ve giderde aşırı derine itilmediğini doğrula.'],['Kılavuzdaki tahliye adımını kullan','Yalnızca üreticinin kullanıcıya açık acil tahliye veya filtre adımını uygula.']],{typoVariants:['suyu bosaltmiyor'],tags:['water','drain'],safety:'caution',serviceThreshold:'Sıcak su, sızıntı veya erişilemeyen tıkanıklık varsa işlemi bırak ve yetkili servis çağır.'}),
  leak: makeScenario('water-leak','water','{device} su sızdırıyor',['su sızdırıyor','altından su geliyor','kaçak var'],['water leak','leaking underneath','water coming out'],'Sızıntıda enerjiyi güvenle ayır','Suya basmadan güvenli mesafeden güç ve su beslemesini durdur.',[['Cihazı kullanmayı bırak','Programa devam etme; suya veya ıslak fişe dokunma.'],['Güvenliyse beslemeyi kapat','Kuru ve erişilebilir durumdaysa ilgili sigortayı ve su vanasını kapat.'],['Alanı kullanıma kapat','Çocukları ve evcil hayvanları uzak tutup yetkili servis çağır.']],{typoVariants:['su sizdiriyor'],tags:['water','leak','safety'],safety:'service',serviceThreshold:'Sızıntı kullanıcı onarımı değildir; cihazı tekrar çalıştırmadan yetkili servis kontrolü gerekir.'}),
  noise: makeScenario('unusual-noise','mechanical','{device} anormal ses veya titreşim yapıyor',['çok ses yapıyor','titreşim yapıyor','vuruntu sesi'],['unusual noise','vibrating','rattling sound'],'Denge ve dış engelleri kontrol et','Cihazı durdurup gevşek dış parçaları ve zemini kontrol et.',[['Cihazı durdur','Yeni, metalik veya sürtme sesi varsa kullanıma devam etme.'],['Dengeyi ve yükü kontrol et','Cihazın düz zeminde olduğunu ve yükün kılavuz sınırını aşmadığını doğrula.'],['Dış temasları kaldır','Cihaza değen kablo, eşya veya duvar temasını giderip kısa test yap.']],{typoVariants:['cok ses yapiyor'],tags:['mechanical','noise'],safety:'caution'}),
  notStart: makeScenario('cycle-not-starting','operation','{device} programı başlatmıyor',['program başlamıyor','çalışmaya geçmiyor','start tuşu işlemiyor'],['cycle will not start','will not run','start button does nothing'],'Başlatma koşullarını doğrula','Kapak, çocuk kilidi, program ve güç durumunu kontrol et.',[['Kapağı yeniden kapat','Kapağı zorlamadan açıp tamamen kapat; arada nesne olmadığını kontrol et.'],['Kilit ve gecikmeyi kontrol et','Çocuk kilidi veya gecikmeli başlatmanın açık olmadığını ekrandan doğrula.'],['Programı yeniden seç','Cihazı normal kapatıp aç ve kısa bir programı bir kez başlat.']],{typoVariants:['program baslamiyor'],tags:['operation','controls']}),
  notHeat: makeScenario('not-heating','temperature','{device} ısıtmıyor',['ısıtmıyor','soğuk kalıyor','sıcaklık artmıyor'],['not heating','stays cold','temperature not rising'],'Ayar ve çevrim koşullarını kontrol et','Program sıcaklığını ve çevrimin tamamlanmasını dışarıdan doğrula.',[['Doğru programı seç','Seçilen programın ısıtma içerdiğini ayarlar ekranından doğrula.'],['Yükü ve kapağı kontrol et','Kılavuz sınırındaki yükle kapağın tam kapandığını doğrula.'],['Tek kısa test yap','Boş veya güvenli test koşulunda kısa bir program dene; iç parçaya erişme.']],{typoVariants:['isitmiyor'],tags:['temperature','heating'],safety:'caution',serviceThreshold:'Isıtma elemanı, gaz veya elektrik bağlantısına müdahale etme; sorun sürerse yetkili servis çağır.'}),
  notCool: makeScenario('not-cooling','temperature','{device} yeterince soğutmuyor',['soğutmuyor','yeterince soğuk değil','sıcak kalıyor'],['not cooling','not cold enough','temperature too warm'],'Hava dolaşımı ve ayarı kontrol et','Kapak, sıcaklık ayarı ve dış hava akışını doğrula.',[['Sıcaklık ayarını doğrula','Yanlışlıkla değişmiş ayarı üreticinin önerilen aralığına getir.'],['Hava boşluklarını aç','Dış havalandırma alanlarını ve iç hava çıkışlarını eşya ile kapatma.'],['Kapak kapanmasını kontrol et','Conta üzerinde paket veya kir olmadığını görsel olarak kontrol et.']],{typoVariants:['sogutmuyor'],tags:['temperature','cooling'],safety:'caution'}),
  stops: makeScenario('stops-mid-cycle','operation','{device} çalışırken duruyor',['çalışırken duruyor','program yarıda kalıyor','kendiliğinden kapanıyor'],['stops during use','cycle stops midway','turns off by itself'],'Çalışma koşullarını kontrol et','Güç, kapak ve aşırı yük ihtimalini güvenli biçimde ayır.',[['Gücü ve kapağı kontrol et','Fişin gevşek olmadığını ve kapağın tam kapalı olduğunu doğrula.'],['Soğumasını bekle','Cihaz sıcaksa kapatıp üreticinin önerdiği süre boyunca beklet.'],['Daha küçük yükle dene','Kılavuz sınırına uygun, daha hafif bir yükle tek kısa test yap.']],{tags:['operation','intermittent','thermal'],safety:'caution'}),
  cleaning: makeScenario('cleaning-warning','maintenance','{device} temizlik veya filtre uyarısı veriyor',['filtre uyarısı','temizleme ışığı','bakım gerekli'],['clean filter warning','cleaning light','maintenance required'],'Kullanıcı bakımını uygula','Yalnızca kılavuzda kullanıcıya açık filtre ve dış yüzey bakımını yap.',[['Cihazı kapat ve soğut','Gücü ayır; sıcak veya hareketli parçaların durmasını bekle.'],['Kullanıcı filtresini kontrol et','Kılavuzda çıkarılabilir olarak belirtilen filtreyi tarif edildiği gibi temizle.'],['Uyarıyı resmî yöntemle sıfırla','Filtre tamamen kuruyup yerine takıldıktan sonra bakım sayacını menüden sıfırla.']],{tags:['maintenance','filter'],safety:'caution'}),
  error: makeScenario('error-message','error','{device} hata kodu veya uyarı gösteriyor',['hata kodu veriyor','ekranda uyarı var','error code'],['shows error code','warning message','device error'],'Hata bilgisini güvenle kaydet','Kodu değiştirmeden kaydedip güç ve temel kullanım koşullarını kontrol et.',[['Kodu aynen not et','Harf, sayı ve yanıp sönme düzenini fotoğraf veya notla kaydet.'],['Normal koşulları kontrol et','Kapak, güç, ağ veya sarf uyarısı gibi dış koşulları doğrula.'],['Bir kez normal yeniden başlat','Veri kaybı riski yoksa üreticinin normal kapatma ve açma yöntemini uygula.']],{tags:['error','code'],safety:'caution'})
};

const profiles = {
  digital: ['power','charging','battery','network','display','audio','slow','update'],
  mobile: ['power','charging','battery','network','display','audio','slow','app'],
  peripheral: ['power','pairing','input','intermittent','update','app','charging','error'],
  network: ['power','network','wifiWeak','internetSlow','networkDrops','update','app','error'],
  printer: ['power','printOffline','paperJam','printQuality','scan','consumable','network','error'],
  display: ['power','display','audio','input','network','app','update','intermittent'],
  audio: ['power','charging','pairing','audio','input','intermittent','update','app'],
  console: ['power','display','input','network','storage','heat','update','app'],
  smart: ['power','offline','pairing','automation','sensor','battery','update','app'],
  wearable: ['power','charging','battery','pairing','notifications','sync','sensor','update'],
  camera: ['power','charging','storage','display','sync','heat','update','error'],
  storage: ['power','pairing','storage','slow','intermittent','network','app','error'],
  power: ['power','charging','intermittent','heat','slow','input','error','stops'],
  'wet-appliance': ['power','notStart','noWater','notDrain','noise','leak','error','cleaning'],
  'thermal-appliance': ['power','notStart','notHeat','stops','noise','heat','error','cleaning'],
  'cold-appliance': ['power','notStart','notCool','noise','leak','heat','error','cleaning'],
  'hot-appliance': ['power','notStart','notHeat','stops','noise','heat','error','cleaning'],
  'small-appliance': ['power','notStart','slow','stops','noise','heat','error','cleaning']
};

const emergencyDefinitions = [
  { id:'emergency-swollen-battery', title:'Şişmiş batarya veya açılmış kasa', phrases:['batarya şişti','pil şişti','kasa şişti','ekran kasadan ayrılıyor','swollen battery','battery bulging'], tags:['battery','swelling'], instruction:'Cihazı kullanmayı ve şarj etmeyi bırak. Sıkıştırma, delme veya taşıma yapma; yanıcı maddelerden uzak güvenli bir alanda yetkili destekle görüş.', sourceKey:'apple' },
  { id:'emergency-smoke-fire', title:'Duman, alev veya yanık kokusu', phrases:['duman çıkıyor','alev aldı','yanık kokusu','burning smell','smoke coming out','on fire'], tags:['smoke','fire'], instruction:'Cihaza dokunma. Güvenliyse ana enerjiyi uzaktan kes, ortamı boşalt ve yerel acil yardım birimini ara.', sourceKey:'apc' },
  { id:'emergency-electric-shock', title:'Elektrik çarpması, kıvılcım veya ıslak elektrik', phrases:['elektrik çarpıyor','kıvılcım çıkarıyor','priz ıslandı','kaçak elektrik','electric shock','sparking','wet outlet'], tags:['electric','shock'], instruction:'Cihaza ve suya dokunma. Güvenli mesafeden ilgili sigortayı kapatabiliyorsan kapat ve yetkili elektrikçi çağır.', sourceKey:'apc' },
  { id:'emergency-gas-smell', title:'Gaz kokusu veya gaz kaçağı şüphesi', phrases:['gaz kokusu','gaz kaçağı','doğalgaz kokusu','smell gas','gas leak'], tags:['gas','leak'], instruction:'Elektrik düğmesi, telefon veya ateş kullanma. Pencereyi güvenliyse aç, binayı terk et ve dışarıdan gaz acil hattını ara.', sourceKey:'arcelik' },
  { id:'emergency-scalding-water', title:'Kontrolsüz kaynar su veya buhar', phrases:['kaynar su fışkırıyor','çok sıcak su akıyor','buhar kaçırıyor','boiling water leak','scalding water','steam leak'], tags:['hot-water','steam'], instruction:'Yaklaşma ve kapağı açma. Güvenliyse uzaktan enerjiyi kes, alanı boş tut ve yetkili servis çağır.', sourceKey:'arcelik' },
  { id:'emergency-high-voltage', title:'Açık yüksek gerilim parçası', phrases:['açık kablo var','çıplak tel','yüksek gerilim açıkta','exposed wire','exposed high voltage','live wire'], tags:['electric','high-voltage'], instruction:'Cihaza yaklaşma veya müdahale etme. Güvenli mesafeden ana enerjiyi kes ve yetkili elektrikçi çağır.', sourceKey:'apc' }
];

const brandCodeDefinitions = [
  { id:'windows-update-0x80070002', deviceType:'computer', subType:'windows-laptop', brand:'Microsoft', models:['Windows 10','Windows 11'], codes:['0x80070002'], title:'Windows Update 0x80070002 hatası', tr:['Windows güncelleme 0x80070002 hatası'], en:['Windows Update error 0x80070002'], sourceKey:'microsoft', tags:['software','update'] },
  { id:'windows-device-code-43', deviceType:'computer', subType:'windows-laptop', brand:'Microsoft', models:['Windows 10','Windows 11'], codes:['Code 43','Kod 43'], title:'Windows Aygıt Yöneticisi Kod 43', tr:['aygıt yöneticisi kod 43'], en:['device manager code 43'], sourceKey:'microsoft', tags:['hardware','driver'] },
  { id:'samsung-washer-5c-5e', deviceType:'appliance', subType:'washing-machine', brand:'Samsung', models:['AddWash','EcoBubble'], codes:['5C','5E'], title:'Samsung çamaşır makinesi 5C / 5E tahliye hatası', tr:['Samsung çamaşır makinesi 5C hatası','Samsung 5E su boşaltma hatası'], en:['Samsung washer 5C error','Samsung washer 5E drain error'], sourceKey:'samsung', tags:['water','drain'] },
  { id:'lg-washer-oe', deviceType:'appliance', subType:'washing-machine', brand:'LG', models:['Direct Drive','ThinQ'], codes:['OE'], title:'LG çamaşır makinesi OE tahliye hatası', tr:['LG çamaşır makinesi OE hatası'], en:['LG washer OE drain error'], sourceKey:'lg', tags:['water','drain'] },
  { id:'bosch-dishwasher-e24', deviceType:'appliance', subType:'dishwasher', brand:'Bosch', models:['Serie 4','Serie 6','Serie 8'], codes:['E24','E:24'], title:'Bosch bulaşık makinesi E24 tahliye hatası', tr:['Bosch bulaşık makinesi E24 hatası'], en:['Bosch dishwasher E24 drain error'], sourceKey:'bosch', tags:['water','drain'] },
  { id:'playstation-ce-108255-1', deviceType:'console', subType:'playstation', brand:'PlayStation', models:['PS5'], codes:['CE-108255-1'], title:'PlayStation 5 CE-108255-1 uygulama hatası', tr:['PS5 CE-108255-1 hatası'], en:['PS5 error CE-108255-1'], sourceKey:'playstation', tags:['software','app'] },
  { id:'canon-printer-5100', deviceType:'printer', subType:'inkjet-printer', brand:'Canon', models:['PIXMA'], codes:['5100','Support Code 5100'], title:'Canon PIXMA 5100 taşıyıcı hatası', tr:['Canon yazıcı 5100 hatası'], en:['Canon printer support code 5100'], sourceKey:'canon', tags:['printer','carriage'] },
  { id:'hp-printer-e3', deviceType:'printer', subType:'inkjet-printer', brand:'HP', models:['DeskJet','ENVY'], codes:['E3'], title:'HP yazıcı E3 taşıyıcı sıkışması', tr:['HP yazıcı E3 hatası'], en:['HP printer E3 error'], sourceKey:'hp', tags:['printer','carriage'] }
];

module.exports = { VERIFIED_AT, sources, deviceTypes, subtypes, scenarios: S, profiles, emergencyDefinitions, brandCodeDefinitions };
