(function () {
  const HEADER_PATH = 'global.html'; // ton fichier global
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
    return (val % 1 === 0) ? `$${val}` : `$${val.toFixed(2)}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = $id('header-container');
    const footerContainer = $id('footer-container');

    if (!headerContainer || !footerContainer) {
      console.error('Add <div id="header-container"></div> and <div id="footer-container"></div> to your pages.');
      return;
    }

    fetch(HEADER_PATH)
      .then(res => res.text())
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const header = tempDiv.querySelector('header');
        const footer = tempDiv.querySelector('footer');
        const basketPopup = tempDiv.querySelector('#basketPopup');
        const filterPopup = tempDiv.querySelector('#filter-popup');

        if (header) headerContainer.appendChild(header);
        if (footer) footerContainer.appendChild(footer);
        if (basketPopup) document.body.appendChild(basketPopup);
        if (filterPopup) document.body.appendChild(filterPopup);

        initializeHeaderFunctionality();
      })
      .catch(err => console.error('Header/Footer injection error:', err));
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

    function saveBasket() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(basketItems));
    }

    function updateBasketCount() {
      if (basketCount) basketCount.textContent = basketItems.length;
    }

    function openBasket() {
      basketPopup.classList.add('show');
      basketPopup.setAttribute('aria-hidden', 'false');
      renderBasket();
    }

    function closeBasket() {
      basketPopup.classList.remove('show');
      basketPopup.setAttribute('aria-hidden', 'true');
    }

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
          <img src="${it.image}" alt="${escapeHtml(it.name)}" class="basket-item-image" />
          <div>${escapeHtml(it.name)} - ${escapeHtml(it.price)}</div>
          <button class="basket-remove-btn" data-index="${idx}">Remove</button>
        </div>
      `).join('');

      const total = basketItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
      basketPopupFooter.innerHTML = `
        <div><strong>Total:</strong> ${formatPrice(total)}</div>
        <a href="confirmation.html" class="confirm-order-btn">Confirm my order</a>
      `;

      basketPopupContent.querySelectorAll('.basket-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFromBasket(Number(btn.dataset.index)));
      });
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

    function showFilter() {
      filterPopup.classList.add('show');
      filterPopup.setAttribute('aria-hidden', 'false');
    }

    function hideFilter() {
      filterPopup.classList.remove('show');
      filterPopup.setAttribute('aria-hidden', 'true');
    }

    // Open filter when clicking on search input
    searchInput.addEventListener('focus', showFilter);
    searchInput.addEventListener('click', showFilter);

    // Close filter
    if (filterCloseBtn) filterCloseBtn.addEventListener('click', hideFilter);
    filterPopup.addEventListener('click', e => { if (e.target === filterPopup) hideFilter(); });
  }

  function initializeHeaderFunctionality() {
    attachBasketHandlers();
    attachFilterHandlers();
    console.log('✅ Header functionality initialized');
  }
})();

