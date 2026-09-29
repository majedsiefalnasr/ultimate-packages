import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
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
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
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
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
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

  describe("keyboard navigation (Spec §5.4, GAP-055)", () => {
    it("ArrowRight/ArrowLeft move focus among dock items", () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(UDock);
      fixture.componentRef.setInput("model", [{ label: "Finder" }, { label: "Mail" }]);
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
      expect(document.activeElement).toBe(items[1]);
    });

    it("ArrowLeft wraps from the first item to the last", () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(UDock);
      fixture.componentRef.setInput("model", [{ label: "Finder" }, { label: "Mail" }]);
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft", bubbles: true }));
      expect(document.activeElement).toBe(items[1]);
    });

    it("Home/End jump to the first/last item", () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(UDock);
      fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B" }, { label: "C" }]);
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[1].focus();
      items[1].dispatchEvent(new KeyboardEvent("keydown", { code: "End", bubbles: true }));
      expect(document.activeElement).toBe(items[2]);
    });

    it("uses ArrowUp/ArrowDown instead when position is left or right", () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(UDock);
      fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B" }]);
      fixture.componentRef.setInput("position", "left");
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
      expect(document.activeElement).toBe(items[1]);
    });

    it("ArrowRight/ArrowLeft do nothing when position is left or right", () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(UDock);
      fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B" }]);
      fixture.componentRef.setInput("position", "right");
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
      expect(document.activeElement).toBe(items[0]);
    });

    it("skips disabled items when moving focus", () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(UDock);
      fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }]);
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
      expect(document.activeElement).toBe(items[2]);
    });

    it("resolves the correct target when a hidden item precedes it (GAP-054 lesson applied proactively)", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "Hidden", visible: false }, { label: "B" }, { label: "C" }];
      const fixture = setup(model);
      const items = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
      // Rendered items are [A, B, C] (Hidden renders no <a>).
      expect(items.length).toBe(3);
      items[1].focus(); // "B", model index 2.
      items[1].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
      expect(document.activeElement).toBe(items[2]); // "C", not stuck or misrouted.
    });
  });

  describe("routerLink (GAP-069)", () => {
    function setupRouterLink(model: UMenuItem[]) {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(UDock);
      fixture.componentRef.setInput("model", model);
      fixture.detectChanges();
      return fixture;
    }

    it("binds routerLink when an item has one, omitting href", () => {
      const fixture = setupRouterLink([{ label: "A", routerLink: "/a" }]);
      const link = fixture.nativeElement.querySelector("a");
      expect(link.getAttribute("href")).toBe("/a"); // RouterLink sets href itself when rendered with RouterModule's test harness
    });

    it("does not bind routerLink when the item is disabled", () => {
      const fixture = setupRouterLink([{ label: "A", routerLink: "/a", disabled: true }]);
      const link = fixture.nativeElement.querySelector("a");
      expect(link.getAttribute("href")).not.toBe("/a");
    });

    it("falls back to url/# href when no routerLink is set", () => {
      const fixture = setupRouterLink([{ label: "A" }]);
      expect(fixture.nativeElement.querySelector("a").getAttribute("href")).toBe("#");
    });
  });
});
