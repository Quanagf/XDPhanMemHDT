 const base = '/api/stations';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function getStations() {
  const res = await fetch(base, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch stations');
  return res.json();
}

export async function getStation(id) {
  const res = await fetch(`${base}/${id}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch station');
  return res.json();
}

export async function getProvinces() {
  const res = await fetch(`${base}/provinces`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch provinces');
  return res.json();
}
