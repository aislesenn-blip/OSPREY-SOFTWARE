-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ORGANIZATIONS
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    slug TEXT UNIQUE
);

-- PROFILES (Users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'camp_manager', 'inventory_manager', 'storekeeper', 'driver', 'mechanic', 'hr_manager', 'accountant', 'guard')),
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INVENTORY MODULE
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    type TEXT CHECK (type IN ('main', 'camp', 'department')) NOT NULL
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    unit TEXT NOT NULL,
    minimum_stock NUMERIC DEFAULT 0,
    current_stock NUMERIC DEFAULT 0,
    cost_price NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    item_id UUID REFERENCES inventory_items(id) NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
    type TEXT CHECK (type IN ('in', 'out', 'adjustment', 'transfer_in', 'transfer_out')) NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_cost NUMERIC,
    reference TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FLEET MODULE
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    registration_number TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    type TEXT CHECK (type IN ('safari_cruiser', 'truck', 'supply', 'staff_bus')),
    vin TEXT,
    status TEXT CHECK (status IN ('active', 'maintenance', 'retired')) DEFAULT 'active',
    current_km NUMERIC DEFAULT 0,
    next_service_km NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vehicle_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    driver_id UUID REFERENCES profiles(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    start_km NUMERIC NOT NULL,
    end_km NUMERIC,
    purpose TEXT,
    route TEXT,
    status TEXT CHECK (status IN ('planned', 'active', 'completed', 'cancelled')) DEFAULT 'active'
);

CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    trip_id UUID REFERENCES vehicle_trips(id),
    liters NUMERIC NOT NULL,
    cost NUMERIC,
    odometer NUMERIC NOT NULL,
    location TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE maintenance_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    description TEXT NOT NULL,
    cost NUMERIC DEFAULT 0,
    status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed')) DEFAULT 'scheduled',
    start_date DATE,
    completion_date DATE,
    mechanic_id UUID REFERENCES profiles(id)
);

-- HR MODULE
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    position TEXT,
    department TEXT,
    base_salary NUMERIC,
    join_date DATE,
    status TEXT CHECK (status IN ('active', 'terminated', 'leave')) DEFAULT 'active',
    email TEXT,
    phone TEXT
);

CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    staff_id UUID REFERENCES staff(id) NOT NULL,
    type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id)
);

-- OPERATIONS / GUESTS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id REFERENCES organizations(id) NOT NULL,
    reference_number TEXT NOT NULL,
    agent_name TEXT,
    guest_count INTEGER DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT CHECK (status IN ('confirmed', 'provisional', 'cancelled')) DEFAULT 'confirmed'
);

CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    full_name TEXT NOT NULL,
    nationality TEXT,
    dietary_requirements TEXT,
    room_preference TEXT
);

-- AUDIT LOG
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- GENERIC ORG POLICY FUNCTION
CREATE OR REPLACE FUNCTION get_auth_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT organization_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- APPLY RLS TO ALL TABLES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view their organization" ON organizations
    FOR SELECT USING (id = get_auth_org_id());

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org Access Warehouses" ON warehouses
    FOR ALL USING (organization_id = get_auth_org_id());

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org Access Inventory" ON inventory_items
    FOR ALL USING (organization_id = get_auth_org_id());

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org Access Stock Movements" ON stock_movements
    FOR ALL USING (organization_id = get_auth_org_id());

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org Access Vehicles" ON vehicles
    FOR ALL USING (organization_id = get_auth_org_id());

ALTER TABLE vehicle_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org Access Trips" ON vehicle_trips
    FOR ALL USING (organization_id = get_auth_org_id());

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org Access Staff" ON staff
    FOR ALL USING (organization_id = get_auth_org_id());


-- USER MANAGEMENT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  new_org_name TEXT;
BEGIN
  new_org_name := new.raw_user_meta_data->>'company_name';

  IF new_org_name IS NOT NULL THEN
    INSERT INTO organizations (name) VALUES (new_org_name)
    RETURNING id INTO org_id;

    INSERT INTO public.profiles (id, organization_id, full_name, role, email)
    VALUES (new.id, org_id, new.raw_user_meta_data->>'full_name', 'admin', new.email);
  ELSE
    NULL;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
