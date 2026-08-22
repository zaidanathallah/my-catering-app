// Vercel Serverless Function: Keep-Alive Supabase
// Menjaga database Supabase tetap aktif agar tidak otomatis di-pause oleh Supabase
// Dijalankan 1x per hari melalui Vercel Cron (Aman 100% untuk Vercel Free/Hobby Plan)

export default async function handler(req, res) {
  const startTime = Date.now();
  
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://nmdmriudkchtmdjkgnye.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZG1yaXVka2NodG1kamtnbnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODUwODMsImV4cCI6MjA3NDE2MTA4M30.LnZrN6eYdAdbbWtDo_8vsWDqJ74NOGkBGjagKFdqoXo";

  try {
    // Melakukan query ringan (hanya ambil 1 baris ID) ke tabel menus di Supabase REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/menus?select=id&limit=1`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        message: "Gagal membaca database Supabase",
        status: response.status,
        error: errorText,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: "Supabase keep-alive ping berhasil! Database tetap aktif.",
      rowCount: data.length,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    return res.status(500).json({
      success: false,
      message: "Terjadi error saat menghubungi Supabase",
      error: error.message,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }
}
