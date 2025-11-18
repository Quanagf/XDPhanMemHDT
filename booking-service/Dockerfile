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
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]