# The Wild Oasis — Cabin Booking App

[![CI](https://github.com/tuankiet0405/NextjsApp/actions/workflows/ci.yml/badge.svg)](https://github.com/tuankiet0405/NextjsApp/actions/workflows/ci.yml)
[![CodeQL](https://github.com/tuankiet0405/NextjsApp/actions/workflows/codeql.yml/badge.svg)](https://github.com/tuankiet0405/NextjsApp/actions/workflows/codeql.yml)

Full-stack cabin booking website built with **Next.js 14 (App Router)**, **TypeScript**, **Supabase (PostgreSQL)** and **Auth.js**.
Guests browse cabins, check availability, book stays, manage their reservations, leave reviews and save favorites. Admins get a dashboard of cabins, bookings and guests.

> Started from Jonas Schmedtmann's Next.js course project, then extended with the features, security hardening, TypeScript and tests listed under [What I built on top of the course](#what-i-built-on-top-of-the-course).

<!-- TODO: add after deploying -->
**Live demo:** _coming soon_ · **Demo account:** `demo@wildoasis.dev` / `Demo@1234`

<!-- TODO: screenshots in docs/screenshots/ -->

## Features

- Browse cabins with filter by capacity, search by name and sort by price/capacity
- Availability calendar with already-booked dates blocked
- Reservations with optional breakfast add-on; edit guest count/notes; delete with optimistic UI
- Sign in with Google, GitHub or email + password (bcrypt), sign up with policy consent
- Reviews (only after a finished stay, one per booking) and average rating per cabin
- Favorites list
- Booking confirmation email (Resend, optional)
- Admin dashboard (role-based): overview stats, cabins, bookings, guests
- Public JSON API: `GET /api/cabins/:id`

## What I built on top of the course

| Area | Change |
|---|---|
| **TypeScript** | `strict` mode; data layer (`app/_lib`), server actions, auth, API route and main components typed; DB row types in `app/_lib/types.ts` |
| **Input validation** | Every server action validates input with **zod** (`app/_lib/validation.ts`) and returns user-friendly errors via `useFormState` |
| **Price integrity** | The client only sends cabin id + dates; the **server recomputes** nights, cabin price and breakfast price from the database (`app/_lib/booking.ts`) |
| **Double-booking protection** | Server-side overlap check + PostgreSQL `EXCLUDE USING gist` constraint, so concurrent requests cannot book the same nights |
| **Authorization** | Role column (`guest` / `admin`); `/admin` protected in middleware **and** layout; bookings can only be read/edited/deleted/reviewed by their owner |
| **Brute-force protection** | Login rate limit: 5 failed attempts per email + IP per 15 minutes (`app/_lib/rate-limit.ts`) |
| **Security headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy; `X-Powered-By` removed |
| **Database as code** | `supabase/schema.sql` (constraints, RLS enabled) + `supabase/seed.sql` (demo data) |
| **Tests** | Jest unit tests import the real business logic (pricing, booking rules, validation, rate limit, cabin filters) |

## Documentation

Full system specification (requirements, architecture, data model, API, security, deployment, testing): [`docs/README.md`](docs/README.md).

## Tech stack

Next.js 14 · React 18 · TypeScript · Tailwind CSS · Supabase (PostgreSQL) · Auth.js v5 · zod · date-fns · react-day-picker · Jest · Testing Library

## Getting started

```bash
git clone https://github.com/tuankiet0405/NextjsApp.git
cd NextjsApp
npm install
cp .env.example .env.local   # then fill in the values
```

1. Create a free project on [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy **Project URL** and the **service_role** key (Project Settings → API) into `.env.local`.
4. Generate `AUTH_SECRET` with `npx auth secret`.
5. `npm run dev` and open http://localhost:3000

Seeded accounts (password `Demo@1234`): `demo@wildoasis.dev` (guest) and `admin@wildoasis.dev` (admin — local only).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jest unit tests |

## Project structure

```
app/
  _lib/         data layer, server actions, auth, validation, business rules, types
  _components/  UI components
  account/      guest area (profile, reservations, favorites) — login required
  admin/        admin dashboard — role "admin" required
  api/          public JSON API
  cabins/       cabin list and detail/booking pages
supabase/       schema.sql + seed.sql
__tests__/      unit tests
middleware.ts   route protection
```
