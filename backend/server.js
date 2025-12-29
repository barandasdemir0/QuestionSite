// Backend sunucu - Express.js ile REST API
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

// Middleware'ler
app.use(cors()); // Frontend'den gelen isteklere izin ver
app.use(express.json()); // JSON verileri parse et

// Klasör yolları
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const SORULAR_DOSYASI = path.join(DATA_DIR, 'questions.json');
const PYTHON_SCRIPT = path.join(__dirname, '..', 'txt_to_json_converter.py');

// Klasörleri oluştur
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Eğer questions.json yoksa boş bir dizi ile oluştur
if (!fs.existsSync(SORULAR_DOSYASI)) {
  fs.writeFileSync(SORULAR_DOSYASI, JSON.stringify([], null, 2));
}

// Multer Ayarları (Dosya Yükleme)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    // Türkçe karakter ve boşlukları temizle
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname);
    cb(null, 'upload-' + uniqueSuffix + ext)
  }
})

// Sadece txt ve docx kabul et
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/plain' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.originalname.match(/\.(txt|docx)$/)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece .txt ve .docx dosyaları yüklenebilir!'), false);
  }
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

// ===== API ENDPOINT'LERİ =====

// Ana sayfa - API durumu
app.get('/', (req, res) => {
  res.json({
    mesaj: 'Test Uygulaması API çalışıyor!',
    surum: '1.0.0'
  });
});

// DOSYA YÜKLEME VE DÖNÜŞTÜRME
app.post('/api/upload', upload.single('dosya'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ hata: 'Lütfen bir dosya seçin!' });
  }

  const dersAdi = req.body.ders || 'Genel';
  const sinavTipi = req.body.sinav || 'Genel';
  const filePath = req.file.path;

  console.log(`Dosya yüklendi: ${filePath} | Ders: ${dersAdi} | Sınav: ${sinavTipi}`);

  // Python scriptini çalıştır
  // python txt_to_json_converter.py <dosya_yolu> <ders_adi> <sinav_tipi>

  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const cwd = path.join(__dirname, '..');

  // Argümanları güvenli bir şekilde tırnak içine al (boşluk varsa)
  const cmd = `${pythonCmd} "${PYTHON_SCRIPT}" "${filePath}" "${dersAdi}" "${sinavTipi}"`;

  console.log(`Dönüştürme komutu: ${cmd}`);

  exec(cmd, { cwd: cwd }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Hata: ${error.message}`);
      return res.status(500).json({
        hata: 'Dönüştürme işlemi başarısız oldu.',
        detay: stderr || error.message
      });
    }

    console.log(`Script Çıktısı: ${stdout}`);

    try {
      const sorular = JSON.parse(fs.readFileSync(SORULAR_DOSYASI, 'utf8'));
      res.json({
        mesaj: 'Dosya başarıyla yüklendi ve sorular veritabanına eklendi!',
        toplamSoru: sorular.length,
        eklenenDers: dersAdi,
        log: stdout
      });
    } catch (e) {
      res.status(500).json({ hata: 'JSON okunurken hata oluştu.' });
    }
  });
});

// SORULARI SİL (Tümünü veya derse göre)
app.post('/api/sorulari-sil', (req, res) => {
  try {
    const { ders, sinav } = req.body;

    if (!fs.existsSync(SORULAR_DOSYASI)) {
      return res.json({ mesaj: 'Zaten hiç soru yok.', silinen: 0 });
    }

    let sorular = JSON.parse(fs.readFileSync(SORULAR_DOSYASI, 'utf8'));
    const ilkSayi = sorular.length;

    if (ders) {
      // Sadece belirli bir dersin sorularını sil
      if (sinav) {
        // Belirli ders ve sınav tipi
        sorular = sorular.filter(s => s.ders !== ders || s.sinav !== sinav);
      } else {
        // Sadece ders
        sorular = sorular.filter(s => s.ders !== ders);
      }
    } else {
      // Hepsini sil
      sorular = [];
    }

    fs.writeFileSync(SORULAR_DOSYASI, JSON.stringify(sorular, null, 2));

    res.json({
      mesaj: 'Sorular silindi.',
      silinen: ilkSayi - sorular.length,
      kalan: sorular.length
    });

  } catch (error) {
    console.error('Silme hatası:', error);
    res.status(500).json({ hata: 'Sorular silinemedi!' });
  }
});

// DERS LİSTESİNİ GETİR (Benzersiz dersler)
app.get('/api/dersler', (req, res) => {
  try {
    if (!fs.existsSync(SORULAR_DOSYASI)) {
      return res.json([]);
    }
    const sorular = JSON.parse(fs.readFileSync(SORULAR_DOSYASI, 'utf8'));

    // Benzersiz dersleri bul
    const dersler = [...new Set(sorular.map(s => s.ders || 'Genel'))];
    res.json(dersler);
  } catch (error) {
    res.status(500).json({ hata: 'Dersler alınamadı' });
  }
});

// SINAV LİSTESİNİ GETİR (Bir ders için)
app.get('/api/sinavlar/:dersAdi', (req, res) => {
  try {
    const dersAdi = req.params.dersAdi;
    if (!fs.existsSync(SORULAR_DOSYASI)) return res.json([]);

    const sorular = JSON.parse(fs.readFileSync(SORULAR_DOSYASI, 'utf8'));
    const dersSorulari = sorular.filter(s => (s.ders || 'Genel') === dersAdi);

    const sinavlar = [...new Set(dersSorulari.map(s => s.sinav || 'Genel'))];
    res.json(sinavlar);
  } catch (error) {
    res.status(500).json({ hata: 'Sınavlar alınamadı' });
  }
});

// SORULARI GETİR (Filtreli)
app.get('/api/sorular', (req, res) => {
  try {
    const { ders, sinav } = req.query;

    if (fs.existsSync(SORULAR_DOSYASI)) {
      let sorular = JSON.parse(fs.readFileSync(SORULAR_DOSYASI, 'utf8'));

      // Filtreleme
      if (ders) {
        sorular = sorular.filter(s => (s.ders || 'Genel') === ders);
      }
      if (sinav) {
        sorular = sorular.filter(s => (s.sinav || 'Genel') === sinav);
      }

      res.json({ sorular, toplam: sorular.length });
    } else {
      res.json({ sorular: [], toplam: 0 });
    }
  } catch (error) {
    console.error('Sorular getirme hatası:', error);
    res.status(500).json({ hata: 'Sorular yüklenemedi!' });
  }
});

// Rastgele N soru getir
app.get('/api/rastgele-sorular/:adet?', (req, res) => {
  try {
    if (!fs.existsSync(SORULAR_DOSYASI)) {
      return res.json({ sorular: [], cevaplar: {} });
    }

    let sorular = JSON.parse(fs.readFileSync(SORULAR_DOSYASI, 'utf8'));
    const adet = parseInt(req.params.adet) || sorular.length;

    // Query parametreleri: tip, ders, sinav
    const { tip, ders, sinav } = req.query;

    // Filtreleme
    if (ders) sorular = sorular.filter(s => (s.ders || 'Genel') === ders);
    if (sinav) sorular = sorular.filter(s => (s.sinav || 'Genel') === sinav);
    if (tip && tip !== 'tumu') sorular = sorular.filter(soru => soru.tip === tip);

    if (sorular.length === 0) {
      return res.json({ sorular: [], cevaplar: {} });
    }

    // Karıştır ve al
    const karisikSorular = [...sorular]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(adet, sorular.length));

    const cevapsizSorular = karisikSorular.map(soru => {
      const { dogruCevap, ...soruBilgisi } = soru;
      return soruBilgisi;
    });

    res.json({
      sorular: cevapsizSorular,
      toplam: karisikSorular.length,
      cevaplar: karisikSorular.reduce((acc, soru) => {
        acc[soru.id] = soru.dogruCevap;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Rastgele sorular getirme hatası:', error);
    res.status(500).json({ hata: 'Sorular yüklenemedi!' });
  }
});

// Özel Sınav: Seçilen sayıda soru tipleri ile
app.post('/api/custom-quiz', (req, res) => {
  try {
    if (!fs.existsSync(SORULAR_DOSYASI)) {
      return res.json({ sorular: [], cevaplar: {} });
    }

    const { multipleChoice = 0, classic = 0, blankFill = 0 } = req.body;
    let sorular = JSON.parse(fs.readFileSync(SORULAR_DOSYASI, 'utf8'));

    // Soru tiplerini ayır
    const coktan = sorular.filter(s => s.tip === 'coktan-secmeli');
    const klasik = sorular.filter(s => s.tip === 'klasik');
    const acikUclu = sorular.filter(s => s.tip === 'bosluk-doldurma');

    // Rastgele seç
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const secilenSorular = [
      ...shuffle(coktan).slice(0, multipleChoice),
      ...shuffle(klasik).slice(0, classic),
      ...shuffle(acikUclu).slice(0, blankFill)
    ];

    if (secilenSorular.length === 0) {
      return res.json({ sorular: [], cevaplar: {} });
    }

    // Seçilen soruları karıştır
    const karisikSorular = shuffle(secilenSorular);

    const cevapsizSorular = karisikSorular.map(soru => {
      const { dogruCevap, ...soruBilgisi } = soru;
      return soruBilgisi;
    });

    res.json({
      sorular: cevapsizSorular,
      toplam: karisikSorular.length,
      cevaplar: karisikSorular.reduce((acc, soru) => {
        acc[soru.id] = soru.dogruCevap;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Custom quiz hatası:', error);
    res.status(500).json({ hata: 'Özel sınav oluşturulamadı!' });
  }
});

// Sistem sıfırlama: uploads klasörünü temizle ve tüm soruları sil
app.post('/api/reset', (req, res) => {
  try {
    let deletedFiles = 0;
    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR);
      files.forEach((f) => {
        const fp = path.join(UPLOADS_DIR, f);
        try {
          fs.unlinkSync(fp);
          deletedFiles += 1;
        } catch (_) {}
      });
    }

    fs.writeFileSync(SORULAR_DOSYASI, JSON.stringify([], null, 2));

    res.json({ mesaj: 'Sistem sıfırlandı.', silinenDosya: deletedFiles, kalanSoru: 0 });
  } catch (error) {
    res.status(500).json({ hata: 'Sıfırlama başarısız.', detay: error.message });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Backend sunucu http://localhost:${PORT} adresinde çalışıyor!`);
});
