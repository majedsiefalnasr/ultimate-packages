/**
 * Sort metadata shape, verified identical field names/types between
 * PrimeNG's SortMeta[] and PrimeReact's DataTableSortMeta. No comparator
 * function is included — sort execution is entangled with row-value
 * resolution in real Table source, not a genuinely shared standalone
 * primitive (see uix-data spec, Consumption-Readiness Research).
 */
export interface SortMeta {
  field: string;
  order: 1 | 0 | -1;
}

/**
 * Sort-cardinality vocabulary, verified identical across Angular, React,
 * and Vue Table implementations.
 */
export type SortMode = "single" | "multiple";
