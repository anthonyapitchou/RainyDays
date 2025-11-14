const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";

// js/women.js
// Fetch women products and render into .grid-container
(function () {
  const API_URL = 'https://example.com/api/products?category=women'; // <-- replace with your API
  const container = document.querySelector('.grid-container');

  // Fallback sample (you can change images to women product files if you have them)
  const FALLBACK = [
    { name: 'LadyShield', shortDescription: 'Light waterproof jacket', price: '200$', image: 'picture/RainyDays_Jacket2.png', link: '#' },
    { name: 'AquaBelle', shortDescription: 'Slim fit rain jacket', price: '190$', image: 'picture/RainyDays_Jacket3.png', link: '#' },
    { name: 'CloudWrap', shortDescription: 'Hooded jacket - breathable', price: '210$', image: 'picture/RainyDays_Jacket7.png', link: '#' }
  ];

  if (!container) {
    console.warn('women.js: .grid-container not found on this page.');
    return;
  }

  function escapeHtml(s = '') {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
  function escapeAttr(s = '') {
    return String(s).replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }

  function makeCard(product) {
    const name = escapeHtml(product.name || 'Untitled');
    const desc = escapeHtml(product.shortDescription || '');
    const price = escapeHtml(product.price || '$0');
    const img = escapeAttr(product.image || 'picture/default.png');
    const link = escapeAttr(product.link || '#');

    return `
      <div class="grid">
        <img src="${img}" alt="${name}" class="review-img">
        <div class="card-content">
          <h3>${name}</h3>
          <p>${desc}</p>
          <p><b>${price}</b></p>
          <a href="${link}" class="cta"><strong> view</strong></a>
          <button class="cta add-to-cart"
            data-name="${escapeAttr(product.name||'Product')}"
            data-price="${escapeAttr(product.price||'')}"
            data-image="${img}"
            type="button">Add to basket</button>
        </div>
      </div>
    `;
  }

  async function loadAndRender() {
    try {
      const resp = await fetch(API_URL, { cache: 'no-cache' });
      if (!resp.ok) throw new Error('API returned ' + resp.status);
      const json = await resp.json();
      const products = json?.data || json?.products || json?.items || json || [];
      if (!Array.isArray(products) || products.length === 0) {
        renderProducts(FALLBACK);
      } else {
        renderProducts(products);
      }
    } catch (err) {
      console.warn('women.js fetch failed, using fallback data. Error:', err);
      renderProducts(FALLBACK);
    }
  }

  function renderProducts(products) {
    container.innerHTML = products.map(makeCard).join('\n');
    attachAddButtons();
  }

  function attachAddButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        const image = btn.dataset.image;
        if (typeof addToBasket === 'function') {
          addToBasket(name, price, image);
        } else {
          document.dispatchEvent(new CustomEvent('rainy:add-to-basket', { detail: { name, price, image } }));
        }
      });
    });
  }

  loadAndRender();
})();
