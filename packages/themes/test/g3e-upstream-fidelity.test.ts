import { describe, expect, it } from "vitest";
import {
  COUNTS,
  FIXTURE,
  KEYS,
  NG_LOCAL,
  PORTED,
  actualCssText,
  expectedCss,
  norm,
  parseGroups,
} from "./utils/g3e-port.mjs";

/**
 * GAP-064 G3-E (Spec §6–§8): the committed upstream fixtures, and for every ported key the
 * generated CSS equals the shipped style module. Per-batch literal counts are appended when
 * each batch is ported (Plan Tasks 6, 9, 12, 15).
 */
describe("G3-E upstream fixture and data model", () => {
  it("covers the 8 G3-E keys plus base and records its source", () => {
    expect(Object.keys(FIXTURE.modules).sort()).toEqual([...KEYS, "base"].sort());
    expect(FIXTURE._meta.source).toContain("@primeuix/styles@2.0.3");
  });

  it("records the PrimeNG-local CSS (OI-E1) for every key", () => {
    expect(Object.keys(NG_LOCAL.modules).sort()).toEqual([...KEYS].sort());
    expect(NG_LOCAL._meta.source).toContain("primeng@21.1.9");
  });

  it.each(["ng", "vue"] as const)(
    "%s: every ported style module equals its generated css",
    (fw) => {
      for (const key of PORTED as string[]) {
        if (fw === "ng" && key === "organizationchart") continue;
        const shipped = parseGroups(actualCssText(fw, key)).map(
          (g: { head: string; body: string }) => norm(`${g.head}{${g.body}}`)
        );
        expect(shipped, `${fw}/${key}`).toEqual(expectedCss(fw, key));
      }
    }
  );
});

const E1_COUNTS = { image: [16, 12], imagecompare: [12, 12] };
it("E-1 counts are the approved record's literals", () => {
  expect({ image: COUNTS.image, imagecompare: COUNTS.imagecompare }).toEqual(E1_COUNTS);
});
