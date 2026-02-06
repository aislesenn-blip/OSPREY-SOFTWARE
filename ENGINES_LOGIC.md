# OSPREY Core Operations Engines - Logic Documentation

This document outlines the core business logic implemented in the OSPREY database layer via PostgreSQL Functions and Triggers.

## 1. Finance Engine: Double-Entry & Posting

**Concept:**
OSPREY enforces Strict Double-Entry Accounting. Every transaction must balance ($Debit = Credit$) before it affects the General Ledger.

**Logic Flow:**
1.  **Draft Stage:** Users create `journal_entries` with status `DRAFT`. Lines (`journal_lines`) are added. No validation is performed at this stage to allow partial entry.
2.  **Posting Action:** A user triggers the `post_journal_entry(entry_id)` function.
3.  **Validation:**
    *   The function sums all `debit` and `credit` values for the entry.
    *   If `SUM(debit) != SUM(credit)`, the transaction acts atomically: it raises an EXCEPTION and rolls back.
4.  **Locking:**
    *   If balanced, the entry status is updated to `POSTED`.
    *   `posted_at` timestamp is set.
    *   RLS policies typically prevent editing `POSTED` entries (Immutable Ledger).

**Database Function:** `post_journal_entry`

---

## 2. Budget Control Engine: Vote-Book Enforcement

**Concept:**
The "Vote Book" prevents overspending by checking funds *before* a liability is committed (e.g., at Purchase Request approval), not just at payment.

**Logic Flow:**
1.  **Trigger Event:** A `purchase_requests` record changes status to `APPROVED`.
2.  **Budget Lookup:**
    *   System identifies the Department (`node_id`) and the Expense Account (`chart_of_accounts`).
    *   It locates the corresponding `budget_lines` record for the active Fiscal Year.
3.  **Availability Calculation:**
    *   `Available = Allocated - (Committed + Spent)`
    *   `Committed`: Value of approved PRs and issued LPOs.
    *   `Spent`: Value of actual Invoices/Payments.
4.  **Enforcement:**
    *   If `Request Amount > Available`, the Trigger raises an EXCEPTION: `"Budget exceeded for line..."`.
    *   The PR Approval transaction is aborted.
5.  **Commitment:**
    *   If funds exist, a new record is inserted into `budget_consumption` with status `COMMITTED`.

**Database Trigger:** `check_budget_availability`

---

## 3. HR & Payroll Engine: Formula Builder

**Concept:**
Payroll is calculated instantly using a "Formula Builder" engine. Rules are not hardcoded but stored as data in `payroll_formulas`.

**Logic Flow:**
1.  **Execution:** The `calculate_payroll_run(run_id)` function is called.
2.  **Employee Iteration:** The function loops through all active employees in the Organization.
3.  **Base Retrieval:** It fetches the `basic_pay` from the active `contracts` table.
4.  **Formula Application:**
    *   It iterates through active `payroll_formulas`.
    *   **Logic Types:**
        *   `FIXED`: Adds a static amount (e.g., Transport Allowance).
        *   `PERCENTAGE_GROSS`: Calculates `gross * percentage` (e.g., 5% Housing).
        *   `TAX_TABLE` (PAYE): Looks up the cumulative income in a JSONB tax band configuration stored in `payroll_formulas.configuration`.
    *   **Chaining:** The system maintains a running `gross` and `net` total during the loop.
5.  **Persistance:**
    *   A `payslips` record is created.
    *   `payslip_lines` are inserted for each formula result.

**Database Function:** `calculate_payroll_run`

---

## 4. Inventory Engine: Real-time Stock Movement

**Concept:**
Stock levels are updated immediately upon movement (Receive, Issue, Transfer).

**Logic Flow:**
1.  **Movement:** A `stock_movements` record is inserted (e.g., Receive 100 items at Main Store).
2.  **Trigger:** `update_stock_levels` fires.
3.  **Adjustment:**
    *   **Inbound:** Updates `stock_levels` for the specific `store_node_id`. Uses `ON CONFLICT DO UPDATE` to handle new items.
    *   **Outbound:** Decrements `stock_levels`. (Validation for negative stock can be added here).

**Database Trigger:** `update_stock_levels`
