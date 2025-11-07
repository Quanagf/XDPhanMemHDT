import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import SearchPage from './pages/SearchPage';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import CarDetail from './pages/CarDetail';
import ChatbotPage from './pages/ChatbotPage';
import './styles/main.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gioi-thieu-fev" element={<About />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/car/:carId" element={<CarDetail />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;