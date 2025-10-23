# Sử dụng base image Java 17
FROM openjdk:17-slim

# Trỏ đến file .jar sẽ được tạo ra khi build
ARG JAR_FILE=target/*.jar

# Copy file .jar vào bên trong image
COPY ${JAR_FILE} app.jar

# Chạy ứng dụng khi container khởi động
ENTRYPOINT ["java", "-jar", "/app.jar"]