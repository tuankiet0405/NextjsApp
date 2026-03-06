/* eslint-disable react/no-unescaped-entities */

import { Suspense } from "react";
import CabinListSkeleton from "../_components/CabinListSkeleton";
import CabinList from "../_components/CabinList";
import Filter from "../_components/Filter";
import SearchBar from "../_components/SearchBar";
import SortSelector from "../_components/SortSelector";
import ReservationReminder from "../_components/ReservationReminder";

export const revalidate = 3600;

export default async function Page({ searchParams }) {
  const filter = searchParams.capacity ?? "all";
  const search = searchParams.search ?? "";
  const sort = searchParams.sort ?? "name";

  return (
    <div>
      <h1 className="text-4xl mb-5 text-accent-400 font-medium">
        Our Luxury Cabins
      </h1>
      <p className="text-primary-200 text-lg mb-10">
        Cozy yet luxurious cabins, located right in the heart of the Italian
        Dolomites. Imagine waking up to beautiful mountain views, spending your
        days exploring the dark forests around, or just relaxing in your private
        hot tub under the stars. Enjoy nature&apos;s beauty in your own little
        home away from home. The perfect spot for a peaceful, calm vacation.
        Welcome to paradise.
      </p>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8">
        <SearchBar />
        <div className="flex gap-4 items-center">
          <Filter />
          <SortSelector />
        </div>
      </div>

      <Suspense fallback={<CabinListSkeleton />} key={`${filter}-${search}-${sort}`}>
        <CabinList filter={filter} search={search} sort={sort} />
      </Suspense>
      <ReservationReminder />
    </div>
  );
}

