import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVehicles } from '../api/vehicles';
import { getStations } from '../api/stations';

const statusClass = (status) => {
  switch (status) {
    case 'RENTED': return 'badge-rented';
    case 'RESERVED': return 'badge-reserved';
    default: return 'badge-available';
  }
};

const CarCard = ({ car }) => {
  const img = car.imageUrl || '/assets/images/cars/placeholder.webp';
  const stationName = car.station ? `${car.station.name} - ${car.station.province}` : 'Chưa xác định';
  
  return (
    <article className="car-card">
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
            <span>{car.seats || 'N/A'} chỗ</span>
          </div>
          <div className="info-row">
            <iconify-icon icon="mdi:battery-charging" aria-hidden="true"></iconify-icon>
            <span>{car.batteryLevel}%</span>
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

  // Fetch 9 vehicles có sẵn cho trang chủ (KHÔNG có filter)
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const data = await getVehicles({ status: 'AVAILABLE' });
        // Giới hạn 9 xe cho trang chủ
        setCars((data || []).slice(0, 9));
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