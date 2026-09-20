import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UBreadcrumb } from "./breadcrumb";
import type { UMenuItem } from "../menu";

describe("UBreadcrumb", () => {
  const home: UMenuItem = { icon: "home-icon", url: "/" };
  const items: UMenuItem[] = [
    { label: "Category", url: "/category" },
    { label: "Details", url: "/category/details" },
  ];

  it("renders a nav > ol trail of links", () => {
    const { container } = render(<UBreadcrumb model={items} home={home} />);
    expect(container.querySelector("nav")).not.toBeNull();
    expect(container.querySelector("nav > ol")).not.toBeNull();
  });

  it("renders the home item plus every model item as a link", () => {
    const { container } = render(<UBreadcrumb model={items} home={home} />);
    expect(container.querySelectorAll("a").length).toBe(3);
  });

  it("renders a separator between each rendered item", () => {
    const { container } = render(<UBreadcrumb model={items} home={home} />);
    expect(container.querySelectorAll('[role="separator"]').length).toBe(2);
  });

  it("renders without a home item when none is provided", () => {
    const { container } = render(<UBreadcrumb model={items} />);
    expect(container.querySelectorAll("a").length).toBe(2);
  });

  it('sets aria-current="page" on the item whose url matches the current location', () => {
    const { container } = render(<UBreadcrumb model={[{ label: "Home", url: "/" }]} />);
    const link = container.querySelector("a");
    expect(link?.getAttribute("aria-current")).toBe("page");
  });

  it("does not set aria-current on non-matching items", () => {
    const { container } = render(<UBreadcrumb model={items} home={home} />);
    const links = Array.from(container.querySelectorAll("a"));
    for (const link of links) {
      if (link.getAttribute("href") !== "/") {
        expect(link.getAttribute("aria-current")).toBeNull();
      }
    }
  });

  it("invokes onItemClick and item.command when a link is clicked", () => {
    const onItemClick = vi.fn();
    const command = vi.fn();
    const model: UMenuItem[] = [{ label: "Details", command }];
    render(<UBreadcrumb model={model} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText("Details"));
    expect(command).toHaveBeenCalled();
    expect(onItemClick).toHaveBeenCalled();
  });

  it("prevents navigation and skips command for a disabled item", () => {
    const command = vi.fn();
    const model: UMenuItem[] = [{ label: "Disabled", disabled: true, command }];
    const { container } = render(<UBreadcrumb model={model} />);
    const link = container.querySelector("a") as HTMLAnchorElement;
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.tabIndex).toBe(-1);
    fireEvent.click(link);
    expect(command).not.toHaveBeenCalled();
  });

  it("skips a hidden item entirely", () => {
    const model: UMenuItem[] = [{ label: "Hidden", visible: false }, { label: "Visible" }];
    const { container } = render(<UBreadcrumb model={model} />);
    expect(container.querySelectorAll("a").length).toBe(1);
  });
});
