import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
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

  it("renders a menubar of root items", () => {
    const { container } = render(<UMegaMenu model={items} />);
    expect(container.querySelector('[role="menubar"]')).not.toBeNull();
    const rootLinks = container.querySelectorAll(".u-megamenu-root-list > li > .u-megamenu-content > a");
    expect(rootLinks.length).toBe(2);
  });

  it("marks a column-grid item as aria-haspopup=menu", () => {
    const { container } = render(<UMegaMenu model={items} />);
    const productsLink = container.querySelector(".u-megamenu-root-list > li:first-child a");
    expect(productsLink?.getAttribute("aria-haspopup")).toBe("menu");
  });

  it("opens the multi-column overlay on click", () => {
    const { container } = render(<UMegaMenu model={items} />);
    const productsItem = container.querySelector(".u-megamenu-root-list > li:first-child") as HTMLElement;
    fireEvent.click(productsItem.querySelector("a") as HTMLAnchorElement);
    expect(productsItem.getAttribute("data-u-open")).toBe("true");
    expect(productsItem.querySelectorAll(".u-megamenu-column").length).toBe(2);
  });

  it("renders each column's grouped items with a submenu label", () => {
    const { container } = render(<UMegaMenu model={items} />);
    const productsItem = container.querySelector(".u-megamenu-root-list > li:first-child") as HTMLElement;
    fireEvent.click(productsItem.querySelector("a") as HTMLAnchorElement);
    const labels = Array.from(productsItem.querySelectorAll(".u-megamenu-submenu-label")).map((el) => el.textContent);
    expect(labels).toEqual(["Category A", "Category B"]);
  });

  it("closes the overlay on a second click", () => {
    const { container } = render(<UMegaMenu model={items} />);
    const productsItem = container.querySelector(".u-megamenu-root-list > li:first-child") as HTMLElement;
    const link = productsItem.querySelector("a") as HTMLAnchorElement;
    fireEvent.click(link);
    fireEvent.click(link);
    expect(productsItem.getAttribute("data-u-open")).toBe("false");
  });

  it("invokes onItemSelect and closes the overlay when a leaf column item is clicked", () => {
    const onItemSelect = vi.fn();
    const { container } = render(<UMegaMenu model={items} onItemSelect={onItemSelect} />);
    const productsItem = container.querySelector(".u-megamenu-root-list > li:first-child") as HTMLElement;
    fireEvent.click(productsItem.querySelector("a") as HTMLAnchorElement);
    const leafLink = productsItem.querySelector(".u-megamenu-submenu a") as HTMLAnchorElement;
    fireEvent.click(leafLink);
    expect(onItemSelect).toHaveBeenCalled();
    expect(productsItem.getAttribute("data-u-open")).toBe("false");
  });

  it("does not open or navigate for a disabled root item", () => {
    const model: UMegaMenuItem[] = [
      { label: "Disabled", disabled: true, items: [[{ label: "X", items: [{ label: "Y" }] }]] },
    ];
    const { container } = render(<UMegaMenu model={model} />);
    const item = container.querySelector(".u-megamenu-root-list > li") as HTMLElement;
    const link = item.querySelector("a") as HTMLAnchorElement;
    expect(link.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(link);
    expect(item.getAttribute("data-u-open")).toBe("false");
  });

  describe("keyboard navigation (Spec §5.3, GAP-054)", () => {
    it("ArrowRight/ArrowLeft move focus among root items, wrapping around", () => {
      const { container } = render(
        <UMegaMenu model={[{ label: "File" }, { label: "Edit" }, { label: "View" }]} />
      );
      const links = container.querySelectorAll<HTMLAnchorElement>(".u-megamenu-root-list > li > .u-megamenu-content > a");
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[1]);

      fireEvent.keyDown(links[1], { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[2]);

      // Wraps around.
      fireEvent.keyDown(links[2], { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[0]);

      fireEvent.keyDown(links[0], { code: "ArrowLeft" });
      expect(document.activeElement).toBe(links[2]);
    });

    it("ArrowRight skips a disabled root item", () => {
      const { container } = render(
        <UMegaMenu model={[{ label: "File" }, { label: "Edit", disabled: true }, { label: "View" }]} />
      );
      const links = container.querySelectorAll<HTMLAnchorElement>(".u-megamenu-root-list > li > .u-megamenu-content > a");
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[2]);
    });

    it("Enter/Space on a column-having item opens the overlay and focuses its first leaf item", () => {
      const { container } = render(<UMegaMenu model={items} />);
      const productsItem = container.querySelector(".u-megamenu-root-list > li:first-child") as HTMLElement;
      const productsLink = productsItem.querySelector("a") as HTMLAnchorElement;
      productsLink.focus();
      fireEvent.keyDown(productsLink, { code: "Enter" });

      expect(productsItem.getAttribute("data-u-open")).toBe("true");
      expect(productsLink.getAttribute("aria-expanded")).toBe("true");
      const firstLeafLink = productsItem.querySelector<HTMLAnchorElement>(".u-megamenu-submenu a");
      expect(document.activeElement).toBe(firstLeafLink);
    });

    it("Escape closes the open overlay from a focused leaf item and returns focus to its root trigger", () => {
      const { container } = render(<UMegaMenu model={items} />);
      const productsItem = container.querySelector(".u-megamenu-root-list > li:first-child") as HTMLElement;
      const productsLink = productsItem.querySelector("a") as HTMLAnchorElement;
      productsLink.focus();
      fireEvent.keyDown(productsLink, { code: "Enter" });

      const firstLeafLink = productsItem.querySelector<HTMLAnchorElement>(".u-megamenu-submenu a") as HTMLAnchorElement;
      expect(document.activeElement).toBe(firstLeafLink);

      // Escape fired from focus genuinely inside the overlay on a leaf item,
      // not merely from the trigger — the coverage gap flagged for this task.
      fireEvent.keyDown(firstLeafLink, { code: "Escape" });

      expect(productsItem.getAttribute("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(productsLink);
    });

    it("ArrowDown/ArrowUp move focus among a column group's own leaf items, wrapping around", () => {
      const model: UMegaMenuItem[] = [
        { label: "Products", items: [[{ label: "Category A", items: [{ label: "A1" }, { label: "A2" }, { label: "A3" }] }]] },
      ];
      const { container } = render(<UMegaMenu model={model} />);
      const productsItem = container.querySelector(".u-megamenu-root-list > li:first-child") as HTMLElement;
      fireEvent.click(productsItem.querySelector("a") as HTMLAnchorElement);

      const leafLinks = productsItem.querySelectorAll<HTMLAnchorElement>(".u-megamenu-submenu a");
      expect(leafLinks.length).toBe(3);
      leafLinks[0].focus();

      fireEvent.keyDown(leafLinks[0], { code: "ArrowDown" });
      expect(document.activeElement).toBe(leafLinks[1]);

      fireEvent.keyDown(leafLinks[1], { code: "ArrowDown" });
      expect(document.activeElement).toBe(leafLinks[2]);

      // Wraps around.
      fireEvent.keyDown(leafLinks[2], { code: "ArrowDown" });
      expect(document.activeElement).toBe(leafLinks[0]);

      fireEvent.keyDown(leafLinks[0], { code: "ArrowUp" });
      expect(document.activeElement).toBe(leafLinks[2]);
    });

    it("skips a disabled leaf item when moving focus with ArrowDown", () => {
      const model: UMegaMenuItem[] = [
        {
          label: "Products",
          items: [[{ label: "Category A", items: [{ label: "A1" }, { label: "A2", disabled: true }, { label: "A3" }] }]],
        },
      ];
      const { container } = render(<UMegaMenu model={model} />);
      const productsItem = container.querySelector(".u-megamenu-root-list > li:first-child") as HTMLElement;
      fireEvent.click(productsItem.querySelector("a") as HTMLAnchorElement);

      const leafLinks = productsItem.querySelectorAll<HTMLAnchorElement>(".u-megamenu-submenu a");
      leafLinks[0].focus();
      fireEvent.keyDown(leafLinks[0], { code: "ArrowDown" });
      expect(document.activeElement).toBe(leafLinks[2]);
    });

    it("closing the overlay via Escape while a sibling root item exists closes only the innermost overlay", () => {
      // MegaMenu's hard-2-level structure means there is no "further up"
      // beyond the root — this asserts the sibling root item is unaffected.
      const model: UMegaMenuItem[] = [
        { label: "Products", items: [[{ label: "Category A", items: [{ label: "A1" }] }]] },
        { label: "About", url: "/about" },
      ];
      const { container } = render(<UMegaMenu model={model} />);
      const productsItem = container.querySelector(".u-megamenu-root-list > li:first-child") as HTMLElement;
      const productsLink = productsItem.querySelector("a") as HTMLAnchorElement;
      productsLink.focus();
      fireEvent.keyDown(productsLink, { code: "Enter" });

      const firstLeafLink = productsItem.querySelector<HTMLAnchorElement>(".u-megamenu-submenu a") as HTMLAnchorElement;
      fireEvent.keyDown(firstLeafLink, { code: "Escape" });

      expect(productsItem.getAttribute("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(productsLink);
    });

    describe("index mapping with a hidden root item before the target (GAP-054 fix-loop)", () => {
      const modelWithHidden: UMegaMenuItem[] = [
        { label: "A" },
        { label: "Hidden", visible: false },
        { label: "B", items: [[{ label: "Group", items: [{ label: "Leaf" }] }]] },
        { label: "C" },
      ];

      it("opens the overlay on Enter for a root item positioned after a hidden item", () => {
        const { container } = render(<UMegaMenu model={modelWithHidden} />);
        // "B" is rendered link index 1 (Hidden renders no <li>/<a>), but model index 2.
        const bLink = container.querySelectorAll<HTMLAnchorElement>(
          ".u-megamenu-root-list > li > .u-megamenu-content > a"
        )[1];
        bLink.focus();
        fireEvent.keyDown(bLink, { code: "Enter" });

        const bLi = bLink.closest("li") as HTMLElement;
        expect(bLi.getAttribute("data-u-open")).toBe("true");
      });

      it("Escape from a leaf item refocuses the correct owning root trigger, not a sibling shifted by a hidden item", () => {
        const { container } = render(<UMegaMenu model={modelWithHidden} />);
        const bLink = container.querySelectorAll<HTMLAnchorElement>(
          ".u-megamenu-root-list > li > .u-megamenu-content > a"
        )[1];
        bLink.focus();
        fireEvent.keyDown(bLink, { code: "Enter" });

        const leafLink = bLink.closest("li")?.querySelector<HTMLAnchorElement>(".u-megamenu-submenu a") as HTMLAnchorElement;
        expect(document.activeElement).toBe(leafLink);

        fireEvent.keyDown(leafLink, { code: "Escape" });

        expect(document.activeElement).toBe(bLink);
      });

      it("ArrowLeft from a root item after a hidden item does not get stuck", () => {
        const { container } = render(<UMegaMenu model={modelWithHidden} />);
        const links = container.querySelectorAll<HTMLAnchorElement>(
          ".u-megamenu-root-list > li > .u-megamenu-content > a"
        );
        const [a, b] = Array.from(links);
        b.focus();
        fireEvent.keyDown(b, { code: "ArrowLeft" });
        expect(document.activeElement).toBe(a);
      });
    });

    describe("index mapping with a hidden leaf item before the target in a column group (GAP-054 fix-loop)", () => {
      it("ArrowDown from a leaf item after a hidden leaf item does not get stuck", () => {
        const model: UMegaMenuItem[] = [
          {
            label: "Products",
            items: [
              [
                {
                  label: "Category A",
                  items: [{ label: "A1" }, { label: "Hidden", visible: false }, { label: "A2" }],
                },
              ],
            ],
          },
        ];
        const { container } = render(<UMegaMenu model={model} />);
        const productsItem = container.querySelector(".u-megamenu-root-list > li:first-child") as HTMLElement;
        fireEvent.click(productsItem.querySelector("a") as HTMLAnchorElement);

        const leafLinks = productsItem.querySelectorAll<HTMLAnchorElement>(".u-megamenu-submenu a");
        // Rendered leaf links are [A1, A2] (Hidden renders no <li>/<a>).
        expect(leafLinks.length).toBe(2);
        leafLinks[0].focus();
        fireEvent.keyDown(leafLinks[0], { code: "ArrowDown" });
        expect(document.activeElement).toBe(leafLinks[1]);
      });
    });
  });
});
