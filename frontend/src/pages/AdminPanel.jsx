import { useState, useRef } from 'react';
import { Upload, Trash2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import axios from 'axios';

function AdminPanel() {
    // Yükleme State'leri
    const [dersAdi, setDersAdi] = useState('');
    const [sinavTipi, setSinavTipi] = useState('Vize');
    const [dosya, setDosya] = useState(null);
    const [yuklemeDurumu, setYuklemeDurumu] = useState(null); // 'yukleniyor', 'basarili', 'hata'
    const [log, setLog] = useState('');

    // Silme State'leri
    const [silinecekDers, setSilinecekDers] = useState('');
    const [silinecekSinav, setSilinecekSinav] = useState('');

    const dosyaYukle = async (e) => {
        e.preventDefault();
        if (!dosya || !dersAdi) {
            alert("Lütfen tüm alanları doldurun!");
            return;
        }

        const formData = new FormData();
        formData.append('dosya', dosya);
        formData.append('ders', dersAdi);
        formData.append('sinav', sinavTipi);

        setYuklemeDurumu('yukleniyor');

        try {
            const res = await axios.post('https://questionsite.onrender.com/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setYuklemeDurumu('basarili');
            setLog(`Başarılı! ${res.data.eklenenDers} dersine ${res.data.toplamSoru} soru eklendi.`);
            // Reset form
            setDosya(null);
        } catch (err) {
            setYuklemeDurumu('hata');
            setLog('Hata: ' + (err.response?.data?.detay || err.message));
        }
    };

    const sorulariSil = async () => {
        if (!window.confirm("Seçilen kriterlere uyan TÜM sorular silinecek. Emin misiniz?")) return;

        try {
            const res = await axios.post('https://questionsite.onrender.com/api/sorulari-sil', {
                ders: silinecekDers || undefined,
                sinav: silinecekSinav || undefined
            });
            alert(`Temizlendi! ${res.data.silinen} soru silindi. Kalan: ${res.data.kalan}`);
        } catch (err) {
            alert("Hata oluştu.");
        }
    }

    const sistemiSifirla = async () => {
        if (!window.confirm("Uploads klasörü ve tüm sorular temizlenecek. Emin misiniz?")) return;
        try {
            const res = await axios.post('https://questionsite.onrender.com/api/reset');
            alert(`Sistem sıfırlandı! Silinen dosya: ${res.data.silinenDosya}, kalan soru: ${res.data.kalanSoru}`);
        } catch (err) {
            alert("Sıfırlama sırasında hata oluştu.");
        }
    }

    return (
        <div className="min-h-screen p-8 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-white mb-8 border-b border-white/20 pb-4 w-full max-w-4xl text-center">
                Yönetici Paneli
            </h1>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl">

                {/* YÜKLEME KARTI */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <Upload className="w-6 h-6 mr-2" /> Soru Yükle
                    </h2>

                    <form onSubmit={dosyaYukle} className="space-y-6">
                        <div>
                            <label className="block text-white/80 mb-2 text-sm uppercase font-bold">Ders Adı</label>
                            <input
                                type="text"
                                placeholder="Örn: Robotik"
                                value={dersAdi}
                                onChange={(e) => setDersAdi(e.target.value)}
                                className="w-full bg-white/20 border-white/10 rounded-lg p-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2 text-sm uppercase font-bold">Sınav Tipi</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSinavTipi('Vize')}
                                    className={`p-3 rounded-lg border transition-all ${sinavTipi === 'Vize' ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white/10 border-white/20 text-white/60'}`}
                                >
                                    Vize
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSinavTipi('Final')}
                                    className={`p-3 rounded-lg border transition-all ${sinavTipi === 'Final' ? 'bg-purple-500 border-purple-400 text-white' : 'bg-white/10 border-white/20 text-white/60'}`}
                                >
                                    Final
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2 text-sm uppercase font-bold">Dosya (TXT / DOCX)</label>
                            <div className="relative border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:bg-white/5 transition-colors">
                                <input
                                    type="file"
                                    accept=".txt,.docx"
                                    onChange={(e) => setDosya(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="pointer-events-none">
                                    {dosya ? (
                                        <div className="text-green-400 font-bold flex items-center justify-center">
                                            <FileText className="w-6 h-6 mr-2" />
                                            {dosya.name}
                                        </div>
                                    ) : (
                                        <span className="text-white/60">Dosyayı buraya sürükleyin veya seçin</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={yuklemeDurumu === 'yukleniyor'}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                        >
                            {yuklemeDurumu === 'yukleniyor' ? 'Yükleniyor...' : 'YÜKLE'}
                        </button>

                        {yuklemeDurumu === 'basarili' && (
                            <div className="bg-green-500/20 text-green-200 p-4 rounded-lg flex items-center text-sm">
                                <CheckCircle className="w-5 h-5 mr-2 shrink-0" />
                                {log}
                            </div>
                        )}
                        {yuklemeDurumu === 'hata' && (
                            <div className="bg-red-500/20 text-red-200 p-4 rounded-lg flex items-center text-sm">
                                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                                {log}
                            </div>
                        )}
                    </form>
                </div>

                {/* SİLME KARTI */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl h-fit">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center text-red-300">
                        <Trash2 className="w-6 h-6 mr-2" /> Soruları Sil
                    </h2>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Ders Adı (Boş ise tüm dersler)"
                            value={silinecekDers}
                            onChange={(e) => setSilinecekDers(e.target.value)}
                            className="w-full bg-white/20 border-white/10 rounded-lg p-3 text-white placeholder-white/50"
                        />

                        <input
                            type="text"
                            placeholder="Sınav Tipi (Boş ise tüm sınavlar)"
                            value={silinecekSinav}
                            onChange={(e) => setSilinecekSinav(e.target.value)}
                            className="w-full bg-white/20 border-white/10 rounded-lg p-3 text-white placeholder-white/50"
                        />

                        <button
                            onClick={sorulariSil}
                            className="w-full bg-red-500/80 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg transition-colors border border-red-400"
                        >
                            SORULARI TEMİZLE
                        </button>
                        <p className="text-xs text-white/40 text-center">
                            Dikkat: Bu işlem geri alınamaz. Kriterlere uyan tüm sorular veritabanından silinir.
                        </p>

                        <div className="mt-6 border-t border-white/20 pt-6">
                            <button
                                onClick={sistemiSifirla}
                                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl shadow-lg transition-colors border border-red-600"
                            >
                                UYGULAMAYI TAMAMEN SIFIRLA
                            </button>
                            <p className="text-xs text-white/40 text-center mt-2">
                                Uploads klasörü temizlenir ve tüm sorular sıfırlanır.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminPanel;
