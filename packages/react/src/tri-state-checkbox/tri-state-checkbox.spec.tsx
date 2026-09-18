import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UTriStateCheckbox } from "./tri-state-checkbox";

describe("UTriStateCheckbox", () => {
  it("renders a role=checkbox element reflecting a null (mixed) state", () => {
    render(<UTriStateCheckbox value={null} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  it("cycles null -> true on click", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: true }));
  });

  it("cycles true -> false on click", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: false }));
  });

  it("cycles false -> null on click", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: null }));
  });

  it("cycles on Space/Enter keydown", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={null} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: " ", code: "Space" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: true }));
  });

  it("does not cycle when disabled", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={null} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reflects aria-checked=true/false for true/false values", () => {
    const { rerender } = render(<UTriStateCheckbox value={true} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");

    rerender(<UTriStateCheckbox value={false} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
  });
});
