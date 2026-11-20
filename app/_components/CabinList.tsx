import CabinCard from "@/app/_components/CabinCard";
import { getCabins, getFavorites } from "../_lib/data-service";
import { auth } from "../_lib/auth";
import { applyCabinQuery } from "../_lib/cabins";

interface Props {
  filter?: string;
  search?: string;
  sort?: string;
}

async function CabinList({ filter, search, sort }: Props) {
  const cabins = await getCabins();
  if (!cabins.length) return null;

  let isAuthenticated = false;
  let favoriteIds: number[] = [];
  const session = await auth().catch(() => null);
  if (session?.user?.guestId) {
    isAuthenticated = true;
    favoriteIds = (await getFavorites(session.user.guestId)).map((c) => c.id);
  }

  const visible = applyCabinQuery(cabins, { filter, search, sort });

  if (!visible.length)
    return (
      <p className="text-primary-300 text-lg text-center py-12">
        No cabins found matching your criteria.
      </p>
    );

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
      {visible.map((cabin) => (
        <CabinCard
          cabin={cabin}
          key={cabin.id}
          isAuthenticated={isAuthenticated}
          isFavorited={favoriteIds.includes(cabin.id)}
        />
      ))}
    </div>
  );
}

export default CabinList;
