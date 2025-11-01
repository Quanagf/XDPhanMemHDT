# STAGE 1: Build ứng dụng React
FROM node:18-alpine as builder

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# STAGE 2: Serve ứng dụng bằng Nginx
FROM nginx:1.25-alpine

# Copy các file đã build từ stage 1
COPY --from=builder /app/build /usr/share/nginx/html

# XÓA config Nginx mặc định
RUN rm /etc/nginx/conf.d/default.conf

# COPY file config nginx.conf của chúng ta vào
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80 (cổng Nginx chạy)
EXPOSE 80

# Lệnh mặc định của Nginx là chạy web server
CMD ["nginx", "-g", "daemon off;"]