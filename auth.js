/* ============================================================================
   7summits Camera — Authentication Utilities
   ============================================================================
   Wraps Supabase Auth (gotrue) untuk session, role check, dan helper.
   Username-only UX di-mapping ke synthetic email <username>@admin.local.
   Password di-hash bcrypt server-side oleh Supabase Auth (gotrue).

   Dependency: harus load supabase-js v2 SEBELUM file ini:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
     <script src="/auth.js"></script>

   Public API: window.SK7Auth = {
     login, logout, getSession, getCurrentUser, requireAuth,
     hasRole, listUsers, createUser, updateUser, deleteUser,
     usernameRegex, sb
   }
   ============================================================================ */
(function () {
  'use strict';

  // --- Configuration ------------------------------------------------------
  const SUPABASE_URL  = 'https://mchsqiujfhvzbxzdqeeb.supabase.co';
  // Anon (publishable) key — aman expose, RLS yang protect data
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaHNxaXVqZmh2emJ4emRxZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTAyMDIsImV4cCI6MjA5Mzg4NjIwMn0.HUIpHZWHfBx_IwyA-ODxgVilK7y5DMt5o2rxfnDYlXM';
  const EMAIL_DOMAIN  = '@admin.local';
  const VALID_ROLES   = ['superadmin', 'admin', 'staff'];
  const USERNAME_RE   = /^[a-zA-Z0-9_-]{3,64}$/;
  const PASSWORD_MIN  = 8;

  if (typeof supabase === 'undefined' || !supabase.createClient) {
    console.error('[auth.js] supabase-js belum di-load. Tambahkan <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script> sebelum auth.js');
    return;
  }

  // Single shared client untuk auth + RLS-protected queries
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'sk7-admin-auth',
    },
  });

  // --- Helpers ------------------------------------------------------------
  const synthEmail   = (u) => String(u || '').trim().toLowerCase() + EMAIL_DOMAIN;
  const sanitizeUser = (u) => String(u || '').trim().toLowerCase();

  function validateUsername(username) {
    const u = sanitizeUser(username);
    if (!u) return 'Username wajib diisi';
    if (!USERNAME_RE.test(u)) return 'Username hanya boleh huruf, angka, _ dan - (3-64 karakter)';
    return null;
  }
  function validatePassword(pw) {
    if (!pw) return 'Password wajib diisi';
    if (pw.length < PASSWORD_MIN) return `Password minimal ${PASSWORD_MIN} karakter`;
    return null;
  }
  function validateRole(role) {
    if (!VALID_ROLES.includes(role)) return 'Role tidak valid';
    return null;
  }

  // --- Auth flows ---------------------------------------------------------
  async function login(username, password) {
    const eu = validateUsername(username);
    if (eu) throw new Error(eu);
    const ep = validatePassword(password);
    if (ep) throw new Error(ep);

    const { data, error } = await sb.auth.signInWithPassword({
      email: synthEmail(username),
      password: password,
    });
    if (error) {
      // Jangan bocorkan apakah username valid — pesan generic
      const msg = /invalid login|invalid credentials/i.test(error.message)
        ? 'Username atau password salah'
        : (error.message || 'Login gagal — coba lagi');
      throw new Error(msg);
    }
    // Verifikasi user juga ada di admin_users (cegah orphan auth user)
    const me = await getCurrentUser();
    if (!me) {
      await sb.auth.signOut();
      throw new Error('Akun tidak terdaftar di sistem admin');
    }
    return { session: data.session, user: me };
  }

  async function logout() {
    try { await sb.auth.signOut(); } catch (_) { /* ignore */ }
    try { localStorage.removeItem('sk7-admin-auth'); } catch (_) { /* ignore */ }
  }

  async function getSession() {
    const { data } = await sb.auth.getSession();
    return data.session || null;
  }

  /** Returns admin_users row for current authenticated user, or null */
  async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;
    const { data, error } = await sb
      .from('admin_users')
      .select('id, auth_user_id, username, role, created_at, updated_at')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();
    if (error || !data) return null;
    return data;
  }

  function hasRole(user, ...allowedRoles) {
    if (!user) return false;
    return allowedRoles.flat().includes(user.role);
  }

  /**
   * Guard untuk halaman admin. Panggil di awal page load.
   * Jika belum login → redirect ke /login
   * Jika role tidak cukup → redirect ke /admin (atau callback)
   * @returns {Promise<adminUser|null>}
   */
  async function requireAuth(opts = {}) {
    const allowedRoles = opts.allowedRoles || null;
    const loginPath    = opts.loginPath    || '/login';
    const denyPath     = opts.denyPath     || '/admin';

    const me = await getCurrentUser();
    if (!me) {
      const next = encodeURIComponent(location.pathname + location.search);
      location.replace(`${loginPath}?next=${next}`);
      return null;
    }
    if (allowedRoles && !hasRole(me, allowedRoles)) {
      if (typeof opts.onDeny === 'function') return opts.onDeny(me);
      location.replace(denyPath);
      return null;
    }
    return me;
  }

  // --- User management (RLS enforces who can do what) --------------------
  async function listUsers() {
    const { data, error } = await sb
      .from('admin_users')
      .select('id, auth_user_id, username, role, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Create user. Membutuhkan signup enabled di Supabase project settings.
   * Setelah signup, current admin tetap login (kita panggil signup tanpa session-replace).
   */
  async function createUser({ username, password, role }) {
    const eu = validateUsername(username);  if (eu) throw new Error(eu);
    const ep = validatePassword(password);  if (ep) throw new Error(ep);
    const er = validateRole(role);          if (er) throw new Error(er);

    const u = sanitizeUser(username);
    const email = synthEmail(u);

    // Cek username belum dipakai (UI hint, RLS tetap final guard)
    const { data: existing } = await sb
      .from('admin_users').select('id').eq('username', u).maybeSingle();
    if (existing) throw new Error(`Username "${u}" sudah dipakai`);

    // Save current session — signup di supabase-js bisa replace session current user!
    const { data: { session: prevSession } } = await sb.auth.getSession();

    // Use raw fetch ke /auth/v1/signup agar tidak mengubah session current admin
    const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON,
        // Tidak attach Bearer current admin — signup endpoint itu publik
      },
      body: JSON.stringify({
        email,
        password,
        data: { username: u },
      }),
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) {
      const msg = signupData?.msg || signupData?.error_description || signupData?.error || 'Gagal membuat user baru';
      throw new Error(msg);
    }
    const newAuthId = signupData.user?.id || signupData.id;
    if (!newAuthId) throw new Error('Response signup tidak punya user.id');

    // Pastikan session current admin tetap aktif (signup endpoint tidak set cookie kalau pakai raw fetch — aman)
    // Tapi belt-and-suspenders: re-set session kalau berubah
    const { data: { session: nowSession } } = await sb.auth.getSession();
    if (prevSession && (!nowSession || nowSession.user.id !== prevSession.user.id)) {
      await sb.auth.setSession({
        access_token: prevSession.access_token,
        refresh_token: prevSession.refresh_token,
      });
    }

    // Insert admin_users row (RLS: hanya superadmin yang bisa)
    const { data: row, error: insertErr } = await sb
      .from('admin_users')
      .insert({ auth_user_id: newAuthId, username: u, role })
      .select()
      .single();
    if (insertErr) {
      throw new Error('Auth user dibuat tapi insert admin_users gagal: ' + insertErr.message);
    }
    return row;
  }

  /**
   * Update user. updates = { username?, role?, password? }
   * Username/role updated via PostgREST (RLS enforced).
   * Password update butuh privileged path — kalau update diri sendiri pakai sb.auth.updateUser,
   * kalau update orang lain butuh service_role yg tidak ada di frontend.
   * Untuk simplicity, password change orang lain DI-DISABLE di UI.
   */
  async function updateUser(userId, updates) {
    if (!userId) throw new Error('userId wajib');
    const patch = {};
    if (updates.username != null) {
      const e = validateUsername(updates.username);
      if (e) throw new Error(e);
      patch.username = sanitizeUser(updates.username);
    }
    if (updates.role != null) {
      const e = validateRole(updates.role);
      if (e) throw new Error(e);
      patch.role = updates.role;
    }

    if (Object.keys(patch).length > 0) {
      const { data, error } = await sb
        .from('admin_users')
        .update(patch)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw new Error(error.message);
    }

    // Password change — hanya bisa untuk diri sendiri (auth.updateUser)
    if (updates.password != null) {
      const e = validatePassword(updates.password);
      if (e) throw new Error(e);
      const me = await getCurrentUser();
      if (me && me.id === userId) {
        const { error } = await sb.auth.updateUser({ password: updates.password });
        if (error) throw new Error('Gagal update password: ' + error.message);
      } else {
        throw new Error('Ganti password user lain butuh service_role — minta user yang bersangkutan login lalu ganti password sendiri');
      }
    }

    // Return updated row
    const { data } = await sb.from('admin_users').select('*').eq('id', userId).single();
    return data;
  }

  /**
   * Delete user. RLS: hanya superadmin & bukan diri sendiri.
   * Note: cuma hapus row admin_users — auth.users orphan tetap ada,
   * tapi tidak bisa login (admin_users check di getCurrentUser fail).
   * Untuk full cleanup butuh service_role; skip untuk frontend-only setup.
   */
  async function deleteUser(userId) {
    if (!userId) throw new Error('userId wajib');
    const me = await getCurrentUser();
    if (me && me.id === userId) throw new Error('Tidak bisa hapus akun sendiri');

    const { error } = await sb.from('admin_users').delete().eq('id', userId);
    if (error) throw new Error(error.message);
    return true;
  }

  // --- Public API ---------------------------------------------------------
  window.SK7Auth = {
    sb,
    login, logout, getSession, getCurrentUser, requireAuth, hasRole,
    listUsers, createUser, updateUser, deleteUser,
    usernameRegex: USERNAME_RE,
    validRoles: VALID_ROLES.slice(),
    validateUsername, validatePassword, validateRole,
  };
})();
