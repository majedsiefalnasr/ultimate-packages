import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { UMenubar } from "./menubar";
import type { UMenuItem } from "../menu";

describe("UMenubar", () => {
  const items: UMenuItem[] = [
    { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
    { label: "Edit", items: [{ label: "Undo" }] },
    { label: "Help", url: "/help" },
  ];

  it("renders a nav with top-level items", () => {
    const { container } = render(<UMenubar model={items} />);
    expect(container.querySelector("nav")).not.toBeNull();
    const rootLinks = container.querySelectorAll(".u-menubar-root-list > li > .u-menubar-content > a");
    expect(rootLinks.length).toBe(3);
  });

  it("marks items with children as aria-haspopup=menu", () => {
    const { container } = render(<UMenubar model={items} />);
    const fileLink = container.querySelector(".u-menubar-root-list > li:first-child a");
    expect(fileLink?.getAttribute("aria-haspopup")).toBe("menu");
  });

  it("opens a submenu on click of an item with children", () => {
    const { container } = render(<UMenubar model={items} />);
    const fileItem = container.querySelector(".u-menubar-root-list > li:first-child") as HTMLElement;
    fireEvent.click(fileItem.querySelector("a") as HTMLAnchorElement);
    expect(fileItem.getAttribute("data-u-open")).toBe("true");
  });

  it("closes an open submenu when clicked again", () => {
    const { container } = render(<UMenubar model={items} />);
    const fileItem = container.querySelector(".u-menubar-root-list > li:first-child") as HTMLElement;
    const link = fileItem.querySelector("a") as HTMLAnchorElement;
    fireEvent.click(link);
    fireEvent.click(link);
    expect(fileItem.getAttribute("data-u-open")).toBe("false");
  });

  it("renders nested (drill-down) submenus", () => {
    const { container } = render(<UMenubar model={items} />);
    const fileItem = container.querySelector(".u-menubar-root-list > li:first-child") as HTMLElement;
    fireEvent.click(fileItem.querySelector("a") as HTMLAnchorElement);
    const nested = fileItem.querySelector(".u-menubar-submenu .u-menubar-submenu");
    expect(nested).not.toBeNull();
  });

  it("invokes onItemSelect and item.command for a leaf item click", () => {
    const onItemSelect = vi.fn();
    const command = vi.fn();
    const model: UMenuItem[] = [{ label: "Action", command }];
    const { container } = render(<UMenubar model={model} onItemSelect={onItemSelect} />);
    fireEvent.click(container.querySelector("a") as HTMLAnchorElement);
    expect(command).toHaveBeenCalled();
    expect(onItemSelect).toHaveBeenCalled();
  });

  it("does not open or invoke command for a disabled item", () => {
    const command = vi.fn();
    const model: UMenuItem[] = [{ label: "Disabled", disabled: true, command }];
    const { container } = render(<UMenubar model={model} />);
    const link = container.querySelector("a") as HTMLAnchorElement;
    expect(link.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(link);
    expect(command).not.toHaveBeenCalled();
  });

  it("renders a separator item", () => {
    const { container } = render(<UMenubar model={[{ label: "A" }, { separator: true }, { label: "B" }]} />);
    expect(container.querySelector('[role="separator"]')).not.toBeNull();
  });

  describe("keyboard navigation (GAP-054)", () => {
    const rootLink = (container: HTMLElement, index: number) =>
      container.querySelectorAll<HTMLAnchorElement>(".u-menubar-root-list > li > .u-menubar-content > a")[
        index
      ];

    it("carries ARIA roles for menubar/menu/menuitem", () => {
      const { container } = render(<UMenubar model={items} />);
      expect(container.querySelector(".u-menubar-root-list")?.getAttribute("role")).toBe("menubar");
      const rootLinks = container.querySelectorAll(".u-menubar-root-list > li > .u-menubar-content > a");
      rootLinks.forEach((link) => expect(link.getAttribute("role")).toBe("menuitem"));
    });

    it("moves focus with ArrowRight/ArrowLeft among root items", () => {
      const { container } = render(<UMenubar model={items} />);
      const file = rootLink(container, 0);
      const edit = rootLink(container, 1);
      const help = rootLink(container, 2);

      file.focus();
      fireEvent.keyDown(file, { code: "ArrowRight" });
      expect(document.activeElement).toBe(edit);

      fireEvent.keyDown(edit, { code: "ArrowRight" });
      expect(document.activeElement).toBe(help);

      // Wraps around.
      fireEvent.keyDown(help, { code: "ArrowRight" });
      expect(document.activeElement).toBe(file);

      fireEvent.keyDown(file, { code: "ArrowLeft" });
      expect(document.activeElement).toBe(help);
    });

    it("skips disabled items in roving focus", () => {
      const model: UMenuItem[] = [
        { label: "One" },
        { label: "Two", disabled: true },
        { label: "Three" },
      ];
      const { container } = render(<UMenubar model={model} />);
      const one = rootLink(container, 0);
      const three = rootLink(container, 2);

      one.focus();
      fireEvent.keyDown(one, { code: "ArrowRight" });
      expect(document.activeElement).toBe(three);
    });

    it("opens a submenu and focuses its first item on Enter/Space", () => {
      const { container } = render(<UMenubar model={items} />);
      const file = rootLink(container, 0);
      file.focus();
      fireEvent.keyDown(file, { code: "Enter" });

      const fileItem = container.querySelector(".u-menubar-root-list > li:first-child") as HTMLElement;
      expect(fileItem.getAttribute("data-u-open")).toBe("true");

      const firstSubItemLink = fileItem.querySelector<HTMLAnchorElement>(
        ".u-menubar-submenu > li:first-child > .u-menubar-content > a"
      );
      expect(document.activeElement).toBe(firstSubItemLink);
    });

    it("closes the innermost open submenu on Escape and refocuses its trigger", () => {
      const { container } = render(<UMenubar model={items} />);
      const file = rootLink(container, 0);
      file.focus();
      fireEvent.keyDown(file, { code: "Enter" });

      const fileItem = container.querySelector(".u-menubar-root-list > li:first-child") as HTMLElement;
      const firstSubItemLink = fileItem.querySelector<HTMLAnchorElement>(
        ".u-menubar-submenu > li:first-child > .u-menubar-content > a"
      ) as HTMLAnchorElement;
      expect(document.activeElement).toBe(firstSubItemLink);

      fireEvent.keyDown(firstSubItemLink, { code: "Escape" });

      expect(fileItem.getAttribute("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(file);
    });

    it("closes only the innermost submenu when nested two levels deep via real keyboard navigation", () => {
      const { container } = render(<UMenubar model={items} />);
      // File (root) -> Open (submenu item 2, has nested "Recent") -> Recent (nested submenu).
      const file = rootLink(container, 0);
      file.focus();
      fireEvent.keyDown(file, { code: "Enter" });

      const fileItem = container.querySelector(".u-menubar-root-list > li:first-child") as HTMLElement;
      const newLink = fileItem.querySelector<HTMLAnchorElement>(
        ".u-menubar-submenu > li:nth-child(1) > .u-menubar-content > a"
      ) as HTMLAnchorElement;
      expect(document.activeElement).toBe(newLink);

      // Move down within the open submenu to "Open" (has its own nested submenu).
      fireEvent.keyDown(newLink, { code: "ArrowDown" });
      const openItemLi = fileItem.querySelector(
        ".u-menubar-submenu > li:nth-child(2)"
      ) as HTMLElement;
      const openLink = openItemLi.querySelector<HTMLAnchorElement>(
        ":scope > .u-menubar-content > a"
      ) as HTMLAnchorElement;
      expect(document.activeElement).toBe(openLink);

      // Open the nested submenu via Enter, landing focus on "Recent".
      fireEvent.keyDown(openLink, { code: "Enter" });
      expect(openItemLi.getAttribute("data-u-open")).toBe("true");
      const recentLink = openItemLi.querySelector<HTMLAnchorElement>(
        ".u-menubar-submenu > li:first-child > .u-menubar-content > a"
      ) as HTMLAnchorElement;
      expect(document.activeElement).toBe(recentLink);

      // Escape from the deepest level closes only that level, not the parent "File" menu.
      fireEvent.keyDown(recentLink, { code: "Escape" });
      expect(openItemLi.getAttribute("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(openLink);
      expect(fileItem.getAttribute("data-u-open")).toBe("true");
    });

    describe("index mapping with a separator/hidden item before the target (GAP-054 fix-loop)", () => {
      // Reviewer's own repro shape: a separator before "Open" desyncs the
      // DOM-links index (which skips the separator's non-rendered <a>) from
      // the full model-items index used by the old buggy lookup.
      const modelWithSeparator: UMenuItem[] = [
        { label: "New" },
        { separator: true },
        { label: "Open", items: [{ label: "Recent" }] },
        { label: "Exit" },
      ];

      it("opens the submenu on Enter for a group item positioned after a separator", () => {
        const { container } = render(<UMenubar model={[{ label: "File", items: modelWithSeparator }]} />);
        const file = container.querySelector<HTMLAnchorElement>(
          ".u-menubar-root-list > li > .u-menubar-content > a"
        ) as HTMLAnchorElement;
        file.focus();
        fireEvent.keyDown(file, { code: "Enter" });

        const fileItem = container.querySelector(".u-menubar-root-list > li:first-child") as HTMLElement;
        // "Open" is rendered link index 1 (separator has no <a>), but model
        // index 2 — the old bug indexed the DOM links with the model index.
        const openLink = fileItem.querySelectorAll<HTMLAnchorElement>(
          ".u-menubar-submenu > li > .u-menubar-content > a"
        )[1];
        openLink.focus();
        fireEvent.keyDown(openLink, { code: "Enter" });

        const openLi = openLink.closest("li") as HTMLElement;
        expect(openLi.getAttribute("data-u-open")).toBe("true");
      });

      it("Escape from a nested item refocuses the correct owning trigger, not a sibling shifted by a separator", () => {
        const { container } = render(<UMenubar model={[{ label: "File", items: modelWithSeparator }]} />);
        const file = container.querySelector<HTMLAnchorElement>(
          ".u-menubar-root-list > li > .u-menubar-content > a"
        ) as HTMLAnchorElement;
        file.focus();
        fireEvent.keyDown(file, { code: "Enter" });

        const fileItem = container.querySelector(".u-menubar-root-list > li:first-child") as HTMLElement;
        const openLink = fileItem.querySelectorAll<HTMLAnchorElement>(
          ".u-menubar-submenu > li > .u-menubar-content > a"
        )[1];
        openLink.focus();
        fireEvent.keyDown(openLink, { code: "Enter" });

        const recentLink = openLink
          .closest("li")
          ?.querySelector<HTMLAnchorElement>(
            ".u-menubar-submenu > li:first-child > .u-menubar-content > a"
          ) as HTMLAnchorElement;
        expect(document.activeElement).toBe(recentLink);

        fireEvent.keyDown(recentLink, { code: "Escape" });

        // Must refocus "Open" (its real owning trigger), not "Exit".
        expect(document.activeElement).toBe(openLink);
      });

      it("ArrowLeft from a root item after a hidden item does not get stuck", () => {
        const model: UMenuItem[] = [
          { label: "A" },
          { label: "Hidden", visible: false },
          { label: "B" },
          { label: "C" },
        ];
        const { container } = render(<UMenubar model={model} />);
        const links = container.querySelectorAll<HTMLAnchorElement>(
          ".u-menubar-root-list > li > .u-menubar-content > a"
        );
        // Rendered links are [A, B, C] (Hidden renders no <li>/<a>).
        const [a, b, c] = Array.from(links);
        b.focus();
        fireEvent.keyDown(b, { code: "ArrowLeft" });
        expect(document.activeElement).toBe(a);

        fireEvent.keyDown(a, { code: "ArrowLeft" });
        expect(document.activeElement).toBe(c);
      });
    });
  });
});
