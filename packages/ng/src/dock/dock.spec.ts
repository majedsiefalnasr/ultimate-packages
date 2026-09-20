import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UDock } from "./dock";
import type { UMenuItem } from "@ultimate/ng-core";

describe("UDock", () => {
  const items: UMenuItem[] = [
    { label: "Finder", icon: "pi pi-search" },
    { label: "Mail", icon: "pi pi-envelope" },
    { label: "Trash", icon: "pi pi-trash" },
  ];

  function setup(model: UMenuItem[] = items) {
    const fixture = TestBed.createComponent(UDock);
    fixture.componentRef.setInput("model", model);
    fixture.detectChanges();
    return fixture;
  }

  it("renders one menuitem per model entry", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(3);
  });

  it("marks the hovered item active via data-u-active on mouseenter", () => {
    const fixture = setup();
    const links = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    expect(links[1].getAttribute("data-u-active")).toBe("false");
    links[1].dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    expect(links[1].getAttribute("data-u-active")).toBe("true");
  });

  it("clears the active item on list mouseleave", () => {
    const fixture = setup();
    const links = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    links[0].dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    links[0].dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    fixture.detectChanges();
    expect(links[0].getAttribute("data-u-active")).toBe("false");
  });

  it("applies the position class (default bottom)", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector(".u-dock-bottom")).not.toBeNull();
  });

  it("applies a non-default position class", () => {
    const fixture = TestBed.createComponent(UDock);
    fixture.componentRef.setInput("model", items);
    fixture.componentRef.setInput("position", "left");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-dock-left")).not.toBeNull();
  });

  it("emits onItemSelect and invokes item.command on click", () => {
    let called = false;
    const model: UMenuItem[] = [{ label: "Trash", command: () => (called = true) }];
    const fixture = setup(model);
    let emitted: unknown;
    fixture.componentInstance.onItemSelect.subscribe((e: unknown) => (emitted = e));
    fixture.nativeElement.querySelector("a").click();
    expect(emitted).toBeDefined();
    expect(called).toBe(true);
  });

  it("skips items with visible: false", () => {
    const model: UMenuItem[] = [{ label: "One" }, { label: "Hidden", visible: false }];
    const fixture = setup(model);
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(1);
  });
});
