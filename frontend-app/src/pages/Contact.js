import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import { getStations, getProvinces } from '../api/stations';
import { createComplaint, getMyComplaints } from '../api/complaints';
import '../styles/pages/contact.css';

const Contact = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [provinces, setProvinces] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [showComplaints, setShowComplaints] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    bookingId: '',
    category: '',
    priority: 'MEDIUM'
  });

  // Load dữ liệu stations từ API
  useEffect(() => {
    const loadStationsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [provincesData, stationsData] = await Promise.all([
          getProvinces(),
          getStations()
        ]);

        // Tổ chức dữ liệu theo cấu trúc provinces với stations
        const organizedProvinces = {};
        
        provincesData.forEach(provinceName => {
          const provinceStations = stationsData.filter(station => 
            station.province === provinceName && station.status === 'OPEN'
          );
          
          const provinceKey = provinceName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');
          
          organizedProvinces[provinceKey] = {
            id: provinceKey,
            name: provinceName,
            stations: provinceStations.map(station => ({
              id: station.id,
              name: station.name,
              address: station.address,
              phone: station.phoneNumber,
              operatingHours: station.operatingHours || '24/7'
            }))
          };
        });

        setProvinces(organizedProvinces);
      } catch (err) {
        console.error('Error loading stations data:', err);
        setError('Không thể tải dữ liệu địa điểm');
      } finally {
        setLoading(false);
      }
    };

    loadStationsData();
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const parsedUser = JSON.parse(userProfile);
      setUser(parsedUser);
      
      // Load user's complaints if logged in
      loadMyComplaints();
    }
  }, []);

  const loadMyComplaints = async () => {
    try {
      const complaints = await getMyComplaints();
      setMyComplaints(complaints);
    } catch (err) {
      console.error('Error loading complaints:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (user && user.role === 'RENTER') {
      // Nếu là người dùng đã đăng nhập, gửi khiếu nại
      try {
        const complaintData = {
          title: formData.subject || formData.message.substring(0, 50),
          description: formData.message,
          bookingId: formData.bookingId || null,
          category: formData.category || 'OTHER',
          priority: formData.priority
        };
        
        await createComplaint(complaintData);
        alert('Khiếu nại của bạn đã được gửi thành công! Chúng tôi sẽ xem xét và phản hồi sớm nhất.');
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          bookingId: '',
          category: '',
          priority: 'MEDIUM'
        });
        
        // Reload complaints
        loadMyComplaints();
      } catch (err) {
        console.error('Error creating complaint:', err);
        alert('Có lỗi xảy ra khi gửi khiếu nại. Vui lòng thử lại!');
      }
    } else {
      // Người dùng chưa đăng nhập hoặc không phải RENTER - liên hệ thông thường
      console.log('Form submitted:', formData);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        bookingId: '',
        category: '',
        priority: 'MEDIUM'
      });
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
    }
  };

  return (
    <div className="contact-container">
      <Header onOpenLogin={handleOpenLogin} />
      
      <main className="contact-main">
        <div className="contact-hero">
          <div className="container">
            <h1 className="contact-title">
              {user && user.role === 'RENTER' ? 'Liên hệ & Khiếu nại' : 'Liên hệ với chúng tôi'}
            </h1>
            <p className="contact-subtitle">
              {user && user.role === 'RENTER' 
                ? 'Gửi khiếu nại hoặc phản hồi của bạn. Chúng tôi sẽ xem xét và giải quyết sớm nhất!'
                : 'Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy để lại thông tin và chúng tôi sẽ phản hồi sớm nhất!'
              }
            </p>
            {user && user.role === 'RENTER' && (
              <button 
                className="view-complaints-btn"
                onClick={() => setShowComplaints(!showComplaints)}
              >
                {showComplaints ? 'Ẩn khiếu nại của tôi' : 'Xem khiếu nại của tôi'}
              </button>
            )}
          </div>
        </div>

        <div className="contact-content">
          <div className="container">
            {/* My Complaints Section */}
            {showComplaints && user && user.role === 'RENTER' && (
              <div className="my-complaints-section">
                <h2>Khiếu nại của tôi</h2>
                {myComplaints.length === 0 ? (
                  <p className="no-complaints">Bạn chưa có khiếu nại nào.</p>
                ) : (
                  <div className="complaints-list">
                    {myComplaints.map(complaint => (
                      <div key={complaint.id} className="complaint-card">
                        <div className="complaint-header">
                          <h3>{complaint.title}</h3>
                          <span className={`complaint-status status-${complaint.status.toLowerCase()}`}>
                            {complaint.status === 'PENDING' && 'Đang chờ'}
                            {complaint.status === 'IN_PROGRESS' && 'Đang xử lý'}
                            {complaint.status === 'RESOLVED' && 'Đã giải quyết'}
                            {complaint.status === 'REJECTED' && 'Từ chối'}
                            {complaint.status === 'CLOSED' && 'Đã đóng'}
                          </span>
                        </div>
                        <p className="complaint-description">{complaint.description}</p>
                        <div className="complaint-meta">
                          <span className="complaint-category">
                            {complaint.category === 'VEHICLE_ISSUE' && <><iconify-icon icon="mdi:car" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon> Vấn đề xe</>}
                            {complaint.category === 'BILLING' && <><iconify-icon icon="material-symbols:payments" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon> Thanh toán</>}
                            {complaint.category === 'SERVICE_QUALITY' && <><iconify-icon icon="material-symbols:star" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon> Chất lượng dịch vụ</>}
                            {complaint.category === 'STAFF_BEHAVIOR' && <><iconify-icon icon="material-symbols:person" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon> Nhân viên</>}
                            {complaint.category === 'STATION_FACILITY' && <><iconify-icon icon="material-symbols:business" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon> Cơ sở vật chất</>}
                            {complaint.category === 'APP_TECHNICAL' && <><iconify-icon icon="material-symbols:computer" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon> Kỹ thuật</>}
                            {complaint.category === 'OTHER' && <><iconify-icon icon="material-symbols:description" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon> Khác</>}
                          </span>
                          <span className="complaint-date">
                            {new Date(complaint.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {complaint.resolution && (
                          <div className="complaint-resolution">
                            <strong>Phản hồi:</strong> {complaint.resolution}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
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
                    <p>{Object.keys(provinces).length} tỉnh/thành phố</p>
                    <p>{Object.values(provinces).reduce((total, province) => total + province.stations.length, 0)} chi nhánh toàn quốc</p>
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
                <h2 className="form-title">
                  {user && user.role === 'RENTER' ? 'Gửi khiếu nại mới' : 'Gửi tin nhắn cho chúng tôi'}
                </h2>
                <p className="form-subtitle">
                  {user && user.role === 'RENTER' 
                    ? 'Điền thông tin khiếu nại của bạn để chúng tôi có thể hỗ trợ bạn tốt nhất.'
                    : 'Điền thông tin vào biểu mẫu dưới đây và chúng tôi sẽ liên hệ lại với bạn sớm nhất.'
                  }
                </p>

                <form className="contact-form" onSubmit={handleSubmit}>
                  {!user && (
                    <>
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
                    </>
                  )}
                  
                  {user && user.role === 'RENTER' && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="category">Danh mục khiếu nại *</label>
                          <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Chọn danh mục</option>
                            <option value="VEHICLE_ISSUE">Vấn đề về xe</option>
                            <option value="BILLING">Vấn đề thanh toán</option>
                            <option value="SERVICE_QUALITY">Chất lượng dịch vụ</option>
                            <option value="STAFF_BEHAVIOR">Thái độ nhân viên</option>
                            <option value="STATION_FACILITY">Cơ sở vật chất trạm</option>
                            <option value="APP_TECHNICAL">Lỗi kỹ thuật ứng dụng</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="priority">Mức độ ưu tiên</label>
                          <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                          >
                            <option value="LOW">Thấp</option>
                            <option value="MEDIUM">Trung bình</option>
                            <option value="HIGH">Cao</option>
                            <option value="URGENT">Khẩn cấp</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="subject">Tiêu đề khiếu nại *</label>
                          <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Tóm tắt vấn đề của bạn"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="bookingId">Mã đặt xe (nếu có)</label>
                          <input
                            type="number"
                            id="bookingId"
                            name="bookingId"
                            value={formData.bookingId}
                            onChange={handleInputChange}
                            placeholder="Nhập mã booking liên quan"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="form-group full-width">
                    <label htmlFor="message">
                      {user && user.role === 'RENTER' ? 'Mô tả chi tiết *' : 'Nội dung tin nhắn/Yêu cầu cụ thể *'}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={user && user.role === 'RENTER' 
                        ? 'Mô tả chi tiết vấn đề bạn gặp phải...'
                        : 'Mô tả chi tiết yêu cầu hoặc câu hỏi của bạn...'
                      }
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
                      {user && user.role === 'RENTER' ? 'Gửi khiếu nại' : 'Gửi tin nhắn'}
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
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Đang tải dữ liệu địa điểm...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{error}</p>
                </div>
              ) : !selectedProvince ? (
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
                          {station.operatingHours && (
                            <p className="contact-station-hours">
                              <iconify-icon icon="material-symbols:schedule" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon>
                              {station.operatingHours}
                            </p>
                          )}
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