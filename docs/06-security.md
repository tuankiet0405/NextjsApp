# 6. Security

This document describes the intended design implemented in the code. It does not describe the state of any particular deployed database.

## 6.1 Authentication

Configured in [`auth.ts`](../app/_lib/auth.ts) with Auth.js v5.

| Method | Details |
|---|---|
| Google | OAuth provider; `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| GitHub | OAuth provider; `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` |
| Email and password | Credentials provider. Input validated with `signInSchema`; hash compared with bcryptjs |

- Passwords are hashed with bcrypt, cost factor 12, at sign-up. Accepted length is 8-72 characters (72 bytes is the bcrypt input limit). Plain passwords are never stored.
- The same error `Invalid email or password` is returned for unknown email, account without a password and wrong password, so the response does not reveal which emails exist.
- For OAuth sign-ins, a `guests` row is created on first sign-in. Guests are matched by email.
- Sign-in page: `/login`. Only authentication providers that have their environment variables set can complete; email and password works without OAuth variables.
- No email verification, password reset or multi-factor authentication is implemented.

### Session contents

The session callback loads the guest by email and adds to `session.user`:

| Field | Source |
|---|---|
| `guestId` | `guests.id` |
| `role` | `guests.role` (`guest` or `admin`; defaults to `guest`) |

plus the default Auth.js `name`, `email` and `image`. The role is read from the database when the session is built, so changing `guests.role` takes effect without re-login.

## 6.2 Authorization

| Control | Where | Behaviour |
|---|---|---|
| Route protection | [`middleware.ts`](../middleware.ts) matcher `/account/:path*`, `/admin/:path*` runs the `authorized` callback | No session: redirect to `/login`. `/admin/*` with role other than `admin`: redirect to `/account` |
| Admin layout check | [`app/admin/layout.tsx`](../app/admin/layout.tsx) | Defense in depth: no session redirects to `/login`; role not `admin` redirects to `/account` |
| Action authentication | `requireGuest()` at the start of every protected server action | Throws `You must be logged in!` |
| Admin helper | `requireAdmin()` | Throws `Admins only`. Defined; no current server action uses it because admin pages are read-only |
| Ownership | `getBookingForGuest(id, guestId)` filters by both booking id and the session's `guestId` | Edit, delete and review operate only on the caller's bookings. Other users' bookings behave as "not found" |
| Identity source | Server actions use `session.user.guestId`, never an id from the request | A client cannot act as another guest |

Server actions are public HTTP endpoints, so each one performs its own checks; they do not rely on the UI hiding buttons. Known gap: `deleteReservation` checks ownership but not the date; only the UI hides Delete for past reservations.

Public data: cabins, reviews (with reviewer full name), and `GET /api/cabins/:id` are intentionally readable without authentication. `robots.txt` disallows `/account` and `/api` for crawlers; this is not an access control.

## 6.3 Input validation

- Every server action validates with zod schemas in [`validation.ts`](../app/_lib/validation.ts) before touching the database; only the first issue is returned to the user.
- Numeric ids are coerced and must be positive integers; the REST endpoint validates the id itself.
- Business-rule validation (`validateBooking`) runs on the server after loading the cabin, settings and existing bookings.
- Database constraints repeat key rules (checks, uniqueness, foreign keys, exclusion constraint) as a second line of defense. See [Data model](04-data-model.md).
- Queries use the Supabase client with parameters; no SQL strings are built from user input. The only value interpolated into a filter string is a server-generated date.
- Email HTML escapes the cabin name before inserting it into the template.

## 6.4 Server-side pricing

The client sends the cabin id and calendar dates only. The server loads the cabin and settings, derives the number of nights from the dates and computes `cabinPrice`, `extrasPrice` and `totalPrice` ([`calcBookingPrice`](../app/_lib/booking.ts)). Prices displayed in the browser are a preview only. On edit, the price is recomputed on the server too.

## 6.5 Login rate limiting

- Key: `login:{email}:{client IP}`, where the IP is the first `x-forwarded-for` value, else `x-real-ip`, else `unknown`.
- Limit: 5 attempts per 15 minutes (`LOGIN_MAX_ATTEMPTS`, `LOGIN_WINDOW_MS` in [`rate-limit.ts`](../app/_lib/rate-limit.ts)). Each credentials attempt with well-formed input counts; the sixth within the window is rejected with `Too many failed attempts. Try again in 15 minutes.`, even if the password is correct.
- A successful login deletes the counter.
- Limitation: the counters are held in a process-level `Map`. They are per server instance, are lost on restart or cold start, and are not shared across serverless instances, so the effective limit on a multi-instance deployment is higher than 5. A shared store (for example Redis) would be needed for a strict global limit. There is no rate limiting on other endpoints.

## 6.6 Security headers

Set for all paths in [`next.config.mjs`](../next.config.mjs). `X-Powered-By` is removed (`poweredByHeader: false`).

| Header | Value | Purpose |
|---|---|---|
| Content-Security-Policy | `default-src 'self'`; `script-src 'self' 'unsafe-inline'` (plus `'unsafe-eval'` in development only); `style-src 'self' 'unsafe-inline'`; `img-src` self, `data:`, `blob:`, the Supabase host, `*.supabase.co`, images.unsplash.com, flagcdn.com, upload.wikimedia.org, lh3.googleusercontent.com, avatars.githubusercontent.com; `font-src 'self' data:`; `connect-src 'self'` and the Supabase host; `frame-ancestors 'none'`; `form-action 'self' https://accounts.google.com https://github.com`; `base-uri 'self'`; `object-src 'none'` | Restricts where scripts, images, connections and form posts may go; limits XSS impact and clickjacking |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for two years |
| X-Content-Type-Options | `nosniff` | Stops MIME type sniffing |
| X-Frame-Options | `DENY` | Prevents embedding in frames (clickjacking) |
| Referrer-Policy | `strict-origin-when-cross-origin` | Sends only the origin on cross-origin requests |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | Disables these browser features |

`script-src` allows `'unsafe-inline'`, which weakens XSS protection; nonce-based CSP is not implemented.

## 6.7 Secrets handling

- Secrets live in environment variables: `.env.local` locally (not committed; [`.env.example`](../.env.example) holds placeholders) and Vercel project settings in production.
- `SUPABASE_KEY` is the service-role key. It bypasses Row Level Security and is used only in server code ([`supabase.ts`](../app/_lib/supabase.ts)); it has no `NEXT_PUBLIC_` prefix, so it is never sent to the browser. The server fails at start-up if `SUPABASE_URL` or `SUPABASE_KEY` is missing.
- Only `NEXT_PUBLIC_SITE_URL` is public (used for `robots.txt` and the sitemap).
- Queries that read guests for the session select explicit columns and do not return the password hash, except the credentials check (`getGuestWithPassword`), which stays on the server.
- Database design: RLS is enabled on every table in [`schema.sql`](../supabase/schema.sql) with no policies, so the public anon key can read or write nothing. The app never uses the anon key.

## 6.8 Threats and mitigations

| Threat | Mitigation |
|---|---|
| Price tampering | Server recomputes all prices from database values (BR-01) |
| Double booking, including concurrent requests | Server overlap check plus PostgreSQL exclusion constraint; constraint violation mapped to `These dates are already booked` |
| Accessing or changing another guest's booking (IDOR) | Ownership filter by session `guestId` on every lookup |
| Privilege escalation to admin | Role read from the database; middleware and layout both check; no endpoint changes roles |
| Brute-force or credential stuffing | bcrypt cost 12; login rate limit per email and IP; uniform error message (rate limit is per instance, see 6.5) |
| Account enumeration | Same message for all failed credential cases. Sign-up reveals existing accounts with `An account with this email already exists` |
| Injection | zod validation; parameterized Supabase queries; database constraints |
| Cross-site scripting | React escaping; CSP; email template escapes cabin name. `'unsafe-inline'` scripts reduce CSP strength |
| Clickjacking | `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'` |
| MIME sniffing, downgrade attacks | `X-Content-Type-Options`, HSTS |
| Leaking the service-role key | Server-only variable, never prefixed `NEXT_PUBLIC_`, not committed |
| Unauthorized direct database access with the public key | RLS enabled on all tables, app does not use the anon key |
| Out-of-range input (long text, bad ids) | zod max lengths, coerced integers; DB checks (comment 2000 characters) |
| CSRF | Server actions and Auth.js use framework protections (Origin checks, Auth.js CSRF token); no custom CSRF code |
