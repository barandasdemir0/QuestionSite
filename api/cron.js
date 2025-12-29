export default function handler(req, res) {
  // Her 5 dakikada Render backend'i ping at
  fetch('https://questionsite.onrender.com/api/ping')
    .catch(() => {});
  
  res.status(200).json({ ok: true });
}
