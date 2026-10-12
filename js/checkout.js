/* ==========================================================
   js/checkout.js - XỬ LÝ THANH TOÁN, QR CODE & ĐƠN HÀNG
   ========================================================== */

const CART_STORAGE_KEY = (typeof KEYS !== "undefined" && KEYS.cart) ? KEYS.cart : "shopping_cart";
const ORDER_STORAGE_KEY = (typeof KEYS !== "undefined" && KEYS.orders) ? KEYS.orders : "orders";

const BANK_CONFIG = {
  bankId: "MB",
  bankName: "MB Bank (Quân Đội)",
  accountNo: "0339597863",
  accountName: "CHU THI HUONG"
};

const ADDRESS_DATA = {
  "Hà Nội": {
    "Quận Ba Đình": ["Phường Phúc Xá", "Phường Trúc Bạch", "Phường Cống Vị"],
    "Quận Cầu Giấy": ["Phường Dịch Vọng", "Phường Mai Dịch", "Phường Yên Hòa"],
    "Quận Hoàn Kiếm": ["Phường Hàng Trống", "Phường Lý Thái Tổ", "Phường Chương Dương Độ"],
    "Quận Tây Hồ": ["Phường Bưởi", "Phường Nhật Tân", "Phường Xuân La"],
    "Quận Đống Đa": ["Phường Nam Đồng", "Phường Khâm Thiên", "Phường Trung Liệt"]
  },
  "Thành phố Hồ Chí Minh": {
    "Quận 1": ["Phường Bến Nghé", "Phường Đa Kao", "Phường Nguyễn Thái Bình"],
    "Quận 3": ["Phường 1", "Phường 2", "Phường 5"],
    "Quận 7": ["Phường Tân Phú", "Phường Tân Hưng", "Phường Phú Mỹ"],
    "Thủ Đức": ["Phường Linh Xuân", "Phường Bình Thọ", "Phường Tam Bình"],
    "Quận 5": ["Phường 4", "Phường 7", "Phường 8"]
  },
  "Đà Nẵng": {
    "Hải Châu": ["Phường Nam Dương", "Phường Thuận Phước", "Phường Bình Hiên"],
    "Sơn Trà": ["Phường An Hải Bắc", "Phường Thọ Quang", "Phường Mân Thái"],
    "Ngũ Hành Sơn": ["Phường Mỹ An", "Phường Khuê Mỹ", "Phường Hòa Quý"],
    "Liên Chiểu": ["Phường Hòa Khánh Nam", "Phường Hòa Khánh Bắc", "Phường Hòa Minh"]
  },
  "Hải Phòng": {
    "Hồng Bàng": ["Phường Sở Dầu", "Phường Quán Toan", "Phường Gia Viễn"],
    "Ngô Quyền": ["Phường Lạch Tray", "Phường Máy Chai", "Phường Vạn Mỹ"],
    "Lê Chân": ["Phường An Biên", "Phường An Dương", "Phường Hoà Nghĩa"],
    "Kiến An": ["Phường Đồng Hòa", "Phường Nam Hồng", "Phường Trực Ninh"]
  },
  "Cần Thơ": {
    "Ninh Kiều": ["Phường Cái Khế", "Phường An Khánh", "Phường Tân An"],
    "Bình Thủy": ["Phường Bình Thủy", "Phường Thới An Đông", "Phường Trà Nóc"],
    "Cái Răng": ["Phường Hưng Phú", "Phường Lê Bình", "Phường Tân Phú"],
    "Ô Môn": ["Phường Châu Văn Liêm", "Phường Thới An", "Phường Thới Hòa"]
  }
};

function formatCheckoutMoney(amount) {
  return Number(amount || 0).toLocaleString("vi-VN") + "đ";
}

function getSelectedCartItems() {
  return getCart().filter(item => item.selected !== false);
}

function populateProvinceOptions() {
  const provinceSelect = document.getElementById("province");
  if (!provinceSelect) return;
  const provinces = Object.keys(ADDRESS_DATA);
  provinceSelect.innerHTML = '<option value="">-- Chọn tỉnh / thành phố --</option>' +
    provinces.map(name => `<option value="${name}">${name}</option>`).join("");
}

function fillSelect(select, placeholder, values) {
  if (!select) return;
  select.innerHTML = `<option value="">${placeholder}</option>` +
    values.map(value => `<option value="${value}">${value}</option>`).join("");
}

function updateAddressCascade() {
  const provinceSelect = document.getElementById("province");
  const districtSelect = document.getElementById("district");
  const wardSelect = document.getElementById("ward");

  if (!provinceSelect || !districtSelect || !wardSelect) return;

  const selectedProvince = provinceSelect.value;
  const districtData = selectedProvince && ADDRESS_DATA[selectedProvince] ? Object.keys(ADDRESS_DATA[selectedProvince]) : [];

  fillSelect(districtSelect, "-- Chọn quận / huyện --", districtData);
  districtSelect.disabled = districtData.length === 0;

  const firstDistrict = districtData[0] || "";
  const wardData = selectedProvince && ADDRESS_DATA[selectedProvince] && firstDistrict && ADDRESS_DATA[selectedProvince][firstDistrict]
    ? ADDRESS_DATA[selectedProvince][firstDistrict]
    : [];

  fillSelect(wardSelect, "-- Chọn phường / xã --", wardData);
  wardSelect.disabled = wardData.length === 0;

  districtSelect.onchange = () => {
    const chosenDistrict = districtSelect.value;
    const wards = selectedProvince && ADDRESS_DATA[selectedProvince] && chosenDistrict && ADDRESS_DATA[selectedProvince][chosenDistrict]
      ? ADDRESS_DATA[selectedProvince][chosenDistrict]
      : [];
    fillSelect(wardSelect, "-- Chọn phường / xã --", wards);
    wardSelect.disabled = wards.length === 0;
  };
}

function initAddressForm() {
  populateProvinceOptions();
  const provinceSelect = document.getElementById("province");
  const districtSelect = document.getElementById("district");
  const wardSelect = document.getElementById("ward");

  if (!provinceSelect || !districtSelect || !wardSelect) return;

  provinceSelect.addEventListener("change", updateAddressCascade);
  districtSelect.addEventListener("change", () => {
    const province = provinceSelect.value;
    const district = districtSelect.value;
    const wards = province && ADDRESS_DATA[province] && district && ADDRESS_DATA[province][district] ? ADDRESS_DATA[province][district] : [];
    fillSelect(wardSelect, "-- Chọn phường / xã --", wards);
    wardSelect.disabled = wards.length === 0;
  });
}

function initCheckoutPage() {
  const cart = getSelectedCartItems();
  if (cart.length === 0) {
    alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
    window.location.href = "cart.html";
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
    if (code !== "GREEN100" || totalAmount < 1000000) {
      message.textContent = code === "GREEN100" ? "Mã áp dụng cho đơn từ 1.000.000đ." : "Mã giảm giá không hợp lệ. Vui lòng kiểm tra lại.";
      input.setAttribute("aria-invalid", "true");
      return;
    }
    couponCode = code;
    couponDiscount = 100000;
    sessionStorage.setItem("cart_coupon", code);
    input.value = code;
    input.removeAttribute("aria-invalid");
    message.textContent = "Đã áp dụng mã GREEN100, giảm 100.000đ.";
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

  if (sessionStorage.getItem("cart_coupon") === "GREEN100" && totalAmount >= 1000000) {
    document.getElementById("coupon-code").value = "GREEN100";
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
  const districtInput = document.getElementById("district");
  const wardInput = document.getElementById("ward");
  const addressInput = document.getElementById("address");
  const noteInput = document.getElementById("orderNote");
  const confirmInput = document.getElementById("confirm-order");

  const fullName = fullNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const province = provinceInput ? provinceInput.value.trim() : "";
  const district = districtInput ? districtInput.value.trim() : "";
  const ward = wardInput ? wardInput.value.trim() : "";
  const address = addressInput ? addressInput.value.trim() : "";
  const note = noteInput ? noteInput.value.trim() : "";
  const confirmOrder = !!(confirmInput && confirmInput.checked);

  ["fullName", "phoneNumber", "province", "district", "ward", "address", "confirm-order"].forEach(key => {
    const el = document.getElementById("err-" + key);
    if (el) el.innerText = "";
  });
  [fullNameInput, phoneInput, provinceInput, districtInput, wardInput, addressInput].forEach(el => {
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

  if (!province) {
    document.getElementById("err-province").innerText = "Vui lòng chọn tỉnh / thành phố.";
    if (provinceInput) provinceInput.classList.add("is-error");
    isValid = false;
  }

  if (!district) {
    document.getElementById("err-district").innerText = "Vui lòng chọn quận / huyện.";
    if (districtInput) districtInput.classList.add("is-error");
    isValid = false;
  }

  if (!ward) {
    document.getElementById("err-ward").innerText = "Vui lòng chọn phường / xã.";
    if (wardInput) wardInput.classList.add("is-error");
    isValid = false;
  }

  if (!address || address.length < 5) {
    document.getElementById("err-address").innerText = "Vui lòng nhập địa chỉ nhận hàng chi tiết.";
    addressInput.classList.add("is-error");
    isValid = false;
  }

  if (!confirmOrder) {
    if (confirmErr) confirmErr.innerText = "Bạn cần xác nhận thông tin đặt hàng trước khi xác nhận.";
    isValid = false;
  }

  if (!isValid) return;

  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked')?.value || "COD";
  const fullAddress = [address, ward, district, province].filter(Boolean).join(", ");
  const chosenItems = getSelectedCartItems();

  const newOrder = {
    orderId: orderCode,
    createdAt: new Date().toISOString(),
    customer: {
      fullName: fullName,
      phoneNumber: phone,
      address: fullAddress,
      note: note
    },
    items: chosenItems,
    totalAmount: totalAmount,
    couponCode,
    couponDiscount,
    paymentMethod: selectedPayment,
    status: "Chờ xác nhận"
  };

  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
  } catch (e) {
    orders = [];
  }
  orders.push(newOrder);
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));

  localStorage.removeItem(CART_STORAGE_KEY);
  sessionStorage.removeItem("cart_coupon");
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }

  sessionStorage.setItem("latestOrder", JSON.stringify(newOrder));

  alert("🎉 Đặt hàng thành công! Mã đơn của bạn là: " + orderCode);
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
  initCheckoutPage();
});
