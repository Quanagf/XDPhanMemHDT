package com.evrental.booking.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
public class MinioService {

    private final MinioClient minioClient;
    private final String bucketName;
    private final String minioUrl;

    public MinioService(@Value("${minio.url}") String minioUrl,
                       @Value("${minio.access-key}") String accessKey,
                       @Value("${minio.secret-key}") String secretKey,
                       @Value("${minio.bucket-name}") String bucketName) {
        this.minioUrl = minioUrl;
        this.bucketName = bucketName;
        this.minioClient = MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(accessKey, secretKey)
                .build();
                
        // Tạo bucket nếu chưa tồn tại
        createBucketIfNotExists();
    }

    private void createBucketIfNotExists() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error creating Minio bucket: " + e.getMessage(), e);
        }
    }

    public String uploadFile(MultipartFile file, String folder) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Tạo tên file unique
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String fileName = folder + "/" + UUID.randomUUID().toString() + extension;

        try (InputStream inputStream = file.getInputStream()) {
            // Upload file to Minio
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

            // Return public URL
            return minioUrl + "/" + bucketName + "/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Error uploading file: " + e.getMessage(), e);
        }
    }
}