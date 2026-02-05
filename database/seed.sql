-- Seed Data for Osprey OS

-- 1. Create Organization
INSERT INTO organizations (id, name)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Baobab Camps'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Leopard Tours')
ON CONFLICT DO NOTHING;

-- 2. Create Locations
INSERT INTO inventory_locations (organization_id, name, type)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Arusha HQ Main Store', 'main_store'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Baobab Nabi Camp Kitchen', 'kitchen');

-- 3. Create Items
INSERT INTO inventory_items (organization_id, name, category, unit, minimum_stock)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tomatoes', 'food', 'kg', 10),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Diesel', 'fuel', 'liter', 1000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Amarula 750ml', 'beverage', 'bottle', 5);

-- 4. Create Vehicles
INSERT INTO vehicles (organization_id, plate_number, model, service_due_km, current_km, status)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'T 450 DFG', 'Land Cruiser 79', 155000, 150000, 'active'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'T 888 AAA', 'Land Rover Defender', 200000, 201000, 'blocked'); -- Blocked due to overdue service

-- 5. Create Camp & Rooms
WITH camp_insert AS (
    INSERT INTO camps (organization_id, name)
    VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Baobab Nabi')
    RETURNING id
)
INSERT INTO rooms (organization_id, camp_id, name, status)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', id, 'Tent 1', 'active' FROM camp_insert
UNION ALL
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', id, 'Tent 2', 'maintenance' FROM camp_insert;

-- 6. Create Staff
INSERT INTO staff (organization_id, full_name, role)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Juma Juma', 'Driver'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Alice Smith', 'Chef');
