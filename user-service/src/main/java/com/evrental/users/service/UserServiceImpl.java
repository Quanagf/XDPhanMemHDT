package com.evrental.users.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.evrental.users.dto.LoginRequest;
import com.evrental.users.dto.LoginResponse;
import com.evrental.users.dto.RegistrationRequest;
import com.evrental.users.dto.UpdateProfileRequest; // <-- IMPORT MỚI
import com.evrental.users.model.User;
import com.evrental.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    // --- CÁC DEPENDENCY ĐÃ CÓ ---
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // --- DEPENDENCY MỚI (Cho việc Upload File) ---
    private final IFileStorageService fileStorageService; // <-- THÊM DÒNG NÀY

    @Override
    public Map<String, Boolean> checkDuplicateFields(String email, String username, String phoneNumber) {
        Map<String, Boolean> result = new HashMap<>();
        result.put("email", email != null && userRepository.existsByEmail(email));
        result.put("username", username != null && userRepository.existsByUsername(username));
        result.put("phoneNumber", phoneNumber != null && userRepository.existsByPhoneNumber(phoneNumber));
        return result;
    }

    @Override
    public User register(RegistrationRequest request) {
        // 1. Kiểm tra trùng username
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username đã tồn tại");
        }
        
        // 3. Kiểm tra trùng số điện thoại
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số điện thoại đã được sử dụng");
        }

        // 4. Validate tuổi phải >= 18
        if (request.getBirthDate() != null) {
            int age = Period.between(request.getBirthDate(), LocalDate.now()).getYears();
            if (age < 18) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn phải đủ 18 tuổi để đăng ký");
            }
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng!");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại!");
        }

        // 5. Xây dựng Entity
        User newUser = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .birthDate(request.getBirthDate())
                .role(request.getRole() != null ? request.getRole() : User.Role.RENTER)
                .status(User.UserStatus.ACTIVE)
                .isVerified(false)
                .build();

        // 6. Lưu vào Repository
        return userRepository.save(newUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // 1. Xác thực bằng username
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Lấy thông tin user theo username
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 3. Cập nhật nghiệp vụ (ví dụ: lastLogin)
        if (user.getRole() == User.Role.ADMIN) {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }

        // 4. Tạo token
        String token = jwtService.generateToken(user);

        // 5. Trả về DTO
        return new LoginResponse(token, user.getRole());
    }

    @Override
    public User getProfile(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public User verifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setVerified(true);
        return userRepository.save(user);
    }

    @Override
    public User banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setStatus(User.UserStatus.BANNED);
        return userRepository.save(user);
    }


    // === HÀM MỚI (Cập nhật thông tin profile) ===
    @Override
    public User updateProfile(String username, UpdateProfileRequest request) {
        // 1. Tìm user theo username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2. Cập nhật các trường được phép chỉnh sửa
        user.setAddress(request.getAddress());
        if (request.getBirthDate() != null) {
            user.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null && !request.getGender().isEmpty()) {
            user.setGender(request.getGender());
        }
        
        user.setFacebook(request.getFacebook());

        if (request.getLicenseNumber() != null) {
            user.setLicenseNumber(request.getLicenseNumber());
        }

        if (request.getIdentityNumber() != null) {
            user.setIdentityNumber(request.getIdentityNumber());
        }
        // Lưu ý: email, phoneNumber, username không cho phép sửa 

        // 3. Lưu và trả về
        return userRepository.save(user);
    }

    // === HÀM MỚI (Admin tạo tài khoản Staff) ===
    @Override
    public User createStaffAccount(RegistrationRequest request) {
        // 1. Kiểm tra username đã tồn tại chưa
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username đã tồn tại");
        }

        // 2. Tạo User với role STAFF
        User newStaff = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .birthDate(request.getBirthDate())
                .role(User.Role.STAFF) // Force role là STAFF
                .status(User.UserStatus.ACTIVE)
                .isVerified(true) // Staff được tạo bởi admin thì mặc định đã xác thực
                .build();

        // 3. Lưu và trả về
        return userRepository.save(newStaff);
    }

    // === HÀM MỚI (Admin thay đổi role user) ===
    @Override
    public User updateUserRole(Long userId, String newRole) {
        // 1. Tìm user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2. Validate role hợp lệ
        User.Role role;
        try {
            role = User.Role.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Role không hợp lệ. Chỉ chấp nhận: ADMIN, STAFF, RENTER");
        }

        // 3. Cập nhật role
        user.setRole(role);

        // 4. Lưu và trả về
        return userRepository.save(user);
    }

    // === HÀM MỚI (Admin lấy tất cả user) ===
    @Override
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User save(User user) {
        // Chỉ cần gọi hàm save() của repository
        return userRepository.save(user);
    }
    @Override
    public User getCurrentUser() {
        // Lấy định danh (identifier) từ JWT Token
        // Giá trị này là username (đã đổi từ email sang username)
        String userIdentifier = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Tìm user trong DB bằng username
        return userRepository.findByUsername(userIdentifier)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + userIdentifier + ". Vui lòng kiểm tra dữ liệu JWT và DB."));
    }

    @Override
    public void changePassword(String username, String currentPassword, String newPassword) {
        
        // 1. Tìm user trong DB bằng username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với username: " + username));

        System.out.println("DEBUG - Found user: " + user.getUsername() + " (ID: " + user.getId() + ")");
        System.out.println("DEBUG - Current password hash: " + user.getPassword());
        
        // 2. KIỂM TRA MẬT KHẨU CŨ
        // Dùng BCrypt để so sánh mật khẩu text (currentPassword) 
        // với mật khẩu đã hash (user.getPassword())
        boolean passwordMatches = passwordEncoder.matches(currentPassword, user.getPassword());
        System.out.println("DEBUG - Password matches: " + passwordMatches);
        
        if (!passwordMatches) {
            // 3. NÉM LỖI (Quan trọng!)
            // Controller sẽ bắt lỗi này và trả về 400 Bad Request
            // Frontend sẽ đọc được chính xác message này
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }

        // 4. Mã hóa mật khẩu mới
        String newHashedPassword = passwordEncoder.encode(newPassword);
        System.out.println("DEBUG - New password hash: " + newHashedPassword);
        
        // 5. Cập nhật và lưu vào DB
        user.setPassword(newHashedPassword);
        User savedUser = userRepository.save(user);
        System.out.println("DEBUG - Saved user password hash: " + savedUser.getPassword());
    }

    @Override
    public boolean verifyPassword(String username, String password) {
        try {
            // 1. Tìm user trong DB bằng username
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với username: " + username));

            // 2. So sánh mật khẩu bằng BCrypt
            return passwordEncoder.matches(password, user.getPassword());
            
        } catch (Exception e) {
            // Log lỗi để debug (không dùng log, chỉ print)
            System.err.println("Error in verifyPassword for user: " + username + " - " + e.getMessage());
            return false;
        }
    }

    @Override
    public void deleteAccount(String username) {
        try {
            // 1. Tìm user theo username
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

            // 2. Xóa các file ảnh trên Minio (nếu có)
            if (user.getLicenseImage() != null && !user.getLicenseImage().isEmpty()) {
                try {
                    // Extract object name from URL để xóa trên Minio
                    String licenseObjectName = extractObjectNameFromUrl(user.getLicenseImage());
                    fileStorageService.deleteFile(licenseObjectName);
                } catch (Exception e) {
                    System.err.println("Error deleting license image: " + e.getMessage());
                }
            }

            if (user.getIdentityImage() != null && !user.getIdentityImage().isEmpty()) {
                try {
                    String identityObjectName = extractObjectNameFromUrl(user.getIdentityImage());
                    fileStorageService.deleteFile(identityObjectName);
                } catch (Exception e) {
                    System.err.println("Error deleting identity image: " + e.getMessage());
                }
            }

            // 3. Xóa user khỏi database
            userRepository.delete(user);
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa tài khoản: " + e.getMessage());
        }
    }

    /**
     * Helper method để extract object name từ URL
     */
    private String extractObjectNameFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return null;
        }
        
        // URL format: http://localhost:9000/bucket-name/object-path
        // Ta cần lấy phần object-path (có thể bao gồm folder/subfolder/filename)
        try {
            // Tìm vị trí của bucket name trong URL
            String[] urlParts = fileUrl.split("/");
            if (urlParts.length >= 5) {
                // urlParts[0] = "http:", urlParts[1] = "", urlParts[2] = "localhost:9000", 
                // urlParts[3] = "bucket-name", urlParts[4...] = object path parts
                StringBuilder objectName = new StringBuilder();
                for (int i = 4; i < urlParts.length; i++) {
                    if (i > 4) objectName.append("/");
                    objectName.append(urlParts[i]);
                }
                return objectName.toString();
            }
        } catch (Exception e) {
            System.err.println("Error extracting object name from URL: " + fileUrl);
        }
        
        return null;
    }
}