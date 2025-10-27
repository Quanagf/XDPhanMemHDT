import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link
import './App.css';

const API_URL = 'http://localhost:8080';

function RegisterPage() {
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    driverLicenseNumber: '',
    idCardNumber: ''
  });

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`, 
        registerForm
      );
      alert('Đăng ký Renter thành công! User ID: ' + response.data.id);
      console.log(response.data);
      // (Sau này bạn sẽ tự động chuyển hướng người dùng sang trang Đăng nhập)
    } catch (error) {
      alert('Lỗi! ' + (error.response?.data || error.message));
    }
  };

  return (
    <div style={{ border: '1px solid white', padding: '20px', margin: '20px' }}>
      <h2>Đăng Ký Tài Khoản Renter</h2>
      <form onSubmit={handleRegisterSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleRegisterChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleRegisterChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleRegisterChange} required />
        <input type="text" name="fullName" placeholder="Họ và Tên" onChange={handleRegisterChange} required />
        <input type="text" name="phoneNumber" placeholder="Số điện thoại" onChange={handleRegisterChange} />
        <input type="text" name="driverLicenseNumber" placeholder="Số GPLX" onChange={handleRegisterChange} />
        <input type="text" name="idCardNumber" placeholder="Số CMND/CCCD" onChange={handleRegisterChange} />
        <button type="submit">Đăng Ký</button>
      </form>
      <p>
        Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
      </p>
    </div>
  );
}

export default RegisterPage;