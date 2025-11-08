import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/staff.css';

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
              <span className="icon">🚗</span>
              Quản lý giao - nhận xe
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'verification' ? 'active' : ''}`}
              onClick={() => setActiveTab('verification')}
            >
              <span className="icon">✅</span>
              Xác thực khách hàng
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <span className="icon">💰</span>
              Thanh toán tại điểm
            </button>
            <button 
              className={`staff-nav-item ${activeTab === 'maintenance' ? 'active' : ''}`}
              onClick={() => setActiveTab('maintenance')}
            >
              <span className="icon">🔧</span>
              Quản lý xe tại điểm
            </button>
            
            {/* Nút đăng xuất */}
            <button 
              className="staff-nav-item logout-btn"
              onClick={handleLogout}
              style={{ 
                marginTop: 'auto',
                color: '#dc3545',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <span className="icon">🚪</span>
              Đăng xuất
            </button>
          </nav>
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

  return (
    <div className="staff-section">
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
          <p className="stat-number">12</p>
        </div>
        <div className="stat-card">
          <h3>Xe đã đặt trước</h3>
          <p className="stat-number">8</p>
        </div>
        <div className="stat-card">
          <h3>Xe đang cho thuê</h3>
          <p className="stat-number">15</p>
        </div>
        <div className="stat-card">
          <h3>Lượt giao/nhận hôm nay</h3>
          <p className="stat-number">23</p>
        </div>
      </div>

      {/* Vehicle List */}
      {handoverType === 'pickup' ? (
        <div className="handover-list">
          <h2>Danh sách xe cần giao</h2>
          <div className="handover-card">
            <div className="handover-info">
              <h3>Booking #B12345</h3>
              <p><strong>Khách hàng:</strong> Nguyễn Văn A</p>
              <p><strong>Xe:</strong> VinFast VF3 - 30A-12345</p>
              <p><strong>Thời gian nhận:</strong> 14:00 - 08/11/2025</p>
              <p><strong>Pin hiện tại:</strong> 95%</p>
            </div>
            <div className="handover-actions">
              <button className="btn-primary">Bắt đầu giao xe</button>
            </div>
          </div>

          <div className="handover-card">
            <div className="handover-info">
              <h3>Booking #B12346</h3>
              <p><strong>Khách hàng:</strong> Trần Thị B</p>
              <p><strong>Xe:</strong> VinFast VF5 - 51F-67890</p>
              <p><strong>Thời gian nhận:</strong> 15:30 - 08/11/2025</p>
              <p><strong>Pin hiện tại:</strong> 88%</p>
            </div>
            <div className="handover-actions">
              <button className="btn-primary">Bắt đầu giao xe</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="handover-list">
          <h2>Danh sách xe cần nhận</h2>
          <div className="handover-card">
            <div className="handover-info">
              <h3>Booking #B12340</h3>
              <p><strong>Khách hàng:</strong> Lê Văn C</p>
              <p><strong>Xe:</strong> VinFast VF3 - 30A-11111</p>
              <p><strong>Thời gian trả:</strong> 16:00 - 08/11/2025</p>
              <p><strong>Trạng thái:</strong> <span className="badge badge-warning">Đang chờ</span></p>
            </div>
            <div className="handover-actions">
              <button className="btn-primary">Bắt đầu nhận xe</button>
            </div>
          </div>
        </div>
      )}

      {/* Handover Form Modal (mở khi click "Bắt đầu giao/nhận xe") */}
      <div className="handover-form-section">
        <h3>Checklist giao xe</h3>
        <div className="checklist">
          <label>
            <input type="checkbox" />
            Kiểm tra ngoại thất xe (trầy xước, móp méo)
          </label>
          <label>
            <input type="checkbox" />
            Kiểm tra pin và hệ thống điện
          </label>
          <label>
            <input type="checkbox" />
            Kiểm tra phanh, đèn, còi
          </label>
          <label>
            <input type="checkbox" />
            Chụp ảnh xe 4 góc
          </label>
        </div>

        <div className="photo-upload">
          <label>Upload ảnh xe:</label>
          <input type="file" accept="image/*" multiple />
        </div>

        <div className="signature-section">
          <label>Chữ ký điện tử khách hàng:</label>
          <div className="signature-pad">
            <p>Khu vực chữ ký (Canvas)</p>
          </div>
        </div>

        <button className="btn-success">Hoàn tất giao xe</button>
      </div>
    </div>
  );
};

// Component: Xác thực khách hàng
const CustomerVerification = () => {
  return (
    <div className="staff-section">
      <h1>Xác thực khách hàng</h1>
      
      <div className="search-section">
        <input 
          type="text" 
          placeholder="Nhập mã booking hoặc tên khách hàng..." 
          className="search-input" 
        />
        <button className="btn-primary">Tìm kiếm</button>
      </div>

      <div className="verification-card">
        <h2>Thông tin khách hàng</h2>
        <div className="customer-info-grid">
          <div className="info-item">
            <label>Họ tên:</label>
            <p>Nguyễn Văn A</p>
          </div>
          <div className="info-item">
            <label>Số điện thoại:</label>
            <p>0912345678</p>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <p>nguyenvana@email.com</p>
          </div>
          <div className="info-item">
            <label>Ngày sinh:</label>
            <p>15/05/1990</p>
          </div>
        </div>

        <h3>Giấy phép lái xe</h3>
        <div className="document-section">
          <div className="document-image">
            <img src="/placeholder-license.jpg" alt="GPLX" />
          </div>
          <div className="document-info">
            <p><strong>Số GPLX:</strong> 012345678901</p>
            <p><strong>Hạng:</strong> B2</p>
            <p><strong>Ngày cấp:</strong> 10/01/2015</p>
            <p><strong>Ngày hết hạn:</strong> 10/01/2030</p>
          </div>
          <div className="verification-status">
            <button className="btn-success">✓ Xác nhận hợp lệ</button>
            <button className="btn-danger">✗ Từ chối</button>
          </div>
        </div>

        <h3>Căn cước công dân</h3>
        <div className="document-section">
          <div className="document-image">
            <img src="/placeholder-id.jpg" alt="CCCD" />
          </div>
          <div className="document-info">
            <p><strong>Số CCCD:</strong> 001234567890</p>
            <p><strong>Ngày cấp:</strong> 01/01/2020</p>
            <p><strong>Nơi cấp:</strong> Cục Cảnh sát QLHC về TTXH</p>
          </div>
          <div className="verification-status">
            <button className="btn-success">✓ Xác nhận hợp lệ</button>
            <button className="btn-danger">✗ Từ chối</button>
          </div>
        </div>

        <div className="verification-notes">
          <label>Ghi chú xác thực:</label>
          <textarea placeholder="Nhập ghi chú nếu có..."></textarea>
        </div>

        <button className="btn-primary">Hoàn tất xác thực</button>
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

// Component: Quản lý xe tại điểm
const VehicleMaintenance = () => {
  return (
    <div className="staff-section">
      <h1>Quản lý xe tại điểm</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Tổng xe tại điểm</h3>
          <p className="stat-number">35</p>
        </div>
        <div className="stat-card">
          <h3>Xe tốt</h3>
          <p className="stat-number">30</p>
        </div>
        <div className="stat-card">
          <h3>Xe cần bảo trì</h3>
          <p className="stat-number">3</p>
        </div>
        <div className="stat-card">
          <h3>Xe hỏng</h3>
          <p className="stat-number text-danger">2</p>
        </div>
      </div>

      {/* Vehicle Status Table */}
      <div className="vehicle-status-table">
        <h2>Danh sách xe tại điểm</h2>
        <table className="staff-table">
          <thead>
            <tr>
              <th>Biển số</th>
              <th>Loại xe</th>
              <th>Pin (%)</th>
              <th>Tình trạng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>30A-12345</td>
              <td>VinFast VF3</td>
              <td>
                <div className="battery-indicator">
                  <div className="battery-bar" style={{width: '85%'}}></div>
                  <span>85%</span>
                </div>
              </td>
              <td><span className="badge badge-success">Tốt</span></td>
              <td>Khả dụng</td>
              <td>
                <button className="btn-action">Cập nhật</button>
                <button className="btn-action">Báo cáo</button>
              </td>
            </tr>
            <tr>
              <td>51F-67890</td>
              <td>VinFast VF5</td>
              <td>
                <div className="battery-indicator">
                  <div className="battery-bar" style={{width: '25%', backgroundColor: '#ff4444'}}></div>
                  <span>25%</span>
                </div>
              </td>
              <td><span className="badge badge-warning">Cần sạc</span></td>
              <td>Khả dụng</td>
              <td>
                <button className="btn-action">Cập nhật</button>
                <button className="btn-action">Báo cáo</button>
              </td>
            </tr>
            <tr>
              <td>29B-11111</td>
              <td>VinFast VF3</td>
              <td>
                <div className="battery-indicator">
                  <div className="battery-bar" style={{width: '60%'}}></div>
                  <span>60%</span>
                </div>
              </td>
              <td><span className="badge badge-danger">Hỏng</span></td>
              <td>Bảo trì</td>
              <td>
                <button className="btn-action">Cập nhật</button>
                <button className="btn-action">Báo cáo</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Report Issue Form */}
      <div className="issue-report-form">
        <h2>Báo cáo sự cố</h2>
        
        <div className="form-group">
          <label>Chọn xe:</label>
          <select>
            <option value="">-- Chọn xe --</option>
            <option value="1">30A-12345 - VinFast VF3</option>
            <option value="2">51F-67890 - VinFast VF5</option>
          </select>
        </div>

        <div className="form-group">
          <label>Loại sự cố:</label>
          <select>
            <option value="">-- Chọn loại --</option>
            <option value="battery">Pin yếu/hỏng</option>
            <option value="brake">Phanh kém</option>
            <option value="tire">Lốp xe</option>
            <option value="electric">Hệ thống điện</option>
            <option value="body">Ngoại thất</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="form-group">
          <label>Mô tả chi tiết:</label>
          <textarea placeholder="Mô tả sự cố chi tiết..."></textarea>
        </div>

        <div className="form-group">
          <label>Upload ảnh sự cố:</label>
          <input type="file" accept="image/*" multiple />
        </div>

        <div className="form-group">
          <label>Mức độ nghiêm trọng:</label>
          <select>
            <option value="low">Thấp - Không ảnh hưởng sử dụng</option>
            <option value="medium">Trung bình - Cần xử lý sớm</option>
            <option value="high">Cao - Không thể sử dụng</option>
          </select>
        </div>

        <button className="btn-danger">Gửi báo cáo lên Admin</button>
      </div>
    </div>
  );
};

export default StaffDashboard;
