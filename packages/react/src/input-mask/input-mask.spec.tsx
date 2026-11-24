import * as React from "react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "123-456" }));
  });

  it("emits onChange with the raw unmasked value when unmask is true", () => {
    const onChange = vi.fn();
    render(<UInputMask value="" mask="999-999" unmask onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.input(input, { target: { value: "123456" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "123456" }));
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

function Harness(props: Partial<React.ComponentProps<typeof UInputMask>>) {
  const [value, setValue] = React.useState(props.value ?? "");
  return (
    <UInputMask
      mask="99-99"
      {...props}
      value={value}
      onChange={(event) => {
        setValue(event.value);
        props.onChange?.(event);
      }}
    />
  );
}

describe("UInputMask editing behavior", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("restores the value captured on focus when Escape is pressed", () => {
    render(<UInputMask value="12-34" mask="99-99" onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    input.value = "99";
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("12-34");
  });

  it("finalizes an incomplete value when Enter is pressed", () => {
    const onChange = vi.fn();
    render(<UInputMask value="" mask="99-99" onChange={onChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    input.value = "12";
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: "" }));
  });

  it("deletes the character at the caret on Delete", () => {
    render(<UInputMask value="1234" mask="9999" onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    input.setSelectionRange(1, 1);
    fireEvent.keyDown(input, { key: "Delete" });
    expect(input.value).toBe("134_");
  });

  it("reformats pasted text after the browser applied it", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<UInputMask value="" mask="99-99" onChange={() => {}} onComplete={onComplete} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    input.value = "1234";
    fireEvent.paste(input);
    expect(input.value).toBe("1234");
    act(() => {
      vi.advanceTimersByTime(5);
    });
    expect(input.value).toBe("12-34");
    expect(onComplete).toHaveBeenCalled();
  });

  it("holds back reformatting during composition and applies it when it ends", () => {
    vi.useFakeTimers();
    render(<Harness />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    fireEvent.compositionStart(input);
    input.value = "1x2";
    fireEvent.input(input);
    expect(input.value).toBe("1x2");
    fireEvent.compositionEnd(input);
    act(() => {
      vi.advanceTimersByTime(5);
    });
    expect(input.value).toBe("12-__");
  });

  it("keeps an incomplete value on blur when keepBuffer is set", () => {
    render(<UInputMask value="" mask="9999" keepBuffer onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.value = "12";
    fireEvent.blur(input);
    expect(input.value).toBe("12");
  });

  it("uses characterPattern for alpha slots", () => {
    render(<UInputMask value="" mask="aa" characterPattern="[A-C]" onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "xAD" } });
    expect(input.value).toBe("A_");
  });

  it("re-applies a changed mask to the current value", () => {
    const { rerender } = render(<UInputMask value="1234" mask="9999" onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("1234");
    rerender(<UInputMask value="1234" mask="99-99" onChange={() => {}} />);
    expect(input.value).toBe("12-34");
  });

  it("passes focus, blur and keydown to the caller's handlers", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <UInputMask
        value=""
        mask="9999"
        onChange={() => {}}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    );
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "a" });
    fireEvent.blur(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

describe("UInputMask presentation", () => {
  it("forwards native attributes to the input", () => {
    render(
      <UInputMask
        value=""
        mask="9999"
        onChange={() => {}}
        aria-label="Phone"
        required
        id="phone"
        name="phone"
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-label", "Phone");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("id", "phone");
    expect(input).toHaveAttribute("name", "phone");
  });

  it("applies the InputText classes for size, variant, fluid, filled and invalid", () => {
    render(
      <UInputMask
        value="1234"
        mask="9999"
        onChange={() => {}}
        size="small"
        variant="filled"
        fluid
        invalid
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass(
      "u-inputmask",
      "u-inputtext",
      "u-inputtext-sm",
      "p-variant-filled",
      "u-inputtext-fluid",
      "p-filled",
      "p-invalid"
    );
  });

  it("applies pass-through to the root", () => {
    render(
      <UInputMask value="" mask="9999" onChange={() => {}} pt={{ root: { "data-pt": "root" } }} />
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("data-pt", "root");
  });

  it("drops the Ultimate classes when unstyled", () => {
    render(<UInputMask value="" mask="9999" onChange={() => {}} unstyled />);
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveClass("u-inputmask");
    expect(input).not.toHaveClass("u-inputtext");
  });

  it("registers the InputText styles without an UInputText", () => {
    render(<UInputMask value="" mask="9999" onChange={() => {}} />);
    const rules = Array.from(document.head.querySelectorAll("style"))
      .map((node) => node.textContent ?? "")
      .join("\n");
    expect(rules).toContain(".u-inputtext");
  });
});
