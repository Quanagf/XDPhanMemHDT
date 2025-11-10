import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
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
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3C15 2.45 14.55 2 14 2H10C9.45 2 9 2.45 9 3V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM11 4H13V5H11V4ZM6.5 9.5C7.33 9.5 8 8.83 8 8S7.33 6.5 6.5 6.5 5 7.17 5 8 5.67 9.5 6.5 9.5ZM17.5 9.5C18.33 9.5 19 8.83 19 8S18.33 6.5 17.5 6.5 16 7.17 16 8 16.67 9.5 17.5 9.5Z"/>
                </svg>
              </span>
              Quản lý đội xe
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,14C18.67,14 24,15.33 24,18V20H8V18C8,15.33 13.33,14 16,14M8.5,14L7,12.5C6.5,11.77 6.5,10.77 7.25,10.25L10.5,7.5L11.5,8.5C11.16,9.34 11,10.26 11,11.25L8.5,14M7.5,12L6,10.5L1.75,14.75L3.25,16.25L7.5,12Z"/>
                </svg>
              </span>
              Quản lý khách hàng
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
              </span>
              Quản lý nhân viên
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'stations' ? 'active' : ''}`}
              onClick={() => setActiveTab('stations')}
            >
              <span className="icon">📍</span>
              Quản lý trạm
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2,2H4V20H22V22H2V2M7,10H17V13H7V10M9,16H15V19H9V16M6,7H18V9H6V7Z"/>
                </svg>
              </span>
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
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                </svg>
              </span>
              Đăng xuất
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {activeTab === 'vehicles' && <VehicleManagement />}
          {activeTab === 'customers' && <CustomerManagement />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'stations' && <StationManagement />}
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

const StationManagement = () => {
  const [stations, setStations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    province: '',
    city: '',
    capacity: 0,
    status: 'OPEN'
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      if (response.ok) {
        const data = await response.json();
        setStations(data);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    const url = editingStation 
      ? `/api/stations/${editingStation.id}`
      : '/api/stations';
    const method = editingStation ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingStation ? 'Cập nhật trạm thành công!' : 'Tạo trạm mới thành công!');
        fetchStations();
        resetForm();
      } else {
        const error = await response.json();
        alert('Lỗi: ' + (error.error || 'Không thể lưu trạm'));
      }
    } catch (error) {
      console.error('Error saving station:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      address: station.address,
      phoneNumber: station.phoneNumber,
      province: station.province,
      city: station.city || '',
      capacity: station.capacity || 0,
      status: station.status || 'OPEN'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn vô hiệu hóa trạm này?')) return;

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`/api/stations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Đã vô hiệu hóa trạm thành công!');
        fetchStations();
      } else {
        alert('Lỗi: Không thể xóa trạm');
      }
    } catch (error) {
      console.error('Error deleting station:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phoneNumber: '',
      province: '',
      city: '',
      capacity: 0,
      status: 'OPEN'
    });
    setEditingStation(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Quản lý trạm thuê xe</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#00D084',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {showForm ? '❌ Đóng' : '➕ Thêm trạm mới'}
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <h3>Tổng số trạm</h3>
          <p className="stat-number">{stations.length}</p>
        </div>
        <div className="stat-card">
          <h3>Đang hoạt động</h3>
          <p className="stat-number">{stations.filter(s => s.status === 'OPEN').length}</p>
        </div>
        <div className="stat-card">
          <h3>Số tỉnh/thành</h3>
          <p className="stat-number">{new Set(stations.map(s => s.province)).size}</p>
        </div>
        <div className="stat-card">
          <h3>Tổng sức chứa</h3>
          <p className="stat-number">{stations.reduce((sum, s) => sum + (s.capacity || 0), 0)} xe</p>
        </div>
      </div>

      {/* Form thêm/sửa trạm */}
      {showForm && (
        <div className="form-container" style={{
          backgroundColor: '#f9f9f9',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <h2>{editingStation ? 'Chỉnh sửa trạm' : 'Thêm trạm mới'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Tên trạm *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: Trạm Quận 1"
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: 028 3822 3456"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Địa chỉ *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: 123 Đường Nguyễn Huệ, Phường Bến Nghé"
                />
              </div>

              <div className="form-group">
                <label>Tỉnh/Thành phố *</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: TP. Hồ Chí Minh"
                />
              </div>

              <div className="form-group">
                <label>Quận/Huyện</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="VD: Quận 1"
                />
              </div>

              <div className="form-group">
                <label>Sức chứa xe *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="VD: 50"
                />
              </div>

              <div className="form-group">
                <label>Trạng thái *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="OPEN">Đang hoạt động</option>
                  <option value="CLOSED">Đóng cửa</option>
                  <option value="TEMPORARILY_UNAVAILABLE">Tạm ngừng</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                type="submit" 
                className="btn-primary"
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#00D084',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {editingStation ? '💾 Cập nhật' : '➕ Tạo mới'}
              </button>
              <button 
                type="button"
                onClick={resetForm}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách trạm */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên trạm</th>
              <th>Địa chỉ</th>
              <th>Điện thoại</th>
              <th>Tỉnh/TP</th>
              <th>Sức chứa</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr key={station.id}>
                <td style={{ fontWeight: '600' }}>{station.name}</td>
                <td>{station.address}</td>
                <td>{station.phoneNumber}</td>
                <td>{station.province}</td>
                <td>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2'
                  }}>
                    🚗 {station.capacity || 0} xe
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: station.status === 'OPEN' ? '#d4edda' : station.status === 'CLOSED' ? '#f8d7da' : '#fff3cd',
                    color: station.status === 'OPEN' ? '#155724' : station.status === 'CLOSED' ? '#721c24' : '#856404'
                  }}>
                    {station.status === 'OPEN' ? '✅ Hoạt động' : station.status === 'CLOSED' ? '❌ Đóng cửa' : '⚠️ Tạm ngừng'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleEdit(station)}
                    className="btn-edit"
                    style={{
                      marginRight: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(station.id)}
                    className="btn-delete"
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Xóa
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
