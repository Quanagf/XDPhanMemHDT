import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import vehicleService from '../utils/vehicleService';

const statusClass = (status) => {
  switch (status) {
    case 'RENTED': return 'badge-rented';
    case 'RESERVED': return 'badge-reserved';
    default: return 'badge-available';
  }
};

const CarCard = ({ car }) => {
  const img = car.image_url || '/assets/images/cars/placeholder.webp';
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
            <span>{car.station_id || 'Chưa xác định'}</span>
          </div>
        </div>

        <div className="card-footer">
          <span className="price-per-day">
            {car.price_per_hour ? `${car.price_per_hour.toLocaleString()}đ/giờ` : 'Liên hệ'}
          </span>
          <span className={`status-badge ${statusClass(car.status)}`}>
            {car.status === 'AVAILABLE' ? 'Trống' : car.status === 'RENTED' ? 'Đang cho thuê' : 'Đã đặt trước'}
          </span>
        </div>
      </div>
    </article>
  );
};

const FeaturedCars = () => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const data = vehicleService.getVehicles();
    setCars(data || []);
  }, []);

  if (!cars || cars.length === 0) {
    return (
      <section className="featured-cars" aria-labelledby="featured-cars-title">
        <h2 id="featured-cars-title">Xe Dành Cho Bạn</h2>
        <p>Hiện chưa có xe hiển thị.</p>
      </section>
    );
  }

  return (
    <section className="featured-cars" aria-labelledby="featured-cars-title">
      <h2 id="featured-cars-title">Xe Dành Cho Bạn</h2>
      <div className="car-list-grid">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCars;