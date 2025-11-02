# FEV React App

Đây là phiên bản React của website FEV - Dịch vụ thuê xe điện hàng đầu Việt Nam.

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
cd react-fev
npm install
```

### 2. Copy assets từ thư mục gốc
Bạn cần copy toàn bộ thư mục `assets` từ thư mục gốc vào `public/`:
```bash
# Từ thư mục gốc
cp -r assets "react-fev/public/"
```

### 3. Chạy ứng dụng
```bash
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3000

### 4. Build cho production
```bash
npm run build
```

## 📁 Cấu trúc dự án

```
react-fev/
├── public/
│   ├── assets/          # Images, icons (copy từ thư mục gốc)
│   └── index.html       # HTML template
├── src/
│   ├── components/      # React components
│   │   ├── Header.js
│   │   ├── Hero.js
│   │   ├── FeaturedCars.js
│   │   ├── FeaturedLocations.js
│   │   ├── HowToRent.js
│   │   └── Footer.js
│   ├── styles/
│   │   └── style.css    # CSS từ file gốc
│   ├── App.js           # Main app component
│   └── index.js         # Entry point
├── package.json
└── README.md
```

## ✨ Tính năng

- ✅ **100% giữ nguyên CSS**: Không thay đổi gì so với bản HTML gốc
- ✅ **Component hóa**: Chia thành các React components tái sử dụng
- ✅ **Responsive**: Hỗ trợ đầy đủ mobile và desktop  
- ✅ **SEO-friendly**: Meta tags và semantic HTML
- ✅ **Performance**: Lazy loading images, optimized assets

## 🔧 Các thay đổi từ HTML sang React

### HTML Attributes → JSX Props
- `class` → `className`
- `for` → `htmlFor`
- `aria-*` attributes giữ nguyên

### Components được tạo
1. **Header**: Logo, navigation, login button
2. **Hero**: Banner, search form
3. **FeaturedCars**: Danh sách xe nổi bật
4. **FeaturedLocations**: Địa điểm nổi bật  
5. **HowToRent**: Hướng dẫn thuê xe
6. **Footer**: Thông tin liên hệ, links, payment methods

### Data Structure
- Sử dụng arrays để render danh sách (cars, locations, steps)
- Có thể dễ dàng connect với API sau này

## 🎯 Lợi ích của phiên bản React

1. **Maintainability**: Code được tổ chức tốt hơn
2. **Reusability**: Components có thể tái sử dụng
3. **Scalability**: Dễ dàng thêm tính năng mới
4. **State Management**: Sẵn sàng cho các tính năng dynamic
5. **Developer Experience**: Hot reload, debugging tools

## 📝 TODO - Tính năng có thể thêm

- [ ] React Router cho navigation
- [ ] State management (Redux/Context)
- [ ] Form validation
- [ ] API integration
- [ ] Search functionality
- [ ] User authentication
- [ ] Shopping cart
- [ ] Real-time notifications

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request