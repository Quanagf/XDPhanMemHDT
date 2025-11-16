const base = '/api/vehicles';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function getVehicles(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.stationId) queryParams.append('stationId', params.stationId);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const url = queryParams.toString() ? `${base}?${queryParams}` : base;
  const res = await fetch(url, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function getVehicle(id) {
  const res = await fetch(`${base}/${id}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch vehicle');
  return res.json();
}

export async function createVehicle(payload) {
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to create vehicle' }));
    throw new Error(errorData.error || errorData.message || `HTTP ${res.status}: Failed to create vehicle`);
  }
  return res.json();
}

export async function updateVehicle(id, payload) {
  const res = await fetch(`${base}/${id}/details`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to update vehicle' }));
    throw new Error(errorData.error || errorData.message || `HTTP ${res.status}: Failed to update vehicle`);
  }
  return res.json();
}

export async function deleteVehicle(id) {
  const res = await fetch(`${base}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to delete vehicle');
  return res.ok;
}
