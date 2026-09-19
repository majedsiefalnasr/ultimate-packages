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
});
