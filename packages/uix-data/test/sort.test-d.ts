import { assertType, describe, it } from "vitest";
import type { SortMeta, SortMode } from "../src/sort/index";

describe("SortMeta", () => {
  it("accepts field + order in {1, 0, -1}", () => {
    assertType<SortMeta>({ field: "name", order: 1 });
    assertType<SortMeta>({ field: "name", order: 0 });
    assertType<SortMeta>({ field: "name", order: -1 });
  });

  it("rejects an order outside {1, 0, -1}", () => {
    // @ts-expect-error order must be 1, 0, or -1
    assertType<SortMeta>({ field: "name", order: 2 });
  });

  it("rejects a missing field", () => {
    // @ts-expect-error field is required
    assertType<SortMeta>({ order: 1 });
  });
});

describe("SortMode", () => {
  it("accepts 'single' and 'multiple'", () => {
    assertType<SortMode>("single");
    assertType<SortMode>("multiple");
  });
});
