import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/incident-reports';

// Lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Tạo báo cáo sự cố mới (Staff/Admin)
export const createIncidentReport = async (reportData) => {
  try {
    const response = await axios.post(API_BASE_URL, reportData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating incident report:', error);
    throw error;
  }
};

// Lấy tất cả báo cáo với filter và pagination (Admin)
export const getAllIncidentReports = async (params = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      headers: getAuthHeaders(),
      params: {
        page: params.page || 0,
        size: params.size || 10,
        sortBy: params.sortBy || 'createdAt',
        sortDirection: params.sortDirection || 'desc',
        status: params.status || null,
        priority: params.priority || null,
        category: params.category || null,
        reporterId: params.reporterId || null,
        keyword: params.keyword || null
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching incident reports:', error);
    throw error;
  }
};

// Lấy báo cáo của nhân viên đang đăng nhập
export const getMyIncidentReports = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-reports`, {
      headers: getAuthHeaders(),
      params: {
        page: params.page || 0,
        size: params.size || 10,
        sortBy: params.sortBy || 'createdAt',
        sortDirection: params.sortDirection || 'desc'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my incident reports:', error);
    throw error;
  }
};

// Lấy một báo cáo theo ID
export const getIncidentReportById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching incident report:', error);
    throw error;
  }
};

// Cập nhật báo cáo (Admin)
export const updateIncidentReport = async (id, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, updateData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating incident report:', error);
    throw error;
  }
};

// Gán báo cáo cho admin
export const assignIncidentReport = async (id, adminId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/assign`, 
      { adminId }, 
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error assigning incident report:', error);
    throw error;
  }
};

// Giải quyết báo cáo
export const resolveIncidentReport = async (id, resolutionNote) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/resolve`, 
      { resolutionNote }, 
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error resolving incident report:', error);
    throw error;
  }
};

// Đóng báo cáo
export const closeIncidentReport = async (id) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/close`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error closing incident report:', error);
    throw error;
  }
};

// Xóa báo cáo
export const deleteIncidentReport = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting incident report:', error);
    throw error;
  }
};

// Lấy thống kê báo cáo
export const getIncidentReportStatistics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching incident report statistics:', error);
    throw error;
  }
};

// Lấy báo cáo theo khoảng thời gian
export const getIncidentReportsByDateRange = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/by-date-range`, {
      headers: getAuthHeaders(),
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching incident reports by date range:', error);
    throw error;
  }
};

// Hàm helper để format priority
export const formatPriority = (priority) => {
  const priorities = {
    'LOW': 'Thấp',
    'MEDIUM': 'Trung bình',
    'HIGH': 'Cao',
    'CRITICAL': 'Khẩn cấp'
  };
  return priorities[priority] || priority;
};

// Hàm helper để format status
export const formatStatus = (status) => {
  const statuses = {
    'PENDING': 'Chờ xử lý',
    'IN_PROGRESS': 'Đang xử lý',
    'RESOLVED': 'Đã giải quyết',
    'CLOSED': 'Đã đóng',
    'REJECTED': 'Đã từ chối'
  };
  return statuses[status] || status;
};

// Hàm helper để lấy màu theo priority
export const getPriorityColor = (priority) => {
  const colors = {
    'LOW': '#52c41a',
    'MEDIUM': '#faad14',
    'HIGH': '#ff7a45',
    'CRITICAL': '#f5222d'
  };
  return colors[priority] || '#666';
};

// Hàm helper để lấy màu theo status
export const getStatusColor = (status) => {
  const colors = {
    'PENDING': '#faad14',
    'IN_PROGRESS': '#1890ff',
    'RESOLVED': '#52c41a',
    'CLOSED': '#8c8c8c',
    'REJECTED': '#f5222d'
  };
  return colors[status] || '#666';
};
