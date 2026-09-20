import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UInputText } from "./input-text";

describe("UInputText", () => {
  it("renders a native text input reflecting the value prop", () => {
    render(<UInputText value="hello" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("hello");
  });

  it("is fully controlled — does not change its own value without a prop update", () => {
    const onChange = vi.fn();
    render(<UInputText value="a" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "ab" } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(input).toHaveValue("a");
  });

  it("applies disabled to the native input", () => {
    render(<UInputText value="" onChange={() => {}} disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("sets aria-invalid from the invalid prop", () => {
    render(<UInputText value="" onChange={() => {}} invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards a ref to the native input element", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<UInputText value="" onChange={() => {}} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("forwards inputRef to the native input element", () => {
    const inputRef = React.createRef<HTMLInputElement>();
    render(<UInputText value="" onChange={() => {}} inputRef={inputRef} />);
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
  });
});
