import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UInputNumber } from "./input-number";

describe("UInputNumber", () => {
  it("renders a spinbutton reflecting the numeric value prop", () => {
    render(<UInputNumber value={42} onValueChange={() => {}} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("42");
  });

  it("formats the value with grouping separators when not focused", () => {
    render(<UInputNumber value={1234} onValueChange={() => {}} locale="en-US" />);
    expect(screen.getByRole("spinbutton")).toHaveValue("1,234");
  });

  it("shows the raw numeric value while focused", () => {
    render(<UInputNumber value={1234} onValueChange={() => {}} locale="en-US" />);
    const input = screen.getByRole("spinbutton");
    fireEvent.focus(input);
    expect(input).toHaveValue("1234");
  });

  it("emits onValueChange with a coerced number on blur", () => {
    const onValueChange = vi.fn();
    render(<UInputNumber value={null} onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "123" } });
    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: 123 }));
  });

  it("clamps to min on blur", () => {
    const onValueChange = vi.fn();
    render(<UInputNumber value={null} onValueChange={onValueChange} min={10} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: 10 }));
  });

  it("clamps to max on blur", () => {
    const onValueChange = vi.fn();
    render(<UInputNumber value={null} onValueChange={onValueChange} max={10} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "99" } });
    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: 10 }));
  });

  it("increments by step on ArrowUp", () => {
    const onValueChange = vi.fn();
    render(<UInputNumber value={5} onValueChange={onValueChange} step={2} />);
    fireEvent.keyDown(screen.getByRole("spinbutton"), { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: 7 }));
  });

  it("decrements by step on ArrowDown", () => {
    const onValueChange = vi.fn();
    render(<UInputNumber value={5} onValueChange={onValueChange} step={2} />);
    fireEvent.keyDown(screen.getByRole("spinbutton"), { key: "ArrowDown" });
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: 3 }));
  });

  it("renders spinner buttons only when showButtons is true", () => {
    const { rerender } = render(<UInputNumber value={0} onValueChange={() => {}} />);
    expect(screen.queryByLabelText("Increment")).toBeNull();
    rerender(<UInputNumber value={0} onValueChange={() => {}} showButtons />);
    expect(screen.getByLabelText("Increment")).toBeInTheDocument();
  });

  it("increments on clicking the increment button", () => {
    const onValueChange = vi.fn();
    render(<UInputNumber value={5} onValueChange={onValueChange} showButtons />);
    fireEvent.click(screen.getByLabelText("Increment"));
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: 6 }));
  });

  it("emits null when cleared and allowEmpty is true", () => {
    const onValueChange = vi.fn();
    render(<UInputNumber value={5} onValueChange={onValueChange} allowEmpty />);
    const input = screen.getByRole("spinbutton");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: null }));
  });

  it("applies disabled to the native input", () => {
    render(<UInputNumber value={0} onValueChange={() => {}} disabled />);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });

  it("sets aria-invalid from the invalid prop", () => {
    render(<UInputNumber value={0} onValueChange={() => {}} invalid />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-invalid", "true");
  });
});
