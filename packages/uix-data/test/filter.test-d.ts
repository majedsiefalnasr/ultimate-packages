import { assertType, describe, it } from "vitest";
import type { FilterMatchMode, FilterMetadata } from "../src/filter/index";

describe("FilterMatchMode", () => {
  it("accepts every verified match mode", () => {
    const modes: FilterMatchMode[] = [
      "startsWith",
      "contains",
      "notContains",
      "endsWith",
      "equals",
      "notEquals",
      "in",
      "notIn",
      "lt",
      "lte",
      "gt",
      "gte",
      "between",
      "dateIs",
      "dateIsNot",
      "dateBefore",
      "dateAfter",
      "custom",
    ];
    assertType<FilterMatchMode[]>(modes);
  });

  it("rejects an unrecognized match mode", () => {
    // @ts-expect-error "fuzzyMatch" is not a verified FilterMatchMode
    assertType<FilterMatchMode>("fuzzyMatch");
  });
});

describe("FilterMetadata", () => {
  it("accepts value + matchMode, no operator/constraints", () => {
    assertType<FilterMetadata>({ value: "abc", matchMode: "contains" });
    assertType<FilterMetadata>({ value: 42, matchMode: "equals" });
  });

  it("rejects an operator/constraints shape (deferred, not part of this type)", () => {
    // @ts-expect-error operator/constraints are deferred, not part of FilterMetadata
    assertType<FilterMetadata>({ operator: "and", constraints: [] });
  });
});
