// ── Shared cart module ─────────────────────────────────────────────────────
const CART_KEY = 'ws_cart';

function fmt(n) { return '€' + Number(n).toFixed(2); }

const PRODUCT_DATA = {
  'tap-on-mobile': {
    name: 'Tap on Mobile',
    price: 0,
    priceLabel: '€0.00',
    category: 'Mobile Terminal',
    image: 'assets/Terminal renders/Tap on mobile/Tap on mobile.png',
    specs: { Compatibility: 'Android 12+', Connectivity: 'Device WiFi / 4G', 'Card reader': 'NFC contactless', Printer: 'Not included', 'Monthly fee': 'None' }
  },
  'link-2500': {
    name: 'Link/2500',
    price: 79,
    priceLabel: '€79.00',
    category: 'Mobile Terminal',
    image: 'assets/Terminal renders/Link/link_2.png',
    specs: { Connectivity: '4G/LTE, Wi-Fi, Bluetooth', Battery: '8 hours', Printer: 'Not included', Screen: '2.4"', Weight: '165g', OS: 'Android 10' }
  },
  'ex4000': {
    name: 'EX4000',
    price: 238,
    priceLabel: '€238.00',
    category: 'Portable Terminal',
    image: 'assets/Terminal renders/axium ex4000/Axium EX4000 1.png',
    specs: { Connectivity: '4G/LTE, Wi-Fi, Bluetooth', Battery: 'Up to 12 hours', Printer: 'Built-in thermal', Screen: '5.5" HD touchscreen', Weight: '420g' }
  },
  'saturn-1000f2': {
    name: 'Saturn 1000F2',
    price: 499,
    priceLabel: '€499.00',
    category: 'Countertop Terminal',
    image: 'assets/Terminal renders/Saturn/1.png',
    specs: { Connectivity: 'Ethernet, Wi-Fi, optional 4G', Power: 'Mains powered', Printer: 'Built-in high-speed thermal', Screen: '7" colour display', Security: 'PCI PTS 6.x' }
  },
  'newland-s30': {
    name: 'Newland S30',
    price: 449,
    priceLabel: '€449.00',
    category: 'Mobile Terminal',
    image: 'assets/placeholder-terminal.svg',
    specs: { Connectivity: '5G/4G/3G/2G, Wi-Fi, Bluetooth', OS: 'Android 13', Printer: 'Built-in thermal', Security: 'PCI PTS certified' }
  },
  'pay-by-link': {
    name: 'Pay by Link',
    price: 0,
    priceLabel: 'From €0.00',
    category: 'Digital',
    image: 'assets/placeholder-terminal.svg',
    specs: { Hardware: 'None required', Delivery: 'Email or SMS', Setup: 'Instant', Security: 'PCI DSS compliant' }
  }
};

const VAT_RATE = 0.21;

// Compatible products shown in the "added to cart" modal
const COMPATIBLE = {
  'tap-on-mobile': ['link-2500', 'pay-by-link'],
  'link-2500':     ['ex4000', 'pay-by-link'],
  'ex4000':        ['link-2500', 'newland-s30'],
  'saturn-1000f2': ['ex4000', 'newland-s30'],
  'newland-s30':   ['ex4000', 'saturn-1000f2'],
  'pay-by-link':   ['tap-on-mobile', 'link-2500'],
};

const PRODUCT_DESCRIPTIONS = {
  'tap-on-mobile': 'Turn any Android 12+ phone into a contactless terminal — no hardware, no monthly fees.',
  'link-2500':     'Compact 165g mobile terminal with touchscreen, physical keyboard, and 8-hour battery.',
  'ex4000':        '5.5" HD touchscreen, 12-hour battery, built-in printer. Built for high-volume mobile use.',
  'saturn-1000f2': 'High-performance countertop terminal with 7" display and high-speed thermal printer.',
  'newland-s30':   'Android 13, 5G connectivity, and built-in printer in one future-proof mobile device.',
  'pay-by-link':   'Send a payment link by email or SMS. No hardware. Works on any device.',
};

const PRODUCT_RENDERS = {
  'tap-on-mobile': 'assets/Terminal renders/Tap on mobile/Tap on mobile.png',
  'link-2500':     'assets/Terminal renders/Link/link_2.png',
  'ex4000':        'assets/Terminal renders/axium ex4000/Axium EX4000 1.png',
  'saturn-1000f2': 'assets/Terminal renders/Saturn/1.png',
  'newland-s30':   'assets/placeholder-terminal.svg',
  'pay-by-link':   'assets/placeholder-terminal.svg',
};

const LINK2500_ACCESSORIES = [
  {
    id: 'link-protective-cover',
    name: 'Protective Cover',
    art: 'Art. 23406',
    price: 19.95,
    priceLabel: '€19.95',
    image: "assets/Link recommendations /Link_2500 Protective Cover - Art 23406 - €19,95 excl.VAT 1.png",
    desc: 'Slim-fit cover designed for the Link/2500. Protects against everyday drops and scratches.',
  },
  {
    id: 'link-cover-lanyard',
    name: 'Protective Cover + Lanyard',
    art: 'Art. 23407',
    price: 24.95,
    priceLabel: '€24.95',
    image: "assets/Link recommendations /Link_2500 Protective cover including lanyard - Art 23407 €24,95 excl.VAT 1.png",
    desc: 'All-day protection with a lanyard so your terminal is always within reach.',
  },
  {
    id: 'link-desktop-stand',
    name: 'Desktop Stand + Cover',
    art: 'Art. 23408',
    price: 59.95,
    priceLabel: '€59.95',
    image: "assets/Link recommendations /Link_2500 Desktop stand including protective coevr - Art 23408 - €59,95 excl VAT 1.png",
    desc: 'Transform your mobile terminal into a countertop setup. Includes protective cover.',
  },
  {
    id: 'link-multi-charger',
    name: 'Multi-Charger (3 terminals)',
    art: 'Art. 23072',
    price: 159.95,
    priceLabel: '€159.95',
    image: "assets/Link recommendations /Link_2500 Multi-Charger for 3 Terminals - Art 23072 - €159,95 excl.VAT 1.png",
    desc: 'Charge up to 3 Link/2500 terminals simultaneously. Perfect for multi-terminal setups.',
  },
  {
    id: 'link-usb-cable',
    name: 'USB Cable (USB-A to USB-C 1.5m)',
    art: 'Art. 23400',
    price: 5.95,
    priceLabel: '€5.95',
    image: "assets/Link recommendations /Link_2500 USB Cable (USB-A to USB-C) 1.5m - Art 23400 - €5,95 excl VAT 1.png",
    desc: '1.5m USB-A to USB-C cable for reliable daily charging.',
  },
  {
    id: 'link-power-supply',
    name: 'Power Supply (5V-1A USB-A)',
    art: 'Art. 23402',
    price: 7.95,
    priceLabel: '€7.95',
    image: "assets/Link recommendations /Link_2500 Multi-Charger for 3 Terminals - Art 23402 - €7,95 excl VAT  1.png",
    desc: '5V 1A USB-A power supply for charging your Link/2500 terminal.',
  },
  {
    id: 'link-battery',
    name: 'Battery (1200mAh)',
    art: 'Art. 23401',
    price: 27.95,
    priceLabel: '€27.95',
    image: "assets/Link recommendations /Link_2500 Battery (1200mAh) - Art.23401 - €27,95 excl VAT (1) 1.png",
    desc: 'Genuine 1200mAh replacement battery. Always have a spare ready for busy days.',
  },
];

const SATURN1000F2_ACCESSORIES = [
  {
    id: 'saturn-paper-rolls',
    name: 'Paper Rolls (Pack of 20)',
    art: 'Art. 20511',
    price: 28.90,
    priceLabel: '€28.90',
    image: "assets/Saturn recommendations/Paper rolls for Saturn 1000F2 Portable — Art. 20511 — Pack of 20 paper rolls — €28.90 excl. VAT 1.png",
    desc: 'Pack of 20 paper rolls for the Saturn 1000F2. Keep your receipt printing uninterrupted.',
  },
  {
    id: 'saturn-battery',
    name: 'Spare Battery',
    art: 'Art. 22605',
    price: 54.95,
    priceLabel: '€54.95',
    image: "assets/Saturn recommendations/Battery for Saturn 1000F2 Portable Saturn spare battery Art. 22605 54.95 EUR excluding VAT 1.png",
    desc: 'Genuine Saturn 1000F2 spare battery. Always have a backup ready for busy shifts.',
  },
  {
    id: 'saturn-power-adapter',
    name: 'Power Adapter',
    art: 'Art. 22610',
    price: 12.95,
    priceLabel: '€12.95',
    image: "assets/Saturn recommendations/Power adapter for Saturn 1000F2 Portable charger for Saturn Art. 22610 12.95 EUR excluding VAT 1.png",
    desc: 'Compact power adapter for direct charging of your Saturn 1000F2.',
  },
  {
    id: 'saturn-charging-station',
    name: 'Charging Station',
    art: 'Art. 22601',
    price: 39.95,
    priceLabel: '€39.95',
    image: "assets/Saturn recommendations/Charging station for Saturn 1000F2 Portable Saturn charging station Art. 22601 39.95 EUR excluding VAT 1.png",
    desc: 'Desktop charging station. Keeps your Saturn 1000F2 ready and prominently positioned at your counter.',
  },
  {
    id: 'saturn-power-adapter-dock',
    name: 'Power Adapter (Dock)',
    art: 'Art. 22606',
    price: 34.95,
    priceLabel: '€34.95',
    image: "assets/Saturn recommendations/Power adapter for Saturn 1000F2 Portable charging station Saturn charging station Art. 22606 34.95 EUR excluding VAT 1.png",
    desc: 'Power adapter for the Saturn 1000F2 charging station dock.',
  },
  {
    id: 'saturn-eu-power-cable',
    name: 'EU Power Cable',
    art: 'Art. 22603',
    price: 9.95,
    priceLabel: '€9.95',
    image: "assets/Saturn recommendations/EU power cable for Saturn 1000F2 Portable charging station Saturn charging station Art. 22603 9.95 EUR excluding VAT 1.png",
    desc: 'EU-standard power cable for the Saturn 1000F2 charging station.',
  },
];

// Renders the Link/2500 accessories section on the basket page
function renderLinkAccessoriesSection(cart) {
  const linkSection = document.getElementById('link-accessories-section');
  if (!linkSection) return;

  const hasLink2500 = cart.some(i => i.id === 'link-2500' && !i.addonId);
  linkSection.classList.toggle('hidden', !hasLink2500);
  if (!hasLink2500) return;

  const cartAddonIds = new Set(cart.filter(i => i.addonId).map(i => i.addonId));
  const linkGrid = document.getElementById('link-accessories-grid');
  if (!linkGrid) return;

  linkGrid.innerHTML = LINK2500_ACCESSORIES.map(a => {
    const inCart = cartAddonIds.has(a.id);
    const imgHtml = a.image
      ? `<img src="${a.image}" alt="${a.name}" class="w-full h-full object-contain p-2" />`
      : `<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#c8d0d0" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path stroke-linecap="round" d="M9 12h6M12 9v6"/></svg></div>`;
    const safeId    = a.id;
    const safeName  = a.name.replace(/'/g, "\\'");
    const safeImg   = a.image ? a.image.replace(/'/g, "\\'") : '';
    const imgArg    = a.image ? `'${safeImg}'` : 'null';
    const btnHtml = inCart
      ? `<span class="text-[13px] font-medium text-[#277777] flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Added</span>`
      : `<button onclick="addAddonToCart('${safeId}','${safeName}',${a.price},'${a.priceLabel}',${imgArg}); if(window.renderBasket) renderBasket();" class="text-[13px] font-medium text-[#277777] border border-[#277777] rounded-[8px] px-4 py-2.5 hover:bg-[#f0f7f7] transition-colors">Add</button>`;
    return `
      <div class="bg-white border border-[#ebebeb] rounded-[16px] p-5 flex flex-col gap-3${inCart ? ' opacity-60' : ''}">
        <div class="w-full h-[120px] bg-[#f5f7f7] rounded-[12px] overflow-hidden">${imgHtml}</div>
        <div class="flex-1">
          <p class="text-base font-medium text-[#121621]">${a.name}</p>
          <p class="text-[11px] text-[#8a9696] mt-0.5 mb-1">${a.art}</p>
          <p class="text-sm text-[#6b7676]">${a.desc}</p>
        </div>
        <div class="flex items-center justify-between mt-auto pt-2">
          <span class="text-base font-semibold text-[#121621]">${a.priceLabel}</span>
          ${btnHtml}
        </div>
      </div>`;
  }).join('');
}

// Renders the Saturn 1000F2 accessories section on the basket page
function renderSaturnAccessoriesSection(cart) {
  const saturnSection = document.getElementById('saturn-accessories-section');
  if (!saturnSection) return;

  const hasSaturn = cart.some(i => i.id === 'saturn-1000f2' && !i.addonId);
  saturnSection.classList.toggle('hidden', !hasSaturn);
  if (!hasSaturn) return;

  const cartAddonIds = new Set(cart.filter(i => i.addonId).map(i => i.addonId));
  const saturnGrid = document.getElementById('saturn-accessories-grid');
  if (!saturnGrid) return;

  saturnGrid.innerHTML = SATURN1000F2_ACCESSORIES.map(function(a) {
    const inCart = cartAddonIds.has(a.id);
    const imgHtml = a.image
      ? '<img src="' + a.image + '" alt="' + a.name + '" class="w-full h-full object-contain p-2" />'
      : '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#c8d0d0" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path stroke-linecap="round" d="M9 12h6M12 9v6"/></svg></div>';
    const safeId    = a.id;
    const safeName  = a.name.replace(/'/g, "\\'");
    const safeImg   = a.image ? a.image.replace(/'/g, "\\'") : '';
    const imgArg    = a.image ? ("'" + safeImg + "'") : 'null';
    const btnHtml = inCart
      ? '<span class="text-[13px] font-medium text-[#277777] flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Added</span>'
      : '<button onclick="addAddonToCart(\'' + safeId + '\',\'' + safeName + '\',' + a.price + ',\'' + a.priceLabel + '\',' + imgArg + '); if(window.renderBasket) renderBasket();" class="text-[13px] font-medium text-[#277777] border border-[#277777] rounded-[8px] px-4 py-2.5 hover:bg-[#f0f7f7] transition-colors">Add</button>';
    return '<div class="bg-white border border-[#ebebeb] rounded-[16px] p-5 flex flex-col gap-3' + (inCart ? ' opacity-60' : '') + '">'
      + '<div class="w-full h-[120px] bg-[#f5f7f7] rounded-[12px] overflow-hidden">' + imgHtml + '</div>'
      + '<div class="flex-1">'
      + '<p class="text-base font-medium text-[#121621]">' + a.name + '</p>'
      + '<p class="text-[11px] text-[#8a9696] mt-0.5 mb-1">' + a.art + '</p>'
      + '<p class="text-sm text-[#6b7676]">' + a.desc + '</p>'
      + '</div>'
      + '<div class="flex items-center justify-between mt-auto pt-2">'
      + '<span class="text-base font-semibold text-[#121621]">' + a.priceLabel + '</span>'
      + btnHtml
      + '</div></div>';
  }).join('');
}

// Renders the accessories upsell section on the buy.html page
function renderBuyPageAccessories(productId) {
  var wrapper = document.getElementById('buy-accessories-wrapper');
  if (!wrapper) return;

  var accessories = null;
  var terminalName = '';
  var terminalPriceNum = 0;
  var terminalPriceLabel = '';

  if (productId === 'link-2500') {
    accessories = LINK2500_ACCESSORIES;
    terminalName = 'Link/2500';
    terminalPriceNum = 79;
    terminalPriceLabel = '€79';
  } else if (productId === 'saturn-1000f2') {
    accessories = SATURN1000F2_ACCESSORIES;
    terminalName = 'Saturn 1000F2';
    terminalPriceNum = 499;
    terminalPriceLabel = '€499';
  }

  if (!accessories || accessories.length === 0) return;

  wrapper.classList.remove('hidden');

  var titleEl = document.getElementById('buy-accessories-title');
  if (titleEl) titleEl.textContent = 'Compatible accessories for ' + terminalName;

  var selectedIds = {};

  function formatPriceNum(num) {
    if (num === 0) return 'Free';
    var str = num.toFixed(2);
    return '\u20ac' + (str.slice(-3) === '.00' ? str.slice(0, -3) : str);
  }

  function updateSubtotal() {
    var linesEl = document.getElementById('buy-subtotal-lines');
    var totalEl = document.getElementById('buy-subtotal-total');
    if (!linesEl || !totalEl) return;
    var total = terminalPriceNum;
    var html = '<div class="flex items-start justify-between gap-2 pb-2.5">'
      + '<span class="text-[13px] text-[#525d5d]">' + terminalName + '</span>'
      + '<span class="text-[13px] font-medium text-[#121621] flex-shrink-0">' + terminalPriceLabel + '</span>'
      + '</div>';
    for (var k in selectedIds) {
      var a = selectedIds[k];
      total += a.price;
      html += '<div class="flex items-start justify-between gap-2 pb-2.5">'
        + '<span class="text-[13px] text-[#525d5d] leading-snug">' + a.name + '</span>'
        + '<span class="text-[13px] font-medium text-[#121621] flex-shrink-0">' + a.priceLabel + '</span>'
        + '</div>';
    }
    linesEl.innerHTML = html;
    totalEl.textContent = formatPriceNum(total);
  }

  var listEl = document.getElementById('buy-accessories-list');
  if (!listEl) return;

  listEl.innerHTML = '';

  accessories.forEach(function(acc) {
    var row = document.createElement('div');
    row.id = 'buy-acc-row-' + acc.id;
    row.className = 'flex items-center gap-5 bg-white border border-[#ededed] rounded-[14px] p-4 hover:border-[#c8d0d0] transition-all';
    var imgSrc = acc.image || 'assets/placeholder-terminal.svg';
    row.innerHTML = '<div class="w-[76px] h-[76px] bg-[#f5f7f7] rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden">'
      + '<img src="' + imgSrc + '" alt="' + acc.name + '" class="w-[60px] h-[60px] object-contain" />'
      + '</div>'
      + '<div class="flex-1 min-w-0">'
      + '<p class="text-[14px] font-semibold text-[#121621] mb-0.5">' + acc.name + '</p>'
      + '<p class="text-[11px] text-[#aab4b4] font-medium mb-1.5">' + acc.art + '</p>'
      + '<p class="text-[13px] text-[#6b7676] leading-snug">' + acc.desc + '</p>'
      + '</div>'
      + '<div class="flex flex-col items-end gap-2.5 flex-shrink-0 pl-2">'
      + '<span class="text-[16px] font-semibold text-[#121621]">' + acc.priceLabel + '</span>'
      + '<button class="buy-acc-add-btn h-9 px-5 rounded-[8px] bg-[#277777] text-white text-[13px] font-medium hover:bg-[#1f5c5c] transition-colors whitespace-nowrap" data-acc-id="' + acc.id + '">Add</button>'
      + '</div>';
    listEl.appendChild(row);
  });

  listEl.querySelectorAll('.buy-acc-add-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var accId = btn.getAttribute('data-acc-id');
      var acc = null;
      for (var i = 0; i < accessories.length; i++) {
        if (accessories[i].id === accId) { acc = accessories[i]; break; }
      }
      if (!acc || selectedIds[accId]) return;
      selectedIds[accId] = acc;
      addAddonToCart(acc.id, acc.name, acc.price, acc.priceLabel, acc.image);
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline;vertical-align:middle;margin-right:4px;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Added';
      btn.className = 'buy-acc-add-btn h-9 px-5 rounded-[8px] bg-[#eef7f5] text-[#277777] text-[13px] font-medium border border-[#277777] whitespace-nowrap';
      btn.style.pointerEvents = 'none';
      var rowEl = document.getElementById('buy-acc-row-' + accId);
      if (rowEl) rowEl.className = 'flex items-center gap-5 bg-[#f7fcfb] border border-[#b8ddd7] rounded-[14px] p-4 transition-all';
      updateSubtotal();
    });
  });

  var contBtn = document.getElementById('buy-acc-continue-btn');
  if (contBtn) {
    contBtn.addEventListener('click', function() {
      window.location.href = 'basket.html';
    });
  }

  updateSubtotal();
}

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
  showAddedToast(product.name, product.priceLabel);
}

function addAddonToCart(addonId, name, price, priceLabel, image) {
  const cart = getCart();
  const existing = cart.find(i => i.addonId === addonId);
  if (existing) { existing.qty += 1; } else {
    cart.push({ id: addonId, addonId, name, price, priceLabel, image: image || 'img-terminal.png', category: 'Add-on', specs: {}, qty: 1 });
  }
  saveCart(cart);
  animateCartIcon();
  showAddedToast(name, priceLabel);
}

function _injectModalStyles() {
  if (document.getElementById('added-modal-styles')) return;
  const s = document.createElement('style');
  s.id = 'added-modal-styles';
  s.textContent = `
    #added-modal-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(18,22,33,0.45);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      opacity: 0; transition: opacity 0.25s ease;
    }
    #added-modal-overlay.visible { opacity: 1; }

    #added-modal {
      background: #fff; border-radius: 20px;
      width: 100%; max-width: 600px; max-height: 88vh;
      overflow-y: auto; position: relative;
      box-shadow: 0 24px 80px rgba(18,22,33,0.18);
      transform: translateY(16px) scale(0.98);
      transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
      font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased;
    }
    #added-modal-overlay.visible #added-modal { transform: translateY(0) scale(1); }
    #added-modal::-webkit-scrollbar { width: 4px; }
    #added-modal::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }

    .am-close {
      position: absolute; top: 16px; right: 16px;
      width: 32px; height: 32px; border-radius: 50%;
      background: #f5f7f7; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #6b7676; transition: background 0.15s, color 0.15s;
    }
    .am-close:hover { background: #e6ebeb; color: #121621; }

    .am-top { padding: 40px 40px 36px; text-align: center; }
    .am-check {
      width: 48px; height: 48px; background: #e8f4f4; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
    }
    .am-heading {
      font-size: 22px; font-weight: 600; color: #121621;
      letter-spacing: -0.025em; line-height: 1.2; margin-bottom: 8px;
    }
    .am-sub { font-size: 14px; color: #6b7676; margin-bottom: 24px; }
    .am-actions { display: flex; gap: 10px; justify-content: center; }
    .am-view-cart {
      display: inline-flex; align-items: center; height: 40px; padding: 0 20px;
      border: 1.5px solid #277777; border-radius: 8px;
      font-size: 13px; font-weight: 500; color: #277777;
      text-decoration: none; transition: background 0.15s;
    }
    .am-view-cart:hover { background: #f0f7f7; }
    .am-continue {
      display: inline-flex; align-items: center; height: 40px; padding: 0 20px;
      background: #277777; border-radius: 8px;
      font-size: 13px; font-weight: 500; color: #fff;
      text-decoration: none; transition: background 0.15s; border: none; cursor: pointer; font-family: inherit;
    }
    .am-continue:hover { background: #1f5c5c; }

    .am-compatible { padding: 0 40px 32px; border-top: 1px solid #f0f0f0; padding-top: 28px; }
    .am-compatible-heading { font-size: 13px; color: #8a9696; text-align: center; margin-bottom: 20px; }

    .am-product {
      display: flex; gap: 20px; align-items: center;
      border: 1px solid #ededed; border-radius: 16px;
      padding: 20px; margin-bottom: 12px; background: #fafafa;
    }
    .am-product-img {
      width: 120px; height: 120px; flex-shrink: 0;
      background: #fff; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid #f0f0f0;
    }
    .am-product-img img { width: 90px; height: 90px; object-fit: contain; }
    .am-product-body { flex: 1; min-width: 0; }
    .am-product-name { font-size: 17px; font-weight: 600; color: #121621; letter-spacing: -0.02em; margin-bottom: 4px; }
    .am-product-desc { font-size: 13px; color: #6b7676; line-height: 1.6; margin-bottom: 12px; }
    .am-product-price { font-size: 15px; font-weight: 600; color: #121621; margin-bottom: 14px; }
    .am-product-actions { display: flex; gap: 8px; }
    .am-btn-add {
      height: 36px; padding: 0 16px; background: #277777; color: #fff;
      border: none; border-radius: 8px; font-size: 13px; font-weight: 500;
      cursor: pointer; font-family: inherit; transition: background 0.15s; white-space: nowrap;
    }
    .am-btn-add:hover { background: #1f5c5c; }
    .am-btn-info {
      height: 36px; padding: 0 16px;
      border: 1.5px solid #d4d8d8; border-radius: 8px;
      font-size: 13px; font-weight: 500; color: #525d5d;
      text-decoration: none; display: inline-flex; align-items: center;
      transition: border-color 0.15s, color 0.15s; white-space: nowrap; background: transparent;
    }
    .am-btn-info:hover { border-color: #277777; color: #277777; }

    .am-checkout-footer {
      padding: 20px 40px 32px; border-top: 1px solid #f0f0f0; text-align: center;
    }
    .am-checkout-btn {
      display: inline-flex; align-items: center; gap: 8px;
      height: 48px; padding: 0 32px; background: #277777; color: #fff;
      border: none; border-radius: 10px; font-size: 15px; font-weight: 500;
      cursor: pointer; font-family: inherit; transition: background 0.15s; text-decoration: none;
    }
    .am-checkout-btn:hover { background: #1f5c5c; }
    .am-skip {
      display: block; margin-top: 12px; font-size: 13px; color: #8a9696;
      cursor: pointer; background: none; border: none; font-family: inherit;
      transition: color 0.15s;
    }
    .am-skip:hover { color: #525d5d; }
  `;
  document.head.appendChild(s);
}

function showAddedModal(productId) {
  const product = PRODUCT_DATA[productId];
  if (!product) return;

  _injectModalStyles();

  const existing = document.getElementById('added-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'added-modal-overlay';
  overlay.innerHTML = `
    <div id="added-modal">
      <button class="am-close" onclick="hideAddedModal()" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <div class="am-top">
        <div class="am-check">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#277777" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 class="am-heading">${product.name} added to your basket</h2>
        <p class="am-sub">Ready to complete your order?</p>
        <div class="am-actions">
          <a href="basket.html" class="am-view-cart" onclick="hideAddedModal();">View basket</a>
          <button class="am-continue" onclick="hideAddedModal();">Continue shopping</button>
        </div>
      </div>
    </div>
  `;

  overlay.addEventListener('click', e => { if (e.target === overlay) hideAddedModal(); });
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('visible')));
}

function showCheckoutRecommendations(onCheckout) {
  _injectModalStyles();

  const existing = document.getElementById('added-modal-overlay');
  if (existing) existing.remove();

  const cart = getCart();
  const cartAddonIds = new Set(cart.filter(i => i.addonId).map(i => i.addonId));
  const hasLink2500  = cart.some(i => i.id === 'link-2500'     && !i.addonId);
  const hasSaturn    = cart.some(i => i.id === 'saturn-1000f2' && !i.addonId);

  let sectionHtml = '';

  if (hasLink2500) {
    // Show Link/2500 accessories not already in cart (top 3)
    const toShow = LINK2500_ACCESSORIES.filter(a => !cartAddonIds.has(a.id)).slice(0, 3);
    if (toShow.length) {
      sectionHtml = toShow.map(function(a) {
        const imgHtml = a.image
          ? '<img src="' + a.image + '" alt="' + a.name + '" style="width:90px;height:90px;object-fit:contain;" />'
          : '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8d0d0" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path stroke-linecap="round" d="M9 12h6M12 9v6"/></svg>';
        const safeId   = a.id;
        const safeName = a.name.replace(/'/g, "\\'");
        const imgArg   = a.image ? ("'" + a.image.replace(/'/g, "\\'") + "'") : 'null';
        return '<div class="am-product">'
          + '<div class="am-product-img">' + imgHtml + '</div>'
          + '<div class="am-product-body">'
          + '<div class="am-product-name">' + a.name + '</div>'
          + '<div class="am-product-desc" style="color:#8a9696;font-size:12px;margin-bottom:4px;">' + a.art + '</div>'
          + '<div class="am-product-desc">' + a.desc + '</div>'
          + '<div class="am-product-price">' + a.priceLabel + '</div>'
          + '<div class="am-product-actions">'
          + '<button class="am-btn-add" onclick="addAddonToCart(\'' + safeId + '\',\'' + safeName + '\',' + a.price + ',\'' + a.priceLabel + '\',' + imgArg + ');">Add to basket</button>'
          + '</div></div></div>';
      }).join('');
    }
  } else if (hasSaturn) {
    const toShow = SATURN1000F2_ACCESSORIES.filter(function(a) { return !cartAddonIds.has(a.id); }).slice(0, 3);
    if (toShow.length) {
      sectionHtml = toShow.map(function(a) {
        const imgHtml = a.image
          ? '<img src="' + a.image + '" alt="' + a.name + '" style="width:90px;height:90px;object-fit:contain;" />'
          : '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8d0d0" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path stroke-linecap="round" d="M9 12h6M12 9v6"/></svg>';
        const safeId   = a.id;
        const safeName = a.name.replace(/'/g, "\\'");
        const imgArg   = a.image ? ("'" + a.image.replace(/'/g, "\\'") + "'") : 'null';
        return '<div class="am-product">'
          + '<div class="am-product-img">' + imgHtml + '</div>'
          + '<div class="am-product-body">'
          + '<div class="am-product-name">' + a.name + '</div>'
          + '<div class="am-product-desc" style="color:#8a9696;font-size:12px;margin-bottom:4px;">' + a.art + '</div>'
          + '<div class="am-product-desc">' + a.desc + '</div>'
          + '<div class="am-product-price">' + a.priceLabel + '</div>'
          + '<div class="am-product-actions">'
          + '<button class="am-btn-add" onclick="addAddonToCart(\'' + safeId + '\',\'' + safeName + '\',' + a.price + ',\'' + a.priceLabel + '\',' + imgArg + ');">Add to basket</button>'
          + '</div></div></div>';
      }).join('');
    }
  } else {
    // Show compatible terminal products
    const firstTerminal = cart.find(i => !i.addonId);
    const refId = firstTerminal ? firstTerminal.id : null;
    const cartIds = new Set(cart.map(i => i.id));
    const compatIds = (refId ? (COMPATIBLE[refId] || []) : [])
      .filter(id => !cartIds.has(id))
      .slice(0, 2);
    sectionHtml = compatIds.map(id => {
      const p = PRODUCT_DATA[id];
      if (!p) return '';
      const img  = PRODUCT_RENDERS[id] || 'assets/placeholder-terminal.svg';
      const desc = PRODUCT_DESCRIPTIONS[id] || '';
      const addAction = p.price !== null
        ? `<button class="am-btn-add" onclick="addToCart('${id}');">Add to basket</button>`
        : `<a href="buy.html?id=${id}" class="am-btn-add" style="text-decoration:none;display:inline-flex;align-items:center;">Get a quote</a>`;
      return `
        <div class="am-product">
          <div class="am-product-img"><img src="${img}" alt="${p.name}" /></div>
          <div class="am-product-body">
            <div class="am-product-name">${p.name}</div>
            <div class="am-product-desc">${desc}</div>
            <div class="am-product-price">${p.priceLabel}</div>
            <div class="am-product-actions">
              ${addAction}
              <a href="product.html?id=${id}" class="am-btn-info">More info</a>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  const subHeading = hasLink2500
    ? 'Complete your Link/2500 setup with the right accessories.'
    : hasSaturn
    ? 'Complete your Saturn 1000F2 setup with the right accessories.'
    : 'Customers who bought this also added these to their order.';

  const overlay = document.createElement('div');
  overlay.id = 'added-modal-overlay';
  overlay.innerHTML = `
    <div id="added-modal">
      <button class="am-close" onclick="hideAddedModal()" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      ${sectionHtml ? `
      <div class="am-top" style="padding-bottom:28px;border-bottom:1px solid #f0f0f0;">
        <h2 class="am-heading" style="margin-bottom:6px;">Before you check out</h2>
        <p class="am-sub" style="margin-bottom:0;">${subHeading}</p>
      </div>
      <div class="am-compatible">
        ${sectionHtml}
      </div>
      <div class="am-checkout-footer">
        <button class="am-checkout-btn" onclick="hideAddedModal(); (${onCheckout.toString()})();">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path stroke-linecap="round" d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Proceed to secure checkout
        </button>
        <button class="am-skip" onclick="hideAddedModal(); (${onCheckout.toString()})();">Skip and continue</button>
      </div>` : `
      <div class="am-top">
        <h2 class="am-heading">You're all set!</h2>
        <p class="am-sub">Ready to complete your order.</p>
        <div class="am-actions">
          <button class="am-checkout-btn" onclick="hideAddedModal(); (${onCheckout.toString()})();">
            Proceed to secure checkout
          </button>
        </div>
      </div>`}
    </div>
  `;

  overlay.addEventListener('click', e => { if (e.target === overlay) hideAddedModal(); });
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('visible')));
}

function hideAddedModal() {
  const overlay = document.getElementById('added-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
  setTimeout(() => overlay.remove(), 250);
}

let _toastTimer = null;
function showAddedToast(name, price) {
  if (!document.getElementById('mc-toast-styles')) {
    const s = document.createElement('style');
    s.id = 'mc-toast-styles';
    s.textContent = `
      #mc-toast {
        position: fixed; top: 88px; right: 24px; z-index: 99999;
        background: #ffffff; border: 1px solid #e6ebeb;
        border-radius: 8px; padding: 14px 18px;
        box-shadow: 0 8px 24px rgba(18,22,33,0.10);
        font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased;
        display: flex; align-items: center; gap: 12px; min-width: 260px;
        opacity: 0; transform: translateY(-8px);
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      #mc-toast.visible { opacity: 1; transform: translateY(0); }
      #mc-toast-icon { width: 32px; height: 32px; background: #e8f4f4; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      #mc-toast-body { flex: 1; min-width: 0; }
      #mc-toast-label { font-size: 11px; font-weight: 500; color: #277777; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1px; }
      #mc-toast-name { font-size: 13px; font-weight: 500; color: #121621; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      #mc-toast-price { font-size: 13px; font-weight: 600; color: #121621; flex-shrink: 0; }
    `;
    document.head.appendChild(s);
  }

  let toast = document.getElementById('mc-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mc-toast';
    toast.innerHTML = `
      <div id="mc-toast-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#277777" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      </div>
      <div id="mc-toast-body">
        <div id="mc-toast-label">Added to basket</div>
        <div id="mc-toast-name"></div>
      </div>
      <div id="mc-toast-price"></div>
    `;
    document.body.appendChild(toast);
  }

  document.getElementById('mc-toast-name').textContent = name;
  document.getElementById('mc-toast-price').textContent = price;

  clearTimeout(_toastTimer);
  toast.classList.remove('visible');
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('visible')));
  _toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 220);
  }, 3000);
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
        background: #f5f7f7; border: none; border-radius: 8px; cursor: pointer; flex-shrink: 0;
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
        width: 72px; height: 72px; background: #f5f7f7; border-radius: 8px;
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
        margin: 14px 20px; background: #f5f7f7; border: 1px solid #e6ebeb; border-radius: 12px; padding: 16px;
      }
      .mc-ai-top { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
      .mc-ai-icon {
        width: 38px; height: 38px; background: #3d4d4d; border-radius: 8px;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .mc-ai-text { flex: 1; min-width: 0; }
      .mc-ai-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
      .mc-ai-title { font-size: 13px; font-weight: 600; color: #121621; }
      .mc-ai-badge { font-size: 10px; font-weight: 600; color: #ffffff; background: #277777; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.02em; flex-shrink: 0; }
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
        width: 100%; background: #277777; color: #ffffff;
        font-size: 14px; font-weight: 500; padding: 15px 20px;
        border-radius: 8px; text-decoration: none; border: none; cursor: pointer;
        font-family: inherit; transition: background 0.15s; box-sizing: border-box;
        box-shadow: inset 0px -2px 0px 0px rgba(0,0,0,0.16);
      }
      .mc-cta:hover { background: #1f5c5c; }
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
    const priceStr  = lineTotal != null ? fmt(lineTotal) : item.priceLabel;
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
    <div class="mc-pricing-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    <div class="mc-pricing-row"><span>VAT (20%)</span><span>${fmt(vat)}</span></div>
    <div class="mc-pricing-row"><span>Shipping</span><span>${fmt(shipping)}</span></div>
    <div class="mc-pricing-total"><span>Total</span><span>${fmt(total)}</span></div>
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

  // Auto-init buy page accessories
  if (document.getElementById('buy-accessories-wrapper')) {
    var _buyParams = new URLSearchParams(window.location.search);
    renderBuyPageAccessories(_buyParams.get('id'));
  }

  // Open drawer on cart icon click
  const cartIcon = document.querySelector('[aria-label="Shopping cart"]');
  if (cartIcon) {
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
