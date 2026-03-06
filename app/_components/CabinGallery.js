"use client";

import { useState } from "react";
import Image from "next/image";

function CabinGallery({ images = [], name }) {
    const [activeIndex, setActiveIndex] = useState(0);

    // If no gallery images, don't render
    if (!images || images.length === 0) return null;

    return (
        <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                <Image
                    src={images[activeIndex]}
                    fill
                    className="object-cover transition-opacity duration-300"
                    alt={`${name} - photo ${activeIndex + 1}`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`relative flex-shrink-0 h-16 w-20 overflow-hidden rounded-sm transition-all ${i === activeIndex
                                    ? "ring-2 ring-accent-500 opacity-100"
                                    : "opacity-60 hover:opacity-100"
                                }`}
                        >
                            <Image
                                src={img}
                                fill
                                className="object-cover"
                                alt={`${name} - thumbnail ${i + 1}`}
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CabinGallery;
