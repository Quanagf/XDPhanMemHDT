package com.evrental.users.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import io.minio.SetBucketPolicyArgs;

import java.io.InputStream; // <-- DÒNG BỊ THIẾU LÀ ĐÂY

@Service
@RequiredArgsConstructor
public class MinioFileStorageService implements IFileStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.endpoint}")
    private String endpoint;

    @PostConstruct
    private void init() {
        try {
            boolean found = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build()
            );
            if (!found) {
                minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucketName).build()
                );
                System.out.println("Minio bucket '" + bucketName + "' created successfully.");
            } else {
                System.out.println("Minio bucket '" + bucketName + "' already exists.");
            }
            // THÊM LOGIC ĐẶT POLICY PUBLIC READ TẠI ĐÂY
            String policyJson = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"*\"},\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::" + bucketName + "/*\"]}]}";
            
            minioClient.setBucketPolicy(
                SetBucketPolicyArgs.builder().bucket(bucketName).config(policyJson).build()
            );
            System.out.println("Minio bucket policy set to Public Read.");
            // KẾT THÚC LOGIC POLICY
        } catch (Exception e) {
            throw new RuntimeException("Không thể khởi tạo Minio bucket", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String objectName) {
        if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024) { // Giới hạn 5MB
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File không hợp lệ (quá lớn hoặc rỗng)");
        }
        
        // Dòng 55 của bạn, giờ 'InputStream' đã được import
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            // Tạm thời hard-code localhost:9000 cho URL bên ngoài
            String externalEndpoint = endpoint.replace("minio", "localhost");
            return externalEndpoint + "/" + bucketName + "/" + objectName;

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi upload file", e);
        }
    }
}
