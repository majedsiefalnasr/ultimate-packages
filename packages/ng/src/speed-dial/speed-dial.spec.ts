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
});
