/**
 * Filter match-mode vocabulary, verified as the common subset between
 * PrimeReact's DataTableFilterMetaData and PrimeNG's FilterMetadata.
 */
export type FilterMatchMode =
  | "startsWith"
  | "contains"
  | "notContains"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "in"
  | "notIn"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "between"
  | "dateIs"
  | "dateIsNot"
  | "dateBefore"
  | "dateAfter"
  | "custom";

/**
 * Simple (non-operator) filter metadata shape. The operator/constraints
 * variant (PrimeReact's DataTableOperatorFilterMetaData, PrimeNG's
 * FilterMetadata[]-as-array-of-alternatives) is deferred, not rejected —
 * revisit against real Table implementation requirements (see uix-data
 * spec, Approved Decision — Filter Contract).
 */
export interface FilterMetadata {
  value: unknown;
  matchMode: FilterMatchMode;
}
