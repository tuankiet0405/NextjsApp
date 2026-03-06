import CabinCard from "@/app/_components/CabinCard";
import { getCabins, getFavorites } from "../_lib/data-service";
import { auth } from "../_lib/auth";

async function CabinList({ filter, search, sort }) {
  const cabins = await getCabins();

  if (!cabins.length) return null;

  // Get user session + favorites (one query, not N+1)
  let isAuthenticated = false;
  let favoriteIds = [];
  try {
    const session = await auth();
    if (session?.user?.guestId) {
      isAuthenticated = true;
      const favorites = await getFavorites(session.user.guestId);
      favoriteIds = favorites.map((c) => c.id);
    }
  } catch {
    // Not logged in — that's fine
  }

  // 1. Filter by capacity
  let filteredCabins = cabins;
  if (filter === "small")
    filteredCabins = cabins.filter((cabin) => cabin.maxCapacity <= 3);
  if (filter === "medium")
    filteredCabins = cabins.filter(
      (cabin) => cabin.maxCapacity >= 4 && cabin.maxCapacity <= 7
    );
  if (filter === "large")
    filteredCabins = cabins.filter((cabin) => cabin.maxCapacity >= 8);

  // 2. Search by name
  if (search) {
    const q = search.toLowerCase();
    filteredCabins = filteredCabins.filter((cabin) =>
      cabin.name.toLowerCase().includes(q)
    );
  }

  // 3. Sort
  if (sort === "price-asc")
    filteredCabins.sort(
      (a, b) =>
        a.regularPrice - a.discount - (b.regularPrice - b.discount)
    );
  else if (sort === "price-desc")
    filteredCabins.sort(
      (a, b) =>
        b.regularPrice - b.discount - (a.regularPrice - a.discount)
    );
  else if (sort === "capacity-asc")
    filteredCabins.sort((a, b) => a.maxCapacity - b.maxCapacity);
  else if (sort === "capacity-desc")
    filteredCabins.sort((a, b) => b.maxCapacity - a.maxCapacity);
  else filteredCabins.sort((a, b) => a.name.localeCompare(b.name));

  if (!filteredCabins.length)
    return (
      <p className="text-primary-300 text-lg text-center py-12">
        No cabins found matching your criteria.
      </p>
    );

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
      {filteredCabins.map((cabin) => (
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

