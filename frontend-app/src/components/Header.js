import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ onOpenLogin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [logoutNotification, setLogoutNotification] = useState({ show: false, message: '' });
  
  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userProfile = localStorage.getItem('userProfile');
    
    if (token && userProfile) {
      try {
        setUser(JSON.parse(userProfile));
      } catch (error) {
        console.error('Error parsing user profile:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userRole');
      }
    }
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);
  
  const handleLoginClick = (e) => {
    e.preventDefault();
    onOpenLogin();
  };

  const handleLoginSuccess = (userProfile, token) => {
    setUser(userProfile);
  };

  const handleLogout = () => {
    // Xóa thông tin đăng nhập
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    setUser(null);
    setShowUserMenu(false);
    
    // Hiển thị thông báo đăng xuất
    setLogoutNotification({
      show: true,
      message: '👋 Đã đăng xuất!'
    });
    
    // Chuyển về trang chủ sau 1.5 giây
    setTimeout(() => {
      navigate('/');
      // Ẩn thông báo sau khi chuyển trang
      setTimeout(() => {
        setLogoutNotification({ show: false, message: '' });
      }, 500);
    }, 1000);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "Chào mừng đến với FEV",
      message: "Chào mừng bạn tham gia cộng đồng FEV - Fast Electric Vehicle, khám phá ngay những xe điện hiện đại và trải nghiệm thuê xe thông minh.",
      time: "2 ngày trước",
      isRead: false,
      type: "welcome"
    },
    {
      id: 2,
      title: "Khuyến mãi đặc biệt", 
      message: "Giảm 20% cho chuyến đi đầu tiên! Sử dụng mã FEVFIRST khi đặt xe điện để nhận ưu đãi hấp dẫn.",
      time: "1 tuần trước",
      isRead: false,
      type: "promotion"
    },
    {
      id: 3,
      title: "Cập nhật tính năng mới",
      message: "FEV vừa ra mắt tính năng theo dõi pin xe điện thời gian thực và tìm trạm sạc gần nhất. Trải nghiệm ngay!",
      time: "2 tuần trước",
      isRead: true,
      type: "update"
    },
    {
      id: 4,
      title: "Chuyến đi thành công",
      message: "Cảm ơn bạn đã hoàn thành chuyến đi. Đánh giá trải nghiệm của bạn để giúp FEV cải thiện dịch vụ nhé!",
      time: "3 tuần trước",
      isRead: true,
      type: "trip"
    }
  ];

  // Cập nhật onOpenLogin để truyền callback
  const handleOpenLogin = () => {
    if (onOpenLogin) {
      onOpenLogin(handleLoginSuccess);
    }
  };

  return (
    <>
      <div className="top-green-bar"></div>
      
      {/* Logout Notification */}
      {logoutNotification.show && (
        <div className="notification success" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999
        }}>
          <div className="notification-content">
            <div className="notification-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
            <span className="notification-message">{logoutNotification.message}</span>
          </div>
        </div>
      )}
      
      <header className="main-header" role="banner">
        <div className="header-container">
          <Link to="/" className="logo-link" aria-label="Trang chủ FEV">
            <img 
              src="/assets/images/logo/Gemini_Generated_Image_3rs8943rs8943rs8-removebg.png" 
              alt="Logo FEV" 
              className="fev-logo-icon" 
              width="153" 
              height="87"
            />
          </Link>
          
          <nav className="main-nav" role="navigation">
            <ul>
              <li>
                <Link 
                  to="/" 
                  className={location.pathname === '/' ? 'active' : ''}
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  TRANG CHỦ
                </Link>
              </li>
              <li>
                <Link 
                  to="/gioi-thieu-fev"
                  className={location.pathname === '/gioi-thieu-fev' ? 'active' : ''}
                  aria-current={location.pathname === '/gioi-thieu-fev' ? 'page' : undefined}
                >
                  GIỚI THIỆU FEV
                </Link>
              </li>
              <li>
                <Link 
                  to="/lien-he"
                  className={location.pathname === '/lien-he' ? 'active' : ''}
                  aria-current={location.pathname === '/lien-he' ? 'page' : undefined}
                >
                  LIÊN HỆ
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile?section=trips"
                  className={location.pathname === '/profile' && new URLSearchParams(location.search).get('section') === 'trips' ? 'active' : ''}
                  aria-current={location.pathname === '/profile' && new URLSearchParams(location.search).get('section') === 'trips' ? 'page' : undefined}
                >
                  CHUYẾN CỦA TÔI
                </Link>
              </li>
            </ul>
          </nav>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Notification Icon */}
              <div className="notification-container" style={{ position: 'relative' }}>
                <button 
                  onClick={toggleNotifications}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#333',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  title="Thông báo"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {/* Notification badge */}
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ff4757',
                    borderRadius: '50%'
                  }}></div>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div 
                    className="notifications-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      width: '380px',
                      zIndex: 1000,
                      marginTop: '8px',
                      maxHeight: '400px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '18px', 
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Thông báo
                      </h3>
                    </div>

                    {/* Notifications List */}
                    <div style={{
                      maxHeight: '350px',
                      overflowY: 'auto',
                      scrollbarWidth: 'none', /* Firefox */
                      msOverflowStyle: 'none'  /* IE and Edge */
                    }}
                    className="notifications-scroll"
                    >
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #f8f8f8',
                            display: 'flex',
                            gap: '12px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          {/* Notification Icon */}
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#47C778',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                          </div>

                          {/* Notification Content */}
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              margin: '0 0 4px 0',
                              fontSize: '15px',
                              fontWeight: '600',
                              color: '#333'
                            }}>
                              {notification.title}
                            </h4>
                            <p style={{
                              margin: '0 0 8px 0',
                              fontSize: '14px',
                              color: '#666',
                              lineHeight: '1.4'
                            }}>
                              {notification.message}
                            </p>
                            <span style={{
                              fontSize: '12px',
                              color: '#999'
                            }}>
                              {notification.time}
                            </span>
                          </div>

                          {/* Unread indicator */}
                          {!notification.isRead && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#47C778',
                              marginTop: '6px'
                            }}></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Icon */}
              <Link 
                to="/chatbot"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#333',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                title="Trò chuyện với BTSTQ"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </Link>

              {/* User Menu */}
              <div className="user-menu-container" style={{ position: 'relative' }}>
                <button 
                  onClick={toggleUserMenu} 
                  className="user-menu-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#333',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#666',
                    backgroundImage: 'linear-gradient(45deg, #666, #999)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}>
                    {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  
                  {/* User name display */}
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>
                    {user.fullName || user.username}
                  </span>
                  
                  {/* Dropdown arrow */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div 
                    className="user-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      minWidth: '220px',
                      zIndex: 1000,
                      marginTop: '8px'
                    }}
                  >
                    {/* User info header */}
                    <div style={{
                      padding: '16px',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#666',
                        backgroundImage: 'linear-gradient(45deg, #666, #999)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#fff'
                      }}>
                        {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
                          {user.fullName || user.username}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                    
                    <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                      <li>
                        <Link 
                          to="/profile?section=account"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            color: '#333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          Thông tin cá nhân
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/profile?section=trips&tab=history"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            color: '#333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          Lịch sử thuê xe
                        </Link>
                      </li>
                      <li style={{ borderTop: '1px solid #eee', marginTop: '4px', paddingTop: '4px' }}>
                        <button 
                          onClick={handleLogout}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '12px 16px',
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16,17 21,12 16,7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={handleOpenLogin} className="login-btn" role="button">ĐĂNG NHẬP</button>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;