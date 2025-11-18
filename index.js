// main.js
const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";
const STORAGE_KEY = 'rainy_basket_v1'; // ✅ panier storage key

(function () {
  const GLOBAL_PATH = 'global.html';

  fetch(GLOBAL_PATH)
    .then(response => response.text())
    .then(html => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const header = tempDiv.querySelector('header');
      const footer = tempDiv.querySelector('footer');
      const basketPopup = tempDiv.querySelector('#basketPopup');

      if (header) document.getElementById('header-container').appendChild(header);
      if (footer) document.getElementById('footer-container').appendChild(footer);
      if (basketPopup) document.body.appendChild(basketPopup);

      initBasket();
      initBasketPopup();
      initSearchFilter(); // ✅ Réactive la recherche et le filtre
      console.log('✅ Header, footer et basket popup chargés.');
    })
    .catch(err => console.error('Erreur chargement global.html:', err));

  function initBasket() {
    const basketCount = document.getElementById('basketCount');
    if (!basketCount) return;
    const basket = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    basketCount.textContent = basket.length;
  }

  window.addToBasket = function (product) {
    let basket = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    basket.push(product);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
    initBasket();
  };

  function initBasketPopup() {
    const basketBtn = document.getElementById('basketBtn');
    const basketPopup = document.getElementById('basketPopup');
    const basketCloseBtn = basketPopup?.querySelector('.basket-close-btn');
    const basketContent = document.getElementById('basketPopupContent');
    const basketFooter = document.getElementById('basketPopupFooter');

    if (!basketBtn || !basketPopup) return;

    basketBtn.addEventListener('click', () => {
      renderBasketPopup();
      basketPopup.classList.add('active');
      basketPopup.setAttribute('aria-hidden', 'false');
    });

    if (basketCloseBtn) {
      basketCloseBtn.addEventListener('click', () => {
        basketPopup.classList.remove('active');
        basketPopup.setAttribute('aria-hidden', 'true');
      });
    }

    basketPopup.addEventListener('click', (e) => {
      if (e.target === basketPopup) {
        basketPopup.classList.remove('active');
        basketPopup.setAttribute('aria-hidden', 'true');
      }
    });

    function renderBasketPopup() {
      const basket = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (basket.length === 0) {
        basketContent.innerHTML = '<p>Your basket is empty.</p>';
        basketFooter.innerHTML = '';
        return;
      }

      basketContent.innerHTML = basket.map(item => `
        <div class="basket-item">
          ${item.image}
          <span>${item.name}</span> - $${item.price}
        </div>
      `).join('');

      basketFooter.innerHTML = `
        <button id="checkoutBtn" class="btn-checkout">Go to Checkout</button>
      `;

      document.getElementById('checkoutBtn').addEventListener('click', () => {
        window.location.href = 'checkout.html';
      });
    }
  }

  function initSearchFilter() {
    const searchInput = document.getElementById('search-input');
    const filterPopup = document.getElementById('filter-popup');
    const filterCloseBtn = document.querySelector('.filter-close-btn');

    if (!searchInput || !filterPopup) return;

    searchInput.addEventListener('focus', () => {
      filterPopup.style.visibility = 'visible';
    });

    if (filterCloseBtn) {
      filterCloseBtn.addEventListener('click', () => {
        filterPopup.style.visibility = 'hidden';
      });
    }
  }
})();
