import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/favorite-cars-list.css';

const FavoriteCarsList = () => {
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin user
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      setUser(JSON.parse(userProfile));
    }

    // Function to load favorites
    const loadFavorites = () => {
      const favoritesList = localStorage.getItem('userFavorites');
      if (favoritesList) {
        try {
          const parsedFavorites = JSON.parse(favoritesList);
          setFavorites(parsedFavorites);
        } catch (error) {
          console.error('Error parsing favorites:', error);
          setFavorites([]);
        }
      }
    };

    // Load favorites initially
    loadFavorites();

    // Listen for favorites updates
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  // Hàm xóa xe khỏi danh sách yêu thích
  const handleRemoveFromFavorites = (carId) => {
    const updatedFavorites = favorites.filter(car => car.id !== carId);
    setFavorites(updatedFavorites);
    
    // Cập nhật localStorage
    localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
    
    // Trigger event để các component khác cập nhật
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  // Hàm format giá tiền
  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    return `${price.toLocaleString('vi-VN')}đ`;
  };

  if (favorites.length === 0) {
    return (
      <div className="favorites-empty-state">
        <div className="favorites-empty-icon">
          <img 
            src="/assets/images/no data/Gemini_Generated_Image_tufjhwtufjhwtufj-removebg-preview.png" 
            alt="Không có xe yêu thích" 
            className="profile-not-favorites-image"
          />
        </div>
        <h3 className="profile-favorites-empty-title">Bạn chưa có xe yêu thích nào</h3>
        <p className="profile-favorites-empty-text">
          Hãy khám phá và thêm những chiếc xe bạn yêu thích vào danh sách!
        </p>
        <Link to="/" className="profile-browse-cars-btn">
          Khám phá xe
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-favorites-content">
      <div className="profile-favorites-header">
        <h3 className="profile-favorites-count">
          Xe yêu thích ({favorites.length})
        </h3>
      </div>
      
      <div className="profile-favorites-grid">
        {favorites.map((car) => (
          <div key={car.id} className="profile-favorite-card">
            {/* Hình ảnh xe */}
            <div className="profile-favorite-img-wrapper">
              <img 
                src={car.imageUrl || car.mainImage || '/assets/images/default-car.jpg'} 
                alt={car.type || car.name || 'Xe điện'}
                className="profile-favorite-img"
                onError={(e) => {
                  e.target.src = '/assets/images/default-car.jpg';
                }}
              />
              
              {/* Nút xóa khỏi yêu thích */}
              <button 
                className="profile-remove-favorite-btn"
                onClick={() => handleRemoveFromFavorites(car.id)}
                title="Xóa khỏi yêu thích"
              >
                <iconify-icon icon="ph:heart-fill" style={{color: '#ff4757'}}></iconify-icon>
              </button>
            </div>

            {/* Thông tin xe */}
            <div className="profile-favorite-info">
              <h4 className="profile-favorite-name">{car.type || car.name || car.model || 'Tên xe'}</h4>
              
              <div className="profile-favorite-details">
                <div className="profile-favorite-specs">
                  <span className="profile-favorite-spec">
                    <iconify-icon icon="mdi:car-seat"></iconify-icon>
                    {car.seats || 'N/A'} chỗ
                  </span>
                  <span className="profile-favorite-spec">
                    <iconify-icon icon="mdi:car-shift-pattern"></iconify-icon>
                    {car.type || car.transmission || 'Xe điện'}
                  </span>
                </div>
                
                <div className="profile-favorite-location">
                  <iconify-icon icon="mdi:map-marker"></iconify-icon>
                  <span>{car.stationName || car.station?.name || car.location || 'Chưa xác định'}</span>
                </div>
              </div>

              <div className="profile-favorite-footer">
                <div className="profile-favorite-price">
                  <span className="profile-price-amount">
                    {formatPrice(car.pricePerHour)}/giờ
                  </span>
                </div>
                
                <Link 
                  to={`/car/${car.id}`} 
                  className="profile-view-detail-btn"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteCarsList;