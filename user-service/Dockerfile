# Sử dụng base image Java 17
FROM eclipse-temurin:17-jdk-jammy

# Thư mục làm việc bên trong container
WORKDIR /app

# Copy file .jar đã được build (từ thư mục /target) vào container
COPY target/*.jar app.jar

# Mở cổng 8080 mà service sẽ chạy
EXPOSE 8080

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "/app/app.jar"]