import supabase from "@/app/_lib/supabase";

async function getAllBookings() {
    const { data, error } = await supabase
        .from("bookings")
        .select("id, created_at, startDate, endDate, totalPrice, status, numNights, numGuests, hasBreakfast, cabins(name), guests(fullName, email)")
        .order("created_at", { ascending: false })
        .limit(50);
    if (error) return [];
    return data;
}

export default async function AdminBookingsPage() {
    const bookings = await getAllBookings();

    return (
        <div>
            <h2 className="text-xl font-semibold text-primary-100 mb-6">
                All Bookings ({bookings.length})
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-primary-800 text-primary-400">
                            <th className="text-left py-3 px-3">ID</th>
                            <th className="text-left py-3 px-3">Guest</th>
                            <th className="text-left py-3 px-3">Cabin</th>
                            <th className="text-left py-3 px-3">Dates</th>
                            <th className="text-left py-3 px-3">Nights</th>
                            <th className="text-left py-3 px-3">Guests</th>
                            <th className="text-left py-3 px-3">Breakfast</th>
                            <th className="text-left py-3 px-3">Total</th>
                            <th className="text-left py-3 px-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr
                                key={b.id}
                                className="border-b border-primary-800/50 hover:bg-primary-800/30 transition-colors"
                            >
                                <td className="py-3 px-3 text-primary-400">#{b.id}</td>
                                <td className="py-3 px-3">
                                    <div>
                                        <p className="text-primary-100">{b.guests?.fullName}</p>
                                        <p className="text-primary-500 text-xs">{b.guests?.email}</p>
                                    </div>
                                </td>
                                <td className="py-3 px-3 text-accent-400">{b.cabins?.name}</td>
                                <td className="py-3 px-3 text-xs">
                                    {new Date(b.startDate).toLocaleDateString()} →{" "}
                                    {new Date(b.endDate).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-3">{b.numNights}</td>
                                <td className="py-3 px-3">{b.numGuests}</td>
                                <td className="py-3 px-3">
                                    {b.hasBreakfast ? "✅" : "—"}
                                </td>
                                <td className="py-3 px-3 font-medium">${b.totalPrice}</td>
                                <td className="py-3 px-3">
                                    <span
                                        className={`px-2 py-1 text-xs rounded-sm border ${b.status === "confirmed"
                                                ? "bg-green-900/40 text-green-400 border-green-800/50"
                                                : b.status === "checked-in"
                                                    ? "bg-amber-900/40 text-amber-400 border-amber-800/50"
                                                    : "bg-blue-900/40 text-blue-400 border-blue-800/50"
                                            }`}
                                    >
                                        {b.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
