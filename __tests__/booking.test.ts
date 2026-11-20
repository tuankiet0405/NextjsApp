/** @jest-environment node */

import {
  calcBookingPrice,
  validateBooking,
  rangesOverlap,
  type PriceInput,
} from "@/app/_lib/booking";

const today = new Date("2030-01-01");
const cabin = { maxCapacity: 4 };
const settings = { minBookingLength: 2, maxBookingLength: 10 };

const base = {
  startDate: new Date("2030-03-01"),
  endDate: new Date("2030-03-05"),
  numGuests: 2,
};

const valid = (
  overrides: Partial<typeof base> = {},
  bookedRanges: { startDate: string | Date; endDate: string | Date }[] = [],
) =>
  validateBooking(
    { ...base, ...overrides },
    cabin,
    settings,
    bookedRanges,
    today,
  );

describe("calcBookingPrice", () => {
  it("applies the discount to the cabin price", () => {
    const input: PriceInput = {
      regularPrice: 200,
      discount: 50,
      numNights: 3,
      numGuests: 2,
      hasBreakfast: false,
      breakfastPrice: 10,
    };
    const result = calcBookingPrice(input);
    expect(result.cabinPrice).toBe(450);
    expect(result.extrasPrice).toBe(0);
    expect(result.totalPrice).toBe(450);
  });

  it("breakfast costs nights * guests * breakfastPrice", () => {
    const result = calcBookingPrice({
      regularPrice: 100,
      discount: 0,
      numNights: 2,
      numGuests: 3,
      hasBreakfast: true,
      breakfastPrice: 10,
    });
    expect(result.cabinPrice).toBe(200);
    expect(result.extrasPrice).toBe(60);
    expect(result.totalPrice).toBe(260);
  });
});

describe("validateBooking", () => {
  it("returns null for a valid booking", () => {
    expect(valid()).toBeNull();
  });

  it("rejects check-out before check-in", () => {
    expect(
      valid({ startDate: new Date("2030-03-05"), endDate: new Date("2030-03-01") }),
    ).toBe("Check-out must be after check-in");
  });

  it("rejects same-day booking (0 nights)", () => {
    expect(
      valid({ startDate: new Date("2030-03-05"), endDate: new Date("2030-03-05") }),
    ).toBe("Check-out must be after check-in");
  });

  it("rejects check-in in the past", () => {
    expect(
      valid({
        startDate: new Date("2029-12-20"),
        endDate: new Date("2029-12-30"),
      }),
    ).toBe("Check-in date is in the past");
  });

  it("rejects stays below minBookingLength", () => {
    expect(
      valid({ startDate: new Date("2030-03-01"), endDate: new Date("2030-03-02") }),
    ).toBe("Minimum stay is 2 nights");
  });

  it("rejects stays above maxBookingLength", () => {
    expect(
      valid({
        startDate: new Date("2030-03-01"),
        endDate: new Date("2030-03-15"),
      }),
    ).toBe("Maximum stay is 10 nights");
  });

  it("rejects too many guests", () => {
    expect(valid({ numGuests: 5 })).toBe("Maximum 4 guests allowed");
  });

  it("rejects zero guests", () => {
    expect(valid({ numGuests: 0 })).toBe("At least 1 guest required");
  });

  it("rejects dates overlapping an existing booking", () => {
    const bookedRanges = [{ startDate: "2030-03-03", endDate: "2030-03-07" }];
    expect(valid({}, bookedRanges)).toBe("These dates are already booked");
  });

  it("accepts a back-to-back booking (new check-in on previous check-out day)", () => {
    const bookedRanges = [{ startDate: "2030-02-25", endDate: "2030-03-01" }];
    expect(valid({}, bookedRanges)).toBeNull();
  });

  it("today defaults are irrelevant because we pass an explicit fixed today", () => {
    expect(
      valid({ startDate: new Date("2030-01-01"), endDate: new Date("2030-01-05") }),
    ).toBeNull();
  });
});

describe("rangesOverlap", () => {
  it("detects overlap when ranges intersect", () => {
    expect(
      rangesOverlap(base, [{ startDate: "2030-03-03", endDate: "2030-03-07" }]),
    ).toBe(true);
  });

  it("detects containment in either direction", () => {
    expect(
      rangesOverlap(base, [{ startDate: "2030-02-01", endDate: "2030-04-01" }]),
    ).toBe(true);
    expect(
      rangesOverlap(
        { startDate: new Date("2030-01-01"), endDate: new Date("2030-12-01") },
        [{ startDate: "2030-03-01", endDate: "2030-03-05" }],
      ),
    ).toBe(true);
  });

  it("back-to-back booking is NOT an overlap", () => {
    expect(
      rangesOverlap(base, [{ startDate: "2030-02-25", endDate: "2030-03-01" }]),
    ).toBe(false);
    expect(
      rangesOverlap(base, [{ startDate: "2030-03-05", endDate: "2030-03-10" }]),
    ).toBe(false);
  });

  it("returns false for empty ranges", () => {
    expect(rangesOverlap(base, [])).toBe(false);
  });

  it("accepts Date objects as well as strings", () => {
    expect(
      rangesOverlap(base, [
        {
          startDate: new Date("2030-03-04"),
          endDate: new Date("2030-03-08"),
        },
      ]),
    ).toBe(true);
  });
});
