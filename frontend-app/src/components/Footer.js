import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  
  const paymentMethods = [
    { src: "/assets/images/payment/ZaloPay.png", alt: "ZaloPay" },
    { src: "/assets/images/payment/momo.png", alt: "MoMo" },
    { src: "/assets/images/payment/ViettelMoney.png", alt: "Viettel Money" },
    { src: "/assets/images/payment/vnpay.780689d6.png", alt: "VNPay" },
    { src: "/assets/images/payment/Visa.png", alt: "VISA" },
    { src: "/assets/images/payment/ApplePay.png", alt: "Apple Pay" }
  ];

  const navigationLinks = [
    { href: "/", text: "Trang chủ" },
    { href: "/gioi-thieu-fev", text: "Giới thiệu" },
    { href: "/lien-he", text: "Liên hệ" },
    { href: "/profile?section=trips", text: "Chuyến của tôi" }
  ];

  const socialLinks = [
    { href: "mailto:contact@fev.vn", icon: "mdi:email-outline", label: "Gửi email cho FEV" },
    { href: "https://instagram.com/fev", icon: "mdi:instagram", label: "FEV trên Instagram" },
    { href: "https://facebook.com/fev", icon: "mdi:facebook", label: "FEV trên Facebook" }
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNavClick = (e) => {
    // Scroll to top when navigation link is clicked
    setTimeout(() => {
      scrollToTop();
    }, 100); // Small delay to ensure navigation completes first
  };

  const handleLogoClick = () => {
    navigate('/');
    setTimeout(() => {
      scrollToTop();
    }, 100);
  };

  return (
    <>
      <footer className="main-footer" role="contentinfo">
        <div className="footer-content-wrapper">
          <div className="footer-col contact-col">
            <div className="footer-logo-box" onClick={handleLogoClick}>
              <img 
                src="/assets/images/logo/Gemini_Generated_Image_3rs8943rs8943rs8-removebg.png" 
                alt="Logo FEV" 
                className="fev-logo-icon"
                width="199"
                height="114"
              />
              <p className="slogan">Luôn đồng hành cùng bạn</p>
            </div>
            
            <p className="phone-number">1900 1234</p>
            <p className="working-hours">Liên hệ tổng đài: 07:00 AM - 10:00 PM</p>
            
            <p className="contact-us-title" lang="en">Contact with us</p>
            <p className="email-address">Group3@gmail.com</p>
          </div>

          <div className="footer-col nav-col">
            <p className="col-title">Điều hướng</p>
            <ul className="footer-nav">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} onClick={handleNavClick}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="footer-col commitment-col">
            <p className="col-title green-title">FEV - Fast Electric Vehicle</p>
            <p className="commitment-text">
              FEV cam kết hoàn đền 150% giá trị thanh toán đối với trường hợp khách hàng không được nhà xe cung cấp dịch vụ vận chuyển
            </p>

            <div className="social-icons">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.href} aria-label={social.label}>
                  <iconify-icon icon={social.icon} aria-hidden="true"></iconify-icon>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col payment-col">
            <p className="col-title">Phương thức thanh toán</p>
            <div className="payment-methods">
              {paymentMethods.map((payment, index) => (
                <img 
                  key={index}
                  src={payment.src} 
                  alt={payment.alt} 
                  width="80" 
                  height="80" 
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="footer-bottom-bar">
          <p>&copy; 2025 FEV. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
      <div className="footer-green-line"></div>
    </>
  );
};

export default Footer;