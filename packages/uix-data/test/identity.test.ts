import { describe, expect, it } from "vitest";
import { equals as equalsFromIdentity } from "../src/identity/index";
import { equals as equalsFromUixUtils } from "@ultimate/uix-utils/object";

describe("identity", () => {
  it("re-exports uix-utils's equals unchanged (reference-identical)", () => {
    expect(equalsFromIdentity).toBe(equalsFromUixUtils);
  });

  it("compares by deep equality when no field is given", () => {
    expect(equalsFromIdentity({ id: 1 }, { id: 1 })).toBe(true);
    expect(equalsFromIdentity({ id: 1 }, { id: 2 })).toBe(false);
  });

  it("compares by field path when a field is given", () => {
    const a = { id: 1, label: "A" };
    const b = { id: 1, label: "B" };
    expect(equalsFromIdentity(a, b, "id")).toBe(true);
    expect(equalsFromIdentity(a, b, "label")).toBe(false);
  });
});
