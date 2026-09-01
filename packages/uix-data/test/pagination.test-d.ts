import { assertType, describe, it } from "vitest";
import type { PaginationState } from "../src/pagination/index";

describe("PaginationState", () => {
  it("accepts the full shape including optional rowsPerPageOptions", () => {
    assertType<PaginationState>({ first: 0, rows: 10, totalRecords: 100 });
    assertType<PaginationState>({
      first: 0,
      rows: 10,
      totalRecords: 100,
      rowsPerPageOptions: [10, 25, 50],
    });
  });

  it("rejects a missing required field", () => {
    // @ts-expect-error totalRecords is required
    assertType<PaginationState>({ first: 0, rows: 10 });
  });
});
