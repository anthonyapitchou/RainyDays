const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";

/* header-loader.js - inject header and init basket + filter (single-file, robust) */
(function () {
  const HEADER_PATH = 'global.html'; // adjust path if needed
  const STORAGE_KEY = 'rainy_basket_v1';

  // safe get by id
  function $id(id) { return document.getElementById(id); }

  // Escape for HTML
  function escapeHtml(str = '') {
    return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'", '&#39;');
  }

  // Format price helper (simple)
  function formatPrice(n) {
    if (n === null || n === undefined) return '';
    const val = Number(n);
    if (Number.isNaN(val)) return String(n);
    return val % 1 === 0 ? `$${val}` : `$${val.toFixed(2)}`;
  }

  // Inject header.html once
  document.addEventListener('DOMContentLoaded', () => {
    const container = $id('header-container');
    if (!container) {
      console.error('Add <div id="header-container"></div> to your pages.');
      return;
    }
    if (container.dataset.loaded === 'true') {
      // already injected earlier
      initializeHeaderFunctionality(); // ensure handlers are attached
      return;
    }

    fetch(HEADER_PATH)
      .then(res => { if (!res.ok) throw new Error('Header load failed'); return res.text(); })
      .then(html => {
        container.innerHTML = html;
        container.dataset.loaded = 'true';
        console.log('Header injected');
        initializeHeaderFunctionality();
      })
      .catch(err => console.error('Header injection error:', err));
  });

  /* ------------------ Basket handlers ------------------ */
  function attachBasketHandlers() {
    const basketBtn = $id('basketBtn');
    const basketPopup = $id('basketPopup');
    const basketCloseBtn = document.querySelector('.basket-close-btn');
    const basketCount = $id('basketCount');
    const basketPopupContent = $id('basketPopupContent');
    const basketPopupFooter = $id('basketPopupFooter');

    if (!basketBtn) {
      console.warn('No #basketBtn found — basket disabled.');
      return;
    }

    // load from storage
    let basketItems = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      basketItems = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('Could not parse basket:', err);
      basketItems = [];
    }

    function saveBasket() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(basketItems)); }
      catch (err) { console.warn('Could not save basket', err); }
    }

    function updateBasketCount() {
      if (!basketCount) return;
      basketCount.textContent = basketItems.length;
      basketCount.style.display = basketItems.length ? 'inline-block' : 'none';
    }

    function openBasket() {
      if (!basketPopup) {
        // fallback: go to payment page
        window.location.href = 'checkout.html';
        return;
      }
      basketPopup.classList.add('show');
      basketPopup.setAttribute('aria-hidden', 'false');
      renderBasket();
    }
    function closeBasket() {
      if (!basketPopup) return;
      basketPopup.classList.remove('show');
      basketPopup.setAttribute('aria-hidden', 'true');
    }

    // events
    basketBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openBasket(); });
    if (basketCloseBtn) basketCloseBtn.addEventListener('click', (e) => { e.preventDefault(); closeBasket(); });
    if (basketPopup) basketPopup.addEventListener('click', (e) => { if (e.target === basketPopup) closeBasket(); });

    // add / remove / render
    function addToBasket(name, price, image) {
      basketItems.push({ name: String(name || 'Product'), price: String(price || ''), image: String(image || '') });
      saveBasket();
      updateBasketCount();
      renderBasket();
      openBasket();
    }

    function removeFromBasket(index) {
      if (index < 0 || index >= basketItems.length) return;
      basketItems.splice(index, 1);
      saveBasket();
      updateBasketCount();
      renderBasket();
    }

    function renderBasket() {
      if (!basketPopupContent) return;
      if (basketItems.length === 0) {
        basketPopupContent.innerHTML = `<p class="empty-basket-message">Your basket is empty.</p>`;
        if (basketPopupFooter) basketPopupFooter.innerHTML = '';
        return;
      }

      const html = basketItems.map((it, idx) => {
        const name = escapeHtml(it.name || 'Product');
        const price = escapeHtml(it.price || '');
        const image = escapeHtml(it.image || 'picture/default.png');
        return `
          <div class="basket-item" data-index="${idx}">
            <img src="${image}" alt="${name}" class="basket-item-image" />
            <div class="basket-item-info">
              <p class="basket-item-name">${name}</p>
              <p class="basket-item-price">${price}</p>
            </div>
            <button class="basket-remove-btn" data-index="${idx}" aria-label="Remove item">Remove</button>
          </div>
        `;
      }).join('');
      basketPopupContent.innerHTML = html;

      const total = basketItems.reduce((sum, it) => {
        const numeric = Number(String(it.price).replace(/[^0-9\.\-]+/g, '')) || 0;
        return sum + numeric;
      }, 0);

      if (basketPopupFooter) {
        basketPopupFooter.innerHTML = `
          <div class="basket-footer-inner">
            <p><strong>Total:</strong> ${formatPrice(total)}</p>
            <a href="confirmation.html" class="confirm-btn">Confirm my order</a>
          </div>
        `;
      }
    }

    // delegate remove clicks
    if (basketPopupContent) {
      basketPopupContent.addEventListener('click', (e) => {
        const btn = e.target.closest('.basket-remove-btn');
        if (!btn) return;
        const idx = Number(btn.dataset.index);
        removeFromBasket(idx);
      });
    }

    // attach add-to-cart buttons present on page
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      // avoid double binding: remove then add
      btn.removeEventListener('click', onAddToCartClick);
      btn.addEventListener('click', onAddToCartClick);
    });

    function onAddToCartClick(e) {
      e.preventDefault();
      const btn = e.currentTarget;
      const name = btn.dataset.name || btn.getAttribute('data-name');
      const price = btn.dataset.price || btn.getAttribute('data-price');
      const image = btn.dataset.image || btn.getAttribute('data-image') || btn.querySelector('img')?.src;
      addToBasket(name, price, image);
    }

    // init count
    updateBasketCount();
  } // attachBasketHandlers end

  /* ------------------ Filter handlers ------------------ */
  function attachFilterHandlers() {
    const filterBtn = $id('filter-btn');
    const filterPopup = $id('filter-popup');
    const filterCloseBtn = filterPopup ? filterPopup.querySelector('.filter-close-btn') : null;
    const searchInput = $id('search-input');
    const filterLinks = document.querySelectorAll('.filter-link');

    if (!filterPopup) {
      console.warn('No #filter-popup found — filter disabled.');
      return;
    }

    function showFilter() {
      filterPopup.classList.add('show');
      filterPopup.setAttribute('aria-hidden', 'false');
    }
    function hideFilter() {
      filterPopup.classList.remove('show');
      filterPopup.setAttribute('aria-hidden', 'true');
    }

    if (filterBtn) {
      filterBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); filterPopup.classList.toggle('show'); });
    }

    if (searchInput) {
      // optional: open on focus
      searchInput.addEventListener('focus', showFilter);
      searchInput.addEventListener('click', showFilter);
    }

    if (filterCloseBtn) filterCloseBtn.addEventListener('click', hideFilter);
    filterPopup.addEventListener('click', (e) => { if (e.target === filterPopup) hideFilter(); });

    filterLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        console.log('Filter selected:', category);
        hideFilter();
        // TODO: call your product filtering function here
      });
    });
  }

  /* ------------------ Initialize (called once after header injection) ------------------ */
  function initializeHeaderFunctionality() {
    if (window._headerInitDone) return;
    window._headerInitDone = true;

    // Attach both modules (safe if elements missing)
    attachBasketHandlers();
    attachFilterHandlers();

    console.log('Header functionality initialized');
  }

  // expose init for cases where header already exists in DOM
  window.initializeHeaderFunctionality = initializeHeaderFunctionality;

})();

async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id'); // ex: aquaGuard.html?id=3
  if (!id) return;

  try {
    const response = await fetch(`https://api.noroff.dev/api/v1/rainy-days/${id}`);
    if (!response.ok) throw new Error('API error');
    const product = await response.json();

    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-price').textContent = `$${product.price}`;
    document.getElementById('product-image').src = product.image;
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', loadProduct);


document.addEventListener('DOMContentLoaded', () => {
  injectHeader(); // ta fonction existante

  if (window.location.pathname.includes('confirmation.html')) {
    const STORAGE_KEY = 'rainy_basket_v1';
    const cartContainer = document.getElementById('cart-container');
    const totalContainer = document.getElementById('total-container');

    function readBasket() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch {
        return [];
      }
    }

    function formatPrice(price) {
      const num = Number(String(price).replace(/[^0-9.-]+/g, ''));
      return isNaN(num) ? 0 : num;
    }

    function renderCart() {
      const basket = readBasket();
      if (!cartContainer || !totalContainer) return;

      if (basket.length === 0) {
        cartContainer.innerHTML = '<p>Votre panier est vide.</p>';
        totalContainer.innerHTML = '<strong>Total : $0</strong>';
        return;
      }

      let total = 0;
      const html = basket.map(item => {
        const name = item.name || 'Produit';
        const price = formatPrice(item.price);
        const qty = item.qty || 1;
        total += price * qty;

        return `
          <div class="checkout-item">
            <div class="ci-name">${name}</div>
            <div class="ci-meta">Prix: $${price.toFixed(2)} • Qté: ${qty}</div>
          </div>
        `;
      }).join('');

      cartContainer.innerHTML = html;
      totalContainer.innerHTML = `<strong>Total : $${total.toFixed(2)}</strong>`;
    }

    // Rendu initial du panier
    renderCart();
  }
});


