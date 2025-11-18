# Multi-stage build
FROM eclipse-temurin:21-jdk-jammy AS builder

# Thư mục làm việc cho build stage
WORKDIR /app

# Copy Maven wrapper và pom.xml trước
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (được cache nếu pom.xml không thay đổi)
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw clean package -DskipTests

# Production stage
FROM eclipse-temurin:21-jdk-jammy

# Thư mục làm việc bên trong container
WORKDIR /app

# Copy file .jar từ build stage
COPY --from=builder /app/target/*.jar app.jar

# Mở cổng 8081 (user service port)
EXPOSE 8081

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "/app/app.jar"]