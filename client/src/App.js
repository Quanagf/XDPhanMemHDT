import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// --- ĐƯỜNG DẪN ĐÃ ĐƯỢC CẬP NHẬT ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import HomePage from './pages/HomePage';
// ---------------------------------

import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
           <h1>Hệ Thống Thuê Xe Điện (EV Rental)</h1>
        </Link>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Routes>
        
      </header>
    </div>
  );
}

export default App;