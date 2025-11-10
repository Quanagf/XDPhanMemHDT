package com.evrental.users.service;

import org.springframework.web.multipart.MultipartFile;

public interface IFileStorageService {

    /**
     * Upload 1 file lên Minio và trả về URL của file đó.
     *
     * @param file Đối tượng MultipartFile (file được gửi lên)
     * @param objectName Tên file sẽ được lưu (ví dụ: "license-123.jpg")
     * @return URL đầy đủ của file đã upload
     */
    String uploadFile(MultipartFile file, String objectName);
    
    
    // (Chúng ta cũng có thể thêm hàm xóa file, v.v.)
}