"use client";

import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [hasNew, setHasNew] = useState(false);

    // Poll for new notifications (placeholder — replace with Supabase Realtime)
    useEffect(() => {
        // TODO: Replace with Supabase Realtime subscription
        // supabase.channel("booking-updates")
        //   .on("postgres_changes", { event: "*", schema: "public", table: "bookings",
        //     filter: `guestId=eq.${guestId}` }, handleChange)
        //   .subscribe();

        // For now, just show as empty
        setNotifications([]);
    }, []);

    function handleToggle() {
        setIsOpen((prev) => !prev);
        if (hasNew) setHasNew(false);
    }

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="relative p-2 hover:bg-primary-800 rounded-full transition-colors"
                aria-label="Notifications"
            >
                {hasNew ? (
                    <BellAlertIcon className="h-5 w-5 text-accent-400" />
                ) : (
                    <BellIcon className="h-5 w-5 text-primary-300" />
                )}
                {hasNew && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 w-72 bg-primary-900 border border-primary-800 rounded-sm shadow-lg z-50">
                    <div className="p-3 border-b border-primary-800">
                        <h4 className="text-sm font-semibold text-primary-100">
                            Notifications
                        </h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-primary-400 text-sm text-center">
                                No notifications yet
                            </p>
                        ) : (
                            notifications.map((n, i) => (
                                <div
                                    key={i}
                                    className="p-3 border-b border-primary-800/50 hover:bg-primary-800/30 text-sm"
                                >
                                    <p className="text-primary-200">{n.message}</p>
                                    <p className="text-primary-500 text-xs mt-1">{n.time}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
