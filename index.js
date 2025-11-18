// main.js
const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";
const STORAGE_KEY = 'rainy_basket_v1'; // ✅ panier storage key

(function () {
  const GLOBAL_PATH = 'global.html';

  // Charger header + footer + basket popup
  fetch(GLOBAL_PATH)
    .then(response => response.text())
    .then(html => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const header = tempDiv.querySelector('header');
      const footer = tempDiv.querySelector('footer');
      const basketPopup = tempDiv.querySelector('#basketPopup');

      // Inject header en haut
      const headerContainer = document.getElementById('header-container');
      if (header && headerContainer) headerContainer.appendChild(header);

      // Inject footer en bas
      const footerContainer = document.getElementById('footer-container');
      if (footer && footerContainer) footerContainer.appendChild(footer);

      // Inject basket popup dans body
      if (basketPopup) document.body.appendChild(basketPopup);

      // Initialiser les fonctionnalités
      initBasket();
      initBasketPopup();
      console.log('✅ Header, footer et basket popup chargés.');
    })
    .catch(err => console.error('Erreur chargement global.html:', err));

  // Mettre à jour le compteur du panier
  function initBasket() {
    const basketCount = document.getElementById('basketCount');
    if (!basketCount) return;
    const basket = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    basketCount.textContent = basket.length;
  }

  // Ajouter un produit au panier
  window.addToBasket = function (product) {
    let basket = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    basket.push(product);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
    initBasket();
  };

  // ✅ Logique pour ouvrir/fermer la fenêtre du panier
  function initBasketPopup() {
    const basketBtn = document.getElementById('basketBtn');
    const basketPopup = document.getElementById('basketPopup');
    const basketCloseBtn = basketPopup?.querySelector('.basket-close-btn');

    if (!basketBtn || !basketPopup) return;

    // Ouvrir le panier
    basketBtn.addEventListener('click', () => {
      basketPopup.style.display = 'flex';
      basketPopup.setAttribute('aria-hidden', 'false');
    });

    // Fermer avec la croix
    if (basketCloseBtn) {
      basketCloseBtn.addEventListener('click', () => {
        basketPopup.style.display = 'none';
        basketPopup.setAttribute('aria-hidden', 'true');
      });
    }

    // Fermer en cliquant en dehors
    basketPopup.addEventListener('click', (e) => {
      if (e.target === basketPopup) {
        basketPopup.style.display = 'none';
        basketPopup.setAttribute('aria-hidden', 'true');
      }
    });
  }
})();
