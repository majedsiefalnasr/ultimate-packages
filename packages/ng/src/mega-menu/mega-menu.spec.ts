import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, expect, it } from "vitest";
import { UMegaMenu } from "./mega-menu";
import type { UMegaMenuItem } from "./mega-menu-item";

describe("UMegaMenu", () => {
  const items: UMegaMenuItem[] = [
    {
      label: "Products",
      items: [
        [{ label: "Category A", items: [{ label: "Item A1" }, { label: "Item A2" }] }],
        [{ label: "Category B", items: [{ label: "Item B1" }] }],
      ],
    },
    { label: "About", url: "/about" },
  ];

  function setup(model: UMegaMenuItem[] = items) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMegaMenu);
    fixture.componentRef.setInput("model", model);
    fixture.detectChanges();
    return fixture;
  }

  it("renders a menubar of root items", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('[role="menubar"]')).not.toBeNull();
    const rootLinks = fixture.nativeElement.querySelectorAll('.u-megamenu-root-list > li > .u-megamenu-item-content > a');
    expect(rootLinks.length).toBe(2);
  });

  it("marks a column-grid item as aria-haspopup=menu", () => {
    const fixture = setup();
    const productsLink = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child a");
    expect(productsLink.getAttribute("aria-haspopup")).toBe("menu");
  });

  it("opens the multi-column overlay on click", () => {
    const fixture = setup();
    const productsItem = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child");
    productsItem.querySelector("a").click();
    fixture.detectChanges();
    expect(productsItem.getAttribute("data-u-open")).toBe("true");
    const columns = productsItem.querySelectorAll(".u-megamenu-column");
    expect(columns.length).toBe(2);
  });

  it("renders each column's grouped items with a submenu label", () => {
    const fixture = setup();
    const productsItem = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child");
    productsItem.querySelector("a").click();
    fixture.detectChanges();
    const labels = productsItem.querySelectorAll(".u-megamenu-submenu-label");
    expect(Array.from(labels).map((el) => (el as HTMLElement).textContent)).toEqual(["Category A", "Category B"]);
  });

  it("closes the overlay on a second click", () => {
    const fixture = setup();
    const productsItem = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child");
    const link = productsItem.querySelector("a");
    link.click();
    fixture.detectChanges();
    link.click();
    fixture.detectChanges();
    expect(productsItem.getAttribute("data-u-open")).toBe("false");
  });

  it("emits onItemSelect and closes the overlay when a leaf column item is clicked", () => {
    const fixture = setup();
    const productsItem = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child");
    productsItem.querySelector("a").click();
    fixture.detectChanges();
    let emitted: unknown;
    fixture.componentInstance.onItemSelect.subscribe((e: unknown) => (emitted = e));
    const leafLink = productsItem.querySelector(".u-megamenu-submenu a");
    leafLink.click();
    fixture.detectChanges();
    expect(emitted).toBeDefined();
    expect(productsItem.getAttribute("data-u-open")).toBe("false");
  });

  it("does not open or navigate for a disabled root item", () => {
    const fixture = setup([{ label: "Disabled", disabled: true, items: [[{ label: "X", items: [{ label: "Y" }] }]] }]);
    const item = fixture.nativeElement.querySelector(".u-megamenu-root-list > li");
    const link = item.querySelector("a");
    expect(link.getAttribute("aria-disabled")).toBe("true");
    link.click();
    fixture.detectChanges();
    expect(item.getAttribute("data-u-open")).toBe("false");
  });

  describe("keyboard navigation (Spec §5.3, GAP-054)", () => {
    async function flushFocus() {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    it("ArrowRight/ArrowLeft move focus among root items", () => {
      const fixture = setup([{ label: "File" }, { label: "Edit" }, { label: "View" }]);
      const rootItems = fixture.nativeElement.querySelectorAll(".u-megamenu-root-list > li > .u-megamenu-item-content > a");
      rootItems[0].focus();
      rootItems[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
      expect(document.activeElement).toBe(rootItems[1]);
      (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft", bubbles: true }));
      expect(document.activeElement).toBe(rootItems[0]);
    });

    it("ArrowRight skips a disabled root item", () => {
      const fixture = setup([{ label: "File" }, { label: "Edit", disabled: true }, { label: "View" }]);
      const rootItems = fixture.nativeElement.querySelectorAll(".u-megamenu-root-list > li > .u-megamenu-item-content > a");
      rootItems[0].focus();
      rootItems[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
      expect(document.activeElement).toBe(rootItems[2]);
    });

    it("Enter/Space on a column-having item opens it and moves focus to its first leaf item", async () => {
      const fixture = setup();
      const productsLink = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child a");
      productsLink.focus();
      productsLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
      fixture.detectChanges();
      await flushFocus();

      const productsItem = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child");
      expect(productsItem.getAttribute("data-u-open")).toBe("true");
      const firstLeafLink = productsItem.querySelector(".u-megamenu-submenu a");
      expect(document.activeElement).toBe(firstLeafLink);
    });

    it("Escape closes the open overlay from a focused leaf item and returns focus to its trigger", async () => {
      const fixture = setup();
      const productsLink = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child a");
      productsLink.focus();
      productsLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
      fixture.detectChanges();
      await flushFocus();

      const productsItem = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child");
      const leafLink = document.activeElement as HTMLElement;
      expect(productsItem.querySelector(".u-megamenu-submenu a")).toBe(leafLink); // sanity: focus is inside the overlay, not the trigger

      leafLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
      fixture.detectChanges();
      await flushFocus();

      expect(productsItem.getAttribute("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(productsLink);
    });

    it("ArrowDown/ArrowUp move focus among a column group's own leaf items", () => {
      const fixture = setup([
        { label: "Products", items: [[{ label: "Category A", items: [{ label: "A1" }, { label: "A2" }] }]] },
      ]);
      const productsItem = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child");
      productsItem.querySelector("a").click();
      fixture.detectChanges();

      const leafLinks = productsItem.querySelectorAll(".u-megamenu-submenu a");
      leafLinks[0].focus();
      leafLinks[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
      expect(document.activeElement).toBe(leafLinks[1]);
      (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp", bubbles: true }));
      expect(document.activeElement).toBe(leafLinks[0]);
    });

    it("skips a disabled leaf item when moving focus with ArrowDown", () => {
      const fixture = setup([
        {
          label: "Products",
          items: [[{ label: "Category A", items: [{ label: "A1" }, { label: "A2", disabled: true }, { label: "A3" }] }]],
        },
      ]);
      const productsItem = fixture.nativeElement.querySelector(".u-megamenu-root-list > li:first-child");
      productsItem.querySelector("a").click();
      fixture.detectChanges();

      const leafLinks = productsItem.querySelectorAll(".u-megamenu-submenu a");
      leafLinks[0].focus();
      leafLinks[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
      expect(document.activeElement).toBe(leafLinks[2]);
    });
  });
});
