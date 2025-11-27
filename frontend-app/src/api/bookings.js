const base = '/api/bookings';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Kiểm tra xe đã được booking trong khoảng thời gian
export async function checkAvailability(startTime, endTime) {
  const queryParams = new URLSearchParams();
  queryParams.append('startTime', startTime);
  queryParams.append('endTime', endTime);
  
  const url = `${base}/check-availability?${queryParams}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to check availability');
  return res.json(); // Trả về array of vehicleIds đã được booking
}

// Tạo booking mới
export async function createBooking(payload) {
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to create booking' }));
    throw new Error(errorData.error || errorData.message || `HTTP ${res.status}: Failed to create booking`);
  }
  return res.json();
}

// Lấy lịch sử booking của user (chỉ dữ liệu cơ bản)
export async function getMyBookings() {
  const res = await fetch(`${base}/my-history`, { 
    headers: getAuthHeader() 
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

// Lấy lịch sử booking với thông tin đầy đủ (user + vehicle info)
export async function getMyBookingsWithDetails() {
  const res = await fetch(`${base}/my-history/details`, { 
    headers: getAuthHeader() 
  });
  if (!res.ok) throw new Error('Failed to fetch bookings with details');
  return res.json();
}

// Lấy booking đang chờ xử lý tại trạm (cho staff)
export async function getPendingBookingsByStation(stationId) {
  const res = await fetch(`${base}/station/${stationId}/pending`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch pending bookings');
  return res.json();
}

// Lấy booking đang chờ xử lý với thông tin chi tiết (cho staff)
export async function getPendingBookingsWithDetailsForStation(stationId) {
  const res = await fetch(`${base}/station/${stationId}/pending-detailed`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch detailed pending bookings');
  return res.json();
}

// Lấy booking ACTIVE cần nhận xe với thông tin chi tiết (cho staff)
export async function getActiveBookingsWithDetailsForStation(stationId) {
  const res = await fetch(`${base}/station/${stationId}/active-detailed`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch detailed active bookings');
  return res.json();
}

// Lấy tất cả booking tại trạm (cho staff)
export async function getStationBookings(stationId) {
  const res = await fetch(`${base}/station/${stationId}`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch station bookings');
  return res.json();
}

// Giao xe (check-in)
export async function checkInVehicle(bookingId, checkInData) {
  const res = await fetch(`${base}/${bookingId}/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(checkInData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to check in vehicle' }));
    throw new Error(errorData.error || errorData.message || `HTTP ${res.status}: Failed to check in vehicle`);
  }
  return res.json();
}

// Nhận xe (check-out)  
export async function checkOutVehicle(bookingId, checkOutData) {
  const res = await fetch(`${base}/${bookingId}/check-out`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(checkOutData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to check out vehicle' }));
    throw new Error(errorData.error || errorData.message || `HTTP ${res.status}: Failed to check out vehicle`);
  }
  return res.json();
}

// Upload ảnh lên Minio
export async function uploadImage(file, folder = 'bookings') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload/image', {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData
  });

  if (!res.ok) {
    throw new Error('Failed to upload image');
  }

  return res.json(); // { imageUrl: "http://..." }
}

// Upload ảnh xe
export async function uploadVehicleImage(file, bookingId) {
  return uploadImage(file, `vehicles/booking-${bookingId}`);
}

// Upload ảnh bằng lái
export async function uploadLicenseImage(file, bookingId) {
  return uploadImage(file, `licenses/booking-${bookingId}`);
}

// Lấy thông tin countdown cho booking
export async function getBookingCountdown(bookingId) {
  const res = await fetch(`${base}/${bookingId}/countdown`);
  if (!res.ok) {
    if (res.status === 404) {
      return null; // Booking không tồn tại
    }
    throw new Error('Failed to get countdown info');
  }
  return res.json();
}

// Xác nhận booking (cho staff)
export async function confirmBooking(bookingId) {
  const res = await fetch(`${base}/${bookingId}/confirm`, {
    method: 'POST',
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to confirm booking' }));
    throw new Error(errorData.error || errorData.message || `HTTP ${res.status}: Failed to confirm booking`);
  }
  return res.json();
}

// Từ chối booking (cho staff)
export async function rejectBooking(bookingId, reason) {
  const queryParams = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  const res = await fetch(`${base}/${bookingId}/reject${queryParams}`, {
    method: 'POST',
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to reject booking' }));
    throw new Error(errorData.error || errorData.message || `HTTP ${res.status}: Failed to reject booking`);
  }
  return res.json();
}

// Lấy tất cả booking cho admin với phân trang và lọc
export async function getAllBookings(page = 0, size = 10, filters = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page);
  queryParams.append('size', size);
  
  // Thêm các filter nếu có
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.stationId) queryParams.append('stationId', filters.stationId);
  if (filters.userId) queryParams.append('userId', filters.userId);
  if (filters.vehicleId) queryParams.append('vehicleId', filters.vehicleId);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.search) queryParams.append('search', filters.search);
  
  const url = `${base}/admin/all?${queryParams}`;
  console.log('🔍 API Call:', url);
  console.log('📊 Filters:', filters);
  
  const res = await fetch(url, {
    headers: getAuthHeader()
  });
  if (!res.ok) {
    console.error('❌ API Error:', res.status, res.statusText);
    throw new Error('Failed to fetch all bookings');
  }
  const data = await res.json();
  console.log('✅ API Response:', data);
  return data;
}

// Lấy lịch sử booking của user cụ thể (cho admin)
export async function getUserBookingHistory(userId, page = 0, size = 20) {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page);
  queryParams.append('size', size);
  queryParams.append('userId', userId);
  
  const url = `${base}/admin/all?${queryParams}`;
  const res = await fetch(url, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch user booking history');
  return res.json();
}
