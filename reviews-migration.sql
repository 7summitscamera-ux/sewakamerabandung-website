-- ============================================================================
-- 7summits Camera — Add reviews JSONB to site_settings
-- ============================================================================
-- Jalankan di Supabase Dashboard → SQL Editor → New Query → Run
-- Idempotent — aman re-run.
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;
  ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS reviews_google_url TEXT;
END $$;

-- Seed default reviews (kalau kolom masih empty) — placeholder yang sebelumnya
-- hardcoded di public homepage. Admin tinggal ganti dengan review real
-- dari Google Maps.
UPDATE public.site_settings
SET reviews = jsonb_build_array(
  jsonb_build_object(
    'name',   'Arap Visuals',
    'rating', 5,
    'text',   'Tempat sewa equipment camera yang cukup lengkap, pelayan terbaik dan harga terjangkau, plus dapat diskon sewa 3 hari bayar 2 hari.',
    'date',   'Jul 2025',
    'source', 'Google Review',
    'accent', 'orange'
  ),
  jsonb_build_object(
    'name',   'Rizky Pratama',
    'rating', 5,
    'text',   'Pelayanan ramah, harga sewa terjangkau & syarat ga ribet. Bahkan menawarkan kerjasama sponsor asal memberikan proposal.',
    'date',   'Jul 2025',
    'source', 'Google Review',
    'accent', 'green'
  ),
  jsonb_build_object(
    'name',   'Galih E.P.',
    'rating', 5,
    'text',   'Alat yang disewakan kondisinya oke. Pelayanan ramah. Sangat rekomen untuk yang butuh gear produksi di Bandung.',
    'date',   'Jun 2025',
    'source', 'Google Review',
    'accent', 'green-deep'
  )
)
WHERE id = 1 AND (reviews IS NULL OR reviews = '[]'::jsonb);

UPDATE public.site_settings
SET reviews_google_url = 'https://maps.google.com/?q=7SUMMITS+CAMERA+Bandung'
WHERE id = 1 AND reviews_google_url IS NULL;

-- Verifikasi
-- SELECT jsonb_array_length(reviews) AS total, reviews_google_url
-- FROM public.site_settings WHERE id = 1;
