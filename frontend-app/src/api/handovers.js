import axios from 'axios';

const API_BASE_URL = '/api/handovers';

// Lấy danh sách xe cần giao (PICKUP)
export const getPendingPickups = async (stationId, startDate = null, endDate = null, customerName = null) => {
  try {
    const params = new URLSearchParams({ stationId: stationId.toString() });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (customerName) params.append('customerName', customerName);

    const response = await axios.get(`${API_BASE_URL}/pending-pickups?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending pickups:', error);
    throw error;
  }
};

// Hủy booking
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const params = new URLSearchParams();
    if (reason) params.append('reason', reason);
    
    const response = await axios.post(`${API_BASE_URL}/cancel/${bookingId}?${params.toString()}`, null, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Lấy danh sách xe cần nhận trả (RETURN)
export const getPendingReturns = async (stationId, startDate = null, endDate = null, customerName = null) => {
  try {
    const params = new URLSearchParams({ stationId: stationId.toString() });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (customerName) params.append('customerName', customerName);

    const response = await axios.get(`${API_BASE_URL}/pending-returns?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending returns:', error);
    throw error;
  }
};

// Xử lý giao xe (PICKUP)
export const processPickup = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/pickup`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error processing pickup:', error);
    throw error;
  }
};

// Xử lý nhận xe trả (RETURN)
export const processReturn = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/return`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error processing return:', error);
    throw error;
  }
};

// Lấy lịch sử handovers
export const getHandoverHistory = async (bookingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching handover history:', error);
    throw error;
  }
};
