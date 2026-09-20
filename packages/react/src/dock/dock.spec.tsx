import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { UDock } from "./dock";
import type { UMenuItem } from "../menu";

describe("UDock", () => {
  const items: UMenuItem[] = [
    { label: "Finder", icon: "pi pi-search" },
    { label: "Mail", icon: "pi pi-envelope" },
    { label: "Trash", icon: "pi pi-trash" },
  ];

  it("renders one menuitem per model entry", () => {
    const { container } = render(<UDock model={items} />);
    expect(container.querySelectorAll('[role="menuitem"]').length).toBe(3);
  });

  it("marks the hovered item active via data-u-active on mouseenter", () => {
    const { container } = render(<UDock model={items} />);
    const links = container.querySelectorAll('[role="menuitem"]');
    expect(links[1].getAttribute("data-u-active")).toBe("false");
    fireEvent.mouseEnter(links[1]);
    expect(links[1].getAttribute("data-u-active")).toBe("true");
  });

  it("clears the active item on mouseleave", () => {
    const { container } = render(<UDock model={items} />);
    const links = container.querySelectorAll('[role="menuitem"]');
    fireEvent.mouseEnter(links[0]);
    fireEvent.mouseLeave(links[0]);
    expect(links[0].getAttribute("data-u-active")).toBe("false");
  });

  it("applies the position class (default bottom)", () => {
    const { container } = render(<UDock model={items} />);
    expect(container.querySelector(".u-dock-bottom")).not.toBeNull();
  });

  it("applies a non-default position class", () => {
    const { container } = render(<UDock model={items} position="left" />);
    expect(container.querySelector(".u-dock-left")).not.toBeNull();
  });

  it("calls onItemSelect and item.command on click", () => {
    const command = vi.fn();
    const onItemSelect = vi.fn();
    const model: UMenuItem[] = [{ label: "Trash", command }];
    const { container } = render(<UDock model={model} onItemSelect={onItemSelect} />);
    fireEvent.click(container.querySelector("a") as HTMLAnchorElement);
    expect(onItemSelect).toHaveBeenCalled();
    expect(command).toHaveBeenCalled();
  });

  it("skips items with visible: false", () => {
    const model: UMenuItem[] = [{ label: "One" }, { label: "Hidden", visible: false }];
    const { container } = render(<UDock model={model} />);
    expect(container.querySelectorAll('[role="menuitem"]').length).toBe(1);
  });
});
