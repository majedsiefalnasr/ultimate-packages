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
});
