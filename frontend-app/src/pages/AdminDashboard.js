import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('vehicles'); // vehicles, stations, customers, staff, reports
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
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!user) return <div>Loading...</div>;

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
            {['vehicles', 'stations', 'customers', 'staff', 'reports'].map(tab => (
              <button
                key={tab}
                className={`admin-nav-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="icon">{/* SVG icon */}</span>
                {tab === 'vehicles' && 'Quản lý đội xe'}
                {tab === 'stations' && 'Quản lý trạm'}
                {tab === 'customers' && 'Quản lý khách hàng'}
                {tab === 'staff' && 'Quản lý nhân viên'}
                {tab === 'reports' && 'Báo cáo & phân tích'}
              </button>
            ))}

            <button
              className="admin-nav-item logout-btn"
              onClick={handleLogout}
              style={{ marginTop: 'auto', color: '#dc3545', borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="icon">{/* SVG icon */}</span>
              Đăng xuất
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {activeTab === 'vehicles' && <VehicleManagement />}
          {activeTab === 'stations' && <StationManagement />}
          {activeTab === 'customers' && <CustomerManagement />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'reports' && <ReportsAnalytics />}
        </main>
      </div>
    </div>
  );
};

// ===================== Component VehicleManagement =====================
const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');

  useEffect(() => {
    setVehicles([
      { id: 1, code: '#V001', plate: '30A-12345', type: 'VinFast VF3', station: 'Hà Nội - Hoàn Kiếm', battery: 85, status: 'Khả dụng' },
      { id: 2, code: '#V002', plate: '51F-67890', type: 'VinFast VF5', station: 'TP.HCM - Quận 1', battery: 45, status: 'Đang thuê' },
    ]);
  }, []);

  return (
    <div className="admin-section">
      <h1>Quản lý đội xe</h1>
      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card"><h3>Tổng số xe</h3><p className="stat-number">{vehicles.length}</p></div>
        <div className="stat-card"><h3>Xe khả dụng</h3><p className="stat-number">{vehicles.filter(v => v.status === 'Khả dụng').length}</p></div>
        <div className="stat-card"><h3>Xe đang thuê</h3><p className="stat-number">{vehicles.filter(v => v.status === 'Đang thuê').length}</p></div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <label>Chọn điểm thuê:</label>
        <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} className="filter-select">
          <option value="all">Tất cả điểm</option>
          <option value="Hà Nội - Hoàn Kiếm">Hà Nội - Hoàn Kiếm</option>
          <option value="TP.HCM - Quận 1">TP.HCM - Quận 1</option>
          <option value="Đà Nẵng - Hải Châu">Đà Nẵng - Hải Châu</option>
        </select>
      </div>

      {/* Table */}
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
            {vehicles.map(v => (
              <tr key={v.id}>
                <td>{v.code}</td>
                <td>{v.plate}</td>
                <td>{v.type}</td>
                <td>{v.station}</td>
                <td>{v.battery}%</td>
                <td><span className={`badge ${v.status === 'Khả dụng' ? 'badge-success' : 'badge-warning'}`}>{v.status}</span></td>
                <td><button className="btn-action">Chi tiết</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== Component StationManagement =====================
const StationManagement = () => {
  const [stations, setStations] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', capacity: 0 });

  const [stats, setStats] = useState({
    totalStations: 0,
    activeStations: 0,
    inactiveStations: 0,
    totalCapacity: 0,
    stationsByProvince: {}
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      setStatsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/stations/statistics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setStats({ totalStations: 3, activeStations: 1, inactiveStations: 1, totalCapacity: 120, stationsByProvince: { "Hà Nội": 1, "TP.HCM": 1, "Đà Nẵng": 1 } });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setStats({ totalStations: 3, activeStations: 1, inactiveStations: 1, totalCapacity: 120, stationsByProvince: { "Hà Nội": 1, "TP.HCM": 1, "Đà Nẵng": 1 } });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStatistics();
  }, []);

  useEffect(() => {
    // Dữ liệu giả để demo
    setStations([
      { id: 1, name: 'Hà Nội - Hoàn Kiếm', address: '1 Đinh Tiên Hoàng', capacity: 50, currentVehicles: 30, status: 'ACTIVE' },
      { id: 2, name: 'TP.HCM - Quận 1', address: '20 Nguyễn Huệ', capacity: 40, currentVehicles: 40, status: 'FULL' },
      { id: 3, name: 'Đà Nẵng - Hải Châu', address: '1 Bạch Đằng', capacity: 30, currentVehicles: 10, status: 'MAINTENANCE' },
    ]);
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newStation = await response.json();
        setStations(prev => [...prev, newStation]);
        setShowCreateForm(false);
        setFormData({ name: '', address: '', capacity: 0 });
        alert('Tạo trạm thành công!');
      } else {
        const err = await response.text();
        alert('Tạo trạm thất bại: ' + err);
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi tạo trạm.');
    }
  };

  return (
    <div className="admin-section">
      <h1>Quản lý trạm</h1>

      {/* Thống kê */}
      {statsLoading ? <p>Đang tải số liệu thống kê...</p> : (
        <div className="stats-grid">
          <div className="stat-card"><h3>Tổng số trạm</h3><p className="stat-number">{stats.totalStations}</p></div>
          <div className="stat-card"><h3>Trạm hoạt động</h3><p className="stat-number">{stats.activeStations}</p></div>
          <div className="stat-card"><h3>Trạm không hoạt động</h3><p className="stat-number">{stats.inactiveStations}</p></div>
          <div className="stat-card"><h3>Sức chứa</h3><p className="stat-number">{stats.totalCapacity}</p></div>
        </div>
      )}

      {/* Form tạo trạm mới */}
      <button onClick={() => setShowCreateForm(prev => !prev)} className="btn-primary">
        {showCreateForm ? 'Hủy' : 'Tạo trạm mới'}
      </button>

      {showCreateForm && (
        <form className="create-form" onSubmit={handleCreateStation}>
          <input type="text" name="name" value={formData.name} placeholder="Tên trạm" onChange={handleFormChange} required />
          <input type="text" name="address" value={formData.address} placeholder="Địa chỉ" onChange={handleFormChange} required />
          <input type="number" name="capacity" value={formData.capacity} placeholder="Công suất" onChange={handleFormChange} required />
          <button type="submit" className="btn-success">Tạo</button>
        </form>
      )}

      {/* Bảng trạm */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên trạm</th>
              <th>Địa chỉ</th>
              <th></th>
              <th>Xe hiện có</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {stations.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.address}</td>
                <td>{s.capacity}</td>
                <td>{s.currentVehicles}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Các component còn lại để import
const CustomerManagement = () => <div>Quản lý khách hàng</div>;
const StaffManagement = () => <div>Quản lý nhân viên</div>;
const ReportsAnalytics = () => <div>Báo cáo & phân tích</div>;

export default AdminDashboard;
