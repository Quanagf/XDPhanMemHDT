import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';


const Profile = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [activeSection, setActiveSection] = useState('account');

  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        setUser(JSON.parse(userProfile));
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    }
  }, []);

  const handleOpenLogin = (callback) => {
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    setUser(null);
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="profile-container">
        <Header onOpenLogin={handleOpenLogin} />
        <main className="profile-login-prompt">
          <h2>Vui lòng đăng nhập để xem thông tin cá nhân</h2>
          <button 
            onClick={() => handleOpenLogin()}
            className="profile-login-button"
          >
            Đăng nhập
          </button>
        </main>
        <Footer />
        {showLogin && <Login onClose={handleCloseLogin} />}
      </div>
    );
  }

  const renderAccountInfo = () => (
    <div className="profile-content-container">
      {/* Personal Information Box */}
      <div className="profile-box">
        <div className="profile-box-header">
          <h3 className="profile-box-title">Thông tin tài khoản</h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile-edit-icon">
            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>

        <div className="profile-account-grid">
          {/* Left side - Avatar and basic info */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {(user.fullName || user.username || 'J').charAt(0).toUpperCase()}
            </div>
            <h4 className="profile-user-name">Jack - 97</h4>
            <p className="profile-join-date">Tham gia: 01/01/2026</p>
          </div>

          {/* Right side - Personal details */}
          <div className="profile-info-section">
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Ngày sinh</span>
                <span className="profile-info-value">--/--/---</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Giới tính</span>
                <span className="profile-info-value">---</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Số điện thoại</span>
                <span className="profile-info-value"></span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Địa chỉ</span>
                <span className="profile-info-value"></span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value"></span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Google</span>
                <span className="profile-info-value"></span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Facebook</span>
                <span className="profile-info-value"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver License Box */}
      <div className="profile-box">
        <div className="profile-box-header">
          <h3 className="profile-box-title">Giấy phép lái xe</h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile-edit-icon">
            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>

        <div className="profile-document-grid">
          {/* Image upload area */}
          <div className="profile-upload-section">
            <label className="profile-upload-label">Hình ảnh</label>
            <div className="profile-upload-area">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" className="profile-upload-icon">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="profile-upload-text">Chưa có tập tin</p>
            </div>
          </div>

          {/* License info */}
          <div className="profile-document-info">
            <label className="profile-document-label">Thông tin chung</label>
            <div className="profile-document-grid-info">
              <div className="profile-info-item">
                <span className="profile-info-label">Số GPLX</span>
                <span className="profile-info-value"></span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Họ và tên</span>
                <span className="profile-info-value"></span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Ngày sinh</span>
                <span className="profile-info-value"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card Box */}
      <div className="profile-box">
        <div className="profile-box-header">
          <h3 className="profile-box-title">Căn cước công dân</h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile-edit-icon">
            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>

        <div className="profile-document-grid">
          {/* Image upload area */}
          <div className="profile-upload-section">
            <label className="profile-upload-label">Hình ảnh</label>
            <div className="profile-upload-area">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" className="profile-upload-icon">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="profile-upload-text">Chưa có tập tin</p>
            </div>
          </div>

          {/* ID info */}
          <div className="profile-document-info">
            <label className="profile-document-label">Thông tin chung</label>
            <div className="profile-document-grid-info">
              <div className="profile-info-item">
                <span className="profile-info-label">Số CCCD</span>
                <span className="profile-info-value"></span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Họ và tên</span>
                <span className="profile-info-value"></span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Ngày sinh</span>
                <span className="profile-info-value"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountInfo();
      case 'favorites':
        return (
          <div className="profile-box">
            <h2>Xe yêu thích</h2>
            <p>Chưa có xe yêu thích nào.</p>
          </div>
        );
      case 'trips':
        return (
          <div className="profile-box">
            <h2>Chuyến của tôi</h2>
            <p>Chưa có chuyến đi nào.</p>
          </div>
        );
      case 'password':
        return (
          <div className="profile-box">
            <h2>Đổi mật khẩu</h2>
            <p>Chức năng đổi mật khẩu.</p>
          </div>
        );
      case 'delete':
        return (
          <div className="profile-box">
            <h2>Yêu cầu xóa tài khoản</h2>
            <p>Chức năng xóa tài khoản.</p>
          </div>
        );
      default:
        return renderAccountInfo();
    }
  };

  return (
    <div className="profile-container">
      <Header onOpenLogin={handleOpenLogin} />
      
      <main className="profile-main">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-sidebar-header">
            <h1 className="profile-sidebar-title">FEV - SAY HI!</h1>
          </div>

          <nav className="profile-nav">
            <div className={`profile-nav-item ${activeSection === 'account' ? 'with-border' : 'without-border'}`}>
              <button
                onClick={() => setActiveSection('account')}
                className={`profile-nav-button ${activeSection === 'account' ? 'active' : ''}`}
              >
                <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Tài khoản của tôi
              </button>
            </div>

            <div className={`profile-nav-item ${activeSection === 'favorites' ? 'with-border' : 'without-border'}`}>
              <button
                onClick={() => setActiveSection('favorites')}
                className={`profile-nav-button ${activeSection === 'favorites' ? 'active' : ''}`}
              >
                <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Xe yêu thích
              </button>
            </div>

            <div className={`profile-nav-item ${activeSection === 'trips' ? 'with-border' : 'without-border'}`}>
              <button
                onClick={() => setActiveSection('trips')}
                className={`profile-nav-button ${activeSection === 'trips' ? 'active' : ''}`}
              >
                <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Chuyến của tôi
              </button>
            </div>

            <div className="profile-nav-separator">
              <div className={`profile-nav-item ${activeSection === 'password' ? 'with-border' : 'without-border'}`}>
                <button
                  onClick={() => setActiveSection('password')}
                  className={`profile-nav-button ${activeSection === 'password' ? 'active' : ''}`}
                >
                  <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Đổi mật khẩu
                </button>
              </div>

              <div className={`profile-nav-item ${activeSection === 'delete' ? 'with-border' : 'without-border'}`}>
                <button
                  onClick={() => setActiveSection('delete')}
                  className={`profile-nav-button ${activeSection === 'delete' ? 'active' : ''}`}
                >
                  <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                  </svg>
                  Yêu cầu xóa tài khoản
                </button>
              </div>

              <div className="profile-nav-logout-section">
                <button
                  onClick={handleLogout}
                  className="profile-nav-button logout"
                >
                  <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {renderContent()}
        </div>
      </main>

      <Footer />
      {showLogin && <Login onClose={handleCloseLogin} />}
    </div>
  );
};

export default Profile;