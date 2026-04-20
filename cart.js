// ── Shared cart module ─────────────────────────────────────────────────────
const CART_KEY = 'ws_cart';

const PRODUCT_DATA = {
  'tap-on-mobile': {
    name: 'Tap on Mobile',
    price: 0,
    priceLabel: '€0',
    category: 'Mobile Terminal',
    image: 'Tap on mobile.png',
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
  cart.splice(idx, 1);
  saveCart(cart);
  if (cart.length === 0) { hideMiniCart(); } else { renderMiniCartContents(); }
}

function changeQtyInMiniCart(productId, delta) {
  let cart = getCart();
  const idx = cart.findIndex(i => i.id === productId);
  if (idx === -1) return;
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(cart);
  renderMiniCartContents();
}

// ── Mini cart drawer ─────────────────────────────────────────────────────────

function showMiniCart() {
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
      .mc-cart-animate { animation: mc-cart-bounce 0.5s cubic-bezier(0.16,1,0.3,1) both; }
      .mc-badge-animate { animation: mc-badge-pop 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both; }

      #mini-cart-overlay {
        position: fixed; inset: 0; z-index: 99998;
        background: rgba(18,22,33,0.40);
        opacity: 0; transition: opacity 0.28s ease;
      }
      #mini-cart-overlay.visible { opacity: 1; }

      #mini-cart-popup {
        position: fixed; top: 0; right: 0; bottom: 0; z-index: 99999;
        width: 420px;
        background: #ffffff;
        box-shadow: -8px 0 40px rgba(18,22,33,0.12);
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
        display: flex; flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.32s cubic-bezier(0.16,1,0.3,1);
      }
      #mini-cart-popup.visible { transform: translateX(0); }

      .mc-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        padding: 24px 24px 18px; border-bottom: 1px solid #e6ebeb; flex-shrink: 0;
      }
      .mc-header-title { font-size: 20px; font-weight: 600; color: #121621; letter-spacing: -0.02em; display: block; }
      .mc-header-count { font-size: 13px; color: #6b7676; margin-top: 3px; display: block; }
      .mc-close-btn {
        width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
        background: #f5f7f7; border: none; border-radius: 50%; cursor: pointer; flex-shrink: 0;
        transition: background 0.15s; color: #6b7676;
      }
      .mc-close-btn:hover { background: #e6ebeb; color: #121621; }

      .mc-body { flex: 1; overflow-y: auto; }
      .mc-body::-webkit-scrollbar { width: 4px; }
      .mc-body::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }

      .mc-item {
        display: flex; gap: 14px; padding: 18px 24px;
        border-bottom: 1px solid #f3f4f6; align-items: flex-start;
      }
      .mc-item-img {
        width: 72px; height: 72px; background: #f5f7f7; border-radius: 10px;
        flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;
      }
      .mc-item-img img { width: 54px; height: 54px; object-fit: contain; }
      .mc-item-body { flex: 1; min-width: 0; }
      .mc-item-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 2px; }
      .mc-item-name { font-size: 14px; font-weight: 500; color: #121621; text-decoration: none; line-height: 1.35; }
      .mc-item-name:hover { color: #277777; }
      .mc-item-price { font-size: 14px; font-weight: 600; color: #121621; white-space: nowrap; flex-shrink: 0; }
      .mc-item-sub { font-size: 12px; color: #6b7676; margin-bottom: 2px; }
      .mc-item-spec { font-size: 12px; color: #6b7676; margin-bottom: 10px; }
      .mc-item-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
      .mc-qty {
        display: flex; align-items: center;
        border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; height: 30px;
      }
      .mc-qty-btn {
        width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
        background: none; border: none; cursor: pointer; color: #6b7676; transition: background 0.12s;
      }
      .mc-qty-btn:hover { background: #f5f7f7; color: #121621; }
      .mc-qty-num {
        width: 28px; text-align: center; font-size: 13px; font-weight: 500; color: #121621;
        border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;
        height: 100%; display: flex; align-items: center; justify-content: center;
      }
      .mc-item-remove {
        background: none; border: none; font-size: 12px; color: #6b7676;
        cursor: pointer; padding: 0; font-family: inherit; transition: color 0.12s;
      }
      .mc-item-remove:hover { color: #121621; text-decoration: underline; }

      .mc-ai-card {
        margin: 14px 20px; background: #f5f7f7; border: 1px solid #e6ebeb; border-radius: 14px; padding: 16px;
      }
      .mc-ai-top { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
      .mc-ai-icon {
        width: 38px; height: 38px; background: #3d4d4d; border-radius: 50%;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .mc-ai-text { flex: 1; min-width: 0; }
      .mc-ai-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
      .mc-ai-title { font-size: 13px; font-weight: 600; color: #121621; }
      .mc-ai-badge { font-size: 10px; font-weight: 600; color: #ffffff; background: #277777; padding: 2px 8px; border-radius: 20px; letter-spacing: 0.02em; flex-shrink: 0; }
      .mc-ai-desc { font-size: 12px; color: #6b7676; line-height: 1.55; }
      .mc-ai-cta {
        width: 100%; background: transparent; border: 1px solid #c8d0d0;
        color: #121621; font-size: 12px; font-weight: 500; padding: 9px 12px;
        border-radius: 8px; cursor: pointer; text-align: center; font-family: inherit;
        transition: background 0.15s; box-sizing: border-box; margin-top: 2px;
      }
      .mc-ai-cta:hover { background: #e8eded; }

      .mc-pricing { padding: 16px 24px 4px; }
      .mc-pricing-row {
        display: flex; justify-content: space-between; align-items: baseline;
        font-size: 13px; color: #6b7676; margin-bottom: 10px;
      }
      .mc-pricing-total {
        display: flex; justify-content: space-between; align-items: baseline;
        font-size: 17px; font-weight: 600; color: #121621;
        padding-top: 14px; border-top: 1px solid #e6ebeb; margin-top: 4px;
      }

      .mc-footer { padding: 16px 20px 24px; border-top: 1px solid #e6ebeb; flex-shrink: 0; }
      .mc-cta {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        width: 100%; background: #121621; color: #ffffff;
        font-size: 14px; font-weight: 500; padding: 15px 20px;
        border-radius: 100px; text-decoration: none; border: none; cursor: pointer;
        font-family: inherit; transition: background 0.15s; box-sizing: border-box;
      }
      .mc-cta:hover { background: #1e2a2a; }
      .mc-trust { display: flex; align-items: center; justify-content: center; gap: 0; margin-top: 14px; }
      .mc-trust-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #6b7676; padding: 0 10px; }
      .mc-trust-item + .mc-trust-item { border-left: 1px solid #e6ebeb; }
    `;
    document.head.appendChild(style);
  }

  // Overlay
  let overlay = document.getElementById('mini-cart-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mini-cart-overlay';
    overlay.addEventListener('click', hideMiniCart);
    document.body.appendChild(overlay);
  }

  // Drawer
  let popup = document.getElementById('mini-cart-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'mini-cart-popup';
    popup.innerHTML = `
      <div class="mc-header">
        <div>
          <span class="mc-header-title">Your Basket</span>
          <span class="mc-header-count" id="mc-item-count"></span>
        </div>
        <button class="mc-close-btn" onclick="hideMiniCart()" aria-label="Close basket">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="mc-body">
        <div id="mini-cart-items"></div>
        <div id="mc-ai-card" class="mc-ai-card" style="display:none;">
          <div class="mc-ai-top">
            <div class="mc-ai-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.7.7m13.16 13.16.7.7M3 12h1m16 0h1M4.92 19.08l.7-.7M18.38 5.62l.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
            </div>
            <div class="mc-ai-text">
              <div class="mc-ai-title-row">
                <span class="mc-ai-title">Essential mobile protection</span>
                <span class="mc-ai-badge">AI advice</span>
              </div>
              <p class="mc-ai-desc">Your portable terminal is exposed to drops and bumps. We strongly recommend adding a protective case and spare charger.</p>
            </div>
          </div>
          <button class="mc-ai-cta" onclick="addAddonToCart('carry-case','Protective Carry Case',29,'€29'); renderMiniCartContents();">Add Protective Carry Case</button>
        </div>
        <div class="mc-pricing" id="mini-cart-totals"></div>
      </div>
      <div class="mc-footer">
        <a href="basket.html" class="mc-cta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/></svg>
          Go to basket
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </a>
        <div class="mc-trust">
          <div class="mc-trust-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M3 6h18M9 14h6M9 18h6"/></svg>
            Free returns
          </div>
          <div class="mc-trust-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path stroke-linecap="round" d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Secure payment
          </div>
          <div class="mc-trust-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/></svg>
            Next-day delivery
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';
  }

  renderMiniCartContents();

  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.classList.add('visible');
    popup.classList.add('visible');
  }));
}

function hideMiniCart() {
  const popup   = document.getElementById('mini-cart-popup');
  const overlay = document.getElementById('mini-cart-overlay');
  if (!popup) return;
  popup.classList.remove('visible');
  if (overlay) overlay.classList.remove('visible');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (popup)   popup.remove();
    if (overlay) overlay.remove();
  }, 320);
}

function renderMiniCartContents() {
  const cart = getCart();

  // Update header count
  const countEl = document.getElementById('mc-item-count');
  if (countEl) {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    countEl.textContent = `${total} item${total !== 1 ? 's' : ''}`;
  }

  // Show AI card only when there are terminal items (not just add-ons)
  const aiCard = document.getElementById('mc-ai-card');
  if (aiCard) aiCard.style.display = cart.some(i => !i.addonId) ? 'block' : 'none';

  document.getElementById('mini-cart-items').innerHTML = cart.map(item => {
    const lineTotal = item.price != null ? item.price * item.qty : null;
    const priceStr  = lineTotal != null ? `€${lineTotal}` : item.priceLabel;
    const img       = item.image || 'img-terminal.png';
    const productUrl = `product.html?id=${item.id}`;
    const firstSpec  = Object.entries(item.specs || {})[0];
    const specStr    = firstSpec ? `${firstSpec[0]}: ${firstSpec[1]}` : '';

    return `
      <div class="mc-item">
        <div class="mc-item-img">
          <img src="${img}" alt="${item.name}" onerror="this.src='img-terminal.png'" />
        </div>
        <div class="mc-item-body">
          <div class="mc-item-top">
            <a href="${productUrl}" class="mc-item-name">${item.name}</a>
            <span class="mc-item-price">${priceStr}</span>
          </div>
          <div class="mc-item-sub">${item.category}</div>
          ${specStr ? `<div class="mc-item-spec">${specStr}</div>` : ''}
          <div class="mc-item-actions">
            <div class="mc-qty">
              <button class="mc-qty-btn" onclick="changeQtyInMiniCart('${item.id}', -1)" ${item.qty <= 1 ? 'style="opacity:0.35;pointer-events:none;"' : ''}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M5 12h14"/></svg>
              </button>
              <span class="mc-qty-num">${item.qty}</span>
              <button class="mc-qty-btn" onclick="changeQtyInMiniCart('${item.id}', 1)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>
            <button class="mc-item-remove" onclick="removeFromMiniCart('${item.id}')">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const subtotal = cart.reduce((s, i) => s + (i.price != null ? i.price * i.qty : 0), 0);
  const vat      = Math.round(subtotal * 0.20);
  const shipping = subtotal > 0 ? 15 : 0;
  const total    = subtotal + vat + shipping;

  document.getElementById('mini-cart-totals').innerHTML = `
    <div class="mc-pricing-row"><span>Subtotal</span><span>€${subtotal}</span></div>
    <div class="mc-pricing-row"><span>VAT (20%)</span><span>€${vat}</span></div>
    <div class="mc-pricing-row"><span>Shipping</span><span>€${shipping}</span></div>
    <div class="mc-pricing-total"><span>Total</span><span>€${total}</span></div>
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

  // Open drawer on cart icon hover or click
  const cartIcon = document.querySelector('[aria-label="Shopping cart"]');
  if (cartIcon) {
    cartIcon.addEventListener('mouseenter', () => {
      if (getCart().length > 0) showMiniCart();
    });
    cartIcon.addEventListener('click', (e) => {
      e.preventDefault();
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
