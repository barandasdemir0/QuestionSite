import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, AlertCircle, X } from 'lucide-react'
import axios from 'axios'

function TopluSinav() {
  const navigate = useNavigate()
  const [multipleChoice, setMultipleChoice] = useState(0)
  const [classic, setClassic] = useState(0)
  const [blankFill, setBlankFill] = useState(0)
  const [loading, setLoading] = useState(true)

  // Maksimum değerler
  const [maxMultiple, setMaxMultiple] = useState(0)
  const [maxClassic, setMaxClassic] = useState(0)
  const [maxBlank, setMaxBlank] = useState(0)

  // Input modu
  const [editingMultiple, setEditingMultiple] = useState(false)
  const [editingClassic, setEditingClassic] = useState(false)
  const [editingBlank, setEditingBlank] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  const showError = (message) => {
    setModalMessage(message)
    setShowModal(true)
  }

  const handleNumberInput = (value, max, setter, editSetter) => {
    const num = parseInt(value) || 0
    const clamped = Math.min(Math.max(0, num), max)
    setter(clamped)
    editSetter(false)
  }

  useEffect(() => {
    // Tüm soruları getir ve tiplere göre ayır
    axios.get('http://localhost:5000/api/sorular')
      .then(response => {
        const sorular = response.data.sorular
        
        const multipleCount = sorular.filter(s => s.tip === 'coktan-secmeli').length
        const classicCount = sorular.filter(s => s.tip === 'klasik').length
        const blankCount = sorular.filter(s => s.tip === 'bosluk-doldurma').length

        setMaxMultiple(multipleCount)
        setMaxClassic(classicCount)
        setMaxBlank(blankCount)

        // İlk değerleri ayarla (hepsi 0'dan başlasın)
        setMultipleChoice(0)
        setClassic(0)
        setBlankFill(0)

        setLoading(false)
      })
      .catch(error => {
        console.error('Sorular getirilemedi:', error)
        setLoading(false)
      })
  }, [])

  const totalQuestions = multipleChoice + classic + blankFill

  const handleStart = async () => {
    if (totalQuestions === 0) {
      showError('En az 1 soru seçmelisiniz!')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/custom-quiz', {
        multipleChoice,
        classic,
        blankFill
      })

      if (response.data.sorular.length === 0) {
        showError('Seçilen soru sayısı kadar soru bulunamadı!')
        setLoading(false)
        return
      }

      navigate('/test', {
        state: {
          soruTipi: 'toplu-sinav',
          customSorular: response.data.sorular,
          customCevaplar: response.data.cevaplar
        }
      })
    } catch (error) {
      console.error('Hata:', error)
      showError('Sınav başlatılamadı!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 relative font-sans text-white overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-40 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-500"></div>
      </div>

      {loading ? (
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-white/60">Sorular yükleniyor...</p>
        </div>
      ) : (
        <div className="w-full max-w-2xl relative z-10">

          {/* Header */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-white/60 hover:text-white mb-8"
          >
            <ArrowLeft size={18} /> Geri Dön
          </button>

          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
              <Zap size={40} className="text-purple-400" />
            </div>
            <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Özel Sınav
            </h1>
            <p className="text-white/60 text-lg">Kendi sınav setini oluştur ve çöz</p>
          </div>

          {/* Form Card */}
          <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl mb-8">

          {/* Question Type Sliders */}
          <div className="space-y-8">

            {/* Çoktan Seçmeli */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-lg font-bold flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  Çoktan Seçmeli
                </label>
                {editingMultiple ? (
                  <input
                    type="number"
                    min="0"
                    max={maxMultiple}
                    value={multipleChoice}
                    onChange={(e) => setMultipleChoice(parseInt(e.target.value) || 0)}
                    onBlur={(e) => handleNumberInput(e.target.value, maxMultiple, setMultipleChoice, setEditingMultiple)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNumberInput(e.target.value, maxMultiple, setMultipleChoice, setEditingMultiple)}
                    autoFocus
                    className="w-20 text-3xl font-bold text-blue-400 bg-blue-900/30 border border-blue-500/50 rounded-lg px-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span 
                    onClick={() => setEditingMultiple(true)}
                    className="text-3xl font-bold text-blue-400 cursor-pointer hover:bg-blue-900/20 px-3 py-1 rounded-lg transition-colors"
                  >
                    {multipleChoice}
                  </span>
                )}
              </div>
              <input
                type="range"
                min="0"
                max={maxMultiple}
                value={multipleChoice}
                onChange={(e) => setMultipleChoice(parseInt(e.target.value))}
                className="w-full h-3 bg-blue-900/30 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${maxMultiple > 0 ? (multipleChoice / maxMultiple) * 100 : 0}%, rgb(30, 41, 59) ${maxMultiple > 0 ? (multipleChoice / maxMultiple) * 100 : 0}%, rgb(30, 41, 59) 100%)`
                }}
              />
              <p className="text-sm text-white/40">0 - {maxMultiple} arasında seç</p>
            </div>

            {/* Klasik/Boşluk Doldurma */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-lg font-bold flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  Klasik/Boşluk Doldurma
                </label>
                {editingClassic ? (
                  <input
                    type="number"
                    min="0"
                    max={maxClassic}
                    value={classic}
                    onChange={(e) => setClassic(parseInt(e.target.value) || 0)}
                    onBlur={(e) => handleNumberInput(e.target.value, maxClassic, setClassic, setEditingClassic)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNumberInput(e.target.value, maxClassic, setClassic, setEditingClassic)}
                    autoFocus
                    className="w-20 text-3xl font-bold text-orange-400 bg-orange-900/30 border border-orange-500/50 rounded-lg px-2 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <span 
                    onClick={() => setEditingClassic(true)}
                    className="text-3xl font-bold text-orange-400 cursor-pointer hover:bg-orange-900/20 px-3 py-1 rounded-lg transition-colors"
                  >
                    {classic}
                  </span>
                )}
              </div>
              <input
                type="range"
                min="0"
                max={maxClassic}
                value={classic}
                onChange={(e) => setClassic(parseInt(e.target.value))}
                className="w-full h-3 bg-orange-900/30 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, rgb(249, 115, 22) 0%, rgb(249, 115, 22) ${maxClassic > 0 ? (classic / maxClassic) * 100 : 0}%, rgb(30, 41, 59) ${maxClassic > 0 ? (classic / maxClassic) * 100 : 0}%, rgb(30, 41, 59) 100%)`
                }}
              />
              <p className="text-sm text-white/40">0 - {maxClassic} arasında seç</p>
            </div>

            {/* Açık Uçlu (Opsiyonel) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-lg font-bold flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Açık Uçlu
                </label>
                {editingBlank ? (
                  <input
                    type="number"
                    min="0"
                    max={maxBlank}
                    value={blankFill}
                    onChange={(e) => setBlankFill(parseInt(e.target.value) || 0)}
                    onBlur={(e) => handleNumberInput(e.target.value, maxBlank, setBlankFill, setEditingBlank)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNumberInput(e.target.value, maxBlank, setBlankFill, setEditingBlank)}
                    autoFocus
                    className="w-20 text-3xl font-bold text-green-400 bg-green-900/30 border border-green-500/50 rounded-lg px-2 text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <span 
                    onClick={() => setEditingBlank(true)}
                    className="text-3xl font-bold text-green-400 cursor-pointer hover:bg-green-900/20 px-3 py-1 rounded-lg transition-colors"
                  >
                    {blankFill}
                  </span>
                )}
              </div>
              <input
                type="range"
                min="0"
                max={maxBlank}
                value={blankFill}
                onChange={(e) => setBlankFill(parseInt(e.target.value))}
                className="w-full h-3 bg-green-900/30 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${maxBlank > 0 ? (blankFill / maxBlank) * 100 : 0}%, rgb(30, 41, 59) ${maxBlank > 0 ? (blankFill / maxBlank) * 100 : 0}%, rgb(30, 41, 59) 100%)`
                }}
              />
              <p className="text-sm text-white/40">0 - {maxBlank} arasında seç</p>
            </div>

          </div>

          {/* Divider */}
          <div className="my-8 border-t border-white/10"></div>

          {/* Summary */}
          <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Toplam Soru</p>
                <p className="text-4xl font-bold text-purple-400">{totalQuestions}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Durum</p>
                <p className={`text-lg font-bold ${totalQuestions === 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {totalQuestions === 0 ? '❌ Seçim gerekli' : '✓ Hazır'}
                </p>
              </div>
            </div>
            <div className="text-xs text-white/50 text-center">
              Sorular her seferinde rastgele seçilecektir
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={totalQuestions === 0 || loading}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all ${
              totalQuestions === 0 || loading
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/50 hover:scale-105 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Hazırlanıyor...
              </>
            ) : (
              <>
                <Zap size={24} /> SINAVI BAŞLAT
              </>
            )}
          </button>

          </div>
        </div>
      )}

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        /* Number input spinner'ları gizle */
        input[type='number']::-webkit-outer-spin-button,
        input[type='number']::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Error Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>
          
          {/* Modal Card */}
          <div className="relative bg-gradient-to-br from-red-900/90 to-red-950/90 backdrop-blur-md border-2 border-red-500/50 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-red-900/50 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/20 rounded-full border-2 border-red-500/50">
                <AlertCircle size={48} className="text-red-400" />
              </div>
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              Hata!
            </h2>
            <p className="text-white/80 text-center text-lg mb-8">
              {modalMessage}
            </p>

            {/* OK Button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopluSinav
