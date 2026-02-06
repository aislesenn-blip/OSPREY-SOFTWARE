export type Profile = {
  id: string;
  organization_id: string;
  full_name: string | null;
  email: string | null;
  role: 'admin' | 'manager' | 'driver' | 'mechanic' | 'storekeeper' | 'accountant' | 'hr' | 'guard' | 'staff';
  created_at: string;
};

export type Organization = {
  id: string;
  name: string;
  created_at: string;
  settings: any;
};

export type InventoryItem = {
  id: string;
  organization_id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  cost_price: number;
  created_at: string;
};

export type Vehicle = {
  id: string;
  organization_id: string;
  registration_number: string;
  make: string;
  model: string;
  year: number | null;
  vin: string | null;
  status: 'active' | 'maintenance' | 'out_of_service';
  current_odometer: number;
  service_interval_km: number;
  last_service_km: number;
  created_at: string;
};

export type Trip = {
  id: string;
  organization_id: string;
  vehicle_id: string;
  driver_id: string | null;
  start_time: string | null;
  end_time: string | null;
  start_odometer: number | null;
  end_odometer: number | null;
  purpose: string | null;
  status: 'planned' | 'active' | 'completed';
  created_at: string;
  vehicle?: Vehicle;
  driver?: Profile;
};

export type Staff = {
  id: string;
  organization_id: string;
  full_name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  base_salary: number;
  status: string;
  created_at: string;
};
