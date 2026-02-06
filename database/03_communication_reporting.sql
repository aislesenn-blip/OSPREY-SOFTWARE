-- OSPREY Module 3: Communication, Gate Pass & Reporting
-- Implements Organization Feed, Notifications, Gate Logic, and Reporting Views

-- ==========================================
-- 1. ORGANIZATION FEED (Twitter-Style)
-- ==========================================

CREATE TABLE organization_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    -- Polymorphic attachment to any system object (e.g., 'purchase_requests', 'project_node')
    related_document_type TEXT,
    related_document_id UUID,
    -- Context tagging
    tags TEXT[], -- ['#finance', '#urgent']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE feed_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    feed_id UUID REFERENCES organization_feed(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'ALERT', 'INFO', 'APPROVAL_REQ'
    link TEXT, -- Internal URL
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Stores changes/diffs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 2. QR GATE PASS SYSTEM
-- ==========================================

CREATE TABLE gate_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    pass_number TEXT UNIQUE NOT NULL, -- Generated readable ID
    user_id UUID REFERENCES profiles(id), -- Employee
    visitor_name TEXT, -- Or Visitor
    visitor_id_number TEXT,
    purpose TEXT,
    items_carrying TEXT, -- 'Laptop, Tools'
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'ACTIVE', 'EXPIRED', 'CLOSED'
    approved_by UUID REFERENCES profiles(id),
    qr_token TEXT UNIQUE NOT NULL, -- The string encoded in the QR
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gate_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    gate_pass_id UUID REFERENCES gate_passes(id),
    guard_id UUID REFERENCES profiles(id),
    scan_type TEXT NOT NULL, -- 'ENTRY', 'EXIT'
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);


-- ==========================================
-- 3. REPORTING ENGINE (Views)
-- ==========================================

-- A. Financial Statement View (Trial Balance / Income Statement Foundation)
CREATE OR REPLACE VIEW view_financial_summary AS
SELECT
    coa.organization_id,
    coa.type AS account_type,
    coa.code AS account_code,
    coa.name AS account_name,
    fy.name AS fiscal_year,
    SUM(jl.debit) AS total_debit,
    SUM(jl.credit) AS total_credit,
    (SUM(jl.debit) - SUM(jl.credit)) AS net_movement
FROM chart_of_accounts coa
JOIN journal_lines jl ON jl.account_id = coa.id
JOIN journal_entries je ON jl.journal_entry_id = je.id
JOIN fiscal_periods fp ON je.fiscal_period_id = fp.id
JOIN fiscal_years fy ON fp.fiscal_year_id = fy.id
WHERE je.status = 'POSTED'
GROUP BY coa.organization_id, coa.type, coa.code, coa.name, fy.name;

-- B. Budget vs Actual View
CREATE OR REPLACE VIEW view_budget_performance AS
SELECT
    b.organization_id,
    b.name AS budget_name,
    n.name AS department,
    coa.name AS expense_head,
    bl.amount_allocated,
    COALESCE(SUM(bc.amount) FILTER (WHERE bc.status = 'COMMITTED'), 0) AS committed,
    COALESCE(SUM(bc.amount) FILTER (WHERE bc.status = 'SPENT'), 0) AS spent,
    (bl.amount_allocated - COALESCE(SUM(bc.amount), 0)) AS remaining
FROM budget_lines bl
JOIN budgets b ON bl.budget_id = b.id
JOIN nodes n ON b.node_id = n.id
JOIN chart_of_accounts coa ON bl.account_id = coa.id
LEFT JOIN budget_consumption bc ON bc.budget_line_id = bl.id
GROUP BY b.organization_id, b.name, n.name, coa.name, bl.amount_allocated;

-- C. Inventory Status View
CREATE OR REPLACE VIEW view_inventory_valuation AS
SELECT
    si.organization_id,
    si.name AS item_name,
    si.sku,
    n.name AS store_name,
    sl.quantity_on_hand,
    -- Assuming FIFO/Avg Cost logic would provide a unit_cost.
    -- For this foundation, we will assume a standard cost or latest cost from stock_items/movements
    -- Placeholder: 0 for cost if not implemented in core yet
    0 AS estimated_unit_value
FROM stock_levels sl
JOIN stock_items si ON sl.stock_item_id = si.id
JOIN nodes n ON sl.store_node_id = n.id;


-- ==========================================
-- 4. RLS POLICIES
-- ==========================================

ALTER TABLE organization_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_logs ENABLE ROW LEVEL SECURITY;

-- Apply standard org-scoped policies
CREATE POLICY "Users can view feed in their organization" ON organization_feed FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can insert feed in their organization" ON organization_feed FOR INSERT WITH CHECK (organization_id = get_auth_org_id());

CREATE POLICY "Users can view comments in their organization" ON feed_comments FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can insert comments in their organization" ON feed_comments FOR INSERT WITH CHECK (organization_id = get_auth_org_id());

CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (organization_id = get_auth_org_id() AND user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view activity_log in their organization" ON activity_log FOR SELECT USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view gate_passes in their organization" ON gate_passes FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Users can insert gate_passes in their organization" ON gate_passes FOR INSERT WITH CHECK (organization_id = get_auth_org_id());
CREATE POLICY "Users can update gate_passes in their organization" ON gate_passes FOR UPDATE USING (organization_id = get_auth_org_id());

CREATE POLICY "Users can view gate_logs in their organization" ON gate_logs FOR SELECT USING (organization_id = get_auth_org_id());
CREATE POLICY "Guards can insert gate_logs" ON gate_logs FOR INSERT WITH CHECK (organization_id = get_auth_org_id()); -- Logic implies Guard role check, simplified to org check for schema
