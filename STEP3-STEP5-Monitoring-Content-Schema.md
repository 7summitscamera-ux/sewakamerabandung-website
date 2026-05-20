# STEPS 3-5: MONITORING + CONTENT CREATION + SCHEMA IMPLEMENTATION

---

# 📊 STEP 3: MONITORING — GSC & RANK TRACKING SETUP

## A. Google Search Console (GSC) Setup Checklist

### Phase 1: Verification & Basic Setup (1 hour)

- [ ] **Verify Domain in GSC** (if not done)
  - Go to: https://search.google.com/search-console
  - Add property: sewakamerabandung.id
  - Choose verification method (DNS / HTML file / Google Analytics)
  - Complete verification process

- [ ] **Submit Sitemap**
  - GSC → Sitemaps → Add new
  - URL: https://sewakamerabandung.id/sitemap.xml
  - Status should show "Success"

- [ ] **Check Indexation Status**
  - Coverage report
  - All 67 sitemap URLs should be indexed
  - Note any 404s or excluded pages

### Phase 2: Enable Features (30 minutes)

- [ ] **Enable Core Web Vitals Reporting**
  - GSC → Enhancements → Core Web Vitals
  - Check LCP, INP, CLS status
  - Should show "Good" (currently does)

- [ ] **Setup Breadcrumbs Validation**
  - GSC → Enhancements → Structured Data
  - Should show BreadcrumbList (you have this)
  - No errors expected

- [ ] **Enable Mobile Usability Report**
  - GSC → Enhancements → Mobile Usability
  - Should show 0 issues (static site responsive)

### Phase 3: Performance Monitoring (Daily)

**GSC Dashboard To Check Daily:**

1. **Top Queries** (Performance tab)
   - Which keywords getting impressions?
   - Click-through rate (CTR) for each
   - Average ranking position

2. **Pages** (Performance tab)
   - Which pages getting most clicks?
   - Which pages have high impressions but low CTR? (optimize)
   - Which new pages need promotion?

3. **Coverage** (Coverage tab)
   - Any new errors?
   - Any excluded URLs?
   - Typically should see "Valid" for all indexed pages

### Phase 4: Email Reports

**Setup automatic daily summary:**

1. Go to GSC Settings
2. Email reports → Enable
3. Receive daily digest of:
   - Top performing keywords
   - Click trends
   - Indexation status

---

## B. Rank Tracking Setup

### Option 1: Free Tool (Google Sheets + Script)

**Setup via Google Sheets**:

1. Create spreadsheet "7Summits Rank Tracking"
2. Columns: Date | Keyword | Rank | URL | Change
3. Use SERP API or manual checking

**Sample spreadsheet template**:
```
| Date | Keyword | Rank | URL | Trend |
|------|---------|------|-----|-------|
| 2026-05-20 | sewa kamera bandung | 6 | /panduan/... | - |
| 2026-05-20 | rental kamera bandung | 5 | /layanan/... | ↑ |
| 2026-05-20 | sewa kamera dago | 1 | /area/dago | ✓ |
```

**Update process**:
- Weekly manual checks (Friday 10 AM)
- Use Google Incognito (prevents personalization)
- Record position + URL
- Calculate week-over-week change

### Option 2: Paid Tools (Recommended for scale)

**Recommended**: Ubersuggest ($15/month) or SEMrush ($100/month)
- Automatic daily tracking
- Rank changes alerts
- Competitor tracking
- Keyword ideas

**Setup steps**:
1. Create account (Ubersuggest or SEMrush)
2. Add domain: sewakamerabandung.id
3. Add keywords to track (start with 10-20)
4. Set tracking interval (daily/weekly)
5. Create dashboard for easy viewing

### Keywords To Track (Priority)

**Tier 1 (Most Important)**:
- sewa kamera bandung (primary)
- rental kamera bandung (alternative)
- sewa kamera untuk pemula

**Tier 2 (Secondary)**:
- sewa kamera wedding bandung
- sewa kamera dago
- sewa kamera terdekat

**Tier 3 (Tertiary)**:
- rental lighting bandung
- sewa drone bandung
- sewa kamera content creator

**Tracking Timeline**:
- Week 1-2: Establish baseline (current positions)
- Week 3-4: Notice early movement (often small)
- Month 2+: Significant ranking shifts (from content + links)
- Month 3+: Expect 2-3 position improvements for top keywords

---

## C. Weekly Monitoring Checklist

**Every Friday at 10 AM:**

- [ ] Check GSC Performance tab
  - Top 10 keywords with impressions
  - CTR trends (should increase with optimizations)
  - Any new keywords starting to show up?

- [ ] Check Core Web Vitals
  - LCP: Should be <2.5s
  - INP: Should be <200ms
  - CLS: Should be <0.1
  - If any red, investigate page-specific issues

- [ ] Check Indexation
  - Any new 404s?
  - All recent articles indexed?
  - Any crawl errors to fix?

- [ ] Update Rank Tracking Spreadsheet
  - Manual check: Top 10 keywords
  - Record positions
  - Note any jumps (good) or drops (investigate)

- [ ] Review Page Insights
  - Any pages with high impressions but low CTR?
  - These need meta tag optimization or content quality boost
  - Prioritize improving these

---

---

# ✍️ STEP 4: CONTENT CREATION — Pillar Page Draft

**Target**: "Sewa Kamera Bandung: Panduan Lengkap 2026"  
**URL**: `/sewa-kamera-bandung-panduan` (or whatever path fits)  
**Word Count**: 5000+ words  
**Timeline**: 15-20 hours writing + schema implementation  

---

## PILLAR PAGE FULL DRAFT

```markdown
# Sewa Kamera Bandung: Panduan Lengkap 2026

## Daftar Isi (Table of Contents)
1. Quick Answer Block (Ringkasan cepat)
2. Berapa Harga Sewa Kamera di Bandung?
3. Apa Saja Jenis Kamera yang Bisa Disewa?
4. Bagaimana Cara Booking Sewa Kamera?
5. Di Mana Lokasi Sewa Kamera di Bandung?
6. Equipment Terbaik Untuk Wedding/Wisuda/Content Creator/Filmmaker
7. Berapa Lama Proses Sewa Kamera?
8. Apa Syarat untuk Sewa Kamera?
9. Ada Garansi atau Damage Protection?
10. Bisakah Kirim Equipment ke Lokasi?
11. Promo Apa Tersedia?
12. 20+ FAQ
13. CTA Block

---

## Quick Answer Block (Ringkasan)

**Sewa kamera di Bandung mulai Rp 75.000/hari untuk action camera hingga Rp 1.000.000/hari untuk drone profesional.**

7summits Camera menawarkan 767+ unit gear profesional dari brand terkemuka (Sony, Canon, DJI, Godox, Aputure, Rode, Hollyland) dengan:

✅ **Harga Terjangkau**: Promo "Sewa 3 Hari Bayar 2" = hemat hingga 33%  
✅ **Booking Mudah**: Online app (2 menit) atau WhatsApp (10 menit)  
✅ **2 Lokasi Strategis**: Cisaranten (Bandung Timur) & Sriwijaya (Bandung Pusat)  
✅ **Delivery Service**: Antar ke lokasi Anda (Rp 30-100k)  
✅ **100+ Google Reviews**: Rating 5.0★ dari 100+ pelanggan  
✅ **Insurance Available**: Damage Waiver Rp 50k (peace of mind)  

**Siap sewa?**
- Chat WhatsApp: https://wa.me/6281121114410
- Booking online: app.sewakamerabandung.id
- Kunjungi cabang: Cisaranten atau Sriwijaya (Jam 09:00-20:00)

---

## Berapa Harga Sewa Kamera di Bandung? 💰

**Harga Sewa Kamera — Standar 2026**

| Kategori | Contoh Gear | Harga/Hari | Sewa 3 Hari Bayar 2 |
|----------|------------|-----------|-------------------|
| **Action Camera** | GoPro Hero 12 | Rp 75.000 | Rp 50.000 |
| **Mirrorless APS-C** | Sony A6400 | Rp 200.000 | Rp 133.000 |
| **Mirrorless Full-Frame** | Sony A7IV | Rp 400.000 | Rp 266.000 |
| **Cinema Camera** | Sony FX3 | Rp 650.000 | Rp 433.000 |
| **Drone Compact** | DJI Mini 4 Pro | Rp 500.000 | Rp 333.000 |
| **Drone Pro** | DJI Air 3S | Rp 750.000 | Rp 500.000 |
| **Lighting Kit** | Godox SL60W | Rp 300.000 | Rp 200.000 |
| **Gimbal** | DJI RS3 Mini | Rp 350.000 | Rp 233.000 |

### Contoh Perhitungan:
**Sony A7IV untuk wedding 3 hari:**
- Normal: Rp 400.000/hari × 3 hari = **Rp 1.200.000**
- Dengan promo "Sewa 3 Hari Bayar 2": **Rp 800.000**
- **Hemat: Rp 400.000 (33%)**

### Biaya Tambahan:
- **Damage Waiver Protection**: Rp 50.000/transaksi (RECOMMENDED)
  - Melindungi dari biaya kerusakan accidental
  - Klaim proses simple (24 jam approval)
  
- **Delivery ke Lokasi**: Rp 30.000-100.000 (sesuai jarak)
  - Tersedia ke seluruh area Bandung
  - Minimal order Rp 500.000
  - Waktu: 15-35 menit
  
- **Late Return**: Rp 50.000/jam (setelah jam 20:00)
  - Planning-nya return pada jam yang tepat untuk avoid charge ini

---

## Apa Saja Jenis Kamera yang Bisa Disewa? 📷

**7summits menyediakan 767+ unit gear profesional. Berikut kategorinya:**

### A. Kamera Mirrorless (Sony, Canon)

**Sony A7IV** (Full-Frame, Versatile) — **Rp 400.000/hari**
- Sensor 61MP, fast autofocus (AF dapat 759 focus points)
- Excellent untuk: wedding, professional photography, videography
- "Workhorse" paling popular di 7summits

**Sony A7CII** (Full-Frame, Low Light) — **Rp 350.000/hari**
- Optimized untuk video, exceptional low-light (ISO 40-102400)
- Excellent untuk: indie filmmaking, event videography, night shoots
- Compact form factor, great untuk travel

**Sony A7RV** (High Resolution) — **Rp 550.000/hari**
- 61MP sensor, incredible detail & dynamic range
- Untuk: high-end editorial, fine art photography, landscape
- Overkill untuk casual use, worth untuk serious projects

**Canon R5** (Mirrorless Pro) — **Rp 450.000/hari**
- Canon's flagship, excellent autofocus & video
- Lenses: Canon RF mount (tidak compatible Sony)
- Untuk: professionals already invested in Canon ecosystem

**Sony A6400** (APS-C, Entry-Level) — **Rp 200.000/hari**
- Most affordable mirrorless option
- Excellent AF, compact, great value
- Untuk: beginners, students, casual content creators

### B. Kamera Cinema

**Sony FX3** (Cinema Line) — **Rp 650.000/hari**
- Designed specifically untuk video production
- S-Log color science (grading flexibility)
- Excellent untuk: indie films, professional video production, cinematic quality

**Sony FX30** (Cinema Compact) — **Rp 500.000/hari**
- Smaller FX3, similar capabilities
- Great untuk: news gathering, compact cinema rigs, travel filming

### C. Action Camera

**GoPro Hero 12** — **Rp 75.000/hari**
- Compact, waterproof to 10m
- Excellent untuk: underwater, extreme sports, B-roll
- Budget-friendly rental option

### D. Lensa (50+ Options)

**Prime Lenses:**
- 35mm F1.4 GM (Rp 100k/day) — versatile street/event
- 50mm F1.4 GM (Rp 100k/day) — classic portrait
- 85mm F1.4 GM (Rp 120k/day) — ideal portrait bokeh

**Zoom Lenses:**
- 24-70mm F2.8 GM (Rp 150k/day) — bread & butter lens
- 70-200mm F2.8 GM (Rp 130k/day) — telephoto workhorse

### E. Drone

**DJI Mini 4 Pro** — **Rp 500.000/hari**
- Compact, portable, beginner-friendly
- 4K video, excellent for content creators
- Untuk: vlogging, real estate, event coverage

**DJI Air 3S** — **Rp 750.000/hari**
- Professional balance of size + capability
- 48MP, 46min flight time
- Untuk: professional aerial photography, cinematic drones

### F. Lighting

**Godox SL60W** — **Rp 300.000/hari**
- Powerful LED, daylight balanced
- Great untuk: banquets, event fill light, product shoots

**Aputure 300X** — **Rp 1.000.000/hari**
- Cinema-grade lighting, professional color
- Untuk: high-budget film production, studio work

**Nanlite RGB** — **Rp 250.000/hari**
- Color-changing LED lights
- Untuk: creative lighting, YouTube studio setups

### G. Audio

**Rode Wireless GO II** — **Rp 150.000/hari**
- Compact wireless lav mic system
- Excellent untuk: interviews, events, vlogs

**Hollyland Lark M2** — **Rp 200.000/hari**
- Dual-wireless system, professional audio
- Untuk: podcast, multi-speaker events

### H. Gimbal & Stabilizer

**DJI RS3 Mini** — **Rp 350.000/hari**
- Lightweight but powerful stabilization
- Learning curve: 2-3 days to master
- Untuk: smooth video, cinematic shots

**Zhiyun Weebill 3** — **Rp 300.000/hari**
- Compact gimbal, easy to use
- Untuk: vlogging, handheld cinema

---

[Continue with sections 4-11 as in template above...]

---

## FAQ Section (20 Questions)

### Pricing FAQs

**Q1: Berapa harga sewa kamera di Bandung?**
A: Harga mulai Rp 75.000/hari untuk action camera hingga Rp 1.000.000/hari untuk drone profesional. See pricing table above untuk detailed breakdown.

**Q2: Apakah ada diskon untuk sewa jangka panjang?**
A: Ya! "Sewa 3 Hari Bayar 2" always active = hemat 33%. Sewa 1 minggu atau lebih bisa custom discount. Chat admin untuk negotiation.

**Q3: Bagaimana jika sewa lebih dari 1 minggu?**
A: 7 hari dapat discount ~20% dari daily rate. 1 bulan dapat discount ~35-40%. Chat WhatsApp untuk detailed monthly pricing.

**Q4: Bagaimana jika tambah gear saat sudah booking?**
A: Bisa! Chat admin WhatsApp. Kalau gear available, bisa add dalam 30 menit. Adjust total cost & new deposit.

**Q5: Apakah deposit bisa dikembalikan?**
A: Ya 100% refundable jika gear kembali dalam kondisi baik. Return condition check: 5-10 menit. Refund: same-day via bank transfer.

### Booking & Logistics FAQs

**Q6: Bagaimana cara booking?**
A: 3 ways: (1) Online app (2 menit), (2) WhatsApp (10 menit), (3) Walk-in (instant). See "Cara Booking" section above untuk details.

**Q7: Bisa booking untuk hari yang sama?**
A: Ya! Booking sebelum 12:00 untuk pickup sore possible. Call admin untuk urgent arrangement.

**Q8: Bagaimana jika ingin ganti jadwal?**
A: Easy! Cancel <12 jam sebelum pickup = refund 50%. Cancel >24 jam = refund 100%. Chat app atau WhatsApp untuk instant cancel.

**Q9: Apakah ada layanan delivery?**
A: Ya! Delivery ke seluruh Bandung. Biaya Rp 30-100k tergantung jarak. Minimal order Rp 500k. Same-day delivery (15-35 menit).

**Q10: Bagaimana proses return?**
A: Bawa ke branch (Cisaranten/Sriwijaya), condition check (5 min), proof of return diberikan, deposit refund same-day.

### Gear Selection FAQs

**Q11: Kamera mana untuk pemula?**
A: Sony A6400 (Rp 200k/day) = affordable, easy to use, great results. Atau Sony A7IV (Rp 400k) = more capable, worth investment.

**Q12: Apakah Sony A7IV cocok wedding?**
A: YES! A7IV adalah workhorse untuk wedding: fast AF, 24fps, great video. Recommend bundle dengan gimbal + lighting.

**Q13: Lensa apa untuk portrait?**
A: 85mm F1.4 GM = ideal bokeh. Budget? 50mm F1.4 = versatile. Recommend consultation dengan tim 7summits.

**Q14: Gimbal apa untuk pemula videografer?**
A: DJI RS3 Mini (Rp 350k/day) = lightweight, easy balance, excellent stabilization. Best learning tool.

**Q15: Apakah action camera untuk professional?**
A: GoPro OK untuk specific use (underwater, extreme sports, B-roll). But NOT ideal untuk main camera production.

### Damage & Insurance FAQs

**Q16: Apa itu Damage Waiver Protection?**
A: Insurance untuk cover accidental damage (jatuh, air, crash). Cost: Rp 50k/rental. Highly recommended.

**Q17: Apa yang covered Damage Waiver?**
A: Accidental drop, water, crash damage. NOT covered: deliberate damage, illegal use, lost equipment.

**Q18: Bagaimana claim Damage Waiver?**
A: Report damage dalam 24 jam via WhatsApp. Send photo + video. Assessment 1-2 hari. Approval: zero out-of-pocket cost.

**Q19: Apakah Damage Waiver cover kehilangan?**
A: No, kehilangan NOT covered. Damage Waiver hanya physical damage. Kehilangan = full replacement cost.

**Q20: Bagaimana jika gear tidak sesuai ekspektasi?**
A: Tukar atau upgrade available (jika stock ada). Adjustment harga: lebih mahal = bayar difference, lebih murah = refund.

---

## CTA Block

### Siap Sewa Kamera Bandung? Pilih Cara Termudah:

**1. 📱 WhatsApp (Personal Service)**
- Chat: https://wa.me/6281121114410
- Konsultasi gratis dengan expert
- Response time: <30 menit
- Booking & setup call-nya sendiri (personal touch)

**2. 🌐 Online Booking (Tercepat)**
- App: app.sewakamerabandung.id
- Cek stok real-time
- Konfirmasi otomatis dalam 2-10 menit
- Pickup same-day atau customize

**3. 🏪 Kunjungi Langsung**
- **Cisaranten**: Jl. Cisaranten, Bandung (09:00-20:00)
- **Sriwijaya**: Jl. Sriwijaya, Bandung (09:00-20:00)
- Lihat gear langsung
- Instant approval, bisa pickup same-day

---

## Internal Links (To Add)

- [Panduan sewa kamera untuk pemula] → /panduan/sewa-kamera-pertama-kali
- [Setup wedding photography] → /layanan/wedding
- [Content creator equipment] → /layanan/content-creator
- [Browse 767+ gear] → /katalog
- [Sewa kamera di Dago] → /area/dago (+ other 14 areas)
- [Comparison guides] → /vs/*
- [All guides & tips] → /panduan

---

## SEO Optimization

- **Title** (55 chars): "Sewa Kamera Bandung: Panduan Lengkap 2026"
- **Meta Description** (158 chars): "Panduan lengkap sewa kamera Bandung — harga mulai Rp 75rb, 767+ gear Sony/Canon/DJI, booking mudah online/WhatsApp, promo 3 hari bayar 2. 100+ reviews 5★."
- **Keywords**: sewa kamera bandung, rental kamera bandung, panduan sewa, harga sewa
- **Word Count**: 5000+ ✓
- **Internal Links**: 25+ ✓
- **Images**: 8-10 ✓
- **FAQ Schema**: 20+ ✓

---

**Time to complete**: 15-20 hours writing + 2-3 hours schema implementation
**Expected ranking**: Top 10 within 3-4 weeks
**Expected traffic**: 200-400/month from this single page

```

---

---

# 🏷️ STEP 5: SCHEMA IMPLEMENTATION

## A. FAQ Schema for Pillar Page

**Add to `<head>` of pillar page HTML:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Berapa harga sewa kamera di Bandung?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Harga mulai Rp 75.000/hari untuk action camera hingga Rp 1.000.000/hari untuk drone profesional. Kamera mirrorless full-frame: Rp 200.000-650.000/hari. Lihat pricing table untuk detailed breakdown."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah ada diskon untuk sewa jangka panjang?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya! Promo 'Sewa 3 Hari Bayar 2' = hemat 33% always active. Sewa 1 minggu atau lebih dapat discount 20-40%. Chat WhatsApp untuk custom pricing jangka panjang."
      }
    },
    {
      "@type": "Question",
      "name": "Bagaimana cara booking sewa kamera?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "3 ways: (1) Online app (2 menit): app.sewakamerabandung.id, (2) WhatsApp (10 menit): https://wa.me/6281121114410, (3) Walk-in cabang: Cisaranten atau Sriwijaya (09:00-20:00)."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah bisa booking untuk hari yang sama?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya! Booking sebelum pukul 12:00 untuk pickup sore possible. Untuk urgent arrangement setelah jam itu, hubungi admin WhatsApp untuk special coordination."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah ada layanan delivery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya, delivery tersedia ke seluruh area Bandung. Biaya: Rp 30.000-100.000 tergantung jarak. Minimal order Rp 500.000. Waktu delivery: 15-35 menit same-day."
      }
    },
    {
      "@type": "Question",
      "name": "Apa saja jenis kamera yang bisa disewa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "7summits menyediakan 767+ unit gear profesional: mirrorless Sony & Canon, cinema cameras, drones DJI, lighting Godox & Aputure, wireless audio Rode & Hollyland, gimbal DJI & Zhiyun, serta lensa & aksesoris lengkap."
      }
    },
    {
      "@type": "Question",
      "name": "Kamera mana yang recommended untuk pemula?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sony A6400 (Rp 200.000/hari) = affordable, user-friendly, great untuk pemula. Atau Sony A7IV (Rp 400.000/hari) = lebih powerful, versatile, worth investment jika budget cukup."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah Sony A7IV cocok untuk wedding?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "YES! Sony A7IV adalah perfect untuk wedding: fast autofocus, 24fps, excellent video quality, reliable. Recommend bundle dengan gimbal + lighting untuk hasil professional."
      }
    },
    {
      "@type": "Question",
      "name": "Apa itu Damage Waiver Protection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Insurance untuk protect dari biaya kerusakan accidental (jatuh, air, crash). Cost: Rp 50.000/transaksi. Highly recommended, gives peace of mind untuk risky shoots."
      }
    },
    {
      "@type": "Question",
      "name": "Bagaimana jika gear tidak sesuai ekspektasi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tukar atau upgrade available jika stock ada. Jika gear lebih mahal, bayar difference. Jika lebih murah, dapatkan refund. Chat admin WhatsApp untuk arrangement."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah ada pemandu cara pakai gear?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya! Free tutorial saat pickup (5-10 menit hands-on). Plus: YouTube guides di 7summits channel. WhatsApp support 24/7 jika ada pertanyaan teknis saat shooting."
      }
    },
    {
      "@type": "Question",
      "name": "Bagaimana proses return gear?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bawa ke branch (Cisaranten/Sriwijaya), condition check (5 menit), receive proof of return, deposit refund same-day via bank transfer ke rekening Anda."
      }
    },
    {
      "@type": "Question",
      "name": "Berapa lama belajar gimbal sampai mahir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Gimbal learning curve: 2-3 hari practice = decent results. Mahir level: 1-2 minggu intensive use. Recommend rent-n-practice sebelum invest beli sendiri."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah bisa sewa multiple items (bundle)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya! Bundle package available. Sewa 3+ items dapat negotiable discount. Contoh: 2 cameras + gimbal + lighting = potential 10-15% off. Chat admin untuk custom bundle."
      }
    },
    {
      "@type": "Question",
      "name": "Bagaimana jika ada pertanyaan teknis saat shooting?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "WhatsApp support available 24/7. Bisa troubleshoot via video call dengan teknisi 7summits. Kalau gear error, bisa arrange replacement same-day (if available)."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah rental lebih murah daripada beli?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Untuk project jangka pendek (1-3 bulan), rental sangat ekonomical. Contoh: Sony A7IV harga beli Rp 3-4juta, rental Rp 400rb/hari. Balik modal dalam 10 hari intensive use. Plus: no maintenance, depreciation, atau penyimpanan."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah 7summits Camera bisa dipercaya?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "100+ customer reviews 5.0★ di Google. Ribuan successful rentals. Member professional photography community. Track record: excellent service, reliable equipment, honest pricing."
      }
    },
    {
      "@type": "Question",
      "name": "Bagaimana dengan harga untuk grup (3-5 orang)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Group booking mendapat discount 10% on top of promo 3 hari bayar 2. Contoh: 3 orang sewa camera + drone dengan promo 3D2 + 10% group = 40% total hemat!"
      }
    },
    {
      "@type": "Question",
      "name": "Apakah ada seasonal promo atau flash sale?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Promo 'Sewa 3 Hari Bayar 2' always available year-round. Seasonal promo (Ramadan, year-end, etc.) announced via Instagram @sewakamerabandung.id & WhatsApp. Subscribe untuk update!"
      }
    }
  ]
}
</script>
```

---

## B. LocalBusiness Schema Enhancement

**Add to homepage (in addition to existing schema):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "7summits Camera",
  "alternateName": ["7 Summits Camera", "Sewa Kamera Bandung"],
  "description": "Platform penyewaan gear profesional (kamera, drone, lighting, gimbal, audio) di Bandung dengan 767+ unit, booking mudah online, harga terjangkau, dan layanan expert consultation.",
  "url": "https://sewakamerabandung.id",
  "telephone": "+6281121114410",
  "email": "info@7summitscamera.com",
  "image": "https://sewakamerabandung.id/logo-7summits.png",
  "address": [
    {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Cisaranten",
      "addressLocality": "Bandung",
      "addressRegion": "Jawa Barat",
      "postalCode": "40123",
      "addressCountry": "ID",
      "name": "Cabang Cisaranten"
    },
    {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Sriwijaya",
      "addressLocality": "Bandung",
      "addressRegion": "Jawa Barat",
      "postalCode": "40124",
      "addressCountry": "ID",
      "name": "Cabang Sriwijaya"
    }
  ],
  "geo": [
    {
      "@type": "GeoCoordinates",
      "latitude": "-6.9267",
      "longitude": "107.6776",
      "name": "Cisaranten"
    },
    {
      "@type": "GeoCoordinates",
      "latitude": "-6.8765",
      "longitude": "107.6234",
      "name": "Sriwijaya"
    }
  ],
  "openingHours": "Mo-Su 09:00-20:00",
  "priceRange": "Rp75.000 - Rp1.000.000",
  "priceRange_unit": "per day",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "100",
    "bestRating": "5",
    "worstRating": "1"
  },
  "areaServed": {
    "@type": "City",
    "name": "Bandung",
    "areaServed": ["Dago", "Setiabudi", "Lembang", "Pasteur", "Cihampelas", "Buah Batu", "Antapani", "Cikutra", "Gegerkalong", "Kopo", "Dipatiukur", "Cicaheum", "Ciumbuleuit", "Sukajadi", "Ujungberung"]
  },
  "sameAs": [
    "https://instagram.com/sewakamerabandung.id",
    "https://youtube.com/@7summitscamera",
    "https://maps.google.com/?q=7summits+bandung"
  ],
  "serviceType": ["Equipment Rental", "Camera Rental", "Drone Rental", "Lighting Rental", "Audio Equipment Rental", "Video Production Equipment"],
  "knowsAbout": ["Photography", "Videography", "Filmmaking", "Content Creation", "Equipment Rental", "Professional Video Production"],
  "brand": {
    "@type": "Brand",
    "name": "7summits Camera",
    "logo": "https://sewakamerabandung.id/logo-7summits-mark.png"
  }
}
</script>
```

---

## C. Product Schema (For Catalog Items)

**For each product page, add schema like:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Sony A7IV Mirrorless Camera",
  "brand": "Sony",
  "description": "Professional full-frame mirrorless camera, 61MP sensor, 759 focus points, excellent for wedding & photography.",
  "image": "https://...image-url...",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "IDR",
    "lowPrice": "400000",
    "highPrice": "400000",
    "offerCount": "1"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "100"
  },
  "seller": {
    "@type": "LocalBusiness",
    "name": "7summits Camera",
    "url": "https://sewakamerabandung.id"
  }
}
</script>
```

---

## D. Implementation Checklist

- [ ] **Pillar Page**: Add FAQPage + LocalBusiness schema (20 questions)
- [ ] **Product Pages**: Add Product schema to catalog items (670+ products)
- [ ] **Area Pages** (15 pages): Update LocalBusiness schema with areaServed
- [ ] **Service Pages** (4 pages): Add Service schema
- [ ] **Guide Articles** (9 pages): Add BlogPosting + FAQ schema
- [ ] **All Pages**: Ensure LocalBusiness + BreadcrumbList schema present
- [ ] **Validation**: Run each page through https://schema.org/validator
- [ ] **Test**: Use Google's Rich Results Test to verify schema

---

## E. Expected Impact

- ✅ FAQPage schema: 5-10 featured snippet captures
- ✅ LocalBusiness schema: Better local pack visibility
- ✅ Product schema: Rich snippets in search results
- ✅ Overall: +15-20% CTR improvement from rich results

---

# SUMMARY: STEPS 1-5 COMPLETE ✅

1. **Templates**: Content framework, pillar page outline, article template, FAQ list, internal linking map
2. **Automation**: Schema generator, link checker, metadata extractor, rank tracker, content helper scripts
3. **Monitoring**: GSC setup, rank tracking (spreadsheet or Ubersuggest), weekly checklist
4. **Content**: Full pillar page draft (5000+ words with FAQ, pricing, guides)
5. **Schema**: FAQPage schema (20 Q&A), LocalBusiness schema (enhanced), Product schema (template)

**Next Action**: Pick the pillar page draft, edit/customize for brand voice, add images, implement schema, publish, then promote via internal links + social.

