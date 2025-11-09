// vehicleService.js
// Simple client-side vehicle store using localStorage for demo purposes.

const STORAGE_KEY = 'vehicles_v1';

const sampleVehicles = [
  {
    id: 'veh-1',
    battery_level: 85,
    description: 'VINFAST VF3 - Mẫu demo',
    image_url: '/assets/images/cars/tu-nhan-chao-khach-mua-vinfast-vf-3-dat-hon-50-trieu-dong-so-voi-gia-niem-yet-anh5-edited-1723451100085.webp',
    last_maintenance_date: '2025-09-01',
    licence_plate: '30A-12345',
    price_per_hour: 120000,
    status: 'AVAILABLE', // AVAILABLE | RESERVED | RENTED
    type: 'VF3',
    station_id: 'station-1'
  },
  {
    id: 'veh-2',
    battery_level: 25,
    description: 'VINFAST VF5 - Cần sạc',
    image_url: '/assets/images/cars/tu-nhan-chao-khach-mua-vinfast-vf-3-dat-hon-50-trieu-dong-so-voi-gia-niem-yet-anh5-edited-1723451100085.webp',
    last_maintenance_date: '2025-08-15',
    licence_plate: '51F-67890',
    price_per_hour: 90000,
    status: 'AVAILABLE',
    type: 'VF5',
    station_id: 'station-2'
  },
  {
    id: 'veh-3',
    battery_level: 100,
    description: 'Xe đang được đặt trước (demo)',
    image_url: '/assets/images/cars/tu-nhan-chao-khach-mua-vinfast-vf-3-dat-hon-50-trieu-dong-so-voi-gia-niem-yet-anh5-edited-1723451100085.webp',
    last_maintenance_date: '2025-07-20',
    licence_plate: '29B-11111',
    price_per_hour: 150000,
    status: 'RESERVED',
    type: 'VF3',
    station_id: 'station-1'
  }
];

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('vehicleService: failed to read store', e);
    return null;
  }
}

function writeStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('vehicleService: failed to write store', e);
  }
}

export function ensureSeed() {
  const s = readStore();
  if (!s) {
    writeStore(sampleVehicles);
    return sampleVehicles;
  }
  return s;
}

export function getVehicles() {
  const s = readStore();
  if (!s) return ensureSeed();
  return s;
}

export function getVehicleById(id) {
  const v = getVehicles();
  return v.find(x => String(x.id) === String(id));
}

export function addVehicle(vehicle) {
  const v = getVehicles();
  const toAdd = { ...vehicle };
  if (!toAdd.id) toAdd.id = `veh-${Date.now()}`;
  v.unshift(toAdd);
  writeStore(v);
  return toAdd;
}

export function updateVehicle(id, changes) {
  const v = getVehicles();
  const idx = v.findIndex(x => String(x.id) === String(id));
  if (idx === -1) return null;
  v[idx] = { ...v[idx], ...changes };
  writeStore(v);
  return v[idx];
}

export function deleteVehicle(id) {
  let v = getVehicles();
  v = v.filter(x => String(x.id) !== String(id));
  writeStore(v);
  return true;
}

export default {
  ensureSeed,
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicle,
  deleteVehicle
};
