-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ORGANIZATIONS (Tenants)
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now()
);

-- 2. PROFILES (Users linked to Auth)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  full_name text,
  role text check (role in ('admin', 'camp_manager', 'inventory_manager', 'storekeeper', 'driver', 'mechanic', 'hr_manager', 'accountant', 'guard')),
  created_at timestamp with time zone default now()
);

-- 3. INVENTORY MODULE
create table inventory_locations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  type text check (type in ('main_store', 'camp_store', 'bar', 'kitchen')),
  created_at timestamp with time zone default now()
);

create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  category text, -- 'food', 'beverage', 'maintenance', 'fuel'
  unit text not null, -- 'kg', 'liter', 'bottle', 'crate'
  minimum_stock numeric default 0,
  created_at timestamp with time zone default now()
);

create table inventory_stock (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  item_id uuid references inventory_items(id) not null,
  location_id uuid references inventory_locations(id) not null,
  quantity numeric default 0,
  updated_at timestamp with time zone default now(),
  unique(item_id, location_id)
);

create table inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  item_id uuid references inventory_items(id) not null,
  from_location_id uuid references inventory_locations(id), -- Null for external supplier
  to_location_id uuid references inventory_locations(id), -- Null for consumption/loss
  quantity numeric not null,
  type text check (type in ('receive', 'issue', 'transfer', 'adjust')),
  status text check (status in ('pending', 'completed', 'in_transit')) default 'completed',
  reference text, -- PO number or Transfer ID
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- 4. CAMP OPERATIONS MODULE
create table camps (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  location_id uuid references inventory_locations(id) -- Link to inventory store
);

create table rooms (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  camp_id uuid references camps(id) not null,
  name text not null, -- "Tent 1", "Room 4"
  status text check (status in ('active', 'maintenance')) default 'active',
  created_at timestamp with time zone default now()
);

create table maintenance_tickets (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  room_id uuid references rooms(id), -- specific to room or null for general
  description text not null,
  status text check (status in ('open', 'in_progress', 'resolved')) default 'open',
  reported_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

create table bookings (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  camp_id uuid references camps(id) not null,
  reference_number text not null,
  start_date date not null,
  end_date date not null,
  pax_adults int default 0,
  pax_children int default 0,
  status text check (status in ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
  created_at timestamp with time zone default now()
);

create table guests (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  booking_id uuid references bookings(id) not null,
  full_name text not null,
  allergies text, -- Important for Kitchen Lock
  room_id uuid references rooms(id),
  created_at timestamp with time zone default now()
);

-- 5. FLEET MODULE
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  plate_number text not null,
  model text not null,
  vin text,
  current_km numeric default 0,
  service_due_km numeric not null,
  status text check (status in ('active', 'maintenance', 'blocked')) default 'active',
  created_at timestamp with time zone default now()
);

create table vehicle_trips (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  vehicle_id uuid references vehicles(id) not null,
  driver_id uuid references profiles(id),
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  start_km numeric not null,
  end_km numeric,
  route_description text,
  status text check (status in ('ongoing', 'completed')) default 'ongoing'
);

create table fuel_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  vehicle_id uuid references vehicles(id) not null,
  trip_id uuid references vehicle_trips(id), -- Required for validation
  liters numeric not null,
  cost numeric not null,
  odometer numeric not null,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

create table asset_genealogy (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  vehicle_id uuid references vehicles(id),
  part_type text check (part_type in ('tyre', 'battery')),
  serial_number text not null,
  installed_at timestamp with time zone default now(),
  status text check (status in ('active', 'retired')) default 'active'
);

-- 6. HR MODULE
create table staff (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  full_name text not null,
  role text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create table staff_rota (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  staff_id uuid references staff(id) not null,
  date date not null,
  status text check (status in ('on_duty', 'off_duty', 'leave', 'sick')) default 'on_duty',
  unique(staff_id, date)
);

-- 7. FINANCE MODULE (Double Entry Support)
create table ledger_accounts (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  code text not null,
  name text not null,
  type text check (type in ('asset', 'liability', 'equity', 'revenue', 'expense')),
  created_at timestamp with time zone default now()
);

create table ledger_entries (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  transaction_date date not null,
  description text,
  reference_id uuid, -- Link to fuel_log, inventory_transaction, etc.
  reference_table text,
  created_at timestamp with time zone default now()
);

create table ledger_lines (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid references ledger_entries(id) not null,
  account_id uuid references ledger_accounts(id) not null,
  debit numeric default 0,
  credit numeric default 0
);

-- 8. SECURITY MODULE
create table gate_passes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  vehicle_id uuid references vehicles(id),
  driver_id uuid references profiles(id),
  passenger_count int default 0,
  load_description text,
  qr_code text unique, -- Generated UUID or hash
  checked_out_at timestamp with time zone default now(),
  checked_out_by uuid references profiles(id)
);

-- RLS POLICIES (Simplified for Deployment)
-- Enable RLS on all tables
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table inventory_items enable row level security;
alter table inventory_locations enable row level security;
alter table inventory_stock enable row level security;
alter table inventory_transactions enable row level security;
alter table camps enable row level security;
alter table rooms enable row level security;
alter table maintenance_tickets enable row level security;
alter table bookings enable row level security;
alter table guests enable row level security;
alter table vehicles enable row level security;
alter table vehicle_trips enable row level security;
alter table fuel_logs enable row level security;
alter table asset_genealogy enable row level security;
alter table staff enable row level security;
alter table staff_rota enable row level security;
alter table ledger_accounts enable row level security;
alter table ledger_entries enable row level security;
alter table ledger_lines enable row level security;
alter table gate_passes enable row level security;

-- Create a generic policy that allows access if the user belongs to the same organization
-- Note: In a real production env, this would be more granular based on roles.
-- For this "Osprey" build, we assume if you are authenticated and in the org, you can read/write relevant data.

create or replace function get_auth_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid()
$$ language sql security definer;

create policy "Org isolation for profiles" on profiles for all using (organization_id = get_auth_org_id());
create policy "Org isolation for inventory_locations" on inventory_locations for all using (organization_id = get_auth_org_id());
create policy "Org isolation for inventory_items" on inventory_items for all using (organization_id = get_auth_org_id());
create policy "Org isolation for inventory_stock" on inventory_stock for all using (organization_id = get_auth_org_id());
create policy "Org isolation for inventory_transactions" on inventory_transactions for all using (organization_id = get_auth_org_id());
create policy "Org isolation for camps" on camps for all using (organization_id = get_auth_org_id());
create policy "Org isolation for rooms" on rooms for all using (organization_id = get_auth_org_id());
create policy "Org isolation for maintenance_tickets" on maintenance_tickets for all using (organization_id = get_auth_org_id());
create policy "Org isolation for bookings" on bookings for all using (organization_id = get_auth_org_id());
create policy "Org isolation for guests" on guests for all using (organization_id = get_auth_org_id());
create policy "Org isolation for vehicles" on vehicles for all using (organization_id = get_auth_org_id());
create policy "Org isolation for vehicle_trips" on vehicle_trips for all using (organization_id = get_auth_org_id());
create policy "Org isolation for fuel_logs" on fuel_logs for all using (organization_id = get_auth_org_id());
create policy "Org isolation for asset_genealogy" on asset_genealogy for all using (organization_id = get_auth_org_id());
create policy "Org isolation for staff" on staff for all using (organization_id = get_auth_org_id());
create policy "Org isolation for staff_rota" on staff_rota for all using (organization_id = get_auth_org_id());
create policy "Org isolation for ledger_accounts" on ledger_accounts for all using (organization_id = get_auth_org_id());
create policy "Org isolation for ledger_entries" on ledger_entries for all using (organization_id = get_auth_org_id());
create policy "Org isolation for ledger_lines" on ledger_lines for all using (entry_id in (select id from ledger_entries where organization_id = get_auth_org_id()));
create policy "Org isolation for gate_passes" on gate_passes for all using (organization_id = get_auth_org_id());

-- AUTOMATED TRIGGER FOR NEW USERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'admin');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
