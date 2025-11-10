import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import '../styles/pages/contact.css';

const Contact = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [provinces, setProvinces] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Fetch dữ liệu các trạm từ API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations/active');
        if (response.ok) {
          const stations = await response.json();
          
          // Nhóm các trạm theo tỉnh
          const groupedByProvince = stations.reduce((acc, station) => {
            const provinceKey = station.province.toLowerCase().replace(/\s+/g, '');
            if (!acc[provinceKey]) {
              acc[provinceKey] = {
                name: station.province,
                stations: []
              };
            }
            acc[provinceKey].stations.push({
              id: station.id,
              name: station.name,
              address: station.address,
              phone: station.phoneNumber
            });
            return acc;
          }, {});
          
          setProvinces(groupedByProvince);
        } else {
          console.error('Failed to fetch stations');
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

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
                    {loading ? (
                      <p>Đang tải...</p>
                    ) : (
                      <>
                        <p>{Object.keys(provinces).length} tỉnh/thành phố</p>
                        <p>{Object.values(provinces).reduce((sum, p) => sum + p.stations.length, 0)} chi nhánh toàn quốc</p>
                      </>
                    )}
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
        <div className="location-modal-overlay" onClick={handleCloseLocationPicker}>
          <div className="location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="location-modal-header">
              <h3>Các chi nhánh FEV</h3>
              <button className="close-location-btn" onClick={handleCloseLocationPicker}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="location-modal-content">
              {!selectedProvince ? (
                // Hiển thị danh sách tỉnh
                <div className="province-grid">
                  <h4>Chọn tỉnh/thành phố để xem chi nhánh:</h4>
                  <div className="province-list">
                    {Object.entries(provinces).map(([key, province]) => (
                      <div 
                        key={key}
                        className="province-card"
                        onClick={() => handleProvinceSelect(key)}
                      >
                        <div className="province-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <h5>{province.name}</h5>
                        <p>{province.stations.length} chi nhánh</p>
                        <div className="province-arrow">
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
                <div className="station-grid">
                  <div className="station-header">
                    <button 
                      className="back-btn"
                      onClick={() => setSelectedProvince(null)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                      </svg>
                    </button>
                    <h4>Các chi nhánh tại {provinces[selectedProvince].name}:</h4>
                  </div>
                  
                  <div className="station-list">
                    {provinces[selectedProvince].stations.map((station) => (
                      <div 
                        key={station.id}
                        className="station-card info-only"
                      >
                        <div className="station-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                          </svg>
                        </div>
                        <div className="station-info">
                          <h5>{station.name}</h5>
                          <p className="station-address">{station.address}</p>
                          <p className="station-phone">{station.phone}</p>
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