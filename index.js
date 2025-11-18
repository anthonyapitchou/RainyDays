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
 EventListener('DOMContentLoaded', () => {
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

        header = tempDiv.querySelector('header');
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
          ${it.image}
          <div class="basket-item-info">
            <p class="basket-item-name">${escapeHtml(it.name)}</p>
            <p class="basket-item-price">${escapeHtml(it.price)}</p>
          </div>
          <button class="basket-remove-btn" data-index="${idx}">Remove</button>
        </div>
      `).join('');

      const total = basketItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
      basketPopupFooter.innerHTML = `
        <div><strong>Total:</strong> ${formatPrice(total)}</div>
        confirmation.htmlConfirm my order</a>
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
    const filterPopup = document.querySelector('#filter-popup');
    const filterCloseBtn = filterPopup?.querySelector('.filter-close-btn');
    const searchInput = document.querySelector('#search-input');

    if (!filterPopup || !searchInput) return;

    // ✅ Positionner le pop-up juste sous la barre de recherche
    function positionFilterPopup() {
      const rect = searchInput.getBoundingClientRect();
      filterPopup.style.position = 'fixed';
      filterPopup.style.top = `${rect.bottom + 8}px`;
      filterPopup.style.left = `${rect.left}px`;
      filterPopup.style.width = `${rect.width}px`;
      filterPopup.style.zIndex = '1200';
    }

    function showFilter() {
      positionFilterPopup();
      filterPopup.classList.add('show');
      filterPopup.setAttribute('aria-hidden', 'false');
    }

    function hideFilter() {
      filterPopup.classList.remove('show');
      filterPopup.setAttribute('aria-hidden', 'true');
    }

    searchInput.addEventListener('focus', showFilter);
    searchInput.addEventListener('click', showFilter);

    if (filterCloseBtn) filterCloseBtn.addEventListener('click', hideFilter);
    filterPopup.addEventListener('click', e => { if (e.target === filterPopup) hideFilter(); });

    window.addEventListener('resize', () => {
      if (filterPopup.classList.contains('show')) positionFilterPopup();
    });

    window.addEventListener('scroll', () => {
      if (filterPopup.classList.contains('show')) positionFilterPopup();
    });
  }

  function initializeHeaderFunctionality() {
    attachBasketHandlers();
    attachFilterHandlers();
    console.log('✅ Header functionality initialized');
  }
})();
