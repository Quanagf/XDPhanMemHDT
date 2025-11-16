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
