-- ============================================================================
-- 7summits Camera — Add amenities + closed_days to locations table
-- ============================================================================
-- Jalankan di Supabase Dashboard → SQL Editor → New Query → Run
-- Idempotent — aman dijalankan berkali-kali
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;
  ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS days_label TEXT DEFAULT 'Senin – Minggu';
END $$;

-- Backfill default amenities untuk semua location existing yang belum ada
UPDATE public.locations
SET amenities = jsonb_build_array(
  jsonb_build_object('icon', '🛵', 'text', 'Tersedia antar via ojek online'),
  jsonb_build_object('icon', '🅿', 'text', 'Parkir tersedia')
)
WHERE amenities IS NULL OR amenities = '[]'::jsonb;

-- Verifikasi (opsional)
-- SELECT branch_name, amenities, days_label FROM public.locations;
