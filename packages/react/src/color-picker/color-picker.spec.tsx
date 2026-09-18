import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UColorPicker } from "./color-picker";

describe("UColorPicker", () => {
  it("renders a readonly preview input", () => {
    const { container } = render(<UColorPicker value={null} onChange={() => {}} />);
    const input = container.querySelector(".u-color-picker-preview") as HTMLInputElement;
    expect(input.readOnly).toBe(true);
  });

  it("clicking the preview opens the overlay panel", () => {
    const { container } = render(<UColorPicker value={null} onChange={() => {}} />);
    expect(container.querySelector(".u-color-picker-panel")).toBeNull();
    fireEvent.click(container.querySelector(".u-color-picker-preview") as HTMLElement);
    expect(container.querySelector(".u-color-picker-panel")).not.toBeNull();
  });

  it("Escape closes the overlay panel", () => {
    const onHide = vi.fn();
    const { container } = render(<UColorPicker value={null} onChange={() => {}} onHide={onHide} />);
    const input = container.querySelector(".u-color-picker-preview") as HTMLElement;
    fireEvent.click(input);
    expect(container.querySelector(".u-color-picker-panel")).not.toBeNull();
    fireEvent.keyDown(input, { code: "Escape" });
    expect(container.querySelector(".u-color-picker-panel")).toBeNull();
    expect(onHide).toHaveBeenCalled();
  });

  it("dragging in the color selector emits a hex value", () => {
    const onChange = vi.fn();
    const { container } = render(<UColorPicker value={null} onChange={onChange} />);
    fireEvent.click(container.querySelector(".u-color-picker-preview") as HTMLElement);

    const selector = container.querySelector(".u-color-picker-color-selector") as HTMLElement;
    selector.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 150, height: 150, right: 150, bottom: 150 }) as DOMRect;
    fireEvent.mouseDown(selector, { clientX: 75, clientY: 75 });

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].value).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("dragging the hue strip updates the value", () => {
    const onChange = vi.fn();
    const { container } = render(<UColorPicker value="#ff0000" onChange={onChange} />);
    fireEvent.click(container.querySelector(".u-color-picker-preview") as HTMLElement);

    const hue = container.querySelector(".u-color-picker-hue") as HTMLElement;
    hue.getBoundingClientRect = () => ({ left: 0, top: 0, width: 20, height: 150, right: 20, bottom: 150 }) as DOMRect;
    // clientY 75 (mid-strip) maps to hue 180 (cyan) — clearly distinct from
    // the starting red (#ff0000, hue 0/360).
    fireEvent.mouseDown(hue, { clientX: 10, clientY: 75 });

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].value).not.toBe("#ff0000");
  });

  it("respects the rgb format", () => {
    const onChange = vi.fn();
    const { container } = render(<UColorPicker value={null} onChange={onChange} format="rgb" />);
    fireEvent.click(container.querySelector(".u-color-picker-preview") as HTMLElement);

    const selector = container.querySelector(".u-color-picker-color-selector") as HTMLElement;
    selector.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 150, height: 150, right: 150, bottom: 150 }) as DOMRect;
    fireEvent.mouseDown(selector, { clientX: 75, clientY: 75 });

    expect(onChange.mock.calls[0][0].value).toEqual(
      expect.objectContaining({ r: expect.any(Number), g: expect.any(Number), b: expect.any(Number) })
    );
  });

  it("disabled state prevents opening the overlay", () => {
    const { container } = render(<UColorPicker value={null} onChange={() => {}} disabled />);
    fireEvent.click(container.querySelector(".u-color-picker-preview") as HTMLElement);
    expect(container.querySelector(".u-color-picker-panel")).toBeNull();
  });
});
