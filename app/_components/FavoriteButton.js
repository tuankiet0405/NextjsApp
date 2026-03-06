"use client";

import { useState, useTransition } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { toggleFavorite } from "../_lib/action";

function FavoriteButton({ cabinId, isFavorited = false, isAuthenticated }) {
    const [favorited, setFavorited] = useState(isFavorited);
    const [isPending, startTransition] = useTransition();

    function handleToggle() {
        if (!isAuthenticated) return;

        setFavorited((prev) => !prev);

        startTransition(async () => {
            try {
                await toggleFavorite(cabinId);
            } catch {
                // Revert on error
                setFavorited((prev) => !prev);
            }
        });
    }

    if (!isAuthenticated) return null;

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className="group p-2 rounded-full hover:bg-primary-800/50 transition-all disabled:opacity-50"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
            {favorited ? (
                <HeartSolidIcon className="h-6 w-6 text-red-500 transition-transform group-hover:scale-110" />
            ) : (
                <HeartIcon className="h-6 w-6 text-primary-400 transition-all group-hover:text-red-400 group-hover:scale-110" />
            )}
        </button>
    );
}

export default FavoriteButton;
