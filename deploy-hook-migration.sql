-- ============================================================================
-- 7summits Camera — Deploy Hook Setup
-- ============================================================================
-- Jalankan di Supabase Dashboard → SQL Editor → New Query → Run
-- Pre-req: auth-migration.sql sudah di-run (butuh function current_admin_role)
-- ============================================================================
-- Apa yang dilakukan:
--   1. Buat tabel admin_config (key-value untuk konfigurasi sensitif)
--   2. RLS: hanya superadmin yang bisa baca/tulis
--   3. Insert key default 'deploy_hook_url' (kosong, akan diisi via admin UI)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_config (
  key            TEXT PRIMARY KEY,
  value          TEXT,
  description    TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by     UUID REFERENCES public.admin_users(id)
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_admin_config_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Set updated_by ke current admin user
  NEW.updated_by = (SELECT id FROM public.admin_users WHERE auth_user_id = auth.uid() LIMIT 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_admin_config_updated_at_set ON public.admin_config;
CREATE TRIGGER tg_admin_config_updated_at_set
  BEFORE INSERT OR UPDATE ON public.admin_config
  FOR EACH ROW EXECUTE FUNCTION public.tg_admin_config_updated_at();

-- RLS: hanya superadmin
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_config_read" ON public.admin_config;
CREATE POLICY "admin_config_read" ON public.admin_config FOR SELECT
  USING (public.current_admin_role() = 'superadmin');

DROP POLICY IF EXISTS "admin_config_write" ON public.admin_config;
CREATE POLICY "admin_config_write" ON public.admin_config FOR ALL
  USING (public.current_admin_role() = 'superadmin')
  WITH CHECK (public.current_admin_role() = 'superadmin');

-- Seed default keys
INSERT INTO public.admin_config (key, value, description) VALUES
  ('deploy_hook_url', NULL, 'Vercel Deploy Hook URL untuk trigger rebuild public web setelah save admin'),
  ('last_published_at', NULL, 'Timestamp terakhir kali publish berhasil')
ON CONFLICT (key) DO NOTHING;
