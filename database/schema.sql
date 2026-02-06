-- OSPREY Database Schema
-- Universal Node Architecture & RBAC

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Tenant Root)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb, -- timezone, currency, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles (Extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Universal Node Architecture

-- Node Types (Polymorphic Definitions)
-- Examples: 'Department', 'Site', 'Project', 'Store'
CREATE TABLE node_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    schema_definition JSONB DEFAULT '{}'::jsonb, -- Validation schema for node data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nodes (The Core Entity)
-- Supports infinite hierarchy via parent_id
CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type_id UUID REFERENCES node_types(id) ON DELETE RESTRICT,
    parent_id UUID REFERENCES nodes(id) ON DELETE CASCADE, -- Recursive relationship
    name TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb, -- Polymorphic data based on type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Node Relationships (Graph connections beyond hierarchy)
-- Example: A 'Project' node might utilize a 'Store' node (Supply Chain)
CREATE TABLE node_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    source_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- e.g., 'manages', 'supplies', 'located_at'
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RBAC (Role Based Access Control)

-- Roles
-- Standard roles: Admin, HR, Storekeeper, etc.
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    permissions TEXT[], -- Array of permission strings e.g., ['node.create', 'user.invite']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Assignments
-- Links users to roles, optionally scoped to a specific node (and its descendants)
CREATE TABLE role_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    scope_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE, -- If NULL, applies to entire Organization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Helper Functions
CREATE OR REPLACE FUNCTION get_auth_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic Draft)

-- Organizations: Users can view their own org
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (id = get_auth_org_id());

-- Profiles: Users can view profiles in their org
CREATE POLICY "Users can view profiles in their organization" ON profiles
    FOR SELECT USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Universal Node RLS
CREATE POLICY "Users can view nodes in their organization" ON nodes
    FOR SELECT USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view node types in their organization" ON node_types
    FOR SELECT USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view node relationships in their organization" ON node_relationships
    FOR SELECT USING (organization_id = get_auth_org_id());

-- RBAC RLS
CREATE POLICY "Users can view roles in their organization" ON roles
    FOR SELECT USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view role assignments in their organization" ON role_assignments
    FOR SELECT USING (organization_id = get_auth_org_id());

-- Indexes for Performance
CREATE INDEX idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX idx_nodes_type_id ON nodes(type_id);
CREATE INDEX idx_nodes_org_id ON nodes(organization_id);
CREATE INDEX idx_profiles_org_id ON profiles(organization_id);
CREATE INDEX idx_role_assignments_user_id ON role_assignments(user_id);
CREATE INDEX idx_role_assignments_scope_node_id ON role_assignments(scope_node_id);

-- 5. Automation Triggers

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    company_name TEXT;
BEGIN
    company_name := new.raw_user_meta_data->>'company_name';

    -- If company_name is provided, create a new organization
    IF company_name IS NOT NULL THEN
        INSERT INTO public.organizations (name, slug)
        VALUES (
            company_name,
            lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g')) -- Basic slug generation
        )
        RETURNING id INTO org_id;

        -- Create Profile linked to the new organization
        INSERT INTO public.profiles (id, organization_id, email, full_name)
        VALUES (
            new.id,
            org_id,
            new.email,
            company_name || ' Admin'
        );

        -- TODO: Assign Admin Role automatically here once Roles are seeded

    ELSE
        -- Handle invite case or join existing org (logic depends on how invite metadata is passed)
        -- For now, just create a profile without org if no company_name
        INSERT INTO public.profiles (id, email)
        VALUES (new.id, new.email);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
