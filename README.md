# GreenPhone - Website bán điện thoại (Bài tập lớn Thiết kế Web)

Giao diện phía khách hàng, HTML + CSS + JavaScript thuần, dữ liệu lưu bằng localStorage (không backend).
Chạy thử: mở thư mục bằng VS Code, bấm chuột phải `index.html` rồi chọn **Open with Live Server**.

## Phân công

| Người | Module | Trang | File riêng |
|---|---|---|---|
| Đội trưởng | Khung chung, trang chủ | `index.html` | `css/base.css`, `css/home.css`, `js/common.js`, `js/home.js` |
| TV1 | Tài khoản | `login`, `register`, `forgot-password`, `account` | `css/account.css`, `js/account.js` |
| TV2 | Sản phẩm, tìm kiếm | `products`, `product-detail`, `compare` | `css/product.css`, `js/product.js`, `data/products.js` |
| TV3 | Giỏ hàng, Thanh toán | `cart`, `checkout`, `order-success` | `css/cart.css`, `js/cart.js` |
| TV4 | Đơn hàng | `orders`, `order-detail` | `css/order.css`, `js/order.js` |

## Quy tắc làm việc

1. Mỗi người một nhánh: `feature/account`, `feature/product`, `feature/cart`, `feature/order`. Gộp vào `main` bằng pull request.
2. Hạn chế sửa `css/base.css`, `js/common.js`. Phần nội dung footer có thể tự chỉnh tại `data/footer.js`; header/footer vẫn dùng chung.
3. Mỗi trang đã có sẵn khung (header, footer, nhúng CSS/JS). Chỉ viết trong vùng "NỘI DUNG RIÊNG CỦA TRANG".
4. Class CSS riêng có tiền tố module: `acc-`, `prod-`, `cart-`, `ord-`. Dùng lại `.btn`, `.input`, `.card`, `.badge`, `.grid-*` trong `base.css`.
5. Biến và hàm JavaScript dùng camelCase. Khóa localStorage luôn dùng `KEYS` trong `common.js`.
6. Tên file chữ thường, không dấu, nối bằng gạch ngang.
7. Trước khi nộp: kiểm tra 3 mức màn hình (từ 900px, 641-900px, tối đa 640px), không có lỗi trong console, mọi link và nút chạy đúng.

## Hàm dùng chung trong `js/common.js`

`load`, `save`, `KEYS`, `getCurrentUser`, `isLoggedIn`, `logout`, `requireLogin`, `getCart`, `cartCount`, `updateCartBadge`,
`findProduct`, `findVariant`, `addToCart`, `formatPrice`, `showToast`.
Còn thiếu và sẽ bổ sung theo tài liệu thống nhất: `createOrder`, `cancelOrder`, `getUserOrders`, các hàm kiểm tra dữ liệu nhập.


### Chỉnh thông tin footer
- Mở `data/footer.js`.
- Chỉnh số điện thoại, email, phương thức thanh toán, nội dung đăng ký, chính sách, dịch vụ, mô tả dự án và các module tại `FOOTER_DATA`.
- Không cần sửa `js/common.js` nếu chỉ thay đổi nội dung.
