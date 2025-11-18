import axios from 'axios';

const API_URL = '/api';

// Create a new complaint
export const createComplaint = async (complaintData) => {
  const token = localStorage.getItem('authToken');
  const userId = JSON.parse(localStorage.getItem('userProfile')).id;
  
  const response = await axios.post(`${API_URL}/complaints`, complaintData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': userId
    }
  });
  return response.data;
};

// Get my complaints
export const getMyComplaints = async () => {
  const token = localStorage.getItem('authToken');
  const userId = JSON.parse(localStorage.getItem('userProfile')).id;
  
  const response = await axios.get(`${API_URL}/my-complaints`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': userId
    }
  });
  return response.data;
};

// Close a complaint
export const closeComplaint = async (complaintId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await axios.post(`${API_URL}/complaints/${complaintId}/close`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// ============ ADMIN/STAFF ENDPOINTS ============

// Get all complaints (admin/staff)
export const getAllComplaints = async (status = null) => {
  const token = localStorage.getItem('authToken');
  let url = `${API_URL}/admin/complaints`;
  if (status) {
    url += `?status=${status}`;
  }
  
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Assign complaint to staff
export const assignComplaint = async (complaintId, staffId, adminNotes = '') => {
  const token = localStorage.getItem('authToken');
  
  const response = await axios.post(`${API_URL}/admin/complaints/${complaintId}/assign`, 
    { 
      staffId,
      adminNotes 
    }, 
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Resolve or reject a complaint
export const resolveComplaint = async (complaintId, resolveData) => {
  const token = localStorage.getItem('authToken');
  const userProfile = JSON.parse(localStorage.getItem('userProfile'));
  const userId = userProfile?.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }
  
  const response = await axios.post(`${API_URL}/admin/complaints/${complaintId}/resolve`, 
    resolveData, 
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': userId.toString()
      }
    }
  );
  return response.data;
};

// Get complaint statistics
export const getComplaintStatistics = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await axios.get(`${API_URL}/admin/complaints/statistics`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// ============ STAFF ENDPOINTS ============

// Staff completes work on complaint
export const staffCompleteComplaint = async (complaintId, staffNotes) => {
  const token = localStorage.getItem('authToken');
  const userProfile = JSON.parse(localStorage.getItem('userProfile'));
  const userId = userProfile?.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }
  
  const response = await axios.post(`${API_URL}/staff/complaints/${complaintId}/complete`, 
    { staffNotes }, 
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': userId.toString()
      }
    }
  );
  return response.data;
};

// Admin approves staff's work
export const adminApproveComplaint = async (complaintId, resolution) => {
  const token = localStorage.getItem('authToken');
  const userProfile = JSON.parse(localStorage.getItem('userProfile'));
  const userId = userProfile?.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }
  
  const response = await axios.post(`${API_URL}/admin/complaints/${complaintId}/approve`, 
    { resolution }, 
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': userId.toString()
      }
    }
  );
  return response.data;
};

// Admin rejects complaint (not relevant)
export const adminRejectComplaint = async (complaintId, reason) => {
  const token = localStorage.getItem('authToken');
  const userProfile = JSON.parse(localStorage.getItem('userProfile'));
  const userId = userProfile?.id;
  
  if (!userId) {
    throw new Error('User ID not found');
  }
  
  const response = await axios.post(`${API_URL}/admin/complaints/${complaintId}/reject`, 
    { reason }, 
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': userId.toString()
      }
    }
  );
  return response.data;
};
