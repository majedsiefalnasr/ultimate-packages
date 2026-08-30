import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UCheckbox } from "./checkbox";

describe("UCheckbox", () => {
  it("renders a native checkbox input reflecting the checked prop", () => {
    render(<UCheckbox checked={true} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("does not manage its own internal checked state — stays checked=false until the prop changes", () => {
    const onChange = vi.fn();
    render(<UCheckbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledOnce();
    // A fully-controlled component must not flip its own visual state without a prop change:
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("onChange receives a custom event shape with checked/value/originalEvent", () => {
    const onChange = vi.fn();
    render(<UCheckbox checked={false} onChange={onChange} name="agree" />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        checked: true,
        target: expect.objectContaining({ name: "agree", checked: true }),
      })
    );
  });

  it("respects trueValue/falseValue for non-boolean checked semantics", () => {
    render(<UCheckbox checked="yes" trueValue="yes" falseValue="no" onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("applies disabled to the native input and prevents onChange", () => {
    const onChange = vi.fn();
    render(<UCheckbox checked={false} onChange={onChange} disabled />);
    const input = screen.getByRole("checkbox");
    expect(input).toBeDisabled();
    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("sets aria-invalid from the invalid prop", () => {
    render(<UCheckbox checked={false} onChange={() => {}} invalid />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards inputRef to the native <input> element", () => {
    const inputRef = React.createRef<HTMLInputElement>();
    render(<UCheckbox checked={false} onChange={() => {}} inputRef={inputRef} />);
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(inputRef.current?.type).toBe("checkbox");
  });
});
