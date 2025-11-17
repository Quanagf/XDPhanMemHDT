import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStations, getProvinces } from '../api/stations';

const Hero = () => {
  const navigate = useNavigate();
  const [showDateModal, setShowDateModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('day'); // 'day' hoặc 'hour'
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [startTime, setStartTime] = useState('21:00');
  const [endTime, setEndTime] = useState('20:00');
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // Tháng 11/2025
  const [hourRentalDuration, setHourRentalDuration] = useState(4); // Số giờ thuê
  const [hourRentalStartTime, setHourRentalStartTime] = useState('07:00'); // Giờ bắt đầu cho thuê theo giờ
  
  // State cho provinces và stations
  const [provinces, setProvinces] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [tempProvince, setTempProvince] = useState(''); // Lưu tạm khi chọn trong modal
  const [tempStation, setTempStation] = useState(''); // Lưu tạm khi chọn trong modal
  const [loading, setLoading] = useState(true);

  // Load provinces và stations từ database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [provincesData, stationsData] = await Promise.all([
          getProvinces(),
          getStations()
        ]);
        setProvinces(provincesData || []);
        setStations(stationsData || []);
        
        // Set giá trị mặc định
        if (provincesData && provincesData.length > 0) {
          setSelectedProvince(provincesData[0]);
          setTempProvince(provincesData[0]);
        }
        if (stationsData && stationsData.length > 0) {
          setSelectedStation(stationsData[0].id.toString());
          setTempStation(stationsData[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter stations theo province
  const filteredStations = selectedProvince 
    ? stations.filter(s => s.province === selectedProvince)
    : stations;

  // Filter stations theo temp province cho modal
  const tempFilteredStations = tempProvince 
    ? stations.filter(s => s.province === tempProvince)
    : stations;

  // Hàm để lấy text hiển thị cho location và station
  const getLocationStationDisplayText = () => {
    if (selectedProvince && selectedStation) {
      const stationData = stations.find(s => s.id.toString() === selectedStation);
      if (stationData) {
        return `${selectedProvince} - ${stationData.name}`;
      }
    }
    return 'Chọn địa điểm và trạm thuê';
  };

  // Xử lý khi confirm chọn location
  const handleConfirmLocation = () => {
    setSelectedProvince(tempProvince);
    setSelectedStation(tempStation);
    setShowLocationModal(false);
  };

  // Xử lý khi mở location modal
  const handleOpenLocationModal = () => {
    setTempProvince(selectedProvince);
    setTempStation(selectedStation);
    setShowLocationModal(true);
  };

  // Xử lý khi chọn province trong modal
  const handleProvinceSelect = (province) => {
    setTempProvince(province);
    // Reset station khi đổi province
    const stationsInProvince = stations.filter(s => s.province === province);
    if (stationsInProvince.length > 0) {
      setTempStation(stationsInProvince[0].id.toString());
    } else {
      setTempStation('');
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${time} ${day}/${month}`;
  };

  // Tính giờ kết thúc cho thuê theo giờ
  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
    
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  };

  // Tính ngày kết thúc cho thuê theo giờ (có thể qua ngày)
  const calculateEndDate = (startDate, startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(startDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);
    
    return endDateTime;
  };

  const formatDateTimeWithDate = (date, time) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${time} ${day}/${month}`;
  };

  const getDisplayText = () => {
    if (activeTab === 'day') {
      if (selectedStartDate && selectedEndDate) {
        return `${formatDateTime(selectedStartDate, startTime)} - ${formatDateTime(selectedEndDate, endTime)}`;
      }
    } else {
      if (selectedStartDate) {
        const endDateTime = calculateEndDate(selectedStartDate, hourRentalStartTime, hourRentalDuration);
        const calculatedEndTime = calculateEndTime(hourRentalStartTime, hourRentalDuration);
        
        // Kiểm tra xem có qua ngày không
        const isSameDay = selectedStartDate.getDate() === endDateTime.getDate() && 
                         selectedStartDate.getMonth() === endDateTime.getMonth() &&
                         selectedStartDate.getFullYear() === endDateTime.getFullYear();
        
        if (isSameDay) {
          return `${formatDateTime(selectedStartDate, hourRentalStartTime)} - ${formatDateTime(selectedStartDate, calculatedEndTime)}`;
        } else {
          return `${formatDateTime(selectedStartDate, hourRentalStartTime)} - ${formatDateTimeWithDate(endDateTime, calculatedEndTime)}`;
        }
      }
    }
    return 'Chọn thời gian thuê và trả';
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = (monthOffset = 0) => {
    const displayMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset);
    const daysInMonth = getDaysInMonth(displayMonth);
    const firstDay = getFirstDayOfMonth(displayMonth);
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const days = [];
    const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
      const isSelected = (selectedStartDate && date.getTime() === selectedStartDate.getTime()) ||
                        (selectedEndDate && date.getTime() === selectedEndDate.getTime());
      const isInRange = selectedStartDate && selectedEndDate && 
                       date >= selectedStartDate && date <= selectedEndDate;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="calendar-month">
        <div className="calendar-header">
          <h3>{monthNames[displayMonth.getMonth()]}</h3>
        </div>
        <div className="calendar-weekdays">
          {dayLabels.map(label => (
            <div key={label} className="calendar-weekday">{label}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {days}
        </div>
      </div>
    );
  };

  const handleDateClick = (date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (date >= selectedStartDate) {
      setSelectedEndDate(date);
    } else {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Reset trạng thái khi chuyển tab
    if (newTab === 'hour') {
      // Khi chuyển sang thuê theo giờ, chỉ cần selectedStartDate
      setSelectedEndDate(null);
    }
  };

  const calculateDuration = () => {
    if (selectedStartDate && selectedEndDate) {
      const diffTime = Math.abs(selectedEndDate - selectedStartDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validation: Kiểm tra đã chọn đầy đủ thông tin chưa
    if (activeTab === 'day') {
      if (!selectedStartDate || !selectedEndDate) {
        alert('Vui lòng chọn ngày bắt đầu và ngày kết thúc!');
        return;
      }
    } else {
      if (!selectedStartDate) {
        alert('Vui lòng chọn ngày thuê xe!');
        return;
      }
    }

    // Tìm thông tin station đã chọn
    const selectedStationData = stations.find(s => s.id.toString() === selectedStation);
    
    // Tạo URL params để chuyển sang trang search
    const searchParams = new URLSearchParams({
      location: selectedProvince || '',
      station: selectedStationData ? selectedStationData.name : '',
      stationId: selectedStation || '',
      startDate: selectedStartDate.toISOString(),
      endDate: activeTab === 'day' ? selectedEndDate.toISOString() : selectedStartDate.toISOString(),
      startTime: activeTab === 'day' ? startTime : hourRentalStartTime,
      endTime: activeTab === 'day' ? endTime : calculateEndTime(hourRentalStartTime, hourRentalDuration),
      rentalType: activeTab,
      duration: activeTab === 'hour' ? hourRentalDuration : calculateDuration()
    });
    
    navigate(`/search?${searchParams.toString()}`);
  };
  
  return (
    <>
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
        <form className="booking-form" onSubmit={handleSearch}>
          <div className="form-inputs">
            <div className="input-group location-station">
              <label htmlFor="location-station">Địa điểm và trạm thuê</label>
              <div className="input-field location-station-selector" onClick={handleOpenLocationModal}>
                <iconify-icon icon="material-symbols:location-on" aria-hidden="true"></iconify-icon>
                <span className="location-station-display">{getLocationStationDisplayText()}</span>
                <iconify-icon icon="mdi:chevron-down" aria-hidden="true"></iconify-icon>
              </div>
            </div>
            
            <div className="input-group datetime-picker">
              <label htmlFor="rent-time">Thời gian thuê</label>
              <div className="input-field datetime-range" onClick={() => setShowDateModal(true)}>
                <iconify-icon icon="mdi:calendar-month" aria-hidden="true"></iconify-icon>
                <span className="datetime-display">{getDisplayText()}</span>
                <iconify-icon icon="mdi:chevron-down" aria-hidden="true"></iconify-icon>
              </div>
            </div>
          </div>
          
          <button type="submit" className="search-btn">
            <iconify-icon icon="mdi:magnify" aria-hidden="true"></iconify-icon> Tìm xe
          </button>
        </form>
      </div>

      {/* Date Time Modal */}
      {showDateModal && (
        <div className="datetime-modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="datetime-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowDateModal(false)}>
              <iconify-icon icon="mdi:close"></iconify-icon>
            </button>
            
            <div className="modal-header">
              <h2>Thời gian</h2>
            </div>

            <div className="modal-tabs">
              <button 
                className={`tab-btn ${activeTab === 'day' ? 'active' : ''}`}
                onClick={() => handleTabChange('day')}
              >
                Thuê theo ngày
              </button>
              <button 
                className={`tab-btn ${activeTab === 'hour' ? 'active' : ''}`}
                onClick={() => handleTabChange('hour')}
              >
                Thuê theo giờ
              </button>
            </div>

            <div className="modal-content">
              {activeTab === 'day' ? (
                <div className="day-rental-content">
                  <div className="calendar-container">
                    <div className="calendar-navigation">
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                        <iconify-icon icon="mdi:chevron-left"></iconify-icon>
                      </button>
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                        <iconify-icon icon="mdi:chevron-right"></iconify-icon>
                      </button>
                    </div>
                    <div className="calendars">
                      {renderCalendar(0)}
                      {renderCalendar(1)}
                    </div>
                  </div>

                  <div className="time-selectors">
                    <div className="time-selector">
                      <label>Nhận xe</label>
                      <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                        {Array.from({length: 24}, (_, i) => {
                          const hour = String(i).padStart(2, '0');
                          return <option key={i} value={`${hour}:00`}>{hour}:00</option>;
                        })}
                      </select>
                    </div>
                    <div className="time-selector">
                      <label>Trả xe</label>
                      <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                        {Array.from({length: 24}, (_, i) => {
                          const hour = String(i).padStart(2, '0');
                          return <option key={i} value={`${hour}:00`}>{hour}:00</option>;
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="rental-summary">
                    <div className="summary-text">
                      {selectedStartDate && selectedEndDate && (
                        <>
                          <div className="rental-period">
                            {formatDateTime(selectedStartDate, startTime)} - {formatDateTime(selectedEndDate, endTime)}
                          </div>
                          <div className="rental-duration">
                            Thời gian thuê: {calculateDuration()} ngày
                          </div>
                        </>
                      )}
                    </div>
                    <button 
                      className="continue-btn"
                      disabled={!selectedStartDate || !selectedEndDate}
                      onClick={() => setShowDateModal(false)}
                    >
                      Tiếp tục
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hour-rental-content">
                  <div className="hour-inputs">
                    <div className="input-group">
                      <label>Ngày bắt đầu</label>
                      <input 
                        type="date" 
                        value={selectedStartDate ? selectedStartDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setSelectedStartDate(new Date(e.target.value))}
                      />
                    </div>
                    <div className="input-group">
                      <label>Giờ nhận xe</label>
                      <select value={hourRentalStartTime} onChange={(e) => setHourRentalStartTime(e.target.value)}>
                        {Array.from({length: 24}, (_, i) => {
                          const hour = String(i).padStart(2, '0');
                          return <option key={i} value={`${hour}:00`}>{hour}:00</option>;
                        })}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Thời gian thuê</label>
                      <select value={hourRentalDuration} onChange={(e) => setHourRentalDuration(Number(e.target.value))}>
                        <option value="4">4 giờ</option>
                        <option value="5">5 giờ</option>
                        <option value="6">6 giờ</option>
                        <option value="7">7 giờ</option>
                        <option value="8">8 giờ</option>
                        <option value="9">9 giờ</option>
                        <option value="10">10 giờ</option>
                      </select>
                    </div>
                  </div>

                  <div className="rental-summary">
                    <div className="summary-text">
                      {selectedStartDate && (
                        <>
                          <div className="rental-period">
                            {(() => {
                              const endDateTime = calculateEndDate(selectedStartDate, hourRentalStartTime, hourRentalDuration);
                              const calculatedEndTime = calculateEndTime(hourRentalStartTime, hourRentalDuration);
                              
                              const isSameDay = selectedStartDate.getDate() === endDateTime.getDate() && 
                                               selectedStartDate.getMonth() === endDateTime.getMonth() &&
                                               selectedStartDate.getFullYear() === endDateTime.getFullYear();
                              
                              if (isSameDay) {
                                return `${formatDateTime(selectedStartDate, hourRentalStartTime)} - ${formatDateTime(selectedStartDate, calculatedEndTime)}`;
                              } else {
                                return `${formatDateTime(selectedStartDate, hourRentalStartTime)} - ${formatDateTimeWithDate(endDateTime, calculatedEndTime)}`;
                              }
                            })()}
                          </div>
                          <div className="rental-duration">
                            Thời gian thuê: {hourRentalDuration} giờ
                          </div>
                        </>
                      )}
                    </div>
                    <button 
                      className="continue-btn"
                      disabled={!selectedStartDate}
                      onClick={() => setShowDateModal(false)}
                    >
                      Tiếp tục
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="location-modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="location-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowLocationModal(false)}>
              <iconify-icon icon="mdi:close"></iconify-icon>
            </button>
            
            <div className="modal-header">
              <h2>Chọn địa điểm và trạm</h2>
            </div>

            <div className="location-modal-content">
              <div className="location-step">
                <h3>1. Chọn tỉnh/thành phố</h3>
                <div className="province-grid">
                  {provinces.map(province => (
                    <div 
                      key={province}
                      className={`province-card ${tempProvince === province ? 'selected' : ''}`}
                      onClick={() => handleProvinceSelect(province)}
                    >
                      <iconify-icon icon="material-symbols:location-on"></iconify-icon>
                      <span>{province}</span>
                    </div>
                  ))}
                </div>
              </div>

              {tempProvince && (
                <div className="location-step">
                  <h3>2. Chọn trạm thuê</h3>
                  {tempFilteredStations.length > 0 ? (
                    <div className="station-list">
                      {tempFilteredStations.map(station => (
                        <div 
                          key={station.id}
                          className={`station-card ${tempStation === station.id.toString() ? 'selected' : ''}`}
                          onClick={() => setTempStation(station.id.toString())}
                        >
                          <div className="station-info">
                            <h4 className="station-name">{station.name}</h4>
                            <p className="station-address">{station.address}</p>
                            <div className="station-details">
                              <span className="station-phone">
                                <iconify-icon icon="material-symbols:phone"></iconify-icon>
                                {station.phoneNumber || 'Chưa có thông tin'}
                              </span>
                              <span className="station-capacity">
                                <iconify-icon icon="mdi:car-multiple"></iconify-icon>
                                {station.capacity || 0} xe
                              </span>
                            </div>
                          </div>
                          <div className="station-status">
                            <span className={`status-badge ${station.status === 'OPEN' ? 'open' : 'closed'}`}>
                              {station.status === 'OPEN' ? 'Đang hoạt động' : 'Tạm đóng'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-stations">
                      <p>Không có trạm nào tại {tempProvince}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="location-summary">
                <div className="summary-text">
                  {tempProvince && tempStation && (() => {
                    const stationData = stations.find(s => s.id.toString() === tempStation);
                    return (
                      <div className="selected-location">
                        <div className="location-info">
                          <strong>{tempProvince}</strong>
                          {stationData && (
                            <>
                              <br />
                              <span>{stationData.name}</span>
                              <br />
                              <small>{stationData.address}</small>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <button 
                  className="confirm-btn"
                  disabled={!tempProvince || !tempStation}
                  onClick={handleConfirmLocation}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </section>
    </>
  );
};

export default Hero;