# Auth Flow — 7summits Camera Admin

Sistem autentikasi untuk halaman admin (`/admin`) di static site Vercel + Supabase Auth.

## Quick Start (Setup Pertama Kali)

1. **Jalankan migration SQL** di Supabase Dashboard → SQL Editor → New Query → paste isi [`auth-migration.sql`](./auth-migration.sql) → **Run**.
2. **Verifikasi** dengan SELECT (ada di bagian akhir migration). Harus muncul 1 row: `superadmin · superadmin@admin.local · superadmin`.
3. **Deploy** branch ke Vercel. Akses `/login`. Login dengan:
   - Username: `superadmin`
   - Password: `superadmin777`
4. **WAJIB ganti password default** segera setelah login pertama (User Management → Edit diri → ganti password).

> **Kalau direct INSERT ke `auth.users` di SQL gagal** (versi Supabase tertentu): pakai fallback dashboard di bagian bawah `auth-migration.sql` (Authentication → Users → Add user manual).

## Arsitektur

```
                ┌─────────────────────────────────┐
                │  Browser (static site)          │
                │  ┌──────────────┐   ┌────────┐  │
                │  │ /login.html  │   │/admin  │  │
                │  │  (login UI)  │   │ (CMS)  │  │
                │  └──────┬───────┘   └────┬───┘  │
                │         │                │      │
                │  ┌──────▼────────────────▼────┐ │
                │  │  auth.js (SK7Auth API)     │ │
                │  │  · login / logout          │ │
                │  │  · requireAuth (route grd) │ │
                │  │  · listUsers / createUser  │ │
                │  │  · updateUser / deleteUser │ │
                │  └──────────────┬─────────────┘ │
                └─────────────────┼───────────────┘
                                  │ JWT (Bearer)
                                  ▼
                ┌─────────────────────────────────┐
                │  Supabase (managed backend)     │
                │  ┌────────────────┐             │
                │  │ auth.users     │ ← bcrypt   │
                │  │ (gotrue)       │   passwords│
                │  └────────┬───────┘             │
                │           │                     │
                │  ┌────────▼─────────────────┐   │
                │  │ public.admin_users       │   │
                │  │ + RLS policies           │   │
                │  │ + current_admin_role()   │   │
                │  └──────────────────────────┘   │
                └─────────────────────────────────┘
```

## Auth Flow

### Login
1. User input `username` + `password` di `/login`.
2. `auth.js` → `SK7Auth.login()` panggil `supabase.auth.signInWithPassword({email: <username>@admin.local, password})`.
3. Supabase Auth verify password via bcrypt, return JWT (access + refresh token).
4. JWT disimpan di `localStorage` key `sk7-admin-auth` (managed by supabase-js SDK).
5. `getCurrentUser()` dipanggil untuk fetch row `public.admin_users` dimana `auth_user_id = auth.uid()`. Kalau tidak ada → orphan auth user, signout otomatis.
6. Redirect ke `?next=` atau `/admin`.

### Protected route (`/admin`)
1. `admin.html` load `auth.js` lalu panggil `await SK7Auth.requireAuth({allowedRoles: ['superadmin','admin','staff']})` di awal script.
2. Kalau session invalid → `location.replace('/login?next=/admin')`.
3. Kalau role tidak cukup → redirect (configurable).
4. Top bar render username + role chip + logout button.
5. Sidebar item "User Management" hanya muncul untuk `superadmin`.

### Logout
1. Confirmation modal (`confirmDialog`).
2. `SK7Auth.logout()` → `supabase.auth.signOut()` → invalidate JWT server-side.
3. Clear localStorage.
4. Redirect ke `/login`.

### Token refresh
- `supabase-js` SDK auto-refresh access token sebelum expire (dari refresh token).
- Tidak perlu logic manual.

## RLS Policies (`auth-migration.sql`)

| Action | Policy | Siapa boleh? |
|---|---|---|
| SELECT | `admin_users_read` | Authenticated user yg ada di admin_users (via `current_admin_role()` returns NOT NULL) |
| INSERT | `admin_users_insert` | Hanya `superadmin` |
| UPDATE | `admin_users_update` | `superadmin` (semua) ATAU `auth.uid() = auth_user_id` (diri sendiri, dan TIDAK BOLEH ganti role sendiri) |
| DELETE | `admin_users_delete` | `superadmin` AND BUKAN diri sendiri (cegah lock-out) |

`current_admin_role()` adalah `SECURITY DEFINER` function — bypass RLS saat fetch role current user untuk menghindari recursion.

## Limitasi (frontend-only setup)

| Limitasi | Workaround |
|---|---|
| **Reset password user lain** butuh `service_role` key (yang TIDAK BOLEH expose di frontend) | Minta user yg bersangkutan login lalu ganti password sendiri via Edit User. ATAU: dashboard Supabase → Authentication → Users → row → "Send password reset" |
| **Hapus auth.users orphan** saat delete admin_users butuh service_role | Row admin_users dihapus sehingga user tidak bisa login lagi (login fails di `getCurrentUser` check). Auth row tetap ada tapi unusable. Hapus manual via Dashboard kalau perlu cleanup. |
| **Signup endpoint** dipakai untuk create user — ini publik di Supabase | Pastikan **Authentication → Settings → Enable signup** = ON. RLS pada `admin_users` mencegah insert tanpa role superadmin. |
| **Token di localStorage** vulnerable terhadap XSS | Mitigasi: tidak ada `innerHTML` pakai data user (semua escHtml). CSP headers via vercel.json bisa diperketat. Untuk security tinggi → migrate ke httpOnly cookie via Edge Function. |
| **`/admin` page source readable** oleh siapa saja | Bukan masalah keamanan — semua data sensitif di-protect via RLS. Anon key tidak bisa baca admin_users tanpa session. Source visibility = expected untuk static site. |

## Kalau mau Production-Hardening

Untuk pakai sistem ini di skenario lebih critical:

1. **Edge Function untuk admin operations** (create user dengan service_role, password reset, dll). Frontend cuma proxy ke edge function dengan JWT auth.
2. **httpOnly cookie session** ganti dari localStorage. Implementasi: edge function set cookie di response, fetch wrapper auto-include credentials.
3. **MFA / 2FA** via Supabase MFA (TOTP). SDK sudah support, tinggal enable dan tambah enrollment UI.
4. **Audit log** — tabel `admin_audit_log` yang record semua action via trigger. Sample schema di akhir file ini.
5. **CSP header** lebih ketat (no inline script, hash-based).
6. **Rate limit** login attempts via Supabase Auth rate limit settings.

## File Structure

```
/auth-migration.sql       # SQL migration — admin_users, RLS, seed superadmin
/auth.js                  # Auth utilities (SK7Auth API)
/auth.css                 # Login page + toast + modal styles
/login.html               # Login page (/login)
/admin.html               # Modified: auth guard + User Mgmt tab + logout
/AUTH.md                  # Documentation ini
```

## API Reference (`window.SK7Auth`)

```ts
// Auth flows
login(username, password): Promise<{session, user}>
logout(): Promise<void>
getSession(): Promise<Session | null>
getCurrentUser(): Promise<AdminUser | null>
requireAuth({allowedRoles?, loginPath?, denyPath?, onDeny?}): Promise<AdminUser | null>
hasRole(user, ...roles): boolean

// User management (RLS enforced)
listUsers(): Promise<AdminUser[]>
createUser({username, password, role}): Promise<AdminUser>
updateUser(id, {username?, role?, password?}): Promise<AdminUser>
deleteUser(id): Promise<true>

// Validators (sync)
validateUsername(s): string | null   // returns error message, or null if valid
validatePassword(s): string | null
validateRole(s): string | null

// Constants
usernameRegex: RegExp
validRoles: ['superadmin','admin','staff']

// Raw client (auth-aware)
sb: SupabaseClient
```

## Roles

| Role | Akses |
|---|---|
| **superadmin** | Semua: branding, konten, user management (create/update/delete user) |
| **admin** | Branding, konten (FAQ, promo, lokasi, dll). Tidak bisa kelola user. |
| **staff** | Read-only akses panel (UI bisa di-extend untuk granular permissions per panel) |

Saat ini RLS hanya enforce di tabel `admin_users`. Untuk granular access per resource (FAQ, promo, dll), tambah RLS policy pada tabel-tabel itu yang reference `current_admin_role()`. Contoh:

```sql
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs_write" ON public.faqs FOR ALL
  USING (public.current_admin_role() IN ('superadmin','admin'));
```

## Sample Audit Log Schema (optional)

```sql
CREATE TABLE public.admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID REFERENCES public.admin_users(id),
  actor_username VARCHAR(64),
  action VARCHAR(64) NOT NULL,        -- 'user.create', 'user.delete', 'faq.update', dll
  target_table VARCHAR(64),
  target_id TEXT,
  before JSONB,
  after JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_actor ON public.admin_audit_log(actor_user_id, created_at DESC);
```
