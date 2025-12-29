import { useNavigate, useParams, Link } from 'react-router-dom'
import { BookOpen, ArrowLeft, Star, Edit3, PenTool, CheckCircle, HelpCircle, AlertTriangle, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import axios from 'axios'

function AnaSayfa() {
  const navigate = useNavigate()
  const { dersId, sinavTipi } = useParams();

  const [soruSayisi, setSoruSayisi] = useState(0)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [uyariModal, setUyariModal] = useState(false)

  const dersAdi = decodeURIComponent(dersId || '');
  const sinavAdi = decodeURIComponent(sinavTipi || '');

  useEffect(() => {
    sorulariGetir()
  }, [dersId, sinavTipi])

  const sorulariGetir = () => {
    axios.get('https://questionsite.onrender.com/api/sorular', {
      params: { ders: dersAdi, sinav: sinavAdi }
    })
      .then(response => {
        setSoruSayisi(response.data.toplam)
        setYukleniyor(false)
      })
      .catch(error => {
        console.error('Soru sayısı alınamadı:', error)
        setYukleniyor(false)
      })
  }

  const testeBasla = (soruTipi) => {
    if (soruSayisi === 0) {
      setUyariModal(true)
      return
    }
    navigate('/test', {
      state: { soruTipi, ders: dersAdi, sinav: sinavAdi }
    })
  }

  return (
    <div className="min-h-screen flex flex-col p-4 relative bg-[#0f172a] overflow-hidden text-white font-sans">

      {/* UYARI MODAL */}
      {uyariModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1e1b4b] border border-orange-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>

            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-400 animate-pulse">
              <AlertTriangle size={40} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">Henüz Soru Yok!</h3>
            <p className="text-white/60 mb-8 leading-relaxed">
              Bu kategoride soru bulunmuyor. Lütfen yönetim panelinden soru ekleyin veya başka bir kategori deneyin.
            </p>

            <button
              onClick={() => setUyariModal(false)}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-900/40 transition-all active:scale-[0.98]"
            >
              ANLADIM
            </button>
          </div>
        </div>
      )}

      {/* BACKGROUND BLOBS */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl w-full mx-auto relative z-10 flex-1 flex flex-col items-center justify-center">

        {/* HEADER & NAV */}
        <div className="absolute top-0 left-0 w-full py-6 px-4 flex justify-between items-center">
          <Link to={`/ders/${dersId}`} className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md">
            <ArrowLeft size={18} className="text-white/60 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            <span className="text-white/80 font-medium group-hover:text-white">Sınav Seçimine Dön</span>
          </Link>
        </div>

        {/* HERO SECTION */}
        <div className="text-center mb-16 animate-fade-in-down">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg shadow-indigo-500/30 ring-4 ring-white/5">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-purple-200 mb-2 drop-shadow-sm">
            {dersAdi}
          </h1>
          <h2 className="text-3xl font-bold text-indigo-300 mb-6 flex items-center justify-center gap-2">
            <span className="bg-indigo-500/20 px-4 py-1 rounded-full border border-indigo-500/30 text-indigo-300">{sinavAdi} Sınavı</span>
          </h2>

          {/* STATS */}
          {!yukleniyor && (
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-white/80 font-medium">{soruSayisi} Soru Hazır</span>
            </div>
          )}
        </div>

        {/* CARDS GRID */}
        <div className="grid md:grid-cols-3 gap-8 w-full px-4">

          {/* Çoktan Seçmeli */}
          <button
            onClick={() => testeBasla('coktan-secmeli')}
            disabled={soruSayisi === 0 || yukleniyor}
            className={`
              group relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center transition-all duration-300 border border-white/10
              ${soruSayisi === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-800/50'
                : 'bg-gradient-to-br from-[#1e1b4b] to-[#312e81] hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.5)] cursor-pointer'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50 group-hover:rotate-6 transition-transform">
                <CheckCircle size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Çoktan Seçmeli</h3>
              <p className="text-white/50 text-sm">Klasik test formatı. Şıklar arasından doğruyu bul.</p>
            </div>
          </button>

          {/* Boşluk Doldurma */}
          <button
            onClick={() => testeBasla('bosluk-doldurma')}
            disabled={soruSayisi === 0 || yukleniyor}
            className={`
              group relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center transition-all duration-300 border border-white/10
              ${soruSayisi === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-800/50'
                : 'bg-gradient-to-br from-[#2e1065] to-[#581c87] hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(147,51,234,0.5)] cursor-pointer'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-900/50 group-hover:rotate-6 transition-transform">
                <Edit3 size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Boşluk Doldurma</h3>
              <p className="text-white/50 text-sm">Cümledeki eksik kelimeleri tamamla.</p>
            </div>
          </button>

          {/* Klasik */}
          <button
            onClick={() => testeBasla('klasik')}
            disabled={soruSayisi === 0 || yukleniyor}
            className={`
              group relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center transition-all duration-300 border border-white/10
              ${soruSayisi === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-800/50'
                : 'bg-gradient-to-br from-[#451a03] to-[#78350f] hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(234,88,12,0.5)] cursor-pointer'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 shadow-lg shadow-orange-900/50 group-hover:rotate-6 transition-transform">
                <HelpCircle size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Klasik Sorular</h3>
              <p className="text-white/50 text-sm">Kendini dene, cevabı gör.</p>
            </div>
          </button>

          {/* Özel Sınav */}
          <button
            onClick={() => navigate('/toplu-sinav')}
            className="group relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center transition-all duration-300 border border-white/10 md:col-span-3 bg-gradient-to-br from-[#7f1d1d] to-[#991b1b] hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.5)] cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mb-6 shadow-lg shadow-red-900/50 group-hover:rotate-6 transition-transform">
                <Zap size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Özel Sınav</h3>
              <p className="text-white/50 text-sm">Kendi soru dağılımını ayarla ve toplu sınava gir.</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  )
}

export default AnaSayfa
