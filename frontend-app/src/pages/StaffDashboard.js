import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/staff.css';
import '../styles/components/verification.css';
import '../styles/components/handover.css';
import '../styles/components/form.css';
import vehicleService from '../utils/vehicleService';

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

// Component: Quản lý xe tại điểm (thêm/sửa/xóa xe)
const VehicleMaintenance = () => {
  const [vehicles, setVehicles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [expandedVehicle, setExpandedVehicle] = useState(null);
  const fileInputRef = useRef(null);
  
  // Danh sách trạm và địa chỉ
  const stationList = [
    { id: 'station-1', name: 'Trạm Quận 1', address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM' },
    { id: 'station-2', name: 'Trạm Quận 7', address: '456 Đường Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM' },
    { id: 'station-3', name: 'Trạm Thủ Đức', address: '789 Đường Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM' },
    { id: 'station-4', name: 'Trạm Đà Lạt', address: '15 Đường Trần Phú, Phường 4, TP. Đà Lạt, Lâm Đồng' },
    { id: 'station-5', name: 'Trạm Bảo Lộc', address: '78 Đường Trần Hưng Đạo, Phường 1, TP. Bảo Lộc, Lâm Đồng' },
    { id: 'station-6', name: 'Trạm Long Xuyên', address: '234 Đường Nguyễn Văn Cừ, Phường Mỹ Bình, TP. Long Xuyên, An Giang' },
    { id: 'station-7', name: 'Trạm Châu Đốc', address: '567 Đường Lê Lợi, Phường Châu Phú B, TP. Châu Đốc, An Giang' },
    { id: 'station-8', name: 'Trạm Quảng Ngãi', address: '345 Đường Quang Trung, Phường Lê Hồng Phong, TP. Quảng Ngãi, Quảng Ngãi' },
    { id: 'station-9', name: 'Trạm Sơn Tịnh', address: '678 Đường Hùng Vương, TT. Sơn Tịnh, Huyện Sơn Tịnh, Quảng Ngãi' }
  ];
  
  const [form, setForm] = useState({
    id: '', 
    battery_level: '', 
    description: '', 
    image_url: '', 
    last_maintenance_date: '', 
    licence_plate: '', 
    price_per_hour: '', 
    status: 'AVAILABLE', 
    type: '', 
    station_id: '',
    // Thông số kỹ thuật bổ sung
    seats: '', // Số tự động
    battery_capacity: '', // Dung lượng pin (kWh)
    range: '', // Phạm vi di chuyển (km)
    charging_type: '', // Loại cổng sạc
    charging_speed: '', // Tốc độ sạc
    location: '', // Vị trí hiện tại
    trip_count: '' // Số chuyến
  });

  useEffect(() => {
    const v = vehicleService.getVehicles();
    setVehicles(v || []);
  }, []);

  const refresh = () => {
    setVehicles(vehicleService.getVehicles());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-fill địa chỉ khi chọn station_id
    if (name === 'station_id') {
      const selectedStation = stationList.find(station => station.id === value);
      setForm(prev => ({ 
        ...prev, 
        [name]: value,
        location: selectedStation ? selectedStation.address : ''
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    const payload = {
      id: form.id || undefined,
      battery_level: Number(form.battery_level) || 0,
      description: form.description,
      image_url: form.image_url,
      last_maintenance_date: form.last_maintenance_date,
      licence_plate: form.licence_plate,
      price_per_hour: Number(form.price_per_hour) || 0,
      status: form.status,
      type: form.type,
      station_id: form.station_id,
      // Thông số kỹ thuật
      seats: Number(form.seats) || 0,
      battery_capacity: Number(form.battery_capacity) || 0,
      range: Number(form.range) || 0,
      charging_type: form.charging_type,
      charging_speed: form.charging_speed,
      location: form.location,
      trip_count: Number(form.trip_count) || 0
    };

    if (editing) {
      vehicleService.updateVehicle(editing.id, payload);
      setEditing(null);
    } else {
      vehicleService.addVehicle(payload);
    }
    
    // Reset form với tất cả trường
    setForm({ 
      id: '', battery_level: '', description: '', image_url: '', last_maintenance_date: '', 
      licence_plate: '', price_per_hour: '', status: 'AVAILABLE', type: '', station_id: '',
      seats: '', battery_capacity: '', range: '', charging_type: '', charging_speed: '',
      location: '', trip_count: ''
    });
    refresh();
  };

  // Thêm xe mới từ form hiện tại (khi đang ở trạng thái sửa vẫn có thể thêm bản ghi mới)
  const handleAddNew = (e) => {
    e && e.preventDefault();
    const payload = {
      battery_level: Number(form.battery_level) || 0,
      description: form.description,
      image_url: form.image_url,
      last_maintenance_date: form.last_maintenance_date,
      licence_plate: form.licence_plate,
      price_per_hour: Number(form.price_per_hour) || 0,
      status: form.status,
      type: form.type,
      station_id: form.station_id,
      // Thông số kỹ thuật
      seats: Number(form.seats) || 0,
      battery_capacity: Number(form.battery_capacity) || 0,
      range: Number(form.range) || 0,
      charging_type: form.charging_type,
      charging_speed: form.charging_speed,
      location: form.location,
      trip_count: Number(form.trip_count) || 0
    };
    vehicleService.addVehicle(payload);
    setForm({ 
      id: '', battery_level: '', description: '', image_url: '', last_maintenance_date: '', 
      licence_plate: '', price_per_hour: '', status: 'AVAILABLE', type: '', station_id: '',
      seats: '', battery_capacity: '', range: '', charging_type: '', charging_speed: '',
      location: '', trip_count: ''
    });
    setEditing(null);
    refresh();
  };

  const handleEdit = (v) => {
    setEditing(v);
    setForm({
      id: v.id,
      battery_level: v.battery_level || '',
      description: v.description || '',
      image_url: v.image_url || '',
      last_maintenance_date: v.last_maintenance_date || '',
      licence_plate: v.licence_plate || '',
      price_per_hour: v.price_per_hour || '',
      status: v.status || 'AVAILABLE',
      type: v.type || '',
      station_id: v.station_id || '',
      // Thông số kỹ thuật
      seats: v.seats || '',
      battery_capacity: v.battery_capacity || '',
      range: v.range || '',
      charging_type: v.charging_type || '',
      charging_speed: v.charging_speed || '',
      location: v.location || '',
      trip_count: v.trip_count || ''
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa xe này không?')) return;
    vehicleService.deleteVehicle(id);
    refresh();
  };

  return (
    <div className="staff-section">
      <h1>Quản lý xe tại điểm</h1>

      <div className="vehicle-status-table">
        <h2>Danh sách xe tại điểm</h2>
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
                  <td>{v.licence_plate}</td>
                  <td>{v.type || v.description}</td>
                  <td>
                    <div className="battery-indicator">
                      <div className="battery-container">
                        <div 
                          className={`battery-bar ${
                            v.battery_level >= 60 ? 'battery-high' :
                            v.battery_level >= 30 ? 'battery-medium' : 
                            'battery-low'
                          }`} 
                          style={{
                            width: `${Math.min(Math.max(v.battery_level || 0, 0), 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className={`battery-text ${
                        v.battery_level >= 60 ? 'text-green-600' :
                        v.battery_level >= 30 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {v.battery_level != null ? `${v.battery_level}%` : 'N/A'}
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
                  <td>{v.price_per_hour ? `${v.price_per_hour.toLocaleString()}đ` : '-'}</td>
                  <td>
                    <button className="btn-action" onClick={() => handleEdit(v)}>Sửa</button>
                    <button className="btn-action" onClick={() => handleDelete(v.id)}>Xóa</button>
                  </td>
                </tr>
                
                {/* Expanded Details Row */}
                {expandedVehicle === v.id && (
                  <tr className="expanded-details">
                    <td colSpan="7">
                      <div className="vehicle-details-container">
                        <div className="details-header">
                          <h4>Chi tiết xe {v.licence_plate}</h4>
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
                                <span className="value">{v.battery_capacity ? `${v.battery_capacity} kWh` : 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Phạm vi di chuyển:</span>
                                <span className="value">{v.range ? `${v.range} km` : 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Loại cổng sạc:</span>
                                <span className="value">{v.charging_type || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Tốc độ sạc:</span>
                                <span className="value">{v.charging_speed || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Số chuyến:</span>
                                <span className="value">{v.trip_count || '0'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="details-section">
                            <h5>Thông tin quản lý</h5>
                            <div className="details-grid">
                              <div className="detail-row">
                                <span className="label">ID trạm:</span>
                                <span className="value">{v.station_id || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Vị trí hiện tại:</span>
                                <span className="value">{v.location || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Ngày bảo trì cuối:</span>
                                <span className="value">{
                                  v.last_maintenance_date ? 
                                    new Date(v.last_maintenance_date).toLocaleDateString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit', 
                                      year: 'numeric'
                                    }) : 'N/A'
                                }</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Mô tả:</span>
                                <span className="value">{v.description || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          
                          {v.image_url && (
                            <div className="details-section image-section">
                              <h5>Ảnh xe</h5>
                              <div className="vehicle-image">
                                <img src={v.image_url} alt={`Xe ${v.licence_plate}`} />
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
      </div>

      <div className="issue-report-form">
        <h2>{editing ? 'Cập nhật xe' : 'Thêm xe mới'}</h2>
        <form onSubmit={handleAddOrUpdate}>
          <div className="form-group">
            <label>Biển số xe</label>
            <input 
              name="licence_plate" 
              value={form.licence_plate} 
              onChange={handleChange} 
              placeholder="Ví dụ: 30A-12345"
              required 
            />
          </div>
          <div className="form-group">
            <label>Loại xe</label>
            <input 
              name="type" 
              value={form.type} 
              onChange={handleChange} 
              placeholder="Ví dụ: VF3, VF5, VF8"
              required 
            />
          </div>
          <div className="form-group">
            <label>Mô tả chi tiết</label>
            <input 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Ví dụ: VINFAST VF3 - Màu demo"
            />
          </div>
          <div className="form-group">
            <label>Ảnh xe</label>
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setForm(prev => ({
                      ...prev,
                      image_url: ev.target.result
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
              {form.image_url && (
                <div className="image-preview photo-item" style={{ marginTop: '10px', maxWidth: 200 }}>
                  <img
                    src={form.image_url}
                    alt="Vehicle preview"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    type="button"
                    className="remove-photo"
                    onClick={() => {
                      setForm(prev => ({ ...prev, image_url: '' }));
                      try { if (fileInputRef.current) fileInputRef.current.value = null; } catch (e) { }
                    }}
                    aria-label="Xóa ảnh"
                  >
                    ×
                  </button>
                </div>
              )}
          </div>
          
          <h3 style={{ margin: '2rem 0 1rem 0', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            Thông số kỹ thuật
          </h3>
          
          <div className="form-group">
            <label>Số ghế</label>
            <input 
              name="seats" 
              type="number" 
              min="2" 
              max="8" 
              value={form.seats} 
              onChange={handleChange} 
              placeholder="Ví dụ: 4"
            />
          </div>
          
          <div className="form-group">
            <label>Dung lượng pin (kWh)</label>
            <input 
              name="battery_capacity" 
              type="number" 
              step="0.1" 
              value={form.battery_capacity} 
              onChange={handleChange} 
              placeholder="Ví dụ: 87.7"
            />
          </div>
          
          <div className="form-group">
            <label>Phạm vi di chuyển (km)</label>
            <input 
              name="range" 
              type="number" 
              value={form.range} 
              onChange={handleChange} 
              placeholder="Ví dụ: 420"
            />
          </div>
          
          <div className="form-group">
            <label>Loại cổng sạc</label>
            <select name="charging_type" value={form.charging_type} onChange={handleChange}>
              <option value="">-- Chọn loại cổng sạc --</option>
              <option value="CCS2">CCS2</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="Type 2">Type 2</option>
              <option value="Tesla Supercharger">Tesla Supercharger</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Tốc độ sạc</label>
            <input 
              name="charging_speed" 
              value={form.charging_speed} 
              onChange={handleChange} 
              placeholder="Ví dụ: 10 - 70% trong ~25 mins"
            />
          </div>
          
          <div className="form-group">
            <label>Số chuyến đã thực hiện</label>
            <input 
              name="trip_count" 
              type="number" 
              min="0" 
              value={form.trip_count} 
              onChange={handleChange} 
              placeholder="Ví dụ: 19"
            />
          </div>
          
          <div className="form-group">
            <label>Mức pin (%)</label>
            <input 
              name="battery_level" 
              type="number" 
              min="0" 
              max="100" 
              value={form.battery_level} 
              onChange={handleChange} 
              placeholder="0-100"
            />
          </div>
          
          <h3 style={{ margin: '2rem 0 1rem 0', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            Thông tin quản lý
          </h3>
          
          <div className="form-group">
            <label>Ngày bảo trì cuối</label>
            <input 
              name="last_maintenance_date" 
              type="date" 
              value={form.last_maintenance_date} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>Giá thuê mỗi giờ (VND)</label>
            <input 
              name="price_per_hour" 
              type="number" 
              value={form.price_per_hour} 
              onChange={handleChange} 
              placeholder="Ví dụ: 50000"
            />
          </div>
          <div className="form-group">
            <label>ID trạm</label>
            <select
              name="station_id" 
              value={form.station_id} 
              onChange={handleChange}
            >
              <option value="">Chọn trạm</option>
              {stationList.map(station => (
                <option key={station.id} value={station.id}>
                  {station.id} - {station.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Vị trí hiện tại</label>
            <input 
              name="location" 
              value={form.location} 
              onChange={handleChange} 
              placeholder="Địa chỉ sẽ tự động điền khi chọn ID trạm"
              readOnly
              style={{
                background: '#f8fafc',
                color: '#64748b',
                cursor: 'not-allowed'
              }}
            />
          </div>
          
          <div className="form-group">
            <label>Trạng thái</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="AVAILABLE">Có sẵn</option>
              <option value="RESERVED">Đã đặt trước</option>
              <option value="RENTED">Đang cho thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>

          {editing ? (
            <>
              <button className="btn-success" type="submit">Cập nhật</button>
              <button type="button" className="btn-danger" onClick={() => { setEditing(null); setForm({ id: '', battery_level: '', description: '', image_url: '', last_maintenance_date: '', licence_plate: '', price_per_hour: '', status: 'AVAILABLE', type: '', station_id: '' }); }} style={{marginLeft: '8px'}}>Hủy</button>
            </>
          ) : (
            <button className="btn-success" type="submit">Thêm xe</button>
          )}
        </form>
        {/* Nút Thêm (nằm phía dưới form, hợp lý khi muốn tạo bản sao khi đang edit) */}
        {editing && (
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-primary" onClick={handleAddNew}>Thêm</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
