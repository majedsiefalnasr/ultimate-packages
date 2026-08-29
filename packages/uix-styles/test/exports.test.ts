import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("package exports", () => {
  it("barrel and base entry points build", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "base", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "badge", "index.mjs"))).toBe(true);
  });
});
