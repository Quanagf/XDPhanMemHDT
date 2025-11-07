package com.evrental.users.service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
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

    // === HÀM MỚI (Triển khai logic upload) ===
    @Override
    public User uploadDocument(String email, MultipartFile file, String documentType) {
        // 1. Tìm user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2. Tạo tên file duy nhất (ví dụ: "license-1-abc12345.jpg")
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String fileExtension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            fileExtension = originalFilename.substring(i); // Lấy đuôi file (vd: ".jpg")
        }
        
        String objectName = String.format(
            "%s-%d-%s%s",
            documentType,
            user.getId(),
            UUID.randomUUID().toString().substring(0, 8),
            fileExtension
        );

        // 3. Gọi FileStorageService (Minio) để upload
        String fileUrl = fileStorageService.uploadFile(file, objectName);

        // 4. Cập nhật đường link vào CSDL
        if ("license".equalsIgnoreCase(documentType)) {
            user.setLicenseImage(fileUrl);
            // user.setLicenseNumber("UPDATING..."); // (Cần 1 API khác để cập nhật số)
        } else if ("idCard".equalsIgnoreCase(documentType)) {
            user.setIdentityImage(fileUrl);
            // user.setIdentityNumber("UPDATING..."); // (Cần 1 API khác)
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại tài liệu không hợp lệ. Chỉ chấp nhận 'license' hoặc 'idCard'.");
        }

        // 5. Lưu user lại
        return userRepository.save(user);
    }

    // === HÀM MỚI (Cập nhật thông tin profile) ===
    @Override
    public User updateProfile(String email, UpdateProfileRequest request) {
        // 1. Tìm user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2. Cập nhật các trường được phép chỉnh sửa
        if (request.getAddress() != null && !request.getAddress().isEmpty()) {
            user.setAddress(request.getAddress());
        }
        if (request.getBirthDate() != null) {
            user.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null && !request.getGender().isEmpty()) {
            user.setGender(request.getGender());
        }
        if (request.getFacebook() != null && !request.getFacebook().isEmpty()) {
            user.setFacebook(request.getFacebook());
        }
        // Lưu ý: email, phoneNumber không cho phép sửa
        // licenseNumber và identityNumber sẽ được cập nhật qua API upload riêng

        // 3. Lưu và trả về
        return userRepository.save(user);
    }
}