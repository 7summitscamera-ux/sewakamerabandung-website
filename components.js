// 7summits Camera — Shared Components
// Include in each page: <script src="/components.js"></script>
// Then in body: <div id="navbar-placeholder"></div> and <div id="footer-placeholder"></div>

const BRAND = {
  bookingUrl: 'https://booking.sewakamerabandung.id',
  waNumber: '6281121114410',
  instagram: 'https://instagram.com/sewakamerabandung.id',
  youtube: 'https://www.youtube.com/@7summitscamera',
};

function injectNavbar() {
  const el = document.getElementById('navbar-placeholder');
  if (!el) return;
  el.outerHTML = `
<div class="ann-bar">
  Promo aktif: sewa 3 hari bayar 2 hari — berlaku semua produk
  <a href="${BRAND.bookingUrl}">Booking sekarang →</a>
</div>
<nav id="navbar">
  <div class="nav-inner">
    <a href="/" class="nav-logo"><img src="/logo-7summits.png" alt="7summits Camera"></a>
    <ul class="nav-links">
      <li><a href="/katalog.html">Katalog</a></li>
      <li><a href="/paket.html">Paket</a></li>
      <li><a href="/panduan.html">Panduan</a></li>
      <li><a href="/faq.html">FAQ</a></li>
      <li><a href="/lokasi.html">Lokasi</a></li>
      <li><a href="/tentang.html">Tentang</a></li>
    </ul>
    <div class="nav-acts">
      <a href="https://wa.me/${BRAND.waNumber}"><button class="btn-g">WhatsApp</button></a>
      <a href="${BRAND.bookingUrl}"><button class="btn-p">Booking →</button></a>
    </div>
  </div>
</nav>`;
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 20);
  });
  const path = location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '/' && href === '/')) {
      a.classList.add('is-active');
    }
  });
}

function injectFooter() {
  const el = document.getElementById('footer-placeholder');
  if (!el) return;
  el.outerHTML = `
<footer>
  <div class="cont">
    <div class="footer-grid">
      <div>
        <img src="/logo-7summits.png" alt="7summits Camera" class="footer-logo">
        <p class="footer-desc">Platform sewa gear produksi visual profesional di Bandung. Partner kreatif untuk filmmaker, fotografer, dan content creator.</p>
        <div class="footer-socs">
          <a href="${BRAND.instagram}" target="_blank" class="footer-soc" aria-label="Instagram">📸</a>
          <a href="${BRAND.youtube}" target="_blank" class="footer-soc" aria-label="YouTube">▶</a>
          <a href="https://wa.me/${BRAND.waNumber}" class="footer-soc" aria-label="WhatsApp">💬</a>
        </div>
      </div>
      <div class="fcol"><h4>Gear</h4><ul>
        <li><a href="/katalog.html?cat=KAMERA">Kamera</a></li>
        <li><a href="/katalog.html?cat=LENSA">Lensa</a></li>
        <li><a href="/katalog.html?cat=LIGHTING">Lighting</a></li>
        <li><a href="/katalog.html?cat=VIDEO%20SUPPORT">Video Support</a></li>
        <li><a href="/katalog.html?cat=AUDIO%20SUPPORT">Audio</a></li>
      </ul></div>
      <div class="fcol"><h4>Layanan</h4><ul>
        <li><a href="/layanan/wedding">Sewa Kamera Wedding</a></li>
        <li><a href="/layanan/wisuda">Paket Wisuda Mahasiswa</a></li>
        <li><a href="/layanan/content-creator">Content Creator Setup</a></li>
        <li><a href="/layanan/sineas">Sineas Indie / TA Film</a></li>
        <li><a href="/paket.html">Semua Paket</a></li>
      </ul></div>
      <div class="fcol"><h4>Platform</h4><ul>
        <li><a href="${BRAND.bookingUrl}">Sistem Booking</a></li>
        <li><a href="/panduan.html">Panduan Gear</a></li>
        <li><a href="/faq.html">FAQ Lengkap</a></li>
        <li><a href="/promo.html">Promo Aktif</a></li>
      </ul></div>
      <div class="fcol"><h4>Area Layanan</h4><ul>
        <li><a href="/area/dago">Sewa Kamera Dago</a></li>
        <li><a href="/area/buah-batu">Sewa Kamera Buah Batu</a></li>
        <li><a href="/area/setiabudi">Sewa Kamera Setiabudi</a></li>
        <li><a href="/area/lembang">Sewa Kamera Lembang</a></li>
        <li><a href="/lokasi.html">Semua Lokasi</a></li>
      </ul></div>
      <div class="fcol"><h4>Perusahaan</h4><ul>
        <li><a href="/tentang.html">Tentang Kami</a></li>
        <li><a href="/cisaranten.html">Cisaranten</a></li>
        <li><a href="/sriwijaya.html">Sriwijaya</a></li>
        <li><a href="/syarat.html">Syarat & Ketentuan</a></li>
      </ul></div>
    </div>
    <div class="footer-btm">
      <p>© 2025 7summits Camera · sewakamerabandung.id · Bandung, Jawa Barat</p>
      <div class="fbr">
        <a href="/syarat.html">Syarat & Ketentuan</a>
        <a href="/privasi.html">Privasi</a>
      </div>
    </div>
  </div>
</footer>`;
}

document.addEventListener('DOMContentLoaded', () => {
  injectNavbar();
  injectFooter();
});
