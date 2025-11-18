// main.js
const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";
const STORAGE_KEY = 'rainy_basket_v1'; // ✅ panier storage key

/* ------------------ Helpers ------------------ */
const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";

/* header-loader.js - inject header and init basket + filter (single-file, robust) */
(function () {
  const HEADER_PATH = 'header.html'; // adjust path if needed
  const STORAGE_KEY = 'rainy_basket_v1';

  function $id(id) {
    return document.getElementById(id);
  }

  // inject header
  fetch(HEADER_PATH)
    .then(response => response.text())
    .then(html => {
      document.getElementById('header-container').innerHTML = html;
      initBasket();
      initScroll();
    })
    .catch(err => console.error('Header load error:', err));

  // init basket from localStorage
  function initBasket() {
    const basketCount = $id('basket-count');
    if (!basketCount) return;
    const basket = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    basketCount.textContent = basket.length;
  }

  // add item to basket
  window.addToBasket = function(product) {
    let basket = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    basket.push(product);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
    initBasket();
  }

  // Scroll arrows
  function initScroll() {
    const scrollWrapper = document.querySelector('.scroll-wrapper');
    if (!scrollWrapper) return;

    const gridContainer = scrollWrapper.querySelector('.grid-container');
    const arrows = scrollWrapper.querySelectorAll('.scroll-arrow');

    arrows.forEach(arrow => {
      arrow.addEventListener('click', () => {
        const scrollAmount = 300; // px to scroll
        if (arrow.textContent === '→') {
          gridContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
          gridContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      });
    });
  }
})();

/* Newsletter form submit */
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    if (!email) return;
    alert(`Thank you for subscribing, ${email}!`);
    newsletterForm.reset();
  });
}

/* Fetch products from API */
async function fetchProducts() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Network response was not ok');
    const products = await res.json();
    console.log('Fetched products:', products);
    return products;
  } catch (err) {
    console.error('API fetch error:', err);
    return [];
  }
}

fetchProducts();

