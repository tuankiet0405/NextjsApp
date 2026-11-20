# 7. Deployment

## 7.1 Environment variables

Defined in [`.env.example`](../.env.example). Copy it to `.env.local` for local work; set the same names in Vercel for production.

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL. Also used to build the CSP and image allow-list |
| `SUPABASE_KEY` | Yes | Supabase `service_role` key. Server only, never expose |
| `AUTH_SECRET` | Yes | Secret used by Auth.js to sign sessions. Generate with `npx auth secret` |
| `AUTH_TRUST_HOST` | Yes in the example (`true`) | Lets Auth.js trust the host header (needed behind proxies such as Vercel or when running locally) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional | Google OAuth client. Without them Google sign-in does not work; email and password still does |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | Optional | GitHub OAuth client. Same note |
| `RESEND_API_KEY` | Optional | Enables booking confirmation emails. When unset, no email is sent |
| `EMAIL_FROM` | Optional | Sender address; default `The Wild Oasis <onboarding@resend.dev>` |
| `NEXT_PUBLIC_SITE_URL` | Optional | Public site URL for `robots.txt` and the sitemap; fallback `https://the-wild-oasis.com` |

## 7.2 Prerequisites

- Node.js 20.9 or newer and npm.
- A Supabase project (free tier is enough).
- Optional: Google and GitHub OAuth apps, a Resend account.

## 7.3 Local setup

```bash
git clone https://github.com/tuankiet0405/NextjsApp.git
cd NextjsApp
npm install
cp .env.example .env.local
```

1. Fill `.env.local` (see 7.1). Generate `AUTH_SECRET` with `npx auth secret`.
2. Set up the database (7.4).
3. `npm run dev` and open http://localhost:3000.
4. For OAuth, register the callback URL `http://localhost:3000/api/auth/callback/google` (and `.../github`) in the provider console (standard Auth.js callback path).

Seeded accounts (password `Demo@1234`): `demo@wildoasis.dev` (guest) and `admin@wildoasis.dev` (admin; intended for local use only).

## 7.4 Database setup

New project:

1. In the Supabase SQL Editor run [`supabase/schema.sql`](../supabase/schema.sql). It enables `btree_gist`, creates the six tables and constraints, and enables RLS.
2. Run [`supabase/seed.sql`](../supabase/seed.sql) for demo data (settings row, cabins, two demo guests, two bookings, one review and two favorites). The seed starts with `truncate ... restart identity cascade` on all tables: it wipes all data. Run it only on a new or local database, never on production.
3. Copy the Project URL and the `service_role` key (Project Settings, API) into `.env.local`.

Existing database: do not run `schema.sql` over it and never run `seed.sql`. Apply the files in [`supabase/migrations/`](../supabase/migrations/) in order. Currently one migration adds the `guests.role` column (see [Data model](04-data-model.md#49-migrations)).

To make a user an admin, set `guests.role = 'admin'` for that email in the database; there is no UI for it.

## 7.5 Deploy on Vercel

1. Import the GitHub repository in Vercel (framework preset Next.js).
2. Add the environment variables from 7.1 to the project (Production, and Preview if used).
3. Every push to `main` triggers a production build and deployment automatically. Build command `npm run build`.
4. Register the production OAuth callback URLs (`https://<domain>/api/auth/callback/google` and `.../github`).
5. Set `NEXT_PUBLIC_SITE_URL` to the production URL.

## 7.6 Production checklist

- [ ] `SUPABASE_KEY` set only as a server environment variable (no `NEXT_PUBLIC_` prefix) and not committed.
- [ ] Strong random `AUTH_SECRET`.
- [ ] `schema.sql` (new) or all migrations (existing) applied; RLS enabled on all tables.
- [ ] Exactly one row in `settings`.
- [ ] `seed.sql` not run; demo and local admin accounts (`admin@wildoasis.dev`) not present.
- [ ] At least one real admin set via `guests.role`.
- [ ] OAuth callback URLs registered for the production domain.
- [ ] `RESEND_API_KEY` and a verified sender in `EMAIL_FROM` if emails are wanted.
- [ ] `NEXT_PUBLIC_SITE_URL` points to the production domain.
- [ ] `npm run lint`, `npm run typecheck` and `npm test` pass (see [Testing](08-testing.md)).
- [ ] Security headers present on the deployed site (see [Security](06-security.md#66-security-headers)).
- [ ] Be aware the login rate limiter is per instance (see [Security](06-security.md#65-login-rate-limiting)).
