import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';


const Profile = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [activeTripsTab, setActiveTripsTab] = useState('current');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    address: '',
    birthDate: '',
    gender: '',
    facebook: ''
  });

  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        const parsedUser = JSON.parse(userProfile);
        setUser(parsedUser);
        // Khởi tạo form với dữ liệu hiện tại (chỉ các trường được phép sửa)
        setEditForm({
          address: parsedUser.address || '',
          birthDate: parsedUser.birthDate || '',
          gender: parsedUser.gender || '',
          facebook: parsedUser.facebook || ''
        });
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    }
  }, []);

  // Xử lý URL query parameters để tự động chuyển đến section tương ứng
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    const tab = searchParams.get('tab');
    
    if (section && ['account', 'favorites', 'trips', 'password'].includes(section)) {
      setActiveSection(section);
    }
    
    // Nếu section là trips và có tab parameter, set activeTripsTab
    if (section === 'trips' && tab && ['current', 'history', 'overview'].includes(tab)) {
      setActiveTripsTab(tab);
    }
  }, [location.search]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Chỉ gửi các trường có giá trị (loại bỏ empty string)
      const updateData = {};
      if (editForm.address && editForm.address.trim()) {
        updateData.address = editForm.address.trim();
      }
      if (editForm.birthDate) {
        updateData.birthDate = editForm.birthDate;
      }
      if (editForm.gender && editForm.gender.trim()) {
        updateData.gender = editForm.gender.trim();
      }
      if (editForm.facebook && editForm.facebook.trim()) {
        updateData.facebook = editForm.facebook.trim();
      }
      
      console.log('Sending update request with data:', updateData);
      
      const response = await fetch('http://localhost:8081/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Updated user:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
        setIsEditing(false);
        alert('Cập nhật thông tin thành công!');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert(`Có lỗi xảy ra: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Có lỗi xảy ra khi cập nhật thông tin: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--/--/---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatCreatedDate = (dateString) => {
    if (!dateString) return '01/01/2026';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="profile-edit-icon"
            onClick={isEditing ? handleSaveProfile : handleEditToggle}
            style={{ cursor: 'pointer' }}
          >
            {isEditing ? (
              <path d="M5 13l4 4L19 7" /> // Save icon (checkmark)
            ) : (
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            )}
          </svg>
        </div>

        <div className="profile-account-grid">
          {/* Left side - Avatar and basic info */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
            </div>
            <h4 className="profile-user-name">{user.fullName || user.username || 'User'}</h4>
            <p className="profile-join-date">Tham gia: {formatCreatedDate(user.createdAt)}</p>
          </div>

          {/* Right side - Personal details */}
          <div className="profile-info-section">
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Ngày sinh</span>
                {isEditing ? (
                  <input
                    type="date"
                    name="birthDate"
                    value={editForm.birthDate}
                    onChange={handleInputChange}
                    className="profile-info-input"
                  />
                ) : (
                  <span className="profile-info-value">{formatDate(user.birthDate)}</span>
                )}
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Giới tính</span>
                {isEditing ? (
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleInputChange}
                    className="profile-info-input"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <span className="profile-info-value">{user.gender || '---'}</span>
                )}
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Số điện thoại</span>
                <span className="profile-info-value">{user.phoneNumber || '---'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Địa chỉ</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    className="profile-info-input"
                  />
                ) : (
                  <span className="profile-info-value">{user.address || '---'}</span>
                )}
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{user.email || '---'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Facebook</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="facebook"
                    value={editForm.facebook}
                    onChange={handleInputChange}
                    className="profile-info-input"
                    placeholder="Link Facebook của bạn"
                  />
                ) : (
                  <span className="profile-info-value">{user.facebook || '---'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver License Box - CHỈ HIỂN thị, không cho chỉnh sửa */}
      <div className="profile-box">
        <div className="profile-box-header">
          <h3 className="profile-box-title">Giấy phép lái xe</h3>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>(Cập nhật riêng)</span>
        </div>

        <div className="profile-document-grid">
          {/* Image upload area */}
          <div className="profile-upload-section">
            <label className="profile-upload-label">Hình ảnh</label>
            <div className="profile-upload-area">
              {user.licenseImage ? (
                <img src={user.licenseImage} alt="License" style={{ maxWidth: '100%', maxHeight: '200px' }} />
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" className="profile-upload-icon">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="profile-upload-text">Chưa có tập tin</p>
                </>
              )}
            </div>
          </div>

          {/* License info - CHỈ HIỂN THỊ */}
          <div className="profile-document-info">
            <label className="profile-document-label">Thông tin chung</label>
            <div className="profile-document-grid-info">
              <div className="profile-info-item">
                <span className="profile-info-label">Số GPLX</span>
                <span className="profile-info-value">{user.licenseNumber || '---'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Họ và tên</span>
                <span className="profile-info-value">{user.fullName || '---'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Ngày sinh</span>
                <span className="profile-info-value">{formatDate(user.birthDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card Box - CHỈ HIỂN thị, không cho chỉnh sửa */}
      <div className="profile-box">
        <div className="profile-box-header">
          <h3 className="profile-box-title">Căn cước công dân</h3>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>(Cập nhật riêng)</span>
        </div>

        <div className="profile-document-grid">
          {/* Image upload area */}
          <div className="profile-upload-section">
            <label className="profile-upload-label">Hình ảnh</label>
            <div className="profile-upload-area">
              {user.identityImage ? (
                <img src={user.identityImage} alt="ID Card" style={{ maxWidth: '100%', maxHeight: '200px' }} />
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" className="profile-upload-icon">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="profile-upload-text">Chưa có tập tin</p>
                </>
              )}
            </div>
          </div>

          {/* ID info - CHỈ HIỂN THỊ */}
          <div className="profile-document-info">
            <label className="profile-document-label">Thông tin chung</label>
            <div className="profile-document-grid-info">
              <div className="profile-info-item">
                <span className="profile-info-label">Số CCCD</span>
                <span className="profile-info-value">{user.identityNumber || '---'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Họ và tên</span>
                <span className="profile-info-value">{user.fullName || '---'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Ngày sinh</span>
                <span className="profile-info-value">{formatDate(user.birthDate)}</span>
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
          <div className="profile-content-container">
            <div className="profile-box favorites-box">
              <div className="profile-box-header">
                <h3 className="profile-box-title">Xe yêu thích của tôi</h3>
              </div>
              
              {/* Empty state for favorites */}
              <div className="favorites-empty-state">
                <div className="favorites-empty-icon">
                  <img 
                    src="/assets/images/no data/Gemini_Generated_Image_tufjhwtufjhwtufj-removebg-preview.png" 
                    alt="Không có xe yêu thích" 
                    className="no-favorites-image"
                  />
                </div>
                <p className="favorites-empty-text">Bạn chưa có xe yêu thích nào</p>
              </div>
            </div>
          </div>
        );
      case 'trips':
        const renderTripsContent = () => {
          // All tabs show the same empty state for now
          return (
            <div className="trips-empty-state">
              <div className="trips-empty-icon">
                <img 
                  src="/assets/images/no data/Gemini_Generated_Image_8hczgs8hczgs8hcz-removebg-preview.png" 
                  alt="No trips available" 
                  className="no-trips-image"
                />
              </div>
              <p className="trips-empty-text">Bạn chưa có chuyến</p>
            </div>
          );
        };

        return (
          <div className="profile-content-container">
            <div className="profile-box trips-box">
              <div className="profile-box-header">
                <h2 className="profile-box-title centered-title">Chuyến của tôi</h2>
              </div>
              
              {/* Trip Tabs */}
              <div className="trip-tabs">
                <button 
                  className={`trip-tab ${activeTripsTab === 'current' ? 'active' : ''}`}
                  onClick={() => setActiveTripsTab('current')}
                >
                  Chuyến hiện tại
                </button>
                <button 
                  className={`trip-tab ${activeTripsTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTripsTab('history')}
                >
                  Lịch sử chuyến
                </button>
                <button 
                  className={`trip-tab ${activeTripsTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTripsTab('overview')}
                >
                  Tổng quan chuyến
                </button>
              </div>

              {/* Trip Content */}
              <div className="trip-content">
                {renderTripsContent()}
              </div>
            </div>
          </div>
        );
      case 'password':
        return (
          <div className="profile-content-container">
            <div className="profile-box password-box">
              <div className="password-header">
                <h3 className="password-title">Đổi mật khẩu</h3>
                <p className="password-subtitle">Vui lòng nhập mật khẩu hiện tại để cài đặt lại mật khẩu mới!</p>
              </div>
              
              <div className="password-form">
                <div className="password-section">
                  <div className="password-field">
                    <label className="password-label">Nhập mật khẩu hiện tại</label>
                    <div className="password-input-container">
                      <input 
                        type="password" 
                        className="password-input"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button type="button" className="password-toggle">
                        <svg className="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M1 1l22 22"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="password-field">
                    <label className="password-label">Nhập mật khẩu mới</label>
                    <div className="password-input-container">
                      <input 
                        type="password" 
                        className="password-input"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button type="button" className="password-toggle">
                        <svg className="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M1 1l22 22"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="password-field">
                    <label className="password-label">Xác nhận mật khẩu mới</label>
                    <div className="password-input-container">
                      <input 
                        type="password" 
                        className="password-input"
                        placeholder="Xác nhận mật khẩu mới"
                      />
                      <button type="button" className="password-toggle">
                        <svg className="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M1 1l22 22"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="password-actions">
                    <button className="password-confirm-btn">Xác nhận</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderAccountInfo();
    }
  };

  // Render delete account page
  const renderDeleteAccountPage = () => {
    return (
      <div className="profile-container">
        <Header onOpenLogin={handleOpenLogin} />
        
        <main className="profile-main full-width">
          <div className="delete-account-container">
            <div className="delete-account-content">
              <h1 className="delete-account-title">Yêu cầu xóa tài khoản</h1>
              <p className="delete-account-subtitle">Vui lòng đọc kĩ những điều sau</p>
              
              <div className="delete-account-illustration">
                <img 
                  src="/assets/images/no data/Gemini_Generated_Image_z6clpdz6clpdz6cl-removebg-preview.png" 
                  alt="Delete Account Illustration" 
                  className="delete-account-image"
                />
              </div>

              <div className="delete-account-text">
                <p className="info-text">Khi xóa tài khoản, các thông tin sau (nếu có) sẽ bị xóa trên hệ thống:</p>
                <ul className="info-list-simple">
                  <li>Thông tin cá nhân</li>
                  <li>Thông tin lịch sử chuyến và danh sách xe</li>
                </ul>
                <p className="info-text">Yêu cầu xóa tài khoản sẽ được xử lý trong vòng 15 ngày làm việc. FEV sẽ liên hệ trực tiếp với bạn thông qua Email hoặc Số điện thoại đã cung cấp.</p>
                <p className="info-text">Mọi thắc mắc xin liên hệ Fanpage của FEV hoặc Hotline 1900 1234 (7AM - 10PM) để được hỗ trợ.</p>
              </div>

              <div className="delete-account-actions">
                <button className="delete-account-btn">Xóa tài khoản</button>
                <button className="cancel-btn" onClick={() => setShowDeleteAccount(false)}>Hủy</button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
        {showLogin && <Login onClose={handleCloseLogin} />}
      </div>
    );
  };

  // If showing delete account page, render it
  if (showDeleteAccount) {
    return renderDeleteAccountPage();
  }

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
                  onClick={() => setShowDeleteAccount(true)}
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