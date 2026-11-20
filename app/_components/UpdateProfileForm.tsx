"use client";

import Image from "next/image";
import { useActionState, type ReactNode } from "react";
import { updateProfile } from "../_lib/action";
import type { Guest } from "../_lib/types";
import FormError from "./FormError";
import SubmitButton from "./SubmitButton";

interface Props {
  guest: Pick<Guest, "email" | "fullName" | "nationalID" | "countryFlag">;
  children: ReactNode;
}

const inputClass =
  "px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400";

function UpdateProfileForm({ guest, children }: Props) {
  const { email, fullName, nationalID, countryFlag } = guest;
  const [state, formAction] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col">
      <FormError message={state?.error} />
      {state?.success && (
        <p role="status" className="text-green-400 text-sm">
          Profile updated.
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="fullName">Full name</label>
        <input id="fullName" disabled defaultValue={fullName} className={inputClass} />
      </div>

      <div className="space-y-2">
        <label htmlFor="email">Email address</label>
        <input id="email" disabled defaultValue={email} className={inputClass} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="nationality">Where are you from?</label>
          {countryFlag && (
            <Image
              src={countryFlag}
              alt="Country flag"
              width={60}
              height={60}
              className="h-5 w-auto rounded-sm"
            />
          )}
        </div>
        {children}
      </div>

      <div className="space-y-2">
        <label htmlFor="nationalID">National ID number</label>
        <input
          id="nationalID"
          name="nationalID"
          defaultValue={nationalID ?? ""}
          pattern="[a-zA-Z0-9]{6,12}"
          title="6-12 letters or digits"
          className={inputClass}
        />
      </div>

      <div className="flex justify-end items-center gap-6">
        <SubmitButton>Update profile</SubmitButton>
      </div>
    </form>
  );
}

export default UpdateProfileForm;
