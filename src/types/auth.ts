export type UserRole = 'consumer' | 'provider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  flatNumber: string;
  deviceId: string;
  walletBalance: number;
  avatar: string;
  joinedDate: string;
}

export const DEMO_CONSUMER: User = {
  id: 'usr_c101',
  name: 'राहुल शर्मा (Rahul Sharma)',
  email: 'rahul.tenant@solarsync.in',
  phone: '+91 98765 43210',
  role: 'consumer',
  flatNumber: 'Flat 101 (Tenant)',
  deviceId: 'ESP32_PZEM_FLAT101',
  walletBalance: 345.50,
  avatar: '👤',
  joinedDate: 'Jan 2026',
};

export const DEMO_PROVIDER: User = {
  id: 'usr_p001',
  name: 'सूरज गुप्ता (Suraj Gupta)',
  email: 'suraj.owner@solarsync.in',
  phone: '+91 91234 56789',
  role: 'provider',
  flatNumber: 'Rooftop Solar Array (5kW)',
  deviceId: 'ESP32_MASTER_HUB',
  walletBalance: 3840.00,
  avatar: '☀️',
  joinedDate: 'Nov 2025',
};

export const DEMO_ADMIN: User = {
  id: 'usr_adm01',
  name: 'कंट्रोल रूम एडमिन (Grid Admin)',
  email: 'admin.ops@solarsync.in',
  phone: '+91 90000 00001',
  role: 'admin',
  flatNumber: 'Microgrid Operations Center',
  deviceId: 'ESP32_SUBSTATION_SUPERVISOR',
  walletBalance: 24500.00,
  avatar: '🛡️',
  joinedDate: 'Oct 2025',
};
