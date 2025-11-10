package com.evrental.vehicles.config;

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

import com.evrental.vehicles.service.JwtService;

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
        
        // Bỏ qua các public endpoints
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        
        // Danh sách các path public không cần token
        if (requestPath.endsWith("/ping")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Cho phép GET stations không cần token (cho trang Contact)
        if (method.equals("GET") && requestPath.startsWith("/api/stations")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Cho phép GET vehicle by ID không cần token (cho booking service)
        if (method.equals("GET") && requestPath.matches("/api/vehicles/\\d+")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Cho phép PUT vehicle status không cần token (cho booking service)
        if (method.equals("PUT") && requestPath.matches("/api/vehicles/\\d+/status/.*")) {
            filterChain.doFilter(request, response);
            return;
        }

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
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid or expired token");
            return;
        }

        // Nếu có email và user chưa được xác thực
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Lấy role TỪ BÊN TRONG TOKEN (đây là điểm khác biệt)
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
