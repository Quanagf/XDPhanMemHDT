package com.evrental.vehicles.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.SetBucketPolicyArgs;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.InputStream;

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
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            String policyJson = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"*\"},\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::" + bucketName + "/*\"]}]}";
            minioClient.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucketName).config(policyJson).build());

        } catch (Exception e) {
            throw new RuntimeException("Cannot init Minio bucket", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String objectName) {
        if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024) { // 10MB limit
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File invalid (empty or too large)");
        }
        try (InputStream in = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(in, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            String external = endpoint.replace("minio", "localhost");
            return external + "/" + bucketName + "/" + objectName;

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed", e);
        }
    }

    @Override
    public void deleteFile(String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).object(objectName).build());
        } catch (Exception e) {
            // log and ignore
            System.err.println("Failed to delete file " + objectName + ": " + e.getMessage());
        }
    }
}
