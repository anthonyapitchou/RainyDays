const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";


// checkout.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                // S'assurer que le fichier est bien trouvé (code 200)
                throw new Error('Erreur de chargement du fichier header.html: ' + response.statusText);
            }
            return response.text();
        })
        .then(htmlContent => {
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                headerContainer.innerHTML = htmlContent;
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement de l\'en-tête:', error);
        });
});


document.addEventListener('DOMContentLoaded', () => {
  try {
    const STORAGE_KEY = 'rainy_basket_v1';
    const ORDER_KEY = 'rainy_order_v1';

    const cartContainer = document.getElementById('cart-container');
    const totalContainer = document.getElementById('total-container');
    const placeOrderBtn = document.getElementById('place-order-btn');

    

    function readBasket() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
      catch { return []; }
    }

    function saveBasket(basket) { localStorage.setItem(STORAGE_KEY, JSON.stringify(basket)); }
    function saveOrder(order) { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); }

    function formatPriceMaybe(price) {
      if (typeof price === 'number') return price;
      if (!price) return 0;
      const numeric = Number(String(price).replace(/[^0-9.-]+/g, ''));
      return isNaN(numeric) ? 0 : numeric;
    }

    function escapeHtml(str = '') {
      return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function renderCart() {
      try {
        if (!cartContainer || !totalContainer) return;

        const basketItems = readBasket();

        if (basketItems.length === 0) {
          cartContainer.innerHTML = '<p>Votre panier est vide.</p>';
          totalContainer.innerHTML = '<strong>Total : $0.00</strong>';
          if (placeOrderBtn) placeOrderBtn.disabled = true;
          return;
        }

        let total = 0;
        const html = basketItems.map((item, idx) => {
          const name = item.name || 'Produit';
          const priceNum = formatPriceMaybe(item.price);
          const qty = item.qty || 1;
          const imageUrl = item.image || item.images?.[0] || 'picture/default.png';
          total += priceNum * qty;

          const imageHtml = /^\s*<img/i.test(String(imageUrl))
            ? String(imageUrl)
            : `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" class="checkout-thumb" width="80" height="80">`;

          return `
            <div class="checkout-item" data-index="${idx}">
              <div class="ci-left">${imageHtml}</div>
              <div class="ci-middle">
                <div class="ci-name">${escapeHtml(name)}</div>
                <div class="ci-meta">Prix: $${priceNum.toFixed(2)} &nbsp;•&nbsp; Qté: ${qty}</div>
              </div>
              <div class="ci-right">
                <div class="ci-lineprice">$${(priceNum * qty).toFixed(2)}</div>
                <button class="remove-item" data-index="${idx}" aria-label="Supprimer ${escapeHtml(name)}">Delete</button>
              </div>
            </div>
          `;
        }).join('');

        cartContainer.innerHTML = html;
        totalContainer.innerHTML = `<strong>Total : $${total.toFixed(2)}</strong>`;
        if (placeOrderBtn) placeOrderBtn.disabled = false;

        const removeButtons = cartContainer.querySelectorAll('.remove-item');
        removeButtons.forEach(btn => {
          btn.addEventListener('click', () => removeItemAt(Number(btn.dataset.index)));
        });
      } catch (err) {
        console.error("Erreur renderCart:", err);
      }
    }

    function removeItemAt(index) {
      try {
        const basket = readBasket();
        if (index < 0 || index >= basket.length) return;
        basket.splice(index, 1);
        saveBasket(basket);
        renderCart();
      } catch (err) {
        console.error("Erreur removeItemAt:", err);
      }
    }

    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => {
        try {
          const basket = readBasket();
          if (!basket || basket.length === 0) { alert('Votre panier est vide.'); return; }
          const order = { createdAt: new Date().toISOString(), items: basket };
          saveOrder(order);
          localStorage.removeItem(STORAGE_KEY);
          window.location.href = './confirmation.html';
        } catch (err) {
          console.error("Erreur placeOrderBtn:", err);
        }
      });
    }

    // rendu initial
    renderCart();

  } catch (err) {
    console.error("Erreur confirmation.js:", err);
  }
});

