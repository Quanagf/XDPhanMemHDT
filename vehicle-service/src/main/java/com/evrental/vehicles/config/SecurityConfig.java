package com.evrental.vehicles.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // <-- Thêm import
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity // Bật @PreAuthorize
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    
    // (Service này không cần AuthenticationProvider
    // vì chúng ta xác thực bằng token, không phải password)

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // --- CÁC API CÔNG KHAI (Public) ---
                        .requestMatchers(
                                "/api/vehicles/ping",
                                "/api/stations/ping"
                        ).permitAll()
                        
                        // Cho phép GET stations (để frontend có thể lấy danh sách)
                        .requestMatchers(HttpMethod.GET, "/api/stations/**").permitAll()

                        // --- CÁC API NỘI BỘ (Cho Service khác gọi) ---
                        .requestMatchers(
                            HttpMethod.GET, "/api/vehicles/{id}"
                        ).permitAll() // (Cho booking-service lấy giá)
                        .requestMatchers(
                            HttpMethod.PUT, "/api/vehicles/{id}/status/{statusName}"
                        ).permitAll() // (Cho booking-service cập nhật status)
                        
                        // --- CÁC API CÒN LẠI (Private) ---
                        // Yêu cầu phải được xác thực (phải có Token)
                        .anyRequest().authenticated() 
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) 
                )
                // (Không cần .authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Thêm Filter JWT

        return http.build();
    }
}
