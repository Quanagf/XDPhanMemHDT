package com.evrental.payment.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // <-- Thêm import
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity // Bật @PreAuthorize
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // --- API CÔNG KHAI (Public) ---
                        .requestMatchers(
                                "/api/payments/ping"
                        ).permitAll()

                        // --- API NỘI BỘ (Cho Service khác gọi) ---
                        // "Mở" API này để booking-service có thể gọi
                        .requestMatchers(
                            HttpMethod.POST, "/api/payments"
                        ).permitAll() 
                        
                        // --- CÁC API CÒN LẠI (Private) ---
                        // Bất kỳ API nào khác (như /history)
                        // đều phải được xác thực
                        .anyRequest().authenticated() 
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) 
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
