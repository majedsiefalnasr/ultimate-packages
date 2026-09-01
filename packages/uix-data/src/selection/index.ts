/**
 * Selection-cardinality vocabulary, verified identical across Angular,
 * React, and Vue Table implementations. Carries no information about how
 * selection is stored, mutated, or communicated — that remains
 * framework-owned.
 */
export type SelectionMode = "single" | "multiple";
