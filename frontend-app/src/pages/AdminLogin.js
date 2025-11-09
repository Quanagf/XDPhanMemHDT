import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/admin-login.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Lấy thời gian hiện tại để hiển thị lời chào
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const getCurrentDate = () => {
    return currentTime.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const isEmail = formData.identifier.includes('@');
      const isPhone = /^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.identifier);
      
      let loginData = {
        password: formData.password
      };
      
      if (isEmail) {
        loginData.email = formData.identifier;
      } else if (isPhone) {
        loginData.phoneNumber = formData.identifier;
      } else {
        loginData.username = formData.identifier;
      }
      
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Thông tin đăng nhập không đúng');
      }

      const data = await response.json();
      
      // Kiểm tra role phải là ADMIN
      if (data.role !== 'ADMIN') {
        throw new Error('Bạn không có quyền truy cập trang Admin!');
      }
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.role);
      
      const profileResponse = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      if (profileResponse.ok) {
        const userProfile = await profileResponse.json();
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        // Chuyển đến trang admin
        navigate('/admin');
      }
      
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError(error.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="greeting-section">
            <h1>Admin Portal</h1>
            <p className="greeting-text">{getGreeting()}</p>
            <p className="date-text">{getCurrentDate()}</p>
          </div>
          <p className="login-subtitle">Đăng nhập hệ thống quản trị</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="identifier" className="form-label">
              Tài khoản
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Nhập username, email hoặc số điện thoại"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nhập mật khẩu của bạn"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94z"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.84-6.84z"></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button type="submit" className="admin-login-btn" disabled={isLoading}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="spinner"></div>
                Đang đăng nhập...
              </div>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p className="footer-text">
            Không phải quản trị viên? 
            <a href="/" className="home-link">Trở về trang chủ</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
