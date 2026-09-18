import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { USlider } from "./slider";

describe("USlider", () => {
  it("renders a single handle by default with role=slider", () => {
    render(<USlider value={50} onChange={() => {}} />);
    const handles = screen.getAllByRole("slider");
    expect(handles.length).toBe(1);
    expect(handles[0]).toHaveAttribute("aria-valuenow", "50");
  });

  it("range mode renders two handles", () => {
    render(<USlider value={[20, 80]} onChange={() => {}} range />);
    const handles = screen.getAllByRole("slider");
    expect(handles.length).toBe(2);
    expect(handles[0]).toHaveAttribute("aria-valuenow", "20");
    expect(handles[1]).toHaveAttribute("aria-valuenow", "80");
  });

  it("ArrowRight increments the value by step (default 1)", () => {
    const onChange = vi.fn();
    render(<USlider value={50} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 51 }));
  });

  it("ArrowLeft decrements the value", () => {
    const onChange = vi.fn();
    render(<USlider value={50} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 49 }));
  });

  it("Home/End jump to min/max", () => {
    const onChange = vi.fn();
    render(<USlider value={50} onChange={onChange} min={0} max={100} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 100 }));
    fireEvent.keyDown(screen.getByRole("slider"), { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 0 }));
  });

  it("clicking the track sets the value from click position", () => {
    const onChange = vi.fn();
    const { container } = render(<USlider value={0} onChange={onChange} />);
    const root = container.querySelector(".u-slider") as HTMLElement;
    root.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 20, right: 100, bottom: 20 }) as DOMRect;
    fireEvent.click(root, { clientX: 25, clientY: 10 });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 25 }));
  });

  it("disabled state prevents keyboard interaction", () => {
    const onChange = vi.fn();
    render(<USlider value={50} onChange={onChange} disabled />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is fully controlled — reflects the value prop", () => {
    const { rerender } = render(<USlider value={30} onChange={() => {}} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "30");
    rerender(<USlider value={70} onChange={() => {}} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "70");
  });
});
