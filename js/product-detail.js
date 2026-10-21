/* GreenPhone - Product detail page */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const products = typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS) ? PRODUCTS : [];
  const product = products.find((item) => String(item.id) === String(productId));

  const empty = $("detail-empty");
  const detail = $("product-detail");
  const specSection = $("detail-spec-section");
  const descSection = $("detail-description-section");

  const showMissing = () => {
    if (empty) empty.hidden = false;
    if (detail) detail.hidden = true;
    if (specSection) specSection.hidden = true;
    if (descSection) descSection.hidden = true;
    document.title = "Không tìm thấy sản phẩm | GreenPhone";
  };

  if (!product) {
    console.error("[GreenPhone] Không tìm thấy sản phẩm với id:", productId);
    showMissing();
    return;
  }

  [empty].forEach((el) => { if (el) el.hidden = true; });
  [detail, specSection, descSection].forEach((el) => { if (el) el.hidden = false; });

  const setText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value == null ? "" : String(value);
  };
  const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
  const variants = Array.isArray(product.variants) ? product.variants : [];
  let selectedVariant = null;

  document.title = `${product.name} – Chi tiết sản phẩm | GreenPhone`;
  setText("detail-breadcrumb-name", product.name);
  setText("detail-brand", product.brand);
  setText("detail-name", product.name);
  setText("detail-rating", (Number(product.rating) || 0).toFixed(1));
  setText("detail-sold", `Đã bán ${(Number(product.sold) || 0).toLocaleString("vi-VN")}`);
  setText("detail-description-short", product.description || "Thông tin sản phẩm đang được cập nhật.");
  setText("detail-spec-brand", product.brand || "Đang cập nhật");
  setText("detail-spec-name", product.name);
  setText("detail-description-heading", `Giới thiệu ${product.name}`);
  // Nội dung cam kết thay đổi nhẹ theo thương hiệu/loại sản phẩm.
  const brandName = String(product.brand || "").trim();
  const warrantyText = /apple|iphone/i.test(brandName)
    ? "Bảo hành theo chính sách Apple và điều kiện bảo hành của sản phẩm."
    : /samsung/i.test(brandName)
      ? "Bảo hành chính hãng Samsung theo chính sách hiện hành."
      : brandName
        ? `Bảo hành theo chính sách chính hãng ${brandName}.`
        : "Bảo hành chính hãng theo chính sách của nhà sản xuất.";
  setText("detail-commitment-origin", `${product.name}: sản phẩm mới, đầy đủ phụ kiện theo cấu hình công bố.`);
  setText("detail-commitment-warranty", warrantyText);

  const image = $("detail-image");
  if (image) {
    image.src = product.image || (variants[0] && variants[0].image) || "";
    image.alt = product.name;
    image.loading = "eager";
    image.onerror = () => {
      image.onerror = null;
      image.src = "images/products/iphone-15.svg";
      image.alt = "Ảnh minh họa điện thoại";
    };
  }

  const variantSelect = $("detail-variant");
  if (variantSelect) {
    variantSelect.replaceChildren();
    if (variants.length) {
      variants.forEach((variant, index) => {
        const option = document.createElement("option");
        option.value = variant.variantId || String(index);
        option.textContent = `${variant.color || "Màu tiêu chuẩn"} · ${variant.storage || "Dung lượng tiêu chuẩn"}${Number(variant.stock) <= 0 ? " · Hết hàng" : ""}`;
        option.disabled = Number(variant.stock) <= 0;
        variantSelect.appendChild(option);
      });
      selectedVariant = variants.find((variant) => Number(variant.stock) > 0) || variants[0];
      variantSelect.value = selectedVariant.variantId || String(variants.indexOf(selectedVariant));
    } else {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Chưa có phiên bản";
      variantSelect.appendChild(option);
      variantSelect.disabled = true;
    }
  }


  // Bộ chọn phiên bản dạng thẻ trực quan (màu sắc + dung lượng), đồng bộ với select ẩn.
  let variantPicker = null;
  if (variantSelect && variants.length) {
    variantPicker = document.createElement("div");
    variantPicker.className = "detail-variant-picker";
    variantPicker.setAttribute("aria-label", "Chọn màu sắc và dung lượng");
    variantSelect.insertAdjacentElement("afterend", variantPicker);

    const renderVariantPicker = () => {
      variantPicker.innerHTML = "";
      const visibleVariants = variants.slice(0, 6);
      visibleVariants.forEach((variant, index) => {
        const key = String(variant.variantId || index);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "detail-variant-card" +
          ((selectedVariant && selectedVariant.variantId === variant.variantId) ? " active" : "");
        button.disabled = Number(variant.stock) <= 0;
        button.dataset.variantKey = key;
        const thumb = document.createElement("img");
        thumb.className = "detail-variant-thumb";
        thumb.src = variant.image || product.image || "images/products/iphone-15.svg";
        thumb.alt = "";
        const info = document.createElement("span");
        const color = document.createElement("span");
        color.className = "variant-color";
        color.textContent = variant.color || "Màu tiêu chuẩn";
        const storage = document.createElement("span");
        storage.className = "variant-storage";
        storage.textContent = `${variant.storage || "Dung lượng tiêu chuẩn"}${Number(variant.stock) <= 0 ? " · Hết hàng" : ""}`;
        info.append(color, storage);
        button.append(thumb, info);
        variantPicker.appendChild(button);
      });
      if (variants.length > 6) {
        const more = document.createElement("button");
        more.type = "button";
        more.className = "detail-variant-more";
        more.textContent = "Xem thêm phiên bản khác⌄";
        more.addEventListener("click", () => {
          variants.slice(6).forEach((variant, offset) => {
            const index = offset + 6;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "detail-variant-card" +
              ((selectedVariant && selectedVariant.variantId === variant.variantId) ? " active" : "");
            button.disabled = Number(variant.stock) <= 0;
            button.dataset.variantKey = String(variant.variantId || index);
            button.innerHTML = `<span><span class="variant-color"></span><span class="variant-storage"></span></span>`;
            button.querySelector(".variant-color").textContent = variant.color || "Màu tiêu chuẩn";
            button.querySelector(".variant-storage").textContent = variant.storage || "Dung lượng tiêu chuẩn";
            variantPicker.insertBefore(button, more);
          });
          more.remove();
        });
        variantPicker.appendChild(more);
      }
    };
    renderVariantPicker();
    variantPicker.addEventListener("click", (event) => {
      const button = event.target.closest("[data-variant-key]");
      if (!button || button.disabled) return;
      variantSelect.value = button.dataset.variantKey;
      selectedVariant = variants.find((variant, index) =>
        String(variant.variantId || index) === variantSelect.value) || null;
      updateVariant();
      renderVariantPicker();
    });
  }

  const qty = $("detail-quantity");
  const minus = $("quantity-minus");
  const plus = $("quantity-plus");
  const addButton = $("detail-add-cart");
  const buyButton = $("detail-buy-now");
  const message = $("detail-message");

  const specNames = {
    screen: "Màn hình", chip: "Chip xử lý", ram: "RAM", storage: "Bộ nhớ trong",
    camera: "Camera", battery: "Dung lượng pin", os: "Hệ điều hành",
    connectivity: "Kết nối", sim: "SIM", weight: "Trọng lượng",
    dimensions: "Kích thước", charging: "Công nghệ sạc", refreshRate: "Tần số quét",
    resolution: "Độ phân giải", warranty: "Bảo hành", waterResistance: "Kháng nước/bụi"
  };

  const specsContainer = $("product-specs");
  if (specsContainer) {
    specsContainer.replaceChildren();
    const specs = product.specs && typeof product.specs === "object" ? product.specs : {};
    Object.entries(specs).forEach(([key, value]) => {
      if (value == null || value === "") return;
      const row = document.createElement("div");
      row.className = "detail-spec-row";
      const label = document.createElement("span");
      label.className = "detail-spec-label";
      label.textContent = specNames[key] || key;
      const val = document.createElement("span");
      val.className = "detail-spec-value";
      val.textContent = Array.isArray(value) ? value.join(", ") : String(value);
      row.append(label, val);
      specsContainer.appendChild(row);
    });
    if (!specsContainer.children.length) {
      const row = document.createElement("div");
      row.className = "detail-spec-row";
      row.textContent = "Thông số kỹ thuật đang được cập nhật.";
      specsContainer.appendChild(row);
    }
  }

  const description = $("product-description");
  if (description) {
    description.textContent = product.descriptionLong || product.description ||
      "Thông tin mô tả chi tiết của sản phẩm đang được cập nhật.";
  }

  function updateVariant() {
    const price = $("detail-price");
    const original = $("detail-original-price");
    const discount = $("detail-discount");
    const stockLabel = $("detail-stock-text");
    if (!selectedVariant) {
      if (price) price.textContent = "Liên hệ";
      if (original) original.textContent = "";
      if (stockLabel) stockLabel.textContent = "Chưa có thông tin tồn kho";
      if (addButton) addButton.disabled = true;
      if (buyButton) buyButton.disabled = true;
      return;
    }

    const currentPrice = Number(selectedVariant.price) || 0;
    const originalPrice = Number(selectedVariant.originalPrice) || 0;
    const stock = Math.max(0, Number(selectedVariant.stock) || 0);
    if (price) price.textContent = money(currentPrice);
    if (original) {
      original.textContent = originalPrice > currentPrice ? money(originalPrice) : "";
      original.hidden = !(originalPrice > currentPrice);
    }
    if (discount) {
      const percent = originalPrice > currentPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;
      discount.hidden = percent <= 0;
      discount.textContent = percent > 0 ? `-${percent}%` : "";
    }
    if (stockLabel) {
      stockLabel.textContent = stock > 0 ? `Còn hàng · ${stock} sản phẩm` : "Tạm hết hàng";
      stockLabel.classList.toggle("out-of-stock", stock <= 0);
    }
    if (qty) {
      qty.min = "1";
      qty.max = String(Math.max(stock, 1));
      qty.value = "1";
      qty.disabled = stock <= 0;
    }
    if (minus) minus.disabled = stock <= 0;
    if (plus) plus.disabled = stock <= 0;
    if (addButton) addButton.disabled = stock <= 0;
    if (buyButton) buyButton.disabled = stock <= 0;
    // Đổi ảnh chính theo màu/phiên bản đang chọn.
    if (image) {
      const variantImage = selectedVariant && selectedVariant.image;
      const nextImage = variantImage || product.image || "";
      if (nextImage && image.getAttribute("src") !== nextImage) image.src = nextImage;
      image.alt = `${product.name}${selectedVariant && selectedVariant.color ? " - " + selectedVariant.color : ""}`;
    }
    if (message) message.textContent = "";
  }

  variantSelect?.addEventListener("change", () => {
    selectedVariant = variants.find((variant, index) =>
      String(variant.variantId || index) === variantSelect.value) || null;
    updateVariant();
    if (variantPicker) {
      variantPicker.querySelectorAll("[data-variant-key]").forEach((button) => {
        button.classList.toggle("active", button.dataset.variantKey === variantSelect.value);
      });
    }
  });
  updateVariant();

  function getQuantity() {
    const stock = Number(selectedVariant && selectedVariant.stock) || 0;
    const requested = Math.floor(Number(qty && qty.value) || 1);
    return Math.max(1, Math.min(requested, Math.max(stock, 1)));
  }
  qty?.addEventListener("change", () => { qty.value = String(getQuantity()); });
  minus?.addEventListener("click", () => { if (qty) qty.value = String(Math.max(1, getQuantity() - 1)); });
  plus?.addEventListener("click", () => {
    if (qty) qty.value = String(Math.min(Number(selectedVariant && selectedVariant.stock) || 1, getQuantity() + 1));
  });

  function purchase(goToCheckout) {
    if (!selectedVariant || Number(selectedVariant.stock) <= 0) {
      if (message) message.textContent = "Phiên bản này hiện đã hết hàng.";
      return;
    }
    const quantity = getQuantity();
    if (typeof addToCart !== "function" || typeof getCart !== "function" ||
        typeof save !== "function" || typeof KEYS === "undefined") {
      if (message) message.textContent = "Chức năng giỏ hàng chưa được kết nối.";
      return;
    }

    if (!goToCheckout) {
      const success = addToCart(selectedVariant.variantId, quantity);
      if (success && message) message.textContent = `Đã thêm ${quantity} sản phẩm vào giỏ hàng.`;
      return;
    }

    // Mua ngay: chỉ thanh toán đúng phiên bản và số lượng vừa chọn.
    // Giữ các sản phẩm khác trong giỏ, nhưng bỏ chọn để không thanh toán nhầm.
    const cart = getCart();
    const target = cart.find(item => item.variantId === selectedVariant.variantId);
    if (target) {
      target.quantity = quantity;
      target.selected = true;
    } else {
      cart.push({ variantId: selectedVariant.variantId, quantity, selected: true });
    }
    cart.forEach(item => {
      if (item.variantId !== selectedVariant.variantId) item.selected = false;
    });
    save(KEYS.cart, cart);
    if (typeof updateCartBadge === "function") updateCartBadge();
    window.location.href = "checkout.html";
  }
  addButton?.addEventListener("click", () => purchase(false));
  buyButton?.addEventListener("click", () => purchase(true));
});
