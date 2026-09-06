import { describe, it, expect } from "vitest";
import { SCHEMA_VERSION } from "../src/version";

describe("SCHEMA_VERSION", () => {
  it("is a non-empty semver-shaped string", () => {
    expect(typeof SCHEMA_VERSION).toBe("string");
    expect(SCHEMA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
