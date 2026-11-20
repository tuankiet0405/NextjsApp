import { notFound } from "next/navigation";
import { eachDayOfInterval } from "date-fns";
import supabase from "./supabase";
import countries from "./countries.json";
import type {
  Booking,
  BookingWithCabin,
  Cabin,
  CabinSummary,
  Guest,
  ReviewWithGuest,
  Settings,
} from "./types";

export async function getCabin(id: number | string): Promise<Cabin> {
  const { data, error } = await supabase
    .from("cabins")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  return data as Cabin;
}

export async function getCabins(): Promise<CabinSummary[]> {
  const { data, error } = await supabase
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }
  return data as CabinSummary[];
}

export async function getGuest(email: string | null | undefined) {
  if (!email) return null;
  const { data } = await supabase
    .from("guests")
    .select("id, created_at, fullName, email, nationalID, nationality, countryFlag, role")
    .eq("email", email)
    .maybeSingle();
  return (data as Guest | null) ?? null;
}

export async function getGuestWithPassword(email: string) {
  const { data } = await supabase
    .from("guests")
    .select("id, email, fullName, password, role")
    .eq("email", email)
    .maybeSingle();
  return data as Pick<Guest, "id" | "email" | "fullName" | "password" | "role"> | null;
}

export async function createGuest(newGuest: Partial<Guest>) {
  const { error } = await supabase.from("guests").insert([newGuest]);
  if (error) {
    console.error(error);
    throw new Error("Guest could not be created");
  }
}

export async function updateGuest(id: number, fields: Partial<Guest>) {
  const { data, error } = await supabase
    .from("guests")
    .update(fields)
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }
  return data;
}

export async function getBookingForGuest(
  id: number,
  guestId: number,
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("guestId", guestId)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be loaded");
  }
  return (data as Booking | null) ?? null;
}

export async function getBookings(guestId: number): Promise<BookingWithCabin[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, totalPrice, status, guestId, cabinId, cabins(name, image)",
    )
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    console.error(error);
    throw new Error("Bookings could not be loaded");
  }
  return data as unknown as BookingWithCabin[];
}

export async function getActiveBookingRanges(cabinId: number) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("bookings")
    .select("id, startDate, endDate")
    .eq("cabinId", cabinId)
    .or(`endDate.gte.${today.toISOString()},status.eq.checked-in`);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not be loaded");
  }
  return data as Pick<Booking, "id" | "startDate" | "endDate">[];
}

export async function getBookedDatesByCabinId(cabinId: number | string) {
  const ranges = await getActiveBookingRanges(Number(cabinId));
  return ranges.flatMap((b) =>
    eachDayOfInterval({ start: new Date(b.startDate), end: new Date(b.endDate) }),
  );
}

export async function createBooking(newBooking: Omit<Booking, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    .select()
    .single();

  if (error) {
    console.error(error);
    if (error.code === "23P01") throw new Error("These dates are already booked");
    throw new Error("Booking could not be created");
  }
  return data as Booking;
}

export async function updateBooking(id: number, fields: Partial<Booking>) {
  const { error } = await supabase.from("bookings").update(fields).eq("id", id);
  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
}

export async function deleteBooking(id: number) {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
}

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("settings").select("*").single();
  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }
  return data as Settings;
}

export async function getCountries(): Promise<{ name: string; flag: string }[]> {
  return countries;
}

export async function getReviewsByCabinId(cabinId: number | string): Promise<ReviewWithGuest[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, guests(fullName)")
    .eq("cabinId", cabinId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data as unknown as ReviewWithGuest[];
}

export async function getAverageRating(cabinId: number | string) {
  const reviews = await getReviewsByCabinId(cabinId);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

export async function createReviewEntry(review: {
  guestId: number;
  cabinId: number;
  bookingId: number;
  rating: number;
  comment: string;
}) {
  const { error } = await supabase.from("reviews").insert([review]);
  if (error) {
    console.error(error);
    if (error.code === "23505") throw new Error("You already reviewed this stay");
    throw new Error("Review could not be created");
  }
}

export async function getFavorites(guestId: number): Promise<CabinSummary[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("cabinId, cabins(id, name, maxCapacity, regularPrice, discount, image)")
    .eq("guestId", guestId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return (data as unknown as { cabins: CabinSummary }[]).map((f) => f.cabins);
}

export async function isFavorite(guestId: number, cabinId: number) {
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("guestId", guestId)
    .eq("cabinId", cabinId)
    .maybeSingle();
  return !!data;
}

export async function toggleFavoriteEntry(guestId: number, cabinId: number) {
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("guestId", guestId)
    .eq("cabinId", cabinId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) throw new Error("Could not remove favorite");
    return { action: "removed" as const };
  }
  const { error } = await supabase.from("favorites").insert([{ guestId, cabinId }]);
  if (error) throw new Error("Could not add favorite");
  return { action: "added" as const };
}

export async function getReviewableBooking(guestId: number, cabinId: number) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, endDate, reviews(id)")
    .eq("guestId", guestId)
    .eq("cabinId", cabinId)
    .lt("endDate", new Date().toISOString())
    .order("endDate", { ascending: false });

  if (error) {
    console.error(error);
    return null;
  }
  const rows = data as unknown as { id: number; reviews: { id: number }[] | { id: number } | null }[];
  const open = rows.find((b) =>
    Array.isArray(b.reviews) ? b.reviews.length === 0 : !b.reviews,
  );
  return open ? { id: open.id } : null;
}
