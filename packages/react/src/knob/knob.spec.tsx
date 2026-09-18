import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UKnob } from "./knob";

describe("UKnob", () => {
  it("renders an SVG with role=slider reflecting the current value", () => {
    render(<UKnob value={30} onChange={() => {}} />);
    const svg = screen.getByRole("slider");
    expect(svg).toHaveAttribute("aria-valuenow", "30");
  });

  it("clicking the SVG at a given offset updates the value", () => {
    const onChange = vi.fn();
    render(<UKnob value={0} onChange={onChange} />);
    const svg = screen.getByRole("slider");
    fireEvent.click(svg, { nativeEvent: { offsetX: 50, offsetY: 5 } } as unknown as MouseEvent);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBeGreaterThan(0);
  });

  it("ArrowUp increments the value by step", () => {
    const onChange = vi.fn();
    render(<UKnob value={50} onChange={onChange} step={5} />);
    fireEvent.keyDown(screen.getByRole("slider"), { code: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith(55);
  });

  it("ArrowDown decrements the value by step", () => {
    const onChange = vi.fn();
    render(<UKnob value={50} onChange={onChange} step={5} />);
    fireEvent.keyDown(screen.getByRole("slider"), { code: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith(45);
  });

  it("Home/End jump to min/max", () => {
    const onChange = vi.fn();
    render(<UKnob value={50} onChange={onChange} min={0} max={100} />);
    fireEvent.keyDown(screen.getByRole("slider"), { code: "End" });
    expect(onChange).toHaveBeenLastCalledWith(100);
    fireEvent.keyDown(screen.getByRole("slider"), { code: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("readOnly prevents value changes", () => {
    const onChange = vi.fn();
    render(<UKnob value={50} onChange={onChange} readOnly />);
    fireEvent.keyDown(screen.getByRole("slider"), { code: "ArrowUp" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabled prevents value changes and sets tabIndex -1", () => {
    const onChange = vi.fn();
    render(<UKnob value={50} onChange={onChange} disabled />);
    const svg = screen.getByRole("slider");
    fireEvent.keyDown(svg, { code: "ArrowUp" });
    expect(onChange).not.toHaveBeenCalled();
    expect(svg).toHaveAttribute("tabindex", "-1");
  });
});
