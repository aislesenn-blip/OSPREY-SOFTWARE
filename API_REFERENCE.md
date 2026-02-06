# OSPREY API Reference & Integration Guide

OSPREY uses a **Database-as-API** architecture via Supabase. Most business logic is encapsulated in PostgreSQL RPC functions to ensure ACID compliance and security.

## 1. Authentication
*   **Method:** Supabase Auth (JWT).
*   **Header:** `Authorization: Bearer <access_token>` (handled automatically by Supabase Client).

## 2. RPC Functions (Server-Side Logic)
These functions should be called using `supabase.rpc('function_name', { params })`.

### A. Finance Engine
#### `post_journal_entry(entry_id UUID)`
*   **Description:** Validates that a Journal Entry is balanced ($Debit = Credit$) and locks it as `POSTED`.
*   **Parameters:** `entry_id` (The UUID of the Draft entry).
*   **Returns:** `VOID`. Throws error if unbalanced or already posted.
*   **Usage:**
    ```typescript
    const { error } = await supabase.rpc('post_journal_entry', { entry_id: '...' });
    ```

### B. Payroll Engine
#### `execute_payroll_formula(employee_id_val UUID, formula_text TEXT)`
*   **Description:** Dynamic parser for Aruti-style payroll rules.
*   **Parameters:**
    *   `employee_id_val`: Target employee (to fetch context like Basic Pay).
    *   `formula_text`: The string to evaluate (e.g., `(BASIC + 50000) * 0.1`).
*   **Returns:** `DECIMAL` (The calculated value).
*   **Usage:** Used internally by the Payroll Run engine, but can be called for testing formulas.

#### `calculate_payroll_run(run_id UUID)`
*   **Description:** Batch processor that iterates all employees, applies active formulas, and generates Payslips.

### C. Inventory Engine
#### `process_blind_receiving(po_id_val UUID, received_items JSONB)`
*   **Description:** Processes stock receipt against a PO, calculates variance, and logs theft alerts.
*   **Parameters:**
    *   `po_id_val`: The Purchase Order UUID.
    *   `received_items`: JSON Array `[{"sku": "A1", "qty": 10}, ...]`.
*   **Returns:** `TEXT` (Status message).

## 3. Automation Triggers (Side Effects)
These actions happen automatically in the database.

*   **Vote Book Enforcement:**
    *   **Action:** Update `purchase_requests` status to `APPROVED`.
    *   **Effect:** The `check_budget_availability` trigger runs. If `Request > Available Budget`, the update fails with an error.
*   **Budget Alerts:**
    *   **Action:** Insert into `budget_consumption`.
    *   **Effect:** If usage > 90%, a `notification` is created for Admins.
*   **Audit Logging:**
    *   **Action:** Any INSERT/UPDATE/DELETE on critical tables (`nodes`, `budgets`, `roles`).
    *   **Effect:** A record is inserted into `activity_log`.

## 4. Onboarding & Nodes
*   **Auto-Configuration:**
    *   On `auth.signUp` with metadata `{ industry_type: 'UNIVERSITY' }`, the system automatically calls `initialize_organization_template`.
    *   This seeds `node_types` like "Campus", "Faculty", "Department".
*   **Bulk Import:**
    *   Function `process_bulk_node_import` accepts JSON data to batch create nodes.
    *   **Usage:** Upload Excel -> Parse to JSON -> Call RPC.

## 5. Deployment / Database Init
To deploy the database schema, run the SQL files in this order:
1.  `database/schema.sql` (Foundations)
2.  `database/02_core_engines.sql` (Core Ops)
3.  `database/03_communication_reporting.sql` (Comms & Reports)
4.  `database/04_automation_onboarding.sql` (Automation)
5.  `database/05_deep_logic_audit.sql` (Deep Logic)
6.  `database/06_final_polish.sql` (Onboarding Glue)
