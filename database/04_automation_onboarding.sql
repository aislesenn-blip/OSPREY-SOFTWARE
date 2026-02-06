-- OSPREY Module 4: Automation & Onboarding Logic
-- Implements Triggers for Alerts, Onboarding seed functions

-- ==========================================
-- 1. AUTOMATION ENGINE (Triggers)
-- ==========================================

-- A. Generic Activity Logger (Audit Trail)
CREATE OR REPLACE FUNCTION log_activity_trigger()
RETURNS TRIGGER AS $$
DECLARE
    sys_user_id UUID;
BEGIN
    -- Attempt to get user ID from session, null if system/job
    BEGIN
        sys_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        sys_user_id := NULL;
    END;

    INSERT INTO activity_log (organization_id, user_id, action_type, table_name, record_id, metadata)
    VALUES (
        COALESCE(NEW.organization_id, OLD.organization_id),
        sys_user_id,
        TG_OP,
        TG_TABLE_NAME::TEXT,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object('diff', row_to_json(NEW)::jsonb - row_to_json(OLD)::jsonb)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Audit Log to critical tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION log_activity_trigger();
CREATE TRIGGER audit_roles AFTER INSERT OR UPDATE OR DELETE ON roles FOR EACH ROW EXECUTE FUNCTION log_activity_trigger();
CREATE TRIGGER audit_budgets AFTER INSERT OR UPDATE OR DELETE ON budgets FOR EACH ROW EXECUTE FUNCTION log_activity_trigger();
CREATE TRIGGER audit_nodes AFTER INSERT OR UPDATE OR DELETE ON nodes FOR EACH ROW EXECUTE FUNCTION log_activity_trigger();


-- B. Budget Alert Automation
-- Sends a notification if a Budget Line exceeds 90% utilization
CREATE OR REPLACE FUNCTION notify_budget_threshold()
RETURNS TRIGGER AS $$
DECLARE
    alloc DECIMAL;
    used DECIMAL;
    percent_used DECIMAL;
    dept_name TEXT;
    acc_name TEXT;
BEGIN
    -- Only check on INSERT (new consumption)
    -- Fetch Allocation
    SELECT amount_allocated INTO alloc FROM budget_lines WHERE id = NEW.budget_line_id;

    -- Fetch Total Used (including this new one)
    SELECT SUM(amount) INTO used FROM budget_consumption WHERE budget_line_id = NEW.budget_line_id;

    IF alloc > 0 THEN
        percent_used := (used / alloc) * 100;

        -- Trigger Alert at 90%
        IF percent_used >= 90 THEN
            -- Get Names for message
            SELECT n.name, c.name INTO dept_name, acc_name
            FROM budget_lines bl
            JOIN budgets b ON bl.budget_id = b.id
            JOIN nodes n ON b.node_id = n.id
            JOIN chart_of_accounts c ON bl.account_id = c.id
            WHERE bl.id = NEW.budget_line_id;

            -- Insert Notification for Finance Admin (simplified to Org Owner logic or just generic Alert)
            -- Ideally, we find users with 'FINANCE_ADMIN' role. For now, notify all Admins in Org.
            INSERT INTO notifications (organization_id, user_id, title, message, type)
            SELECT
                NEW.organization_id,
                p.id,
                'Budget Alert: ' || dept_name,
                'Budget line for ' || acc_name || ' has reached ' || ROUND(percent_used, 1) || '% utilization.',
                'ALERT'
            FROM profiles p
            WHERE p.organization_id = NEW.organization_id; -- TODO: Filter by Role 'Admin'
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_budget_threshold
    AFTER INSERT ON budget_consumption
    FOR EACH ROW EXECUTE FUNCTION notify_budget_threshold();


-- ==========================================
-- 2. ONBOARDING SYSTEM (Seed Functions)
-- ==========================================

-- Function to seed default Node Types based on industry
-- 'UNIVERSITY', 'COMPANY', 'NGO', 'GOVERNMENT'
CREATE OR REPLACE FUNCTION initialize_organization_template(org_id UUID, industry_type TEXT)
RETURNS VOID AS $$
BEGIN
    IF industry_type = 'UNIVERSITY' THEN
        INSERT INTO node_types (organization_id, name, description) VALUES
        (org_id, 'Campus', 'Physical main location'),
        (org_id, 'Faculty', 'Academic division e.g., Science'),
        (org_id, 'Department', 'Sub-division e.g., Computer Science'),
        (org_id, 'Lecture Hall', 'Physical room resource');

    ELSIF industry_type = 'COMPANY' THEN
        INSERT INTO node_types (organization_id, name, description) VALUES
        (org_id, 'Branch', 'Regional Office'),
        (org_id, 'Division', 'High-level functional area'),
        (org_id, 'Department', 'Functional team'),
        (org_id, 'Team', 'Small working group');

    ELSIF industry_type = 'GOVERNMENT' THEN
        INSERT INTO node_types (organization_id, name, description) VALUES
        (org_id, 'Ministry', 'Top level body'),
        (org_id, 'Directorate', 'High level division'),
        (org_id, 'District Office', 'Regional presence');

    ELSE
        -- Default Generic
        INSERT INTO node_types (organization_id, name, description) VALUES
        (org_id, 'Branch', 'Location'),
        (org_id, 'Department', 'Team');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Bulk Node Import Function (for Excel uploads)
-- Expects JSON: [{ "name": "HR", "type": "Department", "parent_name": "Headquarters" }, ...]
-- Note: Simplified logic. In production, we'd use IDs or complex matching.
CREATE OR REPLACE FUNCTION process_bulk_node_import(org_id UUID, nodes_data JSONB)
RETURNS TEXT AS $$
DECLARE
    node_item JSONB;
    type_id_val UUID;
    parent_id_val UUID;
    created_count INT := 0;
BEGIN
    FOR node_item IN SELECT * FROM jsonb_array_elements(nodes_data)
    LOOP
        -- 1. Resolve Type
        SELECT id INTO type_id_val FROM node_types
        WHERE organization_id = org_id AND name = (node_item->>'type')
        LIMIT 1;

        -- If Type doesn't exist, create it dynamically? Or skip. Let's skip for safety.
        IF type_id_val IS NOT NULL THEN
            -- 2. Resolve Parent (Self-referential lookup by name - fragile but matches prompt 'auto-configure')
            SELECT id INTO parent_id_val FROM nodes
            WHERE organization_id = org_id AND name = (node_item->>'parent_name')
            LIMIT 1;

            -- 3. Insert
            INSERT INTO nodes (organization_id, type_id, parent_id, name)
            VALUES (org_id, type_id_val, parent_id_val, (node_item->>'name'));

            created_count := created_count + 1;
        END IF;
    END LOOP;

    RETURN 'Successfully imported ' || created_count || ' nodes.';
END;
$$ LANGUAGE plpgsql;
