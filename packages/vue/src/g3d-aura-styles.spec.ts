import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { h, nextTick, type VNode } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { vueCoreStyleSheet } from "@ultimate/vue-core";
import { UConfirmDialog } from "./confirm-dialog";
import { UConfirmPopup } from "./confirm-popup";
import { UDrawer } from "./drawer";
import { UPopover } from "./popover";
import { USplitButton } from "./split-button";
import { USpeedDial } from "./speed-dial";

/** GAP-064 G3-D (Spec §9.5 AC1, AC2). No unresolved reference is allowed. */
const KEY_ATTR = "data-u-style";
const ITEMS = {
  model: [
    { label: "Add", icon: "pi pi-plus" },
    { label: "Delete", disabled: true },
  ],
};
const CASES: { key: string; node: () => VNode }[] = [
  { key: "confirmdialog", node: () => h(UConfirmDialog) },
  { key: "confirmpopup", node: () => h(UConfirmPopup) },
  { key: "drawer", node: () => h(UDrawer, { header: "Menu" }) },
  { key: "popover", node: () => h(UPopover) },
  { key: "splitbutton", node: () => h(USplitButton, { label: "Save", ...ITEMS }) },
  { key: "speeddial", node: () => h(USpeedDial, { icon: "pi pi-plus", ...ITEMS }) },
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
  return [...refs].filter((n) => !defined.has(n)).sort();
}

describe("GAP-064 G3-D — Vue", () => {
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
