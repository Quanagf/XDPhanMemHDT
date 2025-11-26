import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Register from '../components/Register';
import PaymentModal from '../components/PaymentModal';
import vehicleService from '../utils/vehicleService';
import { getVehicleWithStation } from '../api/vehicleAPI';
import { createBooking } from '../api/bookings';
import '../styles/pages/car-detail.css';

const CarDetail = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);
  
  // Date picker states
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateSelectionMode, setDateSelectionMode] = useState(null); // 'start' or 'end'
  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    const startDateParam = new URLSearchParams(window.location.search).get('startDate');
    if (startDateParam) {
      const date = new Date(startDateParam);
      if (!isNaN(date.getTime())) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [selectedEndDate, setSelectedEndDate] = useState(() => {
    const endDateParam = new URLSearchParams(window.location.search).get('endDate');
    if (endDateParam) {
      const date = new Date(endDateParam);
      if (!isNaN(date.getTime())) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  });
  const [startTime, setStartTime] = useState(() => {
    const startTimeParam = new URLSearchParams(window.location.search).get('startTime');
    return startTimeParam || '10:00';
  });
  const [endTime, setEndTime] = useState(() => {
    const endTimeParam = new URLSearchParams(window.location.search).get('endTime');
    return endTimeParam || '23:00';
  }); // Mặc định 23:00 cho thời gian trả xe

  // Generate available time options (at least 1 hour from now)
  const getAvailableTimeOptions = (selectedDate, isEndTime = false, startTimeValue = null) => {
    const options = [];
    const today = new Date();
    const isToday = selectedDate && 
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();
    
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      const timeValue = `${hour}:00`;
      
      // If it's today and start time, only allow times that are at least 1 hour from now
      if (isToday && !isEndTime) {
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        // If minutes >= 30, need to add 2 hours, otherwise 1 hour
        const minAllowedHour = currentMinute >= 30 ? currentHour + 2 : currentHour + 1;
        
        if (i < minAllowedHour) {
          continue; // Skip this hour
        }
      }
      
      // For end time, check minimum gap requirement (ADVANCE needs 1 hour)
      if (isEndTime && startTimeValue) {
        const startHour = parseInt(startTimeValue.split(':')[0]);
        const minHourGap = 1; // ADVANCE needs 1 hour minimum
        
        // Calculate minimum end hour based on dates
        if (selectedStartDate && selectedDate) {
          const startDateTime = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate(), startHour, 0);
          const endDateTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), i, 0);
          const hourDiff = (endDateTime - startDateTime) / (1000 * 60 * 60);
          
          if (hourDiff < minHourGap) {
            continue; // Skip this hour
          }
        } else {
          // Fallback for same day calculation
          const minEndHour = startHour + minHourGap;
          if (i < minEndHour) {
            continue; // Skip this hour
          }
        }
      }
      
      options.push(
        <option key={hour} value={timeValue}>{timeValue}</option>
      );
    }
    
    return options;
  };
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // Tháng 11/2025

  // Load user and check favorite status
  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        setUser(JSON.parse(userProfile));
      } catch (err) {
        console.error('Error parsing user profile:', err);
      }
    }

    // Check if this car is in favorites
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const isInFavorites = favorites.some(favCar => favCar.id === parseInt(carId));
    setIsFavorite(isInFavorites);
  }, [carId]);

  useEffect(() => {
    const fetchCarData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiVehicle = await getVehicleWithStation(carId);
        if (apiVehicle) {
          console.log('Vehicle data with station from API:', apiVehicle);

          setCarData({
            id: apiVehicle.id,
            name: apiVehicle.description || apiVehicle.type || 'Xe điện',
            images: [apiVehicle.imageUrl || '/assets/images/cars/placeholder.webp'],
            rating: apiVehicle.rating || 4.6,
            trips: apiVehicle.tripCount || Math.floor(Math.random() * 50) + 10,
            location: apiVehicle.location || 'Chưa xác định vị trí',
            stationName: apiVehicle.stationName || 'Chưa xác định trạm',
            // Map station từ DTO fields để backward compatibility
            station: apiVehicle.stationId ? {
              id: apiVehicle.stationId,
              name: apiVehicle.stationName,
              address: apiVehicle.stationAddress,
              province: apiVehicle.stationProvince
            } : null,
            pricePerDay: apiVehicle.pricePerHour ? apiVehicle.pricePerHour * 24 : 780000,
            pricePerHour: apiVehicle.pricePerHour || 32500,
            licensePlate: apiVehicle.licensePlate || 'N/A',
            lastMaintenance: apiVehicle.lastMaintenanceDate || '2025-10-01',
            specs: {
              transmission: 'Số tự động',
              seats: `${apiVehicle.seats || 4} Ghế`,
              battery: apiVehicle.batteryLevel != null ? `${apiVehicle.batteryLevel}%` : '~87.7 kWh',
              range: apiVehicle.range ? `${apiVehicle.range}km` : '~420km',
              chargePort: apiVehicle.chargingType || 'CCS2',
              chargeSpeed: apiVehicle.chargingSpeed || '10 - 70% trong ~25 mins'
            },
            condition: {
              pin: apiVehicle.batteryLevel != null ? `${apiVehicle.batteryLevel}%` : '85%',
              status: `Tình trạng kỹ thuật: ${apiVehicle.technicalCondition || 'Tốt'}`,
              rental: apiVehicle.status === 'AVAILABLE' ? 'Cho thuê: Có sẵn' : 
                      apiVehicle.status === 'RENTED' ? 'Cho thuê: Đang cho thuê' : 'Cho thuê: Đã đặt trước'
            },
            raw: apiVehicle
          });
        } else {
          throw new Error('Vehicle not found in API');
        }
      } catch (error) {
        console.log('API failed, trying vehicleService:', error.message);
        
        const localVehicle = vehicleService.getVehicleById(carId);
        if (localVehicle) {
          console.log('Vehicle data from local service:', localVehicle);
          
          // Tạo tên trạm từ location string cho local vehicle
          let stationName = 'Chưa xác định trạm';
          if (localVehicle.location) {
            const locationParts = localVehicle.location.split(',');
            if (locationParts.length > 0) {
              stationName = `Trạm ${locationParts[0].trim()}`;
            }
          }

          setCarData({
            id: localVehicle.id,
            name: localVehicle.description || localVehicle.type || 'Xe điện',
            images: [localVehicle.image_url || '/assets/images/cars/placeholder.webp'],
            rating: 4.6,
            trips: localVehicle.trip_count || 19,
            location: localVehicle.location || 'Phường 3, quận Bình Thạnh',
            stationName: stationName, // Tên trạm được tạo từ location
            pricePerDay: localVehicle.price_per_hour ? localVehicle.price_per_hour * 24 : 780000,
            pricePerHour: localVehicle.price_per_hour || 32500,
            licensePlate: localVehicle.license_plate || localVehicle.licence_plate || 'N/A',
            lastMaintenance: localVehicle.last_maintenance_date || '2025-10-01',
            specs: {
              transmission: 'Số tự động',
              seats: `${localVehicle.seats || 4} Ghế`,
              battery: localVehicle.battery_level != null ? `${localVehicle.battery_level}%` : '~87.7 kWh',
              range: localVehicle.range ? `${localVehicle.range}km` : '~420km',
              chargePort: localVehicle.charging_type || 'CCS2',
              chargeSpeed: localVehicle.charging_speed || '10 - 70% trong ~25 mins'
            },
            condition: {
              pin: localVehicle.battery_level != null ? `${localVehicle.battery_level}%` : '85%',
              status: `Tình trạng kỹ thuật: ${localVehicle.technical_condition || 'Tốt'}`,
              rental: localVehicle.status === 'AVAILABLE' ? 'Cho thuê: Có sẵn' : 
                      localVehicle.status === 'RENTED' ? 'Cho thuê: Đang cho thuê' : 'Cho thuê: Đã đặt trước'
            },
            raw: localVehicle
          });
        } else {
          console.log('No vehicle found in both API and local service');
          setError('Không tìm thấy thông tin xe');
        }
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCarData();
    }
  }, [carId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [carId]);

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleOpenRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
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
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('authToken');
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const vehicleId = parseInt(carId);

    if (isFavorite) {
      // Remove from favorites
      const newFavorites = favorites.filter(favCar => favCar.id !== vehicleId);
      localStorage.setItem('userFavorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      // Add to favorites - save full car object with essential info
      if (!carData) return;
      
      const carToSave = {
        id: vehicleId,
        name: carData.name,
        mainImage: carData.images[0],
        location: carData.location,
        pricePerHour: carData.pricePerHour,
        seats: carData.specs.seats.replace(' Ghế', ''),
        transmission: carData.specs.transmission
      };
      
      const newFavorites = [...favorites, carToSave];
      localStorage.setItem('userFavorites', JSON.stringify(newFavorites));
      setIsFavorite(true);
    }
    
    // Trigger event để các component khác biết favorites đã thay đổi
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const prevImage = () => {
    if (carData && carData.images.length > 0) {
      setCurrentImageIndex(prev => 
        prev === 0 ? carData.images.length - 1 : prev - 1
      );
    }
  };

  const nextImage = () => {
    if (carData && carData.images.length > 0) {
      setCurrentImageIndex(prev => 
        prev === carData.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleBooking = async () => {
    if (!agreeToTerms) {
      alert('Vui lòng đồng ý với các điều khoản để tiếp tục');
      return;
    }
    
    // Kiểm tra trạng thái xe
    const raw = carData && carData.raw;
    if (raw && raw.status && raw.status !== 'AVAILABLE') {
      alert('Xe hiện không khả dụng để thuê.');
      return;
    }
    
    if (!user) {
      setShowLogin(true);
      return;
    }
    
    // Kiểm tra xác thực GPLX và CCCD
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/verification-status/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const verification = await response.json();
        
        if (!verification.hasVerifiedLicense) {
          alert('⚠️ Bạn cần xác thực Giấy phép lái xe (GPLX) trước khi đặt xe.\n\nVui lòng vào Trang cá nhân > Upload GPLX và chờ admin xác thực.');
          navigate('/profile');
          return;
        }
        
        if (!verification.hasVerifiedIdentity) {
          alert('⚠️ Bạn cần xác thực Căn cước công dân (CCCD) trước khi đặt xe.\n\nVui lòng vào Trang cá nhân > Upload CCCD và chờ admin xác thực.');
          navigate('/profile');
          return;
        }
      }
    } catch (error) {
      console.error('Lỗi kiểm tra xác thực:', error);
      alert('Có lỗi xảy ra khi kiểm tra trạng thái xác thực. Vui lòng thử lại sau.');
      return;
    }
    
    console.log('Đặt xe:', { carId, agreeToTerms });
    
    // Tạo booking request
    try {
      const startDateTime = new Date(selectedStartDate);
      startDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));
      
      const endDateTime = new Date(selectedEndDate);
      endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));
      
      // Validation: Kiểm tra thời gian nhận xe phải ít nhất 1 giờ sau hiện tại
      const now = new Date();
      const minStartTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 giờ
      
      if (startDateTime < minStartTime) {
        alert('⚠️ Thời gian nhận xe phải ít nhất 1 giờ sau thời điểm hiện tại.\n\nVui lòng chọn thời gian khác.');
        return;
      }
      
      // Validation: Kiểm tra thời gian trả xe phải sau thời gian nhận xe
      if (endDateTime <= startDateTime) {
        alert('⚠️ Thời gian trả xe phải sau thời gian nhận xe.\n\nVui lòng chọn lại thời gian.');
        return;
      }
      
      // Validation: Kiểm tra thời gian thuê tối thiểu
      const rentalHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
      
      if (rentalHours < 1) {
        alert('⚠️ Đặt trước yêu cầu tối thiểu 1 giờ thuê.\n\nVui lòng chọn thời gian trả xe xa hơn.');
        return;
      }
      
      // Debug log timezone
      console.log('Debug datetime creation:');
      console.log('- selectedStartDate:', selectedStartDate);
      console.log('- startTime:', startTime);
      console.log('- startDateTime local:', startDateTime.toString());
      console.log('- startDateTime ISO (UTC):', startDateTime.toISOString());
      console.log('- Timezone offset:', startDateTime.getTimezoneOffset());
      
      // Format datetime as local string for backend (YYYY-MM-DD HH:mm:ss)
      const formatLocalDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
      
      const bookingRequest = {
        vehicleId: parseInt(carId),
        startStationId: carData?.station?.id || carData?.raw?.stationId || 1, // Use stationId from DTO or default to 1
        estimatedStartTime: formatLocalDateTime(startDateTime),
        estimatedEndTime: formatLocalDateTime(endDateTime), // Luôn gửi để rõ ràng
        bookingType: 'ADVANCE' // Chỉ hỗ trợ đặt trước
      };
      
      console.log('Sending booking request:', bookingRequest);
      
      // Đặt trước - không cần thanh toán cọc
      const newBooking = await createBooking(bookingRequest);
      console.log('Booking created:', newBooking);
      
      // Hiển thị thông báo thành công chi tiết
      const vehicleName = carData.name || carData.raw?.type || 'Xe điện';
      const stationName = carData.stationName || carData.station?.name || 'Trạm xe';
      
      alert(
        `🎉 GỬI YÊU CẦU ĐẶT XE THÀNH CÔNG!\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📋 Mã đặt xe: #${newBooking.id}\n` +
        `🚗 Xe: ${vehicleName}\n` +
        `📍 Trạm: ${stationName}\n\n` +
        `⏰ Thời gian nhận xe:\n   ${startDateTime.toLocaleString('vi-VN', { 
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        })}\n\n` +
        `⏰ Thời gian trả xe:\n   ${endDateTime.toLocaleString('vi-VN', { 
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        })}\n\n` +
        `💰 Tổng tiền dự kiến: ${rentalDetails.totalPrice.toLocaleString()}đ\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `⏳ TRẠNG THÁI: CHỜ XÁC NHẬN\n\n` +
        `✅ Yêu cầu đã được gửi đến staff\n` +
        `✅ Đã lưu vào lịch sử của bạn\n` +
        `📞 Staff sẽ liên hệ để xác nhận trong thời gian sớm nhất\n\n` +
        `💡 Bạn có thể kiểm tra trạng thái trong "Chuyến của tôi"`
      );
      
      // Navigate về trang profile/bookings để xem lịch sử
      navigate('/profile');
      
    } catch (error) {
      console.error('Lỗi khi đặt xe:', error);
      alert(`❌ Có lỗi xảy ra khi đặt xe: ${error.message}\n\nVui lòng thử lại sau.`);
    }
  };

  const handleTermsCheckboxClick = (e) => {
    if (!agreeToTerms) {
      e.preventDefault();
      setShowTermsModal(true);
    } else {
      setAgreeToTerms(false);
    }
  };

  const handleAcceptTerms = () => {
    setAgreeToTerms(true);
    setShowTermsModal(false);
  };

  const handleDeclineTerms = () => {
    setAgreeToTerms(false);
    setShowTermsModal(false);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Proceed with booking creation after successful payment
      const newBooking = await createBooking(pendingBookingData.bookingRequest);
      console.log('Booking created after payment:', newBooking);
      
      setShowPaymentModal(false);
      setPendingBookingData(null);
      
      alert(`✅ Đặt xe và thanh toán thành công!\n\nMã đặt xe: #${newBooking.id}\nLoại đặt: Đặt trước\nĐã thanh toán cọc: ${Math.round(pendingBookingData.totalPrice * 0.2).toLocaleString()}đ\nThời gian nhận xe: ${pendingBookingData.startDateTime.toLocaleString('vi-VN')}\nThời gian trả xe: ${pendingBookingData.endDateTime.toLocaleString('vi-VN')}\n\nSố tiền còn lại sẽ thanh toán khi nhận xe: ${(pendingBookingData.totalPrice * 0.8).toLocaleString()}đ\n\nStaff sẽ liên hệ với bạn sớm để xác nhận.`);
      navigate('/');
      
    } catch (error) {
      console.error('Lỗi khi tạo booking sau thanh toán:', error);
      alert(`❌ Thanh toán thành công nhưng có lỗi khi tạo booking: ${error.message}\n\nVui lòng liên hệ hỗ trợ.`);
    }
  };

  const handlePaymentError = (errorMessage) => {
    setShowPaymentModal(false);
    setPendingBookingData(null);
    alert(`❌ Thanh toán thất bại: ${errorMessage}\n\nVui lòng thử lại sau.`);
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setPendingBookingData(null);
  };

  const scrollToTerms = (e) => {
    e.preventDefault();
    const termsSection = document.getElementById('terms-section');
    if (termsSection) {
      termsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Calendar functions
  const isDateSelected = (date) => {
    if (dateSelectionMode === 'start') {
      return selectedStartDate && date.getTime() === selectedStartDate.getTime();
    } else if (dateSelectionMode === 'end') {
      return selectedEndDate && date.getTime() === selectedEndDate.getTime();
    }
    return false;
  };

  const isDateInRange = (date) => {
    // Không hiện range khi đang chọn từng ngày riêng biệt
    return false;
  };

  const handleDateSelect = (date) => {
    // Không cho chọn ngày trong quá khứ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return;
    }
    
    if (dateSelectionMode === 'start') {
      setSelectedStartDate(date);
      
      // Nếu ngày kết thúc đã chọn mà nhỏ hơn ngày bắt đầu mới, reset ngày kết thúc
      if (selectedEndDate && date > selectedEndDate) {
        setSelectedEndDate(date);
        setEndTime('23:00'); // Mặc định 23:00 khi reset ngày trả xe
      }
    } else if (dateSelectionMode === 'end') {
      // Không cho chọn ngày trả trước ngày nhận
      if (selectedStartDate && date < selectedStartDate) {
        return;
      }
      setSelectedEndDate(date);
      // Khi chọn ngày trả xe, mặc định set giờ trả là 23:00
      setEndTime('23:00');
    }
  };

  const renderCalendar = (monthOffset = 0) => {
    const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const startOfCalendar = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfCalendar = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const firstDay = startOfCalendar.getDay();
    const daysInMonth = endOfCalendar.getDate();
    
    const days = [];
    
    // Empty cells for days before start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="car-detail-calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const isSelected = isDateSelected(date);
      const isInRange = isDateInRange(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPast = date < today;
      
      // For ADVANCE booking, allow future dates
      const isDisabled = isPast;
      
      days.push(
        <div
          key={day}
          className={`car-detail-calendar-day ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''} ${isDisabled ? 'disabled' : ''}`}
          onClick={() => !isDisabled && handleDateSelect(date)}
          style={isDisabled ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
        >
          {day}
        </div>
      );
    }
    
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                       'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    return (
      <div className="car-detail-calendar-month">
        <div className="car-detail-calendar-header">
          <h3>{monthNames[month.getMonth()]} {month.getFullYear()}</h3>
        </div>
        <div className="car-detail-calendar-weekdays">
          {weekdays.map((label) => (
            <div key={label} className="car-detail-calendar-weekday">{label}</div>
          ))}
        </div>
        <div className="car-detail-calendar-grid">
          {days}
        </div>
      </div>
    );
  };

  const formatSelectedDate = (date) => {
    if (!date) return 'Chọn ngày';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Tính toán số giờ và tiền
  const calculateRentalDetails = () => {
    if (!selectedStartDate || !selectedEndDate || !startTime || !endTime) {
      return {
        hours: 1,
        totalPrice: carData?.raw?.pricePerHour || carData?.pricePerHour || 0
      };
    }

    // Tạo Date objects với giờ cụ thể
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(selectedStartDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(selectedEndDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // Tính toán số giờ
    const diffMs = endDateTime.getTime() - startDateTime.getTime();
    const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60))); // Tối thiểu 1 giờ

    const pricePerHour = carData?.raw?.pricePerHour || carData?.pricePerHour || 0;
    const totalPrice = diffHours * pricePerHour;

    return {
      hours: diffHours,
      totalPrice: totalPrice
    };
  };

  const rentalDetails = calculateRentalDetails();

  if (loading) {
    return (
      <div className="CarDetail">
        <Header onOpenLogin={handleOpenLogin} user={user} onLogout={handleLogout} />
        <main className="car-detail-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin xe...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="CarDetail">
        <Header onOpenLogin={handleOpenLogin} user={user} onLogout={handleLogout} />
        <main className="car-detail-main">
          <div className="error-container">
            <iconify-icon icon="material-symbols:error-outline"></iconify-icon>
            <p>Không thể tải thông tin xe. Vui lòng thử lại sau.</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Thử lại
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!carData) {
    return (
      <div className="CarDetail">
        <Header onOpenLogin={handleOpenLogin} user={user} onLogout={handleLogout} />
        <main className="car-detail-main">
          <div className="not-found-container">
            <iconify-icon icon="material-symbols:search-off"></iconify-icon>
            <p>Không tìm thấy xe với ID: {carId}</p>
            <button onClick={handleBack} className="back-button-large">
              Quay lại trang trước
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="CarDetail">
      <Header 
        onOpenLogin={handleOpenLogin} 
        user={user} 
        onLogout={handleLogout}
      />
      
      <main className="car-detail-main">
        <div className="back-button-container">
          <button className="back-button" onClick={handleBack}>
            <iconify-icon icon="material-symbols:arrow-back"></iconify-icon>
            <span>Quay lại</span>
          </button>
        </div>
        
        <div className="car-detail-container">
          <div className="left-column">
            <div className="car-images-section">
              <div className="main-image-container">
                <button className="nav-button prev-button" onClick={prevImage}>
                  <iconify-icon icon="material-symbols:chevron-left"></iconify-icon>
                </button>
                
                <img 
                  src={carData.images[currentImageIndex]} 
                  alt={carData.name}
                  className="main-car-image"
                />
                
                <button className="nav-button next-button" onClick={nextImage}>
                  <iconify-icon icon="material-symbols:chevron-right"></iconify-icon>
                </button>
                
                <button 
                  className={`detail-heart-btn ${isFavorite ? 'is-liked' : ''}`}
                  onClick={handleFavoriteToggle}
                  title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                >
                  <iconify-icon 
                    icon={isFavorite ? 'material-symbols:favorite' : 'material-symbols:favorite-outline'}
                  ></iconify-icon>
                </button>
              </div>
            </div>

            <div className="car-info-section">
              <div className="vehicle-details">
                <h3>Thông tin xe</h3>
                <div className="detail-items">
                  <div className="detail-item">
                    <iconify-icon icon="mdi:garage"></iconify-icon>
                    <span>Trạm: {carData.stationName || 'Chưa xác định trạm'}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:map-marker-outline"></iconify-icon>
                    <span>Vị trí: {carData.raw?.location || carData.location || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:counter"></iconify-icon>
                    <span>Số chuyến: {carData.raw?.tripCount || carData.trips || 0}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:car-seat"></iconify-icon>
                    <span>Số ghế: {carData.raw?.seats || 4} ghế</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:battery"></iconify-icon>
                    <span>Tình trạng pin: {carData.raw?.batteryLevel != null ? `${carData.raw.batteryLevel}%` : 'Chưa cập nhật'}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:battery-charging"></iconify-icon>
                    <span>Dung lượng pin: {carData.raw?.batteryCapacity ? `${carData.raw.batteryCapacity} kWh` : 'Chưa cập nhật'}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:road-variant"></iconify-icon>
                    <span>Phạm vi: {carData.raw?.range ? `${carData.raw.range}km` : 'Chưa cập nhật'}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:power-plug-outline"></iconify-icon>
                    <span>Loại sạc: {carData.raw?.chargingType || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:lightning-bolt-outline"></iconify-icon>
                    <span>Tốc độ sạc: {carData.raw?.chargingSpeed ? `${carData.raw.chargingSpeed}kW` : '10 - 70% trong ~25 mins'}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:card-text-outline"></iconify-icon>
                    <span>Biển số: {carData.raw?.licensePlate || carData.licensePlate}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:calendar-check"></iconify-icon>
                    <span>Bảo trì cuối: {carData.raw?.lastMaintenanceDate || carData.lastMaintenance}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:cog-outline"></iconify-icon>
                    <span>Tình trạng kỹ thuật: {carData.raw?.technicalCondition === 'EXCELLENT' ? 'Xuất sắc' :
                                                      carData.raw?.technicalCondition === 'GOOD' ? 'Tốt' :
                                                      carData.raw?.technicalCondition === 'FAIR' ? 'Khá' :
                                                      carData.raw?.technicalCondition === 'POOR' ? 'Yếu' : 'Tốt'}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:check-circle-outline"></iconify-icon>
                    <span>Trạng thái: {carData.raw?.status === 'AVAILABLE' ? 'Có sẵn' : 
                                     carData.raw?.status === 'RENTED' ? 'Đang cho thuê' : 
                                     carData.raw?.status === 'RESERVED' ? 'Đã đặt trước' :
                                     carData.raw?.status === 'MAINTENANCE' ? 'Đang bảo trì' : 'Không xác định'}</span>
                  </div>
                  <div className="detail-item">
                    <iconify-icon icon="mdi:currency-usd"></iconify-icon>
                    <span>Giá thuê: {(carData.raw?.pricePerHour || carData.pricePerHour).toLocaleString()}đ/giờ</span>
                  </div>
                </div>
              </div>

            {/* Description Section - Hiển thị mô tả xe nếu có */}
            {carData.raw?.description && (
              <div className="vehicle-description">
                <h3>Mô tả chi tiết</h3>
                <div className="description-content">
                  <p>{carData.raw.description}</p>
                </div>
              </div>
            )}

            {/* Terms Section */}
            <div id="terms-section" className="terms-section">
              <h3>Điều khoản</h3>
              <div className="terms-content">
                <ul>
                  <li>Thanh toán tiền thuê xe ngay khi nhận xe.</li>
                  <li>Sử dụng xe đúng mục đích.</li>
                  <li>Không sử dụng xe thuê vào mục đích phi pháp, trái pháp luật.</li>
                  <li>Không sử dụng xe thuê để cầm cố, thế chấp.</li>
                  <li>Không hút thuốc, nhả kẹo cao su, xả rác trong xe.</li>
                  <li>Không chở hàng quốc cấm có mùi hôi.</li>
                  <li>Không thay đổi cấu trúc xe.</li>
                  <li>Không được lái xe khi say xỉn, trong xe.</li>
                  <li>Không được hỗ chuyển xe đến khu vực biên giới, cửa khẩu.</li>
                  <li>Khi trả xe, nếu xe bẩn hoặc có mùi trong xe, khách hàng vui lòng vệ sinh xe sạch sẽ hoặc gửi phụ thu phí vệ sinh xe.</li>
                </ul>
              </div>
            </div>

            {/* Cancellation Policy Section */}
            <div className="cancellation-section">
              <h3>Chính sách hủy chuyến</h3>
              
              <div className="cancellation-table">
                <div className="table-header">
                  <div className="header-cell">Thời điểm hủy chuyến</div>
                  <div className="header-cell">Phí hủy chuyến</div>
                </div>
                
                <div className="table-row">
                  <div className="cell">Trong vòng 1 giờ sau đặt chuyến</div>
                  <div className="cell">Miễn phí</div>
                </div>
                
                <div className="table-row">
                  <div className="cell">Trước chuyến đi ít hơn 7 ngày<br/>(Sau 1 giờ đặt chuyến)</div>
                  <div className="cell">10% giá trị chuyến đi</div>
                </div>
                
                <div className="table-row">
                  <div className="cell">Trong vòng 7 ngày trước chuyến đi<br/>(Sau 1 giờ đặt chuyến)</div>
                  <div className="cell">40% giá trị chuyến đi</div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div className="right-column">
            <div className="booking-section">
              <div className="price-display">
                <span className="price">{(carData.raw?.pricePerHour || carData.pricePerHour).toLocaleString()}đ/giờ</span>
              </div>
              
              <div className="date-selection">
                <div className="date-input-group">
                  <label>Ngày & giờ nhận xe</label>
                  <div className="input-field datetime-field" onClick={() => {
                    setDateSelectionMode('start');
                    setShowDateModal(true);
                  }}>
                    <iconify-icon icon="mdi:clock-outline"></iconify-icon>
                    <span>{startTime}</span>
                    <iconify-icon icon="mdi:calendar-month"></iconify-icon>
                    <span>{formatSelectedDate(selectedStartDate)}</span>
                  </div>
                </div>
                
                <div className="date-input-group">
                  <label>Ngày & giờ trả xe (mặc định 23:00)</label>
                  <div className="input-field datetime-field" onClick={() => {
                    setDateSelectionMode('end');
                    setShowDateModal(true);
                  }}>
                    <iconify-icon icon="mdi:clock-outline"></iconify-icon>
                    <span>{endTime}</span>
                    <iconify-icon icon="mdi:calendar-month"></iconify-icon>
                    <span>{formatSelectedDate(selectedEndDate)}</span>
                  </div>
                </div>
              </div>

              <div className="car-booking-options">
                <div className="car-booking-option-card selected">
                  <div className="car-booking-option-content">
                    <div className="car-booking-option-title">
                      <i className="fas fa-credit-card" style={{marginRight: '0.5rem', color: '#007bff'}}></i>
                      Đặt trước
                    </div>
                    <div className="car-booking-option-desc">Thanh toán khi nhận xe • Không cần cọc trước</div>
                  </div>
                </div>
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Đơn giá thuê</span>
                  <span>{(carData.raw?.pricePerHour || carData.pricePerHour).toLocaleString()}đ/giờ</span>
                </div>
                {rentalDetails.hours > 1 && (
                  <div className="price-row">
                    <span>Số giờ thuê</span>
                    <span>{rentalDetails.hours} giờ</span>
                  </div>
                )}
              </div>

              <div className="terms-checkbox">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreeToTerms}
                  onChange={handleTermsCheckboxClick}
                />
                <label htmlFor="terms">
                  Tôi đã đọc và đồng ý với tất cả điều khoản
                  <a href="#terms-section" className="terms-link" onClick={scrollToTerms}>Tìm hiểu điều khoản</a>
                </label>
              </div>

              <div className="total-section">
                <div className="total-row">
                  <span>Tổng cộng</span>
                  <span>{(carData.raw?.pricePerHour || carData.pricePerHour).toLocaleString()}đ x {rentalDetails.hours} giờ</span>
                </div>
                <div className="total-row final-total">
                  <span>Thành tiền</span>
                  <span>{rentalDetails.totalPrice.toLocaleString()}đ</span>
                </div>
              </div>

              <button 
                className="book-now-button" 
                onClick={handleBooking}
                disabled={!(carData && carData.raw && carData.raw.status === 'AVAILABLE')}
              >
                {carData && carData.raw && carData.raw.status === 'AVAILABLE' ? 'Đặt xe' : (carData && carData.raw && carData.raw.status === 'RENTED' ? 'Đang cho thuê' : 'Đã đặt trước')}
              </button>
            </div>
            
            {/* Additional Fees Box - Below booking section */}
            <div className="additional-fees-box">
              <h4>Phụ phí có thể phát sinh</h4>
              
              <div className="fee-item">
                <div className="fee-info">
                  <div className="fee-title">Phí vượt giới hạn</div>
                  <div className="fee-amount">3.000đ /km</div>
                </div>
                <div className="fee-description">
                  Phụ phí phát sinh nếu lộ trình di chuyển vượt quá 350km khi thuê xe 1 ngày
                </div>
              </div>
              
              <div className="fee-item">
                <div className="fee-info">
                  <div className="fee-title">Phí quá giờ</div>
                  <div className="fee-amount">70.000đ /giờ</div>
                </div>
                <div className="fee-description">
                  Phụ phí phát sinh nếu hoàn trả xe trễ giờ. Trường hợp trễ quá 5 giờ, phụ thu thêm 1 ngày thuê
                </div>
              </div>
              
              <div className="fee-item">
                <div className="fee-info">
                  <div className="fee-title">Phí vệ sinh</div>
                  <div className="fee-amount">70.000đ</div>
                </div>
                <div className="fee-description">
                  Phụ phí phát sinh khi xe hoàn trả không đảm bảo vệ sinh (nhiều vết bẩn, bùn cát, sinh lây...)
                </div>
              </div>
              
              <div className="fee-item">
                <div className="fee-info">
                  <div className="fee-title">Phí khử mùi</div>
                  <div className="fee-amount">500.000đ</div>
                </div>
                <div className="fee-description">
                  Phụ phí phát sinh khi xe hoàn trả bị âm mùi khó chịu (mùi thuốc lá, thực phẩm nặng mùi...)
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showTermsModal && (
        <div className="modal-overlay">
          <div className="terms-modal">
            <div className="modal-header">
              <h3>Hợp đồng điện tử thuê xe</h3>
              <button className="modal-close" onClick={handleDeclineTerms}>
                <iconify-icon icon="material-symbols:close"></iconify-icon>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="contract-text">
                <p><strong>ĐIỀU KHOẢN VÀ ĐIỀU KIỆN THUÊ XE</strong></p>
                
                <p>Bằng việc đồng ý với các điều khoản này, bạn cam kết:</p>
                
                <ul>
                  <li>Thanh toán tiền thuê xe ngay khi nhận xe</li>
                  <li>Sử dụng xe đúng mục đích, tuân thủ luật giao thông</li>
                  <li>Không sử dụng xe vào mục đích phi pháp, trái pháp luật</li>
                  <li>Không sử dụng xe để cầm cố, thế chấp</li>
                  <li>Giữ gìn xe sạch sẽ, không hút thuốc trong xe</li>
                  <li>Chịu trách nhiệm về mọi thiệt hại xảy ra trong thời gian thuê</li>
                  <li>Bồi thường theo quy định nếu vi phạm hợp đồng</li>
                </ul>
                
                <div className="warning-text">
                  <p><strong>⚠️ CẢNH BÁO QUAN TRỌNG:</strong></p>
                  <p>Việc vi phạm bất kỳ điều khoản nào trong hợp đồng này sẽ khiến bạn phải chịu <strong>TOÀN BỘ TRÁCH NHIỆM PHÁP LÝ</strong> và bồi thường thiệt hại theo quy định của pháp luật.</p>
                  <p>Hợp đồng điện tử này có giá trị pháp lý tương đương hợp đồng giấy.</p>
                  
                  <p><strong>🚨 NHỮNG ĐIỀU BẠN CẦN BIẾT:</strong></p>
                  <ul>
                    <li><strong>Vi phạm giao thông:</strong> Phạt nguội, vi phạm tốc độ sẽ được chuyển về tài khoản của bạn</li>
                    <li><strong>Tai nạn giao thông:</strong> Bạn chịu trách nhiệm bồi thường 100% thiệt hại</li>
                    <li><strong>Mất mát, hỏng hóc:</strong> Bồi thường theo giá trị thực tế của xe và phụ kiện</li>
                    <li><strong>Sử dụng sai mục đích:</strong> Phạt tối thiểu 10 triệu đồng</li>
                    <li><strong>Trả xe trễ:</strong> Phụ thu 70.000đ/giờ, quá 5 giờ tính thêm 1 ngày thuê</li>
                  </ul>
                  
                  <p><strong>📋 CAM KẾT CỦA BẠN:</strong></p>
                  <p>Bằng việc ký hợp đồng điện tử này, bạn cam kết đã đọc, hiểu rõ và đồng ý tuân thủ tất cả các điều khoản. Việc vi phạm sẽ bị xử lý theo pháp luật Việt Nam.</p>
                  
                  <p><strong>🔒 TÍNH PHÁP LÝ:</strong></p>
                  <p>Hợp đồng được lưu trữ điện tử với chữ ký số, có đầy đủ giá trị pháp lý theo Luật Giao dịch điện tử số 51/2005/QH11.</p>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="decline-btn" onClick={handleDeclineTerms}>
                Từ chối
              </button>
              <button className="accept-btn" onClick={handleAcceptTerms}>
                Đồng ý và ký hợp đồng
              </button>
            </div>
          </div>
        </div>
      )}

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
      
      {/* Payment Modal */}
      {showPaymentModal && pendingBookingData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          bookingData={{
            bookingId: null, // Will be created after payment
            totalPrice: pendingBookingData.totalPrice,
            startDateTime: pendingBookingData.startDateTime,
            endDateTime: pendingBookingData.endDateTime
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
      
      {/* Date Selection Modal */}
      {showDateModal && (
        <div className="car-booking-modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="car-booking-modal-content" onClick={e => e.stopPropagation()}>
            <div className="car-booking-modal-header">
              <h2>{dateSelectionMode === 'start' ? 'Chọn ngày & giờ nhận xe' : 'Chọn ngày & giờ trả xe'}</h2>
              <button className="close-button" onClick={() => setShowDateModal(false)}>
                <iconify-icon icon="mdi:close"></iconify-icon>
              </button>
            </div>
            <div className="car-booking-modal-body">
              <div className="time-selection">
                {dateSelectionMode === 'start' ? (
                  <div className="time-group">
                    <label>Giờ nhận</label>
                    <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                      {getAvailableTimeOptions(selectedStartDate)}
                    </select>
                  </div>
                ) : (
                  <div className="time-group">
                    <label>Giờ trả</label>
                    <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                      {getAvailableTimeOptions(selectedEndDate, true, selectedStartDate?.getTime() === selectedEndDate?.getTime() ? startTime : null)}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="car-detail-calendar-container">
                <div className="car-detail-calendar-navigation">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                    <iconify-icon icon="mdi:chevron-left"></iconify-icon>
                  </button>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                    <iconify-icon icon="mdi:chevron-right"></iconify-icon>
                  </button>
                </div>
                <div className="car-detail-calendars">
                  {renderCalendar(0)}
                </div>
              </div>
            </div>
            <div className="car-booking-modal-footer">
              <button 
                className="button secondary" 
                onClick={() => {
                  if (dateSelectionMode === 'start') {
                    setSelectedStartDate(new Date());
                    setStartTime('08:00');
                  } else {
                    setSelectedEndDate(new Date());
                    setEndTime('08:00');
                  }
                }}
              >
                Đặt về hôm nay
              </button>
              <button 
                className="button primary" 
                onClick={() => setShowDateModal(false)}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetail;