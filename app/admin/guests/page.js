import supabase from "@/app/_lib/supabase";

async function getAllGuests() {
    const { data, error } = await supabase
        .from("guests")
        .select("id, fullName, email, nationality, countryFlag, nationalID, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
    if (error) return [];
    return data;
}

export default async function AdminGuestsPage() {
    const guests = await getAllGuests();

    return (
        <div>
            <h2 className="text-xl font-semibold text-primary-100 mb-6">
                All Guests ({guests.length})
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-primary-800 text-primary-400">
                            <th className="text-left py-3 px-4">ID</th>
                            <th className="text-left py-3 px-4">Name</th>
                            <th className="text-left py-3 px-4">Email</th>
                            <th className="text-left py-3 px-4">Country</th>
                            <th className="text-left py-3 px-4">National ID</th>
                            <th className="text-left py-3 px-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guests.map((guest) => (
                            <tr
                                key={guest.id}
                                className="border-b border-primary-800/50 hover:bg-primary-800/30 transition-colors"
                            >
                                <td className="py-3 px-4 text-primary-400">#{guest.id}</td>
                                <td className="py-3 px-4 font-medium">{guest.fullName}</td>
                                <td className="py-3 px-4 text-primary-300">{guest.email}</td>
                                <td className="py-3 px-4">
                                    {guest.countryFlag && (
                                        <span className="mr-2">{guest.countryFlag}</span>
                                    )}
                                    {guest.nationality || "—"}
                                </td>
                                <td className="py-3 px-4 text-primary-400">
                                    {guest.nationalID || "—"}
                                </td>
                                <td className="py-3 px-4 text-primary-400 text-xs">
                                    {new Date(guest.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
