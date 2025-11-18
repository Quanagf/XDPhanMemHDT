import axios from 'axios';

const API_URL = 'http://localhost:8081/api/admin/customers';

// Create a new customer
export const createCustomer = async (customerData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await axios.post(API_URL, customerData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Get all customers with optional filter
export const getAllCustomers = async (isRisky = null) => {
  const token = localStorage.getItem('authToken');
  let url = API_URL;
  if (isRisky !== null) {
    url += `?isRisky=${isRisky}`;
  }
  
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Get customer by ID
export const getCustomerById = async (customerId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await axios.get(`${API_URL}/${customerId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Update customer
export const updateCustomer = async (customerId, updateData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await axios.put(`${API_URL}/${customerId}`, updateData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Delete customer
export const deleteCustomer = async (customerId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await axios.delete(`${API_URL}/${customerId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Add risk point
export const addRiskPoint = async (customerId, riskData) => {
  const token = localStorage.getItem('authToken');
  const userId = JSON.parse(localStorage.getItem('userProfile')).id;
  
  const response = await axios.post(`${API_URL}/${customerId}/risk-point`, riskData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': userId
    }
  });
  return response.data;
};

// Reset risk points
export const resetRiskPoints = async (customerId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await axios.post(`${API_URL}/${customerId}/reset-risk`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Get risk point history
export const getRiskPointHistory = async (customerId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await axios.get(`${API_URL}/${customerId}/risk-history`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Get customer statistics
export const getCustomerStatistics = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await axios.get(`${API_URL}/statistics`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};
