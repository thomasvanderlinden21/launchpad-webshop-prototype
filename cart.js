// ── Shared cart module ─────────────────────────────────────────────────────
const CART_KEY = 'ws_cart';

const PRODUCT_DATA = {
  'tap-on-mobile': {
    name: 'Tap on Mobile',
    price: 0,
    priceLabel: '€0',
    category: 'Mobile Terminal',
    image: 'img-tap-on-mobile.png',
    specs: { Connectivity: 'Uses phone WiFi/4G', Printer: 'Not included' }
  },
  'link-2500': {
    name: 'Link/2500',
    price: 79,
    priceLabel: '€79',
    category: 'Mobile Terminal',
    image: 'img-link-2500.png',
    specs: { Connectivity: '4G/LTE, Wi-Fi, Bluetooth', Printer: 'Included' }
  },
  'ex8000': {
    name: 'EX8000',
    price: 238,
    priceLabel: '€238',
    category: 'Portable Terminal',
    image: 'img-terminal.png',
    specs: { Connectivity: '4G/LTE, Wi-Fi', Printer: 'Included' }
  },
  'saturn-1000f2': {
    name: 'Saturn 1000F2',
    price: null,
    priceLabel: 'Contact sales',
    category: 'Countertop Terminal',
    image: 'img-saturn-1000f2.png',
    specs: { Connectivity: 'Ethernet + WiFi + USB', Printer: 'Included' }
  },
  'newland-s30': {
    name: 'Newland S30',
    price: 449,
    priceLabel: '€449',
    category: 'Mobile Terminal',
    image: 'img-terminal.png',
    specs: { Connectivity: '5G/4G/3G/2G, Wi-Fi, Bluetooth', Printer: 'Included' }
  },
  'pay-by-link': {
    name: 'Pay by Link',
    price: 0,
    priceLabel: 'From €0',
    category: 'Digital',
    image: 'img-terminal.png',
    specs: { Connectivity: 'Online', Printer: 'Not required' }
  }
};

const VAT_RATE = 0.21;

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
    cart.push({ id: productId, name: product.name, price: product.price, priceLabel: product.priceLabel, image: product.image, category: product.category, specs: product.specs, qty: 1 });
  }
  saveCart(cart);
  revealNav();
  animateCartIcon();
  showMiniCart();
}

function addAddonToCart(addonId, name, price, priceLabel) {
  const cart = getCart();
  const existing = cart.find(i => i.addonId === addonId);
  if (existing) { existing.qty += 1; } else {
    cart.push({ id: addonId, addonId, name, price, priceLabel, image: 'img-terminal.png', category: 'Add-on', specs: {}, qty: 1 });
  }
  saveCart(cart);
  animateCartIcon();
  showMiniCart();
}

function revealNav() {
  const header     = document.querySelector('header');
  const inpageNav  = document.getElementById('inpage-nav');
  const productBar = document.getElementById('product-sticky-bar');
  if (header)     header.style.transform = 'translateY(0)';
  if (inpageNav)  inpageNav.style.top    = '72px';
  if (productBar && productBar.classList.contains('bar-visible')) productBar.style.top  = '72px';
}

function animateCartIcon() {
  const cartLink = document.querySelector('[aria-label="Shopping cart"]');
  if (!cartLink) return;
  const badge = cartLink.querySelector('[data-cart-badge]');

  cartLink.classList.remove('mc-cart-animate');
  if (badge) badge.classList.remove('mc-badge-animate');

  // Force reflow so re-adding the class retriggers the animation
  void cartLink.offsetWidth;

  cartLink.classList.add('mc-cart-animate');
  if (badge) badge.classList.add('mc-badge-animate');

  cartLink.addEventListener('animationend', () => cartLink.classList.remove('mc-cart-animate'), { once: true });
  if (badge) badge.addEventListener('animationend', () => badge.classList.remove('mc-badge-animate'), { once: true });
}

function removeFromMiniCart(productId) {
  let cart = getCart();
  const idx = cart.findIndex(i => i.id === productId);
  if (idx === -1) return;
  if (cart[idx].qty > 1) { cart[idx].qty -= 1; } else { cart.splice(idx, 1); }
  saveCart(cart);
  if (cart.length === 0) { hideMiniCart(); } else { renderMiniCartContents(); }
}

// ── Mini cart popup ──────────────────────────────────────────────────────────

let miniCartTimeout = null;

function showMiniCart() {
  clearTimeout(miniCartTimeout);

  let popup = document.getElementById('mini-cart-popup');
  if (!popup) {
    // Inject styles once
    if (!document.getElementById('mini-cart-styles')) {
      const style = document.createElement('style');
      style.id = 'mini-cart-styles';
      style.textContent = `
        @keyframes mc-cart-bounce {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.28) rotate(-8deg); }
          55%  { transform: scale(0.92) rotate(5deg); }
          75%  { transform: scale(1.10) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes mc-badge-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.55); }
          70%  { transform: scale(0.88); }
          100% { transform: scale(1); }
        }
.mc-cart-animate {
          animation: mc-cart-bounce 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .mc-badge-animate {
          animation: mc-badge-pop 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        #mini-cart-popup {
          position: fixed;
          top: 80px;
          right: 88px;
          z-index: 99999;
          width: 400px;
          background: #ffffff;
          border: 1px solid #e6ebeb;
          border-radius: 16px;
          box-shadow: 0px 8px 32px rgba(18,22,33,0.10), 0px 2px 8px rgba(18,22,33,0.05);
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          opacity: 0;
          transform: translateY(-6px);
          transition: opacity 0.18s cubic-bezier(0.16,1,0.3,1), transform 0.18s cubic-bezier(0.16,1,0.3,1);
          overflow: hidden;
        }
        #mini-cart-popup.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .mc-header {
          padding: 16px 20px 14px;
          border-bottom: 1px solid #e6ebeb;
          text-align: center;
        }
        .mc-header-label {
          font-size: 15px;
          font-weight: 600;
          color: #121621;
          letter-spacing: -0.01em;
        }
        .mc-items {
          max-height: 320px;
          overflow-y: auto;
        }
        .mc-item {
          display: flex;
          gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid #e6ebeb;
          align-items: flex-start;
        }
        .mc-item:last-child { border-bottom: none; }
        .mc-item-img {
          width: 68px;
          height: 68px;
          background: #f5f7f7;
          border-radius: 10px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity 0.15s;
        }
        .mc-item-img:hover { opacity: 0.8; }
        .mc-item-img img {
          width: 54px;
          height: 54px;
          object-fit: contain;
        }
        .mc-item-body { flex: 1; min-width: 0; }
        .mc-item-row1 {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }
        .mc-item-name {
          font-size: 14px;
          font-weight: 500;
          color: #121621;
          line-height: 1.35;
          transition: color 0.15s;
        }
        .mc-item-name:hover { color: #277777; }
        .mc-item-price {
          font-size: 14px;
          font-weight: 600;
          color: #121621;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .mc-item-vat {
          font-size: 12px;
          color: #6b7676;
          margin-top: 2px;
          text-align: right;
        }
        .mc-item-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          font-size: 13px;
          color: #6b7676;
        }
        .mc-item-sep { color: #e6ebeb; }
        .mc-item-remove {
          background: none;
          border: none;
          font-size: 13px;
          color: #277777;
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color 0.12s;
        }
        .mc-item-remove:hover { color: #1f5c5c; }
        .mc-totals {
          padding: 14px 20px 12px;
          border-top: 1px solid #e6ebeb;
        }
        .mc-totals-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 13px;
          color: #6b7676;
          margin-bottom: 8px;
        }
        .mc-totals-total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 15px;
          font-weight: 600;
          color: #121621;
        }
        .mc-footer {
          padding: 12px 20px 18px;
          border-top: 1px solid #e6ebeb;
        }
        .mc-btn {
          display: block;
          width: 100%;
          background: #277777;
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          padding: 10px 16px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s;
          box-sizing: border-box;
          box-shadow: inset 0px -2px 0px 0px rgba(0,0,0,0.16);
          font-family: inherit;
        }
        .mc-btn:hover { background: #1f5c5c; }
      `;
      document.head.appendChild(style);
    }

    popup = document.createElement('div');
    popup.id = 'mini-cart-popup';
    popup.innerHTML = `
      <div class="mc-header"><span class="mc-header-label">Your basket</span></div>
      <div class="mc-items" id="mini-cart-items"></div>
      <div class="mc-totals" id="mini-cart-totals"></div>
      <div class="mc-footer">
        <a href="basket.html" class="mc-btn">Go to basket</a>
      </div>
    `;
    document.body.appendChild(popup);

    document.addEventListener('mousedown', handleOutsideClick);
  }

  renderMiniCartContents();

  // Trigger enter animation
  requestAnimationFrame(() => requestAnimationFrame(() => popup.classList.add('visible')));

  // Auto-hide after 7s
  miniCartTimeout = setTimeout(hideMiniCart, 7000);
}

function hideMiniCart() {
  clearTimeout(miniCartTimeout);
  const popup = document.getElementById('mini-cart-popup');
  if (!popup) return;
  popup.classList.remove('visible');
  setTimeout(() => {
    popup.remove();
    document.removeEventListener('mousedown', handleOutsideClick);
  }, 200);
}

function handleOutsideClick(e) {
  const popup = document.getElementById('mini-cart-popup');
  if (popup && !popup.contains(e.target)) hideMiniCart();
}


function renderMiniCartContents() {
  const cart = getCart();

  document.getElementById('mini-cart-items').innerHTML = cart.map(item => {
    const lineTotal = item.price != null ? item.price * item.qty : null;
    const vat       = lineTotal != null ? lineTotal * VAT_RATE : null;
    const priceStr  = lineTotal != null ? `€\u00a0${lineTotal.toFixed(2).replace(/\.00$/, '')}` : item.priceLabel;
    const vatStr    = vat != null ? `€\u00a0${vat.toFixed(2)}` : '';
    const img       = item.image || 'img-terminal.png';

    const productUrl = `product.html?id=${item.id}`;

    return `
      <div class="mc-item">
        <a href="${productUrl}" class="mc-item-img" title="View ${item.name}">
          <img src="${img}" alt="${item.name}" onerror="this.src='img-terminal.png'" />
        </a>
        <div class="mc-item-body">
          <div class="mc-item-row1">
            <a href="${productUrl}" class="mc-item-name" style="text-decoration:none;">${item.name}</a>
            <div style="text-align:right;flex-shrink:0;">
              <div class="mc-item-price">${priceStr}</div>
              ${vatStr ? `<div class="mc-item-vat">VAT&nbsp;${vatStr}</div>` : ''}
            </div>
          </div>
          <div class="mc-item-meta">
            <span>Qty:&nbsp;${item.qty}</span>
            <span style="color:#ddd;">|</span>
            <button class="mc-item-remove" onclick="removeFromMiniCart('${item.id}')">Remove item</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const subtotal = cart.reduce((s, i) => s + (i.price != null ? i.price * i.qty : 0), 0);
  const totalVat = subtotal * VAT_RATE;
  const total    = subtotal + totalVat;

  document.getElementById('mini-cart-totals').innerHTML = `
    <div class="mc-totals-row">
      <span>Delivery</span><span>€\u00a00</span>
    </div>
    <div class="mc-totals-total">
      <span>Total <span style="font-size:12px;font-weight:400;color:#888;">(incl. VAT)</span></span>
      <span>€\u00a0${total.toFixed(2)}</span>
    </div>
  `;
}

function renderCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('[data-cart-badge]').forEach(el => {
    el.textContent = total;
    if (el.classList.contains('absolute')) {
      el.style.display = total > 0 ? 'flex' : 'none';
    }
  });
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = total + (total === 1 ? ' item' : ' items');
  });
}

// ── Scroll-hide navigation ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderCartBadge();

  // Show popup on cart icon hover (only when cart has items)
  const cartIcon = document.querySelector('[aria-label="Shopping cart"]');
  if (cartIcon) {
    cartIcon.addEventListener('mouseenter', () => {
      if (getCart().length > 0) showMiniCart();
    });
  }

  const header     = document.querySelector('header');
  const inpageNav  = document.getElementById('inpage-nav');
  const productBar = document.getElementById('product-sticky-bar');
  const EASING     = 'cubic-bezier(0.16,1,0.3,1)';
  const DURATION   = '0.4s';

  if (header) {
    header.style.transition = `transform ${DURATION} ${EASING}`;
    header.style.willChange = 'transform';
  }
  if (inpageNav) {
    inpageNav.style.transition = `top ${DURATION} ${EASING}`;
  }
  // Set product bar transition after first paint so the initial hidden state (top:0) doesn't animate
  if (productBar) {
    requestAnimationFrame(() => {
      productBar.style.transition = `top ${DURATION} ${EASING}`;
    });
  }

  let lastY   = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastY && currentY > 80;

      if (header) {
        header.style.transform = scrollingDown ? 'translateY(-100%)' : 'translateY(0)';
      }
      // When header hides, pull sub-navs up to fill the gap; restore when header returns
      if (inpageNav) {
        inpageNav.style.top = scrollingDown ? '0px' : '72px';
      }
      if (productBar && productBar.classList.contains('bar-visible')) {
        productBar.style.top = scrollingDown ? '0px' : '72px';
      }

      // Also hide mini-cart popup when nav hides
      if (scrollingDown) hideMiniCart();

      lastY   = currentY;
      ticking = false;
    });
  }, { passive: true });
});
