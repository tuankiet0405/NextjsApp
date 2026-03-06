"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

function SearchBar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathName = usePathname();
    const [query, setQuery] = useState(searchParams.get("search") ?? "");

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (query) {
                params.set("search", query);
            } else {
                params.delete("search");
            }
            router.replace(`${pathName}?${params.toString()}`, { scroll: false });
        }, 300);

        return () => clearTimeout(timer);
    }, [query, searchParams, router, pathName]);

    return (
        <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
                type="text"
                placeholder="Search cabins..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-primary-900 border border-primary-800 text-primary-100 pl-10 pr-4 py-2 rounded-sm w-full md:w-64 placeholder:text-primary-500 focus:outline-none focus:border-accent-500 transition-colors"
            />
        </div>
    );
}

export default SearchBar;
