import { z } from "zod";

const id = z.coerce.number().int().positive();

export const nationalIdSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9]{6,12}$/, "National ID must be 6-12 letters or digits");

export const updateProfileSchema = z.object({
  nationalID: nationalIdSchema,
  nationality: z
    .string()
    .min(1, "Please select your country")
    .refine((v) => v.includes("%"), "Invalid country"),
});

const isoDate = z.coerce.date();

export const createReservationSchema = z
  .object({
    cabinId: id,
    startDate: isoDate,
    endDate: isoDate,
    numGuests: z.coerce.number().int().min(1, "At least 1 guest required"),
    observations: z.string().trim().max(1000).optional().default(""),
    hasBreakfast: z.boolean(),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: "Check-out must be after check-in",
    path: ["endDate"],
  });

export const updateReservationSchema = z.object({
  bookingId: id,
  numGuests: z.coerce.number().int().min(1, "At least 1 guest required"),
  observations: z.string().trim().max(1000).optional().default(""),
});

export const reviewSchema = z.object({
  cabinId: id,
  bookingId: id,
  rating: z.coerce.number().int().min(1).max(5, "Rating must be 1-5"),
  comment: z.string().trim().max(2000).optional().default(""),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  policyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the privacy policy and terms" }),
  }),
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required").max(72),
});

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
