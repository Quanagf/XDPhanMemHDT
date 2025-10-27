import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './App.css'; 

function HomePage() {
  const navigate = useNavigate(); // Hook để điều hướng

  // Hàm này sẽ được gọi khi nhấn nút "Đăng Nhập"
  const goToLogin = () => {
    navigate('/login'); // Chuyển sang trang Đăng nhập Renter
  };

  return (
    <div style={{ padding: '20px', margin: '20px', textAlign: 'center' }}>
      <h2>Chào Mừng Đến Với Dịch Vụ Thuê Xe Điện</h2>
      <p>Nền tảng cho thuê xe nhanh chóng và tiện lợi.</p>
      
      {/* 1. Nút Đăng Nhập (cho Renter) */}
      <button 
        onClick={goToLogin} 
        style={{fontSize: '20px', padding: '10px 20px', margin: '10px'}}
      >
        Đăng Nhập / Đăng Ký
      </button>

      <br />
      
      {/* 2. Link Đăng Nhập Nội Bộ (cho Admin/Staff) */}
      <p style={{marginTop: '50px'}}>
        Dành cho nhân viên hoặc quản trị viên? 
        <Link to="/admin/login" style={{marginLeft: '10px'}}>
          Đăng nhập nội bộ
        </Link>
      </p>
    </div>
  );
}

export default HomePage;