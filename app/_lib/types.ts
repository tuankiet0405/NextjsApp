
export type Role = "guest" | "admin";
export type BookingStatus = "unconfirmed" | "checked-in" | "checked-out";

export interface Cabin {
  id: number;
  created_at: string;
  name: string;
  maxCapacity: number;
  regularPrice: number;
  discount: number;
  description: string | null;
  image: string;
  images?: string[] | null;
}

export type CabinSummary = Pick<
  Cabin,
  "id" | "name" | "maxCapacity" | "regularPrice" | "discount" | "image"
>;

export interface Guest {
  id: number;
  created_at: string;
  fullName: string;
  email: string;
  nationalID: string | null;
  nationality: string | null;
  countryFlag: string | null;
  password?: string | null;
  policyAccepted?: boolean | null;
  policyAcceptedAt?: string | null;
  role: Role;
}

export interface Booking {
  id: number;
  created_at: string;
  startDate: string;
  endDate: string;
  numNights: number;
  numGuests: number;
  cabinPrice: number;
  extrasPrice: number;
  totalPrice: number;
  status: BookingStatus;
  hasBreakfast: boolean;
  isPaid: boolean;
  observations: string | null;
  cabinId: number;
  guestId: number;
}

export type BookingWithCabin = Pick<
  Booking,
  | "id"
  | "created_at"
  | "startDate"
  | "endDate"
  | "numNights"
  | "numGuests"
  | "totalPrice"
  | "status"
  | "guestId"
  | "cabinId"
> & { cabins: Pick<Cabin, "name" | "image"> };

export interface Settings {
  id: number;
  minBookingLength: number;
  maxBookingLength: number;
  maxGuestPerBooking: number;
  breakfastPrice: number;
}

export interface Review {
  id: number;
  created_at: string;
  guestId: number;
  cabinId: number;
  bookingId: number;
  rating: number;
  comment: string | null;
}

export type ReviewWithGuest = Pick<
  Review,
  "id" | "rating" | "comment" | "created_at"
> & { guests: { fullName: string } | null };

export type CabinFilter = "all" | "small" | "medium" | "large";
export type CabinSort =
  | "name"
  | "price-asc"
  | "price-desc"
  | "capacity-asc"
  | "capacity-desc";

export type ActionResult = { error?: string; success?: boolean } | undefined;
