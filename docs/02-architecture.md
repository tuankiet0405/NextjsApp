# 2. Architecture

## 2.1 Layers

| Layer | Responsibility | Location |
|---|---|---|
| Pages (React Server Components) | Fetch data on the server and render HTML; compose client components. `app/**/page.js|tsx` and `layout` files. | [`../app`](../app) |
| Client components | Interactivity: date picker, forms with `useFormState`, favorite toggle, filters, optimistic delete. Marked `"use client"`. Shared range state lives in a React context. | [`../app/_components`](../app/_components) |
| Server actions | Mutations called from forms and client components. Each one authenticates, validates with zod, authorizes, then calls the data layer. | [`../app/_lib/action.ts`](../app/_lib/action.ts) |
| Business rules | Pure functions with no I/O: pricing, booking validation, cabin filtering, rate limiter. Unit tested. | [`booking.ts`](../app/_lib/booking.ts), [`cabins.ts`](../app/_lib/cabins.ts), [`rate-limit.ts`](../app/_lib/rate-limit.ts), [`validation.ts`](../app/_lib/validation.ts) |
| Data layer | All Supabase queries; maps database errors to user-facing messages. | [`data-service.ts`](../app/_lib/data-service.ts), [`supabase.ts`](../app/_lib/supabase.ts) |
| Auth | Auth.js configuration, session callbacks, `requireGuest` / `requireAdmin` helpers. | [`auth.ts`](../app/_lib/auth.ts) |
| Middleware | Runs Auth.js `authorized` callback for `/account/*` and `/admin/*`. | [`../middleware.ts`](../middleware.ts) |
| Email | Booking confirmation through the Resend HTTP API. | [`email.ts`](../app/_lib/email.ts) |
| REST API | `GET /api/cabins/:id`; `/api/auth/*` handlers of Auth.js. | [`../app/api`](../app/api) |
| Database | PostgreSQL on Supabase. Schema, constraints and demo data in SQL files. | [`../supabase`](../supabase) |
| Hosting | Vercel builds and serves the Next.js app. | - |

The browser never talks to Supabase. All database access uses the service-role key from server code ([`supabase.ts`](../app/_lib/supabase.ts)).

## 2.2 Component / context diagram

```mermaid
flowchart LR
  subgraph Browser
    RSC_HTML[Rendered pages]
    CC[Client components]
  end

  subgraph Vercel[Vercel - Next.js 14 app]
    MW[Middleware - Auth.js authorized]
    PAGES[Pages - Server Components]
    ACT[Server actions]
    API[Route handler GET api cabins id]
    AUTHJS[Auth.js handlers api auth]
    LIB[app/_lib - rules, validation, data-service]
  end

  DB[(Supabase PostgreSQL)]
  OAUTH[Google and GitHub OAuth]
  RESEND[Resend email API]

  Browser -->|HTTP| MW
  MW --> PAGES
  CC -->|form post / server action call| ACT
  CC -->|sign in| AUTHJS
  Browser -->|JSON| API
  PAGES --> LIB
  ACT --> LIB
  API --> LIB
  AUTHJS --> LIB
  LIB -->|service-role key, server only| DB
  AUTHJS <-->|OAuth redirect| OAUTH
  ACT -->|booking confirmation| RESEND
```

## 2.3 Sequence: create reservation

The client sends only the cabin id and the two calendar dates (`yyyy-MM-dd`) bound to the action, plus the form fields `numGuests`, `observations` and `hasBreakfast`. Prices, nights and the guest identity are never taken from the client. The price shown in the form is a preview computed with the same function ([`calcBookingPrice`](../app/_lib/booking.ts)).

```mermaid
sequenceDiagram
  actor U as Guest
  participant C as ReservationForm - client
  participant A as createReservation - server action
  participant Z as zod schema
  participant D as data-service
  participant R as booking.ts
  participant DB as PostgreSQL
  participant E as Resend

  U->>C: select dates, guests, breakfast, submit
  C->>A: cabinId, startDate, endDate and form data
  A->>A: requireGuest reads session
  A->>Z: createReservationSchema.safeParse
  Z-->>A: first error message, or parsed input
  A->>D: getCabin, getSettings, getActiveBookingRanges in parallel
  D->>DB: select cabin, settings, bookings
  DB-->>D: rows
  A->>R: validateBooking
  R-->>A: error message or null
  A->>R: calcBookingPrice with DB prices
  A->>D: createBooking status unconfirmed, isPaid false
  D->>DB: insert booking
  alt exclusion constraint violated 23P01
    DB-->>D: error
    D-->>A: These dates are already booked
    A-->>C: error shown in form
  else inserted
    DB-->>D: booking row
    A->>E: sendBookingConfirmation - skipped without RESEND_API_KEY
    A->>A: revalidatePath
    A-->>C: redirect to cabins thankyou
  end
```

## 2.4 Sequence: credentials login with rate limiting

```mermaid
sequenceDiagram
  actor U as User
  participant F as SignInForm - client
  participant A as signInWithCredentials - server action
  participant N as Auth.js Credentials authorize
  participant L as rate-limit.ts in-memory
  participant D as data-service
  participant B as bcryptjs

  U->>F: email and password
  F->>A: formData
  A->>N: signIn credentials
  N->>N: signInSchema.safeParse
  alt invalid input
    N-->>A: null, CredentialsSignin
    A-->>F: Invalid email or password
  else valid
    N->>L: rateLimit key login:email:ip, 5 per 15 min
    alt limit exceeded
      L-->>N: allowed false
      N-->>A: TooManyAttempts, code rate_limited
      A-->>F: Too many failed attempts. Try again in 15 minutes.
    else allowed
      N->>D: getGuestWithPassword email
      D-->>N: guest or null
      N->>B: compare password with hash
      alt unknown email, no password hash, or wrong password
        N-->>A: null
        A-->>F: Invalid email or password
      else match
        N->>L: resetRateLimit key
        N-->>A: user id, email, name
        A-->>U: session cookie, redirect to account
      end
    end
  end
```

On each request that reads the session, the `session` callback loads the guest by email and copies `guestId` and `role` into the session.

## 2.5 Rendering notes

- `/cabins` sets `revalidate = 3600`; its filter, search and sort come from URL query parameters (`capacity`, `search`, `sort`).
- `/cabins/[cabinId]` exports `generateStaticParams` (all cabin ids) and also reads the session, so user-specific parts (favorite state, review form, reservation form) are resolved per request.
- All `/account` and `/admin` pages read the session and are therefore dynamic.

## 2.6 Folder structure

| Path | Content |
|---|---|
| `app/page.js`, `layout.js`, `error.js`, `loading.js`, `not-found.js` | Home page, root layout (header, footer, `ReservationProvider`), error and loading states |
| `app/about/` | Static about page |
| `app/cabins/` | Cabin list, cabin detail (`[cabinId]`), availability page, thank-you page |
| `app/login/`, `app/signup/` | Sign-in and sign-up pages |
| `app/account/` | Guest area: welcome, reservations (list and edit), favorites, profile. Layout adds the side navigation |
| `app/admin/` | Admin area: overview, cabins, bookings, guests. Layout checks the role |
| `app/api/` | `auth/[...nextauth]` (Auth.js) and `cabins/[cabinId]` (public JSON) |
| `app/_components/` | UI components (server and client) |
| `app/_lib/` | `action.ts`, `auth.ts`, `booking.ts`, `cabins.ts`, `data-service.ts`, `email.ts`, `rate-limit.ts`, `supabase.ts`, `types.ts`, `validation.ts`, `countries.json` |
| `app/_styles/` | Global CSS (Tailwind) |
| `app/robots.js`, `app/sitemap.js` | `robots.txt` (disallows `/account` and `/api`) and sitemap (home, about, cabins, each cabin) |
| `middleware.ts` | Route protection, matcher `/account/:path*`, `/admin/:path*` |
| `next.config.mjs` | Security headers, remote image hosts, `poweredByHeader: false` |
| `supabase/` | `schema.sql`, `seed.sql`, `migrations/` |
| `__tests__/` | Jest unit tests |
| `load-test.js` | k6 load test script |
| `docs/` | This documentation |
