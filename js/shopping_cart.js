/* ==========================================================
   js/cart.js - MODULE GIỎ HÀNG NÂNG CAO (CHUẨN CELLPHONES)
   ========================================================== */

const CART_STORAGE_KEY = (typeof KEYS !== "undefined" && KEYS.cart) ? KEYS.cart : "shopping_cart";

// Danh mục phụ kiện mua kèm gợi ý kiểu CellphoneS
const ADDON_PRODUCTS = [
  { id: "tai-nghe-sony", name: "Tai nghe Sony WH-CH520", price: 990000, oldPrice: 1290000 },
  { id: "cu-sac-nhanh-30w", name: "Củ sạc Anker 30W Type-C", price: 350000, oldPrice: 450000 }
];

// Biến lưu gói bảo hành đang chọn cho item hiện hành
let currentWarrantyTargetVariantId = null;

function readCartState() {
  const data = localStorage.getItem(CART_STORAGE_KEY);
  if (!data) return [];
  try {
    const list = JSON.parse(data);
    return list.map(item => ({
      ...item,
      selected: item.selected !== undefined ? item.selected : true,
      warrantyName: item.warrantyName || "Mặc định (Chính hãng 12T)",
      warrantyPrice: item.warrantyPrice || 0
    }));
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString("vi-VN") + "đ";
}

// Render giỏ hàng
function renderCartPage() {
  const container = document.getElementById("cart-container");
  if (!container) return;

  const cart = readCartState();

  // A. Giỏ hàng trống
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="card cart-empty">
        <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Hãy chọn thêm sản phẩm điện thoại để mua sắm nhé.</p>
        <a class="btn btn-primary btn-lg" href="index.html">Xem thêm sản phẩm</a>
      </div>
    `;
    return;
  }

  // B. Tính tiền theo các sản phẩm được tích checkbox
  let totalRawPrice = 0;
  let totalAmount = 0;
  let selectedCount = 0;
  let allSelected = true;

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    if (item.selected) {
      const itemOriginalPrice = Number(item.originalPrice ?? item.price ?? 0);
      const itemPrice = Number(item.price ?? 0);
      const orig = itemOriginalPrice + (item.warrantyPrice || 0);
      const actualPrice = itemPrice + (item.warrantyPrice || 0);
      totalRawPrice += orig * item.quantity;
      totalAmount += actualPrice * item.quantity;
      selectedCount += item.quantity;
    } else {
      allSelected = false;
    }
  }

  if (cart.length === 0 || cart.every(i => !i.selected)) {
    allSelected = false;
  }

  const directDiscount = Math.max(0, totalRawPrice - totalAmount);
  const shippingFee = (totalAmount >= 300000 || totalAmount === 0) ? 0 : 30000;
  const couponCode = sessionStorage.getItem("cart_coupon") || "";
  const couponDiscount = couponCode === "GREEN100" && totalAmount >= 1000000 ? 100000 : 0;
  const finalTotal = totalAmount + shippingFee - couponDiscount;

  // C. Vẽ danh sách sản phẩm
  let itemsHtml = "";
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const itemPrice = Number(item.price ?? 0);
    const itemOriginalPrice = Number(item.originalPrice ?? item.price ?? 0);
    const itemTotalPrice = (itemPrice + (item.warrantyPrice || 0)) * item.quantity;
    const isChecked = item.selected ? "checked" : "";

    itemsHtml += `
      <div class="card cart-item" data-id="${item.variantId}">
        <input type="checkbox" class="cart-item-checkbox" ${isChecked} onchange="toggleItemSelect('${item.variantId}', this.checked)">
        
        <img src="${item.image || 'images/products/' + item.id + '.svg'}" alt="${item.name}" 
             class="cart-item-img" onclick="showProductDetails('${item.id}')" title="Bấm để xem chi tiết thông số">
        
        <div class="cart-item-info">
          <div class="cart-item-title-link" onclick="showProductDetails('${item.id}')">${item.name}</div>
          <div class="cart-item-variant">Phân loại: ${item.color || ''} ${item.storage ? ' - ' + item.storage : ''}</div>
          
          <button type="button" class="cart-item-quickview-btn" onclick="showProductDetails('${item.id}')">
            🔍 Xem thông số kỹ thuật
          </button>

          <div class="cart-item-price-wrap">
            <span class="cart-item-price">${formatMoney(itemPrice)}</span>
            ${itemOriginalPrice > itemPrice ? `<span class="cart-item-old-price">${formatMoney(itemOriginalPrice)}</span>` : ''}
          </div>
        </div>

        <div class="cart-qty-ctrl">
          <button type="button" class="cart-qty-btn" onclick="changeQuantity('${item.variantId}', -1)">-</button>
          <input type="text" class="cart-qty-input" value="${item.quantity}" readonly>
          <button type="button" class="cart-qty-btn" onclick="changeQuantity('${item.variantId}', 1)">+</button>
        </div>

        <div class="cart-item-actions">
          <span class="cart-item-subtotal">${formatMoney(itemTotalPrice)}</span>
          <button type="button" class="cart-btn-del" onclick="removeItem('${item.variantId}')">Xóa</button>
        </div>

        <!-- Các tiện ích phụ CellphoneS: Bảo hành mở rộng + Khuyến mại -->
        <div class="cart-item-extras">
          <div class="cart-extra-row">
            <div class="cart-extra-tag">
              <span>🛡️ Bảo hành mở rộng: <b>${item.warrantyName}</b></span>
            </div>
            <span class="cart-extra-link" onclick="openWarrantyModal('${item.variantId}')">Thay đổi gói</span>
          </div>
          <div class="cart-extra-row">
            <div class="cart-extra-tag">
              <span>🎁 Khuyến mại đi kèm: <i>Tặng củ sạc nhanh + Voucher 500k khi mua phụ kiện</i></span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // D. Danh sách Mua kèm tiết kiệm hơn (Phụ kiện)
  let addonsHtml = "";
  ADDON_PRODUCTS.forEach(ad => {
    addonsHtml += `
      <div class="cart-addon-card">
        <div class="cart-addon-info">
          <div class="cart-addon-name">${ad.name}</div>
          <div><b class="price">${formatMoney(ad.price)}</b> <span class="cart-item-old-price">${formatMoney(ad.oldPrice)}</span></div>
        </div>
        <button type="button" class="btn btn-outline btn-sm" onclick="addAddonToCart('${ad.id}', '${ad.name}', ${ad.price})">+ Chọn mua</button>
      </div>
    `;
  });

  // E. Render Layout tổng thể
  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-col-main">
        <div class="cart-toolbar">
          <label class="cart-checkbox-label">
            <input type="checkbox" id="check-all" ${allSelected ? "checked" : ""} onchange="toggleSelectAll(this.checked)">
            <span>Chọn tất cả (${cart.length} món)</span>
          </label>
          <button type="button" class="cart-btn-del-selected" onclick="deleteSelectedItems()">
            🗑️ Xóa đã chọn
          </button>
        </div>

        <div class="cart-items-wrap">
          ${itemsHtml}
        </div>

        <!-- Khối Mua Kèm Tiết Kiệm Hơn -->
        <div class="cart-addons-box">
          <div class="cart-addons-head">
            <div class="cart-addons-title">
              <span>🛍️ Mua kèm tiết kiệm hơn</span>
              <span class="badge badge-danger">Giảm đến 15%</span>
            </div>
          </div>
          <div class="cart-addons-grid">
            ${addonsHtml}
          </div>
        </div>
      </div>

      <!-- Cột Order Summary -->
      <div class="cart-col-side">
        <div class="card cart-summary">
          <h2 class="cart-summary-title">Thông tin đơn hàng</h2>
          
          <div class="cart-summary-line">
            <span class="text-soft">Số lượng đã chọn:</span>
            <b>${selectedCount} sản phẩm</b>
          </div>

          <div class="cart-summary-line">
            <span class="text-soft">Tổng tiền hàng:</span>
            <b>${formatMoney(totalRawPrice)}</b>
          </div>

          <div class="cart-summary-line">
            <span class="text-soft">Giảm giá trực tiếp:</span>
            <b class="price">-${formatMoney(directDiscount)}</b>
          </div>

          <div class="cart-summary-line">
            <span class="text-soft">Phí vận chuyển:</span>
            <span>${shippingFee === 0 ? '<span class="badge">Miễn phí</span>' : formatMoney(shippingFee)}</span>
          </div>

          <hr class="cart-hr">

          <section class="cart-coupon">
            <h3>Mã giảm giá</h3>
            <form class="cart-coupon-form" onsubmit="applyCartCoupon(event)">
              <input id="cart-coupon-code" class="input" aria-label="Mã giảm giá" placeholder="Nhập mã giảm giá" value="${couponCode === 'GREEN100' ? 'GREEN100' : ''}">
              <button type="submit" class="btn btn-primary">Áp dụng</button>
            </form>
            <p class="cart-coupon-hint">GREEN100: giảm 100.000đ cho đơn từ 1 triệu.</p>
            <p id="cart-coupon-message" role="status">${couponDiscount ? 'Đã áp dụng GREEN100.' : couponCode ? 'Đơn đã chọn chưa đủ 1 triệu để áp dụng mã.' : ''}</p>
            ${couponCode ? '<button type="button" class="cart-extra-link" onclick="removeCartCoupon()">Bỏ mã giảm giá</button>' : ''}
          </section>
          ${couponDiscount ? `<div class="cart-summary-line"><span>Giảm giá từ mã:</span><b class="price">-${formatMoney(couponDiscount)}</b></div>` : ''}
          <div class="cart-summary-line cart-total-line cart-final-total" aria-live="polite">
            <strong>${couponDiscount ? 'Tổng tiền sau giảm giá:' : 'Tổng thanh toán:'}</strong>
            <span class="cart-total-price">${formatMoney(finalTotal)}</span>
          </div>
          <div class="cart-vat-note">(Đã bao gồm VAT và được làm tròn)</div>

          <button type="button" class="btn btn-primary btn-lg btn-block cart-btn-buy-now" 
                  onclick="proceedToCheckout()" ${selectedCount === 0 ? "disabled" : ""}>
            <span>Mua ngay (${selectedCount})</span>
            <span class="cart-btn-subnote">Giao nhanh từ 2 giờ hoặc nhận tại shop</span>
          </button>

          <a href="index.html" class="btn btn-outline btn-block" style="margin-top: 8px;">
            Tiếp tục mua sắm
          </a>
        </div>
      </div>
    </div>
  `;
}

// ================= TÍNH NĂNG 1: XEM CHI TIẾT SẢN PHẨM (MODAL) =================
function showProductDetails(productId) {
  if (typeof PRODUCTS === "undefined" || !Array.isArray(PRODUCTS)) return;

  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const url = new URL("product-detail.html", window.location.href);
  url.searchParams.set("id", productId);
  window.location.href = url.toString();
}

function openProductDetailModal(productId) {
  if (typeof PRODUCTS === "undefined" || !Array.isArray(PRODUCTS)) return;

  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  document.getElementById("modal-detail-title").innerText = product.name;
  document.getElementById("modal-detail-brand").innerText = product.brand || "Chính hãng";

  const specs = product.specs || {};
  let specsHtml = `
    <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
      <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; border-radius: 8px; background: var(--green-100); object-fit: cover;">
      <div>
        <p style="margin: 0 0 6px;"><b>Mô tả:</b> ${product.description || 'Sản phẩm cao cấp phân phối chính hãng.'}</p>
        <p style="margin: 0; color: var(--warning);">⭐ Đánh giá: <b>${product.rating || 5} / 5</b> (${product.sold || 100} lượt đã bán)</p>
      </div>
    </div>
    <h4 style="margin: 12px 0 6px; color: var(--green-900);">Thông số kỹ thuật chi tiết</h4>
    <table class="cart-spec-table">
      <tr><td class="cart-spec-label">Màn hình:</td><td>${specs.screen || 'OLED Super Retina XDR'}</td></tr>
      <tr><td class="cart-spec-label">Chip xử lý (CPU):</td><td>${specs.chip || 'Apple A17 Pro / Snapdragon 8'}</td></tr>
      <tr><td class="cart-spec-label">Dung lượng RAM:</td><td>${specs.ram || '8GB'}</td></tr>
      <tr><td class="cart-spec-label">Camera sau:</td><td>${specs.camera || '48MP + 12MP'}</td></tr>
      <tr><td class="cart-spec-label">Dung lượng Pin:</td><td>${specs.battery || '4500 mAh, sạc nhanh'}</td></tr>
      <tr><td class="cart-spec-label">Hệ điều hành:</td><td>${specs.os || 'iOS / Android'}</td></tr>
    </table>
  `;

  document.getElementById("modal-detail-content").innerHTML = specsHtml;
  openModal("modal-product-detail");
}

// ================= TÍNH NĂNG 2: BẢO HÀNH MỞ RỘNG (MODAL) =================
function openWarrantyModal(variantId) {
  currentWarrantyTargetVariantId = variantId;
  openModal("modal-warranty");
}

function confirmWarranty() {
  const selectedRadio = document.querySelector('input[name="warrantyOption"]:checked');
  if (!selectedRadio || !currentWarrantyTargetVariantId) return;

  const wPrice = Number(selectedRadio.value);
  const wName = selectedRadio.dataset.name;

  const cart = readCartState();
  const target = cart.find(i => i.variantId === currentWarrantyTargetVariantId);
  if (target) {
    target.warrantyName = wName;
    target.warrantyPrice = wPrice;
    saveCart(cart);
    renderCartPage();
  }

  closeModal("modal-warranty");
}

// ================= TÍNH NĂNG 3: MUA KÈM PHỤ KIỆN =================
function addAddonToCart(addonId, addonName, price) {
  const cart = readCartState();
  const existing = cart.find(i => i.variantId === addonId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: addonId,
      variantId: addonId,
      name: addonName,
      color: "Chính hãng",
      storage: "",
      price: price,
      originalPrice: price + 150000,
      image: "images/products/xiaomi-14.svg",
      quantity: 1,
      selected: true,
      warrantyName: "12 tháng đổi mới",
      warrantyPrice: 0
    });
  }

  saveCart(cart);
  renderCartPage();
  if (typeof showToast === "function") {
    showToast("Đã thêm phụ kiện: " + addonName);
  }
}

// ================= CÁC HÀM CƠ BẢN CỦA GIỎ HÀNG =================
function toggleItemSelect(variantId, isSelected) {
  const cart = readCartState();
  const target = cart.find(i => i.variantId === variantId);
  if (target) {
    target.selected = isSelected;
    saveCart(cart);
    renderCartPage();
  }
}

function toggleSelectAll(selectAll) {
  const cart = readCartState();
  cart.forEach(item => item.selected = selectAll);
  saveCart(cart);
  renderCartPage();
}

function deleteSelectedItems() {
  let cart = readCartState();
  const selectedItems = cart.filter(i => i.selected);
  if (selectedItems.length === 0) {
    alert("Vui lòng tích chọn ít nhất 1 sản phẩm để xóa!");
    return;
  }
  if (confirm(`Bạn có chắc muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
    cart = cart.filter(i => !i.selected);
    saveCart(cart);
    renderCartPage();
  }
}

function changeQuantity(variantId, delta) {
  const cart = readCartState();
  const target = cart.find(i => i.variantId === variantId);
  if (!target) return;

  const newQty = target.quantity + delta;
  if (newQty <= 0) {
    if (confirm("Bạn có chắc chắn muốn bỏ sản phẩm này khỏi giỏ hàng?")) {
      removeItem(variantId);
    }
    return;
  }
  target.quantity = newQty;
  saveCart(cart);
  renderCartPage();
}

function removeItem(variantId) {
  let cart = readCartState();
  cart = cart.filter(i => i.variantId !== variantId);
  saveCart(cart);
  renderCartPage();
}

function applyCartCoupon(event) {
  event.preventDefault();
  const code = document.getElementById("cart-coupon-code").value.trim().toUpperCase();
  const total = readCartState().filter(item => item.selected).reduce((sum, item) =>
    sum + (Number(item.price || 0) + Number(item.warrantyPrice || 0)) * Number(item.quantity || 1), 0);
  if (code !== "GREEN100" || total < 1000000) {
    document.getElementById("cart-coupon-message").textContent = code === "GREEN100"
      ? "Mã áp dụng cho đơn từ 1.000.000đ." : "Mã giảm giá không hợp lệ.";
    return;
  }
  sessionStorage.setItem("cart_coupon", code);
  renderCartPage();
}

function removeCartCoupon() {
  sessionStorage.removeItem("cart_coupon");
  renderCartPage();
}

function proceedToCheckout() {
  const cart = readCartState();
  const selectedItems = cart.filter(i => i.selected);
  if (selectedItems.length === 0) {
    alert("Vui lòng chọn ít nhất 1 sản phẩm để tiến hành thanh toán!");
    return;
  }
  window.location.href = "checkout.html";
}

// Hàm hỗ trợ Modal chung
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add("show");
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", function () {
  renderCartPage();
});
