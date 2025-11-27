package com.evrental.users.config;

import java.io.IOException;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.evrental.users.service.JwtService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); 
            return;
        }

        jwt = authHeader.substring(7); // Bỏ "Bearer "
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Token invalid/expired, nhưng KHÔNG trả về 401
            // Để SecurityConfig xử lý (permitAll hoặc hasRole)
            filterChain.doFilter(request, response);
            return;
        }

        // Nếu có email và user chưa được xác thực
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Lấy role TỪ BÊN TRONG TOKEN (giống các service khác)
            String role = jwtService.extractClaim(jwt, (Claims c) -> c.get("role", String.class));
            
            // Tạo Quyền (Authority) từ role
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));

            // Tạo đối tượng Authentication
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userEmail, // Dùng email làm principal (tên user)
                    null,
                    authorities // Gán quyền (ROLE_ADMIN, ROLE_STAFF...)
            );
            
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            // Đặt user vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        
        filterChain.doFilter(request, response);
    }
}