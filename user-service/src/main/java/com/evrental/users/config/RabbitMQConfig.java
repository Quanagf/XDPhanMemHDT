package com.evrental.users.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    
    // Queue names
    public static final String DOCUMENT_UPLOAD_QUEUE = "document.upload.queue";
    public static final String DOCUMENT_VERIFIED_QUEUE = "document.verified.queue";
    public static final String COMPLAINT_CREATED_QUEUE = "complaint.created.queue";
    public static final String COMPLAINT_ASSIGNED_QUEUE = "complaint.assigned.queue";
    public static final String COMPLAINT_STAFF_COMPLETED_QUEUE = "complaint.staff.completed.queue";
    public static final String COMPLAINT_RESOLVED_QUEUE = "complaint.resolved.queue";
    public static final String STAFF_NOTIFICATION_QUEUE = "staff.notification.queue";
    
    // Exchange name
    public static final String DOCUMENT_EXCHANGE = "document.exchange";
    public static final String COMPLAINT_EXCHANGE = "complaint.exchange";
    public static final String BOOKING_EXCHANGE = "booking.exchange";
    
    // Routing keys
    public static final String DOCUMENT_UPLOAD_ROUTING_KEY = "document.upload";
    public static final String DOCUMENT_VERIFIED_ROUTING_KEY = "document.verified";
    public static final String COMPLAINT_CREATED_ROUTING_KEY = "complaint.created";
    public static final String COMPLAINT_ASSIGNED_ROUTING_KEY = "complaint.assigned";
    public static final String COMPLAINT_STAFF_COMPLETED_ROUTING_KEY = "complaint.staff.completed";
    public static final String COMPLAINT_RESOLVED_ROUTING_KEY = "complaint.resolved";
    public static final String STAFF_NOTIFICATION_ROUTING_KEY = "staff.notification";
    
    @Bean
    public Queue documentUploadQueue() {
        return new Queue(DOCUMENT_UPLOAD_QUEUE, true); // durable = true
    }
    
    @Bean
    public Queue documentVerifiedQueue() {
        return new Queue(DOCUMENT_VERIFIED_QUEUE, true);
    }
    
    @Bean
    public Queue complaintCreatedQueue() {
        return new Queue(COMPLAINT_CREATED_QUEUE, true);
    }
    
    @Bean
    public Queue complaintAssignedQueue() {
        return new Queue(COMPLAINT_ASSIGNED_QUEUE, true);
    }
    
    @Bean
    public Queue complaintStaffCompletedQueue() {
        return new Queue(COMPLAINT_STAFF_COMPLETED_QUEUE, true);
    }
    
    @Bean
    public Queue complaintResolvedQueue() {
        return new Queue(COMPLAINT_RESOLVED_QUEUE, true);
    }
    
    @Bean
    public Queue staffNotificationQueue() {
        return new Queue(STAFF_NOTIFICATION_QUEUE, true);
    }
    
    @Bean
    public TopicExchange documentExchange() {
        return new TopicExchange(DOCUMENT_EXCHANGE);
    }
    
    @Bean
    public TopicExchange complaintExchange() {
        return new TopicExchange(COMPLAINT_EXCHANGE);
    }
    
    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(BOOKING_EXCHANGE);
    }
    
    @Bean
    public Binding documentUploadBinding() {
        return BindingBuilder
                .bind(documentUploadQueue())
                .to(documentExchange())
                .with(DOCUMENT_UPLOAD_ROUTING_KEY);
    }
    
    @Bean
    public Binding documentVerifiedBinding() {
        return BindingBuilder
                .bind(documentVerifiedQueue())
                .to(documentExchange())
                .with(DOCUMENT_VERIFIED_ROUTING_KEY);
    }
    
    @Bean
    public Binding complaintCreatedBinding() {
        return BindingBuilder
                .bind(complaintCreatedQueue())
                .to(complaintExchange())
                .with(COMPLAINT_CREATED_ROUTING_KEY);
    }
    
    @Bean
    public Binding complaintAssignedBinding() {
        return BindingBuilder
                .bind(complaintAssignedQueue())
                .to(complaintExchange())
                .with(COMPLAINT_ASSIGNED_ROUTING_KEY);
    }
    
    @Bean
    public Binding complaintStaffCompletedBinding() {
        return BindingBuilder
                .bind(complaintStaffCompletedQueue())
                .to(complaintExchange())
                .with(COMPLAINT_STAFF_COMPLETED_ROUTING_KEY);
    }
    
    @Bean
    public Binding complaintResolvedBinding() {
        return BindingBuilder
                .bind(complaintResolvedQueue())
                .to(complaintExchange())
                .with(COMPLAINT_RESOLVED_ROUTING_KEY);
    }
    
    @Bean
    public Binding staffNotificationBinding() {
        return BindingBuilder
                .bind(staffNotificationQueue())
                .to(bookingExchange())
                .with(STAFF_NOTIFICATION_ROUTING_KEY);
    }
    
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
