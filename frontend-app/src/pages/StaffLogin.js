import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/staff-login.css';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      
      // Kiểm tra role phải là STAFF
      if (data.role !== 'STAFF') {
        throw new Error('Bạn không có quyền truy cập trang Staff!');
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
        
        // Chuyển đến trang staff
        navigate('/staff');
      }
      
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError(error.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="staff-login-page">
      <div className="staff-login-container">
        <div className="staff-login-header">
          <div className="staff-icon">👔</div>
          <h1>Staff Portal</h1>
          <p>Đăng nhập hệ thống nhân viên</p>
        </div>
        
        <form onSubmit={handleSubmit} className="staff-login-form">
          {error && (
            <div className="error-alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="identifier">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Tên đăng nhập / Email
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="staff1 hoặc staff@evrental.com"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Mật khẩu
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <button type="submit" className="staff-login-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Đăng nhập
              </>
            )}
          </button>
        </form>
        
        <div className="staff-login-footer">
          <a href="/">← Quay lại trang chủ</a>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
