const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";

(function () {
  const HEADER_PATH = 'global.html';
  const STORAGE_KEY = 'rainy_basket_v1';

  function $id(id) { return document.getElementById(id); }
  function escapeHtml(str = '') {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
  function formatPrice(n) {
    const val = Number(n);
    return val % 1 === 0 ? `$${val}` : `$${val.toFixed(2)}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = $id('header-container');
    if (!container) return console.error('Add <div id="header-container"></div>');

    fetch(HEADER_PATH)
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;
        initializeHeaderFunctionality();
      })
      .catch(err => console.error('Header injection error:', err));
  });

  /* ------------------ Basket ------------------ */
  function attachBasketHandlers() {
    const basketBtn = $id('basketBtn');
    const basketPopup = $id('basketPopup');
    const basketCloseBtn = document.querySelector('.basket-close-btn');
    const basketCount = $id('basketCount');
    const basketPopupContent = $id('basketPopupContent');
    const basketPopupFooter = $id('basketPopupFooter');

    let basketItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    function saveBasket() { localStorage.setItem(STORAGE_KEY, JSON.stringify(basketItems)); }
    function updateBasketCount() { if (basketCount) basketCount.textContent = basketItems.length; }
    function openBasket() { basketPopup.classList.add('show'); basketPopup.setAttribute('aria-hidden','false'); renderBasket(); }
    function closeBasket() { basketPopup.classList.remove('show'); basketPopup.setAttribute('aria-hidden','true'); }

    basketBtn?.addEventListener('click', openBasket);
    basketCloseBtn?.addEventListener('click', closeBasket);
    basketPopup?.addEventListener('click', e => { if (e.target === basketPopup) closeBasket(); });

    function addToBasket(name, price, image) {
      basketItems.push({ name, price, image });
      saveBasket();
      updateBasketCount();
      renderBasket();
      openBasket();
    }
    function removeFromBasket(index) {
      basketItems.splice(index, 1);
      saveBasket();
      updateBasketCount();
      renderBasket();
    }

    function renderBasket() {
      if (!basketPopupContent) return;
      if (basketItems.length === 0) {
        basketPopupContent.innerHTML = '<p>Your basket is empty.</p>';
        basketPopupFooter.innerHTML = '';
        return;
      }

      basketPopupContent.innerHTML = basketItems.map((it, idx) => `
        <div class="basket-item" data-index="${idx}">
          <img src="${it.image}" alt="${escapeHtml(it.name)}" class="basket-item-img" />
          <div>${escapeHtml(it.name)} - ${escapeHtml(it.price)}</div>
          <button class="basket-remove-btn" data-index="${idx}">Remove</button>
        </div>
      `).join('');

      const total = basketItems.reduce((sum, it) => sum + (Number(it.price)||0),0);
      basketPopupFooter.innerHTML = `<div><strong>Total:</strong> ${formatPrice(total)}</div>
        <a href="confirmation.html" class="confirm-order-btn">Confirm my order</a>`;

      // delegate remove clicks
      if (basketPopupContent) {
        basketPopupContent.addEventListener('click', (e) => {
          const btn = e.target.closest('.basket-remove-btn');
          if (!btn) return;
          const idx = Number(btn.dataset.index);
          removeFromBasket(idx);
        });
      }
    }

    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        const image = btn.dataset.image || btn.querySelector('img')?.src;
        addToBasket(name, price, image);
      });
    });

    updateBasketCount();
  }

  /* ------------------ Filter ------------------ */
  function attachFilterHandlers() {
    const filterPopup = $id('filter-popup');
    const searchInput = $id('search-input');
    const filterCloseBtn = filterPopup?.querySelector('.filter-close-btn');

    if (!filterPopup || !searchInput) return;

    function showFilter() { filterPopup.classList.add('show'); filterPopup.setAttribute('aria-hidden','false'); }
    function hideFilter() { filterPopup.classList.remove('show'); filterPopup.setAttribute('aria-hidden','true'); }

    searchInput.addEventListener('focus', showFilter);
    searchInput.addEventListener('click', showFilter);
    if (filterCloseBtn) filterCloseBtn.addEventListener('click', hideFilter);
    filterPopup.addEventListener('click', e => { if (e.target===filterPopup) hideFilter(); });
  }

  function initializeHeaderFunctionality() {
    attachBasketHandlers();
    attachFilterHandlers();
    console.log('Header functionality initialized');
  }
})();


