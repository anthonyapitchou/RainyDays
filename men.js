const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";

(function () {
  const container = document.querySelector('.grid-container');

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

const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";

(function () {
  const container = document.querySelector('.grid-container');

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
    const name = escapeHtml(product.title || 'Untitled');
    const desc = escapeHtml(product.description || '');
    const price = escapeHtml(product.price ? `$${product.price}` : '$0');
    const img = escapeAttr(product.image || 'picture/default.png');
    const link = escapeAttr(product.id ? `product.html?id=${product.id}` : '#');

    return `
      <div class="grid">
        ${img}
        <div class="card-content">
          <h3>${name}</h3>
          <p>${desc}</p>
          <p><b>${price}</b></p>
          ${link}<strong>View</strong></a>
          <button class="cta add-to-cart"
            data-name="${escapeAttr(product.title||'Product')}"
            data-price="${escapeAttr(product.price||'')}"
            data-image="${img}"
            type="button">Add to basket</button>
        </div>
      </div>
    `;
  }

  async function loadAndRender() {
    try {
      const resp = await fetch(apiUrl);
      if (!resp.ok) throw new Error('API returned ' + resp.status);
      const json = await resp.json();
      const products = json.filter(product => product.gender === "men");
      renderProducts(products);
    } catch (err) {
      console.warn('men.js fetch failed:', err);
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

  async function loadAndRender() {
    try {
      const resp = await fetch(apiUrl);
      if (!resp.ok) throw new Error('API returned ' + resp.status);
      const json = await resp.json();
      const products = json.filter(product => product.gender === "men");
      renderProducts(products);
    } catch (err) {
      console.warn('men.js fetch failed:', err);
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
