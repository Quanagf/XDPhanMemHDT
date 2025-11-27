const base = '/api/reports';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Thống kê tỷ lệ sử dụng xe (số chuyến, giờ cao/thấp điểm)
export async function getVehicleUtilizationStats() {
  const res = await fetch(`${base}/vehicle-utilization`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch vehicle utilization stats');
  return res.json();
}

// Báo cáo doanh thu theo quý
export async function getRevenueByQuarter(year) {
  const res = await fetch(`${base}/revenue-by-quarter?year=${year}`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch quarterly revenue');
  return res.json();
}

// Báo cáo doanh thu theo năm
export async function getRevenueByYear(startYear, endYear) {
  const res = await fetch(`${base}/revenue-by-year?startYear=${startYear}&endYear=${endYear}`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch yearly revenue');
  return res.json();
}

// Thống kê giờ cao điểm/thấp điểm
export async function getPeakHoursAnalysis() {
  const res = await fetch(`${base}/peak-hours`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch peak hours analysis');
  return res.json();
}

// Thống kê theo xe cụ thể
export async function getVehicleStats(vehicleId) {
  const res = await fetch(`${base}/vehicle/${vehicleId}/stats`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch vehicle stats');
  return res.json();
}

// Doanh thu theo trạm
export async function getRevenueByStation() {
  const res = await fetch(`${base}/revenue-by-station`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch station revenue');
  return res.json();
}
