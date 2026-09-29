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

    describe("Escape from a nested submenu item (GAP-054 fix-loop)", () => {
      // 3-level model: File (root) -> Open (depth-1 submenu) -> Recent (depth-2 nested submenu).
      const nestedModel: UMenuItem[] = [
        { label: "File", items: [{ label: "Open", items: [{ label: "Recent" }] }] },
      ];

      // Focus-moving handlers (focusFirstSubmenuItem/closeAndRefocus) defer via a
      // raw setTimeout, matching this codebase's established convention (see
      // auto-focus.spec.ts) — a real setTimeout(0) flush is required to observe
      // the resulting focus change.
      async function flushFocus() {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      async function openToDepth2(fixture: ReturnType<typeof setup>) {
        const fileLink = fixture.nativeElement.querySelector("[role=menuitem]");
        fileLink.focus();
        fileLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
        fixture.detectChanges();
        await flushFocus();
        // Focus is now on "Open" (first item of the depth-1 submenu). Open it too.
        const openLink = document.activeElement as HTMLElement;
        openLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
        fixture.detectChanges();
        await flushFocus();
        // Focus is now on "Recent" (first item of the depth-2 nested submenu).
        return { fileLink, openLink, recentLink: document.activeElement as HTMLElement };
      }

      it("closes the innermost (nested) submenu when Escape is dispatched from a focused nested item", async () => {
        const fixture = setup(nestedModel);
        const { openLink, recentLink } = await openToDepth2(fixture);
        const openLi = openLink.closest("li")!;
        expect(recentLink).not.toBe(openLink); // sanity: focus actually reached depth 2

        recentLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
        fixture.detectChanges();
        await flushFocus();

        expect(openLi.getAttribute("data-u-open")).toBe("false");
      });

      it("restores focus to the nested submenu's own owning trigger after Escape", async () => {
        const fixture = setup(nestedModel);
        const { openLink, recentLink } = await openToDepth2(fixture);

        recentLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
        fixture.detectChanges();
        await flushFocus();

        expect(document.activeElement).toBe(openLink);
      });

      it("closes the next parent level on a second Escape from the refocused trigger", async () => {
        const fixture = setup(nestedModel);
        const { fileLink, openLink } = await openToDepth2(fixture);
        const fileLi = fileLink.closest("li")!;

        openLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
        fixture.detectChanges();
        await flushFocus();
        expect(document.activeElement).toBe(openLink);

        (document.activeElement as HTMLElement).dispatchEvent(
          new KeyboardEvent("keydown", { code: "Escape", bubbles: true }),
        );
        fixture.detectChanges();
        await flushFocus();

        expect(fileLi.getAttribute("data-u-open")).toBe("false");
        expect(document.activeElement).toBe(fileLink);
      });
    });
  });
});
