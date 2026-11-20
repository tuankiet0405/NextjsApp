# 1. Overview

## 1.1 Purpose

The Wild Oasis is a web application for a cabin hotel in the Italian Dolomites. Guests browse cabins, check availability, reserve a stay, manage their reservations, leave reviews and keep a list of favorite cabins. Administrators have a read-only dashboard of cabins, bookings and guests.

The project started from a course project and was extended with server-side validation, server-side pricing, role-based authorization, double-booking protection, login rate limiting, security headers, a SQL schema and unit tests.

## 1.2 Scope

### In scope

- Cabin catalogue with filter by capacity, search by name and sorting.
- Cabin detail page with availability calendar, price summary and reservation form.
- Reservations: create, list, edit (guest count and notes), delete.
- Optional breakfast add-on, priced per person per night.
- Reviews (1-5 stars, optional comment) after a finished stay.
- Favorites.
- Guest profile (nationality, national ID).
- Authentication with Google, GitHub, or email and password.
- Booking confirmation email through Resend (optional).
- Read-only admin dashboard (overview, cabins, bookings, guests).
- Public JSON endpoint `GET /api/cabins/:id`.

### Out of scope (Not implemented)

- Online payment. Reservations are created with `isPaid = false`; payment is collected on arrival (see the thank-you text on the cabin page and in the confirmation email).
- Admin editing: the admin pages only display data. No admin action creates, edits or deletes cabins, bookings, guests or settings.
- Booking status changes (`checked-in`, `checked-out`) through the application. New bookings are always `unconfirmed`.
- Notifications: the notification bell in the header is a placeholder that always shows "No notifications yet".
- Password reset, email verification, account deletion.
- Reviews editing or deletion.
- End-to-end tests.

## 1.3 Actors

| Actor | Definition | Can do |
|---|---|---|
| Visitor | Not signed in | View home, about, cabin list and cabin details (including reviews and calendar); search, filter, sort; call `GET /api/cabins/:id`; sign up and sign in. Cannot reserve, review or favorite. |
| Guest | Signed in, role `guest` | Everything a Visitor can, plus: create reservations; list, edit and delete own reservations; review own finished stays; manage favorites; edit own profile (nationality, national ID); sign out. |
| Admin | Signed in, role `admin` | Everything a Guest can, plus view `/admin` pages (overview, cabins, bookings, guests). Admin accounts are created by setting `guests.role = 'admin'` in the database; there is no UI for it. |

## 1.4 Tech stack

| Concern | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router), React 18 |
| Language | TypeScript 5 (`strict`) for `app/_lib`, server actions, API route and main components; some UI components remain JavaScript |
| Styling | Tailwind CSS 3 |
| Authentication | Auth.js v5 (`next-auth` 5 beta): Google, GitHub, Credentials |
| Password hashing | bcryptjs (cost 12) |
| Database | Supabase (PostgreSQL) accessed with `@supabase/supabase-js` and the service-role key from the server only |
| Validation | zod 3 |
| Dates | date-fns 4, react-day-picker 9 |
| Email | Resend HTTP API (optional) |
| Hosting | Vercel (deploys from `main`) |
| Tests | Jest 30, Testing Library |

## 1.5 Glossary

| Term | Meaning |
|---|---|
| Cabin | A rentable unit with a name, maximum capacity, regular price per night, optional discount (amount per night), description and images. |
| Booking / reservation | A guest's stay in one cabin between a check-in date and a check-out date. The two words are used interchangeably; "booking" is the database term. |
| Guest | A registered person (row in `guests`). Created on first sign-in or sign-up. Not to be confused with the number of people in a booking (`numGuests`). |
| Stay | The period from check-in (`startDate`) to check-out (`endDate`). |
| Night | One night of a stay. `numNights` = calendar days between check-out and check-in. The check-out day is not charged. |
| Breakfast extra | Optional add-on charged `numNights x numGuests x breakfastPrice`. |
| Settings | Single row in `settings` holding `minBookingLength`, `maxBookingLength`, `maxGuestPerBooking`, `breakfastPrice`. |
| Check-in day | First night of the stay; stored as `startDate`. |
| Back-to-back booking | A booking whose check-in is the previous booking's check-out day. Allowed. |
