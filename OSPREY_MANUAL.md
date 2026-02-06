# OSPREY Enterprise Tourism OS

## System Overview
OSPREY is a high-end, multi-tenant SaaS ERP designed specifically for safari and tourism companies in Tanzania. It combines the functionality of SAP/Odoo with the design principles of Linear/Stripe.

## Core Modules

### 1. Inventory Engine
- **Global Stock**: Real-time view of stock across Main Store, Camp Stores, and Departments.
- **Blind Receiving**: Security-focused receiving process where actual quantities are hidden from receivers.
- **Unit Conversions**: Handles complex safari units (e.g., Kgs to Portions).
- **Valuation**: FIFO/Weighted Average costing (configurable).

### 2. Fleet Command
- **Vehicle Tracking**: Detailed registry of all safari cruisers, trucks, and supply vehicles.
- **Trip Logs**: Digital logbooks for every movement, calculating KM and fuel consumption.
- **Maintenance**: Predictive service scheduling based on KM logs.
- **Fuel Control**: Variance reporting between issued fuel and logged consumption.

### 3. HR & Payroll
- **Staff Directory**: Centralized employee database.
- **Leave Management**: Workflow for leave requests and approvals.
- **Payroll**: Automated calculation of Tanzania PAYE, NSSF, and other deductions.

### 4. Operations (Guest Manifest)
- **Manifest**: Real-time view of arriving and departing guests.
- **Dietary & Preferences**: Critical info for Camp Managers and Chefs.
- **Rooming**: Tent/Room allocation management.

### 5. Finance & Reporting
- **Profit Per Trip**: Analysis of revenue vs. direct costs (fuel, park fees, allowances).
- **Stock Valuation**: Real-time asset value reporting.

## User Roles & Permissions
- **Admin**: Full system access.
- **Camp Manager**: Access to specific Camp Store, Staff, and Guest Manifest.
- **Inventory Manager**: Full control over stock, purchasing, and transfers.
- **Storekeeper**: Restricted to Issues and Receiving.
- **Driver**: Can only log Trips and Fuel.
- **Mechanic**: Access to Maintenance Job Cards.
- **HR Manager**: Access to Staff and Payroll.

## Technical Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons.
- **Backend**: Supabase (PostgreSQL).
- **Auth**: Supabase Auth (Row Level Security enforced).
- **Deployment**: Vercel.

## Getting Started
1. **Registration**: Companies register via the landing page. This creates a new `organization`.
2. **User Invite**: Admins invite staff via the Admin Settings.
3. **Setup**: Configure Warehouses and Vehicles to begin operations.
