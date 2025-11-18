package com.evrental.users.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.evrental.users.config.RabbitMQConfig;
import com.evrental.users.dto.DocumentUploadNotification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitMQProducer {
    
    private final RabbitTemplate rabbitTemplate;
    
    public void sendDocumentUploadNotification(DocumentUploadNotification notification) {
        log.info("Sending document upload notification for user: {}", notification.getUsername());
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.DOCUMENT_EXCHANGE,
            RabbitMQConfig.DOCUMENT_UPLOAD_ROUTING_KEY,
            notification
        );
        log.info("Document upload notification sent successfully");
    }
    
    public void sendDocumentVerifiedNotification(DocumentUploadNotification notification) {
        log.info("Sending document verified notification for user: {}", notification.getUsername());
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.DOCUMENT_EXCHANGE,
            RabbitMQConfig.DOCUMENT_VERIFIED_ROUTING_KEY,
            notification
        );
        log.info("Document verified notification sent successfully");
    }
}
