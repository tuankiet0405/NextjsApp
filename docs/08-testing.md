# 8. Testing

## 8.1 How to run

| Command | What it does |
|---|---|
| `npm test` | Runs all Jest tests once |
| `npm run test:watch` | Jest in watch mode |
| `npm run typecheck` | `tsc --noEmit` (TypeScript strict) |
| `npm run lint` | `eslint .` (ESLint 9 flat config) |

Configuration: [`jest.config.js`](../jest.config.js) (`next/jest`, `jsdom` environment by default, alias `@/` mapped to the repository root) and [`jest.setup.js`](../jest.setup.js) (Testing Library DOM matchers). Files for pure logic switch to the Node environment with a `@jest-environment node` docblock.

## 8.2 What is covered

Tests import the real application code from `app/_lib` (no copies of the logic).

| Test file | Subject | Asserted behaviour |
|---|---|---|
| [`booking.test.ts`](../__tests__/booking.test.ts) | `calcBookingPrice`, `validateBooking`, `rangesOverlap` | Discount applied to cabin price; breakfast = nights x guests x breakfast price; valid booking returns null; rejects check-out before check-in and 0-night stays; rejects past check-in (with a fixed "today"); rejects stays below minimum and above maximum; rejects too many guests and zero guests; rejects overlapping dates; accepts back-to-back bookings; overlap detection for intersecting and contained ranges, empty list, and `Date` or string inputs |
| [`validation.test.ts`](../__tests__/validation.test.ts) | `nationalIdSchema`, `signUpSchema`, `reviewSchema`, `createReservationSchema` | National ID accepts 6 to 12 alphanumerics, trims whitespace, rejects too short, special characters and 13 characters; sign-up accepts valid data, lowercases email, rejects short password, `policyAccepted: false` and invalid email; review rejects rating 0, 6 and non-integers, coerces string numbers and ids; reservation rejects end before or equal to start and zero guests, coerces date strings to `Date` |
| [`rate-limit.test.ts`](../__tests__/rate-limit.test.ts) | `rateLimit`, `resetRateLimit` | Allows requests up to the limit with correct `remaining`; blocks after the limit with `retryAfterMs > 0`; window resets after `windowMs`; `retryAfterMs` counts down; keys are independent; reset clears a bucket and does not affect other keys |
| [`cabins.test.ts`](../__tests__/cabins.test.ts) | `filterCabins`, `searchCabins`, `sortCabins`, `applyCabinQuery` | Capacity groups (small <= 3, medium 4-7, large >= 8, `all` and undefined return everything); case-insensitive substring search, trimming, empty and no-match cases; all five sort orders including final price (`regularPrice - discount`), default name sort, input not mutated; combined filter, search and sort |
| [`star-rating.test.js`](../__tests__/star-rating.test.js) | `StarRating` component | Renders 5 stars by default or a custom number, calls `onSetRating` on click, aria-labels, default rating prop |

## 8.3 Not covered yet

- End-to-end tests (browser flows such as sign-in, reserving, reviewing): none.
- Integration tests against a database: none. Supabase queries in `data-service.ts`, database constraints (including the exclusion constraint and the review uniqueness) and migrations are not tested automatically.
- Server actions (`action.ts`), including ownership checks and error messages, are not tested directly.
- Auth.js callbacks, middleware redirects, `requireGuest` / `requireAdmin` and the credentials flow with rate limiting end to end: not tested. Only the rate limiter function itself is.
- `updateProfileSchema`, `updateReservationSchema`, `signInSchema` are not tested.
- The REST endpoint `GET /api/cabins/:id`, email sending, security headers and admin pages: no tests.
- Most React components other than `StarRating`: no component tests.
- [`load-test.js`](../load-test.js) is a k6 load-test script and is not part of `npm test`.
