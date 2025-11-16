import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Register from '../components/Register';
import vehicleService from '../utils/vehicleService';
import { getVehicle } from '../api/vehicles';
import '../styles/pages/car-detail.css';

const CarDetail = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingType, setBookingType] = useState('instant');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiVehicle = await getVehicle(carId);
        if (apiVehicle) {
          setCarData({
            id: apiVehicle.id,
            name: apiVehicle.description || apiVehicle.type || 'Xe điện',
            images: [apiVehicle.imageUrl || '/assets/images/cars/placeholder.webp'],
            rating: apiVehicle.rating || 4.6,
            trips: apiVehicle.trips || Math.floor(Math.random() * 50) + 10,
            location: apiVehicle.station ? `${apiVehicle.station.name} - ${apiVehicle.station.province}` : 'Chưa xác định',
            pricePerDay: apiVehicle.pricePerHour ? apiVehicle.pricePerHour * 24 : 780000,
            pricePerHour: apiVehicle.pricePerHour || 32500,
            licensePlate: apiVehicle.licensePlate || 'N/A',
            lastMaintenance: apiVehicle.lastMaintenanceDate || '2025-10-01',
            specs: {
              transmission: apiVehicle.transmission || 'Số tự động',
              seats: `${apiVehicle.seats || 4} Ghế`,
              battery: apiVehicle.batteryLevel != null ? `${apiVehicle.batteryLevel}%` : '~87.7 kWh',
              range: apiVehicle.range || '~420km',
              chargePort: apiVehicle.chargePort || 'CCS2',
              chargeSpeed: apiVehicle.chargeSpeed || '10 - 70% trong ~25 mins'
            },
            condition: {
              pin: apiVehicle.batteryLevel != null ? `${apiVehicle.batteryLevel}%` : '85%',
              status: `Tình trạng kỹ thuật: ${apiVehicle.condition || 'Tốt'}`,
              rental: apiVehicle.status === 'AVAILABLE' ? 'Cho thuê: Có sẵn' : 
                      apiVehicle.status === 'RENTED' ? 'Cho thuê: Đang cho thuê' : 'Cho thuê: Đã đặt trước'
            },
            raw: apiVehicle
          });
        } else {
          throw new Error('Vehicle not found in API');
        }
      } catch (error) {
        console.log('API failed, trying vehicleService:', error.message);
        
        const localVehicle = vehicleService.getVehicleById(carId);
        if (localVehicle) {
          setCarData({
            id: localVehicle.id,
            name: localVehicle.description || localVehicle.type || 'Xe điện',
            images: [localVehicle.image_url || '/assets/images/cars/placeholder.webp'],
            rating: 4.6,
            trips: 19,
            location: localVehicle.station_id || 'Phường 3, quận Bình Thạnh',
            pricePerDay: localVehicle.price_per_hour ? localVehicle.price_per_hour * 24 : 780000,
            pricePerHour: localVehicle.price_per_hour || 32500,
            licensePlate: localVehicle.licence_plate || 'N/A',
            lastMaintenance: localVehicle.last_maintenance_date || '2025-10-01',
            specs: {
              transmission: 'Số tự động',
              seats: '4 Ghế',
              battery: localVehicle.battery_level != null ? `${localVehicle.battery_level}%` : '~87.7 kWh',
              range: '~420km',
              chargePort: 'CCS2',
              chargeSpeed: '10 - 70% trong ~25 mins'
            },
            condition: {
              pin: localVehicle.battery_level != null ? `${localVehicle.battery_level}%` : '85%',
              status: 'Tình trạng kỹ thuật: Tốt',
              rental: localVehicle.status === 'AVAILABLE' ? 'Cho thuê: Có sẵn' : 
                      localVehicle.status === 'RENTED' ? 'Cho thuê: Đang cho thuê' : 'Cho thuê: Đã đặt trước'
            },
            raw: localVehicle
          });
        } else {
          setCarData({
            id: carId,
            name: "VINFAST VF 8 Eco 2024",
            images: ["/assets/images/cars/tu-nhan-chao-khach-mua-vinfast-vf-3-dat-hon-50-trieu-dong-so-voi-gia-niem-yet-anh5-edited-1723451100085.webp"],
            rating: 4.6,
            trips: 19,
            location: "Phường 3, quận Bình Thạnh",
            pricePerDay: 780000,
            pricePerHour: 32500,
            licensePlate: "30A-12345",
            lastMaintenance: "2025-10-01",
            specs: {
              transmission: "Số tự động",
              seats: "4 Ghế",
              battery: "~87.7 kWh",
              range: "~420km",
              chargePort: "CCS2",
              chargeSpeed: "10 - 70% trong ~25 mins"
            },
            condition: {
              pin: "85%",
              status: "Tình trạng kỹ thuật: Tốt",
              rental: "Cho thuê: Có sẵn"
            }
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCarData();
    }
  }, [carId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [carId]);

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

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
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('authToken');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const prevImage = () => {
    if (carData && carData.images.length > 0) {
      setCurrentImageIndex(prev => 
        prev === 0 ? carData.images.length - 1 : prev - 1
      );
    }
  };

  const nextImage = () => {
    if (carData && carData.images.length > 0) {
      setCurrentImageIndex(prev => 
        prev === carData.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleBooking = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      alert('Đặt xe thành công! Bạn sẽ được liên hệ sớm.');
      navigate('/');
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

  if (loading) {
    return (
      <div className="CarDetail">
        <Header onOpenLogin={handleOpenLogin} user={user} onLogout={handleLogout} />
        <main className="car-detail-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin xe...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="CarDetail">
        <Header onOpenLogin={handleOpenLogin} user={user} onLogout={handleLogout} />
        <main className="car-detail-main">
          <div className="error-container">
            <iconify-icon icon="material-symbols:error-outline"></iconify-icon>
            <p>Không thể tải thông tin xe. Vui lòng thử lại sau.</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Thử lại
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!carData) {
    return (
      <div className="CarDetail">
        <Header onOpenLogin={handleOpenLogin} user={user} onLogout={handleLogout} />
        <main className="car-detail-main">
          <div className="not-found-container">
            <iconify-icon icon="material-symbols:search-off"></iconify-icon>
            <p>Không tìm thấy xe với ID: {carId}</p>
            <button onClick={handleBack} className="back-button-large">
              Quay lại trang trước
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="CarDetail">
      <Header 
        onOpenLogin={handleOpenLogin} 
        user={user} 
        onLogout={handleLogout}
      />
      
      <main className="car-detail-main">
        <div className="back-button-container">
          <button className="back-button" onClick={handleBack}>
            <iconify-icon icon="material-symbols:arrow-back"></iconify-icon>
            <span>Quay lại</span>
          </button>
        </div>
        
        <div className="car-detail-container">
          <div className="left-column">
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
              </div>
            </div>

            <div className="car-info-section">
              <div className="car-title-section">
                <h1>{carData.name}</h1>
                <div className="car-meta">
                  <div className="rating-info">
                    <iconify-icon icon="material-symbols:star" className="star-icon"></iconify-icon>
                    <span>{carData.rating}</span>
                    <span className="separator">•</span>
                    <span>{carData.trips} chuyến</span>
                  </div>
                </div>
              </div>

              <div className="car-specs">
                <h3>Thông số xe</h3>
                
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

              <div className="vehicle-details">
                <h3>Thông tin xe</h3>
                <div className="detail-items">
                  <div className="detail-item">
                    <iconify-icon icon="mdi:card-text-outline"></iconify-icon>
                    <span>Biển số: {carData.licensePlate}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:calendar-check"></iconify-icon>
                    <span>Bảo trì cuối: {carData.lastMaintenance}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:currency-usd"></iconify-icon>
                    <span>Giá thuê: {carData.pricePerHour.toLocaleString()}đ/giờ</span>
                  </div>
                </div>
              </div>

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
            </div>
          </div>

          <div className="right-column">
            <div className="booking-section">
              <div className="price-display">
                <span className="price">{Math.floor(carData.pricePerDay/1000)}K/Ngày</span>
              </div>
              
              <div className="date-selection">
                <div className="date-input-group">
                  <label>Ngày nhận</label>
                  <div className="date-time-input">
                    <span>10:00</span>
                    <span>{new Date().toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                
                <div className="date-input-group">
                  <label>Ngày trả</label>
                  <div className="date-time-input">
                    <span>10:00</span>
                    <span>{new Date(Date.now() + 86400000).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
              
              <div className="booking-type-selection">
                <div className="booking-option">
                  <input 
                    type="radio" 
                    id="instant" 
                    name="bookingType" 
                    value="instant"
                    checked={bookingType === 'instant'}
                    onChange={(e) => setBookingType(e.target.value)}
                  />
                  <label htmlFor="instant">
                    <div className="option-header">
                      <span className="option-title">Đặt xe ngay</span>
                      <span className="option-price">780.000đ</span>
                    </div>
                    <span className="option-description">Nhận xe ngay, thanh toán tiền mặt</span>
                  </label>
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
                  <label htmlFor="request">
                    <div className="option-header">
                      <span className="option-title">Gửi yêu cầu</span>
                      <span className="option-price">750.000đ</span>
                    </div>
                    <span className="option-description">Chờ chủ xe duyệt (trong 24h)</span>
                  </label>
                </div>
              </div>
              
              <div className="terms-agreement">
                <div className="checkbox-container" onClick={handleTermsCheckboxClick}>
                  <input 
                    type="checkbox" 
                    id="agreeTerms" 
                    checked={agreeToTerms}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label htmlFor="agreeTerms">
                    Tôi đồng ý với <button type="button" className="terms-link" onClick={() => setShowTermsModal(true)}>Điều khoản và điều kiện</button>
                  </label>
                </div>
              </div>
              
              <button 
                className="book-now-button" 
                onClick={handleBooking}
                disabled={!agreeToTerms}
              >
                Đặt xe
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

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
                <h3>HỢP ĐỒNG THUÊ XE ĐIỆN ĐIỆN TỬ</h3>
                
                <p><strong>ĐIỀU KHOẢN THUÊ XE:</strong></p>
                
                <ul>
                  <li>Thanh toán tiền thuê xe ngay khi nhận xe</li>
                  <li>Sử dụng xe đúng mục đích, tuân thủ luật giao thông</li>
                  <li>Không sử dụng xe vào mục đích phi pháp, trái pháp luật</li>
                  <li>Không sử dụng xe để cầm cố, thế chấp</li>
                  <li>Giữ gìn xe sạch sẽ, không hút thuốc trong xe</li>
                  <li>Chịu trách nhiệm về mọi thiệt hại xảy ra trong thời gian thuê</li>
                  <li>Bồi thường theo quy định nếu vi phạm hợp đồng</li>
                </ul>
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