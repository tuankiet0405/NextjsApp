import type { CabinFilter, CabinSort, CabinSummary } from "./types";

export function filterCabins<T extends CabinSummary>(
  cabins: T[],
  filter?: string,
): T[] {
  switch (filter as CabinFilter) {
    case "small":
      return cabins.filter((c) => c.maxCapacity <= 3);
    case "medium":
      return cabins.filter((c) => c.maxCapacity >= 4 && c.maxCapacity <= 7);
    case "large":
      return cabins.filter((c) => c.maxCapacity >= 8);
    default:
      return cabins;
  }
}

export function searchCabins<T extends CabinSummary>(
  cabins: T[],
  search?: string,
): T[] {
  const q = search?.trim().toLowerCase();
  if (!q) return cabins;
  return cabins.filter((c) => c.name.toLowerCase().includes(q));
}

const finalPrice = (c: CabinSummary) => c.regularPrice - c.discount;

export function sortCabins<T extends CabinSummary>(
  cabins: T[],
  sort?: string,
): T[] {
  const copy = [...cabins];
  switch (sort as CabinSort) {
    case "price-asc":
      return copy.sort((a, b) => finalPrice(a) - finalPrice(b));
    case "price-desc":
      return copy.sort((a, b) => finalPrice(b) - finalPrice(a));
    case "capacity-asc":
      return copy.sort((a, b) => a.maxCapacity - b.maxCapacity);
    case "capacity-desc":
      return copy.sort((a, b) => b.maxCapacity - a.maxCapacity);
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function applyCabinQuery<T extends CabinSummary>(
  cabins: T[],
  q: { filter?: string; search?: string; sort?: string },
): T[] {
  return sortCabins(searchCabins(filterCabins(cabins, q.filter), q.search), q.sort);
}
