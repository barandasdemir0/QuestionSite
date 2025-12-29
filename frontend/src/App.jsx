import { Routes, Route, useEffect } from 'react-router-dom'
import axios from 'axios'
import DersSecimi from './pages/DersSecimi'
import SinavSecimi from './pages/SinavSecimi'
import AnaSayfa from './pages/AnaSayfa'
import TestEkrani from './pages/TestEkrani'
import SonucEkrani from './pages/SonucEkrani'
import TopluSinav from './pages/TopluSinav'

function App() {
  // Keep-alive: Her 10 dakikada bir backend'e ping at (Render sleep'i engellemek için)
  useEffect(() => {
    const keepAlive = setInterval(() => {
      axios.get('https://questionsite.onrender.com/api/ping').catch(() => {});
    }, 10 * 60 * 1000); // 10 dakika

    return () => clearInterval(keepAlive);
  }, []);

  return (
    <Routes>
      {/* 1. Ders Seçimi (Ana Giriş) */}
      <Route path="/" element={<DersSecimi />} />

      {/* 2. Sınav Seçimi (Vize / Final) */}
      <Route path="/ders/:dersId" element={<SinavSecimi />} />

      {/* 3. Test Ekranı (Soru Tipi Seçimi) */}
      <Route path="/ders/:dersId/:sinavTipi" element={<AnaSayfa />} />

      {/* 3.5. Özel Sınav (Toplu Sınav Ayarları) */}
      <Route path="/toplu-sinav" element={<TopluSinav />} />

      {/* 4. Sınav/Quiz Aşaması */}
      <Route path="/test" element={<TestEkrani />} />

      {/* 5. Sonuçlar */}
      <Route path="/sonuc" element={<SonucEkrani />} />
    </Routes>
  )
}

export default App
