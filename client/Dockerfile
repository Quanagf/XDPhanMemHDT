# Giai đoạn 1: Build ứng dụng React
# Sử dụng image Node.js 18 để build
FROM node:18 AS build

# Đặt thư mục làm việc
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ code React vào
COPY . .

# Build ứng dụng (tạo ra các file HTML/CSS/JS tĩnh)
RUN npm run build

# Giai đoạn 2: Serve (Phục vụ) ứng dụng
# Sử dụng Nginx (một web server nhẹ)
FROM nginx:stable-alpine

# Copy các file đã build từ Giai đoạn 1 vào thư mục web của Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Mặc định, Nginx chạy ở cổng 80
EXPOSE 80

# Lệnh để khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]