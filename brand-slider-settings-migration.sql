-- ============================================================================
-- 7summits Camera — Add brand slider visual settings
-- ============================================================================
-- Jalankan di Supabase Dashboard → SQL Editor → New Query → Run
-- Idempotent — aman re-run.
-- Pre-req: stats-brands-migration.sql sudah di-run (butuh kolom 'brands').
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_logo_height     INTEGER DEFAULT 32;
  ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_logo_max_width  INTEGER DEFAULT 120;
  ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_gap             INTEGER DEFAULT 56;
  ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_anim_duration   INTEGER DEFAULT 38;
  ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_logo_style      TEXT    DEFAULT 'grayscale' CHECK (brand_logo_style IN ('grayscale','color'));
  ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_logo_opacity    NUMERIC(3,2) DEFAULT 0.78;
END $$;

-- Verifikasi
-- SELECT brand_logo_height, brand_logo_max_width, brand_gap,
--        brand_anim_duration, brand_logo_style, brand_logo_opacity
-- FROM public.site_settings WHERE id = 1;
