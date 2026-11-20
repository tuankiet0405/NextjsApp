# 3. Functional requirements

Conventions: actors are defined in [Overview](01-overview.md#13-actors). "Server error" means the message is returned by a server action and shown in the form (`FormError`). When several zod issues exist, only the first is returned (`firstError` in [validation.ts](../app/_lib/validation.ts)). Messages marked "zod default" are produced by zod itself, not by custom text. Exact action signatures are in [Routes and API](05-routes-and-api.md); tables and constraints in [Data model](04-data-model.md).

Every server action that requires a signed-in guest calls `requireGuest()`, which throws `You must be logged in!` when the session has no `guestId`.

## 3.1 Browse and search

### FR-01 List cabins

- Actor: Visitor, Guest, Admin.
- Preconditions: none.
- Main flow: the user opens `/cabins`. The server loads all cabins ordered by name and renders a card for each (image, name, capacity, price, discount).
- Validation / errors: if the database query fails, the page raises "Cabins could not be loaded". If the list is empty nothing is rendered.
- Acceptance:
  - Given cabins exist, when a visitor opens `/cabins`, then all cabins are shown sorted by name.

### FR-02 Filter by capacity

- Actor: any.
- Main flow: the user selects a capacity group; the URL query `capacity` is updated. Groups: `all` (default), `small` (maxCapacity <= 3), `medium` (4 to 7), `large` (>= 8). Unknown values behave like `all`.
- Acceptance:
  - Given cabins with capacity 2, 4, 8, when `capacity=medium`, then only the capacity-4 cabin is listed.

### FR-03 Search by name

- Actor: any.
- Main flow: typing in the search box updates the URL query `search` after a 300 ms debounce. Matching is a case-insensitive substring match on the cabin name after trimming; an empty search returns all cabins.
- Errors: when nothing matches the page shows "No cabins found matching your criteria."
- Acceptance:
  - Given a cabin named "004", when the user searches " 04 ", then that cabin is listed.

### FR-04 Sort cabins

- Actor: any.
- Main flow: query `sort` accepts `name` (default, case-insensitive), `price-asc`, `price-desc` (by `regularPrice - discount`), `capacity-asc`, `capacity-desc`. Filter, search and sort combine (`applyCabinQuery`).
- Acceptance:
  - Given two cabins priced 300 (discount 0) and 350 (discount 100), when `sort=price-asc`, then the 350/100 cabin comes first (final price 250).

## 3.2 Cabin detail and availability

### FR-05 View cabin detail

- Actor: any.
- Main flow: `/cabins/[cabinId]` shows the cabin (name, description, capacity, price with discount, gallery from `images` when present), average rating and review count when at least one review exists, the reviews, the date selector and either the reservation form (signed in) or a login prompt.
- Errors: unknown cabin id renders the cabin not-found page.
- Acceptance:
  - Given cabin 3 exists, when a visitor opens `/cabins/3`, then its details and reviews are shown.
  - Given no cabin 9999, when a visitor opens `/cabins/9999`, then the not-found page is shown.

### FR-06 View availability

- Actor: any.
- Main flow: the date selector (and `/cabins/[cabinId]/availability`) disables past days and every day belonging to an active booking of that cabin. Active bookings are those with `endDate >= today (UTC)` or status `checked-in`. The disabled days include both the check-in and the check-out day of each booking. The selectable range length follows the settings (`minBookingLength`, `maxBookingLength`). The bar below the calendar shows price per night, number of nights and cabin total.
- Acceptance:
  - Given a booking from 10 to 14 June, when a visitor opens the calendar, then 10, 11, 12, 13 and 14 June cannot be selected.

### FR-07 Rating summary

- Actor: any.
- Main flow: average rating is the mean of all review ratings rounded to one decimal; it is displayed as "average/5 from N review(s)" only when N > 0.
- Acceptance:
  - Given ratings 5 and 4, then the page shows 4.5/5 from 2 reviews.

## 3.3 Reservations

### FR-08 Create reservation

- Actor: Guest, Admin.
- Preconditions: signed in; dates selected in the calendar.
- Main flow:
  1. The user selects check-in and check-out dates, number of guests (1 to the cabin's `maxCapacity`), optional notes (max 1000 characters) and optional breakfast.
  2. The client sends `cabinId`, `startDate`, `endDate` (`yyyy-MM-dd`), `numGuests`, `observations`, `hasBreakfast`. No price or night count is sent.
  3. The server validates input with zod, loads the cabin, settings and active bookings of the cabin, runs `validateBooking`, computes nights and price with `calcBookingPrice`, and inserts the booking with status `unconfirmed` and `isPaid = false`.
  4. A confirmation email is sent when `RESEND_API_KEY` is set and the session has an email.
  5. The user is redirected to `/cabins/thankyou`.
- Validation / errors (first failing rule wins):

| Order | Rule | Message |
|---|---|---|
| 1 | Schema: `endDate` after `startDate` | `Check-out must be after check-in` |
| 1 | Schema: `numGuests` integer >= 1 | `At least 1 guest required` |
| 1 | Schema: invalid or missing date, `observations` over 1000 characters, invalid cabin id | zod default messages |
| 2 | `numNights < 1` | `Check-out must be after check-in` |
| 3 | Check-in before today | `Check-in date is in the past` |
| 4 | `numNights < minBookingLength` | `Minimum stay is {min} nights` |
| 5 | `numNights > maxBookingLength` | `Maximum stay is {max} nights` |
| 6 | `numGuests < 1` | `At least 1 guest required` |
| 7 | `numGuests > maxCapacity` | `Maximum {n} guests allowed` |
| 8 | Overlap with an active booking | `These dates are already booked` |
| 9 | Database exclusion constraint (race condition) | `These dates are already booked` |
| 10 | Any other insert failure | `Booking could not be created` |

  Unknown cabin id renders the not-found page. Not signed in: `You must be logged in!`.
- Acceptance:
  - Given a signed-in guest and free dates within limits, when they submit, then a booking with status `unconfirmed` exists and they land on `/cabins/thankyou`.
  - Given another booking covers one of the nights, when they submit, then the form shows `These dates are already booked` and nothing is stored.
  - Given a tampered request with a lower price, when submitted, then the stored price is still computed from the database values (price fields are not read from the request).

### FR-09 Price preview

- Actor: Guest.
- Main flow: while selecting, the form shows `{n} night(s) - ${total}` and, with breakfast, the split `Cabin ${cabinPrice} + Breakfast ${extrasPrice}` using the same `calcBookingPrice` function. The preview is informational; the server recomputes the price (BR-01).
- Acceptance:
  - Given price 350, discount 100, 3 nights, 2 guests, breakfast 15, then the preview shows total 750 + 90 = 840.

### FR-10 List own reservations

- Actor: Guest, Admin.
- Main flow: `/account/reservations` lists bookings of the signed-in guest ordered by `startDate`, each with cabin name and image, nights, dates, total, guests, creation time and a badge `upcoming` or `past` (past = check-in date already passed). Empty state: "You have no reservations yet."
- Acceptance:
  - Given guest A has 2 bookings and guest B has 1, when A opens the page, then only A's 2 are shown.

### FR-11 Edit reservation

- Actor: Guest (owner).
- Preconditions: the booking belongs to the signed-in guest and its check-in is still in the future. The Edit button is shown only for upcoming reservations.
- Main flow: `/account/reservations/edit/[bookingId]` allows changing `numGuests` and `observations` only. Dates, cabin and breakfast cannot be changed. On submit the price is recomputed from the current cabin price, current breakfast price and the stored number of nights, then the user is redirected to `/account/reservations`.
- Validation / errors:

| Rule | Message |
|---|---|
| `numGuests` < 1 | `At least 1 guest required` |
| Booking not found or not owned | `You are not allowed to update this booking` (the edit page itself returns not-found) |
| Check-in already past | `Past reservations can no longer be edited` |
| `numGuests` > cabin capacity | `Maximum {n} guests allowed` |

- Acceptance:
  - Given an upcoming booking with breakfast for 2 guests, when the owner changes guests to 3, then `totalPrice` increases by `numNights x breakfastPrice` and the booking is saved.
  - Given a booking owned by someone else, when the user opens its edit URL, then the not-found page is shown.

### FR-12 Delete reservation

- Actor: Guest (owner).
- Main flow: the user clicks Delete, confirms the browser prompt `Are you sure to delete this reservation?`; the card disappears immediately (optimistic update) and the server deletes the row. The Delete button is shown only for upcoming reservations.
- Errors: not found or not owned: `You are not allowed to delete this booking` (thrown). The server action itself does not check the date; the restriction to upcoming reservations is applied in the UI only.
- Acceptance:
  - Given an owned upcoming booking, when the owner confirms deletion, then the booking no longer exists and its dates become available again.
  - Given a booking of another guest, when the action is called with its id, then it throws and the booking remains.

### FR-13 Confirmation email

- Actor: system.
- Main flow: after a successful insert the server posts to the Resend API an HTML email "Booking confirmed" (cabin name, check-in, check-out, nights, breakfast, total, note "Payment will be collected upon arrival.") with subject `Booking confirmed - Cabin {name}`. The sender is `EMAIL_FROM`, default `The Wild Oasis <onboarding@resend.dev>`.
- Errors: without `RESEND_API_KEY` nothing is sent. A Resend or network failure is logged and does not fail the reservation.
- Acceptance:
  - Given `RESEND_API_KEY` is unset, when a reservation is created, then it succeeds and no email request is made.

## 3.4 Reviews

### FR-14 Submit review

- Actor: Guest (owner of a finished stay).
- Preconditions: the guest has a booking of this cabin whose check-out date has passed and which has no review yet. The review form is shown on the cabin page only when such a booking exists.
- Main flow: rating (1-5 stars required by the UI) and optional comment (max 2000 characters). The server checks ownership and that the stay is over, then inserts the review linked to the booking.
- Validation / errors:

| Rule | Message |
|---|---|
| Rating not integer 1-5 | `Rating must be 1-5` (the lower bound uses the zod default message) |
| Comment longer than 2000 | zod default message |
| Booking missing, not owned, or for another cabin | `You can only review your own stays` |
| Check-out not yet passed | `You can review a cabin after your stay` |
| Review already exists for the booking | `You already reviewed this stay` |
| Other insert failure | `Review could not be created` |

- Acceptance:
  - Given a finished, unreviewed stay, when the owner submits 5 stars, then the review is stored and shown in the cabin's reviews.
  - Given the booking already has a review, when submitted again, then `You already reviewed this stay` is shown.

### FR-15 List reviews

- Actor: any.
- Main flow: reviews of a cabin are shown newest first with reviewer full name, rating and comment.

## 3.5 Favorites

### FR-16 Toggle favorite

- Actor: Guest, Admin.
- Main flow: a heart button on cabin cards and on the cabin page adds the cabin to favorites, or removes it if already present. The button is hidden for visitors. The icon switches immediately and reverts if the action fails.
- Errors: invalid cabin id: `Invalid cabin`; database failures: `Could not add favorite` / `Could not remove favorite`.
- Acceptance:
  - Given a cabin not in favorites, when the guest clicks the heart, then it appears in `/account/favorites`; clicking again removes it.

### FR-17 List favorites

- Actor: Guest, Admin.
- Main flow: `/account/favorites` shows favorite cabins, most recently added first. Empty state: "You haven't added any cabins to your favorites yet."

## 3.6 Account and profile

### FR-18 Account home

- Actor: Guest, Admin.
- Main flow: `/account` greets the user ("Welcome, {name}"). The side navigation links to reservations, favorites and profile.

### FR-19 Update profile

- Actor: Guest, Admin.
- Main flow: `/account/profile` shows full name and email (read-only), a country select and a national ID field. Saving stores `nationalID`, `nationality` and `countryFlag`. The country select posts `"{name}%{flagUrl}"`.
- Validation / errors:

| Rule | Message |
|---|---|
| National ID (trimmed) not 6 to 12 letters or digits | `National ID must be 6-12 letters or digits` |
| Country empty | `Please select your country` |
| Country value without `%` | `Invalid country` |
| Update fails | `Guest could not be updated` is raised by the data layer |

- Success: a "Profile updated." status message.
- Acceptance:
  - Given national ID `AB12`, when saved, then `National ID must be 6-12 letters or digits` is shown and nothing changes.

## 3.7 Authentication

### FR-20 Sign up with email and password

- Actor: Visitor.
- Main flow: `/signup` collects full name, email, password, password confirmation and acceptance of the privacy policy and terms. The server validates, hashes the password with bcrypt (cost 12), stores the policy acceptance time, then signs the user in and redirects to `/account`. If a guest with that email already exists without a password (created through Google or GitHub), the password and policy fields are added to that guest.
- Validation / errors:

| Rule | Message |
|---|---|
| Full name 2-100 characters (trimmed) | `Full name is required` (min), zod default (max) |
| Email invalid (lowercased and trimmed) | `Invalid email` |
| Password under 8 characters | `Password must be at least 8 characters` |
| Password over 72 characters | `Password is too long` |
| Policy not accepted | `You must accept the privacy policy and terms` |
| Email already has a password | `An account with this email already exists` |
| Database failure | `Could not create account` |
| Confirmation differs (client-side check) | `Passwords do not match` |

- Acceptance:
  - Given an unused email and a valid password, when the form is submitted with consent, then a guest with a bcrypt hash and `policyAccepted = true` exists and the user is signed in.

### FR-21 Sign in with email and password

- Actor: Visitor.
- Main flow: `/login` form posts to the Auth.js Credentials provider; on success the user is redirected to `/account`.
- Errors: `Invalid email or password` for malformed input, unknown email, an account without password, or a wrong password (the same message in all cases). After 5 attempts for the same email and IP within 15 minutes: `Too many failed attempts. Try again in 15 minutes.` See BR-17.
- Acceptance:
  - Given 5 wrong passwords for one email and IP, when a sixth attempt is made (even with the right password) within 15 minutes, then the rate-limit message is returned.

### FR-22 Sign in with Google or GitHub

- Actor: Visitor.
- Main flow: the buttons on `/login` start the OAuth flow with redirect target `/account`. On first sign-in a guest row is created with email and full name (name, or email when the provider gives no name); otherwise the existing guest with that email is used. If creating the guest fails, sign-in is refused.
- Acceptance:
  - Given a new Google account, when the user signs in, then a guest row with role `guest` exists and `/account` opens.

### FR-23 Sign out

- Actor: Guest, Admin.
- Main flow: the sign-out button ends the session and redirects to `/`.

### FR-24 Protected pages

- Actor: Visitor.
- Main flow: requests to `/account/*` or `/admin/*` without a session are redirected by the middleware to `/login`. See BR-13 and BR-14.
- Acceptance:
  - Given no session, when `/account/reservations` is requested, then the response redirects to `/login`.

## 3.8 Admin

### FR-25 Admin overview

- Actor: Admin.
- Main flow: `/admin` shows four counters (total cabins, total guests, number of recent bookings, "recent revenue") and a table of the 10 most recent bookings by creation time. "Recent revenue" is the sum of `totalPrice` of those 10 bookings only; it is not an all-time total.

### FR-26 Admin cabins

- Actor: Admin.
- Main flow: `/admin/cabins` lists cabins (image, name, capacity, price, discount). Read-only.

### FR-27 Admin bookings

- Actor: Admin.
- Main flow: `/admin/bookings` lists the 50 most recent bookings (id, guest name and email, cabin, dates, nights, guests, breakfast, total, status). Read-only.

### FR-28 Admin guests

- Actor: Admin.
- Main flow: `/admin/guests` lists the 50 most recently created guests (id, name, email, country, national ID, joined date). Read-only.

- Acceptance for FR-25 to FR-28:
  - Given a signed-in guest with role `guest`, when `/admin` is requested, then the user is redirected to `/account`.
  - Given a signed-in admin, when `/admin/bookings` is requested, then the page is shown.

## 3.9 Public API

### FR-29 Cabin JSON endpoint

- Actor: anyone, no authentication.
- Main flow: `GET /api/cabins/:id` returns the cabin (`id, name, maxCapacity, regularPrice, discount, description, image`) and `bookedDates`, an array of ISO timestamps, one per day of each active booking (check-in through check-out day inclusive).
- Errors: 400 `Invalid cabin id`, 404 `Cabin not found`, 500 `Internal error`. See [Routes and API](05-routes-and-api.md#53-rest-endpoint).
- Acceptance:
  - Given cabin 1 exists, when `GET /api/cabins/1` is called, then status 200 with `cabin` and `bookedDates`.

## 3.10 Business rules

| ID | Rule | Where enforced |
|---|---|---|
| BR-01 | Prices are computed only on the server from database values. The client sends cabin id and calendar dates only. Number of nights is derived from the dates. | [action.ts](../app/_lib/action.ts), [booking.ts](../app/_lib/booking.ts) |
| BR-02 | `cabinPrice = numNights x (regularPrice - discount)` | `calcBookingPrice` |
| BR-03 | `extrasPrice = numNights x numGuests x breakfastPrice` when breakfast is chosen, otherwise 0 | `calcBookingPrice` |
| BR-04 | `totalPrice = cabinPrice + extrasPrice` | `calcBookingPrice` |
| BR-05 | Minimum stay = `settings.minBookingLength` nights (default 2); maximum = `settings.maxBookingLength` nights (default 30) | `validateBooking`; DB check `maxBookingLength >= minBookingLength >= 1` |
| BR-06 | Number of guests must be between 1 and the cabin's `maxCapacity` | `validateBooking`; edit action |
| BR-07 | A booking must have at least 1 night; check-out must be after check-in (DB: `endDate > startDate`, `numNights > 0`) | schema, `validateBooking`, DB |
| BR-08 | Check-in cannot be before today (calendar day comparison) | `validateBooking` |
| BR-09 | Two bookings of the same cabin cannot share a night. A stay occupies `[checkIn, checkOut)`, so a booking may start on the day another one ends (back-to-back allowed). | `rangesOverlap` and DB constraint `no_overlapping_bookings` |
| BR-10 | Booking dates are calendar days; they carry no time zone | `startDate`/`endDate` are `timestamp` at 00:00 |
| BR-11 | New bookings are `unconfirmed` and `isPaid = false`. The application never changes status or payment | `createReservation` |
| BR-12 | Only the owner can read (account lists), edit, delete or review a booking. Lookups filter by `id` and `guestId` | `getBookingForGuest` |
| BR-13 | `/account/*` and `/admin/*` require a session | middleware |
| BR-14 | `/admin/*` requires role `admin`; others are redirected to `/account` | middleware `authorized` and admin layout |
| BR-15 | A reservation can be edited only before its check-in date has passed; only guest count and notes change and the price is recomputed | `updateReservation` |
| BR-16 | A review is allowed only after the check-out date has passed, only for the owner's booking, and once per booking (unique `bookingId`). Rating 1-5; comment up to 2000 characters | `createReview`, DB constraints |
| BR-17 | Login attempts are limited to 5 per email + IP per 15 minutes; a successful login clears the counter | `authorize` in [auth.ts](../app/_lib/auth.ts) |
| BR-18 | A cabin can be a favorite of a guest only once (unique `guestId, cabinId`); toggling adds or removes | `toggleFavoriteEntry`, DB |
| BR-19 | Passwords are 8-72 characters and stored only as bcrypt hashes (cost 12) | `signUpSchema`, `signUpWithCredentials` |
| BR-20 | National ID is 6-12 letters or digits | `nationalIdSchema` |
| BR-21 | Sign-up requires accepting the privacy policy and terms; acceptance time is stored | `signUpSchema`, `guests.policyAcceptedAt` |
| BR-22 | `settings.maxGuestPerBooking` exists in the schema but is not read by any application code; the guest limit is the cabin's `maxCapacity` | Not enforced |
