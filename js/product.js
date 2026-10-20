document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const productList = $("#product-list");
  const productCount = $("#product-count");
  const productEmpty = $("#product-empty");
  // Dùng đúng ô tìm kiếm đang có trong header chung (common.js).
  const searchForm = $("#search-form");
  const searchInput = searchForm ? searchForm.querySelector('input[name="q"]') : null;
  const sortSelect = $("#product-sort");
  const minInput = $("#price-min");
  const maxInput = $("#price-max");
  const priceError = $("#price-error");
  const queryLabel = $("#product-query-label");
  const inStockOnly = $("#in-stock-only");
  const filterButtons = [...document.querySelectorAll(".prod-filter-btn")];

  if (!productList || typeof PRODUCTS === "undefined" || !Array.isArray(PRODUCTS)) {
    console.error("GreenPhone: không tìm thấy PRODUCTS hoặc #product-list.");
    if (productCount) productCount.textContent = "Không tải được dữ liệu sản phẩm.";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialKeyword = params.get("q") || "";
  if (searchInput) searchInput.value = initialKeyword;
  const state = { brand: "all", keyword: initialKeyword.trim(), sort: "default", min: null, max: null, inStock: false };
  const collator = new Intl.Collator("vi", { sensitivity: "base", numeric: true });
  const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

  function normalize(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D").toLocaleLowerCase("vi").trim();
  }
  function variants(product) { return Array.isArray(product.variants) ? product.variants : []; }
  function minPrice(product) {
    const prices = variants(product).map(v => Number(v.price)).filter(n => Number.isFinite(n) && n >= 0);
    return prices.length ? Math.min(...prices) : Number(product.price) || 0;
  }
  function maxPrice(product) {
    const prices = variants(product).map(v => Number(v.price)).filter(n => Number.isFinite(n) && n >= 0);
    return prices.length ? Math.max(...prices) : Number(product.price) || 0;
  }
  function cheapestVariant(product) {
    return variants(product).slice().sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))[0] || null;
  }
  function searchableText(product) {
    const specText = Object.entries(product.specs || {}).flat().join(" ");
    const variantText = variants(product).map(v => [v.color, v.storage, v.variantId].join(" ")).join(" ");
    return normalize([product.name, product.brand, product.description, specText, variantText, product.id].join(" "));
  }
  function safeDetailUrl(product) {
    return "product-detail.html?id=" + encodeURIComponent(product.id || "");
  }
  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  // Dùng cùng cấu trúc thẻ và class với trang chủ để đồng bộ giao diện sáng/tối.
  function createCard(product) {
    const variant = cheapestVariant(product);
    const price = variant ? Number(variant.price) || 0 : Number(product.price) || 0;
    const original = variant ? Number(variant.originalPrice) || 0 : Number(product.originalPrice) || 0;
    const discount = original > price ? Math.round((1 - price / original) * 100) : 0;
    const detailUrl = safeDetailUrl(product);
    const card = make("article", "home-product");

    if (discount) card.appendChild(make("span", "badge home-product-badge", `-${discount}%`));
    const imageLink = make("a", "home-product-img");
    imageLink.href = detailUrl;
    imageLink.setAttribute("aria-label", `Xem ${product.name || "sản phẩm"}`);
    const img = make("img");
    img.src = product.image || (variant && variant.image) || "";
    img.alt = product.name || "Điện thoại";
    img.loading = "lazy";
    img.onerror = () => { img.onerror = null; img.removeAttribute("src"); img.alt = "Chưa có ảnh sản phẩm"; };
    imageLink.appendChild(img);
    card.appendChild(imageLink);

    const body = make("div", "home-product-body");
    body.appendChild(make("span", "home-product-brand", product.brand || "Điện thoại"));
    const title = make("h3");
    const titleLink = make("a", "", product.name || "Sản phẩm");
    titleLink.href = detailUrl;
    title.appendChild(titleLink);
    body.appendChild(title);
    const spec = product.specs || {};
    body.appendChild(make("div", "home-product-spec", `${variant?.storage || ""} | RAM ${spec.ram || "Đang cập nhật"}`));
    const prices = make("div", "home-product-price");
    prices.appendChild(make("span", "price", money.format(price)));
    if (discount) prices.appendChild(make("span", "home-product-old", money.format(original)));
    body.appendChild(prices);
    const rating = make("div", "home-product-rating", `★ ${(Number(product.rating) || 0).toFixed(1)} (${Number(product.sold) || 0} đã bán)`);
    body.appendChild(rating);
    const actions = make("div", "home-product-actions");
    const detail = make("a", "btn btn-outline", "Chi tiết ↗");
    detail.href = detailUrl;
    actions.appendChild(detail);
    const cart = make("button", "btn btn-primary");
    cart.type = "button";
    cart.textContent = "🛒";
    cart.setAttribute("aria-label", `Thêm ${product.name || "sản phẩm"} vào giỏ`);
    cart.disabled = !variant || Number(variant.stock) <= 0;
    cart.addEventListener("click", () => {
      if (typeof addToCart === "function" && variant) addToCart(variant.variantId, 1);
    });
    actions.appendChild(cart);
    body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  function getFilteredProducts() {
    let list = PRODUCTS.filter(p => p && typeof p === "object");
    if (state.brand !== "all") list = list.filter(p => normalize(p.brand) === normalize(state.brand));
    if (state.keyword) {
      const terms = normalize(state.keyword).split(/\s+/).filter(Boolean);
      list = list.filter(p => {
        const haystack = searchableText(p);
        return terms.every(term => haystack.includes(term));
      });
    }
    if (state.min !== null) list = list.filter(p => maxPrice(p) >= state.min);
    if (state.max !== null) list = list.filter(p => minPrice(p) <= state.max);
    if (state.inStock) list = list.filter(p => variants(p).some(v => Number(v.stock) > 0));

    switch (state.sort) {
      case "price-asc": list.sort((a, b) => minPrice(a) - minPrice(b)); break;
      case "price-desc": list.sort((a, b) => minPrice(b) - minPrice(a)); break;
      case "rating": list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)); break;
      case "sold": list.sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0)); break;
      case "name": list.sort((a, b) => collator.compare(a.name || "", b.name || "")); break;
    }
    return list;
  }

  function render() {
    const products = getFilteredProducts();
    productList.replaceChildren();
    const fragment = document.createDocumentFragment();
    products.forEach(product => fragment.appendChild(createCard(product)));
    productList.appendChild(fragment);

    if (productCount) productCount.textContent = `${products.length} sản phẩm`;
    if (productEmpty) productEmpty.hidden = products.length !== 0;
    if (queryLabel) {
      const labels = [];
      if (state.keyword) labels.push(`Từ khóa: “${state.keyword}”`);
      if (state.brand !== "all") labels.push(state.brand);
      if (state.min !== null || state.max !== null) labels.push(`${state.min === null ? "0" : money.format(state.min)} – ${state.max === null ? "không giới hạn" : money.format(state.max)}`);
      if (state.inStock) labels.push("Còn hàng");
      queryLabel.textContent = labels.join(" · ");
      queryLabel.hidden = labels.length === 0;
    }
  }

  function setBrand(brand) {
    state.brand = brand || "all";
    filterButtons.forEach(button => {
      const active = (button.dataset.brand || "all") === state.brand;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      const tick = button.querySelector("span");
      if (tick) tick.textContent = active ? "✓" : "";
    });
    render();
  }

  function applyPrice() {
    const minRaw = minInput ? minInput.value.trim() : "";
    const maxRaw = maxInput ? maxInput.value.trim() : "";
    const min = minRaw === "" ? null : Number(minRaw);
    const max = maxRaw === "" ? null : Number(maxRaw);
    if ((min !== null && (!Number.isFinite(min) || min < 0)) ||
        (max !== null && (!Number.isFinite(max) || max < 0))) {
      if (priceError) priceError.textContent = "Vui lòng nhập mức giá hợp lệ (không âm)."; return;
    }
    if (min !== null && max !== null && min > max) {
      if (priceError) priceError.textContent = "Giá từ không được lớn hơn giá đến."; return;
    }
    if (priceError) priceError.textContent = "";
    state.min = min; state.max = max; render();
  }

  function resetFilters() {
    state.brand = "all"; state.keyword = ""; state.sort = "default";
    state.min = null; state.max = null; state.inStock = false;
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "default";
    if (minInput) minInput.value = "";
    if (maxInput) maxInput.value = "";
    if (inStockOnly) inStockOnly.checked = false;
    if (priceError) priceError.textContent = "";
    setBrand("all");
  }

  filterButtons.forEach(button => button.addEventListener("click", () => setBrand(button.dataset.brand)));

  // Tìm kiếm dùng form search-form của header; hỗ trợ cả tìm ngay khi gõ và submit.
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.keyword = searchInput.value.trim();
      render();
    });
  }
  if (searchForm) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      state.keyword = searchInput ? searchInput.value.trim() : "";
      render();
      const url = new URL(window.location.href);
      if (state.keyword) url.searchParams.set("q", state.keyword);
      else url.searchParams.delete("q");
      window.history.replaceState({}, "", url);
    });
  }
  document.querySelectorAll("[data-keyword]").forEach(button => button.addEventListener("click", () => {
    if (searchInput) searchInput.value = button.dataset.keyword;
    state.keyword = button.dataset.keyword;
    render();
    if (searchInput) searchInput.focus();
  }));
  if (sortSelect) sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; render(); });
  const applyPriceButton = $("#apply-price");
  if (applyPriceButton) applyPriceButton.addEventListener("click", applyPrice);
  [minInput, maxInput].filter(Boolean).forEach(input => input.addEventListener("keydown", event => {
    if (event.key === "Enter") { event.preventDefault(); applyPrice(); }
  }));
  if (inStockOnly) inStockOnly.addEventListener("change", () => { state.inStock = inStockOnly.checked; render(); });
  $("#product-reset")?.addEventListener("click", resetFilters);
  $("#empty-reset")?.addEventListener("click", resetFilters);

  render();
});
