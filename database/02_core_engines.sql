-- OSPREY Core Operations Engines
-- Finance, Budget, HR, Procurement, Inventory, Assets

-- ==========================================
-- 1. FINANCE ENGINE
-- ==========================================

-- Currencies & Exchange Rates
CREATE TABLE currencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- USD, TZS, KES
    name TEXT NOT NULL,
    symbol TEXT,
    is_base_currency BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    from_currency_id UUID REFERENCES currencies(id),
    to_currency_id UUID REFERENCES currencies(id),
    rate DECIMAL(20, 6) NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE, -- NULL means current
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fiscal Periods
CREATE TABLE fiscal_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'FY 2024'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fiscal_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    name TEXT NOT NULL, -- 'Jan 2024'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chart of Accounts
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- '1001'
    name TEXT NOT NULL,
    type account_type NOT NULL,
    parent_id UUID REFERENCES chart_of_accounts(id), -- For hierarchy
    currency_id UUID REFERENCES currencies(id), -- Optional, defaults to base
    is_active BOOLEAN DEFAULT TRUE,
    is_reconcilable BOOLEAN DEFAULT FALSE, -- For bank accounts, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Journal Entries
CREATE TYPE journal_status AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    fiscal_period_id UUID REFERENCES fiscal_periods(id),
    transaction_date DATE NOT NULL,
    reference TEXT, -- Invoice #, LPO #
    narration TEXT,
    status journal_status DEFAULT 'DRAFT',
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE journal_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id),
    description TEXT,
    debit DECIMAL(20, 2) DEFAULT 0,
    credit DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    -- Constraint: sum(debit) == sum(credit) enforced at Posting logic
);


-- ==========================================
-- 2. BUDGET CONTROL ENGINE
-- ==========================================

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    node_id UUID REFERENCES nodes(id), -- Department/Project
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'DRAFT', -- Draft, Approved, Active
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE budget_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id), -- Specific GL Account
    amount_allocated DECIMAL(20, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vote Book / Budget Consumption
-- Tracks real-time usage against budget lines
CREATE TABLE budget_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    budget_line_id UUID REFERENCES budget_lines(id),
    transaction_type TEXT NOT NULL, -- 'PR', 'LPO', 'EXPENSE'
    transaction_ref_id UUID, -- Link to PR/LPO ID
    amount DECIMAL(20, 2) NOT NULL,
    status TEXT NOT NULL, -- 'COMMITTED', 'SPENT', 'RELEASED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 3. HR & PAYROLL ENGINE (Aruti-style)
-- ==========================================

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id), -- Optional link to system user
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    employee_number TEXT NOT NULL,
    national_id TEXT,
    department_node_id UUID REFERENCES nodes(id),
    date_of_birth DATE,
    gender TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, employee_number)
);

CREATE TABLE salary_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'Grade A'
    basic_pay DECIMAL(20, 2) NOT NULL,
    currency_id UUID REFERENCES currencies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    salary_scale_id UUID REFERENCES salary_scales(id),
    start_date DATE NOT NULL,
    end_date DATE,
    contract_type TEXT, -- 'PERMANENT', 'CONTRACT'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Formula Builder
-- Types: 'FIXED', 'PERCENTAGE_BASIC', 'PERCENTAGE_GROSS', 'FORMULA', 'TAX_TABLE'
CREATE TABLE payroll_formulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'PAYE', 'NSSF', 'Housing Allowance'
    code TEXT NOT NULL, -- used in formula strings
    type TEXT NOT NULL, -- 'EARNING', 'DEDUCTION', 'STATUTORY'
    calculation_method TEXT NOT NULL,
    formula_expression TEXT, -- e.g. "basic_pay * 0.10"
    configuration JSONB DEFAULT '{}'::jsonb, -- Store tax bands or lookup tables
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    fiscal_period_id UUID REFERENCES fiscal_periods(id),
    name TEXT NOT NULL, -- 'January 2024 Payroll'
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'APPROVED', 'PAID'
    run_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    gross_pay DECIMAL(20, 2) DEFAULT 0,
    net_pay DECIMAL(20, 2) DEFAULT 0,
    total_deductions DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payslip_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    payslip_id UUID REFERENCES payslips(id) ON DELETE CASCADE,
    payroll_formula_id UUID REFERENCES payroll_formulas(id),
    amount DECIMAL(20, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    leave_type TEXT NOT NULL, -- 'ANNUAL', 'SICK'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'PENDING',
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 4. PROCUREMENT ENGINE
-- ==========================================

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    tax_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES profiles(id),
    department_node_id UUID REFERENCES nodes(id), -- Which budget to check
    needed_by DATE,
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'
    description TEXT,
    total_estimated_cost DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pr_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    pr_id UUID REFERENCES purchase_requests(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity DECIMAL(20, 2) NOT NULL,
    estimated_unit_cost DECIMAL(20, 2) NOT NULL,
    total_cost DECIMAL(20, 2) GENERATED ALWAYS AS (quantity * estimated_unit_cost) STORED,
    expense_account_id UUID REFERENCES chart_of_accounts(id), -- For budget check
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    pr_id UUID REFERENCES purchase_requests(id),
    po_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'ISSUED', -- 'ISSUED', 'DELIVERED', 'CLOSED'
    total_amount DECIMAL(20, 2) NOT NULL,
    issued_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'PR', 'PO', 'BUDGET'
    document_id UUID NOT NULL,
    approver_id UUID REFERENCES profiles(id),
    status TEXT NOT NULL, -- 'APPROVED', 'REJECTED'
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 5. INVENTORY ENGINE
-- ==========================================

-- Stores are Nodes, but we can have a helper table or view if needed.
-- For now, we assume Node Type 'Store' is used.

CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unit_of_measure TEXT, -- 'kg', 'pcs', 'liters'
    reorder_level DECIMAL(20, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, sku)
);

CREATE TABLE stock_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    store_node_id UUID REFERENCES nodes(id), -- The Store Node
    stock_item_id UUID REFERENCES stock_items(id),
    quantity_on_hand DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_node_id, stock_item_id)
);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    stock_item_id UUID REFERENCES stock_items(id),
    from_store_id UUID REFERENCES nodes(id),
    to_store_id UUID REFERENCES nodes(id),
    quantity DECIMAL(20, 2) NOT NULL,
    movement_type TEXT NOT NULL, -- 'RECEIVE', 'ISSUE', 'TRANSFER', 'ADJUSTMENT'
    reference TEXT, -- PO Number, Requisition ID
    is_blind_receive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blind_receivings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    po_id UUID REFERENCES purchase_orders(id),
    received_by UUID REFERENCES profiles(id),
    date_received TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 6. ASSET LIFECYCLE ENGINE
-- ==========================================

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    asset_tag TEXT UNIQUE NOT NULL,
    category TEXT,
    purchase_date DATE,
    purchase_cost DECIMAL(20, 2),
    current_value DECIMAL(20, 2),
    depreciation_method TEXT, -- 'STRAIGHT_LINE', 'DECLINING_BALANCE'
    useful_life_years INT,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'DISPOSED', 'MAINTENANCE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE asset_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id),
    assigned_to_employee_id UUID REFERENCES employees(id),
    assigned_date DATE DEFAULT CURRENT_DATE,
    return_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id),
    description TEXT,
    cost DECIMAL(20, 2),
    maintenance_date DATE DEFAULT CURRENT_DATE,
    performed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 7. LOGIC & FUNCTIONS
-- ==========================================

-- A. FINANCE: Double Entry & Posting
CREATE OR REPLACE FUNCTION post_journal_entry(entry_id UUID)
RETURNS VOID AS $$
DECLARE
    total_debit DECIMAL;
    total_credit DECIMAL;
    entry_status journal_status;
BEGIN
    -- Get status
    SELECT status INTO entry_status FROM journal_entries WHERE id = entry_id;
    IF entry_status = 'POSTED' THEN
        RAISE EXCEPTION 'Journal Entry is already posted.';
    END IF;

    -- Check Balance
    SELECT SUM(debit), SUM(credit) INTO total_debit, total_credit
    FROM journal_lines WHERE journal_entry_id = entry_id;

    IF total_debit != total_credit THEN
        RAISE EXCEPTION 'Journal Entry is not balanced. Debit: %, Credit: %', total_debit, total_credit;
    END IF;

    -- Lock and Post
    UPDATE journal_entries
    SET status = 'POSTED', posted_at = NOW()
    WHERE id = entry_id;

    -- NOTE: In a real system, we might update pre-calculated balances here.
END;
$$ LANGUAGE plpgsql;


-- B. BUDGET: Check Availability (Vote Book)
CREATE OR REPLACE FUNCTION check_budget_availability()
RETURNS TRIGGER AS $$
DECLARE
    budget_line_id_val UUID;
    available_amount DECIMAL;
    requested_amount DECIMAL;
BEGIN
    -- Only check on PR Approval
    IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
        -- Loop through PR lines
        FOR requested_amount, budget_line_id_val IN
            SELECT l.total_cost, b.id
            FROM pr_lines l
            JOIN purchase_requests pr ON pr.id = l.pr_id
            JOIN budgets bg ON bg.node_id = pr.department_node_id -- Find budget for dept
            JOIN budget_lines b ON b.budget_id = bg.id AND b.account_id = l.expense_account_id
            WHERE l.pr_id = NEW.id AND bg.status = 'ACTIVE'
        LOOP
            -- Calculate Available
            SELECT (bl.amount_allocated - COALESCE(SUM(bc.amount), 0)) INTO available_amount
            FROM budget_lines bl
            LEFT JOIN budget_consumption bc ON bc.budget_line_id = bl.id
            WHERE bl.id = budget_line_id_val
            GROUP BY bl.id;

            IF available_amount < requested_amount THEN
                RAISE EXCEPTION 'Budget exceeded for line ID %. Available: %, Requested: %', budget_line_id_val, available_amount, requested_amount;
            END IF;

            -- Commit Budget
            INSERT INTO budget_consumption (organization_id, budget_line_id, transaction_type, transaction_ref_id, amount, status)
            VALUES (NEW.organization_id, budget_line_id_val, 'PR', NEW.id, requested_amount, 'COMMITTED');
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pr_approve_check_budget
    BEFORE UPDATE ON purchase_requests
    FOR EACH ROW EXECUTE FUNCTION check_budget_availability();


-- C. INVENTORY: Stock Movement Trigger
CREATE OR REPLACE FUNCTION update_stock_levels()
RETURNS TRIGGER AS $$
BEGIN
    -- Update From Store (Reduce)
    IF NEW.from_store_id IS NOT NULL THEN
        UPDATE stock_levels
        SET quantity_on_hand = quantity_on_hand - NEW.quantity
        WHERE store_node_id = NEW.from_store_id AND stock_item_id = NEW.stock_item_id;

        -- If no record exists, this implies negative stock or error. For now, we assume levels initialized.
    END IF;

    -- Update To Store (Increase)
    IF NEW.to_store_id IS NOT NULL THEN
        INSERT INTO stock_levels (organization_id, store_node_id, stock_item_id, quantity_on_hand)
        VALUES (NEW.organization_id, NEW.to_store_id, NEW.stock_item_id, NEW.quantity)
        ON CONFLICT (store_node_id, stock_item_id)
        DO UPDATE SET quantity_on_hand = stock_levels.quantity_on_hand + NEW.quantity;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_stock_movement
    AFTER INSERT ON stock_movements
    FOR EACH ROW EXECUTE FUNCTION update_stock_levels();


-- D. PAYROLL: Calculation Engine (Stub for complexity)
CREATE OR REPLACE FUNCTION calculate_payroll_run(run_id UUID)
RETURNS VOID AS $$
DECLARE
    emp RECORD;
    formula RECORD;
    calc_amount DECIMAL;
BEGIN
    -- Iterate Active Employees
    FOR emp IN SELECT * FROM employees WHERE organization_id = (SELECT organization_id FROM payroll_runs WHERE id = run_id)
    LOOP
        -- Create Payslip
        INSERT INTO payslips (organization_id, payroll_run_id, employee_id)
        VALUES (emp.organization_id, run_id, emp.id);

        -- Iterate Formulas (Simplified: Basic Pay First)
        -- Real system would use a DAG (Directed Acyclic Graph) for dependency resolution

        -- 1. Get Basic Pay
        SELECT basic_pay INTO calc_amount
        FROM contracts
        JOIN salary_scales ON contracts.salary_scale_id = salary_scales.id
        WHERE contracts.employee_id = emp.id AND contracts.is_active = TRUE;

        -- 2. Apply Formulas (Example placeholder logic)
        FOR formula IN SELECT * FROM payroll_formulas WHERE organization_id = emp.organization_id AND is_active = TRUE
        LOOP
            IF formula.calculation_method = 'PERCENTAGE_GROSS' THEN
                -- calc_amount = gross * (formula.formula_expression::decimal);
            END IF;
            -- Insert Payslip Line
        END LOOP;

    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS for all new tables
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pr_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE blind_receivings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policy: View Own Org (Applied to all)
-- RLS Policies for Core Engines

-- Helper macro-like approach (manual expansion)

CREATE POLICY "Users can view currencies in their organization" ON currencies FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view exchange_rates in their organization" ON exchange_rates FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view fiscal_years in their organization" ON fiscal_years FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view fiscal_periods in their organization" ON fiscal_periods FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view chart_of_accounts in their organization" ON chart_of_accounts FOR SELECT USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view journal_entries in their organization" ON journal_entries FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can insert journal_entries in their organization" ON journal_entries FOR INSERT WITH CHECK (organization_id = get_auth_org_id());
CREATE POLICY "Users can update journal_entries in their organization" ON journal_entries FOR UPDATE USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view journal_lines in their organization" ON journal_lines FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can insert journal_lines in their organization" ON journal_lines FOR INSERT WITH CHECK (organization_id = get_auth_org_id());

CREATE POLICY "Users can view budgets in their organization" ON budgets FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view budget_lines in their organization" ON budget_lines FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view budget_consumption in their organization" ON budget_consumption FOR SELECT USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view employees in their organization" ON employees FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view salary_scales in their organization" ON salary_scales FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view contracts in their organization" ON contracts FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view payroll_formulas in their organization" ON payroll_formulas FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view payroll_runs in their organization" ON payroll_runs FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view payslips in their organization" ON payslips FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view payslip_lines in their organization" ON payslip_lines FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view leave_requests in their organization" ON leave_requests FOR SELECT USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view suppliers in their organization" ON suppliers FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view purchase_requests in their organization" ON purchase_requests FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can insert purchase_requests in their organization" ON purchase_requests FOR INSERT WITH CHECK (organization_id = get_auth_org_id());
CREATE POLICY "Users can update purchase_requests in their organization" ON purchase_requests FOR UPDATE USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view pr_lines in their organization" ON pr_lines FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can insert pr_lines in their organization" ON pr_lines FOR INSERT WITH CHECK (organization_id = get_auth_org_id());

CREATE POLICY "Users can view purchase_orders in their organization" ON purchase_orders FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view approvals in their organization" ON approvals FOR SELECT USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view stock_items in their organization" ON stock_items FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view stock_levels in their organization" ON stock_levels FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view stock_movements in their organization" ON stock_movements FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can insert stock_movements in their organization" ON stock_movements FOR INSERT WITH CHECK (organization_id = get_auth_org_id());

CREATE POLICY "Users can view blind_receivings in their organization" ON blind_receivings FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view assets in their organization" ON assets FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view asset_assignments in their organization" ON asset_assignments FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can view maintenance_logs in their organization" ON maintenance_logs FOR SELECT USING (organization_id = get_auth_org_id());
