-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. CORE SYSTEM & AUDIT (The "CCTV")
-- ==========================================

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid, -- Nullable for system events
  table_name text not null,
  record_id uuid,
  operation text not null, -- INSERT, UPDATE, DELETE
  old_data jsonb,
  new_data jsonb,
  changed_by uuid, -- Auth User ID
  timestamp timestamp with time zone default now()
);

-- Generic Audit Trigger Function (Forensic Level)
create or replace function audit_trigger_func()
returns trigger as $$
declare
  user_id uuid;
  org_id uuid;
begin
  -- Attempt to get user ID
  select auth.uid() into user_id;

  -- Attempt to get Organization ID
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
    organization_id, table_name, record_id, operation, old_data, new_data, changed_by
  )
  values (
    org_id, TG_TABLE_NAME, coalesce(NEW.id, OLD.id), TG_OP,
    case when TG_OP = 'DELETE' or TG_OP = 'UPDATE' then to_jsonb(OLD) else null end,
    case when TG_OP = 'INSERT' or TG_OP = 'UPDATE' then to_jsonb(NEW) else null end,
    user_id
  );

  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

-- ==========================================
-- 2. ORGANIZATIONS & CONFIG
-- ==========================================

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  industry_type text not null default 'generic', -- 'tourism', 'construction', 'retail'
  config jsonb default '{}'::jsonb, -- Dynamic terminology: {'labels': {'camp': 'Site'}}
  created_at timestamp with time zone default now()
);

create type user_role as enum ('admin', 'manager', 'staff', 'accountant', 'hr', 'viewer');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  full_name text,
  email text,
  role user_role default 'staff',
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 3. UNIVERSAL LOCATIONS (Sites, Camps, Stores)
-- ==========================================

create type location_type as enum ('hq', 'branch', 'store', 'site', 'department');

create table locations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  parent_id uuid references locations(id), -- Hierarchy
  name text not null,
  type location_type not null,
  address text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 4. FINANCE ENGINE (The "Accountant" Dream)
-- ==========================================

create type account_type as enum ('asset', 'liability', 'equity', 'income', 'expense');

create table accounts (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  code text not null, -- e.g. '1000'
  name text not null, -- e.g. 'Cash on Hand'
  type account_type not null,
  is_active boolean default true
);

create table journals (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  date date not null,
  reference text,
  description text,
  status text default 'posted', -- 'draft', 'posted'
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

create table ledger_entries (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  journal_id uuid references journals(id) not null,
  account_id uuid references accounts(id) not null,
  debit numeric default 0,
  credit numeric default 0,
  description text
);

-- ==========================================
-- 5. INVENTORY & PROCUREMENT
-- ==========================================

create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  contact_person text,
  email text,
  phone text,
  created_at timestamp with time zone default now()
);

create table items (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  sku text,
  description text,
  category text,
  unit text not null, -- 'kg', 'ltr', 'pcs'
  cost_price numeric default 0, -- Moving Average Cost
  selling_price numeric default 0, -- For Retail/Bar
  reorder_level numeric default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Inventory Levels per Location
create table inventory_levels (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  location_id uuid references locations(id) not null,
  item_id uuid references items(id) not null,
  quantity numeric default 0,
  updated_at timestamp with time zone default now(),
  unique(location_id, item_id)
);

create table purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  supplier_id uuid references suppliers(id),
  order_date date default CURRENT_DATE,
  expected_date date,
  status text default 'draft', -- 'draft', 'pending_approval', 'approved', 'received', 'cancelled'
  total_amount numeric default 0,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

create table purchase_order_items (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  purchase_order_id uuid references purchase_orders(id) not null,
  item_id uuid references items(id) not null,
  quantity numeric not null,
  unit_cost numeric not null,
  total_cost numeric generated always as (quantity * unit_cost) stored
);

create type inv_txn_type as enum ('purchase_receive', 'transfer_out', 'transfer_in', 'issue_consumption', 'adjustment', 'sale');

create table inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  item_id uuid references items(id) not null,
  location_id uuid references locations(id) not null,
  type inv_txn_type not null,
  quantity numeric not null, -- Positive for Add, Negative for Reduce
  unit_cost numeric, -- For valuation
  reference_id uuid, -- Link to PO or Sale
  notes text,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 6. ASSETS (Fleet & Machinery)
-- ==========================================

create table assets (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null, -- e.g. "Land Cruiser TZ 123"
  identifier text, -- License Plate / Serial No
  type text not null, -- 'vehicle', 'machine', 'equipment'
  status text default 'active',
  current_usage numeric default 0, -- Odometer / Hours
  service_interval numeric,
  last_service_usage numeric,
  location_id uuid references locations(id), -- Where is it stationed?
  created_at timestamp with time zone default now()
);

create table asset_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  asset_id uuid references assets(id) not null,
  date timestamp with time zone default now(),
  type text not null, -- 'trip', 'fuel', 'maintenance', 'usage'
  description text,
  usage_reading numeric, -- Current Odometer
  cost numeric default 0,
  operator_id uuid references profiles(id), -- Driver/Operator
  created_by uuid references profiles(id)
);

-- ==========================================
-- 7. HR & PAYROLL
-- ==========================================

create table employees (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  job_title text,
  department_id uuid references locations(id),
  basic_salary numeric default 0,
  employment_type text, -- 'full_time', 'contract', 'casual'
  status text default 'active',
  created_at timestamp with time zone default now()
);

create table payroll_runs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  period_start date,
  period_end date,
  status text default 'draft', -- 'draft', 'approved', 'paid'
  total_payout numeric default 0,
  created_at timestamp with time zone default now()
);

create table payslips (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  payroll_run_id uuid references payroll_runs(id) not null,
  employee_id uuid references employees(id) not null,
  basic_pay numeric default 0,
  allowances numeric default 0,
  deductions numeric default 0,
  net_pay numeric default 0,
  generated_at timestamp with time zone default now()
);

-- ==========================================
-- 8. CRM (Guests / Clients)
-- ==========================================

create table crm_contacts (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  type text default 'individual', -- 'individual', 'corporate'
  name text not null,
  email text,
  phone text,
  address text,
  preferences text, -- For tourism: dietary, etc.
  created_at timestamp with time zone default now()
);

create table crm_deals (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  contact_id uuid references crm_contacts(id),
  title text, -- "Safari Trip Dec" or "Construction Project A"
  status text default 'new',
  value numeric default 0,
  start_date date,
  end_date date,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 9. SECURITY & POLICIES
-- ==========================================

-- Enable RLS on ALL Tables
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table audit_logs enable row level security;
alter table locations enable row level security;
alter table accounts enable row level security;
alter table journals enable row level security;
alter table ledger_entries enable row level security;
alter table suppliers enable row level security;
alter table items enable row level security;
alter table inventory_levels enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table inventory_transactions enable row level security;
alter table assets enable row level security;
alter table asset_logs enable row level security;
alter table employees enable row level security;
alter table payroll_runs enable row level security;
alter table payslips enable row level security;
alter table crm_contacts enable row level security;
alter table crm_deals enable row level security;

-- Helper Function
create or replace function get_my_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid()
$$ language sql security definer;

-- Generic RLS Policy Generator (Manual for clarity)
-- We apply a standard policy: "View/Edit Data in My Organization"

-- Organizations
create policy "Access own org" on organizations for all using (id = get_my_org_id());

-- Profiles
create policy "Access org profiles" on profiles for all using (organization_id = get_my_org_id() or id = auth.uid());

-- Locations
create policy "Access org locations" on locations for all using (organization_id = get_my_org_id());

-- Finance
create policy "Access org accounts" on accounts for all using (organization_id = get_my_org_id());
create policy "Access org journals" on journals for all using (organization_id = get_my_org_id());
create policy "Access org ledger" on ledger_entries for all using (organization_id = get_my_org_id());

-- Inventory
create policy "Access org suppliers" on suppliers for all using (organization_id = get_my_org_id());
create policy "Access org items" on items for all using (organization_id = get_my_org_id());
create policy "Access org inventory levels" on inventory_levels for all using (organization_id = get_my_org_id());
create policy "Access org POs" on purchase_orders for all using (organization_id = get_my_org_id());
create policy "Access org PO items" on purchase_order_items for all using (organization_id = get_my_org_id());
create policy "Access org inv transactions" on inventory_transactions for all using (organization_id = get_my_org_id());

-- Assets
create policy "Access org assets" on assets for all using (organization_id = get_my_org_id());
create policy "Access org asset logs" on asset_logs for all using (organization_id = get_my_org_id());

-- HR
create policy "Access org employees" on employees for all using (organization_id = get_my_org_id());
create policy "Access org payroll runs" on payroll_runs for all using (organization_id = get_my_org_id());
create policy "Access org payslips" on payslips for all using (organization_id = get_my_org_id());

-- CRM
create policy "Access org contacts" on crm_contacts for all using (organization_id = get_my_org_id());
create policy "Access org deals" on crm_deals for all using (organization_id = get_my_org_id());

-- Audit
create policy "Access org audits" on audit_logs for select using (organization_id = get_my_org_id());


-- ==========================================
-- 10. AUTOMATION TRIGGERS
-- ==========================================

-- A. SIGN UP HANDLER (Fixes the "Database Error")
create or replace function public.handle_new_user()
returns trigger as $$
declare
  org_id uuid;
begin
  -- 1. New Company
  if new.raw_user_meta_data->>'company_name' is not null then
    insert into organizations (name, industry_type)
    values (
        new.raw_user_meta_data->>'company_name',
        coalesce(new.raw_user_meta_data->>'industry_type', 'generic')
    )
    returning id into org_id;

    insert into public.profiles (id, organization_id, full_name, email, role)
    values (new.id, org_id, new.raw_user_meta_data->>'full_name', new.email, 'admin');

    -- Initialize Basic Accounts (Chart of Accounts Starter)
    insert into accounts (organization_id, code, name, type) values
    (org_id, '1000', 'Cash on Hand', 'asset'),
    (org_id, '1200', 'Accounts Receivable', 'asset'),
    (org_id, '2000', 'Accounts Payable', 'liability'),
    (org_id, '4000', 'Sales Income', 'income'),
    (org_id, '5000', 'Cost of Goods Sold', 'expense');

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
$$ language plpgsql security definer;

-- Trigger for Signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- B. AUDIT LOGGERS (The Surveillance)
-- Apply to all major tables
create trigger audit_orgs after insert or update or delete on organizations for each row execute procedure audit_trigger_func();
create trigger audit_profiles after insert or update or delete on profiles for each row execute procedure audit_trigger_func();
create trigger audit_locations after insert or update or delete on locations for each row execute procedure audit_trigger_func();
create trigger audit_accounts after insert or update or delete on accounts for each row execute procedure audit_trigger_func();
create trigger audit_journals after insert or update or delete on journals for each row execute procedure audit_trigger_func();
create trigger audit_suppliers after insert or update or delete on suppliers for each row execute procedure audit_trigger_func();
create trigger audit_items after insert or update or delete on items for each row execute procedure audit_trigger_func();
create trigger audit_pos after insert or update or delete on purchase_orders for each row execute procedure audit_trigger_func();
create trigger audit_assets after insert or update or delete on assets for each row execute procedure audit_trigger_func();
create trigger audit_employees after insert or update or delete on employees for each row execute procedure audit_trigger_func();
create trigger audit_contacts after insert or update or delete on crm_contacts for each row execute procedure audit_trigger_func();
