const apiUrl = "https://api.noroff.dev/api/v1/rainy-days";
const STORAGE_KEY = 'rainy_basket_v1';

/* ------------------ Helpers ------------------ */
// safe get by id
function $id(id) { return document.getElementById(id); }

// Escape HTML
function escapeHtml(str = '') {
  return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'", '&#39;');
}

// Format price helper
function formatPrice(n) {
  if (n === null || n === undefined) return '';
  const val = Number(n);
  if (Number.isNaN(val)) return String(n);
  return val % 1 === 0 ? `$${val}` : `$${val.toFixed(2)}`;
}

/* ------------------ Load header & footer ------------------ */
async function loadHeaderFooter() {
  try {
    const response = await fetch('global.html');  // ton fichier global contenant header + footer
    const text = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;

    // Inject header
    const header = tempDiv.querySelector('header');
    if (header) $id('header-container')?.appendChild(header);

    // Inject footer
    const


