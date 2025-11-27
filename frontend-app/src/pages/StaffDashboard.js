import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/staff.css';
import '../styles/components/verification.css';
import '../styles/components/handover.css';
import '../styles/components/form.css';
import '../styles/components/customer-verification.css';
import '../styles/components/payment-management.css';
import vehicleAPI from '../api/vehicleAPI';
import { getAllComplaints, staffCompleteComplaint } from '../api/complaints';
import { getStations } from '../api/stations';
import { getStaffNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notifications';
import { createIncidentReport } from '../api/incidentReports';
import { getPendingBookingsByStation, getStationBookings, getPendingBookingsWithDetailsForStation, getActiveBookingsWithDetailsForStation, checkInVehicle, checkOutVehicle, uploadVehicleImage, uploadLicenseImage, confirmBooking, rejectBooking } from '../api/bookings';
import { getPendingPickups, getPendingReturns, processPickup, processReturn, cancelBooking } from '../api/handovers';
import { getPaymentRecordsByBooking, getTotalPaidAmount, createPaymentRecord } from '../api/paymentRecords';
import CountdownTimer from '../components/CountdownTimer';

// Add CSS animation for spinner
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('booking-approval'); // booking-approval, handover, verification, payment, maintenance, payment-records
  const [user, setUser] = useState(null);
  const [assignedStation, setAssignedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force re-render for button updates
  const navigate = useNavigate();

  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const parsedUser = JSON.parse(userProfile);
      setUser(parsedUser);
      
      // Kiểm tra quyền staff
      if (parsedUser.role !== 'STAFF') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = '/';
      } else {
        // Fetch thông tin stations để hiển thị tên trạm
        fetchStationsAndSetAssigned(parsedUser);
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    // Fetch unread count periodically
    if (assignedStation?.id) {
      fetchUnreadNotificationCount();
      const interval = setInterval(fetchUnreadNotificationCount, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [assignedStation]);

  // Update button states every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadNotificationCount = async () => {
    if (!assignedStation?.id) return;
    try {
      const count = await getUnreadCount(assignedStation.id);
      setUnreadNotificationCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  };

  const fetchStationsAndSetAssigned = async (userProfile) => {
    try {
      console.log('🔍 DEBUG - userProfile:', userProfile);
      const stationsData = await getStations();
      console.log('🔍 DEBUG - stationsData:', stationsData);
      setStations(stationsData || []);
      
      // Tìm trạm được phân công cho nhân viên
      if (userProfile.stationId && stationsData && stationsData.length > 0) {
        console.log('🔍 DEBUG - Looking for stationId:', userProfile.stationId);
        const station = stationsData.find(s => s.id === userProfile.stationId);
        console.log('🔍 DEBUG - Found station:', station);
        setAssignedStation(station);
        
        // Fetch bookings cho trạm này
        // fetchStationBookings(userProfile.stationId); // Di chuyển xuống sau
      } else {
        console.log('⚠️ DEBUG - Missing stationId or stations:', {
          hasStationId: !!userProfile.stationId,
          stationId: userProfile.stationId,
          stationsCount: stationsData?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f4f6',
            borderTop: '5px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '16px', fontWeight: '500' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="staff-dashboard">
      <div className="staff-container">
        {/* Sidebar */}
        <aside className="staff-sidebar">
          <div className="staff-profile">
            <div className="staff-avatar">{user.fullName.charAt(0)}</div>
            <h3>{user.fullName}</h3>
            <p className="staff-role">Nhân viên điểm thuê</p>
            <div className="staff-station">
              {assignedStation ? (
                <div style={{
                  background: 'rgba(33, 150, 243, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  margin: '8px 0'
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '13px', 
                    color: '#ffffff',
                    fontWeight: '500'
                  }}></p>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#2196F3'
                  }}>
                    Trạm:{assignedStation.name}
                  </p>
                  <p style={{ 
                    margin: '2px 0 0 0', 
                    fontSize: '12px', 
                    color: '#ffffff'
                  }}>
                    📍 {assignedStation.address}, {assignedStation.province}
                  </p>
                </div>
              ) : user.stationId ? (
                <p style={{
                  background: 'rgba(33, 150, 243, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  color: '#f57c00',
                  fontSize: '13px',
                  margin: '8px 0'
                }}>
                  Đang tải thông tin...
                </p>
              ) : (
                <p style={{
                  background: 'rgba(33, 150, 243, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  color: '#ffffff',
                  fontSize: '13px',
                  margin: '8px 0'
                }}>
                  <i className="fas fa-exclamation-triangle" style={{marginRight: '4px', color: '#f59e0b'}}></i>
                  Chưa được phân công trạm
                </p>
              )}
            </div>
          </div>

          <nav className="staff-nav">
            <button 
              className={`staff-nav-item ${activeTab === 'booking-approval' ? 'active' : ''}`}
              onClick={() => setActiveTab('booking-approval')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11H7v2h2v-2m4 0h-2v2h2v-2m4 0h-2v2h2v-2m2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V9h14v11Z"/>
                </svg>
              </span>
              ⏳ Xác nhận đặt xe
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'handover' ? 'active' : ''}`}
              onClick={() => setActiveTab('handover')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3C15 2.45 14.55 2 14 2H10C9.45 2 9 2.45 9 3V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM11 4H13V5H11V4ZM6.5 9.5C7.33 9.5 8 8.83 8 8S7.33 6.5 6.5 6.5 5 7.17 5 8 5.67 9.5 6.5 9.5ZM17.5 9.5C18.33 9.5 19 8.83 19 8S18.33 6.5 17.5 6.5 16 7.17 16 8 16.67 9.5 17.5 9.5Z"/>
                </svg>
              </span>
              Quản lý giao - nhận xe
              {unreadNotificationCount > 0 && (
                <span className="notification-badge">{unreadNotificationCount}</span>
              )}
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'walk-in-booking' ? 'active' : ''}`}
              onClick={() => setActiveTab('walk-in-booking')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                </svg>
              </span>
              Đặt xe tại điểm
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'maintenance' ? 'active' : ''}`}
              onClick={() => setActiveTab('maintenance')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.7,19L13.6,9.9C14.5,7.6 14,4.9 12.1,3C10.1,1 7.1,0.6 5.1,1.7L9.1,5.7L5.7,9.1L1.7,5.1C0.6,7.1 1,10.1 3,12.1C4.9,14 7.6,14.5 9.9,13.6L19,22.7C19.3,23 19.7,23 20,22.7L22.7,20C23,19.7 23,19.3 22.7,19Z"/>
                </svg>
              </span>
              Quản lý xe tại điểm
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
              onClick={() => setActiveTab('complaints')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M13,14H11V12H13M13,10H11V6H13"/>
                </svg>
              </span>
              Khiếu nại được phân công
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'payment-records' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment-records')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10V14A2,2 0 0,1 7,16H17A2,2 0 0,1 19,14V10A2,2 0 0,1 17,8H7Z"/>
                </svg>
              </span>
              💰 Ghi nhận thanh toán
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'booking-history' ? 'active' : ''}`}
              onClick={() => setActiveTab('booking-history')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z"/>
                </svg>
              </span>
              Lịch sử thuê xe
            </button>
          </nav>
          
          {/* Nút đăng xuất ở góc dưới */}
          <div className="sidebar-footer">
            <button 
              className="staff-nav-item logout-btn"
              onClick={handleLogout}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                </svg>
              </span>
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="staff-main">
          {activeTab === 'booking-approval' && <BookingApproval assignedStation={assignedStation} />}
          {activeTab === 'walk-in-booking' && <WalkInBooking assignedStation={assignedStation} />}
          {activeTab === 'handover' && <VehicleHandover 
            assignedStation={assignedStation} 
            onNotificationUpdate={fetchUnreadNotificationCount}
          />}
          {activeTab === 'maintenance' && <VehicleMaintenance assignedStation={assignedStation} />}
          {activeTab === 'complaints' && <MyComplaintsManagement user={user} assignedStation={assignedStation} />}
          {activeTab === 'payment-records' && <PaymentManagement assignedStation={assignedStation} user={user} />}
          {activeTab === 'booking-history' && <StaffBookingHistory assignedStation={assignedStation} />}
        </main>
      </div>
    </div>
  );
};

// Component: Quản lý giao - nhận xe (UPDATED)
const VehicleHandover = ({ assignedStation, onNotificationUpdate }) => {
  const [activeSubTab, setActiveSubTab] = useState('pickup'); // pickup hoặc return
  const [pickupList, setPickupList] = useState([]);
  const [returnList, setReturnList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  
  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterCustomerName, setFilterCustomerName] = useState('');
  
  // Form states cho giao xe (PICKUP)
  const [customerArrived, setCustomerArrived] = useState(false);
  const [customerVerified, setCustomerVerified] = useState(false);
  const [vehicleImages, setVehicleImages] = useState([]);
  const [vehicleConditionNotes, setVehicleConditionNotes] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [renterSignatureFile, setRenterSignatureFile] = useState(null);
  const [staffSignatureFile, setStaffSignatureFile] = useState(null);
  
  // Form states cho trả xe (RETURN)
  const [vehicleVerified, setVehicleVerified] = useState(false);
  const [returnVehicleImages, setReturnVehicleImages] = useState([]);
  const [returnConditionNotes, setReturnConditionNotes] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState('0');
  const [additionalChargesReason, setAdditionalChargesReason] = useState('');
  const [finalPaymentAmount, setFinalPaymentAmount] = useState('');
  
  // Tạo debounce function đơn giản
  const useDebounce = (fn, delay) => {
    const timer = useRef(null);
    return (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    };
  };

  // Tạo debounced version của loadVehicles để tránh gọi quá nhiều
  const debouncedLoadVehicles = useDebounce(() => {
    if (assignedStation?.id) {
      loadVehicles();
    }
  }, 300);
  useEffect(() => {
    if (assignedStation?.id) {
      loadHandoverData();
    }
  }, [assignedStation, filterDate, filterCustomerName, activeSubTab]);
  
  const loadHandoverData = async () => {
    if (!assignedStation?.id) return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading handover data for station:', assignedStation.id, 'type:', activeSubTab);
      
      if (activeSubTab === 'pickup') {
        const data = await getPendingPickups(
          assignedStation.id,
          filterDate || null,
          null,
          filterCustomerName || null
        );
        console.log('✅ Pickup data received:', data);
        console.log('📊 Pickup data type:', typeof data, 'isArray:', Array.isArray(data));
        // Đảm bảo data là array
        setPickupList(Array.isArray(data) ? data : []);
      } else {
        // TAB NHẬN XE: Không filter theo ngày để hiển thị tất cả xe quá hạn (tính phí trễ)
        const data = await getPendingReturns(
          assignedStation.id,
          null, // Bỏ filter ngày
          null,
          filterCustomerName || null
        );
        console.log('✅ Return data received:', data);
        console.log('📊 Return data type:', typeof data, 'isArray:', Array.isArray(data));
        // Đảm bảo data là array
        setReturnList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('❌ Lỗi tải danh sách:', error);
      console.error('❌ Error details:', error.message, error.response);
      // Set về array rỗng khi lỗi
      if (activeSubTab === 'pickup') {
        setPickupList([]);
      } else {
        setReturnList([]);
      }
      alert('Không thể tải danh sách. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    const reason = prompt(`Hủy booking ${booking.bookingCode}?\n\nNhập lý do hủy (tùy chọn):`);
    if (reason === null) return; // User clicked Cancel
    
    try {
      await cancelBooking(booking.bookingId, reason);
      alert('Đã hủy booking thành công!');
      loadHandoverData(); // Reload list
    } catch (error) {
      console.error('❌ Lỗi hủy booking:', error);
      alert('Không thể hủy booking. Vui lòng thử lại!');
    }
  };
  
  const handleOpenProcessModal = (booking) => {
    setSelectedBooking(booking);
    setShowProcessModal(true);
    
    // Reset form
    if (activeSubTab === 'pickup') {
      setCustomerArrived(false);
      setCustomerVerified(false);
      setVehicleImages([]);
      setVehicleConditionNotes('');
      setDepositAmount('');
      setPaymentMethod('CASH');
      setRenterSignatureFile(null);
      setStaffSignatureFile(null);
    } else {
      setVehicleVerified(false);
      setReturnVehicleImages([]);
      setReturnConditionNotes('');
      setAdditionalCharges('0');
      setAdditionalChargesReason('');
      setFinalPaymentAmount('');
      setRenterSignatureFile(null);
      setStaffSignatureFile(null);
    }
  };
  
  const handleProcessPickup = async () => {
    if (!selectedBooking) return;
    
    // Validation
    if (!customerArrived) {
      alert('Vui lòng xác nhận khách hàng đã đến điểm!');
      return;
    }
    if (!customerVerified) {
      alert('Vui lòng xác thực GPLX/CCCD của khách hàng!');
      return;
    }
    if (vehicleImages.length === 0) {
      alert('Vui lòng chụp ảnh tình trạng xe!');
      return;
    }
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Vui lòng nhập số tiền đặt cọc!');
      return;
    }
    if (!renterSignatureFile || !staffSignatureFile) {
      alert('Vui lòng upload chữ ký của khách hàng và nhân viên!');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bookingId', selectedBooking.bookingId);
      formData.append('customerArrived', customerArrived);
      formData.append('customerVerified', customerVerified);
      
      // Append vehicle images
      vehicleImages.forEach((file) => {
        formData.append('vehicleImages', file);
      });
      
      if (vehicleConditionNotes) {
        formData.append('vehicleConditionNotes', vehicleConditionNotes);
      }
      formData.append('depositAmount', depositAmount);
      formData.append('paymentMethod', paymentMethod);
      
      // Append signature files (required)
      if (renterSignatureFile) {
        formData.append('renterSignatureFile', renterSignatureFile);
      }
      if (staffSignatureFile) {
        formData.append('staffSignatureFile', staffSignatureFile);
      }
      
      await processPickup(formData);
      
      alert('Giao xe thành công!');
      setShowProcessModal(false);
      loadHandoverData(); // Reload danh sách
    } catch (error) {
      console.error('Lỗi giao xe:', error);
      alert('Có lỗi xảy ra khi giao xe. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProcessReturn = async () => {
    if (!selectedBooking) return;
    
    // Validation
    if (!vehicleVerified) {
      alert('Vui lòng xác thực xe trả có đúng không!');
      return;
    }
    if (returnVehicleImages.length === 0) {
      alert('Vui lòng chụp ảnh tình trạng xe!');
      return;
    }
    if (!finalPaymentAmount || parseFloat(finalPaymentAmount) < 0) {
      alert('Vui lòng nhập số tiền thanh toán!');
      return;
    }
    if (!renterSignatureFile || !staffSignatureFile) {
      alert('Vui lòng upload chữ ký của khách hàng và nhân viên!');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bookingId', selectedBooking.bookingId);
      formData.append('vehicleVerified', vehicleVerified);
      
      // Append vehicle images
      returnVehicleImages.forEach((file) => {
        formData.append('vehicleImages', file);
      });
      
      if (returnConditionNotes) {
        formData.append('vehicleConditionNotes', returnConditionNotes);
      }
      formData.append('additionalCharges', additionalCharges);
      if (additionalChargesReason) {
        formData.append('additionalChargesReason', additionalChargesReason);
      }
      formData.append('finalPaymentAmount', finalPaymentAmount);
      formData.append('paymentMethod', paymentMethod);
      
      // Append signature files (required)
      if (renterSignatureFile) {
        formData.append('renterSignatureFile', renterSignatureFile);
      }
      if (staffSignatureFile) {
        formData.append('staffSignatureFile', staffSignatureFile);
      }
      
      await processReturn(formData);
      
      alert('Nhận xe trả thành công!');
      setShowProcessModal(false);
      loadHandoverData(); // Reload danh sách
    } catch (error) {
      console.error('Lỗi nhận xe trả:', error);
      alert('Có lỗi xảy ra khi nhận xe trả. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVehicleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (activeSubTab === 'pickup') {
      setVehicleImages([...vehicleImages, ...files]);
    } else {
      setReturnVehicleImages([...returnVehicleImages, ...files]);
    }
  };
  
  const removeVehicleImage = (index) => {
    if (activeSubTab === 'pickup') {
      setVehicleImages(vehicleImages.filter((_, i) => i !== index));
    } else {
      setReturnVehicleImages(returnVehicleImages.filter((_, i) => i !== index));
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
          Quản lý giao - nhận xe
        </h2>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Trạm: {assignedStation?.name || 'Chưa được phân công'}
        </p>
      </div>
      
      {/* Sub-tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveSubTab('pickup')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeSubTab === 'pickup' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeSubTab === 'pickup' ? 'white' : '#6b7280',
            fontWeight: '600',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s'
          }}
        >
          Giao xe ({pickupList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('return')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeSubTab === 'return' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeSubTab === 'return' ? 'white' : '#6b7280',
            fontWeight: '600',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s'
          }}
        >
          Nhận xe ({returnList.length})
        </button>
      </div>
      
      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
            Lọc theo ngày
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
            Tên khách hàng
          </label>
          <input
            type="text"
            value={filterCustomerName}
            onChange={(e) => setFilterCustomerName(e.target.value)}
            placeholder="Nhập tên khách hàng..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={loadHandoverData}
            style={{
              padding: '10px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
          >
            🔍 Tìm kiếm
          </button>
        </div>
      </div>
      
      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }}></div>
          Đang tải...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {(activeSubTab === 'pickup' ? pickupList : returnList).length === 0 ? (
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              Không có xe cần {activeSubTab === 'pickup' ? 'giao' : 'nhận'}
            </div>
          ) : (
            (activeSubTab === 'pickup' ? pickupList : returnList).map((booking) => (
              <div
                key={booking.bookingId}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Mã booking</div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{booking.bookingCode}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Khách hàng</div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{booking.customerName || 'N/A'}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{booking.customerPhone || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Xe</div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{booking.vehicleName || 'N/A'}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>BSX: {booking.vehiclePlate || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        {activeSubTab === 'pickup' ? 'Thời gian nhận' : 'Thời gian trả'}
                      </div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {booking.estimatedTime ? new Date(booking.estimatedTime).toLocaleString('vi-VN') : 'N/A'}
                      </div>
                    </div>
                    {activeSubTab === 'return' && booking.depositAmount && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Tiền cọc đã thu</div>
                        <div style={{ fontWeight: '600', color: '#10b981' }}>
                          {booking.depositAmount.toLocaleString()}đ
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button
                      onClick={() => handleOpenProcessModal(booking)}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {activeSubTab === 'pickup' ? 'Giao xe' : 'Nhận xe'}
                    </button>
                    {activeSubTab === 'pickup' && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          fontSize: '14px'
                        }}
                      >
                        ❌ Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Process Modal */}
      {showProcessModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '24px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              {activeSubTab === 'pickup' ? 'Giao xe' : 'Nhận xe trả'} - {selectedBooking.bookingCode}
            </h3>
            
            {/* Thông tin khách hàng */}
            <div style={{
              background: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#374151' }}>Thông tin khách hàng</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <span style={{ color: '#6b7280' }}>Họ tên:</span>{' '}
                  <strong>{selectedBooking.customerName}</strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>SĐT:</span>{' '}
                  <strong>{selectedBooking.customerPhone}</strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Xe:</span>{' '}
                  <strong>{selectedBooking.vehicleName} - {selectedBooking.vehiclePlate}</strong>
                </div>
                {selectedBooking.totalCost && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Tổng tiền thuê:</span>{' '}
                    <strong style={{ color: '#10b981' }}>{selectedBooking.totalCost.toLocaleString()}đ</strong>
                  </div>
                )}
              </div>
            </div>
            
            {activeSubTab === 'pickup' ? (
              // Form giao xe
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Xác nhận khách đến */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={customerArrived}
                    onChange={(e) => setCustomerArrived(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500' }}>Khách hàng đã đến điểm</span>
                </label>
                
                {/* Xác thực GPLX/CCCD */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={customerVerified}
                    onChange={(e) => setCustomerVerified(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500' }}>Đã xác thực GPLX/CCCD</span>
                </label>
                
                {/* Upload ảnh xe */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Chụp ảnh tình trạng xe *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleVehicleImageChange}
                    style={{ marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {vehicleImages.map((file, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Vehicle ${index + 1}`}
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <button
                          onClick={() => removeVehicleImage(index)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Ghi chú tình trạng */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Ghi chú tình trạng xe
                  </label>
                  <textarea
                    value={vehicleConditionNotes}
                    onChange={(e) => setVehicleConditionNotes(e.target.value)}
                    placeholder="Ghi chú về tình trạng xe (vết xước, hư hỏng...)"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                {/* Tiền cọc */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Số tiền đặt cọc *
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Nhập số tiền cọc"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Phương thức
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="CASH">Tiền mặt</option>
                      <option value="BANK_TRANSFER">Chuyển khoản</option>
                      <option value="MOMO">MoMo</option>
                      <option value="ZALOPAY">ZaloPay</option>
                    </select>
                  </div>
                </div>
                
                {/* Chữ ký */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Chữ ký khách hàng * (Upload file chữ ký)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setRenterSignatureFile(e.target.files[0])}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {renterSignatureFile && (
                      <p style={{ marginTop: '4px', fontSize: '12px', color: '#10b981' }}>
                        ✓ Đã chọn: {renterSignatureFile.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Chữ ký nhân viên * (Upload file chữ ký)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setStaffSignatureFile(e.target.files[0])}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {staffSignatureFile && (
                      <p style={{ marginTop: '4px', fontSize: '12px', color: '#10b981' }}>
                        ✓ Đã chọn: {staffSignatureFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Form nhận xe trả
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Xác thực xe */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={vehicleVerified}
                    onChange={(e) => setVehicleVerified(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500' }}>Xe trả đúng xe của trạm</span>
                </label>
                
                {/* Upload ảnh xe */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Chụp ảnh tình trạng xe khi trả *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleVehicleImageChange}
                    style={{ marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {returnVehicleImages.map((file, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Return ${index + 1}`}
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <button
                          onClick={() => removeVehicleImage(index)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Ghi chú */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Ghi chú tình trạng xe
                  </label>
                  <textarea
                    value={returnConditionNotes}
                    onChange={(e) => setReturnConditionNotes(e.target.value)}
                    placeholder="Ghi chú về tình trạng xe khi trả..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                {/* Phí phát sinh */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Phí phát sinh
                    </label>
                    <input
                      type="number"
                      value={additionalCharges}
                      onChange={(e) => setAdditionalCharges(e.target.value)}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Lý do phí phát sinh
                    </label>
                    <input
                      type="text"
                      value={additionalChargesReason}
                      onChange={(e) => setAdditionalChargesReason(e.target.value)}
                      placeholder="Vết xước, hư hỏng..."
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                
                {/* Thanh toán cuối */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Số tiền thanh toán *
                    </label>
                    <input
                      type="number"
                      value={finalPaymentAmount}
                      onChange={(e) => setFinalPaymentAmount(e.target.value)}
                      placeholder="Nhập số tiền thanh toán"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Phương thức
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="CASH">Tiền mặt</option>
                      <option value="BANK_TRANSFER">Chuyển khoản</option>
                      <option value="MOMO">MoMo</option>
                      <option value="ZALOPAY">ZaloPay</option>
                    </select>
                  </div>
                </div>
                
                {/* Chữ ký */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Chữ ký khách hàng *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setRenterSignatureFile(e.target.files[0])}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {renterSignatureFile && (
                      <p style={{ marginTop: '4px', fontSize: '12px', color: '#10b981' }}>
                        ✓ Đã chọn: {renterSignatureFile.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Chữ ký nhân viên * (Upload file chữ ký)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setStaffSignatureFile(e.target.files[0])}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {staffSignatureFile && (
                      <p style={{ marginTop: '4px', fontSize: '12px', color: '#10b981' }}>
                        ✓ Đã chọn: {staffSignatureFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowProcessModal(false)}
                style={{
                  padding: '10px 24px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Hủy
              </button>
              <button
                onClick={activeSubTab === 'pickup' ? handleProcessPickup : handleProcessReturn}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Đang xử lý...' : (activeSubTab === 'pickup' ? 'Xác nhận giao xe' : 'Xác nhận nhận xe')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component: Quản lý xe tại điểm (cập nhật trạng thái và báo cáo sự cố)
const VehicleMaintenance = ({ assignedStation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [expandedVehicle, setExpandedVehicle] = useState(null);
  const [showIssueReport, setShowIssueReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    stationId: null,
    status: null
  });

  const [issueReportForm, setIssueReportForm] = useState({
    vehicleId: '',
    vehiclePlate: '',
    issueType: '',
    description: '',
    severity: 'medium',
    reportedBy: ''
  });
  
  const [form, setForm] = useState({
    id: '', 
    batteryLevel: '', 
    pricePerHour: '', 
    status: 'AVAILABLE',
    // Các trường kỹ thuật có thể cập nhật
    technicalCondition: '', // Tình trạng kỹ thuật
    maintenanceNotes: '', // Ghi chú bảo trì
    lastMaintenanceDate: ''
  });

  // Tạo debounce function đơn giản cho VehicleMaintenance
  const useDebounce = (fn, delay) => {
    const timer = useRef(null);
    return (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    };
  };

  // Tạo debounced version của loadVehicles cho VehicleMaintenance
  const debouncedLoadVehicles = useDebounce(() => {
    if (assignedStation?.id) {
      loadVehicles();
    }
  }, 300);

  useEffect(() => {
    // Set stationId filter từ assigned station - chỉ chạy 1 lần khi có station
    if (assignedStation?.id && !filters.stationId) {
      console.log('🔧 Setting station filter:', assignedStation.id);
      setFilters(prev => ({ 
        ...prev, 
        stationId: assignedStation.id  // Filter cứng theo trạm được phân công
      }));
      return; // Thoát early để tránh load 2 lần
    }
    
    // Chỉ load vehicles khi đã có stationId trong filters và sử dụng debounce
    if (filters.stationId && assignedStation?.id) {
      debouncedLoadVehicles();
    }
    
    // Lấy thông tin staff để dùng trong báo cáo sự cố
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const parsedUser = JSON.parse(userProfile);
      setIssueReportForm(prev => ({ 
        ...prev, 
        reportedBy: parsedUser.fullName || 'Staff' 
      }));
    }
  }, [currentPage, filters.stationId, filters.status]); // Chỉ watch những field cần thiết

  const loadVehicles = async () => {
    if (!assignedStation?.id) {
      console.log('❌ No assigned station, skipping vehicle load');
      setVehicles([]);
      setLoading(false);
      return;
    }

    // Kiểm tra thêm điều kiện để tránh gọi API không cần thiết
    if (filters.stationId && filters.stationId !== assignedStation.id) {
      console.log('🚫 Station filter mismatch, resetting to assigned station');
      setFilters(prev => ({ ...prev, stationId: assignedStation.id }));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🚗 Loading vehicles for station:', assignedStation.id);
      
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: 'id',
        sortDirection: 'desc',
        stationId: assignedStation.id, // 🔒 Filter by assigned station
        ...filters
      };

      console.log('📋 Vehicle API params:', params);
      const response = await vehicleAPI.getVehicles(params);
      
      // Adapt backend response structure
      const vehicleList = response.content || [];
      setVehicles(vehicleList);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      
      console.log(`✅ Loaded ${vehicleList.length} vehicles for station ${assignedStation.name}`);
      
    } catch (err) {
      console.error('❌ Error loading vehicles:', err);
      setError('Không thể tải danh sách xe. Vui lòng thử lại.');
      // Don't use fallback data that might not be station-specific
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(0); // Reset to first page when filtering
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleIssueFormChange = (e) => {
    const { name, value } = e.target;
    setIssueReportForm(prev => ({ ...prev, [name]: value }));
  };

  // Cập nhật thông tin xe (chỉ các trường được phép)
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;
    
    try {
      setLoading(true);
      
      const updateData = {
        batteryLevel: form.batteryLevel ? Number(form.batteryLevel) : undefined,
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
        status: form.status,
        technicalCondition: form.technicalCondition,
        maintenanceNotes: form.maintenanceNotes,
        lastMaintenanceDate: form.lastMaintenanceDate
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      await vehicleAPI.updateVehicle(editing.id, updateData);
      
      setEditing(null);
      
      // Reset form
      setForm({ 
        id: '', 
        batteryLevel: '', 
        pricePerHour: '', 
        status: 'AVAILABLE',
        technicalCondition: '',
        maintenanceNotes: '',
        lastMaintenanceDate: ''
      });
      
      // Reload vehicles
      debouncedLoadVehicles();
      
    } catch (err) {
      console.error('Error updating vehicle:', err);
      setError('Không thể cập nhật thông tin xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (v) => {
    setEditing(v);
    setForm({
      id: v.id,
      batteryLevel: v.batteryLevel || '',
      pricePerHour: v.pricePerHour || '',
      status: v.status || 'AVAILABLE',
      technicalCondition: v.technicalCondition || '',
      maintenanceNotes: v.maintenanceNotes || '',
      lastMaintenanceDate: v.lastMaintenanceDate || ''
    });
  };

  // Báo cáo sự cố
  const handleIssueReport = (vehicle) => {
    setIssueReportForm(prev => ({
      ...prev,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.licence_plate,
      issueType: '',
      description: '',
      severity: 'medium'
    }));
    setShowIssueReport(true);
  };

  const handleSubmitIssueReport = async (e) => {
    e.preventDefault();
    
    try {
      // Debug: Check token
      const token = localStorage.getItem('authToken');
      console.log('Auth Token:', token ? 'exists' : 'MISSING!');
      console.log('User Profile:', JSON.parse(localStorage.getItem('userProfile') || '{}'));
      
      // Map severity sang priority
      const priorityMap = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'critical': 'CRITICAL'
      };
      
      // Map issueType sang category
      const categoryMap = {
        'mechanical': 'MECHANICAL',
        'electrical': 'ELECTRICAL',
        'battery': 'BATTERY',
        'tire': 'TIRE',
        'other': 'OTHER'
      };
      
      // Tạo request payload
      const incidentData = {
        title: `Sự cố xe ${issueReportForm.vehiclePlate}`,
        description: issueReportForm.description,
        category: categoryMap[issueReportForm.issueType] || 'OTHER',
        priority: priorityMap[issueReportForm.severity] || 'MEDIUM',
        vehicleId: issueReportForm.vehicleId,
        vehiclePlate: issueReportForm.vehiclePlate,
        stationId: assignedStation?.id,
        stationName: assignedStation?.name,
        location: assignedStation?.address
      };
      
      console.log('Sending incident report:', incidentData);
      
      // Gửi báo cáo lên server
      await createIncidentReport(incidentData);
      
      // Cập nhật trạng thái xe thành MAINTENANCE nếu sự cố nghiêm trọng
      if (issueReportForm.severity === 'critical') {
        const vehicle = vehicles.find(v => v.id === issueReportForm.vehicleId);
        if (vehicle) {
          await vehicleAPI.updateVehicle(vehicle.id, { status: 'MAINTENANCE' });
          debouncedLoadVehicles(); // Reload vehicles
        }
      }
      
      alert('Báo cáo sự cố đã được gửi thành công!');
      setShowIssueReport(false);
      setIssueReportForm({
        vehicleId: '',
        vehiclePlate: '',
        issueType: '',
        description: '',
        severity: 'medium',
        reportedBy: issueReportForm.reportedBy
      });
      
    } catch (err) {
      console.error('Error submitting issue report:', err);
      setError('Không thể gửi báo cáo sự cố. Vui lòng thử lại.');
    }
  };

  return (
    <div className="staff-section">
      <div className="section-header">
        <h1>Quản lý xe tại điểm</h1>
        {assignedStation && (
          <div style={{ 
            marginTop: '0.5rem', 
            padding: '0.75rem 1rem', 
            background: '#e3f2fd', 
            borderRadius: '0.5rem', 
            border: '1px solid #2196f3',
            color: '#1976d2'
          }}>
            <strong>Trạm được phân công:</strong> {assignedStation.name} - {assignedStation.address}
          </div>
        )}
      </div>

      {error && (
        <div className="error-message" style={{
          background: '#fee', 
          color: '#d32f2f', 
          padding: '1rem', 
          borderRadius: '0.375rem', 
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div className="vehicle-status-table">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>
            Danh sách xe tại trạm {assignedStation?.name || 'đang tải...'}
            {loading && <span style={{ marginLeft: '0.5rem', color: '#666' }}>🔄</span>}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select 
              value={filters.status || ''} 
              onChange={(e) => handleFilterChange({ status: e.target.value || null })}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
              disabled={loading}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="AVAILABLE">Có sẵn</option>
              <option value="RESERVED">Đã đặt trước</option>
              <option value="RENTED">Đang cho thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Trang {currentPage + 1} / {totalPages} - Tổng cộng {totalElements} xe
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Đang tải danh sách xe...</p>
            </div>
          </div>
        )}

        {!loading && vehicles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Không có xe nào được tìm thấy.
          </div>
        )}

        {!loading && vehicles.length > 0 && (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Chi tiết</th>
                <th>Biển số</th>
                <th>Loại</th>
                <th>Pin (%)</th>
                <th>Trạng thái</th>
                <th>Giá/giờ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <React.Fragment key={v.id}>
                  <tr>
                    <td>
                      <button 
                        className="expand-btn"
                        onClick={() => setExpandedVehicle(expandedVehicle === v.id ? null : v.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d={expandedVehicle === v.id 
                            ? "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" 
                            : "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"} 
                          />
                        </svg>
                      </button>
                    </td>
                    <td>{v.licensePlate}</td>
                    <td>{v.type || v.description}</td>
                    <td>
                      <div className="battery-indicator">
                        <div className="battery-container">
                          <div 
                            className={`battery-bar ${
                              v.batteryLevel >= 60 ? 'battery-high' :
                              v.batteryLevel >= 30 ? 'battery-medium' : 
                              'battery-low'
                            }`} 
                            style={{
                              width: `${Math.min(Math.max(v.batteryLevel || 0, 0), 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className={`battery-text ${
                          v.batteryLevel >= 60 ? 'text-green-600' :
                          v.batteryLevel >= 30 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {v.batteryLevel != null ? `${v.batteryLevel}%` : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${v.status.toLowerCase()}`}>
                        {v.status === 'AVAILABLE' ? 'Có sẵn' : 
                         v.status === 'RESERVED' ? 'Đã đặt trước' :
                         v.status === 'RENTED' ? 'Đang cho thuê' :
                         v.status === 'MAINTENANCE' ? 'Bảo trì' : v.status}
                      </span>
                    </td>
                    <td>{v.pricePerHour ? `${v.pricePerHour.toLocaleString()}đ` : '-'}</td>
                    <td>
                      <button className="btn-action" onClick={() => handleEdit(v)}>
                        Chỉnh sửa
                      </button>
                      <button 
                        className="btn-action btn-warning" 
                        onClick={() => handleIssueReport(v)}
                        style={{ marginLeft: '5px' }}
                      >
                        Báo cáo sự cố
                      </button>
                    </td>
                  </tr>
                
                {/* Expanded Details Row */}
                {expandedVehicle === v.id && (
                  <tr className="expanded-details">
                    <td colSpan="7">
                      <div className="vehicle-details-container">
                        <div className="details-header">
                          <h4>Chi tiết xe {v.licensePlate}</h4>
                        </div>
                        
                        <div className="details-content">
                          <div className="details-section">
                            <h5>Thông số kỹ thuật</h5>
                            <div className="details-grid">
                              <div className="detail-row">
                                <span className="label">Số ghế:</span>
                                <span className="value">{v.seats || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Dung lượng pin:</span>
                                <span className="value">{v.batteryCapacity ? `${v.batteryCapacity} kWh` : 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Phạm vi di chuyển:</span>
                                <span className="value">{v.range ? `${v.range} km` : 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Loại cổng sạc:</span>
                                <span className="value">{v.chargingType || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Tốc độ sạc:</span>
                                <span className="value">{v.chargingSpeed || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Số chuyến:</span>
                                <span className="value">{v.tripCount || '0'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="details-section">
                            <h5>Thông tin quản lý</h5>
                            <div className="details-grid">
                              <div className="detail-row">
                                <span className="label">ID trạm:</span>
                                <span className="value">{v.station?.id || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Vị trí hiện tại:</span>
                                <span className="value">{v.location || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Mô tả:</span>
                                <span className="value">{v.description || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <h6 style={{ marginTop: '16px', marginBottom: '12px', color: '#6366f1', fontWeight: '600', fontSize: '14px' }}>Tình trạng kỹ thuật</h6>
                            <div className="details-grid">
                              <div className="detail-row">
                                <span className="label">Trạng thái kỹ thuật:</span>
                                <span className={`value ${
                                  v.technicalCondition === 'excellent' ? 'text-green-600' :
                                  v.technicalCondition === 'good' ? 'text-blue-600' :
                                  v.technicalCondition === 'fair' ? 'text-yellow-600' :
                                  v.technicalCondition === 'poor' ? 'text-red-600' : ''
                                }`}>
                                  {v.technicalCondition === 'excellent' ? 'Tuyệt vời' :
                                   v.technicalCondition === 'good' ? 'Tốt' :
                                   v.technicalCondition === 'fair' ? 'Trung bình' :
                                   v.technicalCondition === 'poor' ? 'Kém' : 'Chưa đánh giá'}
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Ghi chú bảo trì:</span>
                                <span className="value">{v.maintenanceNotes || 'Không có ghi chú'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Ngày bảo trì cuối:</span>
                                <span className="value">{
                                  v.lastMaintenanceDate ? 
                                    new Date(v.lastMaintenanceDate).toLocaleDateString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit', 
                                      year: 'numeric'
                                    }) : 'Chưa bảo trì'
                                }</span>
                              </div>
                            </div>
                          </div>
                          
                          {v.imageUrl && (
                            <div className="details-section image-section">
                              <h5>Ảnh xe</h5>
                              <div className="vehicle-image">
                                <img src={v.imageUrl} alt={`Xe ${v.licensePlate}`} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="pagination-controls" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1rem',
            padding: '1rem'
          }}>
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: currentPage === 0 ? '#f3f4f6' : '#3b82f6',
                color: currentPage === 0 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              « Trước
            </button>
            
            <span style={{ color: '#6b7280' }}>
              Trang {currentPage + 1} / {totalPages}
            </span>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: currentPage >= totalPages - 1 ? '#f3f4f6' : '#3b82f6',
                color: currentPage >= totalPages - 1 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Sau »
            </button>
          </div>
        )}
      </div>

      {/* Form chỉnh sửa thông tin xe */}
      {editing && (
        <div className="issue-report-form">
          <h2>Cập nhật thông tin xe {editing.licensePlate}</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Mức pin (%)</label>
              <input 
                name="batteryLevel" 
                type="number" 
                min="0" 
                max="100" 
                value={form.batteryLevel} 
                onChange={handleChange} 
                placeholder="0-100"
              />
              <small>Cập nhật mức pin hiện tại của xe</small>
            </div>
            
            <div className="form-group">
              <label>Tình trạng kỹ thuật</label>
              <select 
                name="technicalCondition" 
                value={form.technicalCondition} 
                onChange={handleChange}
              >
                <option value="">-- Chọn tình trạng --</option>
                <option value="excellent">Tuyệt vời</option>
                <option value="good">Tốt</option>
                <option value="fair">Trung bình</option>
                <option value="poor">Kém</option>
              </select>
              <small>Đánh giá tổng thể tình trạng kỹ thuật xe</small>
            </div>

            <div className="form-group">
              <label>Ghi chú bảo trì</label>
              <textarea 
                name="maintenanceNotes" 
                value={form.maintenanceNotes} 
                onChange={handleChange} 
                placeholder="Ghi chú về tình trạng xe, sự cố đã khắc phục..."
                rows="3"
              />
              <small>Ghi chú chi tiết về tình trạng và các vấn đề của xe</small>
            </div>

            <div className="form-group">
              <label>Ngày bảo trì cuối</label>
              <input 
                name="lastMaintenanceDate" 
                type="date" 
                value={form.lastMaintenanceDate} 
                onChange={handleChange} 
              />
              <small>Cập nhật ngày bảo trì gần nhất</small>
            </div>
            
            <div className="form-group">
              <label>Giá thuê mỗi giờ (VND)</label>
              <input 
                name="pricePerHour" 
                type="number" 
                value={form.pricePerHour} 
                onChange={handleChange} 
                placeholder="Ví dụ: 50000"
              />
              <small>Cập nhật giá thuê hiện tại</small>
            </div>
            
            <div className="form-group">
              <label>Trạng thái</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="AVAILABLE">Có sẵn</option>
                <option value="RESERVED">Đã đặt trước</option>
                <option value="RENTED">Đang cho thuê</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
              <small>Cập nhật trạng thái hiện tại của xe</small>
            </div>

            <div className="form-actions">
              <button className="btn-success" type="submit" disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
              <button 
                type="button" 
                className="btn-danger" 
                onClick={() => {
                  setEditing(null);
                  setForm({ 
                    id: '', 
                    batteryLevel: '', 
                    pricePerHour: '', 
                    status: 'AVAILABLE',
                    technicalCondition: '',
                    maintenanceNotes: '',
                    lastMaintenanceDate: ''
                  });
                }} 
                style={{marginLeft: '8px'}}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal báo cáo sự cố */}
      {showIssueReport && (
        <div className="modal-overlay" onClick={() => setShowIssueReport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Báo cáo sự cố xe {issueReportForm.vehiclePlate}</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowIssueReport(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitIssueReport}>
              <div className="form-group">
                <label>Loại sự cố</label>
                <select 
                  name="issueType" 
                  value={issueReportForm.issueType} 
                  onChange={handleIssueFormChange}
                  required
                >
                  <option value="">-- Chọn loại sự cố --</option>
                  <option value="battery">Vấn đề về pin</option>
                  <option value="mechanical">Sự cố cơ khí</option>
                  <option value="electrical">Sự cố điện tử</option>
                  <option value="exterior">Hư hỏng ngoại thất</option>
                  <option value="interior">Hư hỏng nội thất</option>
                  <option value="software">Lỗi phần mềm</option>
                  <option value="charging">Vấn đề sạc pin</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mức độ nghiêm trọng</label>
                <select 
                  name="severity" 
                  value={issueReportForm.severity} 
                  onChange={handleIssueFormChange}
                  required
                >
                  <option value="low">Thấp - Xe vẫn sử dụng được</option>
                  <option value="medium">Trung bình - Cần theo dõi</option>
                  <option value="high">Cao - Cần sửa chữa sớm</option>
                  <option value="critical">Nghiêm trọng - Ngừng sử dụng ngay</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea 
                  name="description" 
                  value={issueReportForm.description} 
                  onChange={handleIssueFormChange}
                  placeholder="Mô tả chi tiết về sự cố, triệu chứng, thời điểm xảy ra..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Người báo cáo</label>
                <input 
                  name="reportedBy" 
                  value={issueReportForm.reportedBy} 
                  readOnly
                  style={{ background: '#f8fafc', color: '#64748b' }}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-danger">Gửi báo cáo</button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowIssueReport(false)}
                  style={{marginLeft: '8px'}}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Component: Quản lý khiếu nại được phân công
const MyComplaintsManagement = ({ user, assignedStation }) => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [completeModal, setCompleteModal] = useState(false);
  const [staffNotes, setStaffNotes] = useState('');

  useEffect(() => {
    fetchMyComplaints();
  }, [filter, user.id]);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAllComplaints();
      
      // Lọc chỉ các khiếu nại được phân công cho staff này
      let myComplaints = data.filter(c => c.assignedTo === user.id);
      
      // Filter theo status
      if (filter !== 'ALL') {
        myComplaints = myComplaints.filter(c => c.status === filter);
      }
      
      setComplaints(myComplaints);
    } catch (error) {
      console.error('Lỗi tải danh sách khiếu nại:', error);
      alert('Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!staffNotes.trim()) {
      alert('Vui lòng nhập ghi chú về công việc bạn đã làm');
      return;
    }

    try {
      await staffCompleteComplaint(selectedComplaint.id, staffNotes);
      alert('Đã đánh dấu hoàn thành! Admin sẽ xem xét và duyệt.');
      setCompleteModal(false);
      setStaffNotes('');
      setSelectedComplaint(null);
      fetchMyComplaints();
    } catch (error) {
      console.error('Lỗi hoàn thành khiếu nại:', error);
      
      // Hiển thị chi tiết lỗi
      let errorMessage = 'Không thể đánh dấu hoàn thành';
      
      if (error.response) {
        // Lỗi từ server
        console.error('Response error:', error.response);
        errorMessage = `Lỗi ${error.response.status}: ${
          error.response.data?.error || 
          error.response.data?.message || 
          JSON.stringify(error.response.data)
        }`;
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        console.error('Request error:', error.request);
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      } else {
        // Lỗi khác
        console.error('Error:', error.message);
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Chờ xử lý', class: 'pending' },
      'IN_PROGRESS': { label: 'Đang xử lý', class: 'in-progress' },
      'STAFF_COMPLETED': { label: 'Đã hoàn thành', class: 'staff-completed' },
      'RESOLVED': { label: 'Đã duyệt', class: 'resolved' },
      'REJECTED': { label: 'Từ chối', class: 'rejected' }
    };
    const info = statusMap[status] || { label: status, class: '' };
    return <span className={`status-badge ${info.class}`}>{info.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'LOW': { label: 'Thấp', class: 'low' },
      'MEDIUM': { label: 'Trung bình', class: 'medium' },
      'HIGH': { label: 'Cao', class: 'high' },
      'URGENT': { label: '🔥 Khẩn cấp', class: 'urgent' }
    };
    const info = priorityMap[priority] || { label: priority, class: '' };
    return <span className={`priority-badge ${info.class}`}>{info.label}</span>;
  };

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'VEHICLE_ISSUE': 'Vấn đề xe',
      'BILLING': 'Thanh toán',
      'SERVICE_QUALITY': 'Chất lượng dịch vụ',
      'DAMAGE_DISPUTE': 'Tranh chấp hư hỏng',
      'ACCOUNT_ISSUE': 'Vấn đề tài khoản',
      'STATION_ISSUE': 'Vấn đề trạm',
      'OTHER': 'Khác'
    };
    return categoryMap[category] || category;
  };

  const stats = {
    total: complaints.length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    completed: complaints.filter(c => c.status === 'STAFF_COMPLETED').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length
  };

  return (
    <div className="staff-content">
      <div className="content-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1>Khiếu nại được phân công</h1>
        </div>
        <p style={{ color: '#666', marginTop: '8px' }}>Danh sách khiếu nại bạn cần xử lý</p>
      </div>

      {/* Statistics */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.total}</div>
          <div style={{ fontSize: '14px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6ZM6 4H13V9H18V20H6V4ZM8 12V14H16V12H8ZM8 16V18H13V16H8Z"/>
            </svg>
            Tổng số
          </div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '14px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <strong>Đang xử lý</strong>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.completed}</div>
          <div style={{ fontSize: '14px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <strong>Đã hoàn thành</strong>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.resolved}</div>
          <div style={{ fontSize: '14px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Đã duyệt
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setFilter('ALL')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: filter === 'ALL' ? 'none' : '1px solid #e0e0e0',
            background: filter === 'ALL' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: filter === 'ALL' ? 'white' : '#666',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Tất cả
        </button>
        <button 
          onClick={() => setFilter('IN_PROGRESS')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: filter === 'IN_PROGRESS' ? 'none' : '1px solid #e0e0e0',
            background: filter === 'IN_PROGRESS' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'white',
            color: filter === 'IN_PROGRESS' ? 'white' : '#666',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Đang xử lý
        </button>
        <button 
          onClick={() => setFilter('STAFF_COMPLETED')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: filter === 'STAFF_COMPLETED' ? 'none' : '1px solid #e0e0e0',
            background: filter === 'STAFF_COMPLETED' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'white',
            color: filter === 'STAFF_COMPLETED' ? 'white' : '#666',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Đã hoàn thành
        </button>
        <button 
          onClick={() => setFilter('RESOLVED')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: filter === 'RESOLVED' ? 'none' : '1px solid #e0e0e0',
            background: filter === 'RESOLVED' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'white',
            color: filter === 'RESOLVED' ? 'white' : '#666',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Đã duyệt
        </button>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '3rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Đang tải khiếu nại...</p>
          </div>
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px', opacity: '0.6'}}>📭</div>
          <p style={{ color: '#999', fontSize: '16px' }}>Không có khiếu nại nào</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {complaints.map(complaint => (
            <div key={complaint.id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px solid #f5f5f5' }}>
                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1a237e', fontSize: '17px', fontWeight: '700' }}>
                    #{complaint.id} - {getCategoryLabel(complaint.category)}
                  </h4>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#666' }}>
                    <span style={{ background: '#f8f9fa', padding: '4px 12px', borderRadius: '6px' }}>👤 {complaint.userName}</span>
                    <span style={{ background: '#f8f9fa', padding: '4px 12px', borderRadius: '6px' }}>📧 {complaint.userEmail}</span>
                    {complaint.bookingId && <span style={{ background: '#f8f9fa', padding: '4px 12px', borderRadius: '6px' }}>🎫 Booking #{complaint.bookingId}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {getStatusBadge(complaint.status)}
                  {getPriorityBadge(complaint.priority)}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '8px', fontSize: '15px' }}>{complaint.title}</div>
                <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '12px' }}>{complaint.description}</p>
                <div style={{ fontSize: '13px', color: '#999', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#999">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  {new Date(complaint.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {complaint.adminNotes && (
                <div style={{
                  background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  borderLeft: '4px solid #9C27B0'
                }}>
                  <strong style={{ color: '#6A1B9A', display: 'block', marginBottom: '8px' }}>👤 Ghi chú từ Admin:</strong>
                  <p style={{ margin: '0', color: '#2c3e50', lineHeight: '1.6' }}>{complaint.adminNotes}</p>
                </div>
              )}

              {complaint.staffNotes && (
                <div style={{
                  background: 'linear-gradient(135deg, #E3F2FD 0%, #F1F8E9 100%)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  borderLeft: '4px solid #2196F3'
                }}>
                  <strong style={{ color: '#1976D2', display: 'block', marginBottom: '8px' }}>📝 Ghi chú của bạn:</strong>
                  <p style={{ margin: '0', color: '#2c3e50', lineHeight: '1.6' }}>{complaint.staffNotes}</p>
                  <small style={{ color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#666">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    {new Date(complaint.staffCompletedAt).toLocaleDateString('vi-VN')}
                  </small>
                </div>
              )}

              {complaint.resolution && (
                <div style={{
                  background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  borderLeft: '4px solid #4CAF50'
                }}>
                  <strong style={{ color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1B5E20">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Kết quả cuối cùng (Admin):
                  </strong>
                  <p style={{ margin: '0', color: '#2c3e50', lineHeight: '1.6' }}>{complaint.resolution}</p>
                  <small style={{ color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#666">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    {new Date(complaint.resolvedAt).toLocaleDateString('vi-VN')}
                  </small>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {complaint.status === 'IN_PROGRESS' && (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setStaffNotes('');
                        setCompleteModal(true);
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '6px', verticalAlign: 'baseline'}}>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Đánh dấu hoàn thành
                    </button>
                    <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                      💡 Hãy hoàn thành công việc và nhấn nút này để báo admin
                    </div>
                  </>
                )}
                {complaint.status === 'STAFF_COMPLETED' && (
                  <div style={{ fontSize: '13px', color: '#4CAF50', fontWeight: '600', padding: '8px 16px', background: '#E8F5E9', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff9800">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                      Đang chờ admin xem xét và duyệt...
                    </div>
                  </div>
                )}
                {complaint.status === 'RESOLVED' && (
                  <div style={{ fontSize: '13px', color: '#4CAF50', fontWeight: '600', padding: '8px 16px', background: '#E8F5E9', borderRadius: '8px' }}>
                    Admin đã duyệt - Khiếu nại hoàn tất!
                  </div>
                )}
                {complaint.status === 'REJECTED' && (
                  <div style={{ fontSize: '13px', color: '#F44336', fontWeight: '600', padding: '8px 16px', background: '#FFEBEE', borderRadius: '8px' }}>
                    Admin đã từ chối khiếu nại này
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <div className="modal-overlay" onClick={() => setCompleteModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#4caf50">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Đánh dấu hoàn thành #{selectedComplaint.id}
              </h3>
              <button onClick={() => setCompleteModal(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999'
              }}>×</button>
            </div>
            
            <div style={{
              background: '#E3F2FD',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#1976D2',
              fontSize: '14px'
            }}>
              Vui lòng mô tả chi tiết công việc bạn đã làm để xử lý khiếu nại này. Admin sẽ xem xét và duyệt.
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Ghi chú công việc đã làm: <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea 
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="Ví dụ: Đã kiểm tra xe, sửa chữa lỗi động cơ, test lại và xe đã hoạt động bình thường. Đã liên hệ khách hàng và xác nhận đồng ý..."
                rows="8"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setCompleteModal(false)} style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Hủy
              </button>
              <button onClick={handleComplete} style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '6px', verticalAlign: 'baseline'}}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Xác nhận hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component: Đặt xe tại điểm (Walk-in booking)
const WalkInBooking = ({ assignedStation }) => {
  // State cho danh sách xe có sẵn tại trạm
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  
  // State cho form đặt xe
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phoneNumber: '',
    email: ''
  });
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: ''
  });
  
  // State cho GPLX và CCCD
  const [gplxImage, setGplxImage] = useState(null);
  const [gplxPreview, setGplxPreview] = useState(null);
  const [cccdImage, setCccdImage] = useState(null);
  const [cccdPreview, setCccdPreview] = useState(null);
  
  // State cho tính toán
  const [totalCost, setTotalCost] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Fetch xe có sẵn tại trạm khi component mount
  useEffect(() => {
    if (assignedStation?.id) {
      fetchAvailableVehicles();
    }
  }, [assignedStation]);

  // Tính toán tổng tiền khi thay đổi xe hoặc ngày
  useEffect(() => {
    if (selectedVehicle && bookingDates.startDate && bookingDates.endDate) {
      calculateTotalCost();
    }
  }, [selectedVehicle, bookingDates]);

  const fetchAvailableVehicles = async () => {
    if (!assignedStation?.id) return;
    
    setLoadingVehicles(true);
    try {
      const response = await vehicleAPI.getAvailableVehiclesByStation(assignedStation.id);
      setAvailableVehicles(response.data || []);
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      alert('Không thể tải danh sách xe. Vui lòng thử lại!');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const calculateTotalCost = () => {
    if (!selectedVehicle || !bookingDates.startDate || !bookingDates.endDate) {
      setTotalCost(0);
      return;
    }

    const start = new Date(bookingDates.startDate);
    const end = new Date(bookingDates.endDate);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    
    if (hours <= 0) {
      setTotalCost(0);
      return;
    }

    const cost = hours * selectedVehicle.pricePerHour;
    setTotalCost(cost);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setBookingDates(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGplxImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGplxImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGplxPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCccdImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCccdImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCccdPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBooking = async () => {
    // Validate form
    if (!selectedVehicle) {
      alert('Vui lòng chọn xe!');
      return;
    }
    if (!customerInfo.fullName || !customerInfo.phoneNumber) {
      alert('Vui lòng nhập đầy đủ thông tin khách hàng!');
      return;
    }
    if (!bookingDates.startDate || !bookingDates.endDate) {
      alert('Vui lòng chọn ngày nhận và trả xe!');
      return;
    }
    if (!gplxImage || !cccdImage) {
      alert('Vui lòng upload ảnh GPLX và CCCD!');
      return;
    }

    const startDate = new Date(bookingDates.startDate);
    const endDate = new Date(bookingDates.endDate);
    if (endDate <= startDate) {
      alert('Ngày trả xe phải sau ngày nhận xe!');
      return;
    }

    setSubmitting(true);
    try {
      // Tạo FormData để gửi cả thông tin và file
      const formData = new FormData();
      formData.append('vehicleId', selectedVehicle.id);
      formData.append('stationId', assignedStation.id);
      formData.append('fullName', customerInfo.fullName);
      formData.append('phoneNumber', customerInfo.phoneNumber);
      formData.append('email', customerInfo.email || '');
      formData.append('startDate', bookingDates.startDate);
      formData.append('endDate', bookingDates.endDate);
      formData.append('gplxImage', gplxImage);
      formData.append('cccdImage', cccdImage);
      formData.append('bookingType', 'WALK_IN');

      // Call API để tạo booking walk-in qua nginx proxy
      const response = await fetch('/api/bookings/walk-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Đặt xe thất bại');
      }

      const result = await response.json();
      alert(`✅ Đặt xe thành công!\nMã booking: ${result.id}\nTổng tiền: ${totalCost.toLocaleString('vi-VN')} VNĐ`);
      
      // Reset form
      setSelectedVehicle(null);
      setCustomerInfo({ fullName: '', phoneNumber: '', email: '' });
      setBookingDates({ startDate: '', endDate: '' });
      setGplxImage(null);
      setGplxPreview(null);
      setCccdImage(null);
      setCccdPreview(null);
      setTotalCost(0);
      
      // Refresh danh sách xe
      fetchAvailableVehicles();
    } catch (error) {
      console.error('Error creating walk-in booking:', error);
      alert('Đặt xe thất bại. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!assignedStation) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <p style={{ color: '#f57c00', fontSize: '16px' }}>⚠️ Chưa được phân công trạm</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        color: 'white',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '24px', fontWeight: '600' }}>
          Đặt xe tại điểm
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Trạm: {assignedStation.name} - {assignedStation.address}
        </p>
      </div>

      {/* Danh sách xe có sẵn */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', color: '#333' }}>
          Danh sách xe có sẵn ({availableVehicles.length})
        </h3>
        
        {loadingVehicles ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ color: '#6b7280', marginTop: '1rem' }}>Đang tải...</p>
          </div>
        ) : availableVehicles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p style={{ color: '#6b7280', margin: 0 }}>Không có xe nào có sẵn tại trạm này</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {availableVehicles.map(vehicle => (
              <div
                key={vehicle.id}
                onClick={() => handleVehicleSelect(vehicle)}
                style={{
                  border: selectedVehicle?.id === vehicle.id ? '3px solid #667eea' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  background: selectedVehicle?.id === vehicle.id ? '#f0f4ff' : 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedVehicle?.id === vehicle.id 
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
                    : '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                {vehicle.imageUrl && (
                  <img 
                    src={vehicle.imageUrl} 
                    alt={vehicle.type}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginBottom: '0.75rem'
                    }}
                  />
                )}
                <h4 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '16px', 
                  color: '#333',
                  fontWeight: '600'
                }}>
                  {vehicle.type}
                </h4>
                <p style={{ 
                  margin: '0 0 0.25rem 0', 
                  fontSize: '13px', 
                  color: '#6b7280' 
                }}>
                  Biển số: {vehicle.licensePlate}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '15px', 
                  color: '#28a745',
                  fontWeight: '600'
                }}>
                  {vehicle.pricePerHour.toLocaleString('vi-VN')} VNĐ/giờ
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form đặt xe */}
      {selectedVehicle && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '18px', color: '#333' }}>
            Thông tin đặt xe - {selectedVehicle.type}
          </h3>

          {/* Thông tin khách hàng */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#555' }}>
              Thông tin khách hàng
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>
                  Họ tên <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={customerInfo.fullName}
                  onChange={handleCustomerInfoChange}
                  placeholder="Nguyễn Văn A"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>
                  Số điện thoại <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={customerInfo.phoneNumber}
                  onChange={handleCustomerInfoChange}
                  placeholder="0912345678"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>
                  Email (tùy chọn)
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  placeholder="example@email.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>

          {/* Upload GPLX và CCCD */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#555' }}>
              Giấy tờ khách hàng
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* GPLX */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>
                  Giấy phép lái xe <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGplxImageChange}
                  style={{ display: 'none' }}
                  id="gplx-upload"
                />
                <label
                  htmlFor="gplx-upload"
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    border: '2px dashed #667eea',
                    borderRadius: '6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#f0f4ff',
                    transition: 'all 0.3s'
                  }}
                >
                  {gplxPreview ? 'Đã chọn ảnh' : 'Chọn ảnh GPLX'}
                </label>
                {gplxPreview && (
                  <img
                    src={gplxPreview}
                    alt="GPLX Preview"
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginTop: '0.5rem',
                      border: '2px solid #e5e7eb'
                    }}
                  />
                )}
              </div>

              {/* CCCD */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>
                  CCCD/CMND <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCccdImageChange}
                  style={{ display: 'none' }}
                  id="cccd-upload"
                />
                <label
                  htmlFor="cccd-upload"
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    border: '2px dashed #667eea',
                    borderRadius: '6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#f0f4ff',
                    transition: 'all 0.3s'
                  }}
                >
                  {cccdPreview ? 'Đã chọn ảnh' : 'Chọn ảnh CCCD'}
                </label>
                {cccdPreview && (
                  <img
                    src={cccdPreview}
                    alt="CCCD Preview"
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginTop: '0.5rem',
                      border: '2px solid #e5e7eb'
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Thời gian thuê */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#555' }}>
              Thời gian thuê xe
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>
                  Ngày nhận xe <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={bookingDates.startDate}
                  onChange={handleDateChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#555' }}>
                  Ngày trả xe <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={bookingDates.endDate}
                  onChange={handleDateChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>

          {/* Tổng tiền */}
          {totalCost > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              color: 'white',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px', opacity: 0.9 }}>
                Tổng chi phí
              </p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>
                {totalCost.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          )}

          {/* Nút đặt xe */}
          <button
            onClick={handleSubmitBooking}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '1rem',
              background: submitting 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: submitting 
                ? 'none' 
                : '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận đặt xe'}
          </button>
        </div>
      )}
    </div>
  );
};

// Component: Xác nhận đặt xe
const BookingApproval = ({ assignedStation }) => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (assignedStation?.id) {
      fetchPendingBookings();
    }
  }, [assignedStation]);

  const fetchPendingBookings = async () => {
    if (!assignedStation?.id) return;
    
    setLoading(true);
    try {
      const bookings = await getPendingBookingsWithDetailsForStation(assignedStation.id);
      setPendingBookings(bookings || []);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      alert('Lỗi khi tải danh sách đặt xe chờ xác nhận');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn XÁC NHẬN booking này?')) return;
    
    setActionLoading(true);
    try {
      await confirmBooking(bookingId);
      alert('✅ Đã xác nhận booking thành công!');
      fetchPendingBookings(); // Refresh list
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }
    
    setActionLoading(true);
    try {
      await rejectBooking(selectedBooking.id, rejectReason);
      alert('✅ Đã từ chối booking thành công!');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedBooking(null);
      fetchPendingBookings(); // Refresh list
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!assignedStation) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        <p>⚠️ Bạn chưa được phân công trạm</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Đang tải danh sách...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px 20px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
              ⏳ Đặt xe chờ xác nhận
            </h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '13px' }}>
              Trạm: <strong>{assignedStation.name}</strong>
            </p>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '8px 16px', 
            borderRadius: '20px',
            fontWeight: '700',
            fontSize: '16px'
          }}>
            {pendingBookings.length} booking
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          {pendingBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.3, marginBottom: '16px' }}>
                <path d="M9 11H7v2h2v-2m4 0h-2v2h2v-2m4 0h-2v2h2v-2m2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V9h14v11Z"/>
              </svg>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>Không có booking nào đang chờ xác nhận</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Các booking mới sẽ xuất hiện tại đây</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingBookings.map((booking) => (
                <div 
                  key={booking.id}
                  style={{
                    border: '2px solid #e8e8e8',
                    borderRadius: '10px',
                    padding: '16px',
                    background: 'white',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e8e8e8';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Top Row: ID, Customer, Vehicle */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                    {/* Booking ID */}
                    <div style={{ 
                      background: '#667eea', 
                      color: 'white', 
                      padding: '8px 16px', 
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      #{booking.id}
                    </div>

                    {/* Customer Info */}
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#333', marginBottom: '2px' }}>
                        {booking.allUserInfo?.fullName || 'N/A'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        📞 {booking.allUserInfo?.phoneNumber || 'N/A'}
                      </div>
                    </div>

                    {/* Vehicle & Price */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                        {booking.vehicleInfo?.type || 'N/A'}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#28a745' }}>
                        {booking.totalCost ? Number(booking.totalCost).toLocaleString('vi-VN') : '0'} VNĐ
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Time & License Info */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr auto', 
                    gap: '12px',
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontSize: '12px'
                  }}>
                    <div>
                      <span style={{ color: '#999' }}>⏰ Bắt đầu:</span>
                      <div style={{ fontWeight: '600', color: '#333', marginTop: '2px' }}>
                        {formatDateTime(booking.estimatedStartTime)}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#999' }}>⏰ Kết thúc:</span>
                      <div style={{ fontWeight: '600', color: '#333', marginTop: '2px' }}>
                        {formatDateTime(booking.estimatedEndTime)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {booking.userInfo?.licenseImage && (
                        <img 
                          src={booking.userInfo.licenseImage} 
                          alt="GPLX"
                          title="Click để xem GPLX"
                          style={{
                            width: '50px',
                            height: '32px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(booking.userInfo.licenseImage, '_blank')}
                        />
                      )}
                      {booking.userInfo?.identityImage && (
                        <img 
                          src={booking.userInfo.identityImage} 
                          alt="CCCD"
                          title="Click để xem CCCD"
                          style={{
                            width: '50px',
                            height: '32px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(booking.userInfo.identityImage, '_blank')}
                        />
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleConfirm(booking.id)}
                      disabled={actionLoading}
                      style={{
                        flex: 1,
                        padding: '10px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#28a745',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        opacity: actionLoading ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!actionLoading) e.currentTarget.style.background = '#218838';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#28a745';
                      }}
                    >
                      ✅ Xác nhận
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowRejectModal(true);
                      }}
                      disabled={actionLoading}
                      style={{
                        flex: 1,
                        padding: '10px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#dc3545',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        opacity: actionLoading ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!actionLoading) e.currentTarget.style.background = '#c82333';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#dc3545';
                      }}
                    >
                      ❌ Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
              ❌ Từ chối booking #{selectedBooking?.id}
            </h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
              Vui lòng nhập lý do từ chối để thông báo cho khách hàng:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Xe đang bảo trì, không có xe phù hợp, thời gian không khả dụng..."
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                fontFamily: 'inherit',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedBooking(null);
                }}
                disabled={actionLoading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: actionLoading ? 0.6 : 1
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                  color: 'white',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: actionLoading ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                }}
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component: Ghi nhận thanh toán
const PaymentManagement = ({ assignedStation, user }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentType: 'REMAINING',
    paymentMethod: 'CASH',
    notes: ''
  });

  useEffect(() => {
    if (assignedStation?.id) {
      fetchActiveBookings();
    }
  }, [assignedStation]);

  // Filter bookings khi searchTerm thay đổi
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBookings(bookings);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = bookings.filter(booking => {
        const customerName = (booking.userInfo?.fullName || booking.customerName || '').toLowerCase();
        const customerPhone = (booking.userInfo?.phone || booking.customerPhone || '');
        const bookingId = booking.id.toString();
        
        return customerName.includes(term) || 
               customerPhone.includes(term) || 
               bookingId.includes(term);
      });
      setFilteredBookings(filtered);
    }
  }, [searchTerm, bookings]);

  const fetchActiveBookings = async () => {
    if (!assignedStation?.id) return;
    
    setLoading(true);
    try {
      const response = await getActiveBookingsWithDetailsForStation(assignedStation.id);
      console.log('Active bookings:', response);
      
      // Debug: Kiểm tra phone number
      if (response && response.length > 0) {
        response.forEach(booking => {
          console.log(`📋 Booking #${booking.id}:`, {
            fullName: booking.allUserInfo?.fullName,
            phoneNumber: booking.allUserInfo?.phoneNumber,
            email: booking.allUserInfo?.email,
            allUserInfo: booking.allUserInfo
          });
        });
      }
      
      setBookings(response || []);
      setFilteredBookings(response || []);
    } catch (error) {
      console.error('Error fetching active bookings:', error);
      alert('Không thể tải danh sách booking');
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = async (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
    
    // Load payment records for this booking
    try {
      const records = await getPaymentRecordsByBooking(booking.id);
      setPaymentRecords(records || []);
      
      const total = await getTotalPaidAmount(booking.id);
      setTotalPaid(total || 0);
      
      // Set suggested amount (remaining amount)
      const remaining = booking.totalCost - (total || 0);
      setPaymentForm({
        amount: remaining > 0 ? remaining.toString() : '',
        paymentType: 'REMAINING',
        paymentMethod: 'CASH',
        notes: ''
      });
    } catch (error) {
      console.error('Error loading payment records:', error);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBooking(null);
    setPaymentRecords([]);
    setTotalPaid(0);
    setPaymentForm({
      amount: '',
      paymentType: 'REMAINING',
      paymentMethod: 'CASH',
      notes: ''
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      const paymentData = {
        bookingId: selectedBooking.id,
        paymentType: paymentForm.paymentType,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        paymentStatus: 'COMPLETED',
        notes: paymentForm.notes,
        staffId: user.id
      };

      await createPaymentRecord(paymentData);
      alert('Ghi nhận thanh toán thành công!');
      closePaymentModal();
      fetchActiveBookings();
    } catch (error) {
      console.error('Error creating payment record:', error);
      alert('Có lỗi khi ghi nhận thanh toán');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const paymentTypeLabels = {
    'DEPOSIT': 'Tiền cọc',
    'REMAINING': 'Tiền còn lại',
    'ADDITIONAL': 'Phí phát sinh',
    'REFUND': 'Hoàn tiền'
  };

  const paymentMethodLabels = {
    'CASH': 'Tiền mặt',
    'BANK_TRANSFER': 'Chuyển khoản',
    'CREDIT_CARD': 'Thẻ tín dụng',
    'E_WALLET': 'Ví điện tử'
  };

  return (
    <div className="payment-management">
      <div className="section-header">
        <h2>💰 Ghi nhận thanh toán</h2>
        <p>Quản lý thanh toán cho các booking đang hoạt động</p>
      </div>

      {/* Search Bar */}
      <div className="payment-search-section">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="search-icon">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
          </svg>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên khách hàng, SĐT hoặc mã booking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              title="Xóa tìm kiếm"
            >
              ×
            </button>
          )}
        </div>
        <div className="search-results-info">
          {searchTerm && (
            <span className="results-count">
              Tìm thấy <strong>{filteredBookings.length}</strong> kết quả
            </span>
          )}
          <span className="total-count">
            Tổng: <strong>{bookings.length}</strong> booking
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="payment-bookings-grid">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking, index) => (
              <div key={booking.id} className="payment-booking-card">
                <div className="booking-card-header">
                  <span className="booking-id">#{booking.id}</span>
                  <span className="status-badge status-active">
                    ACTIVE
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-info-row">
                    <span className="label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                      </svg>
                      Khách hàng:
                    </span>
                    <span className="value">{booking.userInfo?.fullName || 'N/A'}</span>
                  </div>
                  
                  <div className="booking-info-row">
                    <span className="label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                      </svg>
                      SĐT:
                    </span>
                    <span className="value">{booking.userInfo?.phone || 'N/A'}</span>
                  </div>

                  <div className="booking-info-row">
                    <span className="label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.92,6.01C18.72,5.42 18.16,5 17.5,5H15V3H9V5H6.5C5.84,5 5.28,5.42 5.08,6.01L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 19,21H20A1,1 0 0,0 21,20V12L18.92,6.01M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M5,11L6.5,6.5H17.5L19,11H5Z"/>
                      </svg>
                      Xe:
                    </span>
                    <span className="value vehicle-info">
                      {booking.vehicleInfo?.licensePlate || 'N/A'} • {booking.vehicleInfo?.type || 'N/A'}
                    </span>
                  </div>

                  <div className="booking-info-row">
                    <span className="label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10V14A2,2 0 0,1 7,16H17A2,2 0 0,1 19,14V10A2,2 0 0,1 17,8H7Z"/>
                      </svg>
                      Tổng tiền:
                    </span>
                    <span className="value price-highlight">{formatCurrency(booking.totalCost)}</span>
                  </div>

                  <div className="booking-info-row">
                    <span className="label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                      </svg>
                      Thời gian:
                    </span>
                    <span className="value time-range">
                      {new Date(booking.estimatedStartTime).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })} →<br />
                      {new Date(booking.estimatedEndTime).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="booking-card-footer">
                  <button 
                    className="btn-record-payment"
                    onClick={() => openPaymentModal(booking)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10V14A2,2 0 0,1 7,16H17A2,2 0 0,1 19,14V10A2,2 0 0,1 17,8H7Z"/>
                    </svg>
                    Ghi nhận thanh toán
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="#ddd">
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
              </svg>
              <p>
                {searchTerm 
                  ? `Không tìm thấy booking nào với từ khóa "${searchTerm}"`
                  : 'Không có booking nào đang hoạt động'}
              </p>
              {searchTerm && (
                <button 
                  className="btn-clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Ghi nhận thanh toán - Booking #{selectedBooking.id}</h3>
              <button className="close-btn" onClick={closePaymentModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Booking Info */}
              <div className="payment-booking-info">
                <h4>📋 Thông tin booking</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Khách hàng:</span>
                    <span className="value">{selectedBooking.userInfo?.fullName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">SĐT:</span>
                    <span className="value">{selectedBooking.userInfo?.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Xe:</span>
                    <span className="value">
                      {selectedBooking.vehicleInfo?.licensePlate} - {selectedBooking.vehicleInfo?.type}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Tổng tiền:</span>
                    <span className="value price">{formatCurrency(selectedBooking.totalCost)}</span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {paymentRecords.length > 0 && (
                <div className="payment-history">
                  <h4>📜 Lịch sử thanh toán</h4>
                  <div className="payment-records-list">
                    {paymentRecords.map(record => (
                      <div key={record.id} className="payment-record-item">
                        <div className="record-header">
                          <span className={`payment-type ${record.paymentType?.toLowerCase()}`}>
                            {paymentTypeLabels[record.paymentType] || record.paymentType}
                          </span>
                          <span className="payment-amount">{formatCurrency(record.amount)}</span>
                        </div>
                        <div className="record-details">
                          <span>🕐 {formatDateTime(record.paymentTime)}</span>
                          <span>💳 {paymentMethodLabels[record.paymentMethod]}</span>
                        </div>
                        {record.notes && (
                          <div className="record-notes">📝 {record.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="payment-summary">
                    <div className="summary-row">
                      <span>Đã thanh toán:</span>
                      <span className="amount paid">{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Còn lại:</span>
                      <span className="amount remaining">
                        {formatCurrency(selectedBooking.totalCost - totalPaid)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Form */}
              <div className="payment-form-section">
                <h4>➕ Ghi nhận thanh toán mới</h4>
                <form onSubmit={handlePaymentSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Loại thanh toán *</label>
                      <select
                        value={paymentForm.paymentType}
                        onChange={(e) => setPaymentForm({...paymentForm, paymentType: e.target.value})}
                        required
                      >
                        <option value="DEPOSIT">Tiền cọc</option>
                        <option value="REMAINING">Tiền còn lại</option>
                        <option value="ADDITIONAL">Phí phát sinh</option>
                        <option value="REFUND">Hoàn tiền</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Số tiền (VNĐ) *</label>
                      <input
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                        placeholder="Nhập số tiền"
                        required
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phương thức thanh toán *</label>
                      <select
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                        required
                      >
                        <option value="CASH">Tiền mặt</option>
                        <option value="BANK_TRANSFER">Chuyển khoản</option>
                        <option value="CREDIT_CARD">Thẻ tín dụng</option>
                        <option value="E_WALLET">Ví điện tử</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label>Ghi chú</label>
                      <textarea
                        value={paymentForm.notes}
                        onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                        placeholder="Nhập ghi chú (không bắt buộc)"
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={closePaymentModal}>
                      Hủy
                    </button>
                    <button type="submit" className="btn-submit">
                      ✓ Xác nhận thanh toán
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component: Lịch sử thuê xe cho Staff
const StaffBookingHistory = ({ assignedStation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const statusLabels = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận', 
    'ACTIVE': 'Đang thuê',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy'
  };

  const statusColors = {
    'PENDING': '#f57c00',
    'CONFIRMED': '#2196f3', 
    'ACTIVE': '#4caf50',
    'COMPLETED': '#9c27b0',
    'CANCELLED': '#f44336'
  };

  useEffect(() => {
    if (assignedStation?.id) {
      fetchBookings();
    }
  }, [assignedStation, currentPage, filters]);

  const fetchBookings = async () => {
    if (!assignedStation?.id) {
      console.log('❌ No assigned station');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Fetching bookings for station:', assignedStation.id);
      
      // Gọi API với stationId cố định để chỉ lấy booking của trạm này
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: '10',
        stationId: assignedStation.id.toString() // Filter cứng theo trạm
      });

      // Thêm các filter khác nếu có
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      console.log('📋 API params:', params.toString());

      const response = await fetch(`/api/bookings/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched bookings:', data);
        
        setBookings(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        console.error('❌ API Error:', response.status);
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      alert('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); // Reset về page đầu khi filter
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '--';
    return new Date(dateTime).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="staff-booking-history">
      <div className="section-header">
        <h2>📋 Lịch sử thuê xe - {assignedStation?.name}</h2>
        <p>Quản lý tất cả booking tại trạm của bạn</p>
      </div>

      {/* Filters */}
      <div className="booking-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Trạng thái</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="ACTIVE">Đang thuê</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Từ ngày</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Đến ngày</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên khách hàng, SĐT..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-number">{totalElements}</span>
          <span className="stat-label">Tổng booking</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{assignedStation?.name || '--'}</span>
          <span className="stat-label">Trạm quản lý</span>
        </div>
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="booking-list">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-id">
                      <strong>#{booking.id}</strong>
                    </div>
                    <div 
                      className="booking-status"
                      style={{ 
                        background: statusColors[booking.status] || '#666',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {statusLabels[booking.status] || booking.status}
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="label">Khách hàng:</span>
                      <span className="value">
                        {booking.userInfo?.fullName || booking.customerName || 'N/A'}
                        {booking.userInfo?.phone && (
                          <small> - {booking.userInfo.phone}</small>
                        )}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="label">Xe:</span>
                      <span className="value">
                        {booking.vehicleInfo?.licensePlate || 'N/A'} 
                        - {booking.vehicleInfo?.type || 'N/A'}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="label">Thời gian thuê:</span>
                      <span className="value">
                        {formatDateTime(booking.estimatedStartTime)} 
                        → {formatDateTime(booking.estimatedEndTime)}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="label">Tổng tiền:</span>
                      <span className="value price">
                        {formatCurrency(booking.totalCost)}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="label">Ngày đặt:</span>
                      <span className="value">
                        {formatDateTime(booking.bookingTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="#ddd">
                  <path d="M9 11H7v2h2v-2m4 0h-2v2h2v-2m4 0h-2v2h2v-2m2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V9h14v11Z"/>
                </svg>
                <p>Không có booking nào tại trạm này</p>
                {assignedStation && (
                  <small>Trạm: {assignedStation.name}</small>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                « Trước
              </button>
              
              <span className="page-info">
                Trang {currentPage + 1} / {totalPages} 
                ({totalElements} booking)
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Sau »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StaffDashboard;
