import React, { useState, useEffect } from 'react';
import {
  getAllIncidentReports,
  getIncidentReportStatistics,
  assignIncidentReport,
  resolveIncidentReport,
  closeIncidentReport,
  deleteIncidentReport,
  updateIncidentReport,
  formatPriority,
  formatStatus,
  getPriorityColor,
  getStatusColor
} from '../api/incidentReports';
import { getAllUsers } from '../api/users';
import '../styles/components/incident-reports.css';

const IncidentReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [adminList, setAdminList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    keyword: '',
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  
  // Form data
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  
  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchReports();
    fetchStatistics();
    fetchAdminList();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getAllIncidentReports(filters);
      setReports(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getIncidentReportStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchAdminList = async () => {
    try {
      const users = await getAllUsers();
      const admins = users.filter(u => u.role === 'ADMIN');
      setAdminList(admins);
    } catch (error) {
      console.error('Error fetching admin list:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleAssignClick = (report) => {
    setSelectedReport(report);
    setSelectedAdminId('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedAdminId) {
      alert('Vui lòng chọn admin');
      return;
    }
    
    try {
      await assignIncidentReport(selectedReport.id, parseInt(selectedAdminId));
      alert('Đã gán báo cáo thành công');
      setShowAssignModal(false);
      fetchReports();
      fetchStatistics();
    } catch (error) {
      console.error('Error assigning report:', error);
      alert('Không thể gán báo cáo');
    }
  };

  const handleResolveClick = (report) => {
    setSelectedReport(report);
    setResolutionNote('');
    setShowResolveModal(true);
  };

  const handleResolveSubmit = async () => {
    if (!resolutionNote.trim()) {
      alert('Vui lòng nhập ghi chú giải quyết');
      return;
    }
    
    try {
      await resolveIncidentReport(selectedReport.id, resolutionNote);
      alert('Đã giải quyết báo cáo thành công');
      setShowResolveModal(false);
      fetchReports();
      fetchStatistics();
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Không thể giải quyết báo cáo');
    }
  };

  const handleClose = async (reportId) => {
    if (!window.confirm('Bạn có chắc muốn đóng báo cáo này?')) return;
    
    try {
      await closeIncidentReport(reportId);
      alert('Đã đóng báo cáo thành công');
      fetchReports();
      fetchStatistics();
    } catch (error) {
      console.error('Error closing report:', error);
      alert('Không thể đóng báo cáo');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Bạn có chắc muốn xóa báo cáo này?')) return;
    
    try {
      await deleteIncidentReport(reportId);
      alert('Đã xóa báo cáo thành công');
      fetchReports();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Không thể xóa báo cáo');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="incident-reports-container">
      <h2>Quản Lý Báo Cáo Sự Cố</h2>
      
      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <h3>{statistics.total || 0}</h3>
          <p>Tổng số báo cáo</p>
        </div>
        <div className="stat-card pending">
          <h3>{statistics.pending || 0}</h3>
          <p>Chờ xử lý</p>
        </div>
        <div className="stat-card in-progress">
          <h3>{statistics.inProgress || 0}</h3>
          <p>Đang xử lý</p>
        </div>
        <div className="stat-card resolved">
          <h3>{statistics.resolved || 0}</h3>
          <p>Đã giải quyết</p>
        </div>
        <div className="stat-card closed">
          <h3>{statistics.closed || 0}</h3>
          <p>Đã đóng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          className="search-input"
        />
        
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="IN_PROGRESS">Đang xử lý</option>
          <option value="RESOLVED">Đã giải quyết</option>
          <option value="CLOSED">Đã đóng</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>

        <select 
          value={filters.priority} 
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả mức độ</option>
          <option value="LOW">Thấp</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HIGH">Cao</option>
          <option value="CRITICAL">Khẩn cấp</option>
        </select>

        <input
          type="text"
          placeholder="Danh mục..."
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="filter-input"
        />
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Người báo cáo</th>
                  <th>Danh mục</th>
                  <th>Mức độ</th>
                  <th>Trạng thái</th>
                  <th>Người phụ trách</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">Không có báo cáo nào</td>
                  </tr>
                ) : (
                  reports.map(report => (
                    <tr key={report.id}>
                      <td>{report.id}</td>
                      <td className="title-cell">{report.title}</td>
                      <td>{report.reporterName}</td>
                      <td>{report.category}</td>
                      <td>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(report.priority) }}
                        >
                          {formatPriority(report.priority)}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(report.status) }}
                        >
                          {formatStatus(report.status)}
                        </span>
                      </td>
                      <td>{report.assignedAdminName || '-'}</td>
                      <td>{formatDate(report.createdAt)}</td>
                      <td className="actions-cell">
                        <button 
                          onClick={() => handleViewDetail(report)}
                          className="btn-action btn-view"
                        >
                          Chi tiết
                        </button>
                        {(report.status === 'PENDING' || report.status === 'IN_PROGRESS') && (
                          <button 
                            onClick={() => handleResolveClick(report)}
                            className="btn-action btn-resolve"
                          >
                            Giải quyết
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(report.id)}
                          className="btn-action btn-delete"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 0}
                className="page-btn"
              >
                Trước
              </button>
              <span className="page-info">
                Trang {filters.page + 1} / {totalPages} (Tổng: {totalElements})
              </span>
              <button 
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages - 1}
                className="page-btn"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chi tiết báo cáo sự cố</h3>
            <div className="detail-grid">
              <div className="detail-row">
                <strong>ID:</strong>
                <span>{selectedReport.id}</span>
              </div>
              <div className="detail-row">
                <strong>Tiêu đề:</strong>
                <span>{selectedReport.title}</span>
              </div>
              <div className="detail-row">
                <strong>Mô tả:</strong>
                <span>{selectedReport.description}</span>
              </div>
              <div className="detail-row">
                <strong>Danh mục:</strong>
                <span>{selectedReport.category}</span>
              </div>
              <div className="detail-row">
                <strong>Mức độ:</strong>
                <span style={{ color: getPriorityColor(selectedReport.priority) }}>
                  {formatPriority(selectedReport.priority)}
                </span>
              </div>
              <div className="detail-row">
                <strong>Trạng thái:</strong>
                <span style={{ color: getStatusColor(selectedReport.status) }}>
                  {formatStatus(selectedReport.status)}
                </span>
              </div>
              <div className="detail-row">
                <strong>Người báo cáo:</strong>
                <span>{selectedReport.reporterName} ({selectedReport.reporterEmail})</span>
              </div>
              <div className="detail-row">
                <strong>Người phụ trách:</strong>
                <span>{selectedReport.assignedAdminName || 'Chưa gán'}</span>
              </div>
              <div className="detail-row">
                <strong>Ngày tạo:</strong>
                <span>{formatDate(selectedReport.createdAt)}</span>
              </div>
              <div className="detail-row">
                <strong>Ngày cập nhật:</strong>
                <span>{formatDate(selectedReport.updatedAt)}</span>
              </div>
              {selectedReport.resolvedAt && (
                <div className="detail-row">
                  <strong>Ngày giải quyết:</strong>
                  <span>{formatDate(selectedReport.resolvedAt)}</span>
                </div>
              )}
              {selectedReport.resolutionNote && (
                <div className="detail-row">
                  <strong>Ghi chú giải quyết:</strong>
                  <span>{selectedReport.resolutionNote}</span>
                </div>
              )}
            </div>
            <button onClick={() => setShowDetailModal(false)} className="btn-close-modal">
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Gán báo cáo cho Admin</h3>
            <p><strong>Báo cáo:</strong> {selectedReport.title}</p>
            <div className="form-group">
              <label>Chọn Admin:</label>
              <select 
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
                className="form-select"
              >
                <option value="">-- Chọn Admin --</option>
                {adminList.map(admin => (
                  <option key={admin.userId} value={admin.userId}>
                    {admin.fullName} ({admin.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleAssignSubmit} className="btn-submit">Gán</button>
              <button onClick={() => setShowAssignModal(false)} className="btn-cancel">Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowResolveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Giải quyết báo cáo</h3>
            <p><strong>Báo cáo:</strong> {selectedReport.title}</p>
            <div className="form-group">
              <label>Ghi chú giải quyết:</label>
              <textarea 
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="form-textarea"
                rows="4"
                placeholder="Nhập ghi chú về cách giải quyết..."
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleResolveSubmit} className="btn-submit">Giải quyết</button>
              <button onClick={() => setShowResolveModal(false)} className="btn-cancel">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReportsManagement;
