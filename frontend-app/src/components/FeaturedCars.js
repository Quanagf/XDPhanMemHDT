import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVehicles } from '../api/vehicleAPI';
import { getStations } from '../api/stations';

const statusClass = (status) => {
  switch (status) {
    case 'RENTED': return 'badge-rented';
    case 'RESERVED': return 'badge-reserved';
    default: return 'badge-available';
  }
};

const CarCard = ({ car }) => {
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const img = car.imageUrl || '/assets/images/cars/placeholder.webp';
  // Map station từ DTO (stationName, stationProvince) hoặc nested object (station.name, station.province)
  const stationName = car.stationName 
    ? `${car.stationName} - ${car.stationProvince}` 
    : car.station 
      ? `${car.station.name} - ${car.station.province}` 
      : 'Chưa xác định';

  // Check user and favorite status
  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        setUser(JSON.parse(userProfile));
      } catch (err) {
        console.error('Error parsing user profile:', err);
      }
    }

    // Check if this car is in favorites
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const isInFavorites = favorites.some(favCar => favCar.id === car.id);
    setIsFavorite(isInFavorites);
  }, [car.id]);

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Vui lòng đăng nhập để sử dụng tính năng yêu thích');
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const newFavorites = favorites.filter(favCar => favCar.id !== car.id);
      localStorage.setItem('userFavorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      // Add to favorites - save full car object with essential info
      const carToSave = {
        id: car.id,
        name: car.description || car.type,
        mainImage: car.imageUrl,
        pricePerHour: car.pricePerHour,
        seats: car.seats,
        transmission: car.transmission,
        stationName: car.stationName 
          ? `${car.stationName} - ${car.stationProvince}` 
          : car.station 
            ? `${car.station.name} - ${car.station.province}` 
            : 'Chưa xác định'
      };
      
      const newFavorites = [...favorites, carToSave];
      localStorage.setItem('userFavorites', JSON.stringify(newFavorites));
      setIsFavorite(true);
    }
    
    // Trigger event để các component khác biết favorites đã thay đổi
    window.dispatchEvent(new Event('favoritesUpdated'));
  };
  
  return (
    <article className="car-card">
      <div className="featured-car-img-wrapper">
        <Link to={`/car/${car.id}`} className="car-card-link">
          <img 
            src={img} 
            alt={car.description || car.type || 'Xe'}
            className="car-image"
            width="300" 
            height="200"
            loading="lazy"
          />
        </Link>
        
        {user && (
          <button 
            className={`featured-heart-btn ${isFavorite ? 'is-favorited' : ''}`}
            onClick={handleFavoriteToggle}
            title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
          >
            <iconify-icon 
              icon={isFavorite ? 'material-symbols:favorite' : 'material-symbols:favorite-outline'}
            ></iconify-icon>
          </button>
        )}
      </div>
      <div className="card-details">
        <h3>
          <Link to={`/car/${car.id}`}>{car.description || car.type}</Link>
        </h3>

        <div className="info-group">
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
          <span className={`status-badge ${statusClass(car.status)}`}>
            {car.status === 'AVAILABLE' ? 'Có sẵn' : car.status === 'RENTED' ? 'Đang cho thuê' : 'Đã đặt trước'}
          </span>
        </div>
      </div>
    </article>
  );
};

const FeaturedCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch vehicles cho trang chủ
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const data = await getVehicles({ limit: 50 });
        
        let vehicles = [];
        
        // Xử lý response dựa trên structure
        if (Array.isArray(data)) {
          vehicles = data;
        } else if (data && data.content && Array.isArray(data.content)) {
          vehicles = data.content;
        } else if (data && Array.isArray(data.data)) {
          vehicles = data.data;
        } else {
          vehicles = [];
        }
        
        // Filter chỉ xe AVAILABLE và giới hạn 9 xe
        const availableVehicles = vehicles.filter(car => car.status === 'AVAILABLE').slice(0, 9);
        setCars(availableVehicles);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  return (
    <section className="featured-cars" aria-labelledby="featured-cars-title">
      <div className="section-header">
        <h2 id="featured-cars-title">Xe Có Sẵn</h2>
      </div>

      {loading ? (
        <p className="loading-text">Đang tải xe...</p>
      ) : !cars || cars.length === 0 ? (
        <p className="no-results">Không có xe nào có sẵn.</p>
      ) : (
        <div className="car-list-grid">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedCars;