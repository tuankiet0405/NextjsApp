"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

function SortSelector() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathName = usePathname();
    const activeSort = searchParams.get("sort") ?? "name";

    function handleSort(value) {
        const params = new URLSearchParams(searchParams);
        params.set("sort", value);
        router.replace(`${pathName}?${params.toString()}`, { scroll: false });
    }

    return (
        <select
            value={activeSort}
            onChange={(e) => handleSort(e.target.value)}
            className="bg-primary-900 border border-primary-800 text-primary-100 px-4 py-2 rounded-sm focus:outline-none focus:border-accent-500 transition-colors cursor-pointer"
        >
            <option value="name">Sort by name</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
            <option value="capacity-asc">Capacity: small → large</option>
            <option value="capacity-desc">Capacity: large → small</option>
        </select>
    );
}

export default SortSelector;
