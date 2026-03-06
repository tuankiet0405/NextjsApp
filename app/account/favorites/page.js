import CabinCard from "@/app/_components/CabinCard";
import { auth } from "@/app/_lib/auth";
import { getFavorites } from "@/app/_lib/data-service";

export const metadata = {
    title: "Favorites",
};

export default async function Page() {
    const session = await auth();
    const favorites = await getFavorites(session.user.guestId);

    return (
        <div>
            <h2 className="font-semibold text-2xl text-accent-400 mb-7">
                Your favorite cabins
            </h2>

            {favorites.length === 0 ? (
                <p className="text-primary-300 text-lg">
                    You haven&apos;t added any cabins to your favorites yet.{" "}
                    <a
                        href="/cabins"
                        className="text-accent-400 underline hover:text-accent-300"
                    >
                        Browse cabins
                    </a>{" "}
                    to find your perfect getaway!
                </p>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {favorites.map((cabin) => (
                        <CabinCard cabin={cabin} key={cabin.id} />
                    ))}
                </div>
            )}
        </div>
    );
}
