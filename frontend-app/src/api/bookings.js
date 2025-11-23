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

// Lấy lịch sử booking của user
export async function getMyBookings() {
  const res = await fetch(`${base}/my-history`, { 
    headers: getAuthHeader() 
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
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
