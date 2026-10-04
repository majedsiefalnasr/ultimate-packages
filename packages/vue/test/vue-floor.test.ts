import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readVueFloorRanges, resolveVueFloor } from "../scripts/vue-floor.mjs";

const VUE = "@ultimate/vue peerDependencies.vue";
const CORE = "@ultimate/vue-core peerDependencies.vue";
const MANIFEST = "compatibility-manifest.json vue frameworkVersionRange";

function ranges(vue?: string, core?: string, manifest?: string) {
  return { [VUE]: vue, [CORE]: core, [MANIFEST]: manifest };
}

describe("resolveVueFloor", () => {
  it("returns X.Y.Z when all three ranges are the same caret range", () => {
    expect(resolveVueFloor(ranges("^3.5.2", "^3.5.2", "^3.5.2"))).toBe("3.5.2");
  });

  it("fails and names every range when one differs", () => {
    expect(() => resolveVueFloor(ranges("^3.5.2", "^3.5.0", "^3.5.2"))).toThrow(
      `[validate-consumer-types] Vue floor ranges must be one identical caret range ^X.Y.Z; got ${VUE}=^3.5.2, ${CORE}=^3.5.0, ${MANIFEST}=^3.5.2`
    );
  });

  it("fails when a range is missing", () => {
    expect(() => resolveVueFloor(ranges("^3.5.2", "^3.5.2", undefined))).toThrow(
      `${MANIFEST}=(missing)`
    );
  });

  it.each(["3.5.2", "^3.5", ">=3.5.2", "^3.5.2 ", "~3.5.2", "^3.5.2-beta.1", "^3.5.2 || ^4.0.0"])(
    "fails for the non-caret or partial range %j even when all three agree",
    (range) => {
      expect(() => resolveVueFloor(ranges(range, range, range))).toThrow(
        "must be one identical caret range"
      );
    }
  );
});

describe("readVueFloorRanges", () => {
  function fixture(vuePeer: unknown, corePeer: unknown, manifest: unknown) {
    const root = mkdtempSync(join(tmpdir(), "vue-floor-"));
    const vueDir = join(root, "vue");
    const vueCoreDir = join(root, "vue-core");
    mkdirSync(vueDir);
    mkdirSync(vueCoreDir);
    writeFileSync(join(vueDir, "package.json"), JSON.stringify({ peerDependencies: vuePeer }));
    writeFileSync(join(vueCoreDir, "package.json"), JSON.stringify({ peerDependencies: corePeer }));
    const manifestPath = join(root, "compatibility-manifest.json");
    writeFileSync(manifestPath, JSON.stringify(manifest));
    return { vueDir, vueCoreDir, manifestPath };
  }

  it("reads both peer ranges and the manifest's vue entry", () => {
    const paths = fixture({ vue: "^3.5.2" }, { vue: "^3.5.1" }, [
      { framework: "react", frameworkVersionRange: "^19.0.0" },
      { framework: "vue", frameworkVersionRange: "^3.5.0" },
    ]);
    expect(readVueFloorRanges(paths)).toEqual(ranges("^3.5.2", "^3.5.1", "^3.5.0"));
  });

  it("reports missing peer ranges and a missing vue manifest entry as undefined", () => {
    const paths = fixture(undefined, {}, [
      { framework: "angular", frameworkVersionRange: "^21.0.7" },
    ]);
    expect(readVueFloorRanges(paths)).toEqual(ranges(undefined, undefined, undefined));
  });

  it("the repository's real floor statements agree", () => {
    const repo = join(__dirname, "..", "..", "..");
    const real = readVueFloorRanges({
      vueDir: join(repo, "packages", "vue"),
      vueCoreDir: join(repo, "packages", "vue-core"),
      manifestPath: join(repo, "docs", "architecture", "compatibility-manifest.json"),
    });
    expect(() => resolveVueFloor(real)).not.toThrow();
  });
});
