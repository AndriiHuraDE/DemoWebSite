(() => {
  'use strict';

  const DATA = window.SELYS_DATA;
  if (!DATA) return;

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const lang = () => window.SELYS_LANG || 'de';
  const t = key => window.SELYS_T ? window.SELYS_T(key) : (DATA.translations[lang()][key] || key);
  const euro = value => new Intl.NumberFormat(lang() === 'de' ? 'de-DE' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
  const imageHTML = (image, cls = '') => `<img class="${cls}" src="${esc(image.src)}" alt="${esc(image.alt)}" loading="lazy" decoding="async">`;

  let activeGalleryFilter = 'all';
  let galleryExpanded = false;
  let activeShopFilter = 'all';
  let activeShopPage = 1;
  const SHOP_PAGE_SIZE = 6;
  let activeProductId = null;
  let activeArticleId = null;
  let newsletterSubmitted = false;
  let cart = normalizeCart(readJSON('selys-demo-cart', {}));
  let orders = readJSON('selys-demo-orders', []);

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value === 'object' ? value : fallback;
    } catch (_) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { showNotice(t('common.storageError')); return false; }
  }
  function showNotice(message) {
    const toast = $('toast');
    if (!toast) { window.alert(message); return; }
    const title = $('toastTitle');
    const text = $('toastText');
    if (title) title.textContent = lang() === 'de' ? 'SÉLYS Demo' : 'SÉLYS Demo';
    if (text) text.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.__selysToastTimer);
    window.__selysToastTimer = window.setTimeout(() => toast.classList.remove('show'), 3600);
  }
  function productName(product) { return lang() === 'en' ? product.nameEn : product.name; }
  function productDescription(product) { return lang() === 'en' ? product.descriptionEn : product.description; }
  function productCategoryLabel(category) { return t(`shop.category.${category}`) || category; }
  function productVariants(product) {
    return Array.isArray(product?.variants) && product.variants.length
      ? product.variants
      : [{ id: 'default', label: product.size || '', labelEn: product.sizeEn || product.size || '', price: Number(product.price) || 0 }];
  }
  function getVariant(product, variantId = '') {
    const variants = productVariants(product);
    return variants.find(item => item.id === variantId) || variants[0];
  }
  function cartKey(productId, variantId) { return `${productId}::${variantId}`; }
  function normalizeCart(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const normalized = {};
    Object.entries(value).forEach(([key, rawQty]) => {
      const [productId, suppliedVariantId] = key.includes('::') ? key.split('::', 2) : [key, ''];
      const product = DATA.products.find(item => item.id === productId);
      const qty = Math.max(0, Math.min(20, Math.floor(Number(rawQty) || 0)));
      if (!product || !qty) return;
      const variant = getVariant(product, suppliedVariantId);
      const nextKey = cartKey(product.id, variant.id);
      normalized[nextKey] = Math.min(20, (normalized[nextKey] || 0) + qty);
    });
    return normalized;
  }
  function isPhysicalProduct(product) { return product.category !== 'voucher'; }
  function getPhysicalSubtotal() { return getCartLines().filter(line => isPhysicalProduct(line.product)).reduce((sum, line) => sum + line.lineTotal, 0); }
  function getDigitalCount() { return getCartLines().filter(line => !isPhysicalProduct(line.product)).reduce((sum, line) => sum + line.qty, 0); }
  function getFulfilmentLabel() {
    const lines = getCartLines();
    const hasPhysical = lines.some(line => isPhysicalProduct(line.product));
    const hasDigital = lines.some(line => !isPhysicalProduct(line.product));
    if (hasDigital && !hasPhysical) return lang() === 'en' ? 'Digital email delivery (demo)' : 'Digitale E-Mail-Zustellung (Demo)';
    const physicalLabel = getFulfilment() === 'shipping'
      ? (lang() === 'en' ? 'Delivery' : 'Lieferung')
      : (lang() === 'en' ? 'Salon collection' : 'Abholung im Salon');
    if (hasDigital) {
      const deliveryPrice = getFulfilment() === 'shipping'
        ? (getShipping() ? euro(getShipping()) : (lang() === 'en' ? 'free delivery' : 'kostenlose Lieferung'))
        : (lang() === 'en' ? 'free collection' : 'kostenlose Abholung');
      return lang() === 'en'
        ? `${physicalLabel} (${deliveryPrice}) + digital voucher by email`
        : `${physicalLabel} (${deliveryPrice}) + digitaler Gutschein per E-Mail`;
    }
    return getFulfilment() === 'shipping'
      ? (getShipping() ? euro(getShipping()) : (lang() === 'en' ? 'Free delivery' : 'Kostenlose Lieferung'))
      : (lang() === 'en' ? 'Free collection' : 'Kostenlose Abholung');
  }

  function renderGallery() {
    const host = $('galleryGrid');
    if (!host) return;
    const photos = DATA.gallery.filter(item => activeGalleryFilter === 'all' || item.category === activeGalleryFilter);
    const visiblePhotos = galleryExpanded ? photos : photos.slice(0, 3);
    host.innerHTML = visiblePhotos.map((item, index) => `<figure class="gallery-item" style="--gallery-delay:${index * 45}ms">${imageHTML(item, 'gallery-photo')}<figcaption>${esc(lang() === 'en' ? item.labelEn : item.label)}</figcaption></figure>`).join('');
    const moreButton = $('galleryMoreButton');
    if (moreButton) {
      moreButton.hidden = photos.length <= 3;
      moreButton.textContent = t(galleryExpanded ? 'gallery.showLess' : 'gallery.showMore');
      moreButton.setAttribute('aria-expanded', String(galleryExpanded));
    }
    document.querySelectorAll('[data-gallery-filter]').forEach(button => {
      const active = button.dataset.galleryFilter === activeGalleryFilter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function productBadgeLabel(product) {
    return product.badge ? t(`shop.badge.${product.badge}`) : productCategoryLabel(product.category);
  }
  function lowestProductPrice(product) {
    return Math.min(...productVariants(product).map(item => Number(item.price) || 0));
  }
  function productPriceLabel(product) {
    const variants = productVariants(product);
    const lowest = lowestProductPrice(product);
    return variants.length > 1 ? `${lang() === 'en' ? 'From ' : 'ab '}${euro(lowest)}` : euro(lowest);
  }
  function renderFeaturedProducts() {
    const host = $('featuredProducts');
    if (!host) return;
    const featured = DATA.products.filter(product => product.featured).slice(0, 4);
    host.innerHTML = featured.map(product => `
      <article class="featured-product-card">
        <a class="featured-product-image" href="shop.html?product=${encodeURIComponent(product.id)}&amp;details=1" aria-label="${esc(t('shop.details'))}: ${esc(productName(product))}">
          ${imageHTML(product.image, '')}<span class="featured-product-tag">${esc(productBadgeLabel(product))}</span>
        </a>
        <div class="featured-product-info">
          <div class="featured-product-copy"><h3>${esc(productName(product))}</h3><p>${esc(productDescription(product))}</p></div>
          <div class="featured-product-bottom">
            <strong>${productPriceLabel(product)}</strong>
            <div class="featured-product-actions">
              <a href="shop.html?product=${encodeURIComponent(product.id)}&amp;buy=1" class="featured-product-buy">${esc(t('shop.buy'))}</a>
              <a href="shop.html?product=${encodeURIComponent(product.id)}&amp;details=1" class="featured-product-details">${esc(t('shop.details'))}</a>
            </div>
          </div>
        </div>
      </article>`).join('');
  }

  function renderInstagram() {
    const host = $('instagramPreview');
    if (!host) return;
    host.innerHTML = DATA.instagram.map((item, index) => `<a class="instagram-tile" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="${esc(lang() === 'en' ? `Instagram demo image ${index + 1}` : `Instagram Demo-Bild ${index + 1}`)}">${imageHTML(item, '')}<span class="instagram-tile-overlay" aria-hidden="true"><span>◎</span></span></a>`).join('');
  }

  function renderReviews() {
    const host = $('reviewsGrid');
    if (!host) return;
    host.innerHTML = DATA.reviews.map(review => `<article class="google-review-card"><div class="google-review-card-top"><span class="google-review-avatar" aria-hidden="true">${esc(review.name.slice(0, 1))}</span><div class="google-review-author"><strong>${esc(review.name)}</strong><span>${esc(lang() === 'en' ? review.serviceEn : review.service)}</span></div><span class="google-review-g" aria-label="Google">G</span></div><div class="google-review-stars" aria-label="5 out of 5 stars">★★★★★</div><p class="review-copy">${esc(lang() === 'en' ? review.textEn : review.text)}</p><span class="review-demo-label">${lang() === 'en' ? 'Sample review · Demo' : 'Beispielbewertung · Demo'}</span></article>`).join('');
  }

  function renderBlog() {
    const host = $('blogGrid');
    if (!host) return;
    host.innerHTML = DATA.blog.map(article => `<article class="blog-card"><a href="#journal" class="blog-image-link" data-open-article="${esc(article.id)}">${imageHTML(article.image, 'blog-image')}</a><div class="blog-card-body"><div class="blog-meta"><span>${esc(lang() === 'en' ? (article.categoryEn || article.category) : article.category)}</span><span>${esc(article.date)}</span></div><h3>${esc(lang() === 'en' ? article.titleEn : article.title)}</h3><p>${esc(lang() === 'en' ? article.excerptEn : article.excerpt)}</p><button type="button" class="text-link" data-open-article="${esc(article.id)}">${esc(t('blog.read'))} <span aria-hidden="true">↗</span></button></div></article>`).join('');
  }

  function renderFAQ() {
    const host = $('faqList');
    if (!host) return;
    host.innerHTML = DATA.faqs.map((item, index) => `<details class="faq-item"><summary><span>${esc(lang() === 'en' ? item.qEn : item.q)}</span><span class="faq-plus" aria-hidden="true">+</span></summary><div class="faq-answer">${esc(lang() === 'en' ? item.aEn : item.a)}</div></details>`).join('');
  }

  function filteredProducts() {
    const search = ($('shopSearch')?.value || '').trim().toLocaleLowerCase(lang() === 'de' ? 'de-DE' : 'en-US');
    let results = DATA.products.filter(product => {
      const matchesCategory = activeShopFilter === 'all' || product.category === activeShopFilter;
      const haystack = `${product.name} ${product.nameEn} ${product.description} ${product.descriptionEn}`.toLocaleLowerCase();
      return matchesCategory && (!search || haystack.includes(search));
    });
    const sort = $('shopSort')?.value || 'featured';
    if (sort === 'price-asc') results = [...results].sort((a, b) => lowestProductPrice(a) - lowestProductPrice(b));
    else if (sort === 'price-desc') results = [...results].sort((a, b) => lowestProductPrice(b) - lowestProductPrice(a));
    else results = [...results].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || productName(a).localeCompare(productName(b)));
    return results;
  }

  function renderShopPagination(totalItems, totalPages, startItem, endItem) {
    const host = $('shopPagination');
    if (!host) return;
    if (!totalItems) { host.innerHTML = ''; return; }
    const summary = lang() === 'en'
      ? `Showing ${startItem}–${endItem} of ${totalItems} products`
      : `Produkte ${startItem}–${endItem} von ${totalItems}`;
    const pageLabel = lang() === 'en' ? 'Page' : 'Seite';
    const ofLabel = lang() === 'en' ? 'of' : 'von';
    host.innerHTML = `
      <p class="shop-pagination-summary">${esc(summary)}</p>
      <nav class="shop-pagination-controls" aria-label="${lang() === 'en' ? 'Product pages' : 'Produktseiten'}">
        <button type="button" class="shop-page-button" data-shop-page="${activeShopPage - 1}" ${activeShopPage <= 1 ? 'disabled' : ''}>← ${esc(t('shop.pagination.previous'))}</button>
        <span class="shop-page-indicator">${pageLabel} <strong>${activeShopPage}</strong> ${ofLabel} ${totalPages}</span>
        <button type="button" class="shop-page-button" data-shop-page="${activeShopPage + 1}" ${activeShopPage >= totalPages ? 'disabled' : ''}>${esc(t('shop.pagination.next'))} →</button>
      </nav>`;
  }

  function renderShop() {
    const host = $('shopGrid');
    if (!host) return;
    const products = filteredProducts();
    const totalPages = Math.max(1, Math.ceil(products.length / SHOP_PAGE_SIZE));
    activeShopPage = Math.max(1, Math.min(activeShopPage, totalPages));
    const startIndex = (activeShopPage - 1) * SHOP_PAGE_SIZE;
    const pageProducts = products.slice(startIndex, startIndex + SHOP_PAGE_SIZE);
    host.innerHTML = pageProducts.length ? pageProducts.map(product => {
      const variants = productVariants(product);
      const sizeLabel = variants.length > 1
        ? (lang() === 'en' ? 'Multiple sizes / values' : 'Mehrere Größen / Werte')
        : (lang() === 'en' ? (variants[0].labelEn || variants[0].label) : variants[0].label);
      return `<article class="shop-product-card">
        <button type="button" class="shop-product-image" data-product-details="${esc(product.id)}" aria-label="${esc(t('shop.details'))}: ${esc(productName(product))}">
          ${imageHTML(product.image, '')}<span class="shop-image-tag">${esc(productBadgeLabel(product))}</span>
        </button>
        <div class="shop-product-info">
          <div class="shop-product-title-row"><h3>${esc(productName(product))}</h3><strong>${productPriceLabel(product)}</strong></div>
          <p>${esc(productDescription(product))}</p>
          <div class="shop-product-foot"><span>${esc(sizeLabel)}</span>
            <div class="shop-product-actions">
              <button type="button" class="shop-add-button" data-add-to-cart="${esc(product.id)}">${esc(t('shop.add'))}</button>
              <button type="button" class="shop-details-button" data-product-details="${esc(product.id)}">${esc(t('shop.details'))}</button>
            </div>
          </div>
        </div>
      </article>`;
    }).join('') : `<p class="text-sm text-muted col-span-full">${lang() === 'en' ? 'No products match your search.' : 'Keine Produkte gefunden.'}</p>`;
    renderShopPagination(products.length, totalPages, products.length ? startIndex + 1 : 0, Math.min(startIndex + SHOP_PAGE_SIZE, products.length));
    document.querySelectorAll('[data-shop-filter]').forEach(button => {
      const active = button.dataset.shopFilter === activeShopFilter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function getCartLines() {
    return Object.entries(cart).map(([key, qty]) => {
      const [id, variantId] = key.split('::', 2);
      const product = DATA.products.find(item => item.id === id);
      if (!product || !Number.isInteger(qty) || qty < 1) return null;
      const variant = getVariant(product, variantId);
      return { key, product, variant, qty, unitPrice: Number(variant.price), lineTotal: Number(variant.price) * qty };
    }).filter(Boolean);
  }
  function getSubtotal() { return getCartLines().reduce((sum, line) => sum + line.lineTotal, 0); }
  function getFulfilment() {
    const lines = getCartLines();
    if (lines.length && lines.every(line => !isPhysicalProduct(line.product))) return 'digital';
    return document.querySelector('input[name="fulfilment"]:checked')?.value || 'pickup';
  }
  function getShipping() {
    if (getFulfilment() !== 'shipping' || getPhysicalSubtotal() <= 0) return 0;
    return getPhysicalSubtotal() < 60 ? 4.90 : 0;
  }


  function syncFulfilmentOptions() {
    const lines = getCartLines();
    const physicalCount = lines.filter(line => isPhysicalProduct(line.product)).length;
    const digitalCount = lines.filter(line => !isPhysicalProduct(line.product)).length;
    const shippingRadio = document.querySelector('input[name="fulfilment"][value="shipping"]');
    const pickupRadio = document.querySelector('input[name="fulfilment"][value="pickup"]');
    const pickupLabel = pickupRadio?.closest('label');
    const shippingLabel = shippingRadio?.closest('label');
    const digitalOnly = lines.length > 0 && physicalCount === 0;
    const paymentPickup = document.querySelector('input[name="payment"][value="pickup"]');
    const paymentDemo = document.querySelector('input[name="payment"][value="demo"]');
    const paymentPickupLabel = paymentPickup?.closest('label');
    const phoneField = $('checkoutPhone');

    if (shippingRadio) {
      shippingRadio.disabled = digitalOnly;
      if (digitalOnly && shippingRadio.checked && pickupRadio) pickupRadio.checked = true;
    }
    if (pickupRadio) pickupRadio.disabled = digitalOnly;

    const pickupText = pickupLabel?.querySelector('span');
    const shippingText = shippingLabel?.querySelector('span');
    if (pickupText) pickupText.textContent = digitalOnly
      ? (lang() === 'en' ? 'Digital voucher · email delivery (demo)' : 'Digitaler Gutschein · Zustellung per E-Mail (Demo)')
      : t('checkout.pickup');
    if (shippingText) shippingText.textContent = t('checkout.delivery');

    const shippingNote = $('shippingNote');
    if (shippingNote) {
      if (digitalOnly) shippingNote.textContent = lang() === 'en'
        ? 'Digital vouchers are delivered by email in this demo.'
        : 'Digitale Gutscheine werden in dieser Demo per E-Mail zugestellt.';
      else if (digitalCount > 0) shippingNote.textContent = lang() === 'en'
        ? 'Physical items follow the selected delivery option; digital vouchers are email-only in this demo.'
        : 'Physische Produkte folgen der gewählten Zustellung; digitale Gutscheine werden in dieser Demo per E-Mail zugestellt.';
      else shippingNote.textContent = t('shop.shippingNote');
    }

    const physicalShipping = !digitalOnly && getFulfilment() === 'shipping';
    if (paymentPickupLabel) paymentPickupLabel.classList.toggle('hidden', digitalOnly || physicalShipping);
    if (paymentPickup) paymentPickup.disabled = digitalOnly || physicalShipping;
    if ((digitalOnly || physicalShipping) && paymentDemo) paymentDemo.checked = true;
    if (!digitalOnly && !physicalShipping && paymentPickup && !paymentDemo?.checked) paymentPickup.checked = true;

    const address = $('shippingAddressFields');
    address?.classList.toggle('hidden', !physicalShipping);
    ['checkoutStreet','checkoutPostal','checkoutCity'].forEach(id => {
      const field = $(id);
      if (field) field.required = physicalShipping;
    });
    if (phoneField) phoneField.required = !digitalOnly;
  }

  function renderCart() {
    const lines = getCartLines();
    const itemsHost = $('cartItems');
    if (!itemsHost) return;
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const subtotal = getSubtotal();
    syncFulfilmentOptions();
    const shipping = getShipping();
    $('cartCount').textContent = String(count);
    $('cartSubtotal').textContent = euro(subtotal);
    const fulfilmentLabel = count ? getFulfilmentLabel() : '—';
    $('cartShipping').textContent = fulfilmentLabel;
    $('cartTotal').textContent = euro(subtotal + shipping);
    $('checkoutOpen').disabled = !count;
    itemsHost.innerHTML = lines.length ? lines.map(({ key, product, variant, qty, unitPrice, lineTotal }) => `<div class="cart-line"><div class="cart-line-thumb">${imageHTML(product.image, '')}</div><div class="cart-line-main"><strong>${esc(productName(product))}</strong><span>${euro(unitPrice)} × ${qty} · ${esc(lang() === 'en' ? (variant.labelEn || variant.label) : variant.label)}</span><div class="cart-line-actions"><button type="button" data-cart-qty="-1" data-cart-id="${esc(key)}" aria-label="${esc(t('cart.decrease'))}">−</button><span>${qty}</span><button type="button" data-cart-qty="1" data-cart-id="${esc(key)}" aria-label="${esc(t('cart.increase'))}">+</button><button type="button" data-cart-remove="${esc(key)}" class="cart-remove">${esc(t('common.remove'))}</button></div></div><strong class="cart-line-total">${euro(lineTotal)}</strong></div>`).join('') : `<p class="text-sm text-muted">${esc(t('shop.empty'))}</p>`;
    writeJSON('selys-demo-cart', cart);
    document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = String(count));
    if ($('checkoutSummary')) renderCheckoutSummary();
  }

  function addToCart(id, qty = 1, variantId = '') {
    const product = DATA.products.find(item => item.id === id);
    if (!product) return;
    const variant = getVariant(product, variantId);
    const key = cartKey(product.id, variant.id);
    const previous = { ...cart };
    cart[key] = Math.min(20, (Number(cart[key]) || 0) + Math.max(1, Math.floor(Number(qty) || 1)));
    if (!writeJSON('selys-demo-cart', cart)) { cart = previous; return; }
    renderCart();
    showNotice(lang() === 'en' ? 'Added to your demo cart.' : 'Zum Demo-Warenkorb hinzugefügt.');
  }

  function updateProductVariant() {
    const product = DATA.products.find(item => item.id === activeProductId);
    if (!product) return;
    const variant = getVariant(product, $('productVariant')?.value || '');
    const label = $('productVariantLabel');
    const price = $('productVariantPrice');
    if (label) label.textContent = lang() === 'en' ? (variant.labelEn || variant.label) : variant.label;
    if (price) price.textContent = euro(variant.price);
  }

  function renderProductDialog(id, selectedVariantId = '', quantity = 1) {
    const product = DATA.products.find(item => item.id === id);
    if (!product) return;
    activeProductId = id;
    const variants = productVariants(product);
    const selectedVariant = getVariant(product, selectedVariantId);
    const variantOptions = variants.length > 1
      ? `<label class="product-variant-field"><span>${esc(t('shop.variant'))}</span><select id="productVariant">${variants.map(variant => `<option value="${esc(variant.id)}" ${variant.id === selectedVariant.id ? 'selected' : ''}>${esc(lang() === 'en' ? (variant.labelEn || variant.label) : variant.label)}</option>`).join('')}</select></label>`
      : '';
    const sizeLabel = lang() === 'en' ? (selectedVariant.labelEn || selectedVariant.label) : selectedVariant.label;
    $('productDialogContent').innerHTML = `<div class="product-detail-layout"><div class="product-detail-image">${imageHTML(product.image, '')}</div><div class="product-detail-copy"><span class="text-xs uppercase tracking-widest text-gold">${esc(productCategoryLabel(product.category))}</span><h2 class="font-serif text-3xl mt-2 mb-3">${esc(productName(product))}</h2><p class="text-muted leading-7">${esc(productDescription(product))}</p>${variantOptions}<div class="product-detail-size" id="productVariantLabel">${esc(sizeLabel)}</div><div class="product-detail-price" id="productVariantPrice">${euro(selectedVariant.price)}</div><div class="product-detail-buy"><label>${esc(t('common.quantity'))}<input id="productQuantity" type="number" value="${Math.max(1, Math.min(20, Number(quantity) || 1))}" min="1" max="20"></label><button type="button" class="min-h-[50px] px-6 bg-charcoal text-white" id="productDialogAdd">${esc(t('shop.add'))}</button></div><p class="text-xs text-muted mt-4">${lang() === 'en' ? 'Demo product · no real sale or payment.' : 'Demo-Produkt · kein echter Verkauf und keine Zahlung.'}</p></div></div>`;
  }

  function openProduct(id) {
    if (!DATA.products.some(item => item.id === id)) return;
    renderProductDialog(id);
    if (!$('productDialog').open) $('productDialog').showModal();
  }

  function renderArticleDialog(id) {
    const article = DATA.blog.find(item => item.id === id);
    if (!article) return;
    activeArticleId = id;
    $('articleDialogContent').innerHTML = `<article class="article-detail">${imageHTML(article.image, 'article-detail-image')}<div class="blog-meta"><span>${esc(lang() === 'en' ? (article.categoryEn || article.category) : article.category)}</span><span>${esc(article.date)}</span></div><h2 class="font-serif text-3xl sm:text-4xl mt-3 mb-5">${esc(lang() === 'en' ? article.titleEn : article.title)}</h2><p class="text-muted leading-8">${esc(lang() === 'en' ? article.bodyEn : article.body)}</p></article>`;
  }

  function renderNewsletterMessage() {
    if (!$('newsletterMessage') || !newsletterSubmitted) return;
    $('newsletterMessage').textContent = lang() === 'en'
      ? 'Thank you! This demo does not send or store your email.'
      : 'Vielen Dank! Diese Demo versendet und speichert Ihre E-Mail-Adresse nicht.';
  }

  function renderCheckoutSummary() {
    const target = $('checkoutSummary');
    if (!target) return;
    const lines = getCartLines();
    const subtotal = getSubtotal();
    const shipping = getShipping();
    const fulfilmentLabel = getFulfilmentLabel();
    target.innerHTML = `<div><span>${esc(t('shop.subtotal'))}</span><strong>${euro(subtotal)}</strong></div><div><span>${esc(t('shop.shipping'))}</span><strong>${esc(fulfilmentLabel)}</strong></div><div class="checkout-grand-total"><span>${esc(t('shop.total'))}</span><strong>${euro(subtotal + shipping)}</strong></div>`;
  }

  function validateCheckout() {
    const required = ['checkoutName', 'checkoutEmail'];
    if (getFulfilment() !== 'digital') required.push('checkoutPhone');
    if (getFulfilment() === 'shipping') required.push('checkoutStreet', 'checkoutPostal', 'checkoutCity');
    for (const id of required) {
      const input = $(id);
      if (!input || !input.value.trim() || !input.checkValidity()) {
        input?.focus();
        input?.reportValidity();
        return false;
      }
    }
    if (!$('checkoutConsent').checked) {
      $('checkoutConsent').focus();
      showNotice(lang() === 'en' ? 'Please confirm the demo information.' : 'Bitte bestätigen Sie die Demo-Informationen.');
      return false;
    }
    return getCartLines().length > 0;
  }

  function completeCheckout(event) {
    event.preventDefault();
    if (!validateCheckout()) return;
    const lines = getCartLines();
    const subtotal = getSubtotal();
    const shipping = getShipping();
    const ref = `DEMO-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const order = {
      reference: ref,
      createdAt: new Date().toISOString(),
      items: lines.map(({ product, variant, qty, unitPrice }) => ({ id: product.id, name: productName(product), variant: lang() === 'en' ? (variant.labelEn || variant.label) : variant.label, unitPrice: Number(unitPrice.toFixed(2)), qty })),
      digitalItems: lines.filter(line => !isPhysicalProduct(line.product)).map(line => ({ id: line.product.id, variant: lang() === 'en' ? (line.variant.labelEn || line.variant.label) : line.variant.label, qty: line.qty })),
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number((subtotal + shipping).toFixed(2)),
      fulfilment: getFulfilment(),
      payment: document.querySelector('input[name="payment"]:checked')?.value || 'pickup',
      status: 'demo'
    };
    const previousOrders = orders;
    const previousCart = cart;
    orders = [...orders, order].slice(-20);
    if (!writeJSON('selys-demo-orders', orders)) { orders = previousOrders; return; }
    cart = {};
    if (!writeJSON('selys-demo-cart', cart)) {
      orders = previousOrders;
      cart = previousCart;
      writeJSON('selys-demo-orders', orders);
      return;
    }
    $('orderReference').textContent = ref;
    $('checkoutFormPanel').classList.add('hidden');
    $('orderSuccess').classList.remove('hidden');
    $('checkoutForm').reset();
    $('shippingAddressFields').classList.add('hidden');
    renderCart();
  }

  function renderAll() {
    renderGallery();
    renderFeaturedProducts();
    renderInstagram();
    renderReviews();
    renderBlog();
    renderFAQ();
    renderShop();
    renderCart();
    renderNewsletterMessage();
    if (activeProductId && $('productDialog')?.open) {
      renderProductDialog(activeProductId, $('productVariant')?.value || '', $('productQuantity')?.value || 1);
    }
    if (activeArticleId && $('articleDialog')?.open) renderArticleDialog(activeArticleId);
  }

  document.addEventListener('click', event => {
    const galleryButton = event.target.closest('[data-gallery-filter]');
    if (galleryButton) { activeGalleryFilter = galleryButton.dataset.galleryFilter; galleryExpanded = false; renderGallery(); return; }
    if (event.target.closest('#galleryMoreButton')) { galleryExpanded = !galleryExpanded; renderGallery(); return; }
    const shopFilter = event.target.closest('[data-shop-filter]');
    if (shopFilter) { activeShopFilter = shopFilter.dataset.shopFilter; activeShopPage = 1; renderShop(); return; }
    const pageButton = event.target.closest('[data-shop-page]');
    if (pageButton && !pageButton.disabled) { activeShopPage = Math.max(1, Number(pageButton.dataset.shopPage) || 1); renderShop(); $('shopGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const addButton = event.target.closest('[data-add-to-cart]');
    if (addButton) { addToCart(addButton.dataset.addToCart); return; }
    const detailsButton = event.target.closest('[data-product-details]');
    if (detailsButton) { openProduct(detailsButton.dataset.productDetails); return; }
    const qtyButton = event.target.closest('[data-cart-qty]');
    if (qtyButton) {
      const key = qtyButton.dataset.cartId;
      const next = (Number(cart[key]) || 0) + Number(qtyButton.dataset.cartQty);
      const previous = { ...cart };
      if (next <= 0) delete cart[key]; else cart[key] = Math.min(20, next);
      if (!writeJSON('selys-demo-cart', cart)) cart = previous;
      renderCart(); return;
    }
    const removeButton = event.target.closest('[data-cart-remove]');
    if (removeButton) {
      const previous = { ...cart };
      delete cart[removeButton.dataset.cartRemove];
      if (!writeJSON('selys-demo-cart', cart)) cart = previous;
      renderCart(); return;
    }
    const articleButton = event.target.closest('[data-open-article]');
    if (articleButton) {
      event.preventDefault();
      renderArticleDialog(articleButton.dataset.openArticle);
      if (!$('articleDialog').open) $('articleDialog').showModal();
      return;
    }
    const bookServiceButton = event.target.closest('[data-book-service]');
    if (bookServiceButton) {
      const serviceId = bookServiceButton.dataset.bookService;
      const service = DATA.services.find(item => item.id === serviceId);
      const bookingOption = document.querySelector(`[data-service-id="${serviceId}"]`);
      if (service && bookingOption) {
        bookingOption.click();
        $('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    if (event.target.closest('[data-close-dialog]')) {
      const dialog = event.target.closest('dialog');
      if (dialog) dialog.close();
    }
  });

  $('shopSearch')?.addEventListener('input', () => { activeShopPage = 1; renderShop(); });
  $('shopSort')?.addEventListener('change', () => { activeShopPage = 1; renderShop(); });
  $('checkoutOpen')?.addEventListener('click', () => {
    if (!getCartLines().length) return;
    $('checkoutFormPanel').classList.remove('hidden');
    $('orderSuccess').classList.add('hidden');
    $('checkoutDialog').showModal();
    renderCheckoutSummary();
  });
  $('checkoutForm')?.addEventListener('submit', completeCheckout);
  document.querySelectorAll('input[name="fulfilment"]').forEach(input => input.addEventListener('change', () => {
    if (input.checked && input.value === 'shipping') {
      const demoPayment = document.querySelector('input[name="payment"][value="demo"]');
      if (demoPayment) demoPayment.checked = true;
    } else if (input.checked && input.value === 'pickup') {
      const pickupPayment = document.querySelector('input[name="payment"][value="pickup"]');
      if (pickupPayment && !pickupPayment.disabled) pickupPayment.checked = true;
    }
    syncFulfilmentOptions();
    renderCart();
  }));
  $('productDialog')?.addEventListener('click', event => { if (event.target === $('productDialog')) $('productDialog').close(); });
  $('checkoutDialog')?.addEventListener('click', event => { if (event.target === $('checkoutDialog')) $('checkoutDialog').close(); });
  $('productDialog')?.addEventListener('change', event => {
    if (event.target.id === 'productVariant') updateProductVariant();
  });
  $('productDialog')?.addEventListener('click', event => {
    if (event.target.id === 'productDialogAdd') {
      const quantity = Math.max(1, Math.min(20, Number($('productQuantity')?.value) || 1));
      const variantId = $('productVariant')?.value || '';
      if (activeProductId) addToCart(activeProductId, quantity, variantId);
      $('productDialog').close();
    }
  });
  $('orderContinue')?.addEventListener('click', () => { $('checkoutDialog').close(); $('shop')?.scrollIntoView({ behavior: 'smooth' }); });
  $('newsletterForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const email = $('newsletterEmail');
    if (!email.checkValidity()) { email.reportValidity(); return; }
    newsletterSubmitted = true;
    renderNewsletterMessage();
    email.value = '';
  });
  $('resetDemoData')?.addEventListener('click', () => {
    if (!window.confirm(lang() === 'en' ? 'Reset all local demo bookings, orders and cart data?' : 'Alle lokalen Demo-Termine, Bestellungen und Warenkorbdaten zurücksetzen?')) return;
    ['selys-demo-bookings', 'selys-demo-orders', 'selys-demo-cart'].forEach(key => localStorage.removeItem(key));
    cart = {}; orders = [];
    renderCart();
    window.dispatchEvent(new CustomEvent('selys:demo-reset'));
    showNotice(lang() === 'en' ? 'Demo data has been reset.' : 'Demo-Daten wurden zurückgesetzt.');
  });

  window.SELYS_RENDER_ALL = renderAll;
  window.SELYS_SHOP = { addToCart, getCartLines, getOrders: () => [...orders] };
  renderAll();
  const pageParams = new URLSearchParams(window.location.search);
  const requestedProductId = pageParams.get('product');
  if (requestedProductId && DATA.products.some(product => product.id === requestedProductId)) {
    // Both homepage actions lead into the shop with the selected product opened.
    // The visitor can choose a size/value before adding variants to the cart.
    openProduct(requestedProductId);
    pageParams.delete('buy');
    pageParams.delete('details');
    pageParams.delete('product');
    const cleanUrl = `${window.location.pathname}${pageParams.toString() ? `?${pageParams}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', cleanUrl);
  }
})();
