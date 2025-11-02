import React from 'react';

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
              <iconify-icon icon="mdi:gas-station-outline" aria-hidden="true"></iconify-icon> 4 Ghế
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

const FeaturedCars = () => {
  // Tạo array 6 xe giống như trong HTML gốc
  const cars = Array(6).fill({});

  return (
    <section className="featured-cars" aria-labelledby="featured-cars-title">
      <h2 id="featured-cars-title">Xe Dành Cho Bạn</h2>
      <div className="car-list-grid">
        {cars.map((car, index) => (
          <CarCard key={index} car={car} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCars;