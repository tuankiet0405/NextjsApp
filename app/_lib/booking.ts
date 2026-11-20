import { differenceInCalendarDays, isBefore, startOfDay } from "date-fns";
import type { Cabin, Settings } from "./types";

export interface PriceInput {
  regularPrice: number;
  discount: number;
  numNights: number;
  numGuests: number;
  hasBreakfast: boolean;
  breakfastPrice: number;
}

export function calcBookingPrice(p: PriceInput) {
  const cabinPrice = p.numNights * (p.regularPrice - p.discount);
  const extrasPrice = p.hasBreakfast
    ? p.numNights * p.numGuests * p.breakfastPrice
    : 0;
  return { cabinPrice, extrasPrice, totalPrice: cabinPrice + extrasPrice };
}

export interface BookingRequest {
  startDate: Date;
  endDate: Date;
  numGuests: number;
}

export function validateBooking(
  req: BookingRequest,
  cabin: Pick<Cabin, "maxCapacity">,
  settings: Pick<Settings, "minBookingLength" | "maxBookingLength">,
  bookedRanges: { startDate: string | Date; endDate: string | Date }[],
  today: Date = new Date(),
): string | null {
  const numNights = differenceInCalendarDays(req.endDate, req.startDate);
  if (numNights < 1) return "Check-out must be after check-in";
  if (isBefore(startOfDay(req.startDate), startOfDay(today)))
    return "Check-in date is in the past";
  if (numNights < settings.minBookingLength)
    return `Minimum stay is ${settings.minBookingLength} nights`;
  if (numNights > settings.maxBookingLength)
    return `Maximum stay is ${settings.maxBookingLength} nights`;
  if (req.numGuests < 1) return "At least 1 guest required";
  if (req.numGuests > cabin.maxCapacity)
    return `Maximum ${cabin.maxCapacity} guests allowed`;
  if (rangesOverlap(req, bookedRanges))
    return "These dates are already booked";
  return null;
}

export function rangesOverlap(
  req: { startDate: Date; endDate: Date },
  ranges: { startDate: string | Date; endDate: string | Date }[],
): boolean {
  const s = startOfDay(req.startDate).getTime();
  const e = startOfDay(req.endDate).getTime();
  return ranges.some((r) => {
    const rs = startOfDay(new Date(r.startDate)).getTime();
    const re = startOfDay(new Date(r.endDate)).getTime();
    return s < re && rs < e;
  });
}
