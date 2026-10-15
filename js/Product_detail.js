document.addEventListener("DOMContentLoaded", function () {
    // 1. Lấy id sản phẩm từ URL (ví dụ: Product_detail.html?id=iphone-15-pro-max)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const product = PRODUCTS.find(p => p.id === productId);

    const emptySection = document.getElementById("detail-empty");
    const detailSection = document.getElementById("product-detail");
    const specSection = document.getElementById("detail-spec-section");
    const descSection = document.getElementById("detail-description-section");

    // Kiểm tra mảng PRODUCTS có tồn tại không
    if (!Array.isArray(PRODUCTS)) {
        console.error("Không tìm thấy dữ liệu PRODUCTS.");
        if (emptySection) emptySection.hidden = false;
        return;
    }

    // 2. Tìm sản phẩm trong mảng dữ liệu
    

    if (!product) {
        // Không tìm thấy sản phẩm -> Hiển thị thông báo trống
        if (emptySection) emptySection.hidden = false;
        if (detailSection) detailSection.hidden = true;
        if (specSection) specSection.hidden = true;
        if (descSection) descSection.hidden = true;
        return;
    }

    // Tìm thấy sản phẩm -> Ẩn thông báo lỗi, hiện các vùng chứa nội dung
    if (emptySection) emptySection.hidden = true;
    if (detailSection) detailSection.hidden = false;
    if (specSection) specSection.hidden = false;
    if (descSection) descSection.hidden = false;

    // 3. Đổ dữ liệu lên các thành phần HTML
    const breadcrumbName = document.getElementById("detail-breadcrumb-name");
    if (breadcrumbName) breadcrumbName.textContent = product.name;

    const brandEl = document.getElementById("detail-brand");
    if (brandEl) brandEl.textContent = product.brand;

    const nameEl = document.getElementById("detail-name");
    if (nameEl) nameEl.textContent = product.name;

    const imgEl = document.getElementById("detail-image");
    if (imgEl) {
        imgEl.src = product.image || "";
        imgEl.alt = product.name;
    }

    const ratingEl = document.getElementById("detail-rating");
    if (ratingEl) ratingEl.textContent = Number(product.rating || 0).toFixed(1);

    const soldEl = document.getElementById("detail-sold");
    if (soldEl) soldEl.textContent = `Đã bán ${product.sold || 0}`;

    const shortDescEl = document.getElementById("detail-description-short");
    if (shortDescEl) shortDescEl.textContent = product.description;

    // Lấy thông tin phiên bản (variant) đầu tiên để hiển thị giá mặc định
    if (Array.isArray(product.variants) && product.variants.length > 0) {
        const variant = product.variants[0];
        const priceEl = document.getElementById("detail-price");
        const originalPriceEl = document.getElementById("detail-original-price");

        if (priceEl) {
            priceEl.textContent = Number(variant.price).toLocaleString("vi-VN") + " đ";
        }
        if (originalPriceEl && variant.originalPrice) {
            originalPriceEl.textContent = Number(variant.originalPrice).toLocaleString("vi-VN") + " đ";
        }
    }

    // Đổ thông số kỹ thuật (Specs)
    const specsContainer = document.getElementById("product-specs");
    if (specsContainer && product.specs) {
        specsContainer.innerHTML = Object.entries(product.specs)
            .map(([key, value]) => `<div class="spec-item"><span>${key}:</span> <strong>${value}</strong></div>`)
            .join("");
    }

    // Đổ mô tả chi tiết
    const descEl = document.getElementById("product-description");
    if (descEl) {
        descEl.textContent = product.description;
    }
});