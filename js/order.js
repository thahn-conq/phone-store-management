/* ==========================================================
   order.js - Module Order
   Dữ liệu thật sẽ được checkout lưu vào KEYS.orders.
   Trong lúc Account/Cart chưa hoàn thành, dữ liệu mẫu chỉ được tạo khi
   localStorage chưa có orders để module Order có thể test độc lập.
   ========================================================== */

const ORDER_STATUS = {
  pending:   { label: "Chờ xác nhận", className: "ord-status-pending", step: 0 },
  confirmed: { label: "Đang xử lý", className: "ord-status-confirmed", step: 1 },
  shipping:  { label: "Đang giao hàng", className: "ord-status-shipping", step: 2 },
  completed: { label: "Đã giao hàng", className: "ord-status-completed", step: 3 },
  cancelled: { label: "Đã hủy", className: "ord-status-cancelled", step: -1 }
};

const ORDER_DEMO_USER_ID = "demo-user";

function getOrders() {
  return load(KEYS.orders, []);
}

function saveOrders(orders) {
  save(KEYS.orders, orders);
}

function getOrderUserId() {
  const user = getCurrentUser();
  return user?.id || user?.userId || ORDER_DEMO_USER_ID;
}

function getMyOrders() {
  const userId = getOrderUserId();
  return getOrders().filter(order => order.userId === userId);
}

function findOrder(orderId) {
  const normalizedId = String(orderId || "").trim().toLowerCase();
  return getMyOrders().find(order => String(order.id).toLowerCase() === normalizedId) || null;
}

function getOrderStatus(status) {
  return ORDER_STATUS[status] || { label: "Không xác định", className: "", step: -1 };
}

function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getOrderItemInfo(item) {
  const found = findVariant(item.variantId);
  if (!found) {
    return {
      name: item.productName || "Sản phẩm",
      image: item.image || "",
      variant: item.variantName || item.variantId,
      price: Number(item.unitPrice || 0)
    };
  }
  return {
    name: item.productName || found.product.name,
    image: item.image || found.variant.image || found.product.image,
    variant: item.variantName || `${found.variant.storage} - ${found.variant.color}`,
    price: Number(item.unitPrice ?? found.variant.price)
  };
}

function orderTotal(order) {
  if (Number.isFinite(Number(order.totalAmount))) return Number(order.totalAmount);
  return (order.items || []).reduce((sum, item) => {
    const info = getOrderItemInfo(item);
    return sum + info.price * Number(item.quantity || 0);
  }, 0);
}

function statusBadge(status) {
  const meta = getOrderStatus(status);
  return `<span class="ord-status ${meta.className}">${meta.label}</span>`;
}

function orderCardHtml(order) {
  const items = order.items || [];
  const first = items[0];
  const firstInfo = first ? getOrderItemInfo(first) : null;
  const more = Math.max(0, items.length - 1);
  return `
    <article class="ord-item">
      <div class="ord-item-head">
        <div class="ord-order-meta">
          <span>Đơn hàng: <strong>${escapeHtml(order.id)}</strong></span>
          <span class="ord-meta-dot">•</span>
          <span>Ngày đặt: <strong>${escapeHtml(formatOrderDate(order.orderDate))}</strong></span>
        </div>
        ${statusBadge(order.status)}
      </div>
      <div class="ord-item-body">
        <div class="ord-products-preview">
          ${firstInfo ? `
            <div class="ord-product-row">
              ${firstInfo.image ? `<img class="ord-product-img" src="${escapeHtml(firstInfo.image)}" alt="${escapeHtml(firstInfo.name)}">` : ""}
              <div class="ord-product-copy">
                <div class="ord-product-name">${escapeHtml(firstInfo.name)}</div>
                <div class="ord-product-meta">${escapeHtml(firstInfo.variant)} · Số lượng: ${Number(first.quantity || 0)}</div>
                ${more ? `<div class="ord-more-items">Cùng ${more} sản phẩm khác</div>` : ""}
              </div>
            </div>` : `<span class="text-soft">Không có thông tin sản phẩm</span>`}
        </div>
        <div class="ord-item-summary">
          <div class="ord-total-label">Tổng thanh toán</div>
          <div class="ord-total">${formatPrice(orderTotal(order))}</div>
          <a class="ord-detail-link" href="order-detail.html?id=${encodeURIComponent(order.id)}">Xem chi tiết <span>›</span></a>
        </div>
      </div>
    </article>`;
}

function updateOrderCounts() {
  const orders = getMyOrders();
  const counts = { all: orders.length, pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 };
  orders.forEach(order => { if (Object.hasOwn(counts, order.status)) counts[order.status] += 1; });
  Object.entries(counts).forEach(([key, value]) => {
    const el = document.querySelector(`[data-count="${key}"]`);
    if (el) el.textContent = value;
  });
}

function renderOrders(orders = getMyOrders()) {
  const list = document.getElementById("ord-list");
  if (!list) return;
  const count = document.getElementById("ord-order-count");
  if (count) count.textContent = `${orders.length} đơn hàng phù hợp`;
  if (!orders.length) {
    list.innerHTML = `
      <div class="ord-empty">
        <div class="ord-empty-icon">⌕</div>
        <h3>${getMyOrders().length ? "Không tìm thấy đơn hàng phù hợp" : "Bạn chưa có đơn hàng nào"}</h3>
        <p>${getMyOrders().length ? "Hãy thử thay đổi từ khóa, trạng thái hoặc khoảng ngày." : "Khám phá những chiếc điện thoại yêu thích và bắt đầu đơn hàng đầu tiên."}</p>
        ${getMyOrders().length ? `<button class="btn btn-outline" type="button" id="ord-empty-reset">Xóa bộ lọc</button>` : `<a class="btn btn-primary" href="index.html">Khám phá sản phẩm</a>`}
      </div>`;
    document.getElementById("ord-empty-reset")?.addEventListener("click", resetOrderFilters);
    return;
  }
  const sorted = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  list.innerHTML = sorted.map(orderCardHtml).join("");
}

function activeOrderStatus() {
  return document.querySelector(".ord-tab.is-active")?.dataset.status || "all";
}

function applyOrderFilters() {
  const query = document.getElementById("ord-search-input")?.value.trim().toLowerCase() || "";
  const status = activeOrderStatus();
  const from = document.getElementById("ord-date-from")?.value || "";
  const to = document.getElementById("ord-date-to")?.value || "";
  let orders = getMyOrders();
  if (query) orders = orders.filter(order => String(order.id).toLowerCase().includes(query));
  if (status !== "all") orders = orders.filter(order => order.status === status);
  if (from) {
    const start = new Date(`${from}T00:00:00`);
    orders = orders.filter(order => new Date(order.orderDate) >= start);
  }
  if (from && to && from > to) {
    const message = document.getElementById("ord-search-message");
    if (message) { message.textContent = "Ngày bắt đầu không thể sau ngày kết thúc."; message.classList.add("is-error"); }
    return [];
  }
  if (to) {
    const end = new Date(`${to}T23:59:59`);
    orders = orders.filter(order => new Date(order.orderDate) <= end);
  }
  renderOrders(orders);
  const reset = document.getElementById("ord-clear-search");
  if (reset) reset.hidden = !(query || from || to || status !== "all");
  return orders;
}

function resetOrderFilters() {
  const input = document.getElementById("ord-search-input");
  const from = document.getElementById("ord-date-from");
  const to = document.getElementById("ord-date-to");
  const clear = document.getElementById("ord-clear-search");
  const message = document.getElementById("ord-search-message");
  if (input) input.value = "";
  if (from) from.value = "";
  if (to) to.value = "";
  document.querySelectorAll(".ord-tab").forEach(tab => {
    const active = tab.dataset.status === "all";
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  if (clear) clear.hidden = true;
  if (message) { message.textContent = ""; message.classList.remove("is-error"); }
  renderOrders();
}

function setupOrdersPage() {
  seedDemoOrders();
  updateOrderCounts();
  renderOrders();
  document.querySelectorAll(".ord-tab").forEach(tab => tab.setAttribute("aria-pressed", String(tab.classList.contains("is-active"))));

  const form = document.getElementById("ord-search-form");
  const input = document.getElementById("ord-search-input");
  const message = document.getElementById("ord-search-message");
  const clear = document.getElementById("ord-clear-search");
  const from = document.getElementById("ord-date-from");
  const to = document.getElementById("ord-date-to");

  form?.addEventListener("submit", event => {
    event.preventDefault();
    const result = applyOrderFilters();
    clear.hidden = false;
    message.classList.remove("is-error");
    if (input.value.trim()) {
      message.textContent = result.length ? `Tìm thấy ${result.length} đơn hàng phù hợp.` : "Không tìm thấy đơn hàng thuộc tài khoản của bạn.";
      if (!result.length) message.classList.add("is-error");
    } else message.textContent = "";
  });

  clear?.addEventListener("click", resetOrderFilters);

  document.querySelectorAll(".ord-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".ord-tab").forEach(item => item.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.querySelectorAll(".ord-tab").forEach(item => item.setAttribute("aria-pressed", String(item === tab)));
      applyOrderFilters();
    });
  });

  [from, to].forEach(control => control?.addEventListener("change", () => {
    clear.hidden = false;
    if (from?.value && to?.value && from.value > to.value) {
      message.textContent = "Ngày bắt đầu không thể sau ngày kết thúc.";
      message.classList.add("is-error");
      return;
    }
    message.textContent = "";
    message.classList.remove("is-error");
    applyOrderFilters();
  }));
}

function renderOrderDetail() {
  seedDemoOrders();
  const root = document.getElementById("ord-detail");
  if (!root) return;
  const orderId = new URLSearchParams(location.search).get("id");
  const order = findOrder(orderId);
  if (!order) {
    root.innerHTML = `
      <section class="card ord-not-found">
        <h1>Không tìm thấy đơn hàng</h1>
        <p class="text-soft">Đơn hàng không tồn tại hoặc không thuộc tài khoản hiện tại.</p>
        <a class="btn btn-primary" href="orders.html">Quay lại danh sách đơn hàng</a>
      </section>`;
    return;
  }

  const items = order.items || [];
  const itemsHtml = items.map(item => {
    const info = getOrderItemInfo(item);
    return `
      <div class="ord-detail-product">
        ${info.image ? `<img src="${escapeHtml(info.image)}" alt="${escapeHtml(info.name)}">` : ""}
        <div>
          <h3>${escapeHtml(info.name)}</h3>
          <div class="ord-product-meta">${escapeHtml(info.variant)}</div>
          <div class="ord-product-meta">Số lượng: ${Number(item.quantity || 0)}</div>
        </div>
        <div class="ord-detail-price">
          <strong>${formatPrice(info.price * Number(item.quantity || 0))}</strong>
          <div class="ord-product-meta">${formatPrice(info.price)} / sản phẩm</div>
        </div>
      </div>`;
  }).join("");

  root.innerHTML = `
    <div class="ord-detail-head">
      <div>
        <p class="ord-eyebrow">CHI TIẾT ĐƠN HÀNG</p>
        <h1>${escapeHtml(order.id)}</h1>
        <p class="text-soft">Đặt lúc ${escapeHtml(formatOrderDate(order.orderDate))}</p>
      </div>
      ${statusBadge(order.status)}
    </div>

    <div class="ord-detail-grid">
      <div class="ord-detail-main">
        <section class="card">
          <div class="ord-card-title"><h2>Sản phẩm</h2><span class="text-soft">${items.length} sản phẩm</span></div>
          ${itemsHtml || `<p class="text-soft">Không có thông tin sản phẩm.</p>`}
        </section>
        <section class="card">
          <div class="ord-card-title"><h2>Thông tin nhận hàng</h2></div>
          <div class="ord-info-list">
            <div class="ord-info-row"><span>Người nhận</span><strong>${escapeHtml(order.shippingInfo?.fullName || "-")}</strong></div>
            <div class="ord-info-row"><span>Số điện thoại</span><strong>${escapeHtml(order.shippingInfo?.phone || "-")}</strong></div>
            <div class="ord-info-row"><span>Địa chỉ</span><strong>${escapeHtml(order.shippingInfo?.address || "-")}</strong></div>
          </div>
        </section>
      </div>

      <aside class="ord-detail-side">
        <section class="card">
          <div class="ord-card-title"><h2>Trạng thái đơn hàng</h2></div>
          ${timelineHtml(order.status)}
        </section>
        <section class="card">
          <div class="ord-card-title"><h2>Thanh toán</h2></div>
          <div class="ord-info-list">
            <div class="ord-info-row"><span>Phương thức</span><strong>${escapeHtml(paymentLabel(order.paymentMethod))}</strong></div>
            <div class="ord-summary-row ord-summary-total"><span>Tổng thanh toán</span><strong>${formatPrice(orderTotal(order))}</strong></div>
          </div>
          <div class="ord-actions">
            ${order.status === "pending" ? `<button class="btn btn-danger btn-block" id="ord-cancel-btn" type="button">Hủy đơn hàng</button>` : ""}
            <a class="btn btn-outline btn-block" href="orders.html">Quay lại danh sách</a>
          </div>
        </section>
      </aside>
    </div>`;

  document.getElementById("ord-cancel-btn")?.addEventListener("click", () => cancelOrder(order.id));
}

function timelineHtml(status) {
  if (status === "cancelled") {
    return `<div class="ord-timeline ord-timeline-cancelled"><div class="ord-step done"><span class="ord-step-dot"></span><div class="ord-step-copy"><strong>Đã đặt hàng</strong><span>Đơn hàng được ghi nhận</span></div></div><div class="ord-step current"><span class="ord-step-dot"></span><div class="ord-step-copy"><strong>Đã hủy</strong><span>Đơn hàng không tiếp tục được xử lý</span></div></div></div>`;
  }
  const current = getOrderStatus(status).step;
  const steps = [
    ["Chờ xác nhận", "Đơn hàng đã được ghi nhận"],
    ["Đang xử lý", "GreenPhone đang chuẩn bị đơn hàng"],
    ["Đang giao", "Đơn hàng đang trên đường giao đến bạn"],
    ["Hoàn thành", "Đơn hàng đã được giao thành công"]
  ];
  return `<div class="ord-timeline">${steps.map((step, index) => `
    <div class="ord-step ${index < current ? "done" : index === current ? "current" : ""}">
      <span class="ord-step-dot"></span>
      <div class="ord-step-copy"><strong>${step[0]}</strong><span>${step[1]}</span></div>
    </div>`).join("")}</div>`;
}

function paymentLabel(method) {
  const labels = { cod: "Thanh toán khi nhận hàng (COD)", transfer: "Chuyển khoản", online: "Thanh toán online" };
  return labels[method] || method || "Chưa xác định";
}

function cancelOrder(orderId) {
  const order = findOrder(orderId);
  if (!order || order.status !== "pending") {
    showToast("Đơn hàng hiện không thể hủy", true);
    return;
  }
  openOrderCancelDialog(orderId);
}

function confirmOrderCancellation(orderId) {
  const orders = getOrders();
  const target = orders.find(item => item.id === orderId && item.userId === getOrderUserId());
  if (!target) return;
  target.status = "cancelled";
  target.updatedAt = new Date().toISOString();
  target.cancelledAt = target.updatedAt;
  saveOrders(orders);
  showToast("Đã hủy đơn hàng");
  document.getElementById("ord-cancel-dialog")?.close();
  renderOrderDetail();
}

function openOrderCancelDialog(orderId) {
  let dialog = document.getElementById("ord-cancel-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "ord-cancel-dialog";
    dialog.className = "ord-confirm-dialog";
    document.body.appendChild(dialog);
  }
  dialog.innerHTML = `<div class="ord-confirm-icon" aria-hidden="true">!</div>
    <h2>Xác nhận hủy đơn hàng?</h2>
    <p>Bạn sắp hủy đơn <strong>${escapeHtml(orderId)}</strong>. Đơn hàng đã hủy sẽ không thể khôi phục.</p>
    <div class="ord-confirm-actions"><button class="btn btn-outline" type="button" id="ord-keep-order">Giữ đơn hàng</button>
    <button class="btn btn-danger" type="button" id="ord-confirm-cancel">Xác nhận hủy</button></div>`;
  dialog.querySelector("#ord-keep-order").addEventListener("click", () => dialog.close());
  dialog.querySelector("#ord-confirm-cancel").addEventListener("click", () => confirmOrderCancellation(orderId));
  if (typeof dialog.showModal === "function") dialog.showModal();
}

function renderOrderSuccess() {
  seedDemoOrders();
  const root = document.getElementById("ord-success");
  if (!root) return;
  const orderId = new URLSearchParams(location.search).get("id") || sessionStorage.getItem("lastOrderId");
  const order = orderId ? findOrder(orderId) : null;
  root.innerHTML = `
    <div class="ord-success-icon">✓</div>
    <h1>Đặt hàng thành công!</h1>
    <p>${order ? "GreenPhone đã ghi nhận đơn hàng của bạn. Bạn có thể theo dõi trạng thái trong mục Đơn hàng của tôi." : "GreenPhone đã ghi nhận yêu cầu đặt hàng của bạn."}</p>
    ${order ? `<div class="ord-success-info">
      <div class="ord-info-row"><span>Mã đơn hàng</span><strong>${escapeHtml(order.id)}</strong></div>
      <div class="ord-info-row"><span>Tổng thanh toán</span><strong class="price">${formatPrice(orderTotal(order))}</strong></div>
      <div class="ord-info-row"><span>Trạng thái</span><strong>${getOrderStatus(order.status).label}</strong></div>
    </div>` : ""}
    <div class="ord-success-actions">
      ${order ? `<a class="btn btn-primary" href="order-detail.html?id=${encodeURIComponent(order.id)}">Xem đơn hàng</a>` : `<a class="btn btn-primary" href="orders.html">Xem đơn hàng của tôi</a>`}
      <a class="btn btn-outline" href="index.html">Về trang chủ</a>
    </div>`;
}

/* Dữ liệu test tạm thời. Khi Checkout hoàn thành, có thể xóa hàm này và 3 lời gọi seedDemoOrders(). */
function seedDemoOrders() {
  if (localStorage.getItem(KEYS.orders) !== null) return;
  const demoOrders = [
    {
      id: "GP20261006001", userId: ORDER_DEMO_USER_ID,
      items: [
        { variantId: "IP15-128-HONG", quantity: 1, unitPrice: 19990000 },
        { variantId: "RN13-128-DEN", quantity: 1, unitPrice: 4990000 }
      ],
      totalAmount: 24980000,
      shippingInfo: { fullName: "Nguyễn Văn An", phone: "0987654321", address: "Cầu Giấy, Hà Nội" },
      paymentMethod: "cod", status: "pending", orderDate: "2026-10-06T14:20:00+07:00"
    },
    {
      id: "GP20261003002", userId: ORDER_DEMO_USER_ID,
      items: [{ variantId: "SS24U-256-XAM", quantity: 1, unitPrice: 27990000 }],
      totalAmount: 27990000,
      shippingInfo: { fullName: "Nguyễn Văn An", phone: "0987654321", address: "Cầu Giấy, Hà Nội" },
      paymentMethod: "transfer", status: "shipping", orderDate: "2026-10-03T09:15:00+07:00"
    },
    {
      id: "GP20260928003", userId: ORDER_DEMO_USER_ID,
      items: [{ variantId: "XM14-256-DEN", quantity: 1, unitPrice: 19990000 }],
      totalAmount: 19990000,
      shippingInfo: { fullName: "Nguyễn Văn An", phone: "0987654321", address: "Cầu Giấy, Hà Nội" },
      paymentMethod: "cod", status: "completed", orderDate: "2026-09-28T18:05:00+07:00"
    }
  ];
  saveOrders(demoOrders);
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.orderPage;
  if (page === "orders") setupOrdersPage();
  if (page === "detail") renderOrderDetail();
  if (page === "success") renderOrderSuccess();
});
