package com.evrental.vehicles.service;

import org.springframework.web.multipart.MultipartFile;

public interface IFileStorageService {

    /**
     * Upload a file to Minio and return its public URL.
     */
    String uploadFile(MultipartFile file, String objectName);

    /**
     * Delete a file from storage.
     */
    void deleteFile(String objectName);

}
