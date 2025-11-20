package com.evrental.booking.config;

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

    // Exchange cho booking notifications
    public static final String BOOKING_EXCHANGE = "booking.exchange";
    
    // Queue cho thông báo gửi đến staff
    public static final String STAFF_NOTIFICATION_QUEUE = "staff.notification.queue";
    
    // Routing key
    public static final String STAFF_NOTIFICATION_ROUTING_KEY = "staff.notification";

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(BOOKING_EXCHANGE);
    }

    @Bean
    public Queue staffNotificationQueue() {
        return new Queue(STAFF_NOTIFICATION_QUEUE, true); // durable = true
    }

    @Bean
    public Binding staffNotificationBinding() {
        return BindingBuilder
                .bind(staffNotificationQueue())
                .to(bookingExchange())
                .with(STAFF_NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}