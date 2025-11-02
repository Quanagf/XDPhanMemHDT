import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ onOpenLogin }) => {
  const location = useLocation();
  
  const handleLoginClick = (e) => {
    e.preventDefault();
    onOpenLogin();
  };

  return (
    <>
      <div className="top-green-bar"></div>
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
              <li><a href="/lien-he">LIÊN HỆ</a></li>
              <li><a href="/chuyen-cua-toi">CHUYẾN CỦA TÔI</a></li>
            </ul>
          </nav>
          
          <button onClick={handleLoginClick} className="login-btn" role="button">ĐĂNG NHẬP</button>
        </div>
      </header>
    </>
  );
};

export default Header;