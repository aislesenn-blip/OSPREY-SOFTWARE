# OSPREY - Enterprise Tourism Operating System
**Version 1.0.0**

## Introduction

OSPREY is a high-end, multi-tenant ERP system designed specifically for safari and tourism companies in Tanzania. It combines fleet logistics, inventory control, HR, and operations into a single, cohesive platform.

## System Access

### Registration (New Company)
1.  Navigate to the landing page.
2.  Select **"Register Company"**.
3.  Enter your Organization Name, Full Name, Email, and Password.
4.  This creates a new secure workspace and assigns you as the Admin.

### Login (Existing Users)
1.  Navigate to the landing page.
2.  Enter Email and Password.
3.  Click **"Sign In"**.

### User Management
*   **Inviting Users:** Admins can invite new staff via the **HR Module** (`/dashboard/hr`).
*   **Roles:** Admin, Manager, Driver, Mechanic, Storekeeper, Staff.

## Modules

### 1. Dashboard Overview
Provides a high-level view of the company's health:
*   Active Fleet count.
*   Staff on duty.
*   Low stock alerts.
*   Recent system activity.

### 2. Fleet Management (`/dashboard/fleet`)
Manage the entire vehicle lifecycle.
*   **Vehicle List:** View all vehicles, status, and mileage.
*   **Vehicle Details:** Click a vehicle to see history, logs, and maintenance.
*   **Trips:** Log trips to track vehicle usage and driver assignments.
*   **Fuel:** Track fuel consumption and cost per km.

### 3. Inventory Control (`/dashboard/inventory`)
Track stock across Main Store, Camp Stores, and Departments.
*   **Stock List:** View real-time stock levels and valuation.
*   **Blind Receiving:** Securely receive stock without seeing expected quantities to ensure accuracy.
*   **Valuation:** Automatic calculation of stock value based on FIFO/Average Cost.

### 4. Operations (`/dashboard/operations`)
Live view of company movements.
*   **Manifests:** Track guest arrivals and departures.
*   **Active Trips:** Monitor vehicles currently on safari.

### 5. HR & Payroll (`/dashboard/hr`)
Manage the workforce.
*   **Staff Directory:** Central database of all employees.
*   **User Access:** Invite users to the system with specific roles.

## Technical Support

For system issues, please contact the IT Department.

---
*Built with Next.js, Supabase, and Tailwind CSS.*
