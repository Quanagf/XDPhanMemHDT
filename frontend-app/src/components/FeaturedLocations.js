import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix cho marker icon trong Leaflet với React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FeaturedLocations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      if (response.ok) {
        const data = await response.json();
        // Lấy tối đa 10 trạm nổi bật
        setStations(data.slice(0, 10));
      } else {
        console.error('Failed to fetch stations');
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán center của bản đồ dựa trên các trạm
  const getMapCenter = () => {
    if (stations.length === 0) return [10.762622, 106.660172]; // TP.HCM mặc định
    
    const avgLat = stations.reduce((sum, station) => sum + station.latitude, 0) / stations.length;
    const avgLng = stations.reduce((sum, station) => sum + station.longitude, 0) / stations.length;
    
    return [avgLat, avgLng];
  };

  if (loading) {
    return (
      <section className="featured-locations" aria-labelledby="featured-locations-title">
        <h2 id="featured-locations-title">Trạm Nổi Bật</h2>
        <div className="loading-state">Đang tải...</div>
      </section>
    );
  }

  return (
    <section className="featured-locations" aria-labelledby="featured-locations-title">
      <div className="featured-locations-header">
        <h2 id="featured-locations-title">Trạm Nổi Bật</h2>
        <button 
          className="toggle-map-btn"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? '📋 Xem danh sách' : '🗺️ Xem bản đồ'}
        </button>
      </div>

      {showMap ? (
        <div className="stations-map-container">
          <MapContainer 
            center={getMapCenter()} 
            zoom={12} 
            style={{ height: '500px', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stations.map((station) => (
              <Marker 
                key={station.id} 
                position={[station.latitude, station.longitude]}
              >
                <Popup>
                  <div className="station-popup">
                    <h3>{station.name}</h3>
                    <p>📍 {station.address}</p>
                    <p>📞 {station.phoneNumber || 'Chưa cập nhật'}</p>
                    {station.vehicleCount > 0 && (
                      <p>🚗 {station.vehicleCount} xe khả dụng</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="stations-grid">
          {stations.map((station) => (
            <article key={station.id} className="station-card">
              <div className="station-icon">📍</div>
              <div className="station-content">
                <h3>{station.name}</h3>
                <p className="station-address">{station.address}</p>
                {station.phoneNumber && (
                  <p className="station-phone">📞 {station.phoneNumber}</p>
                )}
                {station.vehicleCount > 0 && (
                  <p className="station-vehicles">🚗 {station.vehicleCount} xe khả dụng</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {stations.length === 0 && (
        <div className="empty-state">
          <p>Chưa có trạm nào được thêm.</p>
        </div>
      )}
    </section>
  );
};

export default FeaturedLocations;