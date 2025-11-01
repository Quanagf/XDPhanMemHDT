package com.evrental.users.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    // Tiêm (inject) các giá trị từ application.properties
    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Bean // Tạo ra 1 Bean MinioClient
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint) // "http://minio:9000"
                .credentials(accessKey, secretKey) // "minioadmin", "minioadminpassword"
                .build();
    }
}