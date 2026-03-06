import { getCabins, getBookings } from "@/app/_lib/data-service";
import supabase from "@/app/_lib/supabase";

async function getGuestCount() {
    const { count, error } = await supabase
        .from("guests")
        .select("*", { count: "exact", head: true });
    if (error) return 0;
    return count;
}

async function getRecentBookings() {
    const { data, error } = await supabase
        .from("bookings")
        .select("id, created_at, totalPrice, status, numNights, cabins(name), guests(fullName)")
        .order("created_at", { ascending: false })
        .limit(10);
    if (error) return [];
    return data;
}

export default async function AdminPage() {
    const [cabins, guestCount, recentBookings] = await Promise.all([
        getCabins(),
        getGuestCount(),
        getRecentBookings(),
    ]);

    const totalRevenue = recentBookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
    );

    return (
        <div className="space-y-8">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Cabins" value={cabins.length} emoji="🏔️" />
                <StatCard label="Total Guests" value={guestCount} emoji="👥" />
                <StatCard
                    label="Recent Bookings"
                    value={recentBookings.length}
                    emoji="📅"
                />
                <StatCard
                    label="Recent Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    emoji="💰"
                />
            </div>

            {/* Recent bookings table */}
            <div>
                <h2 className="text-xl font-semibold text-primary-100 mb-4">
                    Recent Bookings
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-primary-800 text-primary-400">
                                <th className="text-left py-3 px-4">ID</th>
                                <th className="text-left py-3 px-4">Guest</th>
                                <th className="text-left py-3 px-4">Cabin</th>
                                <th className="text-left py-3 px-4">Nights</th>
                                <th className="text-left py-3 px-4">Total</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="border-b border-primary-800/50 hover:bg-primary-800/30 transition-colors"
                                >
                                    <td className="py-3 px-4 text-primary-400">#{booking.id}</td>
                                    <td className="py-3 px-4">
                                        {booking.guests?.fullName ?? "—"}
                                    </td>
                                    <td className="py-3 px-4 text-accent-400">
                                        {booking.cabins?.name ?? "—"}
                                    </td>
                                    <td className="py-3 px-4">{booking.numNights}</td>
                                    <td className="py-3 px-4 font-medium">
                                        ${booking.totalPrice}
                                    </td>
                                    <td className="py-3 px-4">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                    <td className="py-3 px-4 text-primary-400 text-xs">
                                        {new Date(booking.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, emoji }) {
    return (
        <div className="bg-primary-900 border border-primary-800 p-5 rounded-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-primary-400 text-sm">{label}</p>
                    <p className="text-2xl font-semibold text-primary-100 mt-1">
                        {value}
                    </p>
                </div>
                <span className="text-3xl">{emoji}</span>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        unconfirmed: "bg-blue-900/40 text-blue-400 border-blue-800/50",
        confirmed: "bg-green-900/40 text-green-400 border-green-800/50",
        "checked-in": "bg-amber-900/40 text-amber-400 border-amber-800/50",
        "checked-out": "bg-primary-800 text-primary-400 border-primary-700",
    };

    return (
        <span
            className={`px-2 py-1 text-xs rounded-sm border ${styles[status] ?? styles.unconfirmed}`}
        >
            {status ?? "unknown"}
        </span>
    );
}
