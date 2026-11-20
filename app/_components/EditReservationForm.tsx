"use client";

import { useFormState } from "react-dom";
import { updateReservation } from "../_lib/action";
import type { Booking } from "../_lib/types";
import FormError from "./FormError";
import SubmitButton from "./SubmitButton";

interface Props {
  booking: Pick<Booking, "id" | "numGuests" | "observations">;
  maxCapacity: number;
}

export default function EditReservationForm({ booking, maxCapacity }: Props) {
  const [state, formAction] = useFormState(updateReservation, undefined);

  return (
    <form action={formAction} className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col">
      <FormError message={state?.error} />
      <input type="hidden" name="bookingId" value={booking.id} />

      <div className="space-y-2">
        <label htmlFor="numGuests">How many guests?</label>
        <select
          name="numGuests"
          id="numGuests"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
          required
          defaultValue={booking.numGuests}
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
          id="observations"
          name="observations"
          maxLength={1000}
          defaultValue={booking.observations ?? ""}
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
        />
      </div>

      <div className="flex justify-end items-center gap-6">
        <SubmitButton>Update reservation</SubmitButton>
      </div>
    </form>
  );
}
