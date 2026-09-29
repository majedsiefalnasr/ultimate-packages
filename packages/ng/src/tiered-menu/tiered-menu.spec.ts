import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, expect, it } from "vitest";
import { UTieredMenu } from "./tiered-menu";
import type { UMenuItem } from "@ultimate/ng-core";

describe("UTieredMenu", () => {
  const items: UMenuItem[] = [
    { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
    { label: "Edit" },
  ];

  function setup(model: UMenuItem[] = items, popup = false) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UTieredMenu);
    fixture.componentRef.setInput("model", model);
    fixture.componentRef.setInput("popup", popup);
    fixture.detectChanges();
    return fixture;
  }

  it('renders role="menu" and root-level items when inline (popup: false)', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBeGreaterThanOrEqual(2);
  });

  it("does not render its content when popup: true and not yet shown", () => {
    const fixture = setup(items, true);
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  it("renders its content after show() is called for a popup menu", () => {
    const fixture = setup(items, true);
    fixture.componentInstance.show();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
  });

  it("hides after hide() is called", () => {
    const fixture = setup(items, true);
    fixture.componentInstance.show();
    fixture.detectChanges();
    fixture.componentInstance.hide();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  it("toggle() flips visibility", () => {
    const fixture = setup(items, true);
    fixture.componentInstance.toggle();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
    fixture.componentInstance.toggle();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  it("hides on Escape when popup and visible", () => {
    const fixture = setup(items, true);
    fixture.componentInstance.show();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  it("opens a nested submenu on hover of a group item", () => {
    const fixture = setup();
    const fileItem = fixture.nativeElement.querySelector('[role="menuitem"]');
    fileItem.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    expect(fileItem.getAttribute("data-u-open")).toBe("true");
  });

  it("renders drill-down (doubly-nested) submenus", () => {
    const fixture = setup();
    const fileItem = fixture.nativeElement.querySelector('[role="menuitem"]');
    fileItem.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const nestedSubmenu = fixture.nativeElement.querySelector(".u-tieredmenu-submenu .u-tieredmenu-submenu");
    expect(nestedSubmenu).not.toBeNull();
  });

  it("emits onItemSelect and closes the popup on a leaf item click", () => {
    const fixture = setup([{ label: "Action" }], true);
    fixture.componentInstance.show();
    fixture.detectChanges();
    let emitted: unknown;
    fixture.componentInstance.onItemSelect.subscribe((e: unknown) => (emitted = e));
    fixture.nativeElement.querySelector("a").click();
    fixture.detectChanges();
    expect(emitted).toBeDefined();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  describe("keyboard navigation (Spec §5.3, GAP-054)", () => {
    // TieredMenu uses a single ArrowDown/ArrowUp axis at every level (root and
    // submenu alike) to move between siblings, per real PrimeNG's own
    // TieredMenuSub convention (`onArrowDownKey`/`onArrowUpKey` used
    // unconditionally regardless of level) — unlike Menubar, whose root level
    // is a horizontal menubar (ArrowRight/ArrowLeft) with vertical submenus.
    it("ArrowDown/ArrowUp move focus among top-level items", () => {
      const fixture = setup([{ label: "File" }, { label: "Edit" }, { label: "View" }]);
      const links = fixture.nativeElement.querySelectorAll('[role="menuitem"] > .u-tieredmenu-item-content > a');
      links[0].focus();
      links[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
      expect(document.activeElement).toBe(links[1]);
    });

    it("Enter/Space on a top-level item with children opens its submenu", () => {
      const fixture = setup([{ label: "File", items: [{ label: "New" }] }]);
      const item = fixture.nativeElement.querySelector('[role="menuitem"]');
      const link = item.querySelector('.u-tieredmenu-item-content > a');
      link.focus();
      link.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
      fixture.detectChanges();
      expect(item.getAttribute("data-u-open")).toBe("true");
      expect(link.getAttribute("aria-expanded")).toBe("true");
    });

    it("Escape closes the innermost open submenu, keeping focus on its own trigger", () => {
      const fixture = setup([{ label: "File", items: [{ label: "New" }] }]);
      const item = fixture.nativeElement.querySelector('[role="menuitem"]');
      const link = item.querySelector('.u-tieredmenu-item-content > a');
      link.focus();
      link.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
      fixture.detectChanges();
      link.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
      fixture.detectChanges();
      expect(item.getAttribute("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(link);
    });

    it("ArrowDown skips a disabled top-level item", () => {
      const fixture = setup([{ label: "File" }, { label: "Edit", disabled: true }, { label: "View" }]);
      const links = fixture.nativeElement.querySelectorAll('[role="menuitem"] > .u-tieredmenu-item-content > a');
      links[0].focus();
      links[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
      expect(document.activeElement).toBe(links[2]);
    });
  });
});
