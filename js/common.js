/* ==========================================================
   common.js - DÙNG CHUNG CHO CẢ NHÓM
   Mọi trang đặt 2 thẻ:  <div id="site-header"></div> ... <div id="site-footer"></div>
   và nhúng:  <script src="js/common.js"></script>  (cuối <body>)
   ========================================================== */

/* ---- 1. KHÓA localStorage (cả nhóm dùng đúng tên này) ---- */
const KEYS = {
  users: "users",              // danh sách tài khoản
  currentUser: "currentUser",  // người đang đăng nhập (null = khách vãng lai)
  cart: "shopping_cart",       // giỏ hàng
  orders: "orders",            // đơn hàng
  location: "location"         // khu vực nhận hàng đã chọn ở header
};

/* ---- 2. BẢN ĐỒ LIÊN KẾT CÁC TRANG ----
   Hiện chưa có trang nào ngoài index.html nên url đang là "#".
   Khi một module làm xong trang, CHỈ CẦN đổi url ở đây (vd products: "products.html").
   Mọi liên kết trong header, footer và trang chủ sẽ tự cập nhật theo. */
const PAGES = {
  home:          { url: "index.html", title: "Trang chủ",                  module: "Khung chung" },
  products:      { url: "#", title: "Danh sách điện thoại",     module: "Sản phẩm và tìm kiếm" },
  productDetail: { url: "#", title: "Chi tiết sản phẩm",        module: "Sản phẩm và tìm kiếm" },
  compare:       { url: "#", title: "So sánh sản phẩm",         module: "Sản phẩm và tìm kiếm" },
  cart:          { url: "#", title: "Giỏ hàng",                 module: "Giỏ hàng và Thanh toán" },
  checkout:      { url: "#", title: "Thanh toán",               module: "Giỏ hàng và Thanh toán" },
  login:         { url: "#", title: "Đăng nhập / Đăng ký",      module: "Tài khoản khách hàng" },
  account:       { url: "#", title: "Tài khoản của tôi",        module: "Tài khoản khách hàng" },
  orders:        { url: "#", title: "Tra cứu đơn hàng",         module: "Đơn hàng" },
  info:          { url: "#", title: "Trang thông tin",          module: "Khung chung" }
};
function pageUrl(name, query = "") {
  const p = PAGES[name];
  return !p || p.url === "#" ? "#" : p.url + query;
}
/* Dùng trong template: <a ${pageAttrs("productDetail", "?id=abc")}> */
function pageAttrs(name, query = "") {
  return `href="${pageUrl(name, query)}" data-page="${name}" data-query="${query}"`;
}
/* Gán href cho các thẻ <a data-page="..."> viết sẵn trong HTML */
function wireLinks(root = document) {
  root.querySelectorAll("a[data-page]").forEach(a =>
    a.setAttribute("href", pageUrl(a.dataset.page, a.dataset.query || "")));
}

/* ---- 3. Đọc / ghi localStorage ---- */
function load(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

/* ---- 4. Đăng nhập (giả lập) - module Tài khoản gọi các hàm này ---- */
function getCurrentUser() { return load(KEYS.currentUser); }
function isLoggedIn() { return getCurrentUser() !== null; }
function logout() {
  localStorage.removeItem(KEYS.currentUser);
  location.href = PAGES.home.url;
}
/* Trang cần đăng nhập (thanh toán, đơn hàng, tài khoản) gọi dòng này đầu file JS: requireLogin(); */
function requireLogin() {
  if (isLoggedIn()) return;
  if (pageUrl("login") === "#") { showToast("Cần đăng nhập (trang đăng nhập chưa có)", true); return; }
  sessionStorage.setItem("afterLogin", location.pathname.split("/").pop());
  location.href = pageUrl("login");
}

/* ---- 5. Giỏ hàng ---- */
function getCart() { return load(KEYS.cart, []); }
function cartCount() { return getCart().reduce((sum, item) => sum + item.quantity, 0); }
function updateCartBadge() {
  const el = document.getElementById("cart-badge");
  if (el) { const n = cartCount(); el.textContent = n; el.style.display = n ? "" : "none"; }
}

/* Tra cứu sản phẩm / biến thể trong PRODUCTS (data/products.js) */
function findProduct(id) {
  return typeof PRODUCTS !== "undefined" ? PRODUCTS.find(p => p.id === id) || null : null;
}
function findVariant(variantId) {
  if (typeof PRODUCTS === "undefined") return null;
  for (const p of PRODUCTS) {
    const v = p.variants.find(v => v.variantId === variantId);
    if (v) return { product: p, variant: v };
  }
  return null;
}
/* Thêm vào giỏ: cộng dồn nếu đã có, không vượt tồn kho. Trả về true nếu thành công. */
function addToCart(variantId, quantity = 1) {
  const found = findVariant(variantId);
  if (!found) { showToast("Không tìm thấy sản phẩm", true); return false; }
  const cart = getCart();
  const item = cart.find(i => i.variantId === variantId);
  const newQty = (item ? item.quantity : 0) + quantity;
  if (found.variant.stock <= 0) { showToast("Sản phẩm tạm hết hàng", true); return false; }
  if (newQty > found.variant.stock) { showToast("Chỉ còn " + found.variant.stock + " sản phẩm trong kho", true); return false; }
  if (item) item.quantity = newQty;
  else cart.push({ variantId, quantity, selected: true });
  save(KEYS.cart, cart);
  updateCartBadge();
  showToast("Đã thêm vào giỏ hàng");
  return true;
}

/* ---- 6. Tiện ích ---- */
function formatPrice(n) { return Number(n).toLocaleString("vi-VN") + "₫"; }
function showToast(msg, isError = false) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.toggle("error", isError);
  t.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => t.classList.remove("show"), 2800);
}
function isValidEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim()); }

/* ---- 7. Khu vực nhận hàng: 34 tỉnh, thành sau sáp nhập (Nghị quyết 202/2025/QH15, có hiệu lực từ 01/07/2025) ----
   pts = tọa độ [vĩ độ, kinh độ] các trung tâm cũ của tỉnh nhập vào, dùng để tìm tỉnh gần nhất khi bấm "Dùng vị trí hiện tại". */
const PROVINCES = [
  { name: "An Giang",        pts: [[10.38,105.42],[10.01,105.08]] },
  { name: "Bắc Ninh",        pts: [[21.19,106.07],[21.27,106.19]] },
  { name: "Cà Mau",          pts: [[9.18,105.15],[9.29,105.72]] },
  { name: "Cao Bằng",        pts: [[22.67,106.26]] },
  { name: "Cần Thơ",         pts: [[10.04,105.78],[9.60,105.97],[9.78,105.47]] },
  { name: "Đà Nẵng",         pts: [[16.05,108.20],[15.57,108.47]] },
  { name: "Đắk Lắk",         pts: [[12.67,108.04],[13.08,109.30]] },
  { name: "Điện Biên",       pts: [[21.39,103.02]] },
  { name: "Đồng Nai",        pts: [[10.95,106.82],[11.53,106.90]] },
  { name: "Đồng Tháp",       pts: [[10.46,105.63],[10.36,106.36]] },
  { name: "Gia Lai",         pts: [[13.98,108.00],[13.78,109.22]] },
  { name: "Hà Nội",          pts: [[21.03,105.85]] },
  { name: "Hà Tĩnh",         pts: [[18.34,105.91]] },
  { name: "Hải Phòng",       pts: [[20.86,106.68],[20.94,106.33]] },
  { name: "Hồ Chí Minh",     pts: [[10.78,106.70],[10.99,106.65],[10.35,107.08]] },   // hiển thị "TP. Hồ Chí Minh"
  { name: "Huế",             pts: [[16.46,107.59]] },
  { name: "Hưng Yên",        pts: [[20.65,106.05],[20.45,106.34]] },
  { name: "Khánh Hòa",       pts: [[12.24,109.19],[11.56,108.99]] },
  { name: "Lai Châu",        pts: [[22.39,103.46]] },
  { name: "Lạng Sơn",        pts: [[21.85,106.76]] },
  { name: "Lào Cai",         pts: [[22.48,103.97],[21.72,104.90]] },
  { name: "Lâm Đồng",        pts: [[11.94,108.44],[12.00,107.69],[10.93,108.10]] },
  { name: "Nghệ An",         pts: [[18.68,105.68]] },
  { name: "Ninh Bình",       pts: [[20.25,105.97],[20.54,105.91],[20.42,106.17]] },
  { name: "Phú Thọ",         pts: [[21.32,105.40],[21.31,105.60],[20.82,105.34]] },
  { name: "Quảng Ngãi",      pts: [[15.12,108.80],[14.35,108.00]] },
  { name: "Quảng Ninh",      pts: [[20.95,107.08]] },
  { name: "Quảng Trị",       pts: [[17.47,106.62],[16.82,107.10]] },
  { name: "Sơn La",          pts: [[21.33,103.91]] },
  { name: "Tây Ninh",        pts: [[11.31,106.10],[10.53,106.41]] },
  { name: "Thái Nguyên",     pts: [[21.59,105.84],[22.15,105.83]] },
  { name: "Thanh Hóa",       pts: [[19.81,105.78]] },
  { name: "Tuyên Quang",     pts: [[21.82,105.21],[22.82,104.98]] },
  { name: "Vĩnh Long",       pts: [[10.25,105.97],[10.24,106.38],[9.93,106.34]] }
];
/* Tên hiển thị: thành phố trực thuộc trung ương có tiền tố "TP." (trừ Hà Nội, Huế... giữ nguyên cho gọn) */
function provinceLabel(name) { return name === "Hồ Chí Minh" ? "TP. Hồ Chí Minh" : name; }

/* Gom nhóm theo chữ cái đầu, sắp theo bảng chữ cái tiếng Việt (Đ đứng sau D) */
function provinceGroups() {
  const collator = new Intl.Collator("vi");
  const groups = {};
  PROVINCES.forEach(p => { const k = p.name.normalize("NFC")[0].toUpperCase(); (groups[k] = groups[k] || []).push(p.name); });
  return Object.keys(groups).sort(collator.compare).map(k => ({ letter: k, names: groups[k].sort(collator.compare) }));
}

function nearestProvince(lat, lng) {
  const rad = d => d * Math.PI / 180;
  const km = ([la, lo]) => {   // công thức haversine
    const dLat = rad(la - lat), dLng = rad(lo - lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(la)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(a));
  };
  let best = null, bestKm = Infinity;
  PROVINCES.forEach(p => p.pts.forEach(pt => { const d = km(pt); if (d < bestKm) { bestKm = d; best = p; } }));
  return best.name;
}
function updateLocationLabel() {
  const saved = load(KEYS.location);
  const el = document.getElementById("loc-label");
  if (el) el.textContent = saved ? provinceLabel(saved) : "Chọn khu vực";
  const sel = document.getElementById("loc-select");
  if (sel) sel.value = saved || "";
}
function setLocation(name) {
  save(KEYS.location, name);
  updateLocationLabel();
  closeMenus();
  showToast("Khu vực nhận hàng: " + provinceLabel(name));
}
function useCurrentLocation() {
  if (!navigator.geolocation) { showToast("Trình duyệt không hỗ trợ định vị", true); return; }
  closeMenus();
  showToast("Đang xác định vị trí của bạn...");
  navigator.geolocation.getCurrentPosition(
    pos => setLocation(nearestProvince(pos.coords.latitude, pos.coords.longitude)),
    () => showToast("Không truy cập được vị trí. Hãy cho phép truy cập hoặc chọn tỉnh, thành thủ công.", true),
    { timeout: 8000 }
  );
}

/* ---- 8. Icon SVG (không cần thư viện ngoài) ---- */
const svg = (inner, extra = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${inner}</svg>`;
const ICON = {
  grid:   svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
  user:   svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  cart:   svg('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a1 1 0 001 .8h9.6a1 1 0 001-.8L21 7H6"/>'),
  order:  svg('<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h8"/>'),
  phone:  svg('<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/>'),
  headset:svg('<path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/><path d="M20 20c0 1.1-1.8 2-4 2h-2"/>'),
  leaf:   svg('<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path d="M5 19c3-4 6-7 10-9"/>'),
  pin:    svg('<path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>'),
  locate: svg('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'),
  check:  svg('<path d="M20 6L9 17l-5-5"/>'),
  /* mũi tên tam giác chỉ xuống (đặc) */
  caret:  '<svg class="caret" viewBox="0 0 10 6" aria-hidden="true"><path d="M0 0h10L5 6z" fill="currentColor"/></svg>'
};

/* ---- 9. HEADER (kiểu CellphoneS, dựng theo phong cách shadcn) ---- */
function closeMenus() {
  document.querySelectorAll(".menu.open").forEach(m => {
    m.classList.remove("open");
    const b = document.querySelector(`[aria-controls="${m.id}"]`);
    if (b) b.setAttribute("aria-expanded", "false");
  });
}
function setupMenu(btnId, menuId) {
  const btn = document.getElementById(btnId), menu = document.getElementById(menuId);
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const willOpen = !menu.classList.contains("open");
    closeMenus();
    menu.classList.toggle("open", willOpen);
    btn.setAttribute("aria-expanded", willOpen);
  });
}

function renderHeader() {
  const box = document.getElementById("site-header");
  if (!box) return;
  const user = getCurrentUser();

  /* Đăng nhập / Đăng ký gộp một nút; đã đăng nhập thì hiện tên */
  const accountHtml = user
    ? `<a ${pageAttrs("account")} class="hbtn">${ICON.user}<span class="hbtn-text">${user.fullName}</span></a>
       <a href="#" id="btn-logout" class="logout-link">Đăng xuất</a>`
    : `<a ${pageAttrs("login")} class="hbtn" title="Đăng nhập / Đăng ký">${ICON.user}<span class="hbtn-text">Đăng nhập</span></a>`;

  /* Chữ chạy: ưu đãi minh họa (đổi nội dung tại đây) */
  const promos = [
    "Miễn phí vận chuyển cho đơn từ 300.000₫",
    "Sản phẩm chính hãng, giá bán rõ ràng",
    "Flash sale mỗi ngày 20h - 22h",
    "Đăng ký thành viên mới để nhận ưu đãi",
    "Giá tốt mỗi tuần, cập nhật liên tục"
  ];
  const promoGroup = hidden => `<div class="marquee-group" ${hidden ? 'aria-hidden="true"' : ""}>${promos.map(t => `<span>${t}</span>`).join("")}</div>`;

  box.innerHTML = `
  <header class="site-header">
    <div class="header-strip">
      <div class="container strip-row">
        <div class="marquee" aria-label="Ưu đãi"><div class="marquee-track">${promoGroup(false)}${promoGroup(true)}</div></div>
        <div class="strip-links">
          <a ${pageAttrs("orders")}>${ICON.order}Tra cứu đơn hàng</a>
          <a href="tel:19000000" class="strip-hotline">${ICON.phone}Hotline: 1900 0000</a>
        </div>
      </div>
    </div>

    <div class="container header-main">
      <a ${pageAttrs("home")} class="logo"><span class="logo-mark">${ICON.leaf}</span>GreenPhone</a>

      <!-- Danh mục (mũi tên tam giác chỉ xuống, bấm để mở) -->
      <div class="cat-wrap">
        <button type="button" class="hbtn" id="cat-btn" aria-expanded="false" aria-controls="cat-menu">
          ${ICON.grid}<span class="hbtn-text">Danh mục</span>${ICON.caret}
        </button>
        <nav class="menu" id="cat-menu" aria-label="Danh mục">
          <div class="menu-label">Điện thoại</div>
          <a ${pageAttrs("products")}>Tất cả điện thoại</a>
          <a ${pageAttrs("products", "?brand=Apple")}>Apple</a>
          <a ${pageAttrs("products", "?brand=Samsung")}>Samsung</a>
          <a ${pageAttrs("products", "?brand=Xiaomi")}>Xiaomi</a>
          <a ${pageAttrs("products", "?brand=OPPO")}>OPPO</a>
          <a ${pageAttrs("products", "?brand=Vivo")}>Vivo</a>
          <hr>
          <a ${pageAttrs("compare")}>So sánh sản phẩm</a>
        </nav>
      </div>

      <!-- Khu vực nhận hàng: chọn thủ công hoặc cho phép truy cập vị trí -->
      <div class="cat-wrap">
        <button type="button" class="hbtn" id="loc-btn" aria-expanded="false" aria-controls="loc-menu">
          ${ICON.pin}<span class="hbtn-text" id="loc-label">Chọn khu vực</span>${ICON.caret}
        </button>
        <div class="menu loc-menu" id="loc-menu">
          <div class="menu-label">Khu vực nhận hàng</div>
          <button type="button" class="menu-item" id="loc-detect">${ICON.locate}Dùng vị trí hiện tại</button>
          <hr>
          <div class="menu-label"><label for="loc-select">Hoặc chọn tỉnh, thành (34 đơn vị)</label></div>
          <div class="loc-select-wrap">
            <select class="input" id="loc-select">
              <option value="">-- Chọn tỉnh / thành --</option>
              ${provinceGroups().map(g => `<optgroup label="${g.letter}">${g.names.map(n => `<option value="${n}">${provinceLabel(n)}</option>`).join("")}</optgroup>`).join("")}
            </select>
          </div>
        </div>
      </div>

      <form class="search-box" action="${pageUrl("products")}" method="get" id="search-form">
        ${ICON.search}
        <input type="search" name="q" placeholder="Bạn muốn tìm điện thoại nào?" aria-label="Tìm kiếm">
        <button type="submit">Tìm kiếm</button>
      </form>

      <!-- Giỏ hàng đứng trước, Đăng nhập ở góc phải cùng -->
      <div class="header-actions">
        <a ${pageAttrs("cart")} class="hbtn">${ICON.cart}<span class="hbtn-text">Giỏ hàng</span><span class="cart-badge" id="cart-badge">0</span></a>
        ${accountHtml}
      </div>
    </div>
  </header>`;

  /* Đăng xuất */
  const out = document.getElementById("btn-logout");
  if (out) out.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); logout(); });

  /* Hai menu thả xuống; bấm ra ngoài hoặc nhấn Esc để đóng */
  setupMenu("cat-btn", "cat-menu");
  setupMenu("loc-btn", "loc-menu");
  document.addEventListener("click", closeMenus);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenus(); });
  document.getElementById("loc-detect").addEventListener("click", useCurrentLocation);
  document.getElementById("loc-menu").addEventListener("click", e => e.stopPropagation());   // bấm trong ô chọn thì không đóng menu
  document.getElementById("loc-select").addEventListener("change", e => { if (e.target.value) setLocation(e.target.value); });

  /* Tìm kiếm: nếu trang danh sách chưa có thì báo thay vì tải lại trang */
  document.getElementById("search-form").addEventListener("submit", e => {
    if (pageUrl("products") === "#") { e.preventDefault(); showToast("Tìm kiếm thuộc module Sản phẩm, đang được xây dựng"); }
  });

  updateLocationLabel();
  updateCartBadge();
}

/* ---- 10. FOOTER ---- */
function renderFooter() {
  const box = document.getElementById("site-footer");
  if (!box) return;
  const info = t => `<li><a ${pageAttrs("info")}>${t}</a></li>`;
  box.innerHTML = `
  <footer class="site-footer">
    <div class="container footer-grid">

      <div class="footer-col">
        <h4>Tổng đài hỗ trợ (minh họa)</h4>
        <ul class="footer-contact">
          <li>Mua hàng, bảo hành <b>1900 0000</b> <span>(8h00 - 21h30)</span></li>
          <li>Khiếu nại, góp ý <b>1900 0001</b> <span>(8h00 - 21h00)</span></li>
          <li>Email <b>hotro@greenphone.vn</b></li>
        </ul>

        <h4>Phương thức thanh toán</h4>
        <div class="pay-chips"><span>Tiền mặt (COD)</span><span>Chuyển khoản</span><span>Thanh toán online</span></div>

        <h4>Đăng ký nhận tin khuyến mãi</h4>
        <form class="news-form" id="newsletter-form" novalidate>
          <input type="email" class="input" id="news-email" placeholder="Nhập email của bạn" aria-label="Email nhận tin">
          <button type="submit" class="btn">Đăng ký</button>
        </form>
        <p class="footer-note">Nhận thông tin ưu đãi và sản phẩm mới (chức năng minh họa).</p>
      </div>

      <div class="footer-col">
        <h4>Thông tin về chính sách</h4>
        <ul class="footer-links">
          ${info("Mua hàng và thanh toán online")}
          ${info("Chính sách giao hàng")}
          ${info("Chính sách đổi trả")}
          ${info("Chính sách bảo hành")}
          ${info("Chính sách bảo mật thông tin")}
          <li><a ${pageAttrs("orders")}>Tra cứu đơn hàng</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Dịch vụ và thông tin khác</h4>
        <ul class="footer-links">
          ${info("Giới thiệu GreenPhone")}
          ${info("Hệ thống cửa hàng")}
          ${info("Câu hỏi thường gặp")}
          ${info("Liên hệ hợp tác")}
          ${info("Tuyển dụng")}
          <li><a ${pageAttrs("compare")}>So sánh sản phẩm</a></li>
          <li><a ${pageAttrs("cart")}>Giỏ hàng</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Kết nối với GreenPhone</h4>
        <div class="social">
          <a ${pageAttrs("info")} aria-label="YouTube" title="YouTube">▶</a>
          <a ${pageAttrs("info")} aria-label="Facebook" title="Facebook">f</a>
          <a ${pageAttrs("info")} aria-label="Instagram" title="Instagram">in</a>
          <a ${pageAttrs("info")} aria-label="TikTok" title="TikTok">♪</a>
          <a ${pageAttrs("info")} aria-label="Zalo" title="Zalo">Z</a>
        </div>
        <h4>Về dự án</h4>
        <p class="footer-note">Website bán điện thoại di động, được xây dựng trong khuôn khổ bài tập lớn môn Thiết kế Web. Chỉ có giao diện khách hàng, dữ liệu là dữ liệu mẫu.</p>
        <h4>Các module</h4>
        <div class="module-tags">
          <span>Tài khoản</span><span>Sản phẩm và tìm kiếm</span><span>Giỏ hàng và Thanh toán</span><span>Đơn hàng</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container footer-bottom-row">
        <span class="footer-brand"><span class="logo-mark">${ICON.leaf}</span>© 2026 GreenPhone - Bài tập lớn Thiết kế Web</span>
        <span>Thông tin liên hệ và dữ liệu sản phẩm chỉ mang tính minh họa.</span>
      </div>
    </div>
  </footer>`;

  /* Đăng ký nhận tin: chỉ kiểm tra email và báo thành công (chưa lưu đi đâu) */
  document.getElementById("newsletter-form").addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("news-email");
    if (!isValidEmail(input.value)) { input.classList.add("is-error"); showToast("Email chưa đúng định dạng", true); return; }
    input.classList.remove("is-error"); input.value = "";
    showToast("Đã đăng ký nhận tin khuyến mãi");
  });
}

/* ---- 11. NÚT HOTLINE GHIM Ở GÓC PHẢI DƯỚI (hiện ở mọi trang) ---- */
function renderFloatingContact() {
  if (document.querySelector(".float-contact")) return;
  const a = document.createElement("a");
  a.className = "float-contact";
  a.href = "tel:19000000";
  a.title = "Gọi hotline 1900 0000 (số minh họa)";
  a.setAttribute("aria-label", "Liên hệ hotline 1900 0000");
  a.innerHTML = ICON.headset + "<span>Liên hệ</span>";
  document.body.appendChild(a);
}

/* ---- 12. Liên kết trang chưa làm (url "#"): báo thuộc module nào ---- */
document.addEventListener("click", e => {
  const a = e.target.closest("a[data-page]");
  if (!a || a.getAttribute("href") !== "#") return;
  e.preventDefault();
  const p = PAGES[a.dataset.page];
  showToast(`${p.title} thuộc module ${p.module}, đang được xây dựng`);
});

document.addEventListener("DOMContentLoaded", () => {
  renderHeader(); renderFooter(); renderFloatingContact(); wireLinks();
});
