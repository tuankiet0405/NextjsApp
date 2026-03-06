import Cabin from "@/app/_components/Cabin";
import Reservations from "@/app/_components/Reservations";
import ReviewList from "@/app/_components/ReviewList";
import FavoriteButton from "@/app/_components/FavoriteButton";
import Spinner from "@/app/_components/Spinner";
import {
  getCabin,
  getCabins,
  getReviewsByCabinId,
  getAverageRating,
  isFavorite,
} from "@/app/_lib/data-service";
import { auth } from "@/app/_lib/auth";
import { Suspense } from "react";

export async function generateMetadata({ params }) {
  const { name } = await getCabin(params.cabinId);
  return { title: `Cabin ${name}` };
}

export async function generateStaticParams() {
  const cabins = await getCabins();
  const ids = cabins.map((cabin) => ({
    cabinId: String(cabin.id),
  }));
  return ids;
}

export default async function Page({ params }) {
  // Fetch everything in parallel
  const [cabin, reviews, ratingData, session] = await Promise.all([
    getCabin(params.cabinId),
    getReviewsByCabinId(params.cabinId),
    getAverageRating(params.cabinId),
    auth().catch(() => null),
  ]);

  let isAuthenticated = false;
  let isFav = false;
  if (session?.user?.guestId) {
    isAuthenticated = true;
    isFav = await isFavorite(session.user.guestId, Number(params.cabinId));
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div>
        <Cabin cabin={cabin} />
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-5xl font-semibold text-accent-400">
              Reserve today. Pay on arrival.
            </h2>
            <FavoriteButton
              cabinId={cabin.id}
              isFavorited={isFav}
              isAuthenticated={isAuthenticated}
            />
          </div>
          {ratingData.count > 0 && (
            <p className="text-primary-300 mt-3 text-lg">
              ⭐ {ratingData.average}/5 from {ratingData.count} review
              {ratingData.count > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <Suspense fallback={<Spinner />}>
        <Reservations cabin={cabin} />
      </Suspense>

      {/* Reviews Section */}
      <div className="mt-16">
        <h3 className="text-2xl font-semibold text-accent-400 mb-6">
          Guest Reviews
          {ratingData.count > 0 && (
            <span className="text-primary-400 text-base font-normal ml-3">
              ({ratingData.count})
            </span>
          )}
        </h3>
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}


