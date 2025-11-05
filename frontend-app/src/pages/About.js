import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Register from '../components/Register';

const About = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
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
    <div className="About">
      <Header 
        onOpenLogin={handleOpenLogin} 
        user={user} 
        onLogout={handleLogout}
      />
      
      <main role="main">
        <section className="green-journey-section" aria-labelledby="green-journey-title">
          <h2 id="green-journey-title">FEV - Lựa chọn số một trong mọi hành trình xanh</h2>
          <div className="content-wrapper">
            <div className="text-block">
              <p>Mỗi một lần khởi động là một bước tiến vào tương lai của di chuyển, là cơ hội để trải nghiệm công nghệ và dẫn đầu xu hướng sống bền vững. Do đó, trải nghiệm của người dùng về tốc độ,sự thông minh và liền mạch luôn là ưu tiên hàng đầu và là nguồn cảm hứng sáng tạo của đội ngũ FEV.</p>
              <p>FEV - Fast EV là hệ sinh thái xe điện hiệu suất cao, sứ mệnh của chúng tôi không chỉ dừng lại ở việc cung cấp những chiếc xe điện mạnh mẽ với tốc độ sạc vượt trội, mà còn hướng đến việc truyền cảm hứng BỨT PHÁ mọi giới hạn, cùng cộng đồng tiên phong cho một kỷ nguyên di chuyển xanh và hiệu quả hơn.</p>
            </div>
            <div className="image-row">
              <img src="/assets/images/exam/licensed-image.jpg" alt="Phụ nữ xem bản đồ trong xe" width="450" height="300" loading="lazy" />
              <img src="/assets/images/exam/Gemini_Generated_Image_1iy0ky1iy0ky1iy0.png" alt="Người đàn ông mở cửa xe" width="450" height="300" loading="lazy" />
            </div>
          </div>
        </section>

        <section className="charge-accelerate-section" aria-labelledby="accelerate-title">
          <h2 id="accelerate-title">Charge. Accelerate. Lead.</h2>
          <div className="content-wrapper">
            <div className="text-block">
              <p>Nạp năng lượng và bứt phá để dẫn đầu tương lai.</p>
              <p>FEV đặt mục tiêu trở thành thương hiệu xe điện thông minh & hiệu suất cao hàng đầu tại Việt Nam, tiên phong mang những công nghệ di chuyển bền vững đến cho mọi người, hướng đến một tương lai xanh và hiện đại hơn.</p>
              <p>Chúng tôi hiểu rằng mỗi lần tăng tốc là một trải nghiệm đáng giá, vì vậy đội ngũ chuyên gia của FEV với kinh nghiệm sâu rộng trong lĩnh vực công nghệ xe điện, pin, và phần mềm sẽ mang đến cho bạn cảm giác lái đầy phấn khích, thông minh cùng hiệu suất vận hành và sự an toàn ở mức cao nhất.</p>
            </div>
            <div className="image-column">
              <img src="/assets/images/exam/licensed-image (1).jpg" alt="Cặp đôi đang lái xe và xem bản đồ" width="450" height="300" loading="lazy" />
            </div>
          </div>
        </section>

        <section className="impressive-numbers-section" aria-labelledby="numbers-title">
          <h2 id="numbers-title">Những Con Số Ấn Tượng</h2>
          <div className="numbers-grid">
            <div className="number-card">
              <iconify-icon icon="mdi:bag-suitcase" aria-hidden="true"></iconify-icon>
              <h3>50.000+</h3>
              <p>Chuyến đi có FEV làm trợ thủ đắc lực</p>
            </div>
            
            <div className="number-card">
              <iconify-icon icon="mdi:car-electric" aria-hidden="true"></iconify-icon>
              <h3>50+</h3>
              <p>Dòng xe EV đa dạng, muôn vàn lựa chọn</p>
            </div>
            
            <div className="number-card">
              <iconify-icon icon="mdi:ev-station" aria-hidden="true"></iconify-icon>
              <h3>200+</h3>
              <p>Trạm sạc, rộng rãi thoáng mát</p>
            </div>
            
            <div className="number-card">
              <iconify-icon icon="mdi:star" aria-hidden="true"></iconify-icon>
              <h3>4.5/5.0</h3>
              <p>Là số điểm nhận được từ {'>'}100.000 khách hàng đánh giá về dịch vụ của chúng tôi</p>
            </div>
            
            <div className="number-card">
              <iconify-icon icon="mdi:target" aria-hidden="true"></iconify-icon>
              <h3>20+</h3>
              <p>Tỉnh thành FEV đã có mặt</p>
            </div>
            
            <div className="number-card">
              <iconify-icon icon="mdi:heart" aria-hidden="true"></iconify-icon>
              <h3>100.000+</h3>
              <p>Khách hàng đã trải nghiệm dịch vụ</p>
            </div>
          </div>
        </section>

        <section className="commitments-section" aria-labelledby="commitments-title">
          <h2 id="commitments-title">FEV Và Những Cam Kết</h2>
          <div className="commitment-grid">
            <div className="commitment-item commitment-top">
              <img 
                src="/assets/images/exam/Gemini_Generated_Image_5vyw845vyw845vyw.png" 
                alt="Cam kết về chất lượng xe và minh bạch thông tin"
                className="commitment-image"
                width="400" 
                height="250"
                loading="lazy"
              />
              <div className="commitment-text">
                <p>Tất cả xe điện cho thuê đều là xe đời mới, được bảo dưỡng định kỳ theo tiêu chuẩn của nhà sản xuất.</p>
                <p>Xe luôn được vệ sinh sạch sẽ, kiểm tra kỹ lưỡng (phanh, lốp, pin, hệ thống điện) trước khi bàn giao.</p>
                <p>FEV cam kết tình trạng xe được ghi nhận minh bạch trong biên bản bàn giao.</p>
              </div>
            </div>
            
            <div className="commitment-item commitment-bottom">
              <div className="commitment-text">
                <p>Hỗ trợ kỹ thuật miễn phí và xử lý sự cố khẩn cấp trên mọi hành trình.</p>
                <p>Giá thuê công bố là giá trọn gói, đã bao gồm VAT, bảo hiểm bắt buộc TNDS và chi phí bảo trì, bảo dưỡng xe định kỳ (trừ các phụ phí phát sinh theo điều khoản dưới đây).</p>
                <p>Không phát sinh chi phí ẩn.</p>
              </div>
              <img 
                src="/assets/images/exam/istockphoto-1282344514-612x612.jpg" 
                alt="Cam kết hỗ trợ kỹ thuật và giá thuê trọn gói"
                className="commitment-image"
                width="400" 
                height="250"
                loading="lazy"
              />
            </div>
          </div>
        </section>
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

export default About;