# OSPREY Project Structure

This document outlines the architecture and file organization of the OSPREY Tourism ERP.

## Directory Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes (Admin actions)
│   ├── auth/               # Auth callbacks
│   ├── dashboard/          # Authenticated Application
│   │   ├── fleet/          # Fleet Management Module
│   │   ├── hr/             # HR & Staff Module
│   │   ├── inventory/      # Inventory Module
│   │   ├── operations/     # Operations Module
│   │   └── layout.tsx      # Dashboard Sidebar & Layout
│   ├── globals.css         # Global Styles & Tailwind Variables
│   └── page.tsx            # Auth Entry Point (Login/Register)
│
├── components/             # React Components
│   ├── ui/                 # Reusable UI Library (Button, Card, etc.)
│   └── Sidebar.tsx         # Dashboard Navigation
│
├── database/               # Database Assets
│   └── schema.sql          # Complete Supabase SQL Schema (Tables, RLS, Triggers)
│
├── lib/                    # Utilities & Configuration
│   ├── supabase.ts         # Supabase Client (Public)
│   ├── supabase-admin.ts   # Supabase Admin Client (Service Role)
│   └── utils.ts            # Helper functions (cn, formatters)
│
├── types/                  # TypeScript Definitions
│   └── index.ts            # Global Type Interfaces
│
├── next.config.js          # Next.js Config (Minimal)
├── package.json            # Dependencies & Scripts
└── tailwind.config.ts      # Tailwind Configuration
```

## Key Architectural Decisions

1.  **Multi-Tenancy:**
    *   Every database table includes `organization_id`.
    *   Row Level Security (RLS) policies enforce data isolation.
    *   Users are assigned to an Organization upon registration or invitation.

2.  **Authentication:**
    *   Powered by Supabase Auth.
    *   `app/page.tsx` handles Sign Up (Company creation) and Login.
    *   `app/api/admin/invite` allows Admins to invite users to their specific organization.

3.  **Data Fetching:**
    *   Primary fetching occurs client-side using the Supabase Client (`lib/supabase.ts`) in `useEffect` hooks for maximum responsiveness in the dashboard.
    *   Server-side operations (like Invites) use `lib/supabase-admin.ts`.

4.  **Styling:**
    *   Tailwind CSS with a custom "Corporate Luxury" theme.
    *   Colors: Deep Navy (`#0A192F`), Warm Sand (`#E6DDC4`), Forest Green (`#1B4D3E`).
    *   UI Components are modular and built with `class-variance-authority` principles (via `cn` utility).

## Deployment

1.  **Database Setup:**
    *   Run `database/schema.sql` in the Supabase SQL Editor.
2.  **Environment Variables:**
    *   Hardcoded in `lib/supabase.ts` for this build (as per instructions), but typically should be in `.env.local`.
3.  **Build:**
    *   `npm run build`
4.  **Start:**
    *   `npm start`
