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
    
    // Exchange name
    public static final String DOCUMENT_EXCHANGE = "document.exchange";
    
    // Routing keys
    public static final String DOCUMENT_UPLOAD_ROUTING_KEY = "document.upload";
    public static final String DOCUMENT_VERIFIED_ROUTING_KEY = "document.verified";
    
    @Bean
    public Queue documentUploadQueue() {
        return new Queue(DOCUMENT_UPLOAD_QUEUE, true); // durable = true
    }
    
    @Bean
    public Queue documentVerifiedQueue() {
        return new Queue(DOCUMENT_VERIFIED_QUEUE, true);
    }
    
    @Bean
    public TopicExchange documentExchange() {
        return new TopicExchange(DOCUMENT_EXCHANGE);
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
