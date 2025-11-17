const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";
const STORAGE_KEY = 'rainy_basket_v1'; // ✅ panier storage key


/* ------------------ Helpers ------------------ */
function $id(id) { return document.getElementById(id); }
function escapeHtml(str = '') {
  return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'", '&#39;');
}
function escapeAttr(str = '') {
  return String(str).replaceAll('"','&quot;').replaceAll("'", '&#39;');
}
function formatPrice(n) {
  if (n === null || n === undefined) return '';
  const val = Number(n);
  if (Number.isNaN(val)) return String(n);
  return val % 1 === 0 ? `$${val}` : `$${val.toFixed(2)}`;
}

/* ------------------ Load header & footer ------------------ */
async function loadHeaderFooter() {
  try {
    const response = await fetch('global.html');
    const text = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;

    const header = tempDiv.querySelector('header');
    if (header) $id('header-container')?.appendChild(header);

    const footer = tempDiv.querySelector('footer');
    if (footer) $id('footer-container')?.appendChild(footer);

    initializeHeaderFunctionality();
  } catch (err) {
    console.error('Erreur chargement header/footer:', err);
  }
}

/* ------------------ Basket handlers ------------------ */
function attachBasketHandlers() {
  const basketBtn = $id('basketBtn');
  const basketPopup = $id('basketPopup');
  const basketCloseBtn = document.querySelector('.basket-close-btn');
  const basketCount = $id('basketCount');
  const basketPopupContent = $id('basketPopupContent');
  const basketPopupFooter = $id('basketPopupFooter');

  if (!basketBtn) return;

  let basketItems = [];
  try { basketItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } 
  catch { basketItems = []; }

  function saveBasket() { localStorage.setItem(STORAGE_KEY, JSON.stringify(basketItems)); }
  function updateBasketCount() {
    if (!basketCount) return;
    basketCount.textContent = basketItems.length;
    basketCount.style.display = basketItems.length ? 'inline-block' : 'none';
  }
  function openBasket() {
    if (!basketPopup) { window.location.href = 'checkout.html'; return; }
    basketPopup.classList.add('show');
    basketPopup.setAttribute('aria-hidden', 'false');
    renderBasket();
  }
  function closeBasket() {
    if (!basketPopup) return;
    basketPopup.classList.remove('show');
    basketPopup.setAttribute('aria-hidden', 'true');
  }

  basketBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openBasket(); });
  if (basketCloseBtn) basketCloseBtn.addEventListener('click', e => { e.preventDefault(); closeBasket(); });
  if (basketPopup) basketPopup.addEventListener('click', e => { if (e.target === basketPopup) closeBasket(); });

  function addToBasket(name, price, image) {
    basketItems.push({ name: String(name || 'Product'), price: String(price || ''), image: String(image || '') });
    saveBasket(); updateBasketCount(); renderBasket(); openBasket();
  }
  function removeFromBasket(index) {
    if (index < 0 || index >= basketItems.length) return;
    basketItems.splice(index, 1); saveBasket(); updateBasketCount(); renderBasket();
  }
  function renderBasket() {
    if (!basketPopupContent) return;
    if (!basketItems.length) {
      basketPopupContent.innerHTML = `<p class="empty-basket-message">Your basket is empty.</p>`;
      if (basketPopupFooter) basketPopupFooter.innerHTML = '';
      return;
    }
    const html = basketItems.map((it, idx) => {
      const name = escapeHtml(it.name), price = escapeHtml(it.price), image = escapeAttr(it.image || 'picture/default.png');
      return `<div class="basket-item" data-index="${idx}">
        <img src="${image}" alt="${name}" class="basket-item-image" />
        <div class="basket-item-info">
          <p class="basket-item-name">${name}</p>
          <p class="basket-item-price">${price}</p>
        </div>
        <button class="basket-remove-btn" data-index="${idx}" aria-label="Remove item">Remove</button>
      </div>`;
    }).join('');
    basketPopupContent.innerHTML = html;
    if (basketPopupFooter) {
      const total = basketItems.reduce((sum,it) => sum + (Number(String(it.price).replace(/[^0-9.-]+/g,'')) || 0),0);
      basketPopupFooter.innerHTML = `<div class="basket-footer-inner">
        <p><strong>Total:</strong> ${formatPrice(total)}</p>
        <a href="confirmation.html" class="confirm-btn">Confirm my order</a>
      </div>`;
    }
  }

  if (basketPopupContent) basketPopupContent.addEventListener('click', e => {
    const btn = e.target.closest('.basket-remove-btn'); if (!btn) return; removeFromBasket(Number(btn.dataset.index));
  });

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.removeEventListener('click', onAddToCartClick);
    btn.addEventListener('click', onAddToCartClick);
  });
  function onAddToCartClick(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    addToBasket(btn.dataset.name, btn.dataset.price, btn.dataset.image);
  }

  updateBasketCount();

  // expose function for external use
  window.addToBasket = addToBasket;
}

/* ------------------ Filter handlers ------------------ */
function attachFilterHandlers() {
  const filterBtn = $id('filter-btn');
  const filterPopup = $id('filter-popup');
  const filterCloseBtn = filterPopup?.querySelector('.filter-close-btn');
  const searchInput = $id('search-input');
  const filterLinks = document.querySelectorAll('.filter-link');

  if (!filterPopup) return;

  function showFilter() { filterPopup.classList.add('show'); filterPopup.setAttribute('aria-hidden','false'); }
  function hideFilter() { filterPopup.classList.remove('show'); filterPopup.setAttribute('aria-hidden','true'); }

  filterBtn?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); filterPopup.classList.toggle('show'); });
  searchInput?.addEventListener('focus', showFilter); searchInput?.addEventListener('click', showFilter);
  filterCloseBtn?.addEventListener('click', hideFilter);
  filterPopup.addEventListener('click', e => { if(e.target===filterPopup) hideFilter(); });
  filterLinks.forEach(link => link.addEventListener('click', e => { e.preventDefault(); console.log('Filter selected:', link.dataset.category); hideFilter(); }));
}

/* ------------------ Initialize ------------------ */
function initializeHeaderFunctionality() {
  if (window._headerInitDone) return;
  window._headerInitDone = true;
  attachBasketHandlers();
  attachFilterHandlers();
  console.log('Header/Footer functionality initialized');
}

/* ------------------ Load women products ------------------ */
const FALLBACK = [
  { name: 'LadyShield', shortDescription: 'Light waterproof jacket', price: '200$', image: 'picture/RainyDays_Jacket2.png', link: '#' },
  { name: 'AquaBelle', shortDescription: 'Slim fit rain jacket', price: '190$', image: 'picture/RainyDays_Jacket3.png', link: '#' },
  { name: 'CloudWrap', shortDescription: 'Hooded jacket - breathable', price: '210$', image: 'picture/RainyDays_Jacket7.png', link: '#' }
];

async function loadWomenProducts() {
  const container = document.querySelector('.grid-container');
  if (!container) return;

  try {
    const resp = await fetch(`${apiUrl}?category=women`, { cache: 'no-cache' });
    if (!resp.ok) throw new Error('API returned ' + resp.status);
    const json = await resp.json();
    const products = json?.data || json?.products || json?.items || json || [];
    renderProducts(container, products.length ? products : FALLBACK);
  } catch (err) {
    console.warn('women.js fetch failed, using fallback data. Error:', err);
    renderProducts(container, FALLBACK);
  }
}

function renderProducts(container, products) {
  container.innerHTML = products.map(p => {
    const name = escapeHtml(p.name), desc = escapeHtml(p.shortDescription || ''), price = escapeHtml(p.price || '$0'), img = escapeAttr(p.image || 'picture/default.png'), link = escapeAttr(p.link || '#');
    return `
      <div class="grid">
        <img src="${img}" alt="${name}" class="review-img">
        <div class="card-content">
          <h3>${name}</h3>
          <p>${desc}</p>
          <p><b>${price}</b></p>
          <a href="${link}" class="cta"><strong> view</strong></a>
          <button class="cta add-to-cart" data-name="${escapeAttr(p.name||'Product')}" data-price="${escapeAttr(p.price||'')}" data-image="${img}" type="button">Add to basket</button>
        </div>
      </div>
    `;
  }).join('\n');
  document.querySelectorAll('.add-to-cart').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    window.addToBasket(btn.dataset.name, btn.dataset.price, btn.dataset.image);
  }));
}

/* ------------------ DOMContentLoaded ------------------ */
document.addEventListener('DOMContentLoaded', () => {
  loadHeaderFooter();
  loadWomenProducts();
});


