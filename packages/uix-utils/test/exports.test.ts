import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

const submodules = ["classnames", "dom", "escape", "eventbus", "mergeprops", "object", "scroll-lock", "uuid", "zindex"];

describe("package exports", () => {
  it("barrel entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(true);
  });

  for (const name of submodules) {
    it(`${name} subpath entry point builds`, () => {
      expect(existsSync(join(__dirname, "..", "dist", name, "index.mjs"))).toBe(true);
      expect(existsSync(join(__dirname, "..", "dist", name, "index.d.mts"))).toBe(true);
    });
  }
});
