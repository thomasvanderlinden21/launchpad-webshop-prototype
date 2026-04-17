// ── Shared cart module ─────────────────────────────────────────────────────
// All pages include this script. It manages cart state in localStorage,
// renders the cart badge in the header, and exposes addToCart().

const CART_KEY = 'ws_cart';

const PRODUCT_DATA = {
  'tap-on-mobile': {
    name: 'Tap on Mobile',
    price: 0,
    priceLabel: '€0',
    category: 'Mobile Terminal',
    specs: { Connectivity: 'Uses phone WiFi/4G', Printer: 'Not included' }
  },
  'link-2500': {
    name: 'Link/2500',
    price: 79,
    priceLabel: '€79',
    category: 'Mobile Terminal',
    specs: { Connectivity: '4G/LTE, Wi-Fi, Bluetooth', Printer: 'Included' }
  },
  'ex8000': {
    name: 'EX8000',
    price: 238,
    priceLabel: '€238',
    category: 'Portable Terminal',
    specs: { Connectivity: '4G/LTE, Wi-Fi', Printer: 'Included' }
  },
  'saturn-1000f2': {
    name: 'Saturn 1000F2',
    price: null,
    priceLabel: 'Contact sales',
    category: 'Countertop Terminal',
    specs: { Connectivity: 'Ethernet + WiFi + USB', Printer: 'Included' }
  },
  'newland-s30': {
    name: 'Newland S30',
    price: 449,
    priceLabel: '€449',
    category: 'Mobile Terminal',
    specs: { Connectivity: '5G/4G/3G/2G, Wi-Fi, Bluetooth', Printer: 'Included' }
  },
  'pay-by-link': {
    name: 'Pay by Link',
    price: 0,
    priceLabel: 'From €0',
    category: 'Digital',
    specs: { Connectivity: 'Online', Printer: 'Not required' }
  }
};

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartBadge();
}

function addToCart(productId) {
  const product = PRODUCT_DATA[productId];
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === productId && !i.addonId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, name: product.name, price: product.price, priceLabel: product.priceLabel, category: product.category, specs: product.specs, qty: 1 });
  }
  saveCart(cart);
  showAddedToast(product.name);
}

function addAddonToCart(addonId, name, price, priceLabel) {
  const cart = getCart();
  const existing = cart.find(i => i.addonId === addonId);
  if (existing) { existing.qty += 1; } else {
    cart.push({ id: addonId, addonId, name, price, priceLabel, category: 'Add-on', specs: {}, qty: 1 });
  }
  saveCart(cart);
  showAddedToast(name);
}

function showAddedToast(name) {
  // Remove existing toast
  const old = document.getElementById('cart-toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.id = 'cart-toast';
  toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#121621] text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg flex items-center gap-3 transition-all';
  toast.innerHTML = `
    <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
    <span>${name} added to basket</span>
    <a href="basket.html" class="underline text-gray-300 hover:text-white ml-1">View basket</a>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function renderCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('[data-cart-badge]').forEach(el => {
    el.textContent = total;
    // Support both inline count (always visible) and badge (hidden when 0)
    if (el.classList.contains('absolute')) {
      el.style.display = total > 0 ? 'flex' : 'none';
    }
  });
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = total + (total === 1 ? ' item' : ' items');
  });
}

// Auto-init badge on DOMContentLoaded
document.addEventListener('DOMContentLoaded', renderCartBadge);
