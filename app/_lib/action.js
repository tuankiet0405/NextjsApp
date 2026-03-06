"use server";
import { auth, signIn, signOut } from "@/app/_lib/auth";
import { getBookings, updateGuest } from "./data-service";
import supabase from "./supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData) {
  const session = await auth();
  if (!session.user) throw new Error("You must be logged in!");
  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");
  if (!/^[a-zA-Z0-9]{6,12}/.test(nationalID))
    throw new Error("Invalid national id");
  const updateData = { nationalID, nationality, countryFlag };
  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);
  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
}

export async function createReservation(bookingData, formData) {
  const session = await auth();
  if (!session.user) throw new Error("You must be logged in!");

  const hasBreakfast = formData.get("hasBreakfast") === "on";
  const extrasPrice = Number(formData.get("breakfastTotal") || 0);

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    observations: formData.get("observations"),
    numGuests: Number(formData.get("numGuests")),
    hasBreakfast,
    extrasPrice,
    totalPrice: bookingData.cabinPrice + extrasPrice,
    isPaid: false,
    status: "unconfirmed",
  };
  const { data, error } = await supabase.from("bookings").insert([newBooking]);
  if (error) throw new Error("Booking could not be created");

  revalidatePath("/account/reservations");
  redirect("/cabins/thankyou");
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session.user) throw new Error("You must be logged in!");
  const reservations = await getBookings(session.user.guestId);
  const bookingIds = reservations.map((booking) => booking.id);
  if (!bookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function updateReservation(formData) {
  const session = await auth();
  if (!session.user) throw new Error("You must be logged in!");
  const bookingId = Number(formData.get("bookingId"));
  const observations = formData.get("observations");
  const numGuests = formData.get("numGuests");
  const reservations = await getBookings(session.user.guestId);
  const bookingIds = reservations.map((booking) => booking.id);
  if (!bookingIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking");
  const updateData = { numGuests, observations };
  const { data, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw new Error("Booking could not be updated");
  revalidatePath("/account/reservations");
  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/account" });
}

export async function createReview(formData) {
  const session = await auth();
  if (!session.user) throw new Error("You must be logged in!");

  const cabinId = Number(formData.get("cabinId"));
  const bookingId = Number(formData.get("bookingId"));
  const rating = Number(formData.get("rating"));
  const comment = formData.get("comment") || "";

  // Verify this booking belongs to the user
  const reservations = await getBookings(session.user.guestId);
  const bookingIds = reservations.map((b) => b.id);
  if (!bookingIds.includes(bookingId))
    throw new Error("You can only review your own bookings");

  const { createReviewEntry } = await import("./data-service");
  await createReviewEntry({
    guestId: session.user.guestId,
    cabinId,
    bookingId,
    rating,
    comment,
  });

  revalidatePath(`/cabins/${cabinId}`);
}

export async function toggleFavorite(cabinId) {
  const session = await auth();
  if (!session.user) throw new Error("You must be logged in!");

  const { toggleFavoriteEntry } = await import("./data-service");
  await toggleFavoriteEntry(session.user.guestId, Number(cabinId));

  revalidatePath("/cabins");
  revalidatePath("/account/favorites");
}

export async function signUpWithCredentials(formData) {
  const bcrypt = (await import("bcryptjs")).default;

  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const password = formData.get("password");
  const policyAccepted = formData.get("policyAccepted") === "on";

  if (!fullName || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (!policyAccepted) {
    return { error: "You must accept the privacy policy and terms" };
  }

  // Check if email already exists
  const { data: existingGuest } = await supabase
    .from("guests")
    .select("id, password")
    .eq("email", email)
    .single();

  if (existingGuest?.password) {
    return { error: "An account with this email already exists" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  if (existingGuest && !existingGuest.password) {
    // Guest exists from OAuth but has no password — add credentials
    const { error: updateError } = await supabase
      .from("guests")
      .update({
        password: hashedPassword,
        policyAccepted: true,
        policyAcceptedAt: new Date().toISOString(),
      })
      .eq("id", existingGuest.id);

    if (updateError) return { error: "Could not update account" };
  } else {
    // Create new guest
    const { error: insertError } = await supabase.from("guests").insert([
      {
        fullName,
        email,
        password: hashedPassword,
        policyAccepted: true,
        policyAcceptedAt: new Date().toISOString(),
      },
    ]);

    if (insertError) return { error: "Could not create account" };
  }

  // Auto sign-in after signup
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/account",
  });
}

export async function signInWithCredentials(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/account",
    });
  } catch (error) {
    // NextAuth throws NEXT_REDIRECT on success, only real errors reach here
    if (error?.digest?.includes("NEXT_REDIRECT")) throw error;
    return { error: "Invalid email or password" };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}



