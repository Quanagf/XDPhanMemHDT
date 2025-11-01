package com.evrental.users.service;

import com.evrental.users.dto.LoginRequest;
import com.evrental.users.dto.LoginResponse;
import com.evrental.users.dto.RegistrationRequest;
import com.evrental.users.model.User;
import org.springframework.web.multipart.MultipartFile; // <-- DÒNG BỊ THIẾU LÀ ĐÂY

public interface IUserService {
    
    // (Các hàm cũ: register, login, getProfile, verifyUser, banUser)
    User register(RegistrationRequest request);
    LoginResponse login(LoginRequest request);
    User getProfile(String email);
    User verifyUser(Long userId);
    User banUser(Long userId);

    /**
     * Upload tài liệu (GPLX/CMND) cho user.
     * @param email Email của user (lấy từ Token)
     * * @param file File được tải lên
     * @param documentType Loại tài liệu ("license" hoặc "idCard")
     * @return User đã được cập nhật
     */
    User uploadDocument(String email, MultipartFile file, String documentType);
}
