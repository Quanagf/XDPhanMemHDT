import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Register from '../components/Register';

const SearchFilter = () => {
  return (
    <div className="search-filter">
      <button className="filter-btn">
        <iconify-icon icon="mdi:tune"></iconify-icon>
        Bộ lọc
      </button>
    </div>
  );
};

// Sử dụng lại CarCard component từ FeaturedCars
const CarCard = ({ car }) => {
  return (
    <article className="car-card">
      <img 
        src="/assets/images/cars/tu-nhan-chao-khach-mua-vinfast-vf-3-dat-hon-50-trieu-dong-so-voi-gia-niem-yet-anh5-edited-1723451100085.webp" 
        alt="VINFAST VF 8 Eco 2024"
        className="car-image"
        width="300" 
        height="200"
        loading="lazy"
      />
      
      <div className="card-details">
        <h3>VINFAST VF 8 Eco 2024</h3>
        
        <div className="info-group">
          <div className="info-row">
            <span className="detail-item">
              <iconify-icon icon="mdi:wallet-outline" aria-hidden="true"></iconify-icon> số tự động
            </span>
            <span className="detail-item">
              <iconify-icon icon="mdi:car-seat" aria-hidden="true"></iconify-icon> 4 Ghế
            </span>
            <span className="detail-item last-item">
              <iconify-icon icon="mdi:engine-outline" aria-hidden="true"></iconify-icon> ~87.7 kWh
            </span>
          </div>
          
          <div className="info-row">
            <span className="detail-item">
              <iconify-icon icon="mdi:road-variant" aria-hidden="true"></iconify-icon> Phạm vi di chuyển ~420km
            </span>
            <span className="detail-item last-item">
              <iconify-icon icon="mdi:power-plug-outline" aria-hidden="true"></iconify-icon> Loại cổng sạc: CCS2
            </span>
          </div>
          
          <div className="info-row">
            <span className="detail-item">
              <iconify-icon icon="mdi:lightning-bolt-outline" aria-hidden="true"></iconify-icon> Tốc độ sạc: 10 - 70% trong ~25 mins
            </span>
          </div>
          <div className="info-row location-info">
            <iconify-icon icon="material-symbols:location-on-outline" aria-hidden="true"></iconify-icon>
            <span>Phường 3, Quận Bình Thạnh</span>
          </div>
        </div>
        
        <div className="card-footer">
          <span className="rating-reviews">
            <iconify-icon icon="material-symbols:star" className="star-icon" aria-hidden="true"></iconify-icon> 4.8
            <span className="separator">•</span> 
            <iconify-icon icon="material-symbols:work-outline" className="trip-icon" aria-hidden="true"></iconify-icon> 19 Chuyến
          </span>
          <span className="price-per-day">
            783K/<span className="day">ngày</span>
          </span>
        </div>
      </div>
    </article>
  );
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

  // Lấy thông tin tìm kiếm từ URL params
  const searchInfo = {
    location: searchParams.get('location') || 'TP Hồ Chí Minh',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    startTime: searchParams.get('startTime') || '',
    endTime: searchParams.get('endTime') || ''
  };

  // Format hiển thị thời gian
  const formatSearchDisplay = () => {
    if (searchInfo.startDate) {
      const startDate = new Date(searchInfo.startDate);
      const endDate = new Date(searchInfo.endDate);
      
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      return `${searchInfo.startTime}, ${formatDate(startDate)} - ${searchInfo.endTime}, ${formatDate(endDate)}`;
    }
    return '10:00, 08/10/2025 - 10:00, 10/10/2025';
  };

  // Function để quay về trang chủ
  const handleBackToHome = () => {
    navigate('/');
  };

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
    handleCloseModals();
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Mock data - 9 xe như trong ảnh
  const cars = Array(9).fill({
    id: 1,
    name: "VINFAST VF 8 Eco 2024",
    transmission: "Số tự động",
    seats: 4,
    battery: "~87.7 kWh",
    chargingPort: "CCS2",
    chargingSpeed: "10 - 70% trong ~25 mins",
    range: "~420km",
    location: "Phường 3, quận Bình Thạnh",
    rating: 4.8,
    trips: 19,
    price: "783K"
  });

  return (
    <div className="SearchPage">
      <Header 
        onOpenLogin={handleOpenLogin} 
        user={user} 
        onLogout={handleLogout}
      />
      
      <main role="main" className="search-main">
        {/* Back Button và Search Summary Header */}
        <div className="search-header">
          <div className="search-summary-container">
            <button className="back-btn" onClick={handleBackToHome}>
              <iconify-icon icon="mdi:arrow-left"></iconify-icon>
            </button>
            <div className="search-summary-info">
              <div className="search-location">
                <iconify-icon icon="material-symbols:location-on"></iconify-icon>
                {searchInfo.location}
              </div>
              <div className="search-datetime">
                <iconify-icon icon="mdi:calendar"></iconify-icon>
                {formatSearchDisplay()}
              </div>
            </div>
            <SearchFilter />
          </div>
        </div>

        {/* Search Results */}
        <div className="search-results-container">
          <div className="search-results-header">
            <div className="results-title">
              <h2>Chi tiết tìm kiếm xe</h2>
            </div>
          </div>

          <div className="search-results-grid car-list-grid">
            {cars.map((car, index) => (
              <CarCard 
                key={index}
                car={car}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
      
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

export default SearchPage;