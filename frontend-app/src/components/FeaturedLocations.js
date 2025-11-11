import React from 'react';

const LocationCard = ({ location }) => {
  return (
    <article className="location-card template-card">
      <img 
        src="/assets/images/locations/8-ra-khoi-tran-ngoc-anh-binh-thuan-1667047632857171856994.webp" 
        alt="Bình Thuận" 
        className="location-image"
        width="275"
        height="412"
        loading="lazy"
      />
      
      <div className="location-content">
        <h3>Bình Thuận</h3>
        <p className="stats">20+ Trạm - 100+ Xe</p>
      </div>
    </article>
  );
};

const FeaturedLocations = () => {
  // Tạo array 4 locations giống như trong HTML gốc
  const locations = Array(4).fill({});

  return (
    <section className="featured-locations" aria-labelledby="featured-locations-title">
      <h2 id="featured-locations-title">Địa Điểm Nổi Bật</h2>
      <div className="location-list-grid">
        {locations.map((location, index) => (
          <LocationCard key={index} location={location} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedLocations;