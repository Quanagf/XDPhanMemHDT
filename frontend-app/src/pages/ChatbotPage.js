import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';

const ChatbotPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Xin chào, tôi là BTSTQ - Trợ lý AI thông minh của FEV. Tôi có thể giúp bạn:',
      timestamp: new Date(),
      suggestions: [
        'Tìm hiểu về dịch vụ thuê xe điện',
        'Hướng dẫn cách đặt xe',
        'Thông tin về giá cả và khuyến mãi',
        'Hỗ trợ kỹ thuật và sử dụng',
        'Câu hỏi khác'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpenLogin = (onSuccessCallback) => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginModalOpen(false);
  };

  const simulateBotResponse = (userMessage) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let botResponse = '';
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('xe điện') || lowerMessage.includes('thuê xe')) {
        botResponse = 'FEV cung cấp dịch vụ thuê xe điện hiện đại với đa dạng loại xe từ xe máy điện đến ô tô điện. Tất cả xe đều được bảo dưỡng định kỳ và trang bị công nghệ thông minh để đảm bảo trải nghiệm tốt nhất cho khách hàng.';
      } else if (lowerMessage.includes('đặt xe') || lowerMessage.includes('booking')) {
        botResponse = 'Để đặt xe, bạn có thể: \n1. Truy cập trang chủ FEV \n2. Chọn loại xe và thời gian thuê \n3. Điền thông tin cá nhân \n4. Thanh toán online \n5. Nhận xe tại địa điểm đã chọn. Bạn cần hỗ trợ thêm về quy trình nào không?';
      } else if (lowerMessage.includes('giá') || lowerMessage.includes('khuyến mãi')) {
        botResponse = 'Hiện tại FEV có các gói giá ưu đãi: \n• Xe máy điện: 50.000đ/ngày \n• Ô tô điện 4 chỗ: 800.000đ/ngày \n• Ô tô điện 7 chỗ: 1.200.000đ/ngày \nKhuyến mãi đặc biệt: Giảm 20% cho lần đầu thuê với mã FEVFIRST!';
      } else if (lowerMessage.includes('pin') || lowerMessage.includes('sạc')) {
        botResponse = 'FEV có hệ thống theo dõi pin thời gian thực và mạng lưới trạm sạc rộng khắp. Ứng dụng sẽ tự động hiển thị trạm sạc gần nhất và thời gian sạc dự kiến. Bạn không cần lo lắng về việc hết pin giữa đường!';
      } else {
        botResponse = 'Cảm ơn bạn đã liên hệ! Tôi sẽ cố gắng hỗ trợ bạn tốt nhất. Bạn có thể hỏi tôi về các dịch vụ của FEV, cách đặt xe, giá cả, hoặc bất kỳ thắc mắc nào khác.';
      }

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        text: inputValue,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      
      // Simulate bot response
      simulateBotResponse(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-page">
      <Header onOpenLogin={handleOpenLogin} />
      
      <div className="chatbot-container">
        {/* Sidebar */}
        <div className="chatbot-sidebar">
          <div className="chat-history-header">
            <h3>Trò chuyện</h3>
          </div>
          <div className="chat-history-item active">
            <div className="chat-avatar">
              <div className="bot-icon">🤖</div>
            </div>
            <div className="chat-info">
              <div className="chat-title">BTSTQ</div>
              <div className="chat-preview">Xin chào, tôi là BTSTQ, trợ lý Mioto, rất vui được hỗ trợ bạn...</div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chatbot-main">
          <div className="chatbot-header">
            <div className="bot-info">
              <div className="bot-avatar">
                <div className="bot-icon">🤖</div>
              </div>
              <div className="bot-details">
                <h2>BTSTQ</h2>
                <span className="bot-status">Trợ lý AI của FEV</span>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === 'bot' && (
                  <div className="message-avatar">
                    <div className="bot-icon">🤖</div>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">
                    {message.text.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                  {message.suggestions && (
                    <div className="message-suggestions">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="suggestion-btn"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <span className="suggestion-icon">💬</span>
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="message-avatar user-avatar">
                    <div className="user-icon">👤</div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">
                  <div className="bot-icon">🤖</div>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">BTSTQ đang trả lời...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn hoặc bạn cũng có thể chọn 1 trong những câu hỏi được gợi ý bên dưới."
                className="chat-input"
                rows="1"
              />
              <button
                onClick={handleSendMessage}
                className="send-button"
                disabled={!inputValue.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;