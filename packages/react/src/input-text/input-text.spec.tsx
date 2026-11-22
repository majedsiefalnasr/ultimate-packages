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

  it("size small/large emit the shared sm/lg classes", () => {
    const { rerender } = render(<UInputText value="" onChange={() => {}} size="small" />);
    expect(screen.getByRole("textbox")).toHaveClass("u-inputtext-sm");
    rerender(<UInputText value="" onChange={() => {}} size="large" />);
    expect(screen.getByRole("textbox")).toHaveClass("u-inputtext-lg");
  });

  it("p-filled follows the controlled value, not the variant", () => {
    const { rerender } = render(<UInputText value="" onChange={() => {}} variant="filled" />);
    expect(screen.getByRole("textbox")).not.toHaveClass("p-filled");
    expect(screen.getByRole("textbox")).toHaveClass("p-variant-filled");
    rerender(<UInputText value="abc" onChange={() => {}} variant="filled" />);
    expect(screen.getByRole("textbox")).toHaveClass("p-filled");
  });

  it("tracks p-filled for an uncontrolled input from defaultValue and typing", () => {
    render(<UInputText defaultValue="x" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("p-filled");
    fireEvent.change(input, { target: { value: "" } });
    expect(input).not.toHaveClass("p-filled");
    fireEvent.change(input, { target: { value: "y" } });
    expect(input).toHaveClass("p-filled");
  });

  it("pt.root attributes and classes reach the input", () => {
    render(
      <UInputText
        value=""
        onChange={() => {}}
        pt={{ root: { "data-test": "x", className: "custom" } }}
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("data-test", "x");
    expect(input).toHaveClass("custom");
    expect(input).toHaveClass("u-inputtext");
  });

  it("unstyled drops the Ultimate classes", () => {
    render(<UInputText value="" onChange={() => {}} unstyled />);
    expect(screen.getByRole("textbox")).not.toHaveClass("u-inputtext");
  });
});
