"use client";

import { useState, useActionState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import type { Session } from "next-auth";
import { useReservation } from "./ReservationContext";
import { createReservation } from "../_lib/action";
import { calcBookingPrice } from "../_lib/booking";
import type { Cabin, Settings } from "../_lib/types";
import FormError from "./FormError";
import SubmitButton from "./SubmitButton";

interface Props {
  cabin: Pick<Cabin, "id" | "maxCapacity" | "regularPrice" | "discount">;
  user: Session["user"];
  settings: Settings;
}

function ReservationForm({ cabin, user, settings }: Props) {
  const { range, resetRange } = useReservation();
  const { maxCapacity, regularPrice, discount } = cabin;
  const startDate = range?.from;
  const endDate = range?.to;
  const isDateSelected = Boolean(startDate && endDate);
  const numNights =
    startDate && endDate ? differenceInCalendarDays(endDate, startDate) : 0;

  const [hasBreakfast, setHasBreakfast] = useState(false);
  const [numGuests, setNumGuests] = useState(1);

  const { cabinPrice, extrasPrice, totalPrice } = calcBookingPrice({
    regularPrice,
    discount,
    numNights,
    numGuests,
    hasBreakfast,
    breakfastPrice: settings.breakfastPrice,
  });

  const action = createReservation.bind(null, {
    cabinId: cabin.id,
    startDate: startDate && format(startDate, "yyyy-MM-dd"),
    endDate: endDate && format(endDate, "yyyy-MM-dd"),
  });
  const [state, formAction] = useActionState(action, undefined);

  return (
    <div className="scale-[1.01]">
      <div className="bg-primary-800 text-primary-300 px-16 py-2 flex justify-between items-center">
        <p>Logged in as</p>
        <div className="flex gap-4 items-center">
          {user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              referrerPolicy="no-referrer"
              className="h-8 rounded-full"
              src={user.image}
              alt={user.name ?? ""}
            />
          )}
          <p>{user.name}</p>
        </div>
      </div>

      {startDate && endDate && (
        <p className="text-primary-300 px-16 py-2 text-sm" data-testid="selected-dates">
          {format(startDate, "EEE, MMM dd yyyy")} → {format(endDate, "EEE, MMM dd yyyy")}
        </p>
      )}

      <form
        action={formAction}
        className="bg-primary-900 py-10 px-16 text-lg flex gap-5 flex-col"
      >
        <FormError message={state?.error} />

        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
            value={numGuests}
            onChange={(e) => setNumGuests(Number(e.target.value))}
          >
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">Anything we should know about your stay?</label>
          <textarea
            name="observations"
            id="observations"
            maxLength={1000}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            placeholder="Any pets, allergies, special requirements, etc.?"
          />
        </div>

        {isDateSelected && (
          <div className="flex items-center gap-4 p-4 border border-primary-800 rounded-sm bg-primary-800/30">
            <input
              type="checkbox"
              name="hasBreakfast"
              id="hasBreakfast"
              checked={hasBreakfast}
              onChange={(e) => setHasBreakfast(e.target.checked)}
              className="h-5 w-5 accent-accent-500 cursor-pointer"
            />
            <label htmlFor="hasBreakfast" className="flex-1 cursor-pointer text-base">
              <span className="font-semibold text-primary-100">Add breakfast</span>
              <span className="text-primary-400 ml-2">
                ${settings.breakfastPrice}/person/night
                {hasBreakfast && numNights > 0 && (
                  <span className="text-accent-400 ml-2 font-medium">(+${extrasPrice})</span>
                )}
              </span>
            </label>
          </div>
        )}

        <div className="flex justify-end items-center gap-6">
          {!isDateSelected && (
            <p className="text-primary-300 text-base">Start by selecting dates</p>
          )}
          {isDateSelected && (
            <div className="text-right text-base" data-testid="price-summary">
              <p className="text-accent-400 font-semibold">
                {numNights} night{numNights > 1 ? "s" : ""} — ${totalPrice}
              </p>
              {hasBreakfast && (
                <p className="text-primary-400 text-sm">
                  Cabin ${cabinPrice} + Breakfast ${extrasPrice}
                </p>
              )}
            </div>
          )}
          <SubmitButton disabled={!isDateSelected} pendingLabel="Reserving...">
            Reserve now
          </SubmitButton>
        </div>
      </form>
      {state?.error && (
        <button onClick={resetRange} className="px-16 py-2 text-sm text-primary-400 underline">
          Clear dates
        </button>
      )}
    </div>
  );
}

export default ReservationForm;
