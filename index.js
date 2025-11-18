const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";
const STORAGE_KEY = 'rainy_basket_v1';
const HEADER_PATH = 'global.html';

function attachBasketHandlers() {
  const basketBtn = document.getElementById('basketBtn') || document.querySelector('.basket-btn') || document.querySelector('[data-basket-btn]');
  const overlay = document.querySelector('.basket-popup-overlay') || document.getElementById('basketPopup');
  if (!basketBtn || !overlay) return;

  const popup = overlay.querySelector('.basket-popup') || overlay;
  const closeBtn = overlay.querySelector('.basket-close-btn');
  const contentEl = overlay.querySelector('#basketPopupContent') || overlay.querySelector('.basket-popup-content') || overlay.querySelector('.basketPopupContent');
  const footerEl = overlay.querySelector('#basketPopupFooter') || overlay.querySelector('.basket-popup-footer') || overlay.querySelector('.basketPopupFooter');
  const badgeEls = document.querySelectorAll('.basket-count');

  function readItems() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  }
  function saveItems(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { console.warn('save basket failed', e); }
  }

  let items = readItems();

  function updateBadge() {
    const count = items.length;
    badgeEls.forEach(b => { b.textContent = String(count); b.style.display = count ? 'inline-block' : 'none'; });
  }

  function openBasket() {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');

    overlay.style.position = 'fixed';
    overlay.style.top = '60px';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = 'calc(100% - 60px)';
    overlay.style.zIndex = '1000';
    overlay.style.background = 'rgba(255,255,255,0.95)';

    render();
  }

  function closeBasket() {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');

    overlay.style.position = '';
    overlay.style.top = '';
    overlay.style.height = '';
    overlay.style.zIndex = '';
    overlay.style.background = '';
  }

  function addItem(name, price, image) {
    const imgField = image ? (String(image).trim()) : '';
    items.push({ name: String(name || 'Product'), price: String(price || '0'), image: imgField });
    saveItems(items);
    updateBadge();
    render();
    openBasket();
  }

  function removeItem(index) {
    if (index < 0 || index >= items.length) return;
    items.splice(index, 1);
    saveItems(items);
    updateBadge();
    render();
  }

  function render() {
    if (!contentEl || !footerEl) return;

    if (items.length === 0) {
      contentEl.innerHTML = '<div class="empty-basket-message">Your basket is empty.</div>';
      footerEl.innerHTML = '';
      updateBadge();
      return;
    }

    contentEl.innerHTML = items.map((it, idx) => {
      const name = escapeHtml(it.name);
      const price = escapeHtml(it.price);
      let imgHtml = '';
      if (!it.image) {
        imgHtml = `<div class="basket-item-image" style="width:60px;height:60px;background:#f2f2f2;border-radius:6px"></div>`;
      } else if (/^\s*<img/i.test(String(it.image))) {
       return `
        <div class="basket-item" data-index="${idx}" style="display:flex;gap:12px;align-items:center;padding:8px 6px;border-bottom:1px solid #eee;">
          <div class="b-left">${imgHtml}</div>
          <div class="b-mid" style="flex:1;min-width:0;">
            <p class="basket-item-name" style="margin:0;font-weight:600">${name}</p>
            <p class="basket-item-price" style="margin:4px 0 0;color:#666">${price}</p>
          </div>
          <div class="b-right">
            <button class="basket-remove-btn" data-index="${idx}" style="padding:6px 8px;border-radius:6px;border:1px solid rgba(0,0,0,0.08);background:transparent;cursor:pointer">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    const total = items.reduce((s, it) => s + (Number(String(it.price).replace(/[^0-9.-]+/g,'')) || 0), 0);
    footerEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:8px;">
        <div><strong>Total:</strong> ${formatPrice(total)}</div>
        <div>confirmation.htmlCheckout</a></div>
      </div>
    `;

    contentEl.querySelectorAll('.basket-remove-btn').forEach(btn => {
      btn.removeEventListener('click', onRemoveClick);
      btn.addEventListener('click', onRemoveClick);
    });

    updateBadge();
  }

  function onRemoveClick(e) {
    const btn = e.currentTarget;
    const idx = Number(btn.dataset.index);
    removeItem(idx);
  }

  basketBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); items = readItems(); render(); openBasket(); });
  closeBtn?.addEventListener('click', (e) => { e.preventDefault(); closeBasket(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeBasket(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBasket(); });

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    if (btn.dataset.rainyBound) return;
    btn.dataset.rainyBound = '1';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.dataset.name || btn.getAttribute('data-name') || btn.closest('[data-name]')?.dataset?.name || btn.textContent.trim();
      const price = btn.dataset.price || btn.getAttribute('data-price') || btn.closest('[data-price]')?.dataset?.price || '0';
      const image = btn.dataset.image || btn.getAttribute('data-image') || btn.querySelector('img')?.src || '';
      addItem(name, price, image);
    });
  });

  updateBadge();
  render();

  window.__rainyBasket = window.__rainyBasket || {};
  window.__rainyBasket.add = function(item) { addItem(item.name, item.price, item.image); };
  window.__rainyBasket.read = readItems;
  window.__rainyBasket.clear = function() { items = []; saveItems(items); render(); updateBadge(); };
}
