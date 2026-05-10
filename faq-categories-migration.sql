-- ============================================================================
-- 7summits Camera — FAQ migration: tambah kolom category + seed 17 FAQs
-- ============================================================================
-- Jalankan di Supabase Dashboard → SQL Editor → New Query → Run
-- Idempotent — aman re-run.
-- ============================================================================

-- 1. Tambah kolom category (kalau belum ada)
DO $$ BEGIN
  ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'umum';
END $$;

CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category, sort_order);

-- 2. Seed 17 FAQs dari halaman public faq.html ke DB
-- ON CONFLICT (question) — pastikan ada UNIQUE constraint pada question
-- Kalau belum, tambahkan dulu:
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'faqs_question_unique') THEN
    ALTER TABLE public.faqs ADD CONSTRAINT faqs_question_unique UNIQUE (question);
  END IF;
END $$;

-- Insert (kalau question sudah ada, skip)
INSERT INTO public.faqs (question, answer, category, sort_order, is_active) VALUES
  ('Berapa harga sewa kamera di 7summits Camera?', 'Harga sewa mulai Rp75.000/hari untuk action camera hingga Rp1.000.000/hari untuk drone DJI Mini 4 Pro. Kamera mirrorless full-frame seperti Sony A7CII mulai Rp400.000/hari, Sony FX3 Cinema Line Rp650.000/hari. Tersedia paket bundling yang lebih hemat.', 'harga', 1, true),
  ('Apakah ada promo sewa 3 hari bayar 2?', 'Ya! Promo sewa 3 hari bayar 2 hari berlaku untuk semua produk tanpa minimum order. Hemat hingga 33% — sangat cocok untuk project film, event multi-hari, atau wisuda yang membutuhkan gear lebih lama.', 'harga', 2, true),
  ('Ada paket bundling kamera + lensa?', 'Ya, kami memiliki paket Event, Wisuda, dan Sineas yang sudah mencakup kombinasi kamera, lensa, dan aksesoris pendukung. Harga paket lebih hemat dibanding sewa satuan. Lihat detail di halaman Paket.', 'harga', 3, true),
  ('Berapa lama maksimal periode sewa?', 'Tidak ada batas maksimal hari sewa. Semakin lama periode sewa, biaya per hari semakin hemat dengan promo yang berlaku. Untuk sewa jangka panjang (> 1 minggu), hubungi admin untuk harga spesial.', 'harga', 4, true),
  ('Di mana lokasi 7summits Camera di Bandung?', 'Kami memiliki 2 lokasi di Bandung: <strong>Cisaranten</strong> dan <strong>Sriwijaya</strong>. Keduanya buka Senin–Minggu pukul 09.00–20.00 WIB. Pilih lokasi yang paling dekat dengan Anda.', 'lokasi', 5, true),
  ('Apakah tersedia layanan antar jemput gear?', 'Tersedia layanan antar via ojek online dari kedua lokasi. Biaya ongkos kirim ditanggung penyewa. Untuk area jauh atau order besar, hubungi admin kami untuk koordinasi khusus.', 'lokasi', 6, true),
  ('Apakah buka di hari libur dan Minggu?', 'Ya, kami buka 7 hari seminggu termasuk hari Minggu dan hari libur nasional, pukul 09.00–20.00 WIB. Kami tahu production tidak mengenal hari libur!', 'lokasi', 7, true),
  ('Apa syarat sewa kamera di 7summits Camera?', 'Syarat tidak ribet — cukup KTP aktif dan jaminan yang disepakati bersama. Tidak perlu rekening bank, tidak perlu deposit besar. Prosesnya cepat dan transparan.', 'syarat', 8, true),
  ('Apa yang terjadi jika gear rusak saat dipinjam?', 'Setiap transaksi dilindungi perjanjian sewa. Kerusakan karena force majeure atau yang bukan akibat kelalaian penyewa ditangani secara kekeluargaan. Kami prioritaskan solusi terbaik untuk kedua pihak.', 'syarat', 9, true),
  ('Bagaimana cara mengembalikan gear setelah sewa?', 'Kembalikan gear ke lokasi yang sama tempat Anda mengambil, atau hubungi admin untuk opsi antar jemput. Pengembalian dilakukan sesuai tanggal yang disepakati saat booking.', 'syarat', 10, true),
  ('Apakah bisa sewa untuk project komersial atau iklan?', 'Ya, gear tersedia untuk semua jenis project — personal, akademik, hingga komersial dan produksi iklan profesional. Tidak ada batasan penggunaan selama sesuai dengan perjanjian sewa.', 'syarat', 11, true),
  ('Kategori gear apa saja yang tersedia?', 'Tersedia 6 kategori: <strong>Kamera</strong> (108 unit), <strong>Lensa</strong> (149 unit), <strong>Lighting</strong> (99 unit), <strong>Video Support</strong> (282 unit), <strong>Audio Support</strong> (14 unit), dan <strong>Lainnya</strong> (115 unit). Total 767+ unit gear profesional.', 'produk', 12, true),
  ('Brand apa saja yang tersedia di 7summits Camera?', 'Tersedia berbagai brand premium: Sony Alpha, DJI, Canon, Godox, Aputure, Zhiyun, Saramonic, Rode, Insta360, Manfrotto, dan banyak lagi. Semua gear dalam kondisi prima dan dicek rutin.', 'produk', 13, true),
  ('Bagaimana kondisi gear yang disewakan?', 'Setiap unit dicek dan dikalibrasi sebelum dan sesudah setiap transaksi. Kami menerapkan quality control standar profesional. Jika ada masalah teknis saat pengambilan, kami siap ganti dengan unit lain.', 'produk', 14, true),
  ('Bagaimana cara booking kamera secara online?', 'Booking online melalui <a href="https://booking.sewakamerabandung.id" style="color:var(--orange)">booking.sewakamerabandung.id</a> — cek ketersediaan gear, pilih tanggal, dan konfirmasi langsung tanpa perlu chat admin terlebih dahulu. Prosesnya cepat dan mudah.', 'proses', 15, true),
  ('Berapa lama sebelumnya harus booking?', 'Untuk gear populer seperti kamera cinema dan drone, disarankan booking minimal H-2 atau H-3. Untuk gear standard, bisa booking di hari yang sama (tergantung ketersediaan). Cek real-time di sistem booking kami.', 'proses', 16, true),
  ('Apakah bisa kerjasama atau sponsorship?', 'Kami terbuka untuk kolaborasi dan sponsorship! Ajukan proposal project Anda dan tim kami akan menilai peluang kerjasama yang saling menguntungkan. Banyak creator dan production house yang sudah bermitra dengan kami.', 'proses', 17, true)
ON CONFLICT (question) DO UPDATE
  SET answer = EXCLUDED.answer,
      category = EXCLUDED.category,
      sort_order = EXCLUDED.sort_order,
      is_active = EXCLUDED.is_active;

-- Verifikasi
-- SELECT category, COUNT(*) FROM public.faqs GROUP BY category ORDER BY category;
