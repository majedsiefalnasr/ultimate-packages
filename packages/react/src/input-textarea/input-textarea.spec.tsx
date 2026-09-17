import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UInputTextarea } from "./input-textarea";

describe("UInputTextarea", () => {
  it("renders a native textarea reflecting the value prop", () => {
    render(<UInputTextarea value="hello" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("hello");
  });

  it("is fully controlled — does not change its own value without a prop update", () => {
    const onChange = vi.fn();
    render(<UInputTextarea value="a" onChange={onChange} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "ab" } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(textarea).toHaveValue("a");
  });

  it("applies disabled to the native textarea", () => {
    render(<UInputTextarea value="" onChange={() => {}} disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("sets aria-invalid from the invalid prop", () => {
    render(<UInputTextarea value="" onChange={() => {}} invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("applies the resizable style class when autoResize is enabled", () => {
    render(<UInputTextarea value="" onChange={() => {}} autoResize />);
    expect(screen.getByRole("textbox").className).toContain("u-inputtextarea-resizable");
  });

  it("does not apply the resizable style class by default", () => {
    render(<UInputTextarea value="" onChange={() => {}} />);
    expect(screen.getByRole("textbox").className).not.toContain("u-inputtextarea-resizable");
  });

  it("fires onInput when autoResize is enabled and text is typed", () => {
    const onInput = vi.fn();
    render(<UInputTextarea value="a" onChange={() => {}} onInput={onInput} autoResize />);
    fireEvent.input(screen.getByRole("textbox"), { target: { value: "ab" } });
    expect(onInput).toHaveBeenCalledOnce();
  });

  it("forwards a ref to the native textarea element", () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<UInputTextarea value="" onChange={() => {}} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
