/* ==========================================================
   data/products.js - DỮ LIỆU SẢN PHẨM MẪU (TV2 sẽ bổ sung, giữ nguyên cấu trúc)
   Cấu trúc theo tài liệu thống nhất mục 7.3. Giá: VNĐ, đã gồm VAT.
   Đây là dữ liệu minh họa, không phải giá thật.
   ========================================================== */
const PRODUCTS = [
  { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", brand: "Apple", description: "Mẫu cao cấp của Apple.",
    image: "images/products/iphone-15-pro-max.jpg",
    specs: { screen: '6.7" OLED 120Hz', chip: "Apple A17 Pro", ram: "8GB", camera: "48MP + 12MP", battery: "4422 mAh", os: "iOS" },
    rating: 4.8, sold: 320, featured: true, releasedAt: "2023-09-22",
    variants: [
      { variantId: "IP15PM-256-TITAN", color: "Titan tự nhiên", storage: "256GB", price: 29590000, originalPrice: 34990000, stock: 12, image: "images/products/iphone-15-pro-max.jpg" },
      { variantId: "IP15PM-512-DEN", color: "Đen (ảnh minh họa)", storage: "512GB", price: 35990000, originalPrice: 40990000, stock: 5, image: "images/products/iphone-15.jpg" }
    ] },
  { id: "galaxy-s24-ultra", name: "Samsung Galaxy S24 Ultra", brand: "Samsung", description: "Flagship Android của Samsung.",
    image: "images/products/galaxy-s24-ultra.jpg",
    specs: { screen: '6.8" AMOLED 120Hz', chip: "Snapdragon 8 Gen 3", ram: "12GB", camera: "200MP + 50MP", battery: "5000 mAh", os: "Android" },
    rating: 4.7, sold: 280, featured: true, releasedAt: "2024-01-31",
    variants: [
      { variantId: "SS24U-256-XAM", color: "Xám titan", storage: "256GB", price: 27990000, originalPrice: 31990000, stock: 9, image: "images/products/galaxy-s24-ultra.jpg" },
      { variantId: "SS24U-512-DEN", color: "Tím titan", storage: "512GB", price: 31990000, originalPrice: 35990000, stock: 4, image: "images/products/galaxy-s24-ultra.jpg" }
    ] },
  { id: "xiaomi-14", name: "Xiaomi 14", brand: "Xiaomi", description: "Nhỏ gọn, cấu hình mạnh.",
    image: "images/products/xiaomi-14t-pro-blue.jpg",
    specs: { screen: '6.36" AMOLED 120Hz', chip: "Snapdragon 8 Gen 3", ram: "12GB", camera: "50MP x3", battery: "4610 mAh", os: "Android" },
    rating: 4.5, sold: 150, featured: true, releasedAt: "2024-03-01",
    variants: [
      { variantId: "XM14-256-DEN", color: "Xanh dương", storage: "256GB", price: 19990000, originalPrice: 22990000, stock: 10, image: "images/products/xiaomi-14t-pro-blue.jpg" },
      { variantId: "XM14-512-TRANG", color: "Vàng đồng", storage: "512GB", price: 22990000, originalPrice: 25990000, stock: 6, image: "images/products/xiaomi-redmi-note-14-pro-plus-vang.jpg" }
    ] },
  { id: "oppo-reno11", name: "OPPO Reno11", brand: "OPPO", description: "Chuyên chụp chân dung.",
    image: "images/products/oppo-reno-11-den.jpg",
    specs: { screen: '6.7" AMOLED 120Hz', chip: "Dimensity 7050", ram: "8GB", camera: "50MP + 32MP", battery: "5000 mAh", os: "Android" },
    rating: 4.4, sold: 210, featured: true, releasedAt: "2023-11-23",
    variants: [
      { variantId: "OP11-256-XANH", color: "Đen", storage: "256GB", price: 10490000, originalPrice: 10990000, stock: 20, image: "images/products/oppo-reno-11-den.jpg" },
      { variantId: "OP11-256-XAM", color: "Xám", storage: "256GB", price: 10490000, originalPrice: 10990000, stock: 0, image: "images/products/oppo-reno-11-xam-1-1.jpg" }
    ] },
  { id: "iphone-15", name: "iPhone 15", brand: "Apple", description: "Phiên bản tiêu chuẩn của dòng iPhone 15.",
    image: "images/products/iphone-15.jpg",
    specs: { screen: '6.1" OLED', chip: "Apple A16 Bionic", ram: "6GB", camera: "48MP + 12MP", battery: "3349 mAh", os: "iOS" },
    rating: 4.6, sold: 400, featured: false, releasedAt: "2023-09-22",
    variants: [
      { variantId: "IP15-128-HONG", color: "Đỏ rượu", storage: "128GB", price: 19990000, originalPrice: 22990000, stock: 15, image: "images/products/iphone-15-pro-max.jpg" },
      { variantId: "IP15-256-DEN", color: "Đen", storage: "256GB", price: 23490000, originalPrice: 26990000, stock: 8, image: "images/products/iphone-15.jpg" }
    ] },
  { id: "galaxy-a55", name: "Samsung Galaxy A55 5G", brand: "Samsung", description: "Tầm trung, pin bền.",
    image: "images/products/galaxy-a55.jpg",
    specs: { screen: '6.6" Super AMOLED 120Hz', chip: "Exynos 1480", ram: "8GB", camera: "50MP + 12MP", battery: "5000 mAh", os: "Android" },
    rating: 4.3, sold: 260, featured: false, releasedAt: "2024-03-11",
    variants: [
      { variantId: "SSA55-128-XANH", color: "Tím", storage: "128GB", price: 9990000, originalPrice: 10990000, stock: 18, image: "images/products/galaxy-a55.jpg" },
      { variantId: "SSA55-256-TIM", color: "Tím nhạt", storage: "256GB", price: 11490000, originalPrice: 12490000, stock: 7, image: "images/products/samsung-galaxy-a55-5g-tim-1.jpg" }
    ] },
  { id: "redmi-note-13", name: "Xiaomi Redmi Note 13", brand: "Xiaomi", description: "Giá tốt, màn hình đẹp.",
    image: "images/products/Redmi-note-13.jpg",
    specs: { screen: '6.67" AMOLED 120Hz', chip: "Snapdragon 685", ram: "8GB", camera: "108MP + 8MP", battery: "5000 mAh", os: "Android" },
    rating: 4.2, sold: 520, featured: false, releasedAt: "2024-01-15",
    variants: [
      { variantId: "RN13-128-DEN", color: "Trắng", storage: "128GB", price: 4990000, originalPrice: 5490000, stock: 30, image: "images/products/Redmi-note-13.jpg" },
      { variantId: "RN13-256-XANH", color: "Xanh", storage: "256GB", price: 5990000, originalPrice: 6490000, stock: 14, image: "images/products/Redmi-note-13-2.jpg" }
    ] },
  { id: "vivo-v30", name: "Vivo V30", brand: "Vivo", description: "Thiết kế mỏng nhẹ, camera selfie tốt.",
    image: "images/products/vivo-v30-xanh-1.jpg",
    specs: { screen: '6.78" AMOLED 120Hz', chip: "Snapdragon 7 Gen 3", ram: "12GB", camera: "50MP + 50MP", battery: "5000 mAh", os: "Android" },
    rating: 4.4, sold: 130, featured: false, releasedAt: "2024-03-07",
    variants: [
      { variantId: "VV30-256-XANH", color: "Xanh lá", storage: "256GB", price: 12990000, originalPrice: 13990000, stock: 11, image: "images/products/vivo-v30-xanh-1.jpg" },
      { variantId: "VV30-512-DEN", color: "Xanh dương", storage: "512GB", price: 14990000, originalPrice: 15990000, stock: 3, image: "images/products/vivo-v30-xanh-duong.jpg" }
    ] }
];
