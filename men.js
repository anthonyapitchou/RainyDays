// js/men.js
// Fetch men products (replace API_URL with your real endpoint) and render into .grid-container
(function () {
  const API_URL = 'https://example.com/api/products?category=men'; // <-- replace with your API or keep for future
  const container = document.querySelector('.grid-container');

  // Local fallback data so you can test right away (uses your images)
  const FALLBACK = [
    { name: 'StormShield', shortDescription: 'Double protection - Rain Jacket', price: '220$', image: 'picture/RainyDays_Jacket1.png', link: '#' },
    { name: 'HydroFlex', shortDescription: 'Zip - thin Rain Jacket', price: '180$', image: 'picture/RainyDays_Jacket2.png', link: '#' },
    { name: 'AquaGuard', shortDescription: 'Zip with pockets - Rain Jacket', price: '180$', image: 'picture/RainyDays_Jacket3.png', link: '#' },
    { name: 'DrizzleBlock', shortDescription: 'Strong Rain Jacket - Regular fit', price: '220$', image: 'picture/RainyDays_Jacket4.png', link: '#' },
    { name: 'RainRover', shortDescription: 'Zip Rain Jacket - side pockets', price: '200$', image: 'picture/RainyDays_Jacket5.png', link: '#' },
    { name: 'Scott', shortDescription: 'Zip with pockets - Grey & Black', price: '200$', image: 'picture/RainyDays_Jacket6.png', link: '#' },
    { name: 'CloudTrail', shortDescription: 'Vertical pockets - Vintage Brown', price: '220$', image: 'picture/RainyDays_Jacket7.png', link: '#' }
  ];

  if (!container) {
    console.warn('men.js: .grid-container not found on this page.');
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

    // Keep markup consistent with your existing HTML
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
    // Try fetch first, then fallback to local sample
    try {
      const resp = await fetch(API_URL, { cache: 'no-cache' });
      if (!resp.ok) throw new Error('API returned ' + resp.status);
      const json = await resp.json();
      // adapt to likely shapes: json.data || json.products || json
      const products = json?.data || json?.products || json?.items || json || [];
      if (!Array.isArray(products) || products.length === 0) {
        // use fallback if API returned no items
        renderProducts(FALLBACK);
      } else {
        renderProducts(products);
      }
    } catch (err) {
      console.warn('men.js fetch failed, using fallback data. Error:', err);
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
        // If your global addToBasket exists, call it
        if (typeof addToBasket === 'function') {
          addToBasket(name, price, image);
        } else {
          // Otherwise dispatch an event your header script can listen for
          document.dispatchEvent(new CustomEvent('rainy:add-to-basket', { detail: { name, price, image } }));
        }
      });
    });
  }

  // Start
  loadAndRender();
})();
