package com.evrental.users.service;

import java.util.Map;

import com.evrental.users.dto.LoginRequest;
import com.evrental.users.dto.LoginResponse;
import com.evrental.users.dto.RegistrationRequest;
import com.evrental.users.dto.UpdateProfileRequest;
import com.evrental.users.model.User;

public interface IUserService {
    
    // (Các hàm cũ: register, login, getProfile, verifyUser, banUser)
    User register(RegistrationRequest request);
    LoginResponse login(LoginRequest request);
    User getProfile(String username);  // Đổi từ email sang username
    User findById(Long userId);  // Tìm user theo ID
    User verifyUser(Long userId);
    User banUser(Long userId);

    public Map<String, Boolean> checkDuplicateFields(String email, String username, String phoneNumber);

    public User save(User user);
    public User getCurrentUser();
    

    /**
     * Cập nhật thông tin profile của user.
     * @param username Username của user (lấy từ Token)
     * @param request Thông tin cần cập nhật
     * @return User đã được cập nhật
     */
    User updateProfile(String username, UpdateProfileRequest request);

    /**
     * Cập nhật User object trực tiếp (dùng cho upload avatar).
     * @param username Username của user
     * @param user User object đã được cập nhật
     * @return User đã được lưu
     */
    User updateProfile(String username, User user);

    /**
     * Admin tạo tài khoản Staff.
     * @param request Thông tin đăng ký Staff
     * @return User Staff đã được tạo
     */
    User createStaffAccount(RegistrationRequest request);

    /**
     * Admin thay đổi role của user.
     * @param userId ID của user cần thay đổi role
     * @param newRole Role mới (ADMIN, STAFF, RENTER)
     * @return User đã được cập nhật
     */
    User updateUserRole(Long userId, String newRole);

    /**
     * Admin cập nhật trạm cho user (chỉ STAFF).
     * @param userId ID của user cần cập nhật trạm
     * @param stationId ID trạm mới (null để xóa trạm)
     * @return User đã được cập nhật
     */
    User updateUserStation(Long userId, Long stationId);

    /**
     * Admin lấy danh sách tất cả user.
     * @return List các User
     */
    java.util.List<User> getAllUsers();

    public void changePassword(String username, String currentPassword, String newPassword);

    /**
     * Xác thực mật khẩu của user.
     * @param username Username của user
     * @param password Mật khẩu cần xác thực
     * @return true nếu mật khẩu đúng, false nếu sai
     */
    boolean verifyPassword(String username, String password);

    /**
     * Xóa tài khoản của user.
     * @param username Username của user cần xóa
     */
    void deleteAccount(String username);
}
