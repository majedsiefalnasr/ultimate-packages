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
});
