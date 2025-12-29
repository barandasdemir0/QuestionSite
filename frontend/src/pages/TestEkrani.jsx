import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, ChevronLeft, Eye, AlertTriangle, LogOut, CheckSquare } from 'lucide-react'
import axios from 'axios'
import { API } from '../config'

function TestEkrani() {
  const navigate = useNavigate()
  const location = useLocation()
  const soruTipi = location.state?.soruTipi || 'tumu'

  // State
  const [sorular, setSorular] = useState([])
  const [mevcutSoruIndex, setMevcutSoruIndex] = useState(0)
  const [kullaniciCevabi, setKullaniciCevabi] = useState('')
  const [secilenHarf, setSecilenHarf] = useState(null) // Çoktan seçmeli için seçilen harfi takip et
  const [cevapVerildi, setCevapVerildi] = useState(false)
  const [cevapSonucu, setCevapSonucu] = useState(null)
  const [cevapGosterildi, setCevapGosterildi] = useState(false) // Klasik/boşluk doldurma için doğrudan gösterildi mi?

  const [tumCevaplar, setTumCevaplar] = useState({})
  const [cevaplar, setCevaplar] = useState({})
  const [yukleniyor, setYukleniyor] = useState(true)

  // Custom UI States
  const [uyari, setUyari] = useState(null)
  const [cikisModalAcik, setCikisModalAcik] = useState(false)
  const [bitirModalAcik, setBitirModalAcik] = useState(false)

  const uyariGoster = (mesaj, tur = 'hata') => {
    setUyari({ mesaj, tur })
    setTimeout(() => setUyari(null), 3000)
  }

  useEffect(() => {
    // Filtreleri al
    const ders = location.state?.ders
    const sinav = location.state?.sinav
    const customSorular = location.state?.customSorular
    const customCevaplar = location.state?.customCevaplar

    // Özel sınav modundan gelen sorular varsa direkt kullan
    if (customSorular && customCevaplar) {
      // Şıkları karıştır
      const shuffle = (arr) => {
        const a = [...arr]
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[a[i], a[j]] = [a[j], a[i]]
        }
        return a
      }

      const letters = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
      const karisikSorular = customSorular.map((soru) => {
        if (soru.tip === 'coktan-secmeli' && Array.isArray(soru.siklar)) {
          const shuffled = shuffle(soru.siklar).map((sik, idx) => ({
            ...sik,
            orijinalHarf: sik.harf,
            harf: letters[idx] || sik.harf
          }))
          return { ...soru, siklar: shuffled }
        }
        return soru
      })

      setSorular(karisikSorular)
      setCevaplar(customCevaplar)
      setYukleniyor(false)
      return
    }

    axios.get(API.RASTGELE_SORULAR(soruTipi), {
      params: { ders, sinav }
    })
      .then(response => {
        if (response.data.sorular.length === 0) {
          navigate('/')
          return
        }
        // Şıkları her soruda karıştır (sadece çoktan seçmeli)
        const shuffle = (arr) => {
          const a = [...arr]
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[a[i], a[j]] = [a[j], a[i]]
          }
          return a
        }

        const letters = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        const karisikSorular = response.data.sorular.map((soru) => {
          if (soru.tip === 'coktan-secmeli' && Array.isArray(soru.siklar)) {
            const shuffled = shuffle(soru.siklar).map((sik, idx) => ({
              ...sik,
              orijinalHarf: sik.harf,
              harf: letters[idx] || sik.harf
            }))
            return { ...soru, siklar: shuffled }
          }
          return soru
        })

        setSorular(karisikSorular)
        setCevaplar(response.data.cevaplar)
        setYukleniyor(false)
      })
      .catch(error => {
        console.error(error)
        navigate('/')
      })
  }, [navigate, soruTipi, location.state])

  // Soru değiştiğinde state restoration
  useEffect(() => {
    const kayitliCevap = tumCevaplar[mevcutSoruIndex]
    if (kayitliCevap) {
      setKullaniciCevabi(kayitliCevap.cevap)
      setCevapVerildi(true)
      setCevapGosterildi(!!kayitliCevap.gosterildi)
      const mevcutSoru = sorular[mevcutSoruIndex]
      const dogruCevap = cevaplar[mevcutSoru.id]

      // Çoktan seçmeli sorular için harfi geri bul
      if (mevcutSoru.tip === 'coktan-secmeli') {
        const secilenSik = mevcutSoru.siklar.find(s => s.metin === kayitliCevap.cevap)
        setSecilenHarf(secilenSik ? secilenSik.orijinalHarf : null)
      } else {
        setSecilenHarf(null)
      }

      setCevapSonucu({ dogru: kayitliCevap.dogruMu, dogruCevap })
    } else {
      setKullaniciCevabi('')
      setSecilenHarf(null)
      setCevapVerildi(false)
      setCevapGosterildi(false)
      setCevapSonucu(null)
    }
  }, [mevcutSoruIndex, sorular, tumCevaplar]) // Deps simplified

  const mevcutSoru = sorular[mevcutSoruIndex]
  const isKlasik = soruTipi === 'klasik' || mevcutSoru?.tip === 'bosluk-doldurma'

  const cevabiGoster = () => {
    const dogruCevap = cevaplar[mevcutSoru.id]
    setCevapVerildi(true)
    // Göster butonu ile görülen cevap DOĞRU sayılmamalı, "boş" olarak işaretlenmeli
    setCevapSonucu({ dogru: false, dogruCevap, mesaj: dogruCevap })
    setCevapGosterildi(true)
    setTumCevaplar(prev => ({ ...prev, [mevcutSoruIndex]: { cevap: dogruCevap, dogruMu: false, bos: true, gosterildi: true } }))
  }

  const cevabiKontrolEt = (secilenCevap = null) => {
    const cevap = secilenCevap || kullaniciCevabi
    if (!cevap || !cevap.trim()) {
      uyariGoster('Bir cevap seçin!')
      return
    }
    setKullaniciCevabi(cevap)
    const dogruCevap = cevaplar[mevcutSoru.id]
    const dogruMu = cevap.toString().toLowerCase().trim() === dogruCevap.toString().toLowerCase().trim()

    setCevapVerildi(true)
    setCevapSonucu({ dogru: dogruMu, dogruCevap })
    setCevapGosterildi(false)
    
    // Çoktan seçmeli sorular için şık metnini kaydet ve harfi takip et
    let kayitCevap = cevap
    if (mevcutSoru.tip === 'coktan-secmeli') {
      setSecilenHarf(cevap)
      const secilenSik = mevcutSoru.siklar.find(s => s.orijinalHarf === cevap)
      if (secilenSik) {
        kayitCevap = secilenSik.metin
      }
    }
    
    setTumCevaplar(prev => ({ ...prev, [mevcutSoruIndex]: { cevap: kayitCevap, dogruMu, bos: false, gosterildi: false } }))
  }

  const sonrakiSoru = () => {
    if (!cevapVerildi) {
      setTumCevaplar(prev => ({ ...prev, [mevcutSoruIndex]: { cevap: '', dogruMu: false, bos: true } }))
    }
    if (mevcutSoruIndex === sorular.length - 1) {
      testiBitir()
    } else {
      setMevcutSoruIndex(prev => prev + 1)
      setUyari(null)
    }
  }

  const testiBitir = () => {
    const guncelCevaplar = { ...tumCevaplar }
    if (!cevapVerildi && !guncelCevaplar[mevcutSoruIndex]) {
      guncelCevaplar[mevcutSoruIndex] = { cevap: '', dogruMu: false, bos: true }
    }

    let d = 0, y = 0, b = 0
    const detayliSonuclar = []

    sorular.forEach((soru, index) => {
      const info = guncelCevaplar[index]
      let durum = 'bos'
      if (info) {
        if (info.bos) { b++; durum = 'bos' }
        else if (info.dogruMu) { d++; durum = 'dogru' }
        else { y++; durum = 'yanlis' }
      } else { b++ } // Hiç açılmadıysa

      if (durum !== 'dogru') {
        detayliSonuclar.push({ ...soru, durum, verilenCevap: info?.cevap || '', dogruCevap: cevaplar[soru.id] })
      }
    })

    navigate('/sonuc', {
      state: { dogruSayisi: d, yanlisSayisi: y, bosSayisi: b, toplamSoru: sorular.length, detayliSonuclar, soruTipi }
    })
  }

  if (yukleniyor) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Sorular Hazırlanıyor...</div>

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 relative font-sans text-white overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-40 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-500"></div>
      </div>

      {/* ALERT */}
      {uyari && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-red-500/90 backdrop-blur px-6 py-3 rounded-xl shadow-xl border border-red-400/50 flex items-center gap-2 text-white font-bold">
            <AlertTriangle size={20} />
            {uyari.mesaj}
          </div>
        </div>
      )}

      {/* MODALS */}
      {(cikisModalAcik || bitirModalAcik) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1e1b4b] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            {cikisModalAcik ? (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400"><LogOut /></div>
                <h3 className="text-xl font-bold mb-2">Çıkış Yap</h3>
                <p className="text-white/60 mb-6 text-sm">Testiniz iptal edilecek. Emin misiniz?</p>
                <div className="flex gap-3">
                  <button onClick={() => setCikisModalAcik(false)} className="flex-1 py-3 bg-white/5 rounded-xl font-bold text-white/50 hover:text-white transition-colors">Vazgeç</button>
                  <button onClick={() => navigate('/')} className="flex-1 py-3 bg-red-600 rounded-xl font-bold text-white shadow-lg shadow-red-900/40 hover:bg-red-500">Çıkış</button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400"><CheckSquare /></div>
                <h3 className="text-xl font-bold mb-2">Testi Bitir</h3>
                <p className="text-white/60 mb-6 text-sm">Sonuçları görmeye hazır mısın?</p>
                <div className="flex gap-3">
                  <button onClick={() => setBitirModalAcik(false)} className="flex-1 py-3 bg-white/5 rounded-xl font-bold text-white/50 hover:text-white transition-colors">Devam Et</button>
                  <button onClick={testiBitir} className="flex-1 py-3 bg-green-600 rounded-xl font-bold text-white shadow-lg shadow-green-900/40 hover:bg-green-500">Bitir</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-4xl relative z-10 flex flex-col h-[85vh]">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCikisModalAcik(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-white/60 hover:text-white">
            <ArrowLeft size={18} /> Çıkış
          </button>
          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 text-white/80 font-mono text-sm">
            SORU {mevcutSoruIndex + 1} / {sorular.length}
          </div>
          <button onClick={() => setBitirModalAcik(true)} className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-full border border-green-500/30 transition-colors text-sm font-bold">
            BİTİR
          </button>
        </div>

        {/* Question Area */}
        <div className="flex-1 bg-[#1e293b]/60 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-y-auto flex flex-col">

          {/* Soru Metni */}
          <div className="mb-8 flex-shrink-0">
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 border ${isKlasik ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'}`}>
              {isKlasik ? 'Klasik Soru' : 'Çoktan Seçmeli'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold leading-normal text-white">
              {mevcutSoru.soruMetni}
            </h2>
          </div>

          {/* İçerik (Şıklar) */}
          <div className="flex-1 flex flex-col justify-center">
            {mevcutSoru.tip === 'coktan-secmeli' ? (
              <div className="grid gap-4">
                {mevcutSoru.siklar.map((sik) => {
                  // Durum belirleme
                  let stil = "bg-white/5 border-white/10 text-white hover:bg-white/10";
                  if (cevapVerildi) {
                    if (sik.orijinalHarf === cevapSonucu.dogruCevap) stil = "bg-green-500/20 border-green-500 text-green-400";
                    else if (sik.orijinalHarf === secilenHarf) stil = "bg-red-500/20 border-red-500 text-red-400";
                    else stil = "bg-black/20 border-transparent text-white/30";
                  }
                  else if (sik.orijinalHarf === secilenHarf) {
                    stil = "bg-blue-500/20 border-blue-500 text-blue-300";
                  }

                  return (
                    <button
                      key={sik.harf}
                      onClick={() => !cevapVerildi && cevabiKontrolEt(sik.orijinalHarf)}
                      disabled={cevapVerildi}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group ${stil}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${cevapVerildi && sik.orijinalHarf === cevapSonucu.dogruCevap ? 'bg-green-500 border-green-500 text-[#0f172a]' : 'bg-white/10 border-white/10'}`}>
                        {sik.harf}
                      </div>
                      <span className="font-medium text-lg">{sik.metin}</span>
                    </button>
                  )
                })}
              </div>
            ) : isKlasik ? (
              <div className="space-y-4">
                <input
                  type="text"
                  disabled={cevapVerildi}
                  value={kullaniciCevabi}
                  onChange={(e) => setKullaniciCevabi(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && cevabiKontrolEt()}
                  placeholder="Cevabınızı buraya yazın..."
                  className={`w-full bg-black/20 border-2 rounded-2xl p-6 text-xl text-white outline-none focus:border-blue-500 transition-colors ${cevapVerildi ? (cevapGosterildi ? 'border-orange-500 bg-orange-500/10' : (cevapSonucu.dogru ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10')) : 'border-orange-500/30'}`}
                />
                {cevapVerildi && (
                  <div className={`bg-[#0f172a]/50 p-6 rounded-xl border-l-4 animate-fade-in font-mono text-sm md:text-base ${cevapGosterildi ? 'border-orange-500 text-orange-100' : (cevapSonucu.dogru ? 'border-green-500 text-green-100' : 'border-red-500 text-red-100')}`}>
                    Doğru Cevap: {cevapSonucu.dogruCevap}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  disabled={cevapVerildi}
                  value={kullaniciCevabi}
                  onChange={(e) => setKullaniciCevabi(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && cevabiKontrolEt()}
                  placeholder="Cevabınızı buraya yazın..."
                  className={`w-full bg-black/20 border-2 rounded-2xl p-6 text-xl text-white outline-none focus:border-blue-500 transition-colors ${cevapVerildi ? (cevapSonucu.dogru ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10') : 'border-white/10'}`}
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex gap-4 pt-6 border-t border-white/10">
            <button
              onClick={() => setMevcutSoruIndex(prev => Math.max(0, prev - 1))}
              disabled={mevcutSoruIndex === 0}
              className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft />
            </button>

            {!cevapVerildi ? (
              isKlasik ? (
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => cevabiKontrolEt()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98] py-4"
                  >
                    Kontrol Et
                  </button>
                  <button
                    onClick={cevabiGoster}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/40 transition-all active:scale-[0.98] py-4 flex items-center justify-center gap-2"
                  >
                    <Eye size={18} /> Cevabı Göster
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => cevabiKontrolEt()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98] py-4"
                >
                  Kontrol Et
                </button>
              )
            ) : (
              <div className={`flex-1 flex items-center gap-3 px-6 rounded-xl font-bold ${cevapSonucu.dogru ? 'bg-green-500/20 text-green-400' : cevapGosterildi && isKlasik ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                {cevapGosterildi && isKlasik ? <Eye /> : (cevapSonucu.dogru ? <CheckCircle /> : <XCircle />)}
                <span>{cevapGosterildi && isKlasik ? 'Cevabı İncele' : (cevapSonucu.dogru ? 'Doğru Bildin!' : 'Yanlış Cevap')}</span>
              </div>
            )}

            <button
              onClick={sonrakiSoru}
              className="px-8 py-4 bg-white text-[#0f172a] hover:bg-white/90 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-white/10 transition-colors"
            >
              <span>{mevcutSoruIndex === sorular.length - 1 ? 'Sonuç' : 'Sonraki'}</span>
              <ChevronRight size={20} />
            </button>
          </div>

        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((mevcutSoruIndex + 1) / sorular.length) * 100}%` }}></div>
        </div>

      </div>
    </div>
  )
}

export default TestEkrani
