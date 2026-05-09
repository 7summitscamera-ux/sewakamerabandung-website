// 7summits Camera — build-time pre-renderer
// Fetches all CMS + booking data, injects static HTML into templates,
// writes everything to dist/ for Vercel to deploy.
//
// Run via: npm run build  (Vercel auto-runs this)

import fs from 'node:fs/promises';
import path from 'node:path';

// ============================================================================
// CONFIG
// ============================================================================
const CMS = {
  url: 'https://mchsqiujfhvzbxzdqeeb.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaHNxaXVqZmh2emJ4emRxZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTAyMDIsImV4cCI6MjA5Mzg4NjIwMn0.HUIpHZWHfBx_IwyA-ODxgVilK7y5DMt5o2rxfnDYlXM'
};
const BOOKING = {
  url: 'https://yxcssruutgpzkgcsqrit.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4Y3NzcnV1dGdwemtnY3Nxcml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTAzMTYsImV4cCI6MjA5MTU2NjMxNn0.NMZqMuEUR2c-V3CnbW-bJNn1bjlS6vHLPUQSD7nArM0'
};

const SITE_URL = 'https://sewakamerabandung.id';
const BOOKING_URL = 'https://booking.sewakamerabandung.id';
const SRC = '.';
const OUT = 'dist';

const COPY_FILES = [
  'design-system.css','components.js','cart.js','branding-loader.js',
  'logo-7summits.png','logo-7summits-mark.png','vercel.json',
  'robots.txt','sitemap.xml','migrations.sql'
];
const COPY_HTML_AS_IS = [
  'admin.html','paket.html','panduan.html','promo.html','syarat.html','privasi.html','tentang.html'
  // faq, lokasi, sriwijaya, cisaranten get prerendered separately
];

// ============================================================================
// HELPERS
// ============================================================================
const escHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
function slugify(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

const BRANDS = {
  sony: 'Sony', canon: 'Canon', fujifilm: 'Fujifilm', fujinon: 'Fujinon',
  nikon: 'Nikon', dji: 'DJI', godox: 'Godox', aputure: 'Aputure',
  yongnuo: 'Yongnuo', sigma: 'Sigma', tamron: 'Tamron', hollyland: 'Hollyland',
  saramonic: 'Saramonic', tilta: 'Tilta', zhiyun: 'Zhiyun', gopro: 'GoPro',
  insta360: 'Insta360', viltrox: 'Viltrox', blackmagic: 'Blackmagic',
  feelworld: 'Feelworld', feiyu: 'Feiyu', rode: 'Rode', boya: 'Boya',
  manfrotto: 'Manfrotto', nanlite: 'Nanlite', ulanzi: 'Ulanzi',
  smallrig: 'SmallRig', kingma: 'Kingma', mavic: 'DJI', phantom: 'DJI',
  osmo: 'DJI', ronin: 'DJI', lark: 'Hollyland', amaran: 'Aputure'
};
function detectBrand(name) {
  const n = (name || '').toLowerCase();
  let best = null;
  for (const k in BRANDS) if (n.includes(k) && (!best || k.length > best.length)) best = k;
  return best ? BRANDS[best] : null;
}

const CAT_ICON = { KAMERA: '📷', LENSA: '🔭', LIGHTING: '💡', 'VIDEO SUPPORT': '🎥', 'AUDIO SUPPORT': '🎙', LAINNYA: '🔧' };
const getIcon = (c) => CAT_ICON[(c || '').toUpperCase()] || '📦';

function cleanModel(name) {
  return String(name || '')
    .replace(/\s*\(\s*tidak\s+dipakai\s*\)\s*/gi, ' ')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s*[-|]\s*(CSR|SRW|HQ|AL|ZN)\s*\d*\s*$/gi, '')
    .replace(/\s+/g, ' ').trim();
}

// ============================================================================
// SUPABASE FETCH
// ============================================================================
async function sbFetch(creds, table, query = '') {
  const r = await fetch(`${creds.url}/rest/v1/${table}?${query}`, {
    headers: { apikey: creds.key, Authorization: `Bearer ${creds.key}`, Accept: 'application/json' }
  });
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status} — ${(await r.text()).slice(0, 200)}`);
  return r.json();
}
async function tryFetch(creds, table, query, fallback = []) {
  try { return await sbFetch(creds, table, query); }
  catch (e) { console.warn(`⚠ ${table} failed: ${e.message}`); return fallback; }
}

// ============================================================================
// HTML INJECTORS — replace content between marker comments
// ============================================================================
function injectAt(html, marker, replacement) {
  const re = new RegExp(`<!-- PRERENDER:${marker}:START -->[\\s\\S]*?<!-- PRERENDER:${marker}:END -->`);
  if (!re.test(html)) return html;
  return html.replace(re, `<!-- PRERENDER:${marker}:START -->${replacement}<!-- PRERENDER:${marker}:END -->`);
}

function injectIntoElement(html, id, innerHtml) {
  // Replace innerHTML of <div id="X">...</div>
  const re = new RegExp(`(<(?:div|section|main)[^>]*\\bid=["']${id}["'][^>]*>)([\\s\\S]*?)(</(?:div|section|main)>)`);
  return html.replace(re, `$1${innerHtml}$3`);
}

function setMeta(html, attrName, attrVal, content) {
  const re = new RegExp(`(<meta[^>]*${attrName}=["']${attrVal}["'][^>]*content=["'])[^"']*(["'])`);
  if (re.test(html)) return html.replace(re, `$1${escHtml(content)}$2`);
  // try inverted attribute order
  const re2 = new RegExp(`(<meta[^>]*content=["'])[^"']*(["'][^>]*${attrName}=["']${attrVal}["'])`);
  return html.replace(re2, `$1${escHtml(content)}$2`);
}
function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escHtml(title)}</title>`);
}

function injectBeforeClose(html, tag, content) {
  return html.replace(new RegExp(`</${tag}>`), `${content}\n</${tag}>`);
}

// ============================================================================
// RENDERERS
// ============================================================================
function renderProductCard(p, enrich) {
  const e = enrich || {};
  const harga = p.harga_sewa_per_hari || 0;
  const nama = p.nama_produk || '-';
  const kat = p.kategori_produk || '';
  const stok = (p.stok_total || 0) - (p.stok_dalam_perbaikan || 0);
  const avail = stok > 0;
  const imgUrl = e.image_url || '';
  const specs = e.specs || '';
  const specArr = specs ? specs.split('·').map((s) => s.trim()).filter(Boolean).slice(0, 3) : [];
  const kel = e.includes || p.kelengkapan || '';
  const kelShort = kel.length > 80 ? kel.substring(0, 80) + '...' : kel;
  const slug = slugify(nama);
  const catDisplay = kat ? kat.charAt(0) + kat.slice(1).toLowerCase() : '';
  const brand = detectBrand(nama) || (kat ? catDisplay : 'Gear');
  const cartPayload = JSON.stringify({ id: p.id, slug, name: nama, kategori: kat, harga, image: imgUrl }).replace(/"/g, '&quot;');

  const imgHtml = imgUrl
    ? `<img src="${escHtml(imgUrl)}" alt="${escHtml(nama)}" loading="lazy">`
    : `<div class="prod-ph"><div class="prod-ph-ico">${getIcon(kat)}</div><div class="prod-ph-brand">${escHtml(brand)}</div><div class="prod-ph-model">${escHtml(cleanModel(nama))}</div></div>`;

  const specsHtml = specArr.length ? `<div class="prod-specs">${specArr.map((s) => `<span class="prod-spec">${escHtml(s)}</span>`).join('')}</div>` : '';
  const kelHtml = kelShort ? `<div class="prod-includes">${escHtml(kelShort)}</div>` : '';

  return `<a href="/product/${slug}" class="prod-card" itemscope itemtype="https://schema.org/Product">
    <meta itemprop="name" content="${escHtml(nama)}">
    <meta itemprop="category" content="${escHtml(kat)}">
    <div class="prod-img-wrap">${imgHtml}
      <div class="prod-badge-wrap"><span class="prod-badge prod-badge-cat">${escHtml(catDisplay)}</span></div>
      <div class="prod-avail"><div class="avail-dot ${avail ? 'on' : 'off'}"></div><span>${avail ? 'Tersedia' : 'Habis'}</span></div>
    </div>
    <div class="prod-body">
      <div class="prod-cat-tag">${escHtml(kat)}</div>
      <div class="prod-name" itemprop="name">${escHtml(nama)}</div>
      ${specsHtml}${kelHtml}
      <div class="prod-footer">
        <div class="prod-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="priceCurrency" content="IDR"><meta itemprop="price" content="${harga}">
          <meta itemprop="availability" content="${avail ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}">
          ${fmtRp(harga)} <small>/ hari</small>
        </div>
        <div class="prod-actions">
          <button class="btn-cart" title="Tambah ke daftar inquiry" onclick="event.stopPropagation();event.preventDefault();quickAddCart(this,${cartPayload})">+</button>
          <button class="btn-rent" onclick="event.stopPropagation();event.preventDefault();window.open('${BOOKING_URL}','_blank')">Booking →</button>
        </div>
      </div>
    </div></a>`;
}

function renderFaqItem(f, idx) {
  return `<div class="faq-item${idx === 0 ? ' open' : ''}" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <div class="faq-q" onclick="this.closest('.faq-item').classList.toggle('open')">
      <span itemprop="name">${escHtml(f.question)}</span>
      <div class="faq-q-icon">+</div>
    </div>
    <div class="faq-a" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div class="faq-a-inner" itemprop="text">${f.answer || ''}</div>
    </div>
  </div>`;
}

function renderLocationCard(loc, idx) {
  const tagPrefix = loc.tagline || `Lokasi ${idx + 1}`;
  return `<div class="loc-card" itemscope itemtype="https://schema.org/LocalBusiness">
    <span class="loc-tag">${escHtml(tagPrefix)}</span>
    <div class="loc-name" itemprop="name">${escHtml(loc.branch_name)}</div>
    <div class="loc-addr" itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
      <span itemprop="streetAddress">${escHtml((loc.address || '').replace(/,/g, '<br>'))}</span>
    </div>
    <div class="loc-rows">
      <div class="loc-row"><div class="loc-ico">🕘</div>${escHtml(loc.open_time || '09.00')} – ${escHtml(loc.close_time || '20.00')} WIB</div>
      <div class="loc-row"><div class="loc-ico">🛵</div>Tersedia antar via ojek online</div>
    </div>
    <div class="loc-acts">
      <a href="${escHtml(loc.whatsapp_url || '#')}"><button class="btn btn-wa" style="width:100%">WhatsApp</button></a>
      <a href="${escHtml(loc.maps_url || '#')}" target="_blank" rel="noopener"><button class="btn btn-maps" style="width:100%">Google Maps</button></a>
    </div>
  </div>`;
}

// ============================================================================
// PAGE PRERENDERERS
// ============================================================================
async function prerenderIndex(html, { produk, enrichMap, faqs, locations, settings }) {
  // 1. Featured products: top 6 from enriched featured set, or top by price
  const featuredEnriched = Object.values(enrichMap).filter((e) => e.is_featured).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const featuredIds = new Set(featuredEnriched.map((e) => e.booking_product_id));
  let featured = produk.filter((p) => featuredIds.has(p.id));
  if (featured.length < 6) {
    const extras = produk.filter((p) => !featuredIds.has(p.id)).sort((a, b) => (b.harga_sewa_per_hari || 0) - (a.harga_sewa_per_hari || 0));
    featured = [...featured, ...extras].slice(0, 6);
  } else {
    featured = featured.slice(0, 6);
  }
  const productsHtml = featured.map((p) => renderProductCard(p, enrichMap[p.id])).join('') || '<div class="prod-empty">Belum ada produk featured.</div>';
  html = injectIntoElement(html, 'prod-grid', productsHtml);

  // 2. FAQ — top 6 active
  if (faqs.length) {
    const faqHtml = faqs.slice(0, 6).map((f, i) => renderFaqItem(f, i)).join('');
    html = injectIntoElement(html, 'faq-grid', faqHtml);
  }

  // 3. Locations
  if (locations.length) {
    const locHtml = locations.map((l, i) => renderLocationCard(l, i)).join('');
    html = injectIntoElement(html, 'loc-grid', locHtml);
  }

  // 4. Site settings overrides
  if (settings) {
    if (settings.hero_image_url) {
      html = html.replace(
        /url\('https:\/\/images\.unsplash\.com\/[^']+'\)/,
        `url('${settings.hero_image_url}')`
      );
    }
    if (settings.hero_headline) {
      const parts = settings.hero_headline.split(/\s*\|\s*/);
      const heroH1 = parts.length > 1 ? `${escHtml(parts[0])}<br><em>${escHtml(parts.slice(1).join(' '))}</em>` : escHtml(settings.hero_headline);
      html = html.replace(/(<h1 class="hero-h1">)[\s\S]*?(<\/h1>)/, `$1${heroH1}$2`);
    }
    if (settings.hero_subheadline) {
      html = html.replace(/(<p class="hero-sub">)[\s\S]*?(<\/p>)/, `$1${escHtml(settings.hero_subheadline)}$2`);
    }
  }

  // 5. ItemList JSON-LD with featured products
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: featured.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/product/${slugify(p.nama_produk)}`,
      name: p.nama_produk
    }))
  };
  html = injectBeforeClose(html, 'head', `<script type="application/ld+json">${JSON.stringify(itemListLd)}</script>`);

  return html;
}

async function prerenderKatalog(html, { produk, enrichMap }) {
  // Pre-render the first page (24 cards by default sort = featured + price desc)
  // matching what JS would render for `?page=1` with no filter.
  // Client-side JS detects pre-rendered grid and skips initial fetch render.
  const sorted = [...produk].sort((a, b) => {
    const fa = enrichMap[a.id]?.is_featured ? 1 : 0;
    const fb = enrichMap[b.id]?.is_featured ? 1 : 0;
    if (fa !== fb) return fb - fa;
    return (b.harga_sewa_per_hari || 0) - (a.harga_sewa_per_hari || 0);
  });
  const firstPage = sorted.slice(0, 24);
  const cardsHtml = firstPage.map((p) => renderKatalogCard(p, enrichMap[p.id])).join('');
  html = injectIntoElement(html, 'kat-grid', cardsHtml);
  // Update count display
  html = html.replace(/(<strong id="kat-count">)[^<]*(<\/strong>)/, `$1${produk.length.toLocaleString('id-ID')}$2`);

  // CollectionPage / ItemList schema
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Katalog Sewa Kamera Bandung — 7summits Camera',
    description: `${produk.length} unit gear sewa profesional di Bandung — Sony, Canon, DJI, Godox, dan lainnya.`,
    url: `${SITE_URL}/katalog`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: sorted.length,
      itemListElement: sorted.slice(0, 50).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/product/${slugify(p.nama_produk)}`,
        name: p.nama_produk
      }))
    }
  };
  html = injectBeforeClose(html, 'head', `<script type="application/ld+json">${JSON.stringify(ld)}</script>`);

  return html;
}

function renderKatalogCard(p, enrich) {
  const e = enrich || {};
  const stok = (p.stok_total || 0) - (p.stok_dalam_perbaikan || 0);
  const avail = stok > 0;
  const slug = slugify(p.nama_produk);
  const img = e.image_url || '';
  const brand = detectBrand(p.nama_produk) || 'Gear';
  const harga = p.harga_sewa_per_hari || 0;
  const harga3 = harga * 2;
  const cartPayload = JSON.stringify({ id: p.id, slug, name: p.nama_produk, kategori: p.kategori_produk, harga, image: img }).replace(/"/g, '&quot;');
  const imgHtml = img
    ? `<img src="${escHtml(img)}" alt="${escHtml(p.nama_produk)}" loading="lazy">`
    : `<div class="kcard-img-ph"><div class="kcard-img-ph-ico">${getIcon(p.kategori_produk)}</div><div>${escHtml(brand)}</div></div>`;
  return `<a href="/product/${slug}" class="kcard" itemscope itemtype="https://schema.org/Product">
    <meta itemprop="name" content="${escHtml(p.nama_produk)}">
    <meta itemprop="category" content="${escHtml(p.kategori_produk || '')}">
    <div class="kcard-img">${imgHtml}
      ${e.is_featured ? '<div class="kcard-feat">⭐ Featured</div>' : ''}
      ${!avail ? '<div class="kcard-out">Stok habis</div>' : ''}
      <div class="kcard-actions">
        <button class="kcard-icon" title="Tambah ke daftar inquiry" onclick="event.stopPropagation();event.preventDefault();katAddCart(this,${cartPayload})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button class="kcard-icon" title="Lihat detail" onclick="event.stopPropagation();event.preventDefault();location.href='/product/${slug}'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </div>
    <div class="kcard-body">
      <div class="kcard-cat">${escHtml(p.kategori_produk || '')}</div>
      <div class="kcard-name">${escHtml(p.nama_produk)}</div>
      <div class="kcard-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <meta itemprop="priceCurrency" content="IDR"><meta itemprop="price" content="${harga}">
        <meta itemprop="availability" content="${avail ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}">
        ${fmtRp(harga)} <small>/ hari</small>
      </div>
      <div class="kcard-price-3d"><strong>${fmtRp(harga3)}</strong> / 3 hari</div>
    </div>
  </a>`;
}

async function prerenderFaqPage(html, faqs) {
  if (!faqs.length) return html;
  // The faq.html has groups by category. Group active faqs by category.
  const byCat = {};
  faqs.forEach((f) => {
    const c = f.category || 'umum';
    (byCat[c] = byCat[c] || []).push(f);
  });
  // Note: The static faq.html has hardcoded groups. We don't replace those
  // (they are content-rich already); instead we inject FAQPage JSON-LD only.
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: (f.answer || '').replace(/<[^>]+>/g, '') }
    }))
  };
  return injectBeforeClose(html, 'head', `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>`);
}

async function prerenderLokasiPage(html, locations) {
  if (!locations.length) return html;
  // Inject LocalBusiness array schema
  const businessLd = locations.map((l) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: l.branch_name,
    image: `${SITE_URL}/logo-7summits-mark.png`,
    address: { '@type': 'PostalAddress', streetAddress: l.address || '', addressLocality: 'Bandung', addressRegion: 'Jawa Barat', addressCountry: 'ID' },
    telephone: l.phone || '+6281121114410',
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], opens: l.open_time || '09:00', closes: l.close_time || '20:00' }],
    priceRange: 'Rp75.000 - Rp1.000.000'
  }));
  return injectBeforeClose(html, 'head', businessLd.map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`).join('\n'));
}

async function prerenderPdp(template, p, enrich, allProduk, enrichMap) {
  const e = enrich || {};
  const nama = p.nama_produk;
  const kat = p.kategori_produk || '';
  const harga = p.harga_sewa_per_hari || 0;
  const stok = (p.stok_total || 0) - (p.stok_dalam_perbaikan || 0);
  const avail = stok > 0;
  const imgUrl = e.image_url || '';
  const allImages = [e.image_url, e.image_url_2, e.image_url_3, e.image_url_4, e.image_url_5, e.image_url_6].filter(Boolean);
  const desc = e.description || `Sewa ${cleanModel(nama)} di Bandung di 7summits Camera. Harga sewa Rp ${Number(harga).toLocaleString('id-ID')}/hari. Promo 3 hari bayar 2 hari. Lokasi: ${p.cabang_id || 'Bandung'}.`;
  const slug = slugify(nama);
  const cabang = p.cabang_id || '-';
  const brand = detectBrand(nama);
  const cleaned = cleanModel(nama);

  // Build the static product content (matches the runtime renderProduct shape, simpler)
  const kelArr = (e.includes || p.kelengkapan || '').split(/[,;·]+/).map((s) => s.trim()).filter(Boolean);
  const kelHtml = kelArr.length
    ? kelArr.map((k) => `<div class="kel-item"><div class="kel-check">✓</div><div class="kel-name">${escHtml(k)}</div></div>`).join('')
    : '<div style="grid-column:1/-1;text-align:center;color:var(--ink-4);padding:40px;font-size:13px">Kelengkapan standar — hubungi tim untuk daftar lengkap.</div>';

  const heroImgHtml = imgUrl
    ? `<img src="${escHtml(imgUrl)}" alt="${escHtml(nama)}" loading="eager">`
    : `<div class="prod-ph"><div class="prod-ph-ico">${getIcon(kat)}</div><div class="prod-ph-brand">${escHtml(brand || 'Gear')}</div><div class="prod-ph-model">${escHtml(cleaned)}</div></div>`;

  const thumbs = allImages.length
    ? allImages.map((src, i) => `<div class="hero-thumb${i === 0 ? ' active' : ''}" onclick="pdpSwapImg('${escHtml(src)}',this)"><img src="${escHtml(src)}" alt="thumb ${i + 1}" loading="lazy"></div>`).join('')
    : `<div class="hero-thumb active"><div class="hero-thumb-empty">—</div></div>`;

  // Related (same category, exclude self, top 8)
  const related = allProduk.filter((x) => x.id !== p.id && x.kategori_produk === kat).slice(0, 8);
  const relatedHtml = related.length
    ? related.map((r) => {
        const rE = enrichMap[r.id] || {};
        const rImg = rE.image_url || '';
        const rSlug = slugify(r.nama_produk);
        return `<a href="/product/${rSlug}" class="rel-card">
          <div class="rel-img">${rImg ? `<img src="${escHtml(rImg)}" alt="${escHtml(r.nama_produk)}" loading="lazy">` : '<div class="prod-ph"><div class="prod-ph-ico">' + getIcon(r.kategori_produk) + '</div></div>'}</div>
          <div class="rel-body">
            <div class="rel-cat">${escHtml(r.kategori_produk || '')}</div>
            <div class="rel-name">${escHtml(cleanModel(r.nama_produk))}</div>
            <div class="rel-price">${fmtRp(r.harga_sewa_per_hari)} <small>/ hari</small></div>
          </div></a>`;
      }).join('')
    : '<div style="grid-column:1/-1;color:var(--ink-4);text-align:center;padding:30px">Tidak ada produk serupa.</div>';

  // FAQ (auto from generic + product-specific)
  const FAQ_GENERIC = [
    { q: `Berapa harga sewa ${cleaned}?`, a: `Sewa ${cleaned} di 7summits Camera Bandung adalah Rp ${Number(harga).toLocaleString('id-ID')}/hari. Promo 3 hari bayar 2 hari berlaku — total 3 hari = Rp ${Number(harga * 2).toLocaleString('id-ID')}.` },
    { q: 'Apa saja syarat sewa?', a: 'KTP + KTP Penjamin (kerabat dekat), foto selfie dengan KTP, dan deposit (cash atau transfer). Untuk gear premium di atas Rp 500rb/hari, deposit menyesuaikan harga unit.' },
    { q: 'Berapa lama minimum sewa?', a: 'Minimum sewa 1 hari (24 jam). Tersedia paket 3 hari bayar 2 hari untuk semua gear.' },
    { q: 'Apakah bisa antar-jemput?', a: 'Tersedia antar-jemput di area Bandung Kota dengan ongkos sesuai jarak. Pickup mandiri di Cisaranten / Sriwijaya gratis.' },
    { q: 'Bagaimana cara booking gear ini?', a: 'Klik tombol "Booking Sekarang" untuk masuk ke sistem booking, atau tambahkan ke daftar inquiry untuk konsultasi via WhatsApp dulu. Tim kami akan respon < 30 menit di jam operasional (09:00–20:00 WIB).' }
  ];
  const faqHtml = FAQ_GENERIC.map((f) => `<div class="faq-item" onclick="this.classList.toggle('open')">
    <div class="faq-q">${escHtml(f.q)}</div>
    <div class="faq-a">${escHtml(f.a)}</div>
  </div>`).join('');

  const productHtml = `<section class="hero-grid">
    <div class="hero-gallery">
      <div class="hero-img-main" id="pdp-main-img">${heroImgHtml}</div>
      <div class="hero-thumbs">${thumbs}</div>
    </div>
    <div class="hero-info">
      <div class="hero-info-cat">${getIcon(kat)} ${escHtml(kat)}</div>
      <h1 class="hero-info-name">${escHtml(cleaned)}</h1>
      <p class="hero-info-tagline">${escHtml(desc)}</p>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hero-stat-lbl">Status</div><div class="hero-stat-val ${avail ? 'green' : 'orange'}">${avail ? '● Tersedia' : '● Stok Habis'}</div></div>
        <div class="hero-stat"><div class="hero-stat-lbl">Stok</div><div class="hero-stat-val">${Math.max(0, stok)} unit</div></div>
        <div class="hero-stat"><div class="hero-stat-lbl">Lokasi</div><div class="hero-stat-val" style="text-transform:capitalize">${escHtml(cabang)}</div></div>
      </div>
      <div class="hero-price-block">
        <div class="hero-price-row">
          <div class="hero-price">${fmtRp(harga)} <small>/ hari</small></div>
          <div class="hero-price-disc">3 hari = bayar 2 hari</div>
        </div>
        <div class="hero-promo">💡 <strong>Hemat 33%</strong> untuk sewa 3+ hari berturut. Berlaku semua produk tanpa minimum order.</div>
      </div>
      <div class="hero-cta-row">
        <button id="cta-add" class="hero-cta-add" onclick="addThisToCart()">＋ Tambah ke Daftar Inquiry</button>
        <a class="hero-cta-book" href="${BOOKING_URL}" target="_blank" rel="noopener">📅 Booking Langsung</a>
      </div>
      <div class="hero-trust">
        <div class="hero-trust-item"><div class="hero-trust-ico">✓</div>Unit ter-quality control</div>
        <div class="hero-trust-item"><div class="hero-trust-ico">✓</div>Antar-jemput area Bandung</div>
        <div class="hero-trust-item"><div class="hero-trust-ico">✓</div>Quick onboarding gear</div>
        <div class="hero-trust-item"><div class="hero-trust-ico">✓</div>Promo 3 bayar 2 aktif</div>
      </div>
    </div>
  </section>
  <section class="pdp-sec" id="kelengkapan">
    <div class="pdp-sec-hdr"><span class="pdp-sec-lbl">Kelengkapan</span><h2 class="pdp-sec-h2">Yang termasuk dalam sewa</h2></div>
    <div class="kel-grid">${kelHtml}</div>
  </section>
  <section class="pdp-sec" id="related">
    <div class="pdp-sec-hdr"><span class="pdp-sec-lbl">Lihat Juga</span><h2 class="pdp-sec-h2">Produk serupa di kategori ${escHtml(kat)}</h2></div>
    <div class="rel-grid">${relatedHtml}</div>
  </section>
  <section class="pdp-sec" id="faq">
    <div class="pdp-sec-hdr"><span class="pdp-sec-lbl">FAQ</span><h2 class="pdp-sec-h2">Pertanyaan yang sering ditanya</h2></div>
    <div class="faq-list">${faqHtml}</div>
  </section>`;

  let html = template;
  html = setTitle(html, `Sewa ${cleaned} di Bandung — Rp ${Number(harga).toLocaleString('id-ID')}/hari · 7summits Camera`);
  html = setMeta(html, 'name', 'description', `Sewa ${cleaned} di 7summits Camera Bandung — Rp ${Number(harga).toLocaleString('id-ID')}/hari. Promo 3 hari bayar 2. ${cleaned} ${avail ? 'tersedia siap booking' : 'stok terbatas'}.`);
  if (imgUrl) {
    if (/<meta property="og:image"/.test(html)) html = setMeta(html, 'property', 'og:image', imgUrl);
    else html = injectBeforeClose(html, 'head', `<meta property="og:image" content="${escHtml(imgUrl)}">`);
  }
  // Inject canonical
  const canonical = `${SITE_URL}/product/${slug}`;
  if (/<link rel="canonical"/.test(html)) html = html.replace(/(<link rel="canonical"[^>]*href=["'])[^"']*(["'])/, `$1${canonical}$2`);
  else html = injectBeforeClose(html, 'head', `<link rel="canonical" href="${canonical}">`);

  // Update breadcrumb
  html = html.replace(/<span id="bcrumb-name">[^<]*<\/span>/, `<span id="bcrumb-name">${escHtml(cleaned)}</span>`);

  // Replace product content
  html = html.replace(/(<div id="product-content"[^>]*>)[\s\S]*?(<\/div>\s*<\/main>)/, `$1${productHtml}</div></main>`);

  // Inject Product JSON-LD
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: cleaned,
    description: desc.substring(0, 500),
    image: imgUrl ? [imgUrl, ...allImages.slice(1)] : undefined,
    category: kat,
    brand: brand ? { '@type': 'Brand', name: brand } : undefined,
    sku: String(p.id),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: harga,
      availability: avail ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: canonical,
      seller: { '@type': 'LocalBusiness', name: '7summits Camera Bandung' }
    }
  };
  html = injectBeforeClose(html, 'head', `<script type="application/ld+json">${JSON.stringify(productLd)}</script>`);

  return html;
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log('▶ 7summits prerender starting...');
  const t0 = Date.now();

  // 1. Wipe + recreate dist
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  // 2. Copy static assets
  for (const f of COPY_FILES) {
    try { await fs.copyFile(path.join(SRC, f), path.join(OUT, f)); }
    catch (e) { console.warn(`⚠ skip copy ${f}: ${e.message}`); }
  }
  for (const f of COPY_HTML_AS_IS) {
    try { await fs.copyFile(path.join(SRC, f), path.join(OUT, f)); }
    catch (e) { console.warn(`⚠ skip copy ${f}: ${e.message}`); }
  }

  // 3. Fetch all data in parallel
  console.log('  ↳ fetching Supabase...');
  const [produk, enrichAll, faqs, locations, settingsArr] = await Promise.all([
    tryFetch(BOOKING, 'produk', 'select=id,nama_produk,kategori_produk,harga_sewa_per_hari,kelengkapan,stok_total,stok_dalam_perbaikan,cabang_id&is_deleted=eq.false&status=eq.active&limit=2000'),
    tryFetch(CMS, 'product_enrichments', 'select=*&limit=2000'),
    tryFetch(CMS, 'faqs', 'select=*&is_active=eq.true&order=sort_order.asc&limit=200'),
    tryFetch(CMS, 'locations', 'select=*&is_active=eq.true&order=sort_order.asc&limit=20'),
    tryFetch(CMS, 'site_settings', 'select=*&id=eq.1&limit=1')
  ]);
  const settings = Array.isArray(settingsArr) && settingsArr[0] ? settingsArr[0] : null;
  const enrichMap = {};
  enrichAll.forEach((e) => { enrichMap[e.booking_product_id] = e; });
  console.log(`  ↳ produk=${produk.length} enrich=${enrichAll.length} faqs=${faqs.length} locations=${locations.length} settings=${settings ? '✓' : '✗'}`);

  // 4. Read templates
  const indexTpl = await fs.readFile(path.join(SRC, 'index.html'), 'utf8');
  const katalogTpl = await fs.readFile(path.join(SRC, 'katalog.html'), 'utf8').catch(() => null);
  const pdpTpl = await fs.readFile(path.join(SRC, 'pdp.html'), 'utf8');
  const faqTpl = await fs.readFile(path.join(SRC, 'faq.html'), 'utf8').catch(() => null);
  const lokasiTpl = await fs.readFile(path.join(SRC, 'lokasi.html'), 'utf8').catch(() => null);
  const sriwijayaTpl = await fs.readFile(path.join(SRC, 'sriwijaya.html'), 'utf8').catch(() => null);
  const cisarantenTpl = await fs.readFile(path.join(SRC, 'cisaranten.html'), 'utf8').catch(() => null);

  // 5. Pre-render index.html
  const indexHtml = await prerenderIndex(indexTpl, { produk, enrichMap, faqs, locations, settings });
  await fs.writeFile(path.join(OUT, 'index.html'), indexHtml);
  console.log(`  ↳ wrote index.html (${(indexHtml.length / 1024).toFixed(1)} kb)`);

  // 6. Pre-render katalog.html
  if (katalogTpl) {
    const katalogHtml = await prerenderKatalog(katalogTpl, { produk, enrichMap });
    await fs.writeFile(path.join(OUT, 'katalog.html'), katalogHtml);
    console.log(`  ↳ wrote katalog.html (${(katalogHtml.length / 1024).toFixed(1)} kb, ${produk.length} cards)`);
  }

  // 7. Pre-render faq + lokasi pages with schema
  if (faqTpl) {
    const out = await prerenderFaqPage(faqTpl, faqs);
    await fs.writeFile(path.join(OUT, 'faq.html'), out);
    console.log(`  ↳ wrote faq.html with FAQPage schema (${faqs.length} items)`);
  }
  if (lokasiTpl) {
    const out = await prerenderLokasiPage(lokasiTpl, locations);
    await fs.writeFile(path.join(OUT, 'lokasi.html'), out);
    console.log(`  ↳ wrote lokasi.html with LocalBusiness schema`);
  }
  if (sriwijayaTpl) await fs.writeFile(path.join(OUT, 'sriwijaya.html'), await prerenderLokasiPage(sriwijayaTpl, locations.filter((l) => /sriwij/i.test(l.branch_name || ''))));
  if (cisarantenTpl) await fs.writeFile(path.join(OUT, 'cisaranten.html'), await prerenderLokasiPage(cisarantenTpl, locations.filter((l) => /cisar/i.test(l.branch_name || ''))));

  // 8. Pre-render pdp.html template (fallback for products without static file)
  await fs.writeFile(path.join(OUT, 'pdp.html'), pdpTpl);

  // 9. Generate one static file per product
  await fs.mkdir(path.join(OUT, 'product'), { recursive: true });
  let count = 0;
  for (const p of produk) {
    const html = await prerenderPdp(pdpTpl, p, enrichMap[p.id], produk, enrichMap);
    const slug = slugify(p.nama_produk);
    if (!slug) continue;
    await fs.writeFile(path.join(OUT, 'product', `${slug}.html`), html);
    count++;
  }
  console.log(`  ↳ wrote ${count} product/<slug>.html files`);

  // 10. Update sitemap.xml with all product URLs
  try {
    let sitemap = await fs.readFile(path.join(SRC, 'sitemap.xml'), 'utf8');
    const productUrls = produk.map((p) => `  <url>
    <loc>${SITE_URL}/product/${slugify(p.nama_produk)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');
    sitemap = sitemap.replace('</urlset>', `${productUrls}\n</urlset>`);
    await fs.writeFile(path.join(OUT, 'sitemap.xml'), sitemap);
    console.log(`  ↳ updated sitemap.xml with ${produk.length} product URLs`);
  } catch (e) { console.warn(`⚠ sitemap update skipped: ${e.message}`); }

  console.log(`✓ Prerender done in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
}

main().catch((e) => {
  console.error('✗ Prerender failed:', e);
  process.exit(1);
});
