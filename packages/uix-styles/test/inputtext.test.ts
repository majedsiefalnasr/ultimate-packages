import { describe, it, expect } from "vitest";
import { style } from "../src/inputtext";

describe("uix-styles/inputtext", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });
});
