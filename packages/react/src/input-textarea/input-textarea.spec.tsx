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
    expect(screen.getByRole("textbox").className).toContain("u-textarea-resizable");
  });

  it("does not apply the resizable style class by default", () => {
    render(<UInputTextarea value="" onChange={() => {}} />);
    expect(screen.getByRole("textbox").className).not.toContain("u-textarea-resizable");
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

  it("forwards inputRef to the native textarea element", () => {
    const inputRef = React.createRef<HTMLTextAreaElement>();
    render(<UInputTextarea value="" onChange={() => {}} inputRef={inputRef} />);
    expect(inputRef.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("renders the shared u-textarea root class", () => {
    render(<UInputTextarea value="" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveClass("u-textarea");
    expect(screen.getByRole("textbox").className).not.toContain("u-inputtextarea");
  });

  it("size small/large emit the shared sm/lg classes", () => {
    const { rerender } = render(<UInputTextarea value="" onChange={() => {}} size="small" />);
    expect(screen.getByRole("textbox")).toHaveClass("u-textarea-sm");
    rerender(<UInputTextarea value="" onChange={() => {}} size="large" />);
    expect(screen.getByRole("textbox")).toHaveClass("u-textarea-lg");
  });

  it("p-filled follows the controlled value, not the variant", () => {
    const { rerender } = render(<UInputTextarea value="" onChange={() => {}} variant="filled" />);
    expect(screen.getByRole("textbox")).not.toHaveClass("p-filled");
    expect(screen.getByRole("textbox")).toHaveClass("p-variant-filled");
    rerender(<UInputTextarea value="abc" onChange={() => {}} variant="filled" />);
    expect(screen.getByRole("textbox")).toHaveClass("p-filled");
  });

  it("tracks p-filled for an uncontrolled textarea from defaultValue and typing", () => {
    render(<UInputTextarea defaultValue="x" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("p-filled");
    fireEvent.input(textarea, { target: { value: "" } });
    expect(textarea).not.toHaveClass("p-filled");
    fireEvent.input(textarea, { target: { value: "typed" } });
    expect(textarea).toHaveClass("p-filled");
  });

  it("pt root attributes reach the textarea and ptOptions is accepted", () => {
    render(
      <UInputTextarea
        value=""
        onChange={() => {}}
        pt={{ root: { "data-test": "x" } }}
        ptOptions={{ mergeSections: true }}
      />
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("data-test", "x");
  });

  it("unstyled drops the Ultimate classes", () => {
    render(<UInputTextarea value="" onChange={() => {}} unstyled />);
    expect(screen.getByRole("textbox")).not.toHaveClass("u-textarea");
  });

  it("passes rest props and consumer handlers through", () => {
    const onFocus = vi.fn();
    const onKeyUp = vi.fn();
    render(
      <UInputTextarea
        value=""
        onChange={() => {}}
        placeholder="note"
        rows={4}
        onFocus={onFocus}
        onKeyUp={onKeyUp}
      />
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder", "note");
    expect(textarea).toHaveAttribute("rows", "4");
    fireEvent.focus(textarea);
    fireEvent.keyUp(textarea, { key: "a" });
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onKeyUp).toHaveBeenCalledOnce();
  });

  it("autoResize grows to scrollHeight without a max-height and caps at max-height", () => {
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ width: 100, height: 40 } as DOMRect);
    const scrollSpy = vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(120);
    const { rerender } = render(<UInputTextarea value="a" onChange={() => {}} autoResize />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.style.height).toBe("120px");
    expect(textarea.style.overflow).toBe("hidden");

    textarea.style.maxHeight = "100px";
    scrollSpy.mockReturnValue(300);
    rerender(<UInputTextarea value="a\nb\nc" onChange={() => {}} autoResize />);
    expect(textarea.style.height).toBe("100px");
    expect(textarea.style.overflowY).toBe("scroll");

    rectSpy.mockRestore();
    scrollSpy.mockRestore();
  });
});
