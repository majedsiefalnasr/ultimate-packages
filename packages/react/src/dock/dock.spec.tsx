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

  describe("keyboard navigation (Spec §5.4, GAP-055)", () => {
    it("ArrowRight/ArrowLeft move focus among dock items", () => {
      const model: UMenuItem[] = [{ label: "Finder" }, { label: "Mail" }];
      const { container } = render(<UDock model={model} />);
      const links = container.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[1]);
    });

    it("wraps ArrowLeft from the first item to the last item", () => {
      const model: UMenuItem[] = [{ label: "Finder" }, { label: "Mail" }, { label: "Trash" }];
      const { container } = render(<UDock model={model} />);
      const links = container.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowLeft" });
      expect(document.activeElement).toBe(links[2]);
    });

    it("Home/End jump to the first/last item", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B" }, { label: "C" }];
      const { container } = render(<UDock model={model} />);
      const links = container.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
      links[1].focus();
      fireEvent.keyDown(links[1], { code: "End" });
      expect(document.activeElement).toBe(links[2]);
    });

    it("uses ArrowUp/ArrowDown instead when position is left or right", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B" }];
      const { container } = render(<UDock model={model} position="left" />);
      const links = container.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowDown" });
      expect(document.activeElement).toBe(links[1]);
    });

    it("does not move focus on ArrowRight/ArrowLeft when position is left or right", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B" }];
      const { container } = render(<UDock model={model} position="left" />);
      const links = container.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[0]);
    });

    it("skips disabled items when moving focus", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }];
      const { container } = render(<UDock model={model} />);
      const links = container.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[2]);
    });

    it("maps focus correctly when a hidden item precedes the target item", () => {
      const model: UMenuItem[] = [
        { label: "A" },
        { label: "Hidden", visible: false },
        { label: "B" },
        { label: "C" },
      ];
      const { container } = render(<UDock model={model} />);
      const links = container.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
      // Rendered links are [A, B, C] (Hidden is skipped). Focusing A and
      // pressing ArrowRight must move to the rendered B (links[1]), not
      // mis-map into C by indexing against the full 4-item model.
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[1]);
    });
  });
});
