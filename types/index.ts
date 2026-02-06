export type Role = 'admin' | 'camp_manager' | 'inventory_manager' | 'storekeeper' | 'driver' | 'mechanic' | 'hr_manager' | 'accountant' | 'guard';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  slug?: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  role: Role;
  email: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  organization_id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  minimum_stock: number;
  current_stock: number;
  cost_price: number;
  created_at: string;
}

export interface Vehicle {
  id: string;
  organization_id: string;
  registration_number: string;
  make: string;
  model: string;
  type: 'safari_cruiser' | 'truck' | 'supply' | 'staff_bus';
  status: 'active' | 'maintenance' | 'retired';
  current_km: number;
  next_service_km: number;
}

export interface Trip {
  id: string;
  organization_id: string;
  vehicle_id: string;
  driver_id: string;
  start_time: string;
  end_time?: string;
  start_km: number;
  end_km?: number;
  purpose: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

export interface Staff {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  status: 'active' | 'terminated' | 'leave';
  email: string;
}
