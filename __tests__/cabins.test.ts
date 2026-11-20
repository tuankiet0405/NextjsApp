/** @jest-environment node */

import type { CabinSummary } from "@/app/_lib/types";
import {
  filterCabins,
  searchCabins,
  sortCabins,
  applyCabinQuery,
} from "@/app/_lib/cabins";

const cabins: CabinSummary[] = [
  { id: 1, name: "Birch Lodge", maxCapacity: 2, regularPrice: 250, discount: 50, image: "a.jpg" },
  { id: 2, name: "cedar cabin", maxCapacity: 4, regularPrice: 300, discount: 0, image: "b.jpg" },
  { id: 3, name: "Maple House", maxCapacity: 6, regularPrice: 400, discount: 150, image: "c.jpg" },
  { id: 4, name: "Oak Villa", maxCapacity: 10, regularPrice: 500, discount: 100, image: "d.jpg" },
];

const names = (list: CabinSummary[]) => list.map((c) => c.name);

describe("filterCabins", () => {
  it("small keeps capacity <= 3", () => {
    expect(names(filterCabins(cabins, "small"))).toEqual(["Birch Lodge"]);
  });

  it("medium keeps capacity 4-7", () => {
    expect(names(filterCabins(cabins, "medium"))).toEqual([
      "cedar cabin",
      "Maple House",
    ]);
  });

  it("large keeps capacity >= 8", () => {
    expect(names(filterCabins(cabins, "large"))).toEqual(["Oak Villa"]);
  });

  it('"all" returns every cabin', () => {
    expect(filterCabins(cabins, "all")).toHaveLength(4);
  });

  it("undefined filter returns every cabin", () => {
    expect(filterCabins(cabins)).toHaveLength(4);
  });
});

describe("searchCabins", () => {
  it("is case-insensitive on the cabin name", () => {
    expect(names(searchCabins(cabins, "CEDAR"))).toEqual(["cedar cabin"]);
    expect(names(searchCabins(cabins, "lOdGe"))).toEqual(["Birch Lodge"]);
  });

  it("matches substrings", () => {
    expect(names(searchCabins(cabins, "oak"))).toEqual(["Oak Villa"]);
  });

  it("empty, whitespace and undefined search return everything", () => {
    expect(searchCabins(cabins, "")).toHaveLength(4);
    expect(searchCabins(cabins, "   ")).toHaveLength(4);
    expect(searchCabins(cabins)).toHaveLength(4);
  });

  it("search trims surrounding whitespace", () => {
    expect(names(searchCabins(cabins, "  maple  "))).toEqual(["Maple House"]);
  });

  it("no match returns empty array", () => {
    expect(searchCabins(cabins, "zzz")).toEqual([]);
  });
});

describe("sortCabins", () => {
  it("price-asc sorts by regularPrice - discount", () => {
    expect(names(sortCabins(cabins, "price-asc"))).toEqual([
      "Birch Lodge",
      "Maple House",
      "cedar cabin",
      "Oak Villa",
    ]);
  });

  it("price-desc is the reverse of price-asc", () => {
    expect(names(sortCabins(cabins, "price-desc"))).toEqual([
      "Oak Villa",
      "cedar cabin",
      "Maple House",
      "Birch Lodge",
    ]);
  });

  it("capacity-asc sorts by maxCapacity", () => {
    expect(names(sortCabins(cabins, "capacity-asc"))).toEqual([
      "Birch Lodge",
      "cedar cabin",
      "Maple House",
      "Oak Villa",
    ]);
  });

  it("capacity-desc sorts by maxCapacity descending", () => {
    expect(names(sortCabins(cabins, "capacity-desc"))).toEqual([
      "Oak Villa",
      "Maple House",
      "cedar cabin",
      "Birch Lodge",
    ]);
  });

  it("default sort orders by name (case-insensitive collation)", () => {
    expect(names(sortCabins(cabins))).toEqual([
      "Birch Lodge",
      "cedar cabin",
      "Maple House",
      "Oak Villa",
    ]);
    expect(names(sortCabins(cabins, "name"))).toEqual([
      "Birch Lodge",
      "cedar cabin",
      "Maple House",
      "Oak Villa",
    ]);
  });

  it("does not mutate its input", () => {
    const input = [...cabins];
    const result = sortCabins(input, "price-desc");
    expect(input).toEqual(cabins);
    expect(result).not.toBe(input);
  });
});

describe("applyCabinQuery", () => {
  it("applies filter, search and sort together", () => {
    const result = applyCabinQuery(cabins, {
      filter: "medium",
      sort: "price-asc",
    });
    expect(names(result)).toEqual(["Maple House", "cedar cabin"]);
  });

  it("combines filter and search", () => {
    const result = applyCabinQuery(cabins, {
      filter: "large",
      search: "oak",
      sort: "price-desc",
    });
    expect(names(result)).toEqual(["Oak Villa"]);
  });

  it("search excludes cabins that pass the filter", () => {
    const result = applyCabinQuery(cabins, { filter: "medium", search: "maple" });
    expect(names(result)).toEqual(["Maple House"]);
  });

  it("empty query returns cabins sorted by name by default", () => {
    expect(names(applyCabinQuery(cabins, {}))).toEqual([
      "Birch Lodge",
      "cedar cabin",
      "Maple House",
      "Oak Villa",
    ]);
  });
});
