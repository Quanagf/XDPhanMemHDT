import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/staff.css';
import '../styles/components/verification.css';
import '../styles/components/handover.css';
import '../styles/components/form.css';
import vehicleService from '../utils/vehicleService';
import vehiclesApi from '../api/vehiclesApi';
import { getAllComplaints, staffCompleteComplaint } from '../api/complaints';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('handover'); // handover, verification, payment, maintenance
  const [user, setUser] = useState(null);
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
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
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
            <p className="staff-station">Điểm: {user.position || 'Chưa phân công'}</p>
          </div>

          <nav className="staff-nav">
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
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'verification' ? 'active' : ''}`}
              onClick={() => setActiveTab('verification')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.18L16.59,7.59L18,9L10,17Z"/>
                </svg>
              </span>
              Xác thực khách hàng
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.11,4 20,4M20,18H4V12H20V18M20,8H4V6H20V8Z"/>
                </svg>
              </span>
              Thanh toán tại điểm
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
          {activeTab === 'handover' && <VehicleHandover />}
          {activeTab === 'verification' && <CustomerVerification />}
          {activeTab === 'payment' && <PaymentManagement />}
          {activeTab === 'maintenance' && <VehicleMaintenance />}
          {activeTab === 'complaints' && <MyComplaintsManagement user={user} />}
        </main>
      </div>
    </div>
  );
};

// Component: Quản lý giao - nhận xe
const VehicleHandover = () => {
  const [handoverType, setHandoverType] = useState('pickup'); // pickup or return
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [checklist, setChecklist] = useState({
    exterior: false,
    battery: false,
    functions: false,
    photos: false
  });
  const [photos, setPhotos] = useState([]);
  const [customerSign, setCustomerSign] = useState('');
  const [staffSign, setStaffSign] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Danh sách xe và đơn đặt trước
  const [vehicles, setVehicles] = useState(() => {
    const data = vehicleService.getVehicles() || [];
    return {
      available: data.filter(v => v.status === 'AVAILABLE'),
      reserved: data.filter(v => v.status === 'RESERVED'),
      rented: data.filter(v => v.status === 'RENTED')
    };
  });

  // Danh sách booking cần giao/nhận xe
  const [bookings] = useState({
    pickup: [
      {
        id: 'B12345',
        customerName: 'Phạm Thị Hương',
        vehicleInfo: {
          model: 'VinFast VF3',
          plate: '51H-12345',
          battery: 95
        },
        pickupTime: '2025-11-09T14:00:00',
        status: 'PENDING'
      },
      {
        id: 'B12346',
        customerName: 'Lê Minh Tuấn',
        vehicleInfo: {
          model: 'VinFast VF5',
          plate: '51H-67890',
          battery: 88
        },
        pickupTime: '2025-11-09T15:30:00',
        status: 'PENDING'
      }
    ],
    return: [
      {
        id: 'B12340',
        customerName: 'Trần Văn Minh',
        vehicleInfo: {
          model: 'VinFast VF3',
          plate: '51H-11111',
          battery: 45
        },
        returnTime: '2025-11-09T16:00:00',
        status: 'IN_PROGRESS'
      }
    ]
  });

  const handleStartHandover = (booking) => {
    setSelectedBooking(booking);
    setShowHandoverModal(true);
    // Khởi tạo signature pad
    if (signaturePadRef.current) {
      const canvas = signaturePadRef.current;
      const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      });
    }
  };

  const handleCloseModal = () => {
    setShowHandoverModal(false);
    setSelectedBooking(null);
    setChecklist({
      exterior: false,
      battery: false,
      functions: false,
      photos: false
    });
    setPhotos([]);
    setCustomerSign('');
    setStaffSign('');
    setInspectionNotes('');
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(images => {
      setPhotos([...photos, ...images]);
    });
  };

  const handleCompleteHandover = () => {
    if (!selectedBooking) return;

    // Kiểm tra điều kiện hoàn tất
    const isChecklistComplete = Object.values(checklist).every(item => item);
    const hasPhotos = photos.length >= 4;
    const hasSignatures = customerSign.trim() !== '' && staffSign.trim() !== '';

    if (!isChecklistComplete || !hasPhotos || !hasSignatures) {
      alert('Vui lòng hoàn tất tất cả các bước kiểm tra và ký xác nhận!');
      return;
    }

    // Cập nhật trạng thái xe
    const vehicleUpdate = handoverType === 'pickup' 
      ? { status: 'RENTED' }
      : { status: 'AVAILABLE' };

    // Lưu thông tin giao/nhận xe
    const handoverRecord = {
      bookingId: selectedBooking.id,
      type: handoverType,
      timestamp: new Date().toISOString(),
      checklist: { ...checklist },
      photos: [...photos],
      customerSignature: customerSign,
      staffSignature: staffSign,
      inspectionNotes: inspectionNotes,
      vehicleCondition: {
        battery: selectedBooking.vehicleInfo.battery,
        damages: [], // Thêm ghi nhận hư hỏng nếu có
        notes: inspectionNotes
      }
    };

    // Demo: Lưu vào localStorage
    try {
      const key = `handover_${selectedBooking.id}`;
      localStorage.setItem(key, JSON.stringify(handoverRecord));
      
      // Cập nhật UI
      alert(`${handoverType === 'pickup' ? 'Giao' : 'Nhận'} xe thành công!`);
      handleCloseModal();
    } catch (e) {
      console.error('Lưu thông tin giao/nhận xe thất bại:', e);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  return (
    <div className="staff-section" data-tab={handoverType}>
      <h1>Quản lý giao - nhận xe</h1>
      
      {/* Tab Switch */}
      <div className="tab-switch">
        <button 
          className={`tab-btn ${handoverType === 'pickup' ? 'active' : ''}`}
          onClick={() => setHandoverType('pickup')}
        >
          Giao xe
        </button>
        <button 
          className={`tab-btn ${handoverType === 'return' ? 'active' : ''}`}
          onClick={() => setHandoverType('return')}
        >
          Nhận xe
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Xe khả dụng</h3>
          <p className="stat-number">{vehicles.available.length}</p>
        </div>
        <div className="stat-card">
          <h3>Xe đã đặt trước</h3>
          <p className="stat-number">{vehicles.reserved.length}</p>
        </div>
        <div className="stat-card">
          <h3>Xe đang cho thuê</h3>
          <p className="stat-number">{vehicles.rented.length}</p>
        </div>
        <div className="stat-card">
          <h3>Lượt giao/nhận hôm nay</h3>
          <p className="stat-number">{bookings.pickup.length + bookings.return.length}</p>
        </div>
      </div>

      {/* Vehicle List */}
      {handoverType === 'pickup' ? (
        <div className="handover-list">
          <h2>Danh sách xe cần giao</h2>
          {bookings.pickup.map(booking => (
            <div key={booking.id} className="handover-card">
              <div className="handover-info">
                <h3>Booking #{booking.id}</h3>
                <p><strong>Khách hàng:</strong> {booking.customerName}</p>
                <p><strong>Xe:</strong> {booking.vehicleInfo.model} - {booking.vehicleInfo.plate}</p>
                <p><strong>Thời gian nhận:</strong> {new Date(booking.pickupTime).toLocaleString('vi-VN')}</p>
                <p><strong>Pin hiện tại:</strong> {booking.vehicleInfo.battery}%</p>
                <p>
                  <strong>Trạng thái:</strong>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>
                    {booking.status === 'PENDING' ? 'Chờ giao xe' : 'Đang giao xe'}
                  </span>
                </p>
              </div>
              <div className="handover-actions">
                <button 
                  className="btn-primary"
                  onClick={() => handleStartHandover(booking)}
                >
                  Bắt đầu giao xe
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="handover-list">
          <h2>Danh sách xe cần nhận</h2>
          {bookings.return.map(booking => (
            <div key={booking.id} className="handover-card">
              <div className="handover-info">
                <h3>Booking #{booking.id}</h3>
                <p><strong>Khách hàng:</strong> {booking.customerName}</p>
                <p><strong>Xe:</strong> {booking.vehicleInfo.model} - {booking.vehicleInfo.plate}</p>
                <p><strong>Thời gian trả:</strong> {new Date(booking.returnTime).toLocaleString('vi-VN')}</p>
                <p><strong>Pin hiện tại:</strong> {booking.vehicleInfo.battery}%</p>
                <p>
                  <strong>Trạng thái:</strong>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>
                    {booking.status === 'PENDING' ? 'Chờ nhận xe' : 'Đang kiểm tra'}
                  </span>
                </p>
              </div>
              <div className="handover-actions">
                <button 
                  className="btn-primary"
                  onClick={() => handleStartHandover(booking)}
                >
                  Bắt đầu nhận xe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Giao/Nhận xe */}
      {showHandoverModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content handover-modal">
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            
            <h2>{handoverType === 'pickup' ? 'Giao xe' : 'Nhận xe'} - Booking #{selectedBooking.id}</h2>
            
            <div className="handover-form-section">
              <h3>Checklist kiểm tra</h3>
              <div className="checklist">
                <label>
                  <input 
                    type="checkbox" 
                    checked={checklist.exterior}
                    onChange={(e) => setChecklist({...checklist, exterior: e.target.checked})}
                  />
                  Kiểm tra nội, ngoại thất xe (trầy xước, móp méo)
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={checklist.battery}
                    onChange={(e) => setChecklist({...checklist, battery: e.target.checked})}
                  />
                  Kiểm tra pin và hệ thống điện
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={checklist.functions}
                    onChange={(e) => setChecklist({...checklist, functions: e.target.checked})}
                  />
                  Kiểm tra phanh, đèn, còi
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={checklist.photos}
                    onChange={(e) => setChecklist({...checklist, photos: e.target.checked})}
                  />
                  Chụp ảnh xe 4 góc
                </label>
              </div>

              <div className="photo-upload-section">
                <h3>Ảnh xe</h3>
                <div className="photo-grid">
                  {photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={photo} alt={`Vehicle photo ${index + 1}`} />
                      <button 
                        className="remove-photo" 
                        onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {photos.length < 4 && (
                    <div className="photo-upload">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="inspection-notes-section">
                <h3>Ghi chú kiểm tra</h3>
                <div className="form-group">
                  <label>Ghi chú (tùy chọn):</label>
                  <textarea
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    placeholder="Nhập ghi chú về tình trạng xe, vấn đề phát hiện hoặc các lưu ý khác (có thể để trống)"
                    rows="4"
                    className="inspection-notes-input"
                  />
                </div>
              </div>

              <div className="signature-section">
                <h3>Xác nhận bàn giao</h3>
                <div className="signature-container">
                  <div className="form-group">
                    <label>Chữ ký khách hàng:</label>
                    <input
                      type="text"
                      value={customerSign}
                      onChange={(e) => setCustomerSign(e.target.value)}
                      placeholder="Nhập họ tên để xác nhận"
                      className="signature-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>Chữ ký nhân viên:</label>
                    <input
                      type="text"
                      value={staffSign}
                      onChange={(e) => setStaffSign(e.target.value)}
                      placeholder="Nhập họ tên để xác nhận"
                      className="signature-input"
                    />
                  </div>
                </div>
              </div>

              <div className="handover-actions">
                <button 
                  className="btn-secondary"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button 
                  className="btn-success"
                  onClick={handleCompleteHandover}
                >
                  Hoàn tất {handoverType === 'pickup' ? 'giao' : 'nhận'} xe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component: Xác thực khách hàng (bảng, notes, real-time timeago)
const CustomerVerification = () => {
  const STORAGE_KEY = 'verifications_v1';

  const sample = [
    {
      id: 'c-1',
      fullName: 'Nguyễn Văn A',
      phone: '0912345678',
      email: 'nguyenvana@email.com',
      dob: '1990-05-15',
      gplx: { number: '012345678901', clazz: 'B2', issued: '2015-01-10', expiry: '2030-01-10', image: '/placeholder-license.jpg' },
      cccd: { number: '001234567890', issued: '2020-01-01', issuer: 'Cục Cảnh sát QLHC về TTXH', image: '/placeholder-id.jpg' },
      status: 'PENDING', // PENDING | VERIFIED | REJECTED | COMPLETED
      notes: '',
      updatedAt: null
    },
    {
      id: 'c-2',
      fullName: 'Trần Thị B',
      phone: '0987654321',
      email: 'tranthib@email.com',
      dob: '1992-08-20',
      gplx: { number: '02233445566', clazz: 'B1', issued: '2018-03-12', expiry: '2028-03-12', image: '/placeholder-license.jpg' },
      cccd: { number: '002233445566', issued: '2019-06-20', issuer: 'Cục QL', image: '/placeholder-id.jpg' },
      status: 'PENDING',
      notes: '',
      updatedAt: null
    }
  ];

  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
        return sample;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('load verifications', e);
      return sample;
    }
  });

  const save = (next) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) { console.error(e); }
  };

  const sendNotification = (customer, reason) => {
    // Demo: lưu log thông báo vào localStorage và console
    const key = 'verif_notifications';
    const notif = { to: customer.email, time: new Date().toISOString(), reason };
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(notif);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { console.error(e); }
    console.log('Notification sent to', customer.email, reason);
  };

  const handleConfirm = (id) => {
    const next = items.map(it => it.id === id ? { ...it, status: 'VERIFIED', updatedAt: new Date().toISOString() } : it);
    save(next);
  };

  const handleReject = (id) => {
    const customer = items.find(i => i.id === id);
    if (customer) sendNotification(customer, 'Xác thực không hợp lệ. Vui lòng hoàn tất lại.');
    const next = items.map(it => it.id === id ? { ...it, status: 'REJECTED', updatedAt: new Date().toISOString() } : it);
    save(next);
  };

  // Save notes for a customer
  const saveNotes = (id, notes) => {
    const next = items.map(it => it.id === id ? { ...it, notes, updatedAt: new Date().toISOString() } : it);
    save(next);
  };

  // Real-time clock to update "time ago" display
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const pending = items.filter(i => i.status === 'PENDING');
  const completed = items.filter(i => i.status === 'VERIFIED' || i.status === 'COMPLETED');
  const rejected = items.filter(i => i.status === 'REJECTED');

  const timeAgo = (iso) => {
    if (!iso) return '-';
    const diff = Math.floor((now - new Date(iso).getTime()) / 1000);
    if (diff < 5) return 'vừa xong';
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff/60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff/3600)} giờ trước`;
    return `${Math.floor(diff/86400)} ngày trước`;
  };

  return (
    <div className="staff-section">
      <h1>Xác thực khách hàng</h1>

      <div className="verification-card">
        <h2>Danh sách cần xác thực</h2>
        {pending.length === 0 ? (
          <p>Không có khách hàng cần xác thực.</p>
        ) : (
          <div className="verification-list">
            {pending.map(c => (
              <div key={c.id} className="verification-item">
                <div className="verification-header">
                  <div className="customer-info">
                    <h3>{c.fullName}</h3>
                    <div className="contact-compact">
                      <span className="contact-item-inline">
                        <strong>SĐT:</strong> {c.phone}
                      </span>
                      <span className="contact-item-inline">
                        <strong>Email:</strong> {c.email}
                      </span>
                    </div>
                  </div>
                  <div className="verification-actions">
                    <button className="btn-success" onClick={() => handleConfirm(c.id)}>
                      ✓ Xác nhận hợp lệ
                    </button>
                    <button className="btn-danger" onClick={() => handleReject(c.id)}>
                      ✗ Từ chối
                    </button>
                  </div>
                </div>
                
                <div className="document-info">
                  <div className="document-item">
                    <strong>GPLX:</strong> {c.gplx && c.gplx.number}
                  </div>
                  <div className="document-item">
                    <strong>CCCD:</strong> {c.cccd && c.cccd.number}
                  </div>
                  <div className="status-item">
                    <strong>Trạng thái:</strong> 
                    <span className="status-badge pending">{c.status}</span>
                  </div>
                </div>

                <div className="verification-notes">
                  <label>Ghi chú xác thực:</label>
                  <textarea
                    placeholder="Ghi chú (ví dụ: giấy tờ mờ, sai tên, yêu cầu khách nộp lại...)"
                    defaultValue={c.notes || ''}
                    onBlur={(e) => saveNotes(c.id, e.target.value)}
                  />
                  <div className="notes-footer">
                    <span className="update-time">Cập nhật: {timeAgo(c.updatedAt)}</span>
                    <button className="btn-primary btn-small" onClick={() => saveNotes(c.id, c.notes || '')}>
                      Lưu ghi chú
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ marginTop: 24 }}>Đã xác nhận thành công</h2>
        {completed.length === 0 ? (
          <p>Chưa có khách hàng nào được xác nhận hoàn tất.</p>
        ) : (
          <div className="verified-list">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {completed.map(v => (
                  <tr key={v.id}>
                    <td>{v.fullName}</td>
                    <td>{v.email}</td>
                    <td>{v.phone}</td>
                    <td>
                      <span className={`status-badge ${v.status.toLowerCase()}`}>
                        {v.status === 'VERIFIED' ? 'Đã xác thực' : 
                         v.status === 'COMPLETED' ? 'Hoàn thành' : v.status}
                      </span>
                    </td>
                    <td>{timeAgo(v.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 style={{ marginTop: 24 }}>Xác thực không hoàn tất / Bị từ chối</h2>
        {rejected.length === 0 ? (
          <p>Chưa có phản hồi bị từ chối.</p>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {rejected.map(r => (
                <tr key={r.id}>
                  <td>{r.fullName}</td>
                  <td>{r.email}</td>
                  <td>
                    <span className="status-badge rejected">
                      Bị từ chối
                    </span>
                  </td>
                  <td>{timeAgo(r.updatedAt)}</td>
                  <td>{r.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Component: Thanh toán tại điểm
const PaymentManagement = () => {
  return (
    <div className="staff-section">
      <h1>Thanh toán tại điểm</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Tổng thu hôm nay</h3>
          <p className="stat-number">12,500,000đ</p>
        </div>
        <div className="stat-card">
          <h3>Số giao dịch</h3>
          <p className="stat-number">18</p>
        </div>
        <div className="stat-card">
          <h3>Đặt cọc chờ hoàn</h3>
          <p className="stat-number">5,000,000đ</p>
        </div>
      </div>

      <div className="payment-form">
        <h2>Ghi nhận thanh toán mới</h2>
        
        <div className="form-group">
          <label>Mã booking:</label>
          <input type="text" placeholder="Nhập mã booking" />
        </div>

        <div className="form-group">
          <label>Loại giao dịch:</label>
          <select>
            <option value="rental">Thanh toán phí thuê</option>
            <option value="deposit">Đặt cọc</option>
            <option value="refund">Hoàn cọc</option>
          </select>
        </div>

        <div className="form-group">
          <label>Số tiền:</label>
          <input type="number" placeholder="Nhập số tiền" />
        </div>

        <div className="form-group">
          <label>Phương thức thanh toán:</label>
          <select>
            <option value="cash">Tiền mặt</option>
            <option value="bank">Chuyển khoản</option>
            <option value="momo">Momo</option>
            <option value="vnpay">VNPay</option>
          </select>
        </div>

        <div className="form-group">
          <label>Ghi chú:</label>
          <textarea placeholder="Nhập ghi chú nếu có"></textarea>
        </div>

        <button className="btn-success">Xác nhận thanh toán</button>
      </div>

      {/* Transaction History */}
      <div className="transaction-history">
        <h2>Lịch sử giao dịch hôm nay</h2>
        <table className="staff-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Mã booking</th>
              <th>Khách hàng</th>
              <th>Loại GD</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>14:30</td>
              <td>#B12345</td>
              <td>Nguyễn Văn A</td>
              <td>Phí thuê</td>
              <td>500,000đ</td>
              <td>Tiền mặt</td>
            </tr>
            <tr>
              <td>15:00</td>
              <td>#B12346</td>
              <td>Trần Thị B</td>
              <td>Đặt cọc</td>
              <td>2,000,000đ</td>
              <td>Chuyển khoản</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component: Quản lý xe tại điểm (cập nhật trạng thái và báo cáo sự cố)
const VehicleMaintenance = () => {
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

  useEffect(() => {
    loadVehicles();
    
    // Lấy thông tin staff để dùng trong báo cáo sự cố
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const parsedUser = JSON.parse(userProfile);
      setIssueReportForm(prev => ({ 
        ...prev, 
        reportedBy: parsedUser.fullName || 'Staff' 
      }));
    }
  }, [currentPage, filters]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: 'id',
        sortDirection: 'desc',
        ...filters
      };

      const response = await vehiclesApi.getVehicles(params);
      
      // Adapt backend response structure
      setVehicles(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Không thể tải danh sách xe. Vui lòng thử lại.');
      // Fallback to local data for development
      const fallbackData = vehicleService.getVehicles();
      setVehicles(fallbackData || []);
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

      await vehiclesApi.updateVehicle(editing.id, updateData);
      
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
      await loadVehicles();
      
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
      // Tạo báo cáo sự cố (có thể gửi lên server hoặc lưu local)
      const issueReport = {
        ...issueReportForm,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: 'PENDING'
      };
      
      // Lưu báo cáo vào localStorage (trong thực tế sẽ gửi lên server)
      const existingReports = JSON.parse(localStorage.getItem('issueReports') || '[]');
      existingReports.push(issueReport);
      localStorage.setItem('issueReports', JSON.stringify(existingReports));
      
      // Cập nhật trạng thái xe thành MAINTENANCE nếu sự cố nghiêm trọng
      if (issueReportForm.severity === 'critical') {
        const vehicle = vehicles.find(v => v.id === issueReportForm.vehicleId);
        if (vehicle) {
          await vehiclesApi.updateVehicle(vehicle.id, { status: 'MAINTENANCE' });
          await loadVehicles(); // Reload vehicles
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
      <h1>Quản lý xe tại điểm</h1>

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
          <h2>Danh sách xe tại điểm</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select 
              value={filters.status || ''} 
              onChange={(e) => handleFilterChange({ status: e.target.value || null })}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
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
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Đang tải danh sách xe...
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
                            <h5>Tình trạng kỹ thuật</h5>
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
                                <span className="label">Mức pin hiện tại:</span>
                                <span className={`value ${
                                  v.batteryLevel >= 60 ? 'text-green-600' :
                                  v.batteryLevel >= 30 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {v.batteryLevel != null ? `${v.batteryLevel}%` : 'N/A'}
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
const MyComplaintsManagement = ({ user }) => {
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
      alert('✅ Đã đánh dấu hoàn thành! Admin sẽ xem xét và duyệt.');
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
      'VEHICLE_ISSUE': '🚗 Vấn đề xe',
      'BILLING': '💰 Thanh toán',
      'SERVICE_QUALITY': '⭐ Chất lượng dịch vụ',
      'DAMAGE_DISPUTE': '🔧 Tranh chấp hư hỏng',
      'ACCOUNT_ISSUE': '👤 Vấn đề tài khoản',
      'STATION_ISSUE': '📍 Vấn đề trạm',
      'OTHER': '📌 Khác'
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
        <h2>📋 Khiếu nại được phân công</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>Danh sách khiếu nại bạn cần xử lý</p>
      </div>

      {/* Statistics */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.total}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>📊 Tổng số</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>⏳ Đang xử lý</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.completed}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>✅ Đã hoàn thành</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stats.resolved}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>🎉 Đã duyệt</div>
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
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
          <div style={{ fontSize: '18px', color: '#2196F3' }}>⏳ Đang tải...</div>
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>📭</div>
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
                <div style={{ fontSize: '13px', color: '#999' }}>
                  📅 {new Date(complaint.createdAt).toLocaleDateString('vi-VN', {
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
                  <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '8px' }}>
                    ⏰ {new Date(complaint.staffCompletedAt).toLocaleDateString('vi-VN')}
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
                  <strong style={{ color: '#1B5E20', display: 'block', marginBottom: '8px' }}>✅ Kết quả cuối cùng (Admin):</strong>
                  <p style={{ margin: '0', color: '#2c3e50', lineHeight: '1.6' }}>{complaint.resolution}</p>
                  <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '8px' }}>
                    ⏰ {new Date(complaint.resolvedAt).toLocaleDateString('vi-VN')}
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
                      ✅ Đánh dấu hoàn thành
                    </button>
                    <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                      💡 Hãy hoàn thành công việc và nhấn nút này để báo admin
                    </div>
                  </>
                )}
                {complaint.status === 'STAFF_COMPLETED' && (
                  <div style={{ fontSize: '13px', color: '#4CAF50', fontWeight: '600', padding: '8px 16px', background: '#E8F5E9', borderRadius: '8px' }}>
                    ⏳ Đang chờ admin xem xét và duyệt...
                  </div>
                )}
                {complaint.status === 'RESOLVED' && (
                  <div style={{ fontSize: '13px', color: '#4CAF50', fontWeight: '600', padding: '8px 16px', background: '#E8F5E9', borderRadius: '8px' }}>
                    🎉 Admin đã duyệt - Khiếu nại hoàn tất!
                  </div>
                )}
                {complaint.status === 'REJECTED' && (
                  <div style={{ fontSize: '13px', color: '#F44336', fontWeight: '600', padding: '8px 16px', background: '#FFEBEE', borderRadius: '8px' }}>
                    ❌ Admin đã từ chối khiếu nại này
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
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>✅ Đánh dấu hoàn thành #{selectedComplaint.id}</h3>
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
              📝 Vui lòng mô tả chi tiết công việc bạn đã làm để xử lý khiếu nại này. Admin sẽ xem xét và duyệt.
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
                ✅ Xác nhận hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
