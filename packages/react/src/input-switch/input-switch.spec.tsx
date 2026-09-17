import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UInputSwitch } from "./input-switch";

describe("UInputSwitch", () => {
  it("renders a native switch input reflecting the checked prop", () => {
    render(<UInputSwitch checked={true} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("does not manage its own internal checked state — stays checked=false until the prop changes", () => {
    const onChange = vi.fn();
    render(<UInputSwitch checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("onChange receives a custom event shape with trueValue/falseValue", () => {
    const onChange = vi.fn();
    render(<UInputSwitch checked={false} onChange={onChange} name="agree" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: true, target: expect.objectContaining({ name: "agree", value: true }) })
    );
  });

  it("respects trueValue/falseValue for non-boolean checked semantics", () => {
    render(<UInputSwitch checked="yes" trueValue="yes" falseValue="no" onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("applies disabled to the native input and prevents onChange", () => {
    const onChange = vi.fn();
    render(<UInputSwitch checked={false} onChange={onChange} disabled />);
    const input = screen.getByRole("switch");
    expect(input).toBeDisabled();
    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("sets aria-invalid from the invalid prop", () => {
    render(<UInputSwitch checked={false} onChange={() => {}} invalid />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards inputRef to the native <input> element", () => {
    const inputRef = React.createRef<HTMLInputElement>();
    render(<UInputSwitch checked={false} onChange={() => {}} inputRef={inputRef} />);
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(inputRef.current?.type).toBe("checkbox");
  });
});
