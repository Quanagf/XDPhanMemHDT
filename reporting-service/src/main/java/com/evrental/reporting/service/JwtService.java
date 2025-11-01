package com.evrental.reporting.service;

// Service này CHỈ DÙNG ĐỂ ĐỌC TOKEN
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    // RẤT QUAN TRỌNG:
    // Key này PHẢI GIỐNG HỆT key trong user-service
    private static final String SECRET = "C1502C6A37A99A7C7708B53B3B2364D4A8C0E79A5E12E9A23456789ABCDEF012";

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // --- Các hàm giải mã token ---
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject); // Trả về Email
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Hàm public để lấy BẤT KỲ claim nào (ví dụ: "role", "userId")
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Xác thực token (chỉ kiểm tra email và hạn)
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
