# Cấu Trúc CSS Đã Được Tổ Chức Lại

## Cấu Trúc Thư Mục Mới

```
src/styles/
├── main.css                    # File import chính - Import file này trong App.js
├── base/                       # CSS cơ sở
│   ├── variables.css          # Biến CSS toàn cục (colors, shadows, ...)
│   └── reset.css              # CSS reset và base styles
├── components/                 # CSS cho từng component
│   ├── top-green-bar.css      # Top green bar
│   ├── header.css             # Header và navigation
│   ├── hero.css               # Hero section và booking form
│   ├── featured-cars.css      # Featured cars section
│   ├── featured-locations.css # Featured locations section
│   ├── how-to-rent.css        # How to rent section
│   ├── footer.css             # Footer
│   ├── sections.css           # Shared section styles
│   ├── datetime-modal.css     # Datetime picker modal
│   └── login-modal.css        # Login/Register modal
├── pages/                      # CSS riêng cho từng trang
│   ├── home.css               # Trang chủ
│   ├── search.css             # Trang tìm kiếm
│   └── about.css              # Trang giới thiệu
└── utils/                      # CSS utilities
    ├── utilities.css          # Utility classes (spacing, colors, ...)
    └── responsive.css         # Media queries cho responsive design
```

## Thứ Tự Import trong main.css

1. **Base styles** (variables, reset) - Phải import đầu tiên
2. **Utilities** - Các class tiện ích
3. **Shared components** - Các style dùng chung
4. **Layout components** - Theo thứ tự từ trên xuống dưới trang
5. **Modal components** - Các modal
6. **Page-specific styles** - CSS riêng cho từng trang
7. **Responsive styles** - Phải import cuối cùng để override

## Cách Sử Dụng

### Import CSS trong React
Chỉ cần import `main.css` trong `App.js`:
```javascript
import './styles/main.css';
```

### Sửa Đổi CSS
- **Thay đổi màu sắc**: Sửa trong `base/variables.css`
- **Sửa component**: Tìm file tương ứng trong `components/`
- **Sửa trang cụ thể**: Tìm file trong `pages/`
- **Thêm responsive**: Sửa trong `utils/responsive.css`
- **Thêm utility class**: Sửa trong `utils/utilities.css`

### Ví dụ Sử Dụng Utility Classes
```html
<div class="d-flex justify-center align-center mt-4 mb-3">
  <h2 class="text-primary font-bold">Tiêu đề</h2>
</div>
```

## Lợi Ích Của Cấu Trúc Mới

1. **Dễ quản lý**: Mỗi component có file CSS riêng
2. **Dễ tìm kiếm**: Biết ngay file nào chứa CSS cần sửa
3. **Tránh xung đột**: CSS được tách riêng theo chức năng
4. **Dễ bảo trì**: Thay đổi 1 component không ảnh hưởng component khác
5. **Reusable**: Có thể tái sử dụng utility classes
6. **Responsive**: Media queries được tập trung trong 1 file

## Lưu Ý

- **Không xóa** các file CSS cũ (`style.css`, `about.css`, `Login.css`) cho đến khi test hoàn toàn
- **Thứ tự import** trong `main.css` rất quan trọng - không thay đổi
- **Variables** phải được import đầu tiên để các file khác sử dụng được
- **Responsive** phải import cuối để override các styles trước đó