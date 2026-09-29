import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { USpeedDial } from "./speed-dial";
import type { UMenuItem } from "@ultimate/ng-core";

describe("USpeedDial", () => {
  const items: UMenuItem[] = [{ label: "Add", icon: "pi pi-plus" }, { label: "Edit", icon: "pi pi-pencil" }, { label: "Delete", icon: "pi pi-trash" }];

  function setup(model: UMenuItem[] = items) {
    const fixture = TestBed.createComponent(USpeedDial);
    fixture.componentRef.setInput("model", model);
    fixture.detectChanges();
    return fixture;
  }

  it("renders collapsed by default (aria-expanded false)", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector("button").getAttribute("aria-expanded")).toBe("false");
  });

  it("renders one menuitem action button per model entry", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(3);
  });

  it("expands on toggle-button click", () => {
    const fixture = setup();
    fixture.nativeElement.querySelector("button").click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("button").getAttribute("aria-expanded")).toBe("true");
  });

  it("collapses on a second toggle-button click", () => {
    const fixture = setup();
    const toggle = fixture.nativeElement.querySelector("button");
    toggle.click();
    fixture.detectChanges();
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("show()/hide() toggle visibility and emit onShow/onHide", () => {
    const fixture = setup();
    let shown = false;
    let hidden = false;
    fixture.componentInstance.onShow.subscribe(() => (shown = true));
    fixture.componentInstance.onHide.subscribe(() => (hidden = true));
    fixture.componentInstance.show();
    fixture.detectChanges();
    expect(shown).toBe(true);
    fixture.componentInstance.hide();
    fixture.detectChanges();
    expect(hidden).toBe(true);
  });

  it("clicking an action item invokes its command and collapses the dial", () => {
    let called = false;
    const model: UMenuItem[] = [{ label: "Delete", command: () => (called = true) }];
    const fixture = setup(model);
    fixture.componentInstance.show();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[role="menuitem"]').click();
    fixture.detectChanges();
    expect(called).toBe(true);
    expect(fixture.nativeElement.querySelector("button").getAttribute("aria-expanded")).toBe("false");
  });

  it("hides on Escape when closeOnEscape (default) and visible", () => {
    const fixture = setup();
    fixture.componentInstance.show();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("button").getAttribute("aria-expanded")).toBe("false");
  });

  it("disabled action items are not clickable (button disabled attribute set)", () => {
    const model: UMenuItem[] = [{ label: "Delete", disabled: true }];
    const fixture = setup(model);
    fixture.componentInstance.show();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menuitem"]').disabled).toBe(true);
  });

  describe("keyboard navigation between action items (Spec §5.5, GAP-056)", () => {
    it("ArrowDown/ArrowUp move focus among action items once open", () => {
      const fixture = TestBed.createComponent(USpeedDial);
      fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B" }]);
      fixture.detectChanges();
      fixture.componentInstance.show();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
      expect(document.activeElement).toBe(items[1]);
    });

    it("ArrowUp wraps from the first item to the last", () => {
      const fixture = setup([{ label: "A" }, { label: "B" }]);
      fixture.componentInstance.show();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp", bubbles: true }));
      expect(document.activeElement).toBe(items[1]);
    });

    it("uses ArrowRight/ArrowLeft instead when direction is left or right", () => {
      const fixture = setup([{ label: "A" }, { label: "B" }]);
      fixture.componentRef.setInput("direction", "right");
      fixture.detectChanges();
      fixture.componentInstance.show();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
      expect(document.activeElement).toBe(items[1]);
    });

    it("ArrowDown/ArrowUp do nothing when direction is left or right", () => {
      const fixture = setup([{ label: "A" }, { label: "B" }]);
      fixture.componentRef.setInput("direction", "left");
      fixture.detectChanges();
      fixture.componentInstance.show();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
      expect(document.activeElement).toBe(items[0]);
    });

    it("skips disabled items when moving focus", () => {
      const fixture = setup([{ label: "A" }, { label: "B", disabled: true }, { label: "C" }]);
      fixture.componentInstance.show();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
      expect(document.activeElement).toBe(items[2]);
    });

    it("skips a hidden item (visible: false) when moving focus (GAP-054/055 lesson applied proactively)", () => {
      // SpeedDial keeps a `[role=menuitem]` button in the DOM for every model
      // entry even when `visible: false` (hidden via CSS `visibility: hidden`,
      // per speed-dial-style.ts's `.u-speeddial-item-hidden` rule, not by
      // omitting the element) — unlike UDock, which never renders an `<a>`
      // for a hidden item. So the DOM-links array here is NOT already a
      // "rendered subset"; navigation must skip hidden items explicitly.
      const model: UMenuItem[] = [{ label: "A" }, { label: "Hidden", visible: false }, { label: "B" }, { label: "C" }];
      const fixture = setup(model);
      fixture.componentInstance.show();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
      expect(items.length).toBe(4); // All 4 buttons render; "Hidden" is CSS-hidden only.
      items[0].focus(); // "A", model index 0.
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
      expect(document.activeElement).toBe(items[2]); // "B", skipping hidden "Hidden".
    });

    it("existing Escape-to-close behavior is unaffected", () => {
      // Adapted from the brief's literal test: `visible` is a `protected` signal
      // (not accessible from the spec at the type level), so this asserts the
      // same collapse via the toggle button's `aria-expanded`, exactly as the
      // pre-existing "hides on Escape" spec above already does.
      const fixture = TestBed.createComponent(USpeedDial);
      fixture.componentRef.setInput("model", [{ label: "A" }]);
      fixture.detectChanges();
      fixture.componentInstance.show();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector("button").getAttribute("aria-expanded")).toBe("true");
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector("button").getAttribute("aria-expanded")).toBe("false");
    });
  });
});
