package com.evrental.users.service;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    public void sendSimpleEmail(String to, String subject, String body) {
        // TODO: Triển khai gửi email thực tế với JavaMailSender
        // Hiện tại chỉ log để demo
        log.info("=== EMAIL NOTIFICATION ===");
        log.info("To: {}", to);
        log.info("Subject: {}", subject);
        log.info("Body: {}", body);
        log.info("========================");
        
        // Trong production, bạn có thể sử dụng:
        // - JavaMailSender với SMTP
        // - SendGrid API
        // - AWS SES
        // - Hoặc dịch vụ email khác
    }
}