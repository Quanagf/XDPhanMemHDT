import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/admin.css';
import '../styles/pages/complaints-modern.css';
import '../styles/components/verification.css';
import '../styles/components/handover.css';
import '../styles/components/form.css';
import vehicleService from '../utils/vehicleService';
import vehicleAPI, { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicleAPI';
import { getAllComplaints, assignComplaint, resolveComplaint, closeComplaint, getComplaintStatistics, staffCompleteComplaint, adminApproveComplaint, adminRejectComplaint } from '../api/complaints';
import { getAllCustomers, getAllUsers } from '../api/customers';
import { getStations } from '../api/stations';
import { getAllBookings, getUserBookingHistory } from '../api/bookings'; // Admin booking history
import IncidentReportsManagement from '../components/IncidentReportsManagement';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getVehicleUtilizationStats, getRevenueByQuarter, getRevenueByYear, getPeakHoursAnalysis, getRevenueByStation } from '../api/reports';

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
                  <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
                </svg>
              </span>
              Quản lý khách hàng
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
              onClick={() => setActiveTab('complaints')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M13,14H11V12H13M13,10H11V6H13"/>
                </svg>
              </span>
              Quản lý khiếu nại
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
              className={`admin-nav-item ${activeTab === 'incidents' ? 'active' : ''}`}
              onClick={() => setActiveTab('incidents')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                </svg>
              </span>
              Báo cáo sự cố
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'stations' ? 'active' : ''}`}
              onClick={() => setActiveTab('stations')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                </svg>
              </span>
              Quản lý trạm
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M16.5,16L11,13.5L5.5,16V5H16.5V16Z"/>
                </svg>
              </span>
              Lịch sử thuê xe
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17M19.5,19.1H4.5V5H6.5V17.1H19.5V19.1Z"/>
                </svg>
              </span>
              Báo cáo & phân tích
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L12,15H9V10H13V12L11,16H14V19H10Z"/>
                </svg>
              </span>
              Xác thực tài liệu
            </button>
          </nav>
          {/* Nút đăng xuất ở góc dưới - cố định */}
          <div className="admin-sidebar-footer">
            <button 
              className="admin-nav-item logout-btn"
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
        <main className="admin-main">
          {activeTab === 'vehicles' && <VehicleManagement />}
          {activeTab === 'customers' && <CustomerManagement />}
          {activeTab === 'complaints' && <ComplaintsManagement />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'incidents' && <IncidentReportsManagement />}
          {activeTab === 'stations' && <StationManagement />}
          {activeTab === 'bookings' && <BookingHistory />}
          {activeTab === 'reports' && <ReportsAnalytics />}
          {activeTab === 'documents' && <DocumentVerification />}
        </main>
      </div>
    </div>
  );
};

// Component: Quản lý đội xe
const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [editing, setEditing] = useState(null);
  const [expandedVehicle, setExpandedVehicle] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' hoặc 'statistics'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter state
  const [filterStation, setFilterStation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({
    licensePlate: '',
    type: '',
    batteryLevel: 100,
    pricePerHour: 0,
    status: 'AVAILABLE',
    imageUrl: '',
    description: '',
    lastMaintenanceDate: '',
    stationId: '',
    // Thông số kỹ thuật bổ sung
    seats: '',
    batteryCapacity: '',
    range: '',
    chargingType: '',
    chargingSpeed: '',
    location: '',
    tripCount: ''
  });
  const [fileToUpload, setFileToUpload] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, pageSize, filterStation, searchTerm]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchStations = async () => {
    try {
      const res = await fetch('/api/stations', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setStations(data || []);
      }
    } catch (err) {
      console.error('fetchStations', err);
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {
        page: currentPage,
        size: pageSize
      };
      
      if (filterStation) {
        params.stationId = filterStation;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await vehicleAPI.getVehicles(params);
      
      if (response.content) {
        setVehicles(response.content);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } else {
        setVehicles(response || []);
        setTotalPages(1);
        setTotalElements(response.length || 0);
      }
    } catch (err) {
      console.error('fetchVehicles', err);
      // Fallback to old fetch if vehicleAPI fails
      try {
        const res = await fetch('/api/vehicles', { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          setVehicles(data || []);
          setTotalPages(1);
          setTotalElements(data.length || 0);
        }
      } catch (fallbackErr) {
        console.error('fetchVehicles fallback', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-fill địa chỉ khi chọn stationId
    if (name === 'stationId') {
      const selectedStation = stations.find(station => station.id === Number(value));
      setForm(prev => ({ 
        ...prev, 
        [name]: value,
        location: selectedStation ? `${selectedStation.address}, ${selectedStation.province}` : ''
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page
  };

  // Filter handlers
  const handleFilterStation = (stationId) => {
    setFilterStation(stationId);
    setCurrentPage(0); // Reset to first page
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(0); // Reset to first page
  };

  const clearFilters = () => {
    setFilterStation('');
    setSearchTerm('');
    setCurrentPage(0);
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    
    // Validate license plate format
    if (!form.licensePlate || form.licensePlate.trim() === '') {
      alert('Vui lòng nhập biển số xe.');
      return;
    }
    
    // Check for duplicate license plate in current vehicles list (client-side check)
    if (!editing) {
      const duplicateVehicle = vehicles.find(v => 
        v.licensePlate && v.licensePlate.toUpperCase() === form.licensePlate.toUpperCase()
      );
      if (duplicateVehicle) {
        alert(`Biển số xe "${form.licensePlate}" đã tồn tại trong hệ thống. Vui lòng sử dụng biển số khác.`);
        return;
      }
    }
    
    try {
      const payload = {
        licensePlate: form.licensePlate,
        type: form.type,
        batteryLevel: Number(form.batteryLevel) || 0,
        pricePerHour: Number(form.pricePerHour) || 0,
        status: form.status,
        description: form.description,
        lastMaintenanceDate: form.lastMaintenanceDate || null,
        stationId: Number(form.stationId),
        // Thông số kỹ thuật
        seats: Number(form.seats) || null,
        batteryCapacity: Number(form.batteryCapacity) || null,
        range: Number(form.range) || null,
        chargingType: form.chargingType || null,
        chargingSpeed: form.chargingSpeed || null,
        location: form.location || null,
        tripCount: Number(form.tripCount) || null
      };

      if (editing) {
        await vehicleAPI.updateVehicle(editing.id, payload);
        // upload image if any
        if (fileToUpload) {
          const fd = new FormData();
          fd.append('file', fileToUpload);
          const token = localStorage.getItem('authToken');
          const res = await fetch(`/api/vehicles/${editing.id}/image`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: fd
          });
          if (!res.ok) throw new Error('Upload failed');
        }
        alert('Cập nhật thành công');
        setEditing(null);
      } else {
        const created = await vehicleAPI.createVehicle(payload);
        // upload file if selected
        if (fileToUpload && created && created.id) {
          const fd = new FormData();
          fd.append('file', fileToUpload);
          const token = localStorage.getItem('authToken');
          const res = await fetch(`/api/vehicles/${created.id}/image`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: fd
          });
          if (!res.ok) throw new Error('Upload failed');
        }
        alert('Tạo xe thành công');
      }
      
      // Reset form
      setForm({ 
        licensePlate: '', type: '', batteryLevel: 100, pricePerHour: 0,
        status: 'AVAILABLE', imageUrl: '', description: '', lastMaintenanceDate: '', stationId: '',
        seats: '', batteryCapacity: '', range: '', chargingType: '', chargingSpeed: '',
        location: '', tripCount: ''
      });
      setFileToUpload(null);
      fetchVehicles();
    } catch (err) {
      console.error('handleAddOrUpdate', err);
      
      // Parse error message for user-friendly display
      let userMessage = 'Lỗi khi lưu xe: ';
      if (err.message) {
        if (err.message.includes('Biển số xe') && err.message.includes('đã tồn tại')) {
          userMessage = err.message; // Use the exact message from backend
        } else if (err.message.includes('Duplicate entry') || err.message.includes('duplicate')) {
          userMessage = `Biển số xe "${form.licensePlate}" đã tồn tại trong hệ thống. Vui lòng sử dụng biển số khác.`;
        } else if (err.message.includes('HTTP 400')) {
          userMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        } else if (err.message.includes('HTTP 403')) {
          userMessage = 'Bạn không có quyền thực hiện thao tác này.';
        } else if (err.message.includes('HTTP 404')) {
          userMessage = 'Không tìm thấy trạm xe. Vui lòng chọn trạm khác.';
        } else {
          userMessage += err.message;
        }
      } else {
        userMessage += 'Vui lòng thử lại.';
      }
      
      alert(userMessage);
    }
  };

  const handleEdit = (v) => {
    setEditing(v);
    setForm({
      licensePlate: v.licensePlate || '',
      type: v.type || '',
      batteryLevel: v.batteryLevel || 0,
      pricePerHour: v.pricePerHour || 0,
      status: v.status || 'AVAILABLE',
      imageUrl: v.imageUrl || '',
      description: v.description || '',
      lastMaintenanceDate: v.lastMaintenanceDate || '',
      stationId: v.station ? v.station.id : '',
      // Thông số kỹ thuật
      seats: v.seats || '',
      batteryCapacity: v.batteryCapacity || '',
      range: v.range || '',
      chargingType: v.chargingType || '',
      chargingSpeed: v.chargingSpeed || '',
      location: v.location || '',
      tripCount: v.tripCount || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa xe này không?')) return;
    try {
      await vehicleAPI.deleteVehicle(id);
      fetchVehicles();
    } catch (err) {
      console.error('handleDelete', err);
      alert('Không thể xóa xe');
    }
  };

  return (
    <div className="staff-section">
      <div className="section-header">
        <h1>Quản lý xe tại điểm</h1>
        <div className="view-mode-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <i className="fas fa-list"></i> Danh sách
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'statistics' ? 'active' : ''}`}
            onClick={() => setViewMode('statistics')}
          >
            <i className="fas fa-chart-bar"></i> Thống kê
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
      {/* Filter và Search */}
      <div className="vehicles-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Lọc theo trạm:</label>
            <select 
              value={filterStation} 
              onChange={(e) => handleFilterStation(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả trạm</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name} - {station.address}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Tìm kiếm:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm theo biển số hoặc loại xe..."
              className="filter-search"
            />
          </div>
          
          <div className="filter-group">
            <label>Hiển thị:</label>
            <select 
              value={pageSize} 
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="page-size-select"
            >
              <option value={10}>10 xe/trang</option>
              <option value={20}>20 xe/trang</option>
              <option value={50}>50 xe/trang</option>
            </select>
          </div>
          
          <button onClick={clearFilters} className="clear-filters-btn">
            Xóa bộ lọc
          </button>
        </div>
        
        <div className="filter-info">
          <span>Hiển thị {vehicles.length} / {totalElements} xe</span>
        </div>
      </div>

      <div className="vehicle-status-table">
        <h2>Danh sách xe tại điểm</h2>
        {loading ? <p>Đang tải...</p> : (
        <table className="staff-table">
          <thead>
            <tr>
              <th>Chi tiết</th>
              <th>Biển số</th>
              <th>Loại</th>
              <th>Pin (%)</th>
              <th>Trạng thái</th>
              <th>Giá/giờ</th>
              <th>Thao tác</th>
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
                  <td>{v.type}</td>
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
                                <span className="label">Trạm:</span>
                                <span className="value">{v.station ? `${v.station.name} - ${v.station.province}` : 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Vị trí hiện tại:</span>
                                <span className="value">{v.location || (v.station ? `${v.station.address}, ${v.station.province}` : 'N/A')}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Ngày bảo trì cuối:</span>
                                <span className="value">{
                                  v.lastMaintenanceDate ? 
                                    new Date(v.lastMaintenanceDate).toLocaleDateString('vi-VN', {
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="vehicles-pagination">
            <div className="pagination-info">
              <span>Trang {currentPage + 1} / {totalPages}</span>
            </div>
            
            <div className="pagination-controls">
              <button 
                onClick={() => handlePageChange(0)} 
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                Đầu
              </button>
              
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                Trước
              </button>
              
              <span className="pagination-current">
                {currentPage + 1} / {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage >= totalPages - 1}
                className="pagination-btn"
              >
                Sau
              </button>
              
              <button 
                onClick={() => handlePageChange(totalPages - 1)} 
                disabled={currentPage >= totalPages - 1}
                className="pagination-btn"
              >
                Cuối
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="issue-report-form">
        <h2>{editing ? 'Cập nhật xe' : 'Thêm xe mới'}</h2>
        <form onSubmit={handleAddOrUpdate}>
          <div className="form-group">
            <label>Biển số xe</label>
            <input 
              name="licensePlate" 
              value={form.licensePlate} 
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
              placeholder="Ví dụ: VINFAST VF3 - Màu trắng"
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
                  setFileToUpload(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setForm(prev => ({
                      ...prev,
                      imageUrl: ev.target.result
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
              {form.imageUrl && (
                <div className="image-preview photo-item" style={{ marginTop: '10px', maxWidth: 200 }}>
                  <img
                    src={form.imageUrl}
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
                      setForm(prev => ({ ...prev, imageUrl: '' }));
                      setFileToUpload(null);
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
              name="batteryCapacity" 
              type="number" 
              step="0.1" 
              value={form.batteryCapacity} 
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
            <select name="chargingType" value={form.chargingType} onChange={handleChange}>
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
              name="chargingSpeed" 
              value={form.chargingSpeed} 
              onChange={handleChange} 
              placeholder="Ví dụ: 10 - 70% trong ~25 mins"
            />
          </div>
          
          <div className="form-group">
            <label>Số chuyến đã thực hiện</label>
            <input 
              name="tripCount" 
              type="number" 
              min="0" 
              value={form.tripCount} 
              onChange={handleChange} 
              placeholder="Ví dụ: 19"
            />
          </div>
          
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
              required
            />
          </div>
          
          <h3 style={{ margin: '2rem 0 1rem 0', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            Thông tin quản lý
          </h3>
          
          <div className="form-group">
            <label>Ngày bảo trì cuối</label>
            <input 
              name="lastMaintenanceDate" 
              type="date" 
              value={form.lastMaintenanceDate} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>Giá thuê mỗi giờ (VND)</label>
            <input 
              name="pricePerHour" 
              type="number" 
              value={form.pricePerHour} 
              onChange={handleChange} 
              placeholder="Ví dụ: 50000"
              required
            />
          </div>
          <div className="form-group">
            <label>Trạm</label>
            <select
              name="stationId" 
              value={form.stationId} 
              onChange={handleChange}
              required
            >
              <option value="">Chọn trạm</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name} - {station.province}
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
              placeholder="Địa chỉ sẽ tự động điền khi chọn trạm"
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
              <button type="button" className="btn-danger" onClick={() => { 
                setEditing(null); 
                setFileToUpload(null);
                setForm({ 
                  licensePlate: '', type: '', batteryLevel: 100, pricePerHour: 0,
                  status: 'AVAILABLE', imageUrl: '', description: '', lastMaintenanceDate: '', stationId: '',
                  seats: '', batteryCapacity: '', range: '', chargingType: '', chargingSpeed: '',
                  location: '', tripCount: ''
                }); 
              }} style={{marginLeft: '8px'}}>Hủy</button>
            </>
          ) : (
            <button className="btn-success" type="submit">Thêm xe</button>
          )}
        </form>
      </div>
        </>
      ) : (
        <VehicleStatistics vehicles={vehicles} stations={stations} />
      )}
    </div>
  );
};

// Component: Thống kê đội xe
const VehicleStatistics = ({ vehicles, stations }) => {
  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#FFC107'];

  // Thống kê tổng quan
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const inUseVehicles = vehicles.filter(v => v.status === 'IN_USE').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'MAINTENANCE' || v.status === 'CHARGING').length;
  
  // Tính tỷ lệ sử dụng
  const utilizationRate = totalVehicles > 0 ? ((inUseVehicles / totalVehicles) * 100).toFixed(1) : 0;
  
  // Tổng giá trị xe (giả sử mỗi xe có giá)
  const totalValue = vehicles.reduce((sum, v) => sum + (Number(v.pricePerHour) || 0), 0);

  // Thống kê theo trạng thái
  const statusData = [
    { name: 'Sẵn sàng', value: availableVehicles, color: '#4CAF50' },
    { name: 'Đang sử dụng', value: inUseVehicles, color: '#2196F3' },
    { name: 'Bảo trì/Sạc', value: maintenanceVehicles, color: '#FF9800' }
  ].filter(item => item.value > 0);

  // Thống kê theo loại xe
  const typeStats = {};
  vehicles.forEach(v => {
    if (v.type) {
      typeStats[v.type] = (typeStats[v.type] || 0) + 1;
    }
  });
  const typeData = Object.entries(typeStats).map(([type, count]) => ({
    type,
    count
  }));

  // Thống kê theo trạm
  const stationStats = {};
  vehicles.forEach(v => {
    if (v.stationId) {
      const station = stations.find(s => s.id === v.stationId);
      const stationName = station ? station.name : `Trạm ${v.stationId}`;
      stationStats[stationName] = (stationStats[stationName] || 0) + 1;
    }
  });
  const stationData = Object.entries(stationStats)
    .map(([station, count]) => ({ station, count }))
    .sort((a, b) => b.count - a.count);

  // Thống kê mức pin
  const batteryRanges = {
    'Cao (80-100%)': 0,
    'Trung bình (50-79%)': 0,
    'Thấp (20-49%)': 0,
    'Rất thấp (<20%)': 0
  };
  vehicles.forEach(v => {
    const battery = v.batteryLevel || 0;
    if (battery >= 80) batteryRanges['Cao (80-100%)']++;
    else if (battery >= 50) batteryRanges['Trung bình (50-79%)']++;
    else if (battery >= 20) batteryRanges['Thấp (20-49%)']++;
    else batteryRanges['Rất thấp (<20%)']++;
  });
  const batteryData = Object.entries(batteryRanges)
    .map(([range, count]) => ({ range, count }))
    .filter(item => item.count > 0);

  return (
    <div className="vehicle-statistics">
      {/* Thống kê tổng quan */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-car"></i></div>
          <div className="stat-info">
            <h3>{totalVehicles}</h3>
            <p>Tổng số xe</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info">
            <h3>{availableVehicles}</h3>
            <p>Xe sẵn sàng</p>
          </div>
        </div>

        <div className="stat-card primary">
          <div className="stat-icon"><i className="fas fa-sync-alt"></i></div>
          <div className="stat-info">
            <h3>{inUseVehicles}</h3>
            <p>Xe đang sử dụng</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon"><i className="fas fa-tools"></i></div>
          <div className="stat-info">
            <h3>{maintenanceVehicles}</h3>
            <p>Bảo trì/Sạc</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
          <div className="stat-info">
            <h3>{utilizationRate}%</h3>
            <p>Tỷ lệ sử dụng</p>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon"><i className="fas fa-dollar-sign"></i></div>
          <div className="stat-info">
            <h3>{totalValue.toLocaleString('vi-VN')}</h3>
            <p>Tổng giá/giờ (VNĐ)</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="charts-grid">
        {/* Biểu đồ trạng thái */}
        {statusData.length > 0 && (
          <div className="chart-card">
            <h3><i className="fas fa-chart-pie"></i> Phân bố theo trạng thái</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Biểu đồ loại xe */}
        {typeData.length > 0 && (
          <div className="chart-card">
            <h3><i className="fas fa-car-side"></i> Phân bố theo loại xe</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4CAF50" name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Biểu đồ trạm */}
        {stationData.length > 0 && (
          <div className="chart-card">
            <h3><i className="fas fa-map-marker-alt"></i> Phân bố theo trạm</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="station" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  style={{fontSize: '12px'}}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2196F3" name="Số xe" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Biểu đồ mức pin */}
        {batteryData.length > 0 && (
          <div className="chart-card">
            <h3><i className="fas fa-battery-half"></i> Phân bố mức pin</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={batteryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF9800" name="Số xe" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// Component: Quản lý khách hàng
const CustomerManagement = () => {
  const [customers, setCustomers] = React.useState([]);
  const [walkInCustomers, setWalkInCustomers] = React.useState([]);
  const [statistics, setStatistics] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [activeCustomerTab, setActiveCustomerTab] = React.useState('online'); // online, walkin
  const [filter, setFilter] = React.useState('all'); // all, risky, normal
  const [showRiskForm, setShowRiskForm] = React.useState(false);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);
  const [riskHistory, setRiskHistory] = React.useState([]);
  const [bookingHistory, setBookingHistory] = React.useState([]);
  const [bookingHistoryLoading, setBookingHistoryLoading] = React.useState(false);
  const [riskFormData, setRiskFormData] = React.useState({
    reason: '',
    bookingId: '',
    details: ''
  });

  React.useEffect(() => {
    if (activeCustomerTab === 'online') {
      fetchCustomers();
      fetchStatistics();
    } else {
      fetchWalkInCustomers();
    }
  }, [filter, activeCustomerTab]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      let url = '/api/admin/customers';
      
      if (filter === 'risky') {
        url += '?isRisky=true';
      } else if (filter === 'normal') {
        url += '?isRisky=false';
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalkInCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/bookings/walk-in-customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalkInCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching walk-in customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/customers/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchRiskHistory = async (customerId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/customers/${customerId}/risk-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRiskHistory(data);
      }
    } catch (error) {
      console.error('Error fetching risk history:', error);
    }
  };

  const handleAddRiskPoint = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const userId = JSON.parse(localStorage.getItem('userProfile')).id;
      const response = await fetch(`/api/admin/customers/${selectedCustomer.id}/risk-point`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId
        },
        body: JSON.stringify({
          ...riskFormData,
          bookingId: riskFormData.bookingId || null
        })
      });
      
      if (response.ok) {
        alert('Đã thêm điểm rủi ro thành công!');
        setShowRiskForm(false);
        setRiskFormData({
          reason: '',
          bookingId: '',
          details: ''
        });
        fetchCustomers();
        fetchStatistics();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể thêm điểm rủi ro'}`);
      }
    } catch (error) {
      console.error('Error adding risk point:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleResetRisk = async (customerId) => {
    if (!confirm('Bạn có chắc chắn muốn reset điểm rủi ro của khách hàng này?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/customers/${customerId}/reset-risk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Đã reset điểm rủi ro thành công!');
        fetchCustomers();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error resetting risk:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Đã xóa khách hàng thành công!');
        fetchCustomers();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const openRiskForm = (customer) => {
    setSelectedCustomer(customer);
    setShowRiskForm(true);
    fetchRiskHistory(customer.id);
  };

  const fetchBookingHistory = async (userId) => {
    try {
      setBookingHistoryLoading(true);
      const response = await getUserBookingHistory(userId);
      setBookingHistory(response.content || []);
    } catch (error) {
      console.error('Error fetching booking history:', error);
      setBookingHistory([]);
    } finally {
      setBookingHistoryLoading(false);
    }
  };

  const openDetailModal = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
    // Chỉ fetch booking history cho online customer
    if (activeCustomerTab === 'online' && customer.id) {
      fetchBookingHistory(customer.id);
    }
  };

  return (
    <div className="admin-section">
      <h1>Quản lý khách hàng</h1>
      
      {/* Tab Navigation */}
      <div className="customer-tabs">
        <button 
          className={`customer-tab ${activeCustomerTab === 'online' ? 'active' : ''}`}
          onClick={() => setActiveCustomerTab('online')}
        >
          <span className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
            </svg>
          </span>
          Khách hàng Online ({customers.length})
        </button>
        <button 
          className={`customer-tab ${activeCustomerTab === 'walkin' ? 'active' : ''}`}
          onClick={() => setActiveCustomerTab('walkin')}
        >
          <span className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21A7,7 0 0,1 14,26H10A7,7 0 0,1 3,19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M12,4.5A0.5,0.5 0 0,0 11.5,4A0.5,0.5 0 0,0 12,4.5A0.5,0.5 0 0,0 12.5,4A0.5,0.5 0 0,0 12,4.5M10,9A5,5 0 0,0 5,14V17A5,5 0 0,0 10,22H14A5,5 0 0,0 19,17V14A5,5 0 0,0 14,9H10M10,11H14A3,3 0 0,1 17,14V17A3,3 0 0,1 14,20H10A3,3 0 0,1 7,17V14A3,3 0 0,1 10,11Z"/>
            </svg>
          </span>
          Khách hàng tại điểm ({walkInCustomers.length})
        </button>
      </div>
      
      {activeCustomerTab === 'online' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Tổng khách hàng</h3>
              <p className="stat-number">{statistics.totalCustomers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Khách hàng bình thường</h3>
              <p className="stat-number">{statistics.normalCustomers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Khách hàng rủi ro</h3>
              <p className="stat-number text-danger">{statistics.riskyCustomers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Tỷ lệ rủi ro</h3>
              <p className="stat-number">{(statistics.riskyPercentage || 0).toFixed(1)}%</p>
            </div>
          </div>

          <div className="search-section">
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tất cả
              </button>
              <button 
                className={`filter-btn ${filter === 'normal' ? 'active' : ''}`}
                onClick={() => setFilter('normal')}
              >
                Bình thường
              </button>
              <button 
                className={`filter-btn ${filter === 'risky' ? 'active' : ''}`}
                onClick={() => setFilter('risky')}
              >
                Rủi ro
              </button>
            </div>
          </div>
        </>
      )}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          {/* Online Customers Table */}
          {activeCustomerTab === 'online' && (
            <div className="customers-table-container">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Điểm rủi ro</th>
                    <th>Trạng thái</th>
                    <th>Khiếu nại</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td>#{customer.id}</td>
                      <td>{customer.fullName}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phoneNumber}</td>
                      <td>
                        <span className={`risk-points ${customer.riskPoints >= 3 ? 'high' : ''}`}>
                          {customer.riskPoints}/3
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${customer.isRisky ? 'badge-danger' : 'badge-success'}`}>
                          {customer.isRisky ? 'Rủi ro' : 'Tốt'}
                        </span>
                      </td>
                      <td>{customer.totalComplaints || 0}</td>
                      <td>
                        <button 
                          className="admin-btn-action"
                          onClick={() => openDetailModal(customer)}
                          title="Xem hồ sơ chi tiết"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                          </svg>
                        </button>
                        <button 
                          className="admin-btn-action"
                          onClick={() => openRiskForm(customer)}
                          title="Thêm điểm rủi ro"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1,21H23L12,2M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"/>
                          </svg>
                        </button>
                        <button 
                          className="admin-btn-action"
                          onClick={() => handleResetRisk(customer.id)}
                          title="Reset điểm rủi ro"
                          disabled={customer.riskPoints === 0}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                          </svg>
                        </button>
                        <button 
                          className="admin-btn-action delete"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          title="Xóa khách hàng"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H10V19H8V9M14,9H16V19H14V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Walk-in Customers Table */}
          {activeCustomerTab === 'walkin' && (
            <div className="customers-table-container">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Số điện thoại</th>
                    <th>Email</th>
                    <th>CCCD</th>
                    <th>GPLX</th>
                    <th>Trạm đăng ký</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {walkInCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td>#{customer.id}</td>
                      <td>{customer.fullName}</td>
                      <td>{customer.phoneNumber}</td>
                      <td>{customer.email || 'N/A'}</td>
                      <td>{customer.cccdNumber || 'N/A'}</td>
                      <td>{customer.gplxNumber || 'N/A'}</td>
                      <td>Station #{customer.stationId}</td>
                      <td>{new Date(customer.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button 
                          className="admin-btn-action"
                          onClick={() => openDetailModal(customer)}
                          title="Xem hồ sơ chi tiết"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}



      {/* Risk Point Form Modal */}
      {showRiskForm && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowRiskForm(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Quản lý điểm rủi ro - {selectedCustomer.fullName}</h2>
            
            <div className="customer-info">
              <p><strong>Điểm rủi ro hiện tại:</strong> {selectedCustomer.riskPoints}/3</p>
              <p><strong>Trạng thái:</strong> 
                <span className={`badge ${selectedCustomer.isRisky ? 'badge-danger' : 'badge-success'}`} style={{marginLeft: '8px'}}>
                  {selectedCustomer.isRisky ? 'Rủi ro' : 'Tốt'}
                </span>
              </p>
            </div>

            <form onSubmit={handleAddRiskPoint}>
              <div className="form-group">
                <label>Lý do thêm điểm rủi ro *</label>
                <input
                  type="text"
                  value={riskFormData.reason}
                  onChange={(e) => setRiskFormData({...riskFormData, reason: e.target.value})}
                  placeholder="Ví dụ: Làm hư hỏng xe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Mã booking liên quan</label>
                <input
                  type="number"
                  value={riskFormData.bookingId}
                  onChange={(e) => setRiskFormData({...riskFormData, bookingId: e.target.value})}
                  placeholder="Nhập mã booking (nếu có)"
                />
              </div>
              <div className="form-group">
                <label>Chi tiết</label>
                <textarea
                  value={riskFormData.details}
                  onChange={(e) => setRiskFormData({...riskFormData, details: e.target.value})}
                  rows="4"
                  placeholder="Mô tả chi tiết vấn đề..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="admin-btn-primary">Thêm điểm rủi ro (+1)</button>
                <button type="button" className="admin-btn-close" onClick={() => setShowRiskForm(false)} style={{
                  padding: '0.5rem 1rem', 
                  fontSize: '0.9rem', 
                  fontWeight: '500', 
                  background: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#4b5563';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#6b7280';
                  e.target.style.transform = 'translateY(0)';
                }}
                >
                  Đóng
                </button>
              </div>
            </form>

            {/* Risk History */}
            <div className="risk-history">
              <h3>Lịch sử điểm rủi ro</h3>
              {riskHistory.length === 0 ? (
                <p className="no-data">Chưa có lịch sử điểm rủi ro</p>
              ) : (
                <div className="history-list">
                  {riskHistory.map((history) => (
                    <div key={history.id} className="history-item">
                      <div className="history-header">
                        <strong>{history.reason}</strong>
                        <span className="history-date">
                          {new Date(history.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="history-detail">{history.details}</p>
                      <div className="history-meta">
                        <span>Điểm: {history.pointsBefore} → {history.pointsAfter}</span>
                        {history.bookingId && <span>Booking: #{history.bookingId}</span>}
                        {history.becameRisky && <span className="became-risky"><i className="fas fa-exclamation-triangle" style={{marginRight: '4px'}}></i>Chuyển sang rủi ro</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => {
          setShowDetailModal(false);
          setBookingHistory([]);
          setSelectedCustomer(null);
        }}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ textAlign: 'center', flex: 1 }}>
                <h2>Hồ sơ khách hàng - {selectedCustomer.fullName}</h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>
                  {activeCustomerTab === 'online' ? 'Khách hàng Online' : 'Khách hàng tại điểm'}
                </p>
              </div>
              <button className="modal-close" onClick={() => {
                setShowDetailModal(false);
                setBookingHistory([]);
                setSelectedCustomer(null);
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              {/* Customer Type Indicator */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '1.5rem' 
              }}>
                <span className={`badge ${activeCustomerTab === 'online' ? 'badge-info' : 'badge-warning'}`} 
                      style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  {activeCustomerTab === 'online' ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                      </svg>
                      Khách hàng Online
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                        <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21A7,7 0 0,1 14,26H10A7,7 0 0,1 3,19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                      </svg>
                      Khách hàng tại điểm
                    </>
                  )}
                </span>
              </div>

              {/* Grid thông tin */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: activeCustomerTab === 'online' ? '1fr 1fr' : '1fr', 
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                {/* Thông tin cơ bản */}
                <div style={{ 
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: '#374151',
                    fontSize: '1rem',
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '0.5rem'
                  }}>
                    Thông tin cá nhân
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>ID:</span>
                      <span style={{ fontWeight: '500' }}>#{selectedCustomer.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Họ tên:</span>
                      <span style={{ fontWeight: '500' }}>{selectedCustomer.fullName}</span>
                    </div>
                    {activeCustomerTab === 'online' && selectedCustomer.username && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Username:</span>
                        <span style={{ fontWeight: '500' }}>{selectedCustomer.username}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Email:</span>
                      <span style={{ fontWeight: '500' }}>{selectedCustomer.email || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Số điện thoại:</span>
                      <span style={{ fontWeight: '500' }}>{selectedCustomer.phoneNumber || 'N/A'}</span>
                    </div>
                    {selectedCustomer.birthDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Ngày sinh:</span>
                        <span style={{ fontWeight: '500' }}>{selectedCustomer.birthDate}</span>
                      </div>
                    )}
                    {activeCustomerTab === 'walkin' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Số CCCD:</span>
                          <span style={{ fontWeight: '500' }}>{selectedCustomer.cccdNumber || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Số GPLX:</span>
                          <span style={{ fontWeight: '500' }}>{selectedCustomer.gplxNumber || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Trạm đăng ký:</span>
                          <span style={{ fontWeight: '500' }}>Station #{selectedCustomer.stationId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Ngày tạo:</span>
                          <span style={{ fontWeight: '500' }}>
                            {new Date(selectedCustomer.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Thông tin tài khoản (chỉ cho online customer) */}
                {activeCustomerTab === 'online' && (
                  <div style={{ 
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 0.75rem 0', 
                      color: '#374151',
                      fontSize: '1rem',
                      borderBottom: '1px solid #d1d5db',
                      paddingBottom: '0.5rem'
                    }}>
                      Thông tin tài khoản
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Điểm rủi ro:</span>
                        <span className={`risk-points ${selectedCustomer.riskPoints >= 3 ? 'high' : ''}`} style={{ fontWeight: '500' }}>
                          {selectedCustomer.riskPoints}/3
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Trạng thái:</span>
                        <span className={`badge ${selectedCustomer.isRisky ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.8rem' }}>
                          {selectedCustomer.isRisky ? 'Rủi ro' : 'Tốt'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tổng khiếu nại:</span>
                        <span style={{ fontWeight: '500' }}>{selectedCustomer.totalComplaints || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Ngày tham gia:</span>
                        <span style={{ fontWeight: '500' }}>
                          {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hình ảnh giấy tờ (chỉ cho walk-in customer) */}
              {activeCustomerTab === 'walkin' && (selectedCustomer.cccdImageUrl || selectedCustomer.gplxImageUrl) && (
                <div style={{ 
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: '#374151',
                    fontSize: '1rem',
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '0.5rem'
                  }}>
                    Hình ảnh giấy tờ
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {selectedCustomer.cccdImageUrl && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#6b7280' }}>CCCD</p>
                        <img 
                          src={selectedCustomer.cccdImageUrl} 
                          alt="CCCD" 
                          style={{ 
                            width: '100%', 
                            maxWidth: '200px', 
                            height: '120px', 
                            objectFit: 'cover', 
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNjBMMTAwIDYwIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                            e.target.alt = 'Không thể tải ảnh CCCD';
                          }}
                        />
                      </div>
                    )}
                    {selectedCustomer.gplxImageUrl && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#6b7280' }}>GPLX</p>
                        <img 
                          src={selectedCustomer.gplxImageUrl} 
                          alt="GPLX" 
                          style={{ 
                            width: '100%', 
                            maxWidth: '200px', 
                            height: '120px', 
                            objectFit: 'cover', 
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNjBMMTAwIDYwIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                            e.target.alt = 'Không thể tải ảnh GPLX';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lịch sử thuê xe (chỉ cho online customer) */}
              {activeCustomerTab === 'online' && (
                <div style={{ 
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: '#374151',
                    fontSize: '1rem',
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '0.5rem'
                  }}>
                    Lịch sử thuê xe
                  </h4>
                  
                  {bookingHistoryLoading ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '2rem',
                      color: '#6b7280'
                    }}>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        border: '2px solid #e5e7eb', 
                        borderTop: '2px solid #3b82f6', 
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '0.5rem'
                      }}></div>
                      Đang tải lịch sử...
                    </div>
                  ) : bookingHistory.length === 0 ? (
                    <p style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                      Chưa có lịch sử thuê xe
                    </p>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table style={{ 
                        width: '100%', 
                        fontSize: '0.85rem',
                        borderCollapse: 'collapse'
                      }}>
                        <thead style={{ 
                          background: '#f3f4f6',
                          position: 'sticky',
                          top: 0
                        }}>
                          <tr>
                            <th style={{ 
                              padding: '0.5rem', 
                              textAlign: 'left', 
                              borderBottom: '1px solid #e5e7eb',
                              fontWeight: '600'
                            }}>ID</th>
                            <th style={{ 
                              padding: '0.5rem', 
                              textAlign: 'left', 
                              borderBottom: '1px solid #e5e7eb',
                              fontWeight: '600'
                            }}>Xe</th>
                            <th style={{ 
                              padding: '0.5rem', 
                              textAlign: 'left', 
                              borderBottom: '1px solid #e5e7eb',
                              fontWeight: '600'
                            }}>Ngày thuê</th>
                            <th style={{ 
                              padding: '0.5rem', 
                              textAlign: 'left', 
                              borderBottom: '1px solid #e5e7eb',
                              fontWeight: '600'
                            }}>Trạng thái</th>
                            <th style={{ 
                              padding: '0.5rem', 
                              textAlign: 'right', 
                              borderBottom: '1px solid #e5e7eb',
                              fontWeight: '600'
                            }}>Tổng tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingHistory.map((booking, index) => (
                            <tr key={booking.id} style={{ 
                              borderBottom: index < bookingHistory.length - 1 ? '1px solid #f3f4f6' : 'none'
                            }}>
                              <td style={{ padding: '0.5rem' }}>#{booking.id}</td>
                              <td style={{ padding: '0.5rem' }}>
                                {booking.vehicle ? (
                                  <div>
                                    <div style={{ fontWeight: '500' }}>{booking.vehicle.licensePlate}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                      {booking.vehicle.type}
                                    </div>
                                  </div>
                                ) : (
                                  `Xe #${booking.vehicleId}`
                                )}
                              </td>
                              <td style={{ padding: '0.5rem' }}>
                                {booking.bookingTime ? (
                                  <div>
                                    <div>{new Date(booking.bookingTime).toLocaleDateString('vi-VN')}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                      {new Date(booking.bookingTime).toLocaleTimeString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                ) : 'N/A'}
                              </td>
                              <td style={{ padding: '0.5rem' }}>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  background: 
                                    booking.status === 'COMPLETED' ? '#dcfce7' :
                                    booking.status === 'ACTIVE' ? '#dbeafe' :
                                    booking.status === 'PENDING' ? '#fef3c7' :
                                    booking.status === 'CANCELLED' ? '#fee2e2' : '#f3f4f6',
                                  color:
                                    booking.status === 'COMPLETED' ? '#166534' :
                                    booking.status === 'ACTIVE' ? '#1e40af' :
                                    booking.status === 'PENDING' ? '#92400e' :
                                    booking.status === 'CANCELLED' ? '#dc2626' : '#6b7280'
                                }}>
                                  {booking.status === 'COMPLETED' ? 'Hoàn thành' :
                                   booking.status === 'ACTIVE' ? 'Đang thuê' :
                                   booking.status === 'PENDING' ? 'Chờ xử lý' :
                                   booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status}
                                </span>
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '500' }}>
                                {booking.totalAmount ? 
                                  `${booking.totalAmount.toLocaleString('vi-VN')}đ` : 
                                  'N/A'
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="admin-btn-action"
                  style={{
                    padding: '0.5rem 1rem', 
                    fontSize: '0.9rem', 
                    fontWeight: '500', 
                    background: '#6b7280', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#4b5563';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#6b7280';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component: Quản lý nhân viên
const StaffManagement = () => {
  const [users, setUsers] = React.useState([]);
  const [stations, setStations] = React.useState([]);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [formData, setFormData] = React.useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    birthDate: '',
    stationId: ''
  });

  // Fetch danh sách users và stations
  React.useEffect(() => {
    fetchUsers();
    fetchStations();
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
        // Kiểm tra data có phải array không
        if (Array.isArray(data)) {
          // Chỉ hiển thị STAFF và ADMIN
          const staffAndAdmin = data.filter(u => u.role === 'STAFF' || u.role === 'ADMIN');
          setUsers(staffAndAdmin);
        } else {
          console.error('API returned non-array data:', data);
          setUsers([]);
        }
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchStations = async () => {
    try {
      const data = await getStations();
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const payload = { ...formData };
      if (payload.stationId) {
        payload.stationId = parseInt(payload.stationId);
      }
      
      const response = await fetch('/api/users/admin/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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
          birthDate: '',
          stationId: ''
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

  const handleUpdateStation = async (user) => {
    if (user.role !== 'STAFF') {
      alert('Chỉ có thể cập nhật trạm cho STAFF!');
      return;
    }

    const stationId = prompt(
      `Chọn trạm mới cho ${user.fullName}:\n` +
      stations.map(s => `ID: ${s.id} - ${s.name} (${s.province})`).join('\n') +
      `\n\nNhập ID trạm (hiện tại: ${user.stationId || 'Chưa có'}):`,
      user.stationId || ''
    );

    if (stationId === null) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/admin/update-station/${user.id}?stationId=${stationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Cập nhật trạm thành công!');
        fetchUsers();
      } else {
        const error = await response.json();
        alert('Lỗi: ' + (error.message || 'Không thể cập nhật trạm'));
      }
    } catch (error) {
      console.error('Error updating station:', error);
      alert('Có lỗi xảy ra');
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
          <h3>Tổng nhân viên</h3>
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
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="admin-btn-success"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? (
            <>
              <i className="fas fa-times"></i> Đóng form
            </>
          ) : (
            '+ Tạo tài khoản Staff mới'
          )}
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
              <div className="form-group">
                <label>Trạm (Station)</label>
                <select
                  value={formData.stationId}
                  onChange={(e) => setFormData({...formData, stationId: e.target.value})}
                >
                  <option value="">-- Chọn trạm --</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name} - {station.province}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="admin-btn-primary" style={{marginTop: '1rem'}}>
              Tạo tài khoản Staff
            </button>
          </form>
        </div>
      )}

      <div className="staff-table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th style={{ padding: '0.6rem 1.2rem', minWidth: '80px', whiteSpace: 'nowrap' }}>Chi tiết</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '70px' }}>ID</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '160px' }}>Tên</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '180px' }}>Email</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '130px' }}>SĐT</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '100px', textAlign: 'center' }}>Role</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '150px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ fontSize: '0.85rem' }}>
                <td style={{ textAlign: 'center', width: '80px', padding: '0.5rem 1.2rem' }}>
                  <button 
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDetailModal(true);
                    }}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      padding: '0.4rem',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      lineHeight: '1',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = '#374151';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.color = '#6b7280';
                    }}
                    title="Xem chi tiết nhân viên"
                  >
                    ⋮
                  </button>
                </td>
                <td style={{ fontWeight: '500', color: '#6b7280', padding: '0.5rem 1rem' }}>#{user.id}</td>
                <td style={{ fontWeight: '600', padding: '0.5rem 1rem' }}>{user.fullName}</td>
                <td style={{ padding: '0.5rem 1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</td>
                <td style={{ padding: '0.5rem 1rem' }}>{user.phoneNumber || 'N/A'}</td>
                <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                  <span className={`badge ${
                    user.role === 'ADMIN' ? 'badge-danger' :
                    user.role === 'STAFF' ? 'badge-info' :
                    'badge-success'
                  }`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      className="admin-btn-action compact"
                      onClick={() => handleChangeRole(user.id, user.role)}
                    >
                      Đổi role
                    </button>
                    {user.role === 'STAFF' && (
                      <button 
                        className="admin-btn-action compact"
                        onClick={() => handleUpdateStation(user)}
                        style={{ background: '#16a085' }}
                      >
                        Đổi trạm
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết nhân viên */}
      {showDetailModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div style={{ textAlign: 'center', flex: 1 }}>
                <h2>Chi tiết nhân viên - {selectedUser.fullName}</h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>
                  {selectedUser.email}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              {/* Grid thông tin */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                {/* Thông tin cá nhân */}
                <div style={{ 
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: '#374151',
                    fontSize: '1rem',
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '0.5rem'
                  }}>
                    Thông tin cá nhân
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>ID:</span>
                      <span style={{ fontWeight: '500' }}>#{selectedUser.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Username:</span>
                      <span style={{ fontWeight: '500' }}>{selectedUser.username}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Số điện thoại:</span>
                      <span style={{ fontWeight: '500' }}>{selectedUser.phoneNumber || 'N/A'}</span>
                    </div>
                    {selectedUser.birthDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Ngày sinh:</span>
                        <span style={{ fontWeight: '500' }}>{selectedUser.birthDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin công việc */}
                <div style={{ 
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: '#374151',
                    fontSize: '1rem',
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '0.5rem'
                  }}>
                    Thông tin công việc
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Role:</span>
                      <span className={`badge ${
                        selectedUser.role === 'ADMIN' ? 'badge-danger' :
                        selectedUser.role === 'STAFF' ? 'badge-info' :
                        'badge-success'
                      }`} style={{ fontSize: '0.8rem' }}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Trạng thái:</span>
                      <span className={`badge ${
                        selectedUser.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'
                      }`} style={{ fontSize: '0.8rem' }}>
                        {selectedUser.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'TẠM NGỪNG'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Trạm làm việc:</span>
                      <span style={{ fontWeight: '500' }}>
                        {selectedUser.stationId ? (
                          stations.find(s => s.id === selectedUser.stationId)?.name || `Station #${selectedUser.stationId}`
                        ) : (
                          'Chưa có trạm'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="admin-btn-action"
                  style={{
                    padding: '0.5rem 1rem', 
                    fontSize: '0.9rem', 
                    fontWeight: '500', 
                    background: '#6b7280', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#4b5563';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#6b7280';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StationManagement = () => {
  const [stations, setStations] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStationId, setDeletingStationId] = useState(null);
  const [deletingStationName, setDeletingStationName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    province: '',
    city: '',
    capacity: 0,
    status: 'OPEN',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchProvinces();
    // initial load: all stations
    fetchStations();
  }, []);

  useEffect(() => {
    // when selectedProvince changes, reload stations from backend
    if (selectedProvince === 'all') {
      fetchStations();
    } else {
      fetchStations(typeof selectedProvince === 'string' ? selectedProvince.trim() : selectedProvince);
    }
  }, [selectedProvince]);

  const fetchProvinces = async () => {
    try {
      console.log('Fetching provinces from /api/stations/provinces');
      const res = await fetch('/api/stations/provinces');
      if (res.ok) {
        const data = await res.json();
        console.log('Provinces response:', data);
        setProvinces(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch provinces', err);
    }
  };

  const fetchStations = async (province) => {
    try {
      let url = '/api/stations';
      if (province && String(province).trim()) {
        const prov = String(province).trim();
        url += `?province=${encodeURIComponent(prov)}`;
      }
      console.log('Fetching stations from', url);
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Stations response count:', (data || []).length);
        if ((data || []).length > 0) console.log('First station province:', data[0].province);
        setStations(data || []);
      } else {
        console.error('Failed to fetch stations:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Không thể tải danh sách trạm. Vui lòng kiểm tra backend!');
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      alert('Lỗi kết nối đến server: ' + error.message);
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
      status: station.status || 'OPEN',
      latitude: station.latitude || '',
      longitude: station.longitude || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (station) => {
    // Hiển thị modal yêu cầu mật khẩu admin
    setDeletingStationId(station.id);
    setDeletingStationName(station.name);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!adminPassword.trim()) {
      alert('Vui lòng nhập mật khẩu admin');
      return;
    }

    setIsDeleting(true);
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(`/api/stations/${deletingStationId}/delete-with-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminPassword: adminPassword
        })
      });

      if (response.ok) {
        alert('Đã xóa trạm thành công!');
        fetchStations();
        closeDeleteModal();
      } else {
        const error = await response.json();
        alert('Lỗi: ' + (error.error || 'Không thể xóa trạm'));
      }
    } catch (error) {
      console.error('Error deleting station:', error);
      alert('Có lỗi xảy ra khi xóa trạm');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingStationId(null);
    setDeletingStationName('');
    setAdminPassword('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phoneNumber: '',
      province: '',
      city: '',
      capacity: 0,
      status: 'OPEN',
      latitude: '',
      longitude: ''
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ margin: 0, fontWeight: 600 }}>Lọc theo Tỉnh/Thành:</label>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="filter-select"
            style={{ minWidth: 220 }}
          >
            <option value="all">Tất cả thành phố</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <button 
            className="admin-btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.5rem'}}>
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
            </svg>
            {showForm ? 'Đóng' : 'Thêm trạm mới'}
          </button>
        </div>
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
        <div className="admin-form">
          <h2>{editingStation ? 'Chỉnh sửa trạm' : 'Thêm trạm mới'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
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
                <label>Vĩ độ (Latitude)</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  step="0.00000001"
                  placeholder="VD: 10.7769"
                />
              </div>

              <div className="form-group">
                <label>Kinh độ (Longitude)</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  step="0.00000001"
                  placeholder="VD: 106.7009"
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
              <button type="submit" className="admin-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.5rem'}}>
                  {editingStation ? 
                    <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/> :
                    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                  }
                </svg>
                {editingStation ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button type="button" onClick={resetForm} className="admin-btn-action danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.5rem'}}>
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách trạm */}
      <div className="staff-table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th style={{ padding: '0.6rem 1.2rem', minWidth: '80px', whiteSpace: 'nowrap' }}>Chi tiết</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '70px' }}>ID</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '160px' }}>Tên trạm</th>
              <th style={{ padding: '0.6rem 0.8rem', minWidth: '200px' }}>Địa chỉ</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '110px', textAlign: 'center' }}>Sức chứa</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '130px', textAlign: 'center' }}>Trạng thái</th>
              <th style={{ padding: '0.6rem 1rem', minWidth: '150px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr key={station.id}>
                <td style={{ textAlign: 'center', width: '80px', padding: '0.5rem 1.2rem' }}>
                  <button 
                    onClick={() => {
                      setSelectedStation(station);
                      setShowDetailModal(true);
                    }}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      padding: '0.4rem',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      lineHeight: '1',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = '#374151';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.color = '#6b7280';
                    }}
                    title="Xem chi tiết trạm"
                  >
                    ⋮
                  </button>
                </td>
                <td style={{ fontWeight: '500', color: '#6b7280', padding: '0.5rem 1rem' }}>#{station.id}</td>
                <td style={{ fontWeight: '600', padding: '0.5rem 1rem', minWidth: '160px' }}>{station.name}</td>
                <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0.5rem 0.8rem' }}>
                  {station.address}
                </td>
                <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                  <span className="badge badge-info">
                    {station.capacity || 0} xe
                  </span>
                </td>
                <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                  <span className={`badge ${
                    station.status === 'OPEN' ? 'badge-success' : 
                    station.status === 'CLOSED' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {station.status === 'OPEN' ? 'HOẠT ĐỘNG' : 
                     station.status === 'CLOSED' ? 'ĐÓNG CỬA' : 'TẠM NGỪNG'}
                  </span>
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => handleEdit(station)} className="admin-btn-action compact">
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(station)} 
                      className="admin-btn-action compact danger"
                      style={{ background: '#e74c3c' }}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal xóa trạm với xác nhận mật khẩu */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Xóa trạm - Xác nhận mật khẩu Admin</h2>
              <button className="modal-close" onClick={closeDeleteModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="warning-message">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#e74c3c" style={{marginBottom: '1rem'}}>
                  <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                </svg>
                <h3>Cảnh báo!</h3>
                <p>Bạn sắp xóa vĩnh viễn trạm: <strong>{deletingStationName}</strong></p>
                <p>Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa khỏi hệ thống.</p>
              </div>

              <div className="form-group" style={{marginTop: '2rem'}}>
                <label>Mật khẩu Admin *</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Nhập mật khẩu admin để xác nhận"
                  disabled={isDeleting}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      confirmDelete();
                    }
                  }}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={closeDeleteModal} 
                className="admin-btn-action"
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button 
                onClick={confirmDelete}
                className="admin-btn-action danger"
                disabled={isDeleting || !adminPassword.trim()}
              >
                {isDeleting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.5rem', animation: 'spin 1s linear infinite'}}>
                      <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.5rem'}}>
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                    </svg>
                    Xóa vĩnh viễn
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết trạm */}
      {showDetailModal && selectedStation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div style={{ textAlign: 'center', flex: 1 }}>
                <h2>Chi tiết trạm - {selectedStation.name}</h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>
                  {selectedStation.address}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              {/* Grid thông tin */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                {/* Thông tin liên lạc */}
                <div style={{ 
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: '#374151',
                    fontSize: '1rem',
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '0.5rem'
                  }}>
                    Thông tin liên lạc
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>ID:</span>
                      <span style={{ fontWeight: '500' }}>#{selectedStation.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Điện thoại:</span>
                      <span style={{ fontWeight: '500' }}>{selectedStation.phoneNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tỉnh/TP:</span>
                      <span style={{ fontWeight: '500' }}>{selectedStation.province}</span>
                    </div>
                    {selectedStation.city && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Quận/Huyện:</span>
                        <span style={{ fontWeight: '500' }}>{selectedStation.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin vận hành */}
                <div style={{ 
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: '#374151',
                    fontSize: '1rem',
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '0.5rem'
                  }}>
                    Vận hành
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Sức chứa:</span>
                      <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
                        {selectedStation.capacity || 0} xe
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Trạng thái:</span>
                      <span className={`badge ${
                        selectedStation.status === 'OPEN' ? 'badge-success' : 
                        selectedStation.status === 'CLOSED' ? 'badge-danger' : 'badge-warning'
                      }`} style={{ fontSize: '0.8rem' }}>
                        {selectedStation.status === 'OPEN' ? 'HOẠT ĐỘNG' : 
                         selectedStation.status === 'CLOSED' ? 'ĐÓNG CỬA' : 'TẠM NGỪNG'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                {selectedStation.latitude && selectedStation.longitude && (
                  <a 
                    href={`https://www.google.com/maps?q=${selectedStation.latitude},${selectedStation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      background: '#10b981',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#059669'}
                    onMouseOut={(e) => e.target.style.background = '#10b981'}
                  >
                    Xem trên Google Maps
                  </a>
                )}
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="admin-btn-action"
                  style={{
                    padding: '0.5rem 1rem', 
                    fontSize: '0.9rem', 
                    fontWeight: '500', 
                    background: '#6b7280', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#4b5563';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#6b7280';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component: Báo cáo & phân tích
const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [vehicleUtilization, setVehicleUtilization] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [quarterlyRevenue, setQuarterlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [stationRevenue, setStationRevenue] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearRange, setYearRange] = useState({
    start: new Date().getFullYear() - 2,
    end: new Date().getFullYear()
  });

  useEffect(() => {
    fetchAllReports();
  }, [selectedYear, yearRange]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [utilization, peaks, quarterly, yearly, stations] = await Promise.all([
        getVehicleUtilizationStats().catch(() => []),
        getPeakHoursAnalysis().catch(() => []),
        getRevenueByQuarter(selectedYear).catch(() => []),
        getRevenueByYear(yearRange.start, yearRange.end).catch(() => []),
        getRevenueByStation().catch(() => [])
      ]);

      setVehicleUtilization(utilization);
      setPeakHours(peaks);
      setQuarterlyRevenue(quarterly);
      setYearlyRevenue(yearly);
      
      // Transform station revenue data để phù hợp với PieChart
      const transformedStations = stations.map(station => ({
        name: station.stationName || 'Trạm không xác định',
        revenue: station.totalRevenue || 0,
        totalBookings: station.totalBookings || 0
      }));
      setStationRevenue(transformedStations);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  if (loading) {
    return (
      <div className="admin-section">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h1>📊 Báo cáo & phân tích</h1>
      
      {/* Stats Overview */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3>Tổng số xe</h3>
          <p className="stat-number">{vehicleUtilization.length || 0}</p>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <h3>Tỷ lệ SD trung bình</h3>
          <p className="stat-number">
            {vehicleUtilization.length > 0 
              ? Math.round(vehicleUtilization.reduce((sum, v) => sum + (v.utilizationRate || 0), 0) / vehicleUtilization.length)
              : 0}%
          </p>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <h3>Giờ cao điểm</h3>
          <p className="stat-number" style={{ fontSize: '1.2rem' }}>
            {peakHours.length > 0 ? `${peakHours[0].hour}h - ${peakHours[peakHours.length - 1].hour}h` : 'N/A'}
          </p>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
          <h3>Doanh thu năm {selectedYear}</h3>
          <p className="stat-number" style={{ fontSize: '1.2rem' }}>
            {quarterlyRevenue.reduce((sum, q) => sum + (q.revenue || 0), 0).toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {/* Tỷ lệ sử dụng xe */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <h2>🚗 Tỷ lệ sử dụng xe (theo số chuyến)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={vehicleUtilization}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vehicleName" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'totalTrips') return [value, 'Số chuyến'];
                if (name === 'utilizationRate') return [`${value}%`, 'Tỷ lệ SD'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="totalTrips" fill="#8884d8" name="Số chuyến" />
            <Bar dataKey="utilizationRate" fill="#82ca9d" name="Tỷ lệ SD (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Giờ cao điểm/thấp điểm */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <h2>⏰ Phân tích giờ cao điểm & thấp điểm</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={peakHours}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" label={{ value: 'Giờ trong ngày', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Số lượt thuê', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [`${value} lượt`, 'Số lượt thuê']} />
            <Legend />
            <Line type="monotone" dataKey="bookingCount" stroke="#8884d8" strokeWidth={2} name="Số lượt thuê" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
          <p><strong>📈 Giờ cao điểm:</strong> {peakHours.filter(h => h.bookingCount > (peakHours.reduce((s, h) => s + h.bookingCount, 0) / peakHours.length)).map(h => `${h.hour}h`).join(', ') || 'Chưa có dữ liệu'}</p>
          <p><strong>📉 Giờ thấp điểm:</strong> {peakHours.filter(h => h.bookingCount < (peakHours.reduce((s, h) => s + h.bookingCount, 0) / peakHours.length)).map(h => `${h.hour}h`).join(', ') || 'Chưa có dữ liệu'}</p>
        </div>
      </div>

      {/* Doanh thu theo quý */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>💰 Doanh thu theo quý năm {selectedYear}</h2>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={quarterlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
            <Tooltip formatter={(value) => [`${value.toLocaleString('vi-VN')}đ`, 'Doanh thu']} />
            <Legend />
            <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu (VNĐ)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Doanh thu theo năm */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>📈 Doanh thu theo năm</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              value={yearRange.start}
              onChange={(e) => setYearRange({...yearRange, start: Number(e.target.value)})}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              {[...Array(10)].map((_, i) => {
                const year = new Date().getFullYear() - 9 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
            <span style={{ alignSelf: 'center' }}>đến</span>
            <select 
              value={yearRange.end}
              onChange={(e) => setYearRange({...yearRange, end: Number(e.target.value)})}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              {[...Array(10)].map((_, i) => {
                const year = new Date().getFullYear() - 9 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={yearlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
            <Tooltip formatter={(value) => [`${value.toLocaleString('vi-VN')}đ`, 'Doanh thu']} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} name="Doanh thu (VNĐ)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Doanh thu theo trạm */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <h2>🏢 Doanh thu theo trạm</h2>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={stationRevenue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {stationRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toLocaleString('vi-VN')}đ`, 'Doanh thu']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Bảng chi tiết */}
          <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
            <div style={{ 
              background: 'white', 
              borderRadius: '8px', 
              padding: '1rem',
              border: '1px solid #e0e0e0',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#333' }}>📋 Chi tiết doanh thu</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Trạm</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#666' }}>Số chuyến</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#666' }}>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {stationRevenue
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((station, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            background: COLORS[index % COLORS.length],
                            display: 'inline-block'
                          }}></span>
                          {station.name}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#666' }}>
                          {station.totalBookings || 0}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#333' }}>
                          {(station.revenue || 0).toLocaleString('vi-VN')}đ
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid #e0e0e0', fontWeight: '700', background: '#f8f9fa' }}>
                    <td style={{ padding: '0.75rem' }}>Tổng cộng</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#333' }}>
                      {stationRevenue.reduce((sum, s) => sum + (s.totalBookings || 0), 0)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#4CAF50' }}>
                      {stationRevenue.reduce((sum, s) => sum + (s.revenue || 0), 0).toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component: Xác thực tài liệu
const DocumentVerification = () => {
  const [allDocs, setAllDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filters, setFilters] = useState({
    documentType: 'ALL', // ALL, LICENSE, IDENTITY
    status: 'PENDING' // PENDING, APPROVED, REJECTED, ALL
  });
  const [verifyForm, setVerifyForm] = useState({
    documentNumber: '',
    action: 'APPROVED',
    rejectionReason: ''
  });

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allDocs]);

  const fetchAllDocuments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/users/admin/all-verifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllDocs(data);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allDocs];

    // Lọc theo loại tài liệu
    if (filters.documentType !== 'ALL') {
      filtered = filtered.filter(doc => doc.documentType === filters.documentType);
    }

    // Lọc theo trạng thái
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    setFilteredDocs(filtered);
  };

  const handleVerify = async (verificationId) => {
    // Chỉ validate documentNumber khi APPROVED
    if (verifyForm.action === 'APPROVED' && !verifyForm.documentNumber.trim()) {
      alert('Vui lòng nhập số giấy tờ khi xác thực');
      return;
    }

    if (verifyForm.action === 'REJECTED' && !verifyForm.rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/admin/verify-document/${verificationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(verifyForm)
      });

      if (response.ok) {
        alert(`Đã ${verifyForm.action === 'APPROVED' ? 'xác thực' : 'từ chối'} tài liệu thành công!`);
        setSelectedDoc(null);
        setVerifyForm({
          documentNumber: '',
          action: 'APPROVED',
          rejectionReason: ''
        });
        fetchAllDocuments();
      } else {
        const error = await response.text();
        alert(`Lỗi: ${error}`);
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      alert('Có lỗi xảy ra khi xác thực tài liệu');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { text: 'Chờ xác thực', class: 'pending' },
      APPROVED: { text: 'Đã xác thực', class: 'approved' },
      REJECTED: { text: 'Đã từ chối', class: 'rejected' }
    };
    return badges[status] || badges.PENDING;
  };

  const getStatusCount = (status) => {
    if (status === 'ALL') return allDocs.length;
    return allDocs.filter(doc => doc.status === status).length;
  };

  const getDocTypeCount = (type) => {
    if (type === 'ALL') return allDocs.length;
    return allDocs.filter(doc => doc.documentType === type).length;
  };

  if (loading) {
    return <div className="loading-state">Đang tải...</div>;
  }

  return (
    <div className="document-verification-container">
      <div className="section-header">
        <h2>Xác thực tài liệu</h2>
        <p className="subtitle">Tổng số: {allDocs.length} tài liệu</p>
      </div>

      {/* Filters */}
      <div className="doc-filters">
        <div className="filter-group">
          <label>Loại tài liệu:</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filters.documentType === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, documentType: 'ALL'})}
            >
              Tất cả ({getDocTypeCount('ALL')})
            </button>
            <button 
              className={`filter-btn ${filters.documentType === 'LICENSE' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, documentType: 'LICENSE'})}
            >
              GPLX ({getDocTypeCount('LICENSE')})
            </button>
            <button 
              className={`filter-btn ${filters.documentType === 'IDENTITY' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, documentType: 'IDENTITY'})}
            >
              CCCD ({getDocTypeCount('IDENTITY')})
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Trạng thái:</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filters.status === 'PENDING' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, status: 'PENDING'})}
            >
              Chờ xác thực ({getStatusCount('PENDING')})
            </button>
            <button 
              className={`filter-btn ${filters.status === 'APPROVED' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, status: 'APPROVED'})}
            >
              Đã xác thực ({getStatusCount('APPROVED')})
            </button>
            <button 
              className={`filter-btn ${filters.status === 'REJECTED' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, status: 'REJECTED'})}
            >
              Đã từ chối ({getStatusCount('REJECTED')})
            </button>
            <button 
              className={`filter-btn ${filters.status === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, status: 'ALL'})}
            >
              Tất cả ({getStatusCount('ALL')})
            </button>
          </div>
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '60px', marginBottom: '16px', opacity: '0.6'}}><i className="fas fa-inbox"></i></div>
          <p>Không có tài liệu nào</p>
        </div>
      ) : (
        <div className="documents-grid-compact">
          {filteredDocs.map((doc) => {
            const statusBadge = getStatusBadge(doc.status);
            return (
              <div key={doc.id} className="document-card-compact">
                <div className="doc-image-compact">
                  <img 
                    src={doc.imageUrl} 
                    alt={doc.documentType}
                    onClick={() => window.open(doc.imageUrl, '_blank')}
                  />
                  <span className={`status-tag ${statusBadge.class}`}>
                    {statusBadge.text}
                  </span>
                </div>

                <div className="doc-details-compact">
                  <div className="doc-title-row">
                    <strong>
                      <i 
                        className={doc.documentType === 'LICENSE' ? 'fas fa-car' : 'fas fa-id-card'} 
                        style={{marginRight: '6px'}}
                      ></i>
                      {doc.documentType === 'LICENSE' ? 'GPLX' : 'CCCD'}
                    </strong>
                    <span className="doc-date">{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  <div className="doc-info-compact">
                    <p><strong>{doc.fullName}</strong> (@{doc.username})</p>
                    {doc.status === 'REJECTED' && doc.rejectionReason && (
                      <p className="rejection-reason">
                        <i className="fas fa-times-circle" style={{marginRight: '4px', color: '#dc2626'}}></i>
                        {doc.rejectionReason}
                      </p>
                    )}
                  </div>

                  {doc.status === 'PENDING' && (
                    selectedDoc === doc.id ? (
                      <div className="verify-form-compact">
                        {verifyForm.action === 'APPROVED' && (
                          <input
                            type="text"
                            value={verifyForm.documentNumber}
                            onChange={(e) => setVerifyForm({...verifyForm, documentNumber: e.target.value})}
                            placeholder={`Số ${doc.documentType === 'LICENSE' ? 'GPLX' : 'CCCD'}`}
                            maxLength={12}
                          />
                        )}

                        <select
                          value={verifyForm.action}
                          onChange={(e) => setVerifyForm({...verifyForm, action: e.target.value})}
                        >
                          <option value="APPROVED">✓ Xác thực</option>
                          <option value="REJECTED">X Từ chối</option>
                        </select>

                        {verifyForm.action === 'REJECTED' && (
                          <textarea
                            value={verifyForm.rejectionReason}
                            onChange={(e) => setVerifyForm({...verifyForm, rejectionReason: e.target.value})}
                            placeholder="Lý do từ chối..."
                            rows="2"
                          />
                        )}

                        <div className="form-actions-compact">
                          <button 
                            className="admin-btn-confirm"
                            onClick={() => handleVerify(doc.id)}
                          >
                            {verifyForm.action === 'APPROVED' ? 'Xác thực' : 'Từ chối'}
                          </button>
                          <button 
                            className="admin-btn-cancel"
                            onClick={() => {
                              setSelectedDoc(null);
                              setVerifyForm({
                                documentNumber: '',
                                action: 'APPROVED',
                                rejectionReason: ''
                              });
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="admin-btn-action-compact"
                        onClick={() => {
                          setSelectedDoc(doc.id);
                          const currentNumber = doc.documentType === 'LICENSE' 
                            ? doc.currentLicenseNumber 
                            : doc.currentIdentityNumber;
                          setVerifyForm({
                            documentNumber: currentNumber || '',
                            action: 'APPROVED',
                            rejectionReason: ''
                          });
                        }}
                      >
                        Xác thực ngay
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Component: Quản lý khiếu nại
const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority'
  const [assignModal, setAssignModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [staffCompleteModal, setStaffCompleteModal] = useState(false);
  const [adminApproveModal, setAdminApproveModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [stations, setStations] = useState([]);
  const [assignData, setAssignData] = useState({
    staffId: '',
    notes: ''
  });
  const [staffCompleteData, setStaffCompleteData] = useState({
    staffNotes: ''
  });
  const [approveData, setApproveData] = useState({
    resolution: ''
  });
  const [rejectData, setRejectData] = useState({
    reason: ''
  });
  const [resolveData, setResolveData] = useState({
    status: 'RESOLVED',
    resolution: ''
  });

  useEffect(() => {
    fetchComplaints();
    fetchStatistics();
    fetchStaffList();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAllComplaints();
      
      // Filter complaints based on status
      let filtered = data;
      if (filter !== 'ALL') {
        filtered = data.filter(c => c.status === filter);
      }
      
      setComplaints(filtered);
    } catch (error) {
      console.error('Lỗi tải danh sách khiếu nại:', error);
      alert('Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getComplaintStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  const fetchStaffList = async () => {
    try {
      const allUsers = await getAllUsers();
      // Filter only STAFF users
      const staff = allUsers.filter(u => u.role === 'STAFF');
      setStaffList(staff);
      
      // Fetch stations for displaying station names
      try {
        const stationsData = await getStations();
        setStations(stationsData || []);
      } catch (err) {
        console.error('Không thể tải danh sách trạm:', err);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách nhân viên:', error);
    }
  };

  const handleAssign = async () => {
    if (!assignData.staffId) {
      alert('Vui lòng chọn nhân viên');
      return;
    }

    try {
      await assignComplaint(selectedComplaint.id, assignData.staffId, assignData.notes);
      alert('Đã phân công khiếu nại thành công');
      setAssignModal(false);
      setAssignData({ staffId: '', notes: '' });
      fetchComplaints();
      fetchStatistics();
    } catch (error) {
      console.error('Lỗi phân công:', error);
      alert('Không thể phân công khiếu nại');
    }
  };

  const handleResolve = async () => {
    if (!resolveData.resolution.trim()) {
      alert('Vui lòng nhập kết quả xử lý');
      return;
    }

    try {
      if (resolveData.status === 'RESOLVED') {
        await resolveComplaint(selectedComplaint.id, resolveData.resolution);
      } else {
        await closeComplaint(selectedComplaint.id, resolveData.resolution);
      }
      
      alert(`Đã ${resolveData.status === 'RESOLVED' ? 'giải quyết' : 'từ chối'} khiếu nại`);
      setResolveModal(false);
      setResolveData({ status: 'RESOLVED', resolution: '' });
      fetchComplaints();
      fetchStatistics();
    } catch (error) {
      console.error('Lỗi xử lý khiếu nại:', error);
      alert('Không thể xử lý khiếu nại');
    }
  };

  const handleStaffComplete = async () => {
    if (!staffCompleteData.staffNotes.trim()) {
      alert('Vui lòng nhập ghi chú về công việc đã làm');
      return;
    }

    try {
      await staffCompleteComplaint(selectedComplaint.id, staffCompleteData.staffNotes);
      alert('Đã đánh dấu hoàn thành! Admin sẽ xem xét và duyệt.');
      setStaffCompleteModal(false);
      setStaffCompleteData({ staffNotes: '' });
      fetchComplaints();
      fetchStatistics();
    } catch (error) {
      console.error('Lỗi hoàn thành khiếu nại:', error);
      alert('Không thể đánh dấu hoàn thành');
    }
  };

  const handleAdminApprove = async () => {
    if (!approveData.resolution.trim()) {
      alert('Vui lòng nhập kết quả xử lý cuối cùng');
      return;
    }

    try {
      await adminApproveComplaint(selectedComplaint.id, approveData.resolution);
      alert('Đã duyệt khiếu nại thành công!');
      setAdminApproveModal(false);
      setApproveData({ resolution: '' });
      fetchComplaints();
      fetchStatistics();
    } catch (error) {
      console.error('Lỗi duyệt khiếu nại:', error);
      alert('Không thể duyệt khiếu nại');
    }
  };

  const handleAdminReject = async () => {
    if (!rejectData.reason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await adminRejectComplaint(selectedComplaint.id, rejectData.reason);
      alert('Đã từ chối khiếu nại');
      setResolveModal(false);
      setRejectData({ reason: '' });
      fetchComplaints();
      fetchStatistics();
    } catch (error) {
      console.error('Lỗi từ chối khiếu nại:', error);
      alert('Không thể từ chối khiếu nại');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Chờ xử lý', class: 'pending' },
      'IN_PROGRESS': { label: 'Đang xử lý', class: 'in-progress' },
      'STAFF_COMPLETED': { label: 'Staff hoàn thành', class: 'staff-completed' },
      'RESOLVED': { label: 'Đã giải quyết', class: 'resolved' },
      'REJECTED': { label: 'Từ chối', class: 'rejected' },
      'CLOSED': { label: 'Đã đóng', class: 'closed' }
    };
    const info = statusMap[status] || { label: status, class: '' };
    return <span className={`complaint-status ${info.class}`}>{info.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'LOW': { label: 'Thấp', class: 'low' },
      'MEDIUM': { label: 'Trung bình', class: 'medium' },
      'HIGH': { label: 'Cao', class: 'high' },
      'URGENT': { label: 'Khẩn cấp', class: 'urgent' }
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

  // Filter and sort complaints
  const getFilteredAndSortedComplaints = () => {
    let filtered = complaints;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id?.toString().includes(searchTerm)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priority':
        const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        filtered = [...filtered].sort((a, b) => 
          (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredComplaints = getFilteredAndSortedComplaints();

  return (
    <div className="admin-content complaints-modern">
      {/* Header with Actions */}
      <div className="complaints-header-modern">
        <div className="header-left">
          <h3>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '12px' }}>
              <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M13,14H11V12H13M13,10H11V6H13"/>
            </svg>
            Quản lý khiếu nại
          </h3>
          <p className="header-subtitle">Theo dõi và xử lý khiếu nại từ khách hàng</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Xem dạng lưới"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3"/>
              </svg>
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="Xem dạng danh sách"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="stats-dashboard-modern">
          <div className="stat-card-modern total">
            <div className="stat-icon-modern">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3"/>
              </svg>
            </div>
            <div className="stat-content-modern">
              <div className="stat-value">{statistics.totalCount || 0}</div>
              <div className="stat-label">Tổng số khiếu nại</div>
            </div>
          </div>

          <div className="stat-card-modern pending">
            <div className="stat-icon-modern">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
              </svg>
            </div>
            <div className="stat-content-modern">
              <div className="stat-value">{statistics.pendingCount || 0}</div>
              <div className="stat-label">Chờ xử lý</div>
            </div>
          </div>

          <div className="stat-card-modern in-progress">
            <div className="stat-icon-modern">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,2.03V2.05L13,4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 13,19.93V21.93C18.5,21.38 22.5,16.5 21.95,11C21.5,6.25 17.73,2.5 13,2.03M11,2.06C9.05,2.25 7.19,3 5.67,4.26L7.1,5.74C8.22,4.84 9.57,4.26 11,4.06V2.06M4.26,5.67C3,7.19 2.25,9.04 2.05,11H4.05C4.24,9.58 4.8,8.23 5.69,7.1L4.26,5.67M2.06,13C2.26,14.96 3.03,16.81 4.27,18.33L5.69,16.9C4.81,15.77 4.24,14.42 4.06,13H2.06M7.1,18.37L5.67,19.74C7.18,21 9.04,21.79 11,22V20C9.58,19.82 8.23,19.25 7.1,18.37M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
              </svg>
            </div>
            <div className="stat-content-modern">
              <div className="stat-value">{statistics.inProgressCount || 0}</div>
              <div className="stat-label">Đang xử lý</div>
            </div>
          </div>

          <div className="stat-card-modern resolved">
            <div className="stat-icon-modern">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
              </svg>
            </div>
            <div className="stat-content-modern">
              <div className="stat-value">{statistics.resolvedCount || 0}</div>
              <div className="stat-label">Đã giải quyết</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="complaints-toolbar">
        <div className="toolbar-left">
          <div className="search-box-modern">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
            </svg>
            <input 
              type="text"
              placeholder="Tìm kiếm theo ID, khách hàng, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
            )}
          </div>

          <div className="sort-dropdown">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="priority">Ưu tiên</option>
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="filter-chips">
            <button 
              className={`chip ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              Tất cả ({complaints.length})
            </button>
            <button 
              className={`chip pending ${filter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setFilter('PENDING')}
            >
              Chờ xử lý ({statistics?.pendingCount || 0})
            </button>
            <button 
              className={`chip in-progress ${filter === 'IN_PROGRESS' ? 'active' : ''}`}
              onClick={() => setFilter('IN_PROGRESS')}
            >
              Đang xử lý ({statistics?.inProgressCount || 0})
            </button>
            <button 
              className={`chip staff-completed ${filter === 'STAFF_COMPLETED' ? 'active' : ''}`}
              onClick={() => setFilter('STAFF_COMPLETED')}
            >
              Staff hoàn thành
            </button>
            <button 
              className={`chip resolved ${filter === 'RESOLVED' ? 'active' : ''}`}
              onClick={() => setFilter('RESOLVED')}
            >
              Đã giải quyết ({statistics?.resolvedCount || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Display */}
      {loading ? (
        <div className="loading-state-modern">
          <div className="spinner-modern"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="empty-state-modern">
          <div style={{ fontSize: '60px', marginBottom: '16px', opacity: '0.6' }}><i className="fas fa-inbox"></i></div>
          <h3>Không tìm thấy khiếu nại nào</h3>
          <p>{searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có khiếu nại nào trong danh sách'}</p>
        </div>
      ) : (
        <div className={`complaints-container-modern ${viewMode}`}>
          {filteredComplaints.map(complaint => (
            <div key={complaint.id} className="complaint-card-modern" onClick={() => {
              setSelectedComplaint(complaint);
              setDetailModal(true);
            }}>
              <div className="card-header-modern">
                <div className="card-id">
                  <span className="id-badge">#{complaint.id}</span>
                  <span className="category-label">{getCategoryLabel(complaint.category)}</span>
                </div>
                <div className="card-badges">
                  {getStatusBadge(complaint.status)}
                  {getPriorityBadge(complaint.priority)}
                </div>
              </div>

              <div className="card-body-modern">
                <p className="complaint-description-modern">
                  {complaint.description?.length > 150 
                    ? complaint.description.substring(0, 150) + '...' 
                    : complaint.description}
                </p>
              </div>

              <div className="card-footer-modern">
                <div className="customer-info-modern">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                  <span>{complaint.userName || 'N/A'}</span>
                </div>
                <div className="date-info-modern">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                  </svg>
                  <span>{new Date(complaint.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {complaint.assignedStaffName && (
                <div className="assigned-staff-modern">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                  <span>Phụ trách: {complaint.assignedStaffName}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && selectedComplaint && (
        <div className="modal-overlay-modern" onClick={() => setDetailModal(false)}>
          <div className="modal-content-modern large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div>
                <h3>Chi tiết khiếu nại #{selectedComplaint.id}</h3>
                <p>{getCategoryLabel(selectedComplaint.category)}</p>
              </div>
              <button className="modal-close-modern" onClick={() => setDetailModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </button>
            </div>

            <div className="modal-body-modern">
              {/* Status and Priority */}
              <div className="detail-section">
                <div className="detail-badges-row">
                  {getStatusBadge(selectedComplaint.status)}
                  {getPriorityBadge(selectedComplaint.priority)}
                </div>
              </div>

              {/* Customer Information */}
              <div className="detail-section">
                <h4 className="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                  Thông tin khách hàng
                </h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Họ tên:</span>
                    <span className="info-value">{selectedComplaint.userName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedComplaint.userEmail}</span>
                  </div>
                  {selectedComplaint.bookingId && (
                    <div className="info-item">
                      <span className="info-label">Booking:</span>
                      <span className="info-value">#{selectedComplaint.bookingId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Complaint Description */}
              <div className="detail-section">
                <h4 className="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  Nội dung khiếu nại
                </h4>
                <div className="complaint-content-box">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedComplaint.adminNotes && (
                <div className="detail-section">
                  <h4 className="section-title admin">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                    </svg>
                    Ghi chú từ Admin
                  </h4>
                  <div className="note-box admin">
                    {selectedComplaint.adminNotes}
                  </div>
                </div>
              )}

              {/* Staff Notes */}
              {selectedComplaint.staffNotes && (
                <div className="detail-section">
                  <h4 className="section-title staff">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                    </svg>
                    Ghi chú từ nhân viên
                  </h4>
                  <div className="note-box staff">
                    {selectedComplaint.staffNotes}
                    <small className="note-timestamp">
                      {new Date(selectedComplaint.staffCompletedAt).toLocaleString('vi-VN')}
                    </small>
                  </div>
                </div>
              )}

              {/* Resolution */}
              {selectedComplaint.resolution && (
                <div className="detail-section">
                  <h4 className="section-title resolved">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                    </svg>
                    Kết quả xử lý
                  </h4>
                  <div className="note-box resolved">
                    {selectedComplaint.resolution}
                    <small className="note-timestamp">
                      {new Date(selectedComplaint.resolvedAt).toLocaleString('vi-VN')}
                    </small>
                  </div>
                </div>
              )}

              {/* Assigned Staff */}
              {selectedComplaint.assignedStaffName && (
                <div className="detail-section">
                  <h4 className="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                    </svg>
                    Nhân viên phụ trách
                  </h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-value-large">{selectedComplaint.assignedStaffName}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="detail-actions">
                {selectedComplaint.status === 'PENDING' && (
                  <button 
                    className="btn-action-modern primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailModal(false);
                      setAssignModal(true);
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                    </svg>
                    Phân công nhân viên
                  </button>
                )}
                {selectedComplaint.status === 'STAFF_COMPLETED' && (
                  <>
                    <button 
                      className="btn-action-modern success"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailModal(false);
                        setApproveData({ resolution: '' });
                        setAdminApproveModal(true);
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                      </svg>
                      Duyệt khiếu nại
                    </button>
                    <button 
                      className="btn-action-modern danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailModal(false);
                        setRejectData({ reason: '' });
                        setResolveModal(true);
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                      </svg>
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(false)}>
          <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px 12px 0 0',
              marginBottom: '0'
            }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
                    <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z"/>
                  </svg>
                  Phân công xử lý khiếu nại
                </h3>
                <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
                  Khiếu nại #{selectedComplaint.id}
                </p>
              </div>
              <button 
                className="modal-close" 
                onClick={() => setAssignModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px' }}>
              {/* Complaint Info Card */}
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <div style={{ 
                    fontSize: '32px',
                    background: '#e3f2fd',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-edit" style={{fontSize: '16px'}}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      color: '#2c3e50', 
                      marginBottom: '12px',
                      fontSize: '16px',
                      borderBottom: '2px solid #e3f2fd',
                      paddingBottom: '8px'
                    }}>
                      Nội dung khiếu nại:
                    </div>
                    <div style={{ 
                      color: '#495057', 
                      fontSize: '14px', 
                      lineHeight: '1.6',
                      background: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e7ff',
                      marginBottom: '12px'
                    }}>
                      {selectedComplaint.description}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px',
                      flexWrap: 'wrap',
                      fontSize: '13px'
                    }}>
                      <div style={{
                        background: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid #e0e7ff',
                        color: '#2c3e50'
                      }}>
                        <i className="fas fa-user" style={{marginRight: '6px'}}></i>
                        {selectedComplaint.userName}
                      </div>
                      <div style={{
                        background: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid #e0e7ff',
                        color: '#2c3e50'
                      }}>
                        <i className="fas fa-envelope" style={{marginRight: '6px'}}></i>
                        {selectedComplaint.userEmail}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Selection */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: 600, 
                  color: '#2c3e50',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  Chọn nhân viên xử lý:
                  <span style={{ color: '#dc3545', fontSize: '14px' }}>*</span>
                </label>
                <select 
                  value={assignData.staffId}
                  onChange={(e) => setAssignData({...assignData, staffId: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '14px',
                    border: '2px solid #e3f2fd',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196F3';
                    e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e3f2fd';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staffList.map(staff => {
                    const station = stations.find(s => s.id === staff.stationId);
                    return (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName} ({staff.email})
                        {station ? ` - ${station.name} (${station.province})` : ' - Chưa có trạm'}
                      </option>
                    );
                  })}
                </select>
                {!assignData.staffId && (
                  <div style={{ 
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#fff3cd',
                    borderLeft: '3px solid #ffc107',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#856404'
                  }}>
                    <i className="fas fa-lightbulb"></i> Chọn nhân viên phù hợp với khu vực của khiếu nại
                  </div>
                )}
              </div>

              {/* Notes Input */}
              <div className="form-group">
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: 600, 
                  color: '#2c3e50',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  Hướng dẫn xử lý cho nhân viên:
                </label>
                <textarea 
                  value={assignData.notes}
                  onChange={(e) => setAssignData({...assignData, notes: e.target.value})}
                  placeholder="Nhập hướng dẫn chi tiết về cách xử lý khiếu nại này...&#10;&#10;Ví dụ:&#10;• Liên hệ khách hàng trong vòng 2 giờ&#10;• Kiểm tra tình trạng xe tại địa điểm ABC&#10;• Chuẩn bị phụ tùng thay thế nếu cần&#10;• Báo cáo kết quả sau khi hoàn thành"
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '14px',
                    border: '2px solid #e3f2fd',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196F3';
                    e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e3f2fd';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                />
                <div style={{
                  marginTop: '8px',
                  padding: '10px 12px',
                  background: '#e7f3ff',
                  borderLeft: '3px solid #2196F3',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#0c5460'
                }}>
                  <strong><i className="fas fa-lightbulb"></i> Gợi ý:</strong> Ghi chú càng chi tiết sẽ giúp nhân viên xử lý hiệu quả hơn
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              padding: '20px 24px',
              borderTop: '2px solid #f1f3f5',
              borderRadius: '0 0 12px 12px'
            }}>
              <button 
                className="btn-secondary" 
                onClick={() => setAssignModal(false)}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '2px solid #dee2e6',
                  borderRadius: '10px',
                  background: 'white',
                  color: '#6c757d',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Hủy
              </button>
              <button 
                className="btn-primary" 
                onClick={handleAssign}
                disabled={!assignData.staffId}
                style={{
                  padding: '12px 32px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '10px',
                  background: assignData.staffId 
                    ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' 
                    : '#ccc',
                  color: 'white',
                  cursor: assignData.staffId ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: assignData.staffId ? '0 4px 12px rgba(33, 150, 243, 0.3)' : 'none'
                }}
              >
                Phân công ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal (Admin Reject) */}
      {resolveModal && (
        <div className="modal-overlay" onClick={() => setResolveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px 12px 0 0',
              position: 'relative'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                Từ chối khiếu nại #{selectedComplaint.id}
              </h3>
              <button 
                className="modal-close" 
                onClick={() => setResolveModal(false)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '20px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px' }}>
              <div className="form-group">
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Lý do từ chối: 
                  <span style={{color: '#ef4444', marginLeft: '2px'}}>*</span>
                </label>
                <textarea 
                  value={rejectData.reason}
                  onChange={(e) => setRejectData({...rejectData, reason: e.target.value})}
                  placeholder="Nhập lý do từ chối khiếu nại..."
                  rows="6"
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
            
            <div className="modal-footer" style={{
              padding: '20px 24px',
              background: '#f8fafc',
              borderRadius: '0 0 12px 12px',
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <button 
                className="btn-secondary" 
                onClick={() => setResolveModal(false)}
                style={{
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: '120px',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = '#475569'}
                onMouseLeave={(e) => e.target.style.background = '#64748b'}
              >
                Hủy
              </button>
              <button 
                className="btn-danger"
                onClick={handleAdminReject}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  minWidth: '160px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Complete Modal */}
      {staffCompleteModal && (
        <div className="modal-overlay" onClick={() => setStaffCompleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đánh dấu hoàn thành #{selectedComplaint.id}</h3>
              <button className="modal-close" onClick={() => setStaffCompleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert-info" style={{
                background: '#E3F2FD',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                color: '#1976D2',
                fontSize: '14px'
              }}>
                Vui lòng mô tả công việc bạn đã làm để xử lý khiếu nại này. Admin sẽ xem xét và duyệt.
              </div>
              <div className="form-group">
                <label>Ghi chú công việc đã làm: <span style={{color: 'red'}}>*</span></label>
                <textarea 
                  value={staffCompleteData.staffNotes}
                  onChange={(e) => setStaffCompleteData({...staffCompleteData, staffNotes: e.target.value})}
                  placeholder="Ví dụ: Đã kiểm tra xe, sửa chữa lỗi động cơ, test lại và xe đã hoạt động bình thường..."
                  rows="6"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setStaffCompleteModal(false)}>
                Hủy
              </button>
              <button 
                className="btn-primary"
                onClick={handleStaffComplete}
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)'
                }}
              >
                Xác nhận hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Approve Modal */}
      {adminApproveModal && (
        <div className="modal-overlay" onClick={() => setAdminApproveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px 12px 0 0',
              position: 'relative'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Duyệt khiếu nại #{selectedComplaint.id}
              </h3>
              <button 
                className="modal-close" 
                onClick={() => setAdminApproveModal(false)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '20px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px' }}>
              {selectedComplaint.staffNotes && (
                <div style={{
                  background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  borderLeft: '4px solid #4CAF50',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)'
                }}>
                  <strong style={{
                    color: '#1B5E20',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1B5E20">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    Ghi chú của Staff:
                  </strong>
                  <p style={{
                    margin: 0, 
                    color: '#2E7D32',
                    lineHeight: '1.6',
                    fontSize: '14px'
                  }}>{selectedComplaint.staffNotes}</p>
                </div>
              )}
              
              <div className="form-group">
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Kết quả xử lý cuối cùng: 
                  <span style={{color: '#ef4444', marginLeft: '2px'}}>*</span>
                </label>
                <textarea 
                  value={approveData.resolution}
                  onChange={(e) => setApproveData({...approveData, resolution: e.target.value})}
                  placeholder="Nhập kết quả xử lý cuối cùng (có thể tham khảo ghi chú của staff ở trên)..."
                  rows="6"
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
            
            <div className="modal-footer" style={{
              padding: '20px 24px',
              background: '#f8fafc',
              borderRadius: '0 0 12px 12px',
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <button 
                className="btn-secondary" 
                onClick={() => setAdminApproveModal(false)}
                style={{
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: '120px',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = '#475569'}
                onMouseLeave={(e) => e.target.style.background = '#64748b'}
              >
                Hủy
              </button>
              <button 
                className="btn-primary"
                onClick={handleAdminApprove}
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  minWidth: '160px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Xác nhận duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component: Lịch sử thuê xe
const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    stationId: '',
    userId: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  
  // Fetch data
  useEffect(() => {
    fetchBookings();
    fetchStations();
  }, []); // Chỉ chạy một lần khi component mount

  useEffect(() => {
    // Debounce fetch khi filters, currentPage, hoặc pageSize thay đổi
    const timeoutId = setTimeout(() => {
      fetchBookings();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, pageSize, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching bookings with filters:', filters, 'page:', currentPage, 'size:', pageSize);
      const response = await getAllBookings(currentPage, pageSize, filters);
      console.log('Bookings response:', response);
      
      if (response && response.content) {
        setBookings(response.content);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } else if (Array.isArray(response)) {
        // Fallback nếu backend trả về array thay vì object với content
        setBookings(response);
        setTotalPages(1);
        setTotalElements(response.length);
      } else {
        setBookings([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      setTotalPages(0);
      setTotalElements(0);
      // Không hiển thị alert để tránh spam khi filter
      if (currentPage === 0) {
        alert('Lỗi khi tải danh sách booking: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await getStations();
      setStations(response);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(0); // Reset to first page when filtering
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      stationId: '',
      userId: '',
      vehicleId: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setCurrentPage(0);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { text: 'Đang chờ', class: 'status-pending' },
      'CONFIRMED': { text: 'Đã xác nhận', class: 'status-confirmed' },
      'ACTIVE': { text: 'Đang thuê', class: 'status-active' },
      'COMPLETED': { text: 'Đã hoàn thành', class: 'status-completed' },
      'CANCELLED': { text: 'Đã hủy', class: 'status-cancelled' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-unknown' };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  return (
    <div className="admin-section">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
            <i className="fas fa-clipboard-list" style={{marginRight: '8px'}}></i>
            Lịch sử thuê xe
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
            Quản lý và theo dõi tất cả các booking của khách hàng
          </p>
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          padding: '12px 20px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}>
          Tổng: {totalElements} booking
        </div>
      </div>
      
      {/* Filters */}
      <div className="booking-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Trạng thái:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Đang chờ</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="ACTIVE">Đang thuê</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Trạm:</label>
            <select 
              value={filters.stationId} 
              onChange={(e) => handleFilterChange('stationId', e.target.value)}
            >
              <option value="">Tất cả trạm</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name} - {station.province}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Từ ngày:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Đến ngày:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-group search-group">
            <label>Tìm kiếm:</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Tìm theo ID booking, tên khách hàng, biển số xe..."
            />
          </div>
          
          <button onClick={clearFilters} className="clear-filters-btn">
            <i className="fas fa-trash" style={{marginRight: '4px'}}></i>
            Xóa bộ lọc
          </button>
        </div>
        
        <div className="filter-info">
          <span>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{marginRight: '4px'}}></i>
                Đang tải...
              </>
            ) : (
              <>
                <i className="fas fa-chart-bar" style={{marginRight: '4px'}}></i>
                Hiển thị {bookings.length} / {totalElements} booking
              </>
            )}
          </span>
          {filters.status || filters.stationId || filters.startDate || filters.endDate || filters.search ? (
            <span style={{ color: '#3b82f6', fontWeight: '600' }}>
              <i className="fas fa-filter" style={{marginRight: '4px'}}></i>
              Đang lọc kết quả
            </span>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="booking-table-container">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <table className="booking-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Trạm</th>
                <th>Thời gian thuê</th>
                <th>Thời gian trả</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    {booking.userInfo ? (
                      <div>
                        <div className="user-name">{booking.userInfo.fullName}</div>
                        <div className="user-email">{booking.userInfo.email}</div>
                      </div>
                    ) : (
                      `User ID: ${booking.userId}`
                    )}
                  </td>
                  <td>
                    {booking.vehicleInfo ? (
                      <div>
                        <div className="vehicle-plate">{booking.vehicleInfo.licensePlate}</div>
                        <div className="vehicle-type">{booking.vehicleInfo.type}</div>
                      </div>
                    ) : (
                      `Vehicle ID: ${booking.vehicleId}`
                    )}
                  </td>
                  <td>
                    {stations.find(s => s.id === booking.startStationId)?.name || `Station ${booking.startStationId}`}
                  </td>
                  <td>{formatDateTime(booking.estimatedStartTime)}</td>
                  <td>{formatDateTime(booking.estimatedEndTime)}</td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>{formatCurrency(booking.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {bookings.length === 0 && !loading && (
          <div className="no-data">Không có dữ liệu</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="booking-pagination">
          <div className="pagination-info">
            <span>Trang {currentPage + 1} / {totalPages}</span>
          </div>
          
          <div className="pagination-controls">
            <button 
              onClick={() => handlePageChange(0)} 
              disabled={currentPage === 0}
            >
              Đầu
            </button>
            
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 0}
            >
              Trước
            </button>
            
            <span className="pagination-current">
              {currentPage + 1} / {totalPages}
            </span>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage >= totalPages - 1}
            >
              Sau
            </button>
            
            <button 
              onClick={() => handlePageChange(totalPages - 1)} 
              disabled={currentPage >= totalPages - 1}
            >
              Cuối
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
