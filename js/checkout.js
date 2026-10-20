/* Resolve the shared { variantId, quantity } contract without changing storage keys. */
function resolveCartItems(items = getCart()) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => item && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0)
    .map(item => {
      const found = findVariant(item.variantId);
      if (!found) return item.name && Number.isFinite(Number(item.price)) ? { ...item, quantity: Number(item.quantity), selected: item.selected !== false } : null;
      const { product, variant } = found;
      return { ...item, id: product.id, name: product.name, color: variant.color,
        storage: variant.storage, price: variant.price, originalPrice: variant.originalPrice,
        image: variant.image || product.image, quantity: Number(item.quantity),
        selected: item.selected !== false, warrantyPrice: Number(item.warrantyPrice) || 0 };
    }).filter(Boolean);
}

/* ==========================================================
   js/checkout.js - XỬ LÝ THANH TOÁN, QR CODE & ĐƠN HÀNG
   ========================================================== */

const CART_STORAGE_KEY = (typeof KEYS !== "undefined" && KEYS.cart) ? KEYS.cart : "shopping_cart";
const ORDER_STORAGE_KEY = (typeof KEYS !== "undefined" && KEYS.orders) ? KEYS.orders : "orders";

const BANK_CONFIG = {
  bankId: "MB",
  bankName: "MB Bank (Quân Đội)",
  accountNo: "0339597863",
  accountName: "GREEN PHONE"
};

// Danh sách 34 tỉnh, thành phố; phường/xã do khách hàng tự nhập.
const CHECKOUT_PROVINCES = [
  "Tỉnh An Giang",
  "Tỉnh Bắc Ninh",
  "Tỉnh Cà Mau",
  "Tỉnh Cao Bằng",
  "Thành phố Cần Thơ",
  "Thành phố Đà Nẵng",
  "Tỉnh Đắk Lắk",
  "Tỉnh Điện Biên",
  "Tỉnh Đồng Nai",
  "Tỉnh Đồng Tháp",
  "Tỉnh Gia Lai",
  "Thành phố Hà Nội",
  "Tỉnh Hà Tĩnh",
  "Thành phố Hải Phòng",
  "Thành phố Hồ Chí Minh",
  "Thành phố Huế",
  "Tỉnh Hưng Yên",
  "Tỉnh Khánh Hòa",
  "Tỉnh Lai Châu",
  "Tỉnh Lạng Sơn",
  "Tỉnh Lào Cai",
  "Tỉnh Lâm Đồng",
  "Tỉnh Nghệ An",
  "Tỉnh Ninh Bình",
  "Tỉnh Phú Thọ",
  "Tỉnh Quảng Ngãi",
  "Tỉnh Quảng Ninh",
  "Tỉnh Quảng Trị",
  "Tỉnh Sơn La",
  "Tỉnh Tây Ninh",
  "Tỉnh Thái Nguyên",
  "Tỉnh Thanh Hóa",
  "Tỉnh Tuyên Quang",
  "Tỉnh Vĩnh Long"
];

function formatCheckoutMoney(amount) {
  return Number(amount || 0).toLocaleString("vi-VN") + "đ";
}

function getSelectedCartItems() {
  return resolveCartItems().filter(item => item.selected !== false);
}

function populateProvinceOptions() {
  const provinceSelect = document.getElementById("province");
  if (!provinceSelect) return;
  const provinces = CHECKOUT_PROVINCES;
  provinceSelect.innerHTML = '<option value="">-- Chọn tỉnh / thành phố --</option>' +
    provinces.map(name => `<option value="${name}">${name}</option>`).join("");
}

function initAddressForm() {
  populateProvinceOptions();
}

function initCheckoutPage() {
  const cart = getSelectedCartItems();
  if (cart.length === 0) {
    alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
    window.location.href = "shopping-cart.html";
    return;
  }

  initAddressForm();

  const listContainer = document.getElementById("checkout-items-list");
  let totalAmount = 0;
  let itemsHtml = "";

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const itemPrice = Number(item.price || 0) + Number(item.warrantyPrice || 0);
    const subtotal = itemPrice * Number(item.quantity || 1);
    totalAmount += subtotal;

    itemsHtml += `
      <div class="cart-checkout-mini-item">
        <div>
          <div class="cart-checkout-mini-name">${item.name}</div>
          <span class="text-soft">${item.color || ''} x ${item.quantity}</span>
        </div>
        <div><b>${formatCheckoutMoney(subtotal)}</b></div>
      </div>
    `;
  }

  if (listContainer) listContainer.innerHTML = itemsHtml;

  const shippingFee = totalAmount >= 300000 || totalAmount === 0 ? 0 : 30000;
  let finalTotal = totalAmount + shippingFee;
  let couponCode = "";
  let couponDiscount = 0;

  const subtotalEl = document.getElementById("checkout-subtotal");
  const totalEl = document.getElementById("checkout-total");
  const shippingEl = document.getElementById("checkout-shipping");

  if (subtotalEl) subtotalEl.innerText = formatCheckoutMoney(totalAmount);
  if (totalEl) totalEl.innerText = formatCheckoutMoney(finalTotal);
  if (shippingEl) shippingEl.innerText = shippingFee === 0 ? "Miễn phí" : formatCheckoutMoney(shippingFee);

  const tempOrderCode = "GP" + Math.floor(100000 + Math.random() * 900000);

  const qrBox = document.getElementById("cart-qr-box");
  const qrImg = document.getElementById("cart-qr-img");
  const qrAmountText = document.getElementById("qr-amount-text");
  const qrMemoText = document.getElementById("qr-memo-text");

  const bankNameEl = document.getElementById("qr-bank-name");
  const bankNoEl = document.getElementById("qr-account-no");
  const bankOwnerEl = document.getElementById("qr-account-name");
  if (bankNameEl) bankNameEl.innerText = BANK_CONFIG.bankName;
  if (bankNoEl) bankNoEl.innerText = BANK_CONFIG.accountNo;
  if (bankOwnerEl) bankOwnerEl.innerText = BANK_CONFIG.accountName;
  if (qrAmountText) qrAmountText.innerText = formatCheckoutMoney(finalTotal);
  if (qrMemoText) qrMemoText.innerText = tempOrderCode;

  const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact.png?amount=${finalTotal}&addInfo=${tempOrderCode}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
  if (qrImg) qrImg.src = qrUrl;

  function updateCouponTotals() {
    finalTotal = totalAmount + shippingFee - couponDiscount;
    if (totalEl) totalEl.innerText = formatCheckoutMoney(finalTotal);
    if (qrAmountText) qrAmountText.innerText = formatCheckoutMoney(finalTotal);
    if (qrImg) qrImg.src = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact.png?amount=${finalTotal}&addInfo=${tempOrderCode}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
    document.getElementById("coupon-discount-row").hidden = !couponDiscount;
    document.getElementById("coupon-discount").innerText = "-" + formatCheckoutMoney(couponDiscount);
    document.getElementById("coupon-remove").hidden = !couponDiscount;
  }

  document.getElementById("coupon-form")?.addEventListener("submit", event => {
    event.preventDefault();
    const input = document.getElementById("coupon-code");
    const message = document.getElementById("coupon-message");
    const code = input.value.trim().toUpperCase();
    const coupon = getCouponConfig(code);
    const discount = getCouponDiscount(code, totalAmount);
    if (!coupon || !discount) {
      message.textContent = coupon
        ? `Mã ${code} áp dụng cho đơn từ ${formatCheckoutMoney(coupon.minimum)}.`
        : "Mã giảm giá không hợp lệ. Vui lòng kiểm tra lại.";
      input.setAttribute("aria-invalid", "true");
      return;
    }
    couponCode = code;
    couponDiscount = discount;
    sessionStorage.setItem("cart_coupon", code);
    input.value = code;
    input.removeAttribute("aria-invalid");
    message.textContent = `Đã áp dụng mã ${code}, giảm ${formatCheckoutMoney(discount)}.`;
    updateCouponTotals();
  });

  document.getElementById("coupon-remove")?.addEventListener("click", () => {
    couponCode = "";
    couponDiscount = 0;
    sessionStorage.removeItem("cart_coupon");
    document.getElementById("coupon-code").value = "";
    document.getElementById("coupon-code").removeAttribute("aria-invalid");
    document.getElementById("coupon-message").textContent = "Đã bỏ mã giảm giá.";
    updateCouponTotals();
  });

  const savedCoupon = sessionStorage.getItem("cart_coupon");
  if (savedCoupon) {
    document.getElementById("coupon-code").value = savedCoupon;
    document.getElementById("coupon-form").dispatchEvent(new Event("submit", { cancelable: true }));
  }

  const payRadios = document.querySelectorAll('input[name="paymentMethod"]');
  payRadios.forEach(radio => {
    radio.addEventListener("change", function () {
      if (this.value === "QR") {
        if (qrBox) qrBox.style.display = "block";
      } else if (qrBox) {
        qrBox.style.display = "none";
      }
    });
  });

  const btnSubmit = document.getElementById("btn-submit-order");
  if (btnSubmit) {
    btnSubmit.addEventListener("click", function () {
      submitOrder(tempOrderCode, finalTotal, couponCode, couponDiscount);
    });
  }
}

function submitOrder(orderCode, totalAmount, couponCode = "", couponDiscount = 0) {
  const fullNameInput = document.getElementById("fullName");
  const phoneInput = document.getElementById("phoneNumber");
  const provinceInput = document.getElementById("province");
  const wardInput = document.getElementById("ward");
  const addressInput = document.getElementById("address");
  const noteInput = document.getElementById("orderNote");
  const confirmInput = document.getElementById("confirm-order");

  const fullName = fullNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const province = provinceInput ? provinceInput.value.trim() : "";
  const ward = wardInput ? wardInput.value.trim() : "";
  const address = addressInput ? addressInput.value.trim() : "";
  const note = noteInput ? noteInput.value.trim() : "";
  const confirmOrder = !!(confirmInput && confirmInput.checked);

  ["fullName", "phoneNumber", "province", "ward", "address", "confirm-order"].forEach(key => {
    const el = document.getElementById("err-" + key);
    if (el) el.innerText = "";
  });
  [fullNameInput, phoneInput, provinceInput, wardInput, addressInput].forEach(el => {
    if (el) el.classList.remove("is-error");
  });
  const confirmErr = document.getElementById("err-confirm-order");
  if (confirmErr) confirmErr.innerText = "";

  let isValid = true;

  if (!fullName || fullName.length < 2) {
    document.getElementById("err-fullName").innerText = "Vui lòng nhập họ và tên hợp lệ (từ 2 ký tự).";
    fullNameInput.classList.add("is-error");
    isValid = false;
  }

  const phoneRegex = /^(?:0[35789]\d{8}|\+84[35789]\d{8})$/;
  if (!phone || !phoneRegex.test(phone)) {
    document.getElementById("err-phoneNumber").innerText = "Số điện thoại không đúng (dạng 03/05/07/08/09xxxxxxxx hoặc +84xxxxxxxxx).";
    phoneInput.classList.add("is-error");
    isValid = false;
  }

  if (!CHECKOUT_PROVINCES.includes(province)) {
    document.getElementById("err-province").innerText = "Vui lòng chọn tỉnh / thành phố trong danh sách.";
    if (provinceInput) provinceInput.classList.add("is-error");
    isValid = false;
  }

  if (!ward) {
    document.getElementById("err-ward").innerText = "Vui lòng nhập phường / xã.";
    if (wardInput) wardInput.classList.add("is-error");
    isValid = false;
  }

  if (!address || address.length < 5) {
    document.getElementById("err-address").innerText = "Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường hoặc thôn/khu phố).";
    addressInput.classList.add("is-error");
    isValid = false;
  }

  if (!confirmOrder) {
    if (confirmErr) confirmErr.innerText = "Bạn cần xác nhận thông tin đặt hàng trước khi xác nhận.";
    isValid = false;
  }

  if (!isValid) return;

  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked')?.value || "COD";
  const fullAddress = [address, ward, province].filter(Boolean).join(", ");
  const chosenItems = getSelectedCartItems();

  const subtotal = chosenItems.reduce((sum, item) => sum + (Number(item.price) + Number(item.warrantyPrice || 0)) * item.quantity, 0);
  const expectedTotal = subtotal + (subtotal >= 300000 || subtotal === 0 ? 0 : 30000)
    - getCouponDiscount(couponCode, subtotal);
  if (!chosenItems.length || chosenItems.some(item => {
    const found = findVariant(item.variantId);
    return found && item.quantity > found.variant.stock;
  }) || totalAmount !== expectedTotal) {
    showToast("Giỏ hàng đã thay đổi hoặc vượt tồn kho. Vui lòng kiểm tra lại giỏ hàng.", true);
    return;
  }

  const currentUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const orderDate = new Date().toISOString();
  // Lưu theo đúng cấu trúc mà trang orders.html / order.js sử dụng.
  const newOrder = {
    id: orderCode,
    orderId: orderCode,
    userId: currentUser?.id || currentUser?.userId || "demo-user",
    orderDate,
    createdAt: orderDate,
    shippingInfo: {
      fullName,
      phone,
      address: fullAddress,
      note
    },
    customer: {
      fullName,
      phoneNumber: phone,
      address: fullAddress,
      note
    },
    items: chosenItems.map(item => ({
      ...item,
      productName: item.name || "Sản phẩm",
      variantName: [item.storage, item.color].filter(Boolean).join(" - ") || item.variantId,
      unitPrice: Number(item.price || 0) + Number(item.warrantyPrice || 0)
    })),
    totalAmount: Number(totalAmount),
    couponCode,
    couponDiscount,
    paymentMethod: String(selectedPayment).toLowerCase() === "qr" ? "transfer" : String(selectedPayment).toLowerCase(),
    status: "pending"
  };

  let orders = [];
  try {
    const savedOrders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY));
    orders = Array.isArray(savedOrders) ? savedOrders : [];
  } catch (e) {
    orders = [];
  }
  orders.push(newOrder);
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));

  const purchasedIds = new Set(chosenItems.map(item => item.variantId));
  save(CART_STORAGE_KEY, getCart().filter(item => !purchasedIds.has(item.variantId)));
  sessionStorage.removeItem("cart_coupon");
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }

  sessionStorage.setItem("latestOrder", JSON.stringify(newOrder));
  sessionStorage.setItem("lastOrderId", orderCode);

  alert("🎉 Đặt hàng thành công! Mã đơn của bạn là: " + orderCode + "\nSản phẩm đã được lưu vào lịch sử mua hàng.");
  window.location.href = "order-success.html?id=" + encodeURIComponent(orderCode);
}

document.addEventListener("DOMContentLoaded", function () {
  initCheckoutPage();
});
