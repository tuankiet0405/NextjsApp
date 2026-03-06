"use client";

import { useState } from "react";

function StarRating({ maxRating = 5, defaultRating = 0, onSetRating, size = "md" }) {
    const [rating, setRating] = useState(defaultRating);
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };
    const starSize = sizes[size] || sizes.md;

    function handleClick(value) {
        setRating(value);
        onSetRating?.(value);
    }

    return (
        <div className="flex gap-1">
            {Array.from({ length: maxRating }, (_, i) => {
                const starValue = i + 1;
                const isFilled = starValue <= (hoverRating || rating);

                return (
                    <button
                        key={starValue}
                        type="button"
                        onClick={() => handleClick(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="cursor-pointer transition-transform hover:scale-110"
                        aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className={`${starSize} transition-colors ${isFilled
                                    ? "fill-amber-400 stroke-amber-400"
                                    : "fill-none stroke-primary-400"
                                }`}
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}

export default StarRating;
