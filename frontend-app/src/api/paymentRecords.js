import axios from 'axios';

const API_BASE_URL = '/api/payment-records';

// Lấy tất cả payment records theo booking ID
export const getPaymentRecordsByBooking = async (bookingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/booking/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment records:', error);
    throw error;
  }
};

// Tính tổng tiền đã thanh toán cho booking
export const getTotalPaidAmount = async (bookingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/booking/${bookingId}/total`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching total paid amount:', error);
    throw error;
  }
};

// Kiểm tra đã thanh toán cọc chưa
export const hasDepositPaid = async (bookingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/booking/${bookingId}/has-deposit`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking deposit payment:', error);
    throw error;
  }
};

// Tạo payment record (internal - được gọi từ backend)
export const createPaymentRecord = async (paymentData) => {
  try {
    const response = await axios.post(API_BASE_URL, paymentData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw error;
  }
};
