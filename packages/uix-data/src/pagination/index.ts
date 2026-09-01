/**
 * Pagination state shape, verified against PrimeNG's real Paginator
 * fields (first, rows, totalRecords, rowsPerPageOptions). rowsPerPageOptions
 * is carried as pass-through configuration for framework-native rendering
 * (the page-size dropdown) — no function in this package reads it.
 */
export interface PaginationState {
  first: number;
  rows: number;
  totalRecords: number;
  rowsPerPageOptions?: number[];
}

/**
 * Total page count for a given record count and page size. Verified as a
 * real one-line calculation in PrimeNG's paginator.ts (never itself
 * exported even by Prime), with a zero-guard added — Prime's own inline
 * version does not guard against rows === 0, which would otherwise
 * produce Infinity/NaN once centralized as a standalone function.
 */
export function getPageCount(totalRecords: number, rows: number): number {
  return rows > 0 ? Math.ceil(totalRecords / rows) : 0;
}
