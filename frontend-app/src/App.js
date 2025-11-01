import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Đang xử lý...');
    
    try {
      // CHÚ Ý: Chúng ta gọi đến đường dẫn /api/users/register
      // Nginx (ở bước sau) sẽ "proxy" (chuyển tiếp)
      // request này đến Spring Boot service
      const response = await axios.post('/api/users/register', {
        email: email,
        password: password
      });
      
      setMessage(`Đăng ký thành công! User ID: ${response.data.id}`);
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(`Lỗi: ${error.response.data}`);
      } else {
        setMessage('Lỗi không xác định. Kiểm tra console.');
      }
      console.error(error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hệ thống Thuê Xe Điện (EV Rental)</h1>
        <form onSubmit={handleSubmit}>
          <h2>Đăng Ký Tài Khoản</h2>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Đăng Ký</button>
        </form>
        {message && <p>{message}</p>}
      </header>
    </div>
  );
}

export default App;