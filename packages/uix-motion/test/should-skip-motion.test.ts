import { describe, it, expect, vi, afterEach } from "vitest";
import { shouldSkipMotion } from "../src/utils";

describe("shouldSkipMotion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false when options are undefined", () => {
    expect(shouldSkipMotion(undefined)).toBe(false);
  });

  it("returns true when options.disabled is true", () => {
    expect(shouldSkipMotion({ disabled: true })).toBe(true);
  });

  it("returns true when options.safe is true and prefers-reduced-motion is set", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true })
    );
    expect(shouldSkipMotion({ safe: true })).toBe(true);
  });

  it("returns false when options.safe is true but prefers-reduced-motion is not set", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false })
    );
    expect(shouldSkipMotion({ safe: true })).toBe(false);
  });
});
