import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { USpeedDial, type USpeedDialHandle } from "./speed-dial";
import type { UMenuItem } from "../menu";

describe("USpeedDial", () => {
  const items: UMenuItem[] = [{ label: "Add", icon: "pi pi-plus" }, { label: "Edit", icon: "pi pi-pencil" }, { label: "Delete", icon: "pi pi-trash" }];

  it("renders collapsed by default (aria-expanded false)", () => {
    const { container } = render(<USpeedDial model={items} />);
    expect(container.querySelector("button")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders one menuitem action button per model entry", () => {
    const { container } = render(<USpeedDial model={items} />);
    expect(container.querySelectorAll('[role="menuitem"]').length).toBe(3);
  });

  it("expands on toggle-button click", () => {
    const { container } = render(<USpeedDial model={items} />);
    fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    expect(container.querySelector("button")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("collapses on a second toggle-button click", () => {
    const { container } = render(<USpeedDial model={items} />);
    const toggle = container.querySelector("button") as HTMLButtonElement;
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("show()/hide() imperative handle toggles visibility and calls onShow/onHide", () => {
    const onShow = vi.fn();
    const onHide = vi.fn();
    const ref = React.createRef<USpeedDialHandle>();
    const { container } = render(<USpeedDial ref={ref} model={items} onShow={onShow} onHide={onHide} />);
    act(() => ref.current?.show());
    expect(onShow).toHaveBeenCalled();
    expect(container.querySelector("button")?.getAttribute("aria-expanded")).toBe("true");
    act(() => ref.current?.hide());
    expect(onHide).toHaveBeenCalled();
  });

  it("clicking an action item invokes its command and collapses the dial", () => {
    const command = vi.fn();
    const model: UMenuItem[] = [{ label: "Delete", command }];
    const { container } = render(<USpeedDial model={model} />);
    fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    fireEvent.click(container.querySelector('[role="menuitem"]') as HTMLButtonElement);
    expect(command).toHaveBeenCalled();
    expect(container.querySelector("button")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("hides on Escape when closeOnEscape (default) and visible", () => {
    const { container } = render(<USpeedDial model={items} />);
    fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(container.querySelector("button")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("disabled action items are not clickable (button disabled attribute set)", () => {
    const model: UMenuItem[] = [{ label: "Delete", disabled: true }];
    const { container } = render(<USpeedDial model={model} />);
    fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    expect((container.querySelector('[role="menuitem"]') as HTMLButtonElement).disabled).toBe(true);
  });

  describe("keyboard navigation between action items (Spec §5.5, GAP-056)", () => {
    it("ArrowDown/ArrowUp move focus among action items once open", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B" }];
      const { container } = render(<USpeedDial model={model} />);
      fireEvent.click(container.querySelector("button") as HTMLButtonElement);
      const menuItems = container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
      menuItems[0].focus();
      fireEvent.keyDown(menuItems[0], { code: "ArrowDown" });
      expect(document.activeElement).toBe(menuItems[1]);
      fireEvent.keyDown(menuItems[1], { code: "ArrowUp" });
      expect(document.activeElement).toBe(menuItems[0]);
    });

    it("wraps focus from the last item to the first on ArrowDown", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B" }];
      const { container } = render(<USpeedDial model={model} />);
      fireEvent.click(container.querySelector("button") as HTMLButtonElement);
      const menuItems = container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
      menuItems[1].focus();
      fireEvent.keyDown(menuItems[1], { code: "ArrowDown" });
      expect(document.activeElement).toBe(menuItems[0]);
    });

    it("skips disabled items when moving focus", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }];
      const { container } = render(<USpeedDial model={model} />);
      fireEvent.click(container.querySelector("button") as HTMLButtonElement);
      const menuItems = container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
      menuItems[0].focus();
      fireEvent.keyDown(menuItems[0], { code: "ArrowDown" });
      expect(document.activeElement).toBe(menuItems[2]);
    });

    it("uses ArrowRight/ArrowLeft instead of ArrowDown/ArrowUp when direction is horizontal", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B" }];
      const { container } = render(<USpeedDial model={model} direction="right" />);
      fireEvent.click(container.querySelector("button") as HTMLButtonElement);
      const menuItems = container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
      menuItems[0].focus();
      fireEvent.keyDown(menuItems[0], { code: "ArrowRight" });
      expect(document.activeElement).toBe(menuItems[1]);
    });

    it("existing Escape-to-close behavior is unaffected", () => {
      const model: UMenuItem[] = [{ label: "A" }];
      const { container } = render(<USpeedDial model={model} />);
      fireEvent.click(container.querySelector("button") as HTMLButtonElement);
      expect(container.querySelector("button")?.getAttribute("aria-expanded")).toBe("true");
      fireEvent.keyDown(document, { key: "Escape" });
      expect(container.querySelector("button")?.getAttribute("aria-expanded")).toBe("false");
    });
  });
});
