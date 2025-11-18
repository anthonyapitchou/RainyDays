// main.js
const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";
const STORAGE_KEY = 'rainy_basket_v1'; // ✅ panier storage key

/* ------------------ Header & Footer Loader ------------------ */
(function () {
  const GLOBAL_PATH = 'global.html';

  function $id(id) {
    return document.getElementById(id);
  }

  fetch(GLOBAL_PATH)
    .then(response => response.text())
    .then(html => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const header = tempDiv.querySelector('header');
      const footer = tempDiv.querySelector('footer');

      if (header) document.getElementById('header-container').appendChild(header);
      if (footer) document.getElementById('footer-container').appendChild(footer);

      initBasket();
      initScroll();
      initBasketPopup(); // ✅ Ajout de la logique pour le panier
      console.log(`✅ Header & Footer loaded from ${GLOBAL_PATH}`);
    })
    .catch(err => console.error('Global load error:', err));

  function initBasket() {
    const basketCount = $id('basketCount');
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

  function initScroll() {
    const scrollWrapper = document.querySelector('.scroll-wrapper');
    if (!scrollWrapper) return;

    const gridContainer = scrollWrapper.querySelector('.grid-container');
    const arrows = scrollWrapper.querySelectorAll('.scroll-arrow');

    arrows.forEach(arrow => {
      arrow.addEventListener('click', () => {
        const scrollAmount = 300;
        if (arrow.textContent === '→') {
          gridContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
          gridContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      });
    });
  }

  /* ✅ Basket Popup Logic */
  function initBasketPopup() {
    const basketBtn = document.getElementById('basketBtn');
    const basketPopup = document.getElementById('basketPopup');
    const basketCloseBtn = basketPopup?.querySelector('.basket-close-btn');

    if (!basketBtn || !basketPopup) return;

    // Open popup
    basketBtn.addEventListener('click', () => {
      basketPopup.style.display = 'flex'; // or use a CSS class
      basketPopup.setAttribute('aria-hidden', 'false');
    });

    // Close popup
    if (basketCloseBtn) {
      basketCloseBtn.addEventListener('click', () => {
        basketPopup.style.display = 'none';
        basketPopup.setAttribute('aria-hidden', 'true');
      });
    }

    // Close when clicking outside
    basketPopup.addEventListener('click', (e) => {
      if (e.target === basketPopup) {
        basketPopup.style.display = 'none';
        basketPopup.setAttribute('aria-hidden', 'true');
      }
    });
  }
})();
