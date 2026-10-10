import { PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UCarousel } from "./carousel";
import { UGalleria } from "./galleria";
import { UImage } from "./image";
import { UImageCompare } from "./image-compare";

/**
 * GAP-064 G3-E (Plan Task 6: Aura keys and token resolution). Fresh document per mount under a server
 * PLATFORM_ID, as G3-A..G3-C2. No unresolved reference is allowed.
 */
const KEY_ATTR = "data-u-ng-style";
const CASES: { key: string; type: Type<unknown>; inputs: Record<string, unknown> }[] = [
  { key: "image", type: UImage, inputs: { src: "/media/landscape-1.png" } },
  { key: "imagecompare", type: UImageCompare, inputs: {} },
  { key: "carousel", type: UCarousel, inputs: { value: ["Item 1", "Item 2", "Item 3"] } },
  {
    key: "galleria",
    type: UGalleria,
    inputs: { value: ["/media/landscape-1.png", "/media/landscape-2.png"] },
  },
];

function mount(type: Type<unknown>, inputs: Record<string, unknown>) {
  TestBed.resetTestingModule();
  const doc = document.implementation.createHTMLDocument("g3e");
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: "server" },
    ],
  });
  const fixture = TestBed.createComponent(type);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  return { doc };
}
const styles = (doc: Document) =>
  Array.from(doc.head.querySelectorAll<HTMLStyleElement>(`style[${KEY_ATTR}]`));
const count = (doc: Document, key: string) =>
  styles(doc).filter((s) => s.getAttribute(KEY_ATTR) === key).length;
const cssFor = (doc: Document, key: string) =>
  styles(doc)
    .filter((s) => s.getAttribute(KEY_ATTR) === key)
    .map((s) => s.textContent ?? "")
    .join("\n");
function unresolved(doc: Document, key: string): string[] {
  const refs = new Set(
    Array.from(cssFor(doc, key).matchAll(/var\(\s*(--u-[a-z0-9-]+)/g), (m) => m[1])
  );
  const all = styles(doc)
    .map((s) => s.textContent ?? "")
    .join("\n");
  const defined = new Set(Array.from(all.matchAll(/(--u-[a-z0-9-]+)\s*:/g), (m) => m[1]));
  // E-1 §5 / X-4: scope.x is runtime state with an upstream 50% fallback, not a preset token.
  const hasInitialClip = cssFor(doc, key).includes("var(--u-imagecompare-scope-x, 50%)");
  return [...refs]
    .filter((n) => !defined.has(n) && !(n === "--u-imagecompare-scope-x" && hasInitialClip))
    .sort();
}

describe("GAP-064 G3-E — Angular", () => {
  beforeAll(() => applyUltimateTheme());

  describe.each(CASES)("$key", (c) => {
    it("registers under the Aura key (AC1)", () => {
      const { doc } = mount(c.type, c.inputs);
      expect(count(doc, c.key)).toBe(1);
      expect(count(doc, `${c.key}-variables`)).toBe(1);
      expect(cssFor(doc, `${c.key}-variables`)).toContain(`--u-${c.key}-`);
    });

    it("resolves every variable (AC2)", () => {
      const { doc } = mount(c.type, c.inputs);
      expect(unresolved(doc, c.key)).toEqual([]);
      expect(cssFor(doc, c.key)).toContain(`var(--u-${c.key}-`);
    });
  });
});
