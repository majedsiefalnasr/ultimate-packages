import { assertType, describe, it } from "vitest";
import type { SelectionMode } from "../src/selection/index";

describe("SelectionMode", () => {
  it("accepts 'single' and 'multiple'", () => {
    assertType<SelectionMode>("single");
    assertType<SelectionMode>("multiple");
  });

  it("rejects values outside the union", () => {
    // @ts-expect-error "none" is not a valid SelectionMode
    assertType<SelectionMode>("none");
  });
});
