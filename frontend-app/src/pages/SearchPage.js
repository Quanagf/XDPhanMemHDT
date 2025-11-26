import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Register from '../components/Register';
import { getVehicles } from '../api/vehicleAPI';
import { checkAvailability } from '../api/bookings';

// CarCard hiển thị xe từ API
const CarCard = ({ car, searchParams }) => {
  const img = car.imageUrl || '/assets/images/cars/placeholder.webp';
  const statusLabel = car.status === 'AVAILABLE' ? 'Có sẵn' : car.status === 'RENTED' ? 'Đang cho thuê' : 'Đã đặt trước';
  const statusClass = car.status === 'AVAILABLE' ? 'badge-available' : car.status === 'RENTED' ? 'badge-rented' : 'badge-reserved';
  
  // Map station từ DTO response (stationName, stationProvince) hoặc nested object (station.name, station.province)
  const stationName = car.stationName 
    ? `${car.stationName} - ${car.stationProvince}` 
    : car.station 
      ? `${car.station.name} - ${car.station.province}` 
      : 'Chưa xác định';
  
  // Build link with search params
  const carLink = `/car/${car.id}?${searchParams.toString()}`;


  return (
    <article className="car-card">
      <Link to={carLink} className="car-card-link">
        <img 
          src={img} 
          alt={car.description || car.type || 'Xe'}
          className="car-image"
          width="300" 
          height="200"
          loading="lazy"
        />
      </Link>
      
        <div className="card-details">
        <h3>
          <Link to={carLink}>{car.description || car.type}</Link>
        </h3>        <div className="info-group">
          <div className="info-row location-info">
            <iconify-icon icon="material-symbols:location-on-outline" aria-hidden="true"></iconify-icon>
            <span>{stationName}</span>
          </div>
          <div className="info-row">
            <iconify-icon icon="mdi:car-seat" aria-hidden="true"></iconify-icon>
            <span className="info-label">Số ghế:</span>
            <span className="info-value">{car.seats || 4} chỗ</span>
          </div>
          <div className="info-row">
            <iconify-icon icon="mdi:battery-charging" aria-hidden="true"></iconify-icon>
            <span className="info-label">Mức pin:</span>
            <span className="info-value">{car.batteryLevel || 100}%</span>
          </div>
          <div className="info-row">
            <iconify-icon icon="mdi:lightning-bolt" aria-hidden="true"></iconify-icon>
            <span className="info-label">Tốc độ sạc:</span>
            <span className="info-value">{car.chargingSpeed || '50'} kW</span>
          </div>
          <div className="info-row">
            <iconify-icon icon="mdi:wrench" aria-hidden="true"></iconify-icon>
            <span className="info-label">Tình trạng:</span>
            <span className="info-value">{car.technicalCondition || 'Tốt'}</span>
          </div>
          <div className="info-row">
            <iconify-icon icon="mdi:counter" aria-hidden="true"></iconify-icon>
            <span className="info-label">Tổng chuyến:</span>
            <span className="info-value">{car.tripCount || 0} chuyến</span>
          </div>
        </div>
        
        <div className="card-footer">
          <span className="price-per-day">
            {car.pricePerHour ? `${car.pricePerHour.toLocaleString()}đ/giờ` : 'Liên hệ'}
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
    station: searchParams.get('station') || '',
    stationId: searchParams.get('stationId') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    startTime: searchParams.get('startTime') || '',
    endTime: searchParams.get('endTime') || '',
    rentalType: searchParams.get('rentalType') || 'day',
    duration: searchParams.get('duration') || ''
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

  // State cho cars
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch vehicles - lọc theo trạm và thời gian
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const params = { status: 'AVAILABLE', limit: 100 };
        
        // Thêm stationId nếu có
        if (searchInfo.stationId) {
          params.stationId = searchInfo.stationId;
        }
        
        // Lấy tất cả xe AVAILABLE tại trạm
        const allVehicles = await getVehicles(params);
        
        let vehicles = [];
        
        // Xử lý response dựa trên structure
        if (Array.isArray(allVehicles)) {
          vehicles = allVehicles;
        } else if (allVehicles && allVehicles.content && Array.isArray(allVehicles.content)) {
          vehicles = allVehicles.content;
        } else if (allVehicles && Array.isArray(allVehicles.data)) {
          vehicles = allVehicles.data;
        } else {
          vehicles = [];
        }
        
        // Nếu có startDate và endDate, kiểm tra xe nào đã được booking
        if (searchInfo.startDate && searchInfo.endDate) {
          try {
            const bookedVehicleIds = await checkAvailability(
              searchInfo.startDate,
              searchInfo.endDate
            );
            
            // Lọc bỏ các xe đã được booking
            const availableVehicles = vehicles.filter(
              vehicle => !bookedVehicleIds.includes(vehicle.id)
            );
            setCars(availableVehicles || []);
          } catch (error) {
            console.error('Error checking availability:', error);
            // Nếu lỗi khi check availability, vẫn hiển thị tất cả xe
            setCars(vehicles || []);
          }
        } else {
          // Không có thời gian, hiển thị tất cả xe
          setCars(vehicles || []);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [searchInfo.stationId, searchInfo.startDate, searchInfo.endDate]);

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
                {searchInfo.station || searchInfo.location}
              </div>
              <div className="search-datetime">
                <iconify-icon icon="mdi:calendar"></iconify-icon>
                {formatSearchDisplay()}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="search-results-container">
          <div className="search-results-header">
            <div className="results-title">
              <h2>Chi tiết tìm kiếm xe</h2>
              <p className="results-count">{cars.length} xe được tìm thấy</p>
            </div>
          </div>

          {loading ? (
            <p className="loading-text">Đang tải xe...</p>
          ) : !cars || cars.length === 0 ? (
            <p className="no-results">Không có xe nào có sẵn.</p>
          ) : (
            <div className="search-results-grid car-list-grid">
              {cars.map((car) => (
                <CarCard 
                  key={car.id}
                  car={car}
                  searchParams={searchParams}
                />
              ))}
            </div>
          )}
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