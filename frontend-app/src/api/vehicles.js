const base = '/api/vehicles';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function getVehicles() {
  const res = await fetch(base, { headers: getAuthHeader() });
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
  if (!res.ok) throw new Error('Failed to create vehicle');
  return res.json();
}

export async function updateVehicle(id, payload) {
  const res = await fetch(`${base}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update vehicle');
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
