"use client";

import { useState } from "react";
import { differenceInDays } from "date-fns";
import { useReservation } from "./ReservationContext";
import ReservationReminder from "./ReservationReminder";
import { createReservation } from "../_lib/action";

function ReservationForm({ cabin, user, settings }) {
  const { range } = useReservation();
  const { maxCapacity, regularPrice, discount } = cabin;
  const startDate = range?.from;
  const endDate = range?.to;
  const isDateSelected = startDate && endDate;
  const numNights = isDateSelected ? differenceInDays(endDate, startDate) : 0;
  const cabinPrice = numNights * (regularPrice - discount);

  const [hasBreakfast, setHasBreakfast] = useState(false);
  const [numGuests, setNumGuests] = useState(1);

  const breakfastPrice = settings?.breakfastPrice ?? 15;
  const breakfastTotal = hasBreakfast
    ? breakfastPrice * numNights * numGuests
    : 0;
  const totalPrice = cabinPrice + breakfastTotal;

  const bookingData = {
    startDate,
    endDate,
    numNights,
    cabinId: cabin.id,
    cabinPrice,
  };
  const createReservationWithData = createReservation.bind(null, bookingData);

  return (
    <div className="scale-[1.01]">
      <div className="bg-primary-800 text-primary-300 px-16 py-2 flex justify-between items-center">
        <p>Logged in as</p>

        <div className="flex gap-4 items-center">
          <img
            referrerPolicy="no-referrer"
            className="h-8 rounded-full"
            src={user.image}
            alt={user.name}
          />
          <p>{user.name}</p>
        </div>
      </div>
      {isDateSelected && (
        <p className="text-primary-300 px-16 py-2 text-sm">
          {String(startDate)} to {String(endDate)}
        </p>
      )}
      <form
        action={createReservationWithData}
        className="bg-primary-900 py-10 px-16 text-lg flex gap-5 flex-col"
      >
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
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            placeholder="Any pets, allergies, special requirements, etc.?"
          />
        </div>

        {/* Breakfast add-on */}
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
            <label
              htmlFor="hasBreakfast"
              className="flex-1 cursor-pointer text-base"
            >
              <span className="font-semibold text-primary-100">
                Add breakfast
              </span>
              <span className="text-primary-400 ml-2">
                ${breakfastPrice}/person/night
                {hasBreakfast && numNights > 0 && (
                  <span className="text-accent-400 ml-2 font-medium">
                    (+${breakfastTotal})
                  </span>
                )}
              </span>
            </label>
            <input type="hidden" name="breakfastTotal" value={breakfastTotal} />
          </div>
        )}

        <div className="flex justify-end items-center gap-6">
          {!isDateSelected && (
            <p className="text-primary-300 text-base">
              Start by selecting dates
            </p>
          )}
          {isDateSelected && (
            <div className="text-right text-base">
              <p className="text-accent-400 font-semibold">
                {numNights} night{numNights > 1 ? "s" : ""} — ${totalPrice}
              </p>
              {hasBreakfast && (
                <p className="text-primary-400 text-sm">
                  Cabin ${cabinPrice} + Breakfast ${breakfastTotal}
                </p>
              )}
            </div>
          )}

          <button
            disabled={!isDateSelected}
            className="bg-accent-500 px-6 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
          >
            Reserve now
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;

