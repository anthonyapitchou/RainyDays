const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";
const STORAGE_KEY = 'rainy_basket_v1'; // ✅ panier storage key


/* ------------------ Helpers ------------------ */
function $id(id) { return document.getElementById(id); }
function escapeHtml(str = '') {
  return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'", '&#39;');
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
    const response = await fetch('global.html'); // ton fichier global
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
      const name = escapeHtml(it.name), price = escapeHtml(it.price), image = escapeHtml(it.image || 'picture/default.png');
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
    addToBasket(btn.dataset.name || btn.getAttribute('data-name'),
                btn.dataset.price || btn.getAttribute('data-price'),
                btn.dataset.image || btn.getAttribute('data-image') || btn.querySelector('img')?.src);
  }

  updateBasketCount();
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

/* ------------------ Initialize header/footer ------------------ */
function initializeHeaderFunctionality() {
  if (window._headerInitDone) return;
  window._headerInitDone = true;
  attachBasketHandlers();
  attachFilterHandlers();
  console.log('Header/Footer functionality initialized');
}

/* ------------------ Load product ------------------ */
async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;
  try {
    const response = await fetch(`${apiUrl}/${id}`);
    if (!response.ok) throw new Error('API error');
    const product = await response.json();
    $id('product-title').textContent = product.title;
    $id('product-price').textContent = `$${product.price}`;
    $id('product-image').src = product.image;
  } catch (error) { console.error(error); }
}

/* ------------------ DOMContentLoaded ------------------ */
document.addEventListener('DOMContentLoaded', () => {
  loadHeaderFooter();
  loadProduct();
});

