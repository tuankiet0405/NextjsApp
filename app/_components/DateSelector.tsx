"use client";

import {
  differenceInCalendarDays,
  isPast,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import type { Cabin, Settings } from "@/app/_lib/types";
import { useReservation } from "./ReservationContext";
import "react-day-picker/dist/style.css";

interface DateSelectorProps {
  settings: Settings;
  cabin: Pick<Cabin, "regularPrice" | "discount">;
  bookedDates: Date[];
}

function isAlreadyBooked(range: DateRange, datesArr: Date[]): boolean {
  const { from, to } = range;
  return (
    !!from &&
    !!to &&
    datesArr.some((date) => isWithinInterval(date, { start: from, end: to }))
  );
}

function DateSelector({ settings, cabin, bookedDates }: DateSelectorProps) {
  const { range, setRange, resetRange } = useReservation();
  const displayRange = isAlreadyBooked(range, bookedDates)
    ? undefined
    : range;
  const numNights =
    range.from && range.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const { regularPrice, discount } = cabin;
  const cabinPrice = numNights * (regularPrice - discount);

  // SETTINGS
  const { minBookingLength, maxBookingLength } = settings;
  return (
    <div className="flex flex-col justify-between">
      <DayPicker
        className="pt-12 place-self-center" // Remove md:grid-cols-2
        mode="range"
        onSelect={setRange}
        selected={displayRange}
        min={minBookingLength + 1}
        max={maxBookingLength}
        fromMonth={new Date()}
        fromDate={new Date()}
        toYear={new Date().getFullYear() + 5}
        captionLayout="dropdown"
        numberOfMonths={2}
        disabled={(curDate) =>
          isPast(curDate) ||
          bookedDates.some((date) => isSameDay(date, curDate))
        }
      />
      <div className="flex items-center justify-between px-8 bg-accent-500 text-primary-800 h-[72px]">
        <div className="flex items-baseline gap-6">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">${regularPrice - discount}</span>
                <span className="line-through font-semibold text-primary-700">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}
            <span className="">/night</span>
          </p>
          {numNights ? (
            <>
              <p className="bg-accent-600 px-3 py-2 text-2xl">
                <span>&times;</span> <span>{numNights}</span>
              </p>
              <p>
                <span className="text-lg font-bold uppercase">Total</span>{" "}
                <span className="text-2xl font-semibold">${cabinPrice}</span>
              </p>
            </>
          ) : null}
        </div>

        {range.from || range.to ? (
          <button
            type="button"
            className="border border-primary-800 py-2 px-4 text-sm font-semibold"
            onClick={resetRange}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;
