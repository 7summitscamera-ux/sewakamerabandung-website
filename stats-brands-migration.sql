-- ============================================================================
-- 7summits Camera — Add stats + brands editable via admin
-- ============================================================================
-- Jalankan di Supabase Dashboard → SQL Editor → New Query → Run
-- Idempotent — aman re-run.
-- ============================================================================

-- 1. Tambah kolom JSONB untuk stats & brands di site_settings
DO $$ BEGIN
  ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '[]'::jsonb;
  ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brands JSONB DEFAULT '[]'::jsonb;
END $$;

-- 2. Seed default stats (4 rows yang ada di homepage saat ini)
UPDATE public.site_settings
SET stats = jsonb_build_array(
  jsonb_build_object('number', '767', 'suffix', '+', 'label', 'Unit gear tersedia'),
  jsonb_build_object('number', '5',   'suffix', '★', 'label', 'Rating Google Maps'),
  jsonb_build_object('number', '2',   'suffix', '',  'label', 'Lokasi di Bandung'),
  jsonb_build_object('number', '500', 'suffix', '+', 'label', 'Transaksi berhasil')
)
WHERE id = 1 AND (stats IS NULL OR stats = '[]'::jsonb);

-- 3. Seed default brands (sama seperti yang di-ticker homepage)
-- logo_url kosong dulu, admin isi belakangan via UI
UPDATE public.site_settings
SET brands = jsonb_build_array(
  jsonb_build_object('name', 'Sony',      'logo_url', ''),
  jsonb_build_object('name', 'DJI',       'logo_url', ''),
  jsonb_build_object('name', 'Canon',     'logo_url', ''),
  jsonb_build_object('name', 'Godox',     'logo_url', ''),
  jsonb_build_object('name', 'Aputure',   'logo_url', ''),
  jsonb_build_object('name', 'Zhiyun',    'logo_url', ''),
  jsonb_build_object('name', 'Saramonic', 'logo_url', ''),
  jsonb_build_object('name', 'Rode',      'logo_url', ''),
  jsonb_build_object('name', 'Insta360',  'logo_url', ''),
  jsonb_build_object('name', 'Manfrotto', 'logo_url', '')
)
WHERE id = 1 AND (brands IS NULL OR brands = '[]'::jsonb);

-- Verifikasi
-- SELECT stats, brands FROM public.site_settings WHERE id = 1;
