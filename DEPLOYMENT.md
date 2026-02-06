# OSPREY Deployment Guide

## Prerequisites
*   Node.js 18+
*   Supabase Project
*   Vercel Account

## 1. Database Setup (Supabase)
1.  Create a new Supabase project.
2.  Go to the **SQL Editor**.
3.  Run the scripts in the `database/` folder in the following strict order:
    1.  `database/schema.sql` (Foundations & Universal Node)
    2.  `database/02_core_engines.sql` (Finance, HR, Inventory Logic)
    3.  `database/03_communication_reporting.sql` (Feed, Gate Pass, Reports)
    4.  `database/04_automation_onboarding.sql` (Triggers & Seed Functions)

## 2. Environment Variables
Create a `.env.local` file for local development and add these variables to Vercel for production:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Local Development
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```

## 4. Production Deployment (Vercel)
1.  Push code to GitHub.
2.  Import project into Vercel.
3.  Add the Environment Variables.
4.  Deploy.
5.  **Critical:** Ensure `next.config.js` is minimal to avoid build errors.

## 5. Post-Deployment Verification
*   Visit the URL.
*   Register a new Organization (e.g., "Acme Corp").
*   Check the `organizations` table in Supabase to confirm creation.
