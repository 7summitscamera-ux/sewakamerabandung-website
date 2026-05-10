-- ============================================================================
-- 7summits Camera Admin — Authentication Setup
-- ============================================================================
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor → New Query → Run
-- Project: mchsqiujfhvzbxzdqeeb (CMS)
-- ============================================================================
-- Apa yang dilakukan:
--   1. Buat tabel public.admin_users (username, role, dll)
--   2. RLS policies agar hanya superadmin yang bisa CRUD user
--   3. Helper function current_admin_role() untuk role check
--   4. Seed user default: superadmin / superadmin777
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. admin_users table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username     VARCHAR(64) UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9_-]{3,64}$'),
  role         VARCHAR(32) NOT NULL DEFAULT 'staff'
                           CHECK (role IN ('superadmin','admin','staff')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_id  ON public.admin_users(auth_user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_admin_users_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_admin_users_updated_at_set ON public.admin_users;
CREATE TRIGGER tg_admin_users_updated_at_set
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.tg_admin_users_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Helper function — get current user's role (avoids RLS recursion)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_admin_role() RETURNS TEXT AS $$
  SELECT role FROM public.admin_users WHERE auth_user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE
   SET search_path = public, pg_temp;

-- ----------------------------------------------------------------------------
-- 3. Row Level Security
-- ----------------------------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- READ: any authenticated user yang ada di admin_users boleh baca daftar user
DROP POLICY IF EXISTS "admin_users_read" ON public.admin_users;
CREATE POLICY "admin_users_read" ON public.admin_users FOR SELECT
  USING (auth.uid() IS NOT NULL AND public.current_admin_role() IS NOT NULL);

-- INSERT: hanya superadmin yang bisa create user baru
DROP POLICY IF EXISTS "admin_users_insert" ON public.admin_users;
CREATE POLICY "admin_users_insert" ON public.admin_users FOR INSERT
  WITH CHECK (public.current_admin_role() = 'superadmin');

-- UPDATE: superadmin update siapa saja, user lain hanya update profile sendiri
DROP POLICY IF EXISTS "admin_users_update" ON public.admin_users;
CREATE POLICY "admin_users_update" ON public.admin_users FOR UPDATE
  USING (
    public.current_admin_role() = 'superadmin'
    OR auth_user_id = auth.uid()
  )
  WITH CHECK (
    public.current_admin_role() = 'superadmin'
    OR (auth_user_id = auth.uid() AND role = (SELECT role FROM public.admin_users WHERE auth_user_id = auth.uid()))
  );

-- DELETE: hanya superadmin, dan tidak bisa hapus diri sendiri (cegah lock-out)
DROP POLICY IF EXISTS "admin_users_delete" ON public.admin_users;
CREATE POLICY "admin_users_delete" ON public.admin_users FOR DELETE
  USING (
    public.current_admin_role() = 'superadmin'
    AND auth_user_id <> auth.uid()
  );

-- ----------------------------------------------------------------------------
-- 4. Seed default user — superadmin / superadmin777
-- ----------------------------------------------------------------------------
-- Username 'superadmin' di-mapping ke synthetic email 'superadmin@admin.local'
-- Password di-hash bcrypt via crypt() + gen_salt('bf', 10)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  _user_id UUID;
  _existing_id UUID;
BEGIN
  SELECT id INTO _existing_id FROM auth.users WHERE email = 'superadmin@admin.local';

  IF _existing_id IS NOT NULL THEN
    RAISE NOTICE 'auth user superadmin@admin.local already exists (id=%) — skip auth.users insert', _existing_id;
    _user_id := _existing_id;
  ELSE
    _user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      _user_id, 'authenticated', 'authenticated',
      'superadmin@admin.local',
      crypt('superadmin777', gen_salt('bf', 10)),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"username":"superadmin"}'::jsonb,
      false, '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), _user_id,
      jsonb_build_object('sub', _user_id::text, 'email', 'superadmin@admin.local'),
      'email', _user_id::text,
      NOW(), NOW(), NOW()
    );

    RAISE NOTICE 'Created auth user superadmin@admin.local (id=%)', _user_id;
  END IF;

  -- Ensure admin_users row exists
  INSERT INTO public.admin_users (auth_user_id, username, role)
  VALUES (_user_id, 'superadmin', 'superadmin')
  ON CONFLICT (username) DO UPDATE
    SET auth_user_id = EXCLUDED.auth_user_id,
        role = 'superadmin';

  RAISE NOTICE 'Seed complete. Login: username=superadmin password=superadmin777';
END $$;

-- ============================================================================
-- VERIFIKASI (opsional — jalankan untuk cek seed berhasil)
-- ============================================================================
-- SELECT u.email, au.username, au.role, au.created_at
-- FROM public.admin_users au
-- JOIN auth.users u ON u.id = au.auth_user_id;

-- ============================================================================
-- TROUBLESHOOTING — kalau direct INSERT ke auth.users fail di project kamu
-- ============================================================================
-- 1. Buka Supabase Dashboard → Authentication → Users → "Add user"
-- 2. Email: superadmin@admin.local · Password: superadmin777 · Auto Confirm: ON
-- 3. Lalu run SQL ini saja:
--
--    INSERT INTO public.admin_users (auth_user_id, username, role)
--    SELECT id, 'superadmin', 'superadmin'
--    FROM auth.users WHERE email = 'superadmin@admin.local'
--    ON CONFLICT (username) DO UPDATE SET auth_user_id = EXCLUDED.auth_user_id;
-- ============================================================================
