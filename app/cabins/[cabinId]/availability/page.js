import AvailabilityCalendar from "@/app/_components/AvailabilityCalendar";
import { getCabin, getBookedDatesByCabinId } from "@/app/_lib/data-service";
import Link from "next/link";

export async function generateMetadata({ params }) {
    const { cabinId } = await params;
    const cabin = await getCabin(cabinId);
    return { title: `Cabin ${cabin.name} — Availability` };
}

export default async function Page({ params }) {
    const { cabinId } = await params;
    const [cabin, bookedDates] = await Promise.all([
        getCabin(cabinId),
        getBookedDatesByCabinId(cabinId),
    ]);

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <div className="mb-8">
                <Link
                    href={`/cabins/${cabinId}`}
                    className="text-accent-400 hover:text-accent-300 text-sm"
                >
                    &larr; Back to Cabin {cabin.name}
                </Link>
                <h1 className="text-3xl font-semibold text-accent-400 mt-3">
                    Cabin {cabin.name} — Availability
                </h1>
                <p className="text-primary-300 mt-2">
                    Check available dates for your stay
                </p>
            </div>

            <AvailabilityCalendar bookedDates={bookedDates} />
        </div>
    );
}
