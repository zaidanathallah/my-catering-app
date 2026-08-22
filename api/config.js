// Vercel Serverless Function: Public Configuration
// Mengambil konfigurasi Supabase dari Environment Variables secara aman

export default function handler(req, res) {
  // Hanya ekspos URL dan Anon Key untuk frontend (Service Role / Secret Key TIDAK diekspos)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  return res.status(200).json({
    supabaseUrl,
    supabaseAnonKey
  });
}
