import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { UTieredMenu, type UTieredMenuHandle } from "./tiered-menu";
import type { UMenuItem } from "../menu";

describe("UTieredMenu", () => {
  const items: UMenuItem[] = [
    { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
    { label: "Edit" },
  ];

  it('renders role="menu" and root-level items when inline (popup: false)', () => {
    const { container } = render(<UTieredMenu model={items} />);
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="menuitem"]').length).toBeGreaterThanOrEqual(2);
  });

  it("does not render its content when popup: true and not yet shown", () => {
    const { container } = render(<UTieredMenu model={items} popup />);
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it("renders its content after show() is called for a popup menu", () => {
    const ref = React.createRef<UTieredMenuHandle>();
    const { container } = render(<UTieredMenu ref={ref} model={items} popup />);
    act(() => ref.current?.show());
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
  });

  it("hides after hide() is called", () => {
    const ref = React.createRef<UTieredMenuHandle>();
    const { container } = render(<UTieredMenu ref={ref} model={items} popup />);
    act(() => ref.current?.show());
    act(() => ref.current?.hide());
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it("toggle() flips visibility", () => {
    const ref = React.createRef<UTieredMenuHandle>();
    const { container } = render(<UTieredMenu ref={ref} model={items} popup />);
    act(() => ref.current?.toggle());
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
    act(() => ref.current?.toggle());
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it("hides on Escape when popup and visible", () => {
    const ref = React.createRef<UTieredMenuHandle>();
    const { container } = render(<UTieredMenu ref={ref} model={items} popup />);
    act(() => ref.current?.show());
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it("opens a nested submenu on hover of a group item", () => {
    const { container } = render(<UTieredMenu model={items} />);
    const fileItem = container.querySelector('[role="menuitem"]') as HTMLElement;
    fireEvent.mouseEnter(fileItem);
    expect(fileItem.getAttribute("data-u-open")).toBe("true");
  });

  it("renders drill-down (doubly-nested) submenus", () => {
    const { container } = render(<UTieredMenu model={items} />);
    const fileItem = container.querySelector('[role="menuitem"]') as HTMLElement;
    fireEvent.mouseEnter(fileItem);
    const nested = container.querySelector(".u-tieredmenu-submenu .u-tieredmenu-submenu");
    expect(nested).not.toBeNull();
  });

  it("emits onItemSelect and closes the popup on a leaf item click", () => {
    const onItemSelect = vi.fn();
    const ref = React.createRef<UTieredMenuHandle>();
    const { container } = render(
      <UTieredMenu ref={ref} model={[{ label: "Action" }]} popup onItemSelect={onItemSelect} />
    );
    act(() => ref.current?.show());
    fireEvent.click(container.querySelector("a") as HTMLAnchorElement);
    expect(onItemSelect).toHaveBeenCalled();
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  describe("keyboard navigation (Spec §5.3, GAP-054)", () => {
    // TieredMenu uses a single ArrowDown/ArrowUp axis at every level (root and
    // submenu alike) to move between siblings, per real PrimeNG/PrimeReact's
    // own TieredMenuSub convention (used unconditionally regardless of level)
    // — unlike Menubar, whose root level is a horizontal menubar
    // (ArrowRight/ArrowLeft) with vertical submenus.
    it("ArrowDown/ArrowUp move focus among top-level items", () => {
      const { container } = render(
        <UTieredMenu model={[{ label: "File" }, { label: "Edit" }, { label: "View" }]} />
      );
      const links = container.querySelectorAll<HTMLAnchorElement>(
        '[role="menuitem"] > .u-tieredmenu-content > a'
      );
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowDown" });
      expect(document.activeElement).toBe(links[1]);

      fireEvent.keyDown(links[1], { code: "ArrowDown" });
      expect(document.activeElement).toBe(links[2]);

      // Wraps around.
      fireEvent.keyDown(links[2], { code: "ArrowDown" });
      expect(document.activeElement).toBe(links[0]);

      fireEvent.keyDown(links[0], { code: "ArrowUp" });
      expect(document.activeElement).toBe(links[2]);
    });

    it("ArrowDown skips a disabled top-level item", () => {
      const { container } = render(
        <UTieredMenu
          model={[{ label: "File" }, { label: "Edit", disabled: true }, { label: "View" }]}
        />
      );
      const links = container.querySelectorAll<HTMLAnchorElement>(
        '[role="menuitem"] > .u-tieredmenu-content > a'
      );
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowDown" });
      expect(document.activeElement).toBe(links[2]);
    });

    it("opens a submenu and focuses its first item on Enter/Space", () => {
      const { container } = render(
        <UTieredMenu model={[{ label: "File", items: [{ label: "New" }] }]} />
      );
      const item = container.querySelector('[role="menuitem"]') as HTMLElement;
      const link = item.querySelector(".u-tieredmenu-content > a") as HTMLAnchorElement;
      link.focus();
      fireEvent.keyDown(link, { code: "Enter" });

      expect(item.getAttribute("data-u-open")).toBe("true");
      expect(link.getAttribute("aria-expanded")).toBe("true");
      const firstSubItemLink = item.querySelector<HTMLAnchorElement>(
        ".u-tieredmenu-submenu > li:first-child > .u-tieredmenu-content > a"
      );
      expect(document.activeElement).toBe(firstSubItemLink);
    });

    it("closes the innermost open submenu on Escape and refocuses its trigger", () => {
      const { container } = render(
        <UTieredMenu model={[{ label: "File", items: [{ label: "New" }] }]} />
      );
      const item = container.querySelector('[role="menuitem"]') as HTMLElement;
      const link = item.querySelector(".u-tieredmenu-content > a") as HTMLAnchorElement;
      link.focus();
      fireEvent.keyDown(link, { code: "Enter" });

      const firstSubItemLink = item.querySelector<HTMLAnchorElement>(
        ".u-tieredmenu-submenu > li:first-child > .u-tieredmenu-content > a"
      ) as HTMLAnchorElement;
      expect(document.activeElement).toBe(firstSubItemLink);

      fireEvent.keyDown(firstSubItemLink, { code: "Escape" });

      expect(item.getAttribute("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(link);
    });

    it("closes only the innermost submenu when nested two levels deep via real keyboard navigation", () => {
      const { container } = render(<UTieredMenu model={items} />);
      // File (root) -> Open (submenu item 2, has nested "Recent") -> Recent (nested submenu).
      const fileItem = container.querySelector('[role="menuitem"]') as HTMLElement;
      const fileLink = fileItem.querySelector(".u-tieredmenu-content > a") as HTMLAnchorElement;
      fileLink.focus();
      fireEvent.keyDown(fileLink, { code: "Enter" });

      const newLink = fileItem.querySelector<HTMLAnchorElement>(
        ".u-tieredmenu-submenu > li:nth-child(1) > .u-tieredmenu-content > a"
      ) as HTMLAnchorElement;
      expect(document.activeElement).toBe(newLink);

      // Move down within the open submenu to "Open" (has its own nested submenu).
      fireEvent.keyDown(newLink, { code: "ArrowDown" });
      const openItemLi = fileItem.querySelector(
        ".u-tieredmenu-submenu > li:nth-child(2)"
      ) as HTMLElement;
      const openLink = openItemLi.querySelector<HTMLAnchorElement>(
        ":scope > .u-tieredmenu-content > a"
      ) as HTMLAnchorElement;
      expect(document.activeElement).toBe(openLink);

      // Open the nested submenu via Enter, landing focus on "Recent".
      fireEvent.keyDown(openLink, { code: "Enter" });
      expect(openItemLi.getAttribute("data-u-open")).toBe("true");
      const recentLink = openItemLi.querySelector<HTMLAnchorElement>(
        ".u-tieredmenu-submenu > li:first-child > .u-tieredmenu-content > a"
      ) as HTMLAnchorElement;
      expect(document.activeElement).toBe(recentLink);

      // Escape from the deepest level closes only that level, not the parent "File" menu.
      fireEvent.keyDown(recentLink, { code: "Escape" });
      expect(openItemLi.getAttribute("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(openLink);
      expect(fileItem.getAttribute("data-u-open")).toBe("true");
    });

    describe("index mapping with a separator/hidden item before the target (GAP-054 fix-loop)", () => {
      const modelWithSeparator: UMenuItem[] = [
        { label: "New" },
        { separator: true },
        { label: "Open", items: [{ label: "Recent" }] },
        { label: "Exit" },
      ];

      it("opens the submenu on Enter for a group item positioned after a separator", () => {
        const { container } = render(<UTieredMenu model={modelWithSeparator} />);
        // "Open" is rendered link index 1 (separator has no <a>), but model index 2.
        const openLink = container.querySelectorAll<HTMLAnchorElement>(
          '[role="menuitem"] > .u-tieredmenu-content > a'
        )[1];
        openLink.focus();
        fireEvent.keyDown(openLink, { code: "Enter" });

        const openLi = openLink.closest("li") as HTMLElement;
        expect(openLi.getAttribute("data-u-open")).toBe("true");
      });

      it("Escape from a nested item refocuses the correct owning trigger, not a sibling shifted by a separator", () => {
        const { container } = render(<UTieredMenu model={modelWithSeparator} />);
        const openLink = container.querySelectorAll<HTMLAnchorElement>(
          '[role="menuitem"] > .u-tieredmenu-content > a'
        )[1];
        openLink.focus();
        fireEvent.keyDown(openLink, { code: "Enter" });

        const recentLink = openLink
          .closest("li")
          ?.querySelector<HTMLAnchorElement>(
            ".u-tieredmenu-submenu > li:first-child > .u-tieredmenu-content > a"
          ) as HTMLAnchorElement;
        expect(document.activeElement).toBe(recentLink);

        fireEvent.keyDown(recentLink, { code: "Escape" });

        expect(document.activeElement).toBe(openLink);
      });

      it("ArrowUp from an item after a hidden item does not get stuck", () => {
        const model: UMenuItem[] = [
          { label: "A" },
          { label: "Hidden", visible: false },
          { label: "B" },
          { label: "C" },
        ];
        const { container } = render(<UTieredMenu model={model} />);
        const links = container.querySelectorAll<HTMLAnchorElement>(
          '[role="menuitem"] > .u-tieredmenu-content > a'
        );
        const [a, b] = Array.from(links);
        b.focus();
        fireEvent.keyDown(b, { code: "ArrowUp" });
        expect(document.activeElement).toBe(a);
      });
    });
  });
});
