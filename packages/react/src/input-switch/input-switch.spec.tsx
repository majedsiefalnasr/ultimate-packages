import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UInputSwitch, type UInputSwitchHandle } from "./input-switch";

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
      expect.objectContaining({
        value: true,
        target: expect.objectContaining({ name: "agree", value: true }),
      })
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

  it("omits aria-invalid when not invalid", () => {
    render(<UInputSwitch checked={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).not.toHaveAttribute("aria-invalid");
  });

  it("adds the invalid class to the root", () => {
    const { container } = render(<UInputSwitch checked={false} onChange={() => {}} invalid />);
    expect(container.firstElementChild).toHaveClass("p-invalid");
  });

  it("renders the slider with a handle and the checked modifier", () => {
    const { container } = render(<UInputSwitch checked onChange={() => {}} />);
    expect(container.firstElementChild).toHaveClass("u-toggle-switch", "u-toggle-switch-checked");
    expect(
      container.querySelector(".u-toggle-switch-slider > .u-toggle-switch-handle")
    ).not.toBeNull();
  });

  it("does not add a root checkbox role", () => {
    const { container } = render(<UInputSwitch checked onChange={() => {}} />);
    expect(container.firstElementChild).not.toHaveAttribute("role");
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("puts aria-* props and tabIndex on the input and other props on the root", () => {
    const { container } = render(
      <UInputSwitch
        checked={false}
        onChange={() => {}}
        aria-label="Notifications"
        aria-labelledby="label-1"
        tabIndex={4}
        data-testid="root"
        inputId="sw-1"
      />
    );
    const input = screen.getByRole("switch");
    expect(input).toHaveAttribute("aria-label", "Notifications");
    expect(input).toHaveAttribute("aria-labelledby", "label-1");
    expect(input).toHaveAttribute("tabindex", "4");
    expect(input).toHaveAttribute("id", "sw-1");
    expect(container.firstElementChild).toHaveAttribute("data-testid", "root");
    expect(container.firstElementChild).not.toHaveAttribute("aria-label");
  });

  it("calls onFocus and onBlur with the input's events", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<UInputSwitch checked={false} onChange={() => {}} onFocus={onFocus} onBlur={onBlur} />);
    const input = screen.getByRole("switch");
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("gives the change event stopPropagation and preventDefault", () => {
    const onChange = vi.fn();
    render(<UInputSwitch checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    const event = onChange.mock.calls[0][0];
    expect(typeof event.stopPropagation).toBe("function");
    expect(typeof event.preventDefault).toBe("function");
  });

  it("exposes focus(), getElement() and getInput() through the ref", () => {
    const ref = React.createRef<UInputSwitchHandle>();
    const { container } = render(<UInputSwitch ref={ref} checked={false} onChange={() => {}} />);
    expect(ref.current?.getElement()).toBe(container.firstElementChild);
    expect(ref.current?.getInput()).toBe(screen.getByRole("switch"));
    ref.current?.focus();
    expect(document.activeElement).toBe(screen.getByRole("switch"));
  });

  it("applies pt sections", () => {
    const { container } = render(
      <UInputSwitch
        checked={false}
        onChange={() => {}}
        pt={{
          root: { "data-pt": "root" },
          input: { "data-pt": "input" },
          slider: { "data-pt": "slider" },
          handle: { "data-pt": "handle" },
        }}
      />
    );
    expect(container.firstElementChild).toHaveAttribute("data-pt", "root");
    expect(screen.getByRole("switch")).toHaveAttribute("data-pt", "input");
    expect(container.querySelector(".u-toggle-switch-slider")).toHaveAttribute("data-pt", "slider");
    expect(container.querySelector(".u-toggle-switch-handle")).toHaveAttribute("data-pt", "handle");
  });

  it("renders no Ultimate classes when unstyled", () => {
    const { container } = render(<UInputSwitch checked onChange={() => {}} unstyled />);
    expect(container.firstElementChild?.className ?? "").not.toContain("u-toggle-switch");
    expect(container.querySelector(".u-toggle-switch-slider")).toBeNull();
  });
});
