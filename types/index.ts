export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage?: number;
  fuel_type: 'benzyna' | 'diesel' | 'elektryczny' | 'hybryda' | 'LPG';
  gearbox: 'manualna' | 'automatyczna';
  color?: string;
  seats?: number;
  category: 'ekonomiczny' | 'komfort' | 'premium' | 'SUV' | 'van';
  price_per_day: number;
  status: 'dostepny' | 'wynajety' | 'serwis';
  license_plate?: string;
  description?: string;
  features: string[];
  images: string[];
  agent_id?: string;
  agent?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'root' | 'agent' | 'klient';
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  isActive?: boolean;
  isPublic?: boolean;
  lastLogin?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateCarInput {
  brand: string;
  model: string;
  year: number;
  mileage?: number;
  fuel_type: Car['fuel_type'];
  gearbox: Car['gearbox'];
  color?: string;
  seats?: number;
  category: Car['category'];
  price_per_day: number;
  status: Car['status'];
  license_plate?: string;
  description?: string;
  features?: string[];
  images?: string[];
  agent_id?: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  pickup_time?: string;
  return_time?: string;
  total_price: number;
  status: 'aktywna' | 'zakonczona' | 'anulowana';
  pickup_location?: string;
  return_location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  car?: Car;
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}
