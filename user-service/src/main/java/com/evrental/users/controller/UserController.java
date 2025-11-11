package com.evrental.users.controller;

import java.security.Principal;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping; // <-- IMPORT MỚI
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; // <-- IMPORT MỚI
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.evrental.users.dto.ChangePasswordRequest;
import com.evrental.users.dto.LoginRequest;
import com.evrental.users.dto.LoginResponse;
import com.evrental.users.dto.RegistrationRequest;
import com.evrental.users.dto.UpdateProfileRequest;
import com.evrental.users.model.User;
import com.evrental.users.service.IUserService;
import com.evrental.users.repository.UserRepository;

import jakarta.validation.Valid;

import com.evrental.users.service.IFileStorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    // Chỉ inject (tiêm) Service Interface
    private final IUserService userService;
    private final IFileStorageService fileStorageService;



    @GetMapping("/ping")
    public String ping() {
        return "User-Service (Spring Boot) is alive!";
    }

    // === API ĐĂNG KÝ (1.a) ===
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegistrationRequest request) {
        
        try{
            userService.register(request);
            return ResponseEntity.ok("Đăng ký thành công!");
        } catch (Exception e) {
        return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    // === API ĐĂNG NHẬP ===
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    // === API LẤY THÔNG TIN CÁ NHÂN (1.a) ===
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Yêu cầu xác thực
    public ResponseEntity<User> getMyProfile(Principal principal) {
        String username = principal.getName();  // Lấy username từ JWT token
        return ResponseEntity.ok(userService.getProfile(username));
    }

    // === API CẬP NHẬT THÔNG TIN CÁ NHÂN ===
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Yêu cầu xác thực
    public ResponseEntity<User> updateMyProfile(
                // 1. Thêm @Valid để kích hoạt các ràng buộc trong DTO
                @Valid @RequestBody UpdateProfileRequest request, 
                Principal principal) {
            
            String username = principal.getName();  // Lấy username từ JWT token
            
            // 2. Gọi service. Lưu ý: Service giờ sẽ trả về UserProfileResponse
            User updatedProfile = userService.updateProfile(username, request);
            
            // 3. Trả về DTO, không phải Entity User
            return ResponseEntity.ok(updatedProfile);
        }
    // === API XÁC THỰC USER (2.b) ===
    @PutMapping("/verify/{userId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')") // Yêu cầu quyền
    public ResponseEntity<String> verifyUser(@PathVariable Long userId) {
        userService.verifyUser(userId);
        return ResponseEntity.ok("User " + userId + " đã được xác thực.");
    }

    // === API BAN USER (3.b) ===
    @PutMapping("/ban/{userId}")
    @PreAuthorize("hasRole('ADMIN')") // Yêu cầu quyền
    public ResponseEntity<String> banUser(@PathVariable Long userId) {
        userService.banUser(userId);
        return ResponseEntity.ok("User " + userId + " đã bị cấm.");
    }


    @PostMapping("/upload/{uploadType}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> handleFileUpload(
            @PathVariable("uploadType") String uploadType, 
            @RequestParam("file") MultipartFile file) {
        
        // 1. Lấy thông tin user hiện tại
        User currentUser = userService.getCurrentUser(); 
        
        // 2. TẠO TÊN FILE DUY NHẤT (objectName)
        // Cách tốt nhất là tạo một "đường dẫn" ảo để quản lý file
        // Cấu trúc: [loại_file]/[userId]/[UUID]-[tên_file_gốc]
        // Ví dụ: "license/123/a1b2c3d4-e5f6-abc.jpg"
        
        String originalFileName = file.getOriginalFilename();
        String uniqueFileName = UUID.randomUUID().toString() + "-" + originalFileName;
        
        // objectName sẽ là đường dẫn đầy đủ trên MinIO
        String objectName = uploadType + "/" + currentUser.getId() + "/" + uniqueFileName;

        // 3. Gọi service upload với 2 tham số
        String fileUrl = fileStorageService.uploadFile(file, objectName); 

        // 4. Cập nhật URL vào đối tượng user
        if ("license".equals(uploadType)) {
            currentUser.setLicenseImage(fileUrl); 
        } else if ("identity".equals(uploadType)) {
            currentUser.setIdentityImage(fileUrl); 
        } else {
            // Bạn nên có xử lý cho trường hợp uploadType không hợp lệ
             return ResponseEntity.badRequest().build(); // Hoặc throw exception
        }
        
        // 5. Lưu user đã cập nhật vào DB
        User updatedUser = userService.save(currentUser); 
        
        return ResponseEntity.ok(updatedUser);
    }

    // === API ADMIN TẠO TÀI KHOẢN STAFF ===
    @PostMapping("/admin/create-staff")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN mới được gọi
    public ResponseEntity<User> createStaffAccount(@RequestBody RegistrationRequest request) {
        User newStaff = userService.createStaffAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newStaff);
    }

    // === API ADMIN THAY ĐỔI ROLE USER ===
    @PutMapping("/admin/update-role/{userId}")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN mới được gọi
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long userId,
            @RequestParam String role) {
        User updatedUser = userService.updateUserRole(userId, role);
        return ResponseEntity.ok(updatedUser);
    }

    // === API ADMIN LẤY DANH SÁCH TẤT CẢ USER ===
    @GetMapping("/admin/all-users")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN mới được gọi
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Kiểm tra Username, Email và Số điện thoại có trùng không?
    @GetMapping("/check-duplicate")
    public ResponseEntity<Map<String, Boolean>> checkDuplicate(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String phoneNumber) {

        Map<String, Boolean> result = userService.checkDuplicateFields(email, username, phoneNumber);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            // 1. Lấy JSON body và map vào DTO của bạn
            @RequestBody ChangePasswordRequest request, 
            
            // 2. Lấy user đã đăng nhập từ token JWT
            Principal principal 
    ) {
        try {
            // 3. Lấy email/username từ Principal (do JwtAuthFilter cung cấp)
            String username = principal.getName(); 

            // 4. Gọi service để xử lý logic
            userService.changePassword(
                username, 
                request.getCurrentPassword(), 
                request.getNewPassword()
            );

            // 5. Nếu thành công, trả về 200 OK (với text)
            // Frontend (React) sẽ nhận được 'response.ok' là true
            return ResponseEntity.ok("Đổi mật khẩu thành công.");
            
        } catch (IllegalArgumentException e) {
            // 6. BẮT LỖI (nếu mật khẩu cũ sai)
            // Trả về 400 Bad Request với thông báo lỗi
            // Frontend (React) sẽ bắt được lỗi này
            return ResponseEntity.badRequest().body(e.getMessage());
            
        } catch (Exception e) {
            // 7. Bắt các lỗi chung khác (ví dụ: lỗi 500)
            return ResponseEntity.status(500).body("Lỗi máy chủ nội bộ: " + e.getMessage());
        }
    }

    /**
     * Xác thực mật khẩu của user hiện tại (dành cho các thao tác quan trọng)
     */
    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyCurrentPassword(
            @RequestBody Map<String, String> request,
            Principal principal
    ) {
        try {
            String password = request.get("password");
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Mật khẩu không được để trống");
            }

            String username = principal.getName();
            System.out.println("Verifying password for user: " + username);
            System.out.println("Principal name: " + principal.getName());
            System.out.println("Password length: " + password.length());
            
            boolean isValid = userService.verifyPassword(username, password);
            System.out.println("Password verification result: " + isValid);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("valid", isValid);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in verifyCurrentPassword: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi máy chủ nội bộ: " + e.getMessage());
        }
    }

    /**
     * Xóa tài khoản của user hiện tại
     */
    @DeleteMapping("/account")
    @PreAuthorize("isAuthenticated()") // Yêu cầu xác thực
    public ResponseEntity<?> deleteMyAccount(Principal principal) {
        try {
            String username = principal.getName();
            userService.deleteAccount(username);
            return ResponseEntity.ok("Tài khoản đã được xóa thành công");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi xóa tài khoản: " + e.getMessage());
        }
    }
}