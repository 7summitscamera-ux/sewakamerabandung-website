-- ============================================================================
-- 7summits Camera — Packages (paket sewa) table + seed 21 dari Excel
-- ============================================================================
-- Jalankan di Supabase Dashboard → SQL Editor → New Query → Run
-- Pre-req: auth-migration.sql sudah di-run (butuh function current_admin_role
--          untuk RLS policies).
-- Idempotent — aman re-run.
-- ============================================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS public.packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  category        TEXT NOT NULL,                -- slug kategori (audio-lighting, shooting, dll)
  category_label  TEXT NOT NULL,                -- label tampilan tab (Audio & Lighting, dll)
  name            TEXT NOT NULL,
  description     TEXT,                          -- tagline opsional
  price           INTEGER NOT NULL DEFAULT 0,    -- harga per hari (Rp)
  items           JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of strings
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packages_category ON public.packages(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_packages_active   ON public.packages(is_active) WHERE is_active = true;

-- 2. updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_packages_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_packages_updated_at_set ON public.packages;
CREATE TRIGGER tg_packages_updated_at_set
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.tg_packages_updated_at();

-- 3. RLS — anon bisa baca yang aktif (public web), admin (superadmin/admin) bisa CRUD
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "packages_public_read" ON public.packages;
CREATE POLICY "packages_public_read" ON public.packages FOR SELECT
  USING (is_active = true OR public.current_admin_role() IN ('superadmin','admin'));

DROP POLICY IF EXISTS "packages_admin_write" ON public.packages;
CREATE POLICY "packages_admin_write" ON public.packages FOR ALL
  USING (public.current_admin_role() IN ('superadmin','admin'))
  WITH CHECK (public.current_admin_role() IN ('superadmin','admin'));

-- 4. Seed 21 packages dari Excel
-- 21 packages dari Excel productpackage20260510.xlsx
INSERT INTO public.packages (slug, category, category_label, name, price, items, sort_order, is_active) VALUES
  ('paket-lighting-sineas', 'audio-lighting', 'Audio & Lighting', 'PAKET LIGHTING Sineas', 750000, '["Aputure LS600X Pro  x1", "Nanlite FS 300c RGB - SRW x1", "Nanlite FORZA 60c RGB LED - SRW x1"]'::jsonb, 1, true),
  ('paket-audio-compact', 'audio-lighting', 'Audio & Lighting', 'Paket AUDIO COMPACT', 200000, '["ZOOM H6N - CSR x1", "Rode NTG4+ - CSR x1", "BOYA BY-WS1000 - CSR x1", "Boom Pole E-Image Alumunium - CSR x1", "Cable XLR Male to XLR Female - CSR x1"]'::jsonb, 2, true),
  ('paket-audio-lite', 'audio-lighting', 'Audio & Lighting', 'Paket AUDIO LITE', 105000, '["ZOOM H4N - CSR x1", "Rode NTG4+ - CSR x1", "Boom Pole E-Image Alumunium - CSR x1", "Cable XLR Male to XLR Female - CSR x1"]'::jsonb, 3, true),
  ('paket-tripod-babypod-bowl-100mm', 'shooting', 'Shooting', 'PAKET TRIPOD & BABYPOD Bowl 100mm', 200000, '["E-IMAGE EI-7080 Bowl 100mm x1", "Babypod E-Image x1"]'::jsonb, 4, true),
  ('paket-lensa-gm-14mm-24mm-50mm-85mm', 'shooting', 'Shooting', 'PAKET Lensa GM (14mm,24mm,50mm,85mm)', 875000, '["Sony FE 24mm GM F1.4 - SRW x1", "Sony FE 50mm F1.4 GM x1", "Sony FE 85mm GM F1.4 x1", "Sony FE 14mm F1.8 GM  x1"]'::jsonb, 5, true),
  ('paket-podcast', 'shooting', 'Shooting', 'Paket PODCAST', 475000, '["Canon EOS 750D - CSR 1 x1", "Canon EOS 750D - CSR 2  x1", "Canon 10-22mm F3.5-4.5 USM - CSR x1", "Canon 50mm F1.8 STM - CSR x1", "Godox SL60W - CSR (A) x1", "LED Yongnuo 600 Air - CSR  x1", "Saramonic Blink 500 B2 New Version - CSR x1", "Lightstand Takara Spirit 3 - CSR x2", "Fotopro x2 lite - CSR 1 x1", "Fotopro x2 lite - CSR 2 x1"]'::jsonb, 6, true),
  ('paket-foto-produk-b', 'foto-produk', 'Foto Produk', 'Paket Foto Produk B', 375000, '["Canon EOS M50 - 913039000928 x1", "Canon EF-M 22mm F/2 STM - AL x1", "Canon Battery LPE - 17 - SRW x1", "Godox SK400II - SRW x1", "Background Putih  x1"]'::jsonb, 7, true),
  ('paket-foto-produk-a', 'foto-produk', 'Foto Produk', 'Paket Foto Produk A', 310000, '["Sony Alpha A6000  - SRW1 x1", "Sony E 30mm F/3.5 Macro - CSR x1", "Sony Battery NP-FW50 - SRW  x1", "Godox SK400II - SRW x1", "Background Putih  x1"]'::jsonb, 8, true),
  ('paket-live-streaming-2-cam', 'live-streaming', 'Live Streaming', 'Paket LIVE STREAMING 2 CAM', 875000, '["CAMCORDER SONY HRX-NX100 - CSR 1 x1", "CAMCORDER SONY HRX-NX100 - CSR 2  x1", "TRIPOD VIDEO Fotopro DV2 - CSR  x1", "TRIPOD VIDEO Attanta VD2500 - CSR x1", "Blackmagic Atem Mini - CSR x1", "Capture Card HDMI ezcap ( Game Link U3 ) - CSR 2 x1", "Cable HDMI to HDMI 10M - CSR x2"]'::jsonb, 9, true),
  ('paket-live-streaming-1-cam', 'live-streaming', 'Live Streaming', 'Paket LIVE STREAMING 1 CAM', 350000, '["CAMCORDER SONY HRX-NX100 - CSR 1 x1", "TRIPOD VIDEO Attanta VD2500 - CSR x1", "Capture Card HDMI ezcap ( Game Link U3 ) - CSR 1 x1", "Cable HDMI to HDMI 10M - CSR x1"]'::jsonb, 10, true),
  ('paket-hunting-sony', 'hunting', 'Hunting', 'Paket HUNTING SONY', 205000, '["Sony A6000 - CSR 2 x1", "Sigma 30mm F1.4 for Sony -  CSR 1  x1", "Sony Battery NP-FW50 - CSR  x1"]'::jsonb, 11, true),
  ('paket-godox-portable', 'wedding-event', 'Wedding/ Event', 'Paket GODOX Portable', 195000, '["Godox AD600 BM - CSR x2", "Trigger X2T for Sony - CSR 1 x1", "Lightstand Takara Spirit 3 - CSR x2", "Umbrella - CSR x2"]'::jsonb, 12, true),
  ('paket-wedding-event-e', 'wedding-event', 'Wedding/ Event', 'Paket Wedding/Event E', 390000, '["Fujifilm X-T4  x1", "Fujinon XF 35mm F1.4 R - CSR x1", "Battery Fujifilm NP-W235s - CSR x1", "Godox TT600 Universal - CSR 1 x1", "Eneloop AA - CSR x4"]'::jsonb, 13, true),
  ('paket-wedding-event-d', 'wedding-event', 'Wedding/ Event', 'Paket Wedding/Event D', 265000, '["Sony Alpha A7II - CSR x1", "Sony FE 50mm F1.8 - CSR x1", "Charger Battery Sony NP-FW50 - CSR 2 x1", "Godox TT600 Universal - CSR 2  x1", "Eneloop AA - CSR x4"]'::jsonb, 14, true),
  ('paket-wedding-event-c', 'wedding-event', 'Wedding/ Event', 'Paket Wedding/Event C', 240000, '["Canon 6D - SRW  x1", "Sigma 35mm F1.4 Art For Canon - CSR x1", "Godox TT600 Universal - CSR 2  x1", "Eneloop AA - CSR x4"]'::jsonb, 15, true),
  ('paket-wedding-event-b', 'wedding-event', 'Wedding/ Event', 'Paket Wedding/Event B', 235000, '["Fujifilm  X-T20 - CSR x1", "Sigma 30mm F1.4 For Fuji - CSR x1", "Flash Yongnuo 560 III - CSR x1", "Battery Fujifilm NP-W126 - CSR x1", "Eneloop AA - CSR x4"]'::jsonb, 16, true),
  ('paket-wedding-event-a', 'wedding-event', 'Wedding/ Event', 'Paket Wedding/Event A', 150000, '["Canon EOS 750D - CSR 2  x1", "Canon EF-S 18-135mm F3.5-5.6 IS - CSR x1", "Canon Battery LP-E17 - CSR  x1", "Flash Yongnuo 560 III - CSR x1", "Eneloop AA - CSR x4"]'::jsonb, 17, true),
  ('paket-wisuda-d', 'wisuda', 'Wisuda', 'Paket Wisuda D', 265000, '["Sony Alpha A7II - CSR x1", "Sony FE 50mm F1.8 - CSR x1", "Charger Battery Sony NP-FW50 - CSR 1  x1", "Godox TT600 Universal - CSR 1 x1", "Eneloop AA - CSR x4"]'::jsonb, 18, true),
  ('paket-wisuda-c', 'wisuda', 'Wisuda', 'Paket Wisuda C', 275000, '["Fujifilm X-S10 - CSR x1", "Sigma 30mm F1.4 For Fuji - CSR x1", "Flash Yongnuo 560 III - CSR x1", "Eneloop AA - CSR x4"]'::jsonb, 19, true),
  ('paket-wisuda-b', 'wisuda', 'Wisuda', 'Paket Wisuda B', 250000, '["Canon EOS M50 - SRW  x1", "Sigma 30mm F1.4 EF-M for Canon - CSR  x1", "Canon Battery LP-E12 - CSR x1", "Flash Yongnuo 560 III - CSR x1", "Eneloop AA - CSR x4"]'::jsonb, 20, true),
  ('paket-wisuda-a', 'wisuda', 'Wisuda', 'Paket Wisuda A', 175000, '["Canon EOS 750D - CSR 1 x1", "Canon EF 50mm F1.4 USM -  CSR x1", "Canon Battery LP-E17 - CSR  x1", "Flash Yongnuo 560 III - CSR x1", "Eneloop AA - CSR x4"]'::jsonb, 21, true)
ON CONFLICT (slug) DO UPDATE
  SET category=EXCLUDED.category, category_label=EXCLUDED.category_label,
      name=EXCLUDED.name, price=EXCLUDED.price, items=EXCLUDED.items,
      sort_order=EXCLUDED.sort_order, is_active=EXCLUDED.is_active;

-- Verifikasi:
-- SELECT category, COUNT(*) FROM public.packages GROUP BY category ORDER BY category;
