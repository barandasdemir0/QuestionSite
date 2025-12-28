import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ChevronRight, GraduationCap, Upload, Trash2, CheckCircle, AlertTriangle, FileText, Settings, X, Plus, RefreshCcw } from 'lucide-react';
import axios from 'axios';

function DersSecimi() {
    const navigate = useNavigate();
    const [dersler, setDersler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);

    // Admin / Yönetim Modu State'leri
    const [yonetimAcik, setYonetimAcik] = useState(false);
    const [dersAdi, setDersAdi] = useState('');
    const [sinavTipi, setSinavTipi] = useState('Vize');
    const [dosya, setDosya] = useState(null);
    const [yuklemeDurumu, setYuklemeDurumu] = useState(null);

    // Modallar
    const [modal, setModal] = useState({ type: null, message: '' }); // type: 'success', 'confirm-delete', 'confirm-reset'
    const [silinecekDers, setSilinecekDers] = useState('');
    const [silinecekSinav, setSilinecekSinav] = useState('');

    const dersleriGetir = () => {
        axios.get('http://localhost:5000/api/dersler')
            .then(res => {
                // "Genel" ve boş dersleri filtrele
                const filtrelenmis = res.data.filter(d => d && d !== 'Genel');
                setDersler(filtrelenmis);
                setYukleniyor(false);
            })
            .catch(err => {
                console.error(err);
                setYukleniyor(false);
            });
    }

    useEffect(() => {
        dersleriGetir();
    }, []);

    const dosyaYukle = async (e) => {
        e.preventDefault();
        if (!dosya || !dersAdi) {
            setModal({ type: 'error', message: 'Lütfen tüm alanları doldurun!' });
            setTimeout(() => setModal({ type: null, message: '' }), 3000);
            return;
        }

        const formData = new FormData();
        formData.append('dosya', dosya);
        formData.append('ders', dersAdi);
        formData.append('sinav', sinavTipi);

        setYuklemeDurumu('yukleniyor');

        try {
            const res = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setYuklemeDurumu('basarili');
            setModal({ type: 'success', message: `${res.data.eklenenDers} dersine başarıyla soru eklendi! 🎉` });

            // Form alanlarını temizle
            setDosya(null);
            setDersAdi('');
            setSinavTipi('Vize');

            dersleriGetir();

            setTimeout(() => {
                setYuklemeDurumu(null);
                setModal({ type: null, message: '' });
                setYonetimAcik(false);
            }, 2000);

        } catch (err) {
            setYuklemeDurumu('hata');
            setModal({ type: 'error', message: 'Hata: ' + (err.response?.data?.detay || err.message) });
            setTimeout(() => setModal({ type: null, message: '' }), 4000);
        }
    };

    const islemYap = async (ozelIslem) => {
        try {
            if (ozelIslem === 'sifirla') {
                await axios.post('http://localhost:5000/api/sorulari-sil', {}); // Body boş gidince hepsi siliniyor backend mantığına göre
                setModal({ type: 'success', message: 'Tüm uygulama verileri başarıyla sıfırlandı! 🗑️' });
            } else if (ozelIslem === 'sil') {
                await axios.post('http://localhost:5000/api/sorulari-sil', {
                    ders: silinecekDers || undefined,
                    sinav: silinecekSinav || undefined
                });
                setModal({ type: 'success', message: 'Seçilen sorular başarıyla silindi. 🗑️' });
            }

            // Silme alanlarını temizle
            setSilinecekDers('');
            setSilinecekSinav('');

            dersleriGetir();
            setTimeout(() => {
                setModal({ type: null, message: '' });
                setYonetimAcik(false);
            }, 2000);

        } catch (err) {
            setModal({ type: 'error', message: 'İşlem sırasında hata oluştu.' });
            setTimeout(() => setModal({ type: null, message: '' }), 3000);
        }
    }

    const dersYok = dersler.length === 0 && !yukleniyor;

    return (
        <div className="min-h-screen flex flex-col p-4 relative bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white overflow-hidden font-sans">

            {/* Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-pink-600/20 rounded-full blur-[80px] animate-pulse delay-1000"></div>
            </div>

            {/* Yönetim Butonu (Ders varsa sağ üstte) */}
            {!dersYok && (
                <div className="absolute top-6 right-6 z-20">
                    <button
                        onClick={() => setYonetimAcik(true)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 backdrop-blur-md px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 group shadow-lg shadow-purple-900/20"
                    >
                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:rotate-12 transition-transform">
                            <Settings size={18} className="text-white" />
                        </div>
                        <span className="font-semibold text-sm text-white/90">Yönetim Paneli</span>
                    </button>
                </div>
            )}

            {/* Ana İçerik */}
            <div className={`flex-1 flex flex-col items-center justify-center relative z-10 transition-all duration-300 ${yonetimAcik ? 'blur-sm scale-95 opacity-50 pointer-events-none' : ''}`}>

                {!dersYok && (
                    <div className="text-center mb-16 animate-fade-in-down">
                        <div className="inline-block p-4 mb-4 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 backdrop-blur-xl shadow-2xl">
                            <GraduationCap className="w-16 h-16 text-indigo-300 drop-shadow-[0_0_15px_rgba(165,180,252,0.5)]" />
                        </div>
                        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200 mb-4 tracking-tight drop-shadow-lg">
                            Dersini Seç
                        </h1>
                        <p className="text-lg text-indigo-200/60 font-medium tracking-wide">
                            Başarıya giden yolda ilk adımını at!
                        </p>
                    </div>
                )}

                <div className="w-full max-w-7xl px-4 flex justify-center">
                    {yukleniyor ? (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mb-4"></div>
                            <span className="text-indigo-300/50 font-mono text-sm">YÜKLENİYOR...</span>
                        </div>
                    ) : dersYok ? (
                        // DERS YOKSA (ORTADA DEV BUTON)
                        <div className="text-center animate-zoom-in">
                            <h2 className="text-5xl font-bold text-white mb-8 leading-tight">
                                Henüz Ders Eklenmemiş! <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Hadi Başlayalım</span>
                            </h2>
                            <button
                                onClick={() => setYonetimAcik(true)}
                                className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-xl font-bold text-white shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all hover:scale-105 active:scale-95"
                            >
                                <span className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse group-hover:hidden"></span>
                                <div className="flex items-center gap-3">
                                    <Plus className="w-8 h-8" />
                                    <span>İLK DERSİ EKLE</span>
                                </div>
                            </button>
                        </div>
                    ) : (
                        // DERSLER LİSTESİ (GRID)
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {dersler.map((ders, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(`/ders/${encodeURIComponent(ders)}`)}
                                    className="group relative h-48 rounded-[2rem] p-1 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 hover:scale-[1.02] transition-all duration-300 shadow-xl"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                                    <div className="relative h-full bg-[#131525] rounded-[1.8rem] p-6 flex flex-col justify-between overflow-hidden">
                                        {/* Decor */}
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>

                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                                <Book className="w-6 h-6 text-white" />
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors line-clamp-1 text-left">{ders}</h3>
                                            <p className="text-white/40 text-xs font-bold tracking-widest uppercase text-left">Derse Git</p>
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {/* Ekleme Kartı (Mini) */}
                            <button
                                onClick={() => setYonetimAcik(true)}
                                className="h-48 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-green-500/50 hover:bg-green-500/5 transition-all group flex flex-col items-center justify-center gap-4"
                            >
                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors text-white/30">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <span className="text-white/40 font-bold group-hover:text-white transition-colors">YENİ EKLE</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- YÖNETİM MODALI --- */}
            {yonetimAcik && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl flex overflow-hidden ring-1 ring-white/10 relative">

                        {/* Kapat Butonu */}
                        <button onClick={() => setYonetimAcik(false)} className="absolute top-6 right-6 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                            <X size={24} />
                        </button>

                        {/* Sol Taraf: Yükleme */}
                        <div className="w-1/2 p-10 flex flex-col border-r border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                                    <Upload size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Soru Ekle</h2>
                                    <p className="text-white/40 text-sm">Ders ve sınav tipi seçip dosya yükleyin.</p>
                                </div>
                            </div>

                            <form onSubmit={dosyaYukle} className="space-y-6 flex-1 flex flex-col">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Ders Adı</label>
                                    <input
                                        type="text"
                                        value={dersAdi}
                                        onChange={e => setDersAdi(e.target.value)}
                                        placeholder="Örn: Yapay Zeka"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all placeholder:text-white/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Sınav Tipi</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Vize', 'Final'].map(tip => (
                                            <button
                                                type="button"
                                                key={tip}
                                                onClick={() => setSinavTipi(tip)}
                                                className={`py-3 rounded-xl font-bold transition-all border ${sinavTipi === tip ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-transparent border-white/10 text-white/40 hover:bg-white/5'}`}
                                            >
                                                {tip}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 flex-1">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Dosya (.txt / .docx)</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-2xl transition-all cursor-pointer relative overflow-hidden group ${dosya ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                                        <input type="file" onChange={e => setDosya(e.target.files[0])} accept=".txt,.docx" className="absolute inset-0 opacity-0 cursor-pointer" />
                                        {dosya ? (
                                            <div className="text-green-400 font-medium flex flex-col items-center gap-2 z-10">
                                                <FileText size={32} />
                                                <span>{dosya.name}</span>
                                            </div>
                                        ) : (
                                            <div className="text-white/30 font-medium flex flex-col items-center gap-2 z-10 group-hover:text-white/50 transition-colors">
                                                <Upload size={32} />
                                                <span>Dosya Seçin</span>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={yuklemeDurumu === 'yukleniyor'}
                                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {yuklemeDurumu === 'yukleniyor' ? 'Yükleniyor...' : 'KAYDET VE YÜKLE'}
                                </button>
                            </form>
                        </div>

                        {/* Sağ Taraf: Silme ve Reset */}
                        <div className="w-1/2 p-10 flex flex-col bg-[#0b1121]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                                    <Trash2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Temizlik</h2>
                                    <p className="text-white/40 text-sm">Gereksiz soru veya dersleri silin.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Ders Adı (Opsiyonel)</label>
                                    <input
                                        type="text"
                                        value={silinecekDers}
                                        onChange={e => setSilinecekDers(e.target.value)}
                                        placeholder="Tüm dersler için boş bırakın"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all placeholder:text-white/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Sınav Tipi (Opsiyonel)</label>
                                    <input
                                        type="text"
                                        value={silinecekSinav}
                                        onChange={e => setSilinecekSinav(e.target.value)}
                                        placeholder="Vize / Final"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all placeholder:text-white/20"
                                    />
                                </div>

                                <button
                                    onClick={() => setModal({ type: 'confirm-delete', message: '' })}
                                    className="w-full py-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                                    SEÇİLENLERİ SİL
                                </button>
                            </div>

                            <div className="mt-auto pt-8 border-t border-white/10">
                                <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/20 text-center">
                                    <h4 className="text-red-400 font-bold mb-2 flex items-center justify-center gap-2">
                                        <AlertTriangle size={18} />
                                        TEHLİKELİ BÖLGE
                                    </h4>
                                    <p className="text-red-200/50 text-xs mb-4 leading-relaxed">
                                        Bu işlem geri alınamaz. Sistemdeki tüm ders, sınav ve soruları kalıcı olarak siler ve uygulamayı sıfırlar.
                                    </p>
                                    <button
                                        onClick={() => setModal({ type: 'confirm-reset', message: '' })}
                                        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-900/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw size={18} />
                                        UYGULAMAYI TAMAMEN SIFIRLA
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CONFIRMATION & SUCCESS MODALS --- */}
            {modal.type && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-200">
                    <div className="bg-[#1e1b4b] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                        {/* Arkaplan Işıltısı */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

                        {modal.type === 'success' && (
                            <>
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 animate-bounce">
                                    <CheckCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Başarılı!</h3>
                                <p className="text-white/60 mb-6">{modal.message}</p>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 animate-[progress_2s_linear_forwards]"></div>
                                </div>
                            </>
                        )}

                        {modal.type === 'confirm-delete' && (
                            <>
                                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
                                    <Trash2 size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Silme Onayı</h3>
                                <p className="text-white/60 mb-8">Seçilen kriterlere uyan sorular silinecek. Bunun geri dönüşü yoktur.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setModal({ type: null })} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white/60 transition-colors">Vazgeç</button>
                                    <button onClick={() => islemYap('sil')} className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white shadow-lg shadow-red-900/40 transition-colors">Evet, Sil</button>
                                </div>
                            </>
                        )}

                        {modal.type === 'confirm-reset' && (
                            <>
                                <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-pulse">
                                    <AlertTriangle size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">DİKKAT!</h3>
                                <p className="text-white/60 mb-8 text-sm leading-relaxed">
                                    Tüm veritabanı sıfırlanacak. <br />
                                    <strong className="text-red-400">Bütün dersler ve sorular silinecek.</strong> <br />
                                    Emin misiniz?
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => setModal({ type: null })} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white/60 transition-colors">İPTAL</button>
                                    <button onClick={() => islemYap('sifirla')} className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white shadow-lg shadow-red-900/40 transition-colors">SIFIRLA</button>
                                </div>
                            </>
                        )}

                        {modal.type === 'error' && (
                            <>
                                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400 animate-pulse">
                                    <AlertTriangle size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Hata!</h3>
                                <p className="text-white/60 mb-6 leading-relaxed">{modal.message}</p>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 animate-[progress_3s_linear_forwards]"></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
         @keyframes progress { from { width: 100%; } to { width: 0%; } }
      `}</style>
        </div>
    );
}

export default DersSecimi;
