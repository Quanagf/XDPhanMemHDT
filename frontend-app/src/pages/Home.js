import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedCars from '../components/FeaturedCars';
import FeaturedLocations from '../components/FeaturedLocations';
import HowToRent from '../components/HowToRent';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Register from '../components/Register';

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Kiểm tra role và chuyển hướng
  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    const authToken = localStorage.getItem('authToken');
    
    if (userProfile && authToken) {
      try {
        const parsedUser = JSON.parse(userProfile);
        
        // Chuyển hướng Admin và Staff đến trang của họ
        if (parsedUser.role === 'ADMIN') {
          navigate('/admin');
          return;
        } else if (parsedUser.role === 'STAFF') {
          navigate('/staff');
          return;
        }
        
        // RENTER được ở lại trang chủ
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user profile:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userRole');
      }
    }
  }, [navigate]);

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleOpenRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const handleCloseModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    handleCloseModals();
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="Home">
      <Header 
        onOpenLogin={handleOpenLogin} 
        user={user} 
        onLogout={handleLogout}
      />
      <main role="main">
        <Hero />
        <FeaturedCars />
        <FeaturedLocations />
        <HowToRent />
      </main>
      <Footer />
      {showLogin && (
        <Login 
          onClose={handleCloseModals} 
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {showRegister && (
        <Register 
          onClose={handleCloseModals} 
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default Home;