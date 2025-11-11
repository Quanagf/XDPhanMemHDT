package com.evrental.users.service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.Period;
import java.util.HashMap;
import java.util.UUID;
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
import com.evrental.users.dto.RegistrationRequest; // <-- IMPORT MỚI
import com.evrental.users.dto.UpdateProfileRequest;
import com.evrental.users.model.User;
import com.evrental.users.repository.UserRepository;

import lombok.RequiredArgsConstructor; // <-- IMPORT MỚI (Để tạo tên file)

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
    public Map<String, Boolean> checkDuplicateFields(String email, String username) {
        Map<String, Boolean> result = new HashMap<>();
        result.put("email", email != null && userRepository.existsByEmail(email));
        result.put("username", username != null && userRepository.existsByUsername(username));
        return result;
    }

    @Override
    public User register(RegistrationRequest request) {
        // 1. Kiểm tra nghiệp vụ
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username đã tồn tại");
        }

        // 2. Validate tuổi phải >= 18
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

        // 3. Xây dựng Entity
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

        // 4. Lưu vào Repository
        return userRepository.save(newUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // 1. Xác thực
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Lấy thông tin user
        var user = userRepository.findByEmail(request.getEmail())
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
    public User getProfile(String email) {
        return userRepository.findByEmail(email)
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
    public User updateProfile(String email, UpdateProfileRequest request) {
        // 1. Tìm user
        User user = userRepository.findByEmail(email)
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
        // Lưu ý: email, phoneNumber không cho phép sửa 

        // 3. Lưu và trả về
        return userRepository.save(user);
    }

    // === HÀM MỚI (Admin tạo tài khoản Staff) ===
    @Override
    public User createStaffAccount(RegistrationRequest request) {
        // 1. Kiểm tra email và username đã tồn tại chưa
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }
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

    public User save(User user) {
        // Chỉ cần gọi hàm save() của repository
        return userRepository.save(user);
    }
    public User getCurrentUser() {
        // Lấy định danh (identifier) từ JWT Token
        // Giá trị này là email: quantranhoang247@gmail.com
        String userIdentifier = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Tìm user trong DB bằng email
        return userRepository.findByEmail(userIdentifier) // <-- Sửa thành findByEmail
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + userIdentifier + ". Vui lòng kiểm tra dữ liệu JWT và DB."));
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        
        // 1. Tìm user trong DB
        User user = userRepository.findByEmail(username) // Hoặc findByUsername
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        // 2. KIỂM TRA MẬT KHẨU CŨ
        // Dùng BCrypt để so sánh mật khẩu text (currentPassword) 
        // với mật khẩu đã hash (user.getPassword())
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            
            // 3. NÉM LỖI (Quan trọng!)
            // Controller sẽ bắt lỗi này và trả về 400 Bad Request
            // Frontend sẽ đọc được chính xác message này
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }

        // 4. Mã hóa mật khẩu mới
        String newHashedPassword = passwordEncoder.encode(newPassword);
        
        // 5. Cập nhật và lưu vào DB
        user.setPassword(newHashedPassword);
        userRepository.save(user);
    }
}