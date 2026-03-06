import StarRating from "./StarRating";

function ReviewList({ reviews }) {
    if (!reviews || reviews.length === 0) {
        return (
            <p className="text-primary-400 text-base">
                No reviews yet. Be the first to share your experience!
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className="bg-primary-800/30 p-5 rounded-sm border border-primary-800"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        className={`h-4 w-4 ${i < review.rating
                                                ? "fill-amber-400 stroke-amber-400"
                                                : "fill-none stroke-primary-500"
                                            }`}
                                        strokeWidth={1.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                        />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-primary-200 font-medium text-sm">
                                {review.guests?.fullName ?? "Guest"}
                            </span>
                        </div>
                        <span className="text-primary-500 text-xs">
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>
                    {review.comment && (
                        <p className="text-primary-300 text-sm leading-relaxed">
                            {review.comment}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ReviewList;
