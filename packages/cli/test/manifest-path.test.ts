import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COMPATIBILITY_MANIFEST_PATH } from "../src/manifest-path.js";

const PACKAGE_ROOT = fileURLToPath(new URL("..", import.meta.url));
const CANONICAL = join(
  PACKAGE_ROOT,
  "..",
  "..",
  "docs",
  "architecture",
  "compatibility-manifest.json"
);

describe("COMPATIBILITY_MANIFEST_PATH (GAP-131)", () => {
  it("is the packaged copy under this package's own dist/, independent of the working directory", () => {
    expect(COMPATIBILITY_MANIFEST_PATH).toBe(
      join(PACKAGE_ROOT, "dist", "compatibility-manifest.json")
    );
  });

  it("is byte-identical to the canonical manifest (run `pnpm --filter @ultimate/cli build` if this fails)", () => {
    expect(readFileSync(COMPATIBILITY_MANIFEST_PATH)).toEqual(readFileSync(CANONICAL));
  });
});
