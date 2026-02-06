# Project Structure

The repository follows a flattened Next.js App Router structure.

## Root Directory
- `app/`: Next.js Application routes and layouts.
- `components/`: Reusable React components.
  - `ui/`: Core design system components (Button, Card, Table).
  - `layout/`: Shell components (Sidebar, Navbar).
  - `auth/`: Authentication forms.
- `lib/`: Utility functions and clients.
  - `supabase.ts`: Supabase client initialization.
  - `utils.ts`: Helper functions (formatting, classes).
- `database/`: SQL schemas and migrations.
- `types/`: TypeScript interface definitions.
- `public/`: Static assets (images, fonts).

## Key Files
- `app/layout.tsx`: Root layout, font configuration.
- `app/page.tsx`: Authentication entry point.
- `app/dashboard/layout.tsx`: Authenticated shell with Sidebar.
- `database/schema.sql`: Source of truth for database structure.

## Design System
- **Colors**: Defined in `tailwind.config.ts` (Osprey Navy, Sand, Forest).
- **Icons**: Lucide React.
- **Typography**: Inter (via Google Fonts).

## Conventions
- **Multi-tenancy**: Every database query must filter by `organization_id`.
- **RLS**: Row Level Security is enabled on all tables.
- **Strict Mode**: TypeScript strict mode is enabled.
- **Client Components**: Use `'use client'` at the top of files using hooks.
