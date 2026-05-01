export interface Pet {
  id: string;
  petId: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  color: string;
  gender: string;
  microchipId: string;
  vaccinationStatus: 'up-to-date' | 'overdue' | 'not-required' | 'unknown';
  vaccinationNotes: string;
  healthStatus: 'healthy' | 'monitoring' | 'critical' | 'recovering' | 'unknown';
  healthNotes: string;
  temperament: string;
  dietInfo: string;
  specialNeeds: string;
  crateType: string;
  crateSize: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  vetName: string;
  vetPhone: string;
  vetClearance: boolean;
  photoUrl: string;
  createdAt: string;
}

export interface Handler {
  id: string;
  courierId: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  licensePlate: string;
  zone: string;
  status: 'active' | 'inactive' | 'on-delivery' | 'on-break';
  totalDeliveries: number;
  rating: number;
  avatar: string;
  specialization: string;
  certifiedSpecies: string;
  registeredAt: string;
}

export interface Transport {
  id: string;
  trackingId: string;
  petId: string | null;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  origin: string;
  destination: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'returned' | 'paused';
  courierId: string | null;
  transportType: 'road' | 'air' | 'sea';
  cargoType: string;
  weight: string;
  isPaused: boolean;
  pauseCategory?: string;
  pauseReason?: string;
  estimatedDelivery: string;
  progress: number;
  createdAt: string;
  // joined fields
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  petPhotoUrl?: string;
}

export type AdminPage =
  | 'overview' | 'pets' | 'handlers' | 'owners'
  | 'transports' | 'shipments' | 'customers' | 'couriers'
  | 'track-map' | 'messages'
  | 'quotes' | 'reviews' | 'emails' | 'settings';

// ── Backward-compat aliases (used by TrackMap) ───────────────────────────
export type Shipment = Transport;
export type Courier = Handler;

export const generateHandlerId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'PT-HDL-';
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
};

export const generateCourierId = generateHandlerId;

export const generateTrackingId = (): string => {
  const num = Math.floor(1000 + Math.random() * 9000);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const suffix = chars.charAt(Math.floor(Math.random() * chars.length)) + Math.floor(Math.random() * 10);
  return `PT-${num}-${suffix}`;
};

export const generatePetId = (): string => {
  const num = Math.floor(100 + Math.random() * 900);
  return `PT-PET-${num}`;
};

export const SPECIES_LIST = ['Dog', 'Cat', 'Horse', 'Bird', 'Reptile', 'Small Mammal', 'Marine/Aquatic', 'Livestock', 'Other'];
export const HEALTH_STATUS_LIST = ['healthy', 'monitoring', 'recovering', 'critical', 'unknown'];
export const VACCINATION_STATUS_LIST = ['up-to-date', 'overdue', 'not-required', 'unknown'];
export const TRANSPORT_TYPES = ['road', 'air', 'sea'];
export const PAUSE_CATEGORIES = ['Vet Hold', 'Weather Delay', 'Documentation Hold', 'Quarantine', 'Comfort Stop', 'Customs', 'Other'];

export const statusColor = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'picked-up': 'bg-blue-100 text-blue-800',
    'in-transit': 'bg-amber-100 text-amber-800',
    'out-for-delivery': 'bg-orange-100 text-orange-800',
    'delivered': 'bg-green-100 text-green-800',
    'paused': 'bg-red-100 text-red-800',
    'returned': 'bg-gray-100 text-gray-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

export const healthColor = (status: string) => {
  const map: Record<string, string> = {
    'healthy': 'text-green-600 bg-green-50',
    'monitoring': 'text-amber-600 bg-amber-50',
    'recovering': 'text-blue-600 bg-blue-50',
    'critical': 'text-red-600 bg-red-50',
    'unknown': 'text-gray-500 bg-gray-50',
  };
  return map[status] || 'text-gray-500 bg-gray-50';
};

export const speciesEmoji = (species: string) => {
  const map: Record<string, string> = {
    'Dog': '🐕', 'Cat': '🐈', 'Horse': '🐎', 'Bird': '🦜',
    'Reptile': '🦎', 'Small Mammal': '🐰', 'Marine/Aquatic': '🐠',
    'Livestock': '🐄', 'Other': '🐾',
  };
  return map[species] || '🐾';
};
