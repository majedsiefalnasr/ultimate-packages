import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { h, nextTick, type VNode } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { vueCoreStyleSheet } from "@ultimate/vue-core";
import { UCarousel } from "./carousel";
import { UGalleria } from "./galleria";
import { UImage } from "./image";
import { UImageCompare } from "./image-compare";
import { UOrderList } from "./order-list";
import { UPickList } from "./pick-list";

/** GAP-064 G3-E (Plan Task 6: Aura keys and token resolution). No unresolved reference is allowed. */
const KEY_ATTR = "data-u-style";
const CASES: { key: string; node: () => VNode }[] = [
  { key: "image", node: () => h(UImage, { src: "/media/landscape-1.png" }) },
  { key: "imagecompare", node: () => h(UImageCompare) },
  { key: "carousel", node: () => h(UCarousel, { value: ["Item 1", "Item 2", "Item 3"] }) },
  {
    key: "galleria",
    node: () => h(UGalleria, { value: ["/media/landscape-1.png", "/media/landscape-2.png"] }),
  },
  { key: "orderlist", node: () => h(UOrderList, { modelValue: ["Apple", "Banana", "Cherry"] }) },
  {
    key: "picklist",
    node: () => h(UPickList, { modelValue: [["Apple", "Banana"], ["Cherry"]] }),
  },
];

async function render(node: () => VNode) {
  mount({ render: node });
  await nextTick();
  await nextTick();
}
const styles = () =>
  Array.from(document.head.querySelectorAll<HTMLStyleElement>(`style[${KEY_ATTR}]`));
const count = (key: string) => styles().filter((s) => s.getAttribute(KEY_ATTR) === key).length;
const cssFor = (key: string) =>
  styles()
    .filter((s) => s.getAttribute(KEY_ATTR) === key)
    .map((s) => s.textContent ?? "")
    .join("\n");
function unresolved(key: string): string[] {
  const refs = new Set(Array.from(cssFor(key).matchAll(/var\(\s*(--u-[a-z0-9-]+)/g), (m) => m[1]));
  const all = styles()
    .map((s) => s.textContent ?? "")
    .join("\n");
  const defined = new Set(Array.from(all.matchAll(/(--u-[a-z0-9-]+)\s*:/g), (m) => m[1]));
  // E-1 §5 / X-4: scope.x is runtime state with an upstream 50% fallback, not a preset token.
  const hasInitialClip = cssFor(key).includes("var(--u-imagecompare-scope-x, 50%)");
  return [...refs]
    .filter((n) => !defined.has(n) && !(n === "--u-imagecompare-scope-x" && hasInitialClip))
    .sort();
}

describe("GAP-064 G3-E — Vue", () => {
  beforeAll(() => applyUltimateTheme());
  enableAutoUnmount(afterEach);
  beforeEach(() => {
    vueCoreStyleSheet.clear();
    styles().forEach((s) => s.remove());
  });

  describe.each(CASES)("$key", (c) => {
    it("registers under the Aura key (AC1)", async () => {
      await render(c.node);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
    });

    it("resolves every variable (AC2)", async () => {
      await render(c.node);
      expect(unresolved(c.key)).toEqual([]);
      expect(cssFor(c.key)).toContain(`var(--u-${c.key}-`);
    });
  });
});
