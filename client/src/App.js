import React, { useState } from 'react'; // Import useState
import axios from 'axios'; // Import axios
import './App.css';

function App() {
  // 1. Dùng useState để lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // 2. Hàm này được gọi khi gõ vào ô input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Hàm này được gọi khi nhấn nút "Đăng ký"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn form tải lại trang

    try {
      // 4. GỌI API!
      // Trỏ đến API Gateway (cổng 8080), route /api/auth/register
      // Gateway sẽ chuyển nó đến UserService
      const response = await axios.post(
        'http://localhost:8080/api/auth/register', 
        formData
      );
      
      console.log('Đăng ký thành công:', response.data);
      alert('Đăng ký thành công!');

    } catch (error) {
      console.error('Lỗi đăng ký:', error.response ? error.response.data : error.message);
      alert('Đăng ký thất bại!');
    }
  };

  // 5. Đây là giao diện (HTML/JSX)
  return (
    <div className="App">
      <header className="App-header">
        <h1>Đăng Ký Tài Khoản</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Đăng ký</button>
        </form>
      </header>
    </div>
  );
}

export default App;