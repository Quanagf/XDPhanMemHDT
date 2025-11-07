package com.evrental.users.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    // --- 1. THUỘC TÍNH CƠ BẢN (CHUNG) ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(nullable = false)
    private String password; 

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(length = 15)
    private String phoneNumber;

    private String address;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate; // Ngày sinh

    @Column(length = 10)
    private String gender; // Giới tính: "Nam", "Nữ", "Khác"

    @Column(length = 255)
    private String facebook; // Link Facebook

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // --- 2a. THUỘC TÍNH MỞ RỘNG CHO (EV Renter) ---
    @Column(length = 50)
    private String licenseNumber;
    private String licenseImage;
    @Column(length = 20)
    private String identityNumber;
    private String identityImage;
    @Builder.Default
    private boolean isVerified = false;
    @Builder.Default
    private Integer rentalHistoryCount = 0;
    @Builder.Default
    private Double totalDistance = 0.0;
    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal totalSpent = BigDecimal.ZERO;

    // --- 2b. THUỘC TÍNH MỞ RỘNG CHO (Station Staff) ---
    private Long stationId;
    @Column(length = 50)
    private String position;
    @Builder.Default
    private Double performanceScore = 0.0;
    @Builder.Default
    private Double customerRatingAvg = 0.0;

    // --- 2c. THUỘC TÍNH MỞ RỘNG CHO (Admin) ---
    @Enumerated(EnumType.STRING)
    private AdminLevel adminLevel;
    private LocalDateTime lastLogin;
    @Column(columnDefinition = "TEXT")
    private String permissions;

    // --- 3. CÁC ENUMS HỖ TRỢ ---
    public enum Role {
        RENTER, STAFF, ADMIN
    }

    public enum UserStatus {
        ACTIVE, INACTIVE, BANNED
    }

    public enum AdminLevel {
        SUPER, REGIONAL, LOCAL
    }

    // --- 4. HÀM CỦA SPRING SECURITY ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email; // Dùng EMAIL làm username cho Spring Security
    }

    @Override
    public String getPassword() {
        return password;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return this.status != UserStatus.BANNED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.status == UserStatus.ACTIVE;
    }
}