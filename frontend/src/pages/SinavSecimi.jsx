import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FileText, ArrowLeft, GraduationCap, ChevronRight, Star } from 'lucide-react';
import axios from 'axios';

function SinavSecimi() {
    const { dersId } = useParams();
    const navigate = useNavigate();
    const [sinavlar, setSinavlar] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);

    const dersAdi = decodeURIComponent(dersId);

    useEffect(() => {
        // Sınavları API'den çek
        axios.get(`https://questionsite.onrender.com/api/sinavlar/${dersId}`)
            .then(res => {
                setSinavlar(res.data);
                setYukleniyor(false);
            })
            .catch(err => {
                console.error("Sınavlar alınamadı", err);
                setYukleniyor(false);
            });
    }, [dersId]);

    return (
        <div className="min-h-screen flex flex-col p-4 relative bg-[#0f172a] overflow-hidden">

            {/* BACKGROUND GRADIENTS & SHAPES */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
                <div className="absolute -bottom-40 -left-40 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#0f172a_100%)]"></div>
            </div>

            <div className="max-w-6xl w-full mx-auto relative z-10 flex-1 flex flex-col items-center justify-center">

                {/* NAVIGASYON */}
                <div className="absolute top-0 left-0 w-full flex justify-between items-center py-6 px-4">
                    <Link to="/" className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md">
                        <ArrowLeft size={20} className="text-white/60 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                        <span className="text-white/80 font-medium group-hover:text-white">Derslere Dön</span>
                    </Link>
                </div>

                {/* BAŞLIK */}
                <div className="text-center mb-20 animate-fade-in-down">
                    <div className="inline-flex items-center justify-center mb-8 relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                        <div className="w-24 h-24 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] rounded-[2rem] border border-indigo-500/30 flex items-center justify-center shadow-2xl relative z-10">
                            <GraduationCap className="w-12 h-12 text-indigo-400" />
                        </div>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                        {dersAdi}
                    </h1>
                    <p className="text-2xl text-indigo-200/50 font-light tracking-wide">
                        Girmek istediğin sınavı seç
                    </p>
                </div>

                {/* SINAVLAR GRID */}
                <div className="grid md:grid-cols-2 gap-12 w-full max-w-4xl px-4 perspective-1000">
                    {yukleniyor ? (
                        <div className="col-span-full flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                            <span className="text-indigo-400 font-mono tracking-widest text-sm">YÜKLENİYOR</span>
                        </div>
                    ) : sinavlar.length > 0 ? (
                        sinavlar.map((sinav, index) => {
                            const isVize = sinav.toLowerCase().includes('vize');
                            return (
                                <button
                                    key={index}
                                    onClick={() => navigate(`/ders/${dersId}/${encodeURIComponent(sinav)}`)}
                                    className={`
                                group relative w-full aspect-[4/3] rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center transition-all duration-500
                                hover:scale-[1.03] hover:-translate-y-2 active:scale-95
                                ${isVize
                                            ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.5)]'
                                            : 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 shadow-[0_20px_50px_-12px_rgba(192,38,211,0.5)]'
                                        }
                            `}
                                >
                                    {/* Shine Animation */}
                                    <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
                                        <div className="absolute top-0 -left-[100%] w-[100%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-all duration-1000 group-hover:left-[200%]"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                            {isVize ? <FileText size={40} className="text-white" /> : <Star size={40} className="text-white" fill="currentColor" />}
                                        </div>

                                        <h2 className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md">{sinav}</h2>
                                        <p className="text-white/80 font-medium tracking-widest uppercase text-sm border-b border-white/20 pb-1 group-hover:border-white transition-colors">
                                            SINAVA BAŞLA
                                        </p>
                                    </div>

                                    {/* Decorative Button Action */}
                                    <div className="absolute bottom-8 right-8 w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 shadow-lg">
                                        <ChevronRight size={20} strokeWidth={3} />
                                    </div>
                                </button>
                            )
                        })
                    ) : (
                        <div className="col-span-full text-center py-12 px-6 rounded-3xl bg-white/5 border border-white/10 border-dashed">
                            <p className="text-white/40 text-lg">Bu derse ait sınav bulunamadı.</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
      `}</style>
        </div>
    );
}

export default SinavSecimi;
