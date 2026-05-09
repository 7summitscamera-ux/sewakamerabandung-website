# 7summits Camera — Website

Platform sewa gear produksi visual profesional di Bandung.

## Stack
- HTML statis + Vanilla JS
- Supabase (data produk enrichment, FAQ, lokasi, hero)
- Lovable/Supabase (data produk utama dari booking system)
- Vercel (hosting & CDN)

## Struktur
```
/
├── index.html          # Homepage
├── faq.html            # FAQ lengkap
├── paket.html          # Halaman paket sewa
├── panduan.html        # Panduan & artikel
├── tentang.html        # Tentang kami
├── lokasi.html         # Semua lokasi
├── promo.html          # Promo aktif
├── syarat.html         # Syarat & ketentuan
├── lokasi/
│   ├── cisaranten.html # Halaman lokasi Cisaranten (Local SEO)
│   └── sriwijaya.html  # Halaman lokasi Sriwijaya (Local SEO)
├── admin.html          # Dashboard admin (protected)
├── components.js       # Shared navbar & footer
├── logo-7summits.png   # Logo resmi
└── vercel.json         # Vercel config
```

## Deploy
Push ke `main` branch → Vercel auto-deploy dalam ~30 detik.

## Admin
Akses admin di `/admin.html` untuk kelola produk, FAQ, lokasi, dan banner.
