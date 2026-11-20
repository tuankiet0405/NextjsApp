"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { isPast } from "date-fns";
import { requireGuest, signIn, signOut } from "./auth";
import {
  createBooking,
  createGuest,
  createReviewEntry,
  deleteBooking,
  getActiveBookingRanges,
  getBookingForGuest,
  getCabin,
  getGuestWithPassword,
  getSettings,
  toggleFavoriteEntry,
  updateBooking,
  updateGuest,
} from "./data-service";
import { calcBookingPrice, validateBooking } from "./booking";
import { sendBookingConfirmation } from "./email";
import {
  createReservationSchema,
  firstError,
  reviewSchema,
  signUpSchema,
  updateProfileSchema,
  updateReservationSchema,
} from "./validation";
import type { ActionResult } from "./types";

export async function updateProfile(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireGuest();
  const parsed = updateProfileSchema.safeParse({
    nationalID: formData.get("nationalID"),
    nationality: formData.get("nationality"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const [nationality, countryFlag] = parsed.data.nationality.split("%");
  await updateGuest(user.guestId, {
    nationalID: parsed.data.nationalID,
    nationality,
    countryFlag,
  });

  revalidatePath("/account/profile");
  return { success: true };
}

export async function createReservation(
  dates: { cabinId: number; startDate?: string; endDate?: string },
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireGuest();

  const parsed = createReservationSchema.safeParse({
    cabinId: dates.cabinId,
    startDate: dates.startDate,
    endDate: dates.endDate,
    numGuests: formData.get("numGuests"),
    observations: formData.get("observations") ?? "",
    hasBreakfast: formData.get("hasBreakfast") === "on",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const input = parsed.data;

  const [cabin, settings, bookedRanges] = await Promise.all([
    getCabin(input.cabinId),
    getSettings(),
    getActiveBookingRanges(input.cabinId),
  ]);

  const invalid = validateBooking(input, cabin, settings, bookedRanges);
  if (invalid) return { error: invalid };

  const numNights = Math.round(
    (input.endDate.getTime() - input.startDate.getTime()) / 86_400_000,
  );
  const price = calcBookingPrice({
    regularPrice: cabin.regularPrice,
    discount: cabin.discount,
    numNights,
    numGuests: input.numGuests,
    hasBreakfast: input.hasBreakfast,
    breakfastPrice: settings.breakfastPrice,
  });

  let booking;
  try {
    booking = await createBooking({
      cabinId: cabin.id,
      guestId: user.guestId,
      startDate: input.startDate.toISOString().slice(0, 10),
      endDate: input.endDate.toISOString().slice(0, 10),
      numNights,
      numGuests: input.numGuests,
      observations: input.observations,
      hasBreakfast: input.hasBreakfast,
      ...price,
      isPaid: false,
      status: "unconfirmed",
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  if (user.email) await sendBookingConfirmation({ to: user.email, booking, cabin });

  revalidatePath("/account/reservations");
  revalidatePath(`/cabins/${cabin.id}`);
  redirect("/cabins/thankyou");
}

export async function updateReservation(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireGuest();
  const parsed = updateReservationSchema.safeParse({
    bookingId: formData.get("bookingId"),
    numGuests: formData.get("numGuests"),
    observations: formData.get("observations") ?? "",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { bookingId, numGuests, observations } = parsed.data;

  const booking = await getBookingForGuest(bookingId, user.guestId);
  if (!booking) return { error: "You are not allowed to update this booking" };
  if (isPast(new Date(booking.startDate)))
    return { error: "Past reservations can no longer be edited" };

  const cabin = await getCabin(booking.cabinId);
  if (numGuests > cabin.maxCapacity)
    return { error: `Maximum ${cabin.maxCapacity} guests allowed` };

  const settings = await getSettings();
  const price = calcBookingPrice({
    regularPrice: cabin.regularPrice,
    discount: cabin.discount,
    numNights: booking.numNights,
    numGuests,
    hasBreakfast: booking.hasBreakfast,
    breakfastPrice: settings.breakfastPrice,
  });

  await updateBooking(bookingId, { numGuests, observations, ...price });

  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  redirect("/account/reservations");
}

export async function deleteReservation(bookingId: number) {
  const user = await requireGuest();
  const booking = await getBookingForGuest(Number(bookingId), user.guestId);
  if (!booking) throw new Error("You are not allowed to delete this booking");

  await deleteBooking(booking.id);
  revalidatePath("/account/reservations");
}

export async function createReview(formData: FormData): Promise<ActionResult> {
  const user = await requireGuest();
  const parsed = reviewSchema.safeParse({
    cabinId: formData.get("cabinId"),
    bookingId: formData.get("bookingId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const booking = await getBookingForGuest(parsed.data.bookingId, user.guestId);
  if (!booking || booking.cabinId !== parsed.data.cabinId)
    return { error: "You can only review your own stays" };
  if (!isPast(new Date(booking.endDate)))
    return { error: "You can review a cabin after your stay" };

  try {
    await createReviewEntry({
      guestId: user.guestId,
      cabinId: booking.cabinId,
      bookingId: booking.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath(`/cabins/${booking.cabinId}`);
  return { success: true };
}

export async function toggleFavorite(cabinId: number) {
  const user = await requireGuest();
  const id = Number(cabinId);
  if (!Number.isInteger(id) || id < 1) throw new Error("Invalid cabin");

  await toggleFavoriteEntry(user.guestId, id);
  revalidatePath("/cabins");
  revalidatePath("/account/favorites");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/account" });
}

export async function signUpWithCredentials(formData: FormData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    policyAccepted: formData.get("policyAccepted") === "on",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { fullName, email, password } = parsed.data;

  const existing = await getGuestWithPassword(email);
  if (existing?.password) return { error: "An account with this email already exists" };

  const bcrypt = (await import("bcryptjs")).default;
  const hashed = await bcrypt.hash(password, 12);
  const policy = { policyAccepted: true, policyAcceptedAt: new Date().toISOString() };

  try {
    if (existing) {
      await updateGuest(existing.id, { password: hashed, ...policy });
    } else {
      await createGuest({ fullName, email, password: hashed, ...policy });
    }
  } catch {
    return { error: "Could not create account" };
  }

  await signIn("credentials", { email, password, redirectTo: "/account" });
}

export async function signInWithCredentials(formData: FormData): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/account",
    });
  } catch (error) {
    if (!(error instanceof AuthError)) throw error;
    if ((error as AuthError & { code?: string }).code === "rate_limited")
      return { error: "Too many failed attempts. Try again in 15 minutes." };
    return { error: "Invalid email or password" };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
