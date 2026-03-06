/**
 * Unit tests for CabinList filter, search, and sort logic.
 *
 * Since CabinList is an async server component, we extract and test
 * the pure logic functions independently.
 */

// ── Helper functions extracted from CabinList logic ──

function filterCabins(cabins, filter) {
    if (filter === "small") return cabins.filter((c) => c.maxCapacity <= 3);
    if (filter === "medium")
        return cabins.filter((c) => c.maxCapacity >= 4 && c.maxCapacity <= 7);
    if (filter === "large") return cabins.filter((c) => c.maxCapacity >= 8);
    return cabins;
}

function searchCabins(cabins, search) {
    if (!search) return cabins;
    const q = search.toLowerCase();
    return cabins.filter((c) => c.name.toLowerCase().includes(q));
}

function sortCabins(cabins, sort) {
    const copy = [...cabins];
    if (sort === "price-asc")
        copy.sort(
            (a, b) => a.regularPrice - a.discount - (b.regularPrice - b.discount)
        );
    else if (sort === "price-desc")
        copy.sort(
            (a, b) => b.regularPrice - b.discount - (a.regularPrice - a.discount)
        );
    else if (sort === "capacity-asc")
        copy.sort((a, b) => a.maxCapacity - b.maxCapacity);
    else if (sort === "capacity-desc")
        copy.sort((a, b) => b.maxCapacity - a.maxCapacity);
    else copy.sort((a, b) => a.name.localeCompare(b.name));
    return copy;
}

// ── Test data ──

const mockCabins = [
    {
        id: 1,
        name: "Alpine Retreat",
        maxCapacity: 2,
        regularPrice: 200,
        discount: 20,
    },
    {
        id: 2,
        name: "Forest Lodge",
        maxCapacity: 5,
        regularPrice: 350,
        discount: 0,
    },
    {
        id: 3,
        name: "Mountain View",
        maxCapacity: 10,
        regularPrice: 500,
        discount: 50,
    },
    {
        id: 4,
        name: "Lake Cabin",
        maxCapacity: 4,
        regularPrice: 280,
        discount: 30,
    },
];

// ── Tests ──

describe("filterCabins", () => {
    test("returns all cabins when no filter", () => {
        expect(filterCabins(mockCabins, undefined)).toHaveLength(4);
        expect(filterCabins(mockCabins, "all")).toHaveLength(4);
    });

    test("filters small cabins (capacity <= 3)", () => {
        const result = filterCabins(mockCabins, "small");
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Alpine Retreat");
    });

    test("filters medium cabins (capacity 4-7)", () => {
        const result = filterCabins(mockCabins, "medium");
        expect(result).toHaveLength(2);
        expect(result.map((c) => c.name)).toEqual(
            expect.arrayContaining(["Forest Lodge", "Lake Cabin"])
        );
    });

    test("filters large cabins (capacity >= 8)", () => {
        const result = filterCabins(mockCabins, "large");
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Mountain View");
    });
});

describe("searchCabins", () => {
    test("returns all cabins when search is empty", () => {
        expect(searchCabins(mockCabins, "")).toHaveLength(4);
        expect(searchCabins(mockCabins, null)).toHaveLength(4);
    });

    test("searches case-insensitively", () => {
        const result = searchCabins(mockCabins, "FOREST");
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Forest Lodge");
    });

    test("matches partial names", () => {
        const result = searchCabins(mockCabins, "ount");
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Mountain View");
    });

    test("returns empty when no match", () => {
        expect(searchCabins(mockCabins, "zzz")).toHaveLength(0);
    });
});

describe("sortCabins", () => {
    test("sorts by name (default)", () => {
        const result = sortCabins(mockCabins, undefined);
        expect(result.map((c) => c.name)).toEqual([
            "Alpine Retreat",
            "Forest Lodge",
            "Lake Cabin",
            "Mountain View",
        ]);
    });

    test("sorts by price ascending (after discount)", () => {
        const result = sortCabins(mockCabins, "price-asc");
        // Alpine: 180, Lake: 250, Forest: 350, Mountain: 450
        expect(result.map((c) => c.name)).toEqual([
            "Alpine Retreat",
            "Lake Cabin",
            "Forest Lodge",
            "Mountain View",
        ]);
    });

    test("sorts by price descending", () => {
        const result = sortCabins(mockCabins, "price-desc");
        expect(result[0].name).toBe("Mountain View");
        expect(result[3].name).toBe("Alpine Retreat");
    });

    test("sorts by capacity ascending", () => {
        const result = sortCabins(mockCabins, "capacity-asc");
        expect(result[0].maxCapacity).toBe(2);
        expect(result[3].maxCapacity).toBe(10);
    });

    test("sorts by capacity descending", () => {
        const result = sortCabins(mockCabins, "capacity-desc");
        expect(result[0].maxCapacity).toBe(10);
        expect(result[3].maxCapacity).toBe(2);
    });
});

describe("combined filter + search + sort", () => {
    test("filters then searches then sorts", () => {
        const filtered = filterCabins(mockCabins, "medium");
        const searched = searchCabins(filtered, "l");
        const sorted = sortCabins(searched, "price-asc");

        expect(sorted).toHaveLength(2);
        expect(sorted[0].name).toBe("Lake Cabin");
        expect(sorted[1].name).toBe("Forest Lodge");
    });

    test("empty result from filter + search combo", () => {
        const filtered = filterCabins(mockCabins, "small");
        const searched = searchCabins(filtered, "forest");
        expect(searched).toHaveLength(0);
    });
});
