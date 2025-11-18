package com.evrental.users.controller;

import java.security.Principal;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping; // <-- IMPORT MỚI
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


import com.evrental.users.dto.ChangePasswordRequest; // <-- IMPORT MỚI
import com.evrental.users.dto.DocumentVerificationResponse;
import com.evrental.users.dto.LoginRequest;
import com.evrental.users.dto.LoginResponse;
import com.evrental.users.dto.RegistrationRequest;
import com.evrental.users.dto.UpdateProfileRequest;
import com.evrental.users.dto.VerifyDocumentRequest;
import com.evrental.users.model.DocumentVerification;
import com.evrental.users.model.DocumentVerification.DocumentType;
import com.evrental.users.model.User;
import com.evrental.users.service.DocumentVerificationService;
import com.evrental.users.service.IFileStorageService;
import com.evrental.users.service.IUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    // Chỉ inject (tiêm) Service Interface
    private final IUserService userService;
    private final IFileStorageService fileStorageService;
    private final DocumentVerificationService documentVerificationService;



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
    
    // === API KIỂM TRA VERIFICATION STATUS (cho Booking Service) ===
    @GetMapping("/verification-status/{userId}")
    public ResponseEntity<Map<String, Object>> getUserVerificationStatus(@PathVariable Long userId) {
        User user = userService.findById(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("fullName", user.getFullName());
        response.put("licenseNumber", user.getLicenseNumber());
        response.put("identityNumber", user.getIdentityNumber());
        response.put("hasVerifiedLicense", user.getLicenseNumber() != null && !user.getLicenseNumber().isEmpty());
        response.put("hasVerifiedIdentity", user.getIdentityNumber() != null && !user.getIdentityNumber().isEmpty());
        
        return ResponseEntity.ok(response);
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


    // === API UPLOAD DOCUMENT (CẬP NHẬT MỚI) ===
    @PostMapping("/upload/{uploadType}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> handleFileUpload(
            @PathVariable("uploadType") String uploadType, 
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        
        try {
            // 1. Lấy thông tin user hiện tại
            String username = principal.getName();
            User currentUser = userService.getProfile(username);
            
            // 2. Validate uploadType
            DocumentType documentType;
            if ("license".equals(uploadType)) {
                documentType = DocumentType.LICENSE;
            } else if ("identity".equals(uploadType)) {
                documentType = DocumentType.IDENTITY;
            } else {
                return ResponseEntity.badRequest().body("Invalid upload type");
            }
            
            // 3. Tạo tên file duy nhất và upload vào MinIO
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID().toString() + "-" + originalFileName;
            String objectName = "pending/" + uploadType + "/" + currentUser.getId() + "/" + uniqueFileName;
            
            String fileUrl = fileStorageService.uploadFile(file, objectName);
            
            // 4. Tạo verification request
            DocumentVerification verification = documentVerificationService.createVerificationRequest(
                currentUser.getId(), 
                documentType, 
                fileUrl
            );
            
            // 5. Trả về thông báo cho user
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tài liệu đã được tải lên. Vui lòng chờ trong 2 ngày để admin xác thực.");
            response.put("verificationId", verification.getId());
            response.put("status", verification.getStatus().name());
            
            return ResponseEntity.ok(response);
            
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tải lên: " + e.getMessage());
        }
    }

    // === API UPLOAD AVATAR ===
    @PostMapping("/upload-avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        
        try {
            // 1. Lấy thông tin user hiện tại
            String username = principal.getName();
            User currentUser = userService.getProfile(username);
            
            // 2. Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File không được để trống");
            }
            
            // 3. Kiểm tra định dạng file (chỉ cho phép ảnh)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Chỉ cho phép upload file ảnh");
            }
            
            // 4. Kiểm tra kích thước file (tối đa 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Kích thước file không được vượt quá 5MB");
            }
            
            // 5. Tạo tên file duy nhất và upload vào MinIO
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String uniqueFileName = "avatar-" + currentUser.getId() + "-" + UUID.randomUUID().toString() + fileExtension;
            String objectName = "avatars/" + uniqueFileName;
            
            String avatarUrl = fileStorageService.uploadFile(file, objectName);
            
            // 6. Cập nhật avatar URL vào database
            currentUser.setAvatarUrl(avatarUrl);
            userService.updateProfile(username, currentUser);
            
            // 7. Trả về thông báo thành công
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Avatar đã được cập nhật thành công");
            response.put("avatarUrl", avatarUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi upload avatar: " + e.getMessage());
        }
    }
    
    // === API LẤY TRẠNG THÁI VERIFICATION CỦA USER ===
    @GetMapping("/my-verifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentVerificationResponse>> getMyVerifications(Principal principal) {
        String username = principal.getName();
        User currentUser = userService.getProfile(username);
        List<DocumentVerificationResponse> verifications = 
                documentVerificationService.getUserVerifications(currentUser.getId());
        return ResponseEntity.ok(verifications);
    }
    
    // === API ADMIN: LẤY TẤT CẢ DOCUMENTS (PENDING, APPROVED, REJECTED) ===
    @GetMapping("/admin/all-verifications")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<DocumentVerificationResponse>> getAllVerifications() {
        List<DocumentVerificationResponse> allDocs = documentVerificationService.getAllVerifications();
        return ResponseEntity.ok(allDocs);
    }
    
    // === API ADMIN: LẤY TẤT CẢ DOCUMENTS ĐANG CHỜ XÁC THỰC ===
    @GetMapping("/admin/pending-verifications")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<DocumentVerificationResponse>> getPendingVerifications() {
        List<DocumentVerificationResponse> pendingDocs = documentVerificationService.getPendingVerifications();
        return ResponseEntity.ok(pendingDocs);
    }
    
    // === API ADMIN: XÁC THỰC DOCUMENT ===
    @PostMapping("/admin/verify-document/{verificationId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> verifyDocument(
            @PathVariable Long verificationId,
            @Valid @RequestBody VerifyDocumentRequest request,
            Principal principal) {
        
        try {
            String username = principal.getName();
            User admin = userService.getProfile(username);
            
            DocumentVerification verification = documentVerificationService.verifyDocument(
                verificationId, 
                request, 
                admin.getId()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Document đã được " + 
                    (verification.getStatus().name().equals("APPROVED") ? "xác thực" : "từ chối"));
            response.put("verificationId", verification.getId());
            response.put("status", verification.getStatus().name());
            
            return ResponseEntity.ok(response);
            
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xác thực: " + e.getMessage());
        }
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