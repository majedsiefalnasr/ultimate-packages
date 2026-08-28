import { describe, it, expect } from "vitest";
import { uuid } from "../src/uuid";

describe("uuid", () => {
  it("produces different values on successive calls with the same prefix", () => {
    const first = uuid("test_");
    const second = uuid("test_");

    expect(first).not.toBe(second);
  });

  it("prefixes the result with the given prefix followed by a counter", () => {
    const first = uuid("widget_");

    expect(first).toMatch(/^widget_\d+$/);
  });

  it("defaults to the pui_id_ prefix when no prefix is given", () => {
    const value = uuid();

    expect(value).toMatch(/^pui_id_\d+$/);
  });

  it("tracks counters independently per prefix", () => {
    const a1 = uuid("group_a_");
    const b1 = uuid("group_b_");
    const a2 = uuid("group_a_");

    expect(a1).toBe("group_a_1");
    expect(b1).toBe("group_b_1");
    expect(a2).toBe("group_a_2");
  });
});
