import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('vehicles'); // vehicles, customers, staff, reports
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const parsedUser = JSON.parse(userProfile);
      setUser(parsedUser);
      
      // Kiểm tra quyền admin
      if (parsedUser.role !== 'ADMIN') {
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
    <div className="admin-dashboard">
      <div className="admin-container">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-profile">
            <div className="admin-avatar">{user.fullName.charAt(0)}</div>
            <h3>{user.fullName}</h3>
            <p className="admin-role">Quản trị viên</p>
          </div>

          <nav className="admin-nav">
            <button 
              className={`admin-nav-item ${activeTab === 'vehicles' ? 'active' : ''}`}
              onClick={() => setActiveTab('vehicles')}
            >
              <span className="icon">🚗</span>
              Quản lý đội xe
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <span className="icon">👥</span>
              Quản lý khách hàng
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              <span className="icon">👔</span>
              Quản lý nhân viên
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="icon">📊</span>
              Báo cáo & phân tích
            </button>
            
            {/* Nút đăng xuất */}
            <button 
              className="admin-nav-item logout-btn"
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
        <main className="admin-main">
          {activeTab === 'vehicles' && <VehicleManagement />}
          {activeTab === 'customers' && <CustomerManagement />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'reports' && <ReportsAnalytics />}
        </main>
      </div>
    </div>
  );
};

// Component: Quản lý đội xe
const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');

  useEffect(() => {
    // TODO: Fetch vehicles from API
    // fetch('/api/vehicles').then(res => res.json()).then(setVehicles);
  }, []);

  return (
    <div className="admin-section">
      <h1>Quản lý đội xe & điểm thuê</h1>
      
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Tổng số xe</h3>
          <p className="stat-number">150</p>
        </div>
        <div className="stat-card">
          <h3>Xe đang cho thuê</h3>
          <p className="stat-number">85</p>
        </div>
        <div className="stat-card">
          <h3>Xe khả dụng</h3>
          <p className="stat-number">60</p>
        </div>
        <div className="stat-card">
          <h3>Xe bảo trì</h3>
          <p className="stat-number">5</p>
        </div>
      </div>

      {/* Station Filter */}
      <div className="filter-section">
        <label>Chọn điểm thuê:</label>
        <select 
          value={selectedStation} 
          onChange={(e) => setSelectedStation(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả điểm</option>
          <option value="1">Hà Nội - Hoàn Kiếm</option>
          <option value="2">TP.HCM - Quận 1</option>
          <option value="3">Đà Nẵng - Hải Châu</option>
        </select>
      </div>

      {/* Vehicle Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã xe</th>
              <th>Biển số</th>
              <th>Loại xe</th>
              <th>Điểm thuê</th>
              <th>Pin (%)</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#V001</td>
              <td>30A-12345</td>
              <td>VinFast VF3</td>
              <td>Hà Nội - Hoàn Kiếm</td>
              <td>85%</td>
              <td><span className="badge badge-success">Khả dụng</span></td>
              <td>
                <button className="btn-action">Chi tiết</button>
              </td>
            </tr>
            <tr>
              <td>#V002</td>
              <td>51F-67890</td>
              <td>VinFast VF5</td>
              <td>TP.HCM - Quận 1</td>
              <td>45%</td>
              <td><span className="badge badge-warning">Đang thuê</span></td>
              <td>
                <button className="btn-action">Chi tiết</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component: Quản lý khách hàng
const CustomerManagement = () => {
  return (
    <div className="admin-section">
      <h1>Quản lý khách hàng</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Tổng khách hàng</h3>
          <p className="stat-number">1,250</p>
        </div>
        <div className="stat-card">
          <h3>Khách hàng mới (tháng)</h3>
          <p className="stat-number">85</p>
        </div>
        <div className="stat-card">
          <h3>Khách hàng rủi ro</h3>
          <p className="stat-number text-danger">12</p>
        </div>
        <div className="stat-card">
          <h3>Khiếu nại chờ xử lý</h3>
          <p className="stat-number">5</p>
        </div>
      </div>

      <div className="search-section">
        <input type="text" placeholder="Tìm kiếm khách hàng..." className="search-input" />
        <button className="btn-primary">Tìm kiếm</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Lượt thuê</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#C001</td>
              <td>Nguyễn Văn A</td>
              <td>nguyenvana@email.com</td>
              <td>0912345678</td>
              <td>15</td>
              <td><span className="badge badge-success">Tốt</span></td>
              <td>
                <button className="btn-action">Xem hồ sơ</button>
              </td>
            </tr>
            <tr>
              <td>#C002</td>
              <td>Trần Thị B</td>
              <td>tranthib@email.com</td>
              <td>0987654321</td>
              <td>8</td>
              <td><span className="badge badge-danger">Rủi ro</span></td>
              <td>
                <button className="btn-action">Xem hồ sơ</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component: Quản lý nhân viên
const StaffManagement = () => {
  const [users, setUsers] = React.useState([]);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    birthDate: ''
  });

  // Fetch danh sách users
  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/users/admin/all-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/users/admin/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Tạo tài khoản Staff thành công!');
        setShowCreateForm(false);
        setFormData({
          fullName: '',
          username: '',
          email: '',
          password: '',
          phoneNumber: '',
          birthDate: ''
        });
        fetchUsers();
      } else {
        const error = await response.json();
        alert('Lỗi: ' + (error.message || 'Không thể tạo tài khoản'));
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      alert('Có lỗi xảy ra khi tạo tài khoản');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = prompt(
      `Chọn role mới cho user (hiện tại: ${currentRole}):\n- ADMIN\n- STAFF\n- RENTER`,
      currentRole
    );
    
    if (!newRole || newRole === currentRole) return;
    
    if (!['ADMIN', 'STAFF', 'RENTER'].includes(newRole.toUpperCase())) {
      alert('Role không hợp lệ!');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/admin/update-role/${userId}?role=${newRole.toUpperCase()}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Cập nhật role thành công!');
        fetchUsers();
      } else {
        alert('Lỗi: Không thể cập nhật role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="admin-section">
      <h1>Quản lý nhân viên & phân quyền</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Tổng users</h3>
          <p className="stat-number">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Admin</h3>
          <p className="stat-number">{users.filter(u => u.role === 'ADMIN').length}</p>
        </div>
        <div className="stat-card">
          <h3>Staff</h3>
          <p className="stat-number">{users.filter(u => u.role === 'STAFF').length}</p>
        </div>
        <div className="stat-card">
          <h3>Renter</h3>
          <p className="stat-number">{users.filter(u => u.role === 'RENTER').length}</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="btn-success"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✗ Đóng form' : '+ Tạo tài khoản Staff mới'}
        </button>
      </div>

      {/* Form tạo Staff */}
      {showCreateForm && (
        <div className="admin-form">
          <h2>Tạo tài khoản Staff</h2>
          <form onSubmit={handleCreateStaff}>
            <div className="form-grid">
              <div className="form-group">
                <label>Họ tên *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>
              Tạo tài khoản Staff
            </button>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Username</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>{user.fullName}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber || 'N/A'}</td>
                <td>
                  <span className={`badge ${
                    user.role === 'ADMIN' ? 'badge-danger' :
                    user.role === 'STAFF' ? 'badge-info' :
                    'badge-success'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    user.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-action"
                    onClick={() => handleChangeRole(user.id, user.role)}
                  >
                    Đổi role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component: Báo cáo & phân tích
const ReportsAnalytics = () => {
  return (
    <div className="admin-section">
      <h1>Báo cáo & phân tích</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Doanh thu tháng này</h3>
          <p className="stat-number">850,000,000đ</p>
          <p className="stat-change positive">+15% so với tháng trước</p>
        </div>
        <div className="stat-card">
          <h3>Tỷ lệ sử dụng xe</h3>
          <p className="stat-number">78%</p>
        </div>
        <div className="stat-card">
          <h3>Giờ cao điểm</h3>
          <p className="stat-number">7-9h, 17-19h</p>
        </div>
        <div className="stat-card">
          <h3>Điểm thuê hiệu quả nhất</h3>
          <p className="stat-number">Hà Nội - Hoàn Kiếm</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="chart-section">
        <h2>Doanh thu theo điểm thuê</h2>
        <div className="chart-placeholder">
          <p>📊 Biểu đồ sẽ được hiển thị ở đây</p>
          <p>(Sử dụng thư viện Chart.js hoặc Recharts)</p>
        </div>
      </div>

      <div className="chart-section">
        <h2>Tỷ lệ sử dụng xe theo giờ</h2>
        <div className="chart-placeholder">
          <p>📈 Biểu đồ đường sẽ được hiển thị ở đây</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
