import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UInputMask } from "./input-mask";

describe("UInputMask", () => {
  it("formats input according to the mask pattern", () => {
    render(<UInputMask value="" mask="999-999" onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "123456" } });
    expect(input.value).toBe("123-456");
  });

  it("shows the slot char placeholder for a partially-completed value when autoClear is disabled", () => {
    render(<UInputMask value="12" mask="999-999" autoClear={false} onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("12_-___");
  });

  it("clears a partially-completed value by default (autoClear=true), matching real Prime InputMask", () => {
    render(<UInputMask value="12" mask="999-999" onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("emits onChange with the formatted value by default (unmask=false)", () => {
    const onChange = vi.fn();
    render(<UInputMask value="" mask="999-999" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.input(input, { target: { value: "123456" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: "123-456" })
    );
  });

  it("emits onChange with the raw unmasked value when unmask is true", () => {
    const onChange = vi.fn();
    render(<UInputMask value="" mask="999-999" unmask onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.input(input, { target: { value: "123456" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: "123456" })
    );
  });

  it("applies disabled and readOnly to the native input", () => {
    render(<UInputMask value="" mask="999" onChange={() => {}} disabled readOnly />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("readonly");
  });

  it("handles backspace within the mask, shifting trailing digits left across the separator", () => {
    // Matches real Prime InputMask's shiftL behavior: a backspace just after
    // a static separator removes the preceding digit and shifts every
    // digit after it one position left (across the separator), the same
    // buffer-shift algorithm real source's own shiftL implements.
    render(<UInputMask value="123-456" mask="999-999" onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    input.setSelectionRange(3, 3);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(input.value).toBe("124-56_");
  });

  it("sets aria-invalid from the invalid prop", () => {
    render(<UInputMask value="" mask="999" onChange={() => {}} invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards a ref to the native input element", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<UInputMask value="" mask="999" onChange={() => {}} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
