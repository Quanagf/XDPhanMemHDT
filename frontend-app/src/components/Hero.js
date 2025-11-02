import React from 'react';

const Hero = () => {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-background">
        <img 
          src="/assets/images/cars/ChatGPT Image Oct 8, 2025, 04_35_56 PM.png" 
          alt="" 
          className="hero-bg-image"
          aria-hidden="true"
          width="1198"
          height="581"
          loading="lazy"
        />
      </div>
      <div className="hero-content">
        <h1 id="hero-title">FEV - NÂNG TẦM TRẢI NGHIỆM</h1>
        <h2>NHANH CHÓNG, TIỆN LỢI, TIẾT KIỆM</h2>
        <p className="description">
          Luôn đồng hành cùng bạn trên mọi chuyến đi với <span>100+ trạm thuê</span> và <span>5.000+ xe</span> trên khắp Việt Nam
        </p>
      </div>
      <div className="ev-tag" aria-label="Loại xe điện">
        <iconify-icon icon="mdi:car-electric-outline" aria-hidden="true"></iconify-icon> EV car
      </div>
      <div className="booking-form-wrapper">
        <form className="booking-form" action="/search" method="POST">
          <div className="form-inputs">
            <div className="input-group location">
              <label htmlFor="location">Địa điểm</label>
              <div className="input-field">
                <iconify-icon icon="material-symbols:location-on" aria-hidden="true"></iconify-icon>
                <select name="location" id="location" required>
                  <option value="hcm">TP. Hồ Chí Minh</option>
                </select>
              </div>
            </div>

            <div className="input-group station">
              <label htmlFor="station">Trạm thuê</label>
              <div className="input-field">
                <iconify-icon icon="mdi:bus-stop" aria-hidden="true"></iconify-icon>
                <select name="station" id="station" required>
                  <option value="station-12">70 Đ. Tô Ký, Quận 12</option>
                </select>
              </div>
            </div>
            
            <div className="input-group datetime-picker">
              <label htmlFor="rent-time">Thời gian thuê</label>
              <div className="input-field">
                <iconify-icon icon="mdi:calendar-month" aria-hidden="true"></iconify-icon>
                <input 
                  type="datetime-local" 
                  id="rent-time"
                  name="rent-time" 
                  required
                  min="2025-10-24T00:00"
                />
              </div>
            </div>
          </div>
          
          <button type="submit" className="search-btn">
            <iconify-icon icon="mdi:magnify" aria-hidden="true"></iconify-icon> Tìm xe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Hero;