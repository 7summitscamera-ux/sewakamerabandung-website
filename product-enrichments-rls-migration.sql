-- ============================================================================
-- product_enrichments — RLS policies
-- ============================================================================
-- Jalankan di Supabase Dashboard → SQL Editor → New Query → Run
-- Project: mchsqiujfhvzbxzdqeeb (CMS)
--
-- Masalah:
--   Saat admin klik Simpan di modal "Edit Produk Enrichment" muncul error:
--     "new row violates row-level security policy for table product_enrichments"
--   Artinya RLS aktif tapi tidak ada policy yang mengizinkan
--   INSERT/UPDATE dari admin yang sudah login.
--
-- Solusi:
--   - SELECT: public (anon + authenticated) — supaya katalog.html, pdp.html,
--     index.html bisa baca enrichment via anon key.
--   - INSERT/UPDATE/DELETE: hanya user yang ada di public.admin_users
--     (cek via helper current_admin_role()).
-- ============================================================================

ALTER TABLE public.product_enrichments ENABLE ROW LEVEL SECURITY;

-- READ: siapa pun (anon untuk web publik, authenticated untuk admin)
DROP POLICY IF EXISTS "product_enrichments_public_read" ON public.product_enrichments;
CREATE POLICY "product_enrichments_public_read"
  ON public.product_enrichments
  FOR SELECT
  USING (true);

-- INSERT: hanya admin yang login (superadmin/admin/staff di admin_users)
DROP POLICY IF EXISTS "product_enrichments_admin_insert" ON public.product_enrichments;
CREATE POLICY "product_enrichments_admin_insert"
  ON public.product_enrichments
  FOR INSERT
  WITH CHECK (public.current_admin_role() IS NOT NULL);

-- UPDATE: hanya admin yang login
DROP POLICY IF EXISTS "product_enrichments_admin_update" ON public.product_enrichments;
CREATE POLICY "product_enrichments_admin_update"
  ON public.product_enrichments
  FOR UPDATE
  USING (public.current_admin_role() IS NOT NULL)
  WITH CHECK (public.current_admin_role() IS NOT NULL);

-- DELETE: hanya admin yang login
DROP POLICY IF EXISTS "product_enrichments_admin_delete" ON public.product_enrichments;
CREATE POLICY "product_enrichments_admin_delete"
  ON public.product_enrichments
  FOR DELETE
  USING (public.current_admin_role() IS NOT NULL);

-- ============================================================================
-- VERIFIKASI (opsional)
-- ============================================================================
-- SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr,
--        pg_get_expr(polwithcheck, polrelid) AS check_expr
-- FROM pg_policy WHERE polrelid='public.product_enrichments'::regclass;
