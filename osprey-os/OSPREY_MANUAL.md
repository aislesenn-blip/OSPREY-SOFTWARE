# OSPREY MANUAL: The "Bible" of the System

## 1. What is Osprey?
OSPREY is the **Internal Operating System for High-End Safari Operations**. It is a multi-tenant SaaS ERP designed specifically for the unique logistical challenges of operating luxury safari camps in remote locations like Tanzania.

It replaces disjointed spreadsheets and paper trails with a unified digital command center.

### Core Logic
*   **Single Truth:** All data (Inventory, Fleet, HR, Guests) lives in one cloud database.
*   **Offline-First Thinking:** Designed to be robust even with intermittent connectivity (though primarily cloud-based).
*   **Strict Hierarchy:** Information flows from Camps -> HQ -> Accounts.

## 2. The Architecture & Flow

### Connectivity
*   **Supabase (PostgreSQL)** is the backend brain.
*   **Next.js (App Router)** is the frontend interface.
*   **Vercel** is the deployment infrastructure.

### Organization Onboarding (The "Genesis")
1.  **Registration:** A Company (Organization) is created in the database manually or via a Super-Admin portal.
2.  **Admin Creation:** The first user (Admin) is linked to this Organization.
3.  **Expansion:** The Admin logs in and creates other users (Camp Managers, Drivers, etc.) via the HR/Staff module.

### Multi-Tenancy
*   **Rule #1:** Every single row in the database has an `organization_id`.
*   **Data Isolation:** Users can ONLY see data belonging to their `organization_id`.
*   **RLS (Row Level Security):** The database enforces this isolation at the lowest level.

## 3. The User Roles

Who uses Osprey?

| Role | Responsibility | Access Level |
| :--- | :--- | :--- |
| **Admin** | The Owner/General Manager. | **God Mode.** Can see all camps, finances, and settings. |
| **Camp Manager** | Runs a specific Camp (e.g., Baobab Camp). | specific Camp Inventory, Guest Lists, Maintenance. |
| **Storekeeper** | Manages the Central Store or Camp Store. | Inventory (Receive, Issue, Stocktake). Cannot see Finance/HR. |
| **Driver** | Safari Guides & Logistics Drivers. | Vehicle Checks, Fuel Logs, Trip Logs. |
| **Mechanic** | Fleet Maintenance. | Service Logs, Spare Parts usage. |
| **Accountant** | HQ Finance Team. | Ledger, Reports, Expenses, Revenue. |
| **Guard/Gate** | Security Post. | Gate Passes, Vehicle In/Out logging. |

## 4. The Login Logic

*   **No Self-Signup:** Public users cannot just "sign up". Access is granted by the Organization Admin.
*   **Credentials:** Users log in with **Email** and **Password**.
*   **Authentication Flow:**
    1.  User enters credentials on `/` (Login Page).
    2.  Supabase Auth validates the user.
    3.  System checks the `profiles` table to get the User's `role` and `organization_id`.
    4.  User is redirected to `/dashboard`.
    5.  **404 Protection:** If a user tries to access a restricted or non-existent page, they are safely redirected to `/dashboard`.
