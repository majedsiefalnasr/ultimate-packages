import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  COUNTS,
  FRAMEWORK_KEYS,
  KEYS,
  REPO,
  RETAINED,
  actualCssText,
  actualRules,
  declarations,
  expected,
  expectedCss,
  norm,
} from "./utils/g3a-port.mjs";
import fixture from "./fixtures/primeuix-styles-g3a.json";

/**
 * GAP-064 G3-A C3 (Spec §8, §13.6 A–F): every one of the 27 framework style
 * files (13 Angular + 14 Vue) contains exactly the ported, keyframe, adapted
 * and retained rules derived from the committed @primeuix/styles 2.0.3 fixture
 * of the 14 unique Aura keys — nothing more, nothing less.
 */
const CASES = (["ng", "vue"] as const).flatMap((fw) =>
  (FRAMEWORK_KEYS[fw] as string[]).map((key) => ({ fw, key }))
);

describe("G3-A upstream fixture", () => {
  it("covers the 14 unique G3-A keys and records its source", () => {
    expect(Object.keys(fixture.modules).sort()).toEqual([...KEYS].sort());
    expect(fixture._meta.source).toContain("@primeuix/styles@2.0.3");
  });

  it("pins the Spec §4.4 group counts", () => {
    for (const key of KEYS) {
      const e = expected(key);
      expect([e.ported.length + e.adapted.length, e.omitted.length], key).toEqual(COUNTS[key]);
    }
  });

  it("canonical order is upstream source order (Plan Review correction 3)", () => {
    for (const key of KEYS) {
      const e = expected(key);
      // `ordered` holds exactly the categorised groups, nothing more ...
      expect([...e.ordered].sort(), key).toEqual(
        [...e.ported, ...e.adapted, ...e.keyframes].sort()
      );
      // ... and every entry keeps its upstream position: source indices strictly increase.
      expect(e.upstreamIndex.length, key).toBe(e.ordered.length);
      e.upstreamIndex.forEach((idx: number, i: number) => {
        if (i > 0) expect(idx, `${key} entry ${i}`).toBeGreaterThan(e.upstreamIndex[i - 1]);
      });
    }
  });

  it("appended retained rules never redeclare a property of an upstream-derived rule on the same selector", () => {
    for (const key of KEYS) {
      const upstream = expected(key)
        .ordered.filter((r) => !r.startsWith("@"))
        .map(declarations);
      for (const retained of (RETAINED[key] ?? []).map(norm).map(declarations)) {
        const clash = upstream
          .filter((u) => u.selector === retained.selector)
          .flatMap((u) => u.props.filter((p) => retained.props.includes(p)));
        expect(clash, `${key} ${retained.selector}`).toEqual([]);
      }
    }
  });

  const vendor = join(REPO, ".vendor-extracted/uix-styles-full/src");
  describe.skipIf(!existsSync(vendor))("fixture vs .vendor-extracted source", () => {
    it.each(KEYS)("%s matches the vendored source", (key) => {
      const src = readFileSync(join(vendor, key, "index.ts"), "utf8");
      const css = (src.match(/\/\*css\*\/\s*`([\s\S]*?)`/) ?? [])[1] ?? "";
      expect(norm(css)).toBe(norm((fixture.modules as Record<string, string>)[key]));
    });
  });
});

describe.each(CASES)("$fw $key style module (C3)", ({ fw, key }) => {
  it("contains exactly the upstream-ordered port followed by the retained rules", () => {
    expect(actualRules(fw, key)).toEqual(expectedCss(key));
  });

  it("keeps no upstream p- name and no invented --u- variable outside the retained rules", () => {
    const css = norm(actualCssText(fw, key));
    expect(css).not.toMatch(/\bp-[a-z]/);
    const retained = (RETAINED[key] ?? []).join(" ");
    expect(retained).not.toMatch(/var\(/);
    expect(css).not.toMatch(/var\(--u-/); // ported CSS uses dt(); raw var() names are gone
  });

  it("ported structural CSS references at least one own token (C2 own-token invariant)", () => {
    const e = expected(key);
    expect([...e.ported, ...e.adapted].join(" ")).toContain(`dt('${key}.`);
  });
});
