import React, { useState } from 'react';

const Login = ({ onClose, onSwitchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    identifier: '', // Có thể là username, email hoặc số điện thoại
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorNotification, setErrorNotification] = useState({ show: false, message: '' });
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa lỗi khi user nhập lại
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginSuccess(false);
    setError('');
    
    try {
      // Xác định loại identifier
      const isEmail = formData.identifier.includes('@');
      const isPhone = /^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.identifier);
      
      let loginData = {
        password: formData.password
      };
      
      // Gán đúng trường dựa trên loại identifier
      if (isEmail) {
        loginData.email = formData.identifier;
      } else if (isPhone) {
        loginData.phoneNumber = formData.identifier;
      } else {
        loginData.username = formData.identifier;
      }
      
      // Gọi API đăng nhập
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Thông tin đăng nhập không đúng';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Lưu token vào localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.role);
      
      // Lấy thông tin profile user
      const profileResponse = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      if (profileResponse.ok) {
        const userProfile = await profileResponse.json();
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        // Đánh dấu đăng nhập thành công để hiển thị trên button
        setLoginSuccess(true);
        
        // Gọi callback để parent component biết đăng nhập thành công
        if (onLoginSuccess) {
          onLoginSuccess(userProfile, data.token);
        }
        

        setTimeout(() => {
          window.location.reload();
        }, 1); 
      }
      
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setErrorNotification({
        show: true,
        message: error.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại!'
      });
      
      // Tự động ẩn thông báo lỗi sau 4 giây
      setTimeout(() => {
        setErrorNotification({ show: false, message: '' });
      }, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-overlay">
      {/* 🔔 Error Notification Only */}
      {errorNotification.show && (
        <div className="notification error">
          <div className="notification-content">
            <div className="notification-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <span className="notification-message">{errorNotification.message}</span>
            <button
              className="notification-close"
              onClick={() => setErrorNotification({ show: false, message: '' })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="login-modal">
        <button className="close-btn" onClick={onClose} aria-label="Đóng">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="login-content">
          <h2 className="login-title">Đăng nhập</h2>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="identifier" className="form-label">Tài khoản</label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nhập username, email hoặc số điện thoại"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Mật khẩu</label>
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
                  onClick={togglePasswordVisibility}
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
            
            <div className="forgot-password">
              <a href="/quen-mat-khau" className="forgot-link">
                Quên mật khẩu?
              </a>
            </div>
            
            {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            
            <button type="submit" className="login-submit-btn" disabled={isLoading || loginSuccess}>
              {loginSuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  Đăng nhập thành công!
                </div>
              ) : isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div className="spinner"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
          
          <div className="register-section">
            <p className="register-text">
              Bạn chưa có tài khoản? 
              <button 
                type="button" 
                onClick={onSwitchToRegister}
                className="register-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Hãy đăng kí ngay
              </button>
            </p>
          </div>
          
          <div className="social-login">
            <button className="social-btn google-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            
            <button className="social-btn facebook-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;