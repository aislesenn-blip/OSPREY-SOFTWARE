-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ORGANIZATIONS
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now(),
  settings jsonb default '{}'::jsonb
);

-- PROFILES (Users)
create type user_role as enum ('admin', 'manager', 'driver', 'mechanic', 'storekeeper', 'accountant', 'hr', 'guard', 'staff');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  full_name text,
  email text,
  role user_role default 'staff',
  created_at timestamp with time zone default now()
);

-- INVENTORY MODULE
create table inventory_warehouses (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  type text not null, -- 'main', 'camp', 'department'
  location text
);

create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  sku text,
  category text,
  unit text not null, -- 'kg', 'ltr', 'pcs'
  current_stock numeric default 0,
  min_stock_level numeric default 0,
  cost_price numeric default 0,
  created_at timestamp with time zone default now()
);

create table inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  item_id uuid references inventory_items(id) not null,
  warehouse_id uuid references inventory_warehouses(id),
  type text not null, -- 'in', 'out', 'transfer', 'adjust'
  quantity numeric not null,
  unit_cost numeric,
  reference text,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- FLEET MODULE
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  registration_number text not null,
  make text not null,
  model text not null,
  year int,
  vin text,
  status text default 'active', -- 'active', 'maintenance', 'out_of_service'
  current_odometer numeric default 0,
  service_interval_km numeric default 5000,
  last_service_km numeric default 0,
  created_at timestamp with time zone default now()
);

create table trips (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  vehicle_id uuid references vehicles(id) not null,
  driver_id uuid references profiles(id),
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  start_odometer numeric,
  end_odometer numeric,
  purpose text,
  status text default 'planned', -- 'planned', 'active', 'completed'
  created_at timestamp with time zone default now()
);

create table fuel_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  vehicle_id uuid references vehicles(id) not null,
  trip_id uuid references trips(id),
  liters numeric not null,
  cost_per_liter numeric,
  total_cost numeric,
  odometer numeric,
  station_name text,
  date timestamp with time zone default now(),
  created_by uuid references profiles(id)
);

create table maintenance_jobs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  vehicle_id uuid references vehicles(id) not null,
  description text not null,
  status text default 'pending', -- 'pending', 'in_progress', 'completed'
  cost numeric default 0,
  scheduled_date date,
  completed_date date
);

-- HR MODULE
create table staff (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  full_name text not null,
  role text,
  email text,
  phone text,
  base_salary numeric default 0,
  status text default 'active',
  created_at timestamp with time zone default now()
);

create table leave_requests (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  staff_id uuid references staff(id) not null,
  start_date date not null,
  end_date date not null,
  type text not null, -- 'annual', 'sick', 'unpaid'
  reason text,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  approved_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- OPERATIONS / GUESTS
create table guests (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  full_name text not null,
  passport_number text,
  nationality text,
  dietary_requirements text,
  notes text,
  created_at timestamp with time zone default now()
);

create table bookings (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  reference_number text,
  start_date date,
  end_date date,
  status text default 'confirmed',
  created_at timestamp with time zone default now()
);

create table booking_guests (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  booking_id uuid references bookings(id) not null,
  guest_id uuid references guests(id) not null,
  room_number text
);

-- ROW LEVEL SECURITY

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table inventory_items enable row level security;
alter table inventory_warehouses enable row level security;
alter table inventory_transactions enable row level security;
alter table vehicles enable row level security;
alter table trips enable row level security;
alter table fuel_logs enable row level security;
alter table maintenance_jobs enable row level security;
alter table staff enable row level security;
alter table leave_requests enable row level security;
alter table guests enable row level security;
alter table bookings enable row level security;
alter table booking_guests enable row level security;

-- POLICIES

-- Helper function to get current user's org
create or replace function get_my_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid()
$$ language sql security definer;

-- Organizations: Users can view their own org
create policy "View own org" on organizations
  for select using (id = get_my_org_id());

-- Profiles: View profiles in same org, or self
create policy "View org profiles" on profiles
  for select using (organization_id = get_my_org_id() or id = auth.uid());

create policy "Update self" on profiles
  for update using (id = auth.uid());

-- Generic Policy Generator Macro (Conceptually)
-- We will apply explicit policies for clarity

-- Inventory
create policy "Org inventory items" on inventory_items for all using (organization_id = get_my_org_id());
create policy "Org inventory warehouses" on inventory_warehouses for all using (organization_id = get_my_org_id());
create policy "Org inventory transactions" on inventory_transactions for all using (organization_id = get_my_org_id());

-- Fleet
create policy "Org vehicles" on vehicles for all using (organization_id = get_my_org_id());
create policy "Org trips" on trips for all using (organization_id = get_my_org_id());
create policy "Org fuel logs" on fuel_logs for all using (organization_id = get_my_org_id());
create policy "Org maintenance" on maintenance_jobs for all using (organization_id = get_my_org_id());

-- HR
create policy "Org staff" on staff for all using (organization_id = get_my_org_id());
create policy "Org leave requests" on leave_requests for all using (organization_id = get_my_org_id());

-- Guests
create policy "Org guests" on guests for all using (organization_id = get_my_org_id());
create policy "Org bookings" on bookings for all using (organization_id = get_my_org_id());
create policy "Org booking guests" on booking_guests for all using (organization_id = get_my_org_id());


-- TRIGGERS

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
declare
  org_id uuid;
begin
  -- Check if user has 'company_name' in metadata (Sign Up)
  if new.raw_user_meta_data->>'company_name' is not null then
    insert into organizations (name)
    values (new.raw_user_meta_data->>'company_name')
    returning id into org_id;

    insert into public.profiles (id, organization_id, full_name, email, role)
    values (new.id, org_id, new.raw_user_meta_data->>'full_name', new.email, 'admin');

  -- Check if user has 'organization_id' in metadata (Invite)
  elsif new.raw_user_meta_data->>'organization_id' is not null then
    insert into public.profiles (id, organization_id, full_name, email, role)
    values (
      new.id,
      (new.raw_user_meta_data->>'organization_id')::uuid,
      new.raw_user_meta_data->>'full_name',
      new.email,
      (new.raw_user_meta_data->>'role')::user_role
    );

  -- Fallback (should not happen in strict flow)
  else
    -- Maybe log error or do nothing
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
