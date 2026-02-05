# OSPREY Deployment Guide

## 1. Database Setup (Supabase)

This application requires a PostgreSQL database hosted on Supabase.

### Step 1: Run Schema
1. Login to your Supabase Dashboard.
2. Go to the **SQL Editor**.
3. Open `database/schema.sql` from this repository.
4. Copy and paste the content into the SQL Editor.
5. Click **Run**.

### Step 2: Seed Data (Optional)
1. Open `database/seed.sql`.
2. Copy and paste the content into the SQL Editor.
3. Click **Run**.
   *This populates the system with "Baobab Camps" organization, sample vehicles, and items.*

## 2. Application Deployment

### Environment Variables
Configure the following in your `.env.local` or deployment platform (Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=https://shdyscaybjzhblxqxfhs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Anon Key]
SUPABASE_SERVICE_ROLE_KEY=[Your Service Role Key]
```

### Build & Run
```bash
npm install
npm run build
npm start
```

## 3. Production Considerations
- **RLS Policies:** The provided schema includes basic RLS. For production, refine policies to distinguish between 'Camp Manager' and 'Admin' roles using `auth.uid()`.
- **Auth:** Integrate Supabase Auth UI (Login Page) to handle user sessions properly. The current API uses the Service Role key for demonstration of logic flow.
