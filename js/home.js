/* ==========================================================
   home.js - Logic riêng của trang chủ.
   Dữ liệu sản phẩm lấy từ PRODUCTS (data/products.js).
   Dùng addToCart(), formatPrice() trong common.js.
   ========================================================== */

/* ---------- THEME CHUNG TOÀN WEBSITE: nguồn điều khiển duy nhất ---------- */
(function greenPhoneThemeController() {
  const KEY = "theme";
  const readTheme = () => { try { const value = JSON.parse(localStorage.getItem(KEY)); if (value === "dark" || value === "light") return value; } catch (_) {} try { return localStorage.getItem("greenphone-theme") === "dark" ? "dark" : "light"; } catch (_) { return "light"; } };
  function applyGreenPhoneTheme(theme) {
    const value = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = value;
    document.body?.classList.toggle("theme-dark", value === "dark");
    try { localStorage.setItem(KEY, JSON.stringify(value)); localStorage.setItem("greenphone-theme", value); } catch (_) {}
    document.querySelectorAll("#theme-toggle, #accountThemeToggle, #registerModalThemeToggle, .register-modal-theme-toggle").forEach(button => {
      const dark = value === "dark";
      button.setAttribute("aria-label", dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
      button.title = dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối";
      if (button.id === "accountThemeToggle" || button.id === "registerModalThemeToggle" || button.classList.contains("register-modal-theme-toggle")) {
        button.innerHTML = dark ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.6 8.6 0 1 0 20.2 15.2Z"/></svg>';
      }
    });
    // Đồng bộ iframe đăng ký nếu đang mở.
    const frame = document.getElementById("accountRegisterFrame");
    try { if (frame?.contentDocument?.documentElement) { frame.contentDocument.documentElement.dataset.theme = value; frame.contentDocument.body?.classList.toggle("theme-dark", value === "dark"); } } catch (_) {}
  }
  window.applyGreenPhoneTheme = applyGreenPhoneTheme;
  window.toggleGreenPhoneTheme = () => applyGreenPhoneTheme(readTheme() === "dark" ? "light" : "dark");
  document.addEventListener("DOMContentLoaded", () => {
    applyGreenPhoneTheme(readTheme());
    document.addEventListener("click", event => {
      const button = event.target.closest("#theme-toggle, #accountThemeToggle, #registerModalThemeToggle, .register-modal-theme-toggle");
      if (button) { event.preventDefault(); window.toggleGreenPhoneTheme(); }
    });
  }, { once: true });
})();

/* ---------- Tiện ích ---------- */

/* Biến thể mặc định: biến thể còn hàng đầu tiên (nếu hết thì lấy biến thể đầu) */
function getDefaultVariant(product) {
  return product.variants.find(v => v.stock > 0) || product.variants[0];
}
function discountOf(product) {
  const v = getDefaultVariant(product);
  return v.originalPrice > v.price ? Math.round((1 - v.price / v.originalPrice) * 100) : 0;
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}

/* HTML một thẻ sản phẩm.
   opts.flash = { sold, quota } -> thêm thanh "Đã bán x/y suất"
   opts.noCart = true           -> không có nút thêm giỏ (suất chưa mở bán) */
function productCardHtml(p, opts = {}) {
  const v = getDefaultVariant(p);
  const discount = discountOf(p);
  const soldOut = v.stock <= 0;
  const flash = opts.flash
    ? `<div class="home-flash-sold">Đã bán ${opts.flash.sold}/${opts.flash.quota} suất
         <div class="home-progress"><span style="width:${Math.round(opts.flash.sold / opts.flash.quota * 100)}%"></span></div>
       </div>`
    : `<div class="home-product-rating" aria-label="Đánh giá ${p.rating} trên 5"><i data-lucide="star"></i><span>${p.rating} (${p.sold} đã bán)</span></div>`;
  const cartBtn = opts.noCart ? "" :
    `<button class="btn btn-primary" data-variant="${v.variantId}" ${soldOut ? "disabled" : ""} aria-label="${soldOut ? "Hết hàng" : `Thêm ${p.name} vào giỏ`}">${soldOut ? "Hết hàng" : '<i data-lucide="shopping-bag"></i>'}</button>`;
  return `
  <article class="home-product">
    ${discount ? `<span class="badge home-product-badge">-${discount}%</span>` : ""}
    <a class="home-product-img" ${pageAttrs("productDetail", "?id=" + p.id)}>
      <img src="${p.image}" alt="${p.name}" loading="lazy">
    </a>
    <div class="home-product-body">
      <span class="home-product-brand">${p.brand}</span>
      <h3><a ${pageAttrs("productDetail", "?id=" + p.id)}>${p.name}</a></h3>
      <div class="home-product-spec">${v.storage} | RAM ${p.specs.ram}</div>
      <div class="home-product-price">
        <span class="price">${formatPrice(v.price)}</span>
        ${discount ? `<span class="home-product-old">${formatPrice(v.originalPrice)}</span>` : ""}
      </div>
      ${flash}
      <div class="home-product-actions ${opts.noCart ? "single" : ""}">
        <a class="btn btn-outline" ${pageAttrs("productDetail", "?id=" + p.id)}>Chi tiết <i data-lucide="arrow-up-right"></i></a>
        ${cartBtn}
      </div>
    </div>
  </article>`;
}

function renderList(containerId, list, opts) {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.innerHTML = list.length
    ? list.map(p => productCardHtml(p, opts)).join("")
    : '<div class="home-empty"><div><i data-lucide="package-search"></i><p>Chưa có sản phẩm phù hợp.</p></div></div>';
  refreshIcons();
}

/* ---------- 1. BANNER SẢN PHẨM NỔI BẬT ----------
   Tự chuyển slide sau mỗi 3 giây bằng timer, không hiển thị bộ điều khiển bên dưới. */
const HERO_IDS = ["iphone-15-pro-max", "galaxy-s24-ultra", "xiaomi-14", "oppo-reno11", "vivo-v30"];   // đổi / thêm id sản phẩm tại đây
const HERO_INTERVAL = 3000;
let heroIndex = 0, heroSlides = [], heroTimer = null;

function heroSlideHtml(p, i, total) {
  const v = getDefaultVariant(p), d = discountOf(p), sp = p.specs;
  const link = pageAttrs("productDetail", "?id=" + p.id);
  return `
  <article class="home-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${total}">
    <span class="home-slide-mark" aria-hidden="true">${p.brand}</span>
    <div class="home-slide-stage">
      <a class="home-slide-media" ${link} tabindex="-1" aria-hidden="true"><img src="${p.image}" alt="${p.name}" ${i === 0 ? 'fetchpriority="high"' : ""}></a>
    </div>
    <div class="home-slide-info">
      <div class="home-slide-tags"><span class="home-slide-brand">${p.brand}</span>${d ? `<span class="home-slide-off">-${d}%</span>` : ""}</div>
      <h3>${p.name}</h3>
      <p class="home-slide-tagline">${p.description}</p>
      <ul class="home-slide-specs">
        <li><i data-lucide="cpu"></i>${sp.chip}</li>
        <li><i data-lucide="camera"></i>${sp.camera}</li>
        <li><i data-lucide="battery-full"></i>${sp.battery}</li>
      </ul>
      <div class="home-slide-price"><strong>${formatPrice(v.price)}</strong>${d ? `<s>${formatPrice(v.originalPrice)}</s>` : ""}</div>
      <a class="btn btn-primary" ${link}>Xem chi tiết <i data-lucide="arrow-right"></i></a>
    </div>
  </article>`;
}

function renderHero() {
  const banner = document.getElementById("hero-banner");
  if (!banner) return;
  const list = HERO_IDS.map(findProduct).filter(Boolean);
  if (!list.length) return;
  banner.innerHTML = list.map((p, i) => heroSlideHtml(p, i, list.length)).join("");
  heroSlides = [...banner.querySelectorAll(".home-slide")];
  heroGo(0, 1, true);
  refreshIcons();

  /* Tự chuyển đúng mỗi 3 giây, không hiển thị chấm/thanh tiến trình hay nút điều khiển. */
  clearInterval(heroTimer);
  heroTimer = setInterval(() => heroGo(heroIndex + 1, 1), HERO_INTERVAL);

  /* Phím mũi tên khi đang focus trong banner */
  banner.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") { heroGo(heroIndex + 1, 1); }
    else if (e.key === "ArrowLeft") { heroGo(heroIndex - 1, -1); }
  });

  /* Vuốt ngang trên điện thoại */
  let startX = null;
  banner.addEventListener("pointerdown", e => { startX = e.clientX; });
  banner.addEventListener("pointerup", e => {
    if (startX === null) return;
    const dx = e.clientX - startX; startX = null;
    if (Math.abs(dx) > 50) heroGo(heroIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  banner.addEventListener("pointercancel", () => { startX = null; });
}

/* Chuyển tới slide n. dir = 1: slide mới trượt vào từ phải, -1: từ trái */
function heroGo(n, dir = 1, instant = false) {
  const total = heroSlides.length;
  const next = (n + total) % total;
  const banner = document.getElementById("hero-banner");
  banner.style.setProperty("--dir", dir);
  if (!instant && next !== heroIndex) {
    const old = heroSlides[heroIndex];
    old.classList.remove("is-active");
    old.classList.add("is-leaving");
    old.setAttribute("aria-hidden", "true");
    setTimeout(() => old.classList.remove("is-leaving"), 800);
  }
  heroIndex = next;
  const cur = heroSlides[next];
  cur.classList.remove("is-leaving");
  cur.classList.add("is-active");
  cur.removeAttribute("aria-hidden");
}

/* ---------- 2. FLASH SALE ----------
   Mỗi suất diễn ra từ 20h đến 22h:
   - trước 20h  -> "Bắt đầu sau" (đếm ngược tới 20h), chưa mở bán
   - 20h - 22h  -> "Kết thúc sau" (đếm ngược tới 22h)
   - sau 22h    -> "Đã kết thúc"
   Số suất và số đã bán là dữ liệu minh họa. */
const FLASH_START_HOUR = 20, FLASH_END_HOUR = 22;
const FLASH_SLOTS = [
  { label: "20h - 22h hôm nay", dayOffset: 0, items: [
    { id: "redmi-note-13", quota: 50, sold: 34 }, { id: "galaxy-a55", quota: 30, sold: 12 },
    { id: "oppo-reno11", quota: 40, sold: 27 },   { id: "iphone-15", quota: 20, sold: 5 } ] },
  { label: "20h - 22h ngày mai", dayOffset: 1, items: [
    { id: "xiaomi-14", quota: 30, sold: 0 },        { id: "vivo-v30", quota: 30, sold: 0 },
    { id: "galaxy-s24-ultra", quota: 20, sold: 0 }, { id: "iphone-15-pro-max", quota: 20, sold: 0 } ] }
];
let flashIndex = 0;
let flashStatus = null;   // trạng thái đang hiển thị, đổi thì vẽ lại

function slotState(i) {
  const now = new Date();
  const start = new Date(); start.setDate(start.getDate() + FLASH_SLOTS[i].dayOffset); start.setHours(FLASH_START_HOUR, 0, 0, 0);
  const end = new Date(start); end.setHours(FLASH_END_HOUR, 0, 0, 0);
  if (now < start) return { status: "upcoming", target: start, label: "Bắt đầu sau" };
  if (now < end)   return { status: "live",     target: end,   label: "Kết thúc sau" };
  return { status: "ended", target: end, label: "Đã kết thúc" };
}

function renderFlash() {
  const st = slotState(flashIndex);
  flashStatus = st.status;
  document.getElementById("flash-slots").innerHTML = FLASH_SLOTS.map((s, i) =>
    `<button type="button" class="home-slot ${i === flashIndex ? "active" : ""}" data-slot="${i}">${s.label}</button>`).join("");
  const list = FLASH_SLOTS[flashIndex].items.map(it => ({ p: findProduct(it.id), it })).filter(x => x.p);
  document.getElementById("flash-products").innerHTML = list
    .map(x => productCardHtml(x.p, { flash: { sold: x.it.sold, quota: x.it.quota }, noCart: flashIndex > 0 })).join("");
  tickTimer();
  refreshIcons();
}

function tickTimer() {
  const st = slotState(flashIndex);
  if (st.status !== flashStatus) return renderFlash();   // vừa chuyển trạng thái (vd: đến 20h)
  const sec = st.status === "ended" ? 0 : Math.max(0, Math.floor((st.target - new Date()) / 1000));
  const pad = n => String(n).padStart(2, "0");
  document.getElementById("timer-label").textContent = st.label;
  document.getElementById("t-h").textContent = pad(Math.floor(sec / 3600));
  document.getElementById("t-m").textContent = pad(Math.floor(sec % 3600 / 60));
  document.getElementById("t-s").textContent = pad(sec % 60);
}

/* ---------- 3. BA TAB ---------- */
const TAB_RULES = {
  deal: list => [...list].sort((a, b) => discountOf(b) - discountOf(a)),   // giảm sâu nhất
  hot:  list => [...list].sort((a, b) => b.sold - a.sold),                 // bán chạy nhất
  new:  list => [...list].sort((a, b) => b.releasedAt.localeCompare(a.releasedAt)) // mới nhất
};
function renderTab(name) {
  document.querySelectorAll(".home-tab").forEach(t => {
    const active = t.dataset.tab === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", String(active));
  });
  renderList("tab-products", TAB_RULES[name](PRODUCTS).slice(0, 4));
}

/* ---------- 4. DANH MỤC ĐIỆN THOẠI (lọc theo hãng) ---------- */
const PHONE_NEEDS = [
  { label: "Điện thoại pin trâu", icon: "battery-charging", product: "galaxy-a55" },
  { label: "Điện thoại 5G", icon: "signal", product: "vivo-v30" },
  { label: "Điện thoại chụp ảnh đẹp", icon: "camera", product: "oppo-reno11" },
  { label: "Điện thoại gập", icon: "smartphone", product: "iphone-15-pro-max" },
  { label: "Điện thoại AI", icon: "sparkles", product: "galaxy-s24-ultra" },
  { label: "Điện thoại phổ thông", icon: "phone", product: "redmi-note-13" }
];

function renderPhoneNeeds() {
  const el = document.getElementById("phone-needs");
  if (!el) return;
  el.innerHTML = PHONE_NEEDS.map(item => {
    const p = findProduct(item.product) || PRODUCTS[0];
    return `<button type="button" class="home-need" data-need="${item.product}">
      <span class="home-need-thumb"><img src="${p.image}" alt=""></span>
      <span class="home-need-label"><i data-lucide="${item.icon}"></i>${item.label}</span>
    </button>`;
  }).join("");
}

function setupCatalogCarousels() {
  document.querySelectorAll(".home-catalog-row[data-carousel]").forEach(row => {
    const viewport = row.querySelector(".home-catalog-scroll");
    const prev = row.querySelector("[data-carousel-prev]");
    const next = row.querySelector("[data-carousel-next]");
    if (!viewport || !prev || !next || row.dataset.carouselReady === "1") return;
    row.dataset.carouselReady = "1";

    const update = () => {
      const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const x = viewport.scrollLeft;
      prev.hidden = max <= 2 || x <= 2;
      next.hidden = max <= 2 || x >= max - 2;
    };
    const step = () => Math.max(220, Math.round(viewport.clientWidth * .72));
    prev.addEventListener("click", () => viewport.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => viewport.scrollBy({ left: step(), behavior: "smooth" }));
    viewport.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  });
}

function renderPhones(brand = "all") {
  const brands = [...new Set(PRODUCTS.map(p => p.brand))];
  document.getElementById("home-pills").innerHTML = ["all", ...brands].map(b =>
    `<button type="button" class="home-pill ${b === brand ? "active" : ""}" data-brand="${b}">${b === "all" ? "Tất cả" : b}</button>`).join("");
  renderList("phone-products", brand === "all" ? PRODUCTS : PRODUCTS.filter(p => p.brand === brand));
  requestAnimationFrame(() => { setupCatalogCarousels(); refreshIcons(); });
}

/* ---------- Khởi tạo ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // home.js cũng cung cấp bộ giao diện chung cho các trang khác; chỉ chạy phần dựng trang chủ tại index.html.
  if (!document.getElementById("hero-banner")) return;
  if (typeof PRODUCTS === "undefined") {
    const hb = document.getElementById("hero-banner");
    if (hb) hb.innerHTML = '<div class="home-empty"><div><i data-lucide="circle-alert"></i><p>Không thể tải dữ liệu sản phẩm.</p></div></div>';
    document.querySelectorAll(".home-skeleton-grid").forEach(box => {
      box.innerHTML = '<div class="home-empty"><div><i data-lucide="circle-alert"></i><p>Không thể tải dữ liệu sản phẩm.</p></div></div>';
    });
    return refreshIcons();
  }

  renderHero();
  renderFlash();
  renderTab("deal");
  renderPhoneNeeds();
  renderPhones();
  setInterval(tickTimer, 1000);
  refreshIcons();

  /* Một chỗ lắng nghe cho mọi nút trong trang (event delegation) */
  document.querySelector(".main").addEventListener("click", e => {
    const cart = e.target.closest("button[data-variant]");
    if (cart) return addToCart(cart.dataset.variant, 1);
    const slot = e.target.closest("[data-slot]");
    if (slot) { flashIndex = Number(slot.dataset.slot); return renderFlash(); }
    const tab = e.target.closest("[data-tab]");
    if (tab) return renderTab(tab.dataset.tab);
    const pill = e.target.closest("[data-brand]");
    if (pill) return renderPhones(pill.dataset.brand);
    const need = e.target.closest("[data-need]");
    if (need) {
      const product = findProduct(need.dataset.need);
      if (product) {
        const brand = product.brand;
        return renderPhones(brand);
      }
    }
  });
});
