import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ onOpenLogin }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  
  const handleLoginClick = (e) => {
    e.preventDefault();
    onOpenLogin();
  };

  const handleLoginSuccess = (userProfile, token) => {
    setUser(userProfile);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    setUser(null);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Cập nhật onOpenLogin để truyền callback
  const handleOpenLogin = () => {
    if (onOpenLogin) {
      onOpenLogin(handleLoginSuccess);
    }
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
                  