import { describe, it, expect } from "vitest";
import { createMotion } from "../src/config";

describe("createMotion", () => {
  it("throws when called without an element", () => {
    // @ts-expect-error - testing runtime guard against missing element
    expect(() => createMotion(undefined)).toThrow();
  });

  it("returns a motion instance for a valid element", () => {
    const el = document.createElement("div");
    const instance = createMotion(el, { disabled: true });
    expect(instance).toBeDefined();
    expect(instance.enter).toBeTypeOf("function");
    expect(instance.leave).toBeTypeOf("function");
    expect(instance.cancel).toBeTypeOf("function");
    expect(instance.update).toBeTypeOf("function");
  });
});
