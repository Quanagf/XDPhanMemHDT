import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Register from '../components/Register';
import vehicleService from '../utils/vehicleService';

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

// CarCard hiển thị xe lấy từ vehicleService
const CarCard = ({ car }) => {
  const img = car.image_url || '/assets/images/cars/placeholder.webp';
  const statusLabel = car.status === 'AVAILABLE' ? 'Trống' : car.status === 'RENTED' ? 'Đang cho thuê' : 'Đã đặt trước';
  const statusClass = car.status === 'AVAILABLE' ? 'badge-available' : car.status === 'RENTED' ? 'badge-rented' : 'badge-reserved';

  return (
    <article className="car-card">
      <img 
        src={img} 
        alt={car.description || car.type || 'Xe'}
        className="car-image"
        width="300" 
        height="200"
        loading="lazy"
      />
      
      <div className="card-details">
        <h3>{car.description || car.type}</h3>
        
        <div className="info-group">
          <div className="info-row location-info">
            <iconify-icon icon="material-symbols:location-on-outline" aria-hidden="true"></iconify-icon>
            <span>{car.station_id || 'Chưa xác định'}</span>
          </div>
        </div>
        
        <div className="card-footer">
          <span className="price-per-day">
            {car.price_per_hour ? `${car.price_per_hour.toLocaleString()}đ/giờ` : 'Liên hệ'}
          </span>
          <span className={`status-badge ${statusClass}`}>
            {statusLabel}
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

  // Kiểm tra role và chuyển hướng
  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    const authToken = localStorage.getItem('authToken');
    
    if (userProfile && authToken) {
      try {
        const parsedUser = JSON.parse(userProfile);
        
        // Chuyển hướng Admin và Staff đến trang của họ
        if (parsedUser.role === 'ADMIN') {
          navigate('/admin');
          return;
        } else if (parsedUser.role === 'STAFF') {
          navigate('/staff');
          return;
        }
        
        // RENTER được ở lại trang này
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user profile:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userRole');
      }
    }
  }, [navigate]);

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

    // Lấy dữ liệu xe từ vehicleService
    const [cars, setCars] = React.useState([]);

    useEffect(() => {
      const v = vehicleService.getVehicles();
      setCars(v || []);
    }, []);

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
                key={car.id || index}
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