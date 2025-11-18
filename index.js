const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";

/* header-loader.js - inject header and init basket + filter */
(function () {
  const HEADER_PATH = 'global.html'; // Adjust if header file is in another folder
  const STORAGE_KEY = 'rainy_basket_v1';

  function $id(id) { return document.getElementById(id); }

  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatPrice(n) {
    const val = Number(n);
    return isNaN(val) ? '' : `$${val.toFixed(2)}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = $id('header-container');
    if (!container) {
      console.error('Missing <div id="header-container"></div> in HTML.');
      return;
    }

    fetch(HEADER_PATH)
      .then(res => {
        if (!res.ok) throw new Error('Header load failed');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        initializeHeaderFunctionality();
      })
      .catch(err => console.error('Header injection error:', err));
  });

  function initializeHeaderFunctionality() {
    attachBasketHandlers();
    attachFilterHandlers();
    // ✅ Removed footer/header fixed positioning to prevent "stuck" footer
  }

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
      if (!basketCount) return;
      basketCount.textContent = basketItems.length;
      basketCount.style.display = basketItems.length ? 'inline-block' : 'none';
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
        basketPopupContent.innerHTML = `<p>Your basket is empty.</p>`;
        basketPopupFooter.innerHTML = '';
        return;
      }

      const html = basketItems.map((item, idx) => `
        <div class="basket-item" data-index="${idx}">
          ${escapeHtml(item.image)}
          <div class="basket-item-info">
            <p>${escapeHtml(item.name)}</p>
            <p>${escapeHtml(item.price)}</p>
          </div>
          <button class="basket-remove-btn" data-index="${idx}">Remove</button>
        </div>
      `).join('');
      basketPopupContent.innerHTML = html;

      const total = basketItems.reduce((sum, it) => {
        const numeric = Number(String(it.price).replace(/[^0-9.\-]+/g, '')) || 0;
        return sum + numeric;
      }, 0);

      basketPopupFooter.innerHTML = `
        <div class="basket-footer-inner">
          <p><strong>Total:</strong> ${formatPrice(total)}</p>
          <a href="confirmation.html" class="confirm-btn">Confirm my order</a>
        </div>
      `;
    }

    basketBtn?.addEventListener('click', openBasket);
    basketCloseBtn?.addEventListener('click', closeBasket);
    basketPopup?.addEventListener('click', e => { if (e.target === basketPopup) closeBasket(); });

    basketPopupContent?.addEventListener('click', e => {
      const btn = e.target.closest('.basket-remove-btn');
      if (!btn) return;
      removeFromBasket(Number(btn.dataset.index));
    });

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

  function attachFilterHandlers() {
    const filterBtn = $id('filter-btn');
    const filterPopup = $id('filter-popup');
    const filterCloseBtn = filterPopup?.querySelector('.filter-close-btn');

    if (!filterPopup) return;

    filterBtn?.addEventListener('click', () => filterPopup.classList.toggle('show'));
    filterCloseBtn?.addEventListener('click', () => filterPopup.classList.remove('show'));
    filterPopup.addEventListener('click', e => { if (e.target === filterPopup) filterPopup.classList.remove('show'); });
  }
})();

/* Load product details */
async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  try {
    const response = await fetch(`${apiUrl}/${id}`);
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

/* Confirmation page */
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('confirmation.html')) {
    const STORAGE_KEY = 'rainy_basket_v1';
    const cartContainer = document.getElementById('cart-container');
    const totalContainer = document.getElementById('total-container');

    const basket = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!basket.length) {
      cartContainer.innerHTML = '<p>Your basket is empty.</p>';
      totalContainer.innerHTML = '<strong>Total: $0</strong>';
      return;
    }

    let total = 0;
    const html = basket.map(item => {
      const price = Number(String(item.price).replace(/[^0-9.\-]+/g, '')) || 0;
      total += price;
      return `
        <div class="checkout-item">
          <div>${item.name}</div>
          <div>Price: $${price.toFixed(2)}</div>
        </div>
      `;
    }).join('');

    cartContainer.innerHTML = html;
    totalContainer.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
  }
});

