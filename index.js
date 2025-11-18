// main.js
const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";
const STORAGE_KEY = 'rainy_basket_v1'; // ✅ panier storage key

/* ------------------ Helpers ------------------ */
// --- PATH AUTO POUR GITHUB PAGES ---
let GLOBAL_PATH = 'global.html';  // pour localhost
if (location.pathname.includes('/RainyDays/')) GLOBAL_PATH = '/RainyDays/global.html';
console.log('Using GLOBAL_PATH =', GLOBAL_PATH);

const STORAGE_KEY = 'rainy_basket_v1';

/* ------------------ Helpers ------------------ */
function $id(id) { return document.getElementById(id); }
function escapeHtml(str = '') {
  return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'", '&#39;');
}
function formatPrice(n) {
  if (n == null) return '';
  const val = Number(n);
  return val % 1 === 0 ? `$${val}` : `$${val.toFixed(2)}`;
}

/* ------------------ Load header/footer ------------------ */
async function loadHeaderFooter() {
  try {
    const resp = await fetch(GLOBAL_PATH);
    const html = await resp.text();
    const temp = document.createElement('div');
    temp.innerHTML = html;

    const header = temp.querySelector('header');
    const footer = temp.querySelector('footer');

    if ($id('header-container') && header) $id('header-container').appendChild(header);
    if ($id('footer-container') && footer) $id('footer-container').appendChild(footer);

    initializeHeaderFunctionality();
  } catch (err) {
    console.error('Error loading header/footer', err);
  }
}

/* ------------------ Basket ------------------ */
function attachBasketHandlers() {
  const headerRoot = document.getElementById('header-container') || document;
  const basketBtn = headerRoot.querySelector('#basketBtn');
  const basketPopup = document.getElementById('basketPopup');
  const basketCloseBtn = document.querySelector('.basket-close-btn');
  const basketCount = document.getElementById('basketCount');
  const basketPopupContent = document.getElementById('basketPopupContent');
  const basketPopupFooter = document.getElementById('basketPopupFooter');

  if (!basketBtn) return;

  let basketItems = [];
  try { basketItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { basketItems = []; }

  function saveBasket() { localStorage.setItem(STORAGE_KEY, JSON.stringify(basketItems)); }
  function updateBasketCount() { basketCount.textContent = basketItems.length; basketCount.style.display = basketItems.length ? 'inline-block':'none'; }

  function renderBasket() {
    if (!basketPopupContent) return;
    if (!basketItems.length) {
      basketPopupContent.innerHTML = `<p class="empty-basket-message">Your basket is empty.</p>`;
      if (basketPopupFooter) basketPopupFooter.innerHTML = '';
      return;
    }
    const html = basketItems.map((it, idx) => `<div class="basket-item" data-index="${idx}">
      <img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.name)}" class="basket-item-image" />
      <div class="basket-item-info">
        <p class="basket-item-name">${escapeHtml(it.name)}</p>
        <p class="basket-item-price">${escapeHtml(it.price)}</p>
      </div>
      <button class="basket-remove-btn" data-index="${idx}" aria-label="Remove item">Remove</button>
    </div>`).join('');

    basketPopupContent.innerHTML = html;

    if (basketPopupFooter) {
      const total = basketItems.reduce((sum,it) => sum + (Number(String(it.price).replace(/[^0-9.-]+/g,''))||0),0);
      basketPopupFooter.innerHTML = `<div class="basket-footer-inner">
        <p><strong>Total:</strong> ${formatPrice(total)}</p>
        <a href="confirmation.html" class="confirm-btn">Confirm my order</a>
      </div>`;
    }
  }

  function openBasket() { basketPopup.classList.add('show'); basketPopup.setAttribute('aria-hidden','false'); renderBasket(); }
  function closeBasket() { basketPopup.classList.remove('show'); basketPopup.setAttribute('aria-hidden','true'); }

  function addToBasket(name, price, image) {
    basketItems.push({ name, price, image, qty: 1 });
    saveBasket(); updateBasketCount(); renderBasket(); openBasket();
  }

  function removeFromBasket(idx) {
    basketItems.splice(idx,1);
    saveBasket(); updateBasketCount(); renderBasket();
  }

  basketBtn.addEventListener('click', e=>{ e.preventDefault(); openBasket(); });
  if (basketCloseBtn) basketCloseBtn.addEventListener('click', e=>{ e.preventDefault(); closeBasket(); });
  basketPopup.addEventListener('click', e=>{ if(e.target===basketPopup) closeBasket(); });
  if (basketPopupContent) basketPopupContent.addEventListener('click', e=>{
    const btn = e.target.closest('.basket-remove-btn'); if(btn) removeFromBasket(Number(btn.dataset.index));
  });

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', e=>{ e.preventDefault(); addToBasket(btn.dataset.name, btn.dataset.price, btn.dataset.image); });
  });

  updateBasketCount();
  window.addToBasket = addToBasket;
}

/* ------------------ Filter ------------------ */
function attachFilterHandlers() {
  const filterBtn = $id('filter-btn');
  const filterPopup = $id('filter-popup');
  const filterCloseBtn = filterPopup?.querySelector('.filter-close-btn');
  const searchInput = $id('search-input');

  if (!filterPopup) return;
  function showFilter() { filterPopup.classList.add('show'); filterPopup.setAttribute('aria-hidden','false'); }
  function hideFilter() { filterPopup.classList.remove('show'); filterPopup.setAttribute('aria-hidden','true'); }

  if (filterBtn) filterBtn.addEventListener('click', e=>{ e.preventDefault(); filterPopup.classList.toggle('show'); });
  if (searchInput) { searchInput.addEventListener('focus', showFilter); searchInput.addEventListener('click', showFilter); }
  if (filterCloseBtn) filterCloseBtn.addEventListener('click', hideFilter);
  filterPopup.addEventListener('click', e=>{ if(e.target===filterPopup) hideFilter(); });
}

function initializeHeaderFunctionality() {
  if (window._headerInitDone) return;
  window._headerInitDone = true;
  attachBasketHandlers();
  attachFilterHandlers();
  console.log('Header/Footer initialized');
}

/* ------------------ DOMContentLoaded ------------------ */
document.addEventListener('DOMContentLoaded', () => {
  loadHeaderFooter();
});

