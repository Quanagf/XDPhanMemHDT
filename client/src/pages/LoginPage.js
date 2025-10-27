import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link để điều hướng
import './App.css'; // Dùng chung CSS

const API_URL = 'http://localhost:8080';

function LoginPage() {
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      // --- LỖI ĐÃ SỬA Ở ĐÂY ---
      // Gọi đúng API đăng nhập của Renter
      const response = await axios.post(
        `${API_URL}/api/auth/renter/login`, 
        loginForm
      );
      
      alert('Đăng nhập thành công! Welcome, ' + response.data.fullName);
      console.log(response.data);
      // (Sau này bạn sẽ lưu Token và chuyển hướng)
    } catch (error) {
      alert('Lỗi! ' + (error.response?.data || error.message));
    }
  };

  return (
    <div style={{ border: '1px solid white', padding: '20px', margin: '20px' }}>
      <h2>Đăng Nhập (Renter)</h2>
      <form onSubmit={handleLoginSubmit}>
        <div>
          <label>Username:</label>
          <input type="text" name="username" onChange={handleLoginChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" onChange={handleLoginChange} required />
        </div>
        <button type="submit">Đăng Nhập</button>
      </form>
      <p>
        Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
      </p>
    </div>
  );
}

export default LoginPage;