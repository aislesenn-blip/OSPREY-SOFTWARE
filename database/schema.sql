-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. AUDIT LOGGING (FORENSIC LEVEL)
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid, -- Nullable because system-wide events might not have it, but rows should.
  table_name text not null,
  record_id uuid,
  operation text not null, -- INSERT, UPDATE, DELETE
  old_data jsonb,
  new_data jsonb,
  changed_by uuid, -- References auth.users(id) or profiles(id)
  timestamp timestamp with time zone default now()
);

-- Generic Audit Trigger Function
create or replace function audit_trigger_func()
returns trigger as $$
declare
  user_id uuid;
  org_id uuid;
begin
  -- Try to get the current user ID from Supabase auth context
  select auth.uid() into user_id;

  -- Try to extract organization_id from the record (NEW or OLD)
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    begin
      org_id := NEW.organization_id;
    exception when others then
      org_id := null;
    end;
  else
    begin
      org_id := OLD.organization_id;
    exception when others then
      org_id := null;
    end;
  end if;

  insert into audit_logs (
    organization_id,
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    changed_by
  )
  values (
    org_id,
    TG_TABLE_NAME,
    coalesce(NEW.id, OLD.id),
    TG_OP,
    case when TG_OP = 'DELETE' or TG_OP = 'UPDATE' then to_jsonb(OLD) else null end,
    case when TG_OP = 'INSERT' or TG_OP = 'UPDATE' then to_jsonb(NEW) else null end,
    user_id
  );

  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

-- 2. ORGANIZATIONS
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now(),
  settings jsonb default '{}'::jsonb
);

-- 3. PROFILES (Users)
create type user_role as enum ('admin', 'manager', 'driver', 'mechanic', 'storekeeper', 'accountant', 'hr', 'guard', 'staff');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  full_name text,
  email text,
  role user_role default 'staff',
  created_at timestamp with time zone default now()
);

-- 4. LOCATIONS (Scalable: HQ, Camps, Departments)
create type location_type as enum ('main_store', 'camp', 'department', 'station');

create table locations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  type location_type not null,
  parent_id uuid references locations(id), -- Hierarchy (e.g., Kitchen inside Baobab Camp)
  created_at timestamp with time zone default now()
);

-- 5. INVENTORY & PROFIT ENGINE
create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  sku text,
  category text, -- 'Beverage', 'Food', 'Spare Part'
  unit text not null, -- 'kg', 'btl', 'pcs'
  current_stock numeric default 0,
  min_stock_level numeric default 0,
  cost_price numeric default 0, -- Moving Average or Last Cost
  selling_price numeric default 0, -- For profit calculation (e.g. Bar)
  created_at timestamp with time zone default now()
);

create type transaction_type as enum ('receive', 'issue', 'transfer', 'adjust', 'sale');
create type transaction_status as enum ('pending', 'approved', 'rejected', 'completed');

create table inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  item_id uuid references inventory_items(id) not null,
  source_location_id uuid references locations(id), -- Where it came from (NULL for Vendor)
  target_location_id uuid references locations(id), -- Where it went (NULL for Waste/Consumption)
  type transaction_type not null,
  quantity numeric not null,
  unit_cost numeric,
  unit_price numeric, -- For sales
  status transaction_status default 'completed', -- Transfers require approval
  reference text, -- PO Number, Receipt ID
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- 6. FLEET MODULE
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  registration_number text not null,
  make text not null,
  model text not null,
  year int,
  vin text,
  status text default 'active',
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
  status text default 'planned',
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
  status text default 'pending',
  cost numeric default 0,
  scheduled_date date,
  completed_date date
);

-- 7. HR MODULE
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
  type text not null,
  reason text,
  status text default 'pending',
  approved_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- 8. OPERATIONS / GUESTS
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

-- ROW LEVEL SECURITY (RLS)

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table locations enable row level security;
alter table inventory_items enable row level security;
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
alter table audit_logs enable row level security;

-- POLICIES

create or replace function get_my_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid()
$$ language sql security definer;

-- Organizations
create policy "View own org" on organizations for select using (id = get_my_org_id());

-- Profiles
create policy "View org profiles" on profiles for select using (organization_id = get_my_org_id() or id = auth.uid());
create policy "Update self" on profiles for update using (id = auth.uid());

-- Locations
create policy "Org locations" on locations for all using (organization_id = get_my_org_id());

-- Inventory
create policy "Org inventory items" on inventory_items for all using (organization_id = get_my_org_id());
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

-- Audit Logs (Admins only usually, but let's allow read for org)
create policy "View org audit logs" on audit_logs for select using (organization_id = get_my_org_id());

-- AUTO-ASSIGN ORGANIZATION TRIGGER (CRITICAL FIX)

create or replace function public.handle_new_user()
returns trigger as $$
declare
  org_id uuid;
begin
  -- 1. New Company Registration
  if new.raw_user_meta_data->>'company_name' is not null then
    -- Create Organization
    insert into organizations (name)
    values (new.raw_user_meta_data->>'company_name')
    returning id into org_id;

    -- Create Admin Profile
    insert into public.profiles (id, organization_id, full_name, email, role)
    values (new.id, org_id, new.raw_user_meta_data->>'full_name', new.email, 'admin');

    -- Initialize Default Locations (Scalability Starter Pack)
    insert into public.locations (organization_id, name, type) values
    (org_id, 'Main Store', 'main_store');

  -- 2. Invited User
  elsif new.raw_user_meta_data->>'organization_id' is not null then
    insert into public.profiles (id, organization_id, full_name, email, role)
    values (
      new.id,
      (new.raw_user_meta_data->>'organization_id')::uuid,
      new.raw_user_meta_data->>'full_name',
      new.email,
      (new.raw_user_meta_data->>'role')::user_role
    );
  end if;

  return new;
end;
$$ language plpgsql security definer; -- SECURITY DEFINER is key here!

-- Re-create Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- APPLY AUDIT TRIGGERS TO ALL TABLES
create trigger audit_organizations after insert or update or delete on organizations for each row execute procedure audit_trigger_func();
create trigger audit_profiles after insert or update or delete on profiles for each row execute procedure audit_trigger_func();
create trigger audit_locations after insert or update or delete on locations for each row execute procedure audit_trigger_func();
create trigger audit_inventory_items after insert or update or delete on inventory_items for each row execute procedure audit_trigger_func();
create trigger audit_inventory_transactions after insert or update or delete on inventory_transactions for each row execute procedure audit_trigger_func();
create trigger audit_vehicles after insert or update or delete on vehicles for each row execute procedure audit_trigger_func();
create trigger audit_trips after insert or update or delete on trips for each row execute procedure audit_trigger_func();
create trigger audit_fuel_logs after insert or update or delete on fuel_logs for each row execute procedure audit_trigger_func();
create trigger audit_maintenance_jobs after insert or update or delete on maintenance_jobs for each row execute procedure audit_trigger_func();
create trigger audit_staff after insert or update or delete on staff for each row execute procedure audit_trigger_func();
create trigger audit_guests after insert or update or delete on guests for each row execute procedure audit_trigger_func();
create trigger audit_bookings after insert or update or delete on bookings for each row execute procedure audit_trigger_func();
