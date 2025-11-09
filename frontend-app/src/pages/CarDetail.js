import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Register from '../components/Register';
import vehicleService from '../utils/vehicleService';

const CarDetail = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingType, setBookingType] = useState('instant'); // 'instant' or 'request'
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Lấy dữ liệu xe từ vehicleService (nếu có), fallback sang mock nhỏ
  const [carData, setCarData] = useState(null);

  useEffect(() => {
    const v = vehicleService.getVehicleById(carId);
    if (v) {
      setCarData({
        id: v.id,
        name: v.type || v.description,
        images: [v.image_url || '/assets/images/cars/placeholder.webp'],
        rating: v.rating || 4.6,
        trips: v.trips || 19,
        location: v.station_id || 'Chưa xác định',
        pricePerDay: v.price_per_hour ? v.price_per_hour * 24 : (v.pricePerDay || 780000),
        specs: {
          transmission: v.transmission || 'số tự động',
          seats: v.seats || '4 Ghế',
          battery: v.battery_level != null ? `${v.battery_level}%` : (v.specs && v.specs.battery) || '~87.7 kWh',
          range: v.range || '~420km',
          chargePort: v.chargePort || 'CCS2',
          chargeSpeed: v.chargeSpeed || '10 - 70% trong ~25 mins'
        },
        condition: {
          pin: v.battery_level != null ? `${v.battery_level}%` : 'N/A',
          status: v.conditionStatus || 'Tốt',
          rental: v.status === 'AVAILABLE' ? 'Cho thuê: Trống' : (v.status === 'RENTED' ? 'Cho thuê: Đang cho thuê' : 'Cho thuê: Đã đặt trước')
        },
        raw: v
      });
    } else {
      // fallback mock
      setCarData({
        id: carId,
        name: "VINFAST VF 8 Eco 2024",
        images: [
          "/assets/images/cars/tu-nhan-chao-khach-mua-vinfast-vf-3-dat-hon-50-trieu-dong-so-voi-gia-niem-yet-anh5-edited-1723451100085.webp"
        ],
        rating: 4.6,
        trips: 19,
        location: "Phường 3, quận Bình Thạnh",
        pricePerDay: 780000,
        specs: {
          transmission: "số tự động",
          seats: "4 Ghế",
          battery: "~87.7 kWh",
          range: "~420km",
          chargePort: "CCS2",
          chargeSpeed: "10 - 70% trong ~25 mins"
        },
        condition: {
          pin: "100%",
          status: "Tình trạng kỹ thuật: Tốt",
          rental: "Cho thuê: Trống"
        }
      });
    }
  }, [carId]);

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleOpenRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  // Scroll to top when component mounts or carId changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [carId]);

  const handleCloseModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    handleCloseModals();
  };

  const handleLogout = () => {
    setUser(null);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carData.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carData.images.length) % carData.images.length);
  };

  const handleBooking = () => {
    if (!agreeToTerms) {
      alert('Vui lòng đồng ý với các điều khoản để tiếp tục');
      return;
    }
    // Kiểm tra trạng thái xe
    const raw = carData && carData.raw;
    if (raw && raw.status && raw.status !== 'AVAILABLE') {
      alert('Xe hiện không khả dụng để thuê.');
      return;
    }
    console.log('Đặt xe:', { carId, bookingType, agreeToTerms });
  };

  const scrollToTerms = (e) => {
    e.preventDefault();
    const termsSection = document.getElementById('terms-section');
    if (termsSection) {
      termsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleTermsCheckboxClick = (e) => {
    if (!agreeToTerms) {
      e.preventDefault();
      setShowTermsModal(true);
    } else {
      setAgreeToTerms(false);
    }
  };

  const handleAcceptTerms = () => {
    setAgreeToTerms(true);
    setShowTermsModal(false);
  };

  const handleDeclineTerms = () => {
    setAgreeToTerms(false);
    setShowTermsModal(false);
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="CarDetail">
      <Header 
        onOpenLogin={handleOpenLogin} 
        user={user} 
        onLogout={handleLogout}
      />
      
      <main className="car-detail-main">
        {/* Back Button */}
        <div className="back-button-container">
          <button className="back-button" onClick={handleBack}>
            <iconify-icon icon="material-symbols:arrow-back"></iconify-icon>
            <span>Quay lại</span>
          </button>
        </div>
        
        <div className="car-detail-container">
          {/* Left Column: Image Gallery and Car Info */}
          <div className="left-column">
            {/* Image Gallery Section */}
            <div className="car-images-section">
              <div className="main-image-container">
                <button className="nav-button prev-button" onClick={prevImage}>
                  <iconify-icon icon="material-symbols:chevron-left"></iconify-icon>
                </button>
                
                <img 
                  src={carData.images[currentImageIndex]} 
                  alt={carData.name}
                  className="main-car-image"
                />
                
                <button className="nav-button next-button" onClick={nextImage}>
                  <iconify-icon icon="material-symbols:chevron-right"></iconify-icon>
                </button>
                
                <button className="favorite-button">
                  <iconify-icon icon="material-symbols:favorite-outline"></iconify-icon>
                </button>
              </div>
            </div>

            {/* Car Info Section */}
            <div className="car-info-section">
              <div className="car-title-section">
                <h1>{carData.name}</h1>
                <div className="car-meta">
                  <div className="rating-info">
                    <iconify-icon icon="material-symbols:star" className="star-icon"></iconify-icon>
                    <span>{carData.rating}</span>
                    <span className="separator">•</span>
                    <iconify-icon icon="material-symbols:work-outline" className="trip-icon"></iconify-icon>
                    <span>{carData.trips} Chuyến</span>
                    <span className="separator">•</span>
                    <span>{carData.location}</span>
                  </div>
                </div>
              </div>

              {/* Car Specifications */}
              <div className="car-specs">
                {/* First row - 3 horizontal items */}
                <div className="specs-row-horizontal">
                  <div className="spec-item">
                    <iconify-icon icon="mdi:wallet-outline"></iconify-icon>
                    <span>{carData.specs.transmission}</span>
                  </div>
                  <div className="spec-item">
                    <iconify-icon icon="mdi:car-seat"></iconify-icon>
                    <span>{carData.specs.seats}</span>
                  </div>
                  <div className="spec-item">
                    <iconify-icon icon="mdi:engine-outline"></iconify-icon>
                    <span>{carData.specs.battery}</span>
                  </div>
                </div>
                
                {/* Remaining items - vertical layout */}
                <div className="specs-vertical">
                  <div className="spec-item">
                    <iconify-icon icon="mdi:road-variant"></iconify-icon>
                    <span>Phạm vi di chuyển {carData.specs.range}</span>
                  </div>
                  <div className="spec-item">
                    <iconify-icon icon="mdi:power-plug-outline"></iconify-icon>
                    <span>Loại cổng sạc: {carData.specs.chargePort}</span>
                  </div>
                  <div className="spec-item">
                    <iconify-icon icon="mdi:lightning-bolt-outline"></iconify-icon>
                    <span>Tốc độ sạc: {carData.specs.chargeSpeed}</span>
                  </div>
                </div>
                
                <div className="location-info">
                  <iconify-icon icon="material-symbols:location-on-outline"></iconify-icon>
                  <span>{carData.location}</span>
                </div>
              </div>

              {/* Car Condition */}
              <div className="car-condition">
                <h3>Trạng thái xe</h3>
                <div className="condition-items">
                  <div className="condition-item green">
                    <span>Pin: {carData.condition.pin}</span>
                  </div>
                  <div className="condition-item green">
                    <span>{carData.condition.status}</span>
                  </div>
                  <div className="condition-item green">
                    <span>{carData.condition.rental}</span>
                  </div>
              </div>
            </div>
            
            {/* Terms Section */}
            <div id="terms-section" className="terms-section">
              <h3>Điều khoản</h3>
              <div className="terms-content">
                <ul>
                  <li>Thanh toán tiền thuê xe ngay khi nhận xe.</li>
                  <li>Sử dụng xe đúng mục đích.</li>
                  <li>Không sử dụng xe thuê vào mục đích phi pháp, trái pháp luật.</li>
                  <li>Không sử dụng xe thuê để cầm cố, thế chấp.</li>
                  <li>Không hút thuốc, nhả kẹo cao su, xả rác trong xe.</li>
                  <li>Không chở hàng quốc cấm có mùi hôi.</li>
                  <li>Không thay đổi cấu trúc xe.</li>
                  <li>Không được lái xe khi say xỉn, trong xe.</li>
                  <li>Không được hỗ chuyển xe đến khu vực biên giới, cửa khẩu.</li>
                  <li>Khi trả xe, nếu xe bẩn hoặc có mùi trong xe, khách hàng vui lòng vệ sinh xe sạch sẽ hoặc gửi phụ thu phí vệ sinh xe.</li>
                </ul>
              </div>
            </div>

            {/* Cancellation Policy Section */}
            <div className="cancellation-section">
              <h3>Chính sách hủy chuyến</h3>
              
              <div className="cancellation-table">
                <div className="table-header">
                  <div className="header-cell">Thời điểm hủy chuyến</div>
                  <div className="header-cell">Phí hủy chuyến</div>
                </div>
                
                <div className="table-row">
                  <div className="cell">Trong vòng 1 giờ sau đặt chuyến</div>
                  <div className="cell">Miễn phí</div>
                </div>
                
                <div className="table-row">
                  <div className="cell">Trước chuyến đi ít hơn 7 ngày<br/>(Sau 1 giờ đặt chuyến)</div>
                  <div className="cell">10% giá trị chuyến đi</div>
                </div>
                
                <div className="table-row">
                  <div className="cell">Trong vòng 7 ngày trước chuyến đi<br/>(Sau 1 giờ đặt chuyến)</div>
                  <div className="cell">40% giá trị chuyến đi</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Section */}
        <div className="right-column">
          <div className="booking-section">
            <div className="price-display">
              <span className="price">780K/Ngày</span>
            </div>
            
            <div className="date-selection">
              <div className="date-input-group">
                <label>Ngày nhận</label>
                <div className="date-time-input">
                  <span>10:00</span>
                  <span>08/10/2025</span>
                </div>
              </div>
              
              <div className="date-input-group">
                <label>Ngày trả</label>
                <div className="date-time-input">
                  <span>10:00</span>
                  <span>08/10/2025</span>
                </div>
              </div>
            </div>

            <div className="booking-options">
              <div className="booking-option">
                <input 
                  type="radio" 
                  id="instant" 
                  name="bookingType" 
                  value="instant"
                  checked={bookingType === 'instant'}
                  onChange={(e) => setBookingType(e.target.value)}
                />
                <label htmlFor="instant">Đặt trước</label>
              </div>
              
              <div className="booking-option">
                <input 
                  type="radio" 
                  id="request" 
                  name="bookingType" 
                  value="request"
                  checked={bookingType === 'request'}
                  onChange={(e) => setBookingType(e.target.value)}
                />
                <label htmlFor="request">Đặt xe tại điểm</label>
              </div>
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Đơn giá thuê</span>
                <span>780.000/Ngày</span>
              </div>
            </div>

            <div className="terms-checkbox">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreeToTerms}
                onChange={handleTermsCheckboxClick}
              />
              <label htmlFor="terms">
                Tôi đã đọc và đồng ý với tất cả điều khoản
                <a href="#terms-section" className="terms-link" onClick={scrollToTerms}>Tìm hiểu điều khoản</a>
              </label>
            </div>

            <div className="total-section">
              <div className="total-row">
                <span>Tổng cộng</span>
                <span>780.000 x 1 Ngày</span>
              </div>
              <div className="total-row final-total">
                <span>Thành tiền</span>
                <span>780.000đ</span>
              </div>
            </div>

            <button 
              className="book-now-button" 
              onClick={handleBooking}
              disabled={!(carData && carData.raw && carData.raw.status === 'AVAILABLE')}
            >
              {carData && carData.raw && carData.raw.status === 'AVAILABLE' ? 'Đặt xe' : (carData && carData.raw && carData.raw.status === 'RENTED' ? 'Đang cho thuê' : 'Đã đặt trước')}
            </button>
          </div>
          
          {/* Additional Fees Box - Below booking section */}
          <div className="additional-fees-box">
            <h4>Phụ phí có thể phát sinh</h4>
            
            <div className="fee-item">
              <div className="fee-info">
                <div className="fee-title">Phí vượt giới hạn</div>
                <div className="fee-amount">3.000đ /km</div>
              </div>
              <div className="fee-description">
                Phụ phí phát sinh nếu lộ trình di chuyển vượt quá 350km khi thuê xe 1 ngày
              </div>
            </div>
            
            <div className="fee-item">
              <div className="fee-info">
                <div className="fee-title">Phí quá giờ</div>
                <div className="fee-amount">70.000đ /giờ</div>
              </div>
              <div className="fee-description">
                Phụ phí phát sinh nếu hoàn trả xe trễ giờ. Trường hợp trễ quá 5 giờ, phụ thu thêm 1 ngày thuê
              </div>
            </div>
            
            <div className="fee-item">
              <div className="fee-info">
                <div className="fee-title">Phí vệ sinh</div>
                <div className="fee-amount">70.000đ</div>
              </div>
              <div className="fee-description">
                Phụ phí phát sinh khi xe hoàn trả không đảm bảo vệ sinh (nhiều vết bẩn, bùn cát, sinh lây...)
              </div>
            </div>
            
            <div className="fee-item">
              <div className="fee-info">
                <div className="fee-title">Phí khử mùi</div>
                <div className="fee-amount">500.000đ</div>
              </div>
              <div className="fee-description">
                Phụ phí phát sinh khi xe hoàn trả bị âm mùi khó chịu (mùi thuốc lá, thực phẩm nặng mùi...)
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>

      <Footer />

      {/* Terms Agreement Modal */}
      {showTermsModal && (
        <div className="modal-overlay">
          <div className="terms-modal">
            <div className="modal-header">
              <h3>Hợp đồng điện tử thuê xe</h3>
              <button className="modal-close" onClick={handleDeclineTerms}>
                <iconify-icon icon="material-symbols:close"></iconify-icon>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="contract-text">
                <p><strong>ĐIỀU KHOẢN VÀ ĐIỀU KIỆN THUÊ XE</strong></p>
                
                <p>Bằng việc đồng ý với các điều khoản này, bạn cam kết:</p>
                
                <ul>
                  <li>Thanh toán tiền thuê xe ngay khi nhận xe</li>
                  <li>Sử dụng xe đúng mục đích, tuân thủ luật giao thông</li>
                  <li>Không sử dụng xe vào mục đích phi pháp, trái pháp luật</li>
                  <li>Không sử dụng xe để cầm cố, thế chấp</li>
                  <li>Giữ gìn xe sạch sẽ, không hút thuốc trong xe</li>
                  <li>Chịu trách nhiệm về mọi thiệt hại xảy ra trong thời gian thuê</li>
                  <li>Bồi thường theo quy định nếu vi phạm hợp đồng</li>
                </ul>
                
                <div className="warning-text">
                  <p><strong>⚠️ CẢNH BÁO QUAN TRỌNG:</strong></p>
                  <p>Việc vi phạm bất kỳ điều khoản nào trong hợp đồng này sẽ khiến bạn phải chịu <strong>TOÀN BỘ TRÁCH NHIỆM PHÁP LÝ</strong> và bồi thường thiệt hại theo quy định của pháp luật.</p>
                  <p>Hợp đồng điện tử này có giá trị pháp lý tương đương hợp đồng giấy.</p>
                  
                  <p><strong>🚨 NHỮNG ĐIỀU BẠN CẦN BIẾT:</strong></p>
                  <ul>
                    <li><strong>Vi phạm giao thông:</strong> Phạt nguội, vi phạm tốc độ sẽ được chuyển về tài khoản của bạn</li>
                    <li><strong>Tai nạn giao thông:</strong> Bạn chịu trách nhiệm bồi thường 100% thiệt hại</li>
                    <li><strong>Mất mát, hỏng hóc:</strong> Bồi thường theo giá trị thực tế của xe và phụ kiện</li>
                    <li><strong>Sử dụng sai mục đích:</strong> Phạt tối thiểu 10 triệu đồng</li>
                    <li><strong>Trả xe trễ:</strong> Phụ thu 70.000đ/giờ, quá 5 giờ tính thêm 1 ngày thuê</li>
                  </ul>
                  
                  <p><strong>📋 CAM KẾT CỦA BẠN:</strong></p>
                  <p>Bằng việc ký hợp đồng điện tử này, bạn cam kết đã đọc, hiểu rõ và đồng ý tuân thủ tất cả các điều khoản. Việc vi phạm sẽ bị xử lý theo pháp luật Việt Nam.</p>
                  
                  <p><strong>🔒 TÍNH PHÁP LÝ:</strong></p>
                  <p>Hợp đồng được lưu trữ điện tử với chữ ký số, có đầy đủ giá trị pháp lý theo Luật Giao dịch điện tử số 51/2005/QH11.</p>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="decline-btn" onClick={handleDeclineTerms}>
                Từ chối
              </button>
              <button className="accept-btn" onClick={handleAcceptTerms}>
                Đồng ý và ký hợp đồng
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <Login 
          onClose={handleCloseModals} 
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {showRegister && (
        <Register 
          onClose={handleCloseModals} 
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default CarDetail;