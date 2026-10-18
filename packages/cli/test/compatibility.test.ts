import { describe, it, expect } from "vitest";

import { matchCompatibility, type CompatibilityEntry } from "../src/compatibility.js";

/** A fully-populated entry mirroring the real manifest's angular record. */
const angularEntry: CompatibilityEntry = {
  framework: "angular",
  frameworkVersionRange: "^21.2.22",
  ultimateFrameworkPackage: { name: "@ultimate/ng", versionRange: "^0.1.0" },
  uixVersionRange: "^0.1.0",
  themeVersionRange: "^0.1.0",
  metadataSchemaVersion: "1.0.0",
  cliVersionRange: "^0.1.0",
};

const reactEntry: CompatibilityEntry = {
  framework: "react",
  frameworkVersionRange: "^17.0.0 || ^18.0.0 || ^19.0.0",
  ultimateFrameworkPackage: { name: "@ultimate/react", versionRange: "^0.1.0" },
  uixVersionRange: "^0.1.0",
  themeVersionRange: "^0.1.0",
  metadataSchemaVersion: "1.0.0",
  cliVersionRange: "^0.1.0",
};

const manifest: CompatibilityEntry[] = [angularEntry, reactEntry];

describe("matchCompatibility", () => {
  it("matches when every populated axis satisfies its declared constraint", () => {
    const result = matchCompatibility(
      {
        framework: "angular",
        frameworkVersion: "21.2.22",
        ultimateFrameworkPackageVersion: "0.1.0",
        uixVersion: "0.1.0",
        themeVersion: "0.1.0",
        metadataSchemaVersion: "1.0.0",
        cliVersion: "0.1.0",
      },
      manifest
    );

    expect(result).toEqual({ matched: true, entry: angularEntry });
  });

  it("refuses with a reason naming frameworkVersionRange when only that axis mismatches", () => {
    const result = matchCompatibility(
      {
        framework: "angular",
        frameworkVersion: "20.0.0",
        ultimateFrameworkPackageVersion: "0.1.0",
        uixVersion: "0.1.0",
        themeVersion: "0.1.0",
        metadataSchemaVersion: "1.0.0",
        cliVersion: "0.1.0",
      },
      manifest
    );

    expect(result.matched).toBe(false);
    expect(result.matched === false && result.reason).toMatch(/frameworkVersionRange/);
  });

  it("refuses on metadataSchemaVersion exact-mismatch, distinguished as an exact-match failure", () => {
    const result = matchCompatibility(
      {
        framework: "angular",
        frameworkVersion: "21.2.22",
        ultimateFrameworkPackageVersion: "0.1.0",
        uixVersion: "0.1.0",
        themeVersion: "0.1.0",
        metadataSchemaVersion: "1.0.1",
        cliVersion: "0.1.0",
      },
      manifest
    );

    expect(result.matched).toBe(false);
    if (result.matched === false) {
      expect(result.reason).toMatch(/metadataSchemaVersion/);
      expect(result.reason).toMatch(/exact/i);
      expect(result.reason).not.toMatch(/range/i);
    }
  });

  it("never treats a range-like metadataSchemaVersion input as a range (literal string compare only)", () => {
    // "^1.0.0" would satisfy a caret-range check against "1.0.0", but
    // metadataSchemaVersion must be compared as a literal string, so this
    // must still fail: "^1.0.0" !== "1.0.0".
    const result = matchCompatibility(
      {
        framework: "angular",
        frameworkVersion: "21.2.22",
        ultimateFrameworkPackageVersion: "0.1.0",
        uixVersion: "0.1.0",
        themeVersion: "0.1.0",
        metadataSchemaVersion: "^1.0.0",
        cliVersion: "0.1.0",
      },
      manifest
    );

    expect(result.matched).toBe(false);
    if (result.matched === false) {
      expect(result.reason).toMatch(/metadataSchemaVersion/);
    }
  });

  it("skips an omitted optional axis as not-applicable, still matching on required axes alone", () => {
    const result = matchCompatibility(
      {
        framework: "angular",
        frameworkVersion: "21.2.22",
        cliVersion: "0.1.0",
        // ultimateFrameworkPackageVersion, uixVersion, themeVersion,
        // metadataSchemaVersion all omitted - not applicable, not failures.
      },
      manifest
    );

    expect(result).toEqual({ matched: true, entry: angularEntry });
  });

  it("refuses with a reason stating no entry exists for a framework absent from the manifest", () => {
    const result = matchCompatibility(
      {
        framework: "vue",
        frameworkVersion: "3.5.0",
        cliVersion: "0.1.0",
      },
      manifest // manifest here only contains angular/react entries
    );

    expect(result.matched).toBe(false);
    if (result.matched === false) {
      expect(result.reason).toMatch(/no entry.*framework.*vue/i);
    }
  });

  it("matches react's ||-of-exact-caret range for a satisfying frameworkVersion", () => {
    const result = matchCompatibility(
      {
        framework: "react",
        frameworkVersion: "18.2.0",
        cliVersion: "0.1.0",
      },
      manifest
    );

    expect(result).toEqual({ matched: true, entry: reactEntry });
  });

  it("refuses react's ||-of-exact-caret range for a version satisfying none of the alternatives", () => {
    const result = matchCompatibility(
      {
        framework: "react",
        frameworkVersion: "16.14.0",
        cliVersion: "0.1.0",
      },
      manifest
    );

    expect(result.matched).toBe(false);
    if (result.matched === false) {
      expect(result.reason).toMatch(/frameworkVersionRange/);
    }
  });

  it("refuses with a reason naming ultimateFrameworkPackage's versionRange axis on mismatch", () => {
    const result = matchCompatibility(
      {
        framework: "angular",
        frameworkVersion: "21.2.22",
        ultimateFrameworkPackageVersion: "0.2.0",
        cliVersion: "0.1.0",
      },
      manifest
    );

    expect(result.matched).toBe(false);
    if (result.matched === false) {
      expect(result.reason).toMatch(/ultimateFrameworkPackage/);
    }
  });

  it("refuses with a reason naming cliVersionRange on mismatch", () => {
    const result = matchCompatibility(
      {
        framework: "angular",
        frameworkVersion: "21.2.22",
        cliVersion: "9.9.9",
      },
      manifest
    );

    expect(result.matched).toBe(false);
    if (result.matched === false) {
      expect(result.reason).toMatch(/cliVersionRange/);
    }
  });

  it("refuses Angular 21.2.21, one patch below the ^21.2.22 floor, naming frameworkVersionRange", () => {
    const result = matchCompatibility(
      { framework: "angular", frameworkVersion: "21.2.21", cliVersion: "0.1.0" },
      manifest
    );

    expect(result.matched).toBe(false);
    if (result.matched === false) {
      expect(result.reason).toMatch(/frameworkVersionRange/);
    }
  });

  it("matches Angular 21.9.0, a later minor inside the ^21.2.22 caret range", () => {
    const result = matchCompatibility(
      { framework: "angular", frameworkVersion: "21.9.0", cliVersion: "0.1.0" },
      manifest
    );

    expect(result).toEqual({ matched: true, entry: angularEntry });
  });

  it("refuses Angular 22.0.0, the next major outside the ^21.2.22 caret range", () => {
    const result = matchCompatibility(
      { framework: "angular", frameworkVersion: "22.0.0", cliVersion: "0.1.0" },
      manifest
    );

    expect(result.matched).toBe(false);
    if (result.matched === false) {
      expect(result.reason).toMatch(/frameworkVersionRange/);
    }
  });

  it("pins existing behaviour for Angular 21.2.22-rc.0: the prerelease suffix is ignored, so it matches ^21.2.22", () => {
    // parseVersion reads only the leading x.y.z, so "21.2.22-rc.0" is treated as
    // "21.2.22". Strict semver would order the prerelease below 21.2.22. This test
    // records today's result; it is not an endorsement of it.
    const result = matchCompatibility(
      { framework: "angular", frameworkVersion: "21.2.22-rc.0", cliVersion: "0.1.0" },
      manifest
    );

    expect(result).toEqual({ matched: true, entry: angularEntry });
  });
});
