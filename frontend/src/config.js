// API Base URL - Environment variable'dan oku, yoksa localhost:5000 kullan
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API = {
  SORULAR: `${API_BASE_URL}/api/sorular`,
  DERSLER: `${API_BASE_URL}/api/dersler`,
  SINAVLAR: (dersId) => `${API_BASE_URL}/api/sinavlar/${dersId}`,
  RASTGELE_SORULAR: (soruTipi) => `${API_BASE_URL}/api/rastgele-sorular?tip=${soruTipi}`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  DOSYA_YUKLE: `${API_BASE_URL}/api/dosya-yukle`,
  SORULARI_SIL: `${API_BASE_URL}/api/sorulari-sil`,
  RESET: `${API_BASE_URL}/api/reset`,
  CUSTOM_QUIZ: `${API_BASE_URL}/api/custom-quiz`
};
