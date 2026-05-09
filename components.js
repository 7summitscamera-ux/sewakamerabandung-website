// 7summits Camera — Shared Components
// Include di setiap halaman dengan: <script src="/components.js"></script>
// Lalu di body: <div id="navbar-placeholder"></div> dan <div id="footer-placeholder"></div>

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
      <li><a href="/#produk">Produk</a></li>
      <li><a href="/paket.html">Paket</a></li>
      <li><a href="/panduan.html">Panduan</a></li>
      <li><a href="/faq.html">FAQ</a></li>
      <li><a href="/lokasi.html">Lokasi</a></li>
      <li><a href="/tentang.html">Tentang</a></li>
    </ul>
    <div class="nav-acts">
      <a href="https://wa.me/${BRAND.waNumber}"><button class="btn-g">WhatsApp</button></a>
      <a href="${BRAND.bookingUrl}"><button class="btn-p">Booking Sekarang →</button></a>
    </div>
  </div>
</nav>`;
  // scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 20);
  });
  // highlight active page
  const path = location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path || (path === '/' && a.getAttribute('href') === '/')) {
      a.style.color = '#fff';
      a.style.background = 'rgba(255,255,255,0.06)';
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
          <a href="${BRAND.instagram}" target="_blank" class="footer-soc">📸</a>
          <a href="${BRAND.youtube}" target="_blank" class="footer-soc">▶</a>
          <a href="https://wa.me/${BRAND.waNumber}" class="footer-soc">💬</a>
        </div>
      </div>
      <div class="fcol"><h4>Gear</h4><ul>
        <li><a href="/#produk">Kamera</a></li>
        <li><a href="/#produk">Lensa</a></li>
        <li><a href="/#produk">Lighting</a></li>
        <li><a href="/#produk">Video Support</a></li>
        <li><a href="/#produk">Audio</a></li>
      </ul></div>
      <div class="fcol"><h4>Paket</h4><ul>
        <li><a href="/paket.html#event">Paket Event</a></li>
        <li><a href="/paket.html#wisuda">Paket Wisuda</a></li>
        <li><a href="/paket.html#sineas">Paket Sineas</a></li>
      </ul></div>
      <div class="fcol"><h4>Platform</h4><ul>
        <li><a href="${BRAND.bookingUrl}">Sistem Booking</a></li>
        <li><a href="/panduan.html">Panduan Gear</a></li>
        <li><a href="/faq.html">FAQ Lengkap</a></li>
        <li><a href="/promo.html">Promo Aktif</a></li>
      </ul></div>
      <div class="fcol"><h4>Perusahaan</h4><ul>
        <li><a href="/tentang.html">Tentang Kami</a></li>
        <li><a href="/lokasi/cisaranten.html">Cisaranten</a></li>
        <li><a href="/lokasi/sriwijaya.html">Sriwijaya</a></li>
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
