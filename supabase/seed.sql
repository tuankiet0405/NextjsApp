-- Demo data for a NEW/local database. It WIPES all tables first —
-- never run it against production.
truncate public.favorites, public.reviews, public.bookings, public.guests,
         public.cabins, public.settings restart identity cascade;

insert into public.settings ("minBookingLength", "maxBookingLength", "maxGuestPerBooking", "breakfastPrice")
values (2, 30, 10, 15);

insert into public.cabins (name, "maxCapacity", "regularPrice", discount, description, image) values
  ('001', 2,  250,  0,  'Cozy hideaway for couples, wood-burning stove and forest views.', 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200'),
  ('002', 2,  350,  25, 'Romantic retreat with a private hot tub on the deck.',            'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200'),
  ('003', 4,  300,  0,  'Family-friendly cabin with two bedrooms and a full kitchen.',     'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200'),
  ('004', 4,  500,  50, 'Luxury cabin with panoramic mountain windows.',                  'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200'),
  ('005', 6,  350,  0,  'Spacious lakeside cabin for small groups.',                      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200'),
  ('006', 6,  800,  100,'Premium cabin with sauna and outdoor fire pit.',                 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1200'),
  ('007', 8,  600,  100,'Large lodge for families and friends, games room included.',     'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200'),
  ('008', 10, 1400, 0,  'The biggest and most luxurious cabin of The Wild Oasis.',        'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?w=1200');

-- Demo accounts — password for both: Demo@1234
-- Only seed the admin account on local/dev databases, not on a public demo.
insert into public.guests ("fullName", email, nationality, "countryFlag", "nationalID", password, "policyAccepted", "policyAcceptedAt", role) values
  ('Demo Guest', 'demo@wildoasis.dev',  'Vietnam', 'https://flagcdn.com/vn.svg', 'DEMO123456',
   '$2b$12$VsgijvBp1GWlRpaFm05Y5uTdLVNjloLaMVgzzMhd5tJHDqEYE0CCG', true, now(), 'guest'),
  ('Demo Admin', 'admin@wildoasis.dev', 'Vietnam', 'https://flagcdn.com/vn.svg', 'ADMIN12345',
   '$2b$12$VsgijvBp1GWlRpaFm05Y5uTdLVNjloLaMVgzzMhd5tJHDqEYE0CCG', true, now(), 'admin');

-- A past stay (reviewable) and an upcoming one for the demo guest.
insert into public.bookings ("startDate", "endDate", "numNights", "numGuests", "cabinPrice", "extrasPrice", "totalPrice", status, "hasBreakfast", "isPaid", observations, "cabinId", "guestId") values
  (date_trunc('day', now()) - interval '20 days', date_trunc('day', now()) - interval '17 days', 3, 2, 750, 90, 840, 'checked-out', true,  true,  'Late arrival', 1, 1),
  (date_trunc('day', now()) + interval '10 days', date_trunc('day', now()) + interval '14 days', 4, 3, 1200, 0, 1200, 'unconfirmed', false, false, null,          3, 1);

insert into public.reviews ("guestId", "cabinId", "bookingId", rating, comment)
values (1, 1, 1, 5, 'Quiet, clean and beautiful. Would stay again!');

insert into public.favorites ("guestId", "cabinId") values (1, 4), (1, 6);
