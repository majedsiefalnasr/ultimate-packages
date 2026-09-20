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
});
