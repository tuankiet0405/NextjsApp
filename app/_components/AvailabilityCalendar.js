"use client";

import { useState } from "react";
import {
    eachDayOfInterval,
    format,
    startOfMonth,
    endOfMonth,
    addMonths,
    subMonths,
    getDay,
    isSameDay,
    isBefore,
    startOfToday,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AvailabilityCalendar({ bookedDates = [] }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfToday();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart);

    function isBooked(date) {
        return bookedDates.some((d) => isSameDay(new Date(d), date));
    }

    function isPast(date) {
        return isBefore(date, today);
    }

    return (
        <div className="bg-primary-900 border border-primary-800 rounded-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1 hover:bg-primary-800 rounded-sm transition-colors"
                >
                    <ChevronLeftIcon className="h-5 w-5 text-primary-300" />
                </button>
                <h3 className="text-primary-100 font-semibold text-lg">
                    {format(currentMonth, "MMMM yyyy")}
                </h3>
                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1 hover:bg-primary-800 rounded-sm transition-colors"
                >
                    <ChevronRightIcon className="h-5 w-5 text-primary-300" />
                </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs text-primary-500 font-medium py-1"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: startDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {daysInMonth.map((date) => {
                    const booked = isBooked(date);
                    const past = isPast(date);
                    const isToday = isSameDay(date, today);

                    let classes =
                        "text-center py-2 text-sm rounded-sm transition-colors ";
                    if (past) {
                        classes += "text-primary-700 cursor-default";
                    } else if (booked) {
                        classes +=
                            "bg-red-900/40 text-red-400 cursor-default border border-red-800/50";
                    } else {
                        classes +=
                            "bg-accent-500/10 text-accent-400 border border-accent-500/20";
                    }

                    if (isToday) {
                        classes += " ring-1 ring-accent-500 font-bold";
                    }

                    return (
                        <div key={date.toISOString()} className={classes}>
                            {format(date, "d")}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs text-primary-400 justify-center">
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 bg-accent-500/10 border border-accent-500/20 rounded-sm" />
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 bg-red-900/40 border border-red-800/50 rounded-sm" />
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 bg-primary-800 rounded-sm" />
                    <span>Past</span>
                </div>
            </div>
        </div>
    );
}

export default AvailabilityCalendar;
