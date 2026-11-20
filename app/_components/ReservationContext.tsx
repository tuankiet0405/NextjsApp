"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { DateRange } from "react-day-picker";

interface ReservationContextValue {
  range: DateRange;
  setRange: (r: DateRange | undefined) => void;
  resetRange: () => void;
}

const ReservationContext = createContext<ReservationContextValue | undefined>(
  undefined
);

const initialState: DateRange = { from: undefined, to: undefined };

function ReservationProvider({ children }: { children: ReactNode }) {
  const [range, setRangeState] = useState<DateRange>(initialState);
  const setRange = (r: DateRange | undefined) => setRangeState(r ?? initialState);
  const resetRange = () => setRangeState(initialState);

  return (
    <ReservationContext.Provider value={{ range, setRange, resetRange }}>
      {children}
    </ReservationContext.Provider>
  );
}

function useReservation(): ReservationContextValue {
  const context = useContext(ReservationContext);
  if (context === undefined)
    throw new Error("Context was used outside provider");
  return context;
}

export { ReservationProvider, useReservation };
