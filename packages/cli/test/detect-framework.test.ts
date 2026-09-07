import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { detectFramework } from "../src/detect-framework.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "fixtures");

describe("detectFramework", () => {
  it('returns "angular" for a fixture with @angular/core in dependencies', () => {
    expect(detectFramework(join(fixturesDir, "angular-project"))).toBe("angular");
  });

  it('returns "react" for a fixture with react in dependencies', () => {
    expect(detectFramework(join(fixturesDir, "react-project"))).toBe("react");
  });

  it('returns "vue" for a fixture with vue in dependencies', () => {
    expect(detectFramework(join(fixturesDir, "vue-project"))).toBe("vue");
  });

  it("returns null for a fixture with none of the three frameworks", () => {
    expect(detectFramework(join(fixturesDir, "unknown-project"))).toBeNull();
  });

  it("returns null for a directory with no package.json at all", () => {
    // fixturesDir itself has no package.json - only subdirectories do.
    expect(detectFramework(fixturesDir)).toBeNull();
  });

  it('returns "angular" (priority order) when both @angular/core and react are declared', () => {
    // The angular-project fixture intentionally declares both @angular/core
    // and react to exercise the documented angular -> react -> vue priority.
    expect(detectFramework(join(fixturesDir, "angular-project"))).toBe("angular");
  });
});
