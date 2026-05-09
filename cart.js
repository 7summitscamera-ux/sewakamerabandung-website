// 7summits Camera — Shared inquiry cart
// localStorage-backed, no auth, opens WhatsApp on submit.
// Include after Supabase JS (cart fetches product data).

(function(){
  const KEY = 'sc7_inquiry_cart_v1';
  const WA = '6281121114410';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){ return []; }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateBadge();
  }
  function add(item) {
    const items = read();
    const i = items.findIndex(x => x.id === item.id);
    if (i >= 0) items[i].qty = (items[i].qty || 1) + 1;
    else items.push({ id: item.id, slug: item.slug, name: item.name, kategori: item.kategori, harga: item.harga, image: item.image || '', qty: 1 });
    write(items);
    flashCart();
  }
  function remove(id) { write(read().filter(x => x.id !== id)); render(); }
  function setQty(id, qty) {
    const items = read();
    const x = items.find(x => x.id === id);
    if (!x) return;
    x.qty = Math.max(1, parseInt(qty)||1);
    write(items);
    render();
  }
  function clear() { write([]); render(); }

  function count() { return read().reduce((n,x) => n + (x.qty||1), 0); }
  function totalHarga() { return read().reduce((n,x) => n + ((x.harga||0)*(x.qty||1)), 0); }

  function updateBadge() {
    const b = document.getElementById('sc7-cart-badge');
    if (!b) return;
    const c = count();
    b.textContent = c;
    b.style.display = c > 0 ? 'flex' : 'none';
  }

  function flashCart() {
    const fab = document.getElementById('sc7-cart-fab');
    if (!fab) return;
    fab.classList.add('sc7-flash');
    setTimeout(() => fab.classList.remove('sc7-flash'), 600);
  }

  function fmtRp(n) { return 'Rp ' + Number(n||0).toLocaleString('id-ID'); }
  function escHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function render() {
    const wrap = document.getElementById('sc7-cart-items');
    if (!wrap) return;
    const items = read();
    if (!items.length) {
      wrap.innerHTML = '<div class="sc7-cart-empty"><div style="font-size:40px;opacity:.4;margin-bottom:14px">📋</div><div style="font-weight:600;margin-bottom:6px;color:#0E1217">Daftar inquiry kosong</div><div style="font-size:13px;color:#6B7280;line-height:1.55;font-weight:400">Tambah produk yang mau dicek availability-nya. Submit untuk dapat respon dari tim kami.</div></div>';
    } else {
      wrap.innerHTML = items.map(x => `
        <div class="sc7-cart-item">
          <div class="sc7-cart-img">${x.image ? `<img src="${escHtml(x.image)}" alt="${escHtml(x.name)}" onerror="this.style.display='none'">` : '📷'}</div>
          <div class="sc7-cart-info">
            <a href="/product/${escHtml(x.slug)}" class="sc7-cart-name">${escHtml(x.name)}</a>
            <div class="sc7-cart-meta">${escHtml(x.kategori||'')} · ${fmtRp(x.harga)}/hari</div>
            <div class="sc7-cart-qty">
              <button onclick="sc7Cart.setQty('${escHtml(x.id)}',${(x.qty||1)-1})" class="sc7-qty-btn">−</button>
              <span class="sc7-qty-val">${x.qty||1}</span>
              <button onclick="sc7Cart.setQty('${escHtml(x.id)}',${(x.qty||1)+1})" class="sc7-qty-btn">+</button>
              <button onclick="sc7Cart.remove('${escHtml(x.id)}')" class="sc7-cart-rm" title="Hapus">×</button>
            </div>
          </div>
        </div>
      `).join('');
    }
    document.getElementById('sc7-cart-total').textContent = fmtRp(totalHarga()) + ' /hari';
    document.getElementById('sc7-cart-count-line').textContent = items.length + ' item · total ' + count() + ' qty';
    const submit = document.getElementById('sc7-cart-submit');
    if (submit) submit.disabled = !items.length;
  }

  function open() {
    document.getElementById('sc7-cart-drawer').classList.add('open');
    document.getElementById('sc7-cart-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    render();
  }
  function close() {
    document.getElementById('sc7-cart-drawer').classList.remove('open');
    document.getElementById('sc7-cart-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function submit() {
    const items = read();
    if (!items.length) return;
    const startDate = document.getElementById('sc7-cart-start').value;
    const endDate = document.getElementById('sc7-cart-end').value;
    const notes = document.getElementById('sc7-cart-notes').value.trim();
    const lines = [
      'Halo 7summits Camera, saya mau cek availability gear berikut:',
      '',
      ...items.map((x,i) => `${i+1}. ${x.name}` + (x.qty>1?` (qty ${x.qty})`:'') + ` — ${fmtRp(x.harga)}/hari`),
      '',
      startDate ? `Tanggal mulai: ${startDate}` : null,
      endDate ? `Tanggal selesai: ${endDate}` : null,
      notes ? `Catatan: ${notes}` : null,
      '',
      `Total estimasi: ${fmtRp(totalHarga())} / hari`,
      '',
      `Dikirim dari: ${location.origin}`
    ].filter(Boolean);
    const msg = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${WA}?text=${msg}`, '_blank');
  }

  function inject() {
    if (document.getElementById('sc7-cart-fab')) return;
    const html = `
<style>
.sc7-fab{position:fixed;bottom:24px;right:24px;width:58px;height:58px;border-radius:50%;background:#0E1217;border:none;cursor:pointer;box-shadow:0 14px 36px rgba(14,18,23,.28),0 4px 12px rgba(14,18,23,.14);z-index:9998;display:flex;align-items:center;justify-content:center;transition:transform .2s ease,box-shadow .2s ease}
.sc7-fab:hover{transform:scale(1.06) translateY(-2px);background:#000;box-shadow:0 18px 44px rgba(14,18,23,.38),0 6px 16px rgba(14,18,23,.2)}
.sc7-fab.sc7-flash{animation:sc7-flash .6s ease}
@keyframes sc7-flash{0%,100%{transform:scale(1)}50%{transform:scale(1.18);box-shadow:0 0 0 16px rgba(142,198,78,.30)}}
.sc7-fab svg{width:24px;height:24px;color:#fff}
.sc7-fab-badge{position:absolute;top:-4px;right:-4px;background:#F06824;color:#fff;font-size:11px;font-weight:700;min-width:22px;height:22px;border-radius:11px;display:none;align-items:center;justify-content:center;padding:0 6px;box-shadow:0 2px 8px rgba(240,104,36,.40);font-family:'Inter','SF Pro Display',sans-serif;border:2px solid #fff}
.sc7-overlay{position:fixed;inset:0;background:rgba(14,18,23,.42);backdrop-filter:blur(6px);z-index:9998;opacity:0;pointer-events:none;transition:opacity .25s ease}
.sc7-overlay.open{opacity:1;pointer-events:auto}
.sc7-drawer{position:fixed;top:0;right:0;bottom:0;width:440px;max-width:92vw;background:#FAFAF7;border-left:1px solid #EAEBE6;z-index:9999;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);font-family:'Inter','SF Pro Display',-apple-system,sans-serif;color:#0E1217}
.sc7-drawer.open{transform:translateX(0);box-shadow:-20px 0 60px rgba(15,18,23,.14)}
.sc7-drawer-hdr{padding:22px 24px;border-bottom:1px solid #EAEBE6;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:#fff}
.sc7-drawer-ttl{font-size:16px;font-weight:700;letter-spacing:-.02em;color:#0E1217}
.sc7-drawer-sub{font-size:12px;color:#6B7280;margin-top:3px;font-weight:500}
.sc7-drawer-close{background:#F2F4EF;border:1px solid #EAEBE6;color:#5B6470;cursor:pointer;font-size:18px;line-height:1;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .15s}
.sc7-drawer-close:hover{color:#0E1217;background:#EDEEE8;border-color:#D6D8D2}
.sc7-drawer-body{flex:1;overflow-y:auto;padding:0 24px}
.sc7-cart-empty{padding:64px 24px;text-align:center;color:#5B6470}
.sc7-cart-item{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #EAEBE6}
.sc7-cart-item:last-child{border-bottom:none}
.sc7-cart-img{width:68px;height:68px;border-radius:10px;background:#fff;border:1px solid #EAEBE6;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;font-size:24px}
.sc7-cart-img img{width:100%;height:100%;object-fit:cover}
.sc7-cart-info{flex:1;min-width:0}
.sc7-cart-name{font-size:13.5px;font-weight:600;line-height:1.35;display:block;color:#0E1217;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;letter-spacing:-.005em}
.sc7-cart-name:hover{color:#4F7B39}
.sc7-cart-meta{font-size:11.5px;color:#6B7280;margin-top:4px;font-weight:500}
.sc7-cart-qty{display:flex;align-items:center;gap:8px;margin-top:10px}
.sc7-qty-btn{width:26px;height:26px;border-radius:7px;border:1px solid #EAEBE6;background:#fff;color:#5B6470;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;transition:all .15s}
.sc7-qty-btn:hover{background:#F2F4EF;color:#0E1217;border-color:#D6D8D2}
.sc7-qty-val{font-size:12.5px;font-weight:600;min-width:20px;text-align:center;color:#0E1217}
.sc7-cart-rm{margin-left:auto;background:transparent;border:none;color:#9CA3AF;cursor:pointer;font-size:18px;line-height:1;padding:0 8px;border-radius:4px;transition:all .15s}
.sc7-cart-rm:hover{color:#dc2626;background:rgba(220,38,38,.08)}
.sc7-cart-form{padding:18px 0;border-top:1px solid #EAEBE6;margin-top:8px}
.sc7-cart-form label{display:block;font-size:10.5px;font-weight:600;letter-spacing:.10em;text-transform:uppercase;color:#6B7280;margin-bottom:7px}
.sc7-cart-form input,.sc7-cart-form textarea{width:100%;background:#fff;border:1px solid #D6D8D2;border-radius:8px;color:#0E1217;font-family:inherit;font-size:13.5px;padding:10px 13px;outline:none;transition:border-color .15s,box-shadow .15s;font-weight:500}
.sc7-cart-form input:focus,.sc7-cart-form textarea:focus{border-color:#8EC64E;box-shadow:0 0 0 3px rgba(142,198,78,.18)}
.sc7-cart-form textarea{resize:vertical;min-height:68px}
.sc7-cart-dates{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.sc7-drawer-ftr{padding:18px 24px 22px;border-top:1px solid #EAEBE6;background:#fff;flex-shrink:0}
.sc7-cart-totals{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px}
.sc7-cart-totlbl{font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:.10em}
.sc7-cart-total{font-size:22px;font-weight:700;color:#0E1217;letter-spacing:-.02em}
.sc7-cart-cntline{font-size:11.5px;color:#6B7280;margin-top:2px;text-align:right;font-weight:500}
.sc7-cart-submit{width:100%;background:#0E1217;color:#fff;border:none;border-radius:999px;font-family:inherit;font-size:14px;font-weight:600;padding:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .15s;letter-spacing:-.005em}
.sc7-cart-submit:hover{background:#000;transform:translateY(-1px);box-shadow:0 12px 32px rgba(14,18,23,.20)}
.sc7-cart-submit:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.sc7-cart-clear{background:transparent;border:none;color:#9CA3AF;font-family:inherit;font-size:11.5px;cursor:pointer;padding:8px 0;margin-top:8px;text-align:center;width:100%;font-weight:500}
.sc7-cart-clear:hover{color:#dc2626}
@media (max-width:600px){.sc7-fab{bottom:16px;right:16px}.sc7-drawer{width:100vw;max-width:100vw}}
</style>
<button id="sc7-cart-fab" class="sc7-fab" onclick="sc7Cart.open()" aria-label="Daftar inquiry">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17"/>
    <circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>
  </svg>
  <span id="sc7-cart-badge" class="sc7-fab-badge">0</span>
</button>
<div id="sc7-cart-overlay" class="sc7-overlay" onclick="sc7Cart.close()"></div>
<aside id="sc7-cart-drawer" class="sc7-drawer">
  <div class="sc7-drawer-hdr">
    <div>
      <div class="sc7-drawer-ttl">Daftar Inquiry</div>
      <div class="sc7-drawer-sub">Cek ketersediaan gear · respon via WhatsApp</div>
    </div>
    <button class="sc7-drawer-close" onclick="sc7Cart.close()" aria-label="Tutup">×</button>
  </div>
  <div class="sc7-drawer-body">
    <div id="sc7-cart-items"></div>
    <div class="sc7-cart-form">
      <div class="sc7-cart-dates">
        <div><label>Mulai sewa</label><input type="date" id="sc7-cart-start"></div>
        <div><label>Selesai sewa</label><input type="date" id="sc7-cart-end"></div>
      </div>
      <div><label>Catatan (opsional)</label><textarea id="sc7-cart-notes" placeholder="Lokasi pickup, kebutuhan project, dll..."></textarea></div>
    </div>
  </div>
  <div class="sc7-drawer-ftr">
    <div class="sc7-cart-totals">
      <div>
        <div class="sc7-cart-totlbl">Estimasi total</div>
        <div id="sc7-cart-total" class="sc7-cart-total">Rp 0 /hari</div>
      </div>
      <div id="sc7-cart-count-line" class="sc7-cart-cntline">0 item</div>
    </div>
    <button id="sc7-cart-submit" class="sc7-cart-submit" onclick="sc7Cart.submit()" disabled>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      Kirim Inquiry via WhatsApp
    </button>
    <button class="sc7-cart-clear" onclick="if(confirm('Kosongkan daftar?'))sc7Cart.clear()">Kosongkan daftar</button>
  </div>
</aside>`;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    updateBadge();
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  window.sc7Cart = { add, remove, setQty, clear, open, close, submit, count, read };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();
