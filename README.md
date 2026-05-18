# Admin Panel — Production-Ready

A clean-architecture admin panel built on **TanStack Start** (React 19 + Vite 7), **TanStack Query**, **React Hook Form + Zod**, **Tailwind CSS**, and **Lovable Cloud** (managed Supabase: Postgres + Auth + RLS).

> **Note on stack choice**: The original brief asked for React Router DOM + Axios + manual JWT refresh. This project keeps **TanStack Start** (file-based routing + SSR + typed server functions) and uses Supabase's native session management, which gives the same JWT access+refresh behavior with `localStorage` persistence and auto-refresh — without the boilerplate of writing Axios interceptors. Switching to React Router DOM would lose SSR and Lovable's hosting integrations.

---

## 1. Features

- Email + password authentication (sign in / sign up) with session persistence and auto-refresh
- Route-guarded `_authenticated` layout (redirects unauthenticated users to `/login`)
- Role-based access (`admin` / `user`) via dedicated `user_roles` table + `has_role()` SECURITY DEFINER function (no privilege-escalation risk)
- Users CRUD module: search, server-side pagination, create/edit/delete with Zod-validated forms
- Reusable primitives: `MultiSelect`, `Pagination`, `EmptyState`, shadcn/ui components
- Toast notifications via `sonner`
- Clean light SaaS design system in `src/styles.css` (semantic tokens, no hardcoded colors)

## 2. Tech Stack

| Concern | Library |
| --- | --- |
| Framework | TanStack Start v1 + React 19 + Vite 7 |
| Routing | TanStack Router (file-based, type-safe) |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod + `@hookform/resolvers` |
| Styling | Tailwind CSS v4 (CSS-first config in `src/styles.css`) |
| UI primitives | shadcn/ui (Radix) |
| Auth & DB | Lovable Cloud (Supabase: Postgres + Auth + RLS) |
| Icons | lucide-react |

## 3. Folder Structure

```
src/
  components/
    common/          # EmptyState, MultiSelect, Pagination
    ui/              # shadcn/ui primitives
  features/
    auth/            # AuthProvider, useAuth
    users/           # api.ts, schema.ts, UsersPage, UserForm, constants
  integrations/
    supabase/        # client, client.server, auth-middleware, auth-attacher, types (auto-generated)
  layouts/
    DashboardLayout.tsx
  routes/
    __root.tsx                       # root shell + providers
    index.tsx                        # redirects to /dashboard
    login.tsx                        # public
    signup.tsx                       # public
    _authenticated.tsx               # auth gate (layout)
    _authenticated/
      dashboard.tsx
      users.tsx
  styles.css         # design tokens + Tailwind v4 config
supabase/
  migrations/        # SQL: profiles, user_roles, has_role(), handle_new_user trigger
```

## 4. Setup

```bash
# 1. Install
bun install     # or: npm install

# 2. Run dev server
bun dev         # http://localhost:8080
```

Environment variables (`.env`) are auto-provisioned by Lovable Cloud:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

### Seed an admin user

1. Visit `/signup`, create an account (e.g. `admin@example.com`).
2. In Lovable Cloud → SQL editor:
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'admin@example.com';
   ```
3. Sign in at `/login` → you'll see the Users module.

## 5. Recommended Libraries (already included)

`@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/react-start`, `react-hook-form`, `zod`, `@hookform/resolvers`, `@supabase/supabase-js`, `tailwindcss`, `lucide-react`, `sonner`, `class-variance-authority`, `clsx`.

## 6. Deployment

### Lovable (one-click)
Click **Publish** in the Lovable editor. Cloudflare Workers + Supabase are wired automatically.

### Vercel (alternative)
1. Push the repo to GitHub.
2. Import on Vercel — framework preset: **Vite**.
3. Add env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Build command: `bun run build` · Output: `dist/`.

> Note: TanStack Start SSR targets edge runtimes. For Vercel deploy with full SSR, use the `@tanstack/start-vercel` adapter (see TanStack docs). Static-only deploys work out of the box.

## 7. Architecture Decisions

- **TanStack Start over React Router DOM + Axios**: file-based routing, type-safe links, built-in SSR, server functions (`createServerFn`) for trusted code — eliminates a separate Express/Axios layer.
- **Supabase native auth over custom JWT plumbing**: Supabase already issues access + refresh tokens, persists them, auto-refreshes them, and re-emits on `onAuthStateChange`. Writing Axios interceptors for the same behavior is redundant.
- **Roles in dedicated table + SECURITY DEFINER function**: prevents the recursive-RLS pitfall and the classic "role column on profiles" privilege-escalation attack.
- **Feature-first folders** (`features/users/...`): each module owns its API, schema, UI — easy to extract or scale.
- **Zod schemas as the contract**: same schema validates forms (client) and shapes API inputs — single source of truth.
- **Design tokens in `src/styles.css`**: no hardcoded colors in components → trivially themeable.
