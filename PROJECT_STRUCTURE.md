# PROJECT STRUCTURE

## THE GOLDEN RULES (WARNING)
1.  **CRITICAL:** `package.json` must ALWAYS be at the Root.
2.  **CRITICAL:** `app/page.tsx` must be at `root/app/page.tsx`.
3.  **DO NOT** nest this project inside `src/` or `osprey-os/` folders.

## Visual Tree

```
.
├── app
│   ├── dashboard      # Protected Application Routes (Sidebar Layout)
│   ├── api            # API Routes
│   ├── layout.tsx     # Root Layout (html/body)
│   ├── page.tsx       # Login Page (Landing)
│   └── not-found.tsx  # 404 Handler
├── components         # Shared React Components
├── lib                # Utilities (Supabase client, Helpers)
├── public             # Static Assets (Images, Icons)
├── types              # TypeScript Interfaces
├── database           # SQL Schema
├── package.json       # Project Dependencies (ROOT LEVEL)
├── next.config.js     # Next.js Config (ROOT LEVEL)
├── tsconfig.json      # TypeScript Config (ROOT LEVEL)
└── PROJECT_STRUCTURE.md
```

## File Descriptions

*   **app/**: Contains the main application code (Next.js App Router).
    *   **app/page.tsx**: The public Login page.
    *   **app/dashboard/**: The authenticated area of the app. All routes here share the Dashboard Layout (Sidebar).
*   **components/**: Reusable UI components (Buttons, Cards, Inputs).
*   **lib/**: Backend logic and shared utilities.
    *   `supabase.ts`: The Supabase client initialization.
*   **public/**: Static files served directly (e.g., logos).
*   **database/**: Contains `schema.sql` for setting up the Supabase database.
