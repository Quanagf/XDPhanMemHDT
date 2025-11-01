package com.evrental.users.controller;

import com.evrental.users.dto.LoginRequest;
import com.evrental.users.dto.LoginResponse;
import com.evrental.users.dto.RegistrationRequest;
import com.evrental.users.model.User;
import com.evrental.users.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType; // <-- IMPORT MỚI
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // <-- IMPORT MỚI

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    // Chỉ inject (tiêm) Service Interface
    private final IUserService userService;

    @GetMapping("/ping")
    public String ping() {
        return "User-Service (Spring Boot) is alive!";
    }

    // === API ĐĂNG KÝ (1.a) ===
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegistrationRequest request) {
        userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Đăng ký thành công");
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
        String email = principal.getName();
        return ResponseEntity.ok(userService.getProfile(email));
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

    // === API MỚI (Upload File - 1.a) ===
    @PostMapping(
        path = "/upload/{documentType}",
        consumes = { MediaType.MULTIPART_FORM_DATA_VALUE } // Báo cho Spring đây là API nhận file
    )
    @PreAuthorize("isAuthenticated()") // Chỉ user đã đăng nhập mới được gọi
    public ResponseEntity<User> uploadDocument(
            @PathVariable String documentType, // "license" hoặc "idCard"
            @RequestParam("file") MultipartFile file,
            Principal principal // Dùng 'Principal' để lấy user đã xác thực
    ) {
        // 1. Lấy email của user từ JWT Token
        String email = principal.getName();
        
        // 2. Gọi service để xử lý
        User updatedUser = userService.uploadDocument(email, file, documentType);

        // 3. Trả về user đã được cập nhật (chứa link URL mới)
        return ResponseEntity.ok(updatedUser);
    }
}
