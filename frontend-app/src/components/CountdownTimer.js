import React, { useState, useEffect } from 'react';
import { getBookingCountdown } from '../api/bookings';
import './CountdownTimer.css';

const CountdownTimer = ({ bookingId, onExpired }) => {
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const data = await getBookingCountdown(bookingId);
        setCountdown(data);
        if (data && data.isExpired && onExpired) {
          onExpired();
        }
      } catch (err) {
        setError('Lỗi kết nối: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchCountdown();
      const interval = setInterval(fetchCountdown, 30000); // Refresh mỗi 30 giây
      return () => clearInterval(interval);
    }
  }, [bookingId]);

  const formatTime = (minutes) => {
    if (minutes <= 0) return '00:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getCountdownClass = (minutes) => {
    if (minutes <= 0) return 'countdown-expired';
    if (minutes <= 15) return 'countdown-critical';
    if (minutes <= 30) return 'countdown-warning';
    return 'countdown-normal';
  };

  if (loading) {
    return (
      <div className="countdown-timer loading">
        <div className="countdown-spinner"></div>
        <span>Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="countdown-timer error">
        <i className="fas fa-exclamation-triangle"></i>
        <span>{error}</span>
      </div>
    );
  }

  if (!countdown) {
    return (
      <div className="countdown-timer no-data">
        <span>Không có thông tin countdown</span>
      </div>
    );
  }

  if (countdown.isExpired) {
    if (onExpired) onExpired();
    return (
      <div className="countdown-timer expired">
        <i className="fas fa-clock"></i>
        <div className="countdown-content">
          <div className="countdown-title">Hết thời gian chờ</div>
          <div className="countdown-subtitle">Booking đã bị hủy tự động</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`countdown-timer compact ${getCountdownClass(countdown.remainingMinutes)}`}>
      <i className="fas fa-clock"></i>
      <div className="countdown-content">
        <div className="countdown-title">
          Thời gian còn lại để bàn giao
        </div>
        <div className="countdown-time">
          {formatTime(countdown.remainingMinutes)}
        </div>
        <div className="countdown-subtitle">
          {countdown.bookingType === 'ADVANCE' ? 'Đặt trước' : 'Đặt tại điểm'} • 
          Hạn cuối: {new Date(countdown.deadlineTime).toLocaleTimeString('vi-VN')}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;