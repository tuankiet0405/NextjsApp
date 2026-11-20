/** @jest-environment node */

import {
  nationalIdSchema,
  signUpSchema,
  reviewSchema,
  createReservationSchema,
} from "@/app/_lib/validation";

describe("nationalIdSchema", () => {
  it("accepts 6 alphanumeric characters", () => {
    expect(nationalIdSchema.safeParse("ABC123").success).toBe(true);
  });

  it("accepts up to 12 characters", () => {
    expect(nationalIdSchema.safeParse("ABC123456789").success).toBe(true);
  });

  it("rejects too short values ('abc')", () => {
    expect(nationalIdSchema.safeParse("abc").success).toBe(false);
  });

  it("rejects special characters ('ABC123!!')", () => {
    expect(nationalIdSchema.safeParse("ABC123!!").success).toBe(false);
  });

  it("rejects 13 characters", () => {
    expect(nationalIdSchema.safeParse("ABC1234567890").success).toBe(false);
  });

  it("trims whitespace before validating", () => {
    expect(nationalIdSchema.safeParse("  ABC123  ").success).toBe(true);
  });
});

describe("signUpSchema", () => {
  const base = {
    fullName: "John Doe",
    email: "john@example.com",
    password: "secret123",
    policyAccepted: true,
  };

  it("accepts a valid signup", () => {
    expect(signUpSchema.safeParse(base).success).toBe(true);
  });

  it("lowercases the email", () => {
    const result = signUpSchema.safeParse({
      ...base,
      email: "  JOHN@Example.COM ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("john@example.com");
    }
  });

  it("rejects a short password", () => {
    const result = signUpSchema.safeParse({ ...base, password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must be at least 8 characters",
      );
    }
  });

  it("rejects policyAccepted false", () => {
    const result = signUpSchema.safeParse({ ...base, policyAccepted: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "You must accept the privacy policy and terms",
      );
    }
  });

  it("rejects an invalid email", () => {
    expect(signUpSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(
      false,
    );
  });
});

describe("reviewSchema", () => {
  const base = { cabinId: 1, bookingId: 2, rating: 4, comment: "nice" };

  it("accepts a valid review", () => {
    expect(reviewSchema.safeParse(base).success).toBe(true);
  });

  it("rejects rating 0", () => {
    expect(reviewSchema.safeParse({ ...base, rating: 0 }).success).toBe(false);
  });

  it("rejects rating 6", () => {
    const result = reviewSchema.safeParse({ ...base, rating: 6 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Rating must be 1-5");
    }
  });

  it("coerces the string '4' to the number 4", () => {
    const result = reviewSchema.safeParse({ ...base, rating: "4" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(4);
    }
  });

  it("coerces numeric string ids", () => {
    const result = reviewSchema.safeParse({
      cabinId: "1",
      bookingId: "2",
      rating: 3,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cabinId).toBe(1);
      expect(result.data.comment).toBe("");
    }
  });

  it("rejects non-integer ratings", () => {
    expect(reviewSchema.safeParse({ ...base, rating: 4.5 }).success).toBe(false);
  });
});

describe("createReservationSchema", () => {
  const base = {
    cabinId: 1,
    startDate: "2030-03-01",
    endDate: "2030-03-05",
    numGuests: 2,
    hasBreakfast: false,
  };

  it("accepts a valid reservation", () => {
    expect(createReservationSchema.safeParse(base).success).toBe(true);
  });

  it("rejects endDate before startDate", () => {
    const result = createReservationSchema.safeParse({
      ...base,
      startDate: "2030-03-05",
      endDate: "2030-03-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Check-out must be after check-in",
      );
      expect(result.error.issues[0].path).toEqual(["endDate"]);
    }
  });

  it("rejects endDate equal to startDate", () => {
    expect(
      createReservationSchema.safeParse({
        ...base,
        endDate: "2030-03-01",
      }).success,
    ).toBe(false);
  });

  it("rejects zero guests", () => {
    expect(
      createReservationSchema.safeParse({ ...base, numGuests: 0 }).success,
    ).toBe(false);
  });

  it("coerces date strings into Date objects", () => {
    const result = createReservationSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBeInstanceOf(Date);
      expect(result.data.endDate).toBeInstanceOf(Date);
      expect(result.data.observations).toBe("");
    }
  });
});
