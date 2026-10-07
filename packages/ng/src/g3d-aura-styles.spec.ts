import { PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UConfirmDialog } from "./confirm-dialog";
import { UConfirmPopup } from "./confirm-popup";
import { UDrawer } from "./drawer";
import { UPopover } from "./popover";
import { USplitButton } from "./split-button";
import { USpeedDial } from "./speed-dial";

/**
 * GAP-064 G3-D (Spec §9.5 AC1, AC2). Fresh document per mount under a server
 * PLATFORM_ID, as G3-A..G3-C2. No unresolved reference is allowed.
 */
const KEY_ATTR = "data-u-ng-style";
const ITEMS = {
  model: [
    { label: "Add", icon: "pi pi-plus" },
    { label: "Delete", disabled: true },
  ],
};
const CASES: { key: string; type: Type<unknown>; inputs: Record<string, unknown> }[] = [
  { key: "confirmdialog", type: UConfirmDialog, inputs: {} },
  { key: "confirmpopup", type: UConfirmPopup, inputs: {} },
  { key: "drawer", type: UDrawer, inputs: { header: "Menu" } },
  { key: "popover", type: UPopover, inputs: {} },
  { key: "splitbutton", type: USplitButton, inputs: { label: "Save", ...ITEMS } },
  { key: "speeddial", type: USpeedDial, inputs: { icon: "pi pi-plus", ...ITEMS } },
];

function mount(type: Type<unknown>, inputs: Record<string, unknown>) {
  TestBed.resetTestingModule();
  const doc = document.implementation.createHTMLDocument("g3d");
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]), // SplitButton composes UMenu, whose template binds [routerLink]
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
  return [...refs].filter((n) => !defined.has(n)).sort();
}

describe("GAP-064 G3-D — Angular", () => {
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
