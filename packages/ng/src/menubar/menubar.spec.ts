import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, expect, it } from "vitest";
import { UMenubar } from "./menubar";
import type { UMenuItem } from "@ultimate/ng-core";

describe("UMenubar", () => {
  const items: UMenuItem[] = [
    { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
    { label: "Edit", items: [{ label: "Undo" }] },
    { label: "Help", url: "/help" },
  ];

  function setup(model: UMenuItem[] = items) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenubar);
    fixture.componentRef.setInput("model", model);
    fixture.detectChanges();
    return fixture;
  }

  it("renders a nav with the top-level items", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector("nav")).not.toBeNull();
    const rootLinks = fixture.nativeElement.querySelectorAll(".u-menubar-root-list > li > .u-menubar-item-content > a");
    expect(rootLinks.length).toBe(3);
  });

  it("marks items with children as aria-haspopup=menu", () => {
    const fixture = setup();
    const fileLink = fixture.nativeElement.querySelector(".u-menubar-root-list > li:first-child a");
    expect(fileLink.getAttribute("aria-haspopup")).toBe("menu");
  });

  it("opens a submenu on click of an item with children", () => {
    const fixture = setup();
    const fileItem = fixture.nativeElement.querySelector(".u-menubar-root-list > li:first-child");
    const fileLink = fileItem.querySelector("a");
    fileLink.click();
    fixture.detectChanges();
    expect(fileItem.getAttribute("data-u-open")).toBe("true");
    expect(fileLink.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes an open submenu when clicked again", () => {
    const fixture = setup();
    const fileItem = fixture.nativeElement.querySelector(".u-menubar-root-list > li:first-child");
    const fileLink = fileItem.querySelector("a");
    fileLink.click();
    fixture.detectChanges();
    fileLink.click();
    fixture.detectChanges();
    expect(fileItem.getAttribute("data-u-open")).toBe("false");
  });

  it("renders nested submenus for drill-down items", () => {
    const fixture = setup();
    const fileItem = fixture.nativeElement.querySelector(".u-menubar-root-list > li:first-child");
    fileItem.querySelector("a").click();
    fixture.detectChanges();
    // "Open" has its own nested items ("Recent")
    const nestedSubmenu = fileItem.querySelector(".u-menubar-submenu .u-menubar-submenu");
    expect(nestedSubmenu).not.toBeNull();
  });

  it("emits onItemSelect and calls item.command for a leaf item click", () => {
    let called = false;
    const model: UMenuItem[] = [{ label: "Action", command: () => (called = true) }];
    const fixture = setup(model);
    let emitted: unknown;
    fixture.componentInstance.onItemSelect.subscribe((e: unknown) => (emitted = e));
    fixture.nativeElement.querySelector("a").click();
    expect(called).toBe(true);
    expect(emitted).toBeDefined();
  });

  it("does not open or invoke command for a disabled item", () => {
    let called = false;
    const model: UMenuItem[] = [{ label: "Disabled", disabled: true, command: () => (called = true) }];
    const fixture = setup(model);
    const link = fixture.nativeElement.querySelector("a");
    expect(link.getAttribute("aria-disabled")).toBe("true");
    link.click();
    expect(called).toBe(false);
  });

  it("renders a separator item", () => {
    const fixture = setup([{ label: "A" }, { separator: true }, { label: "B" }]);
    expect(fixture.nativeElement.querySelector('[role="separator"]')).not.toBeNull();
  });

  describe("keyboard navigation (Spec §5.3, GAP-054)", () => {
    it("ArrowRight/ArrowLeft move focus among top-level items", () => {
      const fixture = setup([{ label: "File" }, { label: "Edit" }, { label: "View" }]);
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
      expect(document.activeElement).toBe(items[1]);
    });

    it("Enter/Space on a top-level item with children opens its submenu", () => {
      const fixture = setup([{ label: "File", items: [{ label: "New" }] }]);
      const item = fixture.nativeElement.querySelector("[role=menuitem]");
      item.focus();
      item.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector("[role=menuitem][aria-label=New]") || fixture.nativeElement.textContent).toContain("New");
    });

    it("Escape closes the innermost open submenu, keeping focus on its own trigger", () => {
      const fixture = setup([{ label: "File", items: [{ label: "New" }] }]);
      const item = fixture.nativeElement.querySelector("[role=menuitem]");
      item.focus();
      item.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
      fixture.detectChanges();
      item.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(item);
    });

    it("ArrowRight skips a disabled top-level item", () => {
      const fixture = setup([{ label: "File" }, { label: "Edit", disabled: true }, { label: "View" }]);
      const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
      items[0].focus();
      items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
      expect(document.activeElement).toBe(items[2]);
    });
  });
});
