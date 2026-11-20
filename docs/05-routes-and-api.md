# 5. Routes and API

## 5.1 Pages

Access levels: Public = anyone; Guest = signed-in session (middleware); Admin = session with role `admin` (middleware and layout). Rendering: RSC = React Server Component rendered on the server; Client parts are noted.

| Path | Access | Rendering | Purpose |
|---|---|---|---|
| `/` | Public | RSC, static content | Landing page with link to cabins |
| `/about` | Public | RSC, static content | About the hotel |
| `/cabins` | Public | RSC, `revalidate = 3600`; client filter, search and sort controls driven by query `capacity`, `search`, `sort` | Cabin list (FR-01 to FR-04) |
| `/cabins/[cabinId]` | Public | RSC with `generateStaticParams`, session read per request; client date selector and forms | Cabin detail, calendar, reservation form, reviews (FR-05 to FR-09, FR-14, FR-15) |
| `/cabins/[cabinId]/availability` | Public | RSC; client calendar | Availability calendar only |
| `/cabins/thankyou` | Public (reached after booking) | Static | Confirmation message with link to reservations |
| `/login` | Public | RSC; client sign-in form and OAuth buttons | Sign in (FR-21, FR-22) |
| `/signup` | Public | RSC; client sign-up form | Create account (FR-20) |
| `/account` | Guest | RSC | Welcome message |
| `/account/reservations` | Guest | RSC; client list with optimistic delete | Own reservations (FR-10, FR-12) |
| `/account/reservations/edit/[bookingId]` | Guest (owner; otherwise not-found) | RSC; client form | Edit reservation (FR-11) |
| `/account/favorites` | Guest | RSC | Favorite cabins (FR-17) |
| `/account/profile` | Guest | RSC; client form | Update profile (FR-19) |
| `/admin` | Admin | RSC | Overview (FR-25) |
| `/admin/cabins` | Admin | RSC | Cabins table (FR-26) |
| `/admin/bookings` | Admin | RSC | Latest 50 bookings (FR-27) |
| `/admin/guests` | Admin | RSC | Latest 50 guests (FR-28) |
| `/api/cabins/[cabinId]` | Public | Route handler | JSON, see 5.3 |
| `/api/auth/*` | Public | Auth.js route handlers (`GET`, `POST`) | Sign-in, callbacks, session, sign-out |
| `/robots.txt`, `/sitemap.xml` | Public | Generated | Crawler rules; sitemap with home, about, cabins and each cabin |

Other files: `error.js` (error boundary), `loading.js`, `not-found.js` and `cabins/[cabinId]/not-found.js`.

Unauthenticated access to `/account/*` or `/admin/*` redirects to `/login` (Auth.js `pages.signIn`). A signed-in non-admin requesting `/admin/*` is redirected to `/account`.

## 5.2 Server actions

All are exported from [`../app/_lib/action.ts`](../app/_lib/action.ts) (`"use server"`). Actions that need a signed-in guest call `requireGuest()` first and throw `You must be logged in!` otherwise. Form actions return `{ error?: string; success?: boolean }` (`ActionResult`) and are used with `useFormState`.

| Action | Input | Validation | Output | Errors |
|---|---|---|---|---|
| `createReservation(dates, prev, formData)` | `dates`: `cabinId`, `startDate`, `endDate` (bound on the client); form: `numGuests`, `observations`, `hasBreakfast` (`on`) | `createReservationSchema`, then `validateBooking` against cabin, settings and active bookings | Redirect to `/cabins/thankyou`; revalidates `/account/reservations` and `/cabins/{id}` | Messages in FR-08 |
| `updateReservation(prev, formData)` | `bookingId`, `numGuests`, `observations` | `updateReservationSchema`; ownership; check-in not past; capacity | Redirect to `/account/reservations`; recomputed prices stored | `You are not allowed to update this booking`, `Past reservations can no longer be edited`, `Maximum {n} guests allowed` |
| `deleteReservation(bookingId)` | booking id | Ownership via `getBookingForGuest` | Row deleted; revalidates `/account/reservations` | Throws `You are not allowed to delete this booking` |
| `createReview(formData)` | `cabinId`, `bookingId`, `rating`, `comment` | `reviewSchema`; ownership; booking matches cabin; check-out past | `{ success: true }`; revalidates `/cabins/{id}` | `You can only review your own stays`, `You can review a cabin after your stay`, `You already reviewed this stay` |
| `toggleFavorite(cabinId)` | cabin id | Integer >= 1 | Adds or removes; revalidates `/cabins` and `/account/favorites` | Throws `Invalid cabin`, `Could not add favorite`, `Could not remove favorite` |
| `updateProfile(prev, formData)` | `nationalID`, `nationality` (`name%flagUrl`) | `updateProfileSchema` | `{ success: true }`; revalidates `/account/profile` | `National ID must be 6-12 letters or digits`, `Please select your country`, `Invalid country` |
| `signUpWithCredentials(formData)` | `fullName`, `email`, `password`, `policyAccepted` (`on`) | `signUpSchema`; email not already registered with a password | Creates or upgrades guest, signs in, redirect to `/account` | `An account with this email already exists`, `Could not create account`, schema messages |
| `signInWithCredentials(formData)` | `email`, `password` | `signInSchema` inside the Credentials provider; rate limit | Signs in, redirect to `/account` | `Invalid email or password`, `Too many failed attempts. Try again in 15 minutes.` |
| `signInAction()` | none | none | Starts Google OAuth, redirect to `/account` | Provider errors |
| `signInWithGitHub()` | none | none | Starts GitHub OAuth, redirect to `/account` | Provider errors |
| `signOutAction()` | none | none | Ends session, redirect to `/` | none |

Schema rules ([`validation.ts`](../app/_lib/validation.ts)):

| Schema | Fields and rules |
|---|---|
| `createReservationSchema` | `cabinId` positive integer; `startDate`, `endDate` coerced to dates; `endDate > startDate` else `Check-out must be after check-in`; `numGuests` integer >= 1 else `At least 1 guest required`; `observations` trimmed, max 1000, default empty; `hasBreakfast` boolean |
| `updateReservationSchema` | `bookingId` positive integer; `numGuests` integer >= 1; `observations` trimmed, max 1000 |
| `reviewSchema` | `cabinId`, `bookingId` positive integers; `rating` integer 1-5; `comment` trimmed, max 2000, default empty |
| `updateProfileSchema` | `nationalID` matches `^[a-zA-Z0-9]{6,12}$` after trim; `nationality` non-empty and contains `%` |
| `signUpSchema` | `fullName` trimmed 2-100; `email` trimmed, lowercased, valid; `password` 8-72; `policyAccepted` literal `true` |
| `signInSchema` | `email` trimmed, lowercased, valid; `password` 1-72 |

## 5.3 REST endpoint

### `GET /api/cabins/:id`

Implementation: [`../app/api/cabins/[cabinId]/route.ts`](../app/api/cabins/%5BcabinId%5D/route.ts). No authentication; read-only.

| Parameter | Where | Rule |
|---|---|---|
| `id` | path | Integer >= 1 |

Success, 200:

```json
{
  "cabin": {
    "id": 3,
    "name": "003",
    "maxCapacity": 4,
    "regularPrice": 300,
    "discount": 0,
    "description": "Family-friendly cabin with two bedrooms and a full kitchen.",
    "image": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200"
  },
  "bookedDates": [
    "2026-12-10T00:00:00.000Z",
    "2026-12-11T00:00:00.000Z",
    "2026-12-12T00:00:00.000Z"
  ]
}
```

`bookedDates` contains one entry per day from check-in to check-out inclusive for each active booking (`endDate >= today (UTC)` or status `checked-in`). The exact timestamp format depends on the server time zone (days are generated with `date-fns` `eachDayOfInterval`).

Errors (body is `{ "message": string }`):

| Status | When | Body |
|---|---|---|
| 400 | `id` is not an integer >= 1 | `{ "message": "Invalid cabin id" }` |
| 404 | No cabin with this id | `{ "message": "Cabin not found" }` |
| 500 | Database error while loading the cabin | `{ "message": "Internal error" }` |

Example:

```bash
curl https://<host>/api/cabins/3
```

Failures while loading booked dates are not caught in the handler and surface as an unhandled server error.
