document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const productList = $("#product-list");
  const productCount = $("#product-count");
  const productEmpty = $("#product-empty");
  const searchInput = $("#global-search");
  const searchForm = $("#product-search-form");
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

  const state = { brand: "all", keyword: "", sort: "default", min: null, max: null, inStock: false };
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
    return "Product_detail.html?id=" + encodeURIComponent(product.id || "");
  }
  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function createCard(product) {
    const variant = cheapestVariant(product);
    const price = variant ? Number(variant.price) || 0 : Number(product.price) || 0;
    const original = variant ? Number(variant.originalPrice) || 0 : Number(product.originalPrice) || 0;
    const discounted = original > price;
    const discount = discounted ? Math.round((1 - price / original) * 100) : 0;
    const image = (variant && variant.image) || product.image || "";
    const detailUrl = safeDetailUrl(product);
    const card = make("article", "prod-card");

    const imageLink = make("a", "prod-card-image");
    imageLink.href = detailUrl;
    imageLink.setAttribute("aria-label", "Xem " + (product.name || "sản phẩm"));
    const img = make("img");
    img.src = image;
    img.alt = product.name || "Điện thoại";
    img.loading = "lazy";
    img.onerror = () => { img.onerror = null; img.src = "images/products/iphone-15.svg"; img.alt = "Ảnh sản phẩm minh họa"; };
    imageLink.appendChild(img);

    if (discounted) imageLink.appendChild(make("span", "prod-badge", `-${discount}%`));
    if (variants(product).length && variants(product).every(v => Number(v.stock) <= 0)) {
      imageLink.appendChild(make("span", "prod-out-badge", "Tạm hết hàng"));
    }

    const body = make("div", "prod-card-content");
    const brand = make("p", "prod-card-brand", product.brand || "Điện thoại");
    const name = make("h3", "prod-card-name");
    const nameLink = make("a", "", product.name || "Sản phẩm chưa đặt tên");
    nameLink.href = detailUrl;
    name.appendChild(nameLink);

    const priceBox = make("div", "prod-card-price");
    priceBox.appendChild(make("strong", "prod-price-current", money.format(price)));
    if (discounted) {
      priceBox.appendChild(make("del", "prod-price-old", money.format(original)));
    }

    const meta = make("div", "prod-card-meta");
    meta.appendChild(make("span", "prod-rating", `★ ${(Number(product.rating) || 0).toFixed(1)}`));
    meta.appendChild(make("span", "prod-sold", `Đã bán ${Number(product.sold) || 0}`));

    const specLine = make("p", "prod-card-spec");
    const specs = product.specs || {};
    specLine.textContent = [specs.chip, specs.ram, specs.screen].filter(Boolean).join(" · ") || product.description || "Thông tin đang cập nhật";

    const footer = make("div", "prod-card-footer");
    const stock = variants(product).reduce((sum, v) => sum + Math.max(0, Number(v.stock) || 0), 0);
    footer.appendChild(make("span", stock > 0 ? "prod-stock" : "prod-stock is-out", stock > 0 ? "● Còn hàng" : "● Hết hàng"));
    const link = make("a", "prod-card-button", "Xem chi tiết");
    link.href = detailUrl;
    link.setAttribute("aria-label", `Xem chi tiết ${product.name}`);
    link.appendChild(make("span", "", " ↗"));
    footer.appendChild(link);

    body.append(brand, name, priceBox, meta, specLine, footer);
    card.append(imageLink, body);
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
    const minRaw = minInput.value.trim();
    const maxRaw = maxInput.value.trim();
    const min = minRaw === "" ? null : Number(minRaw);
    const max = maxRaw === "" ? null : Number(maxRaw);
    if ((min !== null && (!Number.isFinite(min) || min < 0)) ||
        (max !== null && (!Number.isFinite(max) || max < 0))) {
      priceError.textContent = "Vui lòng nhập mức giá hợp lệ (không âm)."; return;
    }
    if (min !== null && max !== null && min > max) {
      priceError.textContent = "Giá từ không được lớn hơn giá đến."; return;
    }
    priceError.textContent = "";
    state.min = min; state.max = max; render();
  }

  function resetFilters() {
    state.brand = "all"; state.keyword = ""; state.sort = "default";
    state.min = null; state.max = null; state.inStock = false;
    searchInput.value = ""; sortSelect.value = "default";
    minInput.value = ""; maxInput.value = ""; inStockOnly.checked = false;
    priceError.textContent = "";
    setBrand("all");
  }

  filterButtons.forEach(button => button.addEventListener("click", () => setBrand(button.dataset.brand)));
  searchInput.addEventListener("input", () => { state.keyword = searchInput.value.trim(); render(); });
  searchForm.addEventListener("submit", event => {
    event.preventDefault(); state.keyword = searchInput.value.trim(); render();
  });
  document.querySelectorAll("[data-keyword]").forEach(button => button.addEventListener("click", () => {
    searchInput.value = button.dataset.keyword;
    state.keyword = button.dataset.keyword;
    render();
    searchInput.focus();
  }));
  sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; render(); });
  $("#apply-price").addEventListener("click", applyPrice);
  [minInput, maxInput].forEach(input => input.addEventListener("keydown", event => {
    if (event.key === "Enter") { event.preventDefault(); applyPrice(); }
  }));
  inStockOnly.addEventListener("change", () => { state.inStock = inStockOnly.checked; render(); });
  $("#product-reset").addEventListener("click", resetFilters);
  $("#empty-reset").addEventListener("click", resetFilters);

  render();
});
