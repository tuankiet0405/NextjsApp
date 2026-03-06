import { getCabins } from "@/app/_lib/data-service";
import Image from "next/image";

export default async function AdminCabinsPage() {
    const cabins = await getCabins();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary-100">
                    Manage Cabins ({cabins.length})
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-primary-800 text-primary-400">
                            <th className="text-left py-3 px-4">Image</th>
                            <th className="text-left py-3 px-4">Name</th>
                            <th className="text-left py-3 px-4">Capacity</th>
                            <th className="text-left py-3 px-4">Price</th>
                            <th className="text-left py-3 px-4">Discount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cabins.map((cabin) => (
                            <tr
                                key={cabin.id}
                                className="border-b border-primary-800/50 hover:bg-primary-800/30 transition-colors"
                            >
                                <td className="py-2 px-4">
                                    <div className="relative h-10 w-16">
                                        <Image
                                            src={cabin.image}
                                            fill
                                            alt={cabin.name}
                                            className="object-cover rounded-sm"
                                            sizes="64px"
                                        />
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-accent-400 font-medium">
                                    {cabin.name}
                                </td>
                                <td className="py-3 px-4">{cabin.maxCapacity} guests</td>
                                <td className="py-3 px-4">${cabin.regularPrice}</td>
                                <td className="py-3 px-4">
                                    {cabin.discount > 0 ? (
                                        <span className="text-green-400">-${cabin.discount}</span>
                                    ) : (
                                        <span className="text-primary-500">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
