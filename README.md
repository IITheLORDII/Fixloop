# FixLoop Local

FixLoop; GPT, API anahtarı, üyelik veya çalışma anında internet bağlantısı gerektirmeden cihaz sorunlarını yerel katalogla eşleştirir.

## Kapsam

- 590 sorun akışı
- 13 cihaz ailesi ve 72 ayrıntılı cihaz alt türü
- Her alt tür için güvenli fallback
- Türkçe ve İngilizce belirti eşleştirme
- Türkçe karaktersiz yazım ve küçük yazım hatası toleransı
- Marka, model ve resmî hata kodu ağırlıkları
- En fazla üç ayırıcı soru
- Duman, şişmiş batarya, elektrik, gaz, kaynar su ve açık gerilim için doğrudan acil akış
- 29 benzersiz resmî üretici destek kaynağı
- Tarayıcı içinde çalışan Türkçe + İngilizce yerel OCR

Otomotiv, medikal ve endüstriyel sistemler katalog kapsamı dışındadır. Kasa açma, güvenlik kilidi aşma, gaz hattı, yüksek gerilim ve ileri elektronik onarım adımları verilmez.

## Başlatma

Windows'ta `start-local.cmd` dosyasına çift tıklayın veya terminalde:

```powershell
npm start
```

Ardından `http://127.0.0.1:4173` adresini açın.

## Yerel veriler

- Modüler katalog paketleri: `data/catalog/*.json`
- Derlenmiş arama indeksi: `data/catalog-index.json`
- Kullanıcı denemeleri: `data/runtime/attempts.json`
- Kullanıcı geri bildirimleri: `data/runtime/feedback.json`
- Eşleşmeyen sorunlar: `data/runtime/missing-catalog.json`
- Önceki v2 veri dosyası: `data/knowledge-base.json` (yalnızca ilk çalışma verisi göçü için korunur)

Ekran görüntüsü tarayıcı içinde Tesseract.js ile okunur; görselin kendisi kaydedilmez veya gönderilmez. Okunan metindeki e-posta, telefon, IBAN, kart numarası ve açıkça etiketlenmiş parola/anahtar değerleri tanıya eklenmeden önce maskelenir. Türkçe ve İngilizce dil modelleri `dist/vendor/tesseract` altında yerel olarak paketlenir.

Bağımlılıkları yeniden kurduktan sonra OCR varlıklarını elle eşitlemek gerekirse:

```powershell
npm run ocr:sync
```

## Katalog komutları

Kaynak tanımlarından çekirdek paketleri üretip indeksi derlemek:

```powershell
npm run catalog:generate
npm run catalog:build
```

Şema sürümü 3 olan, elle indirilmiş veya hazırlanmış resmî bir veri paketini içe aktarmak:

```powershell
npm run catalog:import -- C:\yol\yeni-paket.json
```

İçe aktarıcı paketi önce katalog dizinine kopyalar, tüm kataloğu doğrular ve başarısız olursa kopyayı geri alır. Çalışma sırasında otomatik web taraması yapılmaz.

## API

- `POST /api/diagnose`: `problem`, `deviceType`, `subType`, `brandModel`, `answers` alır; `question`, `solution` veya `fallback` döndürür.
- `POST /api/feedback`: deneme sonucunu ayrı çalışma verisine yazar.
- `GET /api/catalog`: cihaz ailesi ve alt tür listesini döndürür.
- `GET /api/catalog/stats`: katalog, kaynak, eşleşmeyen sorun ve sonuç sayılarını döndürür.

## Doğrulama

```powershell
npm run check
```

Bu komut; sözdizimini, en az 500 kayıt koşulunu, benzersiz kimlikleri, tüm alt tür fallback'lerini, resmî kaynak metadata alanlarını, soru dallarını, yasaklı riskli talimatları, 320 Türkçe/İngilizce altın sorguyu, tehlike önceliğini ve yerel API veri kalıcılığını kontrol eder.
