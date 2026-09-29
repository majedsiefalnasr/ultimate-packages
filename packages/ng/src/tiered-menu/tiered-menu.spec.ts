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
        const fileItem = fixture.nativeElement.querySelector('[role="menuitem"]');
        const fileLink = fileItem.querySelector(".u-tieredmenu-item-content > a") as HTMLElement;
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
        const fileItem = fileLink.closest("li")!;

        openLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
        fixture.detectChanges();
        await flushFocus();
        expect(document.activeElement).toBe(openLink);

        (document.activeElement as HTMLElement).dispatchEvent(
          new KeyboardEvent("keydown", { code: "Escape", bubbles: true }),
        );
        fixture.detectChanges();
        await flushFocus();

        expect(fileItem.getAttribute("data-u-open")).toBe("false");
        expect(document.activeElement).toBe(fileLink);
      });
    });

    describe("index mapping with a separator/hidden item before the target (GAP-054 fix-loop)", () => {
      async function flushFocus() {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const modelWithSeparator: UMenuItem[] = [
        { label: "New" },
        { separator: true },
        { label: "Open", items: [{ label: "Recent" }] },
        { label: "Exit" },
      ];

      it("opens the submenu on Enter for a group item positioned after a separator", async () => {
        const fixture = setup(modelWithSeparator);
        // "Open" is rendered link index 1 (separator has no <a>), but model index 2.
        const openLink = fixture.nativeElement.querySelectorAll('[role="menuitem"] > .u-tieredmenu-item-content > a')[1];
        openLink.focus();
        openLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
        fixture.detectChanges();
        await flushFocus();

        const openLi = openLink.closest("li");
        expect(openLi.getAttribute("data-u-open")).toBe("true");
      });

      it("Escape from a nested item refocuses the correct owning trigger, not a sibling shifted by a separator", async () => {
        const fixture = setup(modelWithSeparator);
        const openLink = fixture.nativeElement.querySelectorAll('[role="menuitem"] > .u-tieredmenu-item-content > a')[1];
        openLink.focus();
        openLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
        fixture.detectChanges();
        await flushFocus();

        const recentLink = openLink
          .closest("li")
          .querySelector(".u-tieredmenu-submenu > li:first-child > .u-tieredmenu-item-content > a");
        expect(document.activeElement).toBe(recentLink);

        recentLink.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
        fixture.detectChanges();
        await flushFocus();

        expect(document.activeElement).toBe(openLink);
      });

      it("ArrowUp from an item after a hidden item does not get stuck", () => {
        const model: UMenuItem[] = [
          { label: "A" },
          { label: "Hidden", visible: false },
          { label: "B" },
          { label: "C" },
        ];
        const fixture = setup(model);
        const links = fixture.nativeElement.querySelectorAll('[role="menuitem"] > .u-tieredmenu-item-content > a');
        const [a, b] = links;
        b.focus();
        b.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp", bubbles: true }));
        expect(document.activeElement).toBe(a);
      });
    });
  });
});
