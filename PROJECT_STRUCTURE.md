# OSPREY - Universal Enterprise Operating System

OSPREY is a production-grade, industry-agnostic ERP designed to run the internal operations of any organization (Tourism, Construction, Retail, NGOs, etc.).

## Project Structure

```
/
├── app/                        # Next.js App Router (Frontend)
│   ├── api/                    # API Routes (External Integrations)
│   │   ├── inventory/          # Inventory API
│   │   └── admin/              # Admin/Invite API
│   ├── auth/                   # Authentication Pages & Callbacks
│   ├── dashboard/              # Protected Application Area
│   │   ├── assets/             # Asset Management (Equipment/Machinery)
│   │   ├── communication/      # Internal Chat & Announcements
│   │   ├── finance/            # Accounting & Ledger
│   │   ├── fleet/              # Fleet Management (Vehicles)
│   │   ├── forms/              # Custom Forms & Approvals
│   │   ├── hr/                 # HR & Payroll Engine
│   │   ├── inventory/          # Inventory & Stock Control
│   │   ├── operations/         # Daily Operations (Trips/Manifests)
│   │   ├── reports/            # BI & Reporting Engine
│   │   ├── settings/           # Organization Configuration
│   │   ├── tasks/              # Project & Task Management
│   │   └── page.tsx            # Dashboard Home (Dynamic Stats)
│   ├── onboarding/             # Industry Selection Flow
│   ├── globals.css             # Tailwind Global Styles
│   ├── layout.tsx              # Root Layout
│   └── page.tsx                # Landing / Login Page
│
├── components/                 # React UI Components
│   ├── ui/                     # Shadcn-like Primitives (Cards, Buttons, Inputs)
│   └── Sidebar.tsx             # Main Navigation
│
├── database/                   # Database Assets
│   └── schema.sql              # Universal PostgreSQL Schema (Tables, RLS, Triggers)
│
├── lib/                        # Core Logic & Utilities
│   ├── actions.ts              # Server Actions (Mutations)
│   ├── supabase.ts             # Supabase Client (Data Fetching)
│   ├── supabase-admin.ts       # Admin Client (Service Role)
│   └── utils.ts                # Helpers (Formatting, Class Merging)
│
└── types/                      # TypeScript Definitions
    └── index.ts                # Global Types (Employee, Item, Transaction)
```

## Core Modules

1.  **Organization Structure:** Dynamic configuration of Branches, Departments, and Roles via `app/dashboard/settings`.
2.  **Communication:** Internal announcements and messaging (`app/dashboard/communication`).
3.  **Task Management:** Workflows and assignments (`app/dashboard/tasks`).
4.  **HR & Payroll:** Employee records, contracts, and net pay calculation (`app/dashboard/hr`).
5.  **Accounting:** Double-entry ledger and financial summaries (`app/dashboard/finance`).
6.  **Inventory:** Universal stock management with multi-location transfers (`app/dashboard/inventory`).
7.  **Assets:** Lifecycle tracking for all company equipment (`app/dashboard/assets`).
8.  **Fleet:** specialized tracking for vehicles and trips (`app/dashboard/fleet`).
9.  **Forms:** Custom request forms with approval workflows (`app/dashboard/forms`).
10. **Reporting:** Cross-module business intelligence (`app/dashboard/reports`).

## Tech Stack

*   **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
*   **Backend:** Supabase (PostgreSQL 15), Server Actions.
*   **Auth:** Supabase Auth (RLS enforced).
*   **Infrastructure:** Vercel (Edge Network).

## Security Model

*   **Multi-Tenancy:** Every table has `organization_id`.
*   **RLS:** Row Level Security policies enforce isolation.
*   **Audit:** `audit_logs` table captures every INSERT/UPDATE/DELETE with forensic JSON diffs.
