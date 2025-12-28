import { useLocation, useNavigate } from 'react-router-dom'
import { Trophy, Home, RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

function SonucEkrani() {
  const location = useLocation()
  const navigate = useNavigate()
  const [animasyon, setAnimasyon] = useState(false)

  const {
    dogruSayisi = 0,
    yanlisSayisi = 0,
    bosSayisi = 0,
    toplamSoru = 0,
    detayliSonuclar = [],
    atlananSorular = [],
    soruTipi
  } = location.state || {}

  const incelenecekSorular = detayliSonuclar.length > 0 ? detayliSonuclar : atlananSorular;
  const yanlisSorular = incelenecekSorular.filter(s => s.durum === 'yanlis');
  const bosSorular = incelenecekSorular.filter(s => s.durum === 'bos');
  const basariYuzdesi = toplamSoru > 0 ? Math.round((dogruSayisi / toplamSoru) * 100) : 0

  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }
    setTimeout(() => setAnimasyon(true), 100)
  }, [location.state, navigate])

  const getResultFeedback = () => {
    if (basariYuzdesi >= 90) return { title: 'Efsanesin!', subtitle: 'Mükemmel bir sonuç.', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' }
    if (basariYuzdesi >= 70) return { title: 'Harika İş!', subtitle: 'Çok iyi gidiyorsun.', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' }
    if (basariYuzdesi >= 50) return { title: 'Güzel!', subtitle: 'Ama daha iyisi olabilir.', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' }
    return { title: 'Pes Etme!', subtitle: 'Pratik yaparak gelişeceksin.', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' }
  }

  const feedback = getResultFeedback()

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-white">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/40 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className={`max-w-5xl w-full transition-all duration-700 transform ${animasyon ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

        {/* SCORE CARD */}
        <div className="relative mb-8 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] animate-pulse"></div>

          <div className={`inline-flex items-center justify-center p-8 rounded-full border-4 ${feedback.border} ${feedback.bg} backdrop-blur-md shadow-2xl mb-6 relative z-10`}>
            <Trophy size={64} className={feedback.color} />
          </div>

          <h1 className={`text-6xl font-black mb-2 ${feedback.color} drop-shadow-md`}>{feedback.title}</h1>
          <p className="text-white/60 text-xl font-light">{feedback.subtitle}</p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Doğru', count: dogruSayisi, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: CheckCircle },
            { label: 'Yanlış', count: yanlisSayisi, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
            { label: 'Boş', count: bosSayisi, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: AlertCircle },
            { label: 'Toplam', count: toplamSoru, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Trophy }
          ].map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${stat.bg} backdrop-blur-md text-center flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform`}>
              <stat.icon size={24} className={stat.color} />
              <span className={`text-4xl font-bold ${stat.color}`}>{stat.count}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* WRONG ANSWERS REVIEW */}
        {(yanlisSorular.length > 0 || bosSorular.length > 0) && (
          <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-8 h-96 overflow-y-auto custom-scrollbar shadow-xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-red-500 rounded-full"></span>
              Hatalı ve Boş Sorular
            </h3>
            <div className="space-y-4">
              {[...yanlisSorular, ...bosSorular].map((soru, index) => (
                <div key={index} className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-lg font-medium mb-4">{soru.soruMetni}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {soru.durum === 'yanlis' && (
                      <div className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30">
                        Sizin Cevabınız: <span className="font-bold text-white">{soru.verilenCevap}</span>
                      </div>
                    )}
                    {soru.durum === 'bos' && (
                      <div className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        Boş Bırakıldı
                      </div>
                    )}
                    <div className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30">
                      Doğru Cevap: <span className="font-bold text-white">{soru.dogruCevap}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/test', { state: { soruTipi, ders: location.state?.ders, sinav: location.state?.sinav } })}
            className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center gap-2 border border-white/10 transition-all"
          >
            <RotateCcw size={20} /> TEKRAR
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/50 transition-all hover:scale-105"
          >
            <Home size={20} /> ANA SAYFAYA DÖN
          </button>
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { bg: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { bg: rgba(255,255,255,0.2); }
      `}</style>

    </div>
  )
}

export default SonucEkrani
