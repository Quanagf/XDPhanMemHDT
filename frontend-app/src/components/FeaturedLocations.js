import React, { useState, useEffect } from 'react';

const LocationCard = ({ province, stationCount, onClick }) => {
  return (
    <article 
      className="location-card template-card" 
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <img 
        src="/assets/images/locations/8-ra-khoi-tran-ngoc-anh-binh-thuan-1667047632857171856994.webp" 
        alt={province} 
        className="location-image"
        width="275"
        height="412"
        loading="lazy"
      />
      
      <div className="location-content">
        <h3>{province}</h3>
        <p className="stats">{stationCount} chi nhánh</p>
      </div>
    </article>
  );
};

const FeaturedLocations = () => {
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [stations, setStations] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Lấy danh sách tỉnh/thành phố và đếm số trạm
    fetch('/api/stations/active')
      .then(response => response.json())
      .then(data => {
        // Nhóm các trạm theo tỉnh
        const provinceMap = {};
        data.forEach(station => {
          if (!provinceMap[station.province]) {
            provinceMap[station.province] = {
              name: station.province,
              count: 0,
              stations: []
            };
          }
          provinceMap[station.province].count++;
          provinceMap[station.province].stations.push(station);
        });
        
        // Chuyển thành array và lấy top 4
        const provinceArray = Object.values(provinceMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);
        
        setProvinces(provinceArray);
      })
      .catch(error => console.error('Error fetching provinces:', error));
  }, []);

  const handleLocationClick = (province) => {
    setSelectedProvince(province.name);
    setStations(province.stations);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProvince(null);
    setStations([]);
  };

  return (
    <>
      <section className="featured-locations" aria-labelledby="featured-locations-title">
        <h2 id="featured-locations-title">Địa Điểm Nổi Bật</h2>
        <div className="location-list-grid">
          {provinces.map((province, index) => (
            <LocationCard 
              key={index} 
              province={province.name} 
              stationCount={province.count}
              onClick={() => handleLocationClick(province)}
            />
          ))}
        </div>
      </section>

      {/* Modal hiển thị các trạm */}
      {showModal && (
        <div 
          className="station-modal-overlay" 
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="station-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              width: '90%'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '2px solid #00D084'
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>
                Các chi nhánh tại {selectedProvince}:
              </h2>
              <button 
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#666',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stations.map((station) => (
                <div 
                  key={station.id}
                  style={{
                    padding: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    backgroundColor: '#f9f9f9',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f9f5';
                    e.currentTarget.style.borderColor = '#00D084';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#E0F7EF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0
                    }}>
                      📍
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '18px',
                        color: '#333'
                      }}>
                        {station.name}
                      </h3>
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        color: '#666',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {station.address}
                      </p>
                      <p style={{ 
                        margin: 0, 
                        color: '#00D084',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        📞 {station.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturedLocations;