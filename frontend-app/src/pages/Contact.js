import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import '../styles/pages/contact.css';

const Contact = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Dữ liệu các tỉnh và trạm
  const provinces = {
    hcm: {
      name: 'TP. Hồ Chí Minh',
      stations: [
        {
          id: 'hcm1',
          name: 'Trạm Quận 1',
          address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
          phone: '028 3822 3456'
        },
        {
          id: 'hcm2', 
          name: 'Trạm Quận 7',
          address: '456 Đường Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM',
          phone: '028 5411 7890'
        },
        {
          id: 'hcm3',
          name: 'Trạm Thủ Đức',
          address: '789 Đường Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM',
          phone: '028 3715 2468'
        }
      ]
    },
    lamdong: {
      name: 'Lâm Đồng',
      stations: [
        {
          id: 'ld1',
          name: 'Trạm Đà Lạt',
          address: '15 Đường Trần Phú, Phường 4, TP. Đà Lạt, Lâm Đồng',
          phone: '0263 3822 156'
        },
        {
          id: 'ld2',
          name: 'Trạm Bảo Lộc',
          address: '78 Đường Trần Hưng Đạo, Phường 1, TP. Bảo Lộc, Lâm Đồng',
          phone: '0263 3874 923'
        }
      ]
    },
    angiang: {
      name: 'An Giang',
      stations: [
        {
          id: 'ag1',
          name: 'Trạm Long Xuyên',
          address: '234 Đường Nguyễn Văn Cừ, Phường Mỹ Bình, TP. Long Xuyên, An Giang',
          phone: '0296 3941 567'
        },
        {
          id: 'ag2',
          name: 'Trạm Châu Đốc',
          address: '567 Đường Lê Lợi, Phường Châu Phú B, TP. Châu Đốc, An Giang',
          phone: '0296 3868 234'
        }
      ]
    },
    quangngai: {
      name: 'Quảng Ngãi',
      stations: [
        {
          id: 'qn1',
          name: 'Trạm Quảng Ngãi',
          address: '345 Đường Quang Trung, Phường Lê Hồng Phong, TP. Quảng Ngãi, Quảng Ngãi',
          phone: '0255 3822 789'
        },
        {
          id: 'qn2',
          name: 'Trạm Sơn Tịnh',
          address: '678 Đường Hùng Vương, TT. Sơn Tịnh, Huyện Sơn Tịnh, Quảng Ngãi',
          phone: '0255 3677 456'
        }
      ]
    }
  };

  const handleOpenLogin = () => {
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenLocationPicker = () => {
    setShowLocationPicker(true);
    setSelectedProvince(null);
  };

  const handleCloseLocationPicker = () => {
    setShowLocationPicker(false);
    setSelectedProvince(null);
  };

  const handleProvinceSelect = (provinceKey) => {
    setSelectedProvince(provinceKey);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form after submission
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
  };

  return (
    <div className="contact-container">
      <Header onOpenLogin={handleOpenLogin} />
      
      <main className="contact-main">
        <div className="contact-hero">
          <div className="container">
            <h1 className="contact-title">Liên hệ với chúng tôi</h1>
            <p className="contact-subtitle">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy để lại thông tin và chúng tôi sẽ phản hồi sớm nhất!
            </p>
          </div>
        </div>

        <div className="contact-content">
          <div className="container">
            <div className="contact-layout">
              {/* Contact Information */}
              <div className="contact-info">
                <h2 className="info-title">Thông tin liên hệ cơ bản</h2>
                
                <div className="info-item">
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>Số điện thoại</h3>
                    <p>1900 1234 (7AM - 10PM)</p>
                    <p>Liên hệ trực tiếp qua di động</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>Địa chỉ Email</h3>
                    <p>contact@fev.vn</p>
                    <p>support@fev.vn</p>
                  </div>
                </div>

                <div className="info-item clickable-item" onClick={handleOpenLocationPicker}>
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>Địa chỉ văn phòng</h3>
                    <p>4 tỉnh/thành phố</p>
                    <p>9 chi nhánh toàn quốc</p>
                  </div>
                  <div className="info-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>Giờ làm việc</h3>
                    <p>Hỗ trợ đặt xe: 24/7</p>
                    <p>Phục vụ mọi ngày trong tuần</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form-container">
                <h2 className="form-title">Gửi tin nhắn cho chúng tôi</h2>
                <p className="form-subtitle">
                  Điền thông tin vào biểu mẫu dưới đây và chúng tôi sẽ liên hệ lại với bạn sớm nhất.
                </p>

                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fullName">Tên đầy đủ *</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập tên đầy đủ của bạn"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Số điện thoại</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+84 123 456 789"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Tiêu đề/Loại dịch vụ quan tâm *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Chọn loại dịch vụ</option>
                        <option value="rental">Thuê xe</option>
                        <option value="support">Hỗ trợ kỹ thuật</option>
                        <option value="partnership">Hợp tác đối tác</option>
                        <option value="feedback">Góp ý/Phản hồi</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="message">Nội dung tin nhắn/Yêu cầu cụ thể *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết yêu cầu hoặc câu hỏi của bạn..."
                      rows="6"
                      required
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                      </svg>
                      Gửi tin nhắn
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      {showLogin && <Login onClose={handleCloseLogin} />}
      
      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="contact-location-modal-overlay" onClick={handleCloseLocationPicker}>
          <div className="contact-location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="contact-location-modal-header">
              <h3>Các chi nhánh FEV</h3>
              <button className="contact-close-location-btn" onClick={handleCloseLocationPicker}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="contact-location-modal-content">
              {!selectedProvince ? (
                // Hiển thị danh sách tỉnh
                <div className="contact-province-grid">
                  <h4>Chọn tỉnh/thành phố để xem chi nhánh:</h4>
                  <div className="contact-province-list">
                    {Object.entries(provinces).map(([key, province]) => (
                      <div 
                        key={key}
                        className="contact-province-card"
                        onClick={() => handleProvinceSelect(key)}
                      >
                        <div className="contact-province-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <h5>{province.name}</h5>
                        <p>{province.stations.length} chi nhánh</p>
                        <div className="contact-province-arrow">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9,18 15,12 9,6"></polyline>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Hiển thị danh sách chi nhánh của tỉnh đã chọn
                <div className="contact-station-grid">
                  <div className="contact-station-header">
                    <button 
                      className="contact-back-btn"
                      onClick={() => setSelectedProvince(null)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                      </svg>
                    </button>
                    <h4>Các chi nhánh tại {provinces[selectedProvince].name}:</h4>
                  </div>
                  
                  <div className="contact-station-list">
                    {provinces[selectedProvince].stations.map((station) => (
                      <div 
                        key={station.id}
                        className="contact-station-card info-only"
                      >
                        <div className="contact-station-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                          </svg>
                        </div>
                        <div className="contact-station-info">
                          <h5>{station.name}</h5>
                          <p className="contact-station-address">{station.address}</p>
                          <p className="contact-station-phone">{station.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;