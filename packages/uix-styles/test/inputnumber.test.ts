import { describe, expect, it } from "vitest";
import { style } from "../src/inputnumber";

describe("uix-styles/inputnumber", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });
});
