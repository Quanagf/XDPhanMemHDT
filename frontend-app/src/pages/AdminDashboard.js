import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/admin.css';
import '../styles/components/verification.css';
import '../styles/components/handover.css';
import '../styles/components/form.css';
import vehicleService from '../utils/vehicleService';
import { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicles';

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
              <span className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                </svg>
              </span>
              Quản lý trạm
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
            
            {/* Nút đăng xuất */}
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
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {activeTab === 'vehicles' && <VehicleManagement />}
          {activeTab === 'customers' && <CustomerManagement />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'stations' && <StationManagement />}
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
    fetchVehicles();
  }, []);

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
      const res = await fetch('/api/vehicles', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data || []);
      }
    } catch (err) {
      console.error('fetchVehicles', err);
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

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
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
        await updateVehicle(editing.id, payload);
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
        const created = await createVehicle(payload);
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
      alert('Lỗi khi lưu xe: ' + (err.message || err.toString()));
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
      await deleteVehicle(id);
      fetchVehicles();
    } catch (err) {
      console.error('handleDelete', err);
      alert('Không thể xóa xe');
    }
  };

  return (
    <div className="staff-section">
      <h1>Quản lý xe tại điểm</h1>

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
        <button className="admin-btn-primary">Tìm kiếm</button>
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
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
                <button className="admin-btn-action">Xem hồ sơ</button>
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
                <button className="admin-btn-action">Xem hồ sơ</button>
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
          className="admin-btn-success"
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
                    className="admin-btn-action"
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
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStationId, setDeletingStationId] = useState(null);
  const [deletingStationName, setDeletingStationName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
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
              <th>Tên trạm</th>
              <th>Địa chỉ</th>
              <th>Điện thoại</th>
              <th>Tỉnh/TP</th>
              <th>Vĩ độ</th>
              <th>Kinh độ</th>
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
                <td>{station.latitude || '-'}</td>
                <td>{station.longitude || '-'}</td>
                <td>
                  <span className="badge badge-info">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.3rem'}}>
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3C15 2.45 14.55 2 14 2H10C9.45 2 9 2.45 9 3V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z"/>
                    </svg>
                    {station.capacity || 0} xe
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    station.status === 'OPEN' ? 'badge-success' : 
                    station.status === 'CLOSED' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {station.status === 'OPEN' ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.3rem'}}>
                          <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                        </svg>
                        Hoạt động
                      </>
                    ) : station.status === 'CLOSED' ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.3rem'}}>
                          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                        </svg>
                        Đóng cửa
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.3rem'}}>
                          <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                        </svg>
                        Tạm ngừng
                      </>
                    )}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(station)} className="admin-btn-action">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.3rem'}}>
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                    </svg>
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(station)} className="admin-btn-action danger">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '0.3rem'}}>
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                    </svg>
                    Xóa
                  </button>
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

      {/* Charts */}
      <div className="chart-section">
        <h2>Doanh thu theo điểm thuê</h2>
        <div className="chart-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#64748b" style={{marginBottom: '1rem'}}>
            <path d="M6,16.5L3,19.44V11H6M11,14.66L9.43,13.32L8,14.64V7H11M16,13L13,16V3H16M18.81,12.81L17,11H22V16L20.21,14.21L13.41,21H10.59L18.81,12.81Z"/>
          </svg>
          <p>Biểu đồ sẽ được hiển thị ở đây</p>
          <p>(Sử dụng thư viện Chart.js hoặc Recharts)</p>
        </div>
      </div>

      <div className="chart-section">
        <h2>Tỷ lệ sử dụng xe theo giờ</h2>
        <div className="chart-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#64748b" style={{marginBottom: '1rem'}}>
            <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z"/>
          </svg>
          <p>Biểu đồ đường sẽ được hiển thị ở đây</p>
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
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#94a3b8">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L12,15H9V10H13V12L11,16H14V19H10Z"/>
          </svg>
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
                    <strong>{doc.documentType === 'LICENSE' ? '🚗 GPLX' : '🪪 CCCD'}</strong>
                    <span className="doc-date">{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  <div className="doc-info-compact">
                    <p><strong>{doc.fullName}</strong> (@{doc.username})</p>
                    {doc.status === 'REJECTED' && doc.rejectionReason && (
                      <p className="rejection-reason">❌ {doc.rejectionReason}</p>
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
                          <option value="REJECTED">✗ Từ chối</option>
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
                            className="btn-confirm"
                            onClick={() => handleVerify(doc.id)}
                          >
                            {verifyForm.action === 'APPROVED' ? 'Xác thực' : 'Từ chối'}
                          </button>
                          <button 
                            className="btn-cancel"
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
                        className="btn-action-compact"
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

export default AdminDashboard;
